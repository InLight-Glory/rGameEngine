// --- LEVEL (Includes Gizmos) ---
class Level {
    constructor(engine, data) {
        this.engine = engine;
        this.data = data;
        this.entities = new Map();
        this.babylonScene = new BABYLON.Scene(engine.babylonEngine);
        this.babylonScene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1);

        // Camera
        this.camera = new BABYLON.ArcRotateCamera(
            "Camera",
            -Math.PI / 2,
            Math.PI / 2.5,
            10,
            BABYLON.Vector3.Zero(),
            this.babylonScene
        );
        this.camera.attachControl(engine.canvas, true);
        this.camera.wheelPrecision = 50;

        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.babylonScene);

        // --- GIZMO MANAGER (Requirement: Visual Handles) ---
        this.gizmoManager = new BABYLON.GizmoManager(this.babylonScene);
        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.usePointerToAttachGizmos = false; // We attach manually via selection
        this.gizmoManager.clearGizmoOnEmptyPointerEvent = true;

        this.data.entities.forEach(entData => {
            const ent = new Entity(this, entData);
            this.entities.set(entData.id, ent);
        });
    }

    initializeEntities() {
        this.entities.forEach(e => e.initialize());
    }

    dispose() {
        this.gizmoManager.dispose();
        this.babylonScene.dispose();
        this.entities.forEach(e => e.dispose());
        this.entities.clear();
    }
}
