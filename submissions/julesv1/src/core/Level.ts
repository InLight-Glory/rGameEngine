import { Entity } from './Entity';
import { Scene, Engine, NullEngine } from 'babylonjs';
import { LifecycleState } from './Constants';
import { EventBus } from '../utils/EventBus';

export class Level {
  public scene: Scene;
  public entities: Map<string, Entity> = new Map();
  public eventBus: EventBus;
  public specVersion: string = "1.1";

  constructor(engine: Engine | NullEngine) {
    this.scene = new Scene(engine);
    this.eventBus = new EventBus();
  }

  public createEntity(id: string): Entity {
    if (this.entities.has(id)) {
      throw new Error(`Entity with id ${id} already exists`);
    }
    const entity = new Entity(id, this);
    this.entities.set(id, entity);
    return entity;
  }

  public removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.destroy();
      this.entities.delete(id);
    }
  }

  public update(): void {
    // Determine active entities and update systems (managed by Engine class generally, but Level holds state)
  }

  public dispose(): void {
    this.entities.forEach(e => e.destroy());
    this.entities.clear();
    this.scene.dispose();
  }
}
