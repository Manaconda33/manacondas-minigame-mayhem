import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { createKartTuning, type DriverStats } from '../src/config/kartTuning';
import { AiDriver } from '../src/game/ai/AiDriver';
import {
  collisionImpulseShares,
  collisionSpeedRetention,
} from '../src/game/physics/KartCollision';
import { KartController, type DriveInput } from '../src/game/physics/KartController';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

type Disturbance = 'none' | 'spin' | 'frost' | 'collision';

interface RaceResult {
  seconds: number;
  finished: boolean;
}

function runRace(track: CircuitAlpha, stats: DriverStats, disturbance: Disturbance): RaceResult {
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

  let triggered = false;
  let spinRemaining = 0;
  let frostHandlingRemaining = 0;
  let finishSeconds = Number.NaN;
  const dt = 1 / 60;

  for (let step = 0; step < 30_000 && !laps.snapshot().finished; step += 1) {
    const before = kart.position();
    const projection = track.project(before);
    const now = step * dt;

    if (
      !triggered &&
      disturbance !== 'none' &&
      laps.snapshot().lap === 0 &&
      projection.progress >= 0.3
    ) {
      triggered = true;
      if (disturbance === 'spin') {
        spinRemaining = 0.85;
      } else if (disturbance === 'frost') {
        kart.retainPlanarVelocity(0.55);
        frostHandlingRemaining = 1.2;
      } else {
        const opponentStats: DriverStats = {
          speed: 6,
          acceleration: 6,
          weight: 6,
          handling: 6,
          miniTurbo: 6,
          traction: 6,
        };
        const opponentTuning = createKartTuning(opponentStats);
        const impulses = collisionImpulseShares(kart.mass(), opponentTuning.mass, 55);
        const right = new THREE.Vector3(projection.tangent.z, 0, -projection.tangent.x);
        kart.applyArcadeCollisionImpulse(right, impulses.first);
        kart.applyCollisionSpeedRetention(
          collisionSpeedRetention(stats.weight, opponentStats.weight, 8),
        );
      }
    }

    const baseInput = driver.input(
      before,
      kart.forward(),
      kart.speedMetersPerSecond(),
      0,
      [],
      dt,
    );
    const input: DriveInput = {
      ...baseInput,
      effectSpinoutYawRateRadiansPerSecond:
        spinRemaining > 0 ? (Math.PI * 2) / 0.85 : undefined,
      effectSteeringMultiplier: frostHandlingRemaining > 0 ? 0.8 : undefined,
    };

    kart.update(input, projection.surface, dt);
    world.step();

    spinRemaining = Math.max(0, spinRemaining - dt);
    frostHandlingRemaining = Math.max(0, frostHandlingRemaining - dt);

    const checkpoint = laps.snapshot().nextCheckpoint;
    if (
      crossesForwardCheckpointGate(
        before,
        kart.position(),
        track.lapCheckpointPosition(checkpoint),
        track.lapCheckpointTangent(checkpoint),
      )
    ) {
      const seconds = now + dt;
      laps.enterCheckpoint(checkpoint, 1, seconds);
      if (laps.snapshot().finished) finishSeconds = seconds;
    }
  }

  return { seconds: finishSeconds, finished: laps.snapshot().finished };
}

describe('Balance Candidate B standardized disruption costs', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('measures paired race-time cost for spin, Frost and collision across the roster', () => {
    const track = new CircuitAlpha();
    const results: {
      name: string;
      baselineSeconds: number;
      spinCostSeconds: number;
      frostCostSeconds: number;
      collisionCostSeconds: number;
    }[] = [];

    for (const character of characterManifest) {
      const baseline = runRace(track, character.stats, 'none');
      const spin = runRace(track, character.stats, 'spin');
      const frost = runRace(track, character.stats, 'frost');
      const collision = runRace(track, character.stats, 'collision');

      expect(baseline.finished, `${character.displayName} baseline`).toBe(true);
      expect(spin.finished, `${character.displayName} spin`).toBe(true);
      expect(frost.finished, `${character.displayName} frost`).toBe(true);
      expect(collision.finished, `${character.displayName} collision`).toBe(true);

      results.push({
        name: character.displayName,
        baselineSeconds: baseline.seconds,
        spinCostSeconds: spin.seconds - baseline.seconds,
        frostCostSeconds: frost.seconds - baseline.seconds,
        collisionCostSeconds: collision.seconds - baseline.seconds,
      });
    }

    console.log(`Candidate B standardized disruption costs: ${JSON.stringify(results)}`);
    expect(results).toHaveLength(characterManifest.length);
    expect(
      results.every((result) =>
        [
          result.baselineSeconds,
          result.spinCostSeconds,
          result.frostCostSeconds,
          result.collisionCostSeconds,
        ].every(Number.isFinite),
      ),
    ).toBe(true);
  }, 120_000);
});
