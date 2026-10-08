import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';

const require = createRequire(process.env.NEON_GRID_COURSE_PLAYWRIGHT + '/package.json');
const { chromium } = require('playwright');
const directory = process.argv[2] ?? '/tmp/neon-grid-t9-5-render';
mkdirSync(directory, { recursive: true });

// Structural/readability CI only. Representative-hardware certification is T9.6.
// Owner-approved T9.5 full-course only: 200-call optimization TARGET, 220-call CI blocker.
const engineeringTargetCalls = 200;
const engineeringCeilings = { calls: 220, triangles: 300000 };
const prdCaps = { calls: 250, triangles: 750000 };
const captures = [
  { name: 'skyline-chase', progress: 0.063 },
  { name: 'billboard-sponsor-wall-early', progress: 0.052 },
  { name: 'billboard-sponsor-wall-mid', progress: 0.077 },
  { name: 'mobile-landscape-billboard-sponsors', progress: 0.075, width: 844, height: 390 },
  { name: 'mobile-portrait-billboard-sponsors-early', progress: 0.053, width: 390, height: 844 },
  { name: 'mobile-portrait-billboard-sponsors-mid', progress: 0.075, width: 390, height: 844 },
  { name: 'mobile-portrait-billboard-sponsors-near', progress: 0.094, width: 390, height: 844 },
  // Actual Billboard Gap entry spans 0.101–0.106, NOT former 0.22 capture.
  { name: 'billboard-approach-chase', progress: 0.092 },
  { name: 'billboard-mouth', progress: 0.103 },
  { name: 'billboard-rear', progress: 0.108, view: 'rear' },
  { name: 'undercity-pre-approach', progress: 0.234 },
  { name: 'undercity-approach-chase', progress: 0.239 },
  { name: 'undercity-entry', progress: 0.242 },
  // Service Tunnel entry spans 0.24655–0.25155, NOT former 0.355 capture.
  { name: 'undercity-service-tunnel', progress: 0.250, performance: true, scale: 1.5 },
  { name: 'undercity-exit', progress: 0.454 },
  { name: 'undercity-rear', progress: 0.254, view: 'rear' },
  { name: 'tunnel-forward-entry', progress: 0.25, tunnelFraction: 0.08 },
  { name: 'tunnel-forward-interior', progress: 0.35, tunnelFraction: 0.38 },
  { name: 'tunnel-reverse-interior', progress: 0.35, tunnelFraction: 0.66, view: 'rear' },
  { name: 'tunnel-forward-exit', progress: 0.45, tunnelFraction: 0.94 },
  { name: 'tunnel-mobile-landscape', progress: 0.35, tunnelFraction: 0.40, width: 844, height: 390 },
  { name: 'tunnel-mobile-portrait', progress: 0.35, tunnelFraction: 0.50, width: 390, height: 844 },
  { name: 'falls-climb', progress: 0.688 },
  // Waterfall Dive entry is 0.792717, NOT former 0.75 capture.
  { name: 'waterfall-dive-approach', progress: 0.786 },
  { name: 'waterfall-dive-mouth', progress: 0.794 },
  { name: 'falls-exit', progress: 0.865 },
  { name: 'waterfall-dive-rear', progress: 0.801, view: 'rear' },
  { name: 'mobile-landscape-billboard', progress: 0.102, width: 844, height: 390 },
  { name: 'mobile-landscape-undercity-approach', progress: 0.239, width: 844, height: 390 },
  { name: 'mobile-landscape-undercity', progress: 0.249, width: 844, height: 390 },
  { name: 'mobile-landscape-dive', progress: 0.792, width: 844, height: 390 },
  { name: 'mobile-portrait-undercity-approach', progress: 0.239, width: 390, height: 844 },
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
      page.on('pageerror', (error) => {
        const detail = station.name + ': ' + error.message;
        errors.push(detail);
        // Preserve startup exceptions even if the scene never sets ready.
        console.error('T9.5 scene initialization:', detail);
      });
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(station.name + ': ' + message.text());
      });
      const target = 'http://127.0.0.1:5173/manacondas-minigame-mayhem/tools/diagnostics/neon-grid-course.html' +
        '?quality=medium&sector=course&testRacePerf=1&progress=' + station.progress +
        (station.tunnelFraction === undefined ? '' : '&tunnelFraction=' + station.tunnelFraction);
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
      // Diagnose real rear-view peaks without relaxing the 200-call target or 220-call blocker.
      if (station.name === 'waterfall-dive-rear' || station.name === 'billboard-rear') {
        frame.ownerProfile = await page.evaluate((camera) => window.profileOwnerCalls(camera), view);
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
    engineeringTargetCalls, engineeringCeilings, prdCaps, errors, frames,
    drawCallsAboveTarget: Math.max(0, maximumDrawCalls - engineeringTargetCalls),
    maximumDrawCalls, maximumTriangles, performanceSummary,
  };
  writeFileSync(directory + '/t9-5-render-check.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    errors, count: frames.length, maximumDrawCalls, engineeringTargetCalls,
    drawCallsAboveTarget: Math.max(0, maximumDrawCalls - engineeringTargetCalls),
    maximumTriangles, scoredFrames: performanceSummary?.scoredFrames ?? null,
    ownerProfiles: frames.filter((f) => f.ownerProfile).map((f) => ({
      station: f.station, ...f.ownerProfile,
    })),
  }, null, 2));

  // A real rendered approach must load and present the APPROVED texture
  // on image-plane pixels, not merely declare four instances in a scene graph.
  // Check actual chase-camera projection and the closest opaque fascia depth.
  const sponsorStations = [
    'billboard-sponsor-wall-early', 'billboard-sponsor-wall-mid',
    'mobile-landscape-billboard-sponsors',
    'mobile-portrait-billboard-sponsors-early',
    'mobile-portrait-billboard-sponsors-mid',
    'mobile-portrait-billboard-sponsors-near',
  ];
  const sponsorEvidence = sponsorStations.flatMap((station) => {
    const result = frames.find((frame) => frame.station === station)?.sponsorArtworkSightline;
    if (!result || result.error || !Array.isArray(result.samples)) {
      throw new Error('T9.5 artwork scene inspection missing: ' + station);
    }
    if (result.samples.some((sample) => !sample.imageLoaded || (sample.inViewport && !sample.faceHit))) {
      throw new Error('T9.5 approved Billboard artwork not loaded/hittable: ' + station);
    }
    return result.samples.filter((sample) => sample.visibleArtwork).map((sample) => ({
      station, ...sample,
    }));
  });
  const visibleSponsors = new Set(sponsorEvidence.map((sample) => sample.name));
  const mobilePortraitVisible = sponsorEvidence.filter((sample) =>
    sample.station.startsWith('mobile-portrait-')).length;
  if (visibleSponsors.size !== 2 || sponsorEvidence.length < 3 ||
      mobilePortraitVisible < 1) {
    console.error('T9.5 sponsor image visibility evidence:', JSON.stringify(sponsorEvidence));
    throw new Error('T9.5 Billboard sponsors still invisible behind masking fascia');
  }
  report.sponsorArtworkEvidence = {
    visibleSponsors: [...visibleSponsors], visibleViews: sponsorEvidence.length,
    mobilePortraitVisible, evidence: sponsorEvidence,
  };
  writeFileSync(directory + '/t9-5-render-check.json', JSON.stringify(report, null, 2));

  // Gate the specific failure that the earlier decoration-count checks missed:
  // a driver approaching Billboard must not see most of the interior roadway.
  const approach = frames.find((frame) => frame.station === 'billboard-approach-chase')
    ?.actualCameraShortcutSightline;
  if (!approach || approach.viewportTargets < 2 || approach.blockedTargets < 2) {
    throw new Error('T9.5 Billboard approach reveals shortcut interior from real ChaseCamera');
  }
  const tunnelApproach = frames.find((frame) => frame.station === 'undercity-entry')
    ?.actualCameraShortcutSightline;
  // The legal mouth is intentionally visible and enterable. Instead of counting
  // it as exposed *interior*, test multiple real chase-camera approaches and
  // both mobile orientations against only genuinely hidden tunnel samples.
  const tunnelStations = [
    'undercity-pre-approach', 'undercity-approach-chase',
    'undercity-entry', 'mobile-landscape-undercity-approach',
    'mobile-portrait-undercity-approach',
  ];
  // These vantage points actually see one or more genuine interior road
  // targets. Require that evidence: a zero-visible-target run must not pass
  // merely because the whole tunnel happened to sit outside the camera.
  const requiredInteriorViews = new Set([
    'undercity-pre-approach', 'undercity-approach-chase',
    'mobile-landscape-undercity-approach',
  ]);
  for (const station of tunnelStations) {
    const sightline = frames.find((frame) => frame.station === station)
      ?.actualCameraShortcutSightline;
    if (!sightline || sightline.shortcut !== 'service-tunnel' ||
      sightline.interiorTargetsEvaluated < 4 ||
      sightline.interiorExposed !== 0 ||
      (requiredInteriorViews.has(station) && sightline.interiorTargetsInView < 1)) {
      console.error('T9.5 true tunnel interior LOS failure:', station,
        JSON.stringify(sightline));
      throw new Error('T9.5 Service Tunnel inner roadway is exposed from real ChaseCamera: ' + station);
    }
  }
  if (!tunnelApproach || tunnelApproach.viewportTargets < 3 ||
    tunnelApproach.entranceTargetsInView < 2) {
    throw new Error('T9.5 Service Tunnel true entrance is not visibly discoverable from real ChaseCamera');
  }
  for (const frame of frames.filter((f) => f.station.startsWith('tunnel-'))) {
    if (!frame.tunnelKartSightline || frame.tunnelKartSightline.rays.length !== 3 ||
        frame.tunnelKartSightline.blocked.length !== 0) {
      console.error('T9.5 tunnel camera occlusion:', frame.station, JSON.stringify(frame.tunnelKartSightline));
      throw new Error('T9.5 Service Tunnel camera/kart line of sight obstructed: ' + frame.station);
    }
  }
  if (errors.length || frames.length !== captures.length ||
    frames.some((f) => f.racers !== 8 || f.calls <= 0 || f.triangles <= 0 ||
      f.skyline.maskBillboards !== 8 || f.skyline.raisedBillboardPosts !== 4 ||
      f.skyline.facadeMountedBillboards !== 4 || f.skyline.manacondaAds !== 7 ||
      f.skyline.tacoBellAds !== 7 || f.undercity.serviceBays !== 14 ||
      f.fallsExtension.waterfalls !== 24 ||
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
