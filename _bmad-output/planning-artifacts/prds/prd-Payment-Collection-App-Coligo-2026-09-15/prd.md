---
title: Payment Collection App — Coligo
status: final
created: 2026-09-15
updated: 2026-09-15
---

# PRD — Payment Collection App (Coligo)

**Prologue.** iNav Technologies hiring-test deliverable, due 2026-09-15 15:30 IST. A personal-loan customer uses a mobile app to look up their loan details and pay their EMI; a Node.js API backed by Postgres serves the data and records payments. Graded on frontend UX, API correctness, schema design, CI/CD, and documentation.

## 1. Problem & Purpose

Loan customers need a simple way to see what they owe (EMI, rate, tenure) and make a payment from their phone, receiving proof of payment immediately. The hiring test prescribes the exact surface: a mobile app plus a REST API plus an automated deployment.

## 2. Success Metrics

| Metric | Target | Counter-metric |
|---|---|---|
| Evaluation criteria coverage | All 5 graded areas demonstrably satisfied | — |
| API p95 latency (loan lookup, payment) | < 500 ms on EC2 t3.micro | Error rate stays 0 under smoke test |
| Cold-start demo | Evaluator can go from clone → running locally in ≤ 10 min using README only | README length stays ≤ 2 screens per section |

## 3. User Journeys

**UJ-1: Pay this month's EMI.** Ananya has a personal loan. She opens the app, enters her account number, and sees her loan card: account number, issue date, interest rate, tenure, and EMI due. She taps *Pay EMI*, the amount is pre-filled with the EMI due [ASSUMPTION: pre-fill, editable], she confirms, and gets a confirmation acknowledgment with payment details (amount, date, status, reference). If she enters a wrong amount she can edit before submitting; if the account number doesn't exist she sees a clear inline error.

**UJ-2: Check payment history.** Ananya opens *Payment History* for her account and sees a chronological list of payments with date, amount, and status. [ASSUMPTION: history is in scope of the mobile app, not just the API — the test lists the API endpoint; showing it in-app strengthens the demo.]

## 4. Functional Requirements

### 4.1 Loan Details (mobile)
- **FR-1** Enter/lookup an account number and display: Account Number, Issue Date, Interest Rate, Tenure, EMI Due.
- **FR-2** Invalid or unknown account numbers produce a clear, non-technical error state.

### 4.2 Payment (mobile)
- **FR-3** Form accepting account number + EMI amount, with amount validation (> 0, numeric).
- **FR-4** Submitting records a payment via the API and shows a confirmation acknowledgment on success (amount, date, status, reference id).
- **FR-5** Failure states (API down, validation error) surface actionable messages; no silent failures.

### 4.3 REST API (backend)
- **FR-6** `GET /customers` — loan details of all customers.
- **FR-7** `POST /payments` — make a payment; body: account number + amount. Returns created payment with status. [ASSUMPTION: payment always succeeds and is recorded with status `SUCCESS` unless validation fails; no real gateway.]
- **FR-8** `GET /payments/:account_number` — payment history for one account.
- **FR-9** Validation errors return 4xx with JSON error bodies; server errors return 5xx without stack traces.

### 4.4 Data
- **FR-10** `customers` table: Account Number (unique), Issue Date, Interest Rate, Tenure, EMI Due, plus name/outstanding balance for realism [ASSUMPTION: extra fields OK].
- **FR-11** `payments` table: Customer reference, Payment Date, Payment Amount, Status.
- **FR-12** Seeded with realistic demo customers so the app is demonstrable immediately.

## 5. Non-Functional Requirements

- **NFR-1 Responsiveness:** mobile UI usable on small (5") and large (6.7") screens.
- **NFR-2 Security:** input validation on both client and server; parameterized SQL only; DB credentials via environment variables, never committed.
- **NFR-3 Config:** API base URL is an environment variable in the app (`EXPO_PUBLIC_API_URL`), consumed at build time.
- **NFR-4 CI/CD:** GitHub Actions builds backend + mobile on every push to `main`; backend deploys to AWS EC2 automatically.
- **NFR-5 Docs:** README covers local setup (frontend + backend), CI/CD configuration, and EC2 deployment steps.
- **NFR-6 RN structure:** the mobile app demonstrably uses React Native idioms — reusable function components, a dedicated services layer for API calls (no fetch inside screens), and StyleSheet-based styling.
- **NFR-7 Query optimization:** hot paths are indexed and single-query — unique index on `customers.account_number`, composite index on `payments(customer_id, payment_date)`; history lookup is one indexed query, not N+1.

## 6. Constraints & Out of Scope

**Constraints:** single GitHub repository (monorepo, per candidate's clarification); React Native mobile (no web build); Postgres; deadline 15:30 IST today.

**Out of scope:** authentication/login, real payment gateway integration, push notifications, multi-currency, admin panel.

## 7. Open Questions

- **OQ-1:** Does the "deployed application URL" deliverable mean the backend API URL? Candidate is confirming with the team; current plan assumes yes — EC2 serves the API at `http://<elastic-ip>/api/...`.
