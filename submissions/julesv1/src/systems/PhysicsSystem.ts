import { System } from './System';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { TransformComponent } from '../components/TransformComponent';
import { LifecycleState } from '../core/Constants';

export class PhysicsSystem extends System {
    // Spec: "Physics systems MUST run on a fixed timestep"
    // We assume the Engine calls update with a fixed delta or accumulation.

    public update(dt: number): void {
        this.level.entities.forEach(entity => {
            // Lifecycle Check: Only update ACTIVE entities
            if (entity.state !== LifecycleState.ACTIVE) return;

            const physics = entity.getComponent<PhysicsComponent>('Physics');
            const transform = entity.getComponent<TransformComponent>('Transform');

            if (physics && transform) {
                // Apply effective gravity (calculated by RegionSystem)
                // v = v0 + a * t
                physics.velocity.addInPlace(physics.effectiveGravity.scale(dt));

                // x = x0 + v * t
                transform.position.addInPlace(physics.velocity.scale(dt));

                // Ground collision (Simple floor at y=0 for demo)
                if (transform.position.y < 0.5) {
                    transform.position.y = 0.5;
                    physics.velocity.y = 0;
                }
            }
        });
    }
}
