import { open, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';

const archivedCleoHashes = new Map([
  [
    'public/assets/archive/characters/cleo-aa-06/portrait.png',
    '1f960402a447078e681f3f4b1b0ed5fcf8dcc1ca10f4a4deec077d758400b2cf',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/driver/front.png',
    '70b6884751897e9f7ccba2fbeb5c37ed0b6c0631fea0fe1dd6788823a18d524e',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/driver/rear.png',
    'af97bb7be383e6bd1f87eae944941e8c60d8fe987c36db53f75a16a635d582d9',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/driver/steer-left.png',
    '7cde1f8bb0e1eec2f217efbcb9ec2592fe8c39c92487964d63615b07f3fc0d95',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/driver/steer-right.png',
    'c6bae3e9e75f6ed28a71a309bcc44f45e7d470193293051850e82b1c1ffecd4a',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/driver/hit.png',
    'ddbdac8788f5095f406eb0199b7324f1e78a073b74e13db948f62140d7562032',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/driver/victory.png',
    '53d7648dc4e44d150a43b5db7cd3e5ce8dfd4030c2a802f355fffc5675393d21',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/kart.glb',
    '453ebc42da5745f7f5251323cd7a38a79add6538ee39dc9e512570c1c9905150',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/kart-lod1.glb',
    'a9013591726b3bbb43b102d3707fe9da24f2e1e8de24c929bbc6405e28357002',
  ],
  [
    'public/assets/archive/characters/cleo-aa-06/kart-lod2.glb',
    '3578b62d3c9fa332adb2b1ae7addb1d2b56201c7c8491a1075e847ff18caa79e',
  ],
]);

for (const [path, expectedHash] of archivedCleoHashes) {
  const bytes = await readFile(path);
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  if (actualHash !== expectedHash) {
    throw new Error(`${path} no longer matches Cleo's approved archived bytes.`);
  }
}

console.log(`Verified ${String(archivedCleoHashes.size)} archived Cleo asset hashes.`);

const runtimeTrackTextureHashes = new Map([
  [
    'public/assets/track/materials/asphalt-track/asphalt_track_diff_1k.jpg',
    '05c4e79cd99160075969d37bfc6ef72be262153a410bb45510b2c23f7303894c',
  ],
  [
    'public/assets/track/materials/asphalt-track/asphalt_track_nor_gl_1k.jpg',
    '18caf02427a7cd9cd577ceae5aa9daa7bb3ffba60598e2df8aaf75d1925a8a94',
  ],
  [
    'public/assets/track/materials/asphalt-track/asphalt_track_rough_1k.jpg',
    '0646d0cfbe6bf9ea4a8a9e43aec826e7ec32a10b8aff61bf5a4ec02b1bc3c363',
  ],
]);

for (const [path, expectedHash] of runtimeTrackTextureHashes) {
  const bytes = await readFile(path);
  if (
    bytes.length < 4 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes.at(-2) !== 0xff ||
    bytes.at(-1) !== 0xd9
  ) {
    throw new Error(`${path} is not a materialized JPEG. Check Git LFS checkout.`);
  }
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  if (actualHash !== expectedHash) {
    throw new Error(`${path} no longer matches the approved Poly Haven 1K derivative bytes.`);
  }
}

console.log(
  `Verified ${String(runtimeTrackTextureHashes.size)} materialized runtime track textures.`,
);

const runtimeResultsHashes = new Map([
  [
    'public/assets/characters/aa-07/results/victory.png',
    '21cbd6c61c2510baa22e351fce1564887331b511c0230345e79d7a3f42f91c02',
  ],
  [
    'public/assets/characters/aa-08/results/victory.png',
    '1ab53ed1c8d21314d14a99f9c80f65f4d3242cd929f30d1bf072c00ad86419cf',
  ],
  [
    'public/assets/characters/aa-09/results/victory.png',
    '19adc4de4c6a60d8ceb44ff73579b39812833965d42225305f0badd1be923a9b',
  ],
  [
    'public/assets/characters/aa-10/results/victory.png',
    'ceb43f0c7b12a7ad16556dfec460ffc29cfc4372561ce1fa9580a8399aa76c98',
  ],
  [
    'public/assets/characters/aa-11/results/victory.png',
    '59dd6987fef114989b7afba9cf13fec40b9896801619285165b646124e88b47b',
  ],
  [
    'public/assets/characters/aa-12/results/victory.png',
    '218ef5b7d5650046d04f5cc9adaeb014b9d7829d4b711079ed50c810173ca107',
  ],
]);

for (const [path, expectedHash] of runtimeResultsHashes) {
  const bytes = await readFile(path);
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  if (actualHash !== expectedHash) {
    throw new Error(`${path} no longer matches its approved Results/Podium bytes.`);
  }
}

console.log(`Verified ${String(runtimeResultsHashes.size)} approved Results/Podium assets.`);

const runtimeGlbs = [
  'public/assets/characters/aa-01/kart.glb',
  'public/assets/characters/aa-01/kart-lod1.glb',
  'public/assets/characters/aa-01/kart-lod2.glb',
  'public/assets/characters/aa-02/kart.glb',
  'public/assets/characters/aa-02/kart-lod1.glb',
  'public/assets/characters/aa-02/kart-lod2.glb',
  'public/assets/characters/aa-09/kart.glb',
  'public/assets/characters/aa-09/kart-lod1.glb',
  'public/assets/characters/aa-09/kart-lod2.glb',
  'public/assets/characters/aa-11/kart.glb',
  'public/assets/characters/aa-11/kart-lod1.glb',
  'public/assets/characters/aa-11/kart-lod2.glb',
  'public/assets/characters/aa-05/kart.glb',
  'public/assets/characters/aa-05/kart-lod1.glb',
  'public/assets/characters/aa-05/kart-lod2.glb',
  'public/assets/characters/aa-06/kart.glb',
  'public/assets/characters/aa-06/kart-lod1.glb',
  'public/assets/characters/aa-06/kart-lod2.glb',
  'public/assets/characters/aa-10/kart.glb',
  'public/assets/characters/aa-10/kart-lod1.glb',
  'public/assets/characters/aa-10/kart-lod2.glb',
  'public/assets/characters/aa-04/kart.glb',
  'public/assets/characters/aa-04/kart-lod1.glb',
  'public/assets/characters/aa-04/kart-lod2.glb',
  'public/assets/characters/aa-07/kart.glb',
  'public/assets/characters/aa-07/kart-lod1.glb',
  'public/assets/characters/aa-07/kart-lod2.glb',
  'public/assets/characters/aa-08/kart.glb',
  'public/assets/characters/aa-08/kart-lod1.glb',
  'public/assets/characters/aa-08/kart-lod2.glb',
  'public/assets/characters/aa-03/kart.glb',
  'public/assets/characters/aa-03/kart-lod1.glb',
  'public/assets/characters/aa-03/kart-lod2.glb',
  'public/assets/characters/aa-12/kart.glb',
  'public/assets/characters/aa-12/kart-lod1.glb',
  'public/assets/characters/aa-12/kart-lod2.glb',
];

for (const path of runtimeGlbs) {
  const file = await open(path, 'r');
  try {
    const signature = Buffer.alloc(4);
    await file.read(signature, 0, signature.length, 0);
    if (signature.toString('ascii') !== 'glTF') {
      throw new Error(`${path} is not a materialized GLB. Check Git LFS checkout.`);
    }
    const chunkHeader = Buffer.alloc(8);
    await file.read(chunkHeader, 0, chunkHeader.length, 12);
    const jsonLength = chunkHeader.readUInt32LE(0);
    if (chunkHeader.subarray(4).toString('ascii') !== 'JSON') {
      throw new Error(`${path} does not begin with a glTF JSON chunk.`);
    }
    const jsonChunk = Buffer.alloc(jsonLength);
    await file.read(jsonChunk, 0, jsonLength, 20);
    const gltf = JSON.parse(jsonChunk.toString('utf8'));
    if (gltf.extras?.forward !== '-Z') {
      throw new Error(`${path} must declare extras.forward as -Z.`);
    }
  } finally {
    await file.close();
  }
}

console.log(`Verified ${String(runtimeGlbs.length)} materialized runtime GLBs.`);

const paethPredictor = (left, above, upperLeft) => {
  const prediction = left + above - upperLeft;
  const leftDistance = Math.abs(prediction - left);
  const aboveDistance = Math.abs(prediction - above);
  const upperLeftDistance = Math.abs(prediction - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
};

const decodeRgbaRows = (filtered, width, height) => {
  const bytesPerPixel = 4;
  const sourceRowLength = width * bytesPerPixel + 1;
  const decoded = Buffer.alloc(width * height * bytesPerPixel);
  for (let row = 0; row < height; row += 1) {
    const filter = filtered[row * sourceRowLength];
    const sourceStart = row * sourceRowLength + 1;
    const targetStart = row * width * bytesPerPixel;
    for (let column = 0; column < width * bytesPerPixel; column += 1) {
      const raw = filtered[sourceStart + column];
      const left = column >= bytesPerPixel ? decoded[targetStart + column - bytesPerPixel] : 0;
      const above = row > 0 ? decoded[targetStart + column - width * bytesPerPixel] : 0;
      const upperLeft =
        row > 0 && column >= bytesPerPixel
          ? decoded[targetStart + column - width * bytesPerPixel - bytesPerPixel]
          : 0;
      let value = raw;
      if (filter === 1) value += left;
      else if (filter === 2) value += above;
      else if (filter === 3) value += Math.floor((left + above) / 2);
      else if (filter === 4) value += paethPredictor(left, above, upperLeft);
      decoded[targetStart + column] = value & 0xff;
    }
  }
  return decoded;
};

const countEnclosedTransparentRegions = (decoded, width, height, minimumPixels) => {
  const visited = new Uint8Array(width * height);
  let qualifyingRegions = 0;
  for (let start = 0; start < width * height; start += 1) {
    if (visited[start] !== 0 || decoded[start * 4 + 3] !== 0) continue;
    const stack = [start];
    visited[start] = 1;
    let pixels = 0;
    let touchesEdge = false;
    while (stack.length > 0) {
      const pixel = stack.pop();
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      pixels += 1;
      touchesEdge ||= x === 0 || y === 0 || x === width - 1 || y === height - 1;
      for (const neighbor of [pixel - width, pixel + width, pixel - 1, pixel + 1]) {
        if (neighbor < 0 || neighbor >= width * height || visited[neighbor] !== 0) continue;
        const neighborX = neighbor % width;
        if (Math.abs(neighborX - x) > 1 || decoded[neighbor * 4 + 3] !== 0) continue;
        visited[neighbor] = 1;
        stack.push(neighbor);
      }
    }
    if (!touchesEdge && pixels >= minimumPixels) qualifyingRegions += 1;
  }
  return qualifyingRegions;
};

const largestPaleNeutralComponentInRects = (decoded, width, height, rects) => {
  const candidate = new Uint8Array(width * height);
  for (const [left, top, right, bottom] of rects) {
    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        const pixel = y * width + x;
        const offset = pixel * 4;
        const red = decoded[offset];
        const green = decoded[offset + 1];
        const blue = decoded[offset + 2];
        const alpha = decoded[offset + 3];
        const maximum = Math.max(red, green, blue);
        const minimum = Math.min(red, green, blue);
        if (alpha > 16 && (red + green + blue) / 3 > 85 && maximum - minimum < 45) {
          candidate[pixel] = 1;
        }
      }
    }
  }

  const visited = new Uint8Array(width * height);
  let largest = 0;
  for (let start = 0; start < width * height; start += 1) {
    if (candidate[start] === 0 || visited[start] !== 0) continue;
    const stack = [start];
    visited[start] = 1;
    let pixels = 0;
    while (stack.length > 0) {
      const pixel = stack.pop();
      const x = pixel % width;
      pixels += 1;
      for (const neighbor of [pixel - width, pixel + width, pixel - 1, pixel + 1]) {
        if (neighbor < 0 || neighbor >= width * height || visited[neighbor] !== 0) continue;
        const neighborX = neighbor % width;
        if (Math.abs(neighborX - x) > 1 || candidate[neighbor] === 0) continue;
        visited[neighbor] = 1;
        stack.push(neighbor);
      }
    }
    largest = Math.max(largest, pixels);
  }
  return largest;
};

const largestVeryPaleNeutralComponent = (decoded, width, height) => {
  const candidate = new Uint8Array(width * height);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    const red = decoded[offset];
    const green = decoded[offset + 1];
    const blue = decoded[offset + 2];
    const alpha = decoded[offset + 3];
    if (
      alpha > 16 &&
      Math.min(red, green, blue) >= 220 &&
      Math.max(red, green, blue) - Math.min(red, green, blue) <= 25
    ) {
      candidate[pixel] = 1;
    }
  }

  const visited = new Uint8Array(width * height);
  let largest = 0;
  for (let start = 0; start < width * height; start += 1) {
    if (candidate[start] === 0 || visited[start] !== 0) continue;
    const stack = [start];
    visited[start] = 1;
    let pixels = 0;
    while (stack.length > 0) {
      const pixel = stack.pop();
      const x = pixel % width;
      pixels += 1;
      for (const neighbor of [pixel - width, pixel + width, pixel - 1, pixel + 1]) {
        if (neighbor < 0 || neighbor >= width * height || visited[neighbor] !== 0) continue;
        const neighborX = neighbor % width;
        if (Math.abs(neighborX - x) > 1 || candidate[neighbor] === 0) continue;
        visited[neighbor] = 1;
        stack.push(neighbor);
      }
    }
    largest = Math.max(largest, pixels);
  }
  return largest;
};

const lulaProtectedRects = {
  'portrait.png': [82, 66, 180, 170],
  'front.png': [205, 55, 310, 185],
  'victory.png': [300, 82, 400, 205],
  'front-steer-left.png': [280, 45, 395, 165],
  'front-steer-right.png': [105, 40, 235, 165],
  'front-hit.png': [270, 40, 390, 165],
  'front-victory.png': [210, 45, 325, 175],
};

const runtimePngs = [
  ['public/assets/characters/aa-01/portrait.png', 256, 256],
  ['public/assets/characters/aa-01/driver/front.png', 512, 512],
  ['public/assets/characters/aa-01/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-01/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-01/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-01/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-01/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-01/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-01/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-01/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-01/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-06/portrait.png', 256, 256],
  ['public/assets/characters/aa-06/driver/front.png', 512, 512],
  ['public/assets/characters/aa-06/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-06/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-06/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-06/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-06/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-06/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-06/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-06/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-06/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-02/driver/front.png', 512, 512],
  ['public/assets/characters/aa-02/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-02/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-02/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-02/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-05/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-05/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-05/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-05/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-09/driver/front.png', 512, 512],
  ['public/assets/characters/aa-09/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-09/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-09/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-09/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-10/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-10/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-10/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-10/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-11/driver/front.png', 512, 512],
  ['public/assets/characters/aa-11/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-11/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-11/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-11/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-11/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-11/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-11/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-11/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-11/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-04/portrait.png', 256, 256],
  ['public/assets/characters/aa-04/driver/front.png', 512, 512],
  ['public/assets/characters/aa-04/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-04/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-04/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-04/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-04/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-04/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-04/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-04/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-04/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-07/portrait.png', 256, 256],
  ['public/assets/characters/aa-07/driver/front.png', 512, 512],
  ['public/assets/characters/aa-07/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-07/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-07/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-07/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-07/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-07/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-07/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-07/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-07/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-08/portrait.png', 256, 256],
  ['public/assets/characters/aa-08/driver/front.png', 512, 512],
  ['public/assets/characters/aa-08/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-08/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-08/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-08/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-08/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-08/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-08/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-08/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-08/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-03/portrait.png', 256, 256],
  ['public/assets/characters/aa-03/driver/front.png', 512, 512],
  ['public/assets/characters/aa-03/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-03/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-03/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-03/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-03/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-03/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-03/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-03/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-03/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-12/portrait.png', 256, 256],
  ['public/assets/characters/aa-12/driver/front.png', 512, 512],
  ['public/assets/characters/aa-12/driver/rear.png', 512, 512],
  ['public/assets/characters/aa-12/driver/steer-left.png', 512, 512],
  ['public/assets/characters/aa-12/driver/steer-right.png', 512, 512],
  ['public/assets/characters/aa-12/driver/hit.png', 512, 512],
  ['public/assets/characters/aa-12/driver/victory.png', 512, 512],
  ['public/assets/characters/aa-12/driver/front-steer-left.png', 512, 512],
  ['public/assets/characters/aa-12/driver/front-steer-right.png', 512, 512],
  ['public/assets/characters/aa-12/driver/front-hit.png', 512, 512],
  ['public/assets/characters/aa-12/driver/front-victory.png', 512, 512],
  ['public/assets/characters/aa-07/results/victory.png', 1024, 1536],
  ['public/assets/characters/aa-08/results/victory.png', 1024, 1536],
  ['public/assets/characters/aa-09/results/victory.png', 1024, 1536],
  ['public/assets/characters/aa-10/results/victory.png', 1024, 1536],
  ['public/assets/characters/aa-11/results/victory.png', 1024, 1536],
  ['public/assets/characters/aa-12/results/victory.png', 1024, 1536],
  ['public/assets/characters/aa-01/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-02/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-03/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-04/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-05/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-06/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-07/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-08/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-09/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-10/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-11/selection/full-body.png', 1024, 1536],
  ['public/assets/characters/aa-12/selection/full-body.png', 1024, 1536],
];

const newTransparentFronts = new Set([
  'public/assets/characters/aa-01/portrait.png',
  'public/assets/characters/aa-01/driver/front.png',
  'public/assets/characters/aa-01/driver/rear.png',
  'public/assets/characters/aa-01/driver/steer-left.png',
  'public/assets/characters/aa-01/driver/steer-right.png',
  'public/assets/characters/aa-01/driver/hit.png',
  'public/assets/characters/aa-01/driver/victory.png',
  'public/assets/characters/aa-01/driver/front-steer-left.png',
  'public/assets/characters/aa-01/driver/front-steer-right.png',
  'public/assets/characters/aa-01/driver/front-hit.png',
  'public/assets/characters/aa-01/driver/front-victory.png',
  'public/assets/characters/aa-06/portrait.png',
  'public/assets/characters/aa-06/driver/front.png',
  'public/assets/characters/aa-06/driver/rear.png',
  'public/assets/characters/aa-06/driver/steer-left.png',
  'public/assets/characters/aa-06/driver/steer-right.png',
  'public/assets/characters/aa-06/driver/hit.png',
  'public/assets/characters/aa-06/driver/victory.png',
  'public/assets/characters/aa-06/driver/front-steer-left.png',
  'public/assets/characters/aa-06/driver/front-steer-right.png',
  'public/assets/characters/aa-06/driver/front-hit.png',
  'public/assets/characters/aa-06/driver/front-victory.png',
  'public/assets/characters/aa-02/driver/front.png',
  'public/assets/characters/aa-02/driver/front-steer-left.png',
  'public/assets/characters/aa-02/driver/front-steer-right.png',
  'public/assets/characters/aa-02/driver/front-hit.png',
  'public/assets/characters/aa-02/driver/front-victory.png',
  'public/assets/characters/aa-05/driver/front-steer-left.png',
  'public/assets/characters/aa-05/driver/front-steer-right.png',
  'public/assets/characters/aa-05/driver/front-hit.png',
  'public/assets/characters/aa-05/driver/front-victory.png',
  'public/assets/characters/aa-09/driver/front.png',
  'public/assets/characters/aa-09/driver/front-steer-left.png',
  'public/assets/characters/aa-09/driver/front-steer-right.png',
  'public/assets/characters/aa-09/driver/front-hit.png',
  'public/assets/characters/aa-09/driver/front-victory.png',
  'public/assets/characters/aa-10/driver/front-steer-left.png',
  'public/assets/characters/aa-10/driver/front-steer-right.png',
  'public/assets/characters/aa-10/driver/front-hit.png',
  'public/assets/characters/aa-10/driver/front-victory.png',
  'public/assets/characters/aa-04/driver/front-steer-left.png',
  'public/assets/characters/aa-04/driver/front-steer-right.png',
  'public/assets/characters/aa-04/driver/front-hit.png',
  'public/assets/characters/aa-04/driver/front-victory.png',
  'public/assets/characters/aa-07/driver/front-steer-left.png',
  'public/assets/characters/aa-07/driver/front-steer-right.png',
  'public/assets/characters/aa-07/driver/front-hit.png',
  'public/assets/characters/aa-07/driver/front-victory.png',
  'public/assets/characters/aa-08/driver/front-steer-left.png',
  'public/assets/characters/aa-08/driver/front-steer-right.png',
  'public/assets/characters/aa-08/driver/front-hit.png',
  'public/assets/characters/aa-08/driver/front-victory.png',
  'public/assets/characters/aa-11/driver/front.png',
  'public/assets/characters/aa-11/driver/front-steer-left.png',
  'public/assets/characters/aa-11/driver/front-steer-right.png',
  'public/assets/characters/aa-11/driver/front-hit.png',
  'public/assets/characters/aa-11/driver/front-victory.png',
  'public/assets/characters/aa-03/driver/front-steer-left.png',
  'public/assets/characters/aa-03/driver/front-steer-right.png',
  'public/assets/characters/aa-03/driver/front-hit.png',
  'public/assets/characters/aa-03/driver/front-victory.png',
  'public/assets/characters/aa-12/portrait.png',
  'public/assets/characters/aa-12/driver/front.png',
  'public/assets/characters/aa-12/driver/rear.png',
  'public/assets/characters/aa-12/driver/steer-left.png',
  'public/assets/characters/aa-12/driver/steer-right.png',
  'public/assets/characters/aa-12/driver/hit.png',
  'public/assets/characters/aa-12/driver/victory.png',
  'public/assets/characters/aa-12/driver/front-steer-left.png',
  'public/assets/characters/aa-12/driver/front-steer-right.png',
  'public/assets/characters/aa-12/driver/front-hit.png',
  'public/assets/characters/aa-12/driver/front-victory.png',
  'public/assets/characters/aa-07/results/victory.png',
  'public/assets/characters/aa-08/results/victory.png',
  'public/assets/characters/aa-09/results/victory.png',
  'public/assets/characters/aa-10/results/victory.png',
  'public/assets/characters/aa-11/results/victory.png',
  'public/assets/characters/aa-12/results/victory.png',
  'public/assets/characters/aa-01/selection/full-body.png',
  'public/assets/characters/aa-02/selection/full-body.png',
  'public/assets/characters/aa-03/selection/full-body.png',
  'public/assets/characters/aa-04/selection/full-body.png',
  'public/assets/characters/aa-05/selection/full-body.png',
  'public/assets/characters/aa-06/selection/full-body.png',
  'public/assets/characters/aa-07/selection/full-body.png',
  'public/assets/characters/aa-08/selection/full-body.png',
  'public/assets/characters/aa-09/selection/full-body.png',
  'public/assets/characters/aa-10/selection/full-body.png',
  'public/assets/characters/aa-11/selection/full-body.png',
  'public/assets/characters/aa-12/selection/full-body.png',
]);

const kriosHornApertureFronts = new Set([
  'public/assets/characters/aa-10/driver/front-steer-left.png',
  'public/assets/characters/aa-10/driver/front-steer-right.png',
  'public/assets/characters/aa-10/driver/front-victory.png',
]);

const accuApertureRects = {
  'steer-left.png': [90, 225, 128, 261],
  'steer-right.png': [371, 199, 424, 230],
  'victory.png': [86, 293, 119, 321],
};

const mcfleurdelSteeringMatteRects = {
  'front-steer-left.png': [
    [65, 175, 131, 271],
    [315, 265, 386, 391],
  ],
  'front-steer-right.png': [
    [90, 200, 126, 301],
    [140, 365, 181, 401],
  ],
};

for (const [path, expectedWidth, expectedHeight] of runtimePngs) {
  const png = await readFile(path);
  if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`${path} does not have a valid PNG signature.`);
  }

  let offset = 8;
  let width;
  let height;
  const compressed = [];
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString('ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > png.length) throw new Error(`${path} contains a truncated ${type} chunk.`);
    const data = png.subarray(dataStart, dataEnd);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) {
        throw new Error(`${path} must be non-interlaced 8-bit RGBA PNG data.`);
      }
    } else if (type === 'IDAT') {
      compressed.push(data);
    }
    offset = dataEnd + 4;
    if (type === 'IEND') break;
  }

  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(`${path} must be ${String(expectedWidth)}x${String(expectedHeight)}.`);
  }
  const pixels = inflateSync(Buffer.concat(compressed));
  const rowLength = width * 4 + 1;
  if (pixels.length !== rowLength * height) throw new Error(`${path} has incomplete pixel data.`);
  for (let row = 0; row < height; row += 1) {
    const filter = pixels[row * rowLength];
    if (filter > 4)
      throw new Error(`${path} has invalid PNG filter ${String(filter)} on row ${String(row)}.`);
  }

  if (newTransparentFronts.has(path)) {
    const decoded = decodeRgbaRows(pixels, width, height);
    const corners = [0, width - 1, (height - 1) * width, width * height - 1];
    if (corners.some((pixel) => decoded[pixel * 4 + 3] !== 0)) {
      throw new Error(`${path} must have transparent corners after checkerboard removal.`);
    }
  }

  if (path.includes('/aa-12/selection/')) {
    const decoded = decodeRgbaRows(pixels, width, height);
    const largestCheckerRemnant = largestVeryPaleNeutralComponent(decoded, width, height);
    if (largestCheckerRemnant >= 8) {
      throw new Error(
        `${path} retains a ${String(largestCheckerRemnant)}-pixel pale checker component.`,
      );
    }
  }

  if (
    path === 'public/assets/characters/aa-10/results/victory.png' ||
    path === 'public/assets/characters/aa-11/results/victory.png' ||
    path === 'public/assets/characters/aa-12/results/victory.png'
  ) {
    const decoded = decodeRgbaRows(pixels, width, height);
    for (let pixel = 0; pixel < width * height; pixel += 1) {
      const offset = pixel * 4;
      const red = decoded[offset];
      const green = decoded[offset + 1];
      const blue = decoded[offset + 2];
      const alpha = decoded[offset + 3];
      if (alpha === 0 && (red !== 0 || green !== 0 || blue !== 0)) {
        throw new Error(`${path} has nonzero RGB values in a fully transparent pixel.`);
      }
      if (alpha > 0 && red === 0 && green === 255 && blue === 0) {
        throw new Error(`${path} retains an opaque chroma-green matte pixel.`);
      }
    }
  }

  if (kriosHornApertureFronts.has(path)) {
    const decoded = decodeRgbaRows(pixels, width, height);
    const hornApertures = countEnclosedTransparentRegions(decoded, width, height, 400);
    if (hornApertures < 2) {
      throw new Error(
        `${path} must preserve two transparent enclosed horn apertures; found ${String(hornApertures)}.`,
      );
    }
  }

  if (path.includes('/aa-11/driver/')) {
    const filename = path.split('/').at(-1);
    const aperture = accuApertureRects[filename];
    if (aperture !== undefined) {
      const decoded = decodeRgbaRows(pixels, width, height);
      let residualBackground = 0;
      for (let y = aperture[1]; y < aperture[3]; y += 1) {
        for (let x = aperture[0]; x < aperture[2]; x += 1) {
          const offset = (y * width + x) * 4;
          const red = decoded[offset];
          const green = decoded[offset + 1];
          const blue = decoded[offset + 2];
          const alpha = decoded[offset + 3];
          if (
            alpha > 0 &&
            Math.min(red, green, blue) >= 185 &&
            Math.max(red, green, blue) - Math.min(red, green, blue) <= 35
          ) {
            residualBackground += 1;
          }
        }
      }
      if (residualBackground > 0) {
        throw new Error(
          `${path} retains ${String(residualBackground)} opaque neutral checker pixels in its steering-wheel aperture.`,
        );
      }
    }
  }

  if (path.includes('/aa-07/driver/front-steer-')) {
    const filename = path.split('/').at(-1);
    const rects = mcfleurdelSteeringMatteRects[filename];
    if (rects !== undefined) {
      const decoded = decodeRgbaRows(pixels, width, height);
      const largestMatteComponent = largestPaleNeutralComponentInRects(
        decoded,
        width,
        height,
        rects,
      );
      if (largestMatteComponent >= 30) {
        throw new Error(
          `${path} retains a ${String(largestMatteComponent)}-pixel pale matte component in an approved transparent hair or arm gap.`,
        );
      }
    }
  }

  if (path.includes('/aa-03/') && !path.includes('/selection/')) {
    const decoded = decodeRgbaRows(pixels, width, height);
    const filename = path.split('/').at(-1);
    const protectedRect = lulaProtectedRects[filename];
    let residualBackground = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const red = decoded[offset];
        const green = decoded[offset + 1];
        const blue = decoded[offset + 2];
        const alpha = decoded[offset + 3];
        const protectedPixel =
          protectedRect !== undefined &&
          x >= protectedRect[0] &&
          y >= protectedRect[1] &&
          x < protectedRect[2] &&
          y < protectedRect[3];
        if (
          !protectedPixel &&
          alpha > 0 &&
          Math.min(red, green, blue) >= 220 &&
          Math.max(red, green, blue) - Math.min(red, green, blue) <= 25
        ) {
          residualBackground += 1;
        }
      }
    }
    if (residualBackground > 0) {
      throw new Error(
        `${path} retains ${String(residualBackground)} opaque neutral-white background pixels.`,
      );
    }
  }
}

console.log(`Decoded and verified ${String(runtimePngs.length)} runtime character PNGs.`);
