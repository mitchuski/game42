// flower.js — the first turn of the game, rendered as a flower.
//
// A pure 6 + 1 compression view of the whole Game of 42: six petals (one per
// axis = one heptad of seven, compressed to a single mage) around one centre
// (the City seal, the seventh). Behind them, all forty-two stations sit as a
// phyllotactic spiral of seeds — the full game the flower carries.
//
// The ritual follows the rest of the game: you fill in information, you assign
// a role, you add detail. Seating a mage blooms its petal; folding the flower
// (the golden twist, 137.508°) closes the hexagon toward the star — the capture
// preview. This is the most-aesthetic surface because it is the opening move.

import { bootAssert, AXIS_ORDER, SLOTS_BY_AXIS } from './data.js';
import { axisColor } from './palette.js';
import { GAMES, loadCustom, saveCustom } from './presets.js';
import { MAGES_42, personaName, personaGlyph } from './personas.js';
import { canonical, sha256hex } from './hash.js';
import { pngEmbed } from './pngkey.js';

// A1 lattice vertex per axis (AXIOMS) — the bit each root lights in a bitmask.
const AXIS_VERTEX = { protection: 32, delegation: 16, memory: 8, connection: 4, compute: 2, value: 1 };

const errs = bootAssert();
if (errs.length) console.warn('[flower] boot assertions:', errs);

const SVGNS = 'http://www.w3.org/2000/svg';
const GOLDEN = 137.50776;            // the golden angle — the Fibonacci twist
const ease = (p) => p * p * (3 - 2 * p);    // smoothstep
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, t) => a + (b - a) * t;

// petal leaf geometry (pointing up, screen-up = negative y) ------------------
const R_BASE = 60, R_TIP = 262, R_LABEL = 168, HALF_W = 82;
function leafPath() {
  const span = R_TIP - R_BASE;
  const yb = -R_BASE, yt = -R_TIP;
  const y1 = -(R_BASE + span * 0.30), y2 = -(R_BASE + span * 0.74);
  return `M 0 ${yb} C ${-HALF_W} ${y1} ${-HALF_W} ${y2} 0 ${yt}`
       + ` C ${HALF_W} ${y2} ${HALF_W} ${y1} 0 ${yb} Z`;
}
// a point at radius r along a petal pointing up, then rotated by deg (clockwise)
function radial(r, deg) {
  const a = (deg - 90) * Math.PI / 180; // -90 so deg=0 points up
  return [r * Math.cos(a), r * Math.sin(a)];
}

// ---- preset / state ---------------------------------------------------------
let presetId = (() => { try { return localStorage.getItem('game42.preset') === 'mine' ? 'mine' : 'mages'; } catch (e) { return 'mages'; } })();
const FKEY = 'game42.flower';

// the canonical first-six mages: each axis' keystone (fill order 7, the archmage
// who integrates its heptad and seals it last).
function keystoneKey(axisId) { const a = MAGES_42[axisId]; return a ? a[a.length - 1] : null; }

function gameLabels() {
  if (presetId === 'mine') { const c = loadCustom(); return c.axisLabels; }
  return GAMES.mages.axisLabels;
}

// the six roots, in canonical heptad order, placed around the hexagon
const ROOTS = AXIS_ORDER.map((axisId, idx) => {
  const kk = keystoneKey(axisId);
  return {
    axisId, idx, angle: 60 * idx, colour: axisColor(axisId),
    canonName: personaName(kk), glyph: personaGlyph(kk),
    heptad: SLOTS_BY_AXIS[axisId] || [],
  };
});

function loadFlower() {
  try { const v = JSON.parse(localStorage.getItem(FKEY)); if (v && typeof v === 'object') return v; } catch (e) {}
  return {};
}
function saveFlower(s) { try { localStorage.setItem(FKEY, JSON.stringify(s)); } catch (e) {} }
let state = loadFlower();                  // { axisId: {name, role, detail, seated} }
function petalOf(axisId) { return state[axisId] || (state[axisId] = {}); }
function isSeated(axisId) { return !!(state[axisId] && state[axisId].seated); }
function seatedCount() { return ROOTS.filter((r) => isSeated(r.axisId)).length; }

// defaults pulled from the active vocabulary, offered the moment you open a petal
function defaultsFor(r) {
  const labels = gameLabels();
  return { name: r.canonName, role: `the ${labels[r.axisId] || r.axisId} mage`, detail: '' };
}

// In my42 you name everything — the realm word, the glyph, and the centre.
// In mages those stay canon. Realm words sync to the custom preset so the rest
// of the game (map, grid…) speaks the same vocabulary.
const editable = () => presetId === 'mine';
function glyphOf(r) { const o = state[r.axisId] && state[r.axisId].glyph; return (editable() && o) ? o : r.glyph; }
function labelOf(axisId) { return gameLabels()[axisId] || axisId; }
function setRealm(axisId, word) { const c = loadCustom(); c.axisLabels = { ...c.axisLabels, [axisId]: word }; saveCustom(c); }
function centreInfo() { const c = state._centre || {}; return { name: c.name || '', glyph: c.glyph || '🏛️' }; }

// ---- build the SVG ----------------------------------------------------------
const host = document.getElementById('flower');
const svg = document.createElementNS(SVGNS, 'svg');
svg.setAttribute('viewBox', '-300 -300 600 600');
svg.setAttribute('role', 'img');
host.appendChild(svg);

// defs: per-axis radial gradients + a soft glow
const defs = document.createElementNS(SVGNS, 'defs');
svg.appendChild(defs);
defs.innerHTML = `
  <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
for (const r of ROOTS) {
  const g = document.createElementNS(SVGNS, 'radialGradient');
  g.id = `grad-${r.axisId}`; g.setAttribute('cx', '50%'); g.setAttribute('cy', '15%'); g.setAttribute('r', '85%');
  g.innerHTML = `<stop offset="0%" stop-color="${r.colour}" stop-opacity="0.95"/>`
              + `<stop offset="60%" stop-color="${r.colour}" stop-opacity="0.55"/>`
              + `<stop offset="100%" stop-color="${r.colour}" stop-opacity="0.12"/>`;
  defs.appendChild(g);
}

// layer 0 — the 42 seeds, a phyllotactic spiral (the whole game, compressed)
const seedLayer = document.createElementNS(SVGNS, 'g');
svg.appendChild(seedLayer);
const SEEDS = [];
const SEED_C = 33.5;
for (let i = 0; i < 42; i++) {
  const axisId = AXIS_ORDER[i % 6];
  const ang = i * GOLDEN, rad = SEED_C * Math.sqrt(i + 0.6);
  const a = (ang - 90) * Math.PI / 180;
  const c = document.createElementNS(SVGNS, 'circle');
  c.setAttribute('cx', (rad * Math.cos(a)).toFixed(2));
  c.setAttribute('cy', (rad * Math.sin(a)).toFixed(2));
  c.setAttribute('r', '3.1');
  c.setAttribute('fill', axisColor(axisId));
  seedLayer.appendChild(c);
  SEEDS.push({ el: c, axisId });
}

// layer 1 — six ignition threads centre→petal (latent hint)
const threadLayer = document.createElementNS(SVGNS, 'g');
svg.appendChild(threadLayer);
const THREADS = ROOTS.map((r) => {
  const [x, y] = radial(R_BASE - 4, r.angle);
  const l = document.createElementNS(SVGNS, 'line');
  l.setAttribute('x1', 0); l.setAttribute('y1', 0); l.setAttribute('x2', x.toFixed(2)); l.setAttribute('y2', y.toFixed(2));
  l.setAttribute('stroke', r.colour); l.setAttribute('stroke-width', '1');
  threadLayer.appendChild(l);
  return l;
});

// layer 2 — the star silhouette (the fold target), faint until folded
const starLayer = document.createElementNS(SVGNS, 'g');
svg.appendChild(starLayer);
function hexagram() {
  const pts = (off) => Array.from({ length: 3 }, (_, k) => radial(R_TIP * 0.82, off + k * 120));
  const tri = (off) => 'M ' + pts(off).map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L ') + ' Z';
  return tri(0) + ' ' + tri(60);
}
const star = document.createElementNS(SVGNS, 'path');
star.setAttribute('d', hexagram());
star.setAttribute('fill', 'none'); star.setAttribute('stroke', '#9fb4ff'); star.setAttribute('stroke-width', '1.2');
star.setAttribute('stroke-linejoin', 'round'); star.setAttribute('filter', 'url(#glow)');
starLayer.appendChild(star);

// layer 3 — the bloom group (twists on fold); petals live inside
const bloom = document.createElementNS(SVGNS, 'g');
svg.appendChild(bloom);
const D = leafPath();
const PETALS = ROOTS.map((r) => {
  const g = document.createElementNS(SVGNS, 'g');
  g.setAttribute('transform', `rotate(${r.angle})`);
  g.classList.add('petal');
  g.setAttribute('tabindex', '0');
  g.setAttribute('aria-label', r.axisId);
  const fill = document.createElementNS(SVGNS, 'path');
  fill.setAttribute('d', D); fill.setAttribute('fill', `url(#grad-${r.axisId})`);
  const edge = document.createElementNS(SVGNS, 'path');
  edge.setAttribute('d', D); edge.setAttribute('fill', 'none');
  edge.setAttribute('stroke', r.colour); edge.setAttribute('stroke-width', '1.4');
  g.appendChild(fill); g.appendChild(edge);
  // gleam — a dot that travels the petal spine when seated
  const gleam = document.createElementNS(SVGNS, 'circle');
  gleam.setAttribute('r', '5'); gleam.setAttribute('cx', '0'); gleam.setAttribute('fill', '#fff');
  gleam.setAttribute('filter', 'url(#glow)'); gleam.setAttribute('opacity', '0');
  g.appendChild(gleam);
  bloom.appendChild(g);
  g.addEventListener('click', () => select(r.axisId));
  g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(r.axisId); } });
  return { r, g, fill, edge, gleam, gleamT: -1 };
});

// layer 4 — upright labels (glyph + name), outside the fold group so they read
const labelLayer = document.createElementNS(SVGNS, 'g');
svg.appendChild(labelLayer);
const LABELS = ROOTS.map((r) => {
  const [gx, gy] = radial(R_LABEL, r.angle);
  const [lx, ly] = radial(R_LABEL - 30, r.angle);
  const grp = document.createElementNS(SVGNS, 'g');
  const glyph = document.createElementNS(SVGNS, 'text');
  glyph.setAttribute('x', gx.toFixed(1)); glyph.setAttribute('y', gy.toFixed(1));
  glyph.setAttribute('text-anchor', 'middle'); glyph.setAttribute('class', 'glyph');
  glyph.textContent = r.glyph;
  const ring = document.createElementNS(SVGNS, 'text');
  ring.setAttribute('x', lx.toFixed(1)); ring.setAttribute('y', (ly + 30).toFixed(1));
  ring.setAttribute('text-anchor', 'middle'); ring.setAttribute('class', 'ringlabel');
  const name = document.createElementNS(SVGNS, 'text');
  name.setAttribute('x', gx.toFixed(1)); name.setAttribute('y', (gy + 22).toFixed(1));
  name.setAttribute('text-anchor', 'middle'); name.setAttribute('class', 'magename');
  grp.appendChild(glyph); grp.appendChild(ring); grp.appendChild(name);
  labelLayer.appendChild(grp);
  return { r, grp, glyph, ring, name };
});

// layer 5 — the centre seed / City seal (the seventh)
const centre = document.createElementNS(SVGNS, 'g');
svg.appendChild(centre);
const seedRing = document.createElementNS(SVGNS, 'circle');
seedRing.setAttribute('r', '26'); seedRing.setAttribute('cx', 0); seedRing.setAttribute('cy', 0);
seedRing.setAttribute('fill', 'none'); seedRing.setAttribute('stroke', 'rgba(255,255,255,.25)'); seedRing.setAttribute('stroke-width', '1.2');
const seedCore = document.createElementNS(SVGNS, 'circle');
seedCore.setAttribute('r', '11'); seedCore.setAttribute('cx', 0); seedCore.setAttribute('cy', 0);
seedCore.setAttribute('fill', '#cdd6ff'); seedCore.setAttribute('filter', 'url(#glow)');
const seedGlyph = document.createElementNS(SVGNS, 'text');
seedGlyph.setAttribute('text-anchor', 'middle'); seedGlyph.setAttribute('y', '8'); seedGlyph.setAttribute('class', 'glyph');
seedGlyph.textContent = '🏛️';
centre.appendChild(seedRing); centre.appendChild(seedCore); centre.appendChild(seedGlyph);
centre.style.cursor = 'pointer';
centre.addEventListener('click', () => select('_centre'));

// ---- animation --------------------------------------------------------------
let foldTarget = 0;                         // 0..1, from the slider
let t0 = null;
const bloomCur = new Map(ROOTS.map((r) => [r.axisId, isSeated(r.axisId) ? 1 : 0]));

function startGleam(axisId) { const p = PETALS.find((x) => x.r.axisId === axisId); if (p) p.gleamT = 0; }

function frame(ts) {
  if (t0 == null) t0 = ts;
  const t = (ts - t0) / 1000;
  // breath: a tiny fold oscillation, only when at rest (latent life)
  const breath = foldTarget < 0.04 ? 0.018 * (0.5 - 0.5 * Math.cos(t * 2 * Math.PI / 6)) : 0;
  const fold = clamp01(foldTarget + breath);
  const ef = ease(fold);

  // the bloom group twists by the golden angle and draws inward as it folds
  const twist = ef * GOLDEN;
  const scale = lerp(1, 0.9, ef);
  bloom.setAttribute('transform', `rotate(${twist.toFixed(3)}) scale(${scale.toFixed(4)})`);

  // star silhouette rises with the fold; slow independent drift
  star.setAttribute('opacity', (0.06 + 0.6 * ef).toFixed(3));
  starLayer.setAttribute('transform', `rotate(${(t * 4).toFixed(2)})`);

  // centre: latent pulse, then the seal lights at 6/6
  const whole = seatedCount() === 6;
  const pulse = 0.6 + 0.4 * Math.sin(t * 2 * Math.PI / 3);
  seedCore.setAttribute('opacity', (whole ? 1 : 0.25 + 0.25 * pulse).toFixed(3));
  seedCore.setAttribute('r', (whole ? 13 : 9 + 1.5 * pulse).toFixed(2));
  seedRing.setAttribute('opacity', (whole ? 0.9 : 0.3).toFixed(2));
  seedRing.setAttribute('stroke', whole ? '#9fb4ff' : 'rgba(255,255,255,.25)');
  seedGlyph.setAttribute('opacity', (whole ? 1 : 0).toFixed(2));

  for (const p of PETALS) {
    const tgt = isSeated(p.r.axisId) ? 1 : 0;
    const cur = lerp(bloomCur.get(p.r.axisId), tgt, 0.10);
    bloomCur.set(p.r.axisId, cur);
    // latent petals breathe faintly; seated petals are full and lifted
    const base = 0.16 + 0.06 * (0.5 - 0.5 * Math.cos(t * 2 * Math.PI / 6 + p.r.idx));
    const op = lerp(base, 1, cur);
    p.fill.setAttribute('opacity', op.toFixed(3));
    p.edge.setAttribute('opacity', (0.25 + 0.6 * cur).toFixed(3));
    const sc = lerp(0.9, 1, ease(cur));
    p.g.setAttribute('transform', `rotate(${p.r.angle}) scale(${sc.toFixed(4)})`);
    // gleam travels the spine once on seating
    if (p.gleamT >= 0) {
      p.gleamT += 0.022;
      const gt = p.gleamT;
      p.gleam.setAttribute('cy', lerp(-R_BASE, -R_TIP, gt).toFixed(1));
      p.gleam.setAttribute('opacity', (gt < 1 ? Math.sin(gt * Math.PI) : 0).toFixed(3));
      if (gt >= 1) { p.gleamT = -1; p.gleam.setAttribute('opacity', '0'); }
    }
  }

  // labels: crisp while open (reading), fade as the flower folds to the star
  const labOpen = 1 - ef;
  for (const L of LABELS) {
    const cur = bloomCur.get(L.r.axisId);
    const st = state[L.r.axisId] || {};
    L.glyph.textContent = glyphOf(L.r);
    L.name.textContent = isSeated(L.r.axisId) ? (st.name || L.r.canonName) : '';
    L.ring.textContent = labelOf(L.r.axisId);
    L.grp.setAttribute('opacity', (labOpen * lerp(0.4, 1, cur)).toFixed(3));
  }
  seedGlyph.textContent = centreInfo().glyph;

  // threads + seeds: latent threads fade as petals bloom; each axis' 7 seeds
  // brighten when its mage is seated (the 42 the flower carries)
  for (let i = 0; i < THREADS.length; i++) {
    const cur = bloomCur.get(ROOTS[i].axisId);
    THREADS[i].setAttribute('opacity', (0.10 + 0.25 * (0.5 + 0.5 * Math.sin(t * 1.6 + i)) * (1 - cur)).toFixed(3));
  }
  for (const s of SEEDS) {
    const cur = bloomCur.get(s.axisId);
    s.el.setAttribute('opacity', lerp(0.10, 0.85, cur).toFixed(3));
    s.el.setAttribute('r', lerp(2.4, 3.4, cur).toFixed(2));
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---- editor + chrome --------------------------------------------------------
let selected = ROOTS[0].axisId;
const editor = document.getElementById('editor');
const legend = document.getElementById('legend');
const countEl = document.getElementById('count');
const pipsEl = document.getElementById('pips');
const sealEl = document.getElementById('seal');
const openBtn = document.getElementById('open');
const captureBtn = document.getElementById('capture');
const foldSlider = document.getElementById('fold');

// ---- capture: export this flower as a seatable artefact ---------------------
// A1 seam (AXIOMS): another board seats this flower by { seal, kappa, axisBitmask },
// never its interior. The PNG carries the whole thing for joining; the seam is
// what crosses when it is seated as one of another player's six.
function flowerArtefact() {
  const labels = gameLabels();
  const ci = centreInfo();
  const mages = {}; let bitmask = 0;
  for (const r of ROOTS) {
    const st = state[r.axisId] || {};
    if (st.seated) bitmask |= AXIS_VERTEX[r.axisId];
    mages[r.axisId] = { label: labels[r.axisId] || r.axisId, glyph: glyphOf(r), name: st.name || r.canonName, role: st.role || '', detail: st.detail || '' };
  }
  return {
    kind: 'flower42', preset: presetId,
    name: ci.name || (presetId === 'mine' ? 'my flower' : 'the City of Mages'),
    glyph: ci.glyph, tagline: 'a 6 + 1 flower of the Game of 42',
    axisBitmask: bitmask,
    axisLabels: Object.fromEntries(ROOTS.map((r) => [r.axisId, labels[r.axisId] || r.axisId])),
    mages,
  };
}
async function captureFlower() {
  const art = flowerArtefact();
  const seal = await sha256hex(canonical(art));
  art.seal = seal; art.kappa = 'sha256:' + seal;
  const W = 480, H = 520, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  x.fillStyle = '#0b0e14'; x.fillRect(0, 0, W, H);
  const cx = W / 2, cy = 256, R = 150;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  ROOTS.forEach((r, i) => {
    const a = (60 * i - 90) * Math.PI / 180, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
    x.beginPath(); x.arc(px, py, 30, 0, Math.PI * 2); x.fillStyle = r.colour + '33'; x.fill();
    x.strokeStyle = r.colour; x.lineWidth = 2; x.stroke();
    x.font = '24px serif'; x.fillStyle = '#fff'; x.fillText(glyphOf(r), px, py);
  });
  x.beginPath(); x.arc(cx, cy, 34, 0, Math.PI * 2); x.fillStyle = '#11162a'; x.fill();
  x.strokeStyle = '#9fb4ff'; x.lineWidth = 1.5; x.stroke();
  x.font = '26px serif'; x.fillStyle = '#fff'; x.fillText(art.glyph, cx, cy);
  x.fillStyle = '#dfe6ff'; x.font = '600 24px Georgia, serif'; x.fillText(art.name, cx, 54);
  x.fillStyle = '#8c95ad'; x.font = '12px ui-monospace, monospace';
  x.fillText('a 6 + 1 flower · ' + (art.axisBitmask === 63 ? 'whole' : seatedCount() + '/6'), cx, 84);
  x.fillText('κ ' + seal.slice(0, 32) + '…', cx, H - 28);
  const blob = pngEmbed(cv.toDataURL('image/png'), art);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = art.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-flower.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  captureBtn.textContent = '✓ captured';
  setTimeout(() => { captureBtn.innerHTML = '📸 capture'; }, 1800);
}

// ---- emoji picker -----------------------------------------------------------
const EMOJI = {
  'these six': ROOTS.map((r) => r.glyph),
  'mage & city': ['🧙','⚔️','🛡️','🗡️','🔮','📜','🏛️','🗝️','🪄','📖','🕯️','⚖️','👁️','🧿','☯️','⚜️'],
  cosmos: ['🌙','☀️','⭐','✨','🌟','💫','🪐','🌌','🔭','🌠','❄️','🔥','💧','🌀','⚡','☄️'],
  nature: ['🌹','🌸','🌼','🌿','🍃','🌲','🐟','🐭','🐉','🦅','🦌','🐾','🌱','🍄','🦉','🐙'],
  objects: ['💎','🔑','🔐','🧭','⚙️','🛠️','🔗','📡','🛰️','🎯','🧩','📿','🏺','⚓','💠','🔱'],
  symbols: ['🤝','♾️','✴️','✳️','❇️','♦️','⚛️','🆔','🌐','⭕','🔆','♻️','💢','🟣','🔵','🟡'],
  faces: ['😊','🤖','👤','👥','🧝','🧚','🐺','🦁','👑','🧞','🥷','🧛','🧜','🫅','🧙‍♀️','🧙‍♂️'],
};
const picker = document.createElement('div');
picker.className = 'emojipop'; picker.style.display = 'none';
picker.innerHTML = Object.entries(EMOJI).map(([cat, list]) =>
  `<div class="cat">${cat}</div><div class="grid">` +
  [...new Set(list)].map((e) => `<button type="button" data-e="${e}">${e}</button>`).join('') + `</div>`).join('');
document.body.appendChild(picker);
let pickTarget = null, pickCb = null;
function openPicker(input, cb) {
  pickTarget = input; pickCb = cb;
  const r = input.getBoundingClientRect();
  picker.style.display = 'block';
  const w = 272, left = Math.min(r.left, window.innerWidth - w - 10);
  picker.style.left = Math.max(8, left) + 'px';
  let top = r.bottom + 6;
  if (top + picker.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - picker.offsetHeight - 6);
  picker.style.top = top + 'px';
}
function closePicker() { picker.style.display = 'none'; pickTarget = null; pickCb = null; }
picker.addEventListener('mousedown', (e) => {
  const b = e.target.closest('button'); if (!b || !pickTarget) return;
  e.preventDefault();
  pickTarget.value = b.dataset.e;
  if (pickCb) pickCb(b.dataset.e);
  closePicker();
});
document.addEventListener('mousedown', (e) => {
  if (picker.style.display === 'none') return;
  if (e.target === pickTarget || picker.contains(e.target)) return;
  closePicker();
});
window.addEventListener('resize', closePicker);

function select(axisId) {
  selected = axisId;
  PETALS.forEach((p) => p.g.classList.toggle('sel', p.r.axisId === axisId));
  renderEditor();
}

const esc = (s) => String(s).replace(/"/g, '&quot;');

function renderEditor() {
  editor.classList.add('ed');
  if (selected === '_centre') return renderCentreEditor();
  const r = ROOTS.find((x) => x.axisId === selected);
  const st = petalOf(r.axisId);
  const seated = isSeated(r.axisId);
  const d = defaultsFor(r);
  const mine = editable();
  const heptadChips = r.heptad.map((s) => {
    const nm = personaName(MAGES_42[r.axisId]?.[s.fillOrder - 1] || '');
    return `<span class="chip${s.isKeystone ? ' key' : ''}">${s.fillOrder}&nbsp;<b>${nm}</b></span>`;
  }).join('');
  editor.innerHTML = `
    <div class="hd"><span class="dot" style="background:${r.colour}"></span><span class="g">${glyphOf(r)}</span>${esc(st.name ?? d.name)}</div>
    <div class="sub">root ${r.idx + 1} of 6 &middot; <b>${labelOf(r.axisId)}</b> &middot; ${seated ? 'seated' : 'latent — choose this mage'}</div>
    ${mine ? `
    <label>realm — name this petal</label>
    <input id="f-realm" value="${esc(labelOf(r.axisId))}" placeholder="${esc(labelOf(r.axisId))}" />
    <label>glyph — pick an emoji</label>
    <input id="f-glyph" class="glyphpick" readonly value="${esc(glyphOf(r))}" placeholder="${esc(r.glyph)}" />` : ''}
    <label>${mine ? 'mage name' : 'name'}</label>
    <input id="f-name" value="${esc(st.name ?? d.name)}" placeholder="${esc(d.name)}" />
    <label>role</label>
    <input id="f-role" value="${esc(st.role ?? d.role)}" placeholder="${esc(d.role)}" />
    <label>detail — what this mage governs</label>
    <textarea id="f-detail" placeholder="the information this root holds…">${esc(st.detail ?? '')}</textarea>
    <div class="row">
      <button class="btn ${seated ? '' : 'go'}" id="f-seat">${seated ? 'update' : 'seat this mage'}</button>
      ${seated ? '<button class="btn" id="f-unseat">remove</button>' : ''}
    </div>
    <div class="heptad">
      <div class="h">this petal compresses a heptad of 7 — its full stations</div>
      <div class="chips">${heptadChips}</div>
    </div>
    <p class="hint">${mine ? 'in my42 you name everything — the realm, its glyph, the mage, and the centre. ' : ''}${seated ? 'edit and update, or open the full 42 to fill its stations.' : 'seating commits the choice; the petal blooms and one of six pips lights.'}</p>`;

  const commit = (seatedFlag) => {
    if (mine) {
      const realm = document.getElementById('f-realm').value.trim();
      if (realm) setRealm(r.axisId, realm);
    }
    const prev = state[r.axisId] || {};
    const next = {
      name: document.getElementById('f-name').value.trim() || d.name,
      role: document.getElementById('f-role').value.trim() || d.role,
      detail: document.getElementById('f-detail').value.trim(),
      seated: seatedFlag,
    };
    if (mine) { const g = document.getElementById('f-glyph').value.trim(); if (g) next.glyph = g; }
    else if (prev.glyph) next.glyph = prev.glyph;
    state[r.axisId] = next;
    saveFlower(state);
  };
  document.getElementById('f-seat').addEventListener('click', () => {
    const was = isSeated(r.axisId);
    commit(true);
    if (!was) startGleam(r.axisId);
    renderAll();
  });
  const un = document.getElementById('f-unseat');
  if (un) un.addEventListener('click', () => { commit(false); bloomCur.set(r.axisId, 0); renderAll(); });
  const gi = document.getElementById('f-glyph');
  if (gi) gi.addEventListener('click', () => openPicker(gi, (e) => { petalOf(r.axisId).glyph = e; saveFlower(state); }));
}

function renderCentreEditor() {
  const ci = centreInfo();
  const mine = editable();
  const n = seatedCount();
  editor.innerHTML = `
    <div class="hd"><span class="g">${ci.glyph}</span>${ci.name || 'the centre'}</div>
    <div class="sub">the seventh &middot; the City seal &middot; lights at 6/6 (now ${n}/6)</div>
    ${mine ? `
    <label>name the centre</label>
    <input id="c-name" value="${esc(ci.name)}" placeholder="the City" />
    <label>glyph — pick an emoji</label>
    <input id="c-glyph" class="glyphpick" readonly value="${esc(ci.glyph)}" placeholder="🏛️" />
    <div class="row"><button class="btn go" id="c-save">name the centre</button></div>`
    : `<p class="hint">switch to <b>my42</b> above to name the centre and every realm in your own language.</p>`}
    <p class="hint">6 petals + 1 centre = the whole game of 42, compressed to seven. The centre is the seal the six fold into.</p>`;
  if (mine) {
    const cg = document.getElementById('c-glyph');
    cg.addEventListener('click', () => openPicker(cg, (e) => { state._centre = { name: document.getElementById('c-name').value.trim(), glyph: e }; saveFlower(state); }));
    document.getElementById('c-save').addEventListener('click', () => {
      state._centre = { name: document.getElementById('c-name').value.trim(), glyph: document.getElementById('c-glyph').value.trim() || '🏛️' };
      saveFlower(state); renderAll();
    });
  }
}

function renderLegend() {
  const title = editable() ? 'your six — name them all' : 'the first six mages';
  legend.innerHTML = `<h2>${title}</h2><div class="roots">` +
    ROOTS.map((r) => {
      const st = state[r.axisId] || {};
      const nm = isSeated(r.axisId) ? (st.name || r.canonName) : '<i style="opacity:.6">unseated</i>';
      return `<div><span class="dot" style="background:${r.colour}"></span><span class="g">${glyphOf(r)}</span>` +
        `<b>${labelOf(r.axisId)}</b> &middot; ${nm}</div>`;
    }).join('') +
    `</div><p class="prov">the flat thing remembers it was always a star — it only needed enough trust to fold.</p>`;
}

function renderStrip() {
  const n = seatedCount();
  countEl.textContent = n;
  pipsEl.innerHTML = ROOTS.map((r) => `<i class="${isSeated(r.axisId) ? 'on' : ''}"></i>`).join('');
  openBtn.disabled = n < 6;
  captureBtn.disabled = n < 6;
  sealEl.innerHTML = n < 6
    ? `the seal waits on the seventh — <b>${6 - n}</b> mage${6 - n === 1 ? '' : 's'} still to choose`
    : `<b>the City is whole.</b> fold to preview the seal, or open the full 42 to fill all forty-two stations.`;
}

function renderAll() { renderStrip(); renderLegend(); renderEditor(); }

foldSlider.addEventListener('input', () => { foldTarget = clamp01(foldSlider.value / 100); });
document.getElementById('clear').addEventListener('click', () => {
  state = {}; saveFlower(state); ROOTS.forEach((r) => bloomCur.set(r.axisId, 0)); foldTarget = 0; foldSlider.value = 0; renderAll();
});
openBtn.addEventListener('click', () => { window.location.href = './map.html?start'; });
captureBtn.addEventListener('click', captureFlower);

// preset toggle (mages | my42) shares the same store as the rest of the game
document.querySelectorAll('#preset button').forEach((b) => {
  b.classList.toggle('on', b.dataset.g === presetId);
  b.addEventListener('click', () => {
    presetId = b.dataset.g; try { localStorage.setItem('game42.preset', presetId); } catch (e) {}
    document.querySelectorAll('#preset button').forEach((x) => x.classList.toggle('on', x.dataset.g === presetId));
    renderAll();
  });
});

renderAll();
select(selected);
