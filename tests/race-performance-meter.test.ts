import { describe, expect, it } from 'vitest';
import { RacePerformanceMeter } from '../src/game/diagnostics/RacePerformanceMeter';
import {
  racePerformanceFromSearch,
  type RaceCaptureMetadata,
  type RaceFrameObservation,
} from '../src/game/diagnostics/raceDiagnostics';

const metadata: RaceCaptureMetadata = {
  schemaVersion: 1,
  sourceCommit: null,
  capturedAt: '2026-09-30T22:00:00Z',
  quality: 'medium',
  userAgent: 'test',
  hardwareDescription: null,
  scenario: 'unit',
  racerCount: 8,
  nominalViewport: { width: 1920, height: 1080 },
  gpuFrameMs: null,
  jsHeapBytes: null,
  estimatedTextureBytes: null,
};
const observation = (
  rawFrameMs: number,
  overrides: Partial<RaceFrameObservation> = {},
): RaceFrameObservation => ({
  rawFrameMs,
  phase: 'racing',
  paused: false,
  hidden: false,
  boundary: false,
  counters: null,
  ...overrides,
});
describe('whole-race meter', () => {
  it('enables only the exact flag', () => {
    for (const query of ['', '?testRacePerf=0', '?testRacePerf=true', '?testRacePerf=01'])
      expect(racePerformanceFromSearch(query)).toBe(false);
    expect(racePerformanceFromSearch('?other=1&testRacePerf=1')).toBe(true);
  });
  it('does not collect while disabled or disposed', () => {
    const meter = new RacePerformanceMeter(false, 0);
    meter.record(observation(250));
    expect(meter.snapshot().eligibleFrames).toBe(0);
    expect(meter.exportCapture(metadata).samples).toEqual([]);
    const enabled = new RacePerformanceMeter(true, 0);
    enabled.record(observation(10));
    enabled.dispose();
    enabled.record(observation(250));
    expect(enabled.snapshot().scoredFrames).toBe(0);
  });
  it('retains raw stalls and pins quantiles and median reciprocal FPS', () => {
    const meter = new RacePerformanceMeter(true, 0);
    [10, 20, 30, 100].forEach((ms) => {
      meter.record(observation(ms));
    });
    expect(meter.snapshot()).toMatchObject({
      scoredFrames: 4,
      durationMs: 160,
      medianFrameMs: 25,
      p95FrameMs: 100,
      maxFrameMs: 100,
      medianFps: (1000 / 20 + 1000 / 30) / 2,
      over50msFrames: 1,
    });
    meter.record(observation(250));
    expect(meter.exportCapture(metadata).samples.at(-1)?.rawFrameMs).toBe(250);
    expect(meter.snapshot().medianFrameMs).toBe(30);
  });
  it('rejects invalid/ineligible/boundary frames and warms only eligible frames once', () => {
    const meter = new RacePerformanceMeter(true, 2);
    [NaN, Infinity, 0, -1].forEach((ms) => {
      meter.record(observation(ms));
    });
    meter.record(observation(10, { phase: 'countdown' }));
    meter.record(observation(10, { paused: true }));
    meter.record(observation(10, { hidden: true }));
    meter.record(observation(10, { boundary: true }));
    meter.record(observation(10));
    meter.record(observation(20));
    meter.record(observation(30));
    meter.record(observation(10, { paused: true }));
    meter.record(observation(10, { boundary: true }));
    meter.record(observation(40));
    expect(meter.snapshot()).toMatchObject({
      eligibleFrames: 4,
      scoredFrames: 2,
      skippedFrames: 10,
      durationMs: 70,
    });
  });
  it('splits long-frame runs on boundaries without erasing previous samples', () => {
    const meter = new RacePerformanceMeter(true, 0);
    [60, 70, 10, 80].forEach((ms) => {
      meter.record(observation(ms));
    });
    expect(meter.snapshot()).toMatchObject({ over50msFrames: 3, longestOver50msRun: 2 });
    meter.record(observation(500, { boundary: true }));
    meter.record(observation(90));
    expect(meter.snapshot()).toMatchObject({
      scoredFrames: 5,
      over50msFrames: 4,
      longestOver50msRun: 2,
    });
  });
  it('bounds the original sample window explicitly and stops at authoritative finish', () => {
    const meter = new RacePerformanceMeter(true, 0, 2);
    [10, 20, 250].forEach((ms) => {
      meter.record(observation(ms));
    });
    meter.record(observation(10, { phase: 'finished' }));
    meter.record(observation(99));
    const capture = meter.exportCapture(metadata);
    expect(capture.samples.map((s) => s.rawFrameMs)).toEqual([10, 20]);
    expect(capture.summary.truncated).toBe(true);
    expect(capture.raceCompleted).toBe(true);
    expect(capture).not.toHaveProperty('pass');
    expect(capture.unavailableMetrics).toContain('gpuFrameMs');
  });
  it('exports independent metadata, summary and counter copies', () => {
    const meter = new RacePerformanceMeter(true, 0);
    const counters = {
      drawCalls: 12,
      triangles: 200,
      geometries: 5,
      textures: 9,
      width: 1920,
      height: 1080,
      pixelRatio: 1,
    };
    meter.record(observation(10, { counters }));
    counters.drawCalls = 999;
    const capture = meter.exportCapture(metadata);
    capture.metadata.nominalViewport.width = 1;
    capture.summary.maxDrawCalls = 999;
    if (capture.samples[0]?.counters) capture.samples[0].counters.drawCalls = 999;
    expect(meter.exportCapture(metadata).samples[0]?.counters?.drawCalls).toBe(12);
    expect(meter.snapshot().maxDrawCalls).toBe(12);
    expect(metadata.nominalViewport.width).toBe(1920);
  });
});
