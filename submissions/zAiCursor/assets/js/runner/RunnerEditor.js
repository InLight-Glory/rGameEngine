import { RunnerGame } from './RunnerGame.js';
import { GameExporter } from './GameExporter.js';

export const RunnerEditor = {
    game: null,
    config: null,
    templateId: 'endless-runner',

    async init() {
        const params = new URLSearchParams(location.search);
        this.templateId = params.get('template') || 'endless-runner';
        await this.loadDefaultConfig();
        this.bindForm();
        this.initPreview();
        document.getElementById('btn-play').onclick = () => this.startGame();
        document.getElementById('btn-stop').onclick = () => this.stopGame();
        document.getElementById('btn-export-html').onclick = () => GameExporter.exportHtml(this.config);
        document.getElementById('btn-export-zip').onclick = () => GameExporter.exportZip(this.config);
        document.getElementById('btn-save-local').onclick = () => this.saveLocal();
    },

    async loadDefaultConfig() {
        const key = `zAiCursor_runner_${this.templateId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                this.config = JSON.parse(saved);
                this.fillForm();
                return;
            } catch (e) { /* fall through */ }
        }
        const res = await fetch(`templates/${this.templateId}/default-config.json`);
        this.config = await res.json();
        this.fillForm();
    },

    fillForm() {
        const c = this.config;
        document.getElementById('cfg-title').value = c.title || 'My Runner';
        document.getElementById('cfg-player-color').value = c.player?.color || '#00aaff';
        document.getElementById('cfg-player-model').value = c.player?.modelUrl || '';
        document.getElementById('cfg-player-scale').value = c.player?.scale ?? 1;
        document.getElementById('cfg-obstacle-color').value = c.obstacle?.color || '#ff4444';
        document.getElementById('cfg-obstacle-model').value = c.obstacle?.modelUrl || '';
        document.getElementById('cfg-ground').value = c.world?.groundColor || '#2d5a27';
        document.getElementById('cfg-sky').value = c.world?.skyColor || '#87ceeb';
        document.getElementById('cfg-speed').value = c.world?.speed ?? 14;
        document.getElementById('cfg-jump').value = c.gameplay?.jumpForce ?? 11;
        document.getElementById('cfg-spawn').value = c.gameplay?.spawnRate ?? 1.2;
        document.getElementById('cfg-jump-sound').value = c.audio?.jumpUrl || '';
        document.getElementById('cfg-hit-sound').value = c.audio?.hitUrl || '';
        document.getElementById('cfg-coin-sound').value = c.audio?.coinUrl || '';
        document.getElementById('cfg-music').value = c.audio?.musicUrl || '';
    },

    readForm() {
        this.config = {
            templateId: this.templateId,
            title: document.getElementById('cfg-title').value,
            player: {
                modelUrl: document.getElementById('cfg-player-model').value.trim(),
                color: document.getElementById('cfg-player-color').value,
                scale: parseFloat(document.getElementById('cfg-player-scale').value) || 1,
            },
            obstacle: {
                modelUrl: document.getElementById('cfg-obstacle-model').value.trim(),
                color: document.getElementById('cfg-obstacle-color').value,
                scale: 1,
            },
            world: {
                groundColor: document.getElementById('cfg-ground').value,
                skyColor: document.getElementById('cfg-sky').value,
                fogColor: document.getElementById('cfg-sky').value,
                laneWidth: 2.2,
                speed: parseFloat(document.getElementById('cfg-speed').value) || 14,
                gravity: 28,
            },
            audio: {
                jumpUrl: document.getElementById('cfg-jump-sound').value.trim(),
                hitUrl: document.getElementById('cfg-hit-sound').value.trim(),
                coinUrl: document.getElementById('cfg-coin-sound').value.trim(),
                musicUrl: document.getElementById('cfg-music').value.trim(),
            },
            gameplay: {
                jumpForce: parseFloat(document.getElementById('cfg-jump').value) || 11,
                spawnRate: parseFloat(document.getElementById('cfg-spawn').value) || 1.2,
            },
        };
        return this.config;
    },

    bindForm() {
        document.querySelectorAll('.cfg-input').forEach((el) => {
            el.addEventListener('change', () => this.applyPreview());
            el.addEventListener('input', () => {
                if (el.type === 'color' || el.type === 'range') this.applyPreview();
            });
        });
        document.querySelectorAll('[data-file]').forEach((input) => {
            input.addEventListener('change', (e) => this.handleFile(e.target));
        });
    },

    handleFile(input) {
        const file = input.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const target = input.dataset.file;
        if (target === 'player-model') {
            document.getElementById('cfg-player-model').value = url;
        } else if (target === 'obstacle-model') {
            document.getElementById('cfg-obstacle-model').value = url;
        } else if (target === 'jump-sound') {
            document.getElementById('cfg-jump-sound').value = url;
        } else if (target === 'hit-sound') {
            document.getElementById('cfg-hit-sound').value = url;
        } else if (target === 'coin-sound') {
            document.getElementById('cfg-coin-sound').value = url;
        } else if (target === 'music') {
            document.getElementById('cfg-music').value = url;
        }
        this.applyPreview();
    },

    async initPreview() {
        const canvas = document.getElementById('runner-canvas');
        this.readForm();
        if (this.game) this.game.dispose();
        this.game = new RunnerGame(canvas, this.config, {
            onScore: (s) => { document.getElementById('runner-score').textContent = s; },
            onGameOver: (s) => {
                document.getElementById('runner-status').textContent = `Game over — score ${s}`;
            },
        });
        document.getElementById('runner-status').textContent = 'Preview ready — press Play';
    },

    async applyPreview() {
        this.readForm();
        if (this.game) await this.game.applyConfig(this.config);
    },

    startGame() {
        this.readForm();
        document.getElementById('runner-status').textContent = 'Running — A/D lanes, Space jump';
        document.getElementById('runner-score').textContent = '0';
        if (this.game) this.game.start();
    },

    stopGame() {
        if (this.game) this.game.stop();
        document.getElementById('runner-status').textContent = 'Stopped';
    },

    saveLocal() {
        this.readForm();
        localStorage.setItem(`zAiCursor_runner_${this.templateId}`, JSON.stringify(this.config));
        document.getElementById('runner-status').textContent = 'Saved locally';
    },
};
