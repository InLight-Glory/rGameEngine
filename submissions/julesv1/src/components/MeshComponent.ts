import { Component, ComponentSchema } from '../core/Component';
import { Mesh, MeshBuilder } from 'babylonjs';

export class MeshComponent extends Component {
  public readonly name = 'Mesh';
  public mesh: Mesh | null = null;
  public meshType: string = 'box'; // 'box', 'sphere', 'cylinder', 'capsule'

  // Base properties
  public baseColor: string = '#ffffff';
  public alpha: number = 1.0;

  // Effective properties (can be read by RenderSystem)
  public color: string = '#ffffff';

  public deserialize(data: ComponentSchema): void {
      if (data.type) this.meshType = data.type;
      if (data.color) {
          this.baseColor = data.color;
          this.color = data.color;
      }
      if (data.alpha !== undefined) this.alpha = data.alpha;
  }

  public serialize(): ComponentSchema {
      return {
          type: this.meshType,
          color: this.baseColor,
          alpha: this.alpha
      };
  }

  public onInitialize(): void {
    const scene = this.owner.level.scene;
    const opts = { updatable: true };

    // Support new shapes
    switch (this.meshType) {
        case 'box':
            this.mesh = MeshBuilder.CreateBox(this.owner.id + "_mesh", { size: 1, ...opts }, scene);
            break;
        case 'sphere':
            this.mesh = MeshBuilder.CreateSphere(this.owner.id + "_mesh", { diameter: 1, ...opts }, scene);
            break;
        case 'cylinder':
            this.mesh = MeshBuilder.CreateCylinder(this.owner.id + "_mesh", { diameter: 1, height: 2, ...opts }, scene);
            break;
        case 'capsule':
            this.mesh = MeshBuilder.CreateCapsule(this.owner.id + "_mesh", { radius: 0.5, height: 2, ...opts }, scene);
            break;
        default:
            this.mesh = MeshBuilder.CreateBox(this.owner.id + "_mesh", { size: 1, ...opts }, scene);
            break;
    }
  }

  public onDestroy(): void {
      if (this.mesh) {
          this.mesh.dispose();
          this.mesh = null;
      }
  }
}
