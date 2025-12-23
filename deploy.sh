#!/bin/bash
# deploy.sh - Script seguro de despliegue

set -e  # Salir en error
set -u  # Error en variables no definidas

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar pre-requisitos
check_prerequisites() {
    log_info "Verificando pre-requisitos..."
    
    command -v docker >/dev/null 2>&1 || {
        log_error "Docker no está instalado"
        exit 1
    }
    
    command -v docker-compose >/dev/null 2>&1 || {
        log_error "Docker Compose no está instalado"
        exit 1
    }
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "Dockerfile" ]; then
        log_error "No se encontró Dockerfile en el directorio actual"
        exit 1
    fi
}

# Construir imagen
build_image() {
    log_info "Construyendo imagen Docker..."
    
    # Usar BuildKit para mejor seguridad y performance
    DOCKER_BUILDKIT=1 docker build \
        --target runtime \
        -t motorx-app:latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --secret id=npmrc,src=$HOME/.npmrc \
        .
    
    if [ $? -eq 0 ]; then
        log_info "Imagen construida exitosamente"
    else
        log_error "Error construyendo imagen"
        exit 1
    fi
}

# Ejecutar tests
run_tests() {
    log_info "Ejecutando tests de integración..."
    
    # Crear red para tests
    docker network create test-network 2>/dev/null || true
    
    # Ejecutar contenedor de tests
    docker run --rm \
        --network test-network \
        --name motorx-test \
        -e NODE_ENV=test \
        -e PORT=3000 \
        motorx-app:latest \
        bun test || {
            log_error "Tests fallaron"
            docker network rm test-network 2>/dev/null || true
            exit 1
        }
    
    docker network rm test-network 2>/dev/null || true
    log_info "Tests pasaron exitosamente"
}

# Escanear seguridad
scan_security() {
    log_info "Escaneando imagen para vulnerabilidades..."
    
    # Verificar si trivy está instalado
    if command -v trivy >/dev/null 2>&1; then
        trivy image --severity HIGH,CRITICAL motorx-app:latest
        
        if [ $? -ne 0 ]; then
            log_warn "Se encontraron vulnerabilidades, revisar antes de producción"
        fi
    else
        log_warn "Trivy no instalado, omitiendo escaneo de seguridad"
    fi
}

# Desplegar
deploy() {
    log_info "Iniciando despliegue..."
    
    # Detener contenedores existentes
    log_info "Deteniendo contenedores anteriores..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Iniciar nuevos contenedores
    log_info "Iniciando nuevos contenedores..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Esperar a que esté saludable
    log_info "Esperando a que el servicio esté saludable..."
    for i in {1..30}; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; then
            log_info "Servicio saludable"
            break
        elif [ $i -eq 30 ]; then
            log_error "Servicio no se volvió saludable después de 30 segundos"
            docker-compose -f docker-compose.prod.yml logs app
            exit 1
        fi
        sleep 1
    done
    
    log_info "Despliegue completado exitosamente"
}

# Main
main() {
    log_info "Iniciando proceso de despliegue de MotorX"
    
    check_prerequisites
    build_image
    run_tests
    scan_security
    deploy
    
    log_info "=== DESPLIEGUE COMPLETADO ==="
    log_info "Aplicación disponible en: http://localhost:3000"
    log_info "Health check: http://localhost:3000/health"
    log_info "Para ver logs: docker-compose -f docker-compose.prod.yml logs -f"
}

# Ejecutar main
main "$@"