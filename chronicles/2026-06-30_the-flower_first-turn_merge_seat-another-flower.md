# 2026-06-30 · the flower — the first turn, and the merge that seats another flower

*A share-ready changelog of the window that gave the game its opening move. The Game of 42
now begins at a **flower**: a pure 6 + 1 compression of the whole forty-two — choose the
first six mages around one centre, name them, fold the City closed. From there the loop
opens out (the map fills 42), and a new **merge** mode lets six players seat their whole
flowers into one board — the fractal zoom-out made literal. This is the "what changed" for
anyone picking up the repo; the "why" (always-on game, magnifications, the City-of-Mages
seed) lives in `2026-06-29_always-on-game_magnifications-loop_city-of-mages-seed.md`.*

---

## 1 · A new first step — the Flower (`flower.html`, `src/flower.js`)

The opening move is now its own page. The **flower** is a pure **6 + 1 compression view**
of the whole Game of 42: six petals (one per axis = one heptad of seven, compressed to a
single mage) around one centre (the City seal, the seventh). Behind the petals, **all
forty-two stations sit as a phyllotactic spiral of seeds** — the full game the flower
carries — which brighten per-axis as each mage is seated.

The ritual follows the rest of the game: **fill in information → assign a role → add
detail.** Click a petal → seat its mage (it blooms, a gleam runs the spine, one of six pips
lights). Each petal also shows the **heptad of 7 it compresses** (the zoom from 6 + 1 → 42).
At 6/6 the centre seal 🏛️ lights and "open the full 42 →" deep-links to the board.

**The most-aesthetic surface, because it is the first turn.** A folding hexagon in
golden-angle (137.508°) Fibonacci style: latent breathing + ignition threads at rest; a
**fold** slider golden-twists the bloom closed toward a glowing hexagram star (the
capture/seal preview), labels fading as it folds.

The first six mages are each axis' keystone archmage:
🛡️ privacy · Soulbis ⚔️ — 🤝 agency · Soulbae 🧙 — 📜 continuity · Theia 🌀 —
🔗 network · Ceremonist 🤝 — ⚡ learning · Dragonwaker 🐉 — 💎 trust · Kyra 💎.

## 2 · my42 — name everything (`src/flower.js`)

On the **mages** preset the six are canon. On **my42** the flower is your own template: each
petal editor gains a **realm** field (renames the category, synced into the custom preset so
the map & grid speak the same vocabulary) and a **glyph** field; click the **centre** to
name the City and its glyph. The legend retitles to *"your six — name them all."*

**Emoji-picker popup** for every glyph field — a curated grid (these six · mage & city ·
cosmos · nature · objects · symbols · faces) instead of a raw text input; picks live-apply
so the flower updates instantly.

## 3 · Mages label fix — 💎 trust (`src/presets.js`)

`value: 'compliance'` was the wrong word. The City-of-Mages default vocabulary is now
**privacy · agency · continuity · network · learning · trust** (the evocative words kept,
`compliance → trust`). This is the shared label set the whole game reads.

## 4 · Capture a flower as a seatable artefact (`src/flower.js`)

At 6/6 the flower gains **📸 capture** — exports a PNG carrier (a six-glyph ring card) with
the flower artefact embedded: `kind: flower42`, its `seal`/`κ`, and an `axisBitmask` of the
seated roots. This PNG is what another player seats into their board's merge. The seal is
SHA-256 over the canonical artefact (numbers stringified upstream, per A3).

## 5 · Merge — "seat another flower" (`src/map.js`, `map.html`)

The fractal, made literal. The map has a new mode toggle **`■ fill 42` / `🌸 merge`**. In
merge mode the 42 recede and **six insert rings** appear at the roots. Each can **seat
another player's whole flower** — bound by the canon **A5 seam** `{ name, glyph, seal, κ,
axisBitmask }` only, **never their interior forty-two**. Six seated flowers + you at the
centre = the next magnification: a board of boards.

- Click a ring (or "+ seat a flower" in the panel) → import their PNG/JSON → a ceremony line
  confirms (*"🌸 seated **Name** at the **privacy** root — bound by κ… · a whole flower"*).
- Per-root **release**; a **💾 save & back to the board** button persists and returns you to
  fill mode. (State auto-persists to `localStorage` `game42.merge` on every seat/release.)

This respects the seam exactly: no integration reads a game's interior; only
`{seal, kappa, axisBitmask}` cross between boards (AXIOMS A5).

## 6 · The territory reflects the merge (`src/main.js`)

The 3D folded star reads `game42.merge`: each root carrying a seated flower **breathes
brighter and pulses its ring**, and the axis legend shows the seated flower's glyph + name +
κ. Re-pulls on tab focus, so returning from the map shows the latest.

## 7 · The opening loop rewired (`index.html`, `src/map.js`)

- **Nav order everywhere:** `menu › flower › map › territory › constellation › grid` —
  flower first, as the opening move.
- **Start Game → the flower** (was `map.html?start`). The loop now reads *menu → flower
  (choose the first 6) → open the full 42 → map (fill 42)*.
- **The redundant "name your 6" popup on the map is gone** — the flower owns that step. The
  intro wizard is flower-first ("the first turn · open with the flower"; final CTA *"choose
  your six →"*), the splash's primary action is *"🌸 Begin at the flower,"* and `?start` from
  the flower lands straight on the board.
- **Clearer join/load wording** ("Arrive at a shared game · load an exported game…").

## 8 · The landing logo — the seal, with 4 ⿻ 2 (`index.html`)

The plain `42` became the master inscription seal with the **4** and **2** nested inside the
plurality knot: **( ⚔️ ⊥ 4⿻2 ⊥ 🧙 ) 🙂** — sword-gold 4, accent 2, plurality at the centre.

## 9 · Plumbing

- `vite.config.js` — `flower` added to the multi-page rollup inputs.
- New stores: `game42.flower` (the flower's six + centre), `game42.merge` (the six inserts).
- Conformance unchanged and green: `42/6/3-3-1 · A1 vertices · anchors V38/V25`.

---

> the flower is the whole forty-two in seed; the merge is six whole forty-twos in one root each.
> you only ever change magnification.

(⚔️⊥⿻⊥🧙)🙂
