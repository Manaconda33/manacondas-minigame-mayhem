import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(`${process.env.NEON_GRID_TASK_B_PLAYWRIGHT}/package.json`);
const { chromium } = require('playwright');
const outputDirectory = process.argv[2] ?? 'docs/evidence/2026-10-15-neon-grid-task-b-i0/captures';
const sourceCommit = process.env.NEON_GRID_TASK_B_SOURCE_SHA;
const baseUrl = (
  process.env.NEON_GRID_TASK_B_BASE_URL ?? 'http://127.0.0.1:5173/manacondas-minigame-mayhem'
).replace(/\/$/, '');
if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? ''))
  throw new Error(
    'Set NEON_GRID_TASK_B_SOURCE_SHA to the exact 40-character implementation commit.',
  );
mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_TASK_B_CHROME ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const viewportFixtures = [
  { id: 'desktop-1920x1080', viewport: { width: 1280, height: 720 }, scale: 1.5 },
  { id: 'portrait-390x844', viewport: { width: 390, height: 844 }, scale: 1 },
];
const positions = [
  { id: 'skyline', progress: 0.16, sectorIndex: 0, sectorName: 'Skyline Straight' },
  { id: 'undercity', progress: 0.355, sectorIndex: 1, sectorName: 'The Undercity' },
  { id: 'falls-run', progress: 0.72, sectorIndex: 2, sectorName: 'Falls Run' },
];
const errors = [];
const captures = [];
const overheadSamples = [];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

for (const viewportFixture of viewportFixtures) {
  for (const instrumented of [false, true]) {
    const context = await browser.newContext({
      viewport: viewportFixture.viewport,
      deviceScaleFactor: viewportFixture.scale,
    });
    const page = await context.newPage();
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.addInitScript(() => {
      const originalRandom = Math.random;
      let state = 1417;
      Math.random = () => {
        if (!(new Error().stack ?? '').includes('raceRoster')) return originalRandom();
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
      };
    });
    const flags = [
      'quality=medium',
      'neonGridVisual=neon-grid-task-a-001',
      ...(instrumented ? ['testRacePerf=1'] : []),
    ].join('&');
    await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?${flags}`);
    await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
    await page.waitForFunction(
      () =>
        window.game?.opponents?.length === 7 &&
        window.game.opponents.every((opponent) => opponent.mesh.children[0]?.type === 'Group'),
      undefined,
      { timeout: 90000 },
    );
    await page.waitForFunction(
      () =>
        [
          'skyline-ad-manaconda-racing',
          'skyline-ad-taco-bell-live-mas',
          'undercity-ad-nightshift-noodles',
          'undercity-ad-voltline-industrial',
        ].every(
          (name) => window.game.trackScene.getObjectByName(name)?.material.map?.image?.width > 0,
        ),
      undefined,
      { timeout: 90000 },
    );
    const pageMetadata = await page.evaluate(() => {
      const game = window.game;
      const gl = game.renderer.getContext();
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      const rawRenderer = gl.getParameter(
        debug === null ? gl.RENDERER : debug.UNMASKED_RENDERER_WEBGL,
      );
      const drawingBuffer = game.renderer.getDrawingBufferSize(new window.THREE.Vector2());
      const softwareDetected = /swiftshader|llvmpipe|softpipe|lavapipe|software raster/i.test(
        typeof rawRenderer === 'string' ? rawRenderer : '',
      );
      return {
        userAgent: navigator.userAgent,
        gpuRenderer: typeof rawRenderer === 'string' ? rawRenderer : null,
        devicePixelRatio: window.devicePixelRatio,
        rendererPixelRatio: game.renderer.getPixelRatio(),
        actualDrawingBuffer: { width: drawingBuffer.x, height: drawingBuffer.y },
        deviceEnvironment: {
          classification: softwareDetected ? 'softwareDetected' : 'unknown',
          explanation: softwareDetected
            ? 'The reported WebGL renderer string identifies a software renderer.'
            : 'WebGL renderer identity cannot prove physical-device identity; no hardware certification is inferred.',
        },
        configuration: {
          shadows: {
            enabled: game.renderer.shadowMap.enabled,
            mapType: game.renderer.shadowMap.type,
            dynamicCasterCount: null,
          },
          bloom: game.bloom.snapshot(),
          motionBlur: game.motionBlur.snapshot(),
        },
      };
    });
    await page.evaluate(async (warmupFrames) => {
      const game = window.game;
      await window.stageCourseAtProgress(0.16);
      for (let index = 0; index < warmupFrames; index++) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const raceTime = index / 60;
        game.trackScene.billboard.update(raceTime);
        game.trackScene.dive.update(raceTime);
        game.trackScene.fallsRun.update(raceTime);
        game.trackScene.fallsRunExtension.update(raceTime);
        game.trackScene.skyline.update(raceTime);
        game.trackScene.undercity.update(raceTime);
        game.updateVisuals(1 / 60);
        game.bloom.render(game.scene, game.camera);
        game.motionBlur.render(false);
      }
    }, 120);

    for (const position of positions) {
      for (const view of ['chase', 'rear']) {
        await page.evaluate(
          (progress) => window.stageCourseAtProgress(progress),
          position.progress,
        );
        if (
          viewportFixture.id === 'desktop-1920x1080' &&
          position.id === 'skyline' &&
          view === 'chase'
        ) {
          const overhead = await page.evaluate((instrumented) => {
            const game = window.game;
            const warmup = 10;
            const scored = 60;
            const samples = [];
            for (let index = 0; index < warmup + scored; index++) {
              game.trackScene.billboard.update(index / 60);
              game.trackScene.dive.update(index / 60);
              game.trackScene.fallsRun.update(index / 60);
              game.trackScene.fallsRunExtension.update(index / 60);
              game.trackScene.skyline.update(index / 60);
              game.trackScene.undercity.update(index / 60);
              game.updateVisuals(1 / 60);
              const start = performance.now();
              game.bloom.render(game.scene, game.camera);
              game.motionBlur.render(false);
              const elapsed = performance.now() - start;
              if (index >= warmup && Number.isFinite(elapsed)) samples.push(elapsed);
            }
            const sorted = [...samples].sort((a, b) => a - b);
            const percentile = (rank) => sorted[Math.ceil(sorted.length * rank) - 1] ?? null;
            const middle = Math.floor(sorted.length / 2);
            return {
              instrumented,
              unit: 'CPU wall time around existing Bloom and disabled motion-blur render calls; not GPU time or whole-frame time',
              warmupFrames: warmup,
              scoredFrames: sorted.length,
              medianMs: (sorted[middle - 1] + sorted[middle]) / 2,
              p95Ms: percentile(0.95),
              maxMs: sorted.at(-1) ?? null,
            };
          }, instrumented);
          overheadSamples.push({
            fixture: viewportFixture.id,
            position: position.id,
            view,
            ...overhead,
          });
        }
        const frame = await page.evaluate(
          ({ view, position, instrumented }) => {
            const game = window.game;
            const wholeFrame = window.renderFrame(true, view);
            const cameraPosition = [
              game.camera.position.x,
              game.camera.position.y,
              game.camera.position.z,
            ];
            const cameraQuaternion = [
              game.camera.quaternion.x,
              game.camera.quaternion.y,
              game.camera.quaternion.z,
              game.camera.quaternion.w,
            ];
            const materialState = [];
            game.scene.traverse((object) => {
              const materials =
                object.material === undefined
                  ? []
                  : Array.isArray(object.material)
                    ? object.material
                    : [object.material];
              materialState.push({
                name: object.name,
                type: object.type,
                visible: object.visible,
                position: object.position.toArray(),
                materials: materials.map((material) => ({
                  type: material.type,
                  color: material.color?.getHexString?.() ?? null,
                  emissive: material.emissive?.getHexString?.() ?? null,
                  transparent: material.transparent,
                  opacity: material.opacity,
                  visible: material.visible,
                })),
              });
            });
            let passFrame = null;
            if (instrumented) {
              passFrame = game.passInstrumentation.finishFrame(
                { drawCalls: wholeFrame.calls, triangles: wholeFrame.triangles },
                {
                  cameraFixture: view === 'rear' ? 'rearView' : 'chase',
                  cameraPosition,
                  cameraQuaternion,
                  sectorProgress: {
                    lap: 0,
                    trackProgress: position.progress,
                    sectorIndex: position.sectorIndex,
                    sectorName: position.sectorName,
                  },
                  itemEffectState: {
                    activeProjectiles: game.projectiles.activeCount(),
                    activeHazards: game.hazards.activeCount(),
                    playerHeldItem: game.itemSystem.heldItem('player') ?? null,
                    playerFrostStacks: game.racerEffects.frostState('player')?.stacks ?? 0,
                    playerSpinoutId: game.racerEffects.spinoutState('player')?.id ?? null,
                    activeBoostLabel: game.racerEffects.driveModifiers('player').activeBoostLabel,
                    nitroOverdriveActive: game.nitroOverdrive.snapshot('player').active,
                    hyperDriveRocketActive: game.hyperDriveRocket.snapshot('player').active,
                  },
                },
              );
            }
            return {
              wholeFrame,
              cameraPosition,
              cameraQuaternion,
              materialStateSignature: JSON.stringify(materialState),
              racerRoster: [
                { id: 'player', characterId: game.options.character.id },
                ...game.opponents.map(({ id, characterId }) => ({ id, characterId })),
              ],
              passFrame,
            };
          },
          { view, position, instrumented },
        );
        const screenshotPath = `${outputDirectory}/${position.id}-${view}-${viewportFixture.id}-${instrumented ? 'instrumented' : 'uninstrumented'}.png`;
        const screenshot = await page.screenshot({ path: screenshotPath });
        const materialStateHash = sha256(Buffer.from(frame.materialStateSignature));
        delete frame.materialStateSignature;
        captures.push({
          fixture: viewportFixture.id,
          instrumented,
          metadata: pageMetadata,
          position: position.id,
          view,
          progress: position.progress,
          screenshot: {
            path: screenshotPath,
            sha256: sha256(screenshot),
            bytes: screenshot.length,
          },
          materialStateHash,
          ...frame,
        });
      }
    }
    await page.evaluate(() => window.game.dispose());
    await context.close();
  }
}

const report = {
  schemaVersion: 1,
  sourceCommit,
  capturedAt: new Date().toISOString(),
  fixture: {
    runtime: 'Actual KartTimeTrial and approved Task A visual query in neon-grid-course.html.',
    trackId: 'neon-grid',
    visualVariant: 'neon-grid-task-a-001',
    graphicsQuality: 'medium',
    racerCount: 8,
    deterministicRosterSeed: 1417,
    positions,
    views: ['chase', 'rear'],
    viewportFixtures,
    sampling:
      '120 fixed scene-render warmup frames per browser context, followed by one measured render per staged position/view. The standard RacePerformanceMeter retains its existing 120 eligible-frame warmup, 36,000-sample bound and one pass sample per ten scored frames; this scene-capture fixture does not claim a full-race frame-time distribution.',
    motionBlur: 'Disabled in this established scene-capture fixture.',
    environment:
      'Headless Chromium with unsafe SwiftShader software WebGL; not physical-device FPS evidence.',
    browserVersion: browser.version(),
  },
  errors,
  overheadSamples,
  captures,
  limitations: [
    'GPU frame time is unavailable; frame times remain CPU-observed in the existing race meter.',
    'Software WebGL verifies attribution and visual invariance only, not G-05 or physical-device performance.',
    'This staged fixture samples one frame per sector/view after 120 scene-render warmup frames and is not a full-race performance distribution.',
  ],
};
writeFileSync(`${outputDirectory}/render-pass-capture.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (errors.length > 0) throw new Error(`Browser errors: ${errors.join('; ')}`);
