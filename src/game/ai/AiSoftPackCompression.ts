export const AI_SOFT_PACK_COMPRESSION = {
  trailingMaximumMultiplier: 1.03,
  leadingMinimumMultiplier: 0.985,
  deadZoneSeconds: 1,
  fullEffectSeconds: 3,
  openingDisabledThroughRaceRatio: 0.1,
  openingRampCompleteRaceRatio: 0.15,
  finalFadeStartRaceRatio: 0.8,
  finalZeroRaceRatio: 0.925,
  smoothingSeconds: 1.25,
  targetLaps: 3,
} as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(value: number): number {
  const bounded = clamp(value, 0, 1);
  return bounded * bounded * (3 - 2 * bounded);
}

export function softPackRaceEnvelope(raceCompletionRatio: number): number {
  const completion = clamp(raceCompletionRatio, 0, 1);
  const config = AI_SOFT_PACK_COMPRESSION;

  if (completion <= config.openingDisabledThroughRaceRatio) return 0;
  if (completion < config.openingRampCompleteRaceRatio) {
    return smoothstep(
      (completion - config.openingDisabledThroughRaceRatio) /
        (config.openingRampCompleteRaceRatio - config.openingDisabledThroughRaceRatio),
    );
  }
  if (completion <= config.finalFadeStartRaceRatio) return 1;
  if (completion >= config.finalZeroRaceRatio) return 0;

  return 1 - smoothstep(
    (completion - config.finalFadeStartRaceRatio) /
      (config.finalZeroRaceRatio - config.finalFadeStartRaceRatio),
  );
}

/**
 * Positive gap means the AI is behind the human player. Negative means ahead.
 * This function returns only the bounded race-spacing multiplier. It never
 * changes acceleration, steering, handling, traction, item odds, or stat cards.
 */
export function softPackTargetMultiplier(
  gapSeconds: number,
  raceCompletionRatio: number,
): number {
  if (!Number.isFinite(gapSeconds)) return 1;

  const config = AI_SOFT_PACK_COMPRESSION;
  const magnitude = Math.abs(gapSeconds);
  if (magnitude <= config.deadZoneSeconds) return 1;

  const normalizedGap = smoothstep(
    (magnitude - config.deadZoneSeconds) /
      (config.fullEffectSeconds - config.deadZoneSeconds),
  );
  const raw =
    gapSeconds > 0
      ? 1 + (config.trailingMaximumMultiplier - 1) * normalizedGap
      : 1 - (1 - config.leadingMinimumMultiplier) * normalizedGap;
  const envelope = softPackRaceEnvelope(raceCompletionRatio);

  return 1 + (raw - 1) * envelope;
}

export function softPackGapSeconds(
  playerTotalProgress: number,
  aiTotalProgress: number,
  trackLengthMeters: number,
  aiCharacterMaxSpeed: number,
): number {
  if (
    !Number.isFinite(playerTotalProgress) ||
    !Number.isFinite(aiTotalProgress) ||
    !Number.isFinite(trackLengthMeters) ||
    !Number.isFinite(aiCharacterMaxSpeed) ||
    trackLengthMeters <= 0 ||
    aiCharacterMaxSpeed <= 0
  ) {
    return 0;
  }

  return (
    ((playerTotalProgress - aiTotalProgress) * trackLengthMeters) /
    aiCharacterMaxSpeed
  );
}

export function softPackRaceCompletion(playerTotalProgress: number): number {
  return clamp(
    playerTotalProgress / AI_SOFT_PACK_COMPRESSION.targetLaps,
    0,
    1,
  );
}

export class AiSoftPackCompression {
  private multiplier = 1;

  public advance(
    gapSeconds: number,
    raceCompletionRatio: number,
    dt: number,
    active = true,
  ): void {
    if (!Number.isFinite(dt) || dt <= 0) return;

    const target = active
      ? softPackTargetMultiplier(gapSeconds, raceCompletionRatio)
      : 1;
    // Exponential response reaches ~95% of a new target in smoothingSeconds.
    const lambda = 3 / AI_SOFT_PACK_COMPRESSION.smoothingSeconds;
    const alpha = 1 - Math.exp(-lambda * dt);
    this.multiplier += (target - this.multiplier) * alpha;
  }

  public speedCapMultiplier(): number {
    return this.multiplier;
  }

  public reset(): void {
    this.multiplier = 1;
  }
}
