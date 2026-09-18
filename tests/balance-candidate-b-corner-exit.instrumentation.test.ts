import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import {
  candidateBAccelerationRecoveryMultiplier,
  createKartTuning,
  type DriverStats,
} from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

const dt = 1 / 60;
const windowSeconds = 1.5;
const turnThresholdsDegrees = [15, 20, 25, 30] as const;
const overspeedPercents = [0.08, 0.1, 0.12] as const;
const turnEnterSteering = 0.08;
const turnExitSteering = 0.04;
const turnExitQuietFrames = 12;

interface CornerExit {
  seconds: number;
  accumulatedTurnDegrees: number;
  maximumSteeringDemand: number;
  exitSpeed: number;
  exitSpeedRatio: number;
  surface: string;
}

interface RaceTelemetry {
  seconds: number;
  exits: CornerExit[];
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function tangentDeltaRadians(previous: THREE.Vector3, next: THREE.Vector3): number {
  return Math.acos(clamp(previous.dot(next), -1, 1));
}

function specialistOverspeedEligibility(stats: DriverStats): number {
  const lowSpeedTradeoff = clamp(6 - stats.speed, 0, 1);
  const specialistStrength = clamp(
    0.5 * Math.max(0, stats.acceleration - 7) +
      0.5 * Math.max(0, stats.handling - 6),
    0,
    1,
  );
  return lowSpeedTradeoff * specialistStrength;
}

function projectedWindowGainSeconds(
  stats: DriverStats,
  exitSpeed: number,
  overspeedPercent: number,
): number {
  const tuning = createKartTuning(stats);
  const eligibility = specialistOverspeedEligibility(stats);
  if (eligibility <= 0) return 0;

  const baseCap = tuning.maxSpeed;
  const projectedCap = baseCap * (1 + overspeedPercent * eligibility);
  let baselineSpeed = Math.min(exitSpeed, baseCap);
  let projectedSpeed = Math.min(exitSpeed, projectedCap);
  let baselineDistance = 0;
  let projectedDistance = 0;
  const frames = Math.round(windowSeconds / dt);

  for (let frame = 0; frame < frames; frame += 1) {
    const baselineRatio = clamp(Math.abs(baselineSpeed) / baseCap, 0, 1);
    const projectedRatio = clamp(Math.abs(projectedSpeed) / baseCap, 0, 1);
    const baselineTaper = clamp(1 - 0.72 * baselineRatio * baselineRatio, 0.22, 1);
    const projectedTaper = clamp(1 - 0.72 * projectedRatio * projectedRatio, 0.22, 1);
    const baselineAcceleration =
      tuning.acceleration *
      baselineTaper *
      candidateBAccelerationRecoveryMultiplier(
        stats.acceleration,
        baselineRatio,
        stats.speed,
      );
    const projectedAcceleration =
      tuning.acceleration *
      projectedTaper *
      candidateBAccelerationRecoveryMultiplier(
        stats.acceleration,
        projectedRatio,
        stats.speed,
      );

    baselineSpeed = Math.min(baseCap, baselineSpeed + baselineAcceleration * dt);
    projectedSpeed = Math.min(
      projectedCap,
      projectedSpeed + projectedAcceleration * dt,
    );
    baselineDistance += baselineSpeed * dt;
    projectedDistance += projectedSpeed * dt;
  }

  return Math.max(0, projectedDistance - baselineDistance) / baseCap;
}

function runCleanRace(track: CircuitAlpha, stats: DriverStats): RaceTelemetry {
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = dt;
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0),
  );

  const tangent = track.checkpointTangent(0);
  const tuning = createKartTuning(stats);
  const kart = new KartController(
    world,
    tuning,
    stats,
    track.checkpointPosition(0).addScaledVector(tangent, 8),
    Math.atan2(tangent.x, tangent.z),
  );
  const driver = new AiDriver(
    track,
    { laneOffset: 0, pace: 0.7, aggression: 0.6 },
    tuning.maxSpeed,
    stats.handling,
  );
  const laps = new LapTracker();
  const exits: CornerExit[] = [];

  let previousTangent = track.project(kart.position()).tangent;
  let activeTurn:
    | {
        accumulatedRadians: number;
        maximumSteeringDemand: number;
        quietFrames: number;
      }
    | undefined;
  let finishSeconds = Number.NaN;

  const finalizeTurn = (seconds: number, surface: string): void => {
    if (activeTurn === undefined) return;
    exits.push({
      seconds,
      accumulatedTurnDegrees: THREE.MathUtils.radToDeg(activeTurn.accumulatedRadians),
      maximumSteeringDemand: activeTurn.maximumSteeringDemand,
      exitSpeed: kart.speedMetersPerSecond(),
      exitSpeedRatio: kart.speedMetersPerSecond() / tuning.maxSpeed,
      surface,
    });
    activeTurn = undefined;
  };

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const before = kart.position();
    const projection = track.project(before);
    const speed = kart.speedMetersPerSecond();
    const input = driver.input(before, kart.forward(), speed, 0, [], dt);
    const steeringDemand = Math.abs(input.steering);
    const tangentDelta = tangentDeltaRadians(previousTangent, projection.tangent);
    previousTangent = projection.tangent.clone();

    if (activeTurn === undefined && steeringDemand >= turnEnterSteering) {
      activeTurn = {
        accumulatedRadians: 0,
        maximumSteeringDemand: steeringDemand,
        quietFrames: 0,
      };
    }

    if (activeTurn !== undefined) {
      activeTurn.accumulatedRadians += tangentDelta;
      activeTurn.maximumSteeringDemand = Math.max(
        activeTurn.maximumSteeringDemand,
        steeringDemand,
      );
      activeTurn.quietFrames =
        steeringDemand <= turnExitSteering ? activeTurn.quietFrames + 1 : 0;
      if (activeTurn.quietFrames >= turnExitQuietFrames) {
        finalizeTurn(step * dt, projection.surface);
      }
    }

    kart.update(input, projection.surface, dt);
    world.step();

    const checkpoint = laps.snapshot().nextCheckpoint;
    if (
      crossesForwardCheckpointGate(
        before,
        kart.position(),
        track.lapCheckpointPosition(checkpoint),
        track.lapCheckpointTangent(checkpoint),
      )
    ) {
      const seconds = (step + 1) * dt;
      laps.enterCheckpoint(checkpoint, 1, seconds);
      if (laps.snapshot().finished) finishSeconds = seconds;
    }
  }

  finalizeTurn(finishSeconds, track.project(kart.position()).surface);
  expect(laps.snapshot().finished).toBe(true);
  expect(Number.isFinite(finishSeconds)).toBe(true);
  return { seconds: finishSeconds, exits };
}

function summarizeThreshold(
  telemetry: RaceTelemetry,
  stats: DriverStats,
  thresholdDegrees: number,
) {
  const tuning = createKartTuning(stats);
  const qualifying = telemetry.exits.filter(
    (exit) => exit.accumulatedTurnDegrees >= thresholdDegrees,
  );
  const eligible = qualifying.filter(
    (exit) =>
      exit.surface === 'asphalt' &&
      exit.exitSpeedRatio <= 1.01 &&
      Number.isFinite(exit.exitSpeedRatio),
  );

  const nonOverlapping: CornerExit[] = [];
  for (const exit of eligible) {
    const previous = nonOverlapping.at(-1);
    if (previous === undefined || exit.seconds - previous.seconds >= windowSeconds) {
      nonOverlapping.push(exit);
    }
  }

  const spacings = nonOverlapping
    .slice(1)
    .map((exit, index) => exit.seconds - (nonOverlapping[index]?.seconds ?? exit.seconds));
  const mean = (values: number[]): number =>
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;

  const gains = Object.fromEntries(
    overspeedPercents.map((percent) => {
      const gain = nonOverlapping.reduce(
        (sum, exit) => sum + projectedWindowGainSeconds(stats, exit.exitSpeed, percent),
        0,
      );
      return [
        `${String(Math.round(percent * 100))}pct`,
        {
          projectedGainSeconds: gain,
          projectedRaceSeconds: telemetry.seconds - gain,
        },
      ];
    }),
  );

  return {
    thresholdDegrees,
    rawExits: qualifying.length,
    eligibleNonOverlappingExits: nonOverlapping.length,
    meanSpacingSeconds: mean(spacings),
    meanExitSpeedRatio: mean(nonOverlapping.map((exit) => exit.exitSpeed / tuning.maxSpeed)),
    meanMaximumSteeringDemand: mean(
      nonOverlapping.map((exit) => exit.maximumSteeringDemand),
    ),
    gains,
  };
}

describe('Candidate B corner-exit overspeed instrumentation', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('measures clean corner-exit opportunity counts without changing gameplay', () => {
    const track = new CircuitAlpha();
    const results = characterManifest.map((character) => {
      const telemetry = runCleanRace(track, character.stats);
      return {
        name: character.displayName,
        stats: character.stats,
        baselineSeconds: telemetry.seconds,
        specialistEligibility: specialistOverspeedEligibility(character.stats),
        thresholds: turnThresholdsDegrees.map((threshold) =>
          summarizeThreshold(telemetry, character.stats, threshold),
        ),
      };
    });

    console.log(
      `Candidate B corner-exit overspeed instrumentation: ${JSON.stringify(results)}`,
    );

    expect(results).toHaveLength(characterManifest.length);
    expect(
      results.every(
        (result) =>
          Number.isFinite(result.baselineSeconds) &&
          result.thresholds.every(
            (threshold) =>
              threshold.rawExits >= threshold.eligibleNonOverlappingExits &&
              Number.isFinite(threshold.meanExitSpeedRatio) &&
              Number.isFinite(threshold.meanMaximumSteeringDemand),
          ),
      ),
    ).toBe(true);

    const alex = results.find((result) => result.name === 'Alex');
    const lavi = results.find((result) => result.name === 'Lavi');
    const lula = results.find((result) => result.name === 'Lula');
    expect(alex?.specialistEligibility).toBe(0);
    expect(lavi?.specialistEligibility).toBe(1);
    expect(lula?.specialistEligibility).toBe(1);
  }, 90_000);
});
