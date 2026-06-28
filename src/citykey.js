// citykey.js — project a sealed Game of 42 onto the soulbis City Key shape, so
// the seal-PNG rises as a star in /skye (and imports on /star, /lattice, /sigil).
//
// Binds ONLY to the stable seam of a game: the group seal, which axes locked,
// and the proof count. Nothing of the 42-slot interior, the fold, or the preset
// vocabulary leaks in — those are free to change without touching this map.
//
// The kappa here uses the soulbis parameterisation (sha256: prefix, exclude only
// `kappa`) — NOT game42's bare-hex hash.js canon — so /skye's re-derivation on
// import matches byte-for-byte and reads "verified". See holokey.js plan, Phase 0.
import { sha256hex } from './hash.js';

// The carrier palette is the soulbis canon (coral sword / cyan mage), so the star
// renders and charges in the colours /skye + /city expect. game42's forge palette
// (amber/sapphire) rides only as descriptive metadata under `source`.
export const CARRIER_PALETTE = { cool: '#141a3d', warm: '#f0eee8', sword: '#e8523a', mage: '#4dd9e8' };

// soulbis canonical form — recursive key-sort, no whitespace, primitives via
// JSON.stringify. Identical to /skye + /star canonicalJSON, so κ matches.
function canonicalJSON(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalJSON).join(',') + ']';
  return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonicalJSON(v[k])).join(',') + '}';
}

// κ-label on the sha256 axis, excluding only `kappa` (soulbis rule).
export async function kappaCity(obj) {
  const c = { ...obj };
  delete c.kappa;
  return 'sha256:' + (await sha256hex(canonicalJSON(c)));
}

// Axis -> lattice basis vertex, the SOULBIS convention (lattice/index.html:217-220,
// MODEL-locked 2026-06-12, PVM §12.6: "d₁ Protection is the HIGH bit"). This is the
// shared coordinate system; game42 conforms to it (and game-of-42.json's per-axis
// latticeAxisVertex now carries the same numbers) so a sealed axis lights the SAME
// vertex both systems mean by it — otherwise common-ground/overlap compares the
// wrong points. NOT 1<<axisIndex (that scrambled protection->8 instead of ->32).
const AXIS_VERTEX = { protection: 32, delegation: 16, memory: 8, connection: 4, compute: 2, value: 1 };

// game -> City Key projection. opts: { preset, seal, savedAt, prior? }
export function game42ToCityKey(game, opts) {
  const { preset, seal, savedAt, prior } = opts;
  const AX = game.axisOrder;

  // which axes locked -> their soulbis basis vertices
  const lit = [];
  let axisBitmask = 0;
  AX.forEach((a) => {
    if (game.heptadPhase(a) === 'locked') { const v = AXIS_VERTEX[a]; lit.push(v); axisBitmask |= v; }
  });
  lit.sort((a, b) => a - b);
  const full = lit.length === 6;
  if (full) lit.push(63); // apex — all six dimensions held = full sovereignty

  const cfg = {
    name: 'game of 42 · ' + preset + ' seal',
    version: 1,
    palette: CARRIER_PALETTE,
    lit,
    // the seal IS the digest over all 42 κ-labels + geometryHash — carry it as the
    // trust-task proof root; /star carries `packets` through untouched, /city charges it.
    packets: { root: seal, count: game.sealedCount() },
    // the sealed slots are proven focus — chargeable like any walked key
    witness: { spent: full ? { '63': 42 } : {}, complete: full, at: savedAt },
    // descriptive only — game42's own framing, never hashed into identity meaning
    source: { kind: 'game-of-42', preset, axisBitmask },
  };
  if (prior) cfg.prior = prior; // optional κ-chain: forge V1 -> V2 -> … (gold lineage thread in /skye)
  return cfg;
}
