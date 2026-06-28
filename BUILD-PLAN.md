# BUILD-PLAN

## phased milestones, stack, acceptance

For the coding agent. Build in order; each phase is shippable.

---

## Recommended stack

- **React + TypeScript.** Fits the existing agentprivacy.ai Next.js stack.
- **react-three-fiber + drei** for the 3D fold and the floating star.
- **2D layer in SVG or Canvas** for the flat lattice, vesica paths and slot states; promote to the 3D scene as the fold engages. Simplest path: render everything in r3f from the start using the precomputed `position2D` as the z=0 plane.
- **State** in a reducer (or Zustand) over the event log from GAME-FLOW.md. Pure, replayable.
- **Hashing** ported from `data/canonical_serialise.py`. Match the serialisation rule exactly (sorted keys, compact separators, excluded fields, UTF-8).
- No browser storage assumptions in the core; persistence is an injected service.

---

## Phase 0: data and types

- Load `data/game-of-42.json`. Generate TypeScript types from it and from `data/schemas.json`.
- Assert at boot: 42 slots, 6 heptads, 3 vision fish / 3 mice / 1 guide each, one keystone per heptad.
- **Acceptance:** types compile; the boot assertion passes; the data renders as a static flat board (no interaction).

---

## Phase 1: flat board

- Render the six heptad triangles at their `heptadCentroid`, each station at its `position2D`.
- Colour by axis and persona class. Render all slots `empty`.
- **Acceptance:** the hexagon of six triangles is visually correct; head apexes point outward; the centre guide sits at each triangle centroid.

---

## Phase 2: state machine

- Implement the slot, heptad and board lifecycles and the reducer from GAME-FLOW.md.
- Wire the event set. Enforce gating: guide opens last, fill order, integrity gate, multiplicative collapse.
- Drive a dev panel that fires events manually.
- **Acceptance:** a scripted event log fills a full game; the board only seals when all six heptads lock; replaying the log reproduces state exactly.

---

## Phase 3: slot visuals and vesica

- Implement the five per-state looks from VISUAL-SPEC.md.
- Implement vision-fish vesica paths and their gleam.
- **Acceptance:** firing events moves slots through all five states with correct visuals; fish introduce head-class slots and fade on seal.

---

## Phase 4: the fold and the latent state

- Implement `p`, the hinge lift, the golden twist, smoothstep easing, the floating star target.
- Per-heptad local fold preview as heptads lock; global twist as `p` rises; board-seal pulse at `p = 1`.
- Implement the latent state (GEOMETRY.md section 5, VISUAL-SPEC.md section 4): the faint latent star with the empty lattice nested inside, the seed pulse, the breath, the once-per-session intro flourish, and the recede-on-first-ignite transition.
- **Acceptance:** before play the board shows the latent star, not a void; the intro flourish plays once; at p=1 the six flaps converge into the star with the golden twist; first ignite recedes the latent star without a jump; reduced-motion path works.

---

## Phase 5: trust protocol and seal

- Port `canonical_serialise.py`. Compute kappa-labels on `TASK_VERIFY` and the group seal on `BOARD_SEAL`.
- Inject the external services as stubs (RPP ceremony, DID, VRC issuer, persistence) behind interfaces.
- Render the shareable seal card.
- **Acceptance:** a completed game produces a stable `gameId`; the same event log yields the same seal; the seal card renders the star, axes, hash and proverb ring.

---

## Phase 6: fractal seam (deferred render)

- Record `parentGuideSlot` and the guide seed pointer. Do not render child games yet.
- **Acceptance:** a sealed game can be referenced as a child of a parent guide slot in data, with no second board rendered.

---

## Out of scope for this build

The RPP ceremony, DID resolution, the VRC issuer, persistence of logs and seals, and the governance voting rules. These are external services and a later spec. The app integrates them through interfaces; it does not implement them.

---

## Definition of done

A user can ignite six roots, fill forty-two slots through fired trust-task events, watch the lattice fold by golden angle into the floating star as it completes, and receive one shareable group seal that is deterministic over the event log. Any incomplete axis prevents the seal.

> build it so that the only way to finish is to finish honestly

(⚔️⊥⿻⊥🧙)😊
