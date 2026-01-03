import { 
  Engine, 
  Scene, 
  AbstractMesh, 
  Light, 
  Camera, 
  Mesh, 
  Vector3, 
  ArcRotateCamera, 
  HemisphericLight, 
  PointLight, 
  MeshBuilder, 
  StandardMaterial, 
  Color3, 
  Color4,
  GizmoManager,
  UtilityLayerRenderer,
  PointerEventTypes
} from '@babylonjs/core';
import { Level, Entity, ComponentType, TransformComponent, MeshComponent, LightComponent, RegionComponent } from '../types';

export class BabylonManager {
  private engine: Engine;
  private scene: Scene;
  private entityMeshMap: Map<string, AbstractMesh | Light | Camera> = new Map();
  private regionVisuals: Map<string, Mesh> = new Map();
  private gizmoManager: GizmoManager;
  private selectedId: string | null = null;
  
  // Callback to inform React when user drags gizmo
  public onTransformChange?: (id: string, position: Vector3, rotation: Vector3, scale: Vector3) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    
    // Default Camera (Editor Camera)
    const camera = new ArcRotateCamera("EditorCamera", Math.PI / 2, Math.PI / 3, 20, Vector3.Zero(), this.scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50;
    
    // Default Ambient Light
    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.5;

    // Gizmo Manager (The arrows/manipulators)
    this.gizmoManager = new GizmoManager(this.scene);
    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;
    this.gizmoManager.usePointerToAttachGizmos = false;
    this.gizmoManager.clearGizmoOnEmptyPointerEvent = true;

    // Detect when drag ends to save state
    this.scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERUP) {
            this.notifyTransformChange();
        }
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private notifyTransformChange() {
    if (this.selectedId && this.onTransformChange) {
        const node = this.entityMeshMap.get(this.selectedId);
        if (node && node instanceof AbstractMesh) {
            // Convert Babylon Vector3 to plain object
            const p = node.position;
            const r = node.rotation; // Euler
            const s = node.scaling;
            
            this.onTransformChange(
                this.selectedId,
                { x: p.x, y: p.y, z: p.z },
                { x: r.x, y: r.y, z: r.z },
                { x: s.x, y: s.y, z: s.z }
            );
        }
    }
  }

  public setGizmoMode(mode: 'position' | 'rotation' | 'scale') {
    this.gizmoManager.positionGizmoEnabled = mode === 'position';
    this.gizmoManager.rotationGizmoEnabled = mode === 'rotation';
    this.gizmoManager.scaleGizmoEnabled = mode === 'scale';
  }

  public selectEntity(id: string | null) {
    this.selectedId = id;
    if (id) {
        const mesh = this.entityMeshMap.get(id);
        if (mesh && mesh instanceof AbstractMesh) {
            this.gizmoManager.attachToMesh(mesh);
        } else {
            this.gizmoManager.attachToMesh(null);
        }
    } else {
        this.gizmoManager.attachToMesh(null);
    }
  }

  public resize() {
    this.engine.resize();
  }

  public getScene(): Scene {
    return this.scene;
  }

  public loadLevel(level: Level) {
    // Environment
    if (level.environment) {
      this.scene.gravity = new Vector3(
        level.environment.gravity.x,
        level.environment.gravity.y,
        level.environment.gravity.z
      );
      this.scene.clearColor = Color4.FromHexString(level.environment.ambientColor + "FF");
    }

    // Sync Entities (Create or Update)
    // We intentionally do NOT clear everything to prevent flickering
    const activeIds = new Set(level.entities.map(e => e.id));
    
    // Remove deleted entities
    for (const [id, mesh] of this.entityMeshMap) {
        if (!activeIds.has(id)) {
            mesh.dispose();
            this.entityMeshMap.delete(id);
            if (this.selectedId === id) this.selectEntity(null);
        }
    }

    // Update/Create entities
    level.entities.forEach(entity => this.syncEntity(entity));
  }

  public syncEntity(entity: Entity) {
    let babylonObject = this.entityMeshMap.get(entity.id);
    
    const transform = entity.components.find(c => c.type === ComponentType.TRANSFORM) as TransformComponent;
    const meshData = entity.components.find(c => c.type === ComponentType.MESH) as MeshComponent;
    const lightData = entity.components.find(c => c.type === ComponentType.LIGHT) as LightComponent;
    const regionData = entity.components.find(c => c.type === ComponentType.REGION) as RegionComponent;

    // 1. Mesh Construction (Only recreate if type changes or doesn't exist)
    if (meshData) {
      const needsCreation = !babylonObject || !(babylonObject instanceof AbstractMesh) || (babylonObject.metadata?.meshType !== meshData.meshType);
      
      if (needsCreation) {
        if (babylonObject) babylonObject.dispose();
        
        switch (meshData.meshType) {
          case 'box': 
            babylonObject = MeshBuilder.CreateBox(entity.name, { size: 1 }, this.scene); 
            break;
          case 'sphere': 
            babylonObject = MeshBuilder.CreateSphere(entity.name, { diameter: 1 }, this.scene); 
            break;
          case 'plane': 
            babylonObject = MeshBuilder.CreateGround(entity.name, { width: 1, height: 1 }, this.scene); 
            break;
        }
        
        babylonObject.metadata = { meshType: meshData.meshType }; // Tag it
        const material = new StandardMaterial(entity.name + "_mat", this.scene);
        (babylonObject as Mesh).material = material;
        this.entityMeshMap.set(entity.id, babylonObject as AbstractMesh);
        
        // Re-attach gizmo if this was selected
        if (this.selectedId === entity.id) {
            this.gizmoManager.attachToMesh(babylonObject as AbstractMesh);
        }
      }
      
      const mat = (babylonObject as Mesh).material as StandardMaterial;
      if (mat) {
        mat.diffuseColor = Color3.FromHexString(meshData.color);
        mat.emissiveColor = mat.diffuseColor.scale(0.2); 
      }
    } 

    // 2. Light Construction
    else if (lightData) {
      if (!babylonObject || !(babylonObject instanceof PointLight)) {
        if (babylonObject) babylonObject.dispose();
        babylonObject = new PointLight(entity.name, Vector3.Zero(), this.scene);
        this.entityMeshMap.set(entity.id, babylonObject as Light);
      }
      const light = babylonObject as PointLight;
      light.intensity = lightData.intensity;
      light.diffuse = Color3.FromHexString(lightData.color);
    }
    
    // 3. Transform Sync
    // We only update IF the difference is significant to avoid fighting with the gizmo loop
    if (transform && babylonObject) {
       if (babylonObject instanceof AbstractMesh || babylonObject instanceof PointLight) {
           // Only update if distance > epsilon to avoid floating point jitter loop
           if (Vector3.Distance(babylonObject.position, new Vector3(transform.position.x, transform.position.y, transform.position.z)) > 0.001) {
                babylonObject.position.set(transform.position.x, transform.position.y, transform.position.z);
           }
       }
       
       if (babylonObject instanceof AbstractMesh) {
           // Rotation
           const currentRot = babylonObject.rotation;
           if (Vector3.Distance(currentRot, new Vector3(transform.rotation.x, transform.rotation.y, transform.rotation.z)) > 0.001) {
               babylonObject.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
           }
           // Scale
           const currentScale = babylonObject.scaling;
           if (Vector3.Distance(currentScale, new Vector3(transform.scale.x, transform.scale.y, transform.scale.z)) > 0.001) {
               babylonObject.scaling.set(transform.scale.x, transform.scale.y, transform.scale.z);
           }
       }
    }

    // 4. Region Visuals
    if (regionData && transform) {
      let regionMesh = this.regionVisuals.get(entity.id);
      if (!regionMesh) {
        regionMesh = MeshBuilder.CreateBox(entity.name + "_region", { size: 1 }, this.scene);
        const regMat = new StandardMaterial("regMat", this.scene);
        regMat.wireframe = true;
        regMat.emissiveColor = Color3.Teal();
        regionMesh.material = regMat;
        this.regionVisuals.set(entity.id, regionMesh);
      }
      regionMesh.position.set(transform.position.x, transform.position.y, transform.position.z);
      regionMesh.scaling.set(regionData.size.x, regionData.size.y, regionData.size.z);
    }
  }

  public dispose() {
    this.engine.dispose();
  }
}