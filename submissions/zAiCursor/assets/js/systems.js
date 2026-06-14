// --- SYSTEMS ---
class RegionSystem {
    constructor(engine) { this.engine = engine; }
    update(dt) {
        this.engine.levels.forEach(level => {
            const objects = Array.from(level.entities.values()).filter(e => e.data.type === 'object' && e.data.state === 'active');
            const regions = Array.from(level.entities.values()).filter(e => e.data.type === 'region' && e.data.state === 'active');
            objects.forEach(obj => {
                obj.effectiveProperties = {};
                const activeRegions = regions.filter(reg => obj.babylonNode && reg.babylonNode && obj.babylonNode.intersectsMesh(reg.babylonNode, false));
                activeRegions.sort((a, b) => {
                    const pA = a.getComponent("RegionVolume")?.props.priority || 0;
                    const pB = b.getComponent("RegionVolume")?.props.priority || 0;
                    return pB - pA;
                });
                activeRegions.forEach(reg => {
                    const overComp = reg.getComponent("PropertyOverride");
                    if (overComp) {
                        overComp.props.overrides.forEach(o => {
                            const current = obj.effectiveProperties[o.key];
                            if (!current) obj.effectiveProperties[o.key] = o.value;
                            else {
                                if (o.mode === 'override') obj.effectiveProperties[o.key] = o.value;
                                if (o.mode === 'add') obj.effectiveProperties[o.key] = current + o.value;
                                if (o.mode === 'multiply') obj.effectiveProperties[o.key] = current * o.value;
                            }
                        });
                    }
                });
            });
        });
    }
}

class LogicSystem {
    constructor(engine) { this.engine = engine; }
    update(dt) {
        this.engine.levels.forEach(level => {
            level.entities.forEach(ent => {
                if (ent.data.state !== 'active') return;
                const script = ent.getComponent("Script");
                if (script) {
                    try {
                        const fn = new Function('ent', 'dt', 'scene', script.props.source);
                        fn(ent, dt, level.babylonScene);
                    } catch (e) {
                        LOG(`Script Error in ${ent.data.name}: ${e.message}`, "err");
                    }
                }
                const move = ent.getComponent("Movement");
                if (move && ent.babylonNode) {
                    const speed = ent.effectiveProperties['speed'] !== undefined ? ent.effectiveProperties['speed'] : move.props.speed;
                    if (this.engine.keys['KeyW']) ent.babylonNode.position.z += speed;
                    if (this.engine.keys['KeyS']) ent.babylonNode.position.z -= speed;
                    if (this.engine.keys['KeyA']) ent.babylonNode.position.x -= speed;
                    if (this.engine.keys['KeyD']) ent.babylonNode.position.x += speed;
                }
            });
        });
    }
}

class TransformSystem { constructor(engine) { this.engine = engine; } update(dt) {} }
class RenderSystem { constructor(engine) { this.engine = engine; } update(dt) {} }
