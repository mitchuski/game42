import { describe, it, expect } from 'vitest';
import fixtures from './fixtures/hearthold-city-key-v1.json';
import { kappaCity } from '../src/citykey.js';

// Shared verbatim with Hearthold PR #91, not generated from this implementation.
describe('Hearthold City Key contract', () => {
  for (const vector of fixtures.vectors) {
    it('matches the independent digest: ' + vector.id, async () => {
      const input = structuredClone(vector.content);
      const before = JSON.stringify(input);
      expect(await kappaCity(input)).toBe(vector.kappa);
      expect(await kappaCity({...input, kappa: vector.kappa})).toBe(vector.kappa);
      expect(JSON.stringify(input)).toBe(before);
    });
  }
  it('binds Hold, lineage and opaque content to the City fingerprint', async () => {
    const vector = fixtures.vectors.find(v => v.id === 'hold-and-unknown-fields');
    for (const edit of [
      k => { k.holds.count++; },
      k => { k.holds.root = 'sha256:' + '3'.repeat(64); },
      k => { k.prior = 'sha256:' + '4'.repeat(64); },
      k => { k.extension.kappa = 'changed'; },
      k => { k.extension.items.reverse(); },
    ]) {
      const key = structuredClone(vector.content);
      edit(key);
      expect(await kappaCity(key)).not.toBe(vector.kappa);
    }
  });
});
