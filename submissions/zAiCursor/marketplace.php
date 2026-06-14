<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zAiCursor — Templates Marketplace</title>
    <link rel="stylesheet" href="assets/css/marketplace.css">
</head>
<body class="mp-body">
    <header class="mp-header">
        <a href="index.php">← Editor</a>
        <h1>Templates Marketplace</h1>
        <a href="runner.php?template=endless-runner">Open runner editor</a>
    </header>
    <section class="mp-hero">
        <span class="mp-badge">Three.js templates</span>
        <h2>Start from a game template</h2>
        <p>Load a template, customize models, colors, and sounds, then export a standalone HTML or ZIP package you can share or host anywhere.</p>
    </section>
    <div id="mp-grid" class="mp-grid" aria-live="polite">
        <p style="padding:20px;color:#888;">Loading templates…</p>
    </div>
    <script src="assets/js/marketplace.js"></script>
</body>
</html>
