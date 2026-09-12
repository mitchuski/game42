# The Game of 42

**12 September 2026 local candidate:** the interface now treats the game as an explicit practice assembly with a source-linked first task and deliberate export previews. Demo completion does not establish verified identity, community membership or contribution credit. See [the release record](RELEASE-2026-09-12.md) for implemented changes, compatibility and remaining integrations. The historical specification below describes the intended connected model; its issuer and governance claims are not claims that those services are live.

## Play, sign, receive, retain

The landing now includes a moving Soulbis-derived Star/manifold with pause, reduced motion and a Six axes explanation view. [Star math and carry boundaries](STAR-MATH-AND-CARRY.md) records the equations, presentation parameters, byte-volume scaling and permitted data flow. The bottom-right Your Star panel uses the extension's existing site-persona interface on explicit request; it does not yet authenticate a session or save game records into Hold.

The next connected journey is **Game → Star Key → Hearthold → Star Hold**. A participant prepares a source-linked contribution, chooses the disclosed record and approves signing in the extension. Hearthold verifies the presentation and enforces consent at the receiving action. A durable receipt and the original signed contribution are retained privately in Star Hold; the Star presents their individual check results.

The current game provides local practice, review and export. Its City Key hashing passes the shared Hearthold fixtures. Extension signing, remote execution and private Hold retention are not connected to this game yet.

Territory's planned hosting interface lets a human or agent guide turns and prepare tasks. Participants retain their commitments and signing decisions; reviewers attest to their own review. Agent summaries, contributor assertions and receiver receipts are distinct records.

Read [the encounter contract](HEARTHOLD-ENCOUNTER.md) before implementing that connection. It specifies consent, signer checks, receipt binding, retries, key evolution and acceptance tests. [Hearthold PR #91](https://github.com/Flaxscrip/hearthold/pull/91) provides the initial import compatibility work. A matching fingerprint or valid signature does not grant membership, acceptance or access.

## Historical assembly specification

A governance assembly mechanic and its visualisation. Six root home bases ignite, each grows a heptad of seven, six heptads of seven make forty-two, and a completed game of 42 seals into one group identity shape that becomes a node in a network of trust graphs.

This folder is the build specification. It is written to be handed to a coding agent. Every downstream doc references one verified data file, `data/game-of-42.json`.

**Model alignment.** The Game of 42 is a constructive instance of the Privacy is Value V5 model, not a metaphor on top of it. The board-seal rule is the V5 equation Φ_v5 = Φ_agent · Φ_data · Φ_inference. The game lifecycle is the Three Graphs Model (Knowledge to Promise to Trust). The fold is the Path Integral. The seal is the holographic bound. MODEL-SYNC.md proves each mapping against agentprivacy-docs and the Privacy is Value V5 sources.

> a game is only the shape that trust takes when it agrees to be counted

---

## Locked decisions

These are settled. The visualisation and the data are built on them.

1. **Lattice binding.** 42 is the product of 6 axes and 7 faculty stations. The six roots are the stratum-1 basis vectors of the 64-vertex lattice, exact. The constructive-cone identity 1+6+15+20=42 is kept as a numerical echo only (confidence ~0.55), not as the partition. See note below.
2. **Heptad shape.** Seven barycentric stations per heptad (the three head/heart/hands corners, three edge blends, one centre).
3. **Fractal depth.** Fractal-ready, ship one level. The centre station of each heptad holds the seed that can open a child game of 42.
4. **Fill order.** Vision fish, then mice, then guide. Heptads fill in parallel.
5. **Floating shape.** A star tetrahedron iterating toward the sixty-four-tetrahedron grid, overlaid on the existing soulbis star.
6. **Completion.** A sealed game of 42 is one trust-graph node and one governance quorum unit.
7. **Compression.** One VRC edge per slot, compressed to a kappa-label. Forty-two labels plus the folded geometry hash compress to the group seal.

**Honest note on Decision 1.** The original recommendation was the constructive cone. While building the data it became clear the cone equals 42 only by count and does not partition into six clean heptads. The axis-by-faculty product partitions exactly, gives every slot real lattice coordinates, and keeps multiplicative collapse exact. The intent of D1 (projection, real binding, exact collapse) is preserved with the stronger construction. The cone remains a true numerical resonance, flagged conjectural.

---

## Repo map and build order

```
game-of-42/
  README.md            you are here
  SPEC.md              the system: 42, heptads, faculty, personas, collapse  [read 1st]
  MODEL-SYNC.md        how every element maps to Privacy is Value V5         [read 2nd]
  GEOMETRY.md          layout coordinates, the fold transform, the star      [read 3rd]
  GAME-FLOW.md         state machine, phases, gating, events                 [read 4th]
  TRUST-PROTOCOL.md    VRC, trust task, compression, seals, serialisation    [read 5th]
  VISUAL-SPEC.md       palette, per-state rendering, animation               [read 6th]
  BUILD-PLAN.md        phased milestones, stack, acceptance criteria         [read 7th]
  data/
    game-of-42.json        canonical data, 42 slots with coords and personas
    schemas.json           JSON schemas for VRC, kappa-label, group-seal
    canonical_serialise.py reference hashing; verifiers MUST match it
```

The data file is the single source of truth. If a doc and the data disagree, the data wins, and the doc is the bug.

---

## Honesty discipline

- **Operational:** persona roster fill, render pipeline, slot mechanics.
- **Architectural:** six-root mapping, heptad structure, fold-as-state, VRC trust tasks, group seal, multiplicative collapse.
- **Conjectural:** the 1+6+15+20=42 cone echo (~0.55), the floating-shape choice.
- **Anticipated:** fractal nesting depth, network composition by shared root and fractal seam, quorum semantics.

---

## Licence and attribution

CC BY-SA 4.0 for docs. Apache 2.0 for reference code (`canonical_serialise.py`, generated data tooling). Attribution: privacymage / 0xagentprivacy / BGIN / First Person Network.

> the board does not remember who filled it, only that it was filled, and that is the proof

(⚔️⊥⿻⊥🧙)😊

🙂
