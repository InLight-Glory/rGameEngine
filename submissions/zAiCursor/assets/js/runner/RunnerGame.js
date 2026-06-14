import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Three.js endless runner — lanes, jump, obstacles, customizable assets.
 */
export class RunnerGame {
    constructor(canvas, config, hooks = {}) {
        this.canvas = canvas;
        this.config = JSON.parse(JSON.stringify(config));
        this.hooks = hooks;
        this.running = false;
        this.score = 0;
        this.lane = 1;
        this.lanes = [-1, 0, 1];
        this.velocityY = 0;
        this.grounded = true;
        this.spawnTimer = 0;
        this.obstacles = [];
        this.groundChunks = [];
        this.audio = {};

        this.loader = new GLTFLoader();
        this.clock = new THREE.Clock();

        this.initRenderer();
        this.initScene();
        this.initLights();
        this.initPlayer();
        this.initGround();
        this.bindInput();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
    }

    initScene() {
        const w = this.config.world || {};
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(w.skyColor || '#87ceeb');
        this.scene.fog = new THREE.Fog(w.fogColor || '#87ceeb', 18, 55);
        this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
        this.camera.position.set(0, 5.5, 9);
        this.camera.lookAt(0, 1.2, -4);
    }

    initLights() {
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
        this.scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 1.1);
        dir.position.set(5, 12, 8);
        dir.castShadow = true;
        this.scene.add(dir);
    }

    async initPlayer() {
        if (this.player) {
            this.scene.remove(this.player);
            this.player = null;
        }
        const p = this.config.player || {};
        const group = new THREE.Group();
        if (p.modelUrl) {
            try {
                const gltf = await this.loadGltf(p.modelUrl);
                const model = gltf.scene;
                model.traverse((c) => {
                    if (c.isMesh) {
                        c.castShadow = true;
                        c.receiveShadow = true;
                    }
                });
                const scale = p.scale || 1;
                model.scale.setScalar(scale);
                group.add(model);
            } catch (e) {
                console.warn('Player model failed, using box', e);
                group.add(this.makeBoxMesh(p.color || '#00aaff', 0.9, 1.2, 0.9));
            }
        } else {
            group.add(this.makeBoxMesh(p.color || '#00aaff', 0.9, 1.2, 0.9));
        }
        group.position.set(0, 0.6, 0);
        this.player = group;
        this.scene.add(this.player);
    }

    makeBoxMesh(color, w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.position.y = h / 2;
        return mesh;
    }

    async loadGltf(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(url, resolve, undefined, reject);
        });
    }

    initGround() {
        this.groundChunks.forEach((g) => this.scene.remove(g));
        this.groundChunks = [];
        const w = this.config.world || {};
        const color = w.groundColor || '#2d5a27';
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.PlaneGeometry(14, 24);
            const mat = new THREE.MeshStandardMaterial({ color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.receiveShadow = true;
            mesh.position.set(0, 0, -i * 22);
            this.scene.add(mesh);
            this.groundChunks.push(mesh);
        }
    }

    bindInput() {
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['ArrowLeft', 'KeyA'].includes(e.code)) this.shiftLane(-1);
            if (['ArrowRight', 'KeyD'].includes(e.code)) this.shiftLane(1);
            if (['Space', 'ArrowUp'].includes(e.code) && this.grounded && this.running) this.jump();
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    }

    shiftLane(dir) {
        const idx = this.lanes.indexOf(this.lane);
        const next = Math.max(0, Math.min(2, idx + dir));
        this.lane = this.lanes[next];
    }

    jump() {
        const g = this.config.gameplay || {};
        this.velocityY = g.jumpForce || 11;
        this.grounded = false;
        this.playSound('jumpUrl');
        if (this.hooks.onJump) this.hooks.onJump();
    }

    playSound(key) {
        const url = this.config.audio?.[key];
        if (!url) return;
        try {
            if (!this.audio[key]) this.audio[key] = new Audio(url);
            this.audio[key].currentTime = 0;
            this.audio[key].play().catch(() => {});
        } catch (e) { /* ignore */ }
    }

    spawnObstacle() {
        const lane = this.lanes[Math.floor(Math.random() * 3)];
        const o = this.config.obstacle || {};
        const group = new THREE.Group();
        if (o.modelUrl) {
            this.loadGltf(o.modelUrl).then((gltf) => {
                const m = gltf.scene;
                m.scale.setScalar(o.scale || 1);
                group.add(m);
            }).catch(() => {
                group.add(this.makeBoxMesh(o.color || '#ff4444', 1.2, 1.4, 1.2));
            });
        } else {
            group.add(this.makeBoxMesh(o.color || '#ff4444', 1.2, 1.4, 1.2));
        }
        const lw = this.config.world?.laneWidth || 2.2;
        group.position.set(lane * lw, 0.7, -38);
        group.userData.hit = true;
        this.scene.add(group);
        this.obstacles.push(group);
    }

    start() {
        this.running = true;
        this.score = 0;
        this.lane = 0;
        this.velocityY = 0;
        this.grounded = true;
        this.spawnTimer = 0;
        this.obstacles.forEach((o) => this.scene.remove(o));
        this.obstacles = [];
        if (this.player) {
            this.player.position.set(0, 0.6, 0);
        }
        const music = this.config.audio?.musicUrl;
        if (music) {
            if (!this.audio._music) this.audio._music = new Audio(music);
            this.audio._music.loop = true;
            this.audio._music.volume = 0.35;
            this.audio._music.play().catch(() => {});
        }
        if (this.hooks.onStart) this.hooks.onStart();
        this.loop();
    }

    stop() {
        this.running = false;
        if (this.audio._music) {
            this.audio._music.pause();
        }
        if (this.hooks.onStop) this.hooks.onStop();
    }

    gameOver() {
        this.stop();
        this.playSound('hitUrl');
        if (this.hooks.onGameOver) this.hooks.onGameOver(this.score);
    }

    loop() {
        if (!this.running) return;
        requestAnimationFrame(() => this.loop());
        const dt = Math.min(this.clock.getDelta(), 0.05);
        this.update(dt);
        this.renderer.render(this.scene, this.camera);
    }

    update(dt) {
        const w = this.config.world || {};
        const speed = w.speed || 14;
        const lw = w.laneWidth || 2.2;
        const gravity = w.gravity || 28;

        if (this.player) {
            const targetX = this.lane * lw;
            this.player.position.x += (targetX - this.player.position.x) * Math.min(1, dt * 12);
            this.velocityY -= gravity * dt;
            this.player.position.y += this.velocityY * dt;
            if (this.player.position.y <= 0.6) {
                this.player.position.y = 0.6;
                this.velocityY = 0;
                this.grounded = true;
            }
        }

        this.groundChunks.forEach((chunk) => {
            chunk.position.z += speed * dt;
            if (chunk.position.z > 24) chunk.position.z -= 22 * 8;
        });

        this.spawnTimer -= dt;
        const rate = this.config.gameplay?.spawnRate || 1.2;
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            this.spawnTimer = rate + Math.random() * 0.6;
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const ob = this.obstacles[i];
            ob.position.z += speed * dt;
            if (ob.position.z > 8) {
                this.scene.remove(ob);
                this.obstacles.splice(i, 1);
                this.score += 10;
                this.playSound('coinUrl');
                if (this.hooks.onScore) this.hooks.onScore(this.score);
                continue;
            }
            if (this.player && ob.position.z > -1.5 && ob.position.z < 1.5) {
                const dx = Math.abs(ob.position.x - this.player.position.x);
                const dz = Math.abs(ob.position.z - this.player.position.z);
                if (dx < 0.85 && dz < 1.1 && this.player.position.y < 1.5) {
                    this.gameOver();
                }
            }
        }
    }

    async applyConfig(config) {
        this.config = JSON.parse(JSON.stringify(config));
        this.initScene();
        await this.initPlayer();
        this.initGround();
        this.audio = {};
    }

    resize() {
        const parent = this.canvas.parentElement;
        const w = parent?.clientWidth || 800;
        const h = parent?.clientHeight || 450;
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    dispose() {
        this.stop();
        this.renderer.dispose();
    }
}
