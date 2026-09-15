# Addendum — Payment Collection App (Coligo)

Technical and mechanism decisions confirmed with Harikrishnan (2026-09-15). These feed the Architecture document, not the PRD.

## Stack decisions (user-confirmed)

| Decision | Choice | Rationale |
|---|---|---|
| Mobile framework | React Native via **Expo** (managed) | Test mandates React Native; Expo gives fastest build + Expo Go demo without Android Studio/Xcode on the evaluator side |
| Monorepo | **Turborepo + pnpm workspaces**, `apps/api` + `apps/mobile` | Assignment form takes ONE repo link; Turborepo structures it credibly |
| Backend | Node.js + **Express**, TypeScript | Mandated; TS for code-quality grade |
| Database | **Postgres 16 in Docker** on EC2 (localhost-only bind) | Mandated choice of MySQL/Postgres; Docker avoids system Postgres setup on AL2023 |
| API URL injection | `EXPO_PUBLIC_API_URL` env var (Expo convention, build-time) | Test explicitly checks the frontend consumes API URL via environment variable |
| EC2 OS | **Amazon Linux 2023** | Already selected; native `dnf` packages for nodejs20/nginx/docker; AWS-tuned |
| Serve topology | nginx :80 → `/api/` → Node (PM2, :3000); `/` → static status page | Server URL deliverable; status page gives evaluators a landing page + API docs |
| CI/CD | GitHub Actions: lint+test+build both apps; deploy backend via SSH (appleboy/ssh-action or rsync) | Test mandates GitHub Actions → EC2 |

## Test-document quirks recorded

- The CI/CD section says "Build the **Angular** frontend" — confirmed by candidate as a copy-paste error; frontend is React Native mobile only.
- "Deployed application URL on AWS" — for a mobile app, interpreted as the **server/API URL** (candidate confirming with team, OQ-1 in PRD).
- Original text also says "two separate GitHub repositories" — candidate confirmed the submission form accepts **one** repo; monorepo it is (documented in README).

## Rejected alternatives

- **Expo web export served on EC2** — reconciles "URL" + "React Native" elegantly, but candidate confirmed mobile-only intent; dropped.
- **Supabase managed Postgres** — zero-ops, but self-hosted Postgres in Docker on EC2 better matches the test's deployment story and shows more DevOps skill.
- **MySQL** — equal fit; Postgres chosen for better local Docker DX and `pg` ergonomics.

## Late product decisions (2026-09-15, pre-submission)

| Decision | Choice | Rationale |
|---|---|---|
| Duplicate EMI guard | **One `SUCCESS` payment per account per calendar month**; a repeat attempt returns `409 EMI_ALREADY_PAID` | Without it the payment form could be resubmitted endlessly, double-counting collections — a ledger-integrity rule a real collector app needs on day one |
| APK deliverable | CI builds a **release APK** (debug-key signed) and publishes it as GitHub Release `apk-latest` on every mobile change | The machine-test response form requires an APK link; GitHub Releases gives a stable public URL with zero manual artifact handling |
| Known simplification | "Month" = calendar month of `payment_date`, not the per-loan billing cycle anchored on `issue_date` | Sufficient for the demo dataset; production would derive due-date cycles per loan and harden the check with a partial unique index to close the concurrent-insert race |
