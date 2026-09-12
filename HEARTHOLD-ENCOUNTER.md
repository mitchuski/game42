# Game → Star Hold → Hearthold

Working integration contract, 12 September 2026. This defines the next implementation; it does not claim a live connection.

## The first encounter

A participant completes a source-linked practice contribution on the Game of 42. They choose to submit it to one configured Hearthold knowledge resource. Hearthold checks the presentation and asks for applicable consent, then either refuses or executes the scoped write. The participant retains the contribution and receiving-service receipt in Star Hold.

Start with a synthetic contribution and an explicitly configured test resource. Keep mode=practice throughout. The outcome is a persisted, attributable contribution with a verifiable receipt.

## Responsibilities

- Game: scope, contribution, selected disclosure and local participant review.
- Agent facilitator: propose tasks, prompt decisions and prepare the approved action; sign only its own scoped summary.
- Star Key extension: trusted signing request and selected identity.
- Star Hold artefact: retain original envelopes, verify items and commit the collection.
- Hearthold Emissary: transport the approved presentation.
- Hearthold Warden: author consent and enforce action/resource policy.
- Receiving resource: commit the permitted revision and return durable evidence.
- Star view: present selected records and their distinct check results.

Hearthold PR #91 supplies the shared City Key import/hash contract. The game now tests its City Key fingerprint against the exact two synthetic vectors from that PR. This establishes compatibility, not authorization.

## Sequence and data dependencies

1. Prepare a bounded contribution: session/task reference, exact revision, station/axis, selected result, evidence references, declared review outcome and mode. Do not send private task history or participant aliases by default. A local review stays self-recorded until there is a separate reviewer assertion.
2. Select the destination from trusted configuration. Before identifying the subject, obtain the Warden-authored description of recipient, purpose, operation, resource and disclosure. Imported records cannot choose executable endpoints.
3. After approval, bind the selected signer to a fresh recipient challenge and the exact contribution digest, requested action/resource, revision precondition and validity window. Confirm the final envelope profile with the receiver before enabling dispatch.
4. Request the extension signature. Verify the proof, exact approved payload and intended signer independently. Its current asDid path can fall back to holder signing; reject that mismatch. Participant assertion, reviewer acceptance and agent summary remain separate signed records.
5. Present through the Emissary. Hearthold verifies identity binding and applicable policy, including challenge, audience, expiry, status and revision. The Warden enforces its result at the actual write boundary.
6. Persist once. Reuse one operation ID for retries, bound to the same approved payload. Reject the same ID with different bytes. A lost response is uncertain: query the original operation rather than creating another write.
7. Verify and retain the receiving receipt. It identifies the operation, exact contribution digest, committed resource/revision, decision and pre-encounter City Key fingerprint under an agreed signer/profile. A transport acknowledgement cannot establish durable storage.
8. Retain original signed envelope bytes in the private Hold; derive item references and collection root/count. Evolve the City Key with that commitment and prior=pre-encounter κ, derive the new κ, then obtain the Hold bearer's binding signature over the fields prescribed by the existing Hold profile. Binding the service receipt to the old κ avoids a circular hash.
9. Reopen the stored Hold and recheck it before reporting saved. Show contribution, review and service receipt separately. Reusing content elsewhere requires a new encounter under that recipient's policy.

## Observable states

Prepared → awaiting consent → signed → awaiting receiver → committed → retained in Hold.

Track signature verification, receiver authorization, remote persistence and private Hold persistence independently. A failed Hold save after a successful remote write says “committed remotely; private retention pending.” An unknown network outcome stays unknown. Retry each boundary with its original operation ID and exact bytes.

The lifecycle must work without the 3D renderer. Keyboard users and agents use the same state transitions as the visual game.

## Reviewable implementation slices

1. Shared fixture compatibility in this game (implemented: three checks across two independent vectors, including mutation coverage).
2. Pure contribution and encounter reducer, with disclosure selection, durable operation IDs, immutable approved bytes and refusal/recovery paths. Add the Territory panel after these transitions are tested.
3. Extension adapter using the existing provider, signature verification and intended-signer enforcement. A separate extension-side retention operation is still required; no append-to-Hold provider API was found.
4. Hearthold verifier/enforcement adapter and a configured synthetic write target. Reuse #90's module boundaries; agree the persona/did:key ↔ did:cid binding and receipt suite before live execution.
5. Connect private Hold retention and Star inspection. Share original-byte, tampering and replay fixtures across both projects.

The existing Hearthold acceptance item uses did:cid / EcdsaSecp256k1Signature2019. The inspected Star verifier labels it unsupported. Add the actual resolver and maintained suite verifier, or retain that state; an Ed25519 helper cannot validate it.

## Exit checks

- One contribution survives game → extension → Hearthold → Hold → reopen with exact signed bytes.
- Changed payload, signer, audience, action, resource or revision fails the applicable check.
- Denial, closed approval UI, expiry, revocation and duplicate delivery never execute an extra write.
- Worker/browser restart and lost responses recover the original operation without signing or submitting automatically.
- Remote commit with failed private retention stays distinguishable and recoverable.
- Reviewer acceptance refers to the exact contribution; an agent cannot act as another participant.
- Export contains only selected disclosure. Raw Hold root and full collection are not broadcast by default.

## Evidence and outstanding decisions

Inspected local Star Key provider/signing and uncommitted star-hold.ts; Hearthold docs/star-hold.md and shared vectors; PR #91 open/mergeable with no comments.

Before live execution, resolve the receiver's request/receipt profiles, identity binding, test resource and revision API, resolver, and extension retention operation. These are integration dependencies to agree, not fields to guess.

References: [Hearthold #90](https://github.com/Flaxscrip/hearthold/issues/90), [compatibility PR #91](https://github.com/Flaxscrip/hearthold/pull/91). No messages, commits, PR updates, signatures or service writes were made by this work.
