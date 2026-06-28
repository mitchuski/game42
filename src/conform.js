// conform.js — runtime conformance flags for IMPORTED games/keys (AXIOMS A1/A5).
// Does not block; returns human-readable warnings so the UI can surface drift when
// someone joins/inserts a game or key that disagrees with the shared lattice.

// A1 axis basis vertices + the apex (all six held). A conformant City-Key projection
// only ever lights these.
const VALID_VERTS = new Set([1, 2, 4, 8, 16, 32, 63]);
export const AXIS_IDS = ['compute', 'connection', 'delegation', 'protection', 'memory', 'value'];

export function conformImport(cfg) {
  const w = [];
  if (!cfg || typeof cfg !== 'object') return ['not a readable game / key'];

  // City-Key style projection: lit vertices must be A1 axis vertices; bitmask must agree
  if (Array.isArray(cfg.lit)) {
    for (const v of cfg.lit) if (!VALID_VERTS.has(v)) w.push(`lit vertex ${v} is not an A1 axis vertex`);
    if (cfg.source && typeof cfg.source.axisBitmask === 'number') {
      const m = cfg.lit.filter((v) => v !== 63).reduce((a, b) => a | b, 0);
      if (m !== cfg.source.axisBitmask) w.push(`axisBitmask ${cfg.source.axisBitmask} ≠ OR(lit) ${m}`);
    }
  }
  // a custom / my42 game: axis labels must key on the six canonical axes
  if (cfg.axisLabels) {
    for (const k of Object.keys(cfg.axisLabels)) if (!AXIS_IDS.includes(k)) w.push(`unknown axis "${k}" (not one of the six)`);
  }
  return w;
}
