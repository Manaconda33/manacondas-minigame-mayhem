import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(`${process.env.NEON_GRID_COURSE_PLAYWRIGHT}/package.json`);
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-quality-matrix';
mkdirSync(directory, { recursive: true });
const baseUrl = (process.env.NEON_GRID_COURSE_BASE_URL ??
  'http://127.0.0.1:5173/manacondas-minigame-mayhem').replace(/\/$/, '');
const regions = [
  { name: 'skyline', progress: 0.075 },
  { name: 'undercity', progress: 0.37 },
  { name: 'falls-run', progress: 0.72 },
  { name: 'falls-extension', progress: 0.92 },
];
const errors = [];
const captures = [];
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

try {
  for (const quality of ['low', 'medium', 'high']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
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
      if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`);
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(
      `${baseUrl}/tools/diagnostics/neon-grid-course.html?quality=${quality}&sector=course&testRacePerf=1&progress=0.075`,
    );
    await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.game?.opponents?.length === 7 &&
      window.game.opponents.every((opponent) => opponent.mesh.children[0]?.type === 'Group'),
    undefined, { timeout: 90000 });
    for (const region of regions) {
      await page.evaluate((progress) => window.stageCourseAtProgress(progress), region.progress);
      for (const camera of quality === 'medium' ? ['chase', 'rear'] : ['chase']) {
        const metrics = await page.evaluate((view) => window.renderFrame(true, view), camera);
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
          requestAnimationFrame(resolve))));
        const filename = `${region.name}-${quality}-${camera}.png`;
        await page.screenshot({ path: `${directory}/${filename}` });
        captures.push({ region: region.name, progress: region.progress, quality, camera, filename,
          calls: metrics.calls, triangles: metrics.triangles, width: metrics.width, height: metrics.height });
      }
    }
    await page.evaluate(() => window.game.dispose());
    await context.close();
  }
  const maximumCalls = Math.max(...captures.map((capture) => capture.calls));
  const maximumTriangles = Math.max(...captures.map((capture) => capture.triangles));
  const report = {
    source: 'Actual Neon Grid KartTimeTrial scene; four course sectors, Low/Medium/High, chase and Medium rear',
    environment: 'Local Chromium software WebGL / SwiftShader; visual comparison and structural budget evidence only',
    regions,
    qualities: ['low', 'medium', 'high'],
    errors,
    captures,
    maximumCalls,
    maximumTriangles,
    engineeringCeilings: { calls: 500, triangles: 425000 },
  };
  writeFileSync(`${directory}/quality-matrix-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ errors, captures: captures.length, maximumCalls,
    maximumTriangles }, null, 2));
  if (errors.length) throw new Error(`Quality matrix captured ${errors.length} browser errors`);
  if (maximumCalls > 500 || maximumTriangles > 425000) {
    throw new Error(`Quality matrix exceeded Task 9 budgets: ${maximumCalls} calls, ${maximumTriangles} triangles`);
  }
} finally {
  await browser.close();
}
