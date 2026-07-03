// flow.test.js — the pure reducer (GAME-FLOW.md): lifecycle, gates, replay
// determinism. These are the paths most likely to silently regress.
import { describe, it, expect } from 'vitest';
import { SLOTS, AXIS_ORDER, bootAssert } from '../src/data.js';
import { createGame, nextAction, applySealed } from '../src/flow.js';

function playToSeal(game) {
  let guard = 0;
  for (;;) {
    if (guard++ > 500) throw new Error('driver did not terminate');
    const act = nextAction(game, AXIS_ORDER);
    if (!act) return;
    const ev = act.type === 'TASK_VERIFY'
      ? { type: 'TASK_VERIFY', slotId: act.slotId, kappaLabel: 'k:' + act.slotId }
      : act;
    const r = game.dispatch(ev);
    if (!r.ok) throw new Error(`driver produced a rejected event: ${ev.type} ${ev.slotId || ev.axisId} — ${r.reason}`);
  }
}

describe('canon shape', () => {
  it('boot assertions hold (42 slots · 6 heptads · 3/3/1 · A1 vertices)', () => {
    expect(bootAssert()).toEqual([]);
  });
});

describe('lifecycle', () => {
  it('the deterministic driver fills all 42 and the board seals', () => {
    const g = createGame(SLOTS, AXIS_ORDER);
    expect(g.boardPhase()).toBe('seeded');
    playToSeal(g);
    expect(g.sealedCount()).toBe(42);
    expect(g.p()).toBe(1);
    expect(g.boardPhase()).toBe('sealed');
    for (const a of AXIS_ORDER) expect(g.heptadPhase(a)).toBe('locked');
    expect(Object.keys(g.kappa)).toHaveLength(42);
  });

  it('p is derived from sealed count, never set (A9)', () => {
    const g = createGame(SLOTS, AXIS_ORDER);
    expect(g.p()).toBe(0);
    g.dispatch({ type: 'ROOT_IGNITE', axisId: AXIS_ORDER[0] });
    expect(g.p()).toBe(0); // igniting seals nothing
  });
});

describe('gates', () => {
  it('rejects a proposal on a dormant heptad', () => {
    const g = createGame(SLOTS, AXIS_ORDER);
    const s = SLOTS.find((x) => x.fillOrder === 1);
    expect(g.dispatch({ type: 'FISH_PROPOSE', slotId: s.slotId }).ok).toBe(false);
  });

  it('rejects the guide opening before its six are sealed (keystone-seals-last)', () => {
    const g = createGame(SLOTS, AXIS_ORDER);
    const axis = AXIS_ORDER[0];
    const key = SLOTS.find((x) => x.axisId === axis && x.isKeystone);
    g.dispatch({ type: 'ROOT_IGNITE', axisId: axis });
    expect(g.dispatch({ type: 'FISH_PROPOSE', slotId: key.slotId }).ok).toBe(true);
    const r = g.dispatch({ type: 'TASK_START', slotId: key.slotId });
    expect(r.ok).toBe(false);
  });

  it('rejects a mouse starting before the lead advisor is sealed (fill order)', () => {
    const g = createGame(SLOTS, AXIS_ORDER);
    const axis = AXIS_ORDER[0];
    const mouse = SLOTS.find((x) => x.axisId === axis && x.personaClass === 'mouse');
    g.dispatch({ type: 'ROOT_IGNITE', axisId: axis });
    g.dispatch({ type: 'FISH_PROPOSE', slotId: mouse.slotId });
    expect(g.dispatch({ type: 'TASK_START', slotId: mouse.slotId }).ok).toBe(false);
  });

  it('rejects TASK_VERIFY when the integrity gate h(τ) fails', () => {
    const g = createGame(SLOTS, AXIS_ORDER);
    const axis = AXIS_ORDER[0];
    const lead = SLOTS.find((x) => x.axisId === axis && x.fillOrder === 1);
    g.dispatch({ type: 'ROOT_IGNITE', axisId: axis });
    g.dispatch({ type: 'FISH_PROPOSE', slotId: lead.slotId });
    g.dispatch({ type: 'TASK_START', slotId: lead.slotId });
    expect(g.dispatch({ type: 'TASK_VERIFY', slotId: lead.slotId, integrityOk: false }).ok).toBe(false);
    expect(g.state[lead.slotId]).toBe('in_progress');
  });

  it('board only seals multiplicatively — one open heptad keeps it assembling (A8)', () => {
    const g = createGame(SLOTS, AXIS_ORDER);
    // seal five heptads' worth via the external mirror, leave one axis untouched
    const open = AXIS_ORDER[5];
    applySealed(g, SLOTS.filter((s) => s.axisId !== open).map((s) => s.slotId));
    expect(g.boardPhase()).toBe('assembling');
  });
});

describe('replay determinism (A10)', () => {
  it('replaying the log yields identical state and kappa labels', () => {
    const a = createGame(SLOTS, AXIS_ORDER);
    playToSeal(a);
    const b = createGame(SLOTS, AXIS_ORDER);
    for (const ev of a.log) {
      const r = b.dispatch(ev);
      expect(r.ok).toBe(true);
    }
    expect(b.state).toEqual(a.state);
    expect(b.kappa).toEqual(a.kappa);
    expect(b.boardPhase()).toBe('sealed');
  });
});
