# Chronicle — how game42 gets interoperability (without writing into soulbis)

**Date:** 2026-06-27
**Status:** plan / chronicle only. **No edits to `soulbis website/` or `star/`** (no-push +
byte-identical-sync rules). Everything here is either game42-side or a documented hand-off.

Companion to `2026-06-27_suggestion_shared_holokey_with_soulbis_star.md`.

## The goal
A game42 artifact (a sealed game PNG / a forged key) should drop straight into the soulbis
suite — `/star` lights the sealed axes, `/sigil` re-derives the κ, `/city` charges it — and a
soulbis City Key should already insert into game42 (it does: constellation ⭐ insert-your-star,
verified 2026-06-27 with a generated `cityKey` PNG, palette + geometry parsed).

## The one hard gap: the κ does not match yet
All three repos hash a canonical form + carry JSON in a PNG `tEXt` chunk, but the rule differs:

| | exclude set | number handling | label |
|---|---|---|---|
| **game42** (`src/hash.js`) | `{kappa,seal,vrcId,gameId}` | stringified upstream | **no prefix** |
| **soulbis / star** | `{kappa}` only | raw JSON numbers | **`sha256:` prefix** |

So the *same content* hashes to *different* labels across the two. Conformance vectors that must
both keep holding: ours `4cdab0eb939a89c0…` (demo VRC), soulbis's `sha256:0b4916ba…c527` (the
/sigil default key).

## The fix — a shared `holokey` core (game42 authors it; others adopt by `cp`)
Extract a ~60-line dependency-free module whose canonical takes the divergent bits as
**arguments**, so one implementation serves both rule-sets:

```
canonical(obj, { exclude = ['kappa','seal','vrcId','gameId'], stringifyNumbers = true })
kappaLabel(obj, { prefixed = false, ...canonOpts })   // prefixed => 'sha256:' + hex
pngEmbed(dataURL, cfg, keyword) / pngExtract(buf, keyword)
```

- **game42 default** stays bit-stable → `4cdab0eb…` still holds.
- **soulbis-compat mode** = `{ exclude:['kappa'], stringifyNumbers:false, prefixed:true }` → must
  reproduce `sha256:0b4916ba…c527`.
- Ship a **self-test** that asserts *both* vectors. This is the contract.

Adoption is a `cp` of the module into each repo when the owner chooses — **not** done here.

## City Key emission on BOARD_SEAL (game42-side, safe to build)
We already hold `groupSeal` + the ordered event log. Map to a City-Key-shaped payload so the
exported PNG is carryable:

| City Key field | from game42 |
|---|---|
| `kappa` (prefixed) | holokey soulbis-compat κ over the payload |
| `seal` | `groupSeal` (open: first-class field vs inside `packets.root`) |
| `lit` | the sealed-axis vertices (`latticeAxisVertex` of locked heptads) |
| `palette` | the live theme (sword/mage/cool/warm) |
| `geometry` | `{eps,m,n,core,smRatio}` from the current shape params |
| `descriptions` | per-axis/role copy (optional) |

Keyword `cityKey` (not `game42`) so soulbis's readers find it. Build this as a button in
Territory; it touches nothing outside game42.

## Validation (read-only against the live suite)
Before claiming a forged key round-trips: open it in the **live `/sigil`** (read-only) and check
the re-derived κ matches our compat-mode κ. Only then is the cross-suite vector trustworthy.
Until validated, label the export "experimental — verify against /sigil".

## Why the log is the unifier
game42's **event log** is the strongest artifact of the three — deterministic, replayable, the
true preimage of a seal. soulbis's `trace`/`witness` are lossy summaries. One proof format from
forge → carry → charge, anchored on the log.

## Open
- `seal` as a first-class City Key field vs inside `packets`.
- Keep game42's richer exclude-set as the default (fine — the core takes it as an arg).
- The palette reconciliation lives in `2026-06-27_core_shape_interrogation.md` / the suggestion
  chronicle: soulbis pair stays canon; ours is the *forge theme preset*.

(⚔️⊥⿻⊥🧙)😊
