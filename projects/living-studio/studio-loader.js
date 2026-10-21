'use strict';
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const started = performance.now();
  const controller = new AbortController();
  const tasks = new Map([['document', 20], ['scene', 35], ['night', 20], ['day', 15], ['fonts', 10]]);
  const completed = new Set();
  let overlay, status, track, percent, sceneTimer, revealTimer, leaving = false;
  let returning = false;
  try { returning = sessionStorage.getItem('josh-studio-intro-seen') === '1'; } catch {}
  const minimum = reduced ? 0 : returning ? 650 : 1850;
  root.classList.add('studio-booting');

  function finish() {
    clearTimeout(hardTimer);
    clearTimeout(sceneTimer);
    clearTimeout(revealTimer);
    controller.abort();
    root.classList.remove('studio-booting');
    if (overlay) {
      if (overlay.open) overlay.close();
      overlay.hidden = true;
    }
    try { sessionStorage.setItem('josh-studio-intro-seen', '1'); } catch {}
    if (!document.querySelector('dialog[open]')) document.querySelector('#main')?.focus({preventScroll: true});
  }
  function leave(reason) {
    if (leaving) return;
    leaving = true;
    clearTimeout(hardTimer);
    clearTimeout(sceneTimer);
    clearTimeout(revealTimer);
    controller.abort();
    root.classList.remove('studio-booting');
    if (!overlay) { finish(); return; }
    overlay.dataset.result = reason;
    overlay.classList.add('is-leaving');
    if (reduced) finish();
    else revealTimer = setTimeout(finish, 560);
  }
  // A blocked asset or script must never strand visitors at the intro.
  const hardTimer = setTimeout(() => leave('timeout'), 9000);

  function complete(name) {
    if (leaving || !overlay || completed.has(name)) return;
    completed.add(name);
    const progress = [...completed].reduce((total, key) => total + tasks.get(key), 0);
    overlay.style.setProperty('--boot-progress', progress);
    percent.textContent = progress + '%';
    track.setAttribute('aria-valuenow', String(progress));
    const message = !completed.has('scene') ? 'Arranging your workspace…'
      : !completed.has('night') || !completed.has('day') ? 'Letting the light in…'
      : !completed.has('fonts') ? 'Finishing the details…' : 'Your studio is ready.';
    if (status.textContent !== message) status.textContent = message;
    if (progress === 100) revealTimer = setTimeout(() => leave('ready'), Math.max(0, minimum - (performance.now() - started)));
  }
  function waitForImage(selector, name) {
    const image = document.querySelector(selector);
    if (!image) { complete(name); return; }
    const settled = () => {
      const decode = image.naturalWidth && typeof image.decode === 'function' ? image.decode() : Promise.resolve();
      Promise.resolve(decode).catch(() => {}).then(() => complete(name));
    };
    if (image.complete) settled();
    else {
      image.addEventListener('load', settled, {once: true, signal: controller.signal});
      image.addEventListener('error', () => complete(name), {once: true, signal: controller.signal});
    }
  }
  function waitForScene() {
    if (leaving) return;
    const state = window.WorkspaceViewpoint?.getState();
    if (state?.ready || state?.failed) complete('scene');
    else sceneTimer = setTimeout(waitForScene, 80);
  }
  function mount() {
    if (leaving) return;
    overlay = document.querySelector('#studio-loader');
    if (!overlay) { leave('unavailable'); return; }
    status = overlay.querySelector('#studio-loader-status');
    track = overlay.querySelector('#studio-loader-progress');
    percent = overlay.querySelector('#studio-loader-percent');
    overlay.showModal();
    overlay.querySelector('#studio-loader-skip').addEventListener('click', () => leave('skip'), {signal: controller.signal});
    overlay.addEventListener('cancel', event => { event.preventDefault(); leave('skip'); }, {signal: controller.signal});
    complete('document');
    waitForScene();
    waitForImage('#room-image', 'night');
    waitForImage('.room-day-image', 'day');
    Promise.resolve(document.fonts?.ready).catch(() => {}).then(() => complete('fonts'));
  }
  window.addEventListener('pagehide', () => { leaving = true; finish(); }, {once: true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
  else mount();
})();
