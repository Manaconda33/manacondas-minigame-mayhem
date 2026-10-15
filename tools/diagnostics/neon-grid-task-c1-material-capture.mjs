import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(`${process.env.NEON_GRID_TASK_C1_PLAYWRIGHT}/package.json`);
const { chromium } = require('playwright');
const outputDirectory = process.argv[2] ?? 'docs/evidence/2026-10-15-neon-grid-task-c1/captures';
const sourceCommit = process.env.NEON_GRID_TASK_C1_SOURCE_SHA;
const baseUrl = (
  process.env.NEON_GRID_TASK_C1_BASE_URL ?? 'http://127.0.0.1:5173/manacondas-minigame-mayhem'
).replace(/\/$/, '');
if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? ''))
  throw new Error(
    'Set NEON_GRID_TASK_C1_SOURCE_SHA to the exact 40-character implementation commit.',
  );
if (!process.env.NEON_GRID_TASK_C1_PLAYWRIGHT)
  throw new Error('Set NEON_GRID_TASK_C1_PLAYWRIGHT to the browser-tools node_modules directory.');
mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_TASK_C1_CHROME ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const viewports = [
  { id: 'desktop-1920x1080', viewport: { width: 1280, height: 720 }, scale: 1.5 },
  { id: 'portrait-390x844', viewport: { width: 390, height: 844 }, scale: 1 },
];
const variants = [
  { id: 'A-blockout', query: null },
  { id: 'B-concrete-wall-007', query: 'service-tunnel-concrete-001' },
];
const errors = [];
const captures = [];
const closeups = [];

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
      ...(variant.query ? [`neonGridMaterial=${variant.query}`] : []),
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
    if (variant.query) {
      await page.waitForFunction(
        () =>
          ['service-tunnel-left-wall', 'service-tunnel-right-wall'].every((name) => {
            const material = window.game.trackScene.getObjectByName(name)?.material;
            return (
              material?.map?.image?.width === 1024 &&
              material?.normalMap?.image?.width === 1024 &&
              material?.roughnessMap?.image?.width === 1024
            );
          }),
        undefined,
        { timeout: 90000 },
      );
    }

    const metadata = await page.evaluate(() => {
      const game = window.game;
      const gl = game.renderer.getContext();
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      const rawRenderer = gl.getParameter(
        debug === null ? gl.RENDERER : debug.UNMASKED_RENDERER_WEBGL,
      );
      const drawingBuffer = game.renderer.getDrawingBufferSize(new window.THREE.Vector2());
      return {
        userAgent: navigator.userAgent,
        gpuRenderer: typeof rawRenderer === 'string' ? rawRenderer : null,
        softwareDetected: /swiftshader|llvmpipe|softpipe|lavapipe|software raster/i.test(
          typeof rawRenderer === 'string' ? rawRenderer : '',
        ),
        devicePixelRatio: window.devicePixelRatio,
        rendererPixelRatio: game.renderer.getPixelRatio(),
        actualDrawingBuffer: { width: drawingBuffer.x, height: drawingBuffer.y },
        trackId: game.track.id,
        visualVariant: game.trackScene.userData.visualVariant,
        materialVariant: game.trackScene.userData.serviceTunnelMaterialVariant,
        racerCount: game.opponents.length + 1,
        roster: [
          { id: 'player', characterId: game.options.character.id },
          ...game.opponents.map(({ id, characterId }) => ({ id, characterId })),
        ],
        tunnelFraction: 0.5,
        bloom: game.bloom.snapshot(),
        shadows: {
          enabled: game.renderer.shadowMap.enabled,
          mapType: game.renderer.shadowMap.type,
        },
        motionBlur: game.motionBlur.snapshot(),
        scene: {
          leftWallPositionCount: game.trackScene.getObjectByName('service-tunnel-left-wall')
            .geometry.attributes.position.count,
          rightWallPositionCount: game.trackScene.getObjectByName('service-tunnel-right-wall')
            .geometry.attributes.position.count,
          leftWallIndexCount: game.trackScene.getObjectByName('service-tunnel-left-wall').geometry
            .index.count,
          rightWallIndexCount: game.trackScene.getObjectByName('service-tunnel-right-wall').geometry
            .index.count,
          tunnelChildNames: game.trackScene
            .getObjectByName('service-tunnel')
            .children.map((child) => child.name),
          lights: game.scene.children
            .filter((child) => child.isLight)
            .map((light) => ({
              name: light.name,
              type: light.type,
              intensity: light.intensity,
              color: light.color?.getHexString?.() ?? null,
            })),
          fog: game.scene.fog
            ? {
                type: game.scene.fog.type,
                color: game.scene.fog.color.getHexString(),
                near: game.scene.fog.near ?? null,
                far: game.scene.fog.far ?? null,
              }
            : null,
        },
      };
    });

    const frames = [];
    for (const view of ['chase', 'rear']) {
      const samples = await page.evaluate((viewName) => {
        const game = window.game;
        const runRender = () => window.renderFrame(true, viewName);
        for (let index = 0; index < 8; index++) runRender();
        const durations = [];
        for (let index = 0; index < 30; index++) {
          const start = performance.now();
          runRender();
          durations.push(performance.now() - start);
        }
        const finalWholeFrame = runRender();
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
        const passFrame = game.passInstrumentation.finishFrame(
          { drawCalls: finalWholeFrame.calls, triangles: finalWholeFrame.triangles },
          {
            cameraFixture: viewName === 'rear' ? 'rearView' : 'chase',
            cameraPosition,
            cameraQuaternion,
            sectorProgress: {
              lap: 0,
              trackProgress: 0.355,
              sectorIndex: 1,
              sectorName: 'Service Tunnel',
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
        const medianMs = (sorted[14] + sorted[15]) / 2;
        return {
          wholeFrame: finalWholeFrame,
          cameraPosition,
          cameraQuaternion,
          passFrame,
          cpuRenderCallMs: {
            unit: 'CPU wall time around window.renderFrame (includes existing scene updates, Bloom and disabled blur); not GPU or whole-frame time',
            warmupCalls: 8,
            scoredCalls: sorted.length,
            medianMs,
            p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
            maxMs: sorted.at(-1),
          },
        };
      }, view);

      const filename = `${variant.id}-${view}-${viewport.id}.png`;
      const screenshotPath = `${outputDirectory}/${filename}`;
      const screenshot = await page.screenshot({ path: screenshotPath, timeout: 120_000 });
      frames.push({
        view,
        ...samples,
        screenshot: { path: screenshotPath, sha256: sha256(screenshot), bytes: screenshot.length },
      });
    }

    const glStatus = await page.evaluate(() => {
      const gl = window.game.renderer.getContext();
      const error = gl.getError();
      return { error, isContextLost: gl.isContextLost() };
    });
    captures.push({ viewport: viewport.id, variant: variant.id, metadata, frames, glStatus });

    if (viewport.id === 'desktop-1920x1080' && variant.query) {
      const closeup = await page.evaluate(() => {
        const game = window.game;
        const tunnel = game.track.serviceTunnel;
        const fraction = 0.5;
        const center = tunnel.curve.getPointAt(fraction);
        const tangent = tunnel.curve.getTangentAt(fraction).setY(0).normalize();
        const right = new window.THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
        const wallPoint = tunnel.curve
          .getPointAt(0.52)
          .addScaledVector(right, -tunnel.roadHalfWidth);
        wallPoint.y = tunnel.wallElevationAt(0.52, -1, false) + 1.05;
        const cameraPoint = center.clone().addScaledVector(right, -tunnel.roadHalfWidth + 1.1);
        cameraPoint.y = center.y + 1.05;
        game.camera.position.copy(cameraPoint);
        game.camera.lookAt(wallPoint);
        game.camera.updateMatrixWorld(true);
        game.renderer.info.reset();
        game.bloom.render(game.scene, game.camera);
        game.motionBlur.render(false);
        return { cameraPosition: game.camera.position.toArray(), lookAt: wallPoint.toArray() };
      });
      const filename = 'B-concrete-wall-007-closeup-desktop.png';
      const screenshotPath = `${outputDirectory}/${filename}`;
      const screenshot = await page.screenshot({ path: screenshotPath, timeout: 120_000 });
      closeups.push({
        ...closeup,
        screenshot: { path: screenshotPath, sha256: sha256(screenshot), bytes: screenshot.length },
      });
    }

    await page.evaluate(() => window.game.dispose());
    await context.close();
  }
}

const paired = viewports.flatMap((viewport) =>
  ['chase', 'rear'].map((view) => {
    const a = captures
      .find((capture) => capture.viewport === viewport.id && capture.variant === 'A-blockout')
      ?.frames.find((frame) => frame.view === view);
    const b = captures
      .find(
        (capture) => capture.viewport === viewport.id && capture.variant === 'B-concrete-wall-007',
      )
      ?.frames.find((frame) => frame.view === view);
    return {
      viewport: viewport.id,
      view,
      sameCamera:
        JSON.stringify(a?.cameraPosition) === JSON.stringify(b?.cameraPosition) &&
        JSON.stringify(a?.cameraQuaternion) === JSON.stringify(b?.cameraQuaternion),
      sameWholeFrameDrawCalls: a?.wholeFrame.calls === b?.wholeFrame.calls,
      sameWholeFrameTriangles: a?.wholeFrame.triangles === b?.wholeFrame.triangles,
      sameWallVertexAndIndexCounts:
        a?.wholeFrame.calls !== null &&
        captures.find(
          (capture) => capture.viewport === viewport.id && capture.variant === 'A-blockout',
        )?.metadata.scene.leftWallPositionCount ===
          captures.find(
            (capture) =>
              capture.viewport === viewport.id && capture.variant === 'B-concrete-wall-007',
          )?.metadata.scene.leftWallPositionCount &&
        captures.find(
          (capture) => capture.viewport === viewport.id && capture.variant === 'A-blockout',
        )?.metadata.scene.leftWallIndexCount ===
          captures.find(
            (capture) =>
              capture.viewport === viewport.id && capture.variant === 'B-concrete-wall-007',
          )?.metadata.scene.leftWallIndexCount,
      aPassReconciliation: a?.passFrame?.reconciliation ?? null,
      bPassReconciliation: b?.passFrame?.reconciliation ?? null,
      aScreenshotSha256: a?.screenshot.sha256 ?? null,
      bScreenshotSha256: b?.screenshot.sha256 ?? null,
      imagesDiffer: a?.screenshot.sha256 !== b?.screenshot.sha256,
    };
  }),
);

const report = {
  schemaVersion: 1,
  sourceCommit,
  capturedAt: new Date().toISOString(),
  fixture: {
    runtime: 'Actual KartTimeTrial and NeonGridScene in tools/diagnostics/neon-grid-course.html.',
    trackId: 'neon-grid',
    visualVariant: 'neon-grid-task-a-001',
    materialVariants: variants.map((variant) => variant.id),
    graphicsQuality: 'medium',
    racerCount: 8,
    deterministicRosterSeed: 1417,
    tunnelFraction: 0.5,
    views: ['chase', 'rear'],
    viewports,
    sceneWarmup:
      'The existing course fixture stages 120 scene updates before window.ready; each view then uses eight warmup render calls and thirty scored CPU render-call timings.',
    normalGameplayAndPhysics:
      'The diagnostic fixture stages camera/scene state and does not alter track, collision, or game rules.',
    environment:
      'Headless Chromium with SwiftShader software WebGL; this is not physical-device FPS evidence.',
    browserVersion: browser.version(),
  },
  errors,
  captures,
  matchedPairs: paired,
  closeups,
  limitations: [
    'GPU time, actual hardware texture residency, and physical-device FPS are not measured.',
    'CPU timings cover existing scene update plus Bloom and disabled motion-blur render calls and are not whole-frame or GPU timing.',
    'A/B screenshots intentionally differ on the selected Service Tunnel wall material; their camera and scene geometry fixtures are matched.',
    'This staged single-position capture does not certify all sectors, all track conditions, or G-05.',
  ],
};
writeFileSync(`${outputDirectory}/material-ab-capture.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (errors.length > 0) throw new Error(`Browser errors: ${errors.join('; ')}`);
if (
  paired.some(
    (pair) =>
      !pair.sameCamera ||
      !pair.sameWholeFrameDrawCalls ||
      !pair.sameWholeFrameTriangles ||
      pair.imagesDiffer !== true,
  )
)
  throw new Error('A/B camera, whole-frame counters, or image-difference invariants did not hold.');
