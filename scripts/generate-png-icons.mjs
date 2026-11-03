import fs from 'node:fs';
import zlib from 'node:zlib';

function createPng(width, height, drawFn) {
  // RGBA buffer with filter byte per scanline
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);

    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc32(body), 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: Standard
  ihdr[12] = 0; // Interlace: None

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ -1;
}

// Shrine Icon Drawer
function drawShrineIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = w * 0.46;

  // Background gradient: lacquer red & dark gold
  const t = Math.min(1, dist / radius);
  let r = Math.round(40 * (1 - t) + 14 * t);
  let g = Math.round(14 * (1 - t) + 6 * t);
  let b = Math.round(12 * (1 - t) + 5 * t);

  // Outer circular border
  if (dist > radius - 8 && dist < radius) {
    return [232, 185, 74, 255]; // Gold
  }
  if (dist > radius - 14 && dist < radius - 11) {
    return [212, 175, 55, 180];
  }

  // Torii gate roof: y around 0.35h
  const roofY = h * 0.34;
  const curve = Math.pow((x - cx) / (w * 0.4), 2) * 16;
  if (Math.abs(y - (roofY + curve)) < 7 && Math.abs(x - cx) < w * 0.38) {
    return [255, 215, 0, 255]; // Golden ridge
  }

  // Torii gate pillars: left and right
  const pillarW = w * 0.05;
  const pLeft = cx - w * 0.22;
  const pRight = cx + w * 0.22;
  if (y > h * 0.36 && y < h * 0.78) {
    if (Math.abs(x - pLeft) < pillarW || Math.abs(x - pRight) < pillarW) {
      return [179, 38, 30, 255]; // Vermilion red
    }
  }

  // Central glowing lantern
  const lDist = Math.hypot(x - cx, y - (h * 0.54));
  if (lDist < w * 0.14) {
    if (lDist > w * 0.12) return [255, 215, 0, 255]; // Gold rim
    return [214, 32, 32, 255]; // Bright red lantern
  }

  // Base stone steps
  if (y >= h * 0.78 && y <= h * 0.83 && Math.abs(x - cx) < w * 0.32) {
    return [232, 185, 74, 255];
  }

  return [r, g, b, 255];
}

// Generate files
const sizes = [
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/pwa-maskable-512x512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

for (const { file, size } of sizes) {
  const buf = createPng(size, size, drawShrineIcon);
  fs.writeFileSync(file, buf);
  console.log(`Generated ${file} (${size}x${size}, ${buf.length} bytes)`);
}
