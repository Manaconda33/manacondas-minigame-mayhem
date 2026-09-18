import { describe, expect, it } from 'vitest';
import {
  AI_EXECUTION_ASSIST,
  AiExecutionAssist,
  executionAssistRaceEnvelope,
  executionAssistTargetPaceAdjustment,
} from '../src/game/ai/AiExecutionAssist';

describe('AI execution assist', () => {
  it('locks the bounded trailing-only configuration', () => {
    expect(AI_EXECUTION_ASSIST).toMatchObject({
      deadZoneSeconds: 2,
      fullEffectSeconds: 5,
      openingDisabledThroughRaceRatio: 0.1,
      openingRampCompleteRaceRatio: 0.15,
      finalFadeStartRaceRatio: 0.8,
      finalZeroRaceRatio: 0.925,
      smoothingSeconds: 1.5,
      maximumPace: 1,
      targetLaps: 3,
    });
  });

  it('does nothing in close racing or when the AI is ahead', () => {
    expect(executionAssistTargetPaceAdjustment(0.28, 2, 0.5)).toBe(0);
    expect(executionAssistTargetPaceAdjustment(0.28, -8, 0.5)).toBe(0);
  });

  it('can only recover the existing AI pace handicap, never exceed pace 1', () => {
    expect(executionAssistTargetPaceAdjustment(0.28, 5, 0.5)).toBeCloseTo(0.72, 8);
    expect(executionAssistTargetPaceAdjustment(0.82, 5, 0.5)).toBeCloseTo(0.18, 8);
    expect(executionAssistTargetPaceAdjustment(1, 50, 0.5)).toBe(0);
  });

  it('protects the opening and final race outcome', () => {
    expect(executionAssistRaceEnvelope(0.1)).toBe(0);
    expect(executionAssistRaceEnvelope(0.15)).toBeCloseTo(1, 8);
    expect(executionAssistRaceEnvelope(0.8)).toBe(1);
    expect(executionAssistRaceEnvelope(0.925)).toBe(0);
    expect(executionAssistTargetPaceAdjustment(0.28, 8, 0.95)).toBe(0);
  });

  it('smooths rather than snapping AI decision quality', () => {
    const assist = new AiExecutionAssist();
    assist.advance(0.28, 8, 0.5, 1 / 60);
    expect(assist.adjustment()).toBeGreaterThan(0);
    expect(assist.adjustment()).toBeLessThan(0.72);

    for (let frame = 1; frame < 90; frame += 1) {
      assist.advance(0.28, 8, 0.5, 1 / 60);
    }
    expect(assist.adjustment()).toBeGreaterThan(0.68);
    expect(assist.adjustment()).toBeLessThanOrEqual(0.72);
  });
});
