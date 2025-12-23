# Makefile para comandos comunes
.PHONY: help build test deploy clean

# Variables
IMAGE_NAME = motorx-app
TAG = latest
REGISTRY = your-registry.com

help:
	@echo "Comandos disponibles:"
	@echo "  make build          - Construir imagen Docker"
	@echo "  make test           - Ejecutar tests"
	@echo "  make scan           - Escanear imagen con Trivy"
	@echo "  make run            - Ejecutar localmente"
	@echo "  make push           - Subir imagen al registry"
	@echo "  make clean          - Limpiar artefactos"
	@echo "  make security-check - Verificar vulnerabilidades"

build:
	@echo "Construyendo imagen..."
	docker build \
		--target runtime \
		-t $(IMAGE_NAME):$(TAG) \
		--build-arg BUILD_DATE=$(shell date -u +"%Y-%m-%dT%H:%M:%SZ") \
		--build-arg VCS_REF=$(shell git rev-parse --short HEAD) \
		.

test:
	@echo "Ejecutando tests..."
	docker run --rm $(IMAGE_NAME):$(TAG) bun test

scan:
	@echo "Escaneando imagen con Trivy..."
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy:latest \
		image $(IMAGE_NAME):$(TAG)

run:
	@echo "Ejecutando aplicación..."
	docker-compose -f docker-compose.prod.yml up -d

push:
	@echo "Subiendo imagen..."
	docker tag $(IMAGE_NAME):$(TAG) $(REGISTRY)/$(IMAGE_NAME):$(TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):$(TAG)

clean:
	@echo "Limpiando..."
	docker system prune -f
	docker images -f "dangling=true" -q | xargs -r docker rmi -f

security-check:
	@echo "=== Verificando seguridad ==="
	@echo "1. Usuario no-root..."
	docker run --rm $(IMAGE_NAME):$(TAG) whoami | grep -q "appuser" && echo "✓ OK" || echo "✗ FAIL"
	@echo "2. Puerto expuesto..."
	docker run --rm $(IMAGE_NAME):$(TAG) sh -c 'echo "PORT: $$PORT"' | grep -q "3000" && echo "✓ OK" || echo "✗ FAIL"
	@echo "3. Health check..."
	docker run -d --name test-health --rm $(IMAGE_NAME):$(TAG) && \
	sleep 5 && \
	docker inspect --format='{{.State.Health.Status}}' test-health | grep -q "healthy\|starting" && echo "✓ OK" || echo "✗ FAIL"; \
	docker stop test-health > /dev/null 2>&1