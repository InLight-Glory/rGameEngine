import { Component, ComponentSchema } from '../core/Component';
import { Vector3, Quaternion, TransformNode } from 'babylonjs';

export class TransformComponent extends Component {
  public readonly name = 'Transform';

  // Local state
  public position: Vector3 = Vector3.Zero();
  public rotation: Quaternion = Quaternion.Identity();
  public scale: Vector3 = Vector3.One();
  public parentId: string | null = null;

  // Babylon mapping
  // Spec: "Mesh, TransformNode, or Sprite"
  // We use a TransformNode as the anchor, and children can be meshes.
  // Or the Entity's "MeshComponent" can attach to this node.
  // Ideally, the RenderSystem syncs this data to the Babylon node.
  // But for hierarchy, we might need a node.
  // To keep it clean, we'll store raw data here and let RenderSystem apply it.

  public deserialize(data: ComponentSchema): void {
    if (data.position) this.position = new Vector3(data.position.x, data.position.y, data.position.z);
    if (data.rotation) this.rotation = new Quaternion(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
    if (data.scale) this.scale = new Vector3(data.scale.x, data.scale.y, data.scale.z);
    if (data.parentId) this.parentId = data.parentId;
  }

  public serialize(): ComponentSchema {
    return {
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z, w: this.rotation.w },
      scale: { x: this.scale.x, y: this.scale.y, z: this.scale.z },
      parentId: this.parentId
    };
  }
}
