# myboss-admin

React 19 admin portal — V2 black sidebar, Vite 6 dev server.

**Demo/production:** calls **Orange Apigee** (`https://api-demo.orange.com`).  
**Local dev:** Vite on `:5173` with direct service ports `:3001–3006`.

**Setup:** [`NEW_DEVICE_SETUP.md`](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/NEW_DEVICE_SETUP.md) · **URLs:** [`APIGEE_CLIENT_URLS.md`](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/deployment/APIGEE_CLIENT_URLS.md)

---

## Prerequisites

Node 20 LTS · npm 10+ · running backend (Docker or npm)

---

## Local development (recommended)

**1. Start backend**

```bash
cd ../myboss-platform
cp .env.example .env
./scripts/deploy-demo-server.sh 127.0.0.1
```

**2. Run admin**

```bash
cd myboss-admin
cp .env.example .env.development
npm install
npm run dev
```

Open http://127.0.0.1:5173 — login `admin@orange.com` / `admin123` → OTP (auto in demo)

---

## Demo / production build (Apigee)

```bash
npm run build:apigee
# Deploy dist/ or use Docker admin on :8081 (built with Apigee URLs)
```

---

## Build commands

| Command | Use case |
|---------|----------|
| `npm run dev` | Local Vite (:5173, localhost APIs) |
| `npm run build:apigee` | **Demo** — `https://api-demo.orange.com` |
| `npm run build:production` | Production CDN |
| `npm run build:demo` | Direct LAN ports (local Docker) |
| `npm test` | Vitest |

---

## Deploy live

```bash
cd /opt/myboss/myboss-platform
./scripts/deploy-demo-server.sh <SERVER_IP>
# Admin at http://<SERVER_IP>:8081 (Apigee APIs)
```

Or static: `npm run build:apigee` → deploy `dist/` to CDN.

---

## Navigation (V2)

Overview `/` · Statistics `/statistics` · Squads `/squads` · Destinations `/destinations` · Unregistered `/unregistered` · Notifications `/notifications` · Surveys `/surveys` · Photos `/photos` · Configuration `/configuration` · Audit `/audit`

---

## API paths (Apigee)

```
/auth/api/v1   /user/api/v1   /config/api/v1   /squad/api/v1   /survey/api/v1   /notification/api/v1
```

Base: `https://api-demo.orange.com` (see `.env.apigee`)

---

## Configuration files

| File | Purpose |
|------|---------|
| `.env.development` | Vite dev — direct localhost ports |
| `.env.apigee` | Apigee demo build |
| `.env.example` | Template |

---

## Further reading

| Topic | Link |
|-------|------|
| New device setup | [NEW_DEVICE_SETUP.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/NEW_DEVICE_SETUP.md) |
| DevOps | [DEVOPS.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/devops/DEVOPS.md) |
| Admin features | [ADMIN_JOURNEY_COVERAGE.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/ADMIN_JOURNEY_COVERAGE.md) |
| Push notifications | [PUSH_FIREBASE_SETUP.md](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/PUSH_FIREBASE_SETUP.md) |
