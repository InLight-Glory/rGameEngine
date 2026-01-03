// --- DEFAULT DATA ---
const DEFAULT_PROJECT = {
    specVersion: SPEC_VERSION,
    globals: { gravity: -9.81, timeScale: 1.0 },
    levels: [
        {
            id: "lvl_main",
            name: "Main Level",
            entities: [
                {
                    id: "ent_player",
                    type: "object",
                    name: "Player",
                    state: "active",
                    components: [
                        { type: "Transform", props: { position: [0, 1, 0], rotation: [0,0,0], scaling: [1,1,1] } },
                        { type: "MeshRenderer", props: { shape: "capsule", color: "#007acc", texture: "" } },
                        { type: "Movement", props: { speed: 0.1 } }
                    ]
                },
                {
                    id: "ent_floor",
                    type: "object",
                    name: "Ground",
                    state: "active",
                    components: [
                        { type: "Transform", props: { position: [0, -0.5, 0], scaling: [10, 1, 10] } },
                        { type: "MeshRenderer", props: { shape: "box", color: "#333333", texture: "" } }
                    ]
                },
                {
                    id: "ent_pillar",
                    type: "object",
                    name: "Cylinder",
                    state: "active",
                    components: [
                        { type: "Transform", props: { position: [3, 1, 0], scaling: [1, 2, 1] } },
                        { type: "MeshRenderer", props: { shape: "cylinder", color: "#ff9800", texture: "" } }
                    ]
                },
                {
                    id: "ent_region_slow",
                    type: "region",
                    name: "Slow Zone",
                    state: "active",
                    components: [
                        { type: "Transform", props: { position: [2, 1, 0], scaling: [2, 2, 2] } },
                        { type: "RegionVolume", props: { priority: 1, visible: true } },
                        { type: "PropertyOverride", props: { overrides: [{ key: "speed", value: 0.02, mode: "override" }] } }
                    ]
                },
                {
                    id: "ent_script_demo",
                    type: "instance",
                    name: "Spawner",
                    state: "active",
                    components: [
                        { type: "Transform", props: { position: [0, 5, 0] } },
                        { type: "Script", props: {
                            source: "// Update runs every frame\nconsole.log('Tick');\nif (Math.random() < 0.01) {\n  console.log('Event Fired!');\n}"
                        } }
                    ]
                }
            ]
        }
    ]
};
