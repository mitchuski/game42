// pngkey.js — the carrier. The exported PNG embeds the game's event log (the
// canonical artifact, GAME-FLOW §6) as base64 JSON in a PNG tEXt chunk, keyword
// 'game42', inserted before IEND with correct CRC-32. Re-import replays the log.
// Same pattern as the soulbis /sigil cityKey carrier — portability, not secrecy.
const KEYWORD = 'game42';

function b2s(a) {
  let s = '';
  for (let i = 0; i < a.length; i += 8192) s += String.fromCharCode.apply(null, a.subarray(i, i + 8192));
  return s;
}

const CRCT = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRCT[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// build one tEXt chunk (keyword\0 + base64 JSON) with a correct CRC-32
function textChunk(keyword, cfg) {
  const payload = btoa(b2s(new TextEncoder().encode(JSON.stringify(cfg))));
  const data = new Uint8Array(keyword.length + 1 + payload.length);
  for (let i = 0; i < keyword.length; i++) data[i] = keyword.charCodeAt(i);
  data[keyword.length] = 0;
  for (let i = 0; i < payload.length; i++) data[keyword.length + 1 + i] = payload.charCodeAt(i);

  const chunk = new Uint8Array(12 + data.length);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, data.length);
  chunk[4] = 0x74; chunk[5] = 0x45; chunk[6] = 0x58; chunk[7] = 0x74; // 'tEXt'
  chunk.set(data, 8);
  const crcBuf = new Uint8Array(4 + data.length);
  crcBuf.set(chunk.subarray(4, 8), 0);
  crcBuf.set(data, 4);
  dv.setUint32(8 + data.length, crc32(crcBuf));
  return chunk;
}

// Embed the game42 log chunk, plus any extra carrier chunks. `extras` is a list of
// { keyword, cfg } — e.g. a 'cityKey' projection so the same PNG rises in /skye.
// Each reader greps its own keyword; the others are inert to it.
export function pngEmbed(dataURL, cfg, extras = []) {
  const bin = atob(dataURL.slice(dataURL.indexOf(',') + 1));
  const png = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) png[i] = bin.charCodeAt(i);

  const chunks = [textChunk(KEYWORD, cfg), ...extras.map((e) => textChunk(e.keyword, e.cfg))];
  const total = chunks.reduce((n, c) => n + c.length, 0);

  const iend = png.length - 12; // canvas PNGs end with the 12-byte IEND chunk
  const out = new Uint8Array(png.length + total);
  out.set(png.subarray(0, iend), 0);
  let off = iend;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  out.set(png.subarray(iend), off);
  return new Blob([out], { type: 'image/png' });
}

export function pngExtract(buf, keyword = KEYWORD) {
  const u = new Uint8Array(buf);
  if (u.length < 20 || u[0] !== 0x89 || u[1] !== 0x50 || u[2] !== 0x4e || u[3] !== 0x47) return null;
  let p = 8;
  while (p + 12 <= u.length) {
    const len = ((u[p] << 24) | (u[p + 1] << 16) | (u[p + 2] << 8) | u[p + 3]) >>> 0;
    const type = String.fromCharCode(u[p + 4], u[p + 5], u[p + 6], u[p + 7]);
    if (type === 'tEXt') {
      const data = u.subarray(p + 8, p + 8 + len);
      const z = data.indexOf(0);
      if (z > 0 && b2s(data.subarray(0, z)) === keyword) {
        try {
          const bin = atob(b2s(data.subarray(z + 1)));
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return JSON.parse(new TextDecoder().decode(bytes));
        } catch (e) {
          return null;
        }
      }
    }
    if (type === 'IEND') break;
    p += 12 + len;
  }
  return null;
}

export function readKeyFile(file, cb, onErr) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const cfg = pngExtract(r.result) || JSON.parse(new TextDecoder().decode(r.result));
      if (!cfg || typeof cfg !== 'object') throw 0;
      cb(cfg);
    } catch (e) {
      onErr && onErr();
    }
  };
  r.readAsArrayBuffer(file);
}
