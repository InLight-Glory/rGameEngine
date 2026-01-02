import { GameEngine } from './core/Engine';
import { Level } from './core/Level';
import { TransformComponent } from './components/TransformComponent';
import { MeshComponent } from './components/MeshComponent';
import { PhysicsComponent } from './components/PhysicsComponent';
import { RegionComponent } from './components/RegionComponent';
import { LifecycleState, BlendMode } from './core/Constants';
import { Vector3, ArcRotateCamera, HemisphericLight } from 'babylonjs';
import { Editor } from './editor/Editor';

// Setup
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new GameEngine(canvas);

// Create Level
const level = new Level(engine.getBabylonEngine());
// Setup Camera/Light manually for now (usually part of a CameraSystem or Level config)
const camera = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2.5, 15, Vector3.Zero(), level.scene);
camera.attachControl(canvas, true);
new HemisphericLight("light1", new Vector3(0, 1, 0), level.scene);

// Create Player Object
const player = level.createEntity('player');
player.addComponent(TransformComponent, { position: { x: 0, y: 5, z: 0 } });
player.addComponent(MeshComponent, { type: 'sphere', color: '#ff0000' }); // Start Red
player.addComponent(PhysicsComponent, { mass: 1.0 });
player.state = LifecycleState.ACTIVE;
player.initialize();
player.activate();

// Create Ground
const ground = level.createEntity('ground');
ground.addComponent(TransformComponent, { position: { x: 0, y: 0, z: 0 }, scale: { x: 20, y: 0.1, z: 20 } });
ground.addComponent(MeshComponent, { type: 'box', color: '#888888' });
ground.state = LifecycleState.ACTIVE;
ground.initialize();
ground.activate();

// Create Blue Low-Gravity Region
// Spec: "Player enters a low-gravity blue Region"
const region = level.createEntity('region_blue_low_grav');
region.addComponent(TransformComponent, { position: { x: 5, y: 2.5, z: 0 } });
region.addComponent(RegionComponent, {
    priority: 1,
    size: { x: 4, y: 5, z: 4 },
    modifiers: [
        {
            property: 'gravity',
            value: { x: 0, y: -1.0, z: 0 }, // Low gravity
            blendMode: BlendMode.OVERRIDE
        },
        {
            property: 'hue',
            value: '#0000ff', // Blue
            blendMode: BlendMode.OVERRIDE
        }
    ]
});
// Visual representation of region
region.addComponent(MeshComponent, { type: 'box', color: '#0000ff', alpha: 0.3 }); // Set alpha in schema

// We need to set scale for visual mesh separately if it's not the same as transform scale (which defaults to 1)
// In our RegionSystem, we used `region.size` for logic.
// Let's set the Transform scale to match `region.size` so the mesh matches visually.
const regionTransform = region.getComponent<TransformComponent>('Transform')!;
regionTransform.scale = new Vector3(4, 5, 4);

region.state = LifecycleState.ACTIVE;
region.initialize();
region.activate();

// Load Level
engine.loadLevel(level);

// Initialize Editor
// We need to wait for engine to start or just init it.
const editor = new Editor(engine);

// Start
engine.start();

console.log("Game Engine Started. Watch the player sphere fall. Move it into the blue box to see gravity change.");
console.log("Editor initialized. Select objects to see inspector.");
