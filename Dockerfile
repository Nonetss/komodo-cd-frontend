FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app

# Instalar Nginx y gettext (para envsubst)
RUN apt-get update && apt-get install -y nginx gettext-base && rm -rf /var/lib/apt/lists/*

# Copiar el build y las dependencias
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/gateway/nginx.conf ./gateway/nginx.conf
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Dar permisos de ejecución al script
RUN chmod +x /app/entrypoint.sh

# Variables de entorno para Astro (interno)
ENV HOST=0.0.0.0
ENV PORT=4321

# Exponer el puerto de Nginx
EXPOSE 80

# Usar el script como punto de entrada
CMD ["/app/entrypoint.sh"]