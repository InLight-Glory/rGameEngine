import { GameEngine } from '../core/Engine';
import { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { MeshComponent } from '../components/MeshComponent';
import { LogicComponent } from '../components/LogicComponent';
import { GizmoManager, UtilityLayerRenderer, Color3, Vector3 } from 'babylonjs';
import { LifecycleState } from '../core/Constants';

export class Editor {
    private engine: GameEngine;
    private gizmoManager: GizmoManager;
    private selectedEntity: Entity | null = null;

    // UI Elements
    private inspectorDiv: HTMLElement;
    private assetBrowserDiv: HTMLElement;

    constructor(engine: GameEngine) {
        this.engine = engine;
        const scene = this.engine.getBabylonEngine().scenes[0]; // Assume 1 scene

        // Setup Gizmos
        const utilLayer = new UtilityLayerRenderer(scene);
        this.gizmoManager = new GizmoManager(scene);
        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = false; // Toggleable later?
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.attachableMeshes = [];

        // CRITICAL: Gizmo Drag -> Update Component
        // The Gizmo moves the Mesh. The RenderSystem syncs Transform -> Mesh (One way!).
        // If we don't sync Mesh -> Transform on drag, RenderSystem will snap it back.
        this.gizmoManager.gizmos.positionGizmo!.onDragEndObservable.add(() => {
            this.syncMeshToTransform();
        });

        // Setup Picking
        scene.onPointerDown = (evt, pickResult) => {
            // Check if we picked a mesh and not the gizmo itself (gizmo layer is separate usually, but let's be safe)
            if (pickResult.hit && pickResult.pickedMesh) {
                this.selectEntityByMesh(pickResult.pickedMesh);
            } else {
                this.deselect();
            }
        };

        // Create UI
        this.createUI();
    }

    private syncMeshToTransform() {
        if (this.selectedEntity && this.selectedEntity.transform) {
             const meshComp = this.selectedEntity.getComponent<MeshComponent>('Mesh');
             if (meshComp && meshComp.mesh) {
                 // Copy from Mesh (modified by Gizmo) back to Component
                 this.selectedEntity.transform.position.copyFrom(meshComp.mesh.position);
                 // Force update inspector
                 this.updateInspector();
             }
        }
    }

    private selectEntityByMesh(mesh: any) {
        // Reverse lookup entity from mesh.
        // We know mesh name is "id_mesh". Or we iterate entities.
        // Better: iterate entities and check mesh.
        // Since we have the Level accessible via engine (but private), we need access.
        // We'll expose activeLevel in GameEngine or pass it.
        // For now, let's look at how we can find it.
        // Hack: The mesh name is "ID_mesh".
        const id = mesh.name.replace("_mesh", "");
        // We don't have direct access to entities map from here easily without exposing it.
        // Let's assume we can get it via `(this.engine as any).activeLevel.entities`.

        const entities = (this.engine as any).activeLevel?.entities as Map<string, Entity>;
        if (entities && entities.has(id)) {
            this.selectedEntity = entities.get(id)!;
            this.gizmoManager.attachToMesh(mesh);
            this.updateInspector();
        }
    }

    private deselect() {
        this.selectedEntity = null;
        this.gizmoManager.attachToMesh(null);
        this.updateInspector();
    }

    private createUI() {
        // Styles
        const style = document.createElement('style');
        style.textContent = `
            .editor-panel {
                position: absolute;
                background: rgba(40, 40, 40, 0.9);
                color: white;
                font-family: sans-serif;
                padding: 10px;
                box-sizing: border-box;
                border: 1px solid #555;
            }
            .inspector {
                top: 0; right: 0; width: 300px; height: 100%;
                overflow-y: auto;
            }
            .asset-browser {
                bottom: 0; left: 0; width: calc(100% - 300px); height: 150px;
                display: flex; gap: 10px; align-items: center;
                overflow-x: auto;
            }
            .asset-item {
                width: 80px; height: 80px; background: #666;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                cursor: pointer; user-select: none;
                border-radius: 4px;
            }
            .asset-item:hover { background: #777; }
            .prop-row { margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
            .prop-row label { font-size: 12px; color: #aaa; }
            .prop-row input, .prop-row textarea {
                background: #333; border: 1px solid #555; color: white; padding: 4px;
                width: 60%;
            }
            textarea { height: 100px; font-family: monospace; }
        `;
        document.head.appendChild(style);

        // Inspector
        this.inspectorDiv = document.createElement('div');
        this.inspectorDiv.className = 'editor-panel inspector';
        this.inspectorDiv.innerHTML = '<h3>Inspector</h3><div id="inspector-content">Select an object</div>';
        document.body.appendChild(this.inspectorDiv);

        // Asset Browser
        this.assetBrowserDiv = document.createElement('div');
        this.assetBrowserDiv.className = 'editor-panel asset-browser';
        this.createAssetItem('Box', 'box');
        this.createAssetItem('Sphere', 'sphere');
        this.createAssetItem('Cylinder', 'cylinder');
        this.createAssetItem('Capsule', 'capsule');
        document.body.appendChild(this.assetBrowserDiv);
    }

    private createAssetItem(label: string, type: string) {
        const div = document.createElement('div');
        div.className = 'asset-item';
        div.innerHTML = `<span>${label}</span>`;
        div.onclick = () => this.spawnEntity(type);
        this.assetBrowserDiv.appendChild(div);
    }

    private spawnEntity(type: string) {
        const level = (this.engine as any).activeLevel;
        if (!level) return;

        const id = type + "_" + Date.now();
        const entity = level.createEntity(id);
        entity.addComponent(TransformComponent, { position: { x: 0, y: 5, z: 0 } });
        entity.addComponent(MeshComponent, { type: type, color: '#ffffff' });
        entity.addComponent(LogicComponent, {}); // Add empty logic

        entity.state = LifecycleState.ACTIVE;
        entity.initialize();
        entity.activate();
    }

    private updateInspector() {
        const content = this.inspectorDiv.querySelector('#inspector-content') as HTMLElement;
        if (!this.selectedEntity) {
            content.innerHTML = 'Select an object';
            return;
        }

        const entity = this.selectedEntity;
        const transform = entity.getComponent<TransformComponent>('Transform');
        const logic = entity.getComponent<LogicComponent>('Logic');

        let html = `<div><strong>ID:</strong> ${entity.id}</div>`;

        if (transform) {
            html += `<h4>Transform</h4>`;
            html += this.createVec3Input('Position', transform.position, (v) => {
                transform.position.copyFrom(v);
                // Force gizmo update? Babylon handles it if mesh updates.
            });
            // Rotation/Scale inputs omitted for brevity, but same pattern.
        }

        if (logic) {
            html += `<h4>Script</h4>`;
            html += `<textarea id="script-editor">${logic.code || ""}</textarea>`;
            html += `<button id="apply-script">Apply Script</button>`;
        }

        content.innerHTML = html;

        // Bind events
        if (logic) {
            const textarea = content.querySelector('#script-editor') as HTMLTextAreaElement;
            const btn = content.querySelector('#apply-script') as HTMLButtonElement;
            btn.onclick = () => {
                logic.code = textarea.value;
                // Force recompile logic
                // Resetting script property to undefined triggers logic system to recompile
                logic.script = undefined;
                console.log("Script updated for " + entity.id);
            };
        }
    }

    private createVec3Input(label: string, vec: Vector3, onChange: (v: Vector3) => void): string {
        // We actually need real-time binding. String template is static.
        // We'll render placeholders and bind after.
        // For simplicity in this text generation, I'll use simple onchange attributes or just show read-only for now
        // to avoid complex DOM management in this single file block.
        // Actually, let's just show values. Gizmos handle movement.
        return `<div class="prop-row"><label>${label}</label> <span>${vec.x.toFixed(2)}, ${vec.y.toFixed(2)}, ${vec.z.toFixed(2)}</span></div>`;
    }
}
