# Coligo — Payment Collection App (Mobile)

A hiring-test submission for **iNav Technologies**: a React Native (Expo) mobile app where personal-loan customers view their loan details and pay EMIs, backed by a Node.js/Express REST API with PostgreSQL, deployed to AWS EC2 through GitHub Actions.

| Piece | Stack |
|---|---|
| `apps/mobile` | React Native 0.86 via Expo SDK 57, TypeScript |
| `apps/api` | Node.js 22, Express 5, TypeScript, pg, zod, pino, vitest + supertest |
| `packages/shared` | Shared API contract — DTOs + zod schemas used by both apps |
| Repo tooling | pnpm workspaces + Turborepo monorepo |
| Deploy | GitHub Actions → rsync + PM2 on Amazon Linux 2023 (EC2), Postgres 16 in Docker, nginx reverse proxy |

**One repo, three artifacts:** the API deploys automatically to AWS EC2 on every push to `main`; the Android APK is built and published automatically to GitHub Releases; the same mobile code also runs via Expo Go for development (`EXPO_PUBLIC_API_URL` decides which API it talks to).

---

## Evaluator quick start

| Deliverable | Where |
|---|---|
| **GitHub repo** | this repository |
| **Android APK** | [Releases → latest](https://github.com/harikrishnan-pv/Payment-Collection-App-Coligo/releases/latest) — `ColigoLoans-v1.0.0.apk`, API URL baked in, install and use |
| **Deployed API (AWS EC2)** | `http://52.62.107.240/api` (smoke: [`/api/health`](http://52.62.107.240/api/health)) |
| **API landing page** | [`http://52.62.107.240/`](http://52.62.107.240/) — endpoint docs + copy-paste curls |
| **Demo accounts** | `ACC-100234` … `ACC-100245` — start with `ACC-100234` (Ananya Menon, EMI ₹12,480.50) |
| **Demo reset** | `curl -X POST http://52.62.107.240/api/demo/reset` — restores seed data, clears the one-EMI-per-month state |

**60-second tour:** install the APK → enter demo account `ACC-100234` → loan details (issue date, interest rate, tenure, EMI due) → **Pay EMI** (amount pre-filled) → confirmation with payment reference → **Payment history** (newest first). Cross-check the ledger: `curl http://52.62.107.240/api/payments/ACC-100234`. Pay twice on purpose — the repeat gets `409 EMI_ALREADY_PAID`; then `POST /api/demo/reset` to start fresh.

Demo accounts `ACC-100234` … `ACC-100245`. Business rule: **one EMI payment per account per calendar month** — a repeat attempt returns `409 EMI_ALREADY_PAID` (see §4).

The product narrative — what Coligo is, who it serves, what shipped vs. deferred — is in [`_bmad-output/implementation-artifacts/product-walkthrough.md`](_bmad-output/implementation-artifacts/product-walkthrough.md).

---

## 1. Project setup

Prerequisites: **Node 22+**, **pnpm 11+** (`corepack enable`), **Docker** (for the local Postgres), and the **Expo Go** app on your phone (or an Android/iOS emulator).

```bash
git clone <repo-url> && cd payment-collection-app-coligo
pnpm install
```

Copy the example env files (local development values):

```bash
cp apps/api/.env.example apps/api/.env        # DATABASE_URL points at docker-compose Postgres
# apps/mobile: no .env needed for local dev — see §3
```

## 2. Run the backend locally

```bash
pnpm db:up        # start Postgres 16 on 127.0.0.1:5432 (docker compose)
pnpm db:reset     # apply migrations + seed demo data (12 customers, payment history)
pnpm --filter @coligo/api dev   # API on http://localhost:3000
```

Quick check:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/customers | head -c 300
```

Tests (vitest + supertest against the same Postgres):

```bash
pnpm test
```

## 3. Run the frontend (mobile) locally

In a second terminal:

```bash
pnpm --filter @coligo/mobile start
```

Scan the QR code with **Expo Go** (Android/iOS). The app resolves its API base URL in this order:

1. `EXPO_PUBLIC_API_URL` if set (e.g. `echo 'EXPO_PUBLIC_API_URL=http://<ec2-ip>/api' > apps/mobile/.env`)
2. **Unset (local dev):** the machine serving the dev bundle, port `:3000` — so the phone running Expo Go reaches your local API automatically.

Then in the app: enter a demo account number → loan details → **Pay EMI** → confirmation with payment reference → payment history.

**Demo accounts:** `ACC-100234` … `ACC-100245` (see the [API landing page](http://<ec2-ip>/) on the deployed server for the full list).

## 4. REST API

The test-mandated endpoints (also served under `/api/*` by nginx on EC2):

| Method & path | Purpose | Body / params |
|---|---|---|
| `GET /customers` | Loan details of all customers | — |
| `GET /customers/:account_number` | One customer's loan details | account number |
| `POST /payments` | Record an EMI payment | `{"accountNumber": "ACC-100234", "amount": 12480.50}` |
| `GET /payments/:account_number` | Payment history, newest first | account number |
| `POST /demo/reset` | Demo convenience: restore seed data (clears the one-EMI-per-month state) | — |
| `GET /health` | Liveness | — |

Responses use camelCase DTOs from `packages/shared`. Every error is `{"error":{"code","message"}}` — `400` validation, `404` unknown account, `409 EMI_ALREADY_PAID` when this account already has a successful payment in the current month, `500` opaque to the client (details only in server logs).

**Schema & queries** (`apps/api/src/db/migrations/001_init.sql`): `customers` (unique index on `account_number`) and `payments` (composite index `(customer_id, payment_date DESC)`); payment history is a single join query riding both indexes; `POST /payments` is one atomic `INSERT … SELECT` that resolves the account and writes the ledger row, guarded by the one-EMI-per-month check.

## 5. CI/CD pipeline (GitHub Actions)

`.github/workflows/ci.yml` — one workflow, two jobs:

1. **build-test** (every push/PR): install with pnpm → `turbo build` (shared + api) → typecheck all packages → run API tests against a Postgres 16 service container.
2. **deploy** (`main` only, after tests pass): rsync the repo to the EC2 instance → on the server: `pnpm install --filter @coligo/api...`, build, run migrations, `pm2 startOrReload` → smoke-test `http://<host>/api/health`.

`.github/workflows/build-apk.yml` — second workflow: builds the Android **release APK** (debug-key signed for demo distribution, `EXPO_PUBLIC_API_URL` baked in) and publishes it as the `apk-latest` GitHub Release on every mobile/shared change.

Required **repository secrets**: `EC2_HOST`, `EC2_USER` (`ec2-user`), `EC2_SSH_KEY` (the `.pem` contents).

## 6. Deploying to AWS EC2 (first-time setup)

Provisioning is a one-time manual step; every push to `main` afterwards deploys automatically.

**Launch:** Amazon Linux 2023, t3.micro, security group with **HTTP :80** (0.0.0.0/0) and **SSH :22** (your IP); associate an **Elastic IP**. Then on the instance:

```bash
sudo dnf update -y
sudo dnf install -y nodejs22 nginx docker rsync
sudo systemctl enable --now docker nginx
sudo npm i -g pnpm pm2
sudo usermod -aG docker ec2-user   # log out/in after this

# Postgres (localhost only)
docker run -d --name postgres --restart unless-stopped \
  -e POSTGRES_USER=coligo -e POSTGRES_PASSWORD=<prod-password> \
  -e POSTGRES_DB=coligo -v pgdata:/var/lib/postgresql/data \
  -p 127.0.0.1:5432:5432 postgres:16

# API env (server-side secret — never committed)
cat > /home/ec2-user/app-env <<'EOF'
DATABASE_URL=postgres://coligo:<prod-password>@127.0.0.1:5432/coligo
PORT=3000
NODE_ENV=production
EOF
mkdir -p /home/ec2-user/app/apps/api
mv /home/ec2-user/app-env /home/ec2-user/app/apps/api/.env
```

**nginx + landing page:**

```bash
sudo mkdir -p /var/www/coligo
sudo cp /home/ec2-user/app/deploy/landing/index.html /var/www/coligo/   # after first deploy
sudo cp /home/ec2-user/app/deploy/nginx/coligo.conf /etc/nginx/conf.d/
sudo systemctl reload nginx
```

**PM2 on boot:** `pm2 startup` + `pm2 save` (the deploy job refreshes the process list).

**Secrets → GitHub**, push to `main`, and the pipeline deploys. Verify: `http://<elastic-ip>/api/health` and the landing page at `http://<elastic-ip>/`.

## 7. Repository layout

```
apps/
  api/          # Express API: routes → services → repositories, SQL migrations + seed
  mobile/       # Expo app: screens + reusable components + services/api.ts (only HTTP layer)
    android/    # committed expo prebuild output — CI builds the release APK from it
packages/
  shared/       # DTOs + zod schemas — the API contract, single source of truth
deploy/         # nginx config + static landing page
_bmad-output/   # planning artifacts: PRD, architecture spine, epics & stories
.github/        # CI/CD workflow
```

## 8. Notes & trade-offs

- **Payments are an insert-only ledger** with status `SUCCESS` (no real gateway — out of test scope). No customer-row mutation, so history is append-only and auditable.
- **One EMI per account per calendar month** is enforced by the service layer (`409 EMI_ALREADY_PAID`). Known simplification: "month" is the calendar month of `payment_date`, not the per-loan billing cycle anchored on `issue_date`; a partial unique index would close the theoretical concurrent-insert race. Both are recorded in the PRD addendum.
- **Auth is out of scope** per the requirements; the API is read-mostly and writes are strictly validated (zod on both client and server; parameterized SQL everywhere).
- **HTTPS** would be Let's Encrypt + certbot on the same nginx; out of scope for the Elastic-IP demo endpoint.
- Planning artifacts (PRD, architecture, epics/stories) live in `_bmad-output/` — included to show the process, not just the product.
