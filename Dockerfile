FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 80
ENV PORT=80
CMD ["bun", "run", "start"]