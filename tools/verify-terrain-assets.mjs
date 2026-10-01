import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = 'public/assets/track/materials/terrain-v1';
const manifest = JSON.parse(await readFile(`${root}/manifest.json`, 'utf8'));
const requiredIds = ['leafy_grass', 'brown_mud', 'gravel_floor_02'];
if (manifest.assets.length !== requiredIds.length)
  throw new Error('Terrain manifest must contain exactly the three reviewed materials.');

let byteCount = 0;
for (const id of requiredIds) {
  const asset = manifest.assets.find((entry) => entry.id === id);
  if (!asset || asset.maps.length !== 3) throw new Error(`Incomplete terrain material: ${id}`);
  for (const [role, suffix] of [
    ['albedo', 'diff'],
    ['normal', 'nor_gl'],
    ['arm', 'arm'],
  ]) {
    const map = asset.maps.find((entry) => entry.role === role);
    const expectedName = `${id}_${suffix}_1k.jpg`;
    if (!map || map.filename !== expectedName)
      throw new Error(`Missing terrain map: ${expectedName}`);
    const bytes = await readFile(`${root}/${expectedName}`);
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9)
      throw new Error(`Terrain map is not a materialized JPEG: ${expectedName}`);
    if (
      bytes.length !== map.bytes ||
      createHash('sha256').update(bytes).digest('hex') !== map.sha256
    )
      throw new Error(`Terrain map hash/size mismatch: ${expectedName}`);
    byteCount += bytes.length;
  }
}
console.log(`Verified 9 terrain JPEGs (${byteCount} bytes) against the reviewed source inventory.`);
