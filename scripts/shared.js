// shared.js — common UI code for all attest pages

// Copy buttons on <pre> blocks
function initCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'copy';
    btn.addEventListener('click', () => {
      const text = pre.querySelector('code') ? pre.querySelector('code').textContent : pre.textContent;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'copied';
        setTimeout(() => btn.textContent = 'copy', 1500);
      });
    });
    pre.appendChild(btn);
  });
}

// HTML-escape helper
function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

// Init
initCopyButtons();
