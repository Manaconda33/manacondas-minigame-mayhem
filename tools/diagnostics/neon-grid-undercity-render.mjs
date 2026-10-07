import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-undercity-render';
mkdirSync(directory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

const errors = [];
const visualFrames = [];
let performanceSummary = null;
const engineeringCeilings = { calls: 200, triangles: 300000, undercityCallDelta: 20 };
const performanceClassification = {
  environment: 'GitHub Actions Chromium software WebGL / SwiftShader',
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
    if (response.status() >= 400) errors.push(response.status() + ' ' + response.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(
    'http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/neon-grid-course.html?quality=' +
      quality +
      '&sector=undercity&testRacePerf=1',
  );
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const baseline = measureDelta
    ? await page.evaluate(({ view }) => window.renderUndercityFrame(false, view), { view })
    : null;
  const visible = await page.evaluate(({ view }) => window.renderUndercityFrame(true, view), {
    view,
  });
  const delta =
    baseline === null
      ? null
      : {
          calls: visible.calls - baseline.calls,
          triangles: visible.triangles - baseline.triangles,
        };

  await page.screenshot({ path: directory + '/' + label + '.png' });
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
    label: 'undercity-desktop-medium-1920x1080',
    measureDelta: true,
    performance: true,
  });
  await renderCase({
    quality: 'low',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'undercity-desktop-low',
  });
  await renderCase({
    quality: 'high',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'undercity-desktop-high',
  });
  await renderCase({
    quality: 'low',
    width: 844,
    height: 390,
    scale: 1,
    label: 'undercity-mobile-low',
  });
  await renderCase({
    quality: 'medium',
    width: 844,
    height: 390,
    scale: 1,
    label: 'undercity-mobile-medium',
  });
  await renderCase({
    quality: 'high',
    width: 844,
    height: 390,
    scale: 1,
    label: 'undercity-mobile-high',
  });
  await renderCase({
    quality: 'medium',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'undercity-desktop-rear-medium',
    view: 'rear',
  });

  const medium = visualFrames.find(
    (frame) => frame.label === 'undercity-desktop-medium-1920x1080',
  );
  const low = visualFrames.find((frame) => frame.label === 'undercity-desktop-low');
  const high = visualFrames.find((frame) => frame.label === 'undercity-desktop-high');
  const maximumDrawCalls = Math.max(...visualFrames.map((frame) => frame.calls));
  const maximumTriangles = Math.max(...visualFrames.map((frame) => frame.triangles));
  const report = {
    environment:
      'GitHub Actions Chromium software WebGL. Actual KartTimeTrial with eight racers staged in The Undercity. Frame-time evidence is runner-specific and is not representative-hardware PRD certification.',
    errors,
    visualFrames,
    performanceSummary,
    performanceClassification,
    engineeringCeilings,
    maximumDrawCalls,
    maximumTriangles,
    undercityCallDelta: medium?.delta?.calls ?? null,
    undercityTriangleDelta: medium?.delta?.triangles ?? null,
  };
  writeFileSync(
    directory + '/task9-undercity-render-check.json',
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
    medium.undercity.windows !== 160 ||
    medium.undercity.buildings !== 16 ||
    medium.undercity.pipes !== 26 ||
    medium.undercity.nightshiftAds !== 2 ||
    medium.undercity.voltlineAds !== 2 ||
    medium.undercity.wet !== true ||
    !low ||
    low.undercity.windows !== 80 ||
    low.undercity.wet !== false ||
    !high ||
    high.undercity.windows !== 240 ||
    high.undercity.wet !== true ||
    medium.delta === null ||
    medium.delta.calls < 5 ||
    medium.delta.calls > engineeringCeilings.undercityCallDelta ||
    medium.delta.triangles <= 0 ||
    maximumDrawCalls > engineeringCeilings.calls ||
    maximumTriangles > engineeringCeilings.triangles ||
    !performanceSummary ||
    performanceSummary.scoredFrames < 180 ||
    performanceSummary.p95FrameMs === null ||
    performanceSummary.medianFps === null
  ) {
    throw new Error('Task 9 T9.3 Undercity rendered readiness gate failed');
  }
} finally {
  await browser.close();
}
