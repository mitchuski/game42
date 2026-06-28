// visuals.js — per-state slot looks (VISUAL-SPEC §2) + vision-fish paths.
// The three persona classes read differently: fish as gleaming paths from the
// root to the head-class slot, mice as solid gold nodes, the guide as a
// white-gold core with a sapphire ring that wakes when sealed.
import * as THREE from 'three';
import { SLOTS, SLOTS_BY_AXIS } from './data.js';
import { STATE_LOOK } from './palette.js';

const FISH_SEGS = 18;

// Build the static extras once: guide rings + fish path lines + gleams.
export function buildExtras(board) {
  board.fishPaths = {};
  for (const s of SLOTS) {
    const node = board.nodeBySlot[s.slotId];
    if (s.personaClass === 'privacy_guide') {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.013, 8, 36),
        new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0 })
      );
      node.add(ring);
      node.userData.ring = ring;
    }
    if (s.personaClass === 'vision_fish') {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FISH_SEGS * 3), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0 }));
      board.group.add(line);
      const gleam = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x9be7ff, transparent: true, opacity: 0, depthWrite: false }));
      gleam.scale.setScalar(0.1);
      board.group.add(gleam);
      board.fishPaths[s.slotId] = { line, gleam };
    }
  }
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _ctrl = new THREE.Vector3();
const _pt = new THREE.Vector3();

// quadratic bezier point
function bez(a, c, b, u, out) {
  const m = 1 - u;
  out.set(
    m * m * a.x + 2 * m * u * c.x + u * u * b.x,
    m * m * a.y + 2 * m * u * c.y + u * u * b.y,
    m * m * a.z + 2 * m * u * c.z + u * u * b.z
  );
  return out;
}

export function update(board, game, t, params) {
  const reduced = params.reduced;
  for (const s of SLOTS) {
    const st = game.state[s.slotId];
    const look = STATE_LOOK[st];
    const node = board.nodeBySlot[s.slotId];
    const mat = node.material;
    const pulse = look.pulse && !reduced ? 0.7 + 0.3 * Math.sin(t * 4) : 1;
    mat.opacity = look.opacity;
    mat.emissiveIntensity = look.emissive * pulse;
    const sc = look.scale * (look.pulse && !reduced ? 1 + 0.05 * Math.sin(t * 4) : 1);
    node.scale.setScalar(sc);
    if (node.userData.halo) node.userData.halo.material.opacity = look.glow * pulse * 0.6;

    if (node.userData.ring) {
      const r = node.userData.ring.material;
      r.opacity = st === 'sealed' ? (reduced ? 0.9 : 0.65 + 0.3 * Math.sin(t * 2)) : st === 'verified' ? 0.4 : 0.0;
    }
  }

  // vision-fish paths: root (heptad keystone node) -> fish node
  for (const a in SLOTS_BY_AXIS) {
    const rootPos = board.nodeBySlot[SLOTS_BY_AXIS[a].find((s) => s.isKeystone).slotId].position;
    for (const s of SLOTS_BY_AXIS[a]) {
      if (s.personaClass !== 'vision_fish') continue;
      const fp = board.fishPaths[s.slotId];
      const st = game.state[s.slotId];
      _a.copy(rootPos);
      _b.copy(board.nodeBySlot[s.slotId].position);
      _ctrl.copy(_a).add(_b).multiplyScalar(0.5);
      _ctrl.z += 0.22; // lift the lens out of plane
      const pa = fp.line.geometry.attributes.position;
      for (let i = 0; i < FISH_SEGS; i++) {
        bez(_a, _ctrl, _b, i / (FISH_SEGS - 1), _pt);
        pa.setXYZ(i, _pt.x, _pt.y, _pt.z);
      }
      pa.needsUpdate = true;

      let op = 0;
      if (st === 'proposed' || st === 'in_progress') op = 0.55;
      else if (st === 'verified') op = 0.3;
      else if (st === 'sealed') op = 0.12; // thins to a faint permanent edge
      fp.line.material.opacity = op;

      const live = (st === 'proposed' || st === 'in_progress') && !reduced;
      if (live) {
        const u = (t * 0.5) % 1;
        bez(_a, _ctrl, _b, u, _pt);
        fp.gleam.position.copy(_pt);
        fp.gleam.material.opacity = 0.9;
      } else {
        fp.gleam.material.opacity = 0;
      }
    }
  }
}
