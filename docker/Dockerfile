# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY  ./
ARG DEMO_HOST=localhost
ARG BUILD_MODE=production
# local-demo: relative /auth|/user|/config|/survey paths (gateway :8090 + Cloudflare tunnel).
# Other modes: direct service ports for LAN/mobile dev against exposed backends.
RUN if [ "$BUILD_MODE" = "local-demo" ]; then \
      npm run build:local-demo; \
    else \
      VITE_AUTH_API_URL=http://${DEMO_HOST}:3001/api/v1 \
      VITE_USER_API_URL=http://${DEMO_HOST}:3002/api/v1 \
      VITE_CONFIG_API_URL=http://${DEMO_HOST}:3003/api/v1 \
      VITE_SURVEY_API_URL=http://${DEMO_HOST}:3005/api/v1 \
      VITE_SQUAD_API_URL=http://${DEMO_HOST}:3004/api/v1 \
      VITE_APP_ENV=demo \
      npm run build:${BUILD_MODE}; \
    fi

# Production stage
FROM nginx:alpine AS production

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
