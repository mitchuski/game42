// hash.js — canonical serialisation + SHA-256, a faithful port of
// data/canonical_serialise.py. Verifiers MUST match it or produce false negatives.
//
// Rule (0xagentprivacy canon): sorted keys (recursively), compact separators
// (",",":"), the kappa/seal/vrcId/gameId fields excluded from their own input
// at the TOP level, UTF-8.
//
// NOTE: do not feed raw floating-point numbers into the hash — Python and JS can
// render them differently (1.0 vs 1). The geometry snapshot stringifies every
// number (toFixed) before hashing; VRCs and the seal body are strings only.

const EXCLUDE = new Set(['kappa', 'seal', 'vrcId', 'gameId']);

function enc(o) {
  if (o === null) return 'null';
  if (Array.isArray(o)) return '[' + o.map(enc).join(',') + ']';
  const t = typeof o;
  if (t === 'object') {
    const keys = Object.keys(o).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + enc(o[k])).join(',') + '}';
  }
  if (t === 'string') return JSON.stringify(o);
  if (t === 'boolean') return o ? 'true' : 'false';
  return String(o); // numbers — stringify upstream for cross-impl determinism
}

export function canonical(obj) {
  const pruned = {};
  for (const k of Object.keys(obj)) if (!EXCLUDE.has(k)) pruned[k] = obj[k];
  return enc(pruned);
}

export async function sha256hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// kappa = SHA-256( canonical(VRC) )
export async function kappaLabel(vrc) {
  return sha256hex(canonical(vrc));
}

// seal = SHA-256( canonical({ kappaLabels sorted, geometryHash }) )
export async function groupSeal(kappaLabels, geometryHash) {
  const body = { kappaLabels: [...kappaLabels].sort(), geometryHash };
  return sha256hex(canonical(body));
}

// A deterministic VRC stub for the visual build. The real edge comes from the
// external RPP ceremony + VRC issuer (out of scope here). Same inputs -> same kappa.
export function demoVRC(slot) {
  return {
    vrcId: 'demo:' + slot.slotId,
    slotId: slot.slotId,
    axisId: slot.axisId,
    candidate: { did: 'did:demo:candidate:' + slot.slotId },
    root: { did: 'did:demo:root:' + slot.axisId },
    polarity: '+',
    proverb: 'the ' + slot.role + ' answers for the ' + slot.axisId,
    trustTaskRef: 'demo:task:' + slot.slotId,
    issuedAt: '2026-06-27T00:00:00Z',
  };
}

// geometryHash = SHA-256( canonical(folded geometry state at p=1) ).
// Snapshot = sorted slotIds each with position rounded to 3dp as STRINGS.
export async function geometryHash(snapshot) {
  return sha256hex(canonical(snapshot));
}
