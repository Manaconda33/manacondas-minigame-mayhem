import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { createKartTuning, sliceOneDriver } from '../src/config/kartTuning';
import { KartController, type DriveInput } from '../src/game/physics/KartController';

describe('generic spinout and static-barrier response', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  function makeKart(): { world: RAPIER.World; kart: KartController } {
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    world.createCollider(RAPIER.ColliderDesc.cuboid(500, 0.1, 500).setTranslation(0, -0.12, 0));
    return {
      world,
      kart: new KartController(
        world,
        createKartTuning(sliceOneDriver),
        sliceOneDriver,
        new Vector3(0, 1.1, 0),
        0,
      ),
    };
  }

  function step(world: RAPIER.World, kart: KartController, input: DriveInput, count: number): void {
    for (let index = 0; index < count; index += 1) {
      kart.update(input, 'asphalt', 1 / 60);
      world.step();
    }
  }

  it('rotates through one full standard spinout while bleeding planar speed', () => {
    const { world, kart } = makeKart();
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 180);
    const beforeForward = kart.forward();
    const beforeSpeed = kart.speedMetersPerSecond();
    const yawRate = (Math.PI * 2) / 0.85;
    step(
      world,
      kart,
      {
        throttle: 1,
        steering: 1,
        brake: false,
        drift: true,
        effectSpinoutYawRateRadiansPerSecond: yawRate,
      },
      25,
    );
    expect(kart.forward().dot(beforeForward)).toBeLessThan(-0.99);
    expect(kart.feedback().drifting).toBe(false);
    step(
      world,
      kart,
      {
        throttle: 1,
        steering: -1,
        brake: true,
        drift: true,
        effectSpinoutYawRateRadiansPerSecond: yawRate,
      },
      26,
    );
    expect(kart.forward().dot(beforeForward)).toBeGreaterThan(0.995);
    expect(kart.speedMetersPerSecond()).toBeLessThan(beforeSpeed);
    const recoverySpeed = kart.speedMetersPerSecond();
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 60);
    expect(kart.speedMetersPerSecond()).toBeGreaterThan(recoverySpeed);
    world.free();
  });

  it('reflects outward barrier velocity and retains bounded tangential speed', () => {
    const { world, kart } = makeKart();
    step(world, kart, { throttle: 1, steering: 0, brake: false, drift: false }, 180);
    kart.applyArcadeCollisionImpulse(new Vector3(1, 0, 0), 20);
    const beforePosition = kart.position();
    const beforeVelocity = kart.velocity();
    expect(beforeVelocity.x).toBeGreaterThan(0);

    kart.resolveStaticBarrierCollision(new Vector3(-1, 0, 0), 0.3, 0.82, 0.22);
    const afterPosition = kart.position();
    const afterVelocity = kart.velocity();

    expect(afterPosition.x).toBeCloseTo(beforePosition.x - 0.3, 4);
    expect(afterVelocity.x).toBeLessThan(0);
    expect(Math.abs(afterVelocity.z)).toBeCloseTo(Math.abs(beforeVelocity.z) * 0.82, 3);
  });
});
