# 2026-06-29 · session updates — opening the game, fixing the grid, first-person keys

*A share-ready changelog of everything that changed in the game this session. The deep
"why" — the always-on game model, the magnifications, the City-of-Mages seed, the
proof-of-presence κ chain — lives in the companion chronicle
`2026-06-29_always-on-game_magnifications-loop_city-of-mages-seed.md`. This is the
"what changed" for anyone picking up the repo.*

---

## 1 · The menu now states the progression (`index.html`)

The landing dek was rewritten from a geometry blurb to the model:

> "The game is always on — you live in it at many magnifications: a node, a board of
> forty-two, a constellation of boards. Each board is a governance assembly for the guides
> you're part of."

…with a **loop strip** beneath it: `choose 6 → fill 42 → capture → assign to a constellation
→ again ↻`, and the Start button's sub-line set to the same spine.

## 2 · The intro opened up — no more "pick fish or mice" (`map.js` INTRO)

The old "three callings · 🐟 fish · 🐭 mice · 🧙 guide" screen framed the station roles as
animal callings you choose between. Replaced by two open screens:

- **seven stations · three shapes per heptad** — "three who scout, three who build, one
  keystone who closes it and holds the seed. **The shapes are fixed; who fills them is open.**"
- **who fills it · an agent, a person, or you** — "Every station is a **trust task**: you
  seat an actor and hold what matters against it — an AI agent, another person, or yourself.
  A guide can seat any kind of actor; **the City of Mages is just the first such game.**"

(The structural 3 scout / 3 build / 1 keystone split that `bootAssert` enforces is unchanged —
it's the fixed *shape*, not a role you pick.)

## 3 · Board ↔ constellation split

The legible collection board was briefly an overlay on the 3D constellation; it **blocked
the visualisation** and didn't match the page's nature (the constellation is the *fractal
flow* of the assignment, not a flat board). So:

- The board **moved to the grid** (where you assemble games — see §4).
- The **constellation** went back to the pure 3D fractal-flow, and now **lights from your
  collection by default** (`fromGrid:true`) and **live-follows** `game42.constellation` via a
  `storage` listener — filling a slot lights its fractal region, live.

## 4 · The grid page, reworked (`grid.html` / `grid.js`)

- **Assign-the-42 board sits below the cards now** (single-column flow): add games/keys →
  the cards → the constellation board → the κ utility.
- **Game vs key is explicit.** A **game** (a set of 42) is the only thing assignable into a
  constellation's 42 — its card keeps the dropdown ("— assign to a constellation (the 42) —").
  A **key** is a role *within* a game; its card shows a note ("seat it on a station via the
  map, not in the 42") instead of the 42-assign.
- **The board itself** is a legible **6 axis-rows × 7 stations** emoji grid — `N/42` progress
  meter, a **"show example (mages)"** ghost (auto-on while the collection is empty), an
  **"open in constellation →"** CTA, click a square to read its game.
- **Proverb is a real spell box** — a full-width, resizable textarea ("type your incantation
  here…") under a labelled **glyph** (emoji) row; cards widened (210px) so there's room to write.
- **The thread legend** (common ground · lineage · mine) moved out of the κ panel into its own
  strip above the cards, where it actually explains the lines between cards. The **"encode a
  κ"** panel is now a clean standalone utility.
- **Dark-theme dropdowns fixed** — the popped-open `<option>`/`<optgroup>` list is now coloured
  to the dark theme instead of flashing white default (grid + map).

## 5 · Map node editor — agent persona vs key (first person) (`map.js`)

The single "pick persona" dropdown became one seat-this-station picker with two groups:

- **agent · {axis}** — the 6 → 42 agent-persona pool (an AI agent seated at the node).
- **key · first person (your keys)** — your collected **City Keys** (read from the grid);
  seating one places *you* / a credential you hold.

One occupant per station — they're mutually exclusive (picking an agent clears a seated key
and vice-versa), routed by the option value (`p:` → `personaBySlot`, `key:` → `keyBySlot`).
If you haven't loaded a key yet: "— load a City Key on the grid first —".

---

## Verification

- `npx vite build` clean across all five pages; `node --check` on the changed `src/*.js`.
- Browser extension was offline this session → verified via the Vite build, served HTML, and
  a Node harness (board emoji mapping: ghost resolves all 42 mages glyphs; a sample collection
  fills the right squares with the right progress).

## Designed, not yet built (next hands)

The progression **stepper** on the map (walk choose-6 → fill → capture → assign → again),
the **trust-task** framing in the node editor, **actor registers** (human / nature /
artificial / alien), the κ **proof-of-presence chain** made legible, the **City-Key bridge**
(source first-person keys from the primary 64-star key), and **node avatars** — a profile pic
alongside the glyph so a seated City Key *appends presence* in the trust graph. Details in the
companion chronicle's NEXT list.

> the shapes are fixed; who fills them is open. an agent, a person, or you.
