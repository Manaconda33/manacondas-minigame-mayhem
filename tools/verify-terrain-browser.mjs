import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';

// Optional browser tooling is supplied externally, never installed in the game.
const { chromium } = await import(pathToFileURL(process.env.TERRAIN_PLAYWRIGHT_PATH).href);
const server = await createServer({ server: { host: '127.0.0.1', port: 5191, strictPort: true } });
await server.listen();
let browser;
const evidence = 'docs/evidence/2026-10-01-terrain-materials';
try {
  browser = await chromium.launch({
    executablePath: process.env.TERRAIN_CHROMIUM_PATH,
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
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('http://127.0.0.1:5191/manacondas-minigame-mayhem/');
  await page.evaluate(async () => {
    const THREE = await import('/manacondas-minigame-mayhem/node_modules/.vite/deps/three.js');
    const { CircuitAlpha } =
      await import('/manacondas-minigame-mayhem/src/game/track/CircuitAlpha.ts');
    const { createTrackScene } =
      await import('/manacondas-minigame-mayhem/src/game/track/createTrackScene.ts');
    const { disposeTrackScene } =
      await import('/manacondas-minigame-mayhem/src/game/track/TrackSceneResources.ts');
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x75647f, 115, 520);
    scene.add(new THREE.HemisphereLight(0xcbb7ff, 0x263822, 2.1));
    const sun = new THREE.DirectionalLight(0xffe8c5, 2.4);
    sun.position.set(-120, 180, -80);
    scene.add(sun);
    const track = new CircuitAlpha();
    const root = createTrackScene(track);
    scene.add(root);
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(960, 640);
    const camera = new THREE.PerspectiveCamera(62, 1.5, 0.1, 1100);
    document.body.replaceChildren(renderer.domElement);
    document.body.style.cssText = 'margin:0;background:#000';
    const names = ['track-ground', 'split-bend-dirt-line', 'track-shoulder'];
    const materials = names.map((name) => root.getObjectByName(name).material);
    const saved = materials.map((material) => ({
      material,
      color: material.color.clone(),
      map: material.map,
      normalMap: material.normalMap,
      aoMap: material.aoMap,
      roughnessMap: material.roughnessMap,
      roughness: material.roughness,
      metalness: material.metalness,
    }));
    window.terrainReview = {
      THREE,
      root,
      track,
      renderer,
      camera,
      scene,
      materials,
      render(progress, baseline = false) {
        const point = track.curve.getPointAt(progress),
          forward = track.curve.getTangentAt(progress).normalize();
        camera.position
          .copy(point)
          .addScaledVector(forward, -7)
          .add(new THREE.Vector3(0, 4, 0));
        camera.lookAt(
          point
            .clone()
            .addScaledVector(forward, 7)
            .add(new THREE.Vector3(0, 0.4, 0)),
        );
        const originalColors = [0x284b35, 0x865536, 0x6e587f];
        saved.forEach((item, index) => {
          for (const role of ['map', 'normalMap', 'aoMap', 'roughnessMap'])
            item.material[role] = baseline ? null : item[role];
          item.material.color.copy(item.color);
          item.material.roughness = baseline ? [1, 1, 0.92][index] : item.roughness;
          item.material.metalness = baseline ? [0, 0, 0.01][index] : item.metalness;
          if (baseline) item.material.color.setHex(originalColors[index]);
          item.material.needsUpdate = true;
        });
        renderer.render(scene, camera);
      },
      dispose() {
        disposeTrackScene(root);
        renderer.dispose();
      },
    };
  });
  await page.waitForFunction(
    () => {
      const { root } = window.terrainReview;
      return ['track-ground', 'split-bend-dirt-line', 'track-shoulder', 'track-road'].every(
        (name) => {
          const m = root.getObjectByName(name).material;
          return ['map', 'normalMap', 'roughnessMap'].every(
            (role) => m[role]?.image?.complete && m[role].image.naturalWidth === 1024,
          );
        },
      );
    },
    { timeout: 30000 },
  );
  const checks = await page.evaluate(() => {
    const r = window.terrainReview;
    r.render(0.27);
    const gl = r.renderer.getContext();
    return {
      maps: r.materials.map((m) => ({
        name: m.name,
        dimensions: [m.map.image.naturalWidth, m.map.image.naturalHeight],
        packedShared: m.aoMap === m.roughnessMap,
        aoChannel: m.aoMap.channel,
      })),
      glError: gl.getError(),
      renderer: gl.getParameter(gl.RENDERER),
    };
  });
  for (const map of checks.maps) {
    assert.deepEqual(map.dimensions, [1024, 1024]);
    assert.equal(map.packedShared, true);
    assert.equal(map.aoChannel, 0);
  }
  assert.equal(checks.glError, 0);
  for (const [name, progress] of [
    ['dirt-bend', 0.27],
    ['start-straight', 0.025],
  ]) {
    for (const baseline of [true, false]) {
      await page.evaluate(
        ({ progress, baseline }) => window.terrainReview.render(progress, baseline),
        { progress, baseline },
      );
      await page
        .locator('canvas')
        .screenshot({ path: `${evidence}/${name}-${baseline ? 'before' : 'after'}.png` });
    }
  }
  await page.evaluate(() => window.terrainReview.dispose());
  assert.deepEqual(errors, []);

  // Exercise actual failed network requests against the optional-map fallback.
  await page.route('**/terrain-v1/*.jpg?*', (route) => route.abort());
  await page.evaluate(async () => {
    const { createCircuitAlphaTerrainMaterials } =
      await import('/manacondas-minigame-mayhem/src/game/track/TerrainMaterials.ts');
    const materials = Object.values(createCircuitAlphaTerrainMaterials());
    window.failedTerrainReview = materials;
  });
  await page.waitForFunction(() =>
    window.failedTerrainReview.every((m) => !m.map && !m.normalMap && !m.aoMap && !m.roughnessMap),
  );
  const fallbackColors = await page.evaluate(() => {
    const colors = window.failedTerrainReview.map((m) => m.color.getHex());
    window.failedTerrainReview.forEach((m) => m.dispose());
    return colors;
  });
  assert.deepEqual(fallbackColors, [0x284b35, 0x865536, 0x6e587f]);
  const gameplayChecks = [];
  for (const [name, viewport, touch] of [
    ['desktop', { width: 960, height: 640 }, false],
    ['portrait', { width: 375, height: 667 }, true],
  ]) {
    const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch });
    const gameplay = await context.newPage();
    const gameplayErrors = [],
      delivered = new Set();
    gameplay.on('pageerror', (error) => gameplayErrors.push(error.message));
    gameplay.on('console', (message) => {
      if (message.type() === 'error') gameplayErrors.push(message.text());
    });
    gameplay.on('response', (response) => {
      if (
        response.url().includes('/terrain-v1/') &&
        response.url().includes('.jpg') &&
        response.status() === 200
      )
        delivered.add(response.url().split('/').at(-1).split('?')[0]);
    });
    await gameplay.goto('http://127.0.0.1:5191/manacondas-minigame-mayhem/');
    await gameplay.locator('[data-action="enter"]').click();
    await gameplay.locator('[data-action="play"]').click();
    await gameplay.locator('[data-action="confirm-character"]').click();
    await gameplay.locator('#loading').waitFor({ state: 'detached', timeout: 60000 });
    await gameplay.waitForFunction(() => document.querySelector('#game-canvas') !== null);
    assert.equal(delivered.size, 9);
    await gameplay.screenshot({ path: `${evidence}/gameplay-${name}.png` });
    assert.deepEqual(gameplayErrors, []);
    gameplayChecks.push({
      name,
      viewport,
      deliveredJpegs: delivered.size,
      errors: gameplayErrors,
      stage: 'race startup/countdown; software renderer',
    });
    // Single-process serverless Chromium cannot retire individual browser contexts.
    // Navigation releases this app; all contexts close with the browser at the end.
    await gameplay.goto('about:blank');
  }
  writeFileSync(
    `${evidence}/browser.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        browser: await browser.version(),
        checks,
        fallbackColors,
        gameplayChecks,
        sourceSha256: createHash('sha256')
          .update(readFileSync('src/game/track/TerrainMaterials.ts'))
          .digest('hex'),
        errorsBeforeIntentionalNetworkFailure: errors.filter((e) => !e.includes('ERR_FAILED')),
        limitation:
          'Real track/material shader and network-fallback checks under software WebGL; screenshots use existing key/fill colors with shadows disabled for identical comparison. No owner visual acceptance, hardware performance or complete race certification.',
      },
      null,
      2,
    ) + '\n',
  );
  console.log('Terrain shader, map delivery, screenshots and network fallback passed.');
} finally {
  await browser?.close();
  await server.close();
}
