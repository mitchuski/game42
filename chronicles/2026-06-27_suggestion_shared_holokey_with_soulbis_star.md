# Chronicle (by way of suggestion) — game42 as the forge in a three-repo loop

**Date:** 2026-06-27
**Status:** Suggestion / not yet built. Companion to `soulbis website/PLAN_INTEGRATION_VIZ_KEY_GAME42_2026-06-27.md`.

## What was looked at
A review across three siblings — `soulbis website/` (the visualisation + City Key system), `star/` (the Swordsman's Key holospace), and this repo (`game42/`) — to find the *core overlap* and where the three quietly re-implement the same idea.

## What the three already share
- **An identity primitive.** All three derive a κ-label by SHA-256 over a sorted, whitespace-free canonical form, then embed JSON in a PNG `tEXt` chunk. game42's `src/hash.js` is the most disciplined of the three (it stringifies numbers upstream and excludes `{kappa,seal,vrcId,gameId}`), but it diverges from soulbis/star on two points: soulbis prefixes the label `sha256:` and excludes only `kappa`.
- **The same geometry.** This repo's `src/star.js` stella-octangula vertices are byte-for-byte the same tetrahedra as `star/index.html`. game42's `42 = 6 axes × 7 stations` is a refinement of soulbis's 6-bit {0,1}⁶ lattice — the six roots *are* its stratum-1 basis vectors.
- **Two halves of one trust pipe.** game42 *issues* relationship credentials (`TASK_VERIFY → VRC → κ → groupSeal`) but stubs the issuer. soulbis *carries and charges* them (`focus → witness → /city` VRC mana) but assumes an external producer. We are each other's missing half.

## The suggestion
**game42 is the forge; soulbis/star carry and charge.** Three concrete moves:

1. **Extract one `holokey.js`.** A ~60-line dependency-free module — `canonical(obj, exclude)`, `kappaLabel(obj, {prefixed})`, `pngEmbed/Extract` — vendored byte-identically into all three repos, with a *shared self-test* running both conformance vectors (soulbis's `sha256:0b4916ba…c527` and our demo-VRC `4cdab0eb…`). Our number-stringifying discipline becomes the canon for everyone.

2. **Reconcile the palette.** Our Sword `#E0A526` / Mage `#2563EB` vs soulbis's coral `#e8523a` / cyan `#4dd9e8` are the same two archetypes in different paint. Suggestion: soulbis's pair stays canon (it's in production); ours is recorded as the *forge theme preset*, declared themeable rather than divergent.

3. **Emit a City Key on `BOARD_SEAL` (the keystone).** We already hold `groupSeal` + the ordered event log. Map them into a City Key-shaped payload (`groupSeal → seal/packets.root`, sealed axes → `lit`, top-level `kappa` via the shared core) so our PNG carrier drops straight into `/star` and `/lattice` — the manifold lights the six sealed axes, `/sigil` re-derives κ, and `/city` charges it. The forge output becomes carryable, verifiable proof.

## Why it's worth it
Our **event log** is the strongest artefact of the three — deterministic, replayable, the true source of a seal. soulbis's `trace`/`witness` are lossy summaries of the same thing. Unifying on the log gives one proof format from forge to charge. Nothing here is a rewrite: it's `cp` of one small module, one palette decision, and one export mapping.

## Not done / open
- Whether `seal` rides as a first-class City Key field or inside `packets`.
- Keep our exclude-set richer than soulbis's — fine, as long as the shared core takes it as an argument and the default stays bit-stable (so the `0b4916ba…` vector still holds).
- Honour the project's no-push-without-ask and byte-identical-sync rules before touching the live soulbis pages.
