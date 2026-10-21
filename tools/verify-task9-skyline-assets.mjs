import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = [
  {
    path: 'public/assets/track/neon-grid/signage/manaconda-racing-v1.webp',
    sha256: '481feb4ff34635abad29dd4f65b39975e73c227eb0a53901a51028c5e9fe7d22',
    bytes: 192220,
  },
  {
    path: 'public/assets/track/neon-grid/signage/taco-bell-live-mas-v1.webp',
    sha256: 'd289bc4dbc10872d6c75aa4ae650aaf716bf83a9ea36da12ce0cdc021e7bea7e',
    bytes: 97524,
  },
];

for (const asset of assets) {
  const bytes = await readFile(asset.path);
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP')
    throw new Error(`Invalid Task 9 Skyline WebP: ${asset.path}`);
  const signature = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]));
  if (
    signature < 0 ||
    (bytes.readUInt16LE(signature + 3) & 0x3fff) !== 1024 ||
    (bytes.readUInt16LE(signature + 5) & 0x3fff) !== 512
  )
    throw new Error(`Task 9 Skyline billboard must be 1024x512: ${asset.path}`);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== asset.sha256 || bytes.length !== asset.bytes)
    throw new Error(`Approved Task 9 Skyline ad bytes differ: ${asset.path}`);
}
console.log('Approved Task 9 Skyline ads: 2/2, exact 1024x512, hashes PASS');
