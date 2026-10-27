# SNK Architect — Phase 1 prototype
Design Beyond Imagination. · Design • Build • Visualize

## Implemented now
- Responsive site: `index.html`, `services.html`, `portfolio.html`, `contact.html`
- Real Three.js room (r160 via pinned CDN import map): floor, walls with window and door, ceiling, furniture
- Orbit / zoom / pan, reset view, wall colour, floor material, day / evening / night lighting, furniture toggles, fullscreen (where supported), PNG screenshot, loading + error states, resize handling, resource disposal
- Portfolio and inquiry form driven by `js/site.js` (empty until you add real data)

## Not implemented (future plans)
AI redesign, accounts, saved projects, GLB/GLTF models, textures, before/after comparison, estimates, backend.
The 2D–6D page is a service description only.

## Run locally (do NOT open index.html by double-click: ES modules need a server)
    cd snk-architect
    python3 -m http.server 8000      # then open http://localhost:8000
(or VS Code "Live Server")

## Deploy on GitHub Pages
1. Create a repository, upload the contents of this folder (index.html at the top level).
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Open the published URL and test every page on a phone and a desktop. All paths are relative.

## Before publishing
- Put your real email in `js/site.js` (`email`). Until then the form is disabled on purpose.
- Add only real projects to `projects`. No contact details, testimonials or projects were invented.

## Known limitations
- Materials are plain colour + roughness (no textures yet). Real-time graphics ≠ offline renders.
- Front wall is removed on purpose (cutaway view). Ceiling is see-through from above.
- Light intensities were chosen without a visual test; adjust `LIGHTS` in `js/main.js` if too dark/bright.
- Needs internet (Three.js loads from jsDelivr) and WebGL.

## Assets / licenses
No images, textures or models are used. Three.js is MIT licensed (loaded from jsDelivr).

## Files not created (and why)
`camera.js, materials.js, lighting.js, furniture.js, controls.js, export.js`, `responsive.css`, `studio.css`: merged into `js/main.js` and `css/style.css` to keep the first prototype small; split them when a feature outgrows the file.
