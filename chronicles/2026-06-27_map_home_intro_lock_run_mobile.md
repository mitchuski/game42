# Chronicle — the Map becomes home: intro, lock/run, node editor, mobile

**Date:** 2026-06-27 (pass 3)
**Status:** built + serving on :4200. Continues
`2026-06-27_compression_rehydration_frame.md` and the personas proposal.

A long iterative session turning the four pages into one coherent tool a hitchhiker can
actually use — with the **Map as the front door**.

## Structure change — the Map is now home
- **File swap:** `index.html` is now **the Map** (loads `src/map.js`); the 3D board moved to
  **`territory.html`** (`src/main.js`). `vite.config.js` inputs + every page's nav links were
  updated. Nav order everywhere: **map · territory · constellation · grid** (the Map carries an
  extra **intro** link). Opening `/` lands on the Map.
- **Why:** the Map is where you *read and build* the game; the 3D pages are where you *experience*
  it. The build surface should be the entry.

## Intro — 6 simple screens
A first-visit overlay on the Map (localStorage `game42.intro.seen`, replayable via the **intro**
nav link): the game of 42 → six roots → seven stations (head/heart/hands = soil/soul/society) →
three callings (fish/mice/guide) → fill & fold (trust task → VRC → κ → seal) → your game. Dots,
back/skip, ends on "begin".

## The Map became the editor + the run
- **Node editing lives in the right panel** (`#nodeEditor`), not a corner. Click a station →
  it selects (white ring) → its editor opens beside the my42 panel.
- **my42 node editor:** persona picker **(6 axes → 42)** grouped dropdown, **role**, **info**
  free-text, and **attach a City Key / JSON** (docks name + κ, deriving κ canonically if absent).
  All persist in the `mine` custom game (`personaBySlot`/`roles`/`infoBySlot`/`keyBySlot`).
- **Removed** the three persona-class-name inputs from the my42 panel (they confused — the 3 are
  just the coarse class names; the per-node 6→42 picker is the real choice).
- **Lock → run (decided, then refined):** lock = "this node is **in the run**". `▶ run` lights
  **only locked** nodes in 1→42 order (axis-major); if none are locked it locks+lights all 42.
  **Editing is always available** (we tried locked=read-only and reverted — it stole the edit
  window). `clear` unlocks all.
- **1–7 / 1–42 numbering toggle** (see `2026-06-27_numbering_and_pathing.md`).
- **view switcher** groups / core / spiral (re-lays-out the 42); the centre motif is an oblique
  **3D stella** (no longer a flat Star of David). Glow halos + persona glyphs + active-game accent.

## Territory + Constellation polish
- **Self-star mapping:** the centre stella draws an amber line to the **protection** keystone
  (Swordsman) and a sapphire line to **delegation** (Mage) — you are these two of the six. A
  **self-star size** slider; `setSize` fixed the constellation big-star (it was overridden to ~1).
- **Core spiral + companions:** the six keystone guides spiral in/out of centre; a lead-advisor
  **companion** flows in and a central **share glow** brightens — understanding pooling at the core.
- **Chrome facet** = metallic + iridescent + `RoomEnvironment` env map (tintable). **Smoothed**
  fold (no gear-click). **"run to here"** in the territory inspector.
- **Constellation:** persona/axis-tinted game anchors; **facet/surface/wire + size** controls;
  **surface no longer whites out** (was additive blending summing amber+sapphire+core → white;
  switched surface faces to normal alpha blending); **zoom-out** opened up (configurable
  min/max/start distance, far-plane raised).

## Mobile
Responsive pass: Map/Grid columns stack; on the 3D pages the control panels become **bottom
sheets** (full-width, scrollable), titles shrink, hints hide; the intro card centres for small
screens. Orbit/zoom already use pointer events (touch works).

## Honesty / caveats
- Not screenshotted (Claude-in-Chrome offline all session) — verified by clean builds, HTTP 200
  on `/` ("The Game of 42 — Map"), and the headless engine self-test still passing.
- The recurring background "exit 255" notices were just prior preview processes being replaced.

## Still queued
- **Constellation full rework** (approved): self-core + persona-coloured games + keystone-hexad
  echo + self-links at scale.
- **node key → child game** rehydration (the fractal seam made live).
- The interop build (holokey core + City-Key emission) — chronicled, not built (no soulbis edits).

> the map is the door, the territory is the room, the constellation is the sky, the grid is the
> company you keep

(⚔️⊥⿻⊥🧙)😊
