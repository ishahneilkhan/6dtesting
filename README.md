# SNK Architect — GitHub Pages Starter

A premium, responsive architecture/interior concept website with a basic interactive Three.js room preview.

**Brand line:** Design Beyond Imagination  
**Palette:** Charcoal `#111820`, slate `#202A34`, champagne gold `#D7B77B`, warm white `#F7F5F0`, cool grey `#B8C0C8`.

## Included

- Responsive landing page
- Services and project process sections
- Three.js room scene with orbit/zoom controls
- Wall colour, floor finish, and lighting controls
- GitHub Pages-ready static files
- Project planning documents in `docs/`

## Run locally

Because `script.js` uses JavaScript modules, open this folder with a local web server instead of opening `index.html` directly.

Quick options:
- VS Code + Live Server extension
- Python: `python -m http.server 8000`, then open `http://localhost:8000`

No build step or npm install is required. Three.js and Google Fonts load from CDNs, so internet access is needed.

## Publish with GitHub Pages

1. Create a GitHub repository named `snk-architect` (or another name).
2. Upload all files and folders from this ZIP to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then click **Save**.
6. Wait for GitHub to publish the site; the URL will appear on the Pages settings screen.

If using a custom domain, configure the domain's DNS records as instructed by GitHub Pages, then add the domain in the repository's Pages settings.

## Important prototype notes

- This is a visual starter, not a construction-ready architectural model.
- The current 3D room is assembled from simple Three.js geometry. It is not yet photorealistic.
- For realistic final renders, consider Blender rendering, high-quality PBR textures, proper architectural models, and an optimized asset workflow.
- Replace the placeholder contact email in `index.html` with your real business email.
- Add real portfolio images, accurate service descriptions, and business contact details before launching publicly.

## Project files

- `index.html` — page structure
- `style.css` — visual system and responsive layout
- `script.js` — Three.js scene and controls
- `docs/` — full project brief and Claude handoff prompt
