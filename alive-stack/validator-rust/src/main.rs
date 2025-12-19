use axum::{
    extract::State,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::RwLock;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum ServiceStatus {
    Healthy,
    Slow,
    Offline,
}

#[derive(Clone, Serialize)]
struct ServiceHealthInfo {
    status: ServiceStatus,
    latency_ms: u64,
    last_check: String,
}

#[derive(Serialize)]
struct ValidateResponse {
    services: HashMap<String, ServiceHealthInfo>,
    overall: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
}


type HealthCache = Arc<RwLock<HashMap<String, ServiceHealthInfo>>>;

struct AppState {
    cache: HealthCache,
    client: reqwest::Client,
}

// Service endpoints to check (using docker-compose service names)
fn get_service_endpoints() -> Vec<(&'static str, &'static str)> {
    vec![
        ("python", "http://metrics:8000/health"),
        ("go", "http://load:8002/health"),
        ("cpp", "http://chaos:8003/health"),
        ("java", "http://rules:8080/health"),
    ]
}

async fn check_service(client: &reqwest::Client, name: &str, url: &str) -> ServiceHealthInfo {
    let start = Instant::now();
    let now = chrono::Utc::now().to_rfc3339();

    let result = tokio::time::timeout(
        Duration::from_secs(3),
        client.get(url).send()
    ).await;

    let latency_ms = start.elapsed().as_millis() as u64;

    match result {
        Ok(Ok(response)) if response.status().is_success() => {
            let status = if latency_ms < 500 {
                ServiceStatus::Healthy
            } else {
                ServiceStatus::Slow
            };
            ServiceHealthInfo {
                status,
                latency_ms,
                last_check: now,
            }
        }
        Ok(Ok(_)) | Ok(Err(_)) | Err(_) => {
            ServiceHealthInfo {
                status: ServiceStatus::Offline,
                latency_ms,
                last_check: now,
            }
        }
    }
}


async fn validate_handler(
    State(state): State<Arc<AppState>>,
) -> Json<ValidateResponse> {
    let endpoints = get_service_endpoints();
    let mut services = HashMap::new();

    // Check all services concurrently
    let futures: Vec<_> = endpoints
        .iter()
        .map(|(name, url)| {
            let client = state.client.clone();
            let name = name.to_string();
            let url = url.to_string();
            async move {
                let health = check_service(&client, &name, &url).await;
                (name, health)
            }
        })
        .collect();

    let results = futures::future::join_all(futures).await;

    for (name, health) in results {
        services.insert(name, health.clone());
    }

    // Update cache
    {
        let mut cache = state.cache.write().await;
        for (name, health) in &services {
            cache.insert(name.clone(), health.clone());
        }
    }

    // Determine overall status
    let overall = determine_overall_status(&services);

    Json(ValidateResponse { services, overall })
}

fn determine_overall_status(services: &HashMap<String, ServiceHealthInfo>) -> String {
    let mut has_offline = false;
    let mut has_slow = false;

    for health in services.values() {
        match health.status {
            ServiceStatus::Offline => has_offline = true,
            ServiceStatus::Slow => has_slow = true,
            ServiceStatus::Healthy => {}
        }
    }

    if has_offline {
        "unhealthy".to_string()
    } else if has_slow {
        "degraded".to_string()
    } else {
        "healthy".to_string()
    }
}

async fn health_handler() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "validator-rust".to_string(),
    })
}


#[tokio::main]
async fn main() {
    let cache: HealthCache = Arc::new(RwLock::new(HashMap::new()));
    
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .expect("Failed to create HTTP client");

    let state = Arc::new(AppState { cache, client });

    let app = Router::new()
        .route("/validate", get(validate_handler))
        .route("/health", get(health_handler))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8001")
        .await
        .expect("Failed to bind to port 8001");

    println!("Rust Health Validator running on port 8001");

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
