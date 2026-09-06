import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import {
  createKartTuning,
  sliceOneDriver,
  surfaceSpeedMultiplier,
  type DriverStats,
} from '../src/config/kartTuning';
import { ITEM_DEFINITIONS } from '../src/game/items/itemDefinitions';
import { KartController, type DriveInput } from '../src/game/physics/KartController';

describe('Rapier kart controller', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  function makeKart(
    stats: DriverStats = sliceOneDriver,
    groundHalfWidth = 500,
    groundHalfLength = 500,
  ): {
    world: RAPIER.World;
    kart: KartController;
  } {
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(groundHalfWidth, 0.1, groundHalfLength).setTranslation(
        0,
        -0.12,
        0,
      ),
    );
    return {
      world,
      kart: new KartController(world, createKartTuning(stats), stats, new Vector3(0, 1.1, 0), 0),
    };
  }

  function step(
    world: RAPIER.World,
    kart: KartController,
    input: DriveInput,
    count: number,
    surface: 'asphalt' | 'dirt' | 'grass' = 'asphalt',
  ): void {
    for (let index = 0; index < count; index += 1) {
      kart.update(input, surface, 1 / 60);
      world.step();
    }
  }

  it('charges purple, releases the highest tier, and stays finite', () => {
    const { world, kart } = makeKart();
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 180);
    step(world, kart, { throttle: 1, steering: 1, brake: false, drift: true }, 260);

    expect(kart.feedback().driftTier).toBe('purple');
    step(world, kart, { throttle: 1, steering: 1, brake: false, drift: false }, 1);
    expect(kart.feedback()).toMatchObject({ driftTier: 'purple', boostActive: true });
    expect(kart.isFinite()).toBe(true);
  });

  it('keeps sustained grass driving above the playable floor', () => {
    const { world, kart } = makeKart();
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 600, 'grass');
    expect(kart.speedMetersPerSecond()).toBeGreaterThanOrEqual(8.4);
  });

  it('relaunches after coasting to a full stop on grass', () => {
    const { world, kart } = makeKart();
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 180, 'grass');
    step(world, kart, { throttle: 0, steering: 0, brake: false, drift: false }, 600, 'grass');
    expect(kart.speedMetersPerSecond()).toBeLessThan(0.1);

    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 120, 'grass');
    expect(kart.speedMetersPerSecond()).toBeGreaterThan(2);
  });

  it('allows a stopped grass relaunch from stable center support', () => {
    const { world, kart } = makeKart(sliceOneDriver, 0.5);
    step(world, kart, { throttle: 0, steering: 0, brake: false, drift: false }, 120, 'grass');
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 120, 'grass');
    expect(kart.speedMetersPerSecond()).toBeGreaterThan(2);
  });

  it('makes every roster profile sustain its Speed-defined asphalt maximum', () => {
    for (const character of characterManifest) {
      const { world, kart } = makeKart(character.stats);
      step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 600);
      expect(kart.speedMetersPerSecond(), character.displayName).toBeCloseTo(
        createKartTuning(character.stats).maxSpeed,
        1,
      );
    }
  });

  it('permits only the explicit four-percent AI top-speed allowance', () => {
    const { world, kart } = makeKart();
    step(
      world,
      kart,
      {
        throttle: 1,
        steering: 0,
        brake: false,
        drift: false,
        speedLimitMultiplier: 1.2,
      },
      600,
    );
    expect(kart.speedMetersPerSecond()).toBeCloseTo(
      createKartTuning(sliceOneDriver).maxSpeed * 1.04,
      1,
    );
  });

  it('honors the Nitro Surge external cap, acceleration, and off-road speed override', () => {
    const boost = ITEM_DEFINITIONS['nitro-surge'].boost;
    if (boost === undefined) throw new Error('Nitro Surge boost configuration is missing.');

    const normal = makeKart();
    const surged = makeKart();
    const normalInput: DriveInput = { throttle: 1, steering: 0, brake: false, drift: false };
    const surgeInput: DriveInput = {
      ...normalInput,
      effectSpeedCapMultiplier: boost.speedCapMultiplier,
      effectAccelerationMultiplier: boost.accelerationMultiplier,
      ignoreOffRoadSpeedPenalty: boost.ignoreOffRoadSpeedPenalty,
    };

    step(normal.world, normal.kart, normalInput, 60);
    step(surged.world, surged.kart, surgeInput, 60);
    expect(surged.kart.speedMetersPerSecond() - normal.kart.speedMetersPerSecond()).toBeGreaterThan(
      1,
    );

    const capKart = makeKart(sliceOneDriver, 2000, 2000);
    step(capKart.world, capKart.kart, surgeInput, 900);
    const normalMaximum = createKartTuning(sliceOneDriver).maxSpeed;
    expect(capKart.kart.speedMetersPerSecond()).toBeCloseTo(
      normalMaximum * boost.speedCapMultiplier,
      1,
    );

    const grassKart = makeKart(sliceOneDriver, 2000, 2000);
    step(grassKart.world, grassKart.kart, surgeInput, 900, 'grass');
    expect(grassKart.kart.speedMetersPerSecond()).toBeCloseTo(
      normalMaximum * boost.speedCapMultiplier,
      1,
    );

    step(grassKart.world, grassKart.kart, normalInput, 240, 'grass');
    expect(grassKart.kart.speedMetersPerSecond()).toBeCloseTo(
      normalMaximum * surfaceSpeedMultiplier('grass', sliceOneDriver.traction),
      1,
    );
  });

  it('uses Acceleration for time-to-speed without changing sustained top speed', () => {
    const lowAcceleration: DriverStats = {
      speed: 8,
      acceleration: 4,
      weight: 5,
      handling: 5,
      miniTurbo: 5,
      traction: 5,
    };
    const highAcceleration = { ...lowAcceleration, acceleration: 8 };
    const low = makeKart(lowAcceleration);
    const high = makeKart(highAcceleration);

    step(low.world, low.kart, { throttle: 1, steering: 0, brake: false, drift: false }, 60);
    step(high.world, high.kart, { throttle: 1, steering: 0, brake: false, drift: false }, 60);
    expect(high.kart.speedMetersPerSecond() - low.kart.speedMetersPerSecond()).toBeGreaterThan(2);

    step(low.world, low.kart, { throttle: 1, steering: 0, brake: false, drift: false }, 120);
    step(high.world, high.kart, { throttle: 1, steering: 0, brake: false, drift: false }, 120);
    expect(low.kart.speedMetersPerSecond()).toBeLessThan(
      createKartTuning(lowAcceleration).maxSpeed * 0.75,
    );

    step(low.world, low.kart, { throttle: 1, steering: 0, brake: false, drift: false }, 420);
    step(high.world, high.kart, { throttle: 1, steering: 0, brake: false, drift: false }, 420);
    const expectedMaximum = createKartTuning(lowAcceleration).maxSpeed;
    expect(low.kart.speedMetersPerSecond()).toBeCloseTo(expectedMaximum, 1);
    expect(high.kart.speedMetersPerSecond()).toBeCloseTo(expectedMaximum, 1);
  });

  it('slows progressively when entering dirt or grass', () => {
    for (const surface of ['dirt', 'grass'] as const) {
      const { world, kart } = makeKart();
      step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 600);
      const asphaltSpeed = kart.speedMetersPerSecond();

      step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 1, surface);
      expect(kart.speedMetersPerSecond()).toBeGreaterThan(asphaltSpeed - 0.3);

      step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 240, surface);
      const expectedSurfaceMaximum =
        createKartTuning(sliceOneDriver).maxSpeed *
        surfaceSpeedMultiplier(surface, sliceOneDriver.traction);
      expect(kart.speedMetersPerSecond()).toBeCloseTo(expectedSurfaceMaximum, 1);
    }
  });

  it('reduces forward collision speed while preserving lateral motion', () => {
    const { world, kart } = makeKart();
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 180);
    kart.applyArcadeCollisionImpulse(new Vector3(1, 0, 0), 20);
    const before = kart.velocity();

    kart.applyCollisionSpeedRetention(0.8);
    const after = kart.velocity();

    expect(after.z).toBeCloseTo(before.z * 0.8, 4);
    expect(after.x).toBeCloseTo(before.x, 4);
  });
});
