<?php
// zAiCursor Block Lab — Lego-style visual scripting
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zAiCursor Block Lab</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/blocks.css">
</head>
<body class="block-lab-body">

<header class="block-lab-header">
    <a href="index.php">← Editor</a>
    <h1>🧱 Block Lab</h1>
    <span class="target" id="block-target-label">—</span>
    <button type="button" onclick="BlockLab.clearWorkspace()">Clear</button>
    <button type="button" class="btn-apply" onclick="BlockLab.applyToEntity()">Apply to entity ▶</button>
</header>

<div class="block-lab-main">
    <aside id="block-bins" aria-label="Block bins"></aside>

    <section class="block-workspace-wrap">
        <div class="workspace-toolbar">Drag blocks from colored bins into the stack below the start block.</div>
        <div id="block-workspace">
            <div id="workspace-hat" class="placed-block shape-hat"></div>
            <div id="workspace-stack"></div>
        </div>
    </section>

    <aside class="block-code-panel">
        <header>Generated script</header>
        <pre id="code-preview"></pre>
    </aside>
</div>

<div id="doc-modal" class="lab-modal" role="dialog" aria-labelledby="doc-title">
    <div class="lab-modal-card">
        <h2 id="doc-title">Block</h2>
        <span id="doc-category" class="doc-badge">Category</span>
        <p id="doc-summary"></p>
        <h3 style="font-size:12px;color:#9cdcfe;margin:16px 0 6px;">Parameters</h3>
        <ul id="doc-params"></ul>
        <h3 style="font-size:12px;color:#9cdcfe;margin:16px 0 6px;">Examples</h3>
        <ul id="doc-examples"></ul>
        <div class="lab-modal-actions">
            <button type="button" id="doc-close">Close</button>
        </div>
    </div>
</div>

<div id="custom-modal" class="lab-modal">
    <div class="lab-modal-card">
        <h2>Create your block</h2>
        <p style="font-size:12px;color:#999;">Saved in the <strong>Your Blocks</strong> bin. Use <code>{{arg1}}</code> in the template.</p>
        <label>Name<input type="text" id="custom-name" placeholder="My action"></label>
        <label>Description<textarea id="custom-summary" rows="2" placeholder="What it does"></textarea></label>
        <label>Code template<textarea id="custom-template" rows="4" placeholder="LOG({{arg1}}, &quot;event&quot;);"></textarea></label>
        <div class="lab-modal-actions">
            <button type="button" onclick="BlockLab.hideCustomModal()">Cancel</button>
            <button type="button" class="btn-apply" onclick="BlockLab.createCustomBlock()">Add to bin</button>
        </div>
    </div>
</div>

<script src="assets/js/utils.js"></script>
<script src="assets/js/blockCatalog.js"></script>
<script src="assets/js/blockLab.js"></script>
</body>
</html>
