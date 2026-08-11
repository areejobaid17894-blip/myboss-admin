# myboss-admin

React 19 admin portal for squad management, surveys, notifications, and configuration — V2 black sidebar layout, Vite 6 dev server.

Talks to the backend through gateway-relative paths (`/auth/api/v1`, `/user/api/v1`, …) in demo mode, or direct service ports during local Vite development.

Full stack setup: [New device setup guide](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/NEW_DEVICE_SETUP.md) (**myboss-platform** repo)

**New machine:** [`NEW_DEVICE_SETUP.md`](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/NEW_DEVICE_SETUP.md) · Env vars & GitLab: [`ENV_AND_GITLAB_VARIABLES.md`](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/deployment/ENV_AND_GITLAB_VARIABLES.md)

---

## Prerequisites

Node 20 LTS · npm 10+ · a running backend (ports 3001–3005 or gateway :8090)

**Stack:** React 19.2 · Vite 6.4 · TypeScript 5.7 · axios 1.18

---

## Local development (Vite, hot reload)

Use this when you're working on admin UI.

**1. Start the backend**

Docker (easiest):

```bash
cd ../myboss-platform
cp .env.example .env
./scripts/deploy-demo-server.sh 127.0.0.1
```

Or Node directly:

```bash
cd ../myboss-backend
cp .env.example .env
npm install && npm run build -w @myboss/common && npm run start:dev
```

**2. Configure and run admin**

```bash
cd myboss-admin
cp .env.example .env.development
npm install
npm run dev
```

Open http://localhost:5173

Default `.env.development` points at direct service ports (`localhost:3001`–`3005`).

**Data layer:** Backend uses a single shared MariaDB database (`myboss`) when `DB_ENABLED=true`. Demo Docker runs in-memory by default. See [DATABASE.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/database/DATABASE.md).

**Login:** `admin@orange.com` / `admin123` → OTP (auto-fills in demo mode)

---

## Demo / team testing via gateway

For the same experience testers see — everything on port 8090:

```bash
cd ../myboss-platform
./scripts/deploy-demo-server.sh 127.0.0.1
ALLOW_DEPLOY=1 ./scripts/deploy-mobile-web.sh
```

Admin: http://127.0.0.1:8090/login

Prefer the gateway over raw :8081 — the admin build uses relative API paths that match production Apigee routing.

---

## Local configuration

| File | Purpose | Setup |
|------|---------|-------|
| `.env.development` | Vite dev server | `cp .env.example .env.development` |
| `.env.local-demo` | Gateway-relative URLs | Copy from `.env.example` (commented block) |
| `.env.demo`, `.env.docker` | Custom demo builds | As needed |
| `node_modules/` | Dependencies | `npm install` |
| `dist/` | Production build output | `npm run build` |

Template: `.env.example`

---

## Deploy live

**Docker** (included in platform stack):

```bash
cd /opt/myboss/myboss-platform
cp .env.example .env
./scripts/deploy-demo-server.sh <SERVER_IP>
ALLOW_DEPLOY=1 ./scripts/deploy-mobile-web.sh
```

Admin: `http://<SERVER_IP>:8090/login`

Public tunnel: `./scripts/start-demo-tunnel.sh` → `https://<tunnel>/login`

**Static build** (CDN or nginx):

```bash
npm install
npm run build:production   # set API URLs in .env.production
npm run build:demo         # direct LAN ports on demo server
npm run build:local-demo   # gateway-relative paths (matches Docker demo)
```

Output goes to `dist/`.

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
| Notifications | `/notifications` — compose in-app + push (requires backend FCM) |
| Data extraction | `/extraction` |
| Surveys | `/surveys` |
| Photos | `/photos` |
| Vests | `/vests` |
| Configuration | `/configuration` |
| Audit log | `/audit` |

---

## API paths (gateway :8090)

```
/auth/api/v1   /user/api/v1   /config/api/v1   /squad/api/v1   /survey/api/v1   /notification/api/v1
```

Push notifications: admin **Notifications** page triggers survey-service → notification-service (FCM). See [PUSH_FIREBASE_SETUP.md](../myboss-platform/docs/PUSH_FIREBASE_SETUP.md).

Swagger (squad): http://127.0.0.1:8090/squad/api/v1/docs

---

## Further reading

| Topic | Link |
|-------|------|
| Database schema | [DATABASE.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/database/DATABASE.md) |
| Admin feature matrix | [ADMIN_JOURNEY_COVERAGE.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/ADMIN_JOURNEY_COVERAGE.md) |
| Push notifications | [PUSH_FIREBASE_SETUP.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/PUSH_FIREBASE_SETUP.md) |
| DevOps / deploy | [DEVOPS.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/devops/DEVOPS.md) |
| Full stack setup | [MULTI_REPO_SETUP.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/MULTI_REPO_SETUP.md) |
