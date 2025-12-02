# |--------------------------------------------------------------------------
# | ETAPA 1: BUILDER (Construcción)
# |--------------------------------------------------------------------------
# Usamos una imagen de Node.js slim para instalar dependencias y compilar.
FROM node:20-slim AS builder

# Establece el directorio de trabajo /code (requerido por EasyPanel/Canvas)
WORKDIR /code

# Copia package.json y lockfile para caché de dependencias
COPY package*.json ./

# Instala todas las dependencias (incluyendo devDependencies para build)
RUN npm ci --only=production=false

# Copia el código fuente
COPY . .

# Construye la aplicación (genera dist/ para Vite/React)
RUN npm run build

# |--------------------------------------------------------------------------
# | ETAPA 2: PRODUCTION (Nginx Servidor Estático)
# |--------------------------------------------------------------------------
FROM nginx:stable-alpine AS production

# Elimina configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia archivos estáticos desde builder
COPY --from=builder /code/dist /usr/share/nginx/html

# Configuración Nginx optimizada para SPAs (React Router/Vite)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Cache para assets estáticos \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf \
&& echo "networkaddress.cache.ttl=5" >> /etc/nginx/nginx.conf \
&& nginx -t

# Expone puerto 80 (EasyPanel lo mapeará)
EXPOSE 80

# Inicia Nginx en foreground
CMD ["nginx", "-g", "daemon off;"]
