import { Entity } from './Entity';

export interface ComponentSchema {
  [key: string]: any;
}

export abstract class Component {
  public owner: Entity;
  public abstract readonly name: string;

  constructor(owner: Entity, data?: ComponentSchema) {
    this.owner = owner;
    if (data) {
      this.deserialize(data);
    }
  }

  // Data-driven initialization
  public abstract deserialize(data: ComponentSchema): void;
  public abstract serialize(): ComponentSchema;

  public onInitialize(): void {}
  public onActivate(): void {}
  public onDisable(): void {}
  public onDestroy(): void {}
}
