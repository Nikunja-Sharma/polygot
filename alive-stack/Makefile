.PHONY: dev build start stop restart logs clean help

# Development mode with hot reload
dev:
	docker-compose -f docker-compose.dev.yml up --build

# Build all production images
build:
	docker-compose build

# Start production stack
start:
	docker-compose up -d

# Stop all containers
stop:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

# Restart production stack
restart: stop start

# View logs (all services)
logs:
	docker-compose logs -f

# View logs for specific service (usage: make logs-api)
logs-%:
	docker-compose logs -f $*

# Clean up everything (containers, images, volumes)
clean:
	docker-compose down -v --rmi local
	docker-compose -f docker-compose.dev.yml down -v --rmi local

# Rebuild specific service (usage: make rebuild-frontend)
rebuild-%:
	docker-compose build $*

# Status of all containers
status:
	docker-compose ps

# Shell into a container (usage: make shell-api)
shell-%:
	docker-compose exec $* sh

# Run integration tests (requires services to be running)
test:
	@echo "Running integration tests..."
	@./tests/integration-test.sh

# Run integration tests with verbose output
test-verbose:
	@echo "Running integration tests (verbose)..."
	@bash -x ./tests/integration-test.sh

# Help
help:
	@echo "AliveStack Commands:"
	@echo "  make dev        - Start dev mode with hot reload"
	@echo "  make build      - Build production images"
	@echo "  make start      - Start production stack (detached)"
	@echo "  make stop       - Stop all containers"
	@echo "  make restart    - Restart production stack"
	@echo "  make logs       - View all logs"
	@echo "  make logs-api   - View logs for specific service"
	@echo "  make clean      - Remove containers, images, volumes"
	@echo "  make rebuild-X  - Rebuild specific service"
	@echo "  make status     - Show container status"
	@echo "  make shell-X    - Shell into container"
	@echo "  make test       - Run integration tests"
