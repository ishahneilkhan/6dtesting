# HOSTNEIL — Agent Rules

HOSTNEIL = public marketing site + order flow + **HOSTNEIL Console** (owner-only admin) for a one-person, white-label web-hosting reseller in Bangladesh. Stack: Cloudflare Pages (Astro static) + Workers (Hono) + D1. Everything is specified in `/docs`. These rules apply to Claude Code, Cursor and any other coding agent working in this repo.

## 1. Before ANY task
1. **Read all six files in `/docs` completely, in order, before doing anything** — even for a small task:
   `docs/01_PRD.md` → `02_AppFlow.md` → `03_UI_Spec.md` → `04_TRD.md` → `05_Schema.md` → `06_Plan.md`.
2. Find the task in `docs/06_Plan.md`. Work on the **first unticked step** unless the owner names another. Do not skip ahead; phases are sequential (1 → 2 → 3 → 4).
3. If the docs contradict each other, stop and tell the owner which sections conflict. Precedence if you must proceed: data → `05_Schema`, behaviour → `02_AppFlow`, tech → `04_TRD`.

## 2. Hard rules
- **Never add a feature listed under "Out of Scope (Non-Goals)" in `docs/01_PRD.md §5`.** No VPS, domain resale, WHMCS/billing automation, payment gateways, auto-provisioning, customer accounts/passwords, ticketing, multi-admin, coupons, PDF invoices, SMS/WhatsApp APIs, reviews/uptime claims, third-party analytics. Do not scaffold or stub them either. If a request seems to need one, stop and ask.
- **Ask before changing the locked tech stack** (`04_TRD §1–3`: Cloudflare Pages/Workers/D1, Astro, Hono, Zod, jose, Resend, Turnstile, Access, exact versions) **or the schema** (`05_Schema`: tables, columns, triggers, migrations). Never edit an applied migration; new migration files only after approval. No new dependency without approval.
- **Business invariants (never bypass, never "temporarily" disable):**
  - An order is `paid` only via the verify-payment operation after an admin checks the transaction ID **and** amount equals the order total.
  - Status changes happen only in `apps/api/src/domain/lifecycle.ts`, only from admin routes or the cron jobs, always in one `DB.batch` together with an `audit_log` row.
  - **Never store, log, email or display hosting/cPanel/FTP/DB passwords or any credentials.** No password fields anywhere.
  - Customers see only their own order via Order ID + matching phone/email, through DTOs (never `SELECT *`); unknown ID and wrong contact return the identical error.
  - Admin routes require the Cloudflare Access JWT + active `admin_users` row + CSRF headers. The dev bypass works only when `ENVIRONMENT=development`.
  - Package limits/prices/payment details/templates are **data** (D1), never hard-coded in UI or code.
- **Content rules (`03_UI_Spec §1 R1–R9`):** no invented numbers, reviews, uptime, guarantees, superlatives; never claim HOSTNEIL owns servers or data centers; every string exists in Bangla and English; Latin digits; `৳` for money.
- **Security (`04_TRD §7`):** bound SQL parameters only; zod `.strict()` validation on every endpoint; no `innerHTML`/`set:html` with user or DB data; no secrets in git; logs contain no personal data; no `unsafe-inline` scripts in CSP.
- Do not invent facts you cannot verify (limits, prices, versions, legal text). Look them up, or leave a clearly marked owner TODO.

## 3. How to work
- Small, atomic changes — one plan step at a time. Match existing naming and folder structure from `04_TRD §4`.
- Mobile-first, plain CSS tokens from `03_UI_Spec` (no Tailwind/UI kits), performance budgets in `03_UI_Spec §9`.
- Before calling a step done run `npm run typecheck` and `npm test`; also satisfy the step's "Done when" condition. Do not tick a step with failing tests.
- Steps marked **(OWNER)** need the owner's dashboard action or decision: prepare exact instructions, stop, and wait. Never ask the owner to paste secrets into chat or files; secrets go through `wrangler secret put` / `.dev.vars` only.
- The owner writes in Bangla/Banglish and English; reply in the language the owner uses. Code, comments, commit messages in English.

## 4. After EVERY completed step (mandatory)
Update `docs/06_Plan.md`: change `- [ ]` to `- [x]` for that step **and append a one-line note** in the form ` — _YYYY-MM-DD: what was done / deviation_`. Never delete or reorder steps. If you changed or filled in anything the docs define (e.g. exact versions in `04_TRD §2`), update that doc in the same commit and say so in the note.

## 5. Quick reference
- Routes & screens: `02_AppFlow §1`. Status machines: `02_AppFlow §4`. API list: `04_TRD §9`. Tables/triggers/operations: `05_Schema §3, §6`. Auth flows: `05_Schema §7`.
- Commands (names fixed in `04_TRD §4`): `dev:web`, `dev:api`, `build:web`, `typecheck`, `test`, `format`, `db:migrate:local`, `db:migrate:remote`, `db:seed:admin`, `deploy:api`, `db:export`.
- Always run `npm run db:export` before `db:migrate:remote`.
