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
  Color4 
} from '@babylonjs/core';
import { Level, Entity, ComponentType, TransformComponent, MeshComponent, LightComponent, RegionComponent } from '../types';

export class BabylonManager {
  private engine: Engine;
  private scene: Scene;
  private entityMeshMap: Map<string, AbstractMesh | Light | Camera> = new Map();
  private regionVisuals: Map<string, Mesh> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    
    // Default Camera (Editor Camera)
    const camera = new ArcRotateCamera("EditorCamera", Math.PI / 2, Math.PI / 3, 15, Vector3.Zero(), this.scene);
    camera.attachControl(canvas, true);
    
    // Default Light
    new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  public getScene(): Scene {
    return this.scene;
  }

  public loadLevel(level: Level) {
    // Cleanup existing
    this.entityMeshMap.forEach(obj => obj.dispose());
    this.entityMeshMap.clear();
    this.regionVisuals.forEach(obj => obj.dispose());
    this.regionVisuals.clear();

    // Set Environment
    if (level.environment) {
      this.scene.gravity = new Vector3(
        level.environment.gravity.x,
        level.environment.gravity.y,
        level.environment.gravity.z
      );
      this.scene.clearColor = Color4.FromHexString(level.environment.ambientColor + "FF");
    }

    // Create Entities
    level.entities.forEach(entity => this.syncEntity(entity));
  }

  public syncEntity(entity: Entity) {
    // Check if exists, if so, update, else create
    let babylonObject = this.entityMeshMap.get(entity.id);
    
    const transform = entity.components.find(c => c.type === ComponentType.TRANSFORM) as TransformComponent;
    const meshData = entity.components.find(c => c.type === ComponentType.MESH) as MeshComponent;
    const lightData = entity.components.find(c => c.type === ComponentType.LIGHT) as LightComponent;
    const regionData = entity.components.find(c => c.type === ComponentType.REGION) as RegionComponent;

    // --- Mesh Handling ---
    if (meshData) {
      if (!babylonObject || !(babylonObject instanceof AbstractMesh)) {
        if (babylonObject) babylonObject.dispose();
        
        switch (meshData.meshType) {
          case 'box': babylonObject = MeshBuilder.CreateBox(entity.name, {}, this.scene); break;
          case 'sphere': babylonObject = MeshBuilder.CreateSphere(entity.name, {}, this.scene); break;
          case 'plane': babylonObject = MeshBuilder.CreatePlane(entity.name, {}, this.scene); break;
        }
        
        const material = new StandardMaterial(entity.name + "_mat", this.scene);
        (babylonObject as Mesh).material = material;
        this.entityMeshMap.set(entity.id, babylonObject as AbstractMesh);
      }
      
      const mat = (babylonObject as Mesh).material as StandardMaterial;
      if (mat) mat.diffuseColor = Color3.FromHexString(meshData.color);
    } 

    // --- Light Handling ---
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
    
    // --- Transform Handling ---
    if (transform && babylonObject) {
       // Position
       // We use PointLight here because base Light doesn't have position, but we know we use PointLight.
       if (babylonObject instanceof AbstractMesh || babylonObject instanceof PointLight) {
           babylonObject.position = new Vector3(transform.position.x, transform.position.y, transform.position.z);
       }
       
       // Rotation
       if (babylonObject instanceof AbstractMesh) {
           babylonObject.rotation = new Vector3(
               transform.rotation.x,
               transform.rotation.y,
               transform.rotation.z
           );
           babylonObject.scaling = new Vector3(transform.scale.x, transform.scale.y, transform.scale.z);
       }
    }

    // --- Region Visuals (Debug) ---
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