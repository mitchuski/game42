// grid.js — the Grid: assemble many games of 42 + Keys into one trust-graph view.
// Each loaded PNG/JSON becomes a sigil of its κ (the soulbis /sigil idea: a hash
// rendered as a 64-glyph mandala). Threads link games that share κ-prefix (common
// ground) or lineage (prior). A κ-encoder derives content addresses on demand.
import { pngExtract, pngEmbed } from './pngkey.js';
import { canonical, sha256hex } from './hash.js';
import { SLOTS, SLOTS_BY_AXIS, AXIS_ORDER } from './data.js';
import { POOL } from './personas.js';
import { conformImport } from './conform.js';
import { fetchGame } from './fedwiki.js';

// ---- emoji picker (typing emoji is unreliable; offer a palette) -----------
const EMOJIS = (() => {
  const extra = ['🐟', '🐭', '🧙', '⚔️', '🪞', '🤝', '⚡', '💎', '🛡️', '🔗', '📜', '🗝️', '🌀', '🌙', '☀️', '🌟', '✨', '🔥', '💧', '🌱', '🪙', '🔭', '🧭', '🐉', '🦊', '🦉', '🕊️', '🐢', '🌹', '🦓', '🪢', '🧩', '🎴', '♟️', '🔮', '📡', '🧬', '⚙️', '🛰️', '🌐', '😊', '👤'];
  const fromPool = Object.values(POOL).map((p) => p.glyph);
  return [...new Set([...extra, ...fromPool])];
})();
let pickTarget = null;
function showPicker(inputEl, it) {
  const pop = document.getElementById('emojipick');
  if (!pop.dataset.built) {
    pop.innerHTML = EMOJIS.map((e) => `<button type="button" data-e="${e}">${e}</button>`).join('');
    pop.dataset.built = '1';
    pop.querySelectorAll('button').forEach((b) => b.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      if (!pickTarget) return;
      pickTarget.input.value = b.dataset.e;
      pickTarget.it.emoji = b.dataset.e;
      persist(); renderCBoard();
      pop.classList.remove('show'); pickTarget = null;
    }));
  }
  pickTarget = { input: inputEl, it };
  const r = inputEl.getBoundingClientRect();
  pop.style.left = Math.min(r.left, window.innerWidth - 280) + 'px';
  pop.style.top = Math.min(r.bottom + 4, window.innerHeight - 250) + 'px';
  pop.classList.add('show');
}
document.addEventListener('mousedown', (e) => {
  const pop = document.getElementById('emojipick');
  if (pop && pop.classList.contains('show') && !pop.contains(e.target) && !(e.target.classList && e.target.classList.contains('emoji'))) pop.classList.remove('show');
});

const $ = (id) => document.getElementById(id);
const strip = (s) => String(s || '').replace('sha256:', '');
let items = [];
let uid = 0;
// constellation assignment: slotId -> a game's κ (compose a new 42 from many games)
const CKEY = 'game42.constellation';
let assign = (() => { try { return JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch (e) { return {}; } })();
const saveAssign = () => { try { localStorage.setItem(CKEY, JSON.stringify(assign)); } catch (e) {} };
const byKappa = (k) => items.find((i) => i.kappaRaw === k);
const STORE = 'game42.grid';
function persist() {
  try { localStorage.setItem(STORE, JSON.stringify(items.map((i) => ({ name: i.name, kind: i.kind, kappaRaw: i.kappaRaw, prior: i.prior, palette: i.palette, mine: i.mine, emoji: i.emoji || '', proverb: i.proverb || '' })))); } catch (e) {}
}
function restore() {
  try {
    const a = JSON.parse(localStorage.getItem(STORE) || '[]');
    items = a.map((o) => ({ id: ++uid, name: o.name, kind: o.kind, kappaRaw: o.kappaRaw, prior: o.prior || null, palette: o.palette || null, mine: !!o.mine, emoji: o.emoji || '', proverb: o.proverb || '', cfg: {} }));
  } catch (e) { items = []; }
}

// ---- load -----------------------------------------------------------------
function detect(cfg, fallbackName) {
  const kind = cfg.kind === 'game-of-42' || Array.isArray(cfg.log) ? 'game' : (cfg.palette || cfg.geometry ? 'key' : 'other');
  return {
    id: ++uid,
    name: cfg.name || fallbackName || 'untitled',
    kind,
    kappaRaw: strip(cfg.seal || cfg.kappa) || null,
    prior: cfg.prior ? strip(cfg.prior) : null,
    palette: cfg.palette || null,
    emoji: cfg.emoji || '',
    proverb: cfg.proverb || cfg.spell || '',
    cfg,
    mine: false,
  };
}

async function ensureKappa(it) {
  if (!it.kappaRaw) it.kappaRaw = await sha256hex(canonical(it.cfg));
  return it;
}

async function addCfg(cfg, fallbackName) {
  // a saved constellation: re-hydrate its assigned 42 + member artefacts
  if (cfg && cfg.kind === 'constellation' && cfg.slots) {
    for (const sl of Object.keys(cfg.slots)) {
      const m = cfg.slots[sl], k = strip(m.kappa);
      if (k && !byKappa(k)) items.push({ id: ++uid, name: m.name || 'game', kind: 'game', kappaRaw: k, prior: null, palette: null, mine: false, emoji: m.emoji || '', proverb: m.proverb || '', cfg: m });
      if (k) assign[sl] = k;
    }
    saveAssign();
    return;
  }
  if (cfg && cfg.kind === 'grid' && Array.isArray(cfg.items)) {
    for (const sub of cfg.items) items.push({ id: ++uid, name: sub.name || 'game', kind: sub.kind || 'game', kappaRaw: strip(sub.kappa), prior: sub.prior ? strip(sub.prior) : null, palette: null, cfg: sub, mine: !!sub.mine });
    return;
  }
  items.push(await ensureKappa(detect(cfg, fallbackName)));
}

function readFile(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = async () => {
      let cfg = null;
      try {
        cfg = pngExtract(r.result, 'game42') || pngExtract(r.result, 'cityKey') || pngExtract(r.result, 'citySky');
        if (!cfg) cfg = JSON.parse(new TextDecoder().decode(r.result));
      } catch (e) { cfg = null; }
      if (cfg) await addCfg(cfg, file.name.replace(/\.[a-z]+$/i, ''));
      res();
    };
    r.readAsArrayBuffer(file);
  });
}

async function addFiles(list) {
  for (const f of list) await readFile(f);
  render();
}

// ---- sigil (κ -> 64-glyph mandala) ---------------------------------------
function drawSigil(canvas, hex, palette) {
  const S = 124, dpr = 2;
  canvas.width = S * dpr; canvas.height = S * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2;
  const h = (hex || '0').padEnd(64, '0').slice(0, 64);
  const pts = [];
  for (let i = 0; i < 64; i++) {
    const v = parseInt(h[i], 16) || 0;
    const a = (i / 64) * Math.PI * 2 - Math.PI / 2;
    const r = 30 + v * 1.7;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, v]);
  }
  // ring path
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.strokeStyle = 'rgba(180,200,255,0.28)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // chords keyed by the hash (structure)
  ctx.strokeStyle = 'rgba(140,170,255,0.16)';
  for (let i = 0; i < 64; i += 1) {
    const j = (i * 7 + pts[i][2]) % 64;
    ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
  }
  // glyph dots, hue by nibble (tinted toward the key palette if present)
  const cool = palette && palette.cool, warm = palette && palette.warm;
  for (const [x, y, v] of pts) {
    let col;
    if (cool && warm) col = v < 8 ? cool : warm;
    else col = `hsl(${(v / 16) * 320 + 200}, 70%, 62%)`;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 1.4 + v * 0.12, 0, Math.PI * 2); ctx.fill();
  }
  // centre
  ctx.fillStyle = palette && palette.sword ? palette.sword : '#f5f0e1';
  ctx.beginPath(); ctx.arc(cx, cy, 3.4, 0, Math.PI * 2); ctx.fill();
}

// ---- render ---------------------------------------------------------------
function render() {
  const cards = $('cards');
  cards.innerHTML = '';
  $('empty').style.display = items.length ? 'none' : '';
  for (const it of items) {
    const el = document.createElement('div');
    el.className = 'card' + (it.mine ? ' self' : '');
    el.innerHTML =
      `<span class="badge">${it.kind === 'game' ? '🎴 game' : it.kind === 'key' ? '🗝️ key' : '◇'}</span>` +
      `<button class="rm" title="remove">✕</button>` +
      `<canvas></canvas>` +
      `<div class="nm">${esc(it.name)}</div>` +
      `<div class="meta">κ ${it.kappaRaw ? it.kappaRaw.slice(0, 12) + '…' : '—'}</div>` +
      `<div style="display:flex;gap:6px"><input class="emoji" maxlength="6" placeholder="🎴" value="${esc(it.emoji || '')}"><input class="prov" placeholder="proverb / spell" value="${esc(it.proverb || '')}"></div>` +
      `<select class="assign"><option value="">— assign to 42 —</option>${AXIS_ORDER.map((a) => `<optgroup label="${a}">` + SLOTS_BY_AXIS[a].map((s) => `<option value="${s.slotId}"${assign[s.slotId] === it.kappaRaw ? ' selected' : ''}>${s.slotId}</option>`).join('') + `</optgroup>`).join('')}</select>`;
    cards.appendChild(el);
    drawSigil(el.querySelector('canvas'), it.kappaRaw, it.palette);
    it._el = el;
    el.querySelector('.rm').addEventListener('click', (e) => { e.stopPropagation(); items = items.filter((x) => x !== it); render(); });
    el.addEventListener('click', () => { it.mine = !it.mine; render(); });
    const stop = (e) => e.stopPropagation();
    const em = el.querySelector('.emoji'), pv = el.querySelector('.prov'), sel = el.querySelector('.assign');
    [em, pv, sel].forEach((n) => n.addEventListener('click', stop));
    em.addEventListener('focus', () => showPicker(em, it));
    em.addEventListener('input', (e) => { e.stopPropagation(); it.emoji = e.target.value; persist(); renderCBoard(); });
    pv.addEventListener('input', (e) => { e.stopPropagation(); it.proverb = e.target.value; persist(); });
    sel.addEventListener('change', (e) => {
      e.stopPropagation();
      const k = it.kappaRaw;
      for (const sl in assign) if (assign[sl] === k) delete assign[sl]; // a game holds one slot
      if (e.target.value) assign[e.target.value] = k;
      saveAssign(); renderCBoard();
    });
  }
  drawLinks();
  persist();
  renderCBoard();
}

// ---- constellation board: the 42 you fill by assigning games --------------
function buildCBoard() {
  const S = 0.5; // 390*0.5 -> within ±220
  const px = (s) => (s.position2D.x * S).toFixed(1), py = (s) => (-s.position2D.y * S).toFixed(1);
  let svg = `<svg viewBox="-220 -220 440 440" role="img">`;
  // threads first: assigned games sharing κ-prefix link into the new set
  const asg = SLOTS.filter((s) => assign[s.slotId] && byKappa(assign[s.slotId]));
  for (let i = 0; i < asg.length; i++) for (let j = i + 1; j < asg.length; j++) {
    const A = byKappa(assign[asg[i].slotId]), B = byKappa(assign[asg[j].slotId]);
    if (!A.kappaRaw || !B.kappaRaw) continue;
    let pre = 0; while (pre < 64 && A.kappaRaw[pre] === B.kappaRaw[pre]) pre++;
    if (pre >= 4) svg += `<line x1="${px(asg[i])}" y1="${py(asg[i])}" x2="${px(asg[j])}" y2="${py(asg[j])}" stroke="#38bdf8" stroke-opacity="${Math.min(0.6, 0.12 + pre * 0.05).toFixed(2)}" stroke-width="1.2"/>`;
  }
  for (const s of SLOTS) {
    const it = assign[s.slotId] ? byKappa(assign[s.slotId]) : null;
    svg += `<g class="cnode" data-slot="${s.slotId}" style="cursor:pointer">`;
    svg += `<circle cx="${px(s)}" cy="${py(s)}" r="${it ? 8 : 3.5}" fill="${it ? '#38bdf8' : '#33405e'}" fill-opacity="${it ? '1' : '.5'}"/>`;
    if (it) {
      const g = it.emoji || (it.name || '?').slice(0, 2);
      svg += `<text x="${px(s)}" y="${py(s)}" text-anchor="middle" dy=".34em" font-size="${it.emoji ? 11 : 7}"${it.emoji ? '' : ' font-weight="700" fill="#0b0e14"'}>${esc(g)}</text>`;
    }
    svg += `</g>`;
  }
  return svg + `</svg>`;
}
function renderCBoard() {
  const el = $('cboard');
  if (!el) return;
  el.innerHTML = buildCBoard();
  el.querySelectorAll('.cnode').forEach((g) => g.addEventListener('click', () => {
    const sl = g.dataset.slot, it = assign[sl] ? byKappa(assign[sl]) : null;
    $('cdetail').innerHTML = it
      ? `<b>${esc(sl)}</b> ${esc(it.emoji || '')} <b style="color:var(--ink)">${esc(it.name)}</b>` + (it.proverb ? `<br><span style="color:var(--ink)">“${esc(it.proverb)}”</span>` : '') + `<br><span style="color:var(--dim)">κ ${esc((it.kappaRaw || '').slice(0, 16))}…</span>`
      : `<span style="color:var(--dim)">${esc(sl)} — empty</span>`;
  }));
}

// export the constellation (the assigned 42) as a key PNG: each filled square's
// artefact = { name, κ, emoji, proverb }. A completed constellation is itself one.
async function exportConstellation() {
  const map = {};
  for (const sl in assign) { const it = byKappa(assign[sl]); if (it) map[sl] = { name: it.name, kappa: it.kappaRaw, emoji: it.emoji || '', proverb: it.proverb || '' }; }
  const n = Object.keys(map).length; if (!n) return;
  const cfg = { version: 1, kind: 'constellation', name: 'constellation of ' + n, slots: map };
  cfg.kappa = 'sha256:' + (await sha256hex(canonical(cfg)));
  const cv = document.createElement('canvas'); cv.width = cv.height = 440;
  const x = cv.getContext('2d');
  x.fillStyle = '#0b0e14'; x.fillRect(0, 0, 440, 440);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  for (const s of SLOTS) {
    const ox = 220 + s.position2D.x * 0.5, oy = 220 - s.position2D.y * 0.5, it = assign[s.slotId] && byKappa(assign[s.slotId]);
    x.beginPath(); x.arc(ox, oy, it ? 8 : 3.5, 0, Math.PI * 2); x.fillStyle = it ? '#38bdf8' : '#33405e'; x.fill();
    if (it && it.emoji) { x.font = '13px serif'; x.fillStyle = '#0b0e14'; x.fillText(it.emoji, ox, oy); }
  }
  x.fillStyle = '#dfe6ff'; x.font = '14px serif'; x.fillText(cfg.name, 220, 20);
  const blob = pngEmbed(cv.toDataURL('image/png'), cfg);
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'constellation-' + n + '.png';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

function drawLinks() {
  const wrap = $('wrap'), svg = $('links');
  const W = wrap.clientWidth, H = wrap.clientHeight;
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let s = '';
  const center = (it) => it._el ? [it._el.offsetLeft + it._el.offsetWidth / 2, it._el.offsetTop + it._el.offsetHeight / 2] : null;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j], a = center(A), b = center(B);
      if (!a || !b || !A.kappaRaw || !B.kappaRaw) continue;
      let pre = 0; while (pre < 64 && A.kappaRaw[pre] === B.kappaRaw[pre]) pre++;
      if (pre >= 4) s += line(a, b, '#38bdf8', Math.min(0.5, 0.12 + pre * 0.05));
    }
  }
  // lineage: a game whose prior == another's κ
  for (const A of items) {
    if (!A.prior) continue;
    const par = items.find((x) => x.kappaRaw === A.prior);
    if (par) { const a = center(A), b = center(par); if (a && b) s += line(a, b, '#e0a526', 0.6); }
  }
  svg.innerHTML = s;
}
const line = (a, b, c, o) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-opacity="${o.toFixed(2)}" stroke-width="1.5"/>`;

// ---- save / clear ---------------------------------------------------------
function saveGrid() {
  if (!items.length) return;
  const n = items.length, cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), cell = 130;
  const cv = document.createElement('canvas');
  cv.width = cols * cell; cv.height = rows * cell + 30;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0b0e14'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#dfe6ff'; ctx.font = '16px serif'; ctx.fillText('game of 42 · grid · ' + n, 12, 20);
  items.forEach((it, i) => {
    const tmp = document.createElement('canvas');
    drawSigil(tmp, it.kappaRaw, it.palette);
    ctx.drawImage(tmp, (i % cols) * cell + 3, Math.floor(i / cols) * cell + 30, 124, 124);
  });
  const cfg = { version: 1, kind: 'grid', name: 'game42 grid', items: items.map((i) => ({ name: i.name, kappa: i.kappaRaw, kind: i.kind, prior: i.prior, mine: i.mine })) };
  const blob = pngEmbed(cv.toDataURL('image/png'), cfg);
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'game42-grid.png';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---- wiring ---------------------------------------------------------------
$('bAdd').addEventListener('click', () => $('fAdd').click());
$('fAdd').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
$('bSave').addEventListener('click', saveGrid);
$('bClear').addEventListener('click', () => { items = []; render(); });
$('bWiki').addEventListener('click', async () => {
  const url = $('wikiUrl').value.trim(); if (!url) return;
  const btn = $('bWiki'), old = btn.textContent; btn.textContent = 'fetching…';
  try {
    const { cfg, title } = await fetchGame(url);
    if (!cfg) { btn.textContent = '⚠ no game on that page'; }
    else { const w = conformImport(cfg); await addCfg(cfg, title); render(); btn.textContent = w.length ? '⚠ added · ' + w.length + ' warn' : '✓ added'; }
  } catch (e) { btn.textContent = '⚠ ' + (e.message || 'failed'); }
  setTimeout(() => { btn.textContent = old; }, 2600);
});
$('bMine').addEventListener('click', () => { const any = items.some((i) => !i.mine); items.forEach((i) => (i.mine = any)); render(); });
$('bDerive').addEventListener('click', async () => {
  try {
    const obj = JSON.parse($('kin').value);
    $('kout').textContent = 'sha256:' + (await sha256hex(canonical(obj)));
  } catch (e) { $('kout').textContent = '⚠ not valid JSON'; }
});
$('cClear').addEventListener('click', () => { assign = {}; saveAssign(); renderCBoard(); $('cdetail').textContent = 'tap a filled square to read its artefact'; });
$('cExport').addEventListener('click', exportConstellation);
['dragover', 'drop'].forEach((ev) => document.addEventListener(ev, (e) => { e.preventDefault(); }));
document.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
window.addEventListener('resize', drawLinks);
restore();
render();
