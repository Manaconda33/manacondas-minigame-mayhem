import RAPIER from '@dimforge/rapier3d-compat';
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
});
