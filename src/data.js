// data.js — load the single source of truth and assert its shape at boot.
import GAME from '../game-of-42.json';

export const DATA = GAME;
export const SLOTS = GAME.slots;
export const AXES = GAME.axisSpace.axes;
export const STATION_TABLE = GAME.stationTable;
export const GEO = GAME.geometry;
export const AXIS_BY_ID = Object.fromEntries(AXES.map((a) => [a.id, a]));
export const AXIS_ORDER = AXES.map((a) => a.id); // canonical heptad order

// BUILD-PLAN Phase 0 acceptance: 42 slots, 6 heptads, 3 fish / 3 mice / 1 guide each.
export function bootAssert() {
  const errs = [];
  if (SLOTS.length !== 42) errs.push(`expected 42 slots, got ${SLOTS.length}`);
  const byAxis = {};
  for (const s of SLOTS) (byAxis[s.axisId] ||= []).push(s);
  const ids = Object.keys(byAxis);
  if (ids.length !== 6) errs.push(`expected 6 heptads, got ${ids.length}`);
  for (const a of ids) {
    const g = byAxis[a];
    if (g.length !== 7) errs.push(`${a}: expected 7 stations, got ${g.length}`);
    const fish = g.filter((s) => s.personaClass === 'vision_fish').length;
    const mice = g.filter((s) => s.personaClass === 'mouse').length;
    const guide = g.filter((s) => s.personaClass === 'privacy_guide').length;
    if (fish !== 3 || mice !== 3 || guide !== 1)
      errs.push(`${a}: class split ${fish}/${mice}/${guide} != 3/3/1`);
    if (g.filter((s) => s.isKeystone).length !== 1) errs.push(`${a}: keystone count != 1`);
  }
  // A1 (AXIOMS.md): lattice vertex map — d₁ Protection = HIGH bit (32) … value = 1.
  const VERT = { protection: 32, delegation: 16, memory: 8, connection: 4, compute: 2, value: 1 };
  for (const s of SLOTS) {
    if (s.latticeAxisVertex !== VERT[s.axisId]) errs.push(`A1 drift: ${s.slotId} latticeAxisVertex ${s.latticeAxisVertex} != ${VERT[s.axisId]}`);
  }
  for (const ax of AXES) {
    if (ax.latticeAxisVertex !== undefined && ax.latticeAxisVertex !== VERT[ax.id]) errs.push(`A1 drift: axis ${ax.id} latticeAxisVertex ${ax.latticeAxisVertex} != ${VERT[ax.id]}`);
  }
  return errs;
}

export const SLOTS_BY_AXIS = (() => {
  const m = {};
  for (const s of SLOTS) (m[s.axisId] ||= []).push(s);
  for (const a of Object.keys(m)) m[a].sort((x, y) => x.fillOrder - y.fillOrder);
  return m;
})();
