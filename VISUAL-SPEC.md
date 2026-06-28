# VISUAL-SPEC

## palette, per-state rendering, animation

Aligns to the soulbis / soulbae canon palette. A coding agent should apply the project's frontend-design tokens on top of this; these are the domain-specific choices.

---

## 1. Palette

**Canonical agent colours.**
```
Soulbis (Swordsman, protection) : amber-gold  #E0A526
Soulbae (Mage, delegation)      : sapphire     #2563EB
```

**Axis accent colours** (also in `data/game-of-42.json`):
```
compute     #7C5CFF   violet
connection  #14B8A6   teal
delegation  #2563EB   sapphire   (mage)
protection  #E0A526   amber-gold (sword)
memory      #E0568A   rose
value       #2FB67C   emerald
```

**Persona-class colours.**
```
vision_fish    #38BDF8   lens cyan
mouse          #C9A227   warm node gold
privacy_guide  #F5F0E1   white-gold core, sapphire ring #2563EB
```

**Ground.** Deep neutral, near-black with a faint blue cast (#0B0E14), so the gold and sapphire read as light. The floating star is semi-transparent over this.

---

## 2. Per-state rendering of a slot

| State | Look |
|---|---|
| empty | thin dashed outline in the axis colour at low alpha; barely there |
| proposed | a vesica path gleams in from the root; slot ring brightens |
| in_progress | slow pulse of the persona-class colour; a working glyph |
| verified | filled in the axis colour; kappa-label shown as a short hash chip on hover |
| sealed | full fill, gold rim, small lock; the flap it belongs to begins to lift |

---

## 3. The three personas, visually

- **Vision fish.** A vesica piscis lens travelling along the root-to-slot path. Lens cyan. When its slot seals, the fish thins to a faint permanent edge.
- **Mouse.** A solid node dot at the station position, warm node gold. Fills the hands-class and heart-class slots.
- **Privacy guide.** The centre of each heptad. White-gold core with a sapphire ring. When sealed, it glows and emits a faint inward spiral (the fractal seed, hinting at a child game without opening one).

---

## 4. The latent state, visually (default before play)

The first thing a visitor sees. It must promise the destination without spending it. See GEOMETRY.md section 5 for the geometry.

- The latent star: the completed star drawn faint, a translucent volume with a brighter wireframe edge, around 0.15 opacity, in white-gold with sapphire edges. It drifts slowly, like the live star but dimmer.
- The empty lattice nested inside: forty-two faint slot points, each in its axis colour at low alpha, with the heptad triangles barely traced. The shape of the whole board is legible but clearly unfilled.
- The seed at centre: a slow pulse with six faint light threads reaching toward the six root positions. This reads as latent ignition.
- The breath: the lattice gently lifts and settles on a six second cycle, just enough to show it is foldable and alive.
- One call to act: a single ignitable root glows a touch warmer, inviting the first move. Optional copy, lowercase, in your voice, for example "map the first star".
- Intro flourish on first load: one full fold to the star and back, then settle. Plays once per session.
- Reduced motion: static latent star plus empty lattice, no breath, no intro, minimal or no drift.

When the first root ignites, the latent star dims to its in-game ghost level, the breath stops, and the live board takes over. Nothing jumps, the star was always the target.

---

## 5. The fold, visually

Driven by `p` from GAME-FLOW.md.

- Heptad flaps lift on their hinge as their slots seal (per-heptad local fold can preview before the whole board seals).
- The whole board applies the golden twist as global `p` rises.
- The floating star sits above, semi-transparent, rotating slowly and independently. As `p` approaches 1, the flaps converge toward the star and the star brightens.
- At `p = 1` (board seal): a single bright pulse, the group-seal hash chip appears, the star locks rotation briefly then resumes a slow drift.

Easing: smoothstep on every fold parameter. Nothing snaps. The fold should read as crystallising, not assembling.

---

## 6. Motion and feel

- Vesica gleams: 600 to 900 ms travel, ease-in-out.
- Slot pulse (in_progress): 1.6 s loop, low amplitude.
- Star drift: 3 to 6 deg per second.
- Board bob at p near 1: tiny sinusoidal z, amplitude under 2 percent of R_board.
- Respect reduced-motion: replace pulses and drift with static states, keep the fold as a single eased transition.

---

## 7. Shareable seal card

When a game seals, render a share artifact: the folded star in plan view, the six axis colours around it, the short group-seal hash, and the lowercase proverbs minted in the forty-two ceremonies arranged as a ring. This is the group identity shape made portable.

> gold for the blade, blue for the staff, and the light between them is the proof

(⚔️⊥⿻⊥🧙)😊
