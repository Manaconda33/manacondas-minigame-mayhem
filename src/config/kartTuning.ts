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
  accelerationPerPoint: 0.75,
  recoveryThresholdRatio: 0.85,
  recoveryPerPoint: 0.08,
  recoveryMinimum: 0.6,
  recoveryMaximum: 1.32,
  steeringResponseNeutral: 10,
  steeringResponsePerPoint: 1.25,
  steeringResponseMinimum: 5,
  steeringResponseMaximum: 15,
  cornerLossNeutralPerSecond: 0.16,
  cornerLossPerHandlingPoint: 0.02,
  cornerLossMinimumPerSecond: 0.08,
  cornerLossMaximumPerSecond: 0.26,
  cornerSpeedPressureStart: 18,
  cornerSpeedPressureFull: 33,
  cornerSpeedPressureMaximum: 1.25,
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
    1 +
      BALANCE_CANDIDATE_B.recoveryPerPoint *
        (acceleration - BALANCE_CANDIDATE_B.neutralStat) *
        deficit,
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

/**
 * Returns the exponential forward-speed loss rate for a steering demand.
 * Absolute speed, rather than the racer's own speed ratio, creates the intended
 * Realized Speed interaction: a low-Handling kart pays more to exploit a very
 * high Speed ceiling without changing that ceiling on a straight.
 */
export function candidateBHandlingCornerLossRate(
  handling: number,
  speedMetersPerSecond: number,
  steeringInput: number,
): number {
  const handlingLoss = clamp(
    BALANCE_CANDIDATE_B.cornerLossNeutralPerSecond -
      BALANCE_CANDIDATE_B.cornerLossPerHandlingPoint *
        (handling - BALANCE_CANDIDATE_B.neutralStat),
    BALANCE_CANDIDATE_B.cornerLossMinimumPerSecond,
    BALANCE_CANDIDATE_B.cornerLossMaximumPerSecond,
  );
  const speedPressure = clamp(
    (Math.abs(speedMetersPerSecond) - BALANCE_CANDIDATE_B.cornerSpeedPressureStart) /
      (BALANCE_CANDIDATE_B.cornerSpeedPressureFull -
        BALANCE_CANDIDATE_B.cornerSpeedPressureStart),
    0,
    BALANCE_CANDIDATE_B.cornerSpeedPressureMaximum,
  );
  const turnLoad = clamp(Math.abs(steeringInput), 0, 1);
  return handlingLoss * turnLoad * turnLoad * speedPressure * speedPressure;
}

export function createKartTuning(stats: DriverStats): KartTuning {
  const normalized = (value: number): number => (value - 1) / 9;

  return {
    // Candidate B deliberately preserves the approved 23-33 m/s Speed range.
    maxSpeed: 23 + normalized(stats.speed) * 10,
    acceleration:
      BALANCE_CANDIDATE_B.neutralAcceleration +
      BALANCE_CANDIDATE_B.accelerationPerPoint *
        (stats.acceleration - BALANCE_CANDIDATE_B.neutralStat),
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
