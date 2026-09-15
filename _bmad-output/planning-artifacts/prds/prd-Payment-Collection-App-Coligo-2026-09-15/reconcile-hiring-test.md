# Reconcile: Hiring Test Requirements vs PRD + Addendum

Date: 2026-09-15
Sources reviewed:

- Test doc (verbatim): `_bmad-output/input/hiring-test-requirements.md`
- PRD: `_bmad-output/planning-artifacts/prds/prd-Payment-Collection-App-Coligo-2026-09-15/prd.md`
- Addendum: `_bmad-output/planning-artifacts/prds/prd-Payment-Collection-App-Coligo-2026-09-15/addendum.md`

Method: every explicit requirement, endpoint, field, documentation topic, CI/CD item, and evaluation criterion in the test doc was mapped to PRD FRs/NFRs/metrics and addendum decisions. Statuses: COVERED / WEAK / MISSING.

---

## A) Coverage matrix and gaps

### 1. Frontend (test §1)

| Test requirement | PRD/Addendum mapping | Status |
|---|---|---|
| Responsive UI | NFR-1 (5"–6.7" screens); UJ-1/UJ-2 | COVERED |
| Display Account Number, Issue Date, Interest Rate, Tenure, EMI Due | FR-1 lists all five verbatim | COVERED |
| Form: enter account number | FR-1, FR-3, UJ-1 | COVERED |
| Form: enter EMI amount | FR-3 (validation > 0, numeric) | COVERED |
| Submit the payment | FR-4 | COVERED |
| Confirmation acknowledgment on success | FR-4 (amount, date, status, reference id) | COVERED |

No frontend functional gaps. (Payment-history display is not a test §1 requirement; UJ-2 adds it in-app anyway — additive, no issue.)

### 2. Backend API (test §2)

| Test requirement | Mapping | Status |
|---|---|---|
| `GET /customers` — loan details of all customers | FR-6 | COVERED |
| `POST /payments` — make a payment | FR-7 (body: account number + amount; returns created payment with status) | COVERED |
| `GET /payments/:account_number` — payment history | FR-8 | COVERED |
| Node.js with Express.js | PRD Prologue/§1 says Node.js API; **Express appears only in the addendum stack table**, which self-declares "These feed the Architecture document, not the PRD." | WEAK (minor) |
| MySQL or Postgres | Postgres (PRD §6 Constraints; addendum) | COVERED |

Minor: since the addendum disclaims itself as architecture-feed, the Express mandate technically lives outside the PRD. Non-blocking — it is written down and traceable; recommend a one-word addition to PRD §6 Constraints ("Express") for airtight traceability.

### 3. Database schema (test §3)

| Test field | Mapping | Status |
|---|---|---|
| `customers`: Account Number | FR-10 (unique) | COVERED |
| `customers`: Issue Date | FR-10 | COVERED |
| `customers`: Interest Rate | FR-10 | COVERED |
| `customers`: Tenure | FR-10 | COVERED |
| `customers`: EMI Due | FR-10 | COVERED |
| `payments`: Customer ID | FR-11 "Customer reference" | COVERED (equivalent wording) |
| `payments`: Payment Date | FR-11 | COVERED |
| `payments`: Payment Amount | FR-11 | COVERED |
| `payments`: Status | FR-11 | COVERED |

All schema fields represented. `payments.customer_id` as FK to `customers` is implied by "Customer reference" but not stated; acceptable at PRD level (architecture concern), noted only for completeness.

### 4. CI/CD and deployment (test §4)

| Test requirement | Mapping | Status |
|---|---|---|
| Two repos → one (candidate clarification) | PRD §6 Constraints; addendum quirks | COVERED (documented clarification) |
| CI/CD pipeline (GitHub Actions or other) | NFR-4; addendum CI/CD row | COVERED |
| Build the frontend (test typo "Angular" → React Native) | NFR-4 "builds backend + mobile"; addendum quirk log | COVERED (documented clarification) |
| Build the Node.js backend | NFR-4 | COVERED |
| Deploy to AWS EC2 | NFR-4 (automatic deploy); addendum topology | COVERED |
| Backend API integrated with frontend via env var for API URL | NFR-3 `EXPO_PUBLIC_API_URL`; addendum "Test explicitly checks the frontend consumes API URL via environment variable" | COVERED |

No CI/CD gaps. The env-var API URL integration — including the build-time consumption detail — is explicitly represented in both documents.

### 5. Documentation (test §5) — four topics

| Test topic | Mapping | Status |
|---|---|---|
| 1. Project setup steps | NFR-5 "local setup (frontend + backend)" — merged with topic 2 | WEAK |
| 2. How to run frontend and backend locally | NFR-5; Success metric "clone → running locally ≤ 10 min using README only" | COVERED |
| 3. CI/CD pipeline configuration | NFR-5 | COVERED |
| 4. Deployment steps on AWS EC2 | NFR-5 | COVERED |

Weak: topics 1 and 2 collapse into one NFR bullet ("local setup"). A grader ticking four boxes will find the content but not the four-part structure. Non-blocking; recommend splitting NFR-5 into four explicit bullets mirroring the test's list.

### 6. Evaluation criteria (test, 5 areas)

| Criterion | Mapping | Status |
|---|---|---|
| Frontend: responsiveness and UX | NFR-1; UJ-1/UJ-2; FR-2/FR-5 error states | COVERED |
| Frontend: "proper use of React Native features (components, services, etc.)" | **Nothing in PRD or addendum.** PRD §2 has only the circular metric "All 5 graded areas demonstrably satisfied." No requirement for mobile code structure (reusable components, services/API layer, navigation) anywhere. | **MISSING (blocking)** |
| Backend: API functionality and correctness | FR-6–FR-9; p95 latency metric | COVERED |
| Backend: secure and clean code | NFR-2 (parameterized SQL, env credentials, validation); addendum TypeScript "for code-quality grade" | COVERED |
| Database: schema design | FR-10–FR-12, unique account number, seed data | COVERED |
| Database: query optimization | Only indirect: p95 < 500 ms metric. No requirement for indexes on the hot paths (`payments` by customer/account; `customers` by account number beyond the unique constraint). | WEAK |
| CI/CD: proper pipeline setup and deployment | NFR-4; addendum CI/CD row | COVERED |
| Documentation: clarity, completeness, ease of use | NFR-5; README-length counter-metric; cold-start metric | COVERED |

### 7. Deliverables (test)

| Deliverable | Mapping | Status |
|---|---|---|
| Repo link(s) → one monorepo link | PRD §6 Constraints; addendum | COVERED |
| Deployed application URL on AWS | OQ-1 (open, with working assumption: EC2 API URL); addendum interpretation + nginx status page | COVERED as documented open question with a plan |

---

## B) Contradictions

None found. Specifically checked and cleared:

- **Monorepo vs "two separate repositories"** — documented candidate clarification (addendum + PRD §6). Excluded per review instructions; consistent across both docs.
- **"Angular" frontend** — documented as test typo; PRD consistently says React Native/Expo. Excluded; consistent.
- **"Deployed application URL"** — interpreted as backend/server URL, logged as OQ-1 and in the addendum. Excluded; consistent.
- **FR-7 assumption (payment always `SUCCESS`, no real gateway)** — the test does not mandate a real payment gateway; recording a Status field is satisfied. This is a labeled assumption, not a contradiction, and "real payment gateway" is explicitly out of scope in PRD §6. Acceptable; recommend restating it in the README for the grader's benefit.
- **UJ-2 in-app payment history** — additive beyond test §1; does not contradict anything.
- **Extra `customers` fields (name, outstanding balance)** — labeled assumption; the test's field list is a minimum, not a prohibition.

No PRD statement conflicts with the test doc once the three documented clarifications are applied.

---

## C) Verdict

**FAIL** — narrowly. All functional requirements, all three API endpoints, every loan-detail and schema field, all CI/CD items (including the env-var API URL integration), and documentation substance are represented. Two evaluation-criterion sub-items are not, and the verdict rule requires every graded item to be represented:

**Blocking gaps (both are small PRD edits, no rework of the plan):**

1. **MISSING — "proper use of React Native features (components, services, etc.)"** (Evaluation criterion 1, second half). Zero representation in PRD or addendum. Fix: add an NFR/quality requirement that the mobile app be structured with reusable components and a dedicated services/API layer (e.g., `services/api.ts` consuming `EXPO_PUBLIC_API_URL`), and/or decompose the §2 success metric "All 5 graded areas demonstrably satisfied" into per-area checks so this one is visible.
2. **WEAK — "query optimization"** (Evaluation criterion 3, second half). Only the p95 < 500 ms metric represents it. Fix: add an NFR requiring indexes on `customers.account_number` (unique) and `payments.customer_id`, and parameterized queries on the two hot lookups.

**Non-blocking recommendations:**

- Split NFR-5 into four bullets mirroring the test's four documentation topics (setup steps / run locally / CI/CD config / EC2 deployment) so the grader's checklist maps 1:1.
- Add "Express" to PRD §6 Constraints so the framework mandate is PRD-resident, not only in the addendum (which disclaims itself as architecture-feed).
- State the FK relationship `payments.customer_id → customers` explicitly in FR-11.

With items 1 and 2 addressed, this PRD/addendum pair is a PASS: a grader mapping the test doc to the PRD would find every graded item represented.
