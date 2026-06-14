/**
 * Engine block definitions for Block Lab (Lego-style visual scripting).
 * Each block: category, color, connectors, docs, and JS codegen for Spec-Engine scripts.
 */
const BLOCK_CATEGORIES = {
    events:    { label: 'Events',    color: '#f9a825', icon: '⚡' },
    movement:  { label: 'Movement',  color: '#43a047', icon: '🏃' },
    transform: { label: 'Transform', color: '#7e57c2', icon: '📐' },
    input:     { label: 'Input',     color: '#fb8c00', icon: '🎮' },
    logic:     { label: 'Logic',     color: '#1e88e5', icon: '🔀' },
    region:    { label: 'Regions',   color: '#00897b', icon: '📍' },
    engine:    { label: 'Engine',    color: '#78909c', icon: '⚙️' },
    user:      { label: 'Your Blocks', color: '#fbc02d', icon: '✨' },
};

const BLOCK_CATALOG = {
    on_update: {
        id: 'on_update',
        category: 'events',
        shape: 'hat',
        label: 'When simulation updates',
        inputs: [],
        codegen: () => '',
        doc: {
            summary: 'Root event — code stacked below runs every fixed tick while Play mode is on.',
            params: [],
            examples: ['Place movement or logic blocks under this hat.'],
        },
    },
    on_start: {
        id: 'on_start',
        category: 'events',
        shape: 'hat',
        label: 'When play starts',
        inputs: [],
        codegen: () => '',
        doc: {
            summary: 'Runs once when you press Play (first frame of simulation).',
            params: [],
            examples: ['LOG("Game started");'],
        },
    },
    log_msg: {
        id: 'log_msg',
        category: 'engine',
        shape: 'statement',
        label: 'Log message',
        inputs: [{ key: 'message', label: 'text', type: 'text', default: 'Hello' }],
        codegen: (i) => `LOG(${JSON.stringify(String(i.message || ''))}, "event");`,
        doc: {
            summary: 'Writes a line to the System Console.',
            params: [{ name: 'message', type: 'string' }],
            examples: ['Log message → "Player moved"'],
        },
    },
    log_effective: {
        id: 'log_effective',
        category: 'region',
        shape: 'statement',
        label: 'Log effective property',
        inputs: [{ key: 'key', label: 'key', type: 'text', default: 'speed' }],
        codegen: (i) => `LOG("effective." + ${JSON.stringify(String(i.key || 'speed'))} + " = " + (ent.effectiveProperties[${JSON.stringify(String(i.key || 'speed'))}] ?? "none"), "info");`,
        doc: {
            summary: 'Shows a region-overridden value (e.g. speed inside a slow zone).',
            params: [{ name: 'key', type: 'string' }],
            examples: ['Log effective property → speed'],
        },
    },
    move_wasd: {
        id: 'move_wasd',
        category: 'movement',
        shape: 'statement',
        label: 'Move with WASD',
        inputs: [{ key: 'speed', label: 'speed', type: 'number', default: 0.1 }],
        codegen: (i) => {
            const s = parseFloat(i.speed) || 0.1;
            return `{
  const spd = ent.effectiveProperties['speed'] !== undefined ? ent.effectiveProperties['speed'] : ${s};
  if (game.keys['KeyW']) ent.babylonNode.position.z += spd;
  if (game.keys['KeyS']) ent.babylonNode.position.z -= spd;
  if (game.keys['KeyA']) ent.babylonNode.position.x -= spd;
  if (game.keys['KeyD']) ent.babylonNode.position.x += spd;
}`;
        },
        doc: {
            summary: 'Moves the entity using keyboard keys (same as built-in Movement component).',
            params: [{ name: 'speed', type: 'number', default: '0.1' }],
            examples: ['Move with WASD → speed 0.15'],
        },
    },
    move_forward: {
        id: 'move_forward',
        category: 'movement',
        shape: 'statement',
        label: 'Move forward (Z+)',
        inputs: [{ key: 'amount', label: 'amount', type: 'number', default: 0.1 }],
        codegen: (i) => `if (ent.babylonNode) ent.babylonNode.position.z += ${parseFloat(i.amount) || 0.1};`,
        doc: {
            summary: 'Slides the entity along +Z each tick.',
            params: [{ name: 'amount', type: 'number' }],
            examples: ['Move forward → 0.05'],
        },
    },
    set_position: {
        id: 'set_position',
        category: 'transform',
        shape: 'statement',
        label: 'Set position',
        inputs: [
            { key: 'x', label: 'x', type: 'number', default: 0 },
            { key: 'y', label: 'y', type: 'number', default: 1 },
            { key: 'z', label: 'z', type: 'number', default: 0 },
        ],
        codegen: (i) => `if (ent.babylonNode) { ent.babylonNode.position.x = ${parseFloat(i.x) || 0}; ent.babylonNode.position.y = ${parseFloat(i.y) || 0}; ent.babylonNode.position.z = ${parseFloat(i.z) || 0}; }`,
        doc: {
            summary: 'Teleports the entity to world coordinates.',
            params: [{ name: 'x', type: 'number' }, { name: 'y', type: 'number' }, { name: 'z', type: 'number' }],
            examples: ['Set position → (0, 2, 0)'],
        },
    },
    translate: {
        id: 'translate',
        category: 'transform',
        shape: 'statement',
        label: 'Translate by',
        inputs: [
            { key: 'x', label: 'x', type: 'number', default: 0 },
            { key: 'y', label: 'y', type: 'number', default: 0 },
            { key: 'z', label: 'z', type: 'number', default: 0 },
        ],
        codegen: (i) => `if (ent.babylonNode) { ent.babylonNode.position.x += ${parseFloat(i.x) || 0}; ent.babylonNode.position.y += ${parseFloat(i.y) || 0}; ent.babylonNode.position.z += ${parseFloat(i.z) || 0}; }`,
        doc: {
            summary: 'Offsets position by delta vector.',
            params: [{ name: 'x', type: 'number' }, { name: 'y', type: 'number' }, { name: 'z', type: 'number' }],
            examples: ['Translate by → (0, -0.01, 0) for gravity feel'],
        },
    },
    key_pressed: {
        id: 'key_pressed',
        category: 'input',
        shape: 'reporter',
        label: 'Key pressed?',
        inputs: [{ key: 'code', label: 'Key code', type: 'text', default: 'Space' }],
        codegen: (i) => `(game.keys[${JSON.stringify(String(i.code || 'Space'))}] === true)`,
        doc: {
            summary: 'True while key is held (e.g. Space, KeyW, KeyE).',
            params: [{ name: 'code', type: 'string' }],
            examples: ['if (Key pressed? Space) { ... }'],
        },
    },
    if_then: {
        id: 'if_then',
        category: 'logic',
        shape: 'cblock',
        label: 'If',
        inputs: [{ key: 'condition', label: 'condition', type: 'text', default: 'true' }],
        codegen: (i, children) => `if (${i.condition || 'true'}) {\n${children}\n}`,
        doc: {
            summary: 'Runs nested blocks only when condition is true.',
            params: [{ name: 'condition', type: 'expression' }],
            examples: ['if (game.keys["Space"]) { log_msg }'],
        },
    },
    repeat: {
        id: 'repeat',
        category: 'logic',
        shape: 'cblock',
        label: 'Repeat',
        inputs: [{ key: 'times', label: 'times', type: 'number', default: 3 }],
        codegen: (i, children) => `for (let __i = 0; __i < ${Math.max(0, parseInt(i.times, 10) || 0)}; __i++) {\n${children}\n}`,
        doc: {
            summary: 'Runs nested blocks multiple times per tick (use sparingly).',
            params: [{ name: 'times', type: 'integer' }],
            examples: ['Repeat 5 → nested log lines'],
        },
    },
    random_chance: {
        id: 'random_chance',
        category: 'logic',
        shape: 'cblock',
        label: 'Maybe (percent)',
        inputs: [{ key: 'pct', label: '%', type: 'number', default: 10 }],
        codegen: (i, children) => `if (Math.random() * 100 < ${parseFloat(i.pct) || 10}) {\n${children || ''}\n}`,
        doc: {
            summary: 'Runs nested stack randomly by percentage chance each tick.',
            params: [{ name: 'pct', type: 'number', default: '10' }],
            examples: ['Maybe 5% → log "Rare event!"'],
        },
    },
    get_speed: {
        id: 'get_speed',
        category: 'region',
        shape: 'reporter',
        label: 'Get effective speed',
        inputs: [{ key: 'fallback', label: 'default', type: 'number', default: 0.1 }],
        codegen: (i) => `(ent.effectiveProperties['speed'] !== undefined ? ent.effectiveProperties['speed'] : ${parseFloat(i.fallback) || 0.1})`,
        doc: {
            summary: 'Returns speed after region overrides.',
            params: [{ name: 'fallback', type: 'number' }],
            examples: ['Use inside expressions or If blocks'],
        },
    },
};
