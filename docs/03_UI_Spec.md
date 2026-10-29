# 03_UI_Spec — Design System

Related: [01_PRD](01_PRD.md) · [02_AppFlow](02_AppFlow.md) · [04_TRD](04_TRD.md) · [05_Schema](05_Schema.md) · [06_Plan](06_Plan.md)
Implementation: plain CSS with custom properties in `apps/web/src/styles/{tokens,base,components}.css` ([04_TRD §4]); no CSS framework. Token names below are the exact CSS variable names.

## 1. Principles and content rules

Look: **premium, modern technology brand** — deep navy, one confident electric-blue primary, a teal-cyan accent, generous whitespace, crisp 1 px borders, large clean type, subtle gradient only in the hero. Calm and trustworthy, not flashy. Mobile-first: design at 360 px, enhance upward.

Content rules (binding on every string and component; checked in [06_Plan P4]):
- **R1** No invented numbers: no uptime %, speeds, customer counts, years in business, "since 20xx", disk/bandwidth figures. Only prices and package limits that come from data ([05_Schema §3.3–3.4]).
- **R2** No reviews, testimonials, star ratings, "trusted by", awards or trust badges unless the owner supplies real ones as editable content (none in MVP).
- **R3** No unsupported guarantees or promises: no "99.9%", "24/7", "instant setup", "free migration", "money-back" unless the owner has put that exact text in the Refund Policy / settings.
- **R4** Never say or imply HOSTNEIL owns servers or data centers. Avoid "our servers/data center/infrastructure". Show `upstream_disclosure_*` in the footer, About and Terms.
- **R5** No superlatives ("best", "fastest", "#1", "unlimited").
- **R6** Next to every free-text field that a customer or admin fills (order note, contact message, provision dialog) show: "Never write passwords or login details here." / "কখনো পাসওয়ার্ড বা লগইন তথ্য এখানে লিখবেন না।"
- **R7** Honest status wording: never display "Paid" before an admin verified it; use "Payment received — verifying" ([02_AppFlow §4.3]).
- **R8** Every user-visible string exists in `bn.json` and `en.json` (build fails on a missing key). Bangla is written naturally, not word-for-word; technical terms (hosting, domain, cPanel, bKash, Nagad, WhatsApp) keep one consistent spelling per language. Do not reproduce bKash/Nagad logos — use text labels.
- **R9** Latin digits in both languages (PRD A3). Dates: `29 Oct 2026` (en), `29 অক্টোবর 2026` (bn). Prices: `৳1,499`. Phones are shown as the customer typed them and stored as `+8801…`.

## 2. Colour tokens

All text/background pairs below were computed against WCAG 2.2 contrast (ratio shown); body text ≥ 4.5:1, large text/UI components ≥ 3:1.

### 2.1 Light theme (default `:root`)
| Token | Hex | Use | Contrast note |
|---|---|---|---|
| `--bg` | `#F7F9FC` | page background | – |
| `--surface` | `#FFFFFF` | cards, inputs, dialogs | – |
| `--surface-2` | `#EEF2F8` | alt sections, table header, neutral badge bg | – |
| `--border` | `#D8E0EC` | dividers, card borders (decorative) | – |
| `--border-strong` | `#74839E` | input/checkbox borders (UI component) | 3.83 on `--surface` |
| `--text` | `#0B1220` | body, headings | 17.75 on `--bg`, 18.72 on `--surface` |
| `--text-muted` | `#4A5872` | secondary text | 6.80 on `--bg`, 6.38 on `--surface-2` |
| `--primary` | `#2F4BF2` | buttons, links, focus | 5.84 on `--bg` (link), 6.16 with white text |
| `--primary-hover` | `#2339D1` | hover | – |
| `--primary-active` | `#1B2CA8` | pressed | – |
| `--on-primary` | `#FFFFFF` | text on primary | 6.16 |
| `--link` | `#2F4BF2` | text links | 5.84 on `--bg` |
| `--accent` | `#0E7490` | secondary highlights, icons | 5.36 on white |
| `--success` / `--success-bg` | `#166534` / `#E7F6EC` | badges, alerts | 6.38 (7.13 on white) |
| `--warning` / `--warning-bg` | `#92400E` / `#FEF3C7` | | 6.37 |
| `--danger` / `--danger-bg` | `#B91C1C` / `#FDECEC` | errors | 5.66; white on `--danger` 6.47 |
| `--on-danger` | `#FFFFFF` | text on danger button | 6.47 |
| `--info` / `--info-bg` | `#1B2CA8` / `#E8ECFF` | | 9.06 |
| `--overlay` | `rgba(11,18,32,.55)` | dialog backdrop | – |
| `--focus-ring` | `#2F4BF2` | 2 px ring, 2 px offset | 5.84 |

### 2.2 Dark theme (`:root[data-theme="dark"]`)
| Token | Hex | Contrast note |
|---|---|---|
| `--bg` | `#0A0F1C` | – |
| `--surface` | `#111827` | – |
| `--surface-2` | `#1A2336` | – |
| `--border` | `#263248` | decorative |
| `--border-strong` | `#5C6B88` | 3.56 on `--bg`, 3.31 on `--surface` |
| `--text` | `#E8EDF7` | 16.29 on `--bg`, 15.11 on `--surface` |
| `--text-muted` | `#9AA8C2` | 7.97 on `--bg`, 6.54 on `--surface-2` |
| `--primary` | `#5B7CFF` | button bg |
| `--primary-hover` | `#7692FF` | |
| `--primary-active` | `#4A68E6` | |
| `--on-primary` | `#0A0F1C` | 5.26 on `--primary` |
| `--link` | `#8AA2FF` | 7.92 on `--bg`, 7.34 on `--surface` |
| `--accent` | `#22D3EE` | 10.58 on `--bg` |
| `--success` / `--success-bg` | `#4ADE80` / `#0F2A1B` | 8.81 |
| `--warning` / `--warning-bg` | `#FBBF24` / `#2B2108` | 9.50 |
| `--danger` / `--danger-bg` | `#F87171` / `#2E1316` | 6.22 |
| `--on-danger` | `#0A0F1C` | 6.91 on `--danger` |
| `--info` / `--info-bg` | `#8AA2FF` / `#17224A` | 6.37 |
| `--overlay` | `rgba(0,0,0,.65)` | |
| `--focus-ring` | `#8AA2FF` | |

### 2.3 Brand gradient (both themes, hero and logo mark only)
`--gradient-brand: linear-gradient(135deg, #0B1B4D 0%, #2F4BF2 62%, #0E7490 100%)`. White text on any point of it ≥ 5.36:1 (start 16.43, mid 6.16, end 5.36). Optional decorative dot grid: inline SVG data-URI ≤ 1 KB at 8 % opacity.

### 2.4 Status badge map (colour + icon + text; never colour alone)
| Value | Token pair | Icon |
|---|---|---|
| order `pending_payment` | warning | clock |
| order `paid` | info | check |
| order `provisioned` | info | box |
| order `active` / service `active` | success | check-circle |
| service `expiring` | warning | alert-triangle |
| service `expired` | danger | x-circle |
| order `cancelled`, `refunded` | neutral (`--surface-2` bg, `--text-muted` text) | ban / undo |
| payment `submitted` / `verified` / `rejected` | warning / success / danger | clock / check / x |

## 3. Typography

### 3.1 Fonts (self-hosted, no third-party font requests)
| Family token | File(s) in `apps/web/public/fonts/` | Weights | `unicode-range` |
|---|---|---|---|
| `HN Inter` | `inter-latin-var.woff2` (Inter, variable, Latin subset) | 400–700 | `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122` |
| `HN Bengali` | `hind-siliguri-bn-400.woff2`, `hind-siliguri-bn-600.woff2` (Hind Siliguri subset) | 400, 600 | `U+0980-09F2, U+09F4-09FF, U+200C-200D, U+25CC` |
| `HN Taka` | `hind-siliguri-taka-400.woff2`, `-600.woff2` (only glyph `৳`) | 400, 600 | `U+09F3` |
Both families are SIL OFL; commit `LICENSE-OFL.txt` next to the files. Subset with `pyftsubset` at setup (one-time developer step, [06_Plan P3]); if the agent cannot download the fonts it must ask the owner to supply them. `@font-face { font-display: swap; }`. Preload only `inter-latin-var.woff2` on all pages and `hind-siliguri-bn-400.woff2` on `/` Bangla pages. The English pages never download the Bengali files (the `৳` comes from the tiny `HN Taka` files).

```
--font-sans: "HN Inter", "HN Taka", "HN Bengali", "Noto Sans Bengali", "Nirmala UI", "Bangla Sangam MN", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;   /* Order IDs, trx IDs */
```
One stack serves both languages: Inter lacks Bengali glyphs, so the browser falls through to `HN Bengali`, and Latin digits/letters stay Inter in Bangla text. Set `font-synthesis: none` (no fake bold/italic).

### 3.2 Bangla handling rules (`:lang(bn)` / `html[lang="bn"]`)
- Root size **17 px** for `bn` (16 px for `en`) because Bengali glyphs render smaller at equal px: `html[lang="bn"] { font-size: 106.25%; }`; everything else uses `rem`.
- Line height body **1.75**, headings **1.4** (en: 1.5 / 1.2) — Bengali matras and conjuncts need room.
- `letter-spacing: 0` always; **never** `text-transform: uppercase`; **no italics** (`font-style: normal`; emphasise with weight 600 or colour); heading weight 600 (no 700 file) vs 700 in English.
- `word-break: normal; overflow-wrap: break-word; hyphens: manual;` — no automatic hyphenation. Headings `text-wrap: balance`, paragraphs `text-wrap: pretty`.
- Never truncate Bangla with `…` mid-word in important text; allow wrapping. Buttons/labels may wrap to two lines instead of shrinking.
- Latin digits everywhere (PRD A3). Number inputs accept Bangla digits `০-৯` and normalise to Latin (`packages/shared/src/phone.ts`).
- Always set `lang` on the `<html>` and on any inline foreign-language run (`<span lang="en">`).
- Test strings with conjuncts (e.g. "ক্ষ", "স্ট্র", "দ্ব") in Chrome Android and Safari iOS before launch ([06_Plan P4]).

### 3.3 Scale (rem; multiplied by root size)
| Token | Size | Line height en / bn | Weight | Use |
|---|---|---|---|---|
| `--text-xs` | 0.8125rem | 1.4 / 1.6 | 400/600 | badges, captions |
| `--text-sm` | 0.875rem | 1.5 / 1.7 | 400 | helper text, table cells |
| `--text-base` | 1rem | 1.5 / 1.75 | 400 | body, inputs (never < 16 px effective, avoids iOS zoom) |
| `--text-lg` | 1.125rem | 1.5 / 1.7 | 400/600 | lead paragraph |
| `--text-xl` | 1.25rem | 1.35 / 1.6 | 600 | card titles |
| `--text-2xl` | 1.5rem | 1.3 / 1.5 | 700/600 | h3 |
| `--text-3xl` | `clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem)` | 1.2 / 1.4 | 700/600 | h2 |
| `--text-4xl` | `clamp(2rem, 1.5rem + 2.5vw, 3rem)` | 1.15 / 1.4 | 700/600 | h1 inner pages |
| `--text-5xl` | `clamp(2.25rem, 1.6rem + 3.5vw, 3.75rem)` | 1.1 / 1.35 | 700/600 | hero h1 |
Numbers in tables/prices: `font-variant-numeric: tabular-nums`. Price emphasis: amount `--text-3xl` weight 700, unit "/ year" `--text-sm` muted.

## 4. Spacing, layout, breakpoints

- Spacing tokens (4 px base): `--space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 24 · `-6` 32 · `-7` 48 · `-8` 64 · `-9` 96. Use only these.
- Page gutter 16 px (<768), 24 px (≥768), 32 px (≥1280). Marketing container max-width **1120 px**; Console content max-width **1280 px**; forms max-width **560 px**; prose (legal/FAQ) max-width **68ch**.
- Section vertical padding: 48 px (mobile) / 96 px (≥1024).
- Breakpoints (min-width, mobile-first): `--bp-sm` 480 · `--bp-md` 768 · `--bp-lg` 1024 · `--bp-xl` 1280.
- Grids: pricing/package cards `repeat(auto-fit, minmax(260px, 1fr))` with gap `--space-5`; 1 column < 768, 2 columns ≥ 768, 3 ≥ 1024.
- Touch targets ≥ **44 × 44 px**, ≥ 8 px between adjacent targets. Admin desktop density may use 36 px controls only at ≥ 1024 px with a fine pointer (`@media (pointer: fine)`).
- Header height 64 px, sticky; Console sidebar 248 px.
- Z-index: header 100 · dropdown 200 · dialog 300 · toast 400.

## 5. Radius, elevation, motion
- Radius: `--radius-sm` 8 · `--radius-md` 12 · `--radius-lg` 20 · `--radius-pill` 999.
- Elevation (light): `--shadow-sm: 0 1px 2px rgba(11,18,32,.06)`; `--shadow-md: 0 8px 24px rgba(11,18,32,.08)`; `--shadow-lg: 0 20px 48px rgba(11,18,32,.12)`. Dark theme: shadows off; use `border: 1px solid var(--border)` and `--surface-2` for raised layers.
- Motion: hover/focus transitions 150 ms `ease-out`; dialog/menu 200 ms; skeleton shimmer 1.2 s. `@media (prefers-reduced-motion: reduce)` → all transitions/animations `0.01ms`, shimmer static.

## 6. Theme rules
- Three user choices: `system` (default), `light`, `dark`; stored in `localStorage['hn-theme']` inside try/catch.
- `public/theme-init.js` (≤ 400 bytes, external, loaded synchronously in `<head>`, no inline script because of CSP) sets `document.documentElement.dataset.theme` to `light|dark` from the stored choice or `matchMedia('(prefers-color-scheme: dark)')`, and updates on OS change when choice is `system`.
- CSS: light tokens on `:root`; dark tokens under `:root[data-theme="dark"]` **and** under `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }` (works with JS off). Set `color-scheme: light dark` and `meta theme-color` per theme.
- Components must use tokens only — no raw hex outside `tokens.css`. SVG icons use `currentColor`. No images with baked-in backgrounds.
- Each screen must be reviewed in both themes at 360 px and 1280 px.

## 7. Core components and states

Common: min height 44 px; focus-visible ring `outline: 2px solid var(--focus-ring); outline-offset: 2px`; disabled = `opacity .5`, `cursor: not-allowed`, no hover; all interactive states reachable by keyboard.

| Component | Variants | States and specs |
|---|---|---|
| **Button** | primary, secondary, ghost, danger; sizes md (44 px), sm (36 px, admin desktop) | default · hover (`--primary-hover`) · focus-visible · active (`--primary-active`, 1 px translate-y) · disabled · **loading** (spinner replaces label/icon, width locked, `aria-busy="true"`, click ignored). primary = `--primary` bg + `--on-primary`; secondary = `--surface` bg + 1 px `--border-strong` + `--text`; ghost = transparent + `--link`; danger = `--danger` bg + `--on-danger`. Radius `--radius-md`; padding 12 × 20; label weight 600 |
| **Input / Textarea / Select** | – | label always visible above (never placeholder-only) · helper text `--text-sm` muted · default (1 px `--border-strong`) · hover (border `--text-muted`) · focus (2 px `--primary` ring) · filled · **error** (border `--danger`, message with icon below, `aria-invalid`, `aria-describedby`) · disabled (`--surface-2`) · read-only (no border emphasis). Height 48 px, radius `--radius-md`, font ≥ 16 px. Phone: `inputmode="tel"`, `autocomplete="tel"`; email `type="email"`; name `autocomplete="name"` |
| **Checkbox / Radio** | – | 24 px visual in a 44 px hit area · unchecked · checked · focus · error · disabled; label clickable |
| **Switch** (admin) | – | on/off/focus/disabled, `role="switch"` |
| **Badge** | status map §2.4, neutral | pill, `--text-xs`, 600, icon + label; padding 4 × 10 |
| **Card** | default, package, tile (admin dashboard) | surface bg, 1 px `--border`, `--radius-lg`, padding `--space-5`; hover (only if clickable) border `--primary`; package card: name, tagline, price block, divider, feature list (label muted / value text), full-width primary [Choose]; **no "popular/best" ribbons** (R2/R5) |
| **Alert** | info, success, warning, error | tinted bg + 1 px border in the same hue, icon, title optional; error uses `role="alert"`, others `role="status"`; dismiss optional |
| **Toast** (admin) | success, error | bottom-center on mobile, bottom-right ≥ 1024; success auto-dismiss 4 s; error stays until dismissed; `aria-live="polite"` |
| **Dialog** | confirm, form | focus trap, `Esc` closes (except while submitting), initial focus on first field, returns focus to trigger, backdrop `--overlay`; destructive confirm does not close on backdrop click; max-width 520 px; bottom-sheet style < 480 px |
| **Table** (admin) | – | sticky header `--surface-2`; row hover `--surface-2`; numeric columns right-aligned tabular; < 768 px each row becomes a card with label/value pairs; sort indicators only where server sorts |
| **Tabs** | – | `role="tablist"`; selected = 2 px `--primary` underline + text colour; keyboard arrows |
| **Stepper (order progress)** | 4 steps | completed (filled primary + check) · current (ring) · upcoming (border) · cancelled/refunded replaced by banner; horizontal ≥ 480 px, vertical below |
| **Accordion** | – | native `<details>/<summary>`, chevron rotates, 44 px summary height |
| **Skeleton** | line, card, tile | `--surface-2` shape with shimmer; reserves final height (no CLS) |
| **EmptyState** | – | 48 px line icon (`--text-muted`), one sentence, optional button |
| **CopyButton** | – | label "Copy" → "Copied" for 2 s (`aria-live="polite"`) |
| **Header/Nav** | desktop bar, mobile panel | sticky, bottom border `--border`; active link underline; mobile panel full width, 56 px rows, focus trap |
| **LangSwitch / ThemeToggle** | – | 44 px icon/text buttons with `aria-label`; LangSwitch label is the *other* language ("EN" on bn pages, "বাংলা" on en pages) |
| **Pagination** | – | prev/next + "Page x of y", 44 px targets |
| **Copyable ID** | – | Order IDs/trx IDs in `--font-mono`, `user-select: all`, with CopyButton |

Icons: inline SVG sprite (`src/components/icons.svg`), 24 px grid, stroke 1.75, round caps, `currentColor`; only icons that are used. Needed: menu, x, check, check-circle, x-circle, clock, alert-triangle, info, copy, chat, phone, mail, ban, undo, box, chevron-down, sun, moon, monitor, external-link, search, download.

## 8. Page patterns
- **Marketing page**: header → hero (gradient, `--text-5xl` h1, one-sentence lead, two buttons, no stock photo) → sections alternating `--bg` / `--surface-2` → footer. One `h1` per page; heading levels never skip.
- **Logo**: text wordmark "HOSTNEIL" (Inter 700, `letter-spacing: .04em` — Latin only, so allowed) + 28 px rounded-square mark filled with `--gradient-brand` containing a white geometric "H". No server/rack imagery (R4).
- **Form page**: single column ≤ 560 px, order summary card sticky on ≥ 1024 px beside the form, error summary at top on submit.
- **Status page**: result card with stepper and badge; next-step text in `--text-lg`.
- **Console**: left sidebar (≥ 1024) / top bar + drawer (mobile); content max 1280; page title row with primary action on the right; filters in a wrapping row; tables → cards on mobile; dialogs for every state change ([02_AppFlow §3]).
- **Dashboard tile**: label, large count (`--text-3xl`), link; tile border turns `--warning` when count > 0 for "needs action" tiles.

## 9. Performance and accessibility budgets
(Targets for slow mobile; enforced by a build-time check script and Lighthouse in [06_Plan P4].)
- Marketing page first load, compressed: HTML ≤ 30 KB; CSS ≤ 25 KB total; **fonts ≤ 90 KB** on a Bangla page (Inter Latin var + Hind Siliguri 400 + 600 + Taka); JS: **0 KB** on static content, PricingGrid ≤ 10 KB, OrderForm/PaymentForm/StatusLookup/ContactForm ≤ 25 KB each (excluding Turnstile), each Console route ≤ 80 KB. Total first-load transfer ≤ 120 KB excluding Turnstile script ([01_PRD §4]).
- No raster images in the MVP. If one is ever added: AVIF/WebP, ≤ 60 KB, explicit `width`/`height`, `loading="lazy"` below the fold.
- Load the Turnstile script **only** on pages with a form, and only when the form is near the viewport (IntersectionObserver) or focused.
- LCP element is text (h1). CLS ≤ 0.05 (skeletons reserve space; `font-display: swap` with a metric-matched fallback via `size-adjust`). INP ≤ 200 ms.
- Test profile: Chrome DevTools "Slow 4G" + 4× CPU slowdown, 360 × 800 viewport; real-device check on a low-end Android.
- Accessibility: WCAG 2.2 AA; skip-to-content link; visible focus; all inputs labelled; error messages programmatically associated; `lang` correct; no information by colour alone; dialogs/menus keyboard-operable; `prefers-reduced-motion` honoured; zoom to 200 % without horizontal scroll.
