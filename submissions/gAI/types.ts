export type Vector3 = { x: number; y: number; z: number };
export type Quaternion = { x: number; y: number; z: number; w: number };

// --- Lifecycle & Enums ---

export enum LifecycleState {
  CREATED = 'CREATED',
  INITIALIZED = 'INITIALIZED',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  DESTROYED = 'DESTROYED',
}

export enum ComponentType {
  TRANSFORM = 'Transform',
  MESH = 'Mesh',
  PHYSICS = 'Physics',
  REGION = 'Region',
  LOGIC = 'Logic',
  CAMERA = 'Camera'
}

export enum RegionBlendMode {
  OVERRIDE = 'override',
  ADD = 'add',
  MULTIPLY = 'multiply'
}

// --- Components ---

export interface BaseComponent {
  id: string;
  type: ComponentType;
}

export interface TransformComponent extends BaseComponent {
  type: ComponentType.TRANSFORM;
  position: Vector3;
  rotation: Vector3; // Euler for UI simplicity
  scale: Vector3;
}

export interface MeshComponent extends BaseComponent {
  type: ComponentType.MESH;
  shape: 'box' | 'sphere' | 'plane';
  color: string;
  visible: boolean;
}

export interface PhysicsComponent extends BaseComponent {
  type: ComponentType.PHYSICS;
  velocity: Vector3;
  mass: number;
  useGravity: boolean;
  isStatic: boolean;
}

export interface RegionComponent extends BaseComponent {
  type: ComponentType.REGION;
  priority: number;
  size: Vector3;
  modifiers: {
    gravityScale?: number;
    colorTint?: string; // Hex
    timeScale?: number;
  };
  blendMode: RegionBlendMode;
}

export interface CameraComponent extends BaseComponent {
    type: ComponentType.CAMERA;
    fov: number;
    isMain: boolean;
}

export type Component = 
  | TransformComponent 
  | MeshComponent 
  | PhysicsComponent 
  | RegionComponent
  | CameraComponent;

// --- Entities & Level ---

export interface Entity {
  id: string;
  name: string;
  state: LifecycleState;
  components: Component[];
  parentId?: string;
}

export interface Level {
  id: string;
  name: string;
  specVersion: string;
  entities: Entity[];
  environment: {
    gravity: Vector3;
    ambientColor: string;
  };
}

// --- Engine State ---

export interface EngineState {
  isPlaying: boolean;
  currentLevel: Level;
  selectedEntityId: string | null;
  views: ViewConfig[];
}

export interface ViewConfig {
    id: string;
    x: number; 
    y: number; 
    w: number; 
    h: number;
    label: string;
}
