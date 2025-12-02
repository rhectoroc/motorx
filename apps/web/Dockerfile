# |--------------------------------------------------------------------------
# | ETAPA 1: BUILDER (Construcción)
# |--------------------------------------------------------------------------
# Usamos una imagen de Node.js con soporte Slim para instalar dependencias
# y compilar la aplicación.
FROM node:20-slim AS builder

# Establece el directorio de trabajo base.
WORKDIR /code

# --- COPIADO EXPLÍCITO DE ARCHIVOS (Solución al ENOENT) ---

# 1. Copia solo la subcarpeta de la aplicación ('apps/web') que contiene package.json
#    Asumimos que el contexto de construcción es la raíz del repositorio.
COPY apps/web /code/apps/web

# 2. Copia archivos de configuración importantes que podrían estar en la raíz (opcional)
#    (Descomenta si tienes archivos como vite.config.js o tailwind.config.js en la raíz del repositorio)
# COPY vite.config.js /code/vite.config.js
# COPY tsconfig.json /code/tsconfig.json

# --- PREPARACIÓN DEL ENTORNO DE COMPILACIÓN ---

# Cambia el WORKDIR a la subcarpeta donde se ejecutará 'npm install' y 'npm run build'
WORKDIR /code/apps/web

# Configura la ubicación de la caché de npm para un mejor rendimiento en Docker
ENV NPM_CONFIG_CACHE=/tmp/.npm-cache

# Instala las dependencias de Node.js (se ejecutará en /code/apps/web)
# Nota: Si tu monorepo usa 'pnpm' o 'yarn', cambia 'npm install' y 'npm run build'
RUN npm install

# Ejecuta el comando de construcción (se ejecutará en /code/apps/web). 
RUN npm run build

# |--------------------------------------------------------------------------
# | ETAPA 2: PRODUCTION (Servidor Node.js para Archivos Estáticos)
# |--------------------------------------------------------------------------
# Utilizamos la imagen de Node.js para servir los archivos estáticos.
# Instalaremos 'serve', un servidor simple y ligero, para esta tarea.
FROM node:20-slim AS production

# Establece un directorio de trabajo para el servidor de producción
WORKDIR /app

# Instala el paquete 'serve' de forma global para servir los archivos estáticos.
RUN npm install -g serve

# Copia los archivos de construcción (carpeta 'dist') desde la ubicación correcta en la etapa 'builder':
# /code/apps/web/dist
COPY --from=builder /code/apps/web/dist ./dist

# El servidor 'serve' ahora usará el puerto 4000. 
EXPOSE 4000

# Comando para iniciar el servidor 'serve' en modo SPA (-s) y en el puerto 4000 (-l 4000), 
# sirviendo el contenido de la carpeta 'dist'.
CMD ["serve", "-s", "dist", "-l", "4000"]
