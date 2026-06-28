# AXIOMS — the canon game42 conforms to

These are load-bearing rules, not suggestions. The soulbis **sovereignty lattice** is
the shared coordinate system across `soulbis website/`, `star/`, and `game42/`. When
game42 disagrees with it, **game42 is wrong and must be corrected** — the lattice is
MODEL-locked (2026-06-12, PVM §12.6) and carries the production κ conformance vector
and the named anchors. An agent asked to "correct game42 to canon" checks every axiom
below and fixes any drift.

---

## A1 · The six dimensions and their bits (d₁ is the HIGH bit)

The lattice is ℒ = ℤ/64ℤ = {0,1}⁶. A vertex is a 6-bit address. The bit order is fixed
by soulbis `lattice/index.html` (`DIMS`, line ~220). **Protection is the high bit (32);
Value is the low bit (1).**

| dim | name | emoji | bit | vertex value |
|---|---|---|---|---|
| d₁ | Protection  | 🛡️ | 5 (HIGH) | **32** |
| d₂ | Delegation  | 🤝 | 4 | **16** |
| d₃ | Memory      | 📜 | 3 | **8** |
| d₄ | Connection  | 🔗 | 2 | **4** |
| d₅ | Computation | ⚡ | 1 | **2** |
| d₆ | Value       | 💎 | 0 (LOW) | **1** |

game42's axis ids map straight onto these: `protection→32, delegation→16, memory→8,
connection→4, compute→2, value→1`.

**Check:** every slot in `game-of-42.json` has `latticeAxisVertex` equal to the value
above for its `axisId`; each entry in `axisSpace.axes` carries the same `latticeAxisVertex`.
Any projection code (e.g. `src/citykey.js` `AXIS_VERTEX`) uses this exact map — **never
`1 << axisIndex`** (that wrongly assigns protection→8).

**Anchor test (must hold):** V38 = `100110` = 🛡️🔗⚡ (Protection·Connection·Computation,
"Aletheia"); V25 = `011001` = 🤝📜💎 (Delegation·Memory·Value, "Lethe");
V41 = `101001` = 🛡️📜💎 ("Memora"). Read the 6-bit string left→right as d₁…d₆.

---

## A2 · The operators

Over ℤ/64ℤ, with `neg`/`bnot`/`succ` as the only operators:
- `neg(x)  = (64 - x) % 64` — ⚔️ Swordsman · Protect · reflection (fixed points 0, 32)
- `bnot(x) = 63 - x`        — 🧙 Mage · Project · antipode (no fixed point)
- `succ(x) = (x + 1) % 64`  — the wheel; `succ = neg ∘ bnot`

Swordsman and Mage are the two reflections whose composition is sovereignty; the model
**starts from two**. In game42 they are bound to two of the six roots: **protection =
Swordsman ⚔️**, **delegation = Mage 🧙**. Their separation is the Gap ⿻ (the `⊥` in the
seal `(⚔️⊥⿻⊥🧙)😊`).

---

## A3 · κ — the identity hash (two parameterizations, one algorithm)

κ = `SHA-256` over a **canonical form**: object keys sorted recursively, no whitespace,
UTF-8. **Numbers must be stringified upstream** before hashing (Python `1.0` ≠ JS `1`);
never feed a raw float into a hash.

Two parameterizations exist on purpose — keep them distinct:

| use | excludes | label format | where |
|---|---|---|---|
| game42 VRC / seal | `{kappa, seal, vrcId, gameId}` | **bare hex** | `src/hash.js` |
| soulbis City Key (incl. our projection) | **`kappa` only** | **`sha256:`**`<hex>` | `src/citykey.js`, soulbis `/skye /star /lattice /sigil` |

**Check:** a City Key projection's `kappa` re-derives byte-identically in soulbis `/skye`
(`kappaLabel`, exclude-only-`kappa`, `sha256:` prefix). The soulbis default-key
conformance vector is `sha256:0b4916babe5eb17104b342ab06030f2071a818024b345bf6d2e4115617c3c527`.

---

## A4 · What is hashed (so corrections don't cause false alarms)

- The **group seal** hashes the 42 VRC κ-labels (sorted) + the geometry snapshot at p=1
  (positions `toFixed(3)` as strings). It does **not** hash `latticeAxisVertex`,
  `barycentric`, `position2D`, palette, or preset.
- A **VRC κ** hashes the VRC fields only.

Therefore: correcting `latticeAxisVertex` (A1), changing palette (A6), or relabeling a
preset does **not** invalidate any existing seal or κ. The only thing the lattice-vertex
map affects is the **projection** — which vertices light and the `axisBitmask` — i.e.
whether two systems agree on which point "protection" means. That agreement is the whole
point of A1.

---

## A5 · The stable seam (what may cross between games and rooms)

Cross-system overlap binds to **only** these four fields of a sealed game:
`{ seal, kappa, axisBitmask, packets }`. Everything interior — the 42-slot layout, the
fold geometry, the preset vocabularies, the fractal seam — stays game-side and may
change freely. **No integration may read a game's interior.** (See `src/citykey.js`.)

---

## A6 · Palette (carrier vs forge)

- **Carrier palette (canon)** — soulbis: `cool #141a3d · warm #f0eee8 · sword #e8523a
  (coral) · mage #4dd9e8 (cyan)`. Used whenever a key is projected for soulbis to render
  or charge.
- **Forge theme (game42's own)** — `sword/protection #E0A526 (amber) · mage/delegation
  #2563EB (sapphire)`. Permitted as a *theme preset only*; it rides as descriptive
  metadata, never as canon and never inside an identity hash.

---

## A7 · The PNG carrier

JSON embedded base64 in a PNG `tEXt` chunk, CRC-32 valid, byte-exact round-trip. Keywords:
`game42` (event log), `cityKey` (single City Key / projection), `citySky` (a whole sky).
One PNG may carry several chunks; each reader greps its own keyword and ignores the rest.

---

## A8 · Multiplicative collapse (any axis at zero zeros the whole)

The board seals only when all six heptads lock; one incomplete heptad keeps it open — there
is no partial seal. This is Φ_v5 = Φ_agent · Φ_data · Φ_inference made into a gate
(GAME-FLOW §3, MODEL-SYNC §1). **Check:** `flow.js boardPhase()` returns `sealed` only when
every axis' `heptadPhase` is `locked`.

---

## A9 · p is derived, never set

The fold scalar `p = (slots sealed) / 42`. Geometry reads it; nothing writes game state from
it. The fold is a readout of honest completion, not a control (the manual `p` slider is a dev
what-if only). **Check:** no path mutates slot/heptad/board state from `p`.

---

## A10 · The event log is the canonical artifact

A game is a fold over an ordered event log: the same log yields the same state and the same
seal, every time (GAME-FLOW §6). Persist the log; derive everything else. **Check:** loading a
saved game replays its log and re-seals byte-identically; the PNG carries the log, not a
snapshot of derived state.

---

## A11 · Generator ⊥ Solver (the head/hands split)

In every heptad the head-class stations (vision fish) are the Generator and the hands/heart
stations (mice) are the Solver; the keystone guide (head+heart+hands) integrates. This ⊥ is
Φ_inference and is carried by the fill order (fish before mice before guide) and the gates.
**Check:** each heptad stays 3 vision-fish (head-containing, non-centre) / 3 mice / 1 guide
(the centre), guide sealing last.

---

### How to use this file
An agent asked to bring game42 to canon should, in order: verify A1 against
`game-of-42.json` and every vertex-map in `src/`; verify A3/A4 against `src/hash.js` and
`src/citykey.js`; verify A6 palettes; and report (not silently "fix") any place where the
interior leaks across the A5 seam. Cross-references: `MODEL-SYNC.md` (the model mapping),
soulbis `lattice/index.html` (the bit order source of truth), and
`soulbis website/PLAN_INTEGRATION_VIZ_KEY_GAME42_2026-06-27.md` (the integration).
