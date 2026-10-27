# SNK Architect — Full Architecture Studio starter

A responsive single-page website with a procedural Three.js concept scene for interior and exterior, orbit/zoom/pan controls, colour controls, environment lighting presets, furniture options, fullscreen and PNG screenshot.

## Run locally
Because `index.html` uses JavaScript ES modules, serve this folder from a local web server (not `file://`). You can use VS Code Live Server, or upload the files to GitHub Pages.

## Deploy to the existing GitHub Pages repository
1. Download a backup of the existing repository / `index.html` first.
2. Extract this ZIP.
3. Upload `index.html` and `README.md` to the root of the existing repository `6dtesting.github.io` and replace the old `index.html` only after keeping a backup.
4. Commit changes and wait for GitHub Pages to rebuild.

## Important limitations
- This is a new starter implementation, not a merged upgrade of the current website source, because the current source code was not provided in the chat. Existing custom features from the live site may not all be preserved.
- The scene is generated from basic Three.js geometry. It is an interactive prototype, not production-grade photorealistic rendering or an architecturally accurate model.
- Three.js is loaded from jsDelivr CDN, so internet access is needed.
- Replace the demo contact email `hello@snkarchitect.com` with the real address before publishing.
