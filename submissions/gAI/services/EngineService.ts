import {
    Engine,
    Scene,
    Vector3,
    Color4,
    Color3,
    MeshBuilder,
    TransformNode,
    Mesh,
    StandardMaterial,
    Viewport,
    FreeCamera,
    Node,
    BoundingInfo
} from '@babylonjs/core';
import { 
    Level, Entity, ComponentType, TransformComponent, 
    MeshComponent, PhysicsComponent, RegionComponent, 
    RegionBlendMode
} from '../types';

/**
 * The EngineService acts as the bridge between React State (JSON) and Babylon.js (Rendering/Physics).
 * It enforces the System Ownership Matrix.
 */
export class EngineService {
    private engine: Engine | null = null;
    private scene: Scene | null = null;
    // Map stores generic Nodes because it can contain Meshes, TransformNodes, or Cameras
    private entityNodeMap: Map<string, Node> = new Map();
    private materialCache: Map<string, StandardMaterial> = new Map();
    
    // System State
    private isPlaying: boolean = false;
    private currentLevelData: Level | null = null;

    // Callbacks
    public onUpdateStats: ((fps: number) => void) | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        
        // Basic Scene Setup
        this.scene.createDefaultLight();
        
        // Render Loop
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                if (this.isPlaying) {
                    this.runGameLoop();
                }
                this.scene.render();
                if (this.onUpdateStats) {
                    this.onUpdateStats(this.engine?.getFps() || 0);
                }
            }
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.engine?.resize();
        });
    }

    /**
     * Set the Views (Cameras/Viewports)
     */
    public setViews(configs: {x:number, y:number, w:number, h:number}[]) {
        if(!this.scene) return;
        
        // Clean existing cameras if we were fully resetting, but for now let's just use the active camera
        // For a multi-view demo, we need multiple cameras or viewports.
        // Simplified: If configs > 1, we split the main camera viewport.
        
        // This is a simplified implementation of Multi-View for the demo.
        if (this.scene.activeCamera) {
            const main = configs[0];
            this.scene.activeCamera.viewport = new Viewport(main.x, main.y, main.w, main.h);
        }
        
        // Ideally we would spawn N cameras for N views based on the level data, but 
        // strictly following the entity component model, cameras should be entities.
    }

    /**
     * Load/Sync Level Data into the 3D Scene.
     * This acts as the "Editor -> Runtime" bridge.
     */
    public syncLevel(level: Level, playing: boolean) {
        this.isPlaying = playing;
        this.currentLevelData = level;
        if (!this.scene) return;

        const { environment } = level;
        this.scene.clearColor = Color4.FromHexString(environment.ambientColor + "FF");
        this.scene.gravity = new Vector3(environment.gravity.x, environment.gravity.y, environment.gravity.z);

        // --- Entity Reconciliation (Simple) ---
        // In a real engine, we would diff. Here we just ensure existence.
        
        // 1. Mark all current nodes as unused
        const processedIds = new Set<string>();

        level.entities.forEach(entity => {
            this.syncEntity(entity);
            processedIds.add(entity.id);
        });

        // 2. Cleanup removed entities
        this.entityNodeMap.forEach((node, id) => {
            if (!processedIds.has(id)) {
                node.dispose();
                this.entityNodeMap.delete(id);
            }
        });
    }

    private syncEntity(entity: Entity) {
        if (!this.scene) return;

        let node = this.entityNodeMap.get(entity.id);
        
        // Components
        const transform = entity.components.find(c => c.type === ComponentType.TRANSFORM) as TransformComponent;
        const meshComp = entity.components.find(c => c.type === ComponentType.MESH) as MeshComponent;
        const cameraComp = entity.components.find(c => c.type === ComponentType.CAMERA);

        if (!node) {
            // Create Node
            if (meshComp) {
                // Mesh Factory
                switch(meshComp.shape) {
                    case 'box': node = MeshBuilder.CreateBox(entity.name, {}, this.scene); break;
                    case 'sphere': node = MeshBuilder.CreateSphere(entity.name, {}, this.scene); break;
                    case 'plane': node = MeshBuilder.CreatePlane(entity.name, {}, this.scene); break;
                    default: node = new TransformNode(entity.name, this.scene);
                }
            } else if (cameraComp) {
                 const cam = new FreeCamera(entity.name, Vector3.Zero(), this.scene);
                 // Attach control if it's main camera
                 cam.attachControl(this.engine?.getRenderingCanvas(), true);
                 this.scene.activeCamera = cam;
                 node = cam;
            } else {
                node = new TransformNode(entity.name, this.scene);
            }
            this.entityNodeMap.set(entity.id, node);
            
            // Tag logic
            node.metadata = { entityId: entity.id };
        }

        // Apply Transform (Only if NOT playing, or if it is a static object)
        // If playing, the physics system owns the transform.
        const physics = entity.components.find(c => c.type === ComponentType.PHYSICS) as PhysicsComponent;
        const isStatic = physics?.isStatic ?? true;

        if (!this.isPlaying || isStatic) {
            if (transform) {
                // Safe cast to access properties that might not exist on all Node types (e.g. Camera vs Mesh)
                const tNode = node as any;
                
                if (tNode.position?.set) {
                    tNode.position.set(transform.position.x, transform.position.y, transform.position.z);
                }
                
                if (tNode.rotation?.set) {
                    tNode.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
                }
                
                // Cameras do not have scaling
                if (tNode.scaling?.set) {
                    tNode.scaling.set(transform.scale.x, transform.scale.y, transform.scale.z);
                }
            }
        }

        // Apply Mesh Props
        if (meshComp && node instanceof Mesh) {
            node.isVisible = meshComp.visible;
            node.visibility = 1.0;

            const regionComp = entity.components.find(c => c.type === ComponentType.REGION) as RegionComponent;
            if (regionComp) {
                 // Resize mesh to match region size for debug visualization
                 node.scaling.set(regionComp.size.x, regionComp.size.y, regionComp.size.z);
                 node.visibility = 0.2; // Transparent
                 node.isPickable = false;
            }

            // Material
            let mat = this.materialCache.get(meshComp.color);
            if (!mat) {
                mat = new StandardMaterial(`mat_${meshComp.color}`, this.scene);
                mat.diffuseColor = Color3.FromHexString(meshComp.color);
                mat.emissiveColor = mat.diffuseColor.scale(0.2);
                this.materialCache.set(meshComp.color, mat);
            }
            node.material = mat;
        }
    }

    /**
     * 12. Canonical Example (Behavioral) Implementation
     * Region System + Physics System Loop
     */
    private runGameLoop() {
        if (!this.currentLevelData || !this.scene) return;

        const dt = this.engine!.getDeltaTime() / 1000;

        // 1. Identify Regions
        const regions: { bounds: BoundingInfo, comp: RegionComponent, node: TransformNode }[] = [];
        this.currentLevelData.entities.forEach(ent => {
            const reg = ent.components.find(c => c.type === ComponentType.REGION) as RegionComponent;
            const node = this.entityNodeMap.get(ent.id);
            // Only consider TransformNodes/Meshes for regions (Cameras don't usually act as regions)
            if (reg && node && node instanceof TransformNode) {
                // Update bounds based on current transform
                const mesh = node as Mesh; 
                if (mesh.computeWorldMatrix) {
                    // Force compute world matrix to ensure bounds are correct
                    mesh.computeWorldMatrix(true);
                    // For box meshes, bounding info is accurate
                    if (mesh.getBoundingInfo) {
                        regions.push({ bounds: mesh.getBoundingInfo(), comp: reg, node });
                    }
                }
            }
        });
        
        // Sort by priority
        regions.sort((a, b) => b.comp.priority - a.comp.priority);

        // 2. Process Dynamic Objects
        this.currentLevelData.entities.forEach(ent => {
            const phys = ent.components.find(c => c.type === ComponentType.PHYSICS) as PhysicsComponent;
            const node = this.entityNodeMap.get(ent.id);
            
            // Check if node exists and has a position property (like TransformNode or Camera)
            if (phys && !phys.isStatic && node && (node as any).position) {
                const tNode = node as any; // Cast for manipulation

                // --- Region System Resolution ---
                // Calculate Effective Properties
                const currentPos = tNode.position;
                
                let effectiveGravityScale = 1.0;
                let effectiveTint: string | null = null;

                for (const region of regions) {
                    if (region.bounds.intersectsPoint(currentPos)) {
                        // Apply Overrides based on Blend Mode
                        const mods = region.comp.modifiers;
                        
                        // Gravity
                        if (mods.gravityScale !== undefined) {
                            if (region.comp.blendMode === RegionBlendMode.OVERRIDE) effectiveGravityScale = mods.gravityScale;
                            else if (region.comp.blendMode === RegionBlendMode.MULTIPLY) effectiveGravityScale *= mods.gravityScale;
                            else if (region.comp.blendMode === RegionBlendMode.ADD) effectiveGravityScale += mods.gravityScale;
                        }

                        // Tint (Simple override for now)
                        if (mods.colorTint) {
                            effectiveTint = mods.colorTint;
                        }
                    }
                }

                // --- Visual Feedback (Tint) ---
                if (node instanceof Mesh) {
                     if (effectiveTint) {
                         // Create temp material or modify existing (simplified)
                         (node as any).renderOverlay = true;
                         (node as any).overlayColor = Color3.FromHexString(effectiveTint);
                     } else {
                         (node as any).renderOverlay = false;
                     }
                }

                // --- Physics System Integration ---
                // Apply Gravity
                if (phys.useGravity) {
                    const globalGrav = this.scene!.gravity;
                    phys.velocity.y += globalGrav.y * effectiveGravityScale * dt;
                }

                // Apply Velocity
                tNode.position.x += phys.velocity.x * dt;
                tNode.position.y += phys.velocity.y * dt;
                tNode.position.z += phys.velocity.z * dt;

                // Floor Collision (Simple)
                if (tNode.position.y < 0.5) {
                    tNode.position.y = 0.5;
                    phys.velocity.y = 0;
                }

                // NOTE: We are mutating the Babylon Node state directly here.
                // In a full implementation, we would write back to the Entity 'phys.velocity' 
                // and 'transform.position' so the React state updates if needed, 
                // but for performance, we usually keep logic in the engine service 
                // and only sync back on save or pause.
            }
        });
    }

    public pickEntity(x: number, y: number): string | null {
        if (!this.scene) return null;
        const pickResult = this.scene.pick(x, y);
        if (pickResult.hit && pickResult.pickedMesh) {
            return pickResult.pickedMesh.metadata?.entityId || null;
        }
        return null;
    }

    public dispose() {
        this.engine?.dispose();
    }
}