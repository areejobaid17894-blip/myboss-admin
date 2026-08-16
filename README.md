# myboss-admin

React admin portal (Vite **6**, React **19**). One API: `http://<host>:3001/api/v1`.

Deploy: **DevOps CI/CD** builds `myboss-admin/docker/Dockerfile` (port **8081**). See [DEVOPS](https://github.com/areejobaid17894-blip/myboss-platform/-/blob/master/docs/devops/DEVOPS.md).

## Run

API must be up (`curl http://127.0.0.1:3001/api/v1/health`).

| Mode | Command | URL |
|------|---------|-----|
| Docker | `cd ../myboss-platform && docker compose up -d --build` | http://\<DEMO_HOST\>:8081/login |
| Vite | `npm install && npm run dev` | http://127.0.0.1:5173 |

Copy `.env.example` → `.env.development` for Vite.  
Production / preprod Vite keys: `.env.production.example`, `.env.preprod.example` (GitLab variables at **image build**).

Login: `admin@orange.com` / `admin123` → OTP emailed.

---

*Orange — my boss app*
