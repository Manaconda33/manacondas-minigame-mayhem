import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-course-render';
mkdirSync(directory, { recursive: true });
const renderEnvironment = process.env.GITHUB_ACTIONS === 'true'
  ? 'GitHub Actions Chromium software WebGL / SwiftShader'
  : 'Local Chromium software WebGL / SwiftShader';

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
const engineeringCeilings = { calls: 500, triangles: 350000, skylineCallDelta: 36 };
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
}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
  });
  const page = await context.newPage();
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(
    `http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/neon-grid-course.html?quality=${quality}&testRacePerf=1`,
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
  await page.waitForTimeout(1000);

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
  visualFrames.push({ label, ...visible, baseline, delta });

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
  });
  await renderCase({
    quality: 'low',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'skyline-desktop-low',
  });
  await renderCase({
    quality: 'high',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'skyline-desktop-high',
  });
  await renderCase({
    quality: 'low',
    width: 844,
    height: 390,
    scale: 1,
    label: 'skyline-mobile-low',
  });
  await renderCase({
    quality: 'medium',
    width: 844,
    height: 390,
    scale: 1,
    label: 'skyline-mobile-medium',
  });
  await renderCase({
    quality: 'high',
    width: 844,
    height: 390,
    scale: 1,
    label: 'skyline-mobile-high',
  });
  await renderCase({
    quality: 'medium',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'skyline-desktop-rear-medium',
    view: 'rear',
  });

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
