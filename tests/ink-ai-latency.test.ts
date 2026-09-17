import { describe, expect, it } from 'vitest';
import { AiDriver } from '../src/game/ai/AiDriver';
import type { InkAiImpairmentSnapshot } from '../src/game/items/InkSplatSystem';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

describe('Ink AI reaction latency', () => {
  it('uses the newest steering decision at or before the governed 160 ms cutoff', () => {
    const track = new CircuitAlpha();
    const position = track.samples[80]?.clone();
    const tangent = track.tangents[80]?.clone();
    if (position === undefined || tangent === undefined) throw new Error('Missing test sample');

    const profile = { laneOffset: 0, pace: 0.6, aggression: 0.5 } as const;
    const delayedDriver = new AiDriver(track, profile, 30);
    const immediateDriver = new AiDriver(track, profile, 30);
    const delayed: number[] = [];
    const immediate: number[] = [];

    for (let index = 0; index <= 20; index += 1) {
      const base: InkAiImpairmentSnapshot = {
        remainingSeconds: 2.5,
        noiseAmplitudeMeters: 0.95,
        noisePhaseRadians: -Math.PI / 2 + index * (Math.PI / 5),
        reactionLatencySeconds: 0.16,
        steeringPrecisionMultiplier: 0.74,
      };
      delayed.push(
        delayedDriver.input(position, tangent, 15, 0, [], 1 / 60, [], 'ai-delayed', base)
          .steering,
      );
      immediate.push(
        immediateDriver.input(position, tangent, 15, 0, [], 1 / 60, [], 'ai-immediate', {
          ...base,
          reactionLatencySeconds: 0,
        }).steering,
      );
    }

    // At the 21st 60 Hz decision, now is about 333.3 ms and the governed
    // cutoff is about 173.3 ms, so the newest eligible sample is frame 10
    // (166.7 ms), not the oldest retained sample from frame 2.
    expect(delayed[20]).toBeCloseTo(immediate[10] ?? Number.NaN, 8);
    expect(Math.abs((delayed[20] ?? 0) - (immediate[0] ?? 0))).toBeGreaterThan(0.001);
  });
});
