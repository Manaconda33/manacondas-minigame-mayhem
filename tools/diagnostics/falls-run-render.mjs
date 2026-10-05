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

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.5,
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
    'http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/falls-run.html?quality=medium&testRacePerf=1',
  );
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const scene = await page.evaluate(() => {
    const size = window.game.renderer.getDrawingBufferSize({ x: 0, y: 0 });
    return {
      width: size.x,
      height: size.y,
      pixelRatio: window.game.renderer.getPixelRatio(),
      racers: window.game.opponents.length + 1,
    };
  });

  const task8OffBloomOff = await page.evaluate(() =>
    window.measureFrames(360, 60, false, false),
  );

  const report = {
    environment:
      'GitHub Actions Chromium software WebGL. Actual KartTimeTrial Medium render with eight racers staged in Falls Run. Single-case diagnostic only; browser/runner-specific and not owner-device certification.',
    case: 'task8OffBloomOff',
    task8Visible: false,
    bloomEnabled: false,
    sampleFrames: 360,
    warmupFrames: 60,
    errors,
    scene,
    result: task8OffBloomOff,
  };

  writeFileSync(
    `${directory}/task8-single-case.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));

  if (
    errors.length ||
    scene.width !== 1920 ||
    scene.height !== 1080 ||
    scene.racers !== 8 ||
    task8OffBloomOff.scoredFrames < 300
  ) {
    throw new Error('Task 8 single-case diagnostic validity check failed');
  }

  await page.evaluate(() => window.game.dispose());
  await context.close();
} finally {
  await browser.close();
}
