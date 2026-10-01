import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';

// Optional rendered verification; browser tooling stays outside game dependencies.
const playwrightPath = process.env.MOTION_BLUR_PLAYWRIGHT_PATH;
const executablePath = process.env.MOTION_BLUR_CHROMIUM_PATH;
if (!playwrightPath || !executablePath)
  throw new Error('Provide MOTION_BLUR_PLAYWRIGHT_PATH and MOTION_BLUR_CHROMIUM_PATH');
const { chromium } = await import(pathToFileURL(playwrightPath).href);
const server = await createServer({ server: { host: '127.0.0.1', port: 5190, strictPort: true } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('http://127.0.0.1:5190/manacondas-minigame-mayhem/');
  const results = await page.evaluate(async () => {
    const THREE = await import('/manacondas-minigame-mayhem/node_modules/.vite/deps/three.js');
    const { RaceMotionBlur } =
      await import('/manacondas-minigame-mayhem/src/game/rendering/RaceMotionBlur.ts');
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    const scene = new THREE.Scene(),
      camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:
        'varying vec2 vUv; void main(){float stripe=mod(floor(vUv.x*400.),2.);gl_FragColor=vec4(mod(floor(vUv.x*400.),2.),vUv.y,0.3,1.);}',
      toneMapped: false,
    });
    scene.add(new THREE.Mesh(geometry, material));
    const gl = renderer.getContext(),
      results = [];
    for (const [width, height] of [
      [800, 600],
      [375, 667],
    ]) {
      renderer.setSize(width, height);
      for (const quality of ['low', 'medium', 'high']) {
        const blur = new RaceMotionBlur(renderer, quality, true);
        blur.resize(width, height);
        for (let frame = 0; frame < 90; frame++) blur.update(1, 1 / 60, true, 16);
        renderer.render(scene, camera);
        const before = new Uint8Array(width * height * 4),
          after = new Uint8Array(before.length);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, before);
        const beforeCalls = renderer.info.render.calls;
        blur.render();
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, after);
        let protectedChanged = 0,
          edgeChanged = 0,
          maxDelta = 0;
        const bandWidth = Math.floor(width * 0.2),
          bandY = Math.floor(height * 0.2),
          bandTop = Math.floor(height * 0.8);
        for (let y = 0; y < height; y++)
          for (let x = 0; x < width; x++) {
            const offset = (y * width + x) * 4;
            let delta = 0;
            for (let channel = 0; channel < 4; channel++)
              delta = Math.max(delta, Math.abs(before[offset + channel] - after[offset + channel]));
            if (delta) {
              if ((x >= bandWidth && x < width - bandWidth) || y < bandY || y >= bandTop)
                protectedChanged++;
              else edgeChanged++;
              maxDelta = Math.max(maxDelta, delta);
            }
          }
        results.push({
          quality,
          width,
          height,
          protectedChanged,
          edgeChanged,
          maxDelta,
          drawsAdded: renderer.info.render.calls - beforeCalls,
          glError: gl.getError(),
          snapshot: blur.snapshot(),
        });
        blur.dispose();
      }
    }
    material.dispose();
    geometry.dispose();
    renderer.dispose();
    return results;
  });
  assert.deepEqual(errors, []);
  for (const result of results) {
    assert.equal(result.protectedChanged, 0);
    assert.equal(result.glError, 0);
    assert.equal(result.drawsAdded, result.quality === 'low' ? 0 : 1);
    assert.equal(result.snapshot.fallbackReason, null);
    assert.equal(
      result.quality === 'low' ? result.edgeChanged === 0 : result.edgeChanged > 0,
      true,
    );
  }
  const report = {
    checkedAt: new Date().toISOString(),
    browser: await browser.version(),
    renderer: 'Chromium software WebGL / SwiftShader; synthetic current-frame pattern',
    limitations:
      'Shader/pixel check only; no gameplay visual acceptance or device/full-race performance certification.',
    sourceSha256: createHash('sha256')
      .update(readFileSync('src/game/rendering/RaceMotionBlur.ts'))
      .digest('hex'),
    results,
    errors,
  };
  writeFileSync(
    'docs/evidence/2026-10-01-motion-blur/browser-pixels.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report));
} finally {
  await browser?.close();
  await server.close();
}
