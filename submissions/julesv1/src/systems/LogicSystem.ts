import { System } from './System';
import { LogicComponent } from '../components/LogicComponent';
import { LifecycleState } from '../core/Constants';

export class LogicSystem extends System {
    public update(dt: number): void {
        this.level.entities.forEach(entity => {
            // Lifecycle Check: Only update ACTIVE entities
            if (entity.state !== LifecycleState.ACTIVE) return;

            const logic = entity.getComponent<LogicComponent>('Logic');
            if (logic && logic.script) {
                // Spec: "LogicComponent runtime errors MUST be sandboxed per-entity"
                try {
                    logic.script(entity, dt);
                } catch (e) {
                    console.error(`Error in LogicComponent for entity ${entity.id}:`, e);
                    // Disable the entity to prevent loop crash? Spec says "sandboxed", likely means preventing crash.
                    // Ideally we might disable just the script, but disabling the entity is safer if it's broken.
                    // Or we just swallow the error.
                    // "Errors MUST be surfaced to the developer" -> console.error
                }
            }
        });
    }
}
