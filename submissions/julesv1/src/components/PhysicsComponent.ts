import { Component, ComponentSchema } from '../core/Component';
import { Vector3 } from 'babylonjs';

export class PhysicsComponent extends Component {
    public readonly name = 'Physics';
    public velocity: Vector3 = Vector3.Zero();
    public mass: number = 1.0;

    // Base properties (unmodified by regions)
    public baseGravity: Vector3 = new Vector3(0, -9.81, 0);

    // Effective properties (modified by regions)
    public effectiveGravity: Vector3 = new Vector3(0, -9.81, 0);

    public deserialize(data: ComponentSchema): void {
        if (data.velocity) this.velocity = new Vector3(data.velocity.x, data.velocity.y, data.velocity.z);
        if (data.mass) this.mass = data.mass;
        if (data.gravity) {
            this.baseGravity = new Vector3(data.gravity.x, data.gravity.y, data.gravity.z);
            this.effectiveGravity.copyFrom(this.baseGravity);
        }
    }

    public serialize(): ComponentSchema {
        return {
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
            mass: this.mass,
            gravity: { x: this.baseGravity.x, y: this.baseGravity.y, z: this.baseGravity.z }
        };
    }
}
