# Dockerfile MÍNIMO
FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .
RUN bun run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "./build/server/index.js"]