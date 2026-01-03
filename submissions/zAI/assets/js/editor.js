// --- EDITOR UI ---
const Editor = {
    init: () => {
        window.Editor = Editor;
        window.game = new GameEngine();

        window.addEventListener("keydown", (e) => {
            window.game.keys = window.game.keys || {};
            window.game.keys[e.code] = true;
        });
        window.addEventListener("keyup", (e) => {
            window.game.keys = window.game.keys || {};
            window.game.keys[e.code] = false;
        });

        LOG("Engine initialized. Spec Version: " + SPEC_VERSION, "sys");
    },

    refresh: () => {
        if (!window.game) return;
        Editor.renderHierarchy();
        Editor.renderInspector();
        Editor.updateGizmos();
    },

    // --- GIZMO LOGIC ---
    setGizmoMode: (mode) => {
        // Update Buttons
        ['pos', 'rot', 'scl'].forEach(m => document.getElementById(`gizmo-${m}`).classList.remove('active'));
        document.getElementById(`gizmo-${mode.substring(0, 3)}`).classList.add('active');

        // Update Engine
        window.game.levels.forEach(level => {
            level.gizmoManager.positionGizmoEnabled = (mode === 'position');
            level.gizmoManager.rotationGizmoEnabled = (mode === 'rotation');
            level.gizmoManager.scaleGizmoEnabled = (mode === 'scale');
        });
    },

    updateGizmos: () => {
        if (!window.game.selection || !window.game.selection.entityId) {
            window.game.levels.forEach(l => l.gizmoManager.attachToMesh(null));
            return;
        }
        const { levelId, entityId } = window.game.selection;
        const level = window.game.levels.get(levelId);
        const ent = level.entities.get(entityId);

        // Only attach gizmos to objects or regions (usually instances have no visual node to grab)
        if (ent.babylonNode && (ent.data.type === 'object' || ent.data.type === 'region')) {
            level.gizmoManager.attachToMesh(ent.babylonNode);
        } else {
            level.gizmoManager.attachToMesh(null);
        }
    },

    // --- ASSET BROWSER ---
    handleFileUpload: (input) => {
        const file = input.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);

        // Add to List
        const list = document.getElementById('asset-list');
        const div = document.createElement('div');
        div.className = 'asset-item';
        div.onclick = () => Editor.applyTexture(url);
        div.innerHTML = `<img src="${url}"><span>${file.name}</span>`;
        list.appendChild(div);

        // Auto apply if object selected
        Editor.applyTexture(url);
    },

    applyTexture: (val) => {
        if (!window.game.selection || !window.game.selection.entityId) { LOG("No object selected", "warn"); return; }
        const { levelId, entityId } = window.game.selection;
        const level = window.game.levels.get(levelId);
        const ent = level.entities.get(entityId);

        if (ent.data.type !== 'object') { LOG("Can only apply textures to Objects", "warn"); return; }

        // Find or create MeshRenderer
        let ren = ent.getComponent("MeshRenderer");
        if (!ren) {
            ren = { type: "MeshRenderer", props: { shape: "box", color: "#ffffff", texture: "" } };
            ent.data.components.push(ren);
        }

        ren.props.texture = val; // This is either a Hex code or URL
        ent.createVisuals(); // Rebuild mesh
        Editor.renderInspector();
        LOG("Texture applied", "success");
    },

    // --- UI ---
    switchTab: (tabName, evt) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        if (evt && evt.target) evt.target.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    },

    renderHierarchy: () => {
        const root = document.getElementById('tree-root');
        root.innerHTML = '';
        window.game.levels.forEach((lvl, lvlId) => {
            const lvlDiv = document.createElement('div');

            const lvlRow = document.createElement('div');
            lvlRow.className = 'tree-item';
            if (window.game.selection && window.game.selection.levelId === lvl.data.id && !window.game.selection.entityId) {
                lvlRow.classList.add('selected');
            }
            lvlRow.innerHTML = `<span class="icon">📁</span> ${lvl.data.name}`;
            lvlRow.onclick = () => {
                window.game.selection = { levelId: lvl.data.id, entityId: null };
                Editor.refresh();
            };
            lvlDiv.appendChild(lvlRow);
            root.appendChild(lvlDiv);

            lvl.entities.forEach(ent => {
                const row = document.createElement('div');
                row.className = 'tree-item';
                if (window.game.selection && window.game.selection.entityId === ent.data.id) row.classList.add('selected');
                let icon = '❓';
                if (ent.data.type === 'object') icon = '🧊';
                if (ent.data.type === 'instance') icon = '⚙️';
                if (ent.data.type === 'region') icon = '📍';
                row.innerHTML = `<span class="tree-indent"></span><span class="icon">${icon}</span> ${ent.data.name}`;
                row.onclick = () => {
                    window.game.selection = { levelId: lvl.data.id, entityId: ent.data.id };
                    Editor.refresh();
                };
                lvlDiv.appendChild(row);
            });
        });
    },

    renderInspector: () => {
        const container = document.getElementById('inspector-content');
        container.innerHTML = '';
        if (!window.game.selection) { container.innerHTML = '<div style="padding:10px; color:#666;">Select a level or entity</div>'; return; }

        if (!window.game.selection.entityId) {
            const level = window.game.levels.get(window.game.selection.levelId);
            const name = level?.data?.name || 'Level';
            container.innerHTML = `<div class="prop-group"><div class="prop-title">${name} <span style="font-weight:normal; opacity:0.5">(level)</span></div></div>`;
            container.innerHTML += '<div style="padding:10px; color:#666;">Use the toolbar to add entities to this level.</div>';
            return;
        }

        const { levelId, entityId } = window.game.selection;
        const level = window.game.levels.get(levelId);
        const ent = level.entities.get(entityId);

        container.innerHTML += `<div class="prop-group"><div class="prop-title">${ent.data.name} <span style="font-weight:normal; opacity:0.5">(${ent.data.type})</span></div></div>`;

        if (Object.keys(ent.effectiveProperties).length > 0) {
            container.innerHTML += `<div class="prop-group" style="border:1px dashed var(--accent); background:#1a1a1a"><div class="prop-title" style="color:var(--success)">Effective Properties</div>`;
            for (let k in ent.effectiveProperties) container.innerHTML += `<div class="prop-row"><div class="prop-label">${k}</div><div class="prop-val">${ent.effectiveProperties[k]}</div></div>`;
            container.innerHTML += `</div>`;
        }

        ent.data.components.forEach((comp, idx) => {
            const div = document.createElement('div');
            div.className = 'prop-group';
            div.innerHTML = `<div class="prop-title">${comp.type} <span class="remove-btn" onclick="Editor.removeComponent(${idx})">×</span></div>`;

            for (let key in comp.props) {
                const val = comp.props[key];
                const row = document.createElement('div');
                row.className = 'prop-row';

                // --- SCRIPT EDITOR REQUIREMENT ---
                if (comp.type === 'Script' && key === 'source') {
                    row.innerHTML = `
                        <div class="prop-val">
                            <textarea class="code-editor" onchange="Editor.updateComponent(${idx}, '${key}', this.value)">${val}</textarea>
                        </div>`;
                }
                else if (comp.type === 'MeshRenderer' && key === 'shape') {
                    // Shape Selector
                    row.innerHTML = `
                        <div class="prop-label">${key}</div>
                        <div class="prop-val">
                            <select onchange="Editor.updateComponent(${idx}, '${key}', this.value)">
                                <option value="box" ${val === 'box' ? 'selected' : ''}>Box</option>
                                <option value="sphere" ${val === 'sphere' ? 'selected' : ''}>Sphere</option>
                                <option value="cylinder" ${val === 'cylinder' ? 'selected' : ''}>Cylinder</option>
                                <option value="capsule" ${val === 'capsule' ? 'selected' : ''}>Capsule</option>
                                <option value="plane" ${val === 'plane' ? 'selected' : ''}>Plane</option>
                            </select>
                        </div>`;
                }
                else {
                    // Standard Inputs
                    let inputType = 'text';
                    if (typeof val === 'number') inputType = 'number';
                    row.innerHTML = `
                        <div class="prop-label">${key}</div>
                        <div class="prop-val">
                            <input type="${inputType}" value="${val}" onchange="Editor.updateComponent(${idx}, '${key}', this.value)">
                        </div>`;
                }
                div.appendChild(row);
            }
            container.appendChild(div);
        });
    },

    updateComponent: (compIdx, key, val) => {
        if (!window.game.selection || !window.game.selection.entityId) return;
        const { levelId, entityId } = window.game.selection;
        const level = window.game.levels.get(levelId);
        const ent = level.entities.get(entityId);
        const comp = ent.data.components[compIdx];

        if (typeof comp.props[key] === 'number') val = parseFloat(val);
        comp.props[key] = val;

        // If texture path changed
        if (comp.type === 'MeshRenderer' && key === 'texture') {
            ent.createVisuals();
        }
        // If shape changed
        if (comp.type === 'MeshRenderer' && key === 'shape') {
            ent.createVisuals();
        }
        Editor.renderInspector();
    },

    removeComponent: (idx) => {
        if (!window.game.selection || !window.game.selection.entityId) return;
        const { levelId, entityId } = window.game.selection;
        const level = window.game.levels.get(levelId);
        const ent = level.entities.get(entityId);
        ent.data.components.splice(idx, 1);
        Editor.renderInspector();
    },

    newLevel: () => {
        const id = UUID();
        window.game.project.levels.push({ id: id, name: "New Level", entities: [] });
        window.game.selection = { levelId: id, entityId: null };
        window.game.loadProject(window.game.project);
    },

    addEntity: (type) => {
        if (!window.game.selection || !window.game.selection.levelId) {
            alert("Select a level/entity first");
            return;
        }
        const { levelId } = window.game.selection;
        const data = window.game.project.levels.find(l => l.id === levelId);
        if (!data) {
            LOG("Level not found", "err");
            return;
        }
        const newEnt = {
            id: UUID(), type: type, name: `New ${type}`, state: "active",
            components: [{ type: "Transform", props: { position: [0, 0, 0], rotation: [0, 0, 0], scaling: [1, 1, 1] } }]
        };
        if (type === 'object') newEnt.components.push({ type: "MeshRenderer", props: { shape: "box", color: "#ffffff", texture: "" } });
        if (type === 'region') {
            newEnt.components.push({ type: "RegionVolume", props: { priority: 0, visible: true } });
            newEnt.components.push({ type: "PropertyOverride", props: { overrides: [] } });
        }
        data.entities.push(newEnt);

        // Select the new entity and fully reload the project to keep scenes/maps consistent.
        window.game.selection = { levelId, entityId: newEnt.id };
        window.game.loadProject(window.game.project);
    },

    togglePlay: () => window.game.togglePlay()
};

window.onload = Editor.init;
