import { System } from './System';
import { LogicComponent } from '../components/LogicComponent';
import { LifecycleState } from '../core/Constants';

export class LogicSystem extends System {
    public update(dt: number): void {
        this.level.entities.forEach(entity => {
            // Lifecycle Check: Only update ACTIVE entities
            if (entity.state !== LifecycleState.ACTIVE) return;

            const logic = entity.getComponent<LogicComponent>('Logic');
            if (logic) {
                // Compile if code exists but script doesn't match
                if (logic.code && !logic.script) {
                    try {
                        // Create function from string.
                        // Signature: (entity, dt)
                        logic.script = new Function('entity', 'dt', logic.code) as (entity: any, dt: number) => void;
                    } catch (e) {
                        console.error(`Compilation Error in LogicComponent for entity ${entity.id}:`, e);
                        // Prevent constant recompilation attempts
                        logic.script = () => {};
                    }
                }

                if (logic.script) {
                    // Spec: "LogicComponent runtime errors MUST be sandboxed per-entity"
                    try {
                        logic.script(entity, dt);
                    } catch (e) {
                        console.error(`Runtime Error in LogicComponent for entity ${entity.id}:`, e);
                    }
                }
            }
        });
    }
}
