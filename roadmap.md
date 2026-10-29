# 01_PRD — HOSTNEIL Product Requirements

Version: 1.0 · Date: 2026-10-29 · Related: `02_AppFlow.md`, `03_UI_Spec.md`, `04_TRD.md`, `05_Schema.md`, `06_Plan.md`

## 0. Assumptions (read first — the brief was ambiguous here)

| # | Assumption |
|---|---|
| A1 | Production domain is `hostneil.com` (placeholder). Everything reads it from `SITE_ORIGIN`; never hard-code it. |
| A2 | Public site is Bangla by default at `/`, English under `/en/`. The admin Console is **English-only** in the MVP. Customer-facing messages (reminder text, emails) exist in both `bn` and `en`. |
| A3 | One admin only. Identity comes from Cloudflare Access (email). Role set is `admin` only; there is no "staff" role. |
| A4 | Only the 12-month term is sold in the MVP. The schema allows other terms (`package_prices.term_months`); the UI shows 12 only. |
| A5 | Three draft packages are seeded **unpublished** with price placeholders from the owner's earlier plan: Starter 999, Business 1,499, Pro 2,499 BDT per year. **No limits (storage, accounts, bandwidth) are seeded.** A package cannot be published until the owner enters limits taken from the upstream provider's plan (BR-04). |
| A6 | The upstream provider is not named on the public site (`settings.show_provider_name = 0`). The About page states that hosting is provided through an upstream hosting provider (BR-03). |
| A7 | Customers bring their own domain. If they have none, they tick "I don't have a domain yet" and the owner follows up on WhatsApp. Domain registration is out of scope (NG-02). |
| A8 | Lifecycle status lives on `orders.status`. One status is added to the requested machine: `COMPLETED`, used only by renewal orders (terminal). See `02_AppFlow.md` §3. |
| A9 | A renewal is a new order with `type = 'renewal'` linked to a service. No automatic billing. |
| A10 | Phone is mandatory (Bangladesh mobile), email is optional. Order lookup accepts either one. Emails are sent only when an email was given. |
| A11 | Timezone is `Asia/Dhaka`. Dates are `YYYY-MM-DD` in that zone; timestamps are UTC ISO-8601. The daily job runs at 03:00 UTC (09:00 Dhaka). |
| A12 | Legal pages (Terms, Privacy, Refund) ship as **drafts** containing `[OWNER TO CONFIRM]` markers. They are not legal advice; the owner must review them before launch. |
| A13 | Money is whole BDT integers (no paisa). |
| A14 | Payment numbers (bKash, Nagad, bank) are **not seeded**. The owner enters them in Console → Settings. Until at least one method is configured, new orders are refused with `PAYMENT_NOT_CONFIGURED`. |

## 1. Core problem

The owner runs a one-person, white-label web hosting reseller in Bangladesh using a Google Sheet and WhatsApp. Consequences:
1. Renewals are missed because expiry dates are not tracked or surfaced.
2. Accounts get provisioned before a payment is verified.
3. Order history is lost or scattered across chats.

HOSTNEIL = public website that sells packages and takes orders + a status page for customers + an owner-only Console that makes payment verification, service tracking and renewal reminders systematic. Orders and payments remain manual.

## 2. Personas

| ID | Persona | Context | Needs |
|---|---|---|---|
| P1 | **Owner/admin** (one person) | Works mostly from a phone or laptop, Bangla and English, buys from an upstream reseller provider, verifies bKash/Nagad/bank payments by hand | One list of what to do today: payments to verify, accounts to create, renewals due. Never provision unpaid orders. |
| P2 | **Customer** (freelancer or small-business owner, Bangladesh) | Phone, often slow mobile data, Bangla-first, pays by bKash/Nagad/bank | Understand packages and price in BDT, order in under 2 minutes, know exactly how to pay, see if the payment was accepted, be reminded before expiry. |

## 3. MVP user stories

Each story has acceptance criteria (AC). IDs are referenced in `06_Plan.md`.

| ID | Story | AC |
|---|---|---|
| US-01 | As P2, I read packages and prices in Bangla or English. | Pricing shows published packages with BDT price and limits from the database; language switch keeps the same page; works at 360 px width. |
| US-02 | As P2, I place an order without creating an account. | Order form validates name, BD phone, optional email, domain; passes Turnstile; returns an Order ID `HN-XXXXXXXX`; order starts as `PENDING_PAYMENT`. |
| US-03 | As P2, I see how to pay. | Payment page shows only configured methods, the exact amount, and the Order ID to quote; states that the order is not confirmed until verified. |
| US-04 | As P2, I submit my transaction details. | Status page (after Order ID + phone/email check) accepts method, transaction ID, sender number, amount; shows "received, being verified" — never "paid". |
| US-05 | As P2, I check my order status. | Order ID + phone or email returns status, package, price, domain, expiry date (once active), timeline. Wrong combination returns one generic error. |
| US-06 | As P1, I verify a payment. | Console lists submitted payments; I confirm the amount and mark Verified or Rejected; an order moves to `PAID` only through verified payments totalling at least the order price (BR-01). |
| US-07 | As P1, I record a payment that arrived by WhatsApp/SMS. | Console lets me add a payment to an order manually; the same verification rules apply. |
| US-08 | As P1, I record provisioning. | From `PAID` I mark `PROVISIONED` with domain and provider label; no password field exists anywhere (BR-02). |
| US-09 | As P1, I activate a service. | From `PROVISIONED` I mark `ACTIVE` after confirming credentials were sent privately; start date and expiry date are stored. |
| US-10 | As P1, I see renewals coming. | Renewals page lists services by expiry window (≤15 days, expired); orders become `EXPIRING`/`EXPIRED` automatically each morning. |
| US-11 | As P1, I send renewal reminders. | Reminder queue is created automatically at the configured offsets; I send via WhatsApp link (prefilled text) or email and mark sent; optional automatic email. |
| US-12 | As P1, I renew a service. | "Create renewal order" makes a `renewal` order; after verified payment I click "Apply renewal"; expiry moves forward; service returns to `ACTIVE`. |
| US-13 | As P1, I enter an order that came via WhatsApp. | Console "New order" creates the order with `source = 'admin'`. |
| US-14 | As P1, I manage packages, prices and limits as data. | Console → Packages edits names, prices, limits; the website renders only from this data; publish is blocked until required limits exist. |
| US-15 | As P1, I find any customer or order. | Search by Order ID, name, phone, email, domain. Full history per customer. |
| US-16 | As P1, I back up my data. | Console exports CSV for orders, payments, services, customers; runbook in `04_TRD.md` §9 covers D1 export and restore. |
| US-17 | As P2, I contact the owner. | Contact form (Turnstile) stores the message; the owner sees it in Console and by email. |
| US-18 | As P2, I read Terms, Privacy and Refund policies in my language. | Pages exist in `bn` and `en`; footer links on every page. |

## 4. Success metrics

Measured manually from the Console and Lighthouse; no third-party analytics in the MVP (NG-12).

| ID | Metric | Target |
|---|---|---|
| M1 | Orders in status `PAID` or later without a verified payment | **0** (enforced by Worker + DB trigger, `05_Schema.md` §4) |
| M2 | Active services with no `expires_on` | **0** |
| M3 | Services for which a reminder was queued ≥ 7 days before expiry | 100% |
| M4 | Services that lapsed to `EXPIRED` without any reminder queued | 0 |
| M5 | Median time from payment-proof submission to verification | ≤ 24 h (owner process metric) |
| M6 | Order form completion on a 360 px phone | ≤ 90 s for a prepared user |
| M7 | Home page, Slow 4G throttled Lighthouse mobile | Performance ≥ 90, LCP ≤ 2.5 s, transfer ≤ 200 KB excl. fonts |
| M8 | Monthly infrastructure cost (excluding the domain) | BDT 0 (free tiers) while within `04_TRD.md` §3 thresholds |
| M9 | Data loss events | 0; a restorable export no older than 7 days |

## 5. Business rules (invariants referenced by all docs)

| ID | Rule |
|---|---|
| BR-01 | An order is never `PAID` (or any later status) until the admin has verified a transaction (ID and amount) and verified amounts total ≥ the order price. Enforced in Worker code **and** by DB trigger `trg_orders_paid_requires_verified_payment`. |
| BR-02 | Hosting passwords/credentials are never stored — no column, no field, no log. They are sent privately outside the app. |
| BR-03 | The UI never claims HOSTNEIL owns servers or data centers. Hosting is bought from an upstream reseller provider. |
| BR-04 | Package limits (storage, accounts, bandwidth, others) are database rows editable in the Console. Required keys to publish: `storage`, `accounts`, `bandwidth`. |
| BR-05 | No fake reviews, testimonials, star ratings, invented uptime figures, "99.9%" claims, or unsupported guarantees anywhere. Every public claim must be backed by data in the database or by the owner-confirmed policy text. |
| BR-06 | Currency is BDT, integer. Displayed as `৳1,499` (bn digits on `bn` pages, see `03_UI_Spec.md` §3.4). |
| BR-07 | Only the admin role can change payment or provisioning state. Customers can only read one order, and only after Order ID + contact verification. |
| BR-08 | Customer-visible data never includes other customers' data, admin notes, provider details, or provisioning account references. |

## 6. Out of Scope (Non-Goals) — STRICT

Agents must not build any of the following (see `CLAUDE.md`).

| ID | Non-Goal |
|---|---|
| NG-01 | VPS, dedicated servers, cloud servers, or any product other than shared web hosting packages. |
| NG-02 | Domain registration or resale; DNS management for customers. |
| NG-03 | WHMCS, cPanel/WHM API integration, or any automated provisioning with the upstream provider. |
| NG-04 | Payment gateways, bKash/Nagad/bank APIs or webhooks, card payments, automated payment matching, invoices with tax logic, automated billing or recurring charges. |
| NG-05 | Customer accounts, passwords, login, social login, or a customer dashboard beyond the Order ID + contact status check. |
| NG-06 | Storing or displaying hosting credentials, cPanel passwords, or FTP/SSH keys. |
| NG-07 | Reviews, testimonials, rating widgets, uptime counters, "trusted by N customers", unverified badges. |
| NG-08 | Multiple admins, roles/permissions UI, teams, or staff accounts. |
| NG-09 | Coupons, discounts engine, affiliate/referral system, wallet or credit balance. |
| NG-10 | Support ticketing, live chat widget, chatbot, knowledge-base CMS. (Contact form + WhatsApp link only.) |
| NG-11 | Blog or CMS. Legal and marketing copy live in repo content files and i18n JSON. |
| NG-12 | Third-party analytics, ad pixels, trackers, or cookie banners requiring consent tooling. |
| NG-13 | SMS sending, automated WhatsApp sending (WhatsApp is manual click-to-chat links), push notifications. |
| NG-14 | Multi-currency, tax/VAT calculation, partial-month proration, upgrades/downgrades mid-term. |
| NG-15 | Mobile native apps. |
| NG-16 | Uploading files (payment screenshots, documents). Payment proof is text fields only. |
