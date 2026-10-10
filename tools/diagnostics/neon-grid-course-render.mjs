import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-course-render';
mkdirSync(directory, { recursive: true });
const renderEnvironment = process.env.GITHUB_ACTIONS === 'true'
  ? 'GitHub Actions Chromium software WebGL / SwiftShader'
  : 'Local Chromium software WebGL / SwiftShader';
const courseBaseUrl = (process.env.NEON_GRID_COURSE_BASE_URL ??
  'http://127.0.0.1:5173/manacondas-minigame-mayhem').replace(/\/$/, '');

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

const errors = [];
const visualFrames = [];
let performanceSummary = null;

const t91Reference = {
  desktopMedium1920x1080: { calls: 93, triangles: 78604 },
  maximumObserved: { calls: 123, triangles: 78604 },
};
const engineeringCeilings = { calls: 500, triangles: 425000, skylineCallDelta: 36 };
const maximumTriangleAiRoster = ['aa-03', 'aa-04', 'aa-05', 'aa-07', 'aa-10', 'aa-12', 'aa-14'];
const performanceClassification = {
  environment: renderEnvironment,
  authority: 'diagnostic-only',
  reason:
    'Software-rendered CI is authoritative for deterministic render-readiness and scene-budget gates, not representative hardware FPS/p95 certification.',
};

async function renderCase({
  quality,
  width,
  height,
  scale,
  label,
  view = 'chase',
  measureDelta = false,
  performance = false,
  progress = 0,
}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const originalRandom = Math.random;
    let state = 1417;
    Math.random = () => {
      if (!(new Error().stack ?? '').includes('raceRoster')) return originalRandom();
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(
    `${courseBaseUrl}/tools/diagnostics/neon-grid-course.html?quality=${quality}&testRacePerf=1`,
  );
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  // `networkidle` does not wait for GLTF parsing/callbacks that replace AI fallback karts.
  await page.waitForFunction(
    () => window.game?.opponents?.length === 7 &&
      window.game.opponents.every((opponent) => opponent.mesh.children[0]?.type === 'Group'),
    undefined,
    { timeout: 90000 },
  );
  const aiRoster = await page.evaluate(() => window.game.opponents.map(({ characterId }) => characterId).sort());
  if (JSON.stringify(aiRoster) !== JSON.stringify(maximumTriangleAiRoster)) {
    throw new Error(`Full-course render used unexpected AI roster: ${aiRoster.join(', ')}`);
  }
  await page.waitForTimeout(1000);
  await page.evaluate((nextProgress) => window.stageCourseAtProgress(nextProgress), progress);

  const baseline = measureDelta
    ? await page.evaluate(({ view }) => window.renderFrame(false, view), { view })
    : null;
  const visible = await page.evaluate(({ view }) => window.renderFrame(true, view), { view });
  const delta =
    baseline === null
      ? null
      : {
          calls: visible.calls - baseline.calls,
          triangles: visible.triangles - baseline.triangles,
        };

  await page.screenshot({ path: `${directory}/${label}.png` });
  visualFrames.push({ label, progress, ...visible, aiRoster, baseline, delta });

  if (performance) performanceSummary = await page.evaluate(() => window.measureFrames(240, 45));
  await page.evaluate(() => window.game.dispose());
  await context.close();
}

try {
  await renderCase({
    quality: 'medium',
    width: 1280,
    height: 720,
    scale: 1.5,
    label: 'skyline-desktop-medium-1920x1080',
    measureDelta: true,
    performance: true,
    progress: 0.075,
  });
  await renderCase({
    quality: 'low',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'skyline-desktop-low',
    progress: 0.075,
  });
  await renderCase({
    quality: 'high',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'skyline-desktop-high',
    progress: 0.075,
  });
  await renderCase({
    quality: 'low',
    width: 844,
    height: 390,
    scale: 1,
    label: 'skyline-mobile-low',
    progress: 0.075,
  });
  await renderCase({
    quality: 'medium',
    width: 844,
    height: 390,
    scale: 1,
    label: 'skyline-mobile-medium',
    progress: 0.075,
  });
  await renderCase({
    quality: 'high',
    width: 844,
    height: 390,
    scale: 1,
    label: 'skyline-mobile-high',
    progress: 0.075,
  });
  await renderCase({
    quality: 'medium',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'skyline-desktop-rear-medium',
    view: 'rear',
    progress: 0.075,
  });

  for (const station of [
    { name: 'undercity', progress: 0.37 },
    { name: 'falls-run', progress: 0.72 },
    { name: 'falls-extension', progress: 0.92 },
  ]) {
    for (const quality of ['low', 'medium', 'high']) {
      await renderCase({
        quality,
        width: 1280,
        height: 720,
        scale: 1,
        label: `${station.name}-${quality}-desktop-chase`,
        progress: station.progress,
      });
    }
    for (const view of ['chase', 'rear']) {
      await renderCase({
        quality: 'medium',
        width: 844,
        height: 390,
        scale: 1,
        label: `${station.name}-mobile-landscape-${view}`,
        view,
        progress: station.progress,
      });
    }
  }

  const medium = visualFrames.find((frame) => frame.label === 'skyline-desktop-medium-1920x1080');
  const low = visualFrames.find((frame) => frame.label === 'skyline-desktop-low');
  const high = visualFrames.find((frame) => frame.label === 'skyline-desktop-high');
  const maximumDrawCalls = Math.max(...visualFrames.map((frame) => frame.calls));
  const maximumTriangles = Math.max(...visualFrames.map((frame) => frame.triangles));
  const report = {
    environment:
      `${renderEnvironment}. Actual KartTimeTrial with eight racers staged in Skyline Straight. Frame-time evidence is runner-specific and is not representative-hardware PRD certification.`,
    errors,
    visualFrames,
    performanceSummary,
    performanceClassification,
    t91Reference,
    engineeringCeilings,
    maximumDrawCalls,
    maximumTriangles,
    skylineCallDelta: medium?.delta?.calls ?? null,
    skylineTriangleDelta: medium?.delta?.triangles ?? null,
  };
  writeFileSync(
    `${directory}/task9-skyline-render-check.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));

  if (
    errors.length ||
    !medium ||
    !medium.baseline ||
    medium.width !== 1920 ||
    medium.height !== 1080 ||
    medium.racers !== 8 ||
    medium.skyline.windows !== 240 ||
    medium.skyline.manacondaAds !== 7 ||
    medium.skyline.tacoBellAds !== 7 ||
    medium.skyline.maskBillboards !== 8 ||
    medium.skyline.raisedBillboardPosts !== 4 ||
    medium.skyline.facadeMountedBillboards !== 4 ||
    medium.skyline.wet !== true ||
    !low ||
    low.skyline.windows !== 120 ||
    low.skyline.wet !== false ||
    !high ||
    high.skyline.windows !== 360 ||
    high.skyline.wet !== true ||
    medium.delta === null ||
    medium.delta.calls < 5 ||
    medium.delta.calls > engineeringCeilings.skylineCallDelta ||
    medium.delta.triangles <= 0 ||
    maximumDrawCalls > engineeringCeilings.calls ||
    maximumTriangles > engineeringCeilings.triangles ||
    !performanceSummary ||
    performanceSummary.scoredFrames < 180 ||
    performanceSummary.p95FrameMs === null ||
    performanceSummary.medianFps === null
  ) {
    throw new Error('Task 9 T9.2 Skyline rendered readiness gate failed');
  }
} finally {
  await browser.close();
}
