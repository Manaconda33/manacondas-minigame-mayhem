import { describe, expect, it } from 'vitest';
import {
  AI_SOFT_PACK_COMPRESSION,
  AiSoftPackCompression,
  softPackGapSeconds,
  softPackRaceCompletion,
  softPackRaceEnvelope,
  softPackTargetMultiplier,
} from '../src/game/ai/AiSoftPackCompression';

describe('AI Soft Pack compression', () => {
  it('locks the approved bounded configuration', () => {
    expect(AI_SOFT_PACK_COMPRESSION).toMatchObject({
      trailingMaximumMultiplier: 1.03,
      leadingMinimumMultiplier: 0.985,
      deadZoneSeconds: 1,
      fullEffectSeconds: 3,
      openingDisabledThroughRaceRatio: 0.1,
      finalFadeStartRaceRatio: 0.8,
      finalZeroRaceRatio: 0.925,
      smoothingSeconds: 1.25,
      targetLaps: 3,
    });
  });

  it('keeps a one-second dead zone and caps both directions', () => {
    expect(softPackTargetMultiplier(1, 0.5)).toBe(1);
    expect(softPackTargetMultiplier(-1, 0.5)).toBe(1);
    expect(softPackTargetMultiplier(3, 0.5)).toBeCloseTo(1.03, 8);
    expect(softPackTargetMultiplier(99, 0.5)).toBeCloseTo(1.03, 8);
    expect(softPackTargetMultiplier(-3, 0.5)).toBeCloseTo(0.985, 8);
    expect(softPackTargetMultiplier(-99, 0.5)).toBeCloseTo(0.985, 8);
  });

  it('disables the opening and fades completely before the final stretch', () => {
    expect(softPackRaceEnvelope(0.1)).toBe(0);
    expect(softPackTargetMultiplier(3, 0.1)).toBe(1);
    expect(softPackRaceEnvelope(0.15)).toBeCloseTo(1, 8);
    expect(softPackTargetMultiplier(3, 0.5)).toBeCloseTo(1.03, 8);
    expect(softPackRaceEnvelope(0.85)).toBeGreaterThan(0);
    expect(softPackRaceEnvelope(0.85)).toBeLessThan(1);
    expect(softPackRaceEnvelope(0.925)).toBe(0);
    expect(softPackTargetMultiplier(-3, 0.95)).toBe(1);
  });

  it('converts authoritative track progress into player-relative time gap', () => {
    expect(softPackGapSeconds(1.5, 1.4, 840, 28)).toBeCloseTo(3, 8);
    expect(softPackGapSeconds(1.4, 1.5, 840, 28)).toBeCloseTo(-3, 8);
    expect(softPackRaceCompletion(1.5)).toBeCloseTo(0.5, 8);
  });

  it('smooths toward the target instead of changing speed caps instantly', () => {
    const softPack = new AiSoftPackCompression();
    softPack.advance(3, 0.5, 1 / 60);
    expect(softPack.speedCapMultiplier()).toBeGreaterThan(1);
    expect(softPack.speedCapMultiplier()).toBeLessThan(1.03);

    for (let frame = 1; frame < 75; frame += 1) {
      softPack.advance(3, 0.5, 1 / 60);
    }
    expect(softPack.speedCapMultiplier()).toBeGreaterThan(1.028);

    for (let frame = 0; frame < 75; frame += 1) {
      softPack.advance(3, 0.95, 1 / 60);
    }
    expect(softPack.speedCapMultiplier()).toBeLessThan(1.002);
  });
});
