import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-t9-7-course-sweep';
mkdirSync(directory, { recursive: true });
const baseUrl = (process.env.NEON_GRID_COURSE_BASE_URL ??
  'http://127.0.0.1:5173/manacondas-minigame-mayhem').replace(/\/$/, '');
const visualVariant = process.env.NEON_GRID_VISUAL_VARIANT ?? 'approved';
const ownerViewsOnly = process.env.NEON_GRID_COURSE_OWNER_VIEWS_ONLY === '1';
const visualVariantQuery = ['abyss-fog-001', 'abyss-fog-002', 'abyss-fog-003'].includes(visualVariant)
  ? `&neonGridVisual=${visualVariant}`
  : '';
const maximumTriangleAiRoster = ['aa-03', 'aa-04', 'aa-05', 'aa-07', 'aa-10', 'aa-12', 'aa-14'];
const progressCheckpoints = [
  { seconds: 0, progress: 0 },
  { seconds: 35.55, progress: 0.075 },
  { seconds: 48.33, progress: 0.239 },
  { seconds: 67.30, progress: 0.31 },
  { seconds: 82.32, progress: 0.37 },
  { seconds: 98.50, progress: 0.43 },
  { seconds: 111.97, progress: 0.54 },
  { seconds: 132.02, progress: 0.63 },
  { seconds: 151.15, progress: 0.69 },
  { seconds: 163.15, progress: 0.72 },
];
const failureTimes = [
  '0:00.27', '0:17.68', '0:39.03', '0:44.35',
  '0:46.92', '0:54.38', '1:03.88', '1:09.68',
];
function timeSeconds(value) {
  const [minutes, seconds] = value.split(':');
  return Number(minutes) * 60 + Number(seconds);
}
function progressAt(seconds) {
  const upperIndex = progressCheckpoints.findIndex((checkpoint) => checkpoint.seconds >= seconds);
  if (upperIndex <= 0) return progressCheckpoints[0].progress;
  const lower = progressCheckpoints[upperIndex - 1];
  const upper = progressCheckpoints[upperIndex];
  const fraction = (seconds - lower.seconds) / (upper.seconds - lower.seconds);
  return lower.progress + (upper.progress - lower.progress) * fraction;
}
const ownerViews = failureTimes.map((raceTime) => {
  const seconds = timeSeconds(raceTime);
  return {
    name: `owner-failure-${raceTime.replace(':', 'm').replace('.', 'p')}`,
    raceTime,
    progress: progressAt(seconds),
    progressMapping: 'linear interpolation from the previous owner-view race-time/progress anchors; approximate, deterministic replay point',
  };
});
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
  await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?quality=medium&sector=course&testRacePerf=1&progress=0${visualVariantQuery}`);
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
  const sampleCount = ownerViewsOnly ? 0 : Math.ceil(courseLength / 8);
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
    await page.setViewportSize({ width: 844, height: 390 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.evaluate((p) => window.stageCourseAtProgress(p), owner.progress);
    const landscape = await page.evaluate(() => window.renderFrame(true, 'chase'));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.screenshot({
      path: `${directory}/${owner.name}-mobile-landscape.jpg`, type: 'jpeg', quality: 60,
    });
    const landscapeRear = await page.evaluate(() => window.renderFrame(true, 'rear'));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() =>
      requestAnimationFrame(resolve))));
    await page.screenshot({
      path: `${directory}/${owner.name}-mobile-landscape-rear.jpg`, type: 'jpeg', quality: 60,
    });
    owners.push({
      ...owner,
      progressMapping: owner.progressMapping,
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
      mobileLandscape: {
        calls: landscape.calls,
        triangles: landscape.triangles,
        width: landscape.width,
        height: landscape.height,
      },
      mobileLandscapeRear: {
        calls: landscapeRear.calls,
        triangles: landscapeRear.triangles,
        width: landscapeRear.width,
        height: landscapeRear.height,
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
      owner.mobileLandscape.calls,
      owner.mobileLandscapeRear.calls,
    ]),
  );
  const maximumTriangles = Math.max(
    ...sweep.flatMap((frame) => [frame.chase.triangles, frame.rear.triangles]),
    ...owners.flatMap((owner) => [
      owner.desktopChase.triangles,
      owner.desktopRear.triangles,
      owner.mobilePortrait.triangles,
      owner.mobilePortraitRear.triangles,
      owner.mobileLandscape.triangles,
      owner.mobileLandscapeRear.triangles,
    ]),
  );
  const report = {
    visualVariant: visualVariant === 'abyss-fog-001'
      ? 'fog-experiment'
      : visualVariant === 'abyss-fog-002'
        ? 'fog-experiment-v2'
        : visualVariant === 'abyss-fog-003'
          ? 'fog-experiment-v3'
          : 'approved',
    source: 'Actual KartTimeTrial Neon Grid course scene with eight racers and all visual owners mounted',
    environment: 'Local Chromium software WebGL / SwiftShader; diagnostic structural evidence only',
    courseLengthMeters: courseLength,
    maximumSampleSpacingMeters: ownerViewsOnly ? null : courseLength / sampleCount,
    courseSweepCompleted: !ownerViewsOnly,
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
