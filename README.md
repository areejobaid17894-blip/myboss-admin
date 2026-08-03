# myboss-admin

React 19 + Vite 6 admin portal (V2 black sidebar layout).

Part of the **my boss** multi-repo layout — see [`../README.md`](../README.md) and sibling `myboss-platform` for full-stack deploy.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | **20 LTS** | [nodejs.org](https://nodejs.org/) |
| **npm** | 10+ | Bundled with Node |
| **Backend** | Running | Ports 3001–3005 or gateway :8090 |

**Pinned (lockfile):** React 19.2.8 · Vite 6.4.3 · TypeScript 5.7.3 · axios 1.18.1

---

## Files NOT in git

| File / folder | In git? | How to obtain |
|---------------|---------|---------------|
| `.env.development` | No | `cp .env.example .env.development` |
| `.env.local-demo` | No | Copy from `.env.example`, use gateway-relative URLs (commented block) |
| `.env.demo`, `.env.docker` | No | For custom builds |
| `node_modules/` | No | `npm install` |
| `dist/` | No | `npm run build` or `npm run build:demo` |
| `tsconfig.tsbuildinfo` | No | Created by `tsc` during build |

**Safe in git:** `.env.example` (API URL templates only)

---

## Run locally — step by step (Vite dev)

Best for UI development with hot reload.

### 1. Start backend

**Option A — Docker (recommended):**

```bash
cd ../myboss-platform
cp .env.example .env
./scripts/deploy-demo-server.sh 127.0.0.1
```

**Option B — Node:**

```bash
cd ../myboss-backend
cp .env.example .env
npm install && npm run build -w @myboss/common && npm run start:dev
```

### 2. Configure admin env

```bash
cd myboss-admin
cp .env.example .env.development
npm install
```

Default `.env.development` points to direct service ports (`localhost:3001`–`3005`).

### 3. Start dev server

```bash
npm run dev
```

Open: http://localhost:5173

**Login:** `admin@orange.com` / `admin123` → OTP (demo mode auto-fills)

---

## Run via Docker gateway (demo / team testing)

From **`myboss-platform`**:

```bash
./scripts/deploy-demo-server.sh 127.0.0.1
ALLOW_DEPLOY=1 ./scripts/deploy-mobile-web.sh
```

Open: http://127.0.0.1:8090/login (prefer gateway over raw :8081)

Admin is built with gateway-relative API paths (`/auth/api/v1`, etc.).

---

## Deploy live

### Docker (included in platform deploy)

```bash
cd /opt/myboss/myboss-platform
cp .env.example .env
./scripts/deploy-demo-server.sh <SERVER_IP>
ALLOW_DEPLOY=1 ./scripts/deploy-mobile-web.sh
```

Admin: http://`<SERVER_IP>`:8090/login

Public tunnel:

```bash
./scripts/start-demo-tunnel.sh
# Admin: https://<tunnel>/login
```

### Static build (CDN / nginx)

```bash
cd myboss-admin
npm install

# Production — set your API base URLs in .env.production
npm run build:production

# Demo — direct service ports on server IP
npm run build:demo

# Gateway-relative paths (same as Docker demo)
npm run build:local-demo
```

Output: `dist/` → deploy to hosting or copy into nginx.

---

## Build commands

| Command | Use case |
|---------|----------|
| `npm run dev` | Local Vite dev (:5173) |
| `npm run build:local-demo` | Gateway :8090 / Cloudflare tunnel |
| `npm run build:demo` | Direct LAN ports on demo server |
| `npm run build:production` | Production CDN deploy |
| `npm test` | Vitest unit tests |

---

## Navigation (V2)

| Section | Route |
|---------|-------|
| Overview | `/` |
| Statistics | `/statistics` |
| Squads | `/squads` |
| Destinations | `/destinations` |
| Unregistered | `/unregistered` |
| Notifications | `/notifications` |
| Data extraction | `/extraction` |
| Surveys | `/surveys` |
| Photos | `/photos` |
| Vests | `/vests` |
| Configuration | `/configuration` |
| Audit log | `/audit` |

---

## API base paths (gateway :8090)

```
/auth/api/v1   /user/api/v1   /config/api/v1   /squad/api/v1   /survey/api/v1
```

Swagger (squad): http://127.0.0.1:8090/squad/api/v1/docs

---

## Documentation

| Doc | Path |
|-----|------|
| Admin feature matrix | [`../myboss-platform/docs/ADMIN_JOURNEY_COVERAGE.md`](../myboss-platform/docs/ADMIN_JOURNEY_COVERAGE.md) |
| DevOps / deploy | [`../myboss-platform/docs/devops/DEVOPS.md`](../myboss-platform/docs/devops/DEVOPS.md) |
