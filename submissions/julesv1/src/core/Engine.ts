import { Engine as BabylonEngine, EngineOptions } from 'babylonjs';
import { Level } from './Level';
import { System } from '../systems/System';
import { RenderSystem } from '../systems/RenderSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { RegionSystem } from '../systems/RegionSystem';
import { LogicSystem } from '../systems/LogicSystem';
import { SeededRNG } from '../utils/SeededRNG';
import { VariableStore } from './Constants';

export class GameEngine {
    private engine: BabylonEngine;
    private activeLevel: Level | null = null;
    private systems: System[] = [];
    private fixedSystems: System[] = [];
    private running: boolean = false;

    public rng: SeededRNG;
    public globalVariables: VariableStore = {};

    // Fixed timestep vars
    private fixedTimeStep: number = 1.0 / 60.0;
    private accumulator: number = 0;

    constructor(canvas: HTMLCanvasElement, options?: EngineOptions) {
        this.rng = new SeededRNG(12345); // Default seed
        this.engine = new BabylonEngine(canvas, true, options);

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    public getBabylonEngine(): BabylonEngine {
        return this.engine;
    }

    public loadLevel(level: Level): void {
        if (this.activeLevel) {
            this.activeLevel.dispose();
        }
        this.activeLevel = level;

        // Systems that run on a fixed timestep (Physics, Game Logic)
        this.fixedSystems = [
            new RegionSystem(level), // Updates effective properties before physics
            new LogicSystem(level),  // Run game logic (scripts)
            new PhysicsSystem(level) // Uses effective properties & logic outputs
        ];

        // Systems that run every frame (Render)
        this.systems = [
            new RenderSystem(level)
        ];
    }

    public start(): void {
        if (this.running) return;
        this.running = true;

        this.engine.runRenderLoop(() => {
            if (!this.activeLevel) return;

            const dt = this.engine.getDeltaTime() / 1000.0;

            // Fixed Timestep Loop for Physics & Gameplay Logic
            this.accumulator += dt;
            while (this.accumulator >= this.fixedTimeStep) {
                this.fixedSystems.forEach(s => s.update(this.fixedTimeStep));
                this.accumulator -= this.fixedTimeStep;
            }

            // Update Variable Systems (Render)
            this.systems.forEach(system => system.update(dt));

            // Render
            this.activeLevel.scene.render();
        });
    }

    public stop(): void {
        this.engine.stopRenderLoop();
        this.running = false;
    }
}
