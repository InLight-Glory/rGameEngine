# AI One-Shot Grading Results

**Contest:** Build a web-based 3D game engine (Babylon.js) with editor tooling, component architecture, and region/logic systems — in a single agent pass.

**Graded submissions:** `zAI`, `gAI`, `julesv1`  
**Not graded:** `zz sample1`, `zz sample2` (hub demo placeholders, not engine attempts)

**Grading scale:** A (90–100) · B (80–89) · C (70–79) · D (60–69) · F (&lt;60)

---

## Final standings

| Rank | Agent | Folder | Overall | One-line verdict |
|------|-------|--------|---------|------------------|
| 🥇 1 | **zAI** | `submissions/zAI` | **A- (91)** | Closest to a **working product** — opens in the browser, full editor, real play mode. |
| 🥈 2 | **gAI** | `submissions/gAI` | **B (84)** | Best **editor shell** (React UI), weakest **runtime**; needed build/deploy fixes to run. |
| 🥉 3 | **julesv1** | `submissions/julesv1` | **C+ (78)** | Best **engine architecture**, worst **out-of-box experience** — does not run from the hub as submitted. |

---

## Scoring rubric (100 points)

| Category | Weight | What we measured |
|----------|--------|------------------|
| **Shippable / runs as-is** | 25 | Open from hub or static server without manual repair |
| **Editor completeness** | 25 | Hierarchy, viewport, inspector, gizmos, add entities, save/load |
| **Runtime / gameplay** | 25 | Play mode, physics, regions, scripts, fixed timestep |
| **Architecture & code** | 15 | Structure, typing, maintainability, spec alignment |
| **Polish & honesty** | 10 | README, defaults, no fake features, deploy story |

---

## Detailed grades

### 1. zAI — Spec-Engine · **A- (91/100)**

| Category | Score | Grade |
|----------|-------|-------|
| Shippable | 24/25 | A |
| Editor | 24/25 | A |
| Runtime | 21/25 | B+ |
| Architecture | 13/15 | B+ |
| Polish | 9/10 | A |

**Strengths**
- **Works immediately:** `index.php` + plain JS + Babylon CDN — no npm, no bundler (ideal for your PHP hub and `localhost:22022/.../zAI/index.php`).
- **Most complete editor:** Hierarchy (multi-level), inspector with live property edits, gizmo modes (pos/rot/scale), asset browser with image import, system console, **working Play/Stop** with project snapshot restore.
- **Gameplay loop:** Region overrides (e.g. slow zone), WASD movement, per-entity scripts (`new Function`), effective-properties panel — you can *feel* the engine working.
- **Sensible structure:** Split modules (`engine.js`, `editor.js`, `systems.js`, etc.) with documented load order.

**Weaknesses**
- No real rigid-body physics (movement is direct transform nudging).
- Script execution is unsandboxed `eval`-style (fine for a jam, risky for production).
- Visual polish is utilitarian vs gAI’s React UI.
- Depends on CDN + optional PHP (not a single-file drop-in).

**Representative path:** `submissions/zAI/index.php`

---

### 2. gAI — OmniEngine Web · **B (84/100)**

| Category | Score | Grade |
|----------|-------|-------|
| Shippable | 18/25 | C+ → fixed post-review |
| Editor | 23/25 | A |
| Runtime | 14/25 | D+ |
| Architecture | 14/15 | A- |
| Polish | 15/10* | B |

*\*Polish capped at 10; raw “marketing” score would be lower due to non-functional Play/Save-to-PHP.*

**Strengths**
- **Strongest editor UX:** React layout, hierarchy, inspector (mesh/light/region), viewport gizmos, add entity/components, JSON download/load — looks like a real tool.
- **Typed data model:** `types.ts` with `DEFAULT_LEVEL`, spec version field, clean `BabylonManager` sync layer.
- **Modern stack:** TypeScript, Vite, Tailwind (after post-contest fixes).

**Weaknesses (as originally submitted)**
- **Did not run from hub:** Dev `index.html` pointed at `/index.tsx`; required `npm install && npm run build` and a committed `app/` bundle.
- **Play button is cosmetic:** Toggles UI only; no simulation loop or play snapshot.
- **“Save to PHP”** calls missing `save_level.php` — always fails offline.
- **Regions** are mostly wireframe visuals; no gameplay effect in this build.
- **No physics, no script runtime** in the React path — editor-first, engine-second.
- AI Studio leftovers (import maps, CDN Tailwind) caused console noise until fixed.

**After manual fixes (this repo):** Redirect `index.html` → `app/index.html`, production build, bundled Tailwind — **now shippable** at  
`http://localhost:22022/rGameEngine/submissions/gAI/app/index.html`

**Representative path:** `submissions/gAI/app/index.html` (after build)

---

### 3. julesv1 — Babylon ECS Engine · **C+ (78/100)**

| Category | Score | Grade |
|----------|-------|-------|
| Shippable | 10/25 | F |
| Editor | 17/25 | C+ |
| Runtime | 24/25 | A |
| Architecture | 15/15 | A |
| Polish | 12/10* | B+ |

**Strengths**
- **Best engine core:** Typed ECS (`Entity`, `Component`, `System`), fixed timestep, `PhysicsSystem`, `RegionSystem` (enter/exit, blending), `LogicSystem` (compile + sandboxed runtime errors), `SeededRNG`, lifecycle states.
- **Demo proves spec intent:** Player sphere, ground, blue low-gravity region with color override — matches “region changes gravity” narrative.
- **Editor exists:** DOM inspector, asset browser spawn (box/sphere/cylinder/capsule), gizmo drag → transform sync, script textarea on entities.

**Weaknesses**
- **Does not run out of the box:** `index.html` loads `./src/main.ts` directly; `package.json` only defines `"build": "tsc"` (no emit to browser bundle). Vite is listed but not wired (`npm run dev` missing).
- **No hierarchy panel**, minimal inspector (position read-only in template; script apply only).
- **Heavy `(engine as any).activeLevel` hacks** in editor — engine wasn’t fully exposed to tooling.
- **Hard-coded scene** in `main.ts` rather than JSON level load / save workflow.

**To run today:** Add Vite config + `"dev": "vite"` or compile/bundle `main.ts` to JS and serve that.

**Representative path:** `submissions/julesv1/index.html` (needs bundler first)

---

## Feature matrix (engine intent)

| Feature | zAI | gAI | julesv1 |
|---------|:---:|:---:|:-------:|
| Opens without build step | ✅ | ⚠️ | ❌ |
| 3D viewport (Babylon) | ✅ | ✅ | ✅ |
| Hierarchy panel | ✅ | ✅ | ❌ |
| Inspector (edit props) | ✅ | ✅ | ⚠️ partial |
| Transform gizmos | ✅ | ✅ | ✅ |
| Add / spawn entities | ✅ | ✅ | ✅ (asset bar) |
| Play / stop mode | ✅ | ❌ UI only | ⚠️ always simulating |
| Region gameplay effect | ✅ | ❌ visual | ✅ |
| Physics | ❌ | ❌ | ✅ |
| User scripts in play | ✅ | ❌ | ✅ |
| JSON save / load | ⚠️ implicit project | ✅ download | ❌ |
| PHP / static host story | ✅ | ⚠️ | ❌ |
| Fixed timestep | ✅ | ❌ | ✅ |
| TypeScript / types | ❌ | ✅ | ✅ |

---

## Who “won” the one-shot?

| Question | Winner |
|----------|--------|
| **Closest to a working product you can open and use today?** | **zAI** |
| **Best demo for judges / stakeholders (pretty UI)?** | **gAI** (after build) |
| **Best foundation to extend into a real engine?** | **julesv1** |
| **Best if the prompt was “ship on shared hosting, no Node”** | **zAI** |
| **Best if the prompt was “enterprise editor SPA”** | **gAI** (concept; runtime still incomplete) |

---

## Hub samples (reference only)

| Folder | Purpose | Grade |
|--------|---------|-------|
| `zz sample1` | Canvas platformer toy (~85 lines) | N/A — not an engine |
| `zz sample2` | Click puzzle tiles | N/A — not an engine |

These validate the hub; they are not AI engine contestants.

---

## Recommendations if you run the contest again

1. **Define “done”:** e.g. must load from `submissions/<name>/index.html` or `index.php` with zero npm steps.
2. **Provide a spec checklist** (regions, play mode, save JSON) so grades are less subjective.
3. **Require `description.txt` + how to run** in every submission.
4. **Smoke-test in CI:** HTTP 200 on entry URL + no 404 on main script.

---

## Summary

- **zAI** wins the one-shot as an **end-to-end product**: editor + play + regions + scripts, browser-ready.
- **gAI** wins on **presentation and editor structure** but shipped a **frontend prototype** more than a game engine runtime.
- **julesv1** wins on **engineering depth** but loses the contest on **delivery** — the best runtime never made it to a one-click URL.

*Graded from repo state including post-contest fixes to gAI (`app/` build, hub redirect). Re-run `npm run build` in `submissions/gAI` after source changes.*
