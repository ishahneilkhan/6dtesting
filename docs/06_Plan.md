# 06_Plan — Implementation Checklist

Related: [01_PRD](01_PRD.md) · [02_AppFlow](02_AppFlow.md) · [03_UI_Spec](03_UI_Spec.md) · [04_TRD](04_TRD.md) · [05_Schema](05_Schema.md)

## How to use this file (rules for the coding agent)
1. Work **top to bottom**; do not start a step until all earlier steps in its phase are ticked (phases are strictly sequential: 1 → 2 → 3 → 4).
2. After finishing a step: tick it (`- [x]`) and append a one-line note: ` — _YYYY-MM-DD: what was done / any deviation_`. Never delete or reorder steps; add new steps only after asking the owner.
3. A step is **done** only when: `npm run typecheck` and `npm test` pass (when code exists) **and** the "Done when" condition holds.
4. Steps marked **(OWNER)** need an action in a Cloudflare/Resend dashboard or a decision by the owner. Prepare exact instructions, stop, and wait.
5. Never add anything listed in [01_PRD §5]. Never change the stack ([04_TRD §1–3]) or schema ([05_Schema]) without owner approval. If a step seems to need it, stop and ask.
6. Test IDs (`T-…`) refer to the cases in Phase 4; write each test in the same step that creates the behaviour when it is obvious, and make sure all T-IDs exist by Phase 4.

---

## Phase 1 — Database & Auth

### 1A. Repository and shared code
- [ ] P1-01 Create the monorepo: `git init`, npm workspaces (`apps/api`, `apps/web`, `packages/shared`), `.nvmrc`=22, `.gitignore`, Prettier config, root scripts named in [04_TRD §4]. Install every dependency from [04_TRD §2] with `--save-exact`, commit lockfile, **fill the "Exact version" column in 04_TRD §2**. Done when: `npm ci` works from clean and no `^`/`~` exists in any package.json.
- [ ] P1-02 `packages/shared`: `enums.ts` (all enums exactly as in [05_Schema §3]), `dates.ts` (`todayDhaka`, `addDays`, `addMonthsClamped`, `computeExpiresOn`, `daysLeft`), `phone.ts` (Bangla-digit conversion, `normalizePhone`, `normalizeEmail`, `normalizeDomain`, `normalizeTrx`). Unit tests for T-DATE and phone formats. Done when: tests green.
- [ ] P1-03 `apps/api` scaffold: `wrangler.toml` per [04_TRD §4], Hono app with `GET /api/health`, `env.ts` types, vitest-pool-workers config with D1 test binding. Done when: health test passes under `npm test`.

### 1B. Cloudflare setup
- [ ] P1-04 **(OWNER)** `wrangler login`; create D1 `hostneil-db`; put `database_id` in `wrangler.toml`. Confirm domain `hostneil.com` (or the real domain → update `SITE_ORIGIN` and PRD A1) is on Cloudflare DNS. Done when: `wrangler d1 list` shows the DB.
- [ ] P1-05 **(OWNER)** Create: (a) Cloudflare Access self-hosted app for `hostneil.com/admin*` and `hostneil.com/api/admin*`, policy Allow = owner email, One-time PIN login; note the **AUD tag** and team domain; **re-confirm in the dashboard that Access is free for this use** (if not, stop: [05_Schema §7.2 step 8]); (b) Turnstile widget `hostneil-public` (hostnames `hostneil.com`, `localhost`) → site key + secret; (c) Resend account, add and verify the domain (SPF/DKIM in Cloudflare DNS), create API key. Done when: values handed to the agent *through secrets commands only*, never pasted into files.
- [ ] P1-06 Store secrets: `wrangler secret put TURNSTILE_SECRET_KEY|RESEND_API_KEY|RATE_SALT` (generate `RATE_SALT` with `openssl rand -hex 32`); fill `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD` in `wrangler.toml`; create `.dev.vars.example` and a local `.dev.vars` with the Turnstile dummy keys ([04_TRD §6]). Done when: `.dev.vars` is git-ignored and `wrangler secret list` shows the three names.

### 1C. Schema
- [ ] P1-07 Create migration files `0001_core.sql` … `0005_seed_defaults.sql` by copying the DDL/seed text from [05_Schema §3–§5] verbatim. Done when: files exist and a grep finds no table/column that is not in 05_Schema.
- [ ] P1-08 Apply locally (`npm run db:migrate:local`); write test `T-DB-1`: every table, index and trigger from 05_Schema exists; seed rows exist (settings, 3 unpublished packages, 8 templates). Done when: green.
- [ ] P1-09 Trigger/constraint tests (SQL-level, no API yet): T-INV-1 (service insert requires paid order), T-INV-2 (paid requires verified payment; amount mismatch aborts), T-INV-3 (duplicate live trx; one verified per order), T-INV-4 (forbidden transition matrix on `orders.status`), audit append-only, CHECK constraints (phone GLOB, enum values, `kind/service_id` pairing). Done when: all green.

### 1D. Auth and API plumbing
- [ ] P1-10 `middleware/errors.ts`: uniform error body ([04_TRD §9]); map D1 trigger aborts (`INVALID_TRANSITION`, `NO_VERIFIED_PAYMENT`, `AMOUNT_MISMATCH`, `ORDER_NOT_PAYABLE`, `ORDER_NOT_PAID`, `INVALID_INITIAL_STATUS`, `PAYMENT_FINAL`, `AUDIT_APPEND_ONLY`) and unique-constraint failures to codes; `bodyLimit.ts` (16 KB, JSON only → 413/415). Done when: unit tests for each mapping.
- [ ] P1-11 `lib/logger.ts` with field allow-list (no names/phones/emails/trx/tokens/bodies) and a test proving disallowed fields are dropped.
- [ ] P1-12 `middleware/requireAdmin.ts`: verify Access JWT with `jose` + remote JWKS ([05_Schema §7.2]); look up `admin_users`; dev bypass only when `ENVIRONMENT=development` + `DEV_ADMIN_EMAIL`. Tests with a locally generated key pair and a stubbed JWKS: T-AUTH-2 (valid token, no admin row → 403), T-AUTH-3 (expired), T-AUTH-4 (wrong `aud`/`iss`), T-AUTH-5 (bypass inactive when `ENVIRONMENT=production`).
- [ ] P1-13 `middleware/requireCsrf.ts` (Origin + `X-HN-Console`), admin router mounted with both middlewares, `GET /api/admin/me`. Test T-AUTH-1: enumerate all registered routes, every `/api/admin/*` returns 401 without a token; CSRF failures return 403.
- [ ] P1-14 `db:seed:admin` script that prints the `INSERT INTO admin_users` SQL for an email passed as argument; apply locally with the dev email. **(OWNER)** run the remote insert later in P1-15. Done when: `/api/admin/me` works locally in dev bypass mode.
- [ ] P1-15 **(OWNER)** Run `npm run db:export` (empty DB is fine), then `db:migrate:remote`, then insert the owner into remote `admin_users` (command printed by the script). Done when: `wrangler d1 execute hostneil-db --remote --command "select count(*) from admin_users"` returns 1.

---

## Phase 2 — Core API

### 2A. Public building blocks
- [ ] P2-01 `lib/crypto.ts` (`sha256Hex`, `ipHash(ip, RATE_SALT)`, `timingSafeEqual`) and `domain/orderCode.ts` (`HN-` + 8 Crockford base32 chars via `crypto.getRandomValues`). Tests: format, charset, uniqueness over 10 000 samples, no I/L/O/U.
- [ ] P2-02 `middleware/rateLimit.ts` using the SQL upsert in [04_TRD §7.2] and all buckets in the table there. Tests: window rollover, per-bucket limits, `Retry-After`.
- [ ] P2-03 `middleware/turnstile.ts` (siteverify via `fetch`, fail closed). Tests with a mocked fetch: success, failure → `CAPTCHA_FAILED`, network error → `CAPTCHA_UNAVAILABLE`.
- [ ] P2-04 `packages/shared/src/schemas.ts`: zod `.strict()` schemas for every request body in [04_TRD §9] using the normalisers from P1-02 and limits in [04_TRD §7.3]. Tests: valid/invalid/unknown-key/over-length/control-character cases.
- [ ] P2-05 `lib/email.ts` (Resend via `fetch`, never throws into business flow, logs id only) + email builders: customer order confirmation, owner "new order", owner "payment submitted", reminder, digest (content rules in [04_TRD §7.5]). Tests with mocked fetch.

### 2B. Public endpoints
- [ ] P2-06 `GET /api/public/packages` and `GET /api/public/settings` (DTOs, cache headers per [04_TRD §7.1], only `is_public=1` settings, only published packages, bn+en fields).
- [ ] P2-07 `POST /api/public/orders` (OP-1): check order per [04_TRD §7.2], honeypot/time-trap fake success, duplicate-pending guard without leaking the code, snapshot pricing, audit, confirmation + owner emails (best effort). Tests: T-SPAM-1…, T-DUP-1, T-PRICE-1 (unpublished package → `PACKAGE_UNAVAILABLE`), order-code collision retry.
- [ ] P2-08 `domain/dto.ts` display-status computation ([02_AppFlow §4.3]) + `POST /api/public/orders/lookup` ([05_Schema §7.3]). Tests: T-CUST-1 (unknown code and wrong contact → byte-identical response), phone/email format variants, rate limit and per-code lockout, DTO key-set snapshot (nothing extra leaks).
- [ ] P2-09 `POST /api/public/orders/:code/payments` (OP-2). Tests: duplicate trx (case/space variants), non-payable order, resubmit after rejection, wrong contact.
- [ ] P2-10 `POST /api/public/contact`. Tests: needs phone or email, URL cap, honeypot, rate limit.

### 2C. Admin: lifecycle and money
- [ ] P2-11 `domain/lifecycle.ts`: the **only** module that changes `orders.status`, `payments.status`, `services.status` (transition tables from [02_AppFlow §4]); each function builds one `DB.batch` with audit row (I6). Tests: full transition matrix (T-INV-4 at API level).
- [ ] P2-12 `POST /api/admin/payments/:id/verify` and `/reject` (OP-3, OP-4) + `GET /api/admin/payments`. Tests: T-INV-2 (mismatch 422, double verify, verify after cancel, verify a rejected payment, concurrent verify of two payments for one order → only one wins).
- [ ] P2-13 `POST /api/admin/orders/:id/provision` (OP-5) and `POST /api/admin/services/:id/activate` (OP-6). Tests: cannot provision unpaid; `expires_on` examples from [05_Schema §3.8].
- [ ] P2-14 `POST /api/admin/orders/:id/cancel` (OP-9) and `/refund` (OP-10).
- [ ] P2-15 `POST /api/admin/services/:id/renewal-order` (OP-7) and `POST /api/admin/orders/:id/apply-renewal` (OP-8). Tests: T-RENEW-1…3, T-DATE renewal cases (while expiring, after expired, applied twice).

### 2D. Admin: read/manage endpoints
- [ ] P2-16 `GET /api/admin/orders` (filters, search, pagination) and `GET /api/admin/orders/:id` (payments, service, audit timeline).
- [ ] P2-17 `GET/PATCH /api/admin/services…` (OP-11, expiry override requires `confirm:true` and writes audit).
- [ ] P2-18 `GET/PATCH /api/admin/customers…`.
- [ ] P2-19 `domain/templates.ts` (placeholder resolution, unknown-placeholder rejection) + reminders endpoints incl. `GET /api/admin/reminders/:id/whatsapp` (`wa.me` URL, URL-encoded text, phone digits only) and `mark-sent`/`skip`. Tests: Bangla text encoding round-trip.
- [ ] P2-20 Admin packages endpoints incl. `PUT /packages/:id/features` (replace list in one batch) and publish guard `PACKAGE_INCOMPLETE`. Test T-PRICE-2 (price change does not alter existing orders).
- [ ] P2-21 Admin settings and templates endpoints (validate keys, JSON for `reminder_offsets`, ranges for thresholds).
- [ ] P2-22 Admin messages endpoints.
- [ ] P2-23 `GET /api/admin/dashboard` aggregates (single batch, indexed queries).
- [ ] P2-24 `GET /api/admin/export/:table.csv` with formula-injection guard and audit row (T-CSV-1).

### 2E. Jobs and first deploy
- [ ] P2-25 `jobs/dailyState.ts` (OP-12 steps 1–6) + manual endpoint. Tests T-JOB-1…4 (idempotent, boundaries 15/16 days, `today == expires_on` stays expiring, next day expired, reminder catch-up window, unpaid auto-cancel rejects open payments).
- [ ] P2-26 `jobs/dailyNotify.ts` (steps 7–8): max 45 emails/run, failures stay `pending`, digest only counts/order codes. Tests with mocked Resend.
- [ ] P2-27 Wire `scheduled` handler by `event.cron` to the two jobs; verify with `wrangler dev --test-scheduled`.
- [ ] P2-28 **(OWNER)** `npm run deploy:api`; check route `hostneil.com/api/health`; confirm cron triggers listed in the dashboard and Workers Logs enabled. Done when: health returns `{ok:true}` in production and `/api/admin/me` returns 401 without login.

---

## Phase 3 — UI Integration

### 3A. Foundation
- [ ] P3-01 Scaffold `apps/web` (Astro static, Preact integration, i18n routing `bn` default no prefix + `en` prefix, dev proxy `/api` → 8787). Done when: `/` and `/en/` render.
- [ ] P3-02 Fonts: obtain Inter (variable) and Hind Siliguri (OFL), subset per [03_UI_Spec §3.1], place in `public/fonts`, add licence file. **(OWNER if downloads are blocked.)**
- [ ] P3-03 `tokens.css` (all tokens from [03_UI_Spec §2–5], light+dark+no-JS fallback), `base.css` (reset, typography incl. Bangla rules §3.2), `public/theme-init.js`.
- [ ] P3-04 `_headers` (security headers + CSP per [04_TRD §7.1]; solve Astro inline-script/CSP question without `unsafe-inline`), `robots.txt`.
- [ ] P3-05 `i18n/bn.json` + `en.json` (all keys used in 02_AppFlow incl. error table), `t()` helper, and `scripts/check-i18n.mjs` (fails build on a missing key or on keys present in one file only).
- [ ] P3-06 Layout `Site.astro`: skip link, Header (nav, mobile panel, LangSwitch, ThemeToggle), Footer (legal links, disclosure, contact), hreflang, theme-color, Cloudflare Web Analytics snippet (production only).
- [ ] P3-07 Components CSS + Astro/Preact pieces per [03_UI_Spec §7]: Button, Field (Input/Select/Textarea/Checkbox/Radio), Alert, Badge, Card, Skeleton, EmptyState, CopyButton, Dialog, Toast, Tabs, Stepper, Accordion, icons sprite. Dev-only `/__kitchen-sink` page (excluded from production build) showing every state in both themes and both languages.
- [ ] P3-08 `lib/api.ts` typed fetch client (timeout 15 s, JSON parse, error-code mapping to i18n keys), `lib/format.ts` (৳, dates), `lib/turnstile.ts` (lazy loader, reset helper).

### 3B. Public site
- [ ] P3-09 `PricingGrid` island (loading / loaded / empty / error states, compact + full modes) and `Pricing` page.
- [ ] P3-10 Home and Web Hosting pages (content rules R1–R9; "How ordering works" steps).
- [ ] P3-11 About and FAQ pages (content collection or i18n; required FAQ questions from [02_AppFlow §2.4]).
- [ ] P3-12 Legal pages from Markdown content collection (Terms, Privacy, Refund) in bn and en; draft text must state facts only (manual orders, payment verification before activation, reseller disclosure, data collected per [04_TRD §7.5], deletion process per [04_TRD §8]). **(OWNER)** review/approve text (PRD A10).
- [ ] P3-13 `ContactForm` island + Contact page.
- [ ] P3-14 `OrderForm` island ([02_AppFlow §2.5.1], all states) + `/order` page.
- [ ] P3-15 `PaymentForm` island + `/order/payment` page ([02_AppFlow §2.5.2], all states, copy buttons, tabs hidden when a method has no details).
- [ ] P3-16 `StatusLookup` island + `/order/status` ([02_AppFlow §2.6], stepper, next-step texts).
- [ ] P3-17 404 page, favicon/logo SVG, sitemap listing both locales, `noscript` fallbacks.

### 3C. Console
- [ ] P3-18 Console layout (`Console.astro`, sidebar/drawer, boot sequence `GET /me`, 401/403 handling, theme, search box, logout link).
- [ ] P3-19 Dashboard ([02_AppFlow §3.1]).
- [ ] P3-20 Orders list + Order detail with all dialogs (Verify with amount-typing guard, Reject, Provision, Activate, Cancel, Refund, WhatsApp template buttons) ([02_AppFlow §3.3]).
- [ ] P3-21 Payments queue.
- [ ] P3-22 Services list + detail (edit form, reminder history, renewal order button).
- [ ] P3-23 Renewals ([02_AppFlow §3.6]: WhatsApp open, Mark sent, Skip, Create renewal order, applying renewal).
- [ ] P3-24 Customers list/detail, Messages.
- [ ] P3-25 Settings: Packages editor (features rows bn/en, publish guard, preview), Payment details, Message templates (placeholder chips + preview), General.
- [ ] P3-26 Export page.

### 3D. Deploy
- [ ] P3-27 **(OWNER)** Create Pages project `hostneil-web` from the Git repo (build `npm run build -w apps/web`, output `apps/web/dist`, Node 22, env `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_SITE_ORIGIN`); attach domain `hostneil.com`; ensure Worker route and Pages domain coexist; add Redirect Rule `www → apex`.
- [ ] P3-28 **(OWNER)** In Console → Settings enter real data: WhatsApp number, support email/hours, bKash/Nagad/bank details, then create packages with **limits copied from the upstream provider's plan**, then publish. Done when: Pricing page shows real values in both languages.

---

## Phase 4 — Edge-case tests and release gate

### 4A. Automated (write any missing test; all must be green)
- [ ] P4-01 **Money invariants**: T-INV-1…4 re-run at API level; plus verify with amount ±1, string/negative/zero amount, verify when claimed ≠ total but admin types total (allowed), two admins tabs racing, verify after auto-cancel.
- [ ] P4-02 **Auth**: T-AUTH-1…5; admin endpoints with valid Access JWT of a *different* email; missing `X-HN-Console`; wrong `Origin`.
- [ ] P4-03 **Customer verification**: T-CUST-1…6 — phone formats (`017…`, `+88017…`, `8801…`, spaces/dashes, Bangla digits), email case/whitespace, order code lowercase / without `HN-`, 5 wrong tries lock the code for 15 min, valid lookup after lock, other customers' data never returned, response time of unknown vs mismatch within the same order of magnitude.
- [ ] P4-04 **Spam/abuse**: T-SPAM-1…8 — honeypot, elapsed < 3 s, Turnstile failure, 16 KB+ body, wrong content-type, unknown JSON keys, 300+/1500+ char fields, 1 000 rapid order posts from one IP (rate limit holds, D1 writes bounded), SQL-injection and `<script>` strings stored literally and rendered escaped.
- [ ] P4-05 **Dates**: T-DATE-1…8 — 31 Jan + 1 month clamp, 29 Feb leap year, 31 Dec + 12 months, activation Oct 29 2026 → `2027-10-28`, renewal while expiring / after expired / early, Dhaka midnight boundary (UTC 17:59 vs 18:01), cron "today" at 03:00 UTC.
- [ ] P4-06 **Jobs**: T-JOB-1…6 — run twice (no duplicates), boundary days, catch-up window of 3 days, > 45 reminders → remainder next run, Resend 500 → stays pending, no email address → WhatsApp row only.
- [ ] P4-07 **Packages/pricing**: T-PRICE-1…3 — unpublished package unorderable; price edit keeps old orders' totals; limits edited in Console appear on the site within the cache window; publish without features blocked.
- [ ] P4-08 **No credentials**: T-CRED-1 — grep test: no column/field/template/email body named or labelled password/credential outside warning text; UI fields list snapshot.
- [ ] P4-09 **Export/CSV**: T-CSV-1 (formula prefixing, UTF-8 BOM for Excel, Bangla names intact) and **restore drill**: `db:export` → import into fresh local D1 → run invariant queries (every `paid`+ order has a verified payment; every service has a paid origin order).

### 4B. Front-end checks (manual + scripts)
- [ ] P4-10 `scripts/check-content.mjs`: fails the build if any bn/en string or page contains banned patterns (`uptime`, `99.`, `24/7`, `guarantee`, `unlimited`, `best`, `fastest`, `#1`, `our server`, `data center`/`datacenter`, star glyphs) outside the owner-supplied policy/settings text; plus manual review against [03_UI_Spec §1 R1–R9].
- [ ] P4-11 Visual QA at 360 × 800 and 1280 × 800, **bn and en, light and dark** for every public screen and every Console screen; Bangla conjunct rendering on Chrome Android and Safari iOS; text zoom 200 %; no horizontal scroll.
- [ ] P4-12 Keyboard and screen-reader pass: skip link, focus order, dialogs trap/restore focus, form error association, toasts announced.
- [ ] P4-13 No-JS pass: marketing pages readable; forms show noscript WhatsApp fallback.
- [ ] P4-14 Performance: build-time size check against [03_UI_Spec §9] budgets; Lighthouse mobile (Slow 4G, 4× CPU) on Home, Pricing, Order — targets in [01_PRD §4]; fix regressions.
- [ ] P4-15 Failure UX: API offline, 500, Turnstile blocked (ad-blocker), slow network (3 s delay), double-click submit, back button after order creation, page reload on `/order/payment` with and without sessionStorage.

### 4C. Release gate
- [ ] P4-16 **(OWNER)** Security checklist: Access policy blocks `/admin` and `/api/admin` in a private window; response headers match [04_TRD §7.1] (check with browser devtools); no secrets in repo history (`git log -p | grep` for key prefixes); `npm audit --omit=dev` reviewed.
- [ ] P4-17 **(OWNER)** Production smoke test with a TEST order end-to-end: place order → submit fake-but-unique trx → admin verify (amount typed) → provision → activate → status page shows Active with correct expiry → create renewal order → refund test orders with note "TEST". Confirm emails/WhatsApp links work in Bangla and English.
- [ ] P4-18 **(OWNER)** First monthly export done and stored securely; Time Travel restore command rehearsed; owner knows the manual job endpoints ([04_TRD §5]).
- [ ] P4-19 **(OWNER)** Legal pages approved; real payment details verified by sending ৳1 to each; support WhatsApp number confirmed; `terms_version` set to the approval date.
- [ ] P4-20 Tag release `v1.0.0`; record in this file's notes the production URLs, cron schedule, secret rotation dates (not values), and known limitations (e.g. Resend 100/day cap).
