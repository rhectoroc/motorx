# |--------------------------------------------------------------------------
# | ETAPA 1: BUILDER (Construcción)
# |--------------------------------------------------------------------------
# Usamos una imagen de Node.js con soporte Slim para instalar dependencias
# y compilar la aplicación.
FROM node:20-slim AS builder

# Establece el directorio de trabajo dentro del contenedor a /code (necesario para Canvas/EasyPanel)
WORKDIR /code

# Copia los archivos de configuración de dependencias (package.json y lockfile)
# Esto permite que la capa de instalación de dependencias se almacene en caché.
COPY package*.json ./

# Instala las dependencias de Node.js (y todas las dependencias de desarrollo para la compilación)
RUN npm install

# Copia el resto del código de la aplicación (incluyendo 'src' y archivos de configuración)
COPY . .

# Ejecuta el comando de construcción. Esto genera los archivos estáticos listos para producción
# en el directorio 'dist' (típico de Vite).
RUN npm run build

# |--------------------------------------------------------------------------
# | ETAPA 2: PRODUCTION (Servidor Web Final)
# |--------------------------------------------------------------------------
# Utilizamos la imagen de Nginx estable y ligera (Alpine) para servir los 
# archivos estáticos generados en el paso anterior. Es ideal para EasyPanel Box.
FROM nginx:stable-alpine AS production

# Copia los archivos de construcción (carpeta 'dist') desde la etapa 'builder'
# al directorio por defecto de Nginx para servir contenido estático.
COPY --from=builder /code/dist /usr/share/nginx/html

# --- Configuración Importante para EasyPanel/SPAs (Rutas del Lado del Cliente) ---
# Si tu aplicación es una SPA (Single Page Application) y usa React Router o similar,
# NECESITAS una configuración de Nginx para redirigir todas las solicitudes 
# al index.html para que las rutas funcionen correctamente. 

# Dado que no puedo saber si tienes un nginx.conf, vamos a usar una configuración básica
# que asume el comportamiento de SPA. Si tienes un archivo nginx.conf personalizado, 
# debes usar la línea comentada abajo.

# Creamos un archivo default.conf simple para manejar las rutas (necesario en la mayoría de SPAs)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# EXPONE el puerto 80, que EasyPanel mapeará a un puerto externo.
EXPOSE 80

# Comando para iniciar Nginx y servir los archivos estáticos
CMD ["nginx", "-g", "daemon off;"]
