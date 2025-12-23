FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 80
ENV PORT=80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:80/health || exit 1
CMD ["bun", "run", "start"]
