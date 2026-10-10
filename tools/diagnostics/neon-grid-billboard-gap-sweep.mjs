import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-billboard-gap-sweep';
mkdirSync(directory, { recursive: true });
const baseUrl = (process.env.NEON_GRID_COURSE_BASE_URL ??
  'http://127.0.0.1:5173/manacondas-minigame-mayhem').replace(/\/$/, '');
const desktopFractions = [0, 0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1];
const mobileFractions = [0.05, 0.5, 0.95];
const errors = [];
const captures = [];
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?quality=medium&sector=course&testRacePerf=1&progress=0.1`);
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(
    () => window.game?.opponents?.length === 7 &&
      window.game.opponents.every((opponent) => opponent.mesh.children[0]?.type === 'Group'),
    undefined,
    { timeout: 90000 },
  );

  for (const fraction of desktopFractions) {
    await page.evaluate((at) => window.stageBillboardGapAtFraction(at), fraction);
    for (const view of ['chase', 'rear']) {
      const frame = await page.evaluate((camera) => window.renderFrame(true, camera), view);
      await page.screenshot({
        path: `${directory}/desktop-${view}-${String(Math.round(fraction * 100)).padStart(3, '0')}.jpg`,
        type: 'jpeg',
        quality: 70,
      });
      captures.push({ fraction, view, width: frame.width, height: frame.height,
        calls: frame.calls, triangles: frame.triangles });
    }
  }

  for (const fraction of mobileFractions) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate((at) => window.stageBillboardGapAtFraction(at), fraction);
    for (const view of ['chase', 'rear']) {
      const frame = await page.evaluate((camera) => window.renderFrame(true, camera), view);
      await page.screenshot({
        path: `${directory}/mobile-portrait-${view}-${String(Math.round(fraction * 100)).padStart(3, '0')}.jpg`,
        type: 'jpeg',
        quality: 70,
      });
      captures.push({ fraction, view, width: frame.width, height: frame.height,
        calls: frame.calls, triangles: frame.triangles });
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  }

  const report = {
    source: 'Actual Neon Grid Billboard Gap curve, staged Kart, ChaseCamera, all visual owners mounted',
    environment: 'Local Chromium software WebGL / SwiftShader; structural and visual evidence only',
    errors,
    desktopFractions,
    mobileFractions,
    cameraViews: ['chase', 'rear'],
    captures,
    maximumCalls: Math.max(...captures.map((capture) => capture.calls)),
    maximumTriangles: Math.max(...captures.map((capture) => capture.triangles)),
    engineeringCeilings: { calls: 500, triangles: 425000 },
  };
  writeFileSync(`${directory}/billboard-gap-sweep-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ errors, count: captures.length,
    maximumCalls: report.maximumCalls, maximumTriangles: report.maximumTriangles }, null, 2));
  await page.evaluate(() => window.game.dispose());
  await context.close();
  if (errors.length) throw new Error(`Billboard Gap sweep captured ${errors.length} browser errors`);
  if (report.maximumCalls > 500 || report.maximumTriangles > 425000) {
    throw new Error(`Billboard Gap sweep exceeded Task 9 ceilings: ${report.maximumCalls} calls, ${report.maximumTriangles} triangles`);
  }
} finally {
  await browser.close();
}
