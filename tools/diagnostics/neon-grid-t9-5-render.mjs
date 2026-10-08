import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-t9-5-render';
mkdirSync(directory, { recursive: true });

// Structural/readability CI only. Representative-hardware certification is T9.6.
const engineeringCeilings = { calls: 200, triangles: 300000 };
const prdCaps = { calls: 250, triangles: 750000 };
const captures = [
  { name: 'skyline-chase', progress: 0.063 },
  // Actual Billboard Gap entry spans 0.101–0.106, NOT former 0.22 capture.
  { name: 'billboard-approach-chase', progress: 0.092 },
  { name: 'billboard-mouth', progress: 0.103 },
  { name: 'billboard-rear', progress: 0.108, view: 'rear' },
  { name: 'undercity-entry', progress: 0.242 },
  // Service Tunnel entry spans 0.24655–0.25155, NOT former 0.355 capture.
  { name: 'undercity-service-tunnel', progress: 0.250, performance: true, scale: 1.5 },
  { name: 'undercity-exit', progress: 0.454 },
  { name: 'undercity-rear', progress: 0.254, view: 'rear' },
  { name: 'falls-climb', progress: 0.688 },
  // Waterfall Dive entry is 0.792717, NOT former 0.75 capture.
  { name: 'waterfall-dive-approach', progress: 0.786 },
  { name: 'waterfall-dive-mouth', progress: 0.794 },
  { name: 'falls-exit', progress: 0.865 },
  { name: 'waterfall-dive-rear', progress: 0.801, view: 'rear' },
  { name: 'mobile-landscape-billboard', progress: 0.102, width: 844, height: 390 },
  { name: 'mobile-landscape-undercity', progress: 0.249, width: 844, height: 390 },
  { name: 'mobile-landscape-dive', progress: 0.792, width: 844, height: 390 },
  { name: 'mobile-portrait-undercity', progress: 0.248, width: 390, height: 844 },
  { name: 'mobile-portrait-falls', progress: 0.792, width: 390, height: 844 },
];

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const errors = [];
const frames = [];
let performanceSummary = null;
try {
  for (const station of captures) {
    const width = station.width ?? 1280;
    const height = station.height ?? 720;
    const scale = station.scale ?? 1;
    const view = station.view ?? 'chase';
    const context = await browser.newContext({
      viewport: { width, height }, deviceScaleFactor: scale,
    });
    try {
      const page = await context.newPage();
      page.on('response', (response) => {
        if (response.status() >= 400) errors.push(station.name + ': HTTP ' + response.status() + ' ' + response.url());
      });
      page.on('pageerror', (error) => errors.push(station.name + ': ' + error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(station.name + ': ' + message.text());
      });
      const target = 'http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/neon-grid-course.html' +
        '?quality=medium&sector=course&testRacePerf=1&progress=' + station.progress;
      await page.goto(target);
      await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const frame = await page.evaluate((camera) => window.renderFrame(true, camera), view);
      if (station.performance) {
        // Task 9's full-course rendered gate requires >=300 scored software frames.
        performanceSummary = await page.evaluate(() => window.measureFrames(300, 45));
        await page.evaluate((camera) => window.renderFrame(true, camera), view);
      }
      await page.screenshot({ path: directory + '/' + station.name + '.png' });
      frames.push({ station: station.name, progress: station.progress, ...frame });
      await page.evaluate(() => window.game.dispose());
    } finally {
      await context.close();
    }
  }

  const maximumDrawCalls = Math.max(...frames.map((f) => f.calls));
  const maximumTriangles = Math.max(...frames.map((f) => f.triangles));
  const report = {
    source: 'Actual Neon Grid kart race scene, eight racers, all Task 9 visual owners mounted',
    classification: 'GitHub Actions Chromium/SwiftShader: blocking structural readiness only, FPS/p95 diagnostic, T9.6 hardware certification pending',
    engineeringCeilings, prdCaps, errors, frames,
    maximumDrawCalls, maximumTriangles, performanceSummary,
  };
  writeFileSync(directory + '/t9-5-render-check.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    errors, count: frames.length, maximumDrawCalls,
    maximumTriangles, scoredFrames: performanceSummary?.scoredFrames ?? null,
  }, null, 2));

  if (errors.length || frames.length !== captures.length ||
    frames.some((f) => f.racers !== 8 || f.calls <= 0 || f.triangles <= 0 ||
      f.width <= 0 || f.height <= 0 ||
      !Number.isFinite(f.calls) || !Number.isFinite(f.triangles)) ||
    frames.find((f) => f.station === 'undercity-service-tunnel')?.width !== 1920 ||
    frames.find((f) => f.station === 'undercity-service-tunnel')?.height !== 1080 ||
    maximumDrawCalls > engineeringCeilings.calls ||
    maximumTriangles > engineeringCeilings.triangles ||
    maximumDrawCalls > prdCaps.calls || maximumTriangles > prdCaps.triangles ||
    !performanceSummary || performanceSummary.scoredFrames < 300 ||
    !Number.isFinite(performanceSummary.medianFps) ||
    !Number.isFinite(performanceSummary.p95FrameMs)) {
    throw new Error('T9.5 full-course masking and structural render gate failed');
  }
} finally {
  await browser.close();
}
