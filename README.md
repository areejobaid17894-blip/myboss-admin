> Part of **my boss** multi-repo. See sibling `myboss-platform` for full-stack deploy.


# the Boss — Admin Console

React 19 + Vite 6 admin portal (V2 black sidebar layout).

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 20 LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 10+ | Bundled with Node |
| **Backend** | Ports 3001–3005 or gateway :8090 | See [`apps/backend/README.md`](../backend/README.md) |

**Pinned runtime (lockfile):** React 19.2.8 · Vite 6.4.3 · TypeScript 5.7.3 · axios 1.18.1

---

## Files NOT in git — how to get them

| File / folder | In git? | How to obtain |
|---------------|---------|---------------|
| `.env.development` | No | `cp .env.example .env.development` in this folder |
| `.env.local-demo` | No | Copy from `.env.example`, use gateway-relative URLs (commented block) |
| `.env.demo`, `.env.docker` | No | Create for your environment or use Docker build args |
| `node_modules/` | No | `npm install` |
| `dist/` | No | `npm run build` or `npm run build:demo` |
| `tsconfig.tsbuildinfo` | No | Created by `tsc` during build |

**Safe in git:** `.env.example` (API URL templates only).

---

## Local development — start

**1. Start backend** (repo root):

```bash
cd apps/backend && npm install && npm run start:dev
```

**2. Configure admin env:**

```bash
cd apps/admin-portal
cp .env.example .env.development
npm install
npm run dev
```

Open: http://localhost:5173

Login: `admin@orange.com` / `admin123` → OTP (demo mode)

---

## Demo via Docker gateway (recommended)

From **repo root**:

```bash
./infrastructure/scripts/deploy-demo-server.sh 127.0.0.1
docker compose -f infrastructure/docker/docker-compose.demo.yml --profile with-admin up -d --build admin-portal
```

Open: http://127.0.0.1:8090/login (prefer gateway over raw :8081)

Public tunnel: run `./infrastructure/scripts/start-demo-tunnel.sh` → URL in `demo-public-url.txt` (local file, not in git)

---

## Build

```bash
npm run build:demo          # Demo Docker image
npm run build:local-demo    # Local gateway paths
npm run build:production    # Production
npm test
```

---

## Navigation (V2)

| Section | Route |
|---------|-------|
| Overview | `/` |
| Statistics | `/statistics` |
| Squads | `/squads` |
| Destinations | `/destinations` |
| Unregistered | `/unregistered` (add employee here) |
| Notifications | `/notifications` |
| Data extraction | `/extraction` |
| Surveys | `/surveys` |
| Photos | `/photos` |
| Vests | `/vests` (vest size edit window + inventory) |
| Configuration | `/configuration` |
| Audit log | `/audit` |

Legacy: `/users` → `/unregistered`, `/dashboard` → `/`

---

## API base paths

When served via gateway (:8090):

```
/auth/api/v1   /user/api/v1   /config/api/v1   /squad/api/v1   /survey/api/v1
```

Swagger (squad): http://127.0.0.1:8090/squad/api/v1/docs

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/ADMIN_JOURNEY_COVERAGE.md`](../../docs/ADMIN_JOURNEY_COVERAGE.md) | Feature matrix |
| [`docs/devops/DEVOPS.md`](../../docs/devops/DEVOPS.md) | Deploy & stack |
