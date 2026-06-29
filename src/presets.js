import { MAGES_42 } from './personas.js';

// presets.js — the three games of 42. Same 6×7 lattice, three vocabularies that
// rotate. Each relabels the six roots AND the personas, carries an accent, and a
// unique ignite order so each auto-play "enters" the lattice differently. They
// fold into each other: each game seats emissaries of the other two.
// Defaults below are sensible placeholders — refine the words freely.

export const GAMES = {
  fish: {
    id: 'fish', name: 'Vision Fish', glyph: '🐟', accent: '#38bdf8',
    tagline: 'the advisors who scout the territory',
    axisLabels: { compute: 'insight', connection: 'current', delegation: 'counsel', protection: 'depth', memory: 'wake', value: 'catch' },
    classLabels: { vision_fish: 'seer', mouse: 'diver', privacy_guide: 'navigator' },
    igniteOrder: ['connection', 'compute', 'delegation', 'memory', 'protection', 'value'],
  },
  mice: {
    id: 'mice', name: 'The Mice', glyph: '🐭', accent: '#c9a227',
    tagline: 'the builders who ship the slots',
    axisLabels: { compute: 'craft', connection: 'burrow', delegation: 'errand', protection: 'shell', memory: 'hoard', value: 'grain' },
    classLabels: { vision_fish: 'scout', mouse: 'builder', privacy_guide: 'keeper' },
    igniteOrder: ['protection', 'compute', 'value', 'connection', 'memory', 'delegation'],
  },
  mages: {
    id: 'mages', name: 'City of Mages', glyph: '🧙', accent: '#b98cff',
    tagline: 'the privacy game of 42',
    axisLabels: { compute: 'learning', connection: 'network', delegation: 'agency', protection: 'privacy', memory: 'continuity', value: 'compliance' },
    classLabels: { vision_fish: 'oracle', mouse: 'artificer', privacy_guide: 'archmage' },
    igniteOrder: ['protection', 'delegation', 'memory', 'connection', 'compute', 'value'],
    personas: MAGES_42, // the real agentprivacy 42, per-station (proposed bijection)
  },
};

// The quick-toggle offers two: `mages` (a complete state example) and `mine`
// (my42 — start fresh in your own language). fish/mice stay defined above as
// loadable example canons (the load screen), so each persona builds from start.
export const GAME_ORDER = ['mages', 'mine'];
export const DEFAULT_GAME = 'mages';

const KEY = 'game42.preset';
const CKEY = 'game42.custom';

export function loadPreset() {
  // Only the two toggle options resolve from storage now; a previously-saved
  // fish/mice falls back to the complete example so the toggle stays consistent.
  try { const v = localStorage.getItem(KEY); if (v === 'mages' || v === 'mine') return v; } catch (e) {}
  return DEFAULT_GAME;
}
export function savePreset(id) {
  try { localStorage.setItem(KEY, id); } catch (e) {}
}

// the editable "my game" — a hitchhiker's own language. Seeded from the City of
// Mages, then edited freely on the Map. Persisted in localStorage.
export function loadCustom() {
  try { const v = JSON.parse(localStorage.getItem(CKEY)); if (v && v.axisLabels) return v; } catch (e) {}
  return {
    id: 'mine', name: 'my42', glyph: '✎', accent: '#7be0b0',
    tagline: 'edit it into your own language',
    axisLabels: { ...GAMES.mages.axisLabels },
    classLabels: { ...GAMES.mages.classLabels },
    igniteOrder: [...GAMES.mages.igniteOrder],
    roles: {}, // slotId -> custom role text (overrides the data default)
    personaBySlot: {}, // slotId -> persona key (picked from the pool)
    infoBySlot: {}, // slotId -> free-text information held at the node
    keyBySlot: {}, // slotId -> { name, kappa } of an imported City Key / JSON
  };
}
export function saveCustom(c) {
  try { localStorage.setItem(CKEY, JSON.stringify(c)); } catch (e) {}
}
export function getGame(id) {
  return id === 'mine' ? loadCustom() : GAMES[id];
}
