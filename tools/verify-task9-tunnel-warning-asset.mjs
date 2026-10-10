import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const verifiedPaths = [
  'docs/design/neon-grid/assets/task9/billboards/service-tunnel-do-not-enter-v1-source.png',
  'public/assets/track/neon-grid/signage/service-tunnel-do-not-enter-v1.png',
];
const expected = '11e540547d0a60da9db2ae7636e373742dec11c9f440afe08c5e29bdddaa7db4';
for (const path of verifiedPaths) {
  const bytes = readFileSync(path);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const pngSignature = bytes.subarray(0, 8).equals(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  if (sha256 !== expected || !pngSignature ||
      bytes.readUInt32BE(16) !== 1024 || bytes.readUInt32BE(20) !== 512 ||
      bytes[24] !== 8 || bytes[25] !== 6) {
    throw new Error('T9.5 owner-approved hologram PNG mismatch: ' + path);
  }
}
console.log('Verified exact approved T9.5 source and runtime RGBA PNG bytes.');
