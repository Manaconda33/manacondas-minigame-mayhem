import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { createKartTuning } from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

function run(track: CircuitAlpha, name: string, pace: number): number {
  const character = characterManifest.find((candidate) => candidate.displayName === name);
  if (character === undefined) throw new Error(`Missing racer ${name}`);
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = 1 / 60;
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(450, 0.1, 450).setTranslation(0, -0.12, 0),
  );
  const tangent = track.checkpointTangent(0);
  const tuning = createKartTuning(character.stats);
  const kart = new KartController(
    world,
    tuning,
    character.stats,
    track.checkpointPosition(0).addScaledVector(tangent, 8),
    Math.atan2(tangent.x, tangent.z),
  );
  const driver = new AiDriver(
    track,
    { laneOffset: 0, pace, aggression: 0.6 },
    tuning.maxSpeed,
    character.stats.handling,
  );
  const laps = new LapTracker();
  let finishSeconds = Number.NaN;

  for (let step = 0; step < 24_000 && !laps.snapshot().finished; step += 1) {
    const before = kart.position();
    const projection = track.project(before);
    kart.update(
      driver.input(before, kart.forward(), kart.speedMetersPerSecond(), 0, [], 1 / 60),
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

  expect(laps.snapshot().finished, `${name} pace ${String(pace)}`).toBe(true);
  return finishSeconds;
}

describe('production AI pace-slot instrumentation', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('measures how much the production pace range changes three-lap performance', () => {
    const track = new CircuitAlpha();
    const names = ['Lula', 'Manaconda', 'Krios', 'Accu'] as const;
    const paces = [0.28, 0.55, 0.82, 1] as const;
    const results = names.map((name) => ({
      name,
      times: paces.map((pace) => ({ pace, seconds: run(track, name, pace) })),
    }));

    console.log(`Production AI pace-slot telemetry: ${JSON.stringify(results)}`);
    expect(results).toHaveLength(4);
  }, 90_000);
});
