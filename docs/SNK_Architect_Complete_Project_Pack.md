# SNK Architect — Complete Project Pack
**Final project brief, feature roadmap, technical plan, and Claude master prompt**  
**Brand tagline:** *Design Beyond Imagination.*  
**Supporting line:** *Design • Build • Visualize*

---

## 1. Project vision

SNK Architect is planned as a premium architecture and interior visualization website. The first version should be affordable to build and host, with a working interactive 3D room/house preview made using HTML, CSS, JavaScript, and Three.js.

The immediate goal is **not** to claim that a full AI architecture platform already exists. First deliver a reliable website and a genuinely interactive 3D studio. Add AI image generation, accounts, saved projects, and advanced estimating only when the relevant integrations and infrastructure are ready.

### Primary goals
- Present SNK Architect as a premium, credible design and visualization brand.
- Show a real interactive 3D interior scene, not a static image presented as 3D.
- Let visitors change selected materials, wall color, and lighting.
- Showcase house exteriors and interior concepts in a portfolio.
- Collect project inquiries through a clear contact form.
- Keep the first release low-cost and compatible with GitHub Pages.
- Structure code so future models, features, and services can be added without rebuilding everything.

### Non-goals for the first release
- No paid AI API requirement.
- No user accounts or database requirement.
- No fake AI buttons or pretend functionality.
- No claim that a concept render is a construction-ready drawing.
- No structural engineering, permit approval, or guaranteed final construction-cost calculation.

---

## 2. Brand identity and visual direction

- **Brand name:** SNK Architect
- **Tagline:** Design Beyond Imagination.
- **Supporting line:** Design • Build • Visualize
- **Design mood:** Premium, architectural, modern, minimal, editorial, confident.
- **Primary palette:**
  - Deep charcoal: `#111820`
  - Slate: `#202A34`
  - Champagne gold: `#D7B77B`
  - Warm white: `#F7F5F0`
  - Cool grey: `#B8C0C8`
- Use generous spacing, strong typography, restrained gold accents, clear hierarchy, and high-quality architectural imagery.
- Avoid clutter, excessive glow effects, generic template appearance, and too many decorative gradients.
- Use the SNK Architect name consistently. Do not invent a logo file; if no logo asset is supplied, use a clean text wordmark that can later be replaced.

---

## 3. Target visitors and service categories

### Target visitors
- Homeowners planning a new house or renovation.
- People exploring interior design concepts.
- Small property developers and real-estate professionals.
- Clients needing architectural visualization and presentation material.
- Businesses needing concept visuals for spaces.

### Planned service categories
1. Interior design concepts and visualization.
2. House exterior and facade visualization.
3. 3D architectural modeling and walkthrough concepts.
4. Material, color, and lighting studies.
5. Design presentation boards and project proposals.
6. Early-stage floor-plan visualization.
7. Future AI-assisted room redesign, once a suitable service is integrated.

Use accurate labels. Do not claim licensed architectural, structural, or engineering services unless qualified professionals are actually engaged.

---

## 4. Feature priority

### Priority 1 — Working website and 3D core
- Responsive homepage and navigation.
- Real Three.js room scene containing a floor, walls, ceiling, window, door, and simple furniture.
- Orbit, zoom, pan, and reset-camera controls.
- Wall-color selector.
- Floor color/material selector.
- Daylight/night lighting presets.
- Responsive canvas resizing.
- Clear loading and error states.

### Priority 2 — Improve visualization quality
- Physically based materials where appropriate.
- Correct material roughness/metalness and sensible texture mapping.
- Realistic proportions and clean scene composition.
- Soft shadows and sensible lighting.
- Performance-aware settings for mobile.
- Optional loading of GLB/GLTF models with a graceful fallback if a model fails to load.

### Priority 3 — Portfolio and presentation
- Portfolio categories: living room, bedroom, kitchen, bathroom, house exterior.
- Project cards with image, short description, and service category.
- Project detail layout with design intent and materials.
- Before/after concept comparison.
- Screenshot export of the current 3D view where supported.
- Project inquiry form with validation and honest success/error feedback.

### Priority 4 — House visualization
- Separate room and exterior scenes or a clear route to switch between them.
- House model loading through GLB/GLTF.
- Day/night and material variants.
- Optional walkthrough mode if it can be implemented reliably.
- Use optimized models and textures; do not overload mobile devices.

### Priority 5 — Future AI and business tools
These are future extensions, not Phase 1 functionality:
- AI room redesign from an uploaded photo.
- Text-to-image or image-to-image design concepts.
- User accounts and saved projects.
- Client dashboard and revision history.
- Quotation workflow and project status.
- Editable budget estimates using local rates.
- Material/vendor library.
- PDF presentation export.

AI image generation generally requires a suitable external model/service. Do not expose secret API keys in frontend code. A secure backend or serverless function may be needed for production integrations.

---

## 5. 2D–6D service framework

Use these terms as SNK Architect's explanatory service framework. Definitions vary across the industry, so label them clearly instead of presenting one universal standard.

- **2D — Plan:** floor plans, layouts, dimensions, and basic spatial organization.
- **3D — Visualize:** 3D rooms, houses, materials, and camera views.
- **4D — Time:** construction sequencing or time-linked project visualization.
- **5D — Cost:** estimated costs connected to quantities and editable rates.
- **6D — Sustainability / lifecycle:** energy, environmental, maintenance, and lifecycle considerations.

For the first release, these can be presented as service descriptions. Do not imply the website already performs construction scheduling, verified quantity takeoffs, energy simulation, or professional engineering calculations unless those systems are actually implemented and validated.

---

## 6. Recommended website structure

### Pages
- `index.html` — Home and primary 3D studio entry.
- `services.html` — Services and 2D–6D framework.
- `portfolio.html` — Projects and visualization gallery.
- `contact.html` — Inquiry form and contact details.

### Suggested home page sections
1. Header and navigation.
2. Hero section with tagline and primary call to action.
3. Featured interactive 3D preview.
4. Services.
5. Featured portfolio.
6. “How it works” / 2D–6D overview.
7. Why SNK Architect.
8. Project inquiry call to action.
9. Footer with contact and social links.

Do not invent phone numbers, email addresses, office addresses, customer testimonials, completed projects, or social links. Use editable placeholders until verified information is provided.

---

## 7. Recommended file structure

```text
snk-architect/
├── index.html
├── services.html
├── portfolio.html
├── contact.html
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── studio.css
├── js/
│   ├── main.js
│   ├── scene.js
│   ├── camera.js
│   ├── materials.js
│   ├── lighting.js
│   ├── furniture.js
│   ├── controls.js
│   └── export.js
├── assets/
│   ├── images/
│   ├── textures/
│   ├── models/
│   └── icons/
└── README.md
```

If a file is not needed yet, explain why instead of generating empty files. If the output is too large, provide files in numbered batches and maintain a checklist of what has been delivered.

---

## 8. Technical requirements

- Use HTML5, CSS3, vanilla JavaScript ES modules, and Three.js.
- Use `OrbitControls` for camera navigation.
- Use `GLTFLoader` when loading external GLB/GLTF assets.
- Pin or document library versions rather than relying on unexplained version changes.
- For a basic static prototype, use a local development server because ES modules may not work correctly when opening `index.html` directly with `file://`.
- Make relative asset paths work when deployed to a GitHub Pages project subpath.
- Avoid unnecessary frameworks and dependencies.
- Add accessible labels, keyboard-friendly controls, and clear focus states.
- Provide fallbacks and error messages for missing textures/models.
- Ensure the canvas resizes when the browser window or containing element changes size.
- Dispose of unused Three.js geometries, materials, and textures when appropriate.
- Keep performance suitable for common mobile devices; avoid excessive polygons, huge textures, and unnecessary real-time effects.
- Every visible button must work or be clearly marked as unavailable.
- Do not put private keys or secrets in client-side JavaScript.
- Do not use fake buttons, fabricated metrics, or nonfunctional “AI” claims.
- Keep comments and setup instructions clear enough for a beginner to follow.

---

## 9. Photorealistic visualization guidance

A browser-based Three.js scene can be attractive and interactive, but it will not automatically equal a high-end offline architectural render. Quality depends on the model, textures, lighting, material setup, color management, and rendering pipeline.

For better results:
- Use well-made, correctly scaled GLB/GLTF assets.
- Use legally usable textures and models.
- Set material roughness and metalness according to the material.
- Avoid overexposed lighting and overly dark corners.
- Use shadow quality appropriate to the device.
- Include a quality/performance setting only if it can be implemented and tested.
- Use high-quality rendered images in the portfolio alongside the interactive 3D scene.
- Label illustrative concept imagery as concepts when it is not a real completed project.

---

## 10. GitHub Pages deployment

1. Create a GitHub repository named `snk-architect` (or another chosen repository name).
2. Upload the complete project structure.
3. Open repository **Settings → Pages**.
4. Choose the deployment source/branch and folder appropriate to the repository setup.
5. Wait for the published URL shown by GitHub Pages.
6. Test all pages, styles, JavaScript modules, textures, and models at the published URL.
7. Check that paths work under the repository subpath; avoid root-absolute paths like `/assets/...` unless configured for the deployment.
8. Test on a mobile phone as well as desktop.

GitHub Pages hosts static files. It does not provide a private backend, database, or secure AI API proxy by itself.

---

## 11. Testing checklist

### Website
- [ ] All navigation links work.
- [ ] Layout works on mobile, tablet, and desktop.
- [ ] No horizontal overflow on narrow screens.
- [ ] Contact form validates inputs and does not falsely claim to send messages if no backend/service is connected.
- [ ] All images have appropriate alt text.
- [ ] No invented business information or fake testimonials.

### 3D studio
- [ ] Scene loads without fatal errors.
- [ ] Orbit, zoom, and pan work.
- [ ] Reset camera works.
- [ ] Wall color updates the correct material.
- [ ] Floor selector changes the intended material.
- [ ] Day/night presets visibly change lighting.
- [ ] Furniture visibility toggles work.
- [ ] Canvas resizes correctly.
- [ ] Model/texture errors are handled.
- [ ] Performance is acceptable on a typical phone.

### Deployment
- [ ] All file paths work on the GitHub Pages URL.
- [ ] ES modules load correctly.
- [ ] No missing assets or 404 errors.
- [ ] No API secrets are included in the repository.
- [ ] README includes run and deployment instructions.

---

## 12. Suggested implementation phases

### Phase 1 — Foundation
Build the responsive website, base brand styling, one working 3D room, camera controls, wall/floor selectors, and lighting presets.

### Phase 2 — Design studio
Add better materials, furniture controls, model loading, quality improvements, and screenshot export.

### Phase 3 — House visualization
Add optimized exterior and interior models, more scenes, project gallery, and concept comparisons.

### Phase 4 — Client workflow
Add inquiry handling, project presentation export, and—if required—a backend or suitable form service.

### Phase 5 — AI features
Evaluate a suitable image-generation service, secure API architecture, upload limits, privacy, and cost before implementing AI redesign.

---

# 13. FINAL MASTER PROMPT FOR CLAUDE

Copy everything in the prompt below into Claude. Upload this project pack as context if possible.

```text
PROJECT: SNK Architect
TAGLINE: Design Beyond Imagination.
SUPPORTING LINE: Design • Build • Visualize

ROLE
Act as a senior Three.js developer, architectural visualization specialist, UI/UX designer, and frontend engineer. Explain setup and troubleshooting clearly for a beginner.

MISSION
Build a professional, responsive, low-cost architecture and interior visualization website with a genuinely interactive 3D room/house studio. Prioritize a working implementation over a static mockup.

CONSTRAINTS
- Use HTML5, CSS3, vanilla JavaScript ES modules, and Three.js.
- Use Three.js for all custom 3D coding.
- Keep Phase 1 free of required paid APIs and paid backend services.
- Make the project compatible with GitHub Pages.
- Do not expose API keys or secrets in frontend code.
- Do not claim unimplemented features work.
- Do not invent business contact details, testimonials, or real completed projects.
- Explain when professional architectural or engineering validation is needed.

BRAND
- Name: SNK Architect
- Tagline: Design Beyond Imagination.
- Supporting line: Design • Build • Visualize
- Deep charcoal: #111820
- Slate: #202A34
- Champagne gold: #D7B77B
- Warm white: #F7F5F0
- Cool grey: #B8C0C8
- Visual direction: premium, modern, architectural, minimal, editorial, accessible, responsive.

WEBSITE PAGES
1. index.html — homepage and 3D studio entry
2. services.html — service details and 2D–6D framework
3. portfolio.html — house and interior visualization gallery
4. contact.html — project inquiry form

HOME PAGE SECTIONS
- Header/navigation
- Hero and call to action
- Featured interactive 3D preview
- Services
- Featured portfolio
- How it works / 2D–6D overview
- Why SNK Architect
- Project inquiry section
- Footer

THREE.JS STUDIO
Create a real interactive room scene with floor, walls, ceiling, windows, a door, and simple furniture.
Implement:
- Perspective camera
- OrbitControls for orbit, zoom, and pan
- Reset camera
- Wall color selector
- Floor color/material selector
- Daylight/night lighting presets
- Furniture visibility toggles
- Fullscreen when supported
- Responsive renderer/canvas sizing
- Loading and error states
- Proper disposal of resources where appropriate

Use real geometry and materials. Do not use a static image as a fake 3D viewer.

VISUAL QUALITY
- Use appropriate physically based materials where practical.
- Configure realistic proportions, roughness, metalness, texture mapping, lighting, shadows, tone mapping, and color management.
- Optimize textures and geometry for mobile.
- Support optional GLB/GLTF models with GLTFLoader and graceful failure handling.
- Include portfolio images for living rooms, bedrooms, kitchens, bathrooms, and house exteriors.
- Explain that browser-based real-time graphics may not equal high-end offline rendering.
- Do not use assets unless their usage rights are appropriate.

PROJECT PRESENTATION
- Portfolio cards and project detail sections
- Material and design information
- Before/after concept comparison
- Screenshot export of the current 3D view where supported
- Inquiry form with validation and truthful submission feedback
- No fake buttons, placeholder links, fake testimonials, or false success messages

2D–6D FRAMEWORK
Present these as the brand's explanatory service categories, noting that industry definitions vary:
- 2D: plans and layout
- 3D: modeling and visualization
- 4D: time/sequencing concepts
- 5D: estimated costs linked to quantities and editable rates
- 6D: sustainability/lifecycle concepts
Do not claim scheduling, verified cost takeoffs, energy simulation, or engineering calculations are functional unless actually implemented and validated.

FUTURE EXTENSIONS
Prepare the codebase for possible future:
- AI room redesign from uploaded photos
- AI-generated design concepts through an external service
- House exterior visualization
- Furniture/material library
- Saved projects and sharing
- Client dashboard and revision history
- Editable budget estimates
Do not implement fake AI functionality. Any future AI integration must explain API/service requirements, costs, privacy considerations, and secure key handling.

FILE STRUCTURE
snk-architect/
  index.html
  services.html
  portfolio.html
  contact.html
  css/style.css
  css/responsive.css
  css/studio.css
  js/main.js
  js/scene.js
  js/camera.js
  js/materials.js
  js/lighting.js
  js/furniture.js
  js/controls.js
  js/export.js
  assets/images/
  assets/textures/
  assets/models/
  assets/icons/
  README.md

Only create files that are useful for the current implementation. If any listed file is not needed yet, explain why. Do not create empty placeholder files without explanation.

ENGINEERING REQUIREMENTS
- Use ES modules and document the required Three.js imports/versions.
- Explain how to run with a local development server; do not rely on opening index.html directly with file://.
- Ensure relative paths work on GitHub Pages project URLs.
- Avoid unnecessary dependencies.
- Add accessible labels and keyboard-friendly controls.
- Provide loading, empty, and error states.
- All visible buttons must work or be clearly marked unavailable.
- Optimize for common mobile devices.
- Do not include private keys in source code.
- Use clear, maintainable code and beginner-friendly comments.

DELIVERABLES
1. Complete source code for every required file.
2. Exact folder structure.
3. Setup and local-run instructions.
4. GitHub Pages deployment instructions.
5. Desktop and mobile testing checklist.
6. Known limitations and troubleshooting steps.
7. List of external assets and their licenses/usage requirements.
8. Clear separation between implemented features and future plans.

WORK METHOD
Step 1: Review this brief and provide a concise implementation plan.
Step 2: Build Phase 1 as a working prototype.
Step 3: Check the code for obvious syntax, path, and interaction errors.
Step 4: Provide the complete files, not fragments or phrases such as “same as above”.
Step 5: If output is too long, deliver numbered batches and maintain a checklist of files completed and remaining.
Step 6: Explain how I can run and test the result.
Do not claim that you executed tests unless you actually did so.

Start now with Phase 1: premium responsive website and a working interactive Three.js room. Prioritize reliable functionality, clean code, mobile performance, and honest feature descriptions.
```

---

## 14. Reference sites and tools to research

Use these as inspiration and research references—not as assets to copy directly:
- The Boundary — architectural visualization.
- Brick Visual — architectural rendering and presentation.
- D5 Render — real-time architectural visualization.
- Planner 5D — accessible home design workflow.
- Autodesk Revit — professional BIM workflows.
- Matterport — spatial capture and walkthrough experiences.
- Blender — 3D modeling and rendering.
- SketchUp — architectural modeling.
- Floorplanner — browser-based floor-plan concepts.
- Krea AI, MNKI AI, and Decoreto — investigate AI-assisted visualization capabilities and current pricing before choosing a service.

Do not assume these services are free or that every feature is available in every region. Check current terms and licensing before using third-party assets or APIs.

---

## 15. Final recommendation

Build in this order:

1. Working website and interactive 3D room.
2. Material and lighting controls.
3. High-quality models, textures, and portfolio visuals.
4. Exterior visualization and walkthrough.
5. Client inquiry and presentation tools.
6. AI integration only after evaluating costs and secure implementation.

**Success criterion:** A visitor can open the website on a phone or computer, interact with a real 3D room, change at least wall color and lighting, browse the portfolio, and submit a project inquiry without encountering fake functionality.
