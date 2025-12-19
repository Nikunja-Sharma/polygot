# Requirements Document

## Introduction

AliveStack is a polyglot DevOps Tamagotchi system that visualizes backend health as a virtual pet. The system runs entirely on Docker Compose and demonstrates real-world microservices architecture using multiple programming languages (Node.js, Python, Rust, Go, C++, and Java). Each service has a justified role that showcases the strengths of its respective language. The pet's mood and health reflect the actual state of the backend services, making system monitoring fun and intuitive.

## Glossary

- **AliveStack**: The complete polyglot backend system representing a virtual pet
- **Pet Brain**: The Node.js API Gateway that orchestrates all services and calculates pet mood
- **Pet Mood**: A calculated state (HAPPY, NEUTRAL, SICK, ANGRY, SAD) based on service health metrics
- **Health Metrics**: CPU usage, memory usage, response times, and error rates collected from services
- **Chaos Event**: An intentional system stress event triggered to simulate failures
- **Service Heartbeat**: A periodic health check signal from each microservice
- **Load Simulation**: Artificial traffic generation to stress test the system

## Requirements

### Requirement 1: API Gateway and Pet Brain

**User Story:** As a developer, I want a central API gateway that orchestrates all services and calculates pet mood, so that I can monitor my system health through a single endpoint.

#### Acceptance Criteria

1. WHEN a client requests the pet status endpoint, THE Pet_Brain SHALL respond with the current pet mood, health metrics, and a descriptive message within 500 milliseconds.
2. WHILE the Pet_Brain is running, THE Pet_Brain SHALL collect health metrics from all registered services every 5 seconds.
3. WHEN all services report healthy status, THE Pet_Brain SHALL set the pet mood to HAPPY.
4. WHEN any service reports degraded performance, THE Pet_Brain SHALL set the pet mood to NEUTRAL or SICK based on severity.
5. IF a service fails to respond within 3 seconds, THEN THE Pet_Brain SHALL mark that service as unhealthy and update the pet mood accordingly.

### Requirement 2: Metrics Analysis Service

**User Story:** As a developer, I want a Python service that analyzes system metrics, so that I can understand CPU and memory usage patterns.

#### Acceptance Criteria

1. WHEN the Metrics_Analyzer receives a metrics request, THE Metrics_Analyzer SHALL return current CPU percentage and memory percentage within 200 milliseconds.
2. WHILE the Metrics_Analyzer is running, THE Metrics_Analyzer SHALL maintain a rolling average of the last 10 metric readings.
3. WHEN CPU usage exceeds 80 percent, THE Metrics_Analyzer SHALL flag the metric as HIGH in the response.
4. WHEN memory usage exceeds 85 percent, THE Metrics_Analyzer SHALL flag the metric as CRITICAL in the response.
5. THE Metrics_Analyzer SHALL expose a health endpoint that returns service status.

### Requirement 3: Health Validation Service

**User Story:** As a developer, I want a Rust service that validates service health and data integrity, so that I can ensure system reliability.

#### Acceptance Criteria

1. WHEN the Health_Validator receives a validation request, THE Health_Validator SHALL check all registered service endpoints and return their status within 1 second.
2. WHEN a service response time exceeds 500 milliseconds, THE Health_Validator SHALL mark that service as SLOW.
3. WHEN a service returns invalid data format, THE Health_Validator SHALL mark that service as CORRUPTED.
4. THE Health_Validator SHALL compute a checksum for critical data payloads to verify integrity.
5. WHILE the Health_Validator is running, THE Health_Validator SHALL maintain an in-memory cache of the last known health state for each service.

### Requirement 4: Load Simulation Service

**User Story:** As a developer, I want a Go service that generates artificial load, so that I can stress test my system and observe pet behavior under pressure.

#### Acceptance Criteria

1. WHEN the Load_Simulator receives a load request with a specified requests-per-second rate, THE Load_Simulator SHALL generate concurrent requests using goroutines.
2. WHEN the Load_Simulator is active, THE Load_Simulator SHALL report the actual requests-per-second achieved and success rate.
3. THE Load_Simulator SHALL support load generation rates between 1 and 1000 requests per second.
4. WHEN a stop request is received, THE Load_Simulator SHALL gracefully terminate all active goroutines within 2 seconds.
5. THE Load_Simulator SHALL expose metrics including total requests sent, successful responses, and failed responses.

### Requirement 5: Chaos Engineering Service

**User Story:** As a developer, I want a C++ service that can intentionally stress the system, so that I can observe how the pet reacts to failures and learn chaos engineering concepts.

#### Acceptance Criteria

1. WHEN the Chaos_Engine receives a CPU burn request with a duration parameter, THE Chaos_Engine SHALL consume CPU cycles for the specified duration in seconds.
2. WHEN the Chaos_Engine receives a memory allocation request, THE Chaos_Engine SHALL allocate the specified amount of memory temporarily.
3. THE Chaos_Engine SHALL limit CPU burn duration to a maximum of 30 seconds to prevent system lockup.
4. THE Chaos_Engine SHALL limit memory allocation to a maximum of 256 megabytes to prevent out-of-memory conditions.
5. WHEN a chaos event completes, THE Chaos_Engine SHALL return a summary including duration and resource consumption.

### Requirement 6: Mood Rules Engine

**User Story:** As a developer, I want a Java service that applies rules to determine pet mood, so that the pet behavior is consistent and predictable.

#### Acceptance Criteria

1. WHEN the Rules_Engine receives health metrics, THE Rules_Engine SHALL evaluate all mood rules and return the calculated mood within 100 milliseconds.
2. WHEN CPU usage exceeds 90 percent, THE Rules_Engine SHALL set mood to ANGRY.
3. WHEN error rate exceeds 10 percent, THE Rules_Engine SHALL set mood to SAD.
4. WHEN all metrics are within normal ranges, THE Rules_Engine SHALL set mood to HAPPY.
5. THE Rules_Engine SHALL return a human-readable reason explaining the mood determination.

### Requirement 7: Frontend Dashboard

**User Story:** As a developer, I want a visual dashboard showing my pet and system health, so that I can monitor the system in an engaging way.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE Frontend SHALL display the pet with an appropriate visual representation of its current mood.
2. WHILE the dashboard is open, THE Frontend SHALL update pet status and metrics every 3 seconds via polling or WebSocket.
3. THE Frontend SHALL display health bars for CPU, memory, and error rate.
4. WHEN the user clicks the Stress System button, THE Frontend SHALL trigger a chaos event and display the pet reaction.
5. THE Frontend SHALL display status indicators for each backend service showing healthy, degraded, or offline states.

### Requirement 8: Docker Orchestration

**User Story:** As a developer, I want all services to run via Docker Compose on my local machine, so that I can easily start and stop the entire system.

#### Acceptance Criteria

1. WHEN the user runs docker-compose up, THE System SHALL start all services in the correct dependency order.
2. THE System SHALL limit each service container to 1 CPU core and 512 megabytes of memory.
3. THE System SHALL expose the frontend on port 3000 and allow access from localhost.
4. WHEN any service container crashes, THE System SHALL automatically restart that container up to 3 times.
5. THE System SHALL use a shared Docker network for inter-service communication using service names as hostnames.
