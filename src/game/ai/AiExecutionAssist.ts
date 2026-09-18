export const AI_EXECUTION_ASSIST = {
  deadZoneSeconds: 2,
  fullEffectSeconds: 5,
  openingDisabledThroughRaceRatio: 0.1,
  openingRampCompleteRaceRatio: 0.15,
  finalFadeStartRaceRatio: 0.8,
  finalZeroRaceRatio: 0.925,
  smoothingSeconds: 1.5,
  maximumPace: 1,
  targetLaps: 3,
} as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(value: number): number {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

export function executionAssistRaceEnvelope(raceCompletionRatio: number): number {
  const completion = clamp(raceCompletionRatio, 0, 1);
  const config = AI_EXECUTION_ASSIST;
  if (completion <= config.openingDisabledThroughRaceRatio) return 0;
  if (completion < config.openingRampCompleteRaceRatio) {
    return smoothstep(
      (completion - config.openingDisabledThroughRaceRatio) /
        (config.openingRampCompleteRaceRatio - config.openingDisabledThroughRaceRatio),
    );
  }
  if (completion <= config.finalFadeStartRaceRatio) return 1;
  if (completion >= config.finalZeroRaceRatio) return 0;
  return (
    1 -
    smoothstep(
      (completion - config.finalFadeStartRaceRatio) /
        (config.finalZeroRaceRatio - config.finalFadeStartRaceRatio),
    )
  );
}

export function executionAssistTargetPaceAdjustment(
  basePace: number,
  gapSeconds: number,
  raceCompletionRatio: number,
): number {
  if (!Number.isFinite(gapSeconds) || gapSeconds <= AI_EXECUTION_ASSIST.deadZoneSeconds) return 0;
  const boundedBase = clamp(basePace, 0, AI_EXECUTION_ASSIST.maximumPace);
  const gapAuthority = smoothstep(
    (gapSeconds - AI_EXECUTION_ASSIST.deadZoneSeconds) /
      (AI_EXECUTION_ASSIST.fullEffectSeconds - AI_EXECUTION_ASSIST.deadZoneSeconds),
  );
  const envelope = executionAssistRaceEnvelope(raceCompletionRatio);
  return (
    (AI_EXECUTION_ASSIST.maximumPace - boundedBase) *
    gapAuthority *
    envelope
  );
}

export function executionAssistGapSeconds(
  playerTotalProgress: number,
  aiTotalProgress: number,
  trackLengthMeters: number,
  referenceSpeedMetersPerSecond: number,
): number {
  if (
    !Number.isFinite(playerTotalProgress) ||
    !Number.isFinite(aiTotalProgress) ||
    !Number.isFinite(trackLengthMeters) ||
    !Number.isFinite(referenceSpeedMetersPerSecond) ||
    trackLengthMeters <= 0 ||
    referenceSpeedMetersPerSecond <= 0
  ) {
    return 0;
  }
  return (
    ((playerTotalProgress - aiTotalProgress) * trackLengthMeters) /
    referenceSpeedMetersPerSecond
  );
}

export function executionAssistRaceCompletion(playerTotalProgress: number): number {
  return clamp(playerTotalProgress / AI_EXECUTION_ASSIST.targetLaps, 0, 1);
}

export class AiExecutionAssist {
  private paceAdjustment = 0;

  public advance(
    basePace: number,
    gapSeconds: number,
    raceCompletionRatio: number,
    dt: number,
    active = true,
  ): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    const target = active
      ? executionAssistTargetPaceAdjustment(
          basePace,
          gapSeconds,
          raceCompletionRatio,
        )
      : 0;
    const lambda = 3 / AI_EXECUTION_ASSIST.smoothingSeconds;
    const alpha = 1 - Math.exp(-lambda * dt);
    this.paceAdjustment += (target - this.paceAdjustment) * alpha;
  }

  public adjustment(): number {
    return this.paceAdjustment;
  }

  public reset(): void {
    this.paceAdjustment = 0;
  }
}
