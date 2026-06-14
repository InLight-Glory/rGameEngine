# AI Ideas for rGameEngine

Fifteen concrete improvements based on the current hub (`index.php`), submission workflow, and the three engine prototypes in `submissions/` (julesv1, gAI, zAI).

---

## 1. Standardize submission metadata

Today only `description.txt` is read by the hub, while gAI already has a richer `metadata.json`. Adopt a single optional `project.json` per submission with `name`, `description`, `tags`, `engineVersion`, `entryPoint`, and `thumbnail`. The hub can fall back to folder name and `description.txt` for older projects.

**Why:** Better discovery, consistent cards, and room for filters without breaking the “drop a folder” workflow.

---

## 2. Unify the three engines behind one canonical runtime

julesv1 (TypeScript ECS + Babylon), zAI (vanilla JS + editor + JSON projects), and gAI (React + Vite editor) overlap heavily: levels, entities, region/logic/render systems, fixed timestep. Pick one runtime (likely julesv1’s typed core) and treat the others as UI shells or migration targets.

**Why:** Fixes duplicated bugs, splits effort across features instead of three parallel codebases, and gives contributors one place to learn.

---

## 3. Publish a versioned level/scene JSON schema

All prototypes serialize projects to JSON with levels, entities, and components. Document the schema (e.g. `schema/v1/project.json`) with validation (JSON Schema or Zod) and a small migrator for breaking changes.

**Why:** Enables interchange between editors, export tools, and future cloud save without silent breakage.

---

## 4. Add thumbnail previews on the hub

Require or generate `thumbnail.png` (or `preview.webp`) per submission. Show it on project cards; use a neutral placeholder when missing.

**Why:** The hub is visual-first; names like `zz sample1` do not communicate what each demo does.

---

## 5. Embed “quick play” in the hub via sandboxed iframe

For submissions with `index.html` / `index.php`, offer an inline preview (iframe + “Open full screen”) instead of only linking out.

**Why:** Lowers friction for comparing engines and for judges/reviewers scanning many entries.

---

## 6. Ship an official submission template

Add `submissions/_template/` with `description.txt`, `project.json`, minimal `index.html`, and a one-line README for “copy this folder.” Optionally a small CLI: `php scripts/new-submission.php my-game`.

**Why:** Reduces bad entries (missing index, wrong paths) and sets expectations for structure.

---

## 7. Hub search, tags, and sort options

Extend the hub beyond alphabetical sort: filter by tag (`2d`, `editor`, `typescript`), search descriptions, sort by last modified.

**Why:** Scales when `submissions/` grows beyond a handful of folders.

---

## 8. Single-command local dev (not only PHP)

Document and ship `npm run hub` or `docker compose up` that serves the repo root with correct MIME types and optional proxy to Vite dev servers for Node-based submissions like gAI.

**Why:** Contributors on Windows/macOS without PHP still get a one-step experience; gAI cannot run from `php -S` alone without a build step.

---

## 9. CI that builds and smoke-tests each submission

GitHub Action matrix: for each folder with `package.json`, run `npm ci && npm run build`; for static entries, curl the index and fail on console errors (Playwright optional).

**Why:** Catches broken submissions before they land on the hub; especially important for TypeScript engines.

---

## 10. Shared asset pipeline (glTF / textures / audio)

Centralize `assets/` or a shared CDN path for models and sounds used by multiple demos. Add a small import helper (Babylon `SceneLoader` + drag-drop in editors) and document max file sizes for Git.

**Why:** Each engine re-implements loading; large binaries in random folders bloat the repo.

---

## 11. Deterministic play mode + replay hooks

julesv1 already uses `SeededRNG` and fixed timestep. Extend that across the unified runtime: record input + seed per session, replay for debugging and automated regression clips.

**Why:** Makes logic bugs reproducible and is a strong differentiator for a web engine used in jams and classrooms.

---

## 12. Document the component and system model

Add `docs/architecture.md` listing entities, components (Transform, Mesh, Physics, Logic, Region), system order (Region → Logic → Physics → Render), and editor vs play mode. Mirror the best of zAI’s inline structure and julesv1’s types.

**Why:** New contributors currently read three different code styles to understand one design pattern.

---

## 13. Export “publishable” standalone builds

zAI targets PHP hosting; gAI targets Vite. Provide `npm run export` that bundles runtime + project JSON + assets into a single `dist/` folder deployable to static hosts or the existing PHP layout.

**Why:** Games need to ship without the whole monorepo or a dev server.

---

## 14. Input and audio abstraction layer

Normalize keyboard, pointer, and gamepad behind a small `InputManager` API; add a thin `AudioManager` for SFX/music with mute/pause tied to play mode. Wire once in the shared runtime, expose to LogicSystem scripts.

**Why:** zAI tracks `keys` on the engine; julesv1/editor paths differ—players expect consistent behavior across demos.

---

## 15. Safe user logic plugins (sandboxed scripts)

LogicSystem already runs gameplay logic. Define a constrained script surface (no `fetch` to arbitrary URLs, no `eval`, timeout per tick) and hot-reload from the editor. Store scripts as data in the level JSON, not only as compiled TS.

**Why:** Unlocks designer-facing behavior without rebuilding the engine; aligns with “web-based” and educational use cases.

---

## Suggested priority

| Priority | Ideas |
|----------|--------|
| Quick wins | 4, 6, 7, 12 |
| Foundation | 1, 2, 3, 8 |
| Quality & scale | 9, 10, 11 |
| Product polish | 5, 13, 14, 15 |

---

*Generated for rGameEngine — hub + submissions ecosystem. Revisit after picking a single canonical engine path (idea 2).*
