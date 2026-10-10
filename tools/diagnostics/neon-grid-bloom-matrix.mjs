import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(`${process.env.NEON_GRID_COURSE_PLAYWRIGHT}/package.json`);
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-bloom-matrix';
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
  for (const bloom of ['on', 'off']) {
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
    const bloomParam = bloom === 'off' ? '&testBloom=off' : '';
    await page.goto(
      `${baseUrl}/tools/diagnostics/neon-grid-course.html?quality=medium&sector=course&testRacePerf=1&progress=0.075${bloomParam}`,
    );
    await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.game?.opponents?.length === 7 &&
      window.game.opponents.every((opponent) => opponent.mesh.children[0]?.type === 'Group'),
    undefined, { timeout: 90000 });
    const bloomEnabled = await page.evaluate(() => window.game.bloom.snapshot().enabled);
    if (bloomEnabled !== (bloom === 'on')) {
      throw new Error(`Bloom ${bloom} state was not applied (enabled=${String(bloomEnabled)})`);
    }
    for (const region of regions) {
      await page.evaluate((progress) => window.stageCourseAtProgress(progress), region.progress);
      for (const camera of ['chase', 'rear']) {
        await page.evaluate((view) => window.renderFrame(true, view), camera);
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
          requestAnimationFrame(resolve))));
        const filename = `${region.name}-${camera}-bloom-${bloom}.png`;
        await page.screenshot({ path: `${directory}/${filename}` });
        const metrics = await page.evaluate((view) => window.renderFrame(true, view), camera);
        captures.push({ region: region.name, progress: region.progress, camera, bloom, filename,
          calls: metrics.calls, triangles: metrics.triangles, width: metrics.width, height: metrics.height,
          bloomEnabled,
          sha256: createHash('sha256').update(readFileSync(`${directory}/${filename}`)).digest('hex') });
      }
    }
    await page.evaluate(() => window.game.dispose());
    await context.close();
  }

  const differingPairs = [];
  for (const region of regions) {
    for (const camera of ['chase', 'rear']) {
      const on = captures.find((capture) => capture.region === region.name &&
        capture.camera === camera && capture.bloom === 'on');
      const off = captures.find((capture) => capture.region === region.name &&
        capture.camera === camera && capture.bloom === 'off');
      if (!on || !off) throw new Error(`Missing bloom pair for ${region.name} ${camera}`);
      if (on.sha256 !== off.sha256) differingPairs.push(`${region.name}-${camera}`);
    }
  }
  const maximumCalls = Math.max(...captures.map((capture) => capture.calls));
  const maximumTriangles = Math.max(...captures.map((capture) => capture.triangles));
  const report = {
    source: 'Actual Neon Grid KartTimeTrial scene; Medium quality, four course sectors, chase/rear views',
    environment: 'Local Chromium software WebGL / SwiftShader; bloom comparison is visual only',
    regions,
    bloomModes: ['on', 'off'],
    visuallyDifferingPairs: differingPairs,
    errors,
    captures,
    maximumCalls,
    maximumTriangles,
    engineeringCeilings: { calls: 500, triangles: 425000 },
  };
  writeFileSync(`${directory}/bloom-matrix-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ errors, captures: captures.length, maximumCalls,
    maximumTriangles }, null, 2));
  if (errors.length) throw new Error(`Bloom matrix captured ${errors.length} browser errors`);
  if (differingPairs.length === 0) throw new Error('Bloom toggle changed no sector/camera capture');
  if (maximumCalls > 500 || maximumTriangles > 425000) {
    throw new Error(`Bloom matrix exceeded Task 9 budgets: ${maximumCalls} calls, ${maximumTriangles} triangles`);
  }
} finally {
  await browser.close();
}
