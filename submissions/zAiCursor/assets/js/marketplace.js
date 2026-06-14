async function loadMarketplace() {
    const grid = document.getElementById('mp-grid');
    try {
        const res = await fetch('templates/registry.json');
        const data = await res.json();
        grid.innerHTML = '';
        (data.templates || []).forEach((t) => {
            const card = document.createElement('article');
            card.className = 'mp-card';
            const tags = (t.tags || []).map((tag) => `<span class="mp-tag">${tag}</span>`).join('');
            card.innerHTML = `
                <div class="mp-thumb">${t.thumbnail || '🎮'}</div>
                <div class="mp-body-card">
                    <h3>${escapeHtml(t.name)}</h3>
                    <div class="mp-engine">Powered by ${escapeHtml(t.engine || 'engine')}</div>
                    <p>${escapeHtml(t.description)}</p>
                    <div class="mp-tags">${tags}</div>
                    <a class="btn-use" href="${escapeHtml(t.entry)}">Use template →</a>
                </div>
            `;
            grid.appendChild(card);
        });
        if (!data.templates?.length) {
            grid.innerHTML = '<p style="padding:20px;color:#888;">No templates yet.</p>';
        }
    } catch (e) {
        grid.innerHTML = '<p style="padding:20px;color:#f88;">Could not load templates/registry.json</p>';
        console.error(e);
    }
}

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
}

window.addEventListener('DOMContentLoaded', loadMarketplace);
