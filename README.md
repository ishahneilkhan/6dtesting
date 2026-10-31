# HOSTNEIL

Website + order flow for a white-label web hosting reseller (Bangladesh). Full spec in [`docs/`](docs).

## Live site (GitHub Pages)
Files at the repo root (`index.html`, `en/`, `assets/` ...) are the website. Bangla is default; English is under `/en/`.
Set Pages to: Settings -> Pages -> Deploy from branch -> `main` / `(root)`.

## Edit without coding
- `assets/config.js` : WhatsApp number, email, bKash/Nagad/bank details (empty = hidden).
- `assets/packages.json` : prices and package limits (add limits only after your provider confirms them).
After editing text in `tools/build.mjs`, run `node tools/build.mjs` and commit the generated files.

## Next steps
Order submission, status check and the admin Console need the Cloudflare Worker + D1 (see `docs/06_Plan.md`).
Until `API_BASE` in `assets/config.js` is set, orders go to you via WhatsApp.
Never commit secrets. This repo's `assets/config.js` is public.
