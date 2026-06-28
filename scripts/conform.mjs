// conform.mjs — build gate. Fails (exit 1) if game-of-42.json violates the canon
// in AXIOMS.md: 42 slots · 6 heptads · 3 fish / 3 mice / 1 guide each, and the A1
// lattice vertex map (d₁ Protection = HIGH bit 32 … value = 1) + the anchor sums.
import { readFileSync } from 'node:fs';

const g = JSON.parse(readFileSync(new URL('../game-of-42.json', import.meta.url), 'utf8'));
const VERT = { protection: 32, delegation: 16, memory: 8, connection: 4, compute: 2, value: 1 };
const errs = [];

if (g.slots.length !== 42) errs.push(`expected 42 slots, got ${g.slots.length}`);
const byAxis = {};
for (const s of g.slots) (byAxis[s.axisId] ||= []).push(s);
if (Object.keys(byAxis).length !== 6) errs.push(`expected 6 heptads, got ${Object.keys(byAxis).length}`);
for (const a of Object.keys(byAxis)) {
  const gg = byAxis[a];
  if (gg.length !== 7) errs.push(`${a}: ${gg.length} stations != 7`);
  const f = gg.filter((s) => s.personaClass === 'vision_fish').length;
  const m = gg.filter((s) => s.personaClass === 'mouse').length;
  const gd = gg.filter((s) => s.personaClass === 'privacy_guide').length;
  if (f !== 3 || m !== 3 || gd !== 1) errs.push(`${a}: class split ${f}/${m}/${gd} != 3/3/1`);
  if (gg.filter((s) => s.isKeystone).length !== 1) errs.push(`${a}: keystone count != 1`);
}
// A1 vertex map
for (const s of g.slots) {
  if (s.latticeAxisVertex !== VERT[s.axisId]) errs.push(`A1: ${s.slotId} latticeAxisVertex ${s.latticeAxisVertex} != ${VERT[s.axisId]}`);
}
for (const ax of g.axisSpace.axes) {
  if (ax.latticeAxisVertex !== undefined && ax.latticeAxisVertex !== VERT[ax.id]) errs.push(`A1: axis ${ax.id} latticeAxisVertex ${ax.latticeAxisVertex} != ${VERT[ax.id]}`);
}
// anchors (A1)
if (VERT.protection + VERT.connection + VERT.compute !== 38) errs.push('anchor V38 != 38');
if (VERT.delegation + VERT.memory + VERT.value !== 25) errs.push('anchor V25 != 25');

if (errs.length) {
  console.error('✗ game42 conformance FAILED (AXIOMS A1):');
  for (const e of errs) console.error('  - ' + e);
  process.exit(1);
}
console.log('✓ game42 conformance ok · 42/6/3-3-1 · A1 vertices · anchors V38/V25');
