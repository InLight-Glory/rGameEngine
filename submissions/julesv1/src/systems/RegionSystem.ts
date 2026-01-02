import { System } from './System';
import { TransformComponent } from '../components/TransformComponent';
import { RegionComponent, Modifier } from '../components/RegionComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { MeshComponent } from '../components/MeshComponent';
import { BlendMode, LifecycleState } from '../core/Constants';
import { Vector3, Color3 } from 'babylonjs';

export class RegionSystem extends System {
    // Cache previous region membership to detect enter/exit
    private regionMembership: Map<string, Set<string>> = new Map();

    public update(dt: number): void {
        const regions: { entityId: string, region: RegionComponent, transform: TransformComponent }[] = [];

        // 1. Collect all regions (Must be ACTIVE)
        this.level.entities.forEach(entity => {
            if (entity.state !== LifecycleState.ACTIVE) return;

            const region = entity.getComponent<RegionComponent>('Region');
            const transform = entity.getComponent<TransformComponent>('Transform');
            if (region && transform) {
                regions.push({ entityId: entity.id, region, transform });
            }
        });

        // 2. For each object, check membership and resolve properties
        this.level.entities.forEach(entity => {
            if (entity.state !== LifecycleState.ACTIVE) return;

            const transform = entity.getComponent<TransformComponent>('Transform');
            // Skip if no transform (can't be in a region) or if it is a region itself
            if (!transform || entity.getComponent<RegionComponent>('Region')) return;

            const activeRegions: RegionComponent[] = [];
            const newMembership = new Set<string>();

            // Check containment
            regions.forEach(r => {
                if (this.isInside(transform.position, r.transform.position, r.region.size)) {
                    activeRegions.push(r.region);
                    newMembership.add(r.entityId);
                }
            });

            // Handle Enter/Exit events & Cache Check
            const oldMembership = this.regionMembership.get(entity.id) || new Set();
            let membershipChanged = false;

            // Simple set equality check (size check + element check)
            if (oldMembership.size !== newMembership.size) {
                membershipChanged = true;
            } else {
                for (const regionId of newMembership) {
                    if (!oldMembership.has(regionId)) {
                        membershipChanged = true;
                        break;
                    }
                }
            }

            // Enter
            newMembership.forEach(regionId => {
                if (!oldMembership.has(regionId)) {
                    this.level.eventBus.emit('RegionEnter', { entityId: entity.id, regionId }, this);
                }
            });

            // Exit
            oldMembership.forEach(regionId => {
                if (!newMembership.has(regionId)) {
                    this.level.eventBus.emit('RegionExit', { entityId: entity.id, regionId }, this);
                }
            });

            this.regionMembership.set(entity.id, newMembership);

            // 3. Resolve Effective Properties (Spec Section 4)
            // "Cache the resulting effective values until region membership changes"
            if (membershipChanged) {
                // Sort by priority descending
                activeRegions.sort((a, b) => b.priority - a.priority);
                this.resolveProperties(entity, activeRegions);
            }
        });
    }

    private isInside(point: Vector3, center: Vector3, size: { x: number, y: number, z: number }): boolean {
        const halfX = size.x / 2;
        const halfY = size.y / 2;
        const halfZ = size.z / 2;

        return (
            point.x >= center.x - halfX && point.x <= center.x + halfX &&
            point.y >= center.y - halfY && point.y <= center.y + halfY &&
            point.z >= center.z - halfZ && point.z <= center.z + halfZ
        );
    }

    private resolveProperties(entity: any, regions: RegionComponent[]) {
        // Gravity
        const physics = entity.getComponent('Physics') as PhysicsComponent;
        if (physics) {
            // Start from BASE gravity
            let gravity = physics.baseGravity.clone();

            regions.forEach(r => {
                const mod = r.modifiers.find(m => m.property === 'gravity');
                if (mod) {
                    gravity = this.applyBlend(gravity, mod.value, mod.blendMode);
                }
            });
            physics.effectiveGravity = gravity;
        }

        // Hue/Color
        const mesh = entity.getComponent('Mesh') as MeshComponent;
        if (mesh) {
            // Start from BASE color
            let color = Color3.FromHexString(mesh.baseColor);

            regions.forEach(r => {
                const mod = r.modifiers.find(m => m.property === 'hue');
                if (mod) {
                     let val = typeof mod.value === 'string' ? Color3.FromHexString(mod.value) : mod.value;
                     color = this.applyColorBlend(color, val, mod.blendMode);
                }
            });
            mesh.color = color.toHexString();
        }
    }

    private applyBlend(current: Vector3, value: any, mode: BlendMode): Vector3 {
        // Assume value is Vector3-like or we parse it
        const val = new Vector3(value.x, value.y, value.z);

        switch (mode) {
            case BlendMode.OVERRIDE: return val;
            case BlendMode.ADD: return current.add(val);
            case BlendMode.MULTIPLY: return current.multiply(val);
            default: return current;
        }
    }

    private applyColorBlend(current: Color3, value: Color3, mode: BlendMode): Color3 {
        switch (mode) {
            case BlendMode.OVERRIDE: return value;
            case BlendMode.ADD: return current.add(value);
            case BlendMode.MULTIPLY: return current.multiply(value);
            default: return current;
        }
    }
}
