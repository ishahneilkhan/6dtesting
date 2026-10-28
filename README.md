# SNK Architect — Real Walkthrough Prototype

A responsive GitHub Pages project concept for SNK Architect. Includes a multi-section marketing site and a Three.js interactive architecture prototype with interior/exterior modes, first-person movement, mouse/touch look, materials, floor finishes, lighting presets, fullscreen, and PNG screenshots.

## Files
- `index.html` — page structure and import map
- `styles.css` — responsive visual system and layouts
- `js/main.js` — Three.js scene and UI interactions

## Run locally
Because this uses JavaScript modules, open the folder through a local static server instead of double-clicking `index.html`. For example, if Python is installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages
1. Back up the current repository before replacing files.
2. Upload `index.html`, `styles.css`, and the `js` folder to the repository root.
3. Commit the changes. GitHub Pages should serve the root `index.html`.

## Important limitations
- This is an interactive real-time 3D prototype, not a production photorealistic walkthrough or literal physical “5D” experience.
- Geometry is generated in code and simplified. High-end realism needs professionally authored models, detailed PBR textures, optimized lighting, and testing on target devices.
- Three.js is loaded from `unpkg.com`; Google Fonts and portfolio reference photos load externally, so internet access is required.
- Contact form prepares an email using `mailto:` and does not submit to a server. Replace `hello@snkarchitect.com` with the real contact address before launch.
- Camera collision is approximate; the walkthrough currently clamps movement to a room/yard area rather than solving detailed wall and furniture collisions.


## Premium brand update
- Logo: `assets/snk-architect-logo.svg`
- Favicon: `assets/favicon.svg`
- Admin preview: open `admin.html`
- The static admin preview saves in localStorage on the current browser only. It does not publish edits or provide secure multi-user administration. Commit edited site files to GitHub to publish public changes.
