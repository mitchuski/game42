// geometry.js — flat board (from data position2D) + the fold (GEOMETRY.md) +
// theme-driven colours, additive glow halos, and dual-triad labels.
import * as THREE from 'three';
import { SLOTS_BY_AXIS, AXIS_ORDER, AXIS_BY_ID } from './data.js';
import { nodeColor, axisColor, AXIS_GLYPH, TRIAD } from './palette.js';

export const SCALE = 1 / 130; // R_board 300 -> ~2.31 world units
const DEG = Math.PI / 180;
const ease = (p) => p * p * (3 - 2 * p); // smoothstep
const Z = new THREE.Vector3(0, 0, 1);

const _flat = new THREE.Vector3();
const _cen = new THREE.Vector3();
const _hinge = new THREE.Vector3();
const _local = new THREE.Vector3();

export function foldWorld(slot, pTwist, heptadFoldVal, thetaMaxDeg, twistDeg, out) {
  const o = out || new THREE.Vector3();
  _flat.set(slot.position2D.x * SCALE, slot.position2D.y * SCALE, 0);
  _cen.set(slot.heptadCentroid.x * SCALE, slot.heptadCentroid.y * SCALE, 0);
  _hinge.set(slot.heptadCentroid.x, slot.heptadCentroid.y, 0).normalize();
  _local.copy(_flat).sub(_cen);
  _local.applyAxisAngle(_hinge, ease(heptadFoldVal) * thetaMaxDeg * DEG);
  o.copy(_cen).add(_local);
  o.applyAxisAngle(Z, ease(pTwist) * twistDeg * DEG);
  return o;
}

const axisPhase = Object.fromEntries(AXIS_ORDER.map((a, i) => [a, i * 1.05]));

// shared radial-glow sprite texture
const GLOW_TEX = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d').createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  const ctx = c.getContext('2d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

function makeLabel(text, color) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = '600 30px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
  sp.scale.set(0.7, 0.175, 1);
  sp.renderOrder = 10;
  sp.userData.redraw = (t2, c2) => { ctx.clearRect(0, 0, 256, 64); ctx.fillStyle = c2 || color; ctx.fillText(t2, 128, 34); tex.needsUpdate = true; };
  return sp;
}

export function buildBoard(slots) {
  const group = new THREE.Group();
  const nodeBySlot = {};
  const geoSmall = new THREE.SphereGeometry(0.085, 20, 20);
  const geoGuide = new THREE.SphereGeometry(0.13, 28, 28);
  const _c = new THREE.Color();

  for (const s of slots) {
    nodeColor(s, _c);
    // marble orb (soulbis City-Key look): glossy clearcoat over the colour key
    const mat = new THREE.MeshPhysicalMaterial({
      color: _c.clone(), emissive: _c.clone(), emissiveIntensity: 0.45,
      roughness: 0.16, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.18,
      transparent: true, opacity: 0.9,
    });
    const m = new THREE.Mesh(s.isKeystone ? geoGuide : geoSmall, mat);
    m.userData.slot = s;
    // additive glow halo
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, color: _c.clone(), transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.setScalar(s.isKeystone ? 0.7 : 0.42);
    m.add(halo);
    m.userData.halo = halo;
    group.add(m);
    nodeBySlot[s.slotId] = m;
  }

  // spokes + hex frame + triangles + rings + labels
  const spokeGeo = new THREE.BufferGeometry();
  spokeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(AXIS_ORDER.length * 7 * 2 * 3), 3));
  const spokes = new THREE.LineSegments(spokeGeo, new THREE.LineBasicMaterial({ color: 0x5a6da0, transparent: true, opacity: 0.45 }));
  group.add(spokes);

  const hexGeo = new THREE.BufferGeometry();
  hexGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(AXIS_ORDER.length * 3), 3));
  const hexFrame = new THREE.LineLoop(hexGeo, new THREE.LineBasicMaterial({ color: 0x8aa0d8, transparent: true, opacity: 0.4 }));
  group.add(hexFrame);

  const triByAxis = {};
  const ringByAxis = {};
  const labels = []; // {sprite, slotId, kind, off}
  const rootLabels = []; // {axis, sprite}

  for (const a of AXIS_ORDER) {
    const corners = SLOTS_BY_AXIS[a].filter((s) => s.barycentric.includes(1));
    const triGeo = new THREE.BufferGeometry();
    triGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    const tri = new THREE.LineLoop(triGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(axisColor(a)), transparent: true, opacity: 0.8 }));
    triByAxis[a] = { obj: tri, corners };
    group.add(tri);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.022, 12, 44),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(axisColor(a)), transparent: true, opacity: 0.9 })
    );
    ringByAxis[a] = ring;
    group.add(ring);

    // root label: axis name + four-force glyph (the six are distinct — kept).
    // Corner triad (head·soil etc.) is the SAME on every heptad, so it lives in
    // the legend, not as 18 repeating sprites; the marble colour encodes it here.
    const rl = makeLabel(a + (AXIS_GLYPH[a] ? ' ' + AXIS_GLYPH[a] : ''), '#dfe6ff');
    group.add(rl);
    labels.push({ sprite: rl, slotId: SLOTS_BY_AXIS[a].find((s) => s.isKeystone).slotId, kind: 'root', off: 0.42 });
    rootLabels.push({ axis: a, sprite: rl });
  }

  const _v = new THREE.Vector3();
  const _dir = new THREE.Vector3();
  function layout(opts) {
    const { pTwist, heptadFold, thetaMaxDeg, twistDeg, bob, t, reduced } = opts;
    for (const s of slots) {
      foldWorld(s, pTwist, heptadFold(s.axisId), thetaMaxDeg, twistDeg, _v);
      if (!reduced) _v.z += bob * Math.sin(t * 0.8 + axisPhase[s.axisId]);
      nodeBySlot[s.slotId].position.copy(_v);
    }
    for (const a of AXIS_ORDER) {
      const { obj, corners } = triByAxis[a];
      const pa = obj.geometry.attributes.position;
      for (let i = 0; i < 3; i++) {
        const p = nodeBySlot[corners[i].slotId].position;
        pa.setXYZ(i, p.x, p.y, p.z);
      }
      pa.needsUpdate = true;
      ringByAxis[a].position.copy(nodeBySlot[SLOTS_BY_AXIS[a].find((s) => s.isKeystone).slotId].position);
    }
    let o = 0, hi = 0;
    const sp = spokes.geometry.attributes.position;
    const hx = hexFrame.geometry.attributes.position;
    for (const a of AXIS_ORDER) {
      const c = ringByAxis[a].position;
      hx.setXYZ(hi++, c.x, c.y, c.z);
      for (const s of SLOTS_BY_AXIS[a]) {
        const p = nodeBySlot[s.slotId].position;
        sp.setXYZ(o++, c.x, c.y, c.z);
        sp.setXYZ(o++, p.x, p.y, p.z);
      }
    }
    sp.needsUpdate = true;
    hx.needsUpdate = true;
    // labels follow their node, pushed slightly outward
    for (const L of labels) {
      const base = nodeBySlot[L.slotId].position;
      _dir.set(base.x, base.y, 0);
      if (_dir.lengthSq() > 1e-6) _dir.normalize();
      L.sprite.position.set(base.x + _dir.x * L.off, base.y + _dir.y * L.off, base.z + 0.06);
    }
  }

  // relabel the six roots to a game's vocabulary; accent tints the board frame
  function relabelRoots(game) {
    for (const r of rootLabels) {
      const word = game.axisLabels ? game.axisLabels[r.axis] : r.axis;
      r.sprite.userData.redraw(word + (AXIS_GLYPH[r.axis] ? ' ' + AXIS_GLYPH[r.axis] : ''), '#dfe6ff');
    }
  }
  function setAccent(hex) { hexFrame.material.color.set(hex); }

  function applyTheme() {
    for (const s of slots) {
      nodeColor(s, _c);
      const m = nodeBySlot[s.slotId];
      m.material.color.copy(_c);
      m.material.emissive.copy(_c);
      m.userData.halo.material.color.copy(_c);
    }
    for (const a of AXIS_ORDER) {
      triByAxis[a].obj.material.color.set(axisColor(a));
      ringByAxis[a].material.color.set(axisColor(a));
    }
  }

  function snapshotAtP1(thetaMaxDeg, twistDeg) {
    const v = new THREE.Vector3();
    const ids = slots.map((s) => s.slotId).sort();
    return {
      p: '1', thetaMaxDeg: String(thetaMaxDeg), twistDeg: String(twistDeg),
      slots: ids.map((id) => {
        const s = slots.find((x) => x.slotId === id);
        foldWorld(s, 1, 1, thetaMaxDeg, twistDeg, v);
        return { slotId: id, x: v.x.toFixed(3), y: v.y.toFixed(3), z: v.z.toFixed(3) };
      }),
    };
  }

  return { group, nodeBySlot, ringByAxis, triByAxis, spokes, labels, rootLabels, layout, applyTheme, relabelRoots, setAccent, snapshotAtP1 };
}
