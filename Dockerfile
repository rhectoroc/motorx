# BUILDER
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

# RUNTIME - NODE.JS (no Bun)
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1
CMD ["node", "build/server/index.js"]
# CMD ["bun", "build/server/index.js"] --- IGNORE ---