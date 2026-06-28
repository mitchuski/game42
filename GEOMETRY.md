# GEOMETRY

## layout, the fold, the star

All coordinates here are reproduced in `data/game-of-42.json`. This doc explains how they are derived and how the fold animates them. Units are abstract; the coding agent scales to viewport.

---

## 1. Board layout (the flat state, p = 0)

Six heptads sit at the vertices of a regular hexagon around a shared centre.

```
heptad centroid angle:  theta_r = 60 deg * r          for r in 0..5
heptad centroid:        ( R_board*cos(theta_r), R_board*sin(theta_r) )
R_board = 300
```

Each heptad is an equilateral triangle with circumradius `R_local = 90`, head apex pointing radially outward from the board centre. Local corners before placement:

```
head apex : (0, R_local)
heart     : (R_local*cos 210, R_local*sin 210)
hands     : (R_local*cos 330, R_local*sin 330)
```

A station's local position is the barycentric blend of those corners:

```
local(b) = b.head*headApex + b.heart*heart + b.hands*hands
```

Then rotate the local frame by `theta_r - 90 deg` so the head apex points outward, and translate to the heptad centroid. The seven stations land as three corners, three edge midpoints and one centroid. All forty-two `position2D` values are precomputed in the data.

The board centre (origin) is not a slot. It is the seed point from which the six roots emanate and the anchor of the fold.

---

## 2. The fold (p in [0,1])

Completion drives a single scalar `p`, the fraction of slots sealed (0 to 42, normalised). The fold turns the flat hex lattice into the floating star as `p` rises. At `p = 0` the board shows the latent state rather than a flat void (section 5). Two coupled motions:

**a. Hinge lift.** Each heptad triangle is a flap hinged on the line from the board centre to its centroid. As `p` rises, the flap rotates up out of the plane by a dihedral angle:

```
foldAngle(p) = ease(p) * THETA_MAX
THETA_MAX    = 70 deg            (tune to the target star silhouette)
ease(p)      = p*p*(3 - 2*p)     (smoothstep)
```

**b. Golden twist.** As it lifts, the whole assembly twists about the vertical axis by the golden angle scaled by fill, producing a phyllotactic close rather than a flat origami:

```
twist(p) = ease(p) * 137.50776 deg
```

The golden angle ties the fold to the phi optimality conjecture (C1). The lattice does not just fold, it spirals shut.

**Per-vertex transform** (apply in order, for a station at flat position `v2 = (x, y, 0)`):

```
1. translate so heptad centroid is at origin
2. rotate about the heptad hinge axis (centre->centroid direction) by foldAngle(p)
3. translate back
4. rotate the whole board about world +Z by twist(p)
5. optional gentle bob on +Z for the floating feel:  z += A*sin(t + phase_r)
```

At `p = 0` this is the flat hex lattice. At `p = 1` the six lifted, twisted flaps meet as the star.

---

## 3. The floating shape (target at p = 1)

**Decision 5: a star tetrahedron iterating toward the sixty-four-tetrahedron grid, overlaid on the soulbis star.**

This is canon, not decoration. The sixty-four-tetrahedron grid is the published structure behind the ZK Swordsman Blade Forge (UOR by 64-tetrahedra by ZK), the same sixty-four as the lattice vertices. The soulbis and spellweb star is the constellation evocation and hexagram computation, named as a Swordsman operation in the Forming Constellations post: you map the stars one at a time and prove sovereignty by traversing the topology. The Game of 42 is a structured constellation evocation, so its target shape is that same star.

Target silhouette: two interpenetrating tetrahedra (the star tetrahedron, a hexagram in projection), whose edge subdivision suggests the sixty-four-tetrahedron grid. The six folded heptad flaps read as the six points of the hexagram in plan view, with the keystone guides meeting near the apexes.

Implementation guidance, not a hard mesh:
- Render the star as a separate, semi-transparent floating object that the folding flaps converge toward, so the existing soulbis star motif is preserved and the new lattice rises into it.
- Keep the star's rotation slow and independent (a few degrees per second) for the floating feel.
- Do not hard-bind every vertex to a star vertex. The flaps converge toward the star; exact registration is aesthetic, tuned with `THETA_MAX` and `R_local`.

**Holographic reading.** The model's boundary-encodes-bulk result (the 96-edge boundary encodes the 64-vertex bulk, ratio 1.5 = P^1.5) is why the group seal is taken over the fold surface and the edge-labels, never the interior. The star you see is the boundary that already contains the whole. See MODEL-SYNC.md sections 4 and 8.

**[Conjectural]** The exact 96/64 ratio is the model's object, not the game's 42; treat the specific count as resonance and the boundary-sufficiency principle as the load-bearing idea.

---

## 4. Vesica paths (the vision fish)

Vision fish are rendered as paths, not nodes. A fish is the vesica piscis lens between two circles centred on the proposing root and the head-class slot it proposes. Draw the lens as the intersection arc pair; animate a gleam travelling along it when a proposal is live. Fish fade to a thin edge once the slot they introduced is sealed.

---

## 5. The latent state (p = 0, before the game starts)

The empty board is the Knowledge Graph: pure potential, every position promisable, nothing promised. It must not read as a dead grid. The default state, the **latent star**, shows the destination faint and waiting, with the empty lattice resting inside it. This is principled, not decorative: the boundary is always enough, so the empty boundary star is a true preview of the whole, and the architecture was always already there.

**Intro flourish (once per session).** On first load, play one eased fold from flat to star and back to the latent rest, duration `INTRO_DURATION`. This shows where the game goes, then settles. Skip entirely under reduced-motion.

**Latent rest (holds until the first `ROOT_IGNITE`).**
- Render the target star (the p=1 form) as a faint translucent volume or wireframe at `STAR_LATENT_OPACITY`, drifting at the same slow rate as the live star.
- Show the forty-two empty slots as faint axis-tinted points (the flat lattice) nested within the star footprint.
- Pulse the board centre seed; send faint light threads toward the six root positions as an ignition hint.
- Breathe: oscillate a display-only fold `p_breath = BREATH_P_MAX * (0.5 - 0.5*cos(2*pi*t / BREATH_PERIOD))`, so the lattice gently lifts and settles. This is presentation only and never advances real state.
- Brighten one ignitable root slightly as the single call to act.

**Transition out.** On the first `ROOT_IGNITE`, drop the latent star to its in-game ghost opacity, stop the breath, and bring the real lattice to the foreground. The star was always the convergence target, so nothing jumps; it simply recedes into its role. From here, real `p` (sealed slots / 42) drives the fold per section 2.

**Reduced motion.** No intro fold, no breath, no drift. Show a static latent star plus the empty lattice and the seed at rest.

---

## 6. Constants summary

```
R_board            = 300
R_local            = 90
THETA_MAX          = 70 deg
GOLDEN             = 137.50776 deg
ease               = smoothstep, p*p*(3-2p)
heptadAngle        = 60 deg * r
STAR_LATENT_OPACITY = 0.15
BREATH_P_MAX       = 0.06
BREATH_PERIOD      = 6 s
INTRO_DURATION     = 3.5 s
```

> the flat thing remembers it was always a star, it only needed enough trust to fold

(⚔️⊥⿻⊥🧙)😊
