// store.js — versioned localStorage for the game42.* JSON keys. Every page reads
// and writes cross-page state through this wrapper so the payloads carry a schema
// version ({ __game42v, data }) and corrupt entries say so instead of silently
// resetting. The two trivial raw-string keys (game42.preset, game42.intro.seen)
// stay outside — they are not JSON payloads.
const VERSION = 1;

function report(key, e) {
  const msg = `store: ${key} unreadable — ${e && e.message ? e.message : e}`;
  console.warn('[game42] ' + msg);
  if (typeof window !== 'undefined' && window.__gerr) window.__gerr(msg);
}

// load(key, fallback) — returns the stored payload, adopting legacy unversioned
// values as-is (they migrate to the envelope on the next save). A malformed
// entry is reported and the fallback returned.
export function load(key, fallback) {
  let raw = null;
  try { raw = localStorage.getItem(key); } catch (e) { return fallback; }
  if (raw == null) return fallback;
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === 'object' && !Array.isArray(p) && p.__game42v !== undefined) return p.data;
    return p; // legacy unversioned payload
  } catch (e) {
    report(key, e);
    return fallback;
  }
}

export function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ __game42v: VERSION, data })); }
  catch (e) { report(key, e); }
}
