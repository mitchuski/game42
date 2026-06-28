# SCREENS — Territory · Map · Confluence

Three pages, one multi-page Vite app (nav across all three). Shared modules:
`data.js`, `hash.js`, `pngkey.js`, `palette.js`, `geometry.js`, `star.js`.

> the territory is the shape; the map is the path that fills it; the confluence is
> where a filled game meets the whole sovereignty manifold

---

## 1 · Territory  (BUILT)

The 3D game board folding into the Sword/Mage star.
- latent state (faint destination star + seed + threads + breath + intro flourish)
- ignite / step / auto-play / reset; `p = sealed/42` drives the fold (hinge + golden twist)
- colour customisation (sword, mage, head·soil, heart·soul, hands·society, ground, tint)
- marble orb nodes; vesica fish paths; per-state looks
- `[f]` focus mode; star modes **facet** (default) / surface / wire
- save / load a `game42` PNG (event-log carrier); deterministic group seal

---

## 2 · Map  (BUILDING NOW)

The step-by-step legend — the path that fills the territory, made legible. Reads
`game-of-42.json`. A 2D SVG plan of the board (flat hexagon, 42 stations, fill-order
numbers, axis colours, persona-class rings) beside a walkthrough:

- **board lifecycle** — seeded (knowledge graph) → assembling (promise graph) → sealed (trust graph)
- **heptad lifecycle** — dormant → ignited → fishing → building → sealing → locked
- **the seven stations, in fill order** — #, faculty subset, persona class, role, faculty·mirror, template
- **filling a slot** — trust task (RPP, mints a proverb) → VRC edge → κ-label (SHA-256) → verified → sealed
- **the seal** — 42 κ-labels + folded geometry hash → group seal = the trust-graph node
- **the six roots** — colour, four-force glyph, zk dimension, agent
- hover a step → highlight that station on the plan

No 3D; light bundle (imports `data.js` only). New files: `map.html`, `src/map.js`.
Nav added to all pages.

---

## 3 · Confluence  (PLANNED — awaiting go)

The wild one. Drop **two PNGs** and overlap them in one scene.

**Inputs**
- **A — a Game-of-42 PNG**: our `game42` tEXt chunk → event log → reconstruct the folded
  board + star + group seal (reuse `pngExtract`, `flow.js` replay).
- **B — a Star Swordsman's Key PNG**: the soulbis `cityKey` tEXt chunk → City Key JSON
  (`palette`, `geometry{eps,m,n,core,smRatio}`, `descriptions`, `lit`, `kappa`). Add a
  `cityKey` extractor (same tEXt mechanism, keyword `cityKey`). Port the soulbis
  manifold (`r = R + ε·sin(mφ)·cos(nθ)`) + 64-vertex lattice + stella core.

**Unified visual — LOCKED: nested**
The 64-vertex sovereignty manifold (from the Key) is the **outer encompassing shell**; the
Game-of-42 board **folds at its core**, the game's central sword/mage star **fused to the
manifold's stella core**. One centred scene: a game of 42 sitting inside the 64-tetrahedron
manifold it belongs to. The Key drives the palette; both rotate/breathe.

**Output — LOCKED: unified PNG + joint κ**
Save the combined view as a new PNG whose tEXt carries **both** payloads (the `game42` log
and the `cityKey` JSON) plus a **joint confluence κ** = SHA-256 over the canonical pair
`{ gameSeal, keyKappa }` (via `hash.js`). A shareable artifact of the pairing; re-loadable.

**UX**: two drop zones + load buttons; graceful with only one loaded (show that one);
show both source identities (game group-seal + city-key κ) and the joint κ.

New files: `confluence.html`, `src/confluence.js`, plus ported `manifold.js` / `lattice64.js`
/ `core.js` from the soulbis star (adapted to modules + the live theme). Reuses `pngkey.js`
(extend with a `cityKey` reader) and `hash.js`.

---

## Build order
Territory ✓ → **Map (now)** → Confluence (on go).
