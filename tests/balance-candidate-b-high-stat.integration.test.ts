import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import type { DriverStats } from '../src/config/kartTuning';
import { createKartTuning } from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

interface SweepResult {
  speed: number;
  acceleration: number;
  handling: number;
  seconds: number;
}

function runThreeLapProfile(
  track: CircuitAlpha,
  stats: DriverStats,
): SweepResult {
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = 1 / 60;
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
  let finishSeconds = Number.NaN;

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const before = kart.position();
    const projection = track.project(before);
    kart.update(
      driver.input(
        before,
        kart.forward(),
        kart.speedMetersPerSecond(),
        0,
        [],
        1 / 60,
      ),
      projection.surface,
      1 / 60,
    );
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
      const seconds = (step + 1) / 60;
      laps.enterCheckpoint(checkpoint, 1, seconds);
      if (laps.snapshot().finished) finishSeconds = seconds;
    }
  }

  expect(laps.snapshot().finished).toBe(true);
  expect(kart.isFinite()).toBe(true);
  return {
    speed: stats.speed,
    acceleration: stats.acceleration,
    handling: stats.handling,
    seconds: finishSeconds,
  };
}

describe('Balance Candidate B high-stat Acceleration/Handling telemetry', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('maps the A/H 6-10 response surface at Speed 5 and Speed 6', () => {
    const track = new CircuitAlpha();
    const results: SweepResult[] = [];

    for (const speed of [5, 6]) {
      for (let acceleration = 6; acceleration <= 10; acceleration += 1) {
        for (let handling = 6; handling <= 10; handling += 1) {
          results.push(
            runThreeLapProfile(track, {
              speed,
              acceleration,
              weight: 6,
              handling,
              miniTurbo: 6,
              traction: 6,
            }),
          );
        }
      }
    }

    console.log(
      `Candidate B high-stat A/H response surface: ${JSON.stringify(results)}`,
    );
    expect(results).toHaveLength(50);
  }, 90_000);

  it('measures line-and-heading recovery after an item-like displacement', () => {
    const track = new CircuitAlpha();
    const results: {
      speed: number;
      handling: number;
      recoverySeconds: number;
      maximumLateralDistance: number;
    }[] = [];
    const index = 120;
    const sample = track.samples[index];
    const tangent = track.tangents[index];
    if (sample === undefined || tangent === undefined) throw new Error('Missing recovery sample');
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
    const trackYaw = Math.atan2(tangent.x, tangent.z);

    for (const speed of [5, 6]) {
      for (let handling = 6; handling <= 10; handling += 1) {
        const stats: DriverStats = {
          speed,
          acceleration: 8,
          weight: 6,
          handling,
          miniTurbo: 6,
          traction: 6,
        };
        const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
        world.timestep = 1 / 60;
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0),
        );
        const kart = new KartController(
          world,
          createKartTuning(stats),
          stats,
          sample.clone().addScaledVector(right, 3),
          trackYaw + THREE.MathUtils.degToRad(25),
        );
        kart.applyArcadeCollisionImpulse(tangent.clone(), kart.mass() * 18);
        const driver = new AiDriver(
          track,
          { laneOffset: 0, pace: 0.7, aggression: 0.6 },
          createKartTuning(stats).maxSpeed,
          handling,
        );

        let recoveredFrame = 600;
        let maximumLateralDistance = 0;
        for (let frame = 0; frame < 600; frame += 1) {
          const before = kart.position();
          const projection = track.project(before);
          maximumLateralDistance = Math.max(maximumLateralDistance, projection.lateralDistance);
          const headingAlignment = kart.forward().dot(projection.tangent);
          if (frame > 0 && projection.lateralDistance < 0.75 && headingAlignment > 0.98) {
            recoveredFrame = frame;
            break;
          }
          kart.update(
            driver.input(
              before,
              kart.forward(),
              kart.speedMetersPerSecond(),
              0,
              [],
              1 / 60,
            ),
            projection.surface,
            1 / 60,
          );
          world.step();
        }

        results.push({
          speed,
          handling,
          recoverySeconds: recoveredFrame / 60,
          maximumLateralDistance,
        });
      }
    }

    console.log(
      `Candidate B handling recovery telemetry: ${JSON.stringify(results)}`,
    );
    expect(results.every((result) => result.recoverySeconds < 10)).toBe(true);
  });

});
