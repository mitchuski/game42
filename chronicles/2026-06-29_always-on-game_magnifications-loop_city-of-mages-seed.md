# 2026-06-29 · the always-on game, its magnifications, and the loop

*A working chronicle of the window that moved the collection board to its right home,
restored the constellation to a pure fractal-flow, and — more importantly — pinned down
the **game model** the rest of the build now follows: an always-on game you live in at
many magnifications, seeded by the City of Mages, saving its states as content-addressed
hashes. These were good prompts; this is the record of them.*

---

## What changed in code this window

### 1 · The collection board moved to the grid (and out of the constellation's way)

A first pass put a legible 6×7 emoji board **on the constellation page** as an overlay.
Mitch's read: the feature is good, but it **blocks the visualisation** and it doesn't
belong there —

> "the board doesn't map into the constellation, it's kinda like a flow of fractal 42's
> throughout the whole game, that progression of assignment."

So the board was **moved to the grid page** (where you assemble games), and the
constellation was **reverted to the pure 3D fractal-flow** it should be:

- **`grid.html` / `grid.js`** — the old `#cboard` position-scatter SVG became a legible
  **6 axis-rows × 7 stations** grid. Each filled square shows its game's emoji on the
  axis colour; an **N/42 progress** meter; a **"show example"** ghost (the City of Mages,
  auto-on while the collection is empty); a **"open in constellation →"** CTA; click a
  square to read its artefact (emoji · name · proverb · κ). Reads the in-memory
  `items` + `assign` (slotId→κ), same store as before.
- **`constellation.html` / `constellation.js`** — the overlay, surface toggle, and ghost
  were removed. Kept the one good side-effect: the 3D star now **lights from the
  collection by default** (`fromGrid:true`) and **live-follows** `game42.constellation`
  via a `storage` listener — so the fractal flow lights *as assignment progresses*.

The division is now clean: **grid = where you assign** (the legible board), **constellation
= the fractal flow** of that assignment (the 1764 children, the greater star). The board
doesn't map *onto* the constellation; the constellation *renders the progression* of it.

### 2 · The starting explanation now states the progression (`index.html`)

The menu dek was rewritten from the geometry blurb to the **model**:

> "The game is always on — you live in it at many magnifications: a node, a board of
> forty-two, a constellation of boards. Each board is a governance assembly for the guides
> you're part of."

…with a **loop strip** under it: `choose 6 → fill 42 → capture → assign to a constellation
→ again ↻`, and the Start button's sub line set to the same spine.

All local. Vite build clean. Browser ext offline → verified via build + a Node harness
(ghost resolves all 42 mages glyphs; a sample collection fills the right squares + progress).

---

## The game model (the spine the rest of the build follows)

These prompts defined the system. Capturing them verbatim-in-spirit so the implementation
can be held to them.

### The loop — the game is always on

```
choose 6  →  fill 42  →  finish the board  →  capture (seal → κ)  →  assign the board
into a constellation (it becomes one node of the next 42)  →  again ↻
```

You don't "finish" the game; you **finish a board**, capture it, place it, and the same
shape opens one magnification out. The game is always on.

### Many magnifications — the fractal of 42's

You **live in many magnifications** of the one game:

- a **node** (deepest) — a single station: an agent or yourself, and the information held
  against it;
- a **board of 42** — six roots × seven stations, one governance assembly;
- a **constellation of boards** — each sealed board is itself a node of the next 42 (the
  1764 children the constellation already renders);
- …and up again.

The pages are not separate apps — they're **zoom levels** of one always-on game. The
navigation should read as magnification, not as tabs.

### Each node is a trust task

> "the information you hold against each node — you assign an agent or yourself in the game
> of 42 — is kinda like a trust task system."

A node holds: **who** (an agent from the 42-pool, *or yourself*) + **what you hold** (its
info / role / an attached key). That triple **is** a trust task. The node editor already
carries persona + info + key — it just needs to be *named* as a trust task and to make
"assign an agent **or yourself**" explicit.

### Games of 42 are governance for the guides you're part of

Each board is a **governance assembly** for a guide (a community / research lineage). The
guide determines who fills it. Long-term, the actors are a **distribution** —

> "ideally we get a distribution of different **human, nature, artificial and alien**
> actors in the game long term depending on the guide."

— four actor registers (human · nature · artificial · alien), seated per the guide.

### The City of Mages is the seed — an agentic game others pick up

The mages board is **auto-filled because Mitch has already filled it that far**. It is the
**City of Mages research-pattern game of 42 agents** — an *agentic* game that others pick
up and **slowly fill**:

> "this guide to agentprivacy game of 42 is done by the City of Mages initially. I'll
> choose to fill slots…"

So the mages preset isn't a demo — it's the **first guide's board**, partly played, open
for the next hand to continue. "Someone meets it where they are up to."

### It encapsulates the existing work — the 7th-Capital trust-graph flow

The elegant part: the system **closes the loop with Mitch's existing identity**.

> "I am already in my own 64-star City Mage Key and the website. See the connection?"

A game **node** ↔ a **vertex on the 64-star City Mage Key** ↔ the **agentprivacy website**
are the *same* identity surface. The game **encapsulates his work and data as 7th-Capital
trust-graph flow** — the node you fill in the game is the same value vertex the City Key
commits to (this is exactly the **cast → value-vertex → κ** mechanism built on
`agentprivacy.ai/model` this week: tuning/holding a node discloses a vertex; the κ commits
to it).

### Saved states = content-addressed hashes = a proof of presence

> "the system for saving states as content addressed hashes makes a hash chain or a lattice
> proof of presence — it's neat."

Every captured board is a **κ** (SHA-256 over canonical JSON). Capturing → assigning →
capturing the constellation chains κ over κ: a **hash chain** when linear, a **lattice
proof of presence** when it branches across the 64-vertex space. The grid already links
games by shared-κ-prefix (common ground) and `prior` (lineage) — that *is* the proof-of-
presence graph. Each capture is a timestamped "I was here, holding this," addressable
forever.

---

## What's implemented vs designed-not-yet-built

**Done this window (local, not pushed):** board moved to grid (6×7, progress, ghost,
open-in-constellation); constellation reverted to fractal-flow + lit-from-collection +
live storage sync; menu starting-explanation rewritten to always-on/magnifications + the
loop strip. Later in the window: the map `INTRO` "three callings (🐟🐭 fish · mice)" screen
**opened up** to "three shapes per heptad — the shapes are fixed; who fills them is open" +
"who fills it · an agent, a person, or you (every station is a trust task)"; grid relaid
out (assign-the-42 **below** the cards) with **game vs key** made explicit (a game = a set
of 42 → a constellation node; a **key = a role within a game**, seated on the map not the
42); **dark-theme dropdowns** fixed (option/optgroup colours, grid + map); the grid proverb
became a **typed spell textarea**; and the map node picker split into **"agent persona"**
(the 6→42 pool) **vs "key · first person"** (your collected City Keys — one occupant per
station, mutually exclusive).

**Designed, NEXT to build (the navigation flow + game logic):**

1. **The progression stepper on the map** — extend the tutor banner into the full loop
   spine: `roots (N/6) → fill (N/42) → ✓ whole → 📸 capture board → assign in a
   constellation →` with the right CTA at each stage (capture = `addMineToGrid` +
   `exportMine`; assign = link to grid; then the magnification line "the game is always on
   — zoom out on the constellation, or start another").
2. **Rewrite the map `INTRO`** screens to the model (always-on · magnifications · the loop
   · governance-for-guides · node = trust task · the City of Mages seed).
3. **Trust-task framing in the node editor** — name the node a *trust task*; make "assign
   an **agent or yourself**" explicit (the `person` 😊 persona = yourself); the info field
   is "what you hold."
4. **Actor-register distribution** — let a guide seat **human / nature / artificial /
   alien** actors per node (persona classes gain an actor register).
5. **Proof-of-presence surfacing** — show the κ hash-chain / lattice lineage as you
   capture → assign → capture (the grid already has the threads; make the chain legible).
6. **The City-Key bridge** — wire the game node ↔ 64-star City Key vertex ↔ website as one
   identity (the cast/value-vertex work on `agentprivacy.ai/model` is the other half). Today
   the map picker already seats "key · first person (your keys)" from the grid collection;
   the bridge is to source that from the *primary* 64-star City Mage Key directly.
7. **Node presence — avatars, not just emoji** (future, Mitch's call): each node can carry a
   **profile pic / avatar** alongside its emoji/glyph. When a **person's City Key is seated
   on a node, its avatar appends *presence* in the trust graph** — the emoji/glyph is the
   *role*, the avatar is *who is actually present*. This is the human/visual face of the
   proof-of-presence κ chain (#5): seating a key = "this person is here, holding this," and
   the avatar makes that legible at a glance. A node's render becomes {axis colour · role
   glyph · presence avatar}; the City Key carries (or points to) the avatar so presence
   travels with identity across magnifications. Storage: an `avatar` alongside `emoji` on
   the artefact / `keyBySlot` entry (URL or embedded data-URI in the key PNG).

## State / pointers

- All local in `C:\Users\mitch\game42` (dev `:4200`) and `agentprivacy_master` (dev `:5000`).
  **Nothing committed or pushed** (don't-push-until-happy stands).
- Sibling chronicle (the setup-flow rework that opened the menu/map split):
  `chronicles/2026-06-29_setup-flow-rework_board-game-of-agents.md`.
- The model-side half (cast → value-vertex → κ → City Key, 7th-Capital flow) lives in
  `agentprivacy_master/docs/chronicles/2026-06-29_session_recap_visual_runtime_casting_game42.md`.

> the board is the hand you're playing; the constellation is every hand you've played;
> the κ is the proof you were there. the game is always on — you only change magnification.
