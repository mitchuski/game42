// map.js — the Map: a 2D plan + the step-by-step path, AND the editor where a
// hitchhiker turns the game of 42 into their own language ("mine"). Edits persist
// (localStorage) and the Territory + tooltips follow them.
import { SLOTS, SLOTS_BY_AXIS, AXIS_ORDER, AXIS_BY_ID } from './data.js';
import { getGame, loadCustom, saveCustom, loadPreset, savePreset } from './presets.js';
import { personaName, personaGlyph, MAGES_42 } from './personas.js';
import { pngExtract, pngEmbed } from './pngkey.js';
import { canonical, sha256hex } from './hash.js';
import { conformImport } from './conform.js';
import { fetchGame } from './fedwiki.js';

const MIRROR = { head: 'soil', heart: 'soul', hands: 'society' };
const FORCE = { protection: '⚔️', delegation: '🧙', memory: '🪞', connection: '🤝', compute: '⚡', value: '💎' };
const CLASS = {
  vision_fish: { c: '#38bdf8', label: 'vision fish' },
  mouse: { c: '#c9a227', label: 'mouse' },
  privacy_guide: { c: '#f5f0e1', label: 'privacy guide' },
};
const GRAPH = { seeded: 'knowledge graph', assembling: 'promise graph', sealed: 'trust graph' };
const axisColor = (id) => AXIS_BY_ID[id].colour;
const facMirror = (s) => s.faculty.map((f) => `${f}·${MIRROR[f]}`).join(' + ');
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const clsLabel = (g, c) => (g.classLabels && g.classLabels[c]) || CLASS[c].label;
const roleOf = (g, s) => (g.roles && g.roles[s.slotId]) || s.role;
function templateOf(g, s) {
  if (g.personaBySlot && g.personaBySlot[s.slotId]) { const k = g.personaBySlot[s.slotId]; return `${personaGlyph(k)} ${personaName(k)}`; }
  if (g.personas && g.personas[s.axisId]) {
    const k = g.personas[s.axisId][s.fillOrder - 1];
    if (k) return `${personaGlyph(k)} ${personaName(k)}`;
  }
  return s.personaTemplate;
}

let active = loadPreset();
const byId = Object.fromEntries(SLOTS.map((s) => [s.slotId, s]));

const glyphFor = (game, s) => {
  if (game.personaBySlot && game.personaBySlot[s.slotId]) return personaGlyph(game.personaBySlot[s.slotId]);
  if (game.personas && game.personas[s.axisId]) {
    const k = game.personas[s.axisId][s.fillOrder - 1];
    if (k) return personaGlyph(k);
  }
  return '';
};

let view = 'groups';
let numbering = 'local';
let selected = null; // slotId open in the right-panel node editor
let litNow = null; // transient run set; null => render from `locked`
const LOCKED_KEY = 'game42.locked';
let locked = (() => { try { return new Set(JSON.parse(localStorage.getItem(LOCKED_KEY) || '[]')); } catch (e) { return new Set(); } })();
const saveLocked = () => { try { localStorage.setItem(LOCKED_KEY, JSON.stringify([...locked])); } catch (e) {} };
const isLit = (s) => (litNow || locked).has(s.slotId);
const globalNo = (s) => AXIS_ORDER.indexOf(s.axisId) * 7 + s.fillOrder;
const GA = Math.PI * (3 - Math.sqrt(5));
// per-view {x,y} for every slot — "flick" the map between arrangements
function layout(v) {
  const P = {};
  if (v === 'spiral') {
    SLOTS.forEach((s, i) => { const r = 58 * Math.sqrt(i + 0.6), a = i * GA; P[s.slotId] = { x: r * Math.cos(a), y: r * Math.sin(a) }; });
  } else if (v === 'core') {
    // the six keystones form a central hexad; each heptad's other six fan outward
    AXIS_ORDER.forEach((ax, ai) => {
      const base = ai * Math.PI / 3, g = SLOTS_BY_AXIS[ax];
      const others = g.filter((s) => !s.isKeystone);
      g.forEach((s) => {
        if (s.isKeystone) P[s.slotId] = { x: 120 * Math.cos(base), y: 120 * Math.sin(base) };
        else { const k = others.indexOf(s), a = base + (k - 2.5) * 0.2; P[s.slotId] = { x: 330 * Math.cos(a), y: 330 * Math.sin(a) }; }
      });
    });
  } else {
    SLOTS.forEach((s) => { P[s.slotId] = { x: s.position2D.x, y: s.position2D.y }; });
  }
  return P;
}

// oblique 3D stella octangula (the sword/mage star — NOT the flat Star of David)
function stellaSVG() {
  const A = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  const B = [[-1, -1, -1], [-1, 1, 1], [1, -1, 1], [1, 1, -1]];
  const E = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], R = 58;
  const pr = (v) => [(v[0] + v[2] * 0.5) * R, -((v[1] + v[2] * 0.28) * R)];
  const draw = (T, col) => { const p = T.map(pr); return E.map(([a, b]) => `<line x1="${p[a][0].toFixed(1)}" y1="${p[a][1].toFixed(1)}" x2="${p[b][0].toFixed(1)}" y2="${p[b][1].toFixed(1)}" stroke="${col}" stroke-opacity=".5" stroke-width="2"/>`).join(''); };
  return draw(A, '#e0a526') + draw(B, '#2563eb');
}

function buildBoard(game) {
  const P = layout(view);
  const X = (s) => P[s.slotId].x, Y = (s) => -P[s.slotId].y;
  const accent = game.accent || '#8aa0d8';
  let svg = `<svg viewBox="-470 -470 940 940" role="img" aria-label="board plan">`;
  svg += `<defs><filter id="ng" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;

  // the sword/mage star at the centre — oblique stella, not a hexagram
  svg += stellaSVG();

  const keys = AXIS_ORDER.map((a) => SLOTS_BY_AXIS[a].find((s) => s.isKeystone));
  if (view !== 'spiral') svg += `<polygon points="${keys.map((k) => `${X(k)},${Y(k)}`).join(' ')}" fill="none" stroke="${accent}" stroke-opacity=".4" stroke-width="2"/>`;

  // spokes (keystone -> its stations) in every view; triangles only in groups
  for (const a of AXIS_ORDER) {
    const g = SLOTS_BY_AXIS[a];
    const key = g.find((s) => s.isKeystone);
    for (const s of g) if (s !== key) svg += `<line x1="${X(key)}" y1="${Y(key)}" x2="${X(s)}" y2="${Y(s)}" stroke="#33405e" stroke-opacity=".4" stroke-width="1.5"/>`;
    if (view === 'groups') {
      const corners = g.filter((s) => s.barycentric.includes(1));
      svg += `<path d="${corners.map((c, i) => `${i ? 'L' : 'M'}${X(c)},${Y(c)}`).join(' ')} Z" fill="none" stroke="${axisColor(a)}" stroke-opacity=".55" stroke-width="2"/>`;
    }
  }

  // glow halos — only lit (locked / running) stations
  svg += `<g filter="url(#ng)" opacity=".85">`;
  for (const s of SLOTS) if (isLit(s)) svg += `<circle cx="${X(s)}" cy="${Y(s)}" r="${(s.isKeystone ? 18 : 14) + 5}" fill="${axisColor(s.axisId)}"/>`;
  svg += `</g>`;

  // locked/lit nodes fill with their emoji; unlocked are dim drafts; selected ringed
  for (const s of SLOTS) {
    const cl = CLASS[s.personaClass], r = s.isKeystone ? 18 : 14;
    const lit = isLit(s), sel = selected === s.slotId;
    const emoji = glyphFor(game, s) || FORCE[s.axisId] || '';
    const num = numbering === 'global' ? globalNo(s) : s.fillOrder;
    if (s.isKeystone) svg += `<circle cx="${X(s)}" cy="${Y(s)}" r="${r + 5}" fill="none" stroke="#2563EB" stroke-width="2" stroke-opacity="${lit ? '.9' : '.4'}"/>`;
    svg += `<g class="nodec" data-slot="${s.slotId}" opacity="${lit ? '1' : '.6'}" style="cursor:pointer">`;
    svg += `<circle cx="${X(s)}" cy="${Y(s)}" r="${r}" fill="${axisColor(s.axisId)}" fill-opacity="${lit ? '1' : '.3'}" stroke="${sel ? '#ffffff' : cl.c}" stroke-width="${sel ? '3.5' : '2.5'}"/>`;
    if (lit) {
      svg += `<text x="${X(s)}" y="${Y(s)}" text-anchor="middle" dy=".34em" font-size="${s.isKeystone ? 19 : 15}">${emoji}</text>`;
      svg += `<text x="${X(s) + r - 1}" y="${Y(s) - r + 2}" text-anchor="middle" dy=".34em" font-size="9" font-weight="700" fill="#cfe0ff">${num}</text>`;
    } else {
      svg += `<text x="${X(s)}" y="${Y(s)}" text-anchor="middle" dy=".34em" font-size="12" font-weight="700" fill="#0b0e14">${num}</text>`;
    }
    svg += `</g>`;
  }

  for (const a of AXIS_ORDER) {
    const key = SLOTS_BY_AXIS[a].find((s) => s.isKeystone);
    const len = Math.hypot(X(key), Y(key)) || 1;
    const ox = (X(key) / len) * 96, oy = (Y(key) / len) * 96;
    svg += `<text x="${X(key) + ox}" y="${Y(key) + oy}" text-anchor="middle" dy=".34em" font-size="20" fill="#dfe6ff" font-family="Fraunces,Georgia,serif">${esc(game.axisLabels[a] || a)}${FORCE[a] ? ' ' + FORCE[a] : ''}</text>`;
  }
  return svg + `</svg>`;
}

function buildLegend(game) {
  const order = SLOTS_BY_AXIS[AXIS_ORDER[0]].slice().sort((a, b) => a.fillOrder - b.fillOrder);
  const rows = order.map((s) => {
    const cl = CLASS[s.personaClass];
    return `<tr><td>${s.fillOrder}</td><td>${s.faculty.join('+')}</td><td><span class="dot" style="background:${cl.c}"></span>${esc(clsLabel(game, s.personaClass))}</td><td>${esc(roleOf(game, s))}</td><td>${facMirror(s)}</td><td>${esc(templateOf(game, s))}</td></tr>`;
  }).join('');
  const phase = (arr) => `<div class="phase">${arr.map((x) => `<span>${x}</span>`).join('')}</div>`;
  const roots = AXIS_ORDER.map((a) => {
    const ax = AXIS_BY_ID[a];
    return `<div><span class="dot" style="background:${ax.colour}"></span><b>${esc(game.axisLabels[a] || a)}</b> ${FORCE[a] || ''} <span style="opacity:.6">(${a})</span> · ${esc(ax.axis)} · zk:${esc(ax.zkDimension)}${ax.agent ? ' · ' + esc(ax.agent) : ''}</div>`;
  }).join('');
  return `
    <div class="sec"><h2>${game.glyph || '◆'} ${esc(game.name)}</h2>
      <p style="color:var(--dim);margin:0">${esc(game.tagline)} — the same 42, in this game's voice.</p></div>
    <div class="sec"><h2>two graphs become a third</h2>${phase(Object.keys(GRAPH).map((k) => `${k} &middot; <b>${GRAPH[k]}</b>`))}
      <p class="prov">empty board = knowledge graph; the 42 VRC edges = promise graph; the sealed game = trust graph.</p></div>
    <div class="sec"><h2>each heptad, six phases</h2>${phase(['dormant', 'ignited', 'fishing', 'building', 'sealing', 'locked'])}
      <p class="prov">ignite the root → 3 head stations open → a verified lead opens 3 builders → all six verified opens the keystone → seven sealed locks the heptad.</p></div>
    <div class="sec"><h2>the seven stations, in fill order</h2>
      <table><thead><tr><th>#</th><th>faculty</th><th>class</th><th>role</th><th>faculty &middot; mirror</th><th>template</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="prov">head/heart/hands is also soil/soul/society — the same corners, mirrored.</p></div>
    <div class="sec"><h2>filling a slot</h2><ol class="steps">
      <li>a candidate completes a <b>trust task</b> with the root (RPP) — mints a proverb + polarity</li>
      <li>a passed task issues one <b>VRC edge</b> for that slot</li>
      <li>compressed to a <b>κ-label</b> = SHA-256 of its canonical form</li>
      <li>advances to <b>verified</b>, then <b>sealed</b></li></ol></div>
    <div class="sec"><h2>the seal</h2><p style="color:var(--dim)">all six heptads lock → the board folds (p→1). <b style="color:var(--ink)">group seal</b> = SHA-256 over the 42 κ-labels + the folded geometry hash. boundary encodes bulk.</p></div>
    <div class="sec"><h2>the six roots</h2><div class="roots">${roots}</div></div>
  `;
}

// share my42 as a PNG: a mini-board sigil with the whole custom game embedded,
// so someone else can Join it (the intro reads it back).
async function exportMine() {
  const c = loadCustom();
  c.kappa = 'sha256:' + (await sha256hex(canonical(c)));
  const cv = document.createElement('canvas'); cv.width = 360; cv.height = 360;
  const x = cv.getContext('2d');
  x.fillStyle = '#0b0e14'; x.fillRect(0, 0, 360, 360);
  for (const s of SLOTS) {
    x.beginPath();
    x.arc(180 + s.position2D.x * 0.34, 180 - s.position2D.y * 0.34, s.isKeystone ? 6 : 4, 0, Math.PI * 2);
    x.fillStyle = axisColor(s.axisId); x.fill();
  }
  x.fillStyle = '#dfe6ff'; x.font = '600 18px Georgia, serif'; x.textAlign = 'center';
  x.fillText(c.name || 'my42', 180, 26);
  x.fillStyle = '#8c95ad'; x.font = '10px ui-monospace, monospace';
  x.fillText('κ ' + c.kappa.replace('sha256:', '').slice(0, 28) + '…', 180, 346);
  const blob = pngEmbed(cv.toDataURL('image/png'), c); // keyword 'game42'
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (c.name || 'my42').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-game42.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// add the current my42 to the Grid as an artefact, ready to assign into a
// constellation's 42 (bridges Map -> Grid without leaving the board).
async function addMineToGrid(btn) {
  const c = loadCustom();
  const kappa = await sha256hex(canonical(c));
  let list = [];
  try { list = JSON.parse(localStorage.getItem('game42.grid') || '[]'); } catch (e) {}
  if (!list.some((x) => x.kappaRaw === kappa)) {
    list.push({ name: c.name || 'my42', kind: 'game', kappaRaw: kappa, prior: null, palette: null, mine: true, emoji: '✎', proverb: c.tagline || '' });
    localStorage.setItem('game42.grid', JSON.stringify(list));
    if (btn) btn.textContent = '✓ added to grid';
  } else if (btn) btn.textContent = '✓ already in grid';
}

function buildEditor(c) {
  const ed = document.getElementById('editor');
  ed.style.display = '';
  ed.innerHTML =
    `<h2>&#9998; my42</h2>` +
    `<label>name</label><input id="eName" value="${esc(c.name)}">` +
    `<label>tagline</label><input id="eTag" value="${esc(c.tagline)}">` +
    `<label>the six roots — your words</label>` +
    AXIS_ORDER.map((a) => `<div class="row2"><span>${a} ${FORCE[a] || ''}</span><input data-ax="${a}" value="${esc(c.axisLabels[a] || '')}"></div>`).join('') +
    `<p style="color:var(--dim);font-size:10.5px;margin-top:10px">click a station to build it — pick its persona (6 axes &rarr; 42), write its role &amp; info, or attach a key/json; <b>add to run</b> to light it. Saved automatically; the Territory follows your words.</p>` +
    `<button id="eShare">📤 share my42 (export)</button>` +
    `<button id="eGrid">➕ add to my grid</button>`;

  const save = () => saveCustom(c);
  ed.querySelector('#eName').addEventListener('input', (e) => { c.name = e.target.value; save(); refreshViews(c); });
  ed.querySelector('#eTag').addEventListener('input', (e) => { c.tagline = e.target.value; save(); refreshViews(c); });
  ed.querySelectorAll('[data-ax]').forEach((inp) => inp.addEventListener('input', () => { c.axisLabels[inp.dataset.ax] = inp.value; save(); refreshViews(c); }));
  ed.querySelector('#eShare').addEventListener('click', exportMine);
  ed.querySelector('#eGrid').addEventListener('click', (e) => addMineToGrid(e.target));
}

const nodeEditor = document.getElementById('nodeEditor');

// The six lead slots (fillOrder 1 of each axis) — the tutorial's "first six roots".
const LEAD_SLOTS = AXIS_ORDER.map((a) => SLOTS_BY_AXIS[a].find((s) => s.fillOrder === 1)).filter(Boolean);

// On-board tutorial: guide my42 through its six roots, then release to freeflow.
// (The per-node "what's important here?" prompt + lock already live in the editor.)
function renderTutor() {
  const el = document.getElementById('tutor');
  if (!el) return;
  if (active !== 'mine') { el.style.display = 'none'; return; }
  el.style.display = '';
  const done = LEAD_SLOTS.filter((s) => locked.has(s.slotId)).length;
  const next = LEAD_SLOTS.find((s) => !locked.has(s.slotId));
  if (next) {
    const g = getGame('mine');
    const axisLabel = (g.axisLabels && g.axisLabels[next.axisId]) || next.axisId;
    el.innerHTML =
      `<b>tutorial</b> · fill your six roots — <b>${done}/6</b> · ` +
      `next: <a href="#" data-slot="${next.slotId}" style="color:var(--accent)">the ${esc(axisLabel)} root &rarr;</a> ` +
      `<span style="color:var(--dim)">click it, say what's important, lock it</span>`;
    const a = el.querySelector('a[data-slot]');
    if (a) a.addEventListener('click', (e) => { e.preventDefault(); selected = next.slotId; reboard(); renderNodeEditor(); });
  } else {
    el.innerHTML =
      `<b>tutorial</b> · your six roots are set &#10003; &mdash; <b>freeflow</b>: fill any slot in any order; ` +
      `the board seals when all six heptads lock.`;
  }
}

function reboard() {
  const g = getGame(active);
  document.getElementById('board').innerHTML = buildBoard(g);
  attachHandlers(g);
  renderTutor();
}
function attachHandlers() {
  document.querySelectorAll('.nodec').forEach((gEl) => {
    gEl.addEventListener('click', () => { selected = gEl.dataset.slot; reboard(); renderNodeEditor(); });
  });
}
function refreshViews(game) {
  document.getElementById('board').innerHTML = buildBoard(game);
  document.getElementById('legend').innerHTML = buildLegend(game);
  attachHandlers();
  renderNodeEditor();
  renderTutor();
}

function renderNodeEditor() {
  if (!selected) { nodeEditor.style.display = 'none'; return; }
  const game = getGame(active), s = byId[selected];
  if (!s) { nodeEditor.style.display = 'none'; return; }
  nodeEditor.style.display = '';
  const cl = CLASS[s.personaClass];
  const lk = locked.has(s.slotId);
  const c = active === 'mine' ? loadCustom() : null;
  const keyAt = c && c.keyBySlot ? c.keyBySlot[s.slotId] : null;
  const keyChip = keyAt ? `<span class="chip">🗝️ ${esc(keyAt.name)} · ${esc((keyAt.kappa || '').slice(0, 8))}</span>` : '';
  let h = `<h2>node &middot; ${esc(s.slotId)}</h2>` +
    `<div class="imeta"><span class="dot" style="background:${cl.c}"></span>${esc(clsLabel(game, s.personaClass))} &middot; <b>${esc(templateOf(game, s))}</b><br>` +
    `axis <b>${esc(game.axisLabels[s.axisId] || s.axisId)}</b> ${FORCE[s.axisId] || ''} <span style="opacity:.6">(${s.axisId})</span> &middot; fill #${s.fillOrder} &middot; v${s.latticeAxisVertex}` +
    `<div><span class="chip">${s.faculty.join('+')}</span><span class="chip">${facMirror(s)}</span><span class="chip">${lk ? '🔒 in run' : '🔓 draft'}</span>${keyChip}</div></div>` +
    `<button id="nLock">${lk ? '🔒 in run — click to remove' : '➕ add to run'}</button>`;
  if (active === 'mine') {
    const cur = (c.personaBySlot || {})[s.slotId] || '';
    const opts = AXIS_ORDER.map((ax) => `<optgroup label="${ax}">` + MAGES_42[ax].map((k) => `<option value="${k}"${k === cur ? ' selected' : ''}>${personaGlyph(k)} ${personaName(k)}</option>`).join('') + `</optgroup>`).join('');
    h += `<select id="ePersona"><option value="">&mdash; pick persona (6 &rarr; 42) &mdash;</option>${opts}</select>` +
      `<input id="eRole" placeholder="role in your words" value="${esc(roleOf(game, s))}">` +
      `<textarea id="eInfo" placeholder="information held at this node…">${esc((c.infoBySlot || {})[s.slotId] || '')}</textarea>` +
      `<div style="display:flex;gap:6px;flex-wrap:wrap"><button id="eKeyBtn">${keyAt ? 'replace' : 'attach'} key / json</button>${keyAt ? '<button id="eKeyClear">clear key</button>' : ''}</div>` +
      `<input id="eKeyFile" type="file" accept="image/png,application/json" style="display:none">`;
  } else {
    h += `<div style="margin-top:6px;color:var(--ink)"><b>${esc(roleOf(game, s))}</b></div>`;
  }
  nodeEditor.innerHTML = h;

  nodeEditor.querySelector('#nLock').addEventListener('click', () => {
    if (locked.has(s.slotId)) locked.delete(s.slotId); else locked.add(s.slotId);
    saveLocked(); reboard(); renderNodeEditor();
  });
  if (active === 'mine') {
    nodeEditor.querySelector('#ePersona').addEventListener('change', (e) => { const cc = loadCustom(); cc.personaBySlot = cc.personaBySlot || {}; if (e.target.value) cc.personaBySlot[s.slotId] = e.target.value; else delete cc.personaBySlot[s.slotId]; saveCustom(cc); reboard(); renderNodeEditor(); });
    nodeEditor.querySelector('#eRole').addEventListener('input', (e) => { const cc = loadCustom(); cc.roles = cc.roles || {}; cc.roles[s.slotId] = e.target.value; saveCustom(cc); document.getElementById('legend').innerHTML = buildLegend(getGame('mine')); });
    nodeEditor.querySelector('#eInfo').addEventListener('input', (e) => { const cc = loadCustom(); cc.infoBySlot = cc.infoBySlot || {}; cc.infoBySlot[s.slotId] = e.target.value; saveCustom(cc); });
    nodeEditor.querySelector('#eKeyBtn').addEventListener('click', () => nodeEditor.querySelector('#eKeyFile').click());
    nodeEditor.querySelector('#eKeyFile').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = async () => {
        let cfg = null;
        try { cfg = pngExtract(r.result, 'cityKey') || pngExtract(r.result, 'game42'); if (!cfg) cfg = JSON.parse(new TextDecoder().decode(r.result)); } catch (x) { cfg = null; }
        if (!cfg || typeof cfg !== 'object') return;
        let kappa = cfg.kappa || cfg.seal || '';
        if (!kappa) kappa = 'sha256:' + (await sha256hex(canonical(cfg)));
        const cc = loadCustom(); cc.keyBySlot = cc.keyBySlot || {};
        cc.keyBySlot[s.slotId] = { name: cfg.name || f.name.replace(/\.[a-z]+$/i, ''), kappa: String(kappa).replace('sha256:', '') };
        saveCustom(cc); reboard(); renderNodeEditor();
      };
      r.readAsArrayBuffer(f); e.target.value = '';
    });
    const clr = nodeEditor.querySelector('#eKeyClear');
    if (clr) clr.addEventListener('click', () => { const cc = loadCustom(); if (cc.keyBySlot) delete cc.keyBySlot[s.slotId]; saveCustom(cc); reboard(); renderNodeEditor(); });
  }
}

function render() {
  if (active === 'mine') buildEditor(loadCustom());
  else document.getElementById('editor').style.display = 'none';
  refreshViews(getGame(active));
  document.querySelectorAll('#preset button').forEach((b) => b.classList.toggle('on', b.dataset.g === active));
}

document.querySelectorAll('#preset button').forEach((b) =>
  b.addEventListener('click', () => { active = b.dataset.g; savePreset(active); selected = null; render(); })
);
document.querySelectorAll('#view button').forEach((b) =>
  b.addEventListener('click', () => { view = b.dataset.v; document.querySelectorAll('#view button').forEach((x) => x.classList.toggle('on', x.dataset.v === view)); refreshViews(getGame(active)); })
);
document.querySelectorAll('#numbering button').forEach((b) =>
  b.addEventListener('click', () => { numbering = b.dataset.n; document.querySelectorAll('#numbering button').forEach((x) => x.classList.toggle('on', x.dataset.n === numbering)); refreshViews(getGame(active)); })
);
let runTimers = [];
function stopRun() { runTimers.forEach(clearTimeout); runTimers = []; litNow = null; }
function runLight() {
  stopRun();
  // nothing locked yet → lock & light all 42 (lock a subset first to curate)
  if (!locked.size) { SLOTS.forEach((s) => locked.add(s.slotId)); saveLocked(); }
  litNow = new Set(); reboard();
  const ord = [...locked].map((id) => byId[id]).filter(Boolean).sort((a, b) => globalNo(a) - globalNo(b));
  ord.forEach((s, i) => runTimers.push(setTimeout(() => { litNow.add(s.slotId); reboard(); }, i * 120)));
  runTimers.push(setTimeout(() => { litNow = null; reboard(); renderNodeEditor(); }, ord.length * 120 + 250));
}
document.getElementById('runFills').addEventListener('click', runLight);
document.getElementById('clearFills').addEventListener('click', () => { stopRun(); locked.clear(); saveLocked(); selected = null; render(); });
render();

// ---- intro / login flow: start your own or join, then onto the board ------
const INTRO = [
  { k: 'the game of 42', t: 'A shared key to understanding', b: 'Six home bases each grow a heptad of seven — six × seven = forty-two governance positions. Filling them builds one group identity you can carry.' },
  { k: 'six roots', t: 'The six axes', b: 'compute · connection · delegation · protection · memory · value — the six dimensions of the privacy value model. Each is a heptad you grow.' },
  { k: 'seven stations', t: 'head · heart · hands', b: 'Each heptad is the seven non-empty mixes of head / heart / hands (also soil / soul / society): three advisors, three builders, one keystone guide.' },
  { k: 'three callings', t: 'fish · mice · guide', b: '🐟 vision fish scout the questions, 🐭 mice build the answers, 🧙 the privacy guide closes the heptad and holds the seed.' },
  { k: 'fill & fold', t: 'Trust → seal', b: 'Each slot fills by a trust task → a relationship credential → a κ. When all six heptads lock, the board folds into your star and seals into one shareable key.' },
  { k: 'your game', t: 'Edit it into your language', b: 'Build each node — persona, role, info, even an imported key — then watch it fold on the territory, and meet other games on the constellation and grid.' },
];
const introWrap = document.getElementById('intro');
const introCard = document.getElementById('introCard');
let learnIdx = 0;

function introDone() { introWrap.classList.remove('show'); try { localStorage.setItem('game42.intro.seen', '1'); } catch (e) {} }
function enterBoard() { active = 'mine'; savePreset('mine'); selected = null; introDone(); render(); }

function renderSplash() {
  introCard.innerHTML =
    `<div class="kick">the game of 42</div><h2>Start your game</h2>` +
    `<p>Six home bases. Forty-two roles. One shared key. Begin your own game — or join one already in play.</p>` +
    `<div class="big"><button id="iStart" class="go">⚔️ Start your own</button><button id="iJoin">🤝 Join a game</button></div>` +
    `<div class="muted" id="iLearn">how it works →</div>`;
  introCard.querySelector('#iStart').addEventListener('click', renderCreate);
  introCard.querySelector('#iJoin').addEventListener('click', renderJoin);
  introCard.querySelector('#iLearn').addEventListener('click', () => { learnIdx = 0; renderLearn(); });
}

function renderLearn() {
  const s = INTRO[learnIdx];
  introCard.innerHTML =
    `<div class="kick">${esc(s.k)}</div><h2>${esc(s.t)}</h2><p>${esc(s.b)}</p>` +
    `<div class="introdots">${INTRO.map((_, i) => `<i class="${i === learnIdx ? 'on' : ''}"></i>`).join('')}</div>` +
    `<div class="introbtns"><button id="iLback">back</button><span style="flex:1"></span><button id="iLnext" class="go">${learnIdx === INTRO.length - 1 ? 'start' : 'next'}</button></div>`;
  introCard.querySelector('#iLback').addEventListener('click', () => { if (learnIdx > 0) { learnIdx--; renderLearn(); } else renderSplash(); });
  introCard.querySelector('#iLnext').addEventListener('click', () => { if (learnIdx < INTRO.length - 1) { learnIdx++; renderLearn(); } else renderCreate(); });
}

function renderCreate() {
  const c = loadCustom();
  introCard.innerHTML =
    `<div class="kick">start your own</div><h2>Name your game</h2>` +
    `<label>your game</label><input id="cName" value="${esc(c.name)}" placeholder="my42">` +
    `<label>your six home bases — the team</label>` +
    `<div class="rootgrid">${AXIS_ORDER.map((a) => `<input data-r="${a}" value="${esc(c.axisLabels[a] || a)}" placeholder="${a}">`).join('')}</div>` +
    `<div class="introbtns" style="margin-top:16px"><button id="cBack">back</button><span style="flex:1"></span><button id="cGo" class="go">enter the board →</button></div>`;
  introCard.querySelector('#cBack').addEventListener('click', renderSplash);
  introCard.querySelector('#cGo').addEventListener('click', () => {
    const cc = loadCustom();
    cc.name = introCard.querySelector('#cName').value || 'my42';
    introCard.querySelectorAll('[data-r]').forEach((inp) => { cc.axisLabels[inp.dataset.r] = inp.value || inp.dataset.r; });
    saveCustom(cc);
    enterBoard();
  });
}

function renderJoin() {
  introCard.innerHTML =
    `<div class="kick">join a game</div><h2>Join someone's game</h2>` +
    `<p>Import a game-of-42 or City-Key shared with you — a PNG/JSON file, or a FedWiki page link.</p>` +
    `<button id="jFileBtn" class="go" style="width:100%">choose a game / key file</button>` +
    `<input id="jFile" type="file" accept="image/png,application/json" style="display:none">` +
    `<label style="display:block;text-align:left;color:var(--dim);font-size:11px;margin-top:12px">or join from a wiki link</label>` +
    `<div style="display:flex;gap:6px;margin-top:6px"><input id="jWiki" type="text" placeholder="http://game42.localhost:3030/example-game--the-first-six"><button id="jWikiGo">fetch</button></div>` +
    `<div id="jMsg" style="color:var(--dim);font-size:11px;margin-top:10px;min-height:16px"></div>` +
    `<div class="introbtns" style="margin-top:14px"><button id="jBack">back</button><span style="flex:1"></span><button id="jGo" class="go" disabled style="opacity:.5">enter the board →</button></div>`;
  let adopted = false;
  const msg = introCard.querySelector('#jMsg');
  // shared adopt path for file + wiki: merge a cfg into "mine" and arm the go button
  function adopt(cfg, label) {
    if (!cfg || typeof cfg !== 'object') { msg.textContent = '⚠ no game / key found'; return; }
    const cc = loadCustom();
    if (cfg.name) cc.name = cfg.name;
    if (cfg.tagline) cc.tagline = cfg.tagline;
    if (cfg.axisLabels) cc.axisLabels = { ...cc.axisLabels, ...cfg.axisLabels };
    if (cfg.classLabels) cc.classLabels = { ...cc.classLabels, ...cfg.classLabels };
    if (cfg.roles) cc.roles = { ...cc.roles, ...cfg.roles };
    if (cfg.personaBySlot) cc.personaBySlot = { ...cc.personaBySlot, ...cfg.personaBySlot };
    if (cfg.infoBySlot) cc.infoBySlot = { ...cc.infoBySlot, ...cfg.infoBySlot };
    if (cfg.keyBySlot) cc.keyBySlot = { ...cc.keyBySlot, ...cfg.keyBySlot };
    saveCustom(cc); adopted = true;
    const warns = conformImport(cfg);
    msg.innerHTML = 'joined <b style="color:var(--ink)">' + esc(cfg.name || label) + '</b>' +
      (warns.length ? '<br><span style="color:#ffb4b4">⚠ conformance: ' + warns.map(esc).join('; ') + '</span>' : ' <span style="color:#7be0b0">✓ conforms</span>');
    const go = introCard.querySelector('#jGo'); go.disabled = false; go.style.opacity = '1';
  }
  introCard.querySelector('#jBack').addEventListener('click', renderSplash);
  introCard.querySelector('#jFileBtn').addEventListener('click', () => introCard.querySelector('#jFile').click());
  introCard.querySelector('#jFile').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let cfg = null;
      try { cfg = pngExtract(r.result, 'cityKey') || pngExtract(r.result, 'game42'); if (!cfg) cfg = JSON.parse(new TextDecoder().decode(r.result)); } catch (x) { cfg = null; }
      adopt(cfg, f.name);
    };
    r.readAsArrayBuffer(f); e.target.value = '';
  });
  introCard.querySelector('#jWikiGo').addEventListener('click', async () => {
    const url = introCard.querySelector('#jWiki').value.trim(); if (!url) return;
    msg.textContent = 'fetching…';
    try { const { cfg, title } = await fetchGame(url); adopt(cfg, title); }
    catch (e) { msg.innerHTML = '<span style="color:#ffb4b4">⚠ ' + esc(e.message || 'fetch failed') + '</span>'; }
  });
  introCard.querySelector('#jGo').addEventListener('click', () => { if (adopted) enterBoard(); });
}

function showIntro() { renderSplash(); introWrap.classList.add('show'); }
// open the intro overlay straight at a given screen (used by the menu deep-links)
function openIntroAt(fn) { fn(); introWrap.classList.add('show'); }
const introLink = document.getElementById('introLink');
if (introLink) introLink.addEventListener('click', (e) => { e.preventDefault(); showIntro(); });

// Front-door interoperability: the landing menu (index.html) deep-links here —
//   ?start → name-your-game (renderCreate)   ·   ?join → import (renderJoin)
// Otherwise show the splash on a first-ever visit.
try {
  const q = new URLSearchParams(location.search);
  if (q.has('start')) openIntroAt(renderCreate);
  else if (q.has('join')) openIntroAt(renderJoin);
  else if (!localStorage.getItem('game42.intro.seen')) showIntro();
} catch (e) {}
