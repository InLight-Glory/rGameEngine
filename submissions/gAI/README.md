# OmniEngine Web (gAI submission)

React + Babylon.js scene editor: hierarchy, 3D viewport with gizmos, and component inspector.

## View from the rGameEngine hub

The hub opens `app/index.html` (production build). Opening `index.html` in this folder redirects there automatically.

After changing source files:

```bash
npm install
npm run build
```

Then refresh the hub link.

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Notes

- `Save to PHP` expects a `save_level.php` endpoint; use **Download** / **Load JSON** without a backend.
- Play mode toggle is UI-only in this build; the editor viewport still runs in edit mode.
