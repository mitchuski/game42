// personas.js — the agentprivacy persona roster (the City-of-Mages version of the
// game). The 42 skills in agentprivacy-skills-v5, each carrying an `equation_term`
// that ties it to a PVM dimension. POOL = all available personas; MAGES_42 = a
// PROPOSED 6×7 bijection (axis -> 7 keys in fill order, keystone last) for the
// 'mages' preset. This placement is a draft for approval/edit — see
// chronicles/2026-06-27_mages_42_personas_proposal.md. Names/glyphs are canon.

export const POOL = {
  soulbis: { name: 'Soulbis', glyph: '⚔️', wing: 'swordsman' },
  soulbae: { name: 'Soulbae', glyph: '🧙', wing: 'mage' },
  kyra: { name: 'Kyra', glyph: '💎', wing: 'balanced' },
  cipher: { name: 'Cipher', glyph: '🔐', wing: 'swordsman' },
  warden: { name: 'Warden', glyph: '🌐', wing: 'swordsman' },
  gatekeeper: { name: 'Gatekeeper', glyph: '👤', wing: 'swordsman' },
  sentinel: { name: 'Sentinel', glyph: '🛡️', wing: 'swordsman' },
  algebraist: { name: 'Algebraist', glyph: '🔢', wing: 'swordsman' },
  netkeeper: { name: 'Netkeeper', glyph: '🕸️', wing: 'swordsman' },
  sith: { name: 'Sith', glyph: '🔴', wing: 'swordsman' },
  ranger: { name: 'Ranger', glyph: '🌲', wing: 'swordsman' },
  'quantum-sentinel': { name: 'Quantum Sentinel', glyph: '⚛️', wing: 'swordsman' },
  archer: { name: 'Archer', glyph: '🎯', wing: 'swordsman' },
  forgemaster: { name: 'Forgemaster', glyph: '🔨', wing: 'swordsman' },
  forgecaller: { name: 'Forgecaller', glyph: '☰', wing: 'swordsman' },
  dragonwaker: { name: 'Dragonwaker', glyph: '🐉', wing: 'swordsman' },
  chronicler: { name: 'Chronicler', glyph: '📖', wing: 'mage' },
  ambassador: { name: 'Ambassador', glyph: '⚖️', wing: 'mage' },
  assessor: { name: 'Assessor', glyph: '💰', wing: 'mage' },
  shipwright: { name: 'Shipwright', glyph: '🏴‍☠️', wing: 'mage' },
  priest: { name: 'Priest', glyph: '🕯️', wing: 'mage' },
  weaver: { name: 'Weaver', glyph: '⿻', wing: 'mage' },
  'stranger-witness': { name: 'Stranger-Witness', glyph: '👥', wing: 'mage' },
  manaweaver: { name: 'Manaweaver', glyph: '🌊', wing: 'mage' },
  cosmologist: { name: 'Cosmologist', glyph: '🔭', wing: 'mage' },
  'companion-tamer': { name: 'Companion-Tamer', glyph: '🐾', wing: 'mage' },
  'hold-witness': { name: 'Hold-Witness', glyph: '🧭', wing: 'mage' },
  'registry-keeper': { name: 'Registry-Keeper', glyph: '📚', wing: 'mage' },
  'spawning-witness': { name: 'Spawning-Witness', glyph: '🪶', wing: 'mage' },
  moonkeeper: { name: 'Moonkeeper', glyph: '🌙', wing: 'mage' },
  theia: { name: 'Theia', glyph: '🌀', wing: 'mage' },
  architect: { name: 'Architect', glyph: '🤖', wing: 'balanced' },
  person: { name: 'Person', glyph: '😊', wing: 'balanced' },
  pedagogue: { name: 'Pedagogue', glyph: '🎓', wing: 'balanced' },
  witness: { name: 'Witness', glyph: '📰', wing: 'balanced' },
  jedi: { name: 'Jedi', glyph: '⚡', wing: 'balanced' },
  healer: { name: 'Healer', glyph: '🏥', wing: 'balanced' },
  'holonic-architect': { name: 'Holonic-Architect', glyph: '🔷', wing: 'balanced' },
  topologist: { name: 'Topologist', glyph: '🧭', wing: 'balanced' },
  herald: { name: 'Herald', glyph: '📯', wing: 'balanced' },
  mirrorkeeper: { name: 'Mirrorkeeper', glyph: '🪞', wing: 'balanced' },
  ceremonist: { name: 'Ceremonist', glyph: '🤝', wing: 'balanced' },
};

// PROPOSED bijection: 7 per axis in fill order (1..6 = the heptad, 7 = keystone).
// axis ↔ equation term: protection=P, delegation=D, compute=C, memory=A(τ),
// connection=Network, value=V(π,t)/capital.
export const MAGES_42 = {
  protection: ['gatekeeper', 'sentinel', 'algebraist', 'cipher', 'warden', 'sith', 'soulbis'],
  delegation: ['ambassador', 'weaver', 'cosmologist', 'shipwright', 'companion-tamer', 'spawning-witness', 'soulbae'],
  compute: ['architect', 'topologist', 'holonic-architect', 'forgemaster', 'forgecaller', 'quantum-sentinel', 'dragonwaker'],
  memory: ['chronicler', 'manaweaver', 'stranger-witness', 'registry-keeper', 'moonkeeper', 'hold-witness', 'theia'],
  connection: ['herald', 'netkeeper', 'mirrorkeeper', 'ranger', 'archer', 'priest', 'ceremonist'],
  value: ['assessor', 'person', 'pedagogue', 'witness', 'jedi', 'healer', 'kyra'],
};

export const personaName = (key) => (POOL[key] ? POOL[key].name : key);
export const personaGlyph = (key) => (POOL[key] ? POOL[key].glyph : '');
// the proposed persona for a slot under the mages roster
export function magesPersonaKey(slot) {
  const arr = MAGES_42[slot.axisId];
  return arr ? arr[slot.fillOrder - 1] : null;
}
