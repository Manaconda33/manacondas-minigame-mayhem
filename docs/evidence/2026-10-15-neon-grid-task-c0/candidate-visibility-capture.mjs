import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const sourceCommit = 'e52fef8169233e5c612f8683e8074423c8cf1c07';
const playwrightModule =
  process.env.PLAYWRIGHT_MODULE ??
  '/workspace/mayhem-browser-tools/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(playwrightModule).href);
const baseUrl =
  process.env.C0_DIAGNOSTICS_URL ??
  'http://127.0.0.1:5176/manacondas-minigame-mayhem/tools/diagnostics/neon-grid-course.html';
const chromiumPath = process.env.CHROMIUM_EXECUTABLE_PATH ?? '/usr/bin/chromium';
const outputDir = new URL('.', import.meta.url).pathname;
const fixtures = [
  { id: 'skyline-p016-desktop', width: 1280, height: 720, dpr: 1.5, progress: 0.16 },
  { id: 'skyline-p016-portrait', width: 390, height: 844, dpr: 1, progress: 0.16 },
  { id: 'skyline-p060-desktop', width: 1280, height: 720, dpr: 1.5, progress: 0.06 },
  { id: 'skyline-p230-desktop', width: 1280, height: 720, dpr: 1.5, progress: 0.23 },
  { id: 'skyline-p060-portrait', width: 390, height: 844, dpr: 1, progress: 0.06 },
  { id: 'tunnel-f015-desktop', width: 1280, height: 720, dpr: 1.5, tunnelFraction: 0.15 },
  { id: 'tunnel-f050-desktop', width: 1280, height: 720, dpr: 1.5, tunnelFraction: 0.5 },
  { id: 'tunnel-f085-desktop', width: 1280, height: 720, dpr: 1.5, tunnelFraction: 0.85 },
  { id: 'tunnel-f050-portrait', width: 390, height: 844, dpr: 1, tunnelFraction: 0.5 },
  { id: 'undercity-p355-desktop', width: 1280, height: 720, dpr: 1.5, progress: 0.355 },
  { id: 'undercity-p355-portrait', width: 390, height: 844, dpr: 1, progress: 0.355 },
];
const requestedFixtureIds = process.argv.slice(2);
const selectedFixtures = requestedFixtureIds.length
  ? fixtures.filter((fixture) => requestedFixtureIds.includes(fixture.id))
  : fixtures;
if (!selectedFixtures.length) throw new Error('No requested C0.1 visibility fixtures matched.');
const browserErrors = [];
const captures = [];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: chromiumPath,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--use-angle=swiftshader',
  ],
});

for (const fixture of selectedFixtures) {
  const context = await browser.newContext({
    viewport: { width: fixture.width, height: fixture.height },
    deviceScaleFactor: fixture.dpr,
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => browserErrors.push(`${fixture.id}: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(`${fixture.id}: console ${message.text()}`);
  });
  page.on('requestfailed', (request) => {
    browserErrors.push(
      `${fixture.id}: request ${request.url()} ${request.failure()?.errorText ?? ''}`,
    );
  });
  const url = new URL(baseUrl);
  url.searchParams.set('quality', 'medium');
  url.searchParams.set('neonGridVisual', 'neon-grid-task-a-001');
  if (fixture.progress !== undefined) {
    url.searchParams.set('progress', String(fixture.progress));
  } else {
    url.searchParams.set('sector', 'course');
    url.searchParams.set('tunnelFraction', String(fixture.tunnelFraction));
  }
  await page.goto(url.href, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.game && window.renderFrame, null, { timeout: 120000 });
  const sample = await page.evaluate(
    ({ fixture, sourceCommit }) => {
      const game = window.game;
      const THREE = window.THREE;
      if (fixture.progress !== undefined) window.stageCourseAtProgress(fixture.progress);
      const wholeFrame = window.renderFrame(true, 'chase');
      game.scene.updateMatrixWorld(true);
      game.camera.updateMatrixWorld(true);
      const candidates = {
        roadwayWallRibbon: ['neon-grid-wall--1', 'neon-grid-wall-1'],
        skylineOuterFascia: ['skyline-deck-fascia'],
        serviceTunnelSidewalls: ['service-tunnel-left-wall', 'service-tunnel-right-wall'],
        ventBankControl: ['undercity-facade-vent-banks'],
      };
      const fascia = game.scene.getObjectByName('skyline-deck-fascia');
      const outerRange = fascia?.userData?.geometryRanges?.outerFascia ?? null;
      const targetForHit = (hit) => {
        const name = hit.object.name;
        if (candidates.roadwayWallRibbon.includes(name)) return 'roadwayWallRibbon';
        if (candidates.serviceTunnelSidewalls.includes(name)) return 'serviceTunnelSidewalls';
        if (candidates.ventBankControl.includes(name)) return 'ventBankControl';
        if (name === 'skyline-deck-fascia' && outerRange && hit.faceIndex !== null) {
          const inRange =
            hit.faceIndex >= outerRange.startTriangle &&
            hit.faceIndex < outerRange.startTriangle + outerRange.triangleCount;
          return inRange ? 'skylineOuterFascia' : null;
        }
        return null;
      };
      const metrics = Object.fromEntries(
        Object.keys(candidates).map((key) => [
          key,
          {
            targetGridRays: 0,
            targetFirstHitRays: 0,
            occludedTargetRays: 0,
            distances: [],
            firstOccluders: {},
            instances: {},
          },
        ]),
      );
      const grid = { columns: 36, rows: 20, totalRays: 36 * 20 };
      const raycaster = new THREE.Raycaster();
      const screenPoint = new THREE.Vector2();
      const visible = (object) => {
        for (let current = object; current; current = current.parent)
          if (!current.visible) return false;
        return true;
      };
      for (let row = 0; row < grid.rows; row++) {
        for (let column = 0; column < grid.columns; column++) {
          screenPoint.set(
            ((column + 0.5) / grid.columns) * 2 - 1,
            1 - ((row + 0.5) / grid.rows) * 2,
          );
          raycaster.setFromCamera(screenPoint, game.camera);
          const hits = raycaster
            .intersectObjects(game.scene.children, true)
            .filter((hit) => visible(hit.object));
          const first = hits[0];
          const firstName = first?.object?.name || first?.object?.type || 'none';
          const firstTarget = first ? targetForHit(first) : null;
          for (const [candidate, objectNames] of Object.entries(candidates)) {
            const targetHit = hits.find((hit) => targetForHit(hit) === candidate);
            if (!targetHit) continue;
            const record = metrics[candidate];
            record.targetGridRays++;
            record.distances.push(Number(targetHit.distance.toFixed(2)));
            if (firstTarget === candidate) record.targetFirstHitRays++;
            else {
              record.occludedTargetRays++;
              record.firstOccluders[firstName] = (record.firstOccluders[firstName] ?? 0) + 1;
            }
            if (targetHit.instanceId !== undefined && targetHit.instanceId !== null) {
              record.instances[targetHit.instanceId] =
                (record.instances[targetHit.instanceId] ?? 0) + 1;
            }
          }
        }
      }
      const summarize = (record) => {
        const sorted = [...record.distances].sort((a, b) => a - b);
        const percentile = (rank) =>
          sorted.length
            ? sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * rank))]
            : null;
        return {
          targetGridRays: record.targetGridRays,
          targetFirstHitRays: record.targetFirstHitRays,
          occludedTargetRays: record.occludedTargetRays,
          viewportGridFraction: Number((record.targetGridRays / grid.totalRays).toFixed(4)),
          firstVisibleGridFraction: Number((record.targetFirstHitRays / grid.totalRays).toFixed(4)),
          occludedFraction: record.targetGridRays
            ? Number((record.occludedTargetRays / record.targetGridRays).toFixed(4))
            : null,
          targetRayDistanceMeters: {
            min: sorted[0] ?? null,
            median: percentile(0.5),
            p90: percentile(0.9),
            max: sorted.at(-1) ?? null,
          },
          firstOccluders: record.firstOccluders,
          instancesHit: Object.keys(record.instances).length,
        };
      };
      const renderer = game.renderer;
      const gl = renderer.getContext();
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      const fog = game.scene.fog;
      const targetMeshes = Object.fromEntries(
        Object.values(candidates)
          .flat()
          .map((name) => {
            const object = game.scene.getObjectByName(name);
            const position = object?.geometry?.getAttribute?.('position');
            return [
              name,
              object
                ? {
                    type: object.type,
                    geometryPositions: position?.count ?? null,
                    triangleCount: object.geometry?.getIndex?.()?.count
                      ? object.geometry.getIndex().count / 3
                      : position?.count
                        ? position.count / 3
                        : null,
                    hasUv: Boolean(object.geometry?.getAttribute?.('uv')),
                    materialType: Array.isArray(object.material)
                      ? object.material.map((material) => material.type)
                      : (object.material?.type ?? null),
                    drawObjectCount: object.count ?? null,
                    presentationOnly:
                      object.userData?.presentationOnly ??
                      object.geometry?.userData?.presentationOnly ??
                      null,
                    collisionFlag:
                      object.userData?.collision ?? object.geometry?.userData?.collision ?? null,
                    geometryRanges: object.userData?.geometryRanges ?? null,
                  }
                : null,
            ];
          }),
      );
      return {
        fixtureId: fixture.id,
        sourceCommit,
        visualVariant: game.trackScene.userData.visualVariant,
        viewportCss: [window.innerWidth, window.innerHeight],
        drawingBuffer: [size.x, size.y],
        dpr: renderer.getPixelRatio(),
        browser: navigator.userAgent,
        gpuRenderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
        quality: wholeFrame.quality,
        racerCount: wholeFrame.racers,
        cameraPosition: game.camera.position.toArray().map((n) => Number(n.toFixed(3))),
        cameraQuaternion: game.camera.quaternion.toArray().map((n) => Number(n.toFixed(5))),
        routeProgress: fixture.progress ?? null,
        tunnelFraction: fixture.tunnelFraction ?? null,
        fog: fog
          ? {
              type: fog.isFog ? 'linear' : fog.isFogExp2 ? 'exp2' : fog.constructor.name,
              near: fog.near ?? null,
              far: fog.far ?? null,
              density: fog.density ?? null,
            }
          : null,
        candidateGeometry: targetMeshes,
        sampleGrid: grid,
        candidateVisibility: Object.fromEntries(
          Object.entries(metrics).map(([name, record]) => [name, summarize(record)]),
        ),
        wholeFrameCounters: {
          drawCalls: wholeFrame.calls,
          submittedTriangles: wholeFrame.triangles,
        },
      };
    },
    { fixture, sourceCommit },
  );
  const png = await page.screenshot({ fullPage: false });
  const screenshotPath = `${outputDir}/${fixture.id}.png`;
  await writeFile(screenshotPath, png);
  captures.push({
    ...sample,
    screenshot: {
      filename: `${fixture.id}.png`,
      bytes: png.length,
      sha256: createHash('sha256').update(png).digest('hex'),
    },
  });
  await context.close();
}

await browser.close();
const report = {
  schemaVersion: 1,
  sourceCommit,
  capturedAt: new Date().toISOString(),
  environment: {
    browser:
      'Headless Chromium launched with software WebGL/SwiftShader in the managed Codex environment.',
    viewportSampling:
      '36x20 uniform camera-ray grid over the CSS viewport; candidate intersections counted at any depth and separately when the first scene hit. This is a projected-area and occlusion proxy, not pixel segmentation.',
    measurement:
      'No objects, materials, geometry, camera, fog, renderer settings, gameplay state or source runtime were changed by the capture.',
  },
  errors: browserErrors,
  fixtures: captures,
  limitations: [
    'Ray-grid fractions are sampling proxies and do not measure exact screen pixels or time-in-view while driving.',
    'SwiftShader confirms only source/render-path observability; it is not representative-device performance evidence.',
    'A ray hit is geometric visibility and does not quantify contrast, material readability, or driver attention.',
  ],
};
const reportFilename = process.env.C0_REPORT_FILENAME ?? 'candidate-visibility.json';
await writeFile(`${outputDir}/${reportFilename}`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (browserErrors.length) process.exitCode = 1;
