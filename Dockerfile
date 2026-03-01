# ---- Build stage ----
FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server source
COPY server/ ./server/

# ---- Production ----
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S rocket -u 1001 -G nodejs

# Copy from build stage
COPY --from=base --chown=rocket:nodejs /app /app

USER rocket

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start server
CMD ["node", "server/index.js"]
