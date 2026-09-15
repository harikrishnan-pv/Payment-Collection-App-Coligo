# Product Walkthrough — Coligo Payment Collection

*The "what is this product and why is it shaped this way" narrative, written for evaluators and for the record. Companion to the PRD in `../planning-artifacts/prds/`.*

## What the product is

**Coligo** is a self-service EMI payment app for personal-loan customers. A customer types the account number printed on their loan statement, sees their loan at a glance — issue date, interest rate, tenure, EMI due — pays this month's EMI in two taps, and gets an unmistakable acknowledgment with a payment reference they can keep. The collections team gets a clean, append-only payment ledger instead of phone calls and bank-statement reconciliation.

## Who it serves, and what job it does

| User | Job to be done |
|---|---|
| Loan customer | "How much do I owe this month, and can I just pay it now?" — without calling the branch |
| Collections operator (indirect) | Every payment recorded once, atomically, with timestamp + reference; history queryable per account |

The scope is deliberately the **payment moment**, not a full banking app: no login, no loan origination, no statements. That matches the hiring test's mandate (loan details + payment + acknowledgment + history) and keeps each included feature genuinely finished.

## The 60-second evaluator tour

1. Install the APK from the repo's Releases page (API URL baked in at build time — nothing to configure).
2. Enter demo account `ACC-100234` → loan details screen (all four mandated fields).
3. **Pay EMI** → amount pre-filled with the due EMI → confirm.
4. Acknowledgment screen: amount, timestamp, `SUCCESS`, UUID payment reference.
5. **Payment history** on the details screen: newest-first, pull-to-refresh.
6. Cross-check the server ledger: `curl http://52.62.107.240/api/payments/ACC-100234`.

The API landing page at `http://52.62.107.240/` documents every endpoint with copy-paste curls for keyboard-only evaluation.

## What shipped vs. what didn't

| Shipped (done) | Deliberately out (deferred) |
|---|---|
| Loan lookup by account number (all mandated fields) | Customer authentication / KYC |
| EMI payment + confirmation acknowledgment | Real payment gateway (ledger records `SUCCESS` directly) |
| Newest-first payment history per account | Per-loan billing-cycle engine (calendar-month rule ships instead) |
| One-EMI-per-month ledger guard (`409 EMI_ALREADY_PAID`) | Statements, prepayment/part-payment flows |
| CI/CD: test → deploy API to EC2; build → publish APK | HTTPS, rate limiting, observability stack |

## Product decisions worth noticing

1. **Mobile-only, one repo.** The test PDF's "Angular" and "two repos" lines were confirmed copy-paste errors; the addendum records that reconciliation instead of silently ignoring it.
2. **Shared contract package.** `packages/shared` owns every DTO as a zod schema, used by both API and app — the client validates with the same rules the server enforces, so form errors agree with API errors.
3. **Insert-only payment ledger.** Payments are never updated or deleted (AD-4): history is audit-grade by construction, and "payment failed" is a status row, not a mutation.
4. **One EMI per month.** A payment form without a double-payment guard double-counts collections; `POST /payments` now rejects a second `SUCCESS` payment for the same account in the same month with a human-readable 409. Simplification: calendar month, not per-loan cycle (see addendum).
5. **Errors are a contract.** Every failure — validation, unknown account, duplicate EMI, malformed JSON — leaves as `{"error":{"code","message"}}`; the app surfaces exactly that message.
6. **The API URL is an environment concern.** `EXPO_PUBLIC_API_URL` at build time, per the test's explicit requirement; dev mode additionally auto-resolves to whichever machine serves the bundle.
7. **Everything a stranger needs is in-repo:** README (setup → local run → CI/CD → EC2), landing page (live API docs), PRD/architecture/epics (process evidence), and an APK that just works on install.

## Where it would go next (production backlog, in order)

1. Auth (OTP to registered mobile) so accounts aren't guessable via account number.
2. Real gateway integration with webhook-driven status (`PENDING` → `SUCCESS/FAILED` rows in the same ledger).
3. Per-loan billing cycles + partial payments + prepayment, replacing the calendar-month rule.
4. HTTPS + rate limiting + structured observability before public exposure.
