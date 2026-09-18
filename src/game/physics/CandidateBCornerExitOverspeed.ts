import * as THREE from 'three';
import type { DriverStats } from '../../config/kartTuning';
import type { CircuitAlpha, TrackProjection } from '../track/CircuitAlpha';

export const BALANCE_CANDIDATE_B_CORNER_EXIT = {
  curvatureHalfWindowSamples: 4,
  minimumPeakDegrees: 6,
  minimumProminenceDegrees: 1,
  prominenceRadiusSamples: 6,
  releaseRatio: 0.8,
  maximumReleaseSearchSamples: 16,
  minimumReleaseSpacingSeconds: 1.5,
  durationSeconds: 1.5,
  speedCapBonus: 0.12,
  maximumTriggerSpeedRatio: 1.01,
} as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function circularIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

export function candidateBCornerExitEligibility(stats: DriverStats): number {
  const lowSpeedTradeoff = clamp(6 - stats.speed, 0, 1);
  const specialistStrength = clamp(
    0.5 * Math.max(0, stats.acceleration - 7) +
      0.5 * Math.max(0, stats.handling - 6),
    0,
    1,
  );
  return lowSpeedTradeoff * specialistStrength;
}

export function candidateBCornerExitSpeedCapMultiplier(stats: DriverStats): number {
  return (
    1 +
    BALANCE_CANDIDATE_B_CORNER_EXIT.speedCapBonus *
      candidateBCornerExitEligibility(stats)
  );
}

export function candidateBCornerExitCurvatureDegrees(
  track: CircuitAlpha,
  index: number,
): number {
  const count = track.sampleCount;
  const halfWindow = BALANCE_CANDIDATE_B_CORNER_EXIT.curvatureHalfWindowSamples;
  const before = track.tangents[circularIndex(index - halfWindow, count)];
  const after = track.tangents[circularIndex(index + halfWindow, count)];
  if (before === undefined || after === undefined) return 0;
  return THREE.MathUtils.radToDeg(
    Math.acos(THREE.MathUtils.clamp(before.dot(after), -1, 1)),
  );
}

export function candidateBCornerExitReleaseIndices(
  track: CircuitAlpha,
): readonly number[] {
  const count = track.sampleCount;
  const curvature = Array.from({ length: count }, (_, index) =>
    candidateBCornerExitCurvatureDegrees(track, index),
  );
  const releaseIndices = new Set<number>();

  for (let index = 0; index < count; index += 1) {
    const peak = curvature[index] ?? 0;
    const previous = curvature[circularIndex(index - 1, count)] ?? peak;
    const next = curvature[circularIndex(index + 1, count)] ?? peak;
    if (
      peak < BALANCE_CANDIDATE_B_CORNER_EXIT.minimumPeakDegrees ||
      peak <= previous ||
      peak < next
    ) {
      continue;
    }

    const left: number[] = [];
    const right: number[] = [];
    for (
      let offset = 1;
      offset <= BALANCE_CANDIDATE_B_CORNER_EXIT.prominenceRadiusSamples;
      offset += 1
    ) {
      left.push(curvature[circularIndex(index - offset, count)] ?? peak);
      right.push(curvature[circularIndex(index + offset, count)] ?? peak);
    }

    const prominence =
      peak - Math.max(Math.min(...left), Math.min(...right));
    if (prominence < BALANCE_CANDIDATE_B_CORNER_EXIT.minimumProminenceDegrees) {
      continue;
    }

    const releaseThreshold =
      peak * BALANCE_CANDIDATE_B_CORNER_EXIT.releaseRatio;
    for (
      let offset = 1;
      offset <= BALANCE_CANDIDATE_B_CORNER_EXIT.maximumReleaseSearchSamples;
      offset += 1
    ) {
      const releaseIndex = circularIndex(index + offset, count);
      if ((curvature[releaseIndex] ?? peak) > releaseThreshold) continue;
      const releasePoint = track.samples[releaseIndex];
      if (
        releasePoint !== undefined &&
        track.project(releasePoint).surface === 'asphalt'
      ) {
        releaseIndices.add(releaseIndex);
      }
      break;
    }
  }

  return [...releaseIndices].sort((first, second) => first - second);
}

function crossesReleaseIndex(
  previousIndex: number,
  currentIndex: number,
  releaseIndex: number,
  count: number,
): boolean {
  const forwardDelta = circularIndex(currentIndex - previousIndex, count);
  if (forwardDelta <= 0 || forwardDelta >= count / 2) return false;
  const releaseDelta = circularIndex(releaseIndex - previousIndex, count);
  return releaseDelta > 0 && releaseDelta <= forwardDelta;
}

export class CandidateBCornerExitOverspeed {
  private readonly eligibility: number;
  private readonly releaseIndices: readonly number[];
  private previousIndex: number | null = null;
  private activeRemainingSeconds = 0;
  private spacingRemainingSeconds = 0;
  private activations = 0;

  public constructor(
    private readonly track: CircuitAlpha,
    private readonly stats: DriverStats,
  ) {
    this.eligibility = candidateBCornerExitEligibility(stats);
    this.releaseIndices = candidateBCornerExitReleaseIndices(track);
  }

  public advance(
    projection: TrackProjection,
    speedRatio: number,
    dt: number,
    finished = false,
  ): void {
    if (!Number.isFinite(dt) || dt <= 0) return;

    this.activeRemainingSeconds = Math.max(
      0,
      this.activeRemainingSeconds - dt,
    );
    this.spacingRemainingSeconds = Math.max(
      0,
      this.spacingRemainingSeconds - dt,
    );

    const currentIndex = projection.index;
    if (this.previousIndex === null) {
      this.previousIndex = currentIndex;
      return;
    }

    if (finished || this.eligibility <= 0) {
      this.activeRemainingSeconds = 0;
      this.previousIndex = currentIndex;
      return;
    }

    const canTrigger =
      this.spacingRemainingSeconds <= 0 &&
      projection.surface === 'asphalt' &&
      Number.isFinite(speedRatio) &&
      speedRatio <= BALANCE_CANDIDATE_B_CORNER_EXIT.maximumTriggerSpeedRatio;

    if (
      canTrigger &&
      this.releaseIndices.some((releaseIndex) =>
        crossesReleaseIndex(
          this.previousIndex ?? currentIndex,
          currentIndex,
          releaseIndex,
          this.track.sampleCount,
        ),
      )
    ) {
      this.activeRemainingSeconds =
        BALANCE_CANDIDATE_B_CORNER_EXIT.durationSeconds;
      this.spacingRemainingSeconds =
        BALANCE_CANDIDATE_B_CORNER_EXIT.minimumReleaseSpacingSeconds;
      this.activations += 1;
    }

    this.previousIndex = currentIndex;
  }

  public speedCapMultiplier(): number {
    return this.activeRemainingSeconds > 0
      ? candidateBCornerExitSpeedCapMultiplier(this.stats)
      : 1;
  }

  public remainingSeconds(): number {
    return this.activeRemainingSeconds;
  }

  public activationCount(): number {
    return this.activations;
  }

  public reset(trackIndex?: number): void {
    this.previousIndex =
      trackIndex === undefined ? null : circularIndex(trackIndex, this.track.sampleCount);
    this.activeRemainingSeconds = 0;
    this.spacingRemainingSeconds = 0;
    this.activations = 0;
  }
}
