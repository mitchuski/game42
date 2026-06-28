# Chronicle — the FedWiki bridge (project out · consume in · embed back)

**Date:** 2026-06-28 (pass 5)
**Status:** DONE — built, served :4200, wiki live on the local farm :3030 (29 pages incl.
homepage + Visualisations embeds). Plan: `~/.claude/plans/im-looking-to-start-purring-scott.md`.

Gave the Game of 42 a **federated home and feed**: it now projects its canon into forkable
FedWiki pages, and the app can pull a game *from* a wiki URL. A wiki page becomes a first-class
compression of a trust task that rehydrates into a slot — the compression/rehydration frame, made
to round-trip.

## The bridge — one format both ways
A game's wiki page carries human prose **plus** a fenced ```` ```game42 ```` JSON block whose
payload is exactly what `src/grid.js detect()/addCfg()` already accepts (a game / cityKey /
constellation — name, axisLabels, personaBySlot, roles, infoBySlot, emoji, proverb, κ). No custom
FedWiki plugin; plain markdown survives fork. The Grid's export shape == the page's block, so a
saved game round-trips into a page and back.

## Outbound — `~/.wiki/_gen_game42.js` → `game42.localhost` (local farm only)
Modeled on `~/.wiki/_gen_cards.js` (copied `id()`, the `{title, story[], journal}` shape). **28
pages:** the 9 circulating canon docs (README/SPEC/GEOMETRY/GAME-FLOW/TRUST-PROTOCOL/VISUAL-SPEC/
MODEL-SYNC/SCREENS/AXIOMS), 6 axis pages + 7 station pages + the 42-persona roster (from
`game-of-42.json` + `src/personas.js`), an `axioms` page, a `welcome` hub, and a `game-artefacts`
hub with a living **Example Game · The First Six** (the inbound target).
- **G1 manifest-first:** a `CIRCULATE` const; chronicles / BUILD-PLAN / plans / python / scratch
  are **sealed** (never read). Leak-scan = none.
- **Ghost-page fix:** first cut collapsed repeated hyphens in `asSlug`; FedWiki's own resolver
  keeps them (`Axis · compute` → `axis--compute`), so links 404'd while my false-green checker
  passed. Fixed `asSlug` to FedWiki's **exact** rule and derive every slug from its title →
  **0 broken links** (now a true check). Pages wiped + regenerated.
- **No push.** Served on the farm only (`…/wiki` absolute path, :3030); the broker path
  (`~/.wiki/.creds/`, `WIKI_GRANT`, gates G2/G3/G7) is reserved for an explicit live push later.

## Inbound — `src/fedwiki.js` + Grid/Join (the app's first network calls)
The app had zero `fetch`; added one module:
- `fetchPage(url)` — normalises any page URL (view/<slug>, .html, bare) to `/<slug>.json`;
  `extractGame(page)` — pulls the fenced `game42`/`json` block; `fetchSitemap(host)` (for a
  future browse picker).
- **No proxy needed:** the farm serves `*.json` with `Access-Control-Allow-Origin: *`, so the
  browser fetches `http://game42.localhost:3030/<slug>.json` directly.
- **Grid → "+ from wiki URL"** (`src/grid.js`): fetch → extract → `conformImport` → `addCfg` →
  it's an artefact you can assign into the 42.
- **Join → "join from a wiki link"** (`src/map.js renderJoin`, refactored to a shared `adopt()`
  used by both file and wiki): fetch → extract → adopt-merge → enter the board.
- Both run **`conformImport`** (A1/A5) and surface ✓ / ⚠ without blocking.

## Artefacts as real FedWiki assets (added)
Each artefact page now carries the game **three ways**: prose, the fenced `game42` block (the
canonical seed), and a downloadable **κ-sigil PNG asset**. New Node encoder `~/.wiki/_png42.js`
(no canvas) ports `canonical`/SHA-256 and a CRC-correct `tEXt` chunk **byte-identical to
`src/pngkey.js`**, renders the 64-glyph κ-mandala, and embeds the same cfg. The builder writes
`assets/<slug>/<slug>.png` and adds an `# Assets` heading + `{type:'assets', text:'<slug>'}` item
(folder=slug, the FedWiki convention). The app gained `extractGameFromAssets` /
`fetchGame` — if a page has no fenced block it reads the PNG via the `assets/list` endpoint +
`pngExtract`. Both asset endpoints are CORS-open (`ACAO:*`).
Verified: PNG round-trips (`game42` tEXt → `{name:"The First Six", κ:sha256:645a…}`), farm serves
the asset (200) and `assets/list` returns `{files:["example-game--the-first-six.png"]}`.

## Homepage + embedded visualisations (added)
The `welcome` hub is now a real on-ramp: intro line, a **hero constellation embed**, *How it
plays* (start→build→seal→share/compose), *The math* (42=6×7, multiplicative collapse, the fold,
κ), and the read/roots/structure rosters. New **Visualisations** page embeds all four live views
via **`wiki-plugin-frame`** (`{type:'frame', text:'<url>\nHEIGHT n\ncaption'}`) pointing at the
running app (`http://localhost:4200/` map · `/territory.html` · `/constellation.html` ·
`/grid.html`). `frame` helper + `APP` const added to `_gen_game42.js`; 29 pages now.
- The app returns no `X-Frame-Options`/CSP → framable. `frame` sandboxes cross-origin embeds
  **without `allow-same-origin`**, so `localStorage` throws inside the frame — but every
  init-time access in the app is already `try/catch`-wrapped, so the views **render display-only**
  (persistence/seed silently no-op; the intro overlay is skipped). Embeds need the app running
  (`npm run preview`); blank frame = app down.

## Verification
- Outbound: 28 pages serve (HTTP 200); sitemap correct; broken links 0; leak-scan none; the
  example page carries the `game42` block.
- Inbound (Node-replicated against the live page): fetch → extract → `{kind:game, name:"The First
  Six", 🌱, all six axisLabels}` → **conformImport ✓ no warnings**.
- Regression: `npm run build` (conformance ✓) + headless selftest **18/18** + app HTTP 200.

## Files
- New: `~/.wiki/_gen_game42.js` (builder + manifest + gates + `frame`/asset emit),
  `~/.wiki/_png42.js` (Node PNG encoder + κ), `src/fedwiki.js` (fetchPage/extractGame/
  extractGameFromAssets/fetchGame/fetchSitemap).
- Modified: `src/grid.js` + `grid.html` (wiki-URL ingest), `src/map.js` + `index.html`
  (join-from-wiki, shared `adopt()`).
- Plugins used: `wiki-plugin-frame` (embeds), `wiki-plugin-assets` (the κ-sigil PNGs).
- Vite proxy: planned but **not needed** (farm + assets are CORS-open).

## Queued / deferred
- Push `game42.localhost` to a live host via the broker (explicit step; gates G2/G3/G7).
- Browse picker over `fetchSitemap` (pick a game from a host's roster).
- Federate into the agentprivacy hub (guide/skill/tomes/atlas) via `agentprivacy-wiki-sync`.
- Per-persona pages (currently one roster page).

> the page is the git-less clone; the fenced block is the seed; fetch is the fork;
> the slot is where it grows

(⚔️⊥⿻⊥🧙)😊
