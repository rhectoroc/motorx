# Dockerfile
# ==========
# Imagen multi-stage para:
# 1. Builder: Construcción con todas las dependencias
# 2. Runtime: Imagen mínima y segura para producción

# ---------- STAGE 1: Builder ----------
FROM oven/bun:latest AS builder

# Instalar herramientas de sistema necesarias para build
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario de aplicación con UID/GID específicos
# Esto asegura consistencia entre diferentes etapas
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias con ownership correcto
COPY --chown=appuser:appgroup package.json bun.lock ./

# Instalar dependencias como usuario no-root
USER appuser
RUN bun install --frozen-lockfile --production=false

# Copiar código fuente
COPY --chown=appuser:appgroup . .

# Verificar estructura antes del build
RUN ls -la && echo "=== Estructura de src ===" && find src -type f -name "*.ts" -o -name "*.tsx" | head -20

# Ejecutar build
RUN bun run build

# Verificar estructura después del build
RUN echo "=== Estructura después del build ===" && \
    ls -la build/ && \
    echo "=== Contenido de build/server ===" && \
    ls -la build/server/

# ---------- STAGE 2: Runtime ----------
FROM oven/bun:latest AS runtime

# Metadatos de la imagen
LABEL maintainer="Tu Nombre <tu@email.com>"
LABEL description="MotorX Application"
LABEL version="1.0.0"

# Crear el mismo usuario/grupo que en builder para consistencia
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Instalar solo lo absolutamente necesario en runtime
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Para health checks y debugging ligero
    curl \
    # Para permisos de archivos
    acl \
    # Limpiar cache de apt
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Configurar directorio de trabajo
WORKDIR /app

# Copiar desde builder solo lo necesario
COPY --from=builder --chown=appuser:appgroup /app/package.json /app/bun.lock ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/build ./build
COPY --from=builder --chown=appuser:appgroup /app/public ./public

# Verificar permisos
RUN ls -la && echo "=== Permisos de archivos críticos ===" && \
    ls -la build/server/index.js && \
    ls -la node_modules/.bin/bun

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Exponer puerto (solo documentación, no abre puertos)
EXPOSE 3000

# Configurar health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Cambiar a usuario no-root
USER appuser

# Verificar que podemos ejecutar bun
RUN bun --version

# Comando de inicio
CMD ["bun", "./build/server/index.js"]