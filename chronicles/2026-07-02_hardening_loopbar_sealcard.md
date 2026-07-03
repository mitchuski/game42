# 2026-07-02 · hardening pass + the loop made visible + the seal card

A critique-driven pass over the whole app (plan: `~/.claude/plans/delegated-weaving-waterfall.md`).
Phase A hardened the substrate; Phase B made the six pages play as one game.
Everything below is LOCAL — nothing committed, nothing deployed.

## Phase A — hardening (no visible behaviour change)

- **`src/canon.js` (new)** — the single source for the A1 axis→vertex map, the six
  axis ids, `VALID_VERTS`, `GOLDEN_ANGLE = 137.50776`, and the one shared `esc()`
  (full `&<>"'` coverage). Retired the five drifting copies of the A1 table
  (data / conform / citykey / flower / — the build gate keeps its own copy as an
  independent watchdog and now ASSERTS equality with canon.js) and the three
  inconsistent per-page `esc` variants (grid's escaped only `&<` — user names
  with `"` could break card markup; flower's escaped only `"`).
- **Escape audit** — every `innerHTML` interpolation of user-entered text (grid
  cards/proverbs, map editors, flower petals/legend/centre, territory tooltip /
  inspector / fill log / preset tag) now goes through the shared `esc()`.
- **`test/` + vitest** — 21 tests: `flow.test.js` (lifecycle, all gates, A8
  multiplicative collapse, A10 replay determinism), `hash.test.js` (BOTH κ
  parameterizations pinned to vectors computed from `canonical_serialise.py`:
  game42 demo `4cdab0eb…8f60`, dual-object vectors for bare-hex vs `sha256:`
  city axis), `pngkey.test.js` (round-trip, CRC-32 verified independently,
  multi-keyword coexistence, IEND stays last). `npm test` wired into `npm run build`.
- **`src/store.js` (new)** — versioned localStorage envelope `{__game42v:1, data}`
  for all seven `game42.*` JSON keys, legacy values adopted in place; corrupt
  entries report via `__gerr` instead of silently resetting. (`game42.preset` /
  `game42.intro.seen` stay raw strings by design.)
- **Error surfaces** — the `__gerr` + `#err` pattern (previously territory +
  constellation only) now on map / flower / grid too; the grid's file loader
  reports unreadable files instead of no-opping.
- **Golden angle unified** — main.js twist default and constellation TWIST were
  `138`; both now `GOLDEN_ANGLE` (slider shows 137.5, step 0.1). NOTE: this
  changes the p=1 geometry snapshot, so a seal minted at the default twist
  differs from one minted under the old 138 default — the log replays fine
  either way (twist rides in the snapshot params).
- **Dead code** — fish 🐟 / mice 🐭 presets EXPOSED in the territory + map
  toggles (they were fully defined but unreachable); `loadPreset` accepts them.
  Flower keeps its mages/mine pair (its roots are the mages canon). Removed the
  constellation's duplicate `childBase` fold (now an alias of `parentBase`).
  The κ-lineage `prior` plumbing stays for the Phase-C lineage feature.

## Phase B — one game, not six demos

- **The loop bar (`src/loopbar.js` + `public/game42.css`)** — every page's
  existing `.pagenav` now carries live progress badges (flower n/6 · map k/42 ·
  territory p · constellation c/42 · grid cards) and a lit "→ next move" chip
  computed from the shared store, so the spine `choose 6 → fill 42 → capture →
  assign → again ↺` is visible from anywhere. The six copy-pasted `:root` theme
  blocks collapsed into the one shared stylesheet.
- **Map↔Territory live fill-sync** — territory already followed the `storage`
  event; added focus/visibilitychange re-sync behind a set-signature guard so
  same-tab navigation follows the Map's fills without ever resetting local
  auto-play when nothing changed.
- **The seal card (VISUAL-SPEC §7, finally built)** — `saveSealCard()` in
  main.js + a `✦ Seal card` button (enabled on BOARD_SEAL): the live folded
  render clipped to a disc, six axis arcs on the rim, the ring of 42 names in
  axis colours, the seal hash + `(⚔️⊥⿻⊥🧙)😊` inscription — and the card IS the
  carrier (game42 log + cityKey projection chunks, same as Save PNG).
- **Territory console split** — Play / Game / State / Fill-log / Carry stay up
  top; Fold & feel + Colours folded into a `<details>` "Tune" drawer. A `?`
  keyboard overlay lists F / S / Esc / orbit / zoom / inspect.
- **Accessibility** — `prefers-reduced-motion` now seeds the reduced toggle
  (checkbox remains the override); `role=group` + `aria-label` on the segmented
  controls.

## Verify

`npm run build` = conform gate (incl. canon cross-check) → 21 vitest tests →
vite build, all green. All 7 dev-server URLs 200. **Still never screenshotted** —
the Chrome extension was offline again this session; the screenshot loop remains
the standing first item for a session where it connects.

## Open (Phase C, per the plan)

zoom-into-constellation-node (+ record `parentGuideSlot`) · my42 tutorial flow ·
κ-lineage via `prior` · City-Key mint button on seal · true vesica-piscis fish ·
Confluence page decision. Deploy/federation deferred until explicitly asked.
