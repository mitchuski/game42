// canon.js — the single source for shared canon constants (AXIOMS A1) and the
// small utilities every page repeats. No imports: safe for src modules, the
// build gate (scripts/conform.mjs) and tests alike.

// A1 (AXIOMS.md): axis -> lattice basis vertex, the SOULBIS convention
// (lattice/index.html DIMS, MODEL-locked 2026-06-12, PVM §12.6: "d₁ Protection is
// the HIGH bit"). NEVER 1<<axisIndex — that scrambles protection->8 instead of ->32.
export const AXIS_VERTEX = { protection: 32, delegation: 16, memory: 8, connection: 4, compute: 2, value: 1 };

// the six canonical axis ids
export const AXIS_IDS = ['compute', 'connection', 'delegation', 'protection', 'memory', 'value'];

// A1 axis basis vertices + the apex (all six held). A conformant City-Key
// projection only ever lights these.
export const VALID_VERTS = new Set([1, 2, 4, 8, 16, 32, 63]);

// the golden angle — the Fibonacci twist the fold turns by (GEOMETRY §3)
export const GOLDEN_ANGLE = 137.50776;

// HTML-escape for user-entered text interpolated into innerHTML. Full coverage
// (&<>"') so it is safe in text AND attribute contexts — every page uses this
// one, never a local variant.
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
