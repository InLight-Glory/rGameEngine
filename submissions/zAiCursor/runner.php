<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zAiCursor — 3D Endless Runner (Three.js)</title>
    <link rel="stylesheet" href="assets/css/runner.css">
    <script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
        }
    }
    </script>
</head>
<body class="runner-body">
    <header class="runner-header">
        <a href="marketplace.php">← Marketplace</a>
        <h1>3D Endless Runner <span class="three-badge">Three.js</span></h1>
        <button type="button" id="btn-save-local">Save</button>
        <button type="button" id="btn-export-html" class="btn-export">Export .html</button>
        <button type="button" id="btn-export-zip" class="btn-export">Export .zip</button>
        <button type="button" id="btn-stop">Stop</button>
        <button type="button" id="btn-play" class="btn-play-h">▶ Play</button>
    </header>

    <div class="runner-main">
        <aside class="runner-sidebar">
            <section class="runner-section">
                <h3>Game</h3>
                <div class="runner-field">
                    <label>Title</label>
                    <input type="text" id="cfg-title" class="cfg-input" value="My Endless Runner">
                </div>
            </section>

            <section class="runner-section">
                <h3>Player model</h3>
                <div class="runner-field">
                    <label>Color (fallback box)</label>
                    <input type="color" id="cfg-player-color" class="cfg-input" value="#00aaff">
                </div>
                <div class="runner-field">
                    <label>GLTF / GLB URL</label>
                    <input type="text" id="cfg-player-model" class="cfg-input" placeholder="https://...model.glb">
                </div>
                <div class="runner-field">
                    <label>Upload model (.glb)</label>
                    <input type="file" data-file="player-model" accept=".glb,.gltf">
                </div>
                <div class="runner-field">
                    <label>Scale</label>
                    <input type="number" id="cfg-player-scale" class="cfg-input" step="0.1" min="0.1" value="1">
                </div>
            </section>

            <section class="runner-section">
                <h3>Obstacle</h3>
                <div class="runner-field">
                    <label>Color</label>
                    <input type="color" id="cfg-obstacle-color" class="cfg-input" value="#ff4444">
                </div>
                <div class="runner-field">
                    <label>GLTF URL (optional)</label>
                    <input type="text" id="cfg-obstacle-model" class="cfg-input" placeholder="">
                </div>
                <div class="runner-field">
                    <label>Upload obstacle model</label>
                    <input type="file" data-file="obstacle-model" accept=".glb,.gltf">
                </div>
            </section>

            <section class="runner-section">
                <h3>World</h3>
                <div class="runner-field">
                    <label>Ground color</label>
                    <input type="color" id="cfg-ground" class="cfg-input" value="#2d5a27">
                </div>
                <div class="runner-field">
                    <label>Sky color</label>
                    <input type="color" id="cfg-sky" class="cfg-input" value="#87ceeb">
                </div>
                <div class="runner-field">
                    <label>Speed</label>
                    <input type="number" id="cfg-speed" class="cfg-input" step="1" min="4" max="40" value="14">
                </div>
                <div class="runner-field">
                    <label>Jump force</label>
                    <input type="number" id="cfg-jump" class="cfg-input" step="0.5" value="11">
                </div>
                <div class="runner-field">
                    <label>Obstacle spawn (sec)</label>
                    <input type="number" id="cfg-spawn" class="cfg-input" step="0.1" min="0.5" value="1.2">
                </div>
            </section>

            <section class="runner-section">
                <h3>Sounds</h3>
                <div class="runner-field">
                    <label>Jump URL</label>
                    <input type="text" id="cfg-jump-sound" class="cfg-input" placeholder="">
                    <input type="file" data-file="jump-sound" accept="audio/*">
                </div>
                <div class="runner-field">
                    <label>Hit / game over</label>
                    <input type="text" id="cfg-hit-sound" class="cfg-input" placeholder="">
                    <input type="file" data-file="hit-sound" accept="audio/*">
                </div>
                <div class="runner-field">
                    <label>Pass obstacle (coin)</label>
                    <input type="text" id="cfg-coin-sound" class="cfg-input" placeholder="">
                    <input type="file" data-file="coin-sound" accept="audio/*">
                </div>
                <div class="runner-field">
                    <label>Music loop</label>
                    <input type="text" id="cfg-music" class="cfg-input" placeholder="">
                    <input type="file" data-file="music" accept="audio/*">
                </div>
                <p style="font-size:10px;color:#666;margin:0;">Uploaded files use local blob URLs — re-export before sharing so sounds embed or use public URLs.</p>
            </section>
        </aside>

        <section class="runner-preview">
            <div class="runner-preview-bar">
                <span id="runner-status">Loading…</span>
                <span>Score: <strong id="runner-score">0</strong></span>
            </div>
            <div id="runner-canvas-wrap">
                <canvas id="runner-canvas"></canvas>
            </div>
        </section>
    </div>

    <script type="module">
        import { RunnerEditor } from './assets/js/runner/RunnerEditor.js';
        RunnerEditor.init();
    </script>
</body>
</html>
