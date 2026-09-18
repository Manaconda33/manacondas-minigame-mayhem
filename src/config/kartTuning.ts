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
  accelerationExponentPerPoint: 0.1,
  lowSpeedSpecialistThreshold: 6,
  lowSpeedAccelerationExponentPerPoint: 0.1,
  recoveryThresholdRatio: 0.9,
  recoveryExponentPerPoint: 0.2,
  lowSpeedRecoveryExponentPerPoint: 0.12,
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
  aiCornerReferenceSpeed: 27.444444444444443,
  aiCornerBasePressure: 0.3,
  aiCornerPenaltyPerExcessSpeed: 0.23,
  aiCornerPenaltyPerHandlingPoint: 0.025,
  lowSpeedHandlingDiscountPerPoint: 0.055,
  aiCornerPenaltyMinimum: 0.08,
  aiCornerPenaltyMaximum: 2.4,
} as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function candidateBAccelerationRecoveryMultiplier(
  acceleration: number,
  speedRatio: number,
  speedStat = BALANCE_CANDIDATE_B.lowSpeedSpecialistThreshold,
): number {
  const threshold = BALANCE_CANDIDATE_B.recoveryThresholdRatio;
  const deficit = clamp((threshold - speedRatio) / threshold, 0, 1);
  const lowSpeedFactor = clamp(
    BALANCE_CANDIDATE_B.lowSpeedSpecialistThreshold - speedStat,
    0,
    1,
  );
  const specialistPoints = Math.max(0, acceleration - 7);
  return clamp(
    Math.exp(
      (BALANCE_CANDIDATE_B.recoveryExponentPerPoint *
        (acceleration - BALANCE_CANDIDATE_B.neutralStat) +
        BALANCE_CANDIDATE_B.lowSpeedRecoveryExponentPerPoint *
          specialistPoints *
          lowSpeedFactor) *
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
 * Converts the racer's straight-line ceiling into the amount of advance
 * corner-speed planning it needs. Speed above the Speed-5 baseline costs more
 * to carry through a bend, while Handling supplies a smaller discount or
 * penalty. This leaves Speed fully authoritative on a zero-corner straight and
 * lets the controller's stronger Handling model own the physical turn itself.
 */
export function candidateBAiCornerPenaltyScale(
  handling: number,
  characterMaxSpeed: number = BALANCE_CANDIDATE_B.aiCornerReferenceSpeed,
): number {
  const excessSpeed = Math.max(
    0,
    characterMaxSpeed - BALANCE_CANDIDATE_B.aiCornerReferenceSpeed,
  );
  const lowSpeedFactor = clamp(
    (28.555555555555557 - characterMaxSpeed) / 1.1111111111111143,
    0,
    1,
  );
  const specialistHandling = Math.max(0, handling - 7);
  return clamp(
    BALANCE_CANDIDATE_B.aiCornerBasePressure +
      BALANCE_CANDIDATE_B.aiCornerPenaltyPerExcessSpeed * excessSpeed -
      BALANCE_CANDIDATE_B.aiCornerPenaltyPerHandlingPoint *
        (handling - BALANCE_CANDIDATE_B.neutralStat) -
      BALANCE_CANDIDATE_B.lowSpeedHandlingDiscountPerPoint *
        specialistHandling *
        lowSpeedFactor,
    BALANCE_CANDIDATE_B.aiCornerPenaltyMinimum,
    BALANCE_CANDIDATE_B.aiCornerPenaltyMaximum,
  );
}

export function createKartTuning(stats: DriverStats): KartTuning {
  const normalized = (value: number): number => (value - 1) / 9;
  const prdLaunchAcceleration = 4 + 0.55 * stats.acceleration;
  const lowSpeedFactor = clamp(
    BALANCE_CANDIDATE_B.lowSpeedSpecialistThreshold - stats.speed,
    0,
    1,
  );
  const specialistAcceleration = Math.max(0, stats.acceleration - 7);
  const specializedAcceleration =
    BALANCE_CANDIDATE_B.neutralAcceleration *
    Math.exp(
      BALANCE_CANDIDATE_B.accelerationExponentPerPoint *
        (stats.acceleration - BALANCE_CANDIDATE_B.neutralStat) +
        BALANCE_CANDIDATE_B.lowSpeedAccelerationExponentPerPoint *
          specialistAcceleration *
          lowSpeedFactor,
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
