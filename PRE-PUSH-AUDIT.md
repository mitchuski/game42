# Game of 42 pre-push audit

12 September 2026. Scope: the local practice release, not the completed connected system.

Release preparation update: the build-tool upgrade is now complete (Vite 7.3.6, Vitest 4.1.11); all 33 tests and the production build pass, and npm audit is clean. The original findings below are retained as the audit trail. Live extension and connected-system limitations remain as stated.

## Completed and checked

- New landing, animated Soulbis-derived geometry, six-axis explanatory view and corner Star entry point.
- Local task scope/result/review, selective export, replay checks and explicit practice labels.
- Shared Hearthold City Key fixtures; 33 tests and production build passed after the last functional game change.
- Git diff whitespace check passes. Deployment config points to the existing game42 Worker with static dist assets.

## Before publishing the practice release

1. Resolve or explicitly assess the inherited development-tool advisories. Fresh npm audit reports six: two moderate, three high and one critical, involving esbuild, nanoid, postcss, vite, vite-node and vitest. The critical advisory concerns the Vitest UI server, which this workflow does not start. This is not evidence of an exploitable deployed static page, but a tested build-tool upgrade remains outstanding.
2. Complete mobile checks for the newly added corner dialog and animation controls, including Territory panel overlap. Earlier mobile checks predate those additions. Exercise the real no-WebGL fallback.
3. Test site-persona selection in a native browser with the installed extension, including rejection and reload. Only extension-unavailable behaviour was checked here. No login or Hold persistence claim is justified by provider detection.
4. Include all new source, documentation and fixture files in the release commit. The checkout currently has uncommitted tracked edits and untracked deliverables; they are not on the remote.
5. Recheck deployment routing and supported JSON/PNG consumers before publishing carrier compatibility claims.

## Deliberately unfinished connected work

- Territory session reducer, roster/turn controls and agent-hosting adapter.
- RP authentication and intended-signer verification for contribution signing.
- Extension-side append/persist operation for Star Hold.
- Hearthold identity binding, Warden-enforced action, durable receipt and retry recovery.
- Continuing City Key evolution and measured-record rendering.

The landing labels these integrations in development. They need not prevent an explicitly scoped practice release, but prevent calling it a completed agent-hosted or synced game.

## Cross-site work

Agentprivacy.ai has local shorter landing copy and animated Manifold/Lattice/Core views; TypeScript check passes. Labs has the same motion with its original controls; its 234-check verification gate passes. Neither update has been deployed in this task. Labs' Game of 42 project card still contains its older minimal GitHub description.

No push or deployment performed. Recommended next release task: resolve build dependencies and finish the narrow UI/extension checks, then package the practice release independently of the later connected-system work.
