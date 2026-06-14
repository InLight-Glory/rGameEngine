# zAiCursor

Spec-Engine editor (Babylon.js) plus **Block Lab**, **Templates Marketplace**, and **Three.js** game templates.

## Quick links

| Page | URL |
|------|-----|
| Editor | `index.php` |
| Block Lab | `blocks.php` |
| Marketplace | `marketplace.php` |
| Endless Runner | `runner.php?template=endless-runner` |

## Phase features

### Three.js integration
The **3D Endless Runner** template uses [Three.js](https://threejs.org/) (CDN modules + GLTFLoader) for rendering, separate from the Babylon.js scene editor.

### Templates marketplace
`marketplace.php` lists templates from `templates/registry.json`. Each card links to the template editor.

### Endless runner template
- Lane runner with jump (A/D, Space)
- Customize player/obstacle **colors** or **GLTF models**
- **Sounds:** jump, hit, coin, music (URL or file upload → blob URL)
- **Play** preview in browser
- Config saved in `localStorage`

### Export
From `runner.php`:
- **Export .html** — single file with inlined game + config (Three.js via CDN import map)
- **Export .zip** — `index.html`, `config.json`, `RunnerGame.js`, `game-runtime.js`, `README.txt`

> For shared builds, prefer public URLs for models/sounds; blob URLs from uploads work locally until you re-export after hosting assets.

## Run locally

```powershell
php -S localhost:8000
```

`http://localhost:8000/submissions/zAiCursor/marketplace.php`

## Add a marketplace template

1. Add `templates/your-id/default-config.json`
2. Register in `templates/registry.json`
3. Optionally add a dedicated editor page (see `runner.php` pattern)
