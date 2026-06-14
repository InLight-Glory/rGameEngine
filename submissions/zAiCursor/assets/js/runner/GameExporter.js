/**
 * Export endless runner as standalone HTML or ZIP (index.html + config + runtime).
 */
export const GameExporter = {
    buildHtml(config, runtimeJs) {
        const cfgJson = JSON.stringify(config, null, 2);
        const title = (config.title || 'Endless Runner').replace(/</g, '');
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #111; font-family: system-ui, sans-serif; }
    #wrap { position: relative; width: 100vw; height: 100vh; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; top: 12px; left: 12px; color: #fff;
      text-shadow: 0 1px 4px #000; pointer-events: none;
    }
    #overlay {
      position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.55); color: #fff; flex-direction: column; gap: 12px;
    }
    #overlay.show { display: flex; }
    button {
      pointer-events: auto; padding: 10px 20px; font-size: 16px; cursor: pointer;
      background: #007acc; border: none; color: #fff; border-radius: 6px;
    }
  </style>
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
    }
  }
  </script>
</head>
<body>
  <div id="wrap">
    <canvas id="game"></canvas>
    <div id="hud"><div id="score">0</div><div style="font-size:12px;opacity:0.8">A/D · Space jump</div></div>
    <div id="overlay" class="show">
      <h1>${title}</h1>
      <p>Tap Start to play</p>
      <button id="btn-start">Start</button>
    </div>
  </div>
  <script id="runner-config" type="application/json">${cfgJson.replace(/<\/script/gi, '<\\/script')}</script>
  <script type="module">
${runtimeJs}
  </script>
</body>
</html>`;
    },

    async exportHtml(config) {
        const gameSrc = await fetch('assets/js/runner/RunnerGame.js').then((r) => r.text());
        const entrySrc = await fetch('assets/js/runner/runner.standalone.js').then((r) => r.text());
        const entry = entrySrc.replace(/import\s+\{\s*RunnerGame\s*\}\s+from\s+['"]\.\/RunnerGame\.js['"];\s*/g, '');
        const runtime = `${gameSrc}\n${entry}`;
        const html = this.buildHtml(config, runtime);
        const blob = new Blob([html], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (config.title || 'endless-runner').replace(/\s+/g, '-').toLowerCase() + '.html';
        a.click();
        URL.revokeObjectURL(a.href);
    },

    buildZipHtml(config) {
        const cfgJson = JSON.stringify(config, null, 2);
        const title = (config.title || 'Endless Runner').replace(/</g, '');
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #111; font-family: system-ui, sans-serif; }
    #wrap { position: relative; width: 100vw; height: 100vh; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud { position: absolute; top: 12px; left: 12px; color: #fff; text-shadow: 0 1px 4px #000; }
    #overlay {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.55); color: #fff; flex-direction: column; gap: 12px;
    }
    #overlay.hidden { display: none; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; background: #007acc; border: none; color: #fff; border-radius: 6px; }
  </style>
  <script type="importmap">
  {"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}
  </script>
</head>
<body>
  <div id="wrap">
    <canvas id="game"></canvas>
    <div id="hud"><div id="score">0</div></div>
    <div id="overlay"><h1>${title}</h1><p>Press Start</p><button id="btn-start">Start</button></div>
  </div>
  <script id="runner-config" type="application/json">${cfgJson.replace(/<\/script/gi, '<\\/script')}</script>
  <script type="module" src="./game-runtime.js"></script>
</body>
</html>`;
    },

    async exportZip(config) {
        const JSZip = window.JSZip;
        if (!JSZip) {
            alert('JSZip not loaded');
            return;
        }
        const [gameSrc, entrySrc] = await Promise.all([
            fetch('assets/js/runner/RunnerGame.js').then((r) => r.text()),
            fetch('assets/js/runner/runner.standalone.js').then((r) => r.text()),
        ]);
        const html = this.buildZipHtml(config);
        const zip = new JSZip();
        const folder = (config.title || 'endless-runner').replace(/\s+/g, '-').toLowerCase();
        zip.file(`${folder}/index.html`, html);
        zip.file(`${folder}/config.json`, JSON.stringify(config, null, 2));
        zip.file(`${folder}/game-runtime.js`, entrySrc);
        zip.file(`${folder}/RunnerGame.js`, gameSrc);
        zip.file(`${folder}/README.txt`,
`Endless Runner — exported from zAiCursor (Three.js)
Open index.html via a local server for best results (e.g. npx serve).
Controls: A/D or arrows — lanes, Space — jump.
Edit config.json and reload to tweak colors/speed; GLTF URLs must be reachable.
`);
        const blob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = folder + '.zip';
        a.click();
        URL.revokeObjectURL(a.href);
    },
};
