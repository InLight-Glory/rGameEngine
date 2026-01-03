// --- UTILS ---
const UUID = () => Math.random().toString(36).substr(2, 9);
const SPEC_VERSION = "1.2";
const LOG = (msg, type = 'info') => {
    const el = document.getElementById('console-logs');
    if (!el) return;
    const div = document.createElement('div');
    div.className = `log-${type}`;
    const time = new Date().toLocaleTimeString().split(' ')[0];
    div.innerText = `[${time}] ${msg}`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
};
