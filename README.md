# myboss-admin

React admin portal — calls **microservices directly** on ports **3001–3005**.

**Setup:** [`NEW_DEVICE_SETUP.md`](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/NEW_DEVICE_SETUP.md) · **URLs:** [`SERVICE_URLS.md`](https://github.com/areejobaid17894-blip/myboss-platform/blob/main/docs/deployment/SERVICE_URLS.md)

---

## Local dev (recommended)

```bash
cd ../myboss-platform && ./scripts/deploy-demo-server.sh 127.0.0.1
cd ../myboss-admin && cp .env.example .env.development && npm install && npm run dev
```

Open http://127.0.0.1:5173 — APIs on `localhost:3001–3005`.

---

## Docker (published)

```bash
DEMO_HOST=127.0.0.1 docker compose -f ../myboss-platform/docker/docker-compose.demo.yml --profile with-admin up -d --build admin-portal
```

Open http://127.0.0.1:8081

For a **deployed server**, set `DEMO_HOST=<public-or-lan-ip>` so the browser can reach the APIs.

---

## Login

`admin@orange.com` / `admin123` → OTP

---

*Orange — my boss app*
