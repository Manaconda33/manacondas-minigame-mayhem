export type SurfaceType = 'asphalt' | 'dirt' | 'grass' | 'boost' | 'ramp';

export interface DriverStats {
  speed: number;
  acceleration: number;
  weight: number;
  handling: number;
  miniTurbo: number;
  traction: number;
}

export interface KartTuning {
  maxSpeed: number;
  acceleration: number;
  mass: number;
  steeringRate: number;
  lateralGrip: number;
  reverseSpeed: number;
}

export type DriftTierName = 'none' | 'blue' | 'orange' | 'purple';

export interface DriftThresholds {
  blue: number;
  orange: number;
  purple: number;
}

export interface DriftBoostProfile {
  duration: number;
  speedMultiplier: number;
}

export const sliceOneDriver: DriverStats = {
  speed: 7,
  acceleration: 7,
  weight: 6,
  handling: 7,
  miniTurbo: 4,
  traction: 5,
};

/**
 * Experimental Balance Candidate B keeps the approved Speed ceiling and
 * Mini-Turbo/Traction curves intact. Acceleration and Handling instead govern
 * how quickly a kart rebuilds speed and how much speed it can carry while
 * demanding lateral control. The neutral stat-6 kart preserves its existing
 * launch value so the experiment pivots around the current baseline.
 */
export const BALANCE_CANDIDATE_B = {
  neutralStat: 6,
  neutralAcceleration: 7.3,
  accelerationExponentPerPoint: 0.16,
  recoveryThresholdRatio: 0.9,
  recoveryExponentPerPoint: 0.16,
  recoveryMinimum: 0.55,
  recoveryMaximum: 1.6,
  steeringResponseNeutral: 10,
  steeringResponsePerPoint: 1.5,
  steeringResponseMinimum: 4.5,
  steeringResponseMaximum: 15.5,
  handlingComfortSpeedBase: 22.5,
  handlingComfortSpeedPerPoint: 1.35,
  handlingExcessSpeedScale: 6,
  handlingCornerLossPerSecond: 0.5,
  handlingCornerLossMaximumPressure: 1.25,
  aiCornerPenaltyPerHandlingPoint: 0.13,
  aiCornerPenaltyMinimum: 0.5,
  aiCornerPenaltyMaximum: 1.5,
} as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function candidateBAccelerationRecoveryMultiplier(
  acceleration: number,
  speedRatio: number,
): number {
  const threshold = BALANCE_CANDIDATE_B.recoveryThresholdRatio;
  const deficit = clamp((threshold - speedRatio) / threshold, 0, 1);
  return clamp(
    Math.exp(
      BALANCE_CANDIDATE_B.recoveryExponentPerPoint *
        (acceleration - BALANCE_CANDIDATE_B.neutralStat) *
        deficit,
    ),
    BALANCE_CANDIDATE_B.recoveryMinimum,
    BALANCE_CANDIDATE_B.recoveryMaximum,
  );
}

export function candidateBSteeringResponseRate(handling: number): number {
  return clamp(
    BALANCE_CANDIDATE_B.steeringResponseNeutral +
      BALANCE_CANDIDATE_B.steeringResponsePerPoint *
        (handling - BALANCE_CANDIDATE_B.neutralStat),
    BALANCE_CANDIDATE_B.steeringResponseMinimum,
    BALANCE_CANDIDATE_B.steeringResponseMaximum,
  );
}

export function candidateBHandlingComfortSpeed(handling: number): number {
  return (
    BALANCE_CANDIDATE_B.handlingComfortSpeedBase +
    BALANCE_CANDIDATE_B.handlingComfortSpeedPerPoint * handling
  );
}

/**
 * Returns the exponential forward-speed loss rate for a steering demand.
 * A kart never loses its Speed-defined straight-line ceiling. Instead Handling
 * defines a comfort speed for lateral demand. Driving above that comfort speed
 * creates nonlinear corner loss, so low Handling costs more on a Speed-10 kart
 * than on an otherwise identical slower kart.
 */
export function candidateBHandlingCornerLossRate(
  handling: number,
  speedMetersPerSecond: number,
  steeringInput: number,
): number {
  const excessSpeed = Math.max(
    0,
    Math.abs(speedMetersPerSecond) - candidateBHandlingComfortSpeed(handling),
  );
  const speedPressure = clamp(
    excessSpeed / BALANCE_CANDIDATE_B.handlingExcessSpeedScale,
    0,
    BALANCE_CANDIDATE_B.handlingCornerLossMaximumPressure,
  );
  const turnLoad = clamp(Math.abs(steeringInput), 0, 1);
  return (
    BALANCE_CANDIDATE_B.handlingCornerLossPerSecond *
    turnLoad *
    turnLoad *
    speedPressure *
    speedPressure
  );
}

/**
 * Mirrors Candidate B's Handling authority in AI planning. It changes only the
 * corner penalty; corner=0 still returns the full Speed-defined maximum.
 */
export function candidateBAiCornerPenaltyScale(handling: number): number {
  return clamp(
    1 -
      BALANCE_CANDIDATE_B.aiCornerPenaltyPerHandlingPoint *
        (handling - BALANCE_CANDIDATE_B.neutralStat),
    BALANCE_CANDIDATE_B.aiCornerPenaltyMinimum,
    BALANCE_CANDIDATE_B.aiCornerPenaltyMaximum,
  );
}

export function createKartTuning(stats: DriverStats): KartTuning {
  const normalized = (value: number): number => (value - 1) / 9;
  const prdLaunchAcceleration = 4 + 0.55 * stats.acceleration;
  const specializedAcceleration =
    BALANCE_CANDIDATE_B.neutralAcceleration *
    Math.exp(
      BALANCE_CANDIDATE_B.accelerationExponentPerPoint *
        (stats.acceleration - BALANCE_CANDIDATE_B.neutralStat),
    );

  return {
    // Candidate B deliberately preserves the approved 23-33 m/s Speed range.
    maxSpeed: 23 + normalized(stats.speed) * 10,
    // Never weaken the approved PRD launch curve. Candidate B adds nonlinear
    // authority only where specialization exceeds that baseline, preserving
    // ten-second convergence for low-Acceleration high-Speed builds.
    acceleration: Math.max(prdLaunchAcceleration, specializedAcceleration),
    mass: 105 + normalized(stats.weight) * 75,
    steeringRate: 1.3 + normalized(stats.handling) * 1.1,
    lateralGrip: 5.5 + normalized(stats.traction) * 3.5,
    reverseSpeed: 8,
  };
}

export function surfaceSpeedMultiplier(surface: SurfaceType, traction: number): number {
  const tractionN = (traction - 1) / 9;

  switch (surface) {
    case 'dirt':
      return 0.6 + 0.23 * tractionN;
    case 'grass':
      return 0.425 + 0.225 * tractionN;
    default:
      return 1;
  }
}

export function surfaceAccelerationMultiplier(surface: SurfaceType, traction: number): number {
  const tractionN = (traction - 1) / 9;

  switch (surface) {
    case 'dirt':
      return 0.68 + 0.22 * tractionN;
    case 'grass':
      return 0.585 + 0.205 * tractionN;
    default:
      return 1;
  }
}

export function surfaceMinimumPlayableSpeed(surface: SurfaceType): number {
  if (surface === 'grass') return 8.5;
  if (surface === 'dirt') return 11.5;
  return 0;
}

export function driftThresholds(miniTurbo: number): DriftThresholds {
  const turboN = (miniTurbo - 1) / 9;
  return {
    blue: 0.95 - 0.18 * turboN,
    orange: 1.9 - 0.35 * turboN,
    purple: 3.15 - 0.6 * turboN,
  };
}

export function driftBoostProfile(
  tier: Exclude<DriftTierName, 'none'>,
  miniTurbo: number,
): DriftBoostProfile {
  const turboN = (miniTurbo - 1) / 9;
  if (tier === 'blue') return { duration: 0.55 + 0.15 * turboN, speedMultiplier: 1.08 };
  if (tier === 'orange') return { duration: 0.9 + 0.25 * turboN, speedMultiplier: 1.12 };
  return { duration: 1.35 + 0.4 * turboN, speedMultiplier: 1.16 };
}
