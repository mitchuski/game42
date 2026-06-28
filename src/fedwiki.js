// fedwiki.js — the app's only network module. Fetch a FedWiki page and pull a
// game-of-42 artefact carried in a fenced ```game42 (or ```json) block, so a wiki
// URL rehydrates into a game / key / constellation. FedWiki serves *.json with
// Access-Control-Allow-Origin:* so the browser fetches directly (no proxy needed).
// Only the artefact crosses (AXIOMS A5); callers run conformImport before accepting.
import { pngExtract } from './pngkey.js';

// normalise any page URL (view/<slug>, /<slug>.html, bare slug) to /<slug>.json
function toJsonUrl(input) {
  let u;
  try { u = new URL(String(input).trim(), location.href); } catch (e) { return null; }
  const segs = u.pathname.split('/').filter(Boolean);
  let slug = segs.length ? segs[segs.length - 1] : 'welcome';
  if (slug === 'view' || slug === 'index.html') slug = 'welcome';
  slug = slug.replace(/\.(json|html)$/i, '');
  return { url: `${u.protocol}//${u.host}/${slug}.json`, slug, host: u.host, origin: `${u.protocol}//${u.host}` };
}

export async function fetchPage(input) {
  const t = toJsonUrl(input);
  if (!t) throw new Error('not a valid URL');
  const r = await fetch(t.url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const p = await r.json();
  return { title: p.title || t.slug, story: p.story || [], slug: t.slug, host: t.host, origin: t.origin };
}

// the embedded artefact: a fenced ```game42 / ```json block in any markdown item
export function extractGame(page) {
  for (const it of (page.story || [])) {
    if (!it || typeof it.text !== 'string') continue;
    const m = it.text.match(/```(?:game42|json)\s*\n([\s\S]*?)```/i);
    if (m) { try { const c = JSON.parse(m[1].trim()); if (c && typeof c === 'object') return c; } catch (e) {} }
  }
  return null;
}

// fallback: read a game from the page's PNG asset (the κ-sigil carrier) via its
// `assets` story item -> /plugin/assets/list -> the first .png -> pngExtract.
export async function extractGameFromAssets(page, origin) {
  const a = (page.story || []).find((it) => it && it.type === 'assets' && it.text);
  if (!a || !origin) return null;
  try {
    const list = await fetch(`${origin}/plugin/assets/list?assets=${encodeURIComponent(a.text)}`).then((r) => (r.ok ? r.json() : null));
    const files = (list && (list.files || list)) || [];
    for (const f of files) {
      const name = typeof f === 'string' ? f : (f && (f.name || f.path)) || '';
      if (!/\.png$/i.test(name)) continue;
      const buf = await fetch(`${origin}/assets/${a.text}/${name}`).then((r) => (r.ok ? r.arrayBuffer() : null));
      if (!buf) continue;
      const cfg = pngExtract(buf, 'game42') || pngExtract(buf, 'cityKey');
      if (cfg) return cfg;
    }
  } catch (e) {}
  return null;
}

// fetch a page and return its game cfg from the fenced block, or the PNG asset
export async function fetchGame(input) {
  const page = await fetchPage(input);
  const cfg = extractGame(page) || (await extractGameFromAssets(page, page.origin));
  return { cfg, title: page.title };
}

// optional: list a host's pages (for a future browse picker)
export async function fetchSitemap(host) {
  const proto = /:/.test(host) ? 'http' : 'https';
  const r = await fetch(`${proto}://${host}/system/sitemap.json`);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
