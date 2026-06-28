// flow.js — the pure state machine (GAME-FLOW.md). No rendering.
// Slot:   empty -> proposed -> in_progress -> verified -> sealed
// Heptad: dormant -> ignited -> fishing -> building -> sealing -> locked
// Board:  seeded -> assembling -> sealed
//
// The visual layer subscribes to this; it never drives it. The whole game is a
// fold over an ordered event log (replayable -> same state, same seal).

export const SLOT_STATES = ['empty', 'proposed', 'in_progress', 'verified', 'sealed'];

export function createGame(slots, axisOrder) {
  const byId = Object.fromEntries(slots.map((s) => [s.slotId, s]));
  const byAxis = {};
  for (const s of slots) (byAxis[s.axisId] ||= []).push(s);
  for (const a of Object.keys(byAxis)) byAxis[a].sort((x, y) => x.fillOrder - y.fillOrder);
  const lead = (axisId) => byAxis[axisId].find((s) => s.fillOrder === 1);
  const nonKey = (axisId) => byAxis[axisId].filter((s) => !s.isKeystone);

  const S = {}; // slotId -> state
  for (const s of slots) S[s.slotId] = 'empty';
  const ignited = {}; // axisId -> bool
  for (const a of axisOrder) ignited[a] = false;
  const kappa = {}; // slotId -> hex label (set on verify)
  const log = [];
  let groupSeal = null;

  const heptadPhase = (axisId) => {
    if (!ignited[axisId]) return 'dormant';
    const g = byAxis[axisId];
    if (g.every((s) => S[s.slotId] === 'sealed')) return 'locked';
    if (nonKey(axisId).every((s) => S[s.slotId] === 'sealed')) return 'sealing';
    const leadSlot = lead(axisId);
    const L = leadSlot ? S[leadSlot.slotId] : undefined;
    if (L === 'sealed' || L === 'verified') return 'building';
    return 'fishing';
  };
  const boardPhase = () => {
    if (axisOrder.every((a) => heptadPhase(a) === 'locked')) return 'sealed';
    return axisOrder.some((a) => ignited[a]) ? 'assembling' : 'seeded';
  };
  const sealedCount = () => slots.filter((s) => S[s.slotId] === 'sealed').length;
  const p = () => sealedCount() / slots.length;
  const heptadFold = (axisId) => byAxis[axisId].filter((s) => S[s.slotId] === 'sealed').length / 7;

  // gates -------------------------------------------------------------------
  function canStart(slot) {
    if (slot.isKeystone) return nonKey(slot.axisId).every((s) => S[s.slotId] === 'sealed');
    if (slot.personaClass === 'mouse') {
      const L = lead(slot.axisId);
      return !!L && S[L.slotId] === 'sealed';
    }
    return ignited[slot.axisId]; // vision fish
  }

  function reject(reason) {
    return { ok: false, reason };
  }

  function dispatch(ev) {
    const s = ev.slotId ? byId[ev.slotId] : null;
    switch (ev.type) {
      case 'ROOT_IGNITE': {
        if (!(ev.axisId in ignited)) return reject('unknown axis');
        if (ignited[ev.axisId]) return reject('already ignited');
        ignited[ev.axisId] = true;
        break;
      }
      case 'FISH_PROPOSE': {
        if (!s) return reject('unknown slot');
        if (!ignited[s.axisId]) return reject('heptad not ignited');
        if (S[s.slotId] !== 'empty') return reject('slot not empty');
        S[s.slotId] = 'proposed';
        break;
      }
      case 'TASK_START': {
        if (!s) return reject('unknown slot');
        if (S[s.slotId] !== 'proposed') return reject('slot not proposed');
        if (!canStart(s)) return reject('fill-order / gate not satisfied');
        S[s.slotId] = 'in_progress';
        break;
      }
      case 'TASK_VERIFY': {
        if (!s) return reject('unknown slot');
        if (S[s.slotId] !== 'in_progress') return reject('slot not in_progress');
        if (s.isKeystone && !nonKey(s.axisId).every((x) => S[x.slotId] === 'sealed'))
          return reject('keystone opened too early');
        if (ev.integrityOk === false) return reject('integrity gate h(tau) failed');
        S[s.slotId] = 'verified';
        if (ev.kappaLabel) kappa[s.slotId] = ev.kappaLabel;
        break;
      }
      case 'SLOT_SEAL': {
        if (!s) return reject('unknown slot');
        if (S[s.slotId] !== 'verified') return reject('slot not verified');
        if (s.isKeystone && !nonKey(s.axisId).every((x) => S[x.slotId] === 'sealed'))
          return reject('guide must seal last');
        S[s.slotId] = 'sealed';
        break;
      }
      case 'TASK_ABANDON': {
        if (!s || S[s.slotId] !== 'in_progress') return reject('cannot abandon');
        S[s.slotId] = 'empty';
        break;
      }
      case 'PROPOSAL_WITHDRAW': {
        if (!s || S[s.slotId] !== 'proposed') return reject('cannot withdraw');
        S[s.slotId] = 'empty';
        break;
      }
      default:
        return reject('unknown event ' + ev.type);
    }
    log.push(ev);
    return { ok: true };
  }

  return {
    slots, byId, byAxis, axisOrder,
    state: S, ignited, kappa, log,
    get groupSeal() { return groupSeal; },
    setGroupSeal(v) { groupSeal = v; },
    heptadPhase, boardPhase, sealedCount, p, heptadFold, canStart,
    lead, nonKey,
    dispatch,
  };
}

// nextAction — the deterministic driver used by Step / Auto-play. Returns the
// single legal event that advances the game by the smallest honest increment,
// in fill order across heptads (so gates always pass). Returns null when sealed.
export function nextAction(game, igniteOrder) {
  // 1) ignite any dormant heptad first (in the active game's order)
  for (const a of igniteOrder || game.axisOrder) if (!game.ignited[a]) return { type: 'ROOT_IGNITE', axisId: a };
  // 2) advance the lowest fillOrder unsealed slot that has a legal next step
  const ordered = [...game.slots].sort(
    (x, y) => x.fillOrder - y.fillOrder || game.axisOrder.indexOf(x.axisId) - game.axisOrder.indexOf(y.axisId)
  );
  for (const s of ordered) {
    const st = game.state[s.slotId];
    if (st === 'sealed') continue;
    if (st === 'empty') return { type: 'FISH_PROPOSE', slotId: s.slotId };
    if (st === 'proposed' && game.canStart(s)) return { type: 'TASK_START', slotId: s.slotId };
    if (st === 'in_progress') return { type: 'TASK_VERIFY', slotId: s.slotId, _needsKappa: s };
    if (st === 'verified') {
      if (s.isKeystone && !game.nonKey(s.axisId).every((x) => game.state[x.slotId] === 'sealed')) continue;
      return { type: 'SLOT_SEAL', slotId: s.slotId };
    }
  }
  return null; // all sealed
}
