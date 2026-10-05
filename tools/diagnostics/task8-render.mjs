import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.TASK8_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const output = process.argv[2] ?? '/tmp/task8-review';
mkdirSync(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.TASK8_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

const errors = [];
const consoleErrors = [];
const observe = (page) => {
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
};

try {
  const perfPage = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  observe(perfPage);
  await perfPage.goto(
    'http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/task8-falls-run.html?quality=medium',
  );
  await perfPage.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await perfPage.waitForLoadState('networkidle');
  await perfPage.waitForTimeout(1500);
  const before = await perfPage.evaluate(() => window.drawAt(0.755, 6));
  await perfPage.screenshot({ path: `${output}/medium-wide.png` });
  const dive = await perfPage.evaluate(() => window.drawAt(0.805, 8));
  await perfPage.screenshot({ path: `${output}/medium-dive.png` });
  const performance = await perfPage.evaluate(() => window.sampleSection());
  await perfPage.evaluate(() => window.game.dispose());
  await perfPage.close();

  const captures = [];
  for (const quality of ['low', 'medium', 'high']) {
    for (const viewport of [
      { width: 1280, height: 720, label: 'desktop' },
      { width: 390, height: 844, label: 'mobile' },
    ]) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });
      observe(page);
      await page.goto(
        `http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/task8-falls-run.html?quality=${quality}`,
      );
      await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
      await page.waitForLoadState('networkidle');
      const counters = await page.evaluate(() => window.drawAt(0.805, 9));
      await page.screenshot({ path: `${output}/${quality}-${viewport.label}.png` });
      captures.push({ quality, viewport: viewport.label, ...counters });
      await page.evaluate(() => window.game.dispose());
      await page.close();
    }
  }

  const report = {
    environment:
      'GitHub Actions Chromium software WebGL (SwiftShader); real KartTimeTrial Medium/eight-racer physics+AI+render RAF section run at 1920x1080 plus Low/Medium/High desktop/mobile rendered captures. This is real rendered-runtime evidence, not a claim about a named consumer GPU.',
    errors,
    consoleErrors,
    staticMedium: { wide: before, dive },
    performance,
    captures,
  };
  writeFileSync(`${output}/task8-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  const badCapture = captures.some(
    (capture) =>
      capture.racers !== 8 ||
      capture.calls > 250 ||
      !Number.isFinite(capture.triangles) ||
      capture.triangles > 750000,
  );
  if (errors.length || consoleErrors.length) throw new Error('Task 8 browser/render errors');
  if (performance.racers !== 8) throw new Error('Task 8 performance run did not contain 8 racers');
  if (performance.width !== 1920 || performance.height !== 1080)
    throw new Error(`Task 8 performance drawing buffer was ${performance.width}x${performance.height}`);
  if (performance.maxDrawCalls > 250 || badCapture)
    throw new Error('Task 8 exceeded PRD draw-call/triangle budget');
  if (performance.maxDrawCalls > 170)
    throw new Error('Task 8 exceeded the approved 170-call internal headroom ceiling');
  if (performance.p95FrameMs > 18.3)
    throw new Error(`Task 8 p95 ${performance.p95FrameMs.toFixed(2)} ms exceeds 18.3 ms`);
} finally {
  await browser.close();
}
