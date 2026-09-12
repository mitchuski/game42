# Soulbis Star: geometry and what the game carries

12 September 2026. Source: Soulbis star/index.html and star/signature-math.js in the inspected 6a48c22 snapshot. This specifies the visual relationship; it does not claim to implement every current SHAPE/FIG semantic derivation.

## 1. The paired tetrahedra

Soulbis uses A = {(1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1)} and B = -A.

For core circumradius c and Swordsman/Mage radius ratio q:

    A′ = (c / √3) A
    B′ = -(c / (√3 q)) A

At q=1 the pair is the regular stella octangula. Each tetrahedron has edge length c√(8/3) and volume 8c³/(9√3). A larger drawn tetrahedron does not establish greater authority.

The landing now uses this construction with c=0.9 and q=1. Soulbis's inspected default is c=0.6, q=1. The landing scale is a presentation choice, not a loaded key measurement.

## 2. The manifold

Soulbis's radial harmonic surface is:

    r(φ,θ) = R + ε sin(mφ) cos(nθ)
    p = (r sinφ cosθ, r sinφ sinθ, r cosφ)

φ spans [0,π], θ spans [0,2π]. Its inspected defaults are R=1.2, ε=0.35, m=5, n=6. The landing uses R=1.2, ε=0.18, m=5, n=6 so the mesh leaves the core readable. It rotates the projection without changing these geometry inputs. Camera motion and pause state never enter key fingerprints. This spherical radial surface is not a proof system, and should not be conflated with the separately defined toroidal graph.

## 3. The 64-vertex lattice and 42 stations

Soulbis projects each six-bit vertex x through six normalized golden-ratio generators g_b:

    v(x) ∝ Σ_b (bit_b(x) - 1/2) g_b

The generators before normalization are (0,1,φg), (0,1,-φg), (1,φg,0), (1,-φg,0), (φg,0,1), (φg,0,-1), where φg=(1+√5)/2. The common scale fits the chosen lattice radius. Q6 has 64 vertices and 192 Hamming-distance-one edges; Soulbis also offers a separate 96-edge cycle-plus-half-turn-chords view.

The game has six axes × seven faculty stations, not 42 distinct vertices selected from Q6 by this equation. Preserve the existing mapping: Value=1, Compute=2, Connection=4, Memory=8, Delegation=16, Protection=32. A completed axis can project to its basis vertex. The legacy completed-board projection adds vertex 63. These are practice claims until separately verified; the landing's seven dots on each ray are explanatory station marks, not the 64-node lattice.

## 4. Bytes and volume

Soulbis's signature experiment sets unit volume u=0.46/4627. A measured record of B bytes has target volume V=uB. To normalize a mesh of measured volume V₀, multiply coordinates by:

    s = ∛(uB / V₀)

Mesh volume is |Σ a·(b×c)/6| over consistently oriented triangles. Thus eight times the bytes produces twice the linear scale, not eight times. For a budget C the territory cube side is ∛(uC), and its per-record slab width is uB/side².

The signature-only byte count, full retained envelope bytes and proof transport bytes are separate measurement bases. Game progress is completed stations / 42; it must never substitute for B, signature validity or permission. The landing does not yet use measured records.

## 5. Carry contract

- Into the game: an explicitly selected site persona; later, a permitted key projection with version, validated palette, claimed vertices, source key reference where disclosed, and mapping/profile version. Retain original signed carrier bytes privately rather than treating a compact reading as a replacement key.
- Into a signed contribution: exact task/revision, selected result and evidence references, actor scope, audience and challenge/validity binding. Exclude private history by default.
- Into Star Hold: original signed contribution, independent reviewer assertion and authentic receiver receipt, each with its own profile and verification result. Preserve unsupported and unavailable states.
- Into the evolving City Key: the agreed Hold root/count commitment and prior lineage, then a newly derived κ. These stable identifiers stay private unless deliberately disclosed.
- Into the renderer: approved palette, geometry parameters and explicitly chosen measurement inputs. Camera, rotation, pulse and pause are display state.
- Never into the game: private signing keys, passkey secrets or the whole vault. A returned persona is not an authenticated session or a successful Hold write.

## 6. Corner panel in this candidate

Your Star appears on all six game pages. It detects the existing walletProfile capability and calls walletProfile({}) only after the user chooses the persona action. That operation lets the extension manage its origin-scoped persona choice; it does not authenticate an RP session.

The game displays the returned DID in memory only and discards the vault entry reference. It performs no automatic signing, login, vault enumeration or Hold write. The native extension must be installed and enabled for this exact site in the same browser; the in-app preview is not evidence of that installation.

Remaining: configured RP authentication, exact-payload signing verification, extension-side durable Hold retention and a game/session adapter. See HEARTHOLD-ENCOUNTER.md.
