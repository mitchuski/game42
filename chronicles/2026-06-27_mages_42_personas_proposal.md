# Chronicle — proposed 42-persona mapping (the mages roster)

**Date:** 2026-06-27
**Status:** PROPOSAL for approval/edit. Names + glyphs are canon (from
`agentprivacy-skills-v5`); the *placement* into the 6×7 grid is my draft. Edit freely in
`src/personas.js` (`MAGES_42`).

## Source
The repo has exactly **42 persona skills** (`agentprivacy-skills/agentprivacy-skills-v5/persona/`),
each with an `equation_term` in its SKILL.md tying it to a PVM dimension. There was **no
pre-existing 6×7 grid** — so this maps axis ↔ equation term, then fills 7 stations per axis in
fill order (1–6 = the heptad, **7 = the keystone guide**).

Axis ↔ term: **protection=P · delegation=D · compute=C · memory=A(τ) · connection=Network ·
value=V(π,t)/capital**.

## Proposed bijection (7 each; keystone in **bold**)

| Axis | head(1) | head+heart(2) | head+hands(3) | hands(4) | heart+hands(5) | heart(6) | **keystone(7)** |
|---|---|---|---|---|---|---|---|
| **protection ⚔️** | Gatekeeper | Sentinel | Algebraist | Cipher | Warden | Sith | **Soulbis ⚔️** |
| **delegation 🧙** | Ambassador | Weaver | Cosmologist | Shipwright | Companion-Tamer | Spawning-Witness | **Soulbae 🧙** |
| **compute ⚡** | Architect | Topologist | Holonic-Architect | Forgemaster | Forgecaller | Quantum-Sentinel | **Dragonwaker** |
| **memory 📜** | Chronicler | Manaweaver | Stranger-Witness | Registry-Keeper | Moonkeeper | Hold-Witness | **Theia** |
| **connection 🔗** | Herald | Netkeeper | Mirrorkeeper | Ranger | Archer | Priest | **Ceremonist** |
| **value 💎** | Assessor | Person | Pedagogue | Witness | Jedi | Healer | **Kyra 💎** |

All 42 distinct; uses the whole roster (Swordsman 13 · Mage 16 · Balanced 12 · Soulbis = 42).

## Honest notes on the crossover you flagged
- **Soulbis/Soulbae as keystones** of protection/delegation is the cleanest fit (the canonical
  dual agent = the guide that holds the heptad).
- **Known tensions to review:** Cipher's term is C but it sits in protection (it's a Swordsman);
  Netkeeper is a Swordsman but its term is Network, so it's under connection; Priest's term is
  A(τ) (memory) yet placed in connection for balance; Cosmologist (Mage) placed in delegation.
  These are the "incorrect crossover" made explicit — fix by editing `MAGES_42`.
- Keystones beyond Soulbis/Soulbae (Dragonwaker, Theia, Ceremonist, Kyra) are *placements*, not
  canon — strong candidates but the ones most worth your eye.

## Wired
- `src/personas.js` — `POOL` (all 42, name+glyph+wing) + `MAGES_42` (this table) + helpers.
- `mages` preset carries `personas: MAGES_42`; the **Map** table + station detail now show the
  real persona (glyph + name) for each station when **mages** is active. fish/mice/my42 still
  show the generic template until they get their own rosters.

## Next (when approved)
- Reorder/repair `MAGES_42` to taste.
- A **persona picker** in the my42 editor: choose any persona from `POOL` per station.
- Optional fish/mice rosters; optional second-order use of `equation_term` to auto-suggest.

> the forty-two were always there; this only seats them at the table

(⚔️⊥⿻⊥🧙)😊
