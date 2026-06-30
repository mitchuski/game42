// constellation.js — "all my games". 42 games of 42 (1764 stations) fold into a
// greater star-tetrahedron manifold: each of the 42 stations of a parent game
// becomes its own folded game of 42, the whole reading as one lit mosaic — a
// personal /star. Points-based for performance.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SLOTS, SLOTS_BY_AXIS, AXIS_ORDER, AXIS_BY_ID } from './data.js';
import { foldWorld } from './geometry.js';
import { buildStar } from './star.js';
import { createControls } from './controls.js';
import { theme } from './palette.js';
import { pngExtract } from './pngkey.js';
import { conformImport } from './conform.js';

const $ = (id) => document.getElementById(id);
const THETA = 70, TWIST = 138, CHILD = 0.27;
const PARENTS = SLOTS.length; // 42
const CN = PARENTS * SLOTS.length; // 1764

// ---- scene ----------------------------------------------------------------
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060d, 0.045);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 600);
const world = new THREE.Group();
scene.add(world);
scene.add(new THREE.AmbientLight(0x4a567e, 1.1));
const pl = new THREE.PointLight(0x8fb4ff, 1.6, 200); pl.position.set(6, 9, 10); scene.add(pl);

// starfield
(function () {
  const M = 900, p = [], c = [];
  for (let i = 0; i < M; i++) {
    const r = 22 + Math.random() * 40, u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, sq = Math.sqrt(1 - u * u);
    p.push(r * sq * Math.cos(a), r * sq * Math.sin(a), r * u);
    const f = 0.3 + Math.random() * 0.5; c.push(0.5 * f, 0.6 * f, 0.9 * f);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })));
})();

// the greater star (the personal sovereignty star the games converge into)
const star = buildStar();
star.setMode('facet');
star.setSize(2.6); // toned down — the tetrahedra were dominant
world.add(star.group);

// ---- the 1764 child stations ---------------------------------------------
const parentBase = SLOTS.map((s) => foldWorld(s, 1, 1, THETA, TWIST).clone()); // ~radius 2.3
const childBase = SLOTS.map((c) => foldWorld(c, 1, 1, THETA, TWIST).clone());
const baseColor = new Float32Array(CN * 3);
const clusterOf = new Int16Array(CN);
const tmp = new THREE.Color();
(function () {
  let i = 0;
  for (let p = 0; p < PARENTS; p++) {
    for (let c = 0; c < SLOTS.length; c++) {
      tmp.set(AXIS_BY_ID[SLOTS[c].axisId].colour);
      baseColor[i * 3] = tmp.r; baseColor[i * 3 + 1] = tmp.g; baseColor[i * 3 + 2] = tmp.b;
      clusterOf[i] = p;
      i++;
    }
  }
})();
const posBuf = new Float32Array(CN * 3);
const colBuf = new Float32Array(CN * 3);
const childGeo = new THREE.BufferGeometry();
childGeo.setAttribute('position', new THREE.BufferAttribute(posBuf, 3));
childGeo.setAttribute('color', new THREE.BufferAttribute(colBuf, 3));
const childPoints = new THREE.Points(childGeo, new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
world.add(childPoints);

// parent links — connect the 42 games by the parent game's own lattice edges
// (heptad spokes + corner triangles), so the whole reads as one manifold.
const slotIndex = Object.fromEntries(SLOTS.map((s, i) => [s.slotId, i]));
const linkPairs = [];
for (const a of AXIS_ORDER) {
  const g = SLOTS_BY_AXIS[a];
  const ki = slotIndex[g.find((s) => s.isKeystone).slotId];
  for (const s of g) if (!s.isKeystone) linkPairs.push([ki, slotIndex[s.slotId]]);
  const corners = g.filter((s) => s.barycentric.includes(1)).map((s) => slotIndex[s.slotId]);
  linkPairs.push([corners[0], corners[1]], [corners[1], corners[2]], [corners[2], corners[0]]);
}
const linkGeo = new THREE.BufferGeometry();
linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPairs.length * 2 * 3), 3));
const parentLinks = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color: 0x7f93d0, transparent: true, opacity: 0.28 }));
world.add(parentLinks);

// the 42 parent anchors (your games) + threads from the centre
const anchorGeo = new THREE.BufferGeometry();
anchorGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARENTS * 3), 3));
const anchorCol = new Float32Array(PARENTS * 3);
(function () {
  const c = new THREE.Color();
  for (let p = 0; p < PARENTS; p++) {
    c.set(AXIS_BY_ID[SLOTS[p].axisId].colour).lerp(new THREE.Color(0xffffff), 0.4);
    anchorCol[p * 3] = c.r; anchorCol[p * 3 + 1] = c.g; anchorCol[p * 3 + 2] = c.b;
  }
})();
anchorGeo.setAttribute('color', new THREE.BufferAttribute(anchorCol, 3));
const anchors = new THREE.Points(anchorGeo, new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
world.add(anchors);
const threadGeo = new THREE.BufferGeometry();
threadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARENTS * 2 * 3), 3));
const threads = new THREE.LineSegments(threadGeo, new THREE.LineBasicMaterial({ color: 0x6f86c8, transparent: true, opacity: 0.18 }));
world.add(threads);

// grid assignment -> which parent stations light (within the six root constellations)
function readAssign() {
  try {
    const a = JSON.parse(localStorage.getItem('game42.constellation') || '{}');
    const set = new Set();
    for (const sl in a) { const i = slotIndex[sl]; if (i !== undefined) set.add(i); }
    return set;
  } catch (e) { return new Set(); }
}
let litParents = readAssign();

// ---- assigned-game emoji glyphs: each assigned parent shows its game's glyph,
// glowing at its anchor — so the grid assignment visibly "arrives" in the sky. ----
const glyphGroup = new THREE.Group();
world.add(glyphGroup);
function emojiTexture(ch) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.font = '82px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.95)'; ctx.shadowBlur = 20;
  ctx.fillText(ch, 64, 70);
  const t = new THREE.CanvasTexture(cv); t.needsUpdate = true; return t;
}
function cardEmojiMap() {
  const map = {};
  try {
    const cards = JSON.parse(localStorage.getItem('game42.grid') || '[]');
    for (const c of cards) if (c.kappaRaw) map[c.kappaRaw] = { emoji: c.emoji || '', kind: c.kind, name: c.name };
  } catch (e) {}
  return map;
}
function rebuildGlyphs() {
  try {
    while (glyphGroup.children.length) {
      const o = glyphGroup.children.pop();
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    }
    if (!params.fromGrid) return;
    const assign = JSON.parse(localStorage.getItem('game42.constellation') || '{}');
    const cards = cardEmojiMap();
    for (const sl in assign) {
      const p = slotIndex[sl]; if (p === undefined) continue;
      const card = cards[assign[sl]] || {};
      const ch = card.emoji || (card.kind === 'key' ? '🗝️' : '🎴');
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(ch), transparent: true, depthWrite: false, depthTest: false }));
      spr.position.copy(parentBase[p].clone().multiplyScalar(params.spread * 1.06));
      spr.scale.setScalar(0.62); spr.userData.p = p;
      glyphGroup.add(spr);
    }
  } catch (e) { window.__gerr && window.__gerr('glyphs: ' + (e && e.message || e)); }
}

// duo core flow (carried from the territory): the six keystone parents share back
// and forth with the centre; a central glow brightens as they gather.
const keyParents = SLOTS.map((s, i) => (s.isKeystone ? i : -1)).filter((i) => i >= 0);
const flowGeo = new THREE.BufferGeometry();
flowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(keyParents.length * 2 * 3), 3));
const coreFlow = new THREE.LineSegments(flowGeo, new THREE.LineBasicMaterial({ color: 0x9be7ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }));
world.add(coreFlow);
const flowDots = [];
for (let i = 0; i < keyParents.length; i++) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(m); flowDots.push(m);
}
const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), new THREE.MeshBasicMaterial({ color: 0xfff4d6, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
world.add(coreGlow);

function rebuild(spread) {
  let i = 0;
  const ap = anchorGeo.attributes.position, tp = threadGeo.attributes.position;
  for (let p = 0; p < PARENTS; p++) {
    const pc = parentBase[p];
    const px = pc.x * spread, py = pc.y * spread, pz = pc.z * spread;
    ap.setXYZ(p, px, py, pz);
    tp.setXYZ(p * 2, 0, 0, 0); tp.setXYZ(p * 2 + 1, px, py, pz);
    for (let c = 0; c < SLOTS.length; c++) {
      const cb = childBase[c];
      posBuf[i * 3] = px + cb.x * CHILD;
      posBuf[i * 3 + 1] = py + cb.y * CHILD;
      posBuf[i * 3 + 2] = pz + cb.z * CHILD;
      i++;
    }
  }
  childGeo.attributes.position.needsUpdate = true;
  ap.needsUpdate = true; tp.needsUpdate = true;
  childGeo.computeBoundingSphere();
  // parent link web
  const lp = linkGeo.attributes.position;
  for (let k = 0; k < linkPairs.length; k++) {
    const [u, v] = linkPairs[k];
    const a0 = parentBase[u], b0 = parentBase[v];
    lp.setXYZ(k * 2, a0.x * spread, a0.y * spread, a0.z * spread);
    lp.setXYZ(k * 2 + 1, b0.x * spread, b0.y * spread, b0.z * spread);
  }
  lp.needsUpdate = true;
}

// ---- params + controls ----------------------------------------------------
const params = { spin: 0, focus: false, spread: 1.8, lit: 42, star: true, threads: true, wave: true, fromGrid: true, coreFlow: true, minDist: 2, maxDist: 140, startDist: 12 };
let mySpin = 0.08;
let keyShell = null;
rebuild(params.spread);

// build the soulbis-style manifold shell + 64-lattice from an inserted key, so
// the constellation lights up *inside* the shape the key describes.
function buildKeyShell(cfg) {
  if (keyShell) {
    world.remove(keyShell);
    keyShell.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    keyShell = null;
  }
  const g = (cfg && cfg.geometry) || {};
  const eps = typeof g.eps === 'number' ? g.eps : 0.35;
  const m = (g.m | 0) || 5, n = (g.n | 0) || 6;
  const pal = (cfg && cfg.palette) || {};
  const R = 5.4, amp = eps * 2.2, segU = 140, segV = 80, pos = [], idx = [];
  for (let i = 0; i <= segV; i++) {
    const phi = (i / segV) * Math.PI, sp = Math.sin(phi), cp = Math.cos(phi);
    for (let j = 0; j <= segU; j++) {
      const th = (j / segU) * Math.PI * 2;
      const r = R + amp * Math.sin(m * phi) * Math.cos(n * th);
      pos.push(r * sp * Math.cos(th), r * cp, r * sp * Math.sin(th));
    }
  }
  for (let i = 0; i < segV; i++) for (let j = 0; j < segU; j++) {
    const A = i * (segU + 1) + j, B = A + 1, C = A + segU + 1, D = C + 1;
    idx.push(A, C, B, B, C, D);
  }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  mg.setIndex(idx); mg.computeVertexNormals();
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(mg, new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.warm || '#9fb4e8'), transparent: true, opacity: 0.06, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.2, depthWrite: false })));
  grp.add(new THREE.LineSegments(new THREE.WireframeGeometry(mg), new THREE.LineBasicMaterial({ color: new THREE.Color(pal.mage || '#6f86c8'), transparent: true, opacity: 0.16 })));
  // 64-vertex lattice (icosahedral 6->3 projection)
  const PHI = (1 + Math.sqrt(5)) / 2;
  const Gv = [[0, 1, PHI], [0, 1, -PHI], [1, PHI, 0], [1, -PHI, 0], [PHI, 0, 1], [PHI, 0, -1]].map((v) => { const L = Math.hypot(v[0], v[1], v[2]); return [v[0] / L, v[1] / L, v[2] / L]; });
  const raw = []; let mxr = 0;
  for (let x = 0; x < 64; x++) {
    let px = 0, py = 0, pz = 0;
    for (let b = 0; b < 6; b++) { const s = ((x >> b) & 1) - 0.5; px += s * Gv[b][0]; py += s * Gv[b][1]; pz += s * Gv[b][2]; }
    raw.push([px, py, pz]); mxr = Math.max(mxr, Math.hypot(px, py, pz));
  }
  const sc = (R * 0.92) / (mxr || 1), lpos = [];
  for (const v of raw) lpos.push(v[0] * sc, v[1] * sc, v[2] * sc);
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(lpos, 3));
  grp.add(new THREE.Points(lg, new THREE.PointsMaterial({ color: new THREE.Color(pal.sword || '#e0a526'), size: 0.12, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })));
  world.add(grp);
  keyShell = grp;
}
const controls = createControls(canvas, camera, params, null);

function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

// ---- loop -----------------------------------------------------------------
const clock = new THREE.Clock();
function tick() {
  try {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    controls.update(dt);
    world.rotation.y += dt * mySpin;
    world.scale.setScalar(1 + 0.03 * Math.sin(t * 0.5));

    // light wave: from grid (assigned stations) or by the lit-count slider
    for (let i = 0; i < CN; i++) {
      const p = clusterOf[i];
      const lit = params.fromGrid ? litParents.has(p) : p < params.lit;
      let inten;
      if (!lit) inten = 0.12;
      else if (params.wave) inten = 0.45 + 0.55 * Math.max(0, Math.sin(t * 1.5 - p * 0.5));
      else inten = 1;
      colBuf[i * 3] = baseColor[i * 3] * inten;
      colBuf[i * 3 + 1] = baseColor[i * 3 + 1] * inten;
      colBuf[i * 3 + 2] = baseColor[i * 3 + 2] * inten;
    }
    childGeo.attributes.color.needsUpdate = true;
    glyphGroup.children.forEach((s) => { s.material.opacity = params.wave ? 0.78 + 0.22 * Math.max(0, Math.sin(t * 1.5 - s.userData.p * 0.5)) : 1; });

    anchors.visible = true;
    threads.visible = params.threads;
    parentLinks.visible = params.threads;

    // duo core flow
    coreFlow.visible = params.coreFlow; coreGlow.visible = params.coreFlow;
    flowDots.forEach((d) => (d.visible = params.coreFlow));
    if (params.coreFlow) {
      const ap = anchorGeo.attributes.position, fp = flowGeo.attributes.position;
      let eng = 0;
      for (let k = 0; k < keyParents.length; k++) {
        const pi = keyParents[k];
        const x = ap.getX(pi), y = ap.getY(pi), z = ap.getZ(pi);
        fp.setXYZ(k * 2, 0, 0, 0); fp.setXYZ(k * 2 + 1, x, y, z);
        const u = 0.5 - 0.5 * Math.cos(t * 0.8 + k * Math.PI / 3);
        flowDots[k].position.set(x * u, y * u, z * u);
        flowDots[k].material.opacity = 0.3 + 0.6 * (1 - u);
        eng += 1 - u;
      }
      fp.needsUpdate = true;
      const e = eng / keyParents.length;
      coreGlow.material.opacity = 0.12 + 0.5 * e * (0.6 + 0.4 * Math.sin(t * 2));
      coreGlow.scale.setScalar(1 + 1.5 * e);
    }

    star.group.visible = params.star;
    star.update(1, t, false, dt, false);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  } catch (err) { window.__gerr && window.__gerr('loop: ' + (err && err.stack || err)); throw err; }
}
tick();

// ---- panel ----------------------------------------------------------------
$('rSpread').addEventListener('input', (e) => { params.spread = parseFloat(e.target.value); rebuild(params.spread); rebuildGlyphs(); });
$('rLit').addEventListener('input', (e) => { params.lit = parseInt(e.target.value); $('sGames').textContent = params.lit; });
$('rSpin').addEventListener('input', (e) => { mySpin = parseFloat(e.target.value); });
$('tStar').addEventListener('change', (e) => { params.star = e.target.checked; });
$('tThreads').addEventListener('change', (e) => { params.threads = e.target.checked; });
$('tWave').addEventListener('change', (e) => { params.wave = e.target.checked; });
$('tGrid').addEventListener('change', (e) => {
  params.fromGrid = e.target.checked;
  if (params.fromGrid) { litParents = readAssign(); $('sGames').textContent = litParents.size; }
  else $('sGames').textContent = params.lit;
  rebuildGlyphs();
});
$('tFlow').addEventListener('change', (e) => { params.coreFlow = e.target.checked; });
$('starMode').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
  $('starMode').querySelectorAll('button').forEach((x) => x.classList.remove('on'));
  b.classList.add('on');
  star.setMode(b.dataset.m);
}));
$('rStarSize').addEventListener('input', (e) => star.setSize(parseFloat(e.target.value)));
$('sNodes').textContent = CN;

// ---- focus mode ----------------------------------------------------------
const focusBadge = $('focusbadge');
let badgeT;
function flashBadge(ms) { focusBadge.classList.add('show'); clearTimeout(badgeT); badgeT = setTimeout(() => focusBadge.classList.remove('show'), ms); }
function toggleFocus() {
  params.focus = !params.focus;
  document.body.classList.toggle('focus', params.focus);
  if (params.focus) flashBadge(2600); else focusBadge.classList.remove('show');
}
$('bFocus').addEventListener('click', toggleFocus);
focusBadge.addEventListener('click', toggleFocus);
document.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFocus(); }
  else if (e.key === 'Escape' && params.focus) toggleFocus();
});
document.addEventListener('mousemove', () => { if (params.focus) flashBadge(1800); });

// ---- insert your star (upload a soulbis star / City-Mage Key PNG) ---------
// reads the cityKey tEXt payload and tints the greater star to your key's
// palette — your star, inserted at the centre the games fold into.
$('bKey').addEventListener('click', () => $('fKey').click());
$('fKey').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    let cfg = null;
    try {
      cfg = pngExtract(r.result, 'cityKey') || pngExtract(r.result, 'game42');
      if (!cfg) cfg = JSON.parse(new TextDecoder().decode(r.result));
    } catch (x) { cfg = null; }
    if (!cfg || typeof cfg !== 'object') { $('yourstar').textContent = '⚠ no key in that file'; return; }
    if (cfg.palette) {
      if (cfg.palette.sword) theme.sword = cfg.palette.sword;
      if (cfg.palette.mage) theme.mage = cfg.palette.mage;
    }
    const name = cfg.name || 'your key';
    const k = cfg.kappa || cfg.seal || '';
    const warns = conformImport(cfg);
    $('yourstar').innerHTML = `⭐ <b style="color:var(--ink)">${String(name).slice(0, 28)}</b><br>${k ? String(k).replace('sha256:', '').slice(0, 18) + '…' : 'inserted into the constellation'}` +
      (warns.length ? `<br><span style="color:#ffb4b4">⚠ ${warns.join('; ')}</span>` : `<br><span style="color:#7be0b0">✓ conforms to A1</span>`);
    star.group.scale.setScalar(3.6);
    buildKeyShell(cfg); // raise the lattice + manifold around the games
  };
  r.readAsArrayBuffer(f);
  e.target.value = '';
});

// the constellation lights from the progression of assignment — as games are
// assigned on the grid (game42.constellation), their fractal regions light up.
// live-follow when the assignment changes in another tab.
function relightFromCollection() {
  litParents = readAssign();
  if (params.fromGrid) $('sGames').textContent = litParents.size;
  rebuildGlyphs();
}
addEventListener('storage', (e) => {
  if (e.key === 'game42.constellation' || e.key === 'game42.grid' || e.key === null) relightFromCollection();
});
// same-tab navigation / emoji edits in a hidden tab: re-read when we regain focus
addEventListener('visibilitychange', () => { if (!document.hidden) relightFromCollection(); });
addEventListener('focus', relightFromCollection);
relightFromCollection();
