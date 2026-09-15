# Coligo — Requirement Set (v1)

The distilled working requirements the PRD and epics trace back to. Scope decided up front; see `../planning-artifacts/prds/` for how each requirement maps to epics and stories.

## Product

A personal-loan payment collection app: customers look up their loan by account number, see what they owe, pay this month's EMI from their phone, and receive an immediate acknowledgment. Every payment lands in an append-only ledger.

## Platform

- **Mobile app:** React Native (Expo), Android-first distribution via an installable APK published from CI.
- **Backend:** Node.js + Express REST API in TypeScript.
- **Database:** Postgres.
- **Delivery:** one GitHub repository (Turborepo monorepo: `apps/api`, `apps/mobile`, `packages/shared`).

## Loan details (per account)

Account Number · Issue Date · Interest Rate · Tenure · EMI Due

## Payment flow

- Payment form: account number + EMI amount (numeric, > 0).
- Success → confirmation acknowledgment: amount, date, status, payment reference.
- Payment history per account, newest first.
- Ledger integrity: **one successful payment per account per calendar month**; a repeat attempt is rejected with `409 EMI_ALREADY_PAID`.

## REST API

`GET /customers` · `GET /customers/:account_number` · `POST /payments` · `GET /payments/:account_number` · `GET /health` (+ `POST /demo/reset` demo convenience).

Errors use a uniform JSON envelope `{"error":{"code","message"}}` — 4xx for validation/unknown account/duplicate EMI, 5xx never leaking internals.

## Data model

- `customers`: account_number (unique), name, issue_date, interest_rate, tenure_months, emi_due, outstanding.
- `payments`: payment reference (UUID), customer reference, payment_date, amount, status.

## Non-functional

- API base URL reaches the app via an environment variable (`EXPO_PUBLIC_API_URL`, build-time inlined).
- CI/CD on GitHub Actions: test + deploy the API to AWS EC2 on every push to `main`; build + publish the APK to GitHub Releases.
- Validation on both client and server; parameterized SQL only; secrets via environment variables, never committed.
- Documentation: setup, local run (backend + mobile), CI/CD configuration, EC2 deployment.

## Out of scope (v1)

Authentication/login, real payment gateway, statements, push notifications, multi-currency, admin panel.
