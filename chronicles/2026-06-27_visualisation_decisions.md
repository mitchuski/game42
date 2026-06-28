# Chronicle — Building the Game of 42 visualisation engine

**Date:** 2026-06-27
**Scope:** the first standalone visualisation engine for the Game of 42, built from
Mitch's spec docs in this directory.
**Stack as built:** vanilla Three.js (r0.161) + Vite. Standalone, no framework.

> a game is only the shape that trust takes when it agrees to be counted

---

## 0. How we got here

The build began as a loose ask — *"a visualisation like soulbis /star + /lattice +
/sigil, but for game42, a floating expanding/contracting shape, editable, saved as an
encoded PNG."* Through a decision-sync we locked an early sketch (6 root clusters of 7,
toggle "lenses", a new manifold). Then Mitch dropped the real specification into the
directory — `SPEC / GEOMETRY / GAME-FLOW / TRUST-PROTOCOL / VISUAL-SPEC / BUILD-PLAN /
MODEL-SYNC` + `game-of-42.json / schemas.json / canonical_serialise.py` — under one
rule: **the data wins; if a doc and the data disagree, the doc is the bug.**

So several early guesses were *corrected by the spec*, not by preference. That is the
most important thing this chronicle records: where the engine follows the canon, and
where the canon left room we have not yet filled.

---

## 1. Key visualisation decisions (as built)

### D-A · 42 = 6 axes × 7 faculty stations (corrected from the early sketch)
The early sketch read "6 roots each recruit 7" as *1 root + 6 recruits*. The spec
binds it harder: 42 is the **product** of 6 lattice axes and the **7 non-empty subsets
of the head/heart/hands cube**. Each heptad is an equilateral triangle of seven
barycentric stations — 3 corners, 3 edge-midpoints, 1 centre. Coordinates are
precomputed in `game-of-42.json` (`position2D`, `heptadCentroid`); the engine never
invents geometry, it reads it. *Why it matters:* every slot now carries a real lattice
axis vertex and a real faculty cube vertex; the multiplicative collapse is exact.

### D-B · Personas are simultaneous classes, not toggle lenses (corrected)
The early sketch made vision-fish / mice / privacy-guide three switchable lenses. The
spec makes them **three persona classes co-present on every heptad**: vision-fish = the
three head-containing non-centre stations (rendered as **vesica paths** from the root),
mice = the hands/heart builders (gold nodes), privacy-guide = the centre keystone
(sapphire-ringed, seals last). The "lens" framing survives only as canon-binding lore
(fish→vision work, mice→Mouse Spellbook, guide→City of Mages) in MODEL-SYNC, not as UI.

### D-C · The floating shape is a *fold*, not a separate manifold equation (corrected)
The early sketch proposed a new `r(θ,φ)` 6-lobe manifold. The spec's Decision 5 is
cleaner: the **flat hexagon lattice folds into a star tetrahedron**. Two coupled
motions driven by `p = sealed/42`: a per-heptad **hinge lift** (≤ `THETA_MAX` 70°) on
the centre→centroid axis, and a global **golden twist** (137.50776°), both on
smoothstep easing. At `p=0` it is the flat board; at `p=1` the six flaps converge into
a separate, semi-transparent star that brightens with completion. The fold *is* the
path integral made visible (MODEL-SYNC §3).

### D-D · The fold is driven by game state, never set directly
`p` is derived from the reducer (count of sealed slots / 42). The flat→star transition
is therefore a readout of honest completion, not an animation control. The manual
`fold p` slider exists only as a dev affordance and is explicitly flagged as "ignore
play".

### D-E · Per-state visual grammar (VISUAL-SPEC §2, as built)
empty (dim dashed) → proposed (vesica gleams in) → in_progress (pulse) → verified
(full axis fill) → sealed (gold rim, flap begins to lift). Crystallising, not
assembling: smoothstep everywhere, nothing snaps. A reduced-motion toggle replaces
pulses/drift with static states.

### D-F · The seal is the identity, and it lives on the boundary
A completed game produces one **group seal** = SHA-256 over the 42 kappa-labels +
the folded geometry hash, matching `canonical_serialise.py` exactly (verified: JS
kappa byte-matches the Python reference, `4cdab0eb…`). Boundary encodes bulk — we hash
the edge-labels and the fold, never the interior states (MODEL-SYNC §4).

### D-G · The carrier embeds the event log, not just a picture
The exported PNG carries the **ordered event log** in a `game42` tEXt chunk; re-import
replays the log and reconstructs the exact state and seal. This honours GAME-FLOW §6
(the game is a fold over an ordered log; persist the log, derive everything).

### D-H · Stack: vanilla Three.js + Vite (divergence from BUILD-PLAN, by choice)
BUILD-PLAN recommends React + react-three-fiber for eventual Next.js integration. We
built vanilla because (a) Mitch chose Three.js+Vite in the decision-sync, (b) the doc
itself blesses the "render everything from `position2D` as the z=0 plane" simplest
path, and (c) standalone ships faster. The `flow / hash / geometry` modules are
framework-free and port cleanly to r3f later. **This is the most reversible decision.**

---

## 2. What is real vs stubbed

- **Real:** the data, the reducer + all gates (fill order, guide-seals-last,
  multiplicative collapse), kappa + group-seal hashing (cross-impl verified), the fold,
  the five slot states, the vesica paths, the PNG carrier, the dev driver.
- **Stubbed behind seams (out of scope per spec):** the RPP ceremony, DID resolution,
  the VRC issuer, persistence. `demoVRC()` stands in so the seal is deterministic and
  demonstrable. The named 42-persona roster ships as `personaTemplate` defaults.

---

## 3. Where it could be improved / changed

Ordered roughly by leverage. Several are the docs' own *Anticipated* items.

1. **True vesica piscis, not a curve.** Fish are currently a lifted bezier "path" with a
   travelling gleam — a faithful *path*, but GEOMETRY §4 specifies the actual
   vesica lens (intersection of two circles on root + slot). Upgrade to the real lens
   geometry with the arc-pair and the gleam riding the lens.
2. **Star registration.** GEOMETRY §3 deliberately leaves the flap→star convergence
   "aesthetic, tuned with THETA_MAX and R_local." Worth a tuning pass (and possibly the
   64-tetrahedron subdivision motif) once viewed at 4200 — the silhouette at p=1 is the
   thing to judge by eye.
3. **Per-slot event panel.** BUILD-PLAN Phase 2 wants a dev panel that fires individual
   events (propose/start/verify/seal a chosen slot, abandon, withdraw) and shows
   rejection reasons. We shipped the *auto* driver (`nextAction`) and a Step button;
   the manual single-slot panel + rejection log is still to add.
4. **Shareable seal card (VISUAL-SPEC §6).** On board-seal, render the folded star in
   plan view, the six axis colours, the short group-seal hash, and the 42 lowercase
   ceremony proverbs as a ring — the group identity made portable. Not yet built; the
   PNG carrier exists, the *card* composition does not.
5. **Fractal seam (Decision 3 / TRUST-PROTOCOL §5).** Record `parentGuideSlot` and the
   guide seed pointer; render the inward spiral hint on a sealed guide; defer child
   boards. Currently the guide ring wakes on seal but the seed pointer isn't recorded.
6. **React + r3f port** if this folds into agentprivacy.ai. Keep `flow/hash/geometry`
   as-is; wrap the scene in r3f, drive `p` from the reducer via Zustand.
7. **Honesty-flagged conjectures to keep visible:** the 1+6+15+20=42 cone echo (~0.55)
   and the 96/64 = P^1.5 resonance are *not* the partition — if any UI ever surfaces
   "why 42", it must show the product as load-bearing and the cone as resonance only.
8. **geometryHash semantics.** We snapshot p=1 positions as 3-dp strings (cross-impl
   safe). If a third party must reproduce the seal, this rounding rule needs to be
   written into TRUST-PROTOCOL alongside the canonical serialisation rule.
9. **Performance.** 42 individual meshes + per-frame line rebuilds is trivial now, but
   if fractal children render later, move to instanced meshes and a single line buffer.
10. **Economic / trust-tier surface (MODEL-SYNC §9).** Trust tiers (Blade/Light/Heavy/
    Dragon) and the Ceremony/Signals value flow are out of scope here but are the
    natural next mapping once the trust-task service exists.

---

## 4. Verification at time of writing

- `npm run build` clean (15 modules).
- Headless engine self-test 18/18: full game seals, p=1, all six heptads lock,
  guide-gate holds, multiplicative collapse holds, **replay → identical seal**.
- JS kappa === Python `canonical_serialise.py` (`4cdab0eb939a89c0…`).
- **Not yet eyeballed in a browser** — the WebGL render needs a human (or a connected
  browser) to judge the fold silhouette and the fish lenses. Next: serve at :4200.

---

## 5. Addenda (same day, after the spec + feedback iterations)

- **Light bug (root cause of the first blank render):** this Three.js makes `light.position`
  a read-only accessor; `Object.assign(new PointLight, {position})` threw at init and killed
  the scene. Fixed to `.position.set()`. An on-screen error overlay was added so silent WebGL
  failures surface.
- **Latent state (doc sync):** GEOMETRY/VISUAL-SPEC/BUILD-PLAN gained the `p=0` latent state —
  implemented: faint full-size latent star, nested empty lattice, centre seed + six ignition
  threads, display-only breath fold (`0.06·(0.5−0.5cos(2πt/6))`), one warm ignitable root with
  "map the first star", once-per-session intro flourish, smoothed recede on first ignite,
  reduced-motion static path. Constants per GEOMETRY §6.
- **Marble nodes + label dedup (feedback):** nodes became glossy `MeshPhysicalMaterial`
  (clearcoat) marble orbs carrying the colour key; the 18 repeating corner labels were removed
  (identical on every heptad) and moved to a one-time legend; six distinct root labels kept.
- **`[f]` focus mode (carried from soulbis):** chrome fades, presentation orbit with a polar
  sway as the breath, `[s]` snaps, Esc/F/tap exits.
- **surface / wire / normal star modes (carried from soulbis):** toward visualising overlap
  into the 64-tetrahedron manifold. Still pending: the actual multi-game mosaic + the
  42→42→42 fractal runtime + the 2D sibling.

---

## 6. Line in the sand — pass 2 (2026-06-27, later)

A fast iterative session. What shipped, what's queued.

### Built and live (served at :4200, three pages)
- **Multi-page app** — `territory` (3D board), `map` (2D legend), `constellation`
  (the capstone). Cross-page nav; Vite multi-entry; `base:'./'`.
- **Map page** (`map.html` / `src/map.js`) — the step-by-step path that fills the
  territory, as a 2D SVG plan + walkthrough (board lifecycle → heptad phases → the
  7 fill-order stations → trust-task→VRC→κ→seal → the six roots). Reads the data;
  click a station to read it.
- **Chrome facet star** — facet is the default and is now a metallic + iridescent +
  clearcoat material reflecting a `RoomEnvironment` PMREM env map (real chrome),
  still sword/mage **colour-tintable** (metal uses colour as reflection tint). The
  marble nodes pick up the env reflections too. `surface` = sword/mage coloured glow
  faces; `wire` = edges only.
- **Smoothed fold** — auto-play no longer "gear-clicks"; the fold eases toward the
  target each frame (`visP` / `visHept` lerp), gliding between discrete seals.
- **Three game presets** (`src/presets.js`) — 🐟 Vision Fish · 🐭 Mice · 🧙 City of
  Mages, rotate on both Territory + Map (shared via localStorage). Each **relabels
  the six roots AND the personas**, carries an accent, and a **unique ignite order**
  so each auto-play enters the lattice differently. Persisted into the saved PNG.
  Default-glyph note: all six roots now carry a glyph (forces ⚔️🧙🪞🤝 + compute ⚡ +
  value 💎) so the set holds style.
- **Territory hover tooltips** — hovering a node shows axis (in the active game's
  word) · persona class · role · state, the same info the Map carries.
- **Constellation** (`constellation.html` / `src/constellation.js`) — **42 games of
  42 = 1764 stations** fold into one greater star-tetrahedron manifold: each station
  of a parent game becomes its own folded game of 42, rendered as a lit points
  mosaic around the big facet star, with parent anchors + centre threads, a
  spread/lit/spin/wave panel, and a light-wave that sweeps the 42 games in order.
  First cut of the **42×42 → soulbis-like manifold** + the **"all my games" personal
  /star**. *Refined:* bigger child games + the 42 games linked by the parent game's
  own lattice edges (manifold web), constellation focus mode, and **⭐ insert your
  star** — upload a soulbis `cityKey` PNG to tint the greater star to your palette +
  show your name/κ (the constellation's take on the Confluence: your star inserted).
- **Bugfix:** `relabelRoots` referenced the removed `FOUR_FORCE` after the 6-glyph
  switch and blanked Territory; now uses `AXIS_GLYPH`.
- **/grid page (BUILT)** (`grid.html` / `src/grid.js`) — the plurality of self & other.
  Load/drop game-of-42 + City-Key PNGs/JSON; each renders a **sigil** (κ as a
  64-glyph mandala — the soulbis /sigil ported here). Threads: teal = shared κ-prefix
  (common ground), gold = lineage (`prior`). Click = mark mine. **save grid** → a PNG
  carrying all κ (`kind:'grid'`, re-loadable). **κ-encoder** panel derives a content
  address from pasted JSON via the same canonical SHA-256 as the seals. `pngExtract`
  now takes a keyword param. Nav now territory · map · constellation · grid.
- **Constellation harmony (BUILT):** inserting a star also raises the soulbis-style
  **manifold shell** (`r=R+ε·sin(mφ)·cos(nθ)`) + the **64-vertex icosahedral lattice**
  from the key's geometry/palette, with the 1764 games lighting up *inside* the shape.
- **Editable Map (BUILT):** a 4th game **✎ mine** (`loadCustom`/`saveCustom` in
  presets, localStorage) seeded from City of Mages and edited on the Map — name,
  tagline, the six root labels, the three persona labels, and **per-station roles**
  (click a station to rename). Autosaves; the **Territory follows** (root labels +
  tooltips use the custom language when 'mine' active). Map = the one interface a
  hitchhiker uses to generate + language a game of 42.
- **Grid persistence (FIXED):** loaded games/keys (+ mine flags) persist to
  localStorage and restore across navigation.
- **Still queued:** standalone **Confluence** page (constellation already does
  nested-in-manifold for a single key); root *reasons*/change-the-roots; optionally
  surface custom roles into the Constellation/Grid labels.

### Decisions locked this pass
- Facet = default look; surface/wire are subtractions; facet recovered as chrome.
- Presets relabel axes + personas; emissary interlock reframed *into* the
  Constellation (folding layers at scale) rather than as 12 markers on one board.
- Confluence: **nested** (64-manifold shell, board folds at core, stella cores fuse)
  + outputs a **unified PNG + joint κ**. Spec in `SCREENS.md`. Not yet built.

### Anticipated / next (the line in the sand — not yet built)
- **/grid page** (NEW concept, this pass): a page to **save/assign game-of-42 PNGs
  into a grid**, giving the plurality-of-self-and-other feel — many trust-graph games
  laid side by side and connected. The **Confluence** (two-PNG overlap) is the
  pairwise case; /grid is the many case. Likely home for:
- **The sigil here** — port the soulbis `/sigil` (understand + encode the SHA/κ
  hashes; the κ-derivation theatre + glyph constellation). It belongs in game42,
  probably **inside /grid** (or its own page), since both are about reading the
  hashes that identify a game/key. Our `hash.js` already speaks the same canonical κ.
- **Editable Map + roots** — make the Map fillable (inputs for roles/info per
  station), give each root a longer *reason/description*, and an option to **change
  the roots** (distinct from seating emissaries). Edits flow back as the tooltips on
  both pages.
- **Confluence page** — build per `SCREENS.md` (needs a `cityKey` PNG extractor +
  ported soulbis manifold/lattice/core).
- **Emissaries on a single board** — if still wanted beyond the Constellation.

> the territory is the shape; the map is the path; the constellation is all my games
> become one star; the grid is where self and other games meet and are counted

(⚔️⊥⿻⊥🧙)😊
