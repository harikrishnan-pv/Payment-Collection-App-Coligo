# Epics & Stories — Payment Collection App (Coligo)

Source: PRD (final) + Architecture Spine (final), 2026-09-15. Single-day sprint; stories are the build checklist. AC = acceptance criteria.

## Epic 1 — Monorepo Foundation
**Story 1.1 Scaffold Turborepo.** pnpm workspaces + turbo: `apps/api`, `apps/mobile`, `packages/shared`; turbo pipeline (build ← ^build, test, typecheck); root `docker-compose.yml` (Postgres 16 :5432); `.env.example` ×2; `.gitignore`.
- AC: `pnpm install && pnpm build` green from cold clone; shared package importable from both apps.

## Epic 2 — Backend API (apps/api)
**Story 2.1 Schema + migrations.** `customers` (id BIGSERIAL PK, account_number VARCHAR(20) UNIQUE, name, issue_date DATE, interest_rate NUMERIC(5,2), tenure_months INT, emi_due NUMERIC(12,2), outstanding NUMERIC(12,2)); `payments` (id UUID PK default gen_random_uuid(), customer_id FK, payment_date TIMESTAMPTZ default now(), payment_amount NUMERIC(12,2), status VARCHAR(10)); indexes: unique(account_number), (customer_id, payment_date DESC). [AD-3, AD-8]
- AC: `pnpm db:migrate` applies idempotently; indexes present in `\d`.

**Story 2.2 Seed.** 12 realistic INR customers + ~40 historical payments.
- AC: `pnpm db:seed` rerunnable (truncate + insert).

**Story 2.3 `GET /customers`.** All loan details, single indexed query. [AD-1]
- AC: 200 JSON array; field names camelCase per shared DTO.

**Story 2.4 `POST /payments`.** zod-validated body `{accountNumber, amount}`; 404 unknown account; 400 invalid amount (≤0, >2 decimals, non-numeric); insert-only SUCCESS row; returns shared PaymentDto incl. UUID reference. [AD-1, AD-4, AD-5]
- AC: supertest covers 200/400/404; no customer mutation.

**Story 2.5 `GET /payments/:account_number`.** History newest-first; one lookup + one indexed query. [AD-8]
- AC: 200 list; 404 unknown account; ordered by payment_date DESC.

**Story 2.6 Cross-cutting.** Error envelope middleware `{error:{code,message}}`; pino JSON request log; `GET /health`; 500s without stack traces. [AD-5]
- AC: malformed JSON body → 400 envelope, logged one line.

**Story 2.7 API tests.** vitest + supertest against real Postgres (CI service container).
- AC: all stories' ACs automated; `pnpm test` green.

## Epic 3 — Mobile App (apps/mobile, Expo)
**Story 3.1 Client foundation.** Expo blank-TS; `src/services/api.ts` (single fetch layer, base URL from `EXPO_PUBLIC_API_URL`); shared DTO imports. [AD-2, AD-6]
- AC: no `fetch` outside services layer; typecheck green.

**Story 3.2 Loan lookup screen.** Account number entry → loan card (Account Number, Issue Date, Interest Rate, Tenure, EMI Due); unknown → inline error state. [FR-1/2]
- AC: all five fields present; works on 5"–6.7" widths.

**Story 3.3 Payment form.** Amount pre-filled with EMI due (editable), client-side validation, submit → POST. [FR-3]
- AC: 0/negative/non-numeric blocked client-side too.

**Story 3.4 Confirmation acknowledgment.** Success screen: amount, date, status, reference id + "Pay another / History" actions. [FR-4/5]
- AC: reference id shown; API failure shows actionable error, no silent loss.

**Story 3.5 History screen.** Per-account payment list (date, amount, status). [UJ-2]
- AC: newest first; empty state handled.

**Story 3.6 UX polish.** Loading spinners, disabled buttons while submitting, consistent theme, safe-area + scroll. [NFR-1/6]
- AC: no unstyled alerts; all states reachable.

## Epic 4 — CI/CD & Deployment
**Story 4.1 CI workflow.** On push/PR: pnpm install, `turbo run typecheck test build` (Postgres service container for API tests). [AD-7]
- AC: green run on GitHub from cold clone.

**Story 4.2 Deploy job.** main-only, after CI: rsync api build + shared + ecosystem file → EC2, `pm2 reload`; secrets `EC2_HOST/EC2_USER/EC2_SSH_KEY` + `DATABASE_URL`. [AD-7]
- AC: push to main deploys; `/api/health` 200 from instance.

**Story 4.3 nginx + landing.** `/api/` → :3000 (prefix stripped), `/` static landing page (project title, API reference, demo account numbers). [AD-1]
- AC: `http://<ip>/api/customers` returns data; `http://<ip>/` serves page.

**Story 4.4 Provisioning + smoke.** EC2 runbook (AL2023 commands) + first deploy + end-to-end smoke (lookup → pay → history via mobile on Expo Go against EC2).
- AC: mobile app on a real phone pays an EMI against production API.

## Epic 5 — Documentation
**Story 5.1 Root README.** Setup, local run (frontend + backend), CI/CD explanation, EC2 deployment steps, env-var table, demo accounts. [NFR-5]
- AC: cold-clone → running in ≤ 10 min following only README.

**Story 5.2 API reference.** Endpoint docs with request/response examples (landing page + README section).
- AC: examples match shared DTOs.
