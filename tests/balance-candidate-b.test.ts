import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterById, characterManifest } from '../src/characters/manifest';
import { createKartTuning, type DriverStats } from '../src/config/kartTuning';
import { collisionSpeedRetention } from '../src/game/physics/KartCollision';
import { KartController, type DriveInput } from '../src/game/physics/KartController';

const THROTTLE: DriveInput = { throttle: 1, steering: 0, brake: false, drift: false };

interface Rig {
  world: RAPIER.World;
  kart: KartController;
}

describe('Balance Candidate B runtime telemetry', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  function makeKart(stats: DriverStats): Rig {
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(2000, 0.1, 2000).setTranslation(0, -0.12, 0),
    );
    return {
      world,
      kart: new KartController(world, createKartTuning(stats), stats, new Vector3(0, 1.1, 0), 0),
    };
  }

  function step(rig: Rig, input: DriveInput, frames = 1): void {
    for (let frame = 0; frame < frames; frame += 1) {
      rig.kart.update(input, 'asphalt', 1 / 60);
      rig.world.step();
    }
  }

  function framesToSpeedRatio(rig: Rig, stats: DriverStats, ratio: number, maximum = 900): number {
    const target = createKartTuning(stats).maxSpeed * ratio;
    for (let frame = 0; frame <= maximum; frame += 1) {
      if (rig.kart.speedMetersPerSecond() >= target) return frame;
      step(rig, THROTTLE);
    }
    return maximum + 1;
  }

  it('preserves Krios full straight-line Speed-10 ceiling', () => {
    const stats = characterById('aa-10').stats;
    const rig = makeKart(stats);
    step(rig, THROTTLE, 1200);
    expect(rig.kart.speedMetersPerSecond()).toBeCloseTo(createKartTuning(stats).maxSpeed, 1);
    expect(createKartTuning(stats).maxSpeed).toBeCloseTo(33);
  });

  it('makes high Acceleration recover materially faster from a Frost-scale speed loss', () => {
    const lowStats: DriverStats = {
      speed: 8,
      acceleration: 4,
      weight: 6,
      handling: 6,
      miniTurbo: 6,
      traction: 6,
    };
    const highStats = { ...lowStats, acceleration: 9 };
    const low = makeKart(lowStats);
    const high = makeKart(highStats);

    step(low, THROTTLE, 1200);
    step(high, THROTTLE, 1200);
    low.kart.retainPlanarVelocity(0.55);
    high.kart.retainPlanarVelocity(0.55);

    const lowFrames = framesToSpeedRatio(low, lowStats, 0.9);
    const highFrames = framesToSpeedRatio(high, highStats, 0.9);

    expect(highFrames).toBeLessThan(lowFrames);
    expect((lowFrames - highFrames) / 60).toBeGreaterThan(0.8);
  });

  it('makes Handling preserve more speed under the same high-speed steering load', () => {
    const lowStats: DriverStats = {
      speed: 10,
      acceleration: 6,
      weight: 6,
      handling: 3,
      miniTurbo: 6,
      traction: 6,
    };
    const highStats = { ...lowStats, handling: 9 };
    const low = makeKart(lowStats);
    const high = makeKart(highStats);

    step(low, THROTTLE, 1200);
    step(high, THROTTLE, 1200);
    const turn: DriveInput = { ...THROTTLE, steering: 0.8 };
    step(low, turn, 90);
    step(high, turn, 90);

    expect(high.kart.speedMetersPerSecond()).toBeGreaterThan(low.kart.speedMetersPerSecond());
    expect(high.kart.speedMetersPerSecond() - low.kart.speedMetersPerSecond()).toBeGreaterThan(1);
  });


  it('records specialist-end recovery and steering-load telemetry', () => {
    const recovery: { speed: number; acceleration: number; seconds: number }[] = [];
    const handling: { speed: number; handling: number; retainedSpeed: number }[] = [];

    for (const speed of [5, 6]) {
      for (let acceleration = 6; acceleration <= 10; acceleration += 1) {
        const stats: DriverStats = {
          speed,
          acceleration,
          weight: 6,
          handling: 6,
          miniTurbo: 6,
          traction: 6,
        };
        const rig = makeKart(stats);
        step(rig, THROTTLE, 1200);
        rig.kart.retainPlanarVelocity(0.55);
        recovery.push({
          speed,
          acceleration,
          seconds: framesToSpeedRatio(rig, stats, 0.9) / 60,
        });
      }

      for (let handlingStat = 6; handlingStat <= 10; handlingStat += 1) {
        const stats: DriverStats = {
          speed,
          acceleration: 6,
          weight: 6,
          handling: handlingStat,
          miniTurbo: 6,
          traction: 6,
        };
        const rig = makeKart(stats);
        step(rig, THROTTLE, 1200);
        step(rig, { ...THROTTLE, steering: 0.8 }, 90);
        handling.push({
          speed,
          handling: handlingStat,
          retainedSpeed: rig.kart.speedMetersPerSecond(),
        });
      }
    }

    console.log(
      `Candidate B specialist recovery telemetry: ${JSON.stringify({ recovery, handling })}`,
    );
    expect(recovery).toHaveLength(10);
    expect(handling).toHaveLength(10);
  });

  it('records Frost-scale Acceleration recovery across the live roster', () => {
    const results: {
      name: string;
      speed: number;
      acceleration: number;
      recoverySeconds: number;
    }[] = [];

    for (const character of characterManifest) {
      const stats = character.stats;
      const rig = makeKart(stats);
      step(rig, THROTTLE, 1200);
      rig.kart.retainPlanarVelocity(0.55);
      results.push({
        name: character.displayName,
        speed: stats.speed,
        acceleration: stats.acceleration,
        recoverySeconds: framesToSpeedRatio(rig, stats, 0.9) / 60,
      });
    }

    console.log(`Candidate B roster acceleration recovery telemetry: ${JSON.stringify(results)}`);
    expect(results).toHaveLength(characterManifest.length);
  });

  it('records Weight-plus-Acceleration collision recovery across the live roster', () => {
    const results: {
      name: string;
      weight: number;
      acceleration: number;
      closingSpeed: number;
      retention: number;
      recoverySeconds: number;
    }[] = [];

    for (const character of characterManifest) {
      for (const closingSpeed of [4, 8, 16]) {
        const stats = character.stats;
        const rig = makeKart(stats);
        step(rig, THROTTLE, 1200);
        const retention = collisionSpeedRetention(stats.weight, 6, closingSpeed);
        rig.kart.applyCollisionSpeedRetention(retention);
        results.push({
          name: character.displayName,
          weight: stats.weight,
          acceleration: stats.acceleration,
          closingSpeed,
          retention,
          recoverySeconds: framesToSpeedRatio(rig, stats, 0.9) / 60,
        });
      }
    }

    console.log(`Candidate B collision recovery telemetry: ${JSON.stringify(results)}`);
    expect(results).toHaveLength(characterManifest.length * 3);
  });

  it('does not add a Handling speed penalty on a clean straight', () => {
    const lowStats: DriverStats = {
      speed: 8,
      acceleration: 6,
      weight: 6,
      handling: 3,
      miniTurbo: 6,
      traction: 6,
    };
    const highStats = { ...lowStats, handling: 9 };
    const low = makeKart(lowStats);
    const high = makeKart(highStats);

    step(low, THROTTLE, 1200);
    step(high, THROTTLE, 1200);

    const expected = createKartTuning(lowStats).maxSpeed;
    expect(low.kart.speedMetersPerSecond()).toBeCloseTo(expected, 1);
    expect(high.kart.speedMetersPerSecond()).toBeCloseTo(expected, 1);
  });
});
