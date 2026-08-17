# myboss-admin

React admin portal (Vite **6**, React **19**). API: `http://<host>:3001/api/v1`.

**DevOps:** clone this repo and `myboss-backend`. Do **not** use `myboss-platform`.

| | |
|--|--|
| Dockerfile | `docker/Dockerfile` |
| GitLab variables (runtime) | [`docs/gitlab/gitlab-preprod.env.example`](docs/gitlab/gitlab-preprod.env.example) · [`gitlab-production.env.example`](docs/gitlab/gitlab-production.env.example) |

The image has **no build args and no baked URLs**. GitLab injects `VITE_API_URL` and `VITE_APP_ENV` as container env; `spa-server.mjs` serves them at `/runtime-config.js`.

```bash
docker build -f docker/Dockerfile -t myboss-admin .
docker run -e VITE_API_URL=https://<api-ingress>/api/v1 -e VITE_APP_ENV=preprod -p 8081:80 myboss-admin
```

Local Vite:

```bash
cp .env.example .env.development
npm install
npm run dev
```

Login: `areej.obaid@orange.com` / `admin123` → OTP emailed.

---

*Orange — my boss app*
