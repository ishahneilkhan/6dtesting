# 05_Schema — D1 Database, Invariants, Auth/Authorization

Related: [01_PRD](01_PRD.md) · [02_AppFlow §4](02_AppFlow.md) (status machine) · [04_TRD](04_TRD.md) · [06_Plan](06_Plan.md)

## 1. Conventions

- Engine: **Cloudflare D1 (SQLite)**. Database name `hostneil-db`, binding `DB`. D1 has no Row-Level Security; **all authorization is enforced in the Worker** ([§7]) and the most dangerous invariants are *also* enforced by SQL triggers ([§3.14]) as a second wall.
- Primary keys: `id INTEGER PRIMARY KEY` (rowid alias). Public identifiers are separate (`orders.order_code`). Never expose `id` of orders/customers/payments to anonymous users.
- Money: `INTEGER` BDT, no decimals. Names end with `_bdt`.
- Timestamps: `TEXT` ISO-8601 UTC, default `strftime('%Y-%m-%dT%H:%M:%fZ','now')`. Names end with `_at`.
- Business dates: `TEXT` `YYYY-MM-DD` in **Asia/Dhaka** (UTC+6, no DST). Names end with `_on`. "Today" is computed in the Worker with `todayDhaka()`; SQL that needs today receives it as a bound parameter `:today` (never `date('now')`).
- Booleans: `INTEGER` 0/1 with `CHECK`.
- Enums: `TEXT` + `CHECK (... IN (...))`. The same value lists live in `packages/shared/src/enums.ts` and must match this file exactly.
- Text normalisation (done in Worker before insert): phone → `+8801XXXXXXXXX` (`phone_norm`); email → lowercase trimmed (`email_norm`); trx ID → uppercase, spaces removed (`trx_id_norm`).
- Foreign keys: always declared; `ON DELETE RESTRICT` unless stated. Business rows are **never hard-deleted** (packages are unpublished, orders are cancelled/refunded).
- All statements use **bound parameters**. String concatenation into SQL is forbidden ([04_TRD §7]).
- Multi-statement operations use `DB.batch([...])` (atomic transaction). D1 free plan limits the number of queries per Worker invocation, so handlers must stay within ~20 statements (design rule; see [04_TRD §1]).

## 2. Entity overview

```
admin_users                       settings            message_templates
customers 1──* orders *──1 packages 1──* package_features
              │  │
              │  └─* payments
              └─ 0..1 services (origin_order_id, UNIQUE) 1──* reminders
orders(kind='renewal').service_id ──> services.id
audit_log (any entity)   contact_messages   rate_limits
```

## 3. Tables (DDL is authoritative; copy verbatim into migrations, see [§5])

### 3.1 admin_users
```sql
CREATE TABLE admin_users (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner')),
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_seen_at  TEXT
);
```
Seeded manually with the owner's email in Phase 1 (`wrangler d1 execute`, see [06_Plan P1-09]). There is no signup, no password column.

### 3.2 customers
```sql
CREATE TABLE customers (
  id              INTEGER PRIMARY KEY,
  name            TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
  phone_norm      TEXT NOT NULL UNIQUE
                  CHECK (phone_norm GLOB '+8801[3-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
  email_norm      TEXT CHECK (email_norm IS NULL OR (length(email_norm) <= 254 AND email_norm LIKE '%_@_%._%')),
  preferred_lang  TEXT NOT NULL DEFAULT 'bn' CHECK (preferred_lang IN ('bn','en')),
  admin_note      TEXT CHECK (admin_note IS NULL OR length(admin_note) <= 1000),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```
One customer per phone. Re-ordering with the same phone reuses the row (upsert in OP-1, [§6]).

### 3.3 packages
```sql
CREATE TABLE packages (
  id            INTEGER PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9]*' AND length(slug) BETWEEN 2 AND 40),
  name_en       TEXT NOT NULL CHECK (length(name_en) BETWEEN 1 AND 60),
  name_bn       TEXT NOT NULL CHECK (length(name_bn) BETWEEN 1 AND 60),
  tagline_en    TEXT CHECK (tagline_en IS NULL OR length(tagline_en) <= 160),
  tagline_bn    TEXT CHECK (tagline_bn IS NULL OR length(tagline_bn) <= 160),
  price_bdt     INTEGER NOT NULL CHECK (price_bdt > 0),
  term_months   INTEGER NOT NULL DEFAULT 12 CHECK (term_months BETWEEN 1 AND 36),
  is_published  INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0,1)),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```
MVP UI exposes only `term_months = 12` (PRD A5). A package can be published only if it has ≥ 1 `package_features` row (checked in the Worker, error `PACKAGE_INCOMPLETE`).

### 3.4 package_features  (the editable "limits")
```sql
CREATE TABLE package_features (
  id          INTEGER PRIMARY KEY,
  package_id  INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  label_en    TEXT NOT NULL CHECK (length(label_en) BETWEEN 1 AND 60),   -- e.g. "Storage"
  label_bn    TEXT NOT NULL CHECK (length(label_bn) BETWEEN 1 AND 60),
  value_en    TEXT NOT NULL CHECK (length(value_en) BETWEEN 1 AND 60),   -- e.g. "<number from upstream plan>"
  value_bn    TEXT NOT NULL CHECK (length(value_bn) BETWEEN 1 AND 60),
  sort_order  INTEGER NOT NULL DEFAULT 0
);
```
Storage, accounts/websites, bandwidth, email accounts, etc. are **rows**, never code. The site renders whatever rows exist.

### 3.5 settings
```sql
CREATE TABLE settings (
  key         TEXT PRIMARY KEY CHECK (key GLOB '[a-z]*'),
  value       TEXT NOT NULL CHECK (length(value) <= 4000),
  is_public   INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0,1)),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_by  TEXT
);
```
Keys (seeded in [§5] migration 0005; `P` = public, returned by `GET /api/public/settings`):

| key | default | P | meaning |
|---|---|---|---|
| business_name | HOSTNEIL | P | brand text |
| support_whatsapp_e164 | *(empty)* | P | e.g. `8801XXXXXXXXX` without `+`, used for `wa.me` links |
| support_email | *(empty)* | P | shown on Contact |
| support_hours_en / support_hours_bn | *(empty)* | P | free text |
| bkash_number, bkash_type | *(empty)*, `Personal` | P | payment details |
| nagad_number, nagad_type | *(empty)*, `Personal` | P | |
| bank_name, bank_account_name, bank_account_number, bank_branch | *(empty)* | P | |
| payment_note_en / payment_note_bn | short instruction text | P | shown on Payment Instructions |
| upstream_disclosure_en / _bn | "HOSTNEIL resells web hosting provided by third-party upstream providers. HOSTNEIL does not own data centers." (+ Bangla) | P | footer + About + Terms |
| terms_version | `2026-10-29` | P | stored on each order |
| expiring_window_days | `15` | – | service becomes `expiring` when days_left ≤ this |
| reminder_offsets | `[15,7,3,1,0]` | – | JSON int array, days before `expires_on` (negative = after) |
| pending_order_expiry_days | `3` | – | unpaid orders auto-cancel after N days |
| auto_email_reminders | `1` | – | send reminder emails automatically when customer has email |
| owner_digest_enabled | `1` | – | daily digest to owner |

### 3.6 orders
```sql
CREATE TABLE orders (
  id                   INTEGER PRIMARY KEY,
  order_code           TEXT NOT NULL UNIQUE CHECK (length(order_code) = 11 AND order_code GLOB 'HN-*'),
  kind                 TEXT NOT NULL DEFAULT 'new' CHECK (kind IN ('new','renewal')),
  customer_id          INTEGER NOT NULL REFERENCES customers(id),
  package_id           INTEGER NOT NULL REFERENCES packages(id),
  service_id           INTEGER REFERENCES services(id),               -- only for renewals
  package_name_snapshot TEXT NOT NULL,
  total_bdt            INTEGER NOT NULL CHECK (total_bdt > 0),
  term_months          INTEGER NOT NULL CHECK (term_months BETWEEN 1 AND 36),
  domain_name          TEXT CHECK (domain_name IS NULL OR (length(domain_name) BETWEEN 3 AND 253 AND domain_name NOT LIKE '% %')),
  customer_note        TEXT CHECK (customer_note IS NULL OR length(customer_note) <= 300),
  contact_phone_norm   TEXT NOT NULL,
  contact_email_norm   TEXT,
  lang                 TEXT NOT NULL DEFAULT 'bn' CHECK (lang IN ('bn','en')),
  status               TEXT NOT NULL DEFAULT 'pending_payment'
                       CHECK (status IN ('pending_payment','paid','provisioned','active','cancelled','refunded')),
  status_changed_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  cancel_reason        TEXT CHECK (cancel_reason IS NULL OR length(cancel_reason) <= 300),
  refund_note          TEXT CHECK (refund_note IS NULL OR length(refund_note) <= 500),
  terms_version        TEXT NOT NULL,
  consent_at           TEXT NOT NULL,
  ip_hash              TEXT,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK ((kind = 'renewal') = (service_id IS NOT NULL))
);
```
- `order_code` = `HN-` + 8 chars of Crockford base32 (`0123456789ABCDEFGHJKMNPQRSTVWXYZ`), generated with `crypto.getRandomValues`; retry (max 3) on UNIQUE violation.
- `contact_*` are snapshots used for customer verification ([§7.3]); they do not change if the customer row later changes.
- **Order status** has six values; `expiring`/`expired` belong to the **service** ([§3.8]). The customer-facing "display status" merges both ([02_AppFlow §4.3]).
- A note about passwords: no column anywhere stores credentials. `customer_note` is free text; the UI warns not to type passwords ([03_UI_Spec §1 R6]).

### 3.7 payments
```sql
CREATE TABLE payments (
  id                    INTEGER PRIMARY KEY,
  order_id              INTEGER NOT NULL REFERENCES orders(id),
  method                TEXT NOT NULL CHECK (method IN ('bkash','nagad','bank')),
  trx_id                TEXT NOT NULL CHECK (length(trx_id) BETWEEN 6 AND 40),   -- as typed
  trx_id_norm           TEXT NOT NULL,                                           -- upper-case, no spaces
  sender_account        TEXT NOT NULL CHECK (length(sender_account) BETWEEN 3 AND 40),
  claimed_amount_bdt    INTEGER NOT NULL CHECK (claimed_amount_bdt > 0),
  status                TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','verified','rejected')),
  verified_amount_bdt   INTEGER CHECK (verified_amount_bdt IS NULL OR verified_amount_bdt > 0),
  verified_by           INTEGER REFERENCES admin_users(id),
  verified_at           TEXT,
  reject_reason         TEXT CHECK (reject_reason IS NULL OR length(reject_reason) <= 300),
  submitted_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ip_hash               TEXT,
  CHECK (status <> 'verified' OR (verified_amount_bdt IS NOT NULL AND verified_by IS NOT NULL AND verified_at IS NOT NULL)),
  CHECK (status <> 'rejected' OR reject_reason IS NOT NULL)
);
```
Rules: many submissions per order allowed (retry after rejection); **at most one `verified`** per order and **one live (submitted|verified) row per (method, trx_id_norm)** (partial unique indexes in [§4]).

### 3.8 services
```sql
CREATE TABLE services (
  id                INTEGER PRIMARY KEY,
  origin_order_id   INTEGER NOT NULL UNIQUE REFERENCES orders(id),
  customer_id       INTEGER NOT NULL REFERENCES customers(id),
  package_id        INTEGER NOT NULL REFERENCES packages(id),
  domain_name       TEXT CHECK (domain_name IS NULL OR length(domain_name) BETWEEN 3 AND 253),
  upstream_provider TEXT NOT NULL CHECK (length(upstream_provider) BETWEEN 2 AND 60),
  upstream_ref      TEXT CHECK (upstream_ref IS NULL OR length(upstream_ref) <= 120),  -- account/username ONLY, never a password
  status            TEXT NOT NULL DEFAULT 'provisioned'
                    CHECK (status IN ('provisioned','active','expiring','expired','cancelled')),
  term_months       INTEGER NOT NULL CHECK (term_months BETWEEN 1 AND 36),
  starts_on         TEXT CHECK (starts_on IS NULL OR (length(starts_on) = 10 AND starts_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')),
  expires_on        TEXT CHECK (expires_on IS NULL OR (length(expires_on) = 10 AND expires_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')),
  last_renewed_on   TEXT,
  admin_note        TEXT CHECK (admin_note IS NULL OR length(admin_note) <= 1000),
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (status NOT IN ('active','expiring','expired') OR (starts_on IS NOT NULL AND expires_on IS NOT NULL))
);
```
**Date semantics (binding):** `expires_on` is the **last day the service is covered** = `addMonthsClamped(starts_on, term_months) − 1 day`. Example: start 2026-10-29, 12 months → `expires_on` 2027-10-28. `days_left = expires_on − today` (0 on the last covered day). Status after the cron: `expired` if `today > expires_on`; `expiring` if `0 ≤ days_left ≤ expiring_window_days`; else `active`.

### 3.9 reminders
```sql
CREATE TABLE reminders (
  id                 INTEGER PRIMARY KEY,
  service_id         INTEGER NOT NULL REFERENCES services(id),
  expires_on_snapshot TEXT NOT NULL,                  -- the cycle this reminder belongs to
  offset_days        INTEGER NOT NULL CHECK (offset_days BETWEEN -30 AND 60),
  due_on             TEXT NOT NULL,                   -- expires_on_snapshot − offset_days
  channel            TEXT NOT NULL CHECK (channel IN ('whatsapp','email')),
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','skipped')),
  sent_at            TEXT,
  sent_by            TEXT,                            -- admin email, or 'system' for auto email
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (service_id, expires_on_snapshot, offset_days, channel)
);
```
Because the key includes `expires_on_snapshot`, a renewed service gets a fresh set of reminders for the new cycle.

### 3.10 message_templates
```sql
CREATE TABLE message_templates (
  id         INTEGER PRIMARY KEY,
  key        TEXT NOT NULL CHECK (key IN ('renewal_reminder','payment_verified','payment_rejected','service_activated')),
  lang       TEXT NOT NULL CHECK (lang IN ('bn','en')),
  body       TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 1000),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (key, lang)
);
```
Placeholders (only these): `{name} {order_code} {package} {domain} {total_bdt} {expires_on} {days_left}`. Unknown placeholders are rejected on save. Templates must never contain credentials; `service_activated` says details were sent privately.

### 3.11 contact_messages
```sql
CREATE TABLE contact_messages (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
  phone_norm TEXT,
  email_norm TEXT,
  message    TEXT NOT NULL CHECK (length(message) BETWEEN 5 AND 1500),
  lang       TEXT NOT NULL DEFAULT 'bn' CHECK (lang IN ('bn','en')),
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','archived')),
  ip_hash    TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (phone_norm IS NOT NULL OR email_norm IS NOT NULL)
);
```

### 3.12 rate_limits
```sql
CREATE TABLE rate_limits (
  key          TEXT PRIMARY KEY,      -- '<bucket>:<sha256(ip+RATE_SALT)[0..16]>' or '<bucket>:<order_code>'
  window_start INTEGER NOT NULL,      -- unix seconds
  count        INTEGER NOT NULL
);
```
Algorithm and limits in [04_TRD §7.2]. Rows older than 1 day are purged by the daily cron.

### 3.13 audit_log
```sql
CREATE TABLE audit_log (
  id          INTEGER PRIMARY KEY,
  actor       TEXT NOT NULL,          -- admin email | 'system' | 'customer'
  action      TEXT NOT NULL,          -- e.g. 'order.created','payment.verified','service.activated'
  entity_type TEXT NOT NULL CHECK (entity_type IN ('order','payment','service','package','customer','setting','template','message','reminder','export')),
  entity_id   INTEGER NOT NULL,
  detail      TEXT CHECK (detail IS NULL OR length(detail) <= 2000),   -- JSON; never contains PII beyond ids, never secrets
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```
Append-only (no UPDATE/DELETE statements exist in code; trigger [§3.14] enforces).

### 3.14 Triggers (second wall; Worker code must still check first and return friendly errors)
```sql
-- Orders can only be created pending.
CREATE TRIGGER trg_orders_insert_pending BEFORE INSERT ON orders
WHEN NEW.status <> 'pending_payment'
BEGIN SELECT RAISE(ABORT,'INVALID_INITIAL_STATUS'); END;

-- Only allowed order transitions (see 02_AppFlow §4.1).
CREATE TRIGGER trg_orders_status_guard BEFORE UPDATE OF status ON orders
WHEN NEW.status <> OLD.status AND NOT (
     (OLD.status = 'pending_payment' AND NEW.status IN ('paid','cancelled'))
  OR (OLD.status = 'paid'            AND NEW.status IN ('provisioned','refunded'))
  OR (OLD.status = 'paid'            AND NEW.status = 'active' AND NEW.kind = 'renewal')
  OR (OLD.status = 'provisioned'     AND NEW.status IN ('active','refunded'))
  OR (OLD.status = 'active'          AND NEW.status = 'refunded'))
BEGIN SELECT RAISE(ABORT,'INVALID_TRANSITION'); END;

-- Paid requires a verified payment row.
CREATE TRIGGER trg_orders_paid_requires_verified BEFORE UPDATE OF status ON orders
WHEN NEW.status = 'paid' AND OLD.status <> 'paid'
 AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = NEW.id AND p.status = 'verified')
BEGIN SELECT RAISE(ABORT,'NO_VERIFIED_PAYMENT'); END;

-- Payments: insert only as 'submitted', only for payable orders.
CREATE TRIGGER trg_payments_insert BEFORE INSERT ON payments
WHEN NEW.status <> 'submitted'
  OR (SELECT status FROM orders WHERE id = NEW.order_id) <> 'pending_payment'
BEGIN SELECT RAISE(ABORT,'ORDER_NOT_PAYABLE'); END;

-- Verified amount must equal the order total.
CREATE TRIGGER trg_payments_verify_amount BEFORE UPDATE OF status, verified_amount_bdt ON payments
WHEN NEW.status = 'verified'
 AND NEW.verified_amount_bdt IS NOT (SELECT total_bdt FROM orders WHERE id = NEW.order_id)
BEGIN SELECT RAISE(ABORT,'AMOUNT_MISMATCH'); END;

-- A payment can be verified only while its order is still pending_payment.
CREATE TRIGGER trg_payments_verify_order_pending BEFORE UPDATE OF status ON payments
WHEN NEW.status = 'verified' AND OLD.status <> 'verified'
 AND (SELECT status FROM orders WHERE id = NEW.order_id) <> 'pending_payment'
BEGIN SELECT RAISE(ABORT,'ORDER_NOT_PAYABLE'); END;

-- A new order can become active only if its service is active (renewals are exempt).
CREATE TRIGGER trg_orders_active_requires_service BEFORE UPDATE OF status ON orders
WHEN NEW.status = 'active' AND OLD.status <> 'active' AND NEW.kind = 'new'
 AND NOT EXISTS (SELECT 1 FROM services s WHERE s.origin_order_id = NEW.id AND s.status = 'active')
BEGIN SELECT RAISE(ABORT,'SERVICE_NOT_ACTIVE'); END;

-- Verified/rejected payments are final.
CREATE TRIGGER trg_payments_final BEFORE UPDATE ON payments
WHEN OLD.status IN ('verified','rejected')
BEGIN SELECT RAISE(ABORT,'PAYMENT_FINAL'); END;

-- A service can only be created from a PAID order.
CREATE TRIGGER trg_services_insert_requires_paid BEFORE INSERT ON services
WHEN (SELECT status FROM orders WHERE id = NEW.origin_order_id) <> 'paid'
  OR (SELECT kind FROM orders WHERE id = NEW.origin_order_id) <> 'new'
BEGIN SELECT RAISE(ABORT,'ORDER_NOT_PAID'); END;

-- Audit log is append-only.
CREATE TRIGGER trg_audit_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT,'AUDIT_APPEND_ONLY'); END;
CREATE TRIGGER trg_audit_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT,'AUDIT_APPEND_ONLY'); END;
```
Note: the daily cron purges `rate_limits` and old `contact_messages` only; it never touches `audit_log`.

## 4. Indexes
```sql
CREATE INDEX idx_packages_pub        ON packages(is_published, sort_order);
CREATE INDEX idx_features_pkg        ON package_features(package_id, sort_order);
CREATE INDEX idx_orders_status       ON orders(status, created_at DESC);
CREATE INDEX idx_orders_customer     ON orders(customer_id);
CREATE INDEX idx_orders_service      ON orders(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX idx_orders_phone        ON orders(contact_phone_norm);
CREATE INDEX idx_orders_email        ON orders(contact_email_norm) WHERE contact_email_norm IS NOT NULL;
CREATE INDEX idx_payments_order      ON payments(order_id);
CREATE INDEX idx_payments_queue      ON payments(status, submitted_at);
CREATE UNIQUE INDEX uq_payments_one_verified ON payments(order_id) WHERE status = 'verified';
CREATE UNIQUE INDEX uq_payments_live_trx     ON payments(method, trx_id_norm) WHERE status IN ('submitted','verified');
CREATE INDEX idx_services_status     ON services(status, expires_on);
CREATE INDEX idx_services_customer   ON services(customer_id);
CREATE INDEX idx_reminders_queue     ON reminders(status, due_on);
CREATE INDEX idx_reminders_service   ON reminders(service_id);
CREATE INDEX idx_contact_status      ON contact_messages(status, created_at DESC);
CREATE INDEX idx_ratelimit_window    ON rate_limits(window_start);
CREATE INDEX idx_audit_entity        ON audit_log(entity_type, entity_id, created_at);
```

## 5. Migrations

Tool: `wrangler d1 migrations` (folder `apps/api/migrations/`, binding `DB`, `migrations_dir` in `wrangler.toml`). Files are forward-only and numbered; never edit an applied file — add a new one (and ask the owner first, [CLAUDE.md]).

| File | Content |
|---|---|
| `0001_core.sql` | §3.1 – §3.8 tables + their indexes from §4 |
| `0002_reminders_templates.sql` | §3.9, §3.10 + indexes |
| `0003_support.sql` | §3.11 – §3.13 + indexes |
| `0004_triggers.sql` | §3.14 |
| `0005_seed_defaults.sql` | settings rows from §3.5; 3 packages (`starter` 999, `business` 1499, `pro` 2499, **`is_published = 0`**, no features, sort 1-3, Bangla names "স্টার্টার", "বিজনেস", "প্রো"); 8 message templates (4 keys × bn/en) |

Seed template text (agent copies verbatim, owner can edit later):
- `renewal_reminder` en: `Hello {name}, your hosting ({package}{domain}) is covered until {expires_on} ({days_left} days left). Reply here to renew. – HOSTNEIL`
- `renewal_reminder` bn: `আসসালামু আলাইকুম {name}, আপনার হোস্টিং ({package}{domain}) {expires_on} পর্যন্ত চালু আছে (আর {days_left} দিন বাকি)। নবায়ন করতে এই মেসেজে উত্তর দিন। – HOSTNEIL`
- `payment_verified` en: `Hello {name}, we verified your payment of ৳{total_bdt} for order {order_code}. We will set up your hosting and message you privately.`
- `payment_verified` bn: `{name}, অর্ডার {order_code}-এর ৳{total_bdt} পেমেন্ট যাচাই হয়েছে। আমরা শিগগিরই আপনার হোস্টিং সেটআপ করে আলাদা বার্তায় জানাব।`
- `payment_rejected` en: `Hello {name}, we could not verify the payment for order {order_code}. Please send the correct transaction ID and amount, or contact us.`
- `payment_rejected` bn: `{name}, অর্ডার {order_code}-এর পেমেন্ট যাচাই করা যায়নি। সঠিক ট্রানজ্যাকশন আইডি ও পরিমাণ পাঠান, অথবা আমাদের সাথে যোগাযোগ করুন।`
- `service_activated` en: `Hello {name}, your hosting for order {order_code} is active until {expires_on}. Your login details were sent to you in a separate private message.`
- `service_activated` bn: `{name}, অর্ডার {order_code}-এর হোস্টিং {expires_on} পর্যন্ত চালু। লগইন তথ্য আলাদা ব্যক্তিগত বার্তায় পাঠানো হয়েছে।`

(`{domain}` renders as ` – example.com` when present, else empty.)

Local/remote commands: see [04_TRD §4 scripts]. Every migration is applied to **local** first (`--local`), tested ([06_Plan] Phase 1), then to remote.

## 6. Invariants and transactional operations

Invariants (each has a test in [06_Plan] Phase 4):
- **I1** An order becomes `paid` only through OP-3 and only if exactly one `payments` row is `verified` with `verified_amount_bdt = orders.total_bdt` (Worker check + triggers `trg_orders_paid_requires_verified`, `trg_payments_verify_amount`).
- **I2** A service row exists only for orders that were `paid` (`trg_services_insert_requires_paid`); an order is `provisioned` iff its service exists.
- **I3** A trx ID (per method) is never live on two payments (`uq_payments_live_trx`).
- **I4** No credentials are stored (no column; templates and notes warn; CI grep test for `password` in migrations allows only comments).
- **I5** Only transitions in [02_AppFlow §4.1] / [02_AppFlow §4.2] are possible (Worker `lifecycle.ts` + `trg_orders_status_guard`).
- **I6** Each state change writes an `audit_log` row in the **same batch**.

Operations (Worker implements each as one `DB.batch`; `?` are bound params; `today` = `todayDhaka()`):

- **OP-1 createOrder (public)**: upsert customer (`INSERT … ON CONFLICT(phone_norm) DO UPDATE SET name=excluded.name, email_norm=COALESCE(excluded.email_norm, customers.email_norm), preferred_lang=excluded.preferred_lang, updated_at=now`) → `INSERT INTO orders … SELECT … FROM packages WHERE id=? AND is_published=1` (snapshots name/price/term; 0 rows inserted ⇒ `PACKAGE_UNAVAILABLE`) → audit `order.created`. On `order_code` UNIQUE failure regenerate (≤ 3 tries).
- **OP-2 submitPayment (customer-verified)**: `INSERT INTO payments(...)`; duplicate trx → `DUPLICATE_TRX`; order not pending → `ORDER_NOT_PAYABLE`; audit `payment.submitted`; email owner (best effort, outside the batch).
- **OP-3 verifyPayment (admin)**: input `payment_id`, `verified_amount_bdt`. Worker pre-checks (payment `submitted`, order `pending_payment`, amount equals `total_bdt`, else `AMOUNT_MISMATCH` 422). Batch: (1) `UPDATE payments SET status='verified', verified_amount_bdt=?, verified_by=?, verified_at=now WHERE id=? AND status='submitted'` (2) `UPDATE orders SET status='paid', status_changed_at=now, updated_at=now WHERE id=? AND status='pending_payment'` (3) audit. If (1) touched 0 rows, (2) aborts via trigger and the whole batch rolls back.
- **OP-4 rejectPayment (admin)**: `UPDATE payments SET status='rejected', reject_reason=? WHERE id=? AND status='submitted'`; order unchanged; audit.
- **OP-5 provision (admin)**: input provider, upstream_ref (optional), domain. Batch: `INSERT INTO services(status='provisioned', …)` (needs order `paid`) → `UPDATE orders SET status='provisioned'` → audit.
- **OP-6 activate (admin)**: `starts_on = today`; `expires_on = addMonthsClamped(today, term_months) − 1 day`. Batch: `UPDATE services SET status='active', starts_on, expires_on WHERE id=? AND status='provisioned'` → `UPDATE orders SET status='active'` → audit.
- **OP-7 createRenewalOrder (admin)**: `INSERT INTO orders(kind='renewal', service_id, …)` snapshotting the service's *current* package price (admin may choose another published package of the same term); audit. Customer then pays like any order (OP-2/OP-3).
- **OP-8 applyRenewal (admin)**: requires renewal order `paid`. `base = (expires_on ≥ today) ? expires_on + 1 day : today`; `new_expires_on = addMonthsClamped(base, term_months) − 1 day`. Batch: `UPDATE services SET expires_on=?, last_renewed_on=?, status='active' …` (status recomputed to `expiring` by the next cron if within window; Worker computes immediately) → `UPDATE orders SET status='active'` → audit.
- **OP-9 cancelOrder (admin; only `pending_payment`)**: reason required. Open `submitted` payments for that order are set `rejected` with reason `order cancelled`.
- **OP-10 refundOrder (admin; from `paid|provisioned|active`)**: note required; if the order is `kind='new'` and has a service → service `cancelled`; if `kind='renewal'` the service keeps its previous expiry only if the renewal was never applied — if it was applied, the admin must manually correct `expires_on` (UI shows a warning; field editable via OP-11).
- **OP-11 editService (admin)**: may edit `domain_name`, `upstream_provider`, `upstream_ref`, `admin_note`, and (with confirmation + audit) `expires_on`.
- **OP-12 daily jobs** — job A `dailyState` (cron `0 3 * * *` = 09:00 Dhaka) runs steps 1–6; job B `dailyNotify` (cron `10 3 * * *`) runs steps 7–8 ([04_TRD §5]). All set-based, idempotent:
  1. cancel stale unpaid orders: `UPDATE orders SET status='cancelled', cancel_reason='auto: unpaid' WHERE status='pending_payment' AND date(created_at,'+6 hours') <= date(:today, '-' || :pending_days || ' day')` (+ reject their open payments).
  2. `UPDATE services SET status='expired' WHERE status IN ('active','expiring') AND expires_on < :today`.
  3. `UPDATE services SET status='expiring' WHERE status='active' AND expires_on >= :today AND julianday(expires_on) - julianday(:today) <= :window`.
  4. `UPDATE services SET status='active' WHERE status='expiring' AND julianday(expires_on) - julianday(:today) > :window`.
  5. `INSERT OR IGNORE INTO reminders(...) SELECT …` for each offset in `reminder_offsets` (value list bound as JSON via `json_each`) where `due_on <= :today AND due_on >= date(:today,'-3 day')` and service status in (`active`,`expiring`,`expired`) — channel `whatsapp` always; channel `email` too when the customer's order contact has an email and `auto_email_reminders=1`.
  6. purge `rate_limits` older than 1 day; purge `contact_messages` with `status='archived'` and age > 365 days.
  7. select pending `email` reminders due ≤ today, send via Resend (fetch), mark `sent` / leave `pending` on failure (retry next day).
  8. build digest and send to owner.

## 7. Authentication and authorization

### 7.1 Actors
| Actor | Identity proof | Can do |
|---|---|---|
| **Anonymous** | none (Turnstile on writes) | read published packages & public settings; create order; submit contact message |
| **Customer-verified** | `order_code` **and** matching `contact_phone_norm` or `contact_email_norm` on that order, per request | read **that one order's** limited status DTO; submit payment for **that** order |
| **Admin (owner)** | Cloudflare Access JWT + row in `admin_users` with `is_active = 1` | everything under `/api/admin/*`; only actor allowed to change payment, order or service status |
| **System (cron)** | Worker scheduled handler | OP-12 only |

There is exactly one role, `owner`. No customer passwords or sessions exist.

### 7.2 Admin authentication flow
1. Browser requests `https://hostneil.com/admin/*` or `/api/admin/*`. A **Cloudflare Access application** (self-hosted, covering `hostneil.com/admin*` and `hostneil.com/api/admin*`) forces login (One-time PIN to the owner's email; Google optional) and sets the `CF_Authorization` cookie. Free plan covers ≤ 50 seats ([04_TRD §1]).
2. Access forwards the request with header `Cf-Access-Jwt-Assertion`.
3. Worker middleware `requireAdmin`: verify JWT signature with the team JWKS (`https://<CF_ACCESS_TEAM_DOMAIN>/cdn-cgi/access/certs`, cached), check `iss = https://<CF_ACCESS_TEAM_DOMAIN>`, `aud ∋ CF_ACCESS_AUD`, `exp`/`nbf`; read the `email` claim; `SELECT id, role FROM admin_users WHERE email = ? AND is_active = 1`. Missing/invalid token → `401 UNAUTHENTICATED`; valid token but no active row → `403 FORBIDDEN`. Updates `last_seen_at` at most once per hour.
4. On success `c.set('admin', {id,email,role})`. All handlers under the `/api/admin` router use it; audit rows use `admin.email` as `actor`.
5. **CSRF/Origin**: every non-GET admin request must have `Origin` equal to `SITE_ORIGIN` and header `X-HN-Console: 1`; else `403 FORBIDDEN`.
6. **Logout**: link to `/cdn-cgi/access/logout`.
7. **Local dev only**: if `ENVIRONMENT = "development"` and `DEV_ADMIN_EMAIL` is set, middleware accepts it without a JWT. In any other environment this branch must not exist at runtime (test T-AUTH-5).
8. **Why not passwords in the Worker:** hashing at a safe iteration count costs more than the free-plan 10 ms CPU limit per request ([04_TRD §1]); Access avoids storing any password hash and gives a second factor via email OTP. Fallback if Access is unavailable: upgrade to Workers Paid and use PBKDF2-SHA256 ≥ 600 000 iterations — needs owner approval and an amendment to this section.

### 7.3 Customer verification flow (`POST /api/public/orders/lookup` and `POST /api/public/orders/:code/payments`)
1. Validate body with zod; verify the Turnstile token (required on every public POST, including lookup and payment submission).
2. Normalise `order_code` (uppercase) and `contact` (if it contains `@` → email lowercase; else BD phone → `+8801XXXXXXXXX`; invalid → `400 VALIDATION_FAILED`).
3. Rate limit ([04_TRD §7.2]).
4. `SELECT … FROM orders WHERE order_code = ?`. Compare supplied contact to `contact_phone_norm` / `contact_email_norm` using a constant-time comparison. **Not found and mismatch both return the identical `404 NOT_FOUND_OR_MISMATCH`** with equal work done (always run the comparison against a dummy value when no row).
5. On success return a **DTO** (explicit field list, never `SELECT *`): `order_code, kind, display_status, package_name, total_bdt, created_at, payment: {state: none|submitted|verified|rejected, method?, submitted_at?}, service?: {domain_name, status, starts_on, expires_on, days_left}`. Never returned: ids, phone/email, notes, upstream info, `ip_hash`, audit rows, reject reasons beyond a generic hint.
6. Authorization is per request; nothing is cached or remembered server-side. The browser may keep `{order_code, contact}` in `sessionStorage` only to pre-fill the next call.

### 7.4 Endpoint × actor matrix (full route list in [04_TRD §9])
| Route group | Anonymous | Customer-verified | Admin |
|---|---|---|---|
| `GET /api/public/packages`, `/settings`, `/payment-info` | ✔ | ✔ | ✔ |
| `POST /api/public/orders`, `/contact` | ✔ (Turnstile, rate-limited) | ✔ | ✔ |
| `POST /api/public/orders/lookup`, `/orders/:code/payments` | ✘ | ✔ (that order only) | – |
| `/api/admin/**` (incl. every status change, verify/reject payment, provision, activate, settings, exports) | ✘ | ✘ | ✔ |

Enforcement rules:
- Public handlers live in `apps/api/src/routes/public/*` and may import only `repositories/*` functions that return DTOs. Admin handlers live in `routes/admin/*`, mounted as `app.route('/api/admin', admin)` after `admin.use('*', requireAdmin, requireCsrf)`.
- Test **T-AUTH-1**: enumerate all registered routes; every path starting `/api/admin` must return 401 without a token.
- Status/payment mutations are **only** called from `routes/admin/*` and `jobs/daily.ts`; a lint rule/grep test fails if `lifecycle.ts` is imported elsewhere.
