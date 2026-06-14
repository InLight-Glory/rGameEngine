import { RunnerGame } from './RunnerGame.js';

const configEl = document.getElementById('runner-config');
const config = configEl ? JSON.parse(configEl.textContent) : window.RUNNER_CONFIG || {};
const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const scoreEl = document.getElementById('score');

const game = new RunnerGame(canvas, config, {
    onScore: (s) => { if (scoreEl) scoreEl.textContent = String(s); },
    onGameOver: (s) => {
        if (overlay) {
            overlay.classList.add('show');
            overlay.querySelector('p').textContent = `Game over — score ${s}`;
        }
    },
});

function resize() {
    game.resize();
}
window.addEventListener('resize', resize);
resize();

document.getElementById('btn-start')?.addEventListener('click', () => {
    overlay?.classList.remove('show');
    overlay?.classList.add('hidden');
    game.start();
});
