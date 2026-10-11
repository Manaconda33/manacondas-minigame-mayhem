import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = [
  {
    path: 'public/assets/track/neon-grid/signage/nightshift-noodles-v1.webp',
    sha256: '76fc1f75778c757cd979ff78641844cbf1d3955ec6dff7cc8145289dda45373a',
    bytes: 220026,
  },
  {
    path: 'public/assets/track/neon-grid/signage/voltline-industrial-v1.webp',
    sha256: '19b32b71ee59a0f52860c4a6003057b46e4fde890c4e2d4d390b78ed2ea67863',
    bytes: 238228,
  },
];

for (const asset of assets) {
  const bytes = await readFile(asset.path);
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP')
    throw new Error('Invalid Task 9 Undercity WebP: ' + asset.path);
  const signature = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]));
  if (
    signature < 0 ||
    (bytes.readUInt16LE(signature + 3) & 0x3fff) !== 1024 ||
    (bytes.readUInt16LE(signature + 5) & 0x3fff) !== 512
  )
    throw new Error('Task 9 Undercity billboard must be 1024x512: ' + asset.path);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== asset.sha256 || bytes.length !== asset.bytes)
    throw new Error('Approved Task 9 Undercity ad bytes differ: ' + asset.path);
}
console.log('Approved Task 9 Undercity ads: 2/2, exact 1024x512, hashes PASS');
