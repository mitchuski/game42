# TRUST-PROTOCOL

## VRC, trust task, compression, seals

How a slot fills, how it compresses, how a game seals, how games compose. Schemas in `data/schemas.json`. Hashing reference in `data/canonical_serialise.py`. Verifiers MUST match the reference or they will produce false negatives.

---

## 1. The trust task

A slot does not fill by a click. A candidate completes a trust task: a bilateral ceremony between the candidate and the heptad root, following the Relationship Proverb Protocol (RPP). The ceremony mints a lowercase relationship proverb and establishes polarity (Promise Theory plus or minus). The task evidence is referenced, not embedded.

Output of a passed task: one Verifiable Relationship Credential (VRC) edge.

---

## 2. The VRC edge

A VRC is the bilateral edge candidate to root for one slot. Schema: `VerifiableRelationshipCredential` in `schemas.json`. Key fields: `slotId`, `axisId`, `candidate.did`, `root.did`, `polarity`, `proverb`, `trustTaskRef`, `issuedAt`.

One VRC per slot. Forty-two VRCs in a complete game.

---

## 3. Compression to a kappa-label

The VRC is compressed to a kappa-label: a content-addressed seal over its canonical serialisation.

```
kappa = SHA-256( canonical(VRC) )
```

`canonical` is defined in `canonical_serialise.py`: sorted keys, compact separators `(",", ":")`, the `kappa` and `vrcId` fields excluded from their own input, UTF-8. This rule is canonical 0xagentprivacy serialisation and must be documented to any third-party verifier to prevent false negatives.

Filling a slot is: pass the task, issue the VRC, compute the kappa-label, advance the slot to `verified`.

---

## 4. The group seal

When all six heptads lock and the board folds, the game seals:

```
geometryHash = SHA-256( canonical(folded geometry state at p = 1) )
seal         = SHA-256( canonical({ kappaLabels sorted by slotId, geometryHash }) )
gameId       = seal
```

The group seal is the group identity shape. Same forty-two members, same fold, same seal. It is the id of the trust-graph node this game becomes. Schema: `GroupSeal`.

The seal binds both the relationships (the forty-two kappa-labels) and the structure (the folded geometry). Membership alone is not the identity. Membership in the sealed shape is the identity.

---

## 5. Network composition

A sealed game is a node. Games compose two ways.

**Shared root.** Two games that share an axis root connect along that axis. Governance over that axis spans both games. The shared root is the join.

**Fractal seam.** A game's privacy guide (the centre, the seed holder) can become the root context of a child game of 42. The child's `GroupSeal.parentGuideSlot` records the seam. This is how trust graphs gain depth rather than only width. **[Anticipated]** Ship one level first (Decision 3); the seed pointer is real and recorded, the child render is deferred.

A network of sealed games is a network of trust graphs. Identity lives in the pattern of relationships, which is what makes the graph resistant by topology rather than by any single primitive.

---

## 6. Quorum and governance

**[Anticipated]** A sealed game of 42 is one quorum unit. Quorum is read across its locked heptads. Because the board cannot seal without all six heptads, a sealed game already encodes balanced representation across all six axes. Governance actions reference the `gameId`; cross-game actions traverse shared roots and fractal seams. Exact voting and threshold rules are out of scope for this build and are flagged for a later spec.

---

## 7. What the coding agent wires, what it does not

- **In scope for the visual build:** slot state, kappa-label computation (use `canonical_serialise.py` ported to the app language), group seal computation, the fold driven by `p`.
- **Out of scope, external:** the actual RPP ceremony, DID resolution, the VRC issuer, persistence of the event log and seals. The app calls into these as services; it does not implement them.

> i can prove we are bound without revealing what we said when we bound

(⚔️⊥⿻⊥🧙)😊
