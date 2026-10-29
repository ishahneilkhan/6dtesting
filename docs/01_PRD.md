# 01_PRD — HOSTNEIL Product Requirements

Doc set: `01_PRD` · [02_AppFlow](02_AppFlow.md) · [03_UI_Spec](03_UI_Spec.md) · [04_TRD](04_TRD.md) · [05_Schema](05_Schema.md) · [06_Plan](06_Plan.md)
Cross-references use the form `[doc §Section]`. If two docs disagree, **05_Schema wins for data, 02_AppFlow wins for behaviour, 04_TRD wins for tech**; then fix the other doc.

## 0. Assumptions (made instead of asking — change here first, then propagate)

| # | Assumption | Why it matters |
|---|---|---|
| A1 | Product name **HOSTNEIL**; Console = **HOSTNEIL Console**. Production domain **`hostneil.com`** is owned by the user and its DNS is on Cloudflare (placeholder; real value goes in `SITE_ORIGIN`, see [04_TRD §6]). | Website (Pages) and API (Worker) share **one origin**: `https://hostneil.com/*` → Pages, `https://hostneil.com/api/*` → Worker. No CORS, simple cookies, simple Access policy. |
| A2 | Default language is **Bangla** at `/`; English lives under `/en/`. Admin Console is **English only** (single owner). | Routing in [02_AppFlow §1]. |
| A3 | **Latin digits (0-9)** are used in both languages for prices, phone numbers, Order IDs and dates; the taka sign is `৳`. | Avoids Bangla/Latin digit confusion in payment data. |
| A4 | Phone is **required** on every order (Bangladesh mobile, WhatsApp-capable); email is **optional**. Customer verification accepts either one. | WhatsApp is the real support channel. |
| A5 | Hosting is sold **per year (12 months)** only in the MVP. Seed prices from the owner's plan: Starter ৳999, Business ৳1,499, Pro ৳2,499 per year — **seed placeholders, editable in the Console**. Package **limits are NOT seeded**; a package stays unpublished until the owner enters limits taken from the upstream provider's plan. | No invented specs ([UI rule R1]). |
| A6 | The service term starts when the admin marks the service **Active** (after credentials are delivered), not when payment is verified. | Fair to customers; defines `starts_on` / `expires_on` ([05_Schema §3 services]). |
| A7 | Upstream provider (CHV HOST / HostLagbe / HostVion / other) is **not shown publicly**. It is recorded per service in the Console only (`services.upstream_provider`). The site states plainly that hosting is provided by third-party upstream providers. | White-label + honesty. |
| A8 | Transaction IDs are unique per payment method; the same trx ID can never verify two payments. | Fraud control. |
| A9 | Refunds are **manual** and follow the Refund Policy text the owner writes; the Console only records the decision (`refunded`). | No automated billing. |
| A10 | Legal pages (Terms, Privacy, Refund) ship as **owner-editable Markdown drafts**; they need review by a qualified person before launch. The agent must not invent legal guarantees. | Compliance. |
| A11 | Records of orders and payments are kept **5 years** (assumption — owner to confirm with an accountant); contact-form messages 12 months. | [04_TRD §8]. |
| A12 | Monetary values are **integer BDT** (no paisa). Dates the business cares about (`starts_on`, `expires_on`) are `YYYY-MM-DD` in **Asia/Dhaka**; timestamps are ISO-8601 UTC. | [05_Schema §1]. |

## 1. Problem

One owner resells web hosting bought from an upstream reseller provider. Today orders, payments and renewals live in a Google Sheet plus WhatsApp. Consequences:

1. **Missed renewals** — expiry dates are not tracked or reminded systematically.
2. **Unverified payments provisioned** — hosting is set up on a screenshot or a claim.
3. **Lost order history** — chat scrollback is the only record.

HOSTNEIL replaces this with: a public site that takes orders, a manual payment-verification workflow, a service/expiry tracker with daily reminders, and a light status page for customers. Everything runs on Cloudflare free tiers ([04_TRD §1]).

## 2. Personas

**P1 — Owner/Admin ("Neil")**: one person, part-time, works mostly from a phone or laptop, verifies bKash/Nagad/bank payments by checking the merchant app/statement, creates accounts at the upstream provider, sends credentials privately on WhatsApp/email. Needs: a queue of "what do I need to do today", zero chance of marking Paid by mistake, expiry list, one-tap WhatsApp reminders.

**P2 — Customer ("Rafi")**: freelancer or small-business owner in Bangladesh, Android phone, slow/metered mobile data, comfortable with bKash, reads Bangla and some English. Needs: clear price in ৳, simple order form, exact payment instructions, a way to see "was my payment received?" without creating an account.

**P3 — Visitor**: has not decided yet; reads Pricing/FAQ/policies. Needs honest information (no fake reviews, no invented uptime).

## 3. MVP user stories

Priority: **M** = must for launch. Acceptance criteria (AC) are testable and map to [06_Plan] phase 4 tests.

### Public site
| ID | Story | AC |
|---|---|---|
| W1 (M) | As a visitor I can read Home, Web Hosting, Pricing, About, Contact, FAQ in Bangla or English. | All pages exist in `bn` and `en`; language switch keeps the same page; no layout break at 360 px width. |
| W2 (M) | As a visitor I see packages with price in ৳ and limits (storage, accounts, bandwidth, etc.) exactly as the owner entered them. | Values come from the API (`packages`, `package_features`); changing them in the Console changes the site within 5 min without redeploy. Unpublished packages never appear. |
| W3 (M) | As a visitor I can read Terms, Privacy and Refund policies. | Pages render from Markdown; footer links on every page. |
| W4 (M) | As a visitor I can send a message via Contact form. | Turnstile + honeypot; stored in `contact_messages`; owner notified; success and error states per [02_AppFlow §2.7]. |
| W5 (M) | The site never claims HOSTNEIL owns servers or data centers and shows no reviews, uptime figures or guarantees that the owner has not supplied as editable text. | Content review checklist in [06_Plan] Phase 4 passes; no hard-coded numbers except prices/limits from data. |

### Ordering and payment (customer)
| ID | Story | AC |
|---|---|---|
| O1 (M) | I can order a package with name, phone, optional email, optional domain, optional note, and consent to Terms/Refund policy. | Server validates; returns Order ID `HN-XXXXXXXX`; order status `pending_payment`; order snapshot stores price and term. |
| O2 (M) | I see payment instructions for bKash, Nagad, bank transfer with the exact amount and my Order ID as reference. | Details come from `settings` (editable); shown only after order creation. |
| O3 (M) | After paying I submit method, transaction ID, sender number and amount. | Creates a `payments` row `submitted`; same trx ID cannot be reused (A8); status page shows "Payment received — waiting for verification". |
| O4 (M) | I can check my order using Order ID + (phone or email) and see status, package, payment state, and for active services the domain and expiry date. | Wrong/unknown combos return the same generic message; no credentials or other customers' data are ever returned. |
| O5 (M) | If I get no result I see what to do (re-check ID, contact via WhatsApp). | Empty/error states per [02_AppFlow §2.6]. |
| O6 (S) | I get an email confirmation with my Order ID when I provided an email. | Sent via Resend ([04_TRD §3]); failure never blocks the order. |

### Admin Console
| ID | Story | AC |
|---|---|---|
| A1 (M) | I can only enter the Console after Cloudflare Access login, and only if my email is in `admin_users`. | Any `/api/admin/*` call without a valid Access JWT + active admin row → 401/403. |
| A2 (M) | Dashboard shows: payments awaiting verification, paid orders awaiting provisioning, services awaiting activation, services expiring within the window, expired services. | Counts and lists link to filtered views. |
| A3 (M) | I can verify a payment by entering the verified amount; the order becomes Paid only if trx ID is present and verified amount equals the order total. | Enforced in Worker transaction ([05_Schema §6]); UI cannot bypass; audit log row written. |
| A4 (M) | I can reject a payment with a reason. | Order stays `pending_payment`; customer sees "Payment could not be verified — contact us". |
| A5 (M) | I can mark Provisioned (record upstream provider, upstream account ref, domain), then Active (sets `starts_on`, `expires_on`). | No password field exists anywhere; forbidden transitions return `INVALID_TRANSITION`. |
| A6 (M) | I can see every service with expiry date, days left, status; filter by expiring/expired. | Status derived daily by cron ([04_TRD §5]). |
| A7 (M) | Renewals queue lists due reminders; I can open a prefilled WhatsApp message (Bangla/English template) and mark it sent. | Template placeholders resolved server-side; sent state saved. |
| A8 (M) | I can create a renewal order for a service; after payment verification I apply the renewal and expiry extends. | New `expires_on` = `addMonthsClamped(base, term_months) − 1 day`, where `base` = day after current `expires_on` if still covered, else today ([05_Schema §6 OP-8]). |
| A9 (M) | I can cancel an unpaid order; I can mark an order refunded (with note). | Terminal states; audit log. |
| A10 (M) | I can edit packages, limits (bn/en), prices, payment instructions, WhatsApp number, message templates, thresholds. | No code change or redeploy needed. |
| A11 (M) | I can see all customers and their orders/services; I can export orders, payments, services, customers to CSV. | Export is the backup path ([04_TRD §8]). |
| A12 (S) | Daily digest email to the owner (new items, expiring this week). | Cron; failure logged, never blocks status updates. |
| A13 (S) | I can read and archive contact messages. | `/admin/messages`. |

## 4. Success metrics (measured from D1 and Cloudflare dashboards; no third-party trackers)

| Metric | Target for first 90 days | Source |
|---|---|---|
| Missed renewals (services that reached `expired` with zero reminders sent) | **0** | `reminders` vs `services` query on Console dashboard |
| Services provisioned without a verified payment | **0** (system invariant: impossible by code) | Plan Phase 4 test T-INV-1 |
| Median time payment submitted → verified | ≤ 4 working hours (owner-chosen goal) | `payments.submitted_at` → `verified_at` |
| Orders with a complete history (create → paid → active) in the Console | 100% | audit log |
| Mobile Lighthouse (Moto G-class, slow 4G profile) on Home and Pricing | Performance ≥ 90, Accessibility ≥ 95 | Lighthouse CI step in Plan |
| First-load transfer for a marketing page (excluding images) | ≤ 120 KB compressed incl. fonts subset | Build check |
| Order form completion (visit `/order` → order created) | tracked, no target until ≥ 50 visits | Cloudflare Web Analytics + `orders` count |
| Monthly cost | ≤ BDT 0 recurring on Cloudflare/Resend (domain renewal excluded) | Billing |
| Backup discipline | One CSV export per month recorded in 06_Plan notes | Manual |

## 5. Out of Scope (Non-Goals) — STRICT

The coding agent must **not** build, scaffold, stub, or add UI/DB columns for any of the following. If a request seems to need one, stop and ask the owner.

1. VPS, cloud servers, dedicated servers, colocation, game servers.
2. Domain registration, resale, transfer, DNS hosting for customers. (The order form may *store* a domain name string only.)
3. WHMCS, any billing/invoicing platform, recurring/automatic billing, proration, credits, wallets.
4. Payment gateways or payment APIs (SSLCommerz, bKash/Nagad merchant APIs, Stripe, PayPal, cards). Payments are **manual** only.
5. Automatic provisioning through upstream APIs (cPanel/WHM API, reseller APIs). All provisioning is done by the owner outside the app.
6. Customer accounts, passwords, social login, magic links, sessions for customers, customer dashboards beyond the status lookup.
7. Storing, displaying, generating or emailing **hosting/cPanel/FTP/database passwords or any credentials**. No password field in any form, table or log.
8. Support ticket system, live chat, chatbots, community forum, knowledge base beyond the FAQ page.
9. Multiple admins, staff roles, permissions UI, team features. (`admin_users.role` exists with only `owner`.)
10. Coupons, discounts, affiliates, referrals, upsells, add-ons, multiple billing cycles, multi-currency, tax/VAT invoice generation, PDF invoices/receipts.
11. SMS gateways, push notifications, Telegram/WhatsApp Business API automation. (WhatsApp is **click-to-chat links only**.)
12. Reviews, testimonials, ratings, uptime counters, status page, "99.9%" style claims, customer-count counters, trust badges not supplied by the owner.
13. Blog/CMS, SEO plugins, A/B testing, third-party analytics/pixels (only Cloudflare Web Analytics is allowed).
14. Languages other than Bangla and English; right-to-left layouts.
15. Self-service data deletion/export for customers (handled manually on request; see [04_TRD §8]).
16. Mobile apps, PWA install flows, offline mode, realtime/websocket features.
17. Any server, VM or database outside Cloudflare + Resend (no Supabase, Firebase, Vercel, AWS) unless 04_TRD is amended with owner approval.

## 6. Constraints (from the brief — binding on every doc)

- Hosting only; never claim HOSTNEIL owns servers/data centers.
- An order is **never** Paid until an admin verifies trx ID **and** amount ([05_Schema §6]).
- BDT; Bangla + English; mobile-first; fast on slow links ([03_UI_Spec §9]).
- Package limits are editable data ([05_Schema §3 packages, package_features]).
- Free tiers wherever possible; starting budget ≈ BDT 5,000 ([04_TRD §1]).
