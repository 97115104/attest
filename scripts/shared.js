// shared.js — common UI code for all attest pages

// Clock
function initClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const update = () => {
    el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  update();
  setInterval(update, 30000);
}

// Background color picker
function initBgPicker() {
  const picker = document.getElementById('bg-picker');
  if (!picker) return;
  // Always start from CSS default (#000000), never override from localStorage
  localStorage.removeItem('attest-bg');
  try {
    const rgb = getComputedStyle(document.body).backgroundColor;
    picker.value = rgb.includes('rgb')
      ? '#' + rgb.match(/\d+/g).map(x => (+x).toString(16).padStart(2, '0')).join('')
      : '#000000';
  } catch { picker.value = '#000000'; }
  picker.addEventListener('input', e => {
    document.body.style.background = e.target.value;
  });
}

// Copy buttons on <pre> blocks (skip ascii fillers)
function initCopyButtons() {
  document.querySelectorAll('pre:not(.ascii-filler)').forEach(pre => {
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

// Init all shared components
initClock();
initBgPicker();
initCopyButtons();
