import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const manifest = JSON.parse(
  await readFile(
    resolve(root, 'docs/evidence/2026-10-03-neon-billboard/visual-assets.json'),
    'utf8',
  ),
);
const names = ['paprika', 'arin', 'raven'];
if (manifest.assets.length !== 3) throw new Error('Billboard requires all three approved ads');
for (const name of names) {
  const entry = manifest.assets.find((asset) => asset.character === name);
  const path = `public/assets/track/neon-grid/billboard/${name}-v1.webp`;
  if (!entry || entry.runtimePath !== path) throw new Error(`Missing approved sponsor: ${name}`);
  const bytes = await readFile(resolve(root, path));
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP')
    throw new Error(`Invalid WebP: ${path}`);
  // Approved derivatives are lossy VP8; read its keyframe dimensions directly.
  const signature = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]));
  if (
    signature < 0 ||
    (bytes.readUInt16LE(signature + 3) & 0x3fff) !== 2048 ||
    (bytes.readUInt16LE(signature + 5) & 0x3fff) !== 1152
  )
    throw new Error(`Billboard must be 2048x1152: ${path}`);
  if (
    createHash('sha256').update(bytes).digest('hex') !== entry.sha256 ||
    bytes.length !== entry.bytes
  )
    throw new Error(`Approved ad bytes differ: ${path}`);
}
console.log('Approved billboard ads: 3/3, exact 16:9, hashes PASS');
