import { createGame } from './flow.js';
import { groupSeal, geometryHash } from './hash.js';
// Validation is atomic: caller replaces its game only after this succeeds.
export async function replayPractice(cfg, slots, axes, snapshot) {
  if (!cfg || cfg.kind !== 'game-of-42' || cfg.version !== 1 || !Array.isArray(cfg.log) || cfg.log.length > 10000)
    throw new Error('Expected a version-1 game replay, not a City Key or selected reading.');
  const game = createGame(slots, axes);
  for (const [i, ev] of cfg.log.entries()) {
    if (!ev || typeof ev !== 'object' || typeof ev.type !== 'string') throw new Error(`Invalid event ${i+1}.`);
    if (ev.type === 'TASK_VERIFY' && !/^[a-f0-9]{64}$/.test(ev.kappaLabel || '')) throw new Error(`Event ${i+1} is missing a valid content label.`);
    const r = game.dispatch(ev);
    if (!r.ok) throw new Error(`Event ${i+1}: ${r.reason}.`);
  }
  let status = 'Practice replay checked; no seal claimed.';
  if (cfg.seal) {
    if (game.sealedCount() !== slots.length || Object.keys(game.kappa).length !== slots.length) throw new Error('A claimed seal needs a complete, valid replay.');
    const calculated = await groupSeal(slots.map(s => game.kappa[s.slotId]), await geometryHash(snapshot));
    if (calculated !== cfg.seal) throw new Error('Seal mismatch. Legacy custom geometry needs its original settings; the current game was left unchanged.');
    game.setGroupSeal(calculated); status = 'Content seal matches replay. Practice only; identities and evidence are not verified.';
  }
  return { game, status };
}
