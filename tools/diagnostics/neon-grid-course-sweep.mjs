import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-t9-7-course-sweep';
mkdirSync(directory, { recursive: true });
const baseUrl = (process.env.NEON_GRID_COURSE_BASE_URL ??
  'http://127.0.0.1:5173/manacondas-minigame-mayhem').replace(/\/$/, '');
const maximumTriangleAiRoster = ['aa-03', 'aa-04', 'aa-05', 'aa-07', 'aa-10', 'aa-12', 'aa-14'];
const ownerViews = [
  { name: 'owner-0m35-start-billboards', raceTime: '0:35.55', progress: 0.075 },
  { name: 'owner-0m48-skyline-approach', raceTime: '0:48.33', progress: 0.239 },
  { name: 'owner-1m07-undercity-ground', raceTime: '1:07.30', progress: 0.31 },
  { name: 'owner-1m22-undercity-city', raceTime: '1:22.32', progress: 0.37 },
  { name: 'owner-1m38-tunnel-exit', raceTime: '1:38.50', progress: 0.43 },
  { name: 'owner-1m51-falls-approach', raceTime: '1:51.97', progress: 0.54 },
  { name: 'owner-2m12-falls-city', raceTime: '2:12.02', progress: 0.63 },
  { name: 'owner-2m31-falls-run', raceTime: '2:31.15', progress: 0.69 },
  { name: 'owner-2m43-waterfall-zone', raceTime: '2:43.15', progress: 0.72 },
];
const errors = [];
const sweep = [];
const owners = [];
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME || undefined,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
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
  await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?quality=medium&sector=course&testRacePerf=1&progress=0`);
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90000 });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(
    () => window.game?.opponents?.length === 7 &&
      window.game.opponents.every((opponent) => opponent.mesh.children[0]?.type === 'Group'),
    undefined,
    { timeout: 90000 },
  );
  const aiRoster = await page.evaluate(() =>
    window.game.opponents.map(({ characterId }) => characterId).sort());
  if (JSON.stringify(aiRoster) !== JSON.stringify(maximumTriangleAiRoster)) {
    throw new Error(`Full-course sweep used unexpected AI roster: ${aiRoster.join(', ')}`);
  }

  const courseLength = await page.evaluate(() => window.game.track.curve.getLength());
  const sampleCount = Math.ceil(courseLength / 8);
  for (let i = 0; i < sampleCount; i++) {
    const progress = i / sampleCount;
    await page.evaluate((p) => window.stageCourseAtProgress(p), progress);
    const chase = await page.evaluate(() => window.renderFrame(true, 'chase'));
    if (i % 4 === 0) {
      await page.screenshot({
        path: `${directory}/course-sweep-chase-${String(i).padStart(3, '0')}.jpg`,
        type: 'jpeg',
        quality: 45,
      });
    }
    const rear = await page.evaluate(() => window.renderFrame(true, 'rear'));
    sweep.push({
      index: i,
      progress,
      distanceMeters: progress * courseLength,
      chase: { calls: chase.calls, triangles: chase.triangles },
      rear: { calls: rear.calls, triangles: rear.triangles },
      city: {
        skylineTowers: chase.skyline?.windows ?? 0,
        undercityBuildings: chase.undercity?.buildings ?? 0,
        fallsExtensionTowers: chase.fallsExtension?.towers ?? 0,
      },
    });
    if (i % 16 === 0) {
      await page.screenshot({
        path: `${directory}/course-sweep-rear-${String(i).padStart(3, '0')}.jpg`,
        type: 'jpeg',
        quality: 45,
      });
    }
  }

  for (const owner of ownerViews) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.evaluate((p) => window.stageCourseAtProgress(p), owner.progress);
    const desktop = await page.evaluate(() => window.renderFrame(true, 'chase'));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.screenshot({ path: `${directory}/${owner.name}-desktop-chase.jpg`, type: 'jpeg', quality: 60 });
    const rear = await page.evaluate(() => window.renderFrame(true, 'rear'));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.screenshot({ path: `${directory}/${owner.name}-desktop-rear.jpg`, type: 'jpeg', quality: 60 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.evaluate((p) => window.stageCourseAtProgress(p), owner.progress);
    const mobile = await page.evaluate(() => window.renderFrame(true, 'chase'));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.screenshot({ path: `${directory}/${owner.name}-mobile-portrait.jpg`, type: 'jpeg', quality: 60 });
    const mobileRear = await page.evaluate(() => window.renderFrame(true, 'rear'));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.screenshot({
      path: `${directory}/${owner.name}-mobile-portrait-rear.jpg`, type: 'jpeg', quality: 60,
    });
    owners.push({
      ...owner,
      progressMapping: 'approximate visual anchor derived from the reported minimap view',
      desktopChase: { calls: desktop.calls, triangles: desktop.triangles },
      desktopRear: { calls: rear.calls, triangles: rear.triangles },
      mobilePortrait: {
        calls: mobile.calls, triangles: mobile.triangles, width: mobile.width, height: mobile.height,
      },
      mobilePortraitRear: {
        calls: mobileRear.calls,
        triangles: mobileRear.triangles,
        width: mobileRear.width,
        height: mobileRear.height,
      },
    });
  }

  const maximumCalls = Math.max(
    ...sweep.flatMap((frame) => [frame.chase.calls, frame.rear.calls]),
    ...owners.flatMap((owner) => [
      owner.desktopChase.calls,
      owner.desktopRear.calls,
      owner.mobilePortrait.calls,
      owner.mobilePortraitRear.calls,
    ]),
  );
  const maximumTriangles = Math.max(
    ...sweep.flatMap((frame) => [frame.chase.triangles, frame.rear.triangles]),
    ...owners.flatMap((owner) => [
      owner.desktopChase.triangles,
      owner.desktopRear.triangles,
      owner.mobilePortrait.triangles,
      owner.mobilePortraitRear.triangles,
    ]),
  );
  const report = {
    source: 'Actual KartTimeTrial Neon Grid course scene with eight racers and all visual owners mounted',
    environment: 'Local Chromium software WebGL / SwiftShader; diagnostic structural evidence only',
    courseLengthMeters: courseLength,
    maximumSampleSpacingMeters: courseLength / sampleCount,
    sampleCount,
    cameraSweep: ['chase', 'rear'],
    ownerViews,
    ownerViewCaptures: owners,
    sweep,
    errors,
    engineeringCeilings: { calls: 500, triangles: 425000 },
    maximumCalls,
    maximumTriangles,
  };
  writeFileSync(`${directory}/course-sweep-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    errors,
    courseLengthMeters: courseLength,
    maximumSampleSpacingMeters: report.maximumSampleSpacingMeters,
    sampleCount,
    ownerViews: owners.length,
    maximumCalls,
    maximumTriangles,
  }, null, 2));
  await page.evaluate(() => window.game.dispose());
  await context.close();
  if (errors.length) throw new Error(`Course sweep captured ${errors.length} browser/render errors`);
  if (maximumCalls > 500 || maximumTriangles > 425000) {
    throw new Error(`Course sweep exceeded Task 9 ceilings: ${maximumCalls} calls, ${maximumTriangles} triangles`);
  }
} finally {
  await browser.close();
}
