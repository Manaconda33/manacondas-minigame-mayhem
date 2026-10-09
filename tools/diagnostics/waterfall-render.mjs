// Hosted real-WebGL verification only. No runtime fixture or game change.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire(process.env.WATERFALL_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/waterfall-render';
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.WATERFALL_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [],
    frames = [];
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(
    'http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/waterfall-spillway.html',
  );
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  for (const view of ['chase', 'overview', 'falls']) {
    const counters = await page.evaluate((view) => window.draw(view, 7), view);
    await page.screenshot({ path: `${directory}/${view}.png` });
    frames.push({ view, ...counters });
  }
  for (const [width, height, label] of [
    [390, 844, 'portrait'],
    [844, 390, 'landscape'],
  ]) {
    await page.setViewportSize({ width, height });
    const counters = await page.evaluate(() => {
      window.game.resize();
      return window.draw('chase', 9);
    });
    await page.screenshot({ path: `${directory}/${label}.png` });
    frames.push({ view: label, ...counters });
  }
  const baseline = await page.evaluate(() => {
    const group = window.game.trackScene.dive.group;
    const hidden = [];
    for (const name of [
      'dive-ramp-water',
      'dive-waterway',
      'dive-water-sheet',
      'dive-waterway-banks',
    ]) {
      const o = group.getObjectByName(name);
      hidden.push(o);
      o.visible = false;
    }
    const counters = window.draw('overview', 7);
    hidden.forEach((o) => (o.visible = true));
    return counters;
  });
  // Sweep the ramp approach/lip/flight/landing in the real eight-racer render pipeline.
  for (const distance of [3, 5, 7, 9, 11, 13, 15, 16, 18, 21, 24, 28])
    frames.push({
      view: 'approach-' + distance,
      ...(await page.evaluate((d) => window.draw('chase', d, 3), distance)),
    });
  const report = {
    environment:
      'GitHub Actions Chromium software WebGL; actual KartTimeTrial Medium, eight racers, bloom pipeline; bounded view matrix, not full-race hardware performance',
    errors,
    frames,
    withoutAddedSpillwayMeshes: baseline,
    maximumDrawCalls: Math.max(...frames.map((f) => f.calls)),
  };
  writeFileSync(`${directory}/render-check.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (errors.length || frames.some((frame) => frame.calls > 500 || frame.racers !== 8))
    throw new Error('Render errors or PRD draw-call budget failure');
  await page.evaluate(() => window.game.dispose());
} finally {
  await browser.close();
}
