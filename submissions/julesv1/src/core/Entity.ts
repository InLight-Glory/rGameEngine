import { Component, ComponentSchema } from './Component';
import { LifecycleState, VariableStore } from './Constants';
import { Level } from './Level';
import { TransformComponent } from '../components/TransformComponent';

export class Entity {
  public id: string;
  public state: LifecycleState = LifecycleState.CREATED;
  public level: Level;
  public components: Map<string, Component> = new Map();
  public localVariables: VariableStore = {};
  public transform!: TransformComponent; // Spec: MUST have a TransformComponent (for Objects)

  constructor(id: string, level: Level) {
    this.id = id;
    this.level = level;
    // Note: TransformComponent should be added immediately for Objects,
    // but the spec distinguishes Object vs Instance.
    // Instance MAY have Transform. Object MUST have Transform.
    // We will assume the factory creates the transform.
  }

  public addComponent<T extends Component>(
    Ctor: new (owner: Entity, data?: ComponentSchema) => T,
    data?: ComponentSchema
  ): T {
    if (this.state === LifecycleState.DESTROYED) {
      throw new Error("Cannot add component to destroyed entity");
    }
    const component = new Ctor(this, data);
    this.components.set(component.name, component);

    if (component.name === 'Transform') {
        this.transform = component as unknown as TransformComponent;
    }

    if (this.state === LifecycleState.INITIALIZED || this.state === LifecycleState.ACTIVE) {
        component.onInitialize();
    }
    if (this.state === LifecycleState.ACTIVE) {
        component.onActivate();
    }

    return component;
  }

  public getComponent<T extends Component>(name: string): T | undefined {
    return this.components.get(name) as T;
  }

  public initialize(): void {
    if (this.state !== LifecycleState.CREATED) return;
    this.state = LifecycleState.INITIALIZED;
    this.components.forEach(c => c.onInitialize());
  }

  public activate(): void {
    if (this.state === LifecycleState.ACTIVE) return;
    this.state = LifecycleState.ACTIVE;
    this.components.forEach(c => c.onActivate());
  }

  public disable(): void {
    if (this.state !== LifecycleState.ACTIVE) return;
    this.state = LifecycleState.DISABLED;
    this.components.forEach(c => c.onDisable());
  }

  public destroy(): void {
    if (this.state === LifecycleState.DESTROYED) return;
    this.state = LifecycleState.DESTROYED;
    this.components.forEach(c => c.onDestroy());
    this.components.clear();
    // Spec: Destroyed entities MUST NOT be referenced again.
    // The Level should remove it.
  }
}
