// ═══════════════════════════════════════════════
// CAMPUSGARH — About Page JS
// Renders mission, trust strip, team, counters and small interactions
// Runs only when corresponding elements exist on the page.
// Depends on `CG_DATA` and helper functions in `js/data.js` and `js/app.js`.
// ═══════════════════════════════════════════════

(function() {
  function renderTrustStrip() {
    const strip = document.getElementById('trust-strip') || document.getElementById('about-trust');
    if (!strip || !window.CG_DATA) return;
    const items = [...CG_DATA.trustItems, ...CG_DATA.trustItems];
    strip.innerHTML = items.map(item => `
      <div class="trust-item">
        <span class="trust-item-icon">✦</span>
        <span>${item}</span>
      </div>
      <div class="trust-dot"></div>
    `).join('');
  }

  function renderTeam() {
    const container = document.getElementById('team-list') || document.querySelector('.team-grid');
    if (!container) return;
    const team = [
      { name: 'Aarav Mehta', role: 'Co-founder & CEO', bio: 'Product & strategy. Former student founder.', avatar: 'AM' },
      { name: 'Nisha Rao', role: 'Head of Content', bio: 'Leads college research & verification.', avatar: 'NR' },
      { name: 'Vikram Singh', role: 'Engineering Lead', bio: 'Builds the platform and tools.', avatar: 'VS' }
    ];
    container.innerHTML = team.map(m => `
      <div class="founder-card" style="display:flex; gap:1rem; align-items:center;">
        <div class="founder-avatar">${m.avatar}</div>
        <div>
          <div class="founder-name" style="font-weight:700">${m.name}</div>
          <div style="font-size:0.9rem; color:var(--muted); margin:0.35rem 0">${m.role}</div>
          <div style="font-size:0.9rem; color:var(--muted)">${m.bio}</div>
        </div>
      </div>
    `).join('');
  }

  function initCounters() {
    // animateCounter is provided by js/app.js
    if (typeof animateCounter !== 'function') return;
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      if (target > 0) animateCounter(el, target, suffix);
    });
  }

  // Optional: reveal short mission text if element exists
  function renderMission() {
    const el = document.getElementById('mission-text');
    if (!el) return;
    el.innerHTML = el.innerHTML || 'Genuine college reviews, verified data and unbiased guidance — helping students across India make confident decisions.';
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderTrustStrip();
    renderTeam();
    renderMission();
    // small timeout to allow other page counters to settle
    setTimeout(initCounters, 600);
  });

})();
