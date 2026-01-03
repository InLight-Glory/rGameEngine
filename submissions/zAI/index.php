<?php
// Spec-Engine v1.2 (Tools)
// This file intentionally outputs the same DOM structure as index.html,
// but served as PHP for easy hosting.
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Babylon.js Spec-Engine + Tools</title>

    <script src="https://cdn.babylonjs.com/babylon.js"></script>
    <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>

    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<header>
    <h1>Spec-Engine <small style="font-weight:normal; opacity:0.6">v1.2 (Tools)</small></h1>
    <div class="toolbar">
        <!-- Gizmo Toggles -->
        <button id="gizmo-pos" class="active" onclick="Editor.setGizmoMode('position')">Pos</button>
        <button id="gizmo-rot" onclick="Editor.setGizmoMode('rotation')">Rot</button>
        <button id="gizmo-scl" onclick="Editor.setGizmoMode('scale')">Scl</button>
        <div style="width:1px; height:20px; background:#555; margin:0 5px;"></div>
        <button onclick="Editor.newLevel()">+ Level</button>
        <button onclick="Editor.addEntity('object')">+ Object</button>
        <button onclick="Editor.addEntity('instance')">+ Instance</button>
        <button onclick="Editor.addEntity('region')">+ Region</button>
        <button id="btn-play" class="btn-play" onclick="Editor.togglePlay()">▶ Play</button>
    </div>
</header>

<main>
    <div id="hierarchy" class="panel">
        <div class="panel-header">Hierarchy</div>
        <div id="tree-root"></div>
    </div>

    <div id="viewport" class="panel">
        <canvas id="renderCanvas"></canvas>
    </div>

    <div id="inspector" class="panel">
        <div class="panel-header">Inspector</div>
        <div id="inspector-content"></div>
    </div>

    <div id="bottom-area">
        <div class="tabs">
            <div class="tab active" onclick="Editor.switchTab('assets', event)">Assets & Textures</div>
            <div class="tab" onclick="Editor.switchTab('console', event)">System Console</div>
        </div>
        <div id="tab-assets" class="tab-content active">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="font-size:12px;">Drag to Apply to Selected Object</span>
                <button onclick="document.getElementById('file-upload').click()">+ Import Image</button>
                <input type="file" id="file-upload" accept="image/*" style="display:none" onchange="Editor.handleFileUpload(this)">
            </div>
            <div id="asset-list" class="asset-grid">
                <!-- Default Assets -->
                <div class="asset-item" onclick="Editor.applyTexture('#4caf50')">
                    <div style="width:40px; height:40px; background:#4caf50;"></div>
                    <span>Green Paint</span>
                </div>
                <div class="asset-item" onclick="Editor.applyTexture('#f44336')">
                    <div style="width:40px; height:40px; background:#f44336;"></div>
                    <span>Red Paint</span>
                </div>
                <div class="asset-item" onclick="Editor.applyTexture('#2196f3')">
                    <div style="width:40px; height:40px; background:#2196f3;"></div>
                    <span>Blue Paint</span>
                </div>
            </div>
        </div>
        <div id="tab-console" class="tab-content">
            <div id="console-logs"></div>
        </div>
    </div>
</main>

<!-- App scripts (order matters) -->
<script src="assets/js/utils.js"></script>
<script src="assets/js/defaultProject.js"></script>
<script src="assets/js/engine.js"></script>
<script src="assets/js/level.js"></script>
<script src="assets/js/entity.js"></script>
<script src="assets/js/systems.js"></script>
<script src="assets/js/editor.js"></script>

</body>
</html>
