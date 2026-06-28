# GAME-FLOW

## state machine, phases, gating

Pure logic, no rendering. Implement as a reducer over events. The geometry and visuals subscribe to this state; they never drive it.

---

## 1. Slot lifecycle

Each of the 42 slots moves through five states:

```
empty -> proposed -> in_progress -> verified -> sealed
```

- **empty**: nothing yet.
- **proposed**: a vision fish path has introduced a candidate (head-class slots can self-propose; others are proposed once their heptad is ignited).
- **in_progress**: a trust task has started for this slot (a candidate is doing the work).
- **verified**: the trust task passed and a VRC edge was issued and kappa-compressed. The integrity gate h(tau) must be satisfied to reach this state. Unverified history does not advance.
- **sealed**: the slot is locked into the heptad. A sealed slot is immutable.

Allowed transitions only as above, plus `in_progress -> empty` on abandon, and `proposed -> empty` on withdraw. No backward step out of `verified` or `sealed`.

---

## 2. Heptad lifecycle

Each of the 6 heptads:

```
dormant -> ignited -> fishing -> building -> sealing -> locked
```

- **ignited**: the root lights; the axis is declared; the empty triangle appears.
- **fishing**: the three vision-fish (head-class) slots are open for proposal and work. Fill order 1, 2, 3.
- **building**: at least the lead advisor is verified; the three mouse slots open. Fill order 4, 5, 6.
- **sealing**: all three vision fish and all three mice are verified; the centre guide slot opens. Fill order 7.
- **locked**: all seven stations sealed, guide sealed last. The heptad folds (its flap lifts). Immutable.

**Gating inside a heptad.** The guide (centre, fill order 7) cannot reach `in_progress` until the other six are `verified`. This enforces guide-seals-last and gives the keystone its meaning.

Heptads run in parallel. Six can be at different phases at once.

---

## 3. Board lifecycle

```
seeded -> assembling -> sealed
```

- **seeded**: board centre lit, six roots dormant or igniting.
- **assembling**: one or more heptads past dormant, not all locked.
- **sealed**: all six heptads locked. The board folds whole (p -> 1), the group seal is computed, the game becomes a trust-graph node.

**Multiplicative collapse (hard rule).** The board reaches `sealed` only when all six heptads are `locked`. If any heptad is short even one verified slot, the board stays `assembling`. There is no partial seal. This is the any-axis-zero-zeros-the-whole property as a gate.

---

## 4. Completion scalar p

```
p = (count of slots in state 'sealed') / 42
```

`p` drives the fold in GEOMETRY.md. It is derived state, never set directly.

---

## 5. Events

The reducer consumes these. Names are suggestions; keep them stable for the visual layer.

```
ROOT_IGNITE        { axisId }
FISH_PROPOSE       { slotId, candidateDid }        proposed
TASK_START         { slotId, candidateDid }        in_progress
TASK_VERIFY        { slotId, vrc, kappaLabel }     verified   (gate: h(tau) ok)
SLOT_SEAL          { slotId }                       sealed
HEPTAD_ADVANCE     { axisId, phase }                derived, emitted by reducer
BOARD_SEAL         { groupSeal }                    emitted when all six lock
TASK_ABANDON       { slotId }
PROPOSAL_WITHDRAW  { slotId }
```

`TASK_VERIFY` is the only event that may be rejected by the reducer (failed integrity gate, wrong fill order, guide opened too early). All rejections are explicit and logged; the visual layer shows the reason.

---

## 6. Determinism and replay

The full game is a fold over an ordered event log. Given the same log, the same state and the same group seal result every time. This makes a game of 42 auditable and shareable as its log plus its seal. Persist the log; derive everything else.

> nothing seals until the keystone, and the keystone cannot be laid until the rest is true

(⚔️⊥⿻⊥🧙)😊
