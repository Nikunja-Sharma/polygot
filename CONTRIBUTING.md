# Contributing to AliveStack

Thank you for your interest in contributing to AliveStack! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Docker version)

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the "enhancement" label
3. Describe the feature and its use case

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests if available
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/alive-stack.git
cd alive-stack

# Start development environment
cd alive-stack
make dev

# Access at http://localhost:3000
```

## Project Structure

```
alive-stack/
├── frontend/          # React dashboard
├── api-node/          # Node.js API Gateway
├── metrics-python/    # Python metrics service
├── validator-rust/    # Rust health validator
├── load-go/           # Go load simulator
├── chaos-cpp/         # C++ chaos engine
├── rules-java/        # Java rules engine
└── docker-compose.yml
```

## Coding Standards

### General
- Write clear, self-documenting code
- Add comments for complex logic
- Follow existing code style in each service

### Language-Specific
- **JavaScript/TypeScript**: ESLint + Prettier
- **Python**: PEP 8, Black formatter
- **Rust**: rustfmt, clippy
- **Go**: gofmt
- **Java**: Google Java Style
- **C++**: clang-format

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add new chaos event type`
- `fix: resolve memory leak in metrics service`
- `docs: update API documentation`
- `refactor: simplify rules engine logic`

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for contributing! 🎉
