# Addendum — Payment Collection App (Coligo)

Technical and mechanism decisions confirmed with Harikrishnan (2026-09-15). These feed the Architecture document, not the PRD.

## Stack decisions (user-confirmed)

| Decision | Choice | Rationale |
|---|---|---|
| Mobile framework | React Native via **Expo** (managed) | React Native is the product requirement; Expo gives the fastest build loop and lets anyone run the app via Expo Go without Android Studio/Xcode |
| Monorepo | **Turborepo + pnpm workspaces**, `apps/api` + `apps/mobile` | One repo is the deliverable; Turborepo keeps API, app, and the shared contract package coherent |
| Backend | Node.js + **Express**, TypeScript | Per requirements; TypeScript for type safety and maintainability |
| Database | **Postgres 16 in Docker** on EC2 (localhost-only bind) | Requirements allow MySQL/Postgres; Docker avoids system Postgres setup on AL2023 |
| API URL injection | `EXPO_PUBLIC_API_URL` env var (Expo convention, build-time) | Requirement: the app consumes the API URL via an environment variable |
| EC2 OS | **Amazon Linux 2023** | Native `dnf` packages for nodejs22/nginx/docker; AWS-tuned |
| Serve topology | nginx :80 → `/api/` → Node (PM2, :3000); `/` → static status page | The public server URL needs a human-facing entry point; the status page doubles as API docs |
| CI/CD | GitHub Actions: lint+test+build both apps; deploy backend via SSH (rsync) | Requirements mandate GitHub Actions → EC2 |

## Rejected alternatives

- **Expo web export served on EC2** — would put a URL on React Native code, but the product is mobile-only by decision; dropped.
- **Supabase managed Postgres** — zero-ops, but self-hosted Postgres in Docker on EC2 better matches the self-contained EC2 deployment story.
- **MySQL** — equal fit; Postgres chosen for better local Docker DX and `pg` ergonomics.

## Late product decisions (2026-09-15)

| Decision | Choice | Rationale |
|---|---|---|
| Duplicate EMI guard | **One `SUCCESS` payment per account per calendar month**; a repeat attempt returns `409 EMI_ALREADY_PAID` | Without it the payment form could be resubmitted endlessly, double-counting collections — a ledger-integrity rule a real collector app needs on day one |
| APK deliverable | CI builds a **release APK** (debug-key signed) and publishes it as GitHub Release `apk-latest` on every mobile change | An installable APK is a core deliverable; GitHub Releases gives a stable public download URL with zero manual artifact handling |
| Known simplification | "Month" = calendar month of `payment_date`, not the per-loan billing cycle anchored on `issue_date` | Sufficient for the demo dataset; production would derive due-date cycles per loan and harden the check with a partial unique index to close the concurrent-insert race |
