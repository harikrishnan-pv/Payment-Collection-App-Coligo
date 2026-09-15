# Sprint Status — 2026-09-15 (single-day sprint)

Deadline: 15:30 IST. Tracker for the build; update as stories complete.

| Story | Status | Notes |
|---|---|---|
| 1.1 Turborepo scaffold | done | pnpm + turbo; shared builds before apps |
| 2.1 Schema + migrations | done | 001_init.sql; unique(account_number), (customer_id, payment_date DESC) |
| 2.2 Seed | done | 12 customers, ~30 payments |
| 2.3 GET /customers | done | |
| 2.4 POST /payments | done | atomic INSERT…SELECT, 404/400 paths |
| 2.5 GET /payments/:account_number | done | single join, newest-first |
| 2.6 Error middleware + logging + health | done | envelope; pino per-request |
| 2.7 API tests | done | 13/13 green (local docker PG) |
| 3.1 Mobile client foundation | done | services/api.ts only HTTP layer; EXPO_PUBLIC_API_URL + Expo Go host fallback |
| 3.2 Loan lookup screen | done | zod-validated input, inline errors |
| 3.3 Payment form | done | pre-filled EMI, client+server validation |
| 3.4 Confirmation screen | done | reference id, status, date, amount |
| 3.5 History screen | done | FlatList, pull-to-refresh, empty state |
| 3.6 UX polish | done | loading/disabled states, safe area, keyboard handling; Metro bundle OK |
| 4.1 CI workflow | done | committed; push pending gh `workflow` scope refresh |
| 4.2 Deploy job | done | same workflow; needs EC2 secrets |
| 4.3 nginx + landing | done | deploy/nginx + deploy/landing in repo; server provisioning pending |
| 4.4 Provisioning + smoke | done | server provisioned via SSH; pipeline run 34938735321 green; public URL verified |
| 5.1 Root README | done | all four mandated doc topics |
| 5.2 API reference | done | landing page + README §4 |
| 5.3 Product walkthrough | done | `_bmad-output/implementation-artifacts/product-walkthrough.md`; PRD addendum carries late decisions |
| 6.1 Android fixes from device testing | done | hardware back pops stack; safe-area header (react-native-safe-area-context); keyboard padding under edge-to-edge |
| 6.2 One-EMI-per-month rule | done | 409 EMI_ALREADY_PAID; tests 14/14 |
| 6.3 APK deliverable | done | build-apk.yml publishes `apk-latest` GitHub Release; API URL baked at bundle time |

**Remaining blockers:** repo visibility decision — repo was PRIVATE at last check; flip public (or add evaluator) before submitting the form.
