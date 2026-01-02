import { Level, ComponentType, LifecycleState, Entity, ViewConfig, RegionBlendMode } from './types';

// Point this to your actual PHP server location.
// If using a local dev setup like XAMPP, it might be 'http://localhost/nebula/api/level.php'
// For this demo structure, we assume the api folder is served relative to the root.
export const API_ENDPOINT = '/api/level.php';

export const DEFAULT_VIEW_CONFIGS: ViewConfig[] = [
    { id: 'main', x: 0, y: 0, w: 1, h: 1, label: 'Main Camera' }
];

export const SPLIT_VIEW_CONFIGS: ViewConfig[] = [
    { id: 'top', x: 0, y: 0, w: 1, h: 0.5, label: 'Perspective' },
    { id: 'bottom', x: 0, y: 0.5, w: 1, h: 0.5, label: 'Top Down (Map)' }
];

export const createEntity = (name: string): Entity => ({
    id: `ent_${Date.now()}`,
    name,
    state: LifecycleState.CREATED,
    components: [
        {
            id: `cmp_${Date.now()}_t`,
            type: ComponentType.TRANSFORM,
            position: {x:0,y:0,z:0},
            rotation: {x:0,y:0,z:0},
            scale: {x:1,y:1,z:1}
        }
    ]
});

export const DEFAULT_LEVEL: Level = {
    id: "lvl_default",
    name: "Offline Scene",
    specVersion: "1.0",
    entities: [
        {
            id: "ent_camera",
            name: "Main Camera",
            state: LifecycleState.ACTIVE,
            components: [
                { id: "c1", type: ComponentType.TRANSFORM, position: {x:0, y:2, z:-5}, rotation: {x:0, y:0, z:0}, scale: {x:1, y:1, z:1} },
                { id: "c2", type: ComponentType.CAMERA, fov: 1, isMain: true }
            ]
        },
        {
            id: "ent_cube",
            name: "Cube",
            state: LifecycleState.ACTIVE,
            components: [
                { id: "c3", type: ComponentType.TRANSFORM, position: {x:0, y:0.5, z:0}, rotation: {x:0, y:0, z:0}, scale: {x:1, y:1, z:1} },
                { id: "c4", type: ComponentType.MESH, shape: "box", color: "#3b82f6", visible: true },
                { id: "c5", type: ComponentType.PHYSICS, velocity: {x:0, y:0, z:0}, mass: 1, useGravity: true, isStatic: false }
            ]
        },
        {
            id: "ent_floor",
            name: "Floor",
            state: LifecycleState.ACTIVE,
            components: [
                { id: "c6", type: ComponentType.TRANSFORM, position: {x:0, y:0, z:0}, rotation: {x:0, y:0, z:0}, scale: {x:10, y:0.1, z:10} },
                { id: "c7", type: ComponentType.MESH, shape: "box", color: "#374151", visible: true },
                { id: "c8", type: ComponentType.PHYSICS, velocity: {x:0, y:0, z:0}, mass: 0, useGravity: false, isStatic: true }
            ]
        }
    ],
    environment: {
        gravity: {x: 0, y: -9.81, z: 0},
        ambientColor: "#111827"
    }
};