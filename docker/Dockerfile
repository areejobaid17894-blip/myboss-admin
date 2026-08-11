# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG BUILD_MODE=demo
ARG DEMO_HOST=127.0.0.1
# apigee: VITE_API_GATEWAY_ORIGIN from .env.apigee (Orange Apigee).
# demo: direct service ports http://DEMO_HOST:3001–3005 (no Apigee).
RUN if [ "$BUILD_MODE" = "apigee" ]; then \
      npm run build:apigee; \
    elif [ "$BUILD_MODE" = "demo" ]; then \
      DEMO_HOST="${DEMO_HOST:-localhost}"; \
      VITE_AUTH_API_URL="http://${DEMO_HOST}:3001/api/v1" \
      VITE_USER_API_URL="http://${DEMO_HOST}:3002/api/v1" \
      VITE_CONFIG_API_URL="http://${DEMO_HOST}:3003/api/v1" \
      VITE_SURVEY_API_URL="http://${DEMO_HOST}:3005/api/v1" \
      VITE_SQUAD_API_URL="http://${DEMO_HOST}:3004/api/v1" \
      VITE_APP_ENV=demo \
      npm run build; \
    else \
      npm run build:${BUILD_MODE}; \
    fi

# Production stage — static SPA only (API calls go to Apigee or direct ports baked into the build)
FROM nginx:alpine AS production

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
