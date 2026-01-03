// Vector representation for JSON serialization
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

// -- Component System --

export enum ComponentType {
  TRANSFORM = 'TRANSFORM',
  MESH = 'MESH',
  LIGHT = 'LIGHT',
  PHYSICS = 'PHYSICS',
  REGION = 'REGION',
  LOGIC = 'LOGIC'
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
}

export interface TransformComponent extends BaseComponent {
  type: ComponentType.TRANSFORM;
  position: Vector3;
  rotation: Vector3; // Euler for editor simplicity
  scale: Vector3;
}

export interface MeshComponent extends BaseComponent {
  type: ComponentType.MESH;
  meshType: 'box' | 'sphere' | 'plane';
  color: string;
}

export interface LightComponent extends BaseComponent {
  type: ComponentType.LIGHT;
  intensity: number;
  color: string;
}

export interface RegionComponent extends BaseComponent {
  type: ComponentType.REGION;
  priority: number;
  size: Vector3;
  effect: 'gravity_override' | 'color_tint' | 'speed_boost';
  effectValue: any;
}

export type ComponentData = 
  | TransformComponent 
  | MeshComponent 
  | LightComponent 
  | RegionComponent;

// -- Entity System --

export interface Entity {
  id: string;
  name: string;
  components: ComponentData[];
  parentId?: string;
  isActive: boolean;
}

// -- Level/Scene System --

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

// -- Engine State --

export interface EditorState {
  currentLevel: Level;
  selectedEntityId: string | null;
  isPlaying: boolean;
}

export const DEFAULT_LEVEL: Level = {
  id: 'level_01',
  name: 'New Level',
  specVersion: '1.1',
  environment: {
    gravity: { x: 0, y: -9.81, z: 0 },
    ambientColor: '#333333',
  },
  entities: [
    {
      id: 'camera_main',
      name: 'Main Camera',
      isActive: true,
      components: [
        {
          id: 'c_cam_trans',
          type: ComponentType.TRANSFORM,
          position: { x: 0, y: 5, z: -10 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        }
      ]
    },
    {
      id: 'light_main',
      name: 'Sun Light',
      isActive: true,
      components: [
        {
          id: 'c_light_trans',
          type: ComponentType.TRANSFORM,
          position: { x: 0, y: 10, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        {
          id: 'c_light_data',
          type: ComponentType.LIGHT,
          intensity: 1.0,
          color: '#ffffff'
        }
      ]
    },
    {
      id: 'ground',
      name: 'Ground',
      isActive: true,
      components: [
        {
          id: 'c_gnd_trans',
          type: ComponentType.TRANSFORM,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 10, y: 1, z: 10 },
        },
        {
          id: 'c_gnd_mesh',
          type: ComponentType.MESH,
          meshType: 'plane',
          color: '#555555'
        }
      ]
    }
  ]
};