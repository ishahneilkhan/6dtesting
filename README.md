# HOSTNEIL

Website + order flow + HOSTNEIL Console for a white-label web hosting reseller (Bangladesh).
Stack: Cloudflare Pages (Astro) + Workers (Hono) + D1. Full spec in [`docs/`](docs).

## Start
1. Create a **private** GitHub repo and push this folder.
2. Open the repo in Claude Code or Cursor. The agent reads `CLAUDE.md` / `.cursorrules` and all 6 files in `docs/`.
3. Tell it: "Do the next unticked step in docs/06_Plan.md." Repeat. Steps marked (OWNER) need you in a Cloudflare/Resend dashboard.

Never commit secrets (`.dev.vars`, `.env`, `backups/`). Secrets go in `wrangler secret put`.
