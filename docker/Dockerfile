# Build + serve admin SPA using only node:20-alpine (same base as backend).

# ── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG BUILD_MODE=demo
ARG DEMO_HOST=127.0.0.1
ARG VITE_APP_ENV
ARG VITE_API_URL
ARG VITE_API_GATEWAY_ORIGIN
# GitLab CI/CD Variables are passed as build args (never baked from a committed .env).
# One backend origin: http://HOST:3001/api/v1
RUN API_URL="${VITE_API_URL:-http://${DEMO_HOST:-localhost}:3001/api/v1}"; \
    if [ "$BUILD_MODE" = "apigee" ] || [ -n "$VITE_API_GATEWAY_ORIGIN" ]; then \
      VITE_API_GATEWAY_ORIGIN="${VITE_API_GATEWAY_ORIGIN}" \
      VITE_APP_ENV="${VITE_APP_ENV:-production}" \
      npm run build; \
    else \
      VITE_API_URL="$API_URL" \
      VITE_AUTH_API_URL="$API_URL" \
      VITE_USER_API_URL="$API_URL" \
      VITE_CONFIG_API_URL="$API_URL" \
      VITE_SURVEY_API_URL="$API_URL" \
      VITE_SQUAD_API_URL="$API_URL" \
      VITE_APP_ENV="${VITE_APP_ENV:-${BUILD_MODE}}" \
      npm run build; \
    fi

# ── Run (static SPA) ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

COPY docker/spa-server.mjs ./
COPY --from=builder /app/dist ./dist

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:80/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "spa-server.mjs"]
