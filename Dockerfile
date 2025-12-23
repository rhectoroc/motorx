FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production=false
COPY . .
RUN rm -rf build/ && bun run build
EXPOSE 80
CMD ["bun", "build/server/index.js"]
