# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar herramientas necesarias
RUN apk add --no-cache openssl

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# ====================================
# Etapa de producción
# ====================================
FROM node:22-alpine AS production

WORKDIR /app

# Instalar herramientas necesarias para TypeORM
RUN apk add --no-cache openssl curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar dependencias y archivos compilados desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/src/shared/infrastructure/db/migrations ./src/shared/infrastructure/db/migrations
COPY --from=builder --chown=nodejs:nodejs /app/src/shared/infrastructure/db/typeorm.config.ts ./src/shared/infrastructure/db/typeorm.config.ts

# Script de inicio que ejecuta migraciones
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "�� Running database migrations..."' >> /app/start.sh && \
    echo 'npm run migration:run' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "🚀 Starting application..."' >> /app/start.sh && \
    echo 'exec node dist/config/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nodejs:nodejs /app/start.sh

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/inventory || exit 1

# Comando de inicio
CMD ["/app/start.sh"]
