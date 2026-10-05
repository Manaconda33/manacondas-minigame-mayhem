import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.FALLS_RUN_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/falls-run-render';
mkdirSync(directory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.FALLS_RUN_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

const errors = [];
const visualFrames = [];
let performanceMatrix = null;
let performanceSummary = null;
let diagnosticDeltas = null;

async function renderCase({ quality, width, height, scale, label, performance = false }) {
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
    `http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/falls-run.html?quality=${quality}&testRacePerf=1`,
  );
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const counters = await page.evaluate(() => window.renderFrame());
  await page.screenshot({ path: `${directory}/${label}.png` });
  visualFrames.push({ label, ...counters });

  if (performance) {
    const task8OffBloomOff = await page.evaluate(() => window.measureFrames(360, 60, false, false));
    const task8OnBloomOff = await page.evaluate(() => window.measureFrames(360, 60, true, false));
    const task8OffBloomOn = await page.evaluate(() => window.measureFrames(360, 60, false, true));
    const task8OnBloomOn = await page.evaluate(() => window.measureFrames(360, 60, true, true));
    performanceMatrix = {
      task8OffBloomOff,
      task8OnBloomOff,
      task8OffBloomOn,
      task8OnBloomOn,
    };
    performanceSummary = task8OnBloomOn;
    const delta = (on, off) => ({
      medianFrameMs: on.medianFrameMs - off.medianFrameMs,
      medianFramePercent: ((on.medianFrameMs - off.medianFrameMs) / off.medianFrameMs) * 100,
      p95FrameMs: on.p95FrameMs - off.p95FrameMs,
      p95FramePercent: ((on.p95FrameMs - off.p95FrameMs) / off.p95FrameMs) * 100,
      medianFps: on.medianFps - off.medianFps,
      medianFpsPercent: ((on.medianFps - off.medianFps) / off.medianFps) * 100,
    });
    diagnosticDeltas = {
      task8CostBloomOff: delta(task8OnBloomOff, task8OffBloomOff),
      task8CostBloomOn: delta(task8OnBloomOn, task8OffBloomOn),
      bloomCostTask8Off: delta(task8OffBloomOn, task8OffBloomOff),
      bloomCostTask8On: delta(task8OnBloomOn, task8OnBloomOff),
    };
  }
  await page.evaluate(() => window.game.dispose());
  await context.close();
}

try {
  await renderCase({
    quality: 'medium',
    width: 1280,
    height: 720,
    scale: 1.5,
    label: 'desktop-medium-1920x1080',
    performance: true,
  });
  await renderCase({ quality: 'low', width: 1280, height: 720, scale: 1, label: 'desktop-low' });
  await renderCase({ quality: 'high', width: 1280, height: 720, scale: 1, label: 'desktop-high' });
  await renderCase({ quality: 'low', width: 844, height: 390, scale: 1, label: 'mobile-low' });
  await renderCase({ quality: 'medium', width: 844, height: 390, scale: 1, label: 'mobile-medium' });
  await renderCase({ quality: 'high', width: 844, height: 390, scale: 1, label: 'mobile-high' });

  const summary = performanceSummary;
  const report = {
    environment:
      'GitHub Actions Chromium software WebGL. Actual KartTimeTrial Medium render with eight racers staged in Falls Run. Frame-time evidence is browser/runner specific and is not a physical owner-device certification.',
    errors,
    visualFrames,
    performanceMatrix,
    performanceSummary,
    diagnosticDeltas,
    maximumDrawCalls: Math.max(...visualFrames.map((frame) => frame.calls)),
    maximumTriangles: Math.max(...visualFrames.map((frame) => frame.triangles)),
  };
  writeFileSync(`${directory}/task8-render-check.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    environment: report.environment,
    errors,
    visualFrames,
    performanceMatrix,
    summary,
    diagnosticDeltas,
    maximumDrawCalls: report.maximumDrawCalls,
    maximumTriangles: report.maximumTriangles,
  }, null, 2));

  const medium = visualFrames.find((frame) => frame.label === 'desktop-medium-1920x1080');
  if (
    errors.length ||
    !medium ||
    medium.width !== 1920 ||
    medium.height !== 1080 ||
    medium.racers !== 8 ||
    report.maximumDrawCalls > 250 ||
    report.maximumTriangles > 750000 ||
    !summary ||
    summary.scoredFrames < 300 ||
    summary.p95FrameMs === null ||
    summary.p95FrameMs > 18.3 ||
    summary.medianFps === null ||
    summary.medianFps < 60
  ) {
    throw new Error('Task 8 rendered performance/readiness gate failed');
  }
} finally {
  await browser.close();
}
