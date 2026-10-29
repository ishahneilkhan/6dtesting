# 04_TRD — Technical Requirements (locked stack)

Related: [01_PRD](01_PRD.md) · [02_AppFlow](02_AppFlow.md) · [03_UI_Spec](03_UI_Spec.md) · [05_Schema](05_Schema.md) · [06_Plan](06_Plan.md)
**Changing anything in §1–§3 requires the owner's explicit approval** ([CLAUDE.md]).

## 1. Platform, free-tier facts and cost decisions

Facts below were checked on **2026-10-29** against Cloudflare/Resend documentation pages (sources at the end of this section). The agent must re-check a number before relying on it for a design change.

| Capability | Free-tier fact (verified 2026-10-29) | Design consequence |
|---|---|---|
| Workers (API) | 100,000 requests/day; **10 ms CPU per request**; 50 subrequests/request; 5 Cron Triggers/account; **10 ms CPU per cron run**; 100 Workers/account | Keep handlers thin; no heavy crypto (no password hashing — [05_Schema §7.2 step 8]); two small cron jobs ([§5]) |
| D1 (database) | 5,000,000 rows read/day; 100,000 rows written/day; 5 GB account storage; **500 MB per database**; 10 databases; **Time Travel 7 days**; 100 bound params per query | Index every query path ([05_Schema §4]); batch writes; rate-limit counters cost writes ([§7.2]) |
| Pages (website) | 500 builds/month; 20,000 files/site; 25 MiB per file; Pages Functions would count against Workers quota | **No Pages Functions.** Pages serves static output only; all dynamic work is in the Worker |
| Cron Triggers | Available on Free (counted in the 5/account) | Daily jobs run on Cloudflare — **no external scheduler needed** |
| Outgoing email | Cloudflare Email Service: sending to arbitrary recipients requires **Workers Paid** (US$5/mo; 3,000 emails/mo included then US$0.35/1,000); sending to *verified destination addresses in your own account* is free | **Gap.** Customer emails cannot use Cloudflare on Free → use **Resend free** ([§3]). Chosen because it is the cheapest option that works from a Worker over plain `fetch` |
| Resend (email) | Free: 3,000 emails/month, **100/day cap**, 3 custom domains | Budget ≤ 100 emails/day (confirmation + reminders + digest). WhatsApp click-to-chat is the primary reminder channel (zero cost) |
| Turnstile | Free: unlimited challenges, 20 widgets/account, 10 hostnames/widget | Used on every public POST |
| Cloudflare Access | Free plan: up to 50 users (announced for Zero Trust Free; **re-confirm in dashboard at step P1-05**) | Admin login without writing password code |
| Cloudflare Web Analytics | Free, cookie-less | Only analytics allowed |

**Cost target:** BDT 0 recurring for Cloudflare + Resend. One-time/annual: domain name only (≈ the owner's budget of BDT 5,000 leaves room). If any free limit is exceeded, the agent must stop and report; do not silently upgrade.

**Gaps recorded (required by the brief):**
1. *Outgoing email* — missing on Cloudflare Free → **Resend free** (reason above).
2. *Scheduled jobs* — present on Free → no alternative needed.
3. *Admin password hashing* — not feasible within 10 ms CPU on Free → **Cloudflare Access** instead of passwords (reason: [05_Schema §7.2]).
4. *WhatsApp automation* — not available/needed → click-to-chat `https://wa.me/<number>?text=<encoded>` links only.

Sources: Workers limits `developers.cloudflare.com/workers/platform/limits`, D1 pricing & limits `developers.cloudflare.com/d1/platform/pricing` and `/limits`, Pages limits `developers.cloudflare.com/pages/platform/limits`, Email Service pricing `developers.cloudflare.com/email-service/platform/pricing`, Turnstile plans `developers.cloudflare.com/turnstile/plans`, Resend pricing `resend.com/pricing`, Cloudflare Teams Free announcement `blog.cloudflare.com/teams-plans`.

## 2. Locked tech stack and versions

**Version policy.** The npm registry and GitHub were not reachable while this document was written, so exact patch versions were **not guessed**. The *major line* below is locked; at step **P1-01** the agent runs `npm view <pkg> version`, installs with `--save-exact` (no `^`/`~` anywhere in any `package.json`), commits the lockfile, and fills the last column of this table in the same commit. Upgrades afterwards need owner approval.

| Layer | Package / tool | Locked line | Seen in search 2026-10-29 | Exact version (fill at P1-01) |
|---|---|---|---|---|
| Runtime (dev/CI) | Node.js | 22 LTS (`.nvmrc` = `22`) | local env v22 | `____` |
| Language | TypeScript | latest stable 5.x/6.x at P1-01; `strict: true`, `noUncheckedIndexedAccess: true` | – | `____` |
| Website | `astro` | **7.x**, `output: 'static'`, **no SSR adapter** | 7.3.1 | `____` |
| Console UI islands | `preact` + `@astrojs/preact` | preact 10.x; integration 6.x | @astrojs/preact 6.0.5 | `____` |
| API framework | `hono` | **4.x** | 4.13.13 | `____` |
| Validation | `zod` | **4.x** (shared between web and api) | 4.5.2 | `____` |
| Admin JWT verify | `jose` | latest stable at P1-01 (Web-Crypto based, Workers-compatible) | – | `____` |
| CLI / deploy | `wrangler` | **4.x** | 4.120.1 | `____` |
| Types | `@cloudflare/workers-types` or `wrangler types` output | match wrangler | – | `____` |
| Tests | `vitest` + `@cloudflare/vitest-pool-workers` | use the vitest version the pool's peer dependency requires | – | `____` |
| Formatting | `prettier` | latest stable | – | `____` |

Not used (do not add): React, Tailwind, ESLint, any UI kit/icon font, ORM (no Drizzle/Prisma — raw prepared statements in `repositories/`), CSS-in-JS, Playwright/Cypress, lodash/moment/dayjs (use small helpers in `packages/shared/src/dates.ts`), email SDKs (use `fetch`).

Platform bindings:
- **Cloudflare Pages** project `hostneil-web` (Git integration, build `npm run build -w apps/web`, output `apps/web/dist`, Node 22).
- **Cloudflare Worker** `hostneil-api` (`apps/api`), route `hostneil.com/api/*` (+ `www` redirect to apex handled by a Cloudflare Redirect Rule).
- **D1** `hostneil-db`, binding `DB`.
- **Cloudflare Access** self-hosted application covering `hostneil.com/admin*` and `hostneil.com/api/admin*`, policy "Allow: owner email".
- **Turnstile** one widget `hostneil-public` for hostnames `hostneil.com`, `localhost`.
- **Resend** domain `hostneil.com` (SPF/DKIM records in Cloudflare DNS), from address `HOSTNEIL <no-reply@hostneil.com>`.

## 3. Third-party APIs (complete list — nothing else may be called)

| Service | Endpoint | Used for | Failure behaviour |
|---|---|---|---|
| Cloudflare Turnstile | `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` | verify token on every public POST | fail **closed** → `503 CAPTCHA_UNAVAILABLE` |
| Resend | `POST https://api.resend.com/emails` (Bearer `RESEND_API_KEY`) | order confirmation, owner "new order/payment" alert, reminder emails, owner digest | best-effort; log `email.failed` with id only; never roll back business state; reminders stay `pending` and retry next run |
| Cloudflare Access JWKS | `GET https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` | admin JWT verification (cached by `jose`) | fail closed → 401 |
| WhatsApp | `https://wa.me/...` link opened by the owner's browser | manual reminders | n/a (no API call) |

No fonts/CSS/JS from third-party CDNs (fonts are self-hosted, [03_UI_Spec §3]). The only external scripts: Turnstile (`challenges.cloudflare.com`) and Cloudflare Web Analytics beacon.

## 4. Folder structure (npm workspaces monorepo)

```
hostneil/
├─ CLAUDE.md                  .cursorrules          (identical content)
├─ docs/01_PRD.md … 06_Plan.md
├─ package.json  (workspaces: apps/*, packages/*)   package-lock.json   .nvmrc   .prettierrc
├─ .gitignore  (node_modules, dist, .wrangler, .dev.vars, .env*, backups/)
├─ .github/workflows/ci.yml   (typecheck + test on PR; no deploy)
├─ packages/shared/           # imported by web and api, no runtime deps except zod
│  └─ src/ enums.ts  schemas.ts (zod)  dates.ts (todayDhaka, addMonthsClamped)  phone.ts  i18n-keys.ts  index.ts
├─ apps/api/                  # Worker "hostneil-api"
│  ├─ wrangler.toml   .dev.vars.example   tsconfig.json
│  ├─ migrations/ 0001_core.sql … 0005_seed_defaults.sql
│  ├─ src/
│  │  ├─ index.ts             # Hono app: fetch + scheduled exports
│  │  ├─ env.ts               # Bindings/Vars/Secrets types
│  │  ├─ middleware/ requireAdmin.ts  requireCsrf.ts  errors.ts  bodyLimit.ts  rateLimit.ts  turnstile.ts
│  │  ├─ routes/public/ packages.ts settings.ts orders.ts lookup.ts payments.ts contact.ts
│  │  ├─ routes/admin/  me.ts dashboard.ts orders.ts payments.ts services.ts reminders.ts customers.ts packages.ts settings.ts templates.ts messages.ts exports.ts jobs.ts
│  │  ├─ domain/ lifecycle.ts (ONLY place that changes statuses) orderCode.ts templates.ts dto.ts
│  │  ├─ repositories/ *.ts   # prepared statements; public repos return DTOs only
│  │  ├─ jobs/ dailyState.ts  dailyNotify.ts
│  │  ├─ lib/ email.ts  crypto.ts (sha256 hex, timingSafeEqual)  csv.ts  logger.ts
│  └─ test/ *.test.ts  (vitest-pool-workers; applies migrations to a test D1)
└─ apps/web/                  # Astro site + Console
   ├─ astro.config.mjs  tsconfig.json  .env.example
   ├─ scripts/ check-i18n.mjs  check-content.mjs  check-size.mjs   (run in build/CI)
   ├─ public/ fonts/ (self-hosted woff2)  theme-init.js  _headers  favicon.svg  robots.txt
   └─ src/
      ├─ i18n/ bn.json  en.json  index.ts  (t(), locale helpers)
      ├─ styles/ tokens.css  base.css  components.css  (see 03_UI_Spec)
      ├─ layouts/ Site.astro  Console.astro
      ├─ components/ (Astro, zero-JS) Header, Footer, LangSwitch, ThemeToggle, PackageCard, FaqItem, Alert …
      ├─ islands/ (Preact)  OrderForm, PaymentForm, StatusLookup, ContactForm, PricingGrid, console/*
      ├─ content/legal/ terms.bn.md terms.en.md privacy.* refund.*   (Astro content collection)
      ├─ lib/ api.ts (typed fetch + error mapping)  format.ts  turnstile.ts
      └─ pages/
         ├─ index.astro  web-hosting.astro  pricing.astro  about.astro  contact.astro  faq.astro
         ├─ terms.astro  privacy.astro  refund-policy.astro  order.astro  404.astro
         ├─ order/payment.astro  order/status.astro
         ├─ en/ (mirror of all of the above)
         └─ admin/ index.astro orders/index.astro orders/detail.astro payments.astro services/index.astro services/detail.astro renewals.astro customers/index.astro customers/detail.astro messages.astro settings/{packages,payment,templates,general}.astro export.astro
```
Admin pages use query strings for ids (`/admin/orders/detail?id=12`) because the site is fully static.

Root scripts (names are fixed so the plan and CLAUDE.md can reference them):
`dev:web` · `dev:api` (`wrangler dev --port 8787 --persist-to .wrangler/state`) · `build:web` · `typecheck` (tsc + `astro check`) · `test` · `format` · `db:migrate:local` · `db:migrate:remote` · `db:seed:admin` (prints the SQL for inserting the owner; run manually) · `deploy:api` · `db:export` (`wrangler d1 export hostneil-db --remote --output backups/…`).
Dev proxy: Astro `vite.server.proxy['/api'] → http://127.0.0.1:8787`.

`apps/api/wrangler.toml` (keys the agent must create; values in angle brackets are filled at setup):
```toml
name = "hostneil-api"
main = "src/index.ts"
compatibility_date = "<date of P1-01>"
[[d1_databases]]
binding = "DB"
database_name = "hostneil-db"
database_id = "<from wrangler d1 create>"
migrations_dir = "migrations"
[triggers]
crons = ["0 3 * * *", "10 3 * * *"]          # 09:00 and 09:10 Asia/Dhaka
[[routes]]
pattern = "hostneil.com/api/*"
zone_name = "hostneil.com"
[vars]
ENVIRONMENT = "production"
SITE_ORIGIN = "https://hostneil.com"
CF_ACCESS_TEAM_DOMAIN = "<team>.cloudflareaccess.com"
CF_ACCESS_AUD = "<application AUD tag>"
MAIL_FROM = "HOSTNEIL <no-reply@hostneil.com>"
[observability]
enabled = true
```

## 5. Scheduled jobs (Cron Triggers)

| Cron (UTC) | Dhaka | Handler | Does ([05_Schema §6 OP-12]) | Budget |
|---|---|---|---|---|
| `0 3 * * *` | 09:00 | `jobs/dailyState.ts` | steps 1–6: auto-cancel stale unpaid orders, recompute service statuses, create due reminders, purge old rows | ≤ 8 SQL statements in one `batch`, no network → fits 10 ms CPU |
| `10 3 * * *` | 09:10 | `jobs/dailyNotify.ts` | steps 7–8: send pending email reminders, send owner digest | 1 read batch + ≤ 100 Resend calls (I/O wait is not CPU; subrequest cap 50 ⇒ **max 45 emails per run**, remainder stays `pending` for the next run) |

Both jobs are idempotent (safe to run twice) and also exposed to the owner as `POST /api/admin/jobs/daily-state|daily-notify` for recovery/testing. If logs show CPU-limit errors, split further (3 of 5 cron slots remain) — do not upgrade the plan without approval.

## 6. Configuration and secrets

| Name | Kind | Where | Notes |
|---|---|---|---|
| `SITE_ORIGIN`, `ENVIRONMENT`, `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `MAIL_FROM` | var | `wrangler.toml` | not secret |
| `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `RATE_SALT` (32 random bytes hex) | **secret** | `wrangler secret put` (prod), `.dev.vars` (local) | never in git, logs, or responses |
| `DEV_ADMIN_EMAIL` | local var | `.dev.vars` only | honoured only when `ENVIRONMENT=development` |
| `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_SITE_ORIGIN` | build var | Pages project env / `apps/web/.env` | public by design |

Local dev uses Cloudflare's documented Turnstile dummy keys (always-pass site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`). Commit only `*.example` files. Rotating a secret = `wrangler secret put` again + redeploy; document dates in [06_Plan] notes, never the values.

## 7. Security constraints

### 7.1 Transport and headers
HTTPS only (Cloudflare "Always Use HTTPS" + HSTS). `apps/web/public/_headers`:
- All paths: `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, `X-Frame-Options: DENY`.
- CSP: `default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://cloudflareinsights.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'`. **No `'unsafe-inline'` for scripts.** If Astro island hydration emits inline scripts, use the build-time CSP hash support of the locked Astro version (or move to external scripts) — do not loosen `script-src`.
- `/admin/*`: `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`. `robots.txt` disallows `/admin` and `/api`.
- API: JSON only, `Cache-Control: no-store` except the three cacheable public GETs (`public, max-age=60, s-maxage=300`). No CORS headers (same origin).

### 7.2 Rate limiting and spam protection (public endpoints)
Fixed-window counters in D1 `rate_limits` (key = `<bucket>:<sha256(CF-Connecting-IP + RATE_SALT)[0..16]>` or `<bucket>:<order_code>`). Upsert: `INSERT INTO rate_limits(key,window_start,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN window_start < ? THEN 1 ELSE count + 1 END, window_start = CASE WHEN window_start < ? THEN ? ELSE window_start END RETURNING count, window_start`. Over limit → `429 RATE_LIMITED` + `Retry-After`.

| Bucket | Limit | Window |
|---|---|---|
| `order:ip` | 3 | 10 min |
| `order:ip:day` | 10 | 24 h |
| `contact:ip` | 3 | 60 min |
| `contact:ip:day` | 10 | 24 h |
| `lookup:ip` | 10 | 15 min |
| `lookup:code` (failed attempts only) | 5 | 15 min |
| `pay:ip` | 10 | 60 min |
| `pay:code` | 5 | 60 min |

Order of checks on every public POST: body size/content-type → zod validation → honeypot/time-trap → rate limit → Turnstile → business logic. Cheap checks first so floods cost little CPU/D1.
Spam layers on **Order Form** and **Contact**: (1) Turnstile (managed mode); (2) hidden honeypot field `website` (must be empty → else return a fake `201`/`200` and store nothing); (3) minimum fill time 3 s (`elapsed_ms ≥ 3000`, soft check, same fake success); (4) D1 rate limits above; (5) duplicate guard: same `contact_phone_norm` + package with an open `pending_payment` order in the last 24 h → `409 DUPLICATE_PENDING_ORDER` **without revealing the existing Order ID**; (6) contact message ≤ 2 URLs. Optional outer layer: one Cloudflare WAF rate-limiting rule on `/api/public/*` (if available on the zone's plan).
IP handling: raw IPs are never stored; only truncated salted hashes (`ip_hash` 16 hex chars).

### 7.3 Input validation
- Every endpoint parses with a zod schema from `packages/shared`; unknown keys are rejected (`.strict()`); on failure return `400 VALIDATION_FAILED` with per-field codes (not echoing raw input).
- `Content-Type: application/json` required; max body **16 KB** (reject on `Content-Length` and while streaming).
- Normalisers (Bangla digits `০-৯` are first converted to `0-9`): phone regex `^(?:\+?88)?01[3-9][0-9]{8}$` after removing spaces/dashes → `+8801XXXXXXXXX`; email lowercase ≤ 254; domain lowercase, strip scheme/`www.`/path, regex `^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$` (punycode `xn--` allowed); text fields trimmed, control characters and zero-width characters removed, newlines allowed only in note/message; trx ID `^[A-Za-z0-9]{6,40}$`; amount integer 1–10,000,000; ids integer.
- SQL: prepared statements with bound parameters only; table/column names are literals in code.
- Output: Astro/Preact escape by default; **`set:html`, `innerHTML`, `dangerouslySetInnerHTML` are forbidden** for any data that originates from a user or the database (legal Markdown from the repo is the only allowed use via the content-collection renderer).
- CSV export: cells starting with `=`, `+`, `-`, `@`, tab or CR are prefixed with `'` (formula-injection guard).

### 7.4 Authentication / authorization
Defined in [05_Schema §7]. Summary: Cloudflare Access at the edge **and** JWT + `admin_users` check in the Worker (defence in depth); CSRF guard on admin mutations; customers verified per request by Order ID + contact; uniform `NOT_FOUND_OR_MISMATCH` error; no customer sessions.

### 7.5 Credentials, secrets and personal data
- **No hosting credentials anywhere** (DB, logs, emails, templates, notes). Owner sends credentials privately outside the app. UI shows a warning near free-text fields ([03_UI_Spec §1 R6]).
- Personal data stored: name, phone, optional email, optional domain, optional note, salted IP hash, payment trx metadata. Nothing else (no user agent, no raw IP, no device fingerprint).
- Logs (`console.log` → Workers Logs) contain request id, route, status, duration, entity ids — **never** names, phones, emails, trx IDs, tokens or bodies. `lib/logger.ts` is the only logger and has an allow-list of fields.
- Admin audit rows never contain secrets or contact data ([05_Schema §3.13]).
- Emails to customers contain order code, package, total, status text only. The owner digest contains counts and order codes/domains, not phone numbers.
- Secrets only in Cloudflare secrets/`.dev.vars`; a CI step greps the repo for `RESEND_API_KEY=`/`re_`-style tokens and fails on a match.
- Dependency hygiene: lockfile committed; `npm audit --omit=dev` run in CI (report-only); no postinstall scripts from unknown packages.

## 8. Data protection, retention, backups

- **Retention (assumption A11):** orders, payments, services, customers, audit log kept 5 years; `contact_messages` archived > 365 days are purged by the cron; `rate_limits` > 1 day purged.
- **Deletion/anonymisation on request (manual, no UI in MVP):** run SQL that sets `customers.name='Deleted customer'`, `phone_norm='+88013'||printf('%08d', id)` (satisfies the CHECK), `email_norm=NULL`, and for each order of that customer `contact_phone_norm='anonymised'`, `contact_email_norm=NULL`, `domain_name=NULL`, `customer_note=NULL`; financial rows stay. Record the action in `audit_log` (`entity_type='customer'`). The Privacy Policy must describe this process.
- **Backups (layered):**
  1. D1 **Time Travel** (7 days on Free) for operator mistakes: `wrangler d1 time-travel info|restore hostneil-db`.
  2. **Monthly full export** by the owner: `npm run db:export` → `backups/hostneil-YYYY-MM-DD.sql` (git-ignored), then copy to an encrypted archive stored off the laptop (e.g. encrypted zip on the owner's private cloud drive). Never commit or email it.
  3. **Console CSV export** (`/admin/export`) of orders, payments, services, customers, reminders — also a spreadsheet-friendly record for the accountant. Each export writes an `audit_log` row (`export`).
  4. **Restore drill** performed once before launch ([06_Plan P4]): import the SQL into a fresh local D1 and run the invariant queries.
- Migrations run on remote only after passing locally; before every remote migration run `npm run db:export`.

## 9. API surface (all under `/api`, JSON, UTF-8)

Error body (all errors): `{"error":{"code":"VALIDATION_FAILED","message":"<safe English text>","fields":{"phone":"invalid"}}}`; the web app maps `code` → localized text ([02_AppFlow §5]).
Error codes: `VALIDATION_FAILED 400` · `CAPTCHA_FAILED 400` · `CAPTCHA_UNAVAILABLE 503` · `RATE_LIMITED 429` · `NOT_FOUND_OR_MISMATCH 404` · `NOT_FOUND 404` (admin only) · `UNAUTHENTICATED 401` · `FORBIDDEN 403` · `PACKAGE_UNAVAILABLE 409` · `PACKAGE_INCOMPLETE 422` · `DUPLICATE_PENDING_ORDER 409` · `DUPLICATE_TRX 409` · `ORDER_NOT_PAYABLE 409` · `INVALID_TRANSITION 409` · `AMOUNT_MISMATCH 422` · `NO_VERIFIED_PAYMENT 409` · `PAYLOAD_TOO_LARGE 413` · `UNSUPPORTED_MEDIA_TYPE 415` · `INTERNAL 500`.
D1 trigger aborts (`RAISE(ABORT,'<CODE>')`) are caught in `middleware/errors.ts` and mapped to the same codes.

### Public (anonymous / customer-verified)
| Method & path | Body → Result | Notes |
|---|---|---|
| `GET /api/health` | → `{ok:true}` | no DB call |
| `GET /api/public/packages` | → published packages with features, bn+en | cacheable |
| `GET /api/public/settings` | → public settings map | cacheable |
| `POST /api/public/orders` | `{package_slug,name,phone,email?,domain?,note?,lang,consent:true,terms_version,turnstile_token,website,elapsed_ms}` → `201 {order_code,total_bdt,status:"pending_payment"}` | OP-1; sends confirmation email if email |
| `POST /api/public/orders/lookup` | `{order_code,contact,turnstile_token}` → status DTO | [05_Schema §7.3] |
| `POST /api/public/orders/:code/payments` | `{contact,method,trx_id,sender_account,amount_bdt,turnstile_token}` → `201 {payment_state:"submitted"}` | OP-2; alerts owner |
| `POST /api/public/contact` | `{name,phone?,email?,message,lang,turnstile_token,website,elapsed_ms}` → `201` | at least one of phone/email |

### Admin (`requireAdmin` + `requireCsrf`)
| Method & path | Purpose (operation in [05_Schema §6]) |
|---|---|
| `GET /api/admin/me` | current admin |
| `GET /api/admin/dashboard` | counts + lists for [02_AppFlow §3.1] |
| `GET /api/admin/orders?status&kind&q&page` · `GET /api/admin/orders/:id` | list/detail (with payments, service, audit) |
| `POST /api/admin/orders/:id/cancel` `{reason}` | OP-9 |
| `POST /api/admin/orders/:id/refund` `{note}` | OP-10 |
| `POST /api/admin/orders/:id/provision` `{upstream_provider,upstream_ref?,domain_name?}` | OP-5 |
| `POST /api/admin/orders/:id/apply-renewal` | OP-8 |
| `GET /api/admin/payments?status` · `POST /api/admin/payments/:id/verify` `{verified_amount_bdt}` · `POST /api/admin/payments/:id/reject` `{reason}` | OP-3 / OP-4 |
| `GET /api/admin/services?status&q&page` · `GET /api/admin/services/:id` · `PATCH /api/admin/services/:id` · `POST /api/admin/services/:id/activate` · `POST /api/admin/services/:id/renewal-order` `{package_id?}` | OP-6, OP-11, OP-7 |
| `GET /api/admin/reminders?status` · `GET /api/admin/reminders/:id/whatsapp` → `{text,url}` · `POST /api/admin/reminders/:id/mark-sent` · `POST /api/admin/reminders/:id/skip` | renewals queue |
| `GET /api/admin/customers?q&page` · `GET /api/admin/customers/:id` · `PATCH /api/admin/customers/:id` `{admin_note?,preferred_lang?}` | customers |
| `GET/POST /api/admin/packages` · `PATCH /api/admin/packages/:id` · `PUT /api/admin/packages/:id/features` (replace whole list) | packages & limits |
| `GET/PUT /api/admin/settings` · `GET /api/admin/templates` · `PUT /api/admin/templates/:key/:lang` | settings & templates |
| `GET /api/admin/messages` · `PATCH /api/admin/messages/:id` `{status}` | contact messages |
| `GET /api/admin/export/:table.csv` (`orders|payments|services|customers|reminders`) | CSV |
| `POST /api/admin/jobs/daily-state` · `POST /api/admin/jobs/daily-notify` | manual job run |

There is intentionally **no** endpoint that accepts a password/credential field.

## 10. Quality gates

- `npm run typecheck` and `npm test` must pass before a plan step is ticked.
- Tests: unit (dates, phone, order code, zod schemas, lifecycle table), integration on a real local D1 via `@cloudflare/vitest-pool-workers` (migrations applied; triggers exercised), and the edge-case list in [06_Plan Phase 4].
- Performance budgets and Lighthouse targets: [03_UI_Spec §9] and [01_PRD §4].
- Accessibility: WCAG 2.2 AA contrast (palette precomputed in [03_UI_Spec §2]), visible focus, 44 px touch targets, labelled inputs.
