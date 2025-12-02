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
# | ETAPA 2: PRODUCTION (Servidor Node.js para Archivos Estáticos)
# |--------------------------------------------------------------------------
# Utilizamos la imagen de Node.js para servir los archivos estáticos, ya que Nginx no está disponible.
# Instalaremos 'serve', un servidor simple y ligero, para esta tarea.
FROM node:20-slim AS production

# Establece un directorio de trabajo para el servidor de producción
WORKDIR /app

# Instala el paquete 'serve' de forma global para servir los archivos estáticos.
RUN npm install -g serve

# Copia solo los archivos de construcción (carpeta 'dist') desde la etapa 'builder'
# al directorio de trabajo actual.
COPY --from=builder /code/dist ./dist

# El servidor 'serve' ahora usará el puerto 4000. 
# Asegúrate de configurar este mismo puerto (4000) en EasyPanel.
EXPOSE 4000

# Comando para iniciar el servidor 'serve' en modo SPA (-s) y en el puerto 4000 (-l 4000), 
# sirviendo el contenido de la carpeta 'dist'.
CMD ["serve", "-s", "dist", "-l", "4000"]
