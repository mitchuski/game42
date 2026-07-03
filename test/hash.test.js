// hash.test.js — the two κ parameterizations (AXIOMS A3), pinned to vectors
// computed from the Python reference (canonical_serialise.py) so a refactor of
// either canonicalizer fails loudly instead of silently drifting.
import { describe, it, expect } from 'vitest';
import { canonical, sha256hex, kappaLabel, groupSeal } from '../src/hash.js';
import { kappaCity } from '../src/citykey.js';
import { AXIS_VERTEX } from '../src/canon.js';

// the __main__ demo of canonical_serialise.py — byte-for-byte cross-impl vector
const PY_DEMO_VRC = {
  vrcId: 'x', slotId: 'compute.head', axisId: 'compute', polarity: '+',
  proverb: 'i advise the seeing so the building can begin', issuedAt: '2026-06-27T00:00:00Z',
};
const PY_DEMO_KAPPA = '4cdab0eb939a89c0dc1d479aa3da06914c0b3989955d38359911674a98c48f60';

// one object hashed under BOTH parameterizations (vectors from the Python ref):
// game42 excludes {kappa,seal,vrcId,gameId} and labels bare hex; the soulbis City
// Key excludes only kappa and labels sha256:-prefixed.
const DUAL_OBJ = {
  name: 'conformance', kappa: 'sha256:excluded', seal: 'deadbeef', vrcId: 'v-1',
  nested: { b: '2', a: '1' }, list: ['x', 'y'],
};
const DUAL_GAME42 = '31a8503604781908a0f79556c749f14d4dd7c7f6a01831510459a30a730b04a3';
const DUAL_CITY = 'sha256:e5a39b5f364fdfb07c007b11a21453ea714da5a86a47bdcb7b6938b495be4638';

describe('A1 anchors', () => {
  it('the axis-vertex map holds V38 / V25 / V41', () => {
    expect(AXIS_VERTEX.protection + AXIS_VERTEX.connection + AXIS_VERTEX.compute).toBe(38); // Aletheia
    expect(AXIS_VERTEX.delegation + AXIS_VERTEX.memory + AXIS_VERTEX.value).toBe(25); // Lethe
    expect(AXIS_VERTEX.protection + AXIS_VERTEX.memory + AXIS_VERTEX.value).toBe(41); // Memora
    expect(Object.values(AXIS_VERTEX).reduce((a, b) => a | b, 0)).toBe(63);
  });
});

describe('game42 parameterization (bare hex · excludes kappa/seal/vrcId/gameId)', () => {
  it('matches the Python reference demo vector', async () => {
    expect(await kappaLabel(PY_DEMO_VRC)).toBe(PY_DEMO_KAPPA);
  });

  it('excludes exactly {kappa, seal, vrcId, gameId} at the top level', () => {
    const c = canonical({ a: '1', kappa: 'k', seal: 's', vrcId: 'v', gameId: 'g' });
    expect(c).toBe('{"a":"1"}');
  });

  it('matches the dual-vector', async () => {
    expect(await sha256hex(canonical(DUAL_OBJ))).toBe(DUAL_GAME42);
  });

  it('groupSeal sorts the labels — order does not matter', async () => {
    const gh = 'geom';
    const s1 = await groupSeal(['b', 'a', 'c'], gh);
    const s2 = await groupSeal(['c', 'b', 'a'], gh);
    expect(s1).toBe(s2);
    expect(s1).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('soulbis City-Key parameterization (sha256: prefix · excludes only kappa)', () => {
  it('matches the dual-vector', async () => {
    expect(await kappaCity(DUAL_OBJ)).toBe(DUAL_CITY);
  });

  it('the two parameterizations stay intentionally distinct on the same object', async () => {
    const g42 = await sha256hex(canonical(DUAL_OBJ));
    const city = await kappaCity(DUAL_OBJ);
    expect('sha256:' + g42).not.toBe(city); // seal/vrcId included on the city axis
  });
});
