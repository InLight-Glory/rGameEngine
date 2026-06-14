// --- ENTITY ---
class Entity {
    constructor(level, data) {
        this.level = level;
        this.data = data;
        this.babylonNode = null;
        this.material = null; // Cache material for texture updates
        this.effectiveProperties = {};
        this.createVisuals();
    }

    initialize() { this.data.state = "active"; }

    createVisuals() {
        const compTf = this.getComponent("Transform");
        const pos = compTf.props.position;
        const rot = compTf.props.rotation || [0, 0, 0];
        const scl = compTf.props.scaling || [1, 1, 1];

        // Destroy old visuals if they exist
        if (this.babylonNode) this.babylonNode.dispose();

        // --- SHAPE SUPPORT (Requirement: More Shapes) ---
        let mesh;
        const compRen = this.getComponent("MeshRenderer");
        const shape = compRen ? compRen.props.shape : "box";
        const color = compRen ? compRen.props.color : "#ffffff";

        if (this.data.type === "object") {
            switch (shape) {
                case 'box': mesh = BABYLON.MeshBuilder.CreateBox(this.data.id, { size: 1 }, this.level.babylonScene); break;
                case 'sphere': mesh = BABYLON.MeshBuilder.CreateSphere(this.data.id, { diameter: 1 }, this.level.babylonScene); break;
                case 'cylinder': mesh = BABYLON.MeshBuilder.CreateCylinder(this.data.id, { height: 1, diameter: 1 }, this.level.babylonScene); break;
                case 'capsule': mesh = BABYLON.MeshBuilder.CreateCapsule(this.data.id, { height: 1, radius: 0.5 }, this.level.babylonScene); break;
                case 'plane': mesh = BABYLON.MeshBuilder.CreatePlane(this.data.id, { size: 1 }, this.level.babylonScene); break;
                default: mesh = BABYLON.MeshBuilder.CreateBox(this.data.id, { size: 1 }, this.level.babylonScene);
            }
            this.babylonNode = mesh;

            // --- MATERIAL & TEXTURE SUPPORT ---
            this.material = new BABYLON.StandardMaterial("mat", this.level.babylonScene);
            this.material.diffuseColor = BABYLON.Color3.FromHexString(color);

            if (compRen && compRen.props.texture) {
                // Handle URL or Blob
                try {
                    this.material.diffuseTexture = new BABYLON.Texture(compRen.props.texture, this.level.babylonScene);
                } catch (e) { console.warn("Texture load failed", e); }
            }
            mesh.material = this.material;
        }
        else if (this.data.type === "region") {
            mesh = BABYLON.MeshBuilder.CreateBox(this.data.id, { size: 1 }, this.level.babylonScene);
            mesh.isPickable = false;
            this.babylonNode = mesh;
            const regComp = this.getComponent("RegionVolume");
            if (regComp && regComp.props.visible) {
                const mat = new BABYLON.StandardMaterial("regMat", this.level.babylonScene);
                mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
                mat.alpha = 0.2;
                mat.wireframe = true;
                mesh.material = mat;
            } else mesh.isVisible = false;
        }
        else if (this.data.type === "instance") {
            this.babylonNode = new BABYLON.TransformNode(this.data.id, this.level.babylonScene);
        }

        if (this.babylonNode) {
            this.babylonNode.position = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
            this.babylonNode.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
            this.babylonNode.scaling = new BABYLON.Vector3(scl[0], scl[1], scl[2]);
        }
    }

    getComponent(type) { return this.data.components.find(c => c.type === type); }
    dispose() { if (this.babylonNode) this.babylonNode.dispose(); this.data.state = "destroyed"; }
}
