import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(`${process.env.NEON_GRID_TASK_C2_PLAYWRIGHT}/package.json`);
const { chromium } = require('playwright');
const outputDirectory = process.argv[2] ?? 'docs/evidence/2026-10-18-neon-grid-task-c2/captures';
const sourceCommit = process.env.NEON_GRID_TASK_C2_SOURCE_SHA;
const baseUrl = (
  process.env.NEON_GRID_TASK_C2_BASE_URL ?? 'http://127.0.0.1:5173/manacondas-minigame-mayhem'
).replace(/\/$/, '');
if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? ''))
  throw new Error('Set NEON_GRID_TASK_C2_SOURCE_SHA to the exact 40-character source commit.');
if (!process.env.NEON_GRID_TASK_C2_PLAYWRIGHT)
  throw new Error('Set NEON_GRID_TASK_C2_PLAYWRIGHT to the browser-tools node_modules directory.');

mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_TASK_C2_CHROME ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const viewports = [
  {
    id: 'desktop-1920x1080',
    viewport: { width: 1280, height: 720 },
    scale: 1.5,
    views: ['chase', 'rear'],
  },
  {
    id: 'mobile-390x844',
    viewport: { width: 390, height: 844 },
    scale: 1,
    views: ['chase'],
  },
];
const variants = [
  { id: 'A-c1-concrete-001', query: 'service-tunnel-concrete-001' },
  { id: 'B-c2-concrete-coverage-001', query: 'concrete-coverage-c2-001' },
];
const scenarios = [
  { id: 'skyline', sector: 'Skyline', progress: 0.16 },
  { id: 'undercity', sector: 'Undercity', progress: 0.355 },
  { id: 'service-tunnel-entry', sector: 'Service Tunnel entry', tunnelFraction: 0.15 },
  { id: 'service-tunnel-interior', sector: 'Service Tunnel interior', tunnelFraction: 0.5 },
  { id: 'service-tunnel-exit', sector: 'Service Tunnel exit', tunnelFraction: 0.85 },
  { id: 'falls-run', sector: 'Falls Run', progress: 0.57 },
];
const errors = [];
const captures = [];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

for (const viewport of viewports) {
  for (const variant of variants) {
    const context = await browser.newContext({
      viewport: viewport.viewport,
      deviceScaleFactor: viewport.scale,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(90_000);
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
      'sector=course',
      'tunnelFraction=0.5',
      'quality=medium',
      'neonGridVisual=neon-grid-task-a-001',
      'testRacePerf=1',
      `neonGridMaterial=${variant.query}`,
    ].join('&');
    await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?${flags}`);
    await page.waitForFunction(() => window.ready, undefined, { timeout: 90_000 });
    await page.waitForFunction(
      () =>
        window.game?.opponents?.length === 7 &&
        window.game.opponents.every((opponent) => opponent.mesh.children[0]?.type === 'Group'),
      undefined,
      { timeout: 90_000 },
    );
    await page.waitForFunction(
      () =>
        ['service-tunnel-left-wall', 'service-tunnel-right-wall'].every((name) => {
          const material = window.game.trackScene.getObjectByName(name)?.material;
          return (
            material?.map?.image?.width === 1024 &&
            material?.normalMap?.image?.width === 1024 &&
            material?.roughnessMap?.image?.width === 1024
          );
        }) &&
        (window.game.trackScene.userData.serviceTunnelMaterialVariant !==
          'concrete-coverage-c2-001' ||
          window.game.trackScene.getObjectByName('service-tunnel-roof')?.material?.map?.image
            ?.width === 1024),
      undefined,
      { timeout: 90_000 },
    );

    const metadata = await page.evaluate(() => {
      const game = window.game;
      const gl = game.renderer.getContext();
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      const rawRenderer = gl.getParameter(
        debug === null ? gl.RENDERER : debug.UNMASKED_RENDERER_WEBGL,
      );
      const drawingBuffer = game.renderer.getDrawingBufferSize(new window.THREE.Vector2());
      const materials = new Set();
      const geometries = new Set();
      const textures = new Set();
      let meshCount = 0;
      game.trackScene.traverse((object) => {
        if (!object.isMesh) return;
        meshCount += 1;
        geometries.add(object.geometry);
        const values = Array.isArray(object.material) ? object.material : [object.material];
        values.forEach((material) => {
          materials.add(material);
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'].forEach(
            (property) => {
              if (material[property]) textures.add(material[property]);
            },
          );
        });
      });
      const roof = game.trackScene.getObjectByName('service-tunnel-roof');
      const walls = ['service-tunnel-left-wall', 'service-tunnel-right-wall'].map((name) =>
        game.trackScene.getObjectByName(name),
      );
      return {
        userAgent: navigator.userAgent,
        gpuRenderer: typeof rawRenderer === 'string' ? rawRenderer : null,
        softwareDetected: /swiftshader|llvmpipe|softpipe|lavapipe|software raster/i.test(
          typeof rawRenderer === 'string' ? rawRenderer : '',
        ),
        devicePixelRatio: window.devicePixelRatio,
        rendererPixelRatio: game.renderer.getPixelRatio(),
        actualDrawingBuffer: { width: drawingBuffer.x, height: drawingBuffer.y },
        visualVariant: game.trackScene.userData.visualVariant,
        materialVariant: game.trackScene.userData.serviceTunnelMaterialVariant,
        racers: game.opponents.length + 1,
        roster: [
          { id: 'player', characterId: game.options.character.id },
          ...game.opponents.map(({ id, characterId }) => ({ id, characterId })),
        ],
        bloom: game.bloom.snapshot(),
        motionBlur: game.motionBlur.snapshot(),
        resources: {
          trackSceneMeshes: meshCount,
          uniqueGeometries: geometries.size,
          uniqueMaterials: materials.size,
          uniqueReferencedTextures: textures.size,
          serviceTunnelChildNames: game.trackScene
            .getObjectByName('service-tunnel')
            .children.map((child) => child.name),
          roof: {
            positions: roof.geometry.getAttribute('position').count,
            indices: roof.geometry.index?.count ?? 0,
            uvs: roof.geometry.getAttribute('uv')?.count ?? 0,
            materialName: roof.material.name,
          },
          sidewalls: walls.map((wall) => ({
            positions: wall.geometry.getAttribute('position').count,
            indices: wall.geometry.index?.count ?? 0,
            uvs: wall.geometry.getAttribute('uv')?.count ?? 0,
            materialName: wall.material.name,
          })),
          textureMapImageSizes: [...textures].map((texture) => ({
            name: texture.name,
            width: texture.image?.width ?? null,
            height: texture.image?.height ?? null,
          })),
        },
      };
    });

    for (const scenario of scenarios) {
      for (const view of viewport.views) {
        const detailedTiming =
          viewport.id === 'desktop-1920x1080' &&
          scenario.id === 'service-tunnel-interior' &&
          view === 'chase';
        const warmupCalls = 3;
        const scoredCalls = detailedTiming ? 30 : 6;
        const result = await page.evaluate(
          ({ nextScenario, viewName, warmupCount, scoredCount }) => {
            const game = window.game;
            const progress =
              nextScenario.progress ??
              (game.track.serviceTunnel.entry.progress[0] + game.track.serviceTunnel.exitProgress) /
                2;
            if (nextScenario.tunnelFraction !== undefined) {
              window.stageServiceTunnelAtFraction(nextScenario.tunnelFraction);
            } else {
              window.stageC2CourseAtProgress(nextScenario.progress);
            }
            const render = () => window.renderFrame(true, viewName);
            for (let index = 0; index < warmupCount; index++) render();
            const durations = [];
            for (let index = 0; index < scoredCount; index++) {
              const start = performance.now();
              render();
              durations.push(performance.now() - start);
            }
            const wholeFrame = render();
            const cameraPosition = game.camera.position.toArray();
            const cameraQuaternion = [
              game.camera.quaternion.x,
              game.camera.quaternion.y,
              game.camera.quaternion.z,
              game.camera.quaternion.w,
            ];
            const sectorIndex =
              nextScenario.tunnelFraction !== undefined
                ? 1
                : nextScenario.progress < 0.247
                  ? 0
                  : nextScenario.progress < 0.46155
                    ? 1
                    : 2;
            const passFrame = game.passInstrumentation.finishFrame(
              { drawCalls: wholeFrame.calls, triangles: wholeFrame.triangles },
              {
                cameraFixture: viewName === 'rear' ? 'rearView' : 'chase',
                cameraPosition,
                cameraQuaternion,
                sectorProgress: {
                  lap: 0,
                  trackProgress: progress,
                  sectorIndex,
                  sectorName: nextScenario.sector,
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
            const sorted = durations.sort((a, b) => a - b);
            return {
              wholeFrame,
              cameraPosition,
              cameraQuaternion,
              passFrame,
              cpuRenderCallMs: {
                measurement:
                  'CPU wall time around the existing renderFrame call; not GPU time or full application frame pacing.',
                warmupCalls: warmupCount,
                scoredCalls: sorted.length,
                median:
                  sorted.length % 2 === 0
                    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                    : sorted[Math.floor(sorted.length / 2)],
                p95: sorted[Math.ceil(sorted.length * 0.95) - 1],
                maximum: sorted.at(-1),
              },
            };
          },
          {
            nextScenario: scenario,
            viewName: view,
            warmupCount: warmupCalls,
            scoredCount: scoredCalls,
          },
        );
        const filename = `${variant.id}-${scenario.id}-${view}-${viewport.id}.jpg`;
        const screenshotPath = join(outputDirectory, filename);
        const screenshot = await page.screenshot({
          path: screenshotPath,
          type: 'jpeg',
          quality: 92,
          timeout: 120_000,
        });
        captures.push({
          variant: variant.id,
          viewport: viewport.id,
          metadata,
          scenario: scenario.id,
          sector: scenario.sector,
          view,
          ...result,
          screenshot: {
            path: screenshotPath,
            sha256: sha256(screenshot),
            bytes: screenshot.length,
          },
          glStatus: await page.evaluate(() => {
            const gl = window.game.renderer.getContext();
            return { error: gl.getError(), isContextLost: gl.isContextLost() };
          }),
        });
      }
    }
    await page.evaluate(() => window.game.dispose());
    await context.close();
  }
}

const paired = scenarios.flatMap((scenario) =>
  viewports.flatMap((viewport) =>
    viewport.views.map((view) => {
      const a = captures.find(
        (capture) =>
          capture.variant === variants[0].id &&
          capture.viewport === viewport.id &&
          capture.scenario === scenario.id &&
          capture.view === view,
      );
      const b = captures.find(
        (capture) =>
          capture.variant === variants[1].id &&
          capture.viewport === viewport.id &&
          capture.scenario === scenario.id &&
          capture.view === view,
      );
      return {
        scenario: scenario.id,
        viewport: viewport.id,
        view,
        sameCamera:
          JSON.stringify(a?.cameraPosition) === JSON.stringify(b?.cameraPosition) &&
          JSON.stringify(a?.cameraQuaternion) === JSON.stringify(b?.cameraQuaternion),
        sameWholeFrameDrawCalls: a?.wholeFrame.calls === b?.wholeFrame.calls,
        sameWholeFrameTriangles: a?.wholeFrame.triangles === b?.wholeFrame.triangles,
        sameGeometryCount:
          a?.wholeFrame.geometries === b?.wholeFrame.geometries &&
          a?.metadata.resources.uniqueGeometries === b?.metadata.resources.uniqueGeometries &&
          a?.metadata.resources.trackSceneMeshes === b?.metadata.resources.trackSceneMeshes,
        sameTextureCount:
          a?.wholeFrame.textures === b?.wholeFrame.textures &&
          a?.metadata?.resources.uniqueReferencedTextures ===
            b?.metadata?.resources.uniqueReferencedTextures,
        aScreenshotSha256: a?.screenshot.sha256 ?? null,
        bScreenshotSha256: b?.screenshot.sha256 ?? null,
        imagesDiffer: a?.screenshot.sha256 !== b?.screenshot.sha256,
      };
    }),
  ),
);

const report = {
  schemaVersion: 1,
  sourceCommit,
  capturedAt: new Date().toISOString(),
  fixture: {
    runtime:
      'Actual KartTimeTrial and NeonGridScene in tools/diagnostics/neon-grid-course.html, with the existing chase and rear cameras.',
    staging:
      'C2-only fixture controls settle staged positions with one visual update; the existing fixture controls retain their 12-update default.',
    trackId: 'neon-grid',
    visualVariant: 'neon-grid-task-a-001',
    materialVariants: variants,
    graphicsQuality: 'medium',
    racerCount: 8,
    deterministicRosterSeed: 1417,
    scenarios,
    viewports,
    views: ['chase', 'rear'],
    renderTimingSamples: {
      warmupCallsPerView: 3,
      scoredCallsPerView: 6,
      detailedView:
        'desktop-1920x1080 Service Tunnel interior chase uses 30 scored calls per variant.',
    },
    environment:
      'Headless Chromium with SwiftShader software WebGL. CPU render-call timings are not GPU measurements or G-05 hardware certification.',
    browserVersion: browser.version(),
  },
  errors,
  captures,
  matchedPairs: paired,
  limitations: [
    'The preview fixture uses the real game scene and ChaseCamera/rear camera but stages positions rather than conducting a full race.',
    'GPU time, physical-device performance, real hardware texture residency, and G-05 are not measured.',
    'Both A and B load the same approved three 1K Concrete Wall 007 maps. B additionally assigns the maps to the existing Service Tunnel roof and two road-facing safety walls; C1 already assigns them to the tunnel sidewalls. C2 adds UV attributes but does not change positions, indices, collision geometry, or batch counts.',
    'No gameplay, collision, road geometry, sponsor, fog, bloom, lighting, or render-pass configuration is changed.',
  ],
};
writeFileSync(join(outputDirectory, 'material-ab-capture.json'), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      sourceCommit,
      captures: captures.length,
      errors,
      allPairsMatchCamera: paired.every((pair) => pair.sameCamera),
      allPairsMatchWholeFrameCounters: paired.every(
        (pair) => pair.sameWholeFrameDrawCalls && pair.sameWholeFrameTriangles,
      ),
      allPairsMatchGeometryAndTextureCounts: paired.every(
        (pair) => pair.sameGeometryCount && pair.sameTextureCount,
      ),
      allPairsHaveImages: paired.every((pair) => pair.aScreenshotSha256 && pair.bScreenshotSha256),
    },
    null,
    2,
  ),
);
await browser.close();
if (errors.length > 0) throw new Error(`Browser errors: ${errors.join('; ')}`);
if (
  paired.some(
    (pair) =>
      !pair.sameCamera ||
      !pair.sameWholeFrameDrawCalls ||
      !pair.sameWholeFrameTriangles ||
      !pair.sameGeometryCount ||
      !pair.sameTextureCount,
  )
)
  throw new Error('A/B camera, counters, geometry, or texture-resource invariants did not hold.');
