// main.js — The Game of 42 visualisation engine.
// Scene + render loop + dev panel. The flow reducer is the source of truth; the
// geometry/visuals subscribe to it. p (sealed/42) drives the fold; a completed
// game produces a deterministic group seal carried inside the exported PNG.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SLOTS, AXIS_ORDER, AXIS_BY_ID, bootAssert } from './data.js';
import { createGame, nextAction } from './flow.js';
import { buildBoard } from './geometry.js';
import { buildStar } from './star.js';
import { buildExtras, update as updateVisuals } from './visuals.js';
import { createControls } from './controls.js';
import { kappaLabel, groupSeal, geometryHash, demoVRC } from './hash.js';
import { pngEmbed, readKeyFile } from './pngkey.js';
import { game42ToCityKey, kappaCity } from './citykey.js';
import { BOARD_GRAPH, AXIS_GLYPH, TRIAD, theme, THEME_DEFAULTS } from './palette.js';
import { GAMES, getGame, loadPreset, savePreset } from './presets.js';

const $ = (id) => document.getElementById(id);

// ---- boot assertions (BUILD-PLAN Phase 0) --------------------------------
const errs = bootAssert();
if (errs.length) console.error('[game42] boot assertion failed:\n' + errs.join('\n'));
else console.log('[game42] boot ok · 42 slots · 6 heptads · 3/3/1 per heptad');

// ---- renderer / scene ----------------------------------------------------
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060d, 0.06);
// environment map -> chrome reflections on the facet star + marble nodes
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const worldGroup = new THREE.Group();
scene.add(worldGroup);

scene.add(new THREE.AmbientLight(0x4a567e, 1.2));
const pl1 = new THREE.PointLight(0x8fb4ff, 1.8, 120); pl1.position.set(5, 7, 8); scene.add(pl1);
const pl2 = new THREE.PointLight(0xffc46a, 1.3, 120); pl2.position.set(-6, -4, -5); scene.add(pl2);
const dl = new THREE.DirectionalLight(0xdde7ff, 0.8); dl.position.set(0, 1, 6); scene.add(dl);

// starfield
(function () {
  const M = 800, p = [], c = [];
  for (let i = 0; i < M; i++) {
    const r = 16 + Math.random() * 26, u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, sq = Math.sqrt(1 - u * u);
    p.push(r * sq * Math.cos(a), r * sq * Math.sin(a), r * u);
    const f = 0.3 + Math.random() * 0.5;
    c.push(0.5 * f, 0.6 * f, 0.9 * f);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })));
})();

// ---- build the board + star ----------------------------------------------
const board = buildBoard(SLOTS);
buildExtras(board);
board.applyTheme();
const star = buildStar();
worldGroup.add(board.group, star.group);

// centre seed + six ignition threads (latent state, GEOMETRY §5)
const seed = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 18, 18),
  new THREE.MeshBasicMaterial({ color: 0xfff4d6, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
);
worldGroup.add(seed);
const threadGeo = new THREE.BufferGeometry();
threadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(AXIS_ORDER.length * 2 * 3), 3));
const threads = new THREE.LineSegments(threadGeo, new THREE.LineBasicMaterial({ color: 0xbcd0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
worldGroup.add(threads);

// core spiral — the six keystone guides (station 7) spiralling in and out of the
// centre to form the rotating keystone-hexad core, inside the star.
// (see chronicles/2026-06-27_core_shape_interrogation.md)
const coreSpiral = new THREE.Group();
worldGroup.add(coreSpiral);
const coreMarks = [];
for (let i = 0; i < AXIS_ORDER.length; i++) {
  const col = new THREE.Color(AXIS_BY_ID[AXIS_ORDER[i]].colour);
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  coreSpiral.add(m); coreMarks.push(m);
}
const coreLineGeo = new THREE.BufferGeometry();
coreLineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(AXIS_ORDER.length * 2 * 3), 3));
const coreLines = new THREE.LineSegments(coreLineGeo, new THREE.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }));
coreSpiral.add(coreLines);
const _cv = new THREE.Vector3();
const _cv2 = new THREE.Vector3();
const ZAXIS = new THREE.Vector3(0, 0, 1);
// self-links: the sword/mage star maps to two of the six roots — protection is the
// Swordsman, delegation is the Mage. You are these two of the six.
const selfGeo = new THREE.BufferGeometry();
selfGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 3), 3));
selfGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(4 * 3), 3));
const selfLinks = new THREE.LineSegments(selfGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
worldGroup.add(selfLinks);
const _swC = new THREE.Color(), _mgC = new THREE.Color();
// each lead (keystone) may bring a companion — the heptad's lead advisor (head
// station, fillOrder 1) — flowing into the centre to share understanding.
const leadByAxis = {};
for (const s of SLOTS) if (s.fillOrder === 1) leadByAxis[s.axisId] = s.slotId;
const coreFlowGeo = new THREE.BufferGeometry();
coreFlowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(AXIS_ORDER.length * 2 * 3), 3));
const coreFlow = new THREE.LineSegments(coreFlowGeo, new THREE.LineBasicMaterial({ color: 0x9be7ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
coreSpiral.add(coreFlow);
const coreComp = [];
for (let i = 0; i < AXIS_ORDER.length; i++) {
  const col = new THREE.Color(AXIS_BY_ID[AXIS_ORDER[i]].colour).lerp(new THREE.Color(0xffffff), 0.4);
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  coreSpiral.add(m); coreComp.push(m);
}
const shareGlow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 18), new THREE.MeshBasicMaterial({ color: 0xfff4d6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
coreSpiral.add(shareGlow);

// latent-state constants (GEOMETRY §6)
const INTRO_DURATION = 3.5, BREATH_P_MAX = 0.06, BREATH_PERIOD = 6;
let introDone = false;
// smoothed fold values so discrete seals glide instead of clicking
let visP = 0;
const visHept = Object.fromEntries(AXIS_ORDER.map((a) => [a, 0]));

// ---- game state (mutable; reset replaces it) -----------------------------
let game = createGame(SLOTS, AXIS_ORDER);

// ---- params (dev controls) ----------------------------------------------
const params = { thetaMax: 70, twist: 138, breathe: 0.05, spin: 0.18, star: true, starSize: 1.0, coreSpiral: true, reduced: false, manual: false, manualP: 0, focus: false, starMode: 'facet' };
star.setMode(params.starMode);
star.setSize(params.starSize);

// ---- controls + inspect --------------------------------------------------
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.06;
const ndc = new THREE.Vector2();
function onTap(e) {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(Object.values(board.nodeBySlot), false);
  if (hits.length) openInspect(hits[0].object.userData.slot);
}
const controls = createControls(canvas, camera, params, onTap);

// hover tooltip on the territory nodes (same info the Map carries)
const tip = $('tip');
canvas.addEventListener('pointermove', (e) => {
  if (e.buttons !== 0) { tip.classList.remove('show'); return; }
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(Object.values(board.nodeBySlot), false);
  if (hits.length) {
    const s = hits[0].object.userData.slot;
    const g = getGame(activeGame);
    const cls = (g.classLabels && g.classLabels[s.personaClass]) || s.personaClass.replace('_', ' ');
    const role = (g.roles && g.roles[s.slotId]) || s.role;
    tip.innerHTML = `<b>${g.axisLabels[s.axisId] || s.axisId} ${AXIS_GLYPH[s.axisId] || ''}</b> · ${cls}<br><span class="d">${role} · ${game.state[s.slotId]}</span>`;
    tip.style.left = e.clientX + 14 + 'px';
    tip.style.top = e.clientY + 14 + 'px';
    tip.classList.add('show');
    canvas.style.cursor = 'pointer';
  } else {
    tip.classList.remove('show');
    canvas.style.cursor = '';
  }
});

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ---- render loop ---------------------------------------------------------
const clock = new THREE.Clock();
let frames = 0;
const diag = $('diag');
const latentCopy = $('latentcopy');
const gl = renderer.getContext();
const glInfo = gl ? 'webgl ok' : 'NO WEBGL';
function tick() {
  try {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    controls.update(dt);

    // decide the fold TARGET: manual / live game / latent (intro flourish or breath)
    const live = params.manual || AXIS_ORDER.some((a) => game.ignited[a]);
    const latentMode = !live;
    let targetTwist, targetHept, latentRest = false;
    if (params.manual) {
      targetTwist = params.manualP; targetHept = () => params.manualP;
    } else if (live) {
      targetTwist = game.p(); targetHept = (a) => game.heptadFold(a);
    } else if (params.reduced) {
      introDone = true; targetTwist = 0; targetHept = () => 0; latentRest = true;
    } else if (!introDone && t < INTRO_DURATION) {
      const pB = Math.sin(Math.PI * (t / INTRO_DURATION)); // flat -> star -> flat, once
      targetTwist = pB; targetHept = () => pB;
    } else {
      introDone = true;
      const pB = BREATH_P_MAX * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / BREATH_PERIOD));
      targetTwist = pB; targetHept = () => pB; latentRest = true;
    }

    // smooth toward the target so seals glide (no gear-clicking)
    const sm = Math.min(1, dt * 3);
    visP += (targetTwist - visP) * sm;
    for (const a of AXIS_ORDER) visHept[a] += (targetHept(a) - visHept[a]) * sm;
    const pTwist = visP;
    const heptadFold = (a) => visHept[a];

    board.layout({ pTwist, heptadFold, thetaMaxDeg: params.thetaMax, twistDeg: params.twist, bob: params.reduced ? 0 : 0.05, t, reduced: params.reduced });
    updateVisuals(board, game, t, params);
    star.group.visible = params.star;
    star.update(pTwist, t, params.reduced, dt, latentRest);

    // core spiral: keystone-hexad dancing in/out of centre (radial breathe × swirl)
    coreSpiral.visible = params.coreSpiral;
    if (params.coreSpiral) {
      const ang = params.reduced ? 0 : t * 0.4;
      const cp = coreLineGeo.attributes.position;
      const fp = coreFlowGeo.attributes.position;
      let totalEngage = 0;
      for (let i = 0; i < AXIS_ORDER.length; i++) {
        const a = AXIS_ORDER[i];
        const kp = board.ringByAxis[a].position;
        const s = params.reduced ? 0.5 : 0.5 - 0.5 * Math.cos(t * 0.6 + i * Math.PI / 3);
        _cv.copy(kp).multiplyScalar(s).applyAxisAngle(ZAXIS, ang);
        coreMarks[i].position.copy(_cv);
        coreMarks[i].material.opacity = 0.45 + 0.5 * Math.abs(Math.sin(t * 0.6 + i * Math.PI / 3));
        cp.setXYZ(i * 2, 0, 0, 0);
        cp.setXYZ(i * 2 + 1, _cv.x, _cv.y, _cv.z);
        // companion: the lead advisor flows in with its guide to share understanding
        const engage = Math.max(0, 1 - s * 1.4); // high when the guide is near centre
        totalEngage += engage;
        const lead = board.nodeBySlot[leadByAxis[a]].position;
        fp.setXYZ(i * 2, lead.x, lead.y, lead.z);
        fp.setXYZ(i * 2 + 1, 0, 0, 0);
        const u = params.reduced ? 0.5 : (t * 0.5 + i / AXIS_ORDER.length) % 1;
        _cv2.copy(lead).multiplyScalar(1 - u);
        coreComp[i].position.copy(_cv2);
        coreComp[i].material.opacity = 0.15 + 0.7 * engage;
      }
      cp.needsUpdate = true;
      fp.needsUpdate = true;
      const e = totalEngage / AXIS_ORDER.length;
      coreFlow.material.opacity = 0.06 + 0.18 * e;
      const pulse = params.reduced ? 1 : 0.6 + 0.4 * Math.sin(t * 2.2);
      shareGlow.material.opacity = (0.08 + 0.6 * e) * pulse;
      shareGlow.scale.setScalar(1 + 1.4 * e);
    }

    // latent extras: seed pulse, ignition threads, one warm root, the call to act
    const tp = threads.geometry.attributes.position;
    let ti = 0;
    for (const a of AXIS_ORDER) { const r = board.ringByAxis[a].position; tp.setXYZ(ti++, 0, 0, 0); tp.setXYZ(ti++, r.x, r.y, r.z); }
    tp.needsUpdate = true;
    if (latentMode) {
      const pulse = params.reduced ? 0.7 : 0.55 + 0.4 * Math.sin(t * 1.5);
      seed.material.opacity = pulse; seed.visible = true;
      threads.material.opacity = params.reduced ? 0.22 : 0.16 + 0.12 * Math.sin(t * 1.5); threads.visible = true;
      const first = AXIS_ORDER.find((a) => !game.ignited[a]);
      for (const a of AXIS_ORDER) board.ringByAxis[a].material.opacity = a === first ? 0.9 + 0.1 * Math.sin(t * 2) : 0.5;
      latentCopy.classList.add('show');
    } else {
      seed.visible = false; threads.visible = false;
      for (const a of AXIS_ORDER) board.ringByAxis[a].material.opacity = 0.9;
      latentCopy.classList.remove('show');
    }

    // self-links: star ↔ protection (sword) + delegation (mage)
    selfLinks.visible = params.star;
    if (params.star) {
      const pp = board.ringByAxis['protection'].position, dp = board.ringByAxis['delegation'].position;
      const sp = selfGeo.attributes.position, sc = selfGeo.attributes.color;
      sp.setXYZ(0, 0, 0, 0); sp.setXYZ(1, pp.x, pp.y, pp.z);
      sp.setXYZ(2, 0, 0, 0); sp.setXYZ(3, dp.x, dp.y, dp.z);
      sp.needsUpdate = true;
      _swC.set(theme.sword); _mgC.set(theme.mage);
      sc.setXYZ(0, _swC.r, _swC.g, _swC.b); sc.setXYZ(1, _swC.r, _swC.g, _swC.b);
      sc.setXYZ(2, _mgC.r, _mgC.g, _mgC.b); sc.setXYZ(3, _mgC.r, _mgC.g, _mgC.b);
      sc.needsUpdate = true;
    }

    const breathe = params.reduced ? 1 : 1 + params.breathe * Math.sin(t * 0.6);
    worldGroup.scale.setScalar(breathe);
    worldGroup.position.y = params.reduced ? 0 : 0.12 * Math.sin(t * 0.5);
    renderer.render(scene, camera);
    if ((frames++ & 31) === 0) diag.textContent = `${glInfo} · 42 nodes · ${latentMode ? 'latent' : 'p ' + pTwist.toFixed(2)} · f${frames}`;
    requestAnimationFrame(tick);
  } catch (err) {
    window.__gerr && window.__gerr('render loop: ' + (err && err.stack || err));
    throw err;
  }
}
tick();

// ---- HUD -----------------------------------------------------------------
function updateHUD() {
  $('sP').textContent = game.p().toFixed(2);
  $('sSealed').textContent = `${game.sealedCount()} / 42`;
  const locked = AXIS_ORDER.filter((a) => game.heptadPhase(a) === 'locked').length;
  $('sHept').textContent = `${locked} / 6`;
  const bp = game.boardPhase();
  $('sBoard').textContent = `${bp} · ${BOARD_GRAPH[bp]}`;
  $('sSeal').textContent = game.groupSeal ? game.groupSeal.slice(0, 32) + '…' : '—';
}

// ---- driver: step / auto-play -------------------------------------------
let busy = false;
async function stepOnce() {
  if (busy) return false;
  busy = true;
  try {
    const order = getGame(activeGame).igniteOrder;
    const act = nextAction(game, order);
    if (!act) return false;
    if (act.type === 'TASK_VERIFY') {
      const k = await kappaLabel(demoVRC(act._needsKappa));
      game.dispatch({ type: 'TASK_VERIFY', slotId: act.slotId, kappaLabel: k });
    } else {
      game.dispatch(act);
    }
    updateHUD();
    if (!nextAction(game, order) && !game.groupSeal) await finalizeSeal();
    return true;
  } finally {
    busy = false;
  }
}

async function runToSlot(slot) {
  if (!slot) return;
  let guard = 0;
  while (guard++ < 400) {
    if (game.state[slot.slotId] === 'sealed') break;
    const moved = await stepOnce();
    if (!moved) break;
  }
  updateHUD();
  toast('ran to ' + slot.slotId);
}

let playing = false, timer = null;
function play() {
  if (playing) return stopPlay();
  playing = true;
  $('bPlay').innerHTML = '&#10073;&#10073; Pause';
  const loop = async () => {
    if (!playing) return;
    const moved = await stepOnce();
    if (!moved) return stopPlay();
    timer = setTimeout(loop, 120);
  };
  loop();
}
function stopPlay() {
  playing = false;
  clearTimeout(timer);
  $('bPlay').innerHTML = '&#9654; Auto-play';
}

async function finalizeSeal() {
  const labels = SLOTS.map((s) => game.kappa[s.slotId]).filter(Boolean);
  if (labels.length !== 42) {
    toast(`seal needs 42 labels, have ${labels.length}`);
    return;
  }
  const gh = await geometryHash(board.snapshotAtP1(params.thetaMax, params.twist));
  const seal = await groupSeal(labels, gh);
  game.setGroupSeal(seal);
  updateHUD();
  toast('game sealed · ' + seal.slice(0, 12) + '…');
}

// ---- carry: save / load PNG ---------------------------------------------
function currentCfg() {
  return {
    version: 1,
    kind: 'game-of-42',
    name: 'game of 42',
    savedAt: new Date().toISOString(),
    inscription: '(⚔️⊥⿻⊥🧙)😊',
    preset: activeGame,
    seal: game.groupSeal || null,
    p: game.p(),
    log: game.log,
  };
}
async function savePNG() {
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  const cfg = currentCfg();
  // If the board is sealed, also carry a soulbis City Key projection in a second
  // 'cityKey' tEXt chunk, so the SAME png rises as a star in /skye (and imports on
  // /star, /lattice, /sigil). The game42 log chunk is untouched; each reader greps
  // its own keyword. Only the stable seam {seal, locked axes, count} is projected.
  const extras = [];
  if (game.groupSeal) {
    const city = game42ToCityKey(game, { preset: activeGame, seal: game.groupSeal, savedAt: cfg.savedAt });
    city.kappa = await kappaCity(city);
    extras.push({ keyword: 'cityKey', cfg: city });
  }
  const blob = pngEmbed(url, cfg, extras);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'game-of-42' + (game.groupSeal ? '-' + game.groupSeal.slice(0, 8) : '') + '.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('saved · ' + a.download);
}
function loadCfg(cfg) {
  if (!cfg || !Array.isArray(cfg.log)) {
    toast('no game42 log in this file');
    return;
  }
  stopPlay();
  game = createGame(SLOTS, AXIS_ORDER);
  for (const ev of cfg.log) game.dispatch(ev);
  if (cfg.seal) game.setGroupSeal(cfg.seal);
  if (cfg.preset && GAMES[cfg.preset]) applyPreset(cfg.preset);
  updateHUD();
  toast('loaded · ' + cfg.log.length + ' events' + (cfg.seal ? ' · sealed' : ''));
}

function reset() {
  stopPlay();
  game = createGame(SLOTS, AXIS_ORDER);
  updateHUD();
  toast('reset · empty board');
}
function igniteAll() {
  for (const a of AXIS_ORDER) game.dispatch({ type: 'ROOT_IGNITE', axisId: a });
  updateHUD();
  toast('six roots ignited');
}

// ---- toast ---------------------------------------------------------------
let toastT;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2400);
}

// ---- wire dev panel ------------------------------------------------------
$('bIgnite').addEventListener('click', igniteAll);
$('bStep').addEventListener('click', () => stepOnce());
$('bPlay').addEventListener('click', play);
$('bReset').addEventListener('click', reset);
$('bSave').addEventListener('click', savePNG);
$('bLoad').addEventListener('click', () => $('fLoad').click());
$('fLoad').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (f) readKeyFile(f, loadCfg, () => toast('could not read file'));
  e.target.value = '';
});

function bindSlider(id, key, fmt) {
  const el = $(id), lab = $(id + 'v');
  el.value = params[key];
  lab.textContent = fmt(params[key]);
  el.addEventListener('input', () => {
    params[key] = parseFloat(el.value);
    lab.textContent = fmt(params[key]);
  });
}
bindSlider('rP', 'manualP', (v) => v.toFixed(2));
bindSlider('rTheta', 'thetaMax', (v) => String(v | 0));
bindSlider('rTwist', 'twist', (v) => String(v | 0));
bindSlider('rBreathe', 'breathe', (v) => v.toFixed(2));
bindSlider('rSpin', 'spin', (v) => v.toFixed(2));
(function () {
  const el = $('rStarSize'), lab = $('rStarSizev');
  el.value = params.starSize; lab.textContent = params.starSize.toFixed(2);
  el.addEventListener('input', () => { params.starSize = parseFloat(el.value); lab.textContent = params.starSize.toFixed(2); star.setSize(params.starSize); });
})();
$('tStar').addEventListener('change', (e) => (params.star = e.target.checked));
$('tCore').addEventListener('change', (e) => (params.coreSpiral = e.target.checked));
$('tReduce').addEventListener('change', (e) => (params.reduced = e.target.checked));
$('tManual').addEventListener('change', (e) => (params.manual = e.target.checked));
$('bFold').addEventListener('click', () => { $('console').classList.add('folded'); $('launcher').classList.add('show'); });
$('launcher').addEventListener('click', () => { $('console').classList.remove('folded'); $('launcher').classList.remove('show'); });

// ---- node inspector ------------------------------------------------------
let inspSlot = null;
function openInspect(s) {
  inspSlot = s;
  $('inspTitle').textContent = s.slotId;
  const force = AXIS_GLYPH[s.axisId] ? ' ' + AXIS_GLYPH[s.axisId] : '';
  const ground = s.faculty.map((f) => (TRIAD.find((t) => t.faculty === f) || {}).ground).join('+');
  $('inspMeta').innerHTML =
    `<b>${s.role}</b> · ${s.personaClass.replace('_', ' ')}<br>` +
    `axis <b>${s.axisId}${force}</b> · template <b>${s.personaTemplate}</b><br>` +
    `state <b>${game.state[s.slotId]}</b> · fill #${s.fillOrder}` +
    `<div><span class="chip">${s.faculty.join('+')}</span><span class="chip">${ground}</span>` +
    `<span class="chip">lattice v${s.latticeAxisVertex}</span></div>` +
    `<button id="iRun" style="margin-top:8px;width:100%">&#9654; run to here</button>`;
  const rb = $('iRun');
  if (rb) rb.addEventListener('click', () => runToSlot(s));
  const [h, he, ha] = s.barycentric;
  $('iHead').value = h; $('iHeadv').textContent = h.toFixed(2);
  $('iHeart').value = he; $('iHeartv').textContent = he.toFixed(2);
  $('iHands').value = ha; $('iHandsv').textContent = ha.toFixed(2);
  $('inspect').classList.add('show');
}
function editFaculty() {
  if (!inspSlot) return;
  let h = parseFloat($('iHead').value), he = parseFloat($('iHeart').value), ha = parseFloat($('iHands').value);
  const sum = h + he + ha || 1;
  inspSlot.barycentric = [h / sum, he / sum, ha / sum];
  $('iHeadv').textContent = (h / sum).toFixed(2);
  $('iHeartv').textContent = (he / sum).toFixed(2);
  $('iHandsv').textContent = (ha / sum).toFixed(2);
  board.applyTheme();
}
['iHead', 'iHeart', 'iHands'].forEach((id) => $(id).addEventListener('input', editFaculty));
$('inspClose').addEventListener('click', () => { $('inspect').classList.remove('show'); inspSlot = null; });

// ---- colour customisation ------------------------------------------------
function setGround(hex) { document.documentElement.style.setProperty('--bg', hex); }
function bindColor(id, key) {
  const el = $(id);
  el.value = theme[key];
  el.addEventListener('input', () => {
    theme[key] = el.value;
    if (key === 'ground') setGround(el.value);
    board.applyTheme();
  });
}
bindColor('cSword', 'sword');
bindColor('cMage', 'mage');
bindColor('cHead', 'head');
bindColor('cHeart', 'heart');
bindColor('cHands', 'hands');
bindColor('cGround', 'ground');
setGround(theme.ground);
(function () {
  const el = $('rTint'), lab = $('rTintv');
  el.value = theme.facultyTint; lab.textContent = theme.facultyTint.toFixed(2);
  el.addEventListener('input', () => { theme.facultyTint = parseFloat(el.value); lab.textContent = theme.facultyTint.toFixed(2); board.applyTheme(); });
})();
$('cReset').addEventListener('click', () => {
  Object.assign(theme, JSON.parse(JSON.stringify(THEME_DEFAULTS)));
  $('cSword').value = theme.sword; $('cMage').value = theme.mage; $('cHead').value = theme.head;
  $('cHeart').value = theme.heart; $('cHands').value = theme.hands; $('cGround').value = theme.ground;
  $('rTint').value = theme.facultyTint; $('rTintv').textContent = theme.facultyTint.toFixed(2);
  setGround(theme.ground); board.applyTheme(); toast('colours reset');
});

// ---- game presets (the three vocabularies) ------------------------------
let activeGame = loadPreset();
function applyPreset(id) {
  activeGame = id;
  const g = getGame(id);
  board.relabelRoots(g);
  board.setAccent(g.accent);
  savePreset(id);
  $('presetTag').innerHTML = `${g.glyph} <b style="color:var(--ink)">${g.name}</b> — ${g.tagline}`;
  document.querySelectorAll('#preset button').forEach((b) => b.classList.toggle('on', b.dataset.g === id));
}
document.querySelectorAll('#preset button').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.g)));
applyPreset(activeGame);

// axis legend with the four-force glyphs
$('legendAxis').innerHTML = AXIS_ORDER.map((a) => {
  const ax = AXIS_BY_ID[a];
  const force = AXIS_GLYPH[a] ? ' ' + AXIS_GLYPH[a] : '';
  return `<span><i style="background:${ax.colour}"></i>${a}${force}</span>`;
}).join('');

// triad legend (the head·soil / heart·soul / hands·society corners — once, not 18×)
$('legendTriad').innerHTML = TRIAD.map(
  (t) => `<span><i style="background:${theme[t.key]}"></i>${t.faculty}&middot;${t.ground}</span>`
).join('');

// ---- star surface/wire/normal mode --------------------------------------
$('starMode').querySelectorAll('button').forEach((b) => {
  b.addEventListener('click', () => {
    $('starMode').querySelectorAll('button').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    params.starMode = b.dataset.m;
    star.setMode(params.starMode);
  });
});

// ---- [f] focus mode (presentation orbit; chrome fades) ------------------
const focusBadge = $('focusbadge');
let badgeT;
function flashBadge(ms) { focusBadge.classList.add('show'); clearTimeout(badgeT); badgeT = setTimeout(() => focusBadge.classList.remove('show'), ms); }
function enterFocus() { params.focus = true; document.body.classList.add('focus'); flashBadge(2600); }
function exitFocus() { params.focus = false; document.body.classList.remove('focus'); focusBadge.classList.remove('show'); }
function toggleFocus() { params.focus ? exitFocus() : enterFocus(); }
$('bFocus').addEventListener('click', toggleFocus);
focusBadge.addEventListener('click', exitFocus);
document.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFocus(); }
  else if (e.key === 's' || e.key === 'S') { e.preventDefault(); savePNG(); }
  else if (e.key === 'Escape' && params.focus) exitFocus();
});
document.addEventListener('mousemove', () => { if (params.focus) flashBadge(1800); });

updateHUD();
