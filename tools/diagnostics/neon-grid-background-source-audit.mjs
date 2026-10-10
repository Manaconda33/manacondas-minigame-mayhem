import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const output = process.argv[2] ?? '/tmp/neon-grid-background-source-audit.json';
const baseUrl = (process.env.NEON_GRID_COURSE_BASE_URL ??
  'http://127.0.0.1:5173/manacondas-minigame-mayhem').replace(/\/$/, '');
const source = process.env.NEON_GRID_AUDIT_SOURCE ?? 'unspecified';
const ownerAnchors = [
  { name: '0m35-start-billboards', progress: 0.075 },
  { name: '0m48-skyline-approach', progress: 0.239 },
  { name: '1m07-undercity-ground', progress: 0.31 },
  { name: '1m22-undercity-city', progress: 0.37 },
  { name: '1m38-tunnel-exit', progress: 0.43 },
  { name: '1m51-falls-approach', progress: 0.54 },
  { name: '2m12-falls-city', progress: 0.63 },
  { name: '2m31-falls-run', progress: 0.69 },
  { name: '2m43-waterfall-zone', progress: 0.72 },
];
const screenSamples = [0.05, 0.25, 0.5, 0.75, 0.95].flatMap((x) =>
  [0.2, 0.3, 0.4, 0.5, 0.6].map((y) => [x, y]),
);
const lateralSamples = [-70, -45, -24, 24, 45, 70];
const errors = [];
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`);
  });
  await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?quality=medium&sector=course`);
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });

  const anchors = [];
  for (const anchor of ownerAnchors) {
    await page.evaluate((progress) => window.stageCourseAtProgress(progress), anchor.progress);
    await page.evaluate(() => window.renderFrame(true, 'chase'));
    const view = await page.evaluate(({ screenSamples, lateralSamples, progress }) => {
      const pixelHits = screenSamples.map(([x, y]) => {
        const hit = window.inspectRenderedPixel(
          Math.round(x * window.innerWidth),
          Math.round(y * window.innerHeight),
        )[0];
        return {
          screen: [x, y],
          object: hit?.name ?? null,
          distance: hit?.distance ?? null,
          point: hit?.point ?? null,
          isCityFloorFace: hit?.geometry?.isCityFloorFace ?? false,
          faceColors: hit?.geometry?.faceColors ?? [],
        };
      });
      const track = window.game.track;
      window.game.scene.updateMatrixWorld(true);
      const center = track.curve.getPointAt(progress);
      const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
      const right = new window.THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      const down = new window.THREE.Vector3(0, -1, 0);
      const raycaster = new window.THREE.Raycaster();
      const renderedGroundMeshes = [];
      window.game.scene.traverse((object) => {
        if (!object.isMesh) return;
        const metadata = object.geometry?.userData ?? {};
        const isCandidate = metadata.terracedCityGround === true ||
          object.name.includes('city-terraced-ground');
        if (!isCandidate) return;
        let parent = object;
        while (parent) {
          if (!parent.visible) return;
          parent = parent.parent;
        }
        renderedGroundMeshes.push(object);
      });
      const groundProbes = lateralSamples.map((lateralOffset) => {
        const sample = center.clone().addScaledVector(right, lateralOffset);
        raycaster.set(sample.clone().add(new window.THREE.Vector3(0, 55, 0)), down);
        raycaster.far = 130;
        const intersections = raycaster.intersectObjects(renderedGroundMeshes, false);
        const floorsByObject = new Map();
        for (const hit of intersections) {
          const metadata = hit.object.geometry?.userData ?? {};
          const start = metadata.floorIndexStart ?? 0;
          const count = metadata.floorIndexCount ?? 0;
          const isIndexedCityFloor = metadata.terracedCityGround === true &&
            hit.faceIndex !== null && hit.faceIndex * 3 >= start &&
            hit.faceIndex * 3 < start + count;
          const isDirectGround = hit.object.name.includes('city-terraced-ground');
          if ((isIndexedCityFloor || isDirectGround) && !floorsByObject.has(hit.object.uuid)) {
            floorsByObject.set(hit.object.uuid, hit);
          }
        }
        const floors = [...floorsByObject.values()];
        const nearCoincidentPairs = [];
        for (let i = 0; i < floors.length; i++) {
          for (let j = i + 1; j < floors.length; j++) {
            const first = floors[i];
            const second = floors[j];
            if (Math.abs(first.point.y - second.point.y) <= 0.05) {
              nearCoincidentPairs.push([first.object.name, second.object.name]);
            }
          }
        }
        const floor = floors[0];
        return {
          lateralOffset,
          renderedCityFloor: floor !== undefined,
          object: floor?.object.name ?? null,
          height: floor?.point.y ?? null,
          triangle: floor?.faceIndex ?? null,
          allRenderedFloors: floors.map((hit) => ({ object: hit.object.name, height: hit.point.y })),
          nearCoincidentPairs,
        };
      });
      const visibleObjects = {};
      for (const sample of pixelHits) {
        const name = sample.object ?? 'none';
        visibleObjects[name] = (visibleObjects[name] ?? 0) + 1;
      }
      return {
        visibleObjects,
        exposedSkyPixels: pixelHits.filter((sample) => /sky/i.test(sample.object ?? '')),
        cityFloorPixels: pixelHits.filter((sample) => sample.isCityFloorFace),
        groundProbes,
      };
    }, { screenSamples, lateralSamples, progress: anchor.progress });
    anchors.push({ ...anchor, ...view });
  }

  const report = {
    source,
    runtime: 'Neon Grid KartTimeTrial scene, mobile portrait viewport, actual chase camera',
    environment: 'Local Chromium software WebGL / SwiftShader; raycast source audit only',
    screenGrid: { columns: 5, rows: 5, normalizedX: [0.05, 0.25, 0.5, 0.75, 0.95], normalizedY: [0.2, 0.3, 0.4, 0.5, 0.6] },
    lateralCityGroundProbesMeters: lateralSamples,
    errors,
    anchors,
  };
  writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    source,
    output,
    errors,
    anchors: anchors.map(({ name, progress, visibleObjects, exposedSkyPixels, cityFloorPixels, groundProbes }) => ({
      name,
      progress,
      visibleObjects,
      exposedSkyPixels: exposedSkyPixels.length,
      cityFloorPixels: cityFloorPixels.length,
      cityFloorProbeCount: groundProbes.filter((probe) => probe.renderedCityFloor).length,
      groundProbeObjects: [...new Set(groundProbes.filter((probe) => probe.renderedCityFloor).map((probe) => probe.object))],
      nearCoincidentGroundPairs: groundProbes.flatMap((probe) => probe.nearCoincidentPairs),
    })),
  }, null, 2));
  await page.evaluate(() => window.game.dispose());
  if (errors.length) throw new Error(`Background source audit captured ${errors.length} browser errors`);
} finally {
  await browser.close();
}
