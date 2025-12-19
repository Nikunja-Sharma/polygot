# AliveStack - DevOps Tamagotchi 🐾

A polyglot microservices system that visualizes backend health as a virtual pet. Watch your pet's mood change based on real system metrics!

## Overview

AliveStack demonstrates real-world microservices architecture using six different programming languages, each chosen for its specific strengths. The system runs entirely on Docker Compose and showcases patterns like API gateways, health checks, chaos engineering, and load testing.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (3000)                     │
│              Pet visualization & control panel               │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP
┌─────────────────────────────▼───────────────────────────────┐
│                 Node.js API Gateway (3001)                   │
│              "Pet Brain" - Central Orchestrator              │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│Python│  │ Rust │  │  Go  │  │ C++  │  │ Java │
│Metrics│ │Valid.│  │ Load │  │Chaos │  │Rules │
│ 8000 │  │ 8001 │  │ 8002 │  │ 8003 │  │ 8080 │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘
```

## Services

| Service | Language | Port | Purpose | Why This Language? |
|---------|----------|------|---------|-------------------|
| Frontend | React/TypeScript | 3000 | Visual dashboard | Modern UI with type safety |
| API Gateway | Node.js | 3001 | Central orchestrator | Async I/O, rapid development |
| Metrics Analyzer | Python | 8000 | System metrics | psutil library, data processing |
| Health Validator | Rust | 8001 | Service validation | Performance, memory safety |
| Load Simulator | Go | 8002 | Load generation | Goroutines for concurrency |
| Chaos Engine | C++ | 8003 | System stress | Low-level resource control |
| Rules Engine | Java | 8080 | Mood logic | Enterprise patterns, Spring |

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM available
- Ports 3000, 3001, 8000-8003, 8080 available

### Start the System

```bash
# Clone and navigate to the project
cd alive-stack

# Start all services (first run will build images)
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Access the Dashboard
Open http://localhost:3000 in your browser.

## Pet Moods

| Mood | Emoji | Trigger | Severity |
|------|-------|---------|----------|
| HAPPY | 😄 | All systems operational | 0 |
| NEUTRAL | 😐 | Minor issues or slow services | 1 |
| WORRIED | 😰 | Memory usage > 85% | 2 |
| SAD | 😢 | Error rate > 10% | 3 |
| ANGRY | 😠 | CPU usage > 90% | 3 |
| SICK | 🤒 | Any service offline | 4 |

## API Endpoints

### API Gateway (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Complete pet status with all metrics |
| GET | `/api/health` | Gateway health check |
| POST | `/api/chaos/cpu` | Trigger CPU stress test |
| POST | `/api/chaos/memory` | Trigger memory stress test |
| POST | `/api/load/start` | Start load generation |
| POST | `/api/load/stop` | Stop load generation |

### Python Metrics (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/metrics` | Current CPU/memory stats with status |
| GET | `/health` | Service health check |

### Rust Validator (Port 8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/validate` | Validate all service health |
| GET | `/health` | Service health check |

### Go Load Simulator (Port 8002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/load/start` | Start load (body: `{"rps": 100, "target": "url"}`) |
| POST | `/load/stop` | Stop load generation |
| GET | `/load/status` | Current load statistics |
| GET | `/health` | Service health check |

### C++ Chaos Engine (Port 8003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chaos/cpu` | CPU burn (body: `{"duration_seconds": 10}`) |
| POST | `/chaos/memory` | Memory alloc (body: `{"megabytes": 100}`) |
| GET | `/health` | Service health check |

### Java Rules Engine (Port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rules/evaluate` | Evaluate metrics and return mood |
| GET | `/health` | Service health check |


## Features

### Real-time Monitoring
- Live pet mood updates every 3 seconds
- Health bars for CPU, memory, and error rate
- Service status indicators (healthy/slow/offline)

### Chaos Engineering
- **CPU Stress**: Burn CPU cycles (max 30 seconds)
- **Memory Stress**: Allocate memory (max 256MB)
- Watch the pet react to system stress in real-time

### Load Testing
- Generate concurrent HTTP requests (1-1000 RPS)
- Monitor success/failure rates
- Observe system behavior under load

## Project Structure

```
alive-stack/
├── frontend/              # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/    # Pet, HealthBars, ServiceStatus, ControlPanel
│   │   └── App.tsx        # Main application
│   └── Dockerfile
├── api-node/              # Express.js API Gateway
│   ├── src/index.js       # Routes and service aggregation
│   └── Dockerfile
├── metrics-python/        # FastAPI + psutil
│   ├── main.py            # Metrics collection
│   └── Dockerfile
├── validator-rust/        # Axum + Tokio
│   ├── src/main.rs        # Health validation
│   └── Dockerfile
├── load-go/               # Gin + goroutines
│   ├── main.go            # Load generation
│   └── Dockerfile
├── chaos-cpp/             # cpp-httplib
│   ├── main.cpp           # Chaos operations
│   └── Dockerfile
├── rules-java/            # Spring Boot
│   ├── src/main/java/     # Rules evaluation
│   └── Dockerfile
├── docker-compose.yml     # Orchestration
└── README.md
```

## Configuration

### Resource Limits
Each container is limited to:
- **CPU**: 1 core
- **Memory**: 512MB

### Health Checks
All services include Docker health checks:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

### Restart Policy
Services automatically restart on failure (max 3 retries).

## Development

### Run Individual Services

```bash
# Build a specific service
docker-compose build metrics

# View service logs
docker-compose logs -f api

# Restart a service
docker-compose restart rules
```

### Local Development (without Docker)

```bash
# Frontend
cd frontend && npm install && npm run dev

# API Gateway
cd api-node && npm install && npm start

# Python Metrics
cd metrics-python && pip install -r requirements.txt && uvicorn main:app --port 8000

# Go Load Simulator
cd load-go && go run main.go

# Java Rules Engine
cd rules-java && mvn spring-boot:run
```

## Interview Talking Points

### Architecture Decisions

1. **Why Polyglot?**
   - Demonstrates language selection based on strengths
   - Python for data/metrics (psutil ecosystem)
   - Rust for performance-critical validation
   - Go for concurrent load generation (goroutines)
   - C++ for low-level system stress
   - Java for enterprise rule patterns

2. **API Gateway Pattern**
   - Single entry point for frontend
   - Service aggregation and orchestration
   - Timeout handling and graceful degradation

3. **Health Check Strategy**
   - Docker-native health checks
   - Dependency-based startup order
   - Circuit breaker pattern for resilience

### DevOps Concepts Demonstrated

- **Containerization**: Multi-stage Docker builds
- **Orchestration**: Docker Compose with dependencies
- **Observability**: Health endpoints, metrics collection
- **Chaos Engineering**: Controlled failure injection
- **Load Testing**: Concurrent request generation
- **Microservices**: Service isolation, API contracts

### Scalability Considerations

- Stateless services (horizontal scaling ready)
- Resource limits prevent noisy neighbors
- Health checks enable load balancer integration
- Service discovery via Docker DNS

## Troubleshooting

### Services Won't Start
```bash
# Check for port conflicts
lsof -i :3000 -i :3001 -i :8000 -i :8001 -i :8002 -i :8003 -i :8080

# Rebuild all images
docker-compose build --no-cache

# Remove old containers and volumes
docker-compose down -v
```

### Pet Always Sick
- Check if all services are healthy: `docker-compose ps`
- View service logs: `docker-compose logs <service-name>`
- Ensure sufficient system resources

### High Memory Usage
- The Java service may take longer to start (JVM warmup)
- C++ chaos memory allocation is temporary and auto-releases

## License

MIT
