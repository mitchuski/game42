# SPEC

## the system

**Read this first.** Defines what the Game of 42 is, independent of how it renders.

---

## 1. Two spaces, one product

A governance position answers two questions: which axis do you serve, and which faculties do you bring. The board is the product of those two spaces.

**Axis space.** The six roots are the six axes of the privacy value model, which are the six stratum-1 basis vectors of the 64-vertex sovereignty lattice {0,1}^6. There are exactly C(6,1) = 6 of them.

| Root | Axis | Lattice bit | Lattice vertex | ZK dimension | Agent |
|---|---|---|---|---|---|
| compute | intelligence / learning | 0 | 000001 | learning | |
| connection | network | 1 | 000010 | connection | |
| delegation | agency | 2 | 000100 | agency | Soulbae 🧙 |
| protection | boundary | 3 | 001000 | privacy | Soulbis ⚔️ |
| memory | continuity | 4 | 010000 | continuity | |
| value | capital / compliance | 5 | 100000 | compliance | |

Protection binds to the Swordsman (boundary, amber-gold) and delegation to the Mage (agency, sapphire-blue). That is the canonical dual-agent split appearing as two of the six axes.

**Faculty space.** A 3-cube over head, heart and hands. The seven non-empty subsets are the seven stations of a heptad. The empty subset (no faculty) is the void and is never a slot.

```
head = bit 0,  heart = bit 1,  hands = bit 2
```

**The product.** 6 axes times 7 stations is 42. The board is the set of pairs (axis, station). This partitions exactly into six disjoint heptads of seven. Every slot carries a real lattice axis vertex and a real faculty cube vertex.

**Numerical echo (conjectural, ~0.55).** The constructive cone of the lattice, vertices within stratum 3 of the origin, also has size C(6,0)+C(6,1)+C(6,2)+C(6,3) = 1+6+15+20 = 42. Both the cone and the product equal 42. This is recorded as resonance, not as the partition.

---

## 2. The heptad of seven

Each heptad is one axis subdivided into the seven faculty stations. The persona class is read from the station.

| Station | Faculty subset | Persona class | Role | Fill order |
|---|---|---|---|---|
| {head} | head | vision fish | lead advisor | 1 |
| {head, heart} | head + heart | vision fish | visionary advisor | 2 |
| {head, hands} | head + hands | vision fish | strategist maker | 3 |
| {hands} | hands | mouse | lead builder | 4 |
| {heart, hands} | heart + hands | mouse | caring builder | 5 |
| {heart} | heart | mouse | steward builder | 6 |
| {head, heart, hands} | head + heart + hands | privacy guide | keystone guide | 7 |

**Class rule (deterministic).** Vision fish are the head-containing stations that are not the centre. The privacy guide is the centre, the one station holding all three faculties. The mice are the rest. This yields exactly three vision fish, three mice and one guide per heptad.

**Why the guide is the centre.** The centre {head, heart, hands} is the only station that contains all three faculties, so it is the only one that can contain the whole. That is the structural reason the guide holds the fractal seed: only the part that holds all three can hold a child game of 42.

---

## 3. The three personas

- **Vision fish (head).** Hitchhiker advisors. They translate the root's vision into the buildable questions, which are the open head-class slots. They read as paths before they are positions, which is why they arrive first.
- **Mice (hands).** The builders. They take the translated questions and ship the slots.
- **Privacy guide (heart, centre).** The integrator. Closes the heptad, holds the fractal seed, can open a child game.

Persona templates are drawn from the agentprivacy skill pool. Lead templates per class: vision fish topologist, mouse forgemaster, guide soulbis/soulbae. The per-slot assignment is in `data/game-of-42.json` under `personaTemplate`. **[Operational]** The full named roster of forty-two personas is a fill task; the data ships sensible defaults.

---

## 4. Multiplicative collapse

The board seals only when all six heptads lock. If any single heptad never completes, the board cannot seal. This is the multiplicative collapse property of the model made into a hard game rule: any axis at zero zeros the whole. It is enforced in the game flow, not left to the geometry.

This is the V5 separation equation Φ_v5 = Φ_agent · Φ_data · Φ_inference, made into a gate. The three V5 axes also appear inside the game: protection root ⊥ delegation root is Φ_agent, distributed membership is Φ_data, and vision fish ⊥ mice is Φ_inference (Generator ⊥ Solver). See MODEL-SYNC.md section 1.

---

## 5. Completion

A sealed game of 42 produces one group identity shape: a content-addressed seal over the forty-two kappa-labels and the folded geometry hash. Same membership, same fold, same seal. This seal is the trust-graph node id. Games compose into a network two ways: by shared axis root, and by fractal seam, where one game's guide becomes the root context of a child game. See TRUST-PROTOCOL.md.

This lifecycle is the Three Graphs Model walked in order: the empty board is the Knowledge Graph (what can be promised), the forty-two VRC edges are the Promise Graph (what is promised), the sealed game is the Trust Graph (which promises were kept). See MODEL-SYNC.md section 2.

> the answer that means nothing without its question is exactly a quorum

(⚔️⊥⿻⊥🧙)😊
