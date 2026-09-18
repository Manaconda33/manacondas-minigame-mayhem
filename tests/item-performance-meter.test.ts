import { describe, expect, it } from 'vitest';
import {
  ITEM_PERF_MAX_SAMPLES,
  ITEM_PERF_MIN_SAMPLES,
  ITEM_PERF_WARMUP_FRAMES,
  ITEM_VFX_CPU_BUDGET_MS,
  ItemPerformanceMeter,
} from '../src/game/items/ItemPerformanceMeter';
import { itemPerformanceFromSearch } from '../src/game/items/ItemTestMode';

function clock(values: readonly number[]): () => number {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

describe('Slice 5 item/VFX performance instrumentation', () => {
  it('is explicit opt-in only', () => {
    expect(itemPerformanceFromSearch('')).toBe(false);
    expect(itemPerformanceFromSearch('?testItemPerf=0')).toBe(false);
    expect(itemPerformanceFromSearch('?testItemPerf=true')).toBe(false);
    expect(itemPerformanceFromSearch('?testItemPerf=1')).toBe(true);
    expect(itemPerformanceFromSearch('?testItem=arc-blade&testItemPerf=1')).toBe(true);
  });

  it('accumulates simulation and VFX work into one rendered-frame sample', () => {
    const meter = new ItemPerformanceMeter(true, clock([1, 1.2, 2, 2.3]));
    meter.beginFrame(true);
    const simulation = meter.startSimulation();
    meter.stopSimulation(simulation);
    const vfx = meter.startVfx();
    meter.stopVfx(vfx);

    for (let frame = 0; frame < ITEM_PERF_WARMUP_FRAMES; frame += 1) {
      meter.endFrame();
      if (frame < ITEM_PERF_WARMUP_FRAMES - 1) meter.beginFrame(true);
    }

    meter.beginFrame(true);
    const sampleSimulation = meter.startSimulation();
    meter.stopSimulation(sampleSimulation);
    const sampleVfx = meter.startVfx();
    meter.stopVfx(sampleVfx);
    meter.endFrame();

    const snapshot = meter.snapshot();
    expect(snapshot.sampleCount).toBe(1);
    expect(snapshot.latestMs).toBeCloseTo(0.5);
    expect(snapshot.simulationMs).toBeCloseTo(0.2);
    expect(snapshot.vfxMs).toBeCloseTo(0.3);
  });

  it('uses p95 at the 1.00 ms budget and caps the rolling window', () => {
    let now = 0;
    const meter = new ItemPerformanceMeter(true, () => now);
    for (let frame = 0; frame < ITEM_PERF_WARMUP_FRAMES; frame += 1) {
      meter.beginFrame(true);
      meter.endFrame();
    }

    for (let sample = 0; sample < ITEM_PERF_MAX_SAMPLES + 25; sample += 1) {
      meter.beginFrame(true);
      const start = meter.startSimulation();
      now += sample % 20 === 0 ? 0.95 : 0.4;
      meter.stopSimulation(start);
      meter.endFrame();
    }

    const snapshot = meter.snapshot();
    expect(snapshot.sampleCount).toBe(ITEM_PERF_MAX_SAMPLES);
    expect(snapshot.p95Ms).toBeLessThanOrEqual(ITEM_VFX_CPU_BUDGET_MS);
    expect(snapshot.status).toBe('pass');
    expect(snapshot.maxMs).toBeCloseTo(0.95);
  });

  it('reports FAIL when sustained p95 exceeds the PRD budget', () => {
    let now = 0;
    const meter = new ItemPerformanceMeter(true, () => now);
    for (let frame = 0; frame < ITEM_PERF_WARMUP_FRAMES; frame += 1) {
      meter.beginFrame(true);
      meter.endFrame();
    }
    for (let sample = 0; sample < ITEM_PERF_MIN_SAMPLES; sample += 1) {
      meter.beginFrame(true);
      const start = meter.startSimulation();
      now += sample < ITEM_PERF_MIN_SAMPLES * 0.1 ? 1.25 : 0.5;
      meter.stopSimulation(start);
      meter.endFrame();
    }

    const snapshot = meter.snapshot();
    expect(snapshot.p95Ms).toBeCloseTo(1.25);
    expect(snapshot.status).toBe('fail');
    expect(meter.badge()).toContain('FAIL');
  });

  it('does not collect countdown, paused or finished-frame work', () => {
    let now = 0;
    const meter = new ItemPerformanceMeter(true, () => now);
    meter.beginFrame(false);
    const start = meter.startSimulation();
    now += 5;
    meter.stopSimulation(start);
    meter.endFrame();
    expect(meter.snapshot().warmupFramesRemaining).toBe(ITEM_PERF_WARMUP_FRAMES);
    expect(meter.snapshot().sampleCount).toBe(0);
  });
});
