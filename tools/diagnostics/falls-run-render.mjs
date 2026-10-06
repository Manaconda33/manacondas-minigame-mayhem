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
    const gl = window.game.renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      width: window.game.renderer.domElement.width,
      height: window.game.renderer.domElement.height,
      pixelRatio: window.game.renderer.getPixelRatio(),
      racers: window.game.opponents.length + 1,
      cameraFar: window.game.camera.far,
      vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    };
  });

  const cases = [];
  for (const spec of [
    { id: 'task8OffBloomOff', task8Visible: false, bloomEnabled: false },
    { id: 'task8OnBloomOff', task8Visible: true, bloomEnabled: false },
    { id: 'task8OffBloomOn', task8Visible: false, bloomEnabled: true },
    { id: 'task8OnBloomOn', task8Visible: true, bloomEnabled: true },
  ]) {
    const result = await page.evaluate(
      ({ task8Visible, bloomEnabled }) =>
        window.measureFrames(90, 30, task8Visible, bloomEnabled),
      spec,
    );
    cases.push({ ...spec, result });
  }

  const baseline = cases.find((entry) => entry.id === 'task8OffBloomOff')?.result;
  const report = {
    environment:
      'GitHub Actions Chromium software WebGL. Paired diagnostic only: identical Medium 1920x1080 eight-racer Falls Run fixture, camera far unchanged, Task 8 visibility and bloom toggled independently.',
    sampleFrames: 90,
    warmupFrames: 30,
    errors,
    scene,
    cases,
    deltas: baseline
      ? cases.map((entry) => ({
          id: entry.id,
          medianFrameMs: entry.result.medianFrameMs,
          medianDeltaMs: entry.result.medianFrameMs - baseline.medianFrameMs,
          p95FrameMs: entry.result.p95FrameMs,
          medianFps: entry.result.medianFps,
        }))
      : [],
  };

  writeFileSync(
    `${directory}/task8-four-case-matrix.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));

  if (
    errors.length ||
    scene.width !== 1920 ||
    scene.height !== 1080 ||
    scene.racers !== 8 ||
    scene.cameraFar !== 900 ||
    cases.some((entry) => entry.result.scoredFrames < 80)
  ) {
    throw new Error('Task 8 four-case diagnostic validity check failed');
  }

  await page.evaluate(() => window.game.dispose());
  await context.close();
} finally {
  await browser.close();
}
