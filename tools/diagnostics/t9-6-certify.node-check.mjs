import test from 'node:test';
import assert from 'node:assert/strict';
import { assessT96Capture } from './t9-6-certify.mjs';

const sha = '9b973d48c1115d4b35d3936a3eacbed8dbb7ed76';
function makeCapture(t = 16) {
  const samples = Array.from({ length: 600 }, () => ({
    rawFrameMs: t,
    counters: { drawCalls: 198, triangles: 165000, width: 1920, height: 1080,
      geometries: 50, textures: 25, pixelRatio: 1 },
  }));
  return {
    schemaVersion: 1,
    metadata: { sourceCommit: sha, quality: 'medium', racerCount: 8,
      scenario: 'neon-grid three-lap race; query=?testRacePerf=1',
      nominalViewport: { width: 1920, height: 1080 },
      hardwareDescription: 'Desktop RTX3060 Windows11 Chrome test rig',
      gpuRenderer: 'NVIDIA GeForce RTX 3060', userAgent: 'Mozilla/5.0 Chrome/130' },
    raceCompleted: true,
    policies: { warmupFrames: 120, percentileMethod: 'nearest-rank' },
    samples,
    summary: { scoredFrames: 600, truncated: false, medianFps: 1000 / t,
      p95FrameMs: t, maxFrameMs: t, maxDrawCalls: 198, maxTriangles: 165000,
      over50msFrames: 0, longestOver50msRun: 0 },
  };
}

test('ordinary representative capture is only a pass candidate (human attestation still needed)', () => {
  const r = assessT96Capture(makeCapture(), sha);
  assert.equal(r.status, 'PASS_CANDIDATE');
  assert.equal(r.metrics.scoredFrames, 600);
  assert.match(r.attestation, /independently verified/);
});
test('mismatched source/software renderer/incomplete lap cannot pass', () => {
  const x = makeCapture();
  x.metadata.sourceCommit = 'a'.repeat(40);
  x.metadata.gpuRenderer = 'Google SwiftShader';
  x.raceCompleted = false;
  const r = assessT96Capture(x, sha);
  assert.equal(r.status, 'FAIL');
  assert.ok(r.blockers.some(x => x.includes('Source commit')));
  assert.ok(r.blockers.some(x => x.includes('Software/headless')));
  assert.ok(r.blockers.some(x => x.includes('full race')));
});
test('checks actual framebuffer dimensions and not just nominal viewport', () => {
  const x = makeCapture();
  x.samples[0].counters.width = 1400;
  const r = assessT96Capture(x, sha);
  assert.equal(r.status, 'FAIL');
  assert.ok(r.blockers.some(x => x.includes('rendered buffer')));
});
test('owner-approved 500-call / 350k-triangle T9.6 engineering limits include the mobile peak', () => {
  const x = makeCapture();
  for (const frame of x.samples) {
    frame.counters.drawCalls = 206;
    frame.counters.triangles = 317908;
  }
  x.summary.maxDrawCalls = 206;
  x.summary.maxTriangles = 317908;
  const r = assessT96Capture(x, sha);
  assert.equal(r.status, 'PASS_CANDIDATE');
  assert.equal(r.metrics.drawCallsAbove200, 6); // historical comparison remains traceable
  assert.equal(r.metrics.drawCallsAboveTarget, 0);
  assert.equal(r.metrics.trianglesAboveTarget, 0);
  assert.deepEqual(r.metrics.engineeringLimits, { drawCalls: 500, triangles: 350000 });
});
test('engineering boundaries pass inclusively; excess still requires review', () => {
  const x = makeCapture();
  for (const frame of x.samples) {
    frame.counters.drawCalls = 500;
    frame.counters.triangles = 350000;
  }
  x.summary.maxDrawCalls = 500;
  x.summary.maxTriangles = 350000;
  assert.equal(assessT96Capture(x, sha).status, 'PASS_CANDIDATE');
  x.samples[0].counters.drawCalls = 501;
  x.summary.maxDrawCalls = 501;
  const calls = assessT96Capture(x, sha);
  assert.equal(calls.status, 'FAIL');
  assert.equal(calls.metrics.drawCallsAboveTarget, 1);
  assert.ok(calls.blockers.some(s => s.includes('PRD hard draw-call')));
  x.samples[0].counters.drawCalls = 500;
  x.summary.maxDrawCalls = 500;
  x.samples[0].counters.triangles = 350001;
  x.summary.maxTriangles = 350001;
  const triangles = assessT96Capture(x, sha);
  assert.equal(triangles.status, 'REVIEW_REQUIRED');
  assert.equal(triangles.metrics.trianglesAboveTarget, 1);
});
test('PRD hard draw and triangle ceilings still fail above their approved limits', () => {
  const x = makeCapture();
  x.samples[0].counters.drawCalls = 501;
  x.summary.maxDrawCalls = 501;
  const calls = assessT96Capture(x, sha);
  assert.equal(calls.status, 'FAIL');
  assert.ok(calls.blockers.some(s => s.includes('PRD hard draw-call')));
  x.samples[0].counters.drawCalls = 198;
  x.summary.maxDrawCalls = 198;
  x.samples[0].counters.triangles = 750001;
  x.summary.maxTriangles = 750001;
  const triangles = assessT96Capture(x, sha);
  assert.equal(triangles.status, 'FAIL');
  assert.ok(triangles.blockers.some(s => s.includes('PRD hard visible-triangle')));
});
test('consecutive stalls and unsupported summary cannot be averaged away', () => {
  const x = makeCapture();
  [70, 80, 90].forEach((ms, i) => { x.samples[12 + i].rawFrameMs = ms; });
  const r = assessT96Capture(x, sha);
  assert.equal(r.status, 'FAIL');
  assert.ok(r.blockers.some(x => x.includes('Sustained')));
  assert.ok(r.blockers.some(x => x.includes('inconsistent')));
});
test('rejects shortcut benchmark samples, missing hardware and wrong track labels', () => {
  const x = makeCapture();
  x.samples = x.samples.slice(0, 240);
  x.metadata.hardwareDescription = 'unknown';
  x.metadata.scenario = 'circuit-alpha three-lap race';
  assert.equal(assessT96Capture(x, sha).status, 'FAIL');
  assert.equal(assessT96Capture({}, sha).status, 'INCOMPLETE');
});
