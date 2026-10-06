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

  const directChildren = await page.evaluate(() =>
    window.game.trackScene.fallsRun.group.children.map((child) => child.name),
  );
  const categories = {
    sky: ['falls-run-night-sky'],
    road: [
      'falls-run-asphalt-base',
      'falls-run-wet-asphalt',
      'falls-run-wall-cladding',
      'falls-run-luminous-edges',
      'falls-run-luminous-top-rails',
    ],
    structure: ['falls-run-deck-fascia', 'falls-run-pylons', 'falls-run-cross-braces'],
    city: ['falls-run-city-towers', 'falls-run-city-windows', 'falls-run-city-roof-lights'],
    water: [
      'falls-run-ambient-waterfalls',
      'falls-run-waterfall-lips',
      'falls-run-ambient-mist',
      'falls-run-plunge-spray',
    ],
    signage: ['falls-run-neon-signage', 'falls-run-dive-rail-debris'],
  };

  async function setVisible(names) {
    await page.evaluate((visibleNames) => {
      const allowed = new Set(visibleNames);
      for (const child of window.game.trackScene.fallsRun.group.children)
        child.visible = allowed.has(child.name);
    }, names);
  }

  const cases = [];
  const specs = [
    { id: 'task8Off', names: [] },
    ...Object.entries(categories).map(([id, names]) => ({ id, names })),
    { id: 'task8All', names: directChildren },
  ];
  for (const spec of specs) {
    await setVisible(spec.names);
    const result = await page.evaluate(() => window.measureFrames(45, 15, true, false));
    cases.push({ id: spec.id, names: spec.names, result });
  }
  await setVisible(directChildren);

  const baseline = cases.find((entry) => entry.id === 'task8Off')?.result;
  const report = {
    environment:
      'GitHub Actions Chromium software WebGL. Task 8 child-category isolation at identical Medium 1920x1080, eight racers, far=900, bloom off.',
    sampleFrames: 45,
    warmupFrames: 15,
    errors,
    scene,
    directChildren,
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
    `${directory}/task8-category-matrix.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));

  if (
    errors.length ||
    scene.width !== 1920 ||
    scene.height !== 1080 ||
    scene.racers !== 8 ||
    scene.cameraFar !== 900 ||
    cases.some((entry) => entry.result.scoredFrames < 40)
  ) {
    throw new Error('Task 8 category diagnostic validity check failed');
  }

  await page.evaluate(() => window.game.dispose());
  await context.close();
} finally {
  await browser.close();
}
