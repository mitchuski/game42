// loopbar.js — the loop, made visible. Decorates every page's existing .pagenav
// with live progress badges (flower n/6 · map k/42 · territory p · constellation
// c/42 · grid cards) and appends the single "next move" of the spine:
//   choose 6 → fill 42 → capture → assign to a constellation → again ↻
// State is read from the shared game42.* store, so all six pages agree on where
// you are in the loop. Included per-page via <script type=module src=/src/loopbar.js>.
import * as store from './store.js';
import './star-companion.js';
import { JOURNEY_KEY } from './journey.js';

const AXES = 6, SLOTS = 42;

function readState() {
  const flower = store.load('game42.flower', {}) || {};
  const seated = Object.keys(flower).filter((k) => k !== '_centre' && flower[k] && flower[k].seated).length;
  const locked = (store.load('game42.locked', []) || []).length;
  const grid = (store.load('game42.grid', []) || []).length;
  const assign = store.load('game42.constellation', {}) || {};
  const assigned = Object.keys(assign).length;
  return { seated, locked, grid, assigned };
}

function nextMove(s) {
  const j = store.load(JOURNEY_KEY, null);
  if (!j || j.stage !== 'reviewed') return {href:'./map.html?start#journey', text: j ? 'continue your practice task' : 'begin with one practice task'};
  if (s.seated < AXES) return { href: './flower.html', text: `seat your six at the flower · ${s.seated}/6` };
  if (s.locked === 0) return { href: './map.html', text: 'open the map — fill the 42' };
  if (s.locked < SLOTS) return { href: './map.html', text: `keep filling · ${s.locked}/42 in the run` };
  if (s.grid === 0) return { href: './territory.html', text: 'the board is full — watch it fold, capture it' };
  if (s.assigned < SLOTS) return { href: './grid.html', text: `assign your games into a constellation · ${s.assigned}/42` };
  return { href: './constellation.html', text: 'the constellation is whole — begin again ↺' };
}

function badges(s) {
  return {
    'flower.html': `${s.seated}/6`,
    'map.html': `${s.locked}/42`,
    'territory.html': 'p ' + (s.locked / SLOTS).toFixed(2),
    'constellation.html': `${s.assigned}/42`,
    'grid.html': String(s.grid),
  };
}

function refresh() {
  const nav = document.querySelector('.pagenav');
  if (!nav) return;
  const s = readState();
  const b = badges(s);
  for (const a of nav.querySelectorAll('a[href]')) {
    const key = Object.keys(b).find((k) => a.getAttribute('href').endsWith(k));
    if (!key) continue;
    let i = a.querySelector('.bdg');
    if (!i) { i = document.createElement('i'); i.className = 'bdg'; a.appendChild(i); }
    i.textContent = b[key];
    const done = (key === 'flower.html' && s.seated >= 6) || (key === 'map.html' && s.locked >= SLOTS)
      || (key === 'territory.html' && s.locked >= SLOTS) || (key === 'constellation.html' && s.assigned >= SLOTS)
      || (key === 'grid.html' && s.grid > 0);
    a.classList.toggle('stage-done', done);
  }
  const nm = nextMove(s);
  let el = nav.querySelector('.nextmove');
  if (!el) { el = document.createElement('a'); el.className = 'nextmove'; nav.appendChild(el); }
  el.href = nm.href;
  el.textContent = '→ ' + nm.text;
}

const banner = document.createElement('p'); banner.className = 'practice-banner';
banner.textContent = 'PRACTICE · Local planning and synthetic records · No verified standing';
const place = document.querySelector('header, #title');
if (place) place.prepend(banner);
window.addEventListener('journeychange', refresh);
refresh();
window.addEventListener('storage', refresh);
window.addEventListener('focus', refresh);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
