# Admin SPA. No GitLab / app variables in this image.
# Runtime config (VITE_API_URL, VITE_APP_ENV) comes from container env
# injected by GitLab CI/CD → spa-server.mjs → /runtime-config.js
#
# Build context: myboss-admin repository root.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY docker/spa-server.mjs ./
COPY --from=builder /app/dist ./dist

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:80/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "spa-server.mjs"]
