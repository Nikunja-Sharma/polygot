# AliveStack - DevOps Tamagotchi 🐾

A polyglot microservices system that visualizes backend health as a virtual pet. Watch your pet's mood change based on real system metrics!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

AliveStack demonstrates real-world microservices architecture using six different programming languages, each chosen for its specific strengths. The system runs entirely on Docker Compose and showcases patterns like API gateways, health checks, chaos engineering, and load testing.

## Architecture

<img width="1535" height="758" alt="image" src="https://github.com/user-attachments/assets/c8cad221-4d82-4590-974f-d00496e0b710" />


## Services

| Service | Language | Port | Purpose |
|---------|----------|------|---------|
| Frontend | React/TypeScript | 3000 | Visual dashboard |
| API Gateway | Node.js | 3001 | Central orchestrator |
| Metrics Analyzer | Python | 8000 | System metrics |
| Health Validator | Rust | 8001 | Service validation |
| Load Simulator | Go | 8002 | Load generation |
| Chaos Engine | C++ | 8003 | System stress |
| Rules Engine | Java | 8080 | Mood logic |

## Quick Start

### Prerequisites
- Docker and Docker Compose
- 4GB+ RAM available

### Run the Stack

```bash
cd alive-stack

# Production mode
docker-compose up

# Development mode (with hot reload)
make dev

# Access the dashboard
open http://localhost:3000
```

## Pet Moods

| Mood | Emoji | Trigger |
|------|-------|---------|
| HAPPY | 😄 | All systems operational |
| NEUTRAL | 😐 | Minor issues |
| WORRIED | 😰 | High memory (>85%) |
| SAD | 😢 | High error rate (>10%) |
| ANGRY | 😠 | CPU overload (>90%) |
| SICK | 🤒 | Service offline |

## Documentation

- [Full Documentation](alive-stack/README.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built as a demonstration of polyglot microservices architecture
- Inspired by the classic Tamagotchi virtual pets
