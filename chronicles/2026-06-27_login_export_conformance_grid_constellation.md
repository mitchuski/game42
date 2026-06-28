# Chronicle — login flow, share/join, conformance, grid→constellation composition

**Date:** 2026-06-27 (pass 4)
**Status:** built + serving on :4200, conformance-gated. Continues
`2026-06-27_map_home_intro_lock_run_mobile.md`.

This window turned the app from "four views" into a **loop you play**: start a game → build it →
share it → join others → compose them into constellations → light them up.

## First contact — a login-style flow (the Map is home)
The intro is no longer a slideshow. On the Map (`index.html`):
- **splash:** "Start your game" → **⚔️ Start your own** | **🤝 Join a game** | *how it works →* (the
  6 explainer screens, now optional).
- **start your own:** name the game + **name your six home bases (the team)** → *enter the board*.
- **join a game:** import a shared PNG/JSON → it adopts name + roots (+ roles, personas, info,
  keys) → *enter the board*. Either path drops you onto your `my42`.

## The share/join/compose round-trip
- **📤 share my42** (export): downloads a PNG — a mini-board sigil titled with the game + its κ,
  the whole custom game embedded (`game42` tEXt chunk). The Join flow reads it back fully.
- **➕ add to my grid**: pushes the current my42 into the Grid as an artefact, ready to assign.
- The PNG codec now supports **extra carrier chunks** (`pngEmbed(dataURL, cfg, extras)`); a sealed
  Territory game also embeds a **`cityKey` projection** so the same image rises in soulbis /skye.

## AXIOMS — the canon, now enforced
`AXIOMS.md` (Mitch's) is the load-bearing canon. Key finding: **the data was already
A1-conformant** (d₁ Protection = HIGH bit → `protection 32 · delegation 16 · memory 8 ·
connection 4 · compute 2 · value 1`; anchors V38=38, V25=25). `src/citykey.js` already uses that
map (explicitly *not* `1<<index`), and `savePNG` projects with it. Added:
- **Build gate** `scripts/conform.mjs` (wired into `npm run build`): fails the build on any A1 /
  42 / 6 / 3-3-1 / anchor drift. Also `npm run check`. Currently ✓.
- **Boot check** in `data.js` (logs A1 status) and **runtime flags** `src/conform.js`
  (`conformImport`) on **Map → Join** and **Constellation → insert** (✓ conforms / ⚠ …).
- Wrote axioms **A8** (multiplicative collapse), **A9** (p derived never set), **A10** (event log
  canonical), **A11** (Generator ⊥ Solver) into AXIOMS.md.

## Grid — composing a new 42 from many games
The Grid became the **composition surface**:
- Each game is an **artefact**: card now carries an **emoji** (via a **palette picker** — typing
  emoji was unreliable) and a **proverb / spell** string, alongside its κ-sigil.
- **Assign into the 42:** a per-card dropdown places a game on the **constellation board** (right
  panel) as its emoji; a game holds one slot; **shared-κ links** wire the overlaps; tap a filled
  square to read its artefact.
- **📤 save constellation** exports the assigned 42 as a `constellation` key (each square's
  `{name, κ, emoji, proverb}`, with its own κ) → re-loadable, and nestable into a higher
  constellation. **clear** resets. Persists in localStorage.

## Constellation — lights from the grid + the duo flow
- **light from grid:** a toggle that lights only the **grid-assigned** games, each within its
  **root constellation** (the six heptad clusters); count shown. Off = the lit-count slider.
- **core flow (duos):** carried from the Territory — the six keystone-parents send dots in/out of
  the centre along flow lines with a central **share glow**. (Mitch: "this works well.")
- Earlier this window: surface-white-out fixed (additive→alpha), zoom-out opened, star
  facet/surface/wire + size controls, axis-tinted anchors.

## Loose ends closed
- Re-verified: headless engine self-test **18/18**, conformance gate **✓**, JS κ == python ref.
- Map's old `#detail` hint updated (editing moved to the right-panel node editor).

## Queued / anticipated
- **Zoom INTO a constellation node** — drill from a lit square into that game's own 42 (the
  fractal seam made navigable). Mitch: "interesting idea." Next.
- Render an **imported `constellation` key** directly in the 3D constellation (not just the
  auto-fractal).
- Pull each assigned game's **emoji onto its lit cluster** in 3D.
- The holokey interop *build* (chronicled, not built — no soulbis edits).

> a game becomes an emoji and a proverb; the emoji takes a seat; the seats that share a secret
> draw a line; the lines, lit, are the constellation

(⚔️⊥⿻⊥🧙)😊
