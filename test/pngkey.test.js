// pngkey.test.js — the PNG tEXt carrier (AXIOMS A7): byte-exact round-trip,
// valid CRC-32 on the injected chunks, multi-keyword coexistence.
import { describe, it, expect } from 'vitest';
import { pngEmbed, pngExtract } from '../src/pngkey.js';

// a 1×1 transparent PNG (standard canvas-shaped: ends with the 12-byte IEND)
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const CFG = {
  version: 1, kind: 'game-of-42', name: 'test game', preset: 'mages',
  seal: null, p: 0.5,
  log: [{ type: 'ROOT_IGNITE', axisId: 'protection' }, { type: 'FISH_PROPOSE', slotId: 'protection.head' }],
  unicode: 'κ · ⚔️⊥⿻⊥🧙 😊',
};
const CITY = { name: 'projection', lit: [32, 16], packets: { root: 'abc', count: 2 } };

// independent CRC-32 (reference polynomial) to verify the embedded chunks
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

async function embedToBuffer(cfg, extras) {
  const blob = pngEmbed(TINY_PNG, cfg, extras);
  return blob.arrayBuffer();
}

describe('round-trip', () => {
  it('embed → extract returns a deep-equal payload (unicode intact)', async () => {
    const buf = await embedToBuffer(CFG);
    expect(pngExtract(buf, 'game42')).toEqual(CFG);
  });

  it('a non-PNG buffer extracts to null', () => {
    expect(pngExtract(new TextEncoder().encode('not a png').buffer)).toBeNull();
  });

  it('a missing keyword extracts to null', async () => {
    const buf = await embedToBuffer(CFG);
    expect(pngExtract(buf, 'cityKey')).toBeNull();
  });
});

describe('multi-keyword carrier', () => {
  it('game42 + cityKey chunks coexist; each reader greps its own', async () => {
    const buf = await embedToBuffer(CFG, [{ keyword: 'cityKey', cfg: CITY }]);
    expect(pngExtract(buf, 'game42')).toEqual(CFG);
    expect(pngExtract(buf, 'cityKey')).toEqual(CITY);
    expect(pngExtract(buf, 'citySky')).toBeNull();
  });
});

describe('chunk integrity', () => {
  it('every injected tEXt chunk carries a valid CRC-32 and IEND stays last', async () => {
    const u = new Uint8Array(await embedToBuffer(CFG, [{ keyword: 'cityKey', cfg: CITY }]));
    let p = 8, textChunks = 0, lastType = '';
    while (p + 12 <= u.length) {
      const len = ((u[p] << 24) | (u[p + 1] << 16) | (u[p + 2] << 8) | u[p + 3]) >>> 0;
      const type = String.fromCharCode(u[p + 4], u[p + 5], u[p + 6], u[p + 7]);
      const stored = ((u[p + 8 + len] << 24) | (u[p + 9 + len] << 16) | (u[p + 10 + len] << 8) | u[p + 11 + len]) >>> 0;
      expect(crc32(u.subarray(p + 4, p + 8 + len))).toBe(stored);
      if (type === 'tEXt') textChunks++;
      lastType = type;
      p += 12 + len;
    }
    expect(textChunks).toBe(2);
    expect(lastType).toBe('IEND');
  });
});
