import { describe, it, expect } from 'vitest';
import { exampleJourney, transition, reading } from '../src/journey.js';
describe('practice journey', () => {
  it('requires scope, artefact and review in order', () => {
    expect(() => transition(exampleJourney(),'submit')).toThrow();
    let j=transition(exampleJourney(),'scope');
    expect(() => transition(j,'submit')).toThrow();
    j.artefact='A source-linked explanation'; j=transition(j,'submit');
    expect(() => transition(j,'review')).toThrow();
    j.review='Needs clearer identity wording'; j=transition(j,'review');
    expect(j.stage).toBe('reviewed'); expect(j.mode).toBe('practice'); expect(j.history).toHaveLength(3);
  });
  it('only releases selected fields, never history or opaque extensions', () => {
    const j={...exampleJourney(), history:[{private:'retained'}], secret:'never released'};
    expect(reading(j,['purpose','history','secret'])).toEqual({kind:'game42-reading',version:1,mode:'practice',stage:'draft',notice:expect.any(String),purpose:j.purpose});
    expect(j.history).toEqual([{private:'retained'}]);
  });
});
