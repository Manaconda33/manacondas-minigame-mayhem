import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-falls-extension-render';
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
const engineeringCeilings = { calls: 500, triangles: 425000, extensionCallDelta: 28 };
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
  progress = null,
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
      '&sector=falls-extension&testRacePerf=1' + (progress === null ? '' : '&progress=' + progress),
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

  // T9.5: compile the visible scene before timing a same-camera A/B.
  // This prevents first-use geometry/material/texture uploads from counting as
  // a visual-owner contribution. The active +28 limit is recorded in PRD amendment 2.27.
  if (measureDelta) {
    await page.evaluate(({ view }) => {
      for (let i = 0; i < 3; i++) window.renderFallsExtensionFrame(true, view);
    }, { view });
  }
  const baseline = measureDelta
    ? await page.evaluate(({ view }) => window.renderFallsExtensionFrame(false, view), { view })
    : null;
  const visible = await page.evaluate(({ view }) => window.renderFallsExtensionFrame(true, view), {
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
  // Reverse the order as an independent readiness check after screenshot.
  const hiddenAgain = measureDelta
    ? await page.evaluate(({ view }) => window.renderFallsExtensionFrame(false, view), { view })
    : null;
  const visibleAgain = measureDelta
    ? await page.evaluate(({ view }) => window.renderFallsExtensionFrame(true, view), { view })
    : null;
  const readinessStable = !measureDelta || Boolean(
    baseline && hiddenAgain && visibleAgain &&
    baseline.calls === hiddenAgain.calls &&
    baseline.triangles === hiddenAgain.triangles &&
    visible.calls === visibleAgain.calls &&
    visible.triangles === visibleAgain.triangles &&
    baseline.geometries === visible.geometries &&
    baseline.textures === visible.textures &&
    visible.geometries === visibleAgain.geometries &&
    visible.textures === visibleAgain.textures
  );
  visualFrames.push({ label, ...visible, baseline, delta, hiddenAgain, visibleAgain, readinessStable });

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
    label: 'falls-extension-desktop-medium-1920x1080',
    measureDelta: true,
    performance: true,
  });
  await renderCase({
    quality: 'low',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'falls-extension-desktop-low',
  });
  await renderCase({
    quality: 'high',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'falls-extension-desktop-high',
  });
  await renderCase({
    quality: 'low',
    width: 844,
    height: 390,
    scale: 1,
    label: 'falls-extension-mobile-low',
  });
  await renderCase({
    quality: 'medium',
    width: 844,
    height: 390,
    scale: 1,
    label: 'falls-extension-mobile-medium',
  });
  await renderCase({
    quality: 'high',
    width: 844,
    height: 390,
    scale: 1,
    label: 'falls-extension-mobile-high',
  });
  await renderCase({
    quality: 'medium',
    width: 1280,
    height: 720,
    scale: 1,
    label: 'falls-extension-desktop-rear-medium',
    view: 'rear',
  });
  // Multiple stations and portrait/landscape perspectives prevent a single
  // central camera from masking floating props or unreadable corridor ads.
  for (const [progress, label] of [
    [0.49, 'falls-extension-entry'],
    [0.65, 'falls-extension-before-task8'],
    [0.91, 'falls-extension-after-task8'],
  ]) {
    await renderCase({
      quality: 'medium', width: 1280, height: 720, scale: 1,
      label, progress,
    });
  }
  await renderCase({
    quality: 'medium', width: 390, height: 844, scale: 1,
    label: 'falls-extension-mobile-portrait-pre', progress: 0.64,
  });
  await renderCase({
    quality: 'medium', width: 390, height: 844, scale: 1,
    label: 'falls-extension-mobile-portrait-post', progress: 0.93,
  });

  const medium = visualFrames.find(
    (frame) => frame.label === 'falls-extension-desktop-medium-1920x1080',
  );
  const low = visualFrames.find((frame) => frame.label === 'falls-extension-desktop-low');
  const high = visualFrames.find((frame) => frame.label === 'falls-extension-desktop-high');
  const maximumDrawCalls = Math.max(...visualFrames.map((frame) => frame.calls));
  const maximumTriangles = Math.max(...visualFrames.map((frame) => frame.triangles));
  const report = {
    environment:
      `${renderEnvironment}. Actual KartTimeTrial with eight racers staged in The FallsExtension. Frame-time evidence is runner-specific and is not representative-hardware PRD certification.`,
    errors,
    visualFrames,
    performanceSummary,
    performanceClassification,
    engineeringCeilings,
    maximumDrawCalls,
    maximumTriangles,
    extensionCallDelta: medium?.delta?.calls ?? null,
    extensionTriangleDelta: medium?.delta?.triangles ?? null,
  };
  writeFileSync(
    directory + '/task9-falls-extension-render-check.json',
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
    medium.fallsExtension.windows !== 160 ||
    medium.fallsExtension.pylons !== 16 ||
    medium.fallsExtension.footings !== 16 ||
    medium.fallsExtension.waterfalls !== 24 ||
    medium.fallsExtension.mist !== 14 ||
    medium.fallsExtension.wet !== true ||
    !low ||
    low.fallsExtension.windows !== 80 ||
    low.fallsExtension.wet !== false ||
    low.fallsExtension.mist !== 0 ||
    !high ||
    high.fallsExtension.windows !== 240 ||
    high.fallsExtension.wet !== true ||
    high.fallsExtension.mist !== 28 ||
    medium.delta === null ||
    medium.delta.calls < 5 ||
    medium.delta.calls > engineeringCeilings.extensionCallDelta ||
    medium.readinessStable !== true ||
    medium.delta.triangles <= 0 ||
    maximumDrawCalls > engineeringCeilings.calls ||
    maximumTriangles > engineeringCeilings.triangles ||
    !performanceSummary ||
    performanceSummary.scoredFrames < 180 ||
    performanceSummary.p95FrameMs === null ||
    performanceSummary.medianFps === null
  ) {
    throw new Error('Task 9 T9.4 FallsExtension rendered readiness gate failed');
  }
} finally {
  await browser.close();
}
