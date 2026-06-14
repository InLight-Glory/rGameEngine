// --- ENGINE CORE ---
class GameEngine {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.babylonEngine = new BABYLON.Engine(this.canvas, true);
        this.project = JSON.parse(JSON.stringify(DEFAULT_PROJECT));
        this.levels = new Map();
        this.isPlaying = false;
        this.snapshot = null;
        this.fixedDeltaTime = 1 / 60;
        this.accumulator = 0;
        this.selection = null;
        this.keys = {};

        // Editor.refresh() is called during construction (via loadProject).
        // Ensure the global is assigned early so Editor can safely read window.game.
        if (typeof window !== 'undefined' && !window.game) window.game = this;

        this.initSystems();
        this.loadProject(this.project);
        this.renderLoop();
    }

    initSystems() {
        this.systems = {
            region: new RegionSystem(this),
            logic: new LogicSystem(this),
            transform: new TransformSystem(this),
            render: new RenderSystem(this)
        };
    }

    loadProject(data) {
        this.levels.forEach(l => l.dispose());
        this.levels.clear();
        this.project = data;
        this.project.levels.forEach(lvlData => {
            const level = new Level(this, lvlData);
            this.levels.set(lvlData.id, level);
        });
        Editor.refresh();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.project = JSON.parse(this.snapshot);
            this.snapshot = null;
            this.loadProject(this.project);
            this.isPlaying = false;
            document.getElementById('btn-play').innerHTML = "▶ Play";
            document.getElementById('btn-play').className = "btn-play";
            LOG("Simulation Stopped.", "sys");
        } else {
            this.snapshot = JSON.stringify(this.project);
            this.levels.forEach(l => l.initializeEntities());
            this.isPlaying = true;
            document.getElementById('btn-play').innerHTML = "■ Stop";
            document.getElementById('btn-play').className = "btn-stop";
            LOG("Simulation Started.", "sys");
        }
    }

    renderLoop() {
        this.babylonEngine.runRenderLoop(() => {
            if (this.isPlaying) {
                const deltaTime = this.babylonEngine.getDeltaTime() / 1000;
                this.accumulator += deltaTime;
                while (this.accumulator >= this.fixedDeltaTime) {
                    this.fixedUpdate(this.fixedDeltaTime);
                    this.accumulator -= this.fixedDeltaTime;
                }
            }
            this.levels.forEach(l => l.babylonScene.render());
        });
        window.addEventListener("resize", () => this.babylonEngine.resize());
    }

    fixedUpdate(dt) {
        this.systems.region.update(dt);
        this.systems.logic.update(dt);
        this.systems.transform.update(dt);
    }
}
