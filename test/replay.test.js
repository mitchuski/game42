import { describe, it, expect } from 'vitest';
import { SLOTS, AXIS_ORDER } from '../src/data.js';
import { createGame, nextAction } from '../src/flow.js';
import { demoVRC, kappaLabel, geometryHash, groupSeal } from '../src/hash.js';
import { replayPractice } from '../src/replay.js';
import { game42ToCityKey, kappaCity } from '../src/citykey.js';
import { pngEmbed, pngExtract } from '../src/pngkey.js';
const snapshot={p:'1',fixture:'geometry'};
async function fixture() {
  const g=createGame(SLOTS,AXIS_ORDER);
  let ev;
  while((ev=nextAction(g,AXIS_ORDER))) {
    if(ev.type==='TASK_VERIFY')ev={type:ev.type,slotId:ev.slotId,kappaLabel:await kappaLabel(demoVRC(ev._needsKappa))};
    g.dispatch(ev);
  }
  return {g,cfg:{version:1,kind:'game-of-42',log:g.log,seal:await groupSeal(Object.values(g.kappa),await geometryHash(snapshot))}};
}
describe('legacy practice replay integrity',()=>{
  it('recomputes a complete seal without promoting it to verified evidence',async()=>{
    const {cfg}=await fixture(); const r=await replayPractice(cfg,SLOTS,AXIS_ORDER,snapshot);
    expect(r.game.groupSeal).toBe(cfg.seal); expect(r.status).toContain('not verified');
  });
  it('rejects modified seals, invalid events, incomplete and malformed labels',async()=>{
    const {cfg}=await fixture();
    await expect(replayPractice({...cfg,seal:'0'.repeat(64)},SLOTS,AXIS_ORDER,snapshot)).rejects.toThrow('mismatch');
    await expect(replayPractice({...cfg,log:cfg.log.slice(1)},SLOTS,AXIS_ORDER,snapshot)).rejects.toThrow('Event');
    await expect(replayPractice({...cfg,log:cfg.log.slice(0,-1)},SLOTS,AXIS_ORDER,snapshot)).rejects.toThrow('complete');
    const bad=structuredClone(cfg);bad.log.find(e=>e.type==='TASK_VERIFY').kappaLabel='bad';
    await expect(replayPractice(bad,SLOTS,AXIS_ORDER,snapshot)).rejects.toThrow('content label');
  });
  it('does not accept a compact reading or unsupported version as a replay',async()=>{
    await expect(replayPractice({kind:'game42-reading',version:1,log:[]},SLOTS,AXIS_ORDER,snapshot)).rejects.toThrow();
    await expect(replayPractice({kind:'game-of-42',version:9,log:[]},SLOTS,AXIS_ORDER,snapshot)).rejects.toThrow();
  });
});
describe('practice City carrier',()=>{
  it('preserves lattice mapping and digest without producing chargeable evidence',async()=>{
    const {g,cfg}=await fixture(); const city=game42ToCityKey(g,{preset:'mages',seal:cfg.seal,savedAt:'2026-09-12T00:00:00Z'});
    city.kappa=await kappaCity(city);
    expect(city.lit).toEqual([1,2,4,8,16,32,63]);expect(city.witness).toBeUndefined();expect(city.packets).toBeUndefined();
    expect(city.source.evidenceStatus).toBe('practice-unverified'); expect(await kappaCity(city)).toBe(city.kappa);
    const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const bytes=await pngEmbed(png,cfg,[{keyword:'cityKey',cfg:city}]).arrayBuffer();
    expect(pngExtract(bytes,'cityKey')).toEqual(city);expect(pngExtract(bytes,'game42')).toEqual(cfg);
  });
});
