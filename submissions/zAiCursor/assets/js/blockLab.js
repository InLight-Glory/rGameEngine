/**
 * Block Lab — Lego-style visual script builder for zAiCursor / Spec-Engine.
 */
const BlockLab = {
    hatId: 'on_update',
    stack: [],
    customBlocks: [],
    customCatalog: {},
    dragInstanceId: null,

    init() {
        const params = new URLSearchParams(location.search);
        this.levelId = params.get('levelId') || localStorage.getItem('zAiCursor_levelId') || '';
        this.entityId = params.get('entityId') || localStorage.getItem('zAiCursor_entityId') || '';
        this.entityName = params.get('name') || localStorage.getItem('zAiCursor_entityName') || 'Entity';

        document.getElementById('block-target-label').textContent =
            this.entityId ? `${this.entityName} (${this.entityId})` : 'No entity — open from editor with selection';

        this.loadCustomBlocks();
        this.loadWorkspace();
        this.renderBins();
        this.renderWorkspace();
        this.updateCodePreview();
        this.bindWorkspaceDrop();
        this.bindModal();
    },

    storageKey() {
        return `zAiCursor_blocks_${this.levelId}_${this.entityId}`;
    },

    loadWorkspace() {
        try {
            const raw = localStorage.getItem(this.storageKey());
            if (raw) {
                const data = JSON.parse(raw);
                this.hatId = data.hatId || 'on_update';
                this.stack = data.stack || [];
            }
        } catch (e) {
            LOG('Block Lab: could not load saved stack', 'warn');
        }
    },

    saveWorkspace() {
        if (!this.entityId) return;
        localStorage.setItem(this.storageKey(), JSON.stringify({
            hatId: this.hatId,
            stack: this.stack,
        }));
    },

    loadCustomBlocks() {
        try {
            const raw = localStorage.getItem('zAiCursor_customBlocks');
            this.customBlocks = raw ? JSON.parse(raw) : [];
            this.customBlocks.forEach((b) => {
                this.customCatalog[b.id] = b;
                BLOCK_CATALOG[b.id] = b;
            });
        } catch (e) {
            this.customBlocks = [];
        }
    },

    saveCustomBlocks() {
        localStorage.setItem('zAiCursor_customBlocks', JSON.stringify(this.customBlocks));
    },

    getDef(blockId) {
        return BLOCK_CATALOG[blockId] || this.customCatalog[blockId];
    },

    renderBins() {
        const root = document.getElementById('block-bins');
        root.innerHTML = '';

        const byCat = {};
        Object.values(BLOCK_CATALOG).forEach((def) => {
            if (def.shape === 'hat') return;
            if (!byCat[def.category]) byCat[def.category] = [];
            byCat[def.category].push(def);
        });

        Object.keys(BLOCK_CATEGORIES).forEach((catKey) => {
            const cat = BLOCK_CATEGORIES[catKey];
            const blocks = catKey === 'user' ? this.customBlocks : (byCat[catKey] || []);
            const section = document.createElement('section');
            section.className = 'block-bin';
            section.style.setProperty('--bin-color', cat.color);
            section.innerHTML = `
                <header class="bin-header">
                    <span class="bin-icon">${cat.icon}</span>
                    <span class="bin-title">${cat.label}</span>
                    <span class="bin-count">${blocks.length}</span>
                </header>
                <div class="bin-palette" data-category="${catKey}"></div>
            `;
            const palette = section.querySelector('.bin-palette');
            if (catKey === 'user') {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'btn-new-custom';
                addBtn.textContent = '+ New function block';
                addBtn.onclick = () => BlockLab.showNewCustomModal();
                palette.appendChild(addBtn);
            }
            blocks.forEach((def) => palette.appendChild(BlockLab.createPaletteBlock(def)));
            root.appendChild(section);
        });

        const hatSection = document.createElement('section');
        hatSection.className = 'block-bin block-bin-hats';
        hatSection.style.setProperty('--bin-color', BLOCK_CATEGORIES.events.color);
        hatSection.innerHTML = `
            <header class="bin-header"><span class="bin-icon">🎩</span><span class="bin-title">Start block</span></header>
            <div class="bin-palette" id="hat-palette"></div>
        `;
        const hatPal = hatSection.querySelector('#hat-palette');
        ['on_update', 'on_start'].forEach((id) => {
            const def = BLOCK_CATALOG[id];
            const el = BlockLab.createPaletteBlock(def, true);
            el.onclick = () => {
                BlockLab.hatId = id;
                BlockLab.renderWorkspace();
                BlockLab.updateCodePreview();
                BlockLab.saveWorkspace();
            };
            hatPal.appendChild(el);
        });
        root.insertBefore(hatSection, root.firstChild);
    },

    createPaletteBlock(def, isHat = false) {
        const el = document.createElement('div');
        el.className = `palette-block shape-${def.shape}${isHat ? ' is-hat' : ''}`;
        el.draggable = true;
        el.dataset.blockId = def.id;
        el.style.background = BLOCK_CATEGORIES[def.category]?.color || '#666';
        el.innerHTML = `<span class="palette-label">${def.label}</span>`;
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/block-id', def.id);
            e.dataTransfer.effectAllowed = 'copy';
        });
        return el;
    },

    bindWorkspaceDrop() {
        const ws = document.getElementById('block-workspace');
        ws.addEventListener('dragover', (e) => {
            e.preventDefault();
            ws.classList.add('drag-over');
        });
        ws.addEventListener('dragleave', () => ws.classList.remove('drag-over'));
        ws.addEventListener('drop', (e) => {
            e.preventDefault();
            ws.classList.remove('drag-over');
            const blockId = e.dataTransfer.getData('text/block-id');
            const instanceId = e.dataTransfer.getData('text/instance-id');
            if (instanceId) {
                BlockLab.reorderDrop(instanceId, e.target);
            } else if (blockId) {
                BlockLab.addBlock(blockId);
            }
        });
    },

    addBlock(blockId, parentId = null, index = -1) {
        const def = this.getDef(blockId);
        if (!def || def.shape === 'hat') return;
        const instance = {
            instanceId: UUID(),
            blockId,
            inputs: {},
            disabled: false,
            children: [],
        };
        (def.inputs || []).forEach((inp) => {
            instance.inputs[inp.key] = inp.default ?? '';
        });
        if (parentId) {
            const parent = BlockLab.findInstance(parentId);
            if (parent) {
                if (index < 0) parent.children.push(instance);
                else parent.children.splice(index, 0, instance);
            }
        } else {
            if (index < 0) this.stack.push(instance);
            else this.stack.splice(index, 0, instance);
        }
        this.renderWorkspace();
        this.updateCodePreview();
        this.saveWorkspace();
    },

    findInstance(id, list = null) {
        const arr = list || this.stack;
        for (const item of arr) {
            if (item.instanceId === id) return item;
            const inChild = BlockLab.findInstance(id, item.children);
            if (inChild) return inChild;
        }
        return null;
    },

    removeInstance(id) {
        const removeFrom = (arr) => {
            const idx = arr.findIndex((x) => x.instanceId === id);
            if (idx >= 0) {
                arr.splice(idx, 1);
                return true;
            }
            for (const item of arr) {
                if (removeFrom(item.children)) return true;
            }
            return false;
        };
        removeFrom(this.stack);
        this.renderWorkspace();
        this.updateCodePreview();
        this.saveWorkspace();
    },

    toggleDisabled(id) {
        const inst = this.findInstance(id);
        if (inst) {
            inst.disabled = !inst.disabled;
            this.renderWorkspace();
            this.updateCodePreview();
            this.saveWorkspace();
        }
    },

    renderWorkspace() {
        const hatDef = BLOCK_CATALOG[this.hatId] || BLOCK_CATALOG.on_update;
        const hatEl = document.getElementById('workspace-hat');
        hatEl.className = `placed-block shape-hat`;
        hatEl.style.background = BLOCK_CATEGORIES.events.color;
        hatEl.innerHTML = `
            <div class="block-tools">
                <button type="button" class="btn-doc" title="Documentation" onclick="BlockLab.showDoc('${this.hatId}')">🧠</button>
            </div>
            <div class="block-body"><span class="block-label">${hatDef.label}</span></div>
        `;

        const stackRoot = document.getElementById('workspace-stack');
        stackRoot.innerHTML = '';
        this.stack.forEach((inst) => stackRoot.appendChild(this.renderPlacedBlock(inst)));
    },

    renderPlacedBlock(inst, depth = 0) {
        const def = this.getDef(inst.blockId);
        if (!def) return document.createElement('div');

        const wrap = document.createElement('div');
        wrap.className = `placed-block shape-${def.shape}${inst.disabled ? ' is-disabled' : ''}`;
        wrap.dataset.instanceId = inst.instanceId;
        wrap.style.background = BLOCK_CATEGORIES[def.category]?.color || '#555';
        wrap.style.marginLeft = `${depth * 12}px`;

        let inputsHtml = '';
        (def.inputs || []).forEach((inp) => {
            const val = inst.inputs[inp.key] ?? inp.default ?? '';
            inputsHtml += `<label class="block-input"><span>${inp.label}</span>
                <input type="${inp.type === 'number' ? 'number' : 'text'}" step="any"
                    value="${String(val).replace(/"/g, '&quot;')}"
                    onchange="BlockLab.setInput('${inst.instanceId}', '${inp.key}', this.value)" /></label>`;
        });

        wrap.innerHTML = `
            <div class="block-tools">
                <button type="button" class="btn-doc" title="Documentation" onclick="BlockLab.showDoc('${inst.blockId}')">🧠</button>
                <button type="button" class="btn-eye" title="Disable block" onclick="BlockLab.toggleDisabled('${inst.instanceId}')">👁️</button>
                <button type="button" class="btn-del" title="Remove block" onclick="BlockLab.removeInstance('${inst.instanceId}')">🗑️</button>
            </div>
            <div class="block-body">
                <span class="connector-top"></span>
                <span class="block-label">${def.label}</span>
                ${inputsHtml}
                <span class="connector-bottom"></span>
            </div>
        `;

        wrap.draggable = true;
        wrap.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/instance-id', inst.instanceId);
            e.stopPropagation();
        });

        if (def.shape === 'cblock') {
            const childZone = document.createElement('div');
            childZone.className = 'block-children drop-nest';
            childZone.dataset.parentId = inst.instanceId;
            childZone.addEventListener('dragover', (e) => e.preventDefault());
            childZone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const blockId = e.dataTransfer.getData('text/block-id');
                if (blockId) BlockLab.addBlock(blockId, inst.instanceId);
            });
            (inst.children || []).forEach((ch) => childZone.appendChild(this.renderPlacedBlock(ch, depth + 1)));
            if (!inst.children?.length) {
                childZone.innerHTML = '<span class="nest-hint">drop blocks inside</span>';
            }
            wrap.appendChild(childZone);
        }

        return wrap;
    },

    setInput(instanceId, key, value) {
        const inst = this.findInstance(instanceId);
        if (!inst) return;
        const def = this.getDef(inst.blockId);
        const inp = def?.inputs?.find((i) => i.key === key);
        inst.inputs[key] = inp?.type === 'number' ? parseFloat(value) : value;
        this.updateCodePreview();
        this.saveWorkspace();
    },

    compileInstance(inst, indent = '  ') {
        if (inst.disabled) return '';
        const def = this.getDef(inst.blockId);
        if (!def) return '';
        const childCode = (inst.children || [])
            .map((c) => this.compileInstance(c, indent + '  '))
            .filter(Boolean)
            .join('\n');
        if (def.shape === 'cblock') {
            return def.codegen(inst.inputs, childCode);
        }
        return def.codegen(inst.inputs, '');
    },

    compile() {
        const hat = BLOCK_CATALOG[this.hatId] || BLOCK_CATALOG.on_update;
        const body = this.stack.map((i) => this.compileInstance(i)).filter(Boolean).join('\n');
        const header = `// Block Lab generated — ${hat.label}\n// Entity: ${this.entityName}\n`;
        if (this.hatId === 'on_start') {
            return `${header}if (!ent.__blockLabStarted) {\n  ent.__blockLabStarted = true;\n${body}\n}`;
        }
        return `${header}${body}`;
    },

    updateCodePreview() {
        document.getElementById('code-preview').textContent = this.compile();
    },

    showDoc(blockId) {
        const def = this.getDef(blockId);
        if (!def) return;
        const doc = def.doc || {};
        document.getElementById('doc-title').textContent = def.label;
        document.getElementById('doc-category').textContent = BLOCK_CATEGORIES[def.category]?.label || def.category;
        document.getElementById('doc-category').style.background = BLOCK_CATEGORIES[def.category]?.color || '#666';
        document.getElementById('doc-summary').textContent = doc.summary || 'No description.';
        const paramsEl = document.getElementById('doc-params');
        paramsEl.innerHTML = '';
        (doc.params || []).forEach((p) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${p.name}</strong> <span>(${p.type})</span>${p.default != null ? ` — default: ${p.default}` : ''}`;
            paramsEl.appendChild(li);
        });
        const exEl = document.getElementById('doc-examples');
        exEl.innerHTML = '';
        (doc.examples || []).forEach((ex) => {
            const li = document.createElement('li');
            li.textContent = ex;
            exEl.appendChild(li);
        });
        document.getElementById('doc-modal').classList.add('open');
    },

    bindModal() {
        document.getElementById('doc-close').onclick = () =>
            document.getElementById('doc-modal').classList.remove('open');
        document.getElementById('doc-modal').onclick = (e) => {
            if (e.target.id === 'doc-modal') e.target.classList.remove('open');
        };
    },

    showNewCustomModal() {
        document.getElementById('custom-modal').classList.add('open');
    },

    hideCustomModal() {
        document.getElementById('custom-modal').classList.remove('open');
    },

    createCustomBlock() {
        const name = document.getElementById('custom-name').value.trim();
        const summary = document.getElementById('custom-summary').value.trim();
        const template = document.getElementById('custom-template').value.trim();
        if (!name || !template) {
            alert('Name and code template required');
            return;
        }
        const id = 'user_' + UUID();
        const block = {
            id,
            category: 'user',
            shape: 'statement',
            label: name,
            inputs: [{ key: 'arg1', label: 'arg', type: 'text', default: '' }],
            codegen: (i) => template.replace(/\{\{arg1\}\}/g, String(i.arg1 || '')),
            doc: { summary: summary || 'User-defined block', params: [{ name: 'arg1', type: 'string' }], examples: [template] },
            isUser: true,
        };
        this.customBlocks.push(block);
        this.customCatalog[id] = block;
        BLOCK_CATALOG[id] = block;
        this.saveCustomBlocks();
        this.renderBins();
        this.hideCustomModal();
        document.getElementById('custom-name').value = '';
        document.getElementById('custom-summary').value = '';
        document.getElementById('custom-template').value = '';
        LOG('Custom block created: ' + name, 'success');
    },

    applyToEntity() {
        if (!this.entityId || !this.levelId) {
            alert('Select an entity in the editor first, then open Block Lab.');
            return;
        }
        const code = this.compile();
        localStorage.setItem(`zAiCursor_script_${this.levelId}_${this.entityId}`, code);
        this.saveWorkspace();
        localStorage.setItem('zAiCursor_applyScript', '1');
        window.location.href = 'index.php';
    },

    clearWorkspace() {
        if (!confirm('Clear all blocks in workspace?')) return;
        this.stack = [];
        this.renderWorkspace();
        this.updateCodePreview();
        this.saveWorkspace();
    },
};

window.onload = () => BlockLab.init();
