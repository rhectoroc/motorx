# |--------------------------------------------------------------------------
# | ETAPA 1: BUILDER (Construcción)
# |--------------------------------------------------------------------------
# Usamos una imagen de Node.js con soporte Slim para instalar dependencias
# y compilar la aplicación.
FROM node:20-slim AS builder

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de dependencias (package.json y lockfile)
# Esto permite que la capa de instalación de dependencias se almacene en caché.
COPY package*.json ./

# Instala las dependencias de Node.js
# Usa --omit=dev para asegurar que solo se instalen las dependencias de producción 
# en la capa final si no se está usando un servidor Nginx.
# Para esta etapa, instalamos todas las dependencias.
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
# archivos estáticos generados en el paso anterior. Esto crea una imagen final
# muy pequeña y segura.
FROM nginx:stable-alpine AS production

# Copia los archivos de construcción (carpeta 'dist') desde la etapa 'builder'
# al directorio por defecto de Nginx para servir contenido estático.
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: Copia una configuración personalizada de Nginx si es necesaria.
# Si tu aplicación usa rutas del lado del cliente (routing), es probable que 
# necesites un archivo 'nginx.conf' personalizado para manejar fallbacks.
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto por defecto de Nginx
EXPOSE 80

# Comando para iniciar Nginx y servir los archivos estáticos
CMD ["nginx", "-g", "daemon off;"]
