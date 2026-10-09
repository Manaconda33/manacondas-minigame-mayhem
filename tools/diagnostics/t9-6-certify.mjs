import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const minimumFrames = 600;
// Owner-approved draw-call limit applies to the engineering target and PRD cap.
const engineeringDrawCalls = 500;
const engineeringTriangles = 350000;
const median = (sorted) => {
  const n = sorted.length;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
};
const closeTo = (actual, expected) =>
  typeof actual === 'number' && Number.isFinite(actual) && Math.abs(actual - expected) <= 0.025;

/** Independently checks the REAL race export. PASS_CANDIDATE still requires hardware attestation. */
export function assessT96Capture(capture, expectedSource) {
  const blockers = [];
  const review = [];
  const metrics = {};
  if (!capture || capture.schemaVersion !== 1 || !capture.metadata) {
    return { status: 'INCOMPLETE', blockers: ['Invalid/missing capture schema'], review, metrics };
  }
  const meta = capture.metadata;
  if (!/^[0-9a-f]{40}$/.test(expectedSource ?? ''))
    blockers.push('Expected source must be a full 40-character commit SHA');
  else if (meta.sourceCommit !== expectedSource)
    blockers.push('Source commit differs from immutable review build');
  if (meta.quality !== 'medium') blockers.push('Quality is not Medium');
  if (meta.racerCount !== 8) blockers.push('Racer count is not eight');
  if (!meta.scenario?.startsWith?.('neon-grid three-lap race;'))
    blockers.push('Scenario is not the actual Neon Grid three-lap race');
  if (meta.nominalViewport?.width !== 1920 || meta.nominalViewport?.height !== 1080)
    blockers.push('Nominal viewport is not 1920x1080');
  if (!capture.raceCompleted) blockers.push('The full race did not reach its finish');
  if (capture.policies?.warmupFrames < 120 || !Number.isInteger(capture.policies?.warmupFrames))
    blockers.push('Warm-up fewer than 120 eligible frames');
  if (capture.policies?.percentileMethod !== 'nearest-rank')
    blockers.push('Unsupported frame-time percentile policy');
  if (capture.summary?.truncated) blockers.push('Capture truncated');
  if (!Array.isArray(capture.samples) || capture.samples.length < minimumFrames)
    blockers.push('Fewer than 600 post-warm-up scored frames');
  if (typeof meta.hardwareDescription !== 'string' ||
      meta.hardwareDescription.trim().length < 12 ||
      /^(unknown|none|not given)$/i.test(meta.hardwareDescription.trim()))
    blockers.push('Hardware/OS/browser identification is missing');
  if (typeof meta.userAgent !== 'string' || !meta.userAgent.includes('Mozilla/'))
    blockers.push('Browser user agent missing');
  if (/swiftshader|llvmpipe|software renderer|headlesschrome/i.test(
    [meta.userAgent, meta.gpuRenderer, meta.hardwareDescription].join(' ')))
    blockers.push('Software/headless renderer is not representative hardware');
  if (typeof meta.gpuRenderer !== 'string' || meta.gpuRenderer.length < 3)
    review.push('WebGL renderer identity unavailable: independent verification required');
  if (!Array.isArray(capture.samples) || capture.samples.length === 0)
    return { status: 'INCOMPLETE', blockers, review, metrics };
  const timings = [];
  let maxCalls = 0, maxTriangles = 0, over50msFrames = 0;
  let consecutive = 0, longestOver50msRun = 0;
  for (const sample of capture.samples) {
    const t = sample?.rawFrameMs;
    if (!Number.isFinite(t) || t <= 0) {
      blockers.push('Nonfinite or nonpositive scored frame time');
      return { status: 'INCOMPLETE', blockers, review, metrics };
    }
    timings.push(t);
    if (t > 50) { over50msFrames++; consecutive++; }
    else consecutive = 0;
    longestOver50msRun = Math.max(longestOver50msRun, consecutive);
    const c = sample?.counters;
    if (!c || !Number.isFinite(c.drawCalls) || c.drawCalls < 1 ||
        !Number.isFinite(c.triangles) || c.triangles < 0)
      blockers.push('Missing valid per-frame WebGL scene counters');
    else {
      maxCalls = Math.max(maxCalls, c.drawCalls);
      maxTriangles = Math.max(maxTriangles, c.triangles);
      if (c.width < 1920 || c.height < 1080)
        blockers.push('Actual rendered buffer below 1920x1080');
    }
  }
  const sorted = timings.sort((a, b) => a - b);
  const fps = sorted.map(t => 1000 / t).sort((a, b) => a - b);
  const medianFps = median(fps), p95FrameMs = sorted[Math.ceil(sorted.length * 0.95) - 1];
  const maxFrameMs = sorted.at(-1);
  Object.assign(metrics, {
    scoredFrames: sorted.length, medianFps, p95FrameMs, maxFrameMs,
    maxDrawCalls: maxCalls, maxTriangles, over50msFrames, longestOver50msRun,
    drawCallsAbove200: Math.max(0, maxCalls - 200), // historical 200-call baseline, retained for comparison
    drawCallsAboveTarget: Math.max(0, maxCalls - engineeringDrawCalls),
    trianglesAboveTarget: Math.max(0, maxTriangles - engineeringTriangles),
    engineeringLimits: { drawCalls: engineeringDrawCalls, triangles: engineeringTriangles },
  });
  const s = capture.summary ?? {};
  if (s.scoredFrames !== sorted.length || !closeTo(s.medianFps, medianFps) ||
      !closeTo(s.p95FrameMs, p95FrameMs) || !closeTo(s.maxFrameMs, maxFrameMs) ||
      s.over50msFrames !== over50msFrames || s.longestOver50msRun !== longestOver50msRun ||
      s.maxDrawCalls !== maxCalls || s.maxTriangles !== maxTriangles)
    blockers.push('Export summary is inconsistent with the original scored frames');
  if (medianFps < 60) blockers.push('Median FPS below PRD 60');
  if (p95FrameMs > 18.3) blockers.push('p95 frame time above PRD 18.3 ms');
  if (longestOver50msRun >= 3) blockers.push('Sustained sequence of at least three >50ms frames');
  if (maxCalls > 500) blockers.push('PRD hard draw-call limit exceeded');
  if (maxTriangles > 750000) blockers.push('PRD hard visible-triangle limit exceeded');
  if (maxCalls > engineeringDrawCalls)
    review.push('T9.6 500-call owner-approved engineering target exceeded; owner disposition required');
  if (maxTriangles > engineeringTriangles)
    review.push('T9.6 350k-triangle owner-approved engineering limit exceeded; owner disposition required');
  return {
    status: blockers.length ? 'FAIL' : review.length ? 'REVIEW_REQUIRED' : 'PASS_CANDIDATE',
    blockers: [...new Set(blockers)], review, metrics, source: meta.sourceCommit,
    attestation: 'Machine/driver details and actual accelerated desktop hardware must be independently verified; this tool does not certify by itself.',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [path, sha, output] = process.argv.slice(2);
  if (!path || !sha) {
    console.error('Usage: node tools/diagnostics/t9-6-certify.mjs CAPTURE.json EXACT_40_CHARACTER_COMMIT [report.json]');
    process.exitCode = 2;
  } else {
    try {
      const result = assessT96Capture(JSON.parse(readFileSync(path, 'utf8')), sha);
      const content = JSON.stringify(result, null, 2) + '\n';
      if (output) writeFileSync(output, content);
      process.stdout.write(content);
      if (result.status === 'FAIL' || result.status === 'INCOMPLETE') process.exitCode = 1;
    } catch (error) {
      console.error(String(error));
      process.exitCode = 2;
    }
  }
}
