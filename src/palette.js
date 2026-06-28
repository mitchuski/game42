// palette.js — colours + the live, customisable theme.
import * as THREE from 'three';
import { AXIS_BY_ID, AXIS_ORDER } from './data.js';

export const GUIDE_RING = 0x2563eb;

// Four Forces (MODEL-SYNC §7) — four of the six roots are the forces.
export const FOUR_FORCE = { protection: '⚔️', delegation: '🧙', memory: '🪞', connection: '🤝' };
// A glyph for ALL six roots (agentprivacy mapping) so every root holds style.
// The four forces keep their force glyph; compute/value get their PVM glyph.
export const AXIS_GLYPH = { protection: '⚔️', delegation: '🧙', memory: '🪞', connection: '🤝', compute: '⚡', value: '💎' };

// The faculty triad and its mirror (head=soil, heart=soul, hands=society).
// Both are real; the corner carries both names, the recursion worth representing.
export const TRIAD = [
  { key: 'head', faculty: 'head', ground: 'soil', i: 0 },
  { key: 'heart', faculty: 'heart', ground: 'soul', i: 1 },
  { key: 'hands', faculty: 'hands', ground: 'society', i: 2 },
];

export const CLASS_COLOR = { vision_fish: '#38bdf8', mouse: '#c9a227', privacy_guide: '#f5f0e1' };

// Three Graphs labels for the board phase (MODEL-SYNC §2).
export const BOARD_GRAPH = { seeded: 'knowledge graph', assembling: 'promise graph', sealed: 'trust graph' };

// per-state appearance knobs (VISUAL-SPEC §2)
export const STATE_LOOK = {
  empty: { emissive: 0.35, opacity: 0.75, scale: 0.8, glow: 0.25 },
  proposed: { emissive: 0.6, opacity: 0.9, scale: 0.95, glow: 0.5 },
  in_progress: { emissive: 0.9, opacity: 1.0, scale: 1.05, glow: 0.8, pulse: true },
  verified: { emissive: 1.2, opacity: 1.0, scale: 1.15, glow: 1.1 },
  sealed: { emissive: 1.6, opacity: 1.0, scale: 1.3, glow: 1.6, lock: true },
};

// ---- the live theme (edited by the colour panel) -------------------------
export const theme = {
  sword: '#e0a526', // Soulbis / protection — amber-gold
  mage: '#2563eb', // Soulbae / delegation — sapphire
  ground: '#0b0e14',
  head: '#5b8cff', // head / soil
  heart: '#ff5b8c', // heart / soul
  hands: '#5bffae', // hands / society
  facultyTint: 0.5, // how far a node leans from its axis colour toward its faculty mix
  axis: Object.fromEntries(AXIS_ORDER.map((a) => [a, AXIS_BY_ID[a].colour])),
};
export const THEME_DEFAULTS = JSON.parse(JSON.stringify(theme));

const _h = new THREE.Color(), _he = new THREE.Color(), _ha = new THREE.Color(), _ax = new THREE.Color();

// barycentric faculty colour for a slot
export function facultyColor(barycentric, out) {
  _h.set(theme.head); _he.set(theme.heart); _ha.set(theme.hands);
  const [a, b, c] = barycentric;
  const o = out || new THREE.Color();
  o.setRGB(_h.r * a + _he.r * b + _ha.r * c, _h.g * a + _he.g * b + _ha.g * c, _h.b * a + _he.b * b + _ha.b * c);
  return o;
}

// node colour = axis colour leaned toward the faculty mix by facultyTint
export function nodeColor(slot, out) {
  _ax.set(theme.axis[slot.axisId] || '#888888');
  const fac = facultyColor(slot.barycentric, out || new THREE.Color());
  fac.lerp(_ax, 1 - theme.facultyTint); // tint=1 -> full faculty, tint=0 -> full axis
  return fac;
}

export const axisColor = (id) => theme.axis[id] || AXIS_BY_ID[id]?.colour || '#888888';
