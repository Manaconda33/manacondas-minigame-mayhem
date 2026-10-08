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
test('the historical 206-call case requires review, not an invented T9.6 allowance', () => {
  const x = makeCapture();
  for (const f of x.samples) f.counters.drawCalls = 206;
  x.summary.maxDrawCalls = 206;
  const r = assessT96Capture(x, sha);
  assert.equal(r.status, 'REVIEW_REQUIRED');
  assert.equal(r.metrics.drawCallsAbove200, 6);
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
