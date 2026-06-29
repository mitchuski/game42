# 2026-06-29 · the setup flow — the Game of 42 as filling a board of agents

*A design note / roadmap. The site should feel like literally **filling a board
game of agents**: `mages` is the worked example you study, `my42` is empty and
you fill it through organic, AI-assisted **tutorial setup steps**, and the
outcome — a started trust-graph game — should feel magical. This note is the
"for later" capture; it should be projected to the **guide wiki
(guide.agentprivacy.ai) under game-of-42** once that host is live.*

---

## The feeling we're after

You don't "configure an app." You **fill a board with agents**, one trust task
at a time, and watch a group identity fold into being. The interface is the
board; the act of filling it is the game.

- **`mages`** — the complete board. The worked example: all 42 slots filled, the
  star sealed. New players study it to see what "done" looks like.
- **`my42`** — empty. You walk the **tutorial setup steps** to fill it in your
  own language, with AI help, and the board assembles as you go.

## The two doors (clear for newcomers)

The landing is a Start / Join menu (the Emergence Spell frames arrival — *the
right people arrive*). The two doors should read instantly to a newcomer:

- **Start Game** → begin a `my42` of your own. Enter the tutorial setup.
- **Join Game / Load** → arrive at an existing assembly (load someone's graph
  state — see the load-screen note below). Joining is by invitation, not
  recruitment.

## The tutorial setup (the heart of the rework)

`my42` starts empty and fills through guided steps that walk the **Three Graphs
Model — Knowledge → Promise → Trust** (MODEL-SYNC §2):

1. **Knowledge** — name your six roots / axes in your own language (seeded from
   `mages`, edited freely). The empty board: 42 open slots, the positions
   available.
2. **Promise** — fill slots one at a time. Each fill is a **trust task** (RPP →
   mints a proverb) → a **VRC edge** → a **κ-label** (SHA-256) → verified →
   sealed. AI help proposes candidates, drafts the proverb, and the player
   confirms — organic, not a form.
3. **Trust** — as the ordered fills accumulate, the lattice **folds by the golden
   angle into the star** (the path integral made visible, MODEL-SYNC §3). When
   all six heptads lock, the board **seals** — a group-identity node enters the
   network.

The magic is in (2)→(3): the player does small, legible acts; the **outcome**
(a folded star, a sealed trust graph, a node among others) feels larger than the
sum of the steps. That's the emergence.

## The first trust task = access

The act of starting / joining is itself the **first trust task** — it grants
access. Framed mobile-app-first: completing the first task issues a **cookie or
token** that lets you **write** — to a wiki page, a local machine, or the
assembly — and so **join the knowledge → promise → trust graph**. Access is
earned by doing the first promise, not by signing up. (Decision pending: the
exact token mechanism — see open questions.)

## The load screen (newcomer entry)

"Load / Join" should load **someone else's graph state** — click a **picture**
(a sealed game's sigil PNG) and **enter** that board. The current `grid.html` is
the *plurality* view (assembling many games into one trust graph) — keep that as
a deliberate mode, but the newcomer "Join" path should be the simple
click-a-picture-to-enter loader. (See the 2026-06-29 grid/load note.)

## Carried from this session

- Landing is a Start/Join menu; map moved to `/map.html`; the **Emergence Spell**
  frames arrival.
- Preset toggle trimmed to **`mages` (complete example) + `my42` (start fresh)**;
  fish/mice retained as loadable example canons so each persona builds its own
  canon from the start.
- MODEL-SYNC reconciled to the live instruments (C7 gate · path integral ·
  P^1.5) + a V6 moving-ceiling note (a sealed game has a shelf life t\*).
- Fill-status is **not yet** mirrored map↔territory (map writes `game42.locked`;
  territory runs its own auto-play) — wiring this is the prerequisite for "watch
  the graph evolve."

## Open questions (decisions before build)

1. **Trust-task-for-access mechanism** — what does the first task issue?
   a local-only token (localStorage / a saved key file), a FedWiki write-cookie,
   or a portable credential (the City-Key pattern)? Mobile-first changes this.
2. **AI help in setup** — suggestion-only (drafts proverbs / proposes candidates,
   player confirms) vs. a fuller co-author. What model/where it runs.
3. **Tutorial depth** — fill all 42 guided, or fill the six lead slots (one per
   heptad) and let auto-play complete the rest?
4. **Start lands on** — the map (legible 2D walkthrough, best for a tutorial) or
   the territory (3D fold, best for the magic)? Likely map for setup → territory
   for the reveal.

## Next steps

- Wire fill-status sync (territory follows `game42.locked`, live) — makes "watch
  it evolve" real.
- Build the `my42` tutorial setup flow (Knowledge → Promise → Trust).
- Clarify + implement the first-trust-task-for-access token.
- Project this note into the guide wiki under game-of-42 when the host is live.

> knowledge becomes promise becomes trust; you fill a board, and the right people arrive.
