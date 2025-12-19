# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-20

### Added
- Initial release of AliveStack
- React frontend with pet visualization and control panel
- Node.js API Gateway ("Pet Brain") for service orchestration
- Python metrics analyzer with CPU/memory monitoring
- Rust health validator for service status checks
- Go load simulator with configurable RPS
- C++ chaos engine for CPU/memory stress testing
- Java rules engine for mood determination
- Docker Compose configuration for production
- Docker Compose dev configuration with hot reload
- Comprehensive README and documentation
- Integration test suite
- MIT License

### Services
- Frontend: React + Vite + TailwindCSS (port 3000)
- API Gateway: Node.js + Express (port 3001)
- Metrics: Python + FastAPI (port 8000)
- Validator: Rust + Axum (port 8001)
- Load: Go + Gin (port 8002)
- Chaos: C++ + cpp-httplib (port 8003)
- Rules: Java + Spring Boot (port 8080)

### Features
- Real-time pet mood based on system health
- Chaos engineering controls (CPU/memory stress)
- Load testing with configurable parameters
- Health checks and automatic restart policies
- Resource limits for all containers
