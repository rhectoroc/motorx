# Usa la imagen oficial de Bun
FROM oven/bun:latest

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json bun.lock ./

# Instalar dependencias
RUN bun install

# Copiar el resto del código
COPY . .
RUN bun run build

# ✅ CORREGIDO: Puerto 80 para EasyPanel
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80  # ✅ EasyPanel espera 80

# Comando para arrancar el servidor
CMD ["bun", "run", "start"]