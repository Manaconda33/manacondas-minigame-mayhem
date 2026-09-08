import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { RacerEffects } from '../src/game/items/RacerEffects';
import { SpinoutCameraAnchor } from '../src/game/camera/SpinoutCameraAnchor';
import { isDriverFrontFacingCamera, selectDriverFrame } from '../src/game/driver/DriverSpriteState';
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

  it.each([0, 0.0001, 20])(
    'Slick retains exactly 60%% of planar velocity %s and carries it through one control-suppressed turn',
    (speed) => {
      const { world, kart } = makeKart();
      kart.applyArcadeCollisionImpulse(new Vector3(0.6, 0, 0.8), speed);
      const before = kart.velocity();
      const beforeForward = kart.forward();
      kart.retainPlanarVelocity(0.6);
      expect(kart.velocity().x).toBeCloseTo(before.x * 0.6, 5);
      expect(kart.velocity().z).toBeCloseTo(before.z * 0.6, 5);
      expect(kart.velocity().y).toBe(before.y);
      const retained = kart.velocity();
      const effects = new RacerEffects();
      const anchor = new SpinoutCameraAnchor();
      // A Slick refresh replaces a prior hostile spin rather than stacking yaw rates.
      effects.activateSpinout('player', {
        id: 'blast-orb-spinout',
        label: 'Blast',
        durationSeconds: 1.2,
        direction: -1,
        turns: 1,
      });
      effects.activateSpinout('player', {
        id: 'slick-trap-spinout',
        label: 'Slick',
        durationSeconds: 0.85,
        direction: 1,
        turns: 1,
        preserveMomentum: true,
      });
      anchor.capture(beforeForward, retained);
      const held = anchor.resolve(beforeForward, true).clone();
      const frames = new Set<string>();
      for (let i = 0; i < 51; i++) {
        const spin = effects.spinoutState('player');
        expect(spin).not.toBeNull();
        kart.update(
          {
            throttle: 1,
            steering: 1,
            brake: true,
            drift: true,
            effectSpinoutYawRateRadiansPerSecond: spin?.yawRateRadiansPerSecond,
            effectSpinoutPreserveMomentum: spin?.preserveMomentum,
          },
          'grass',
          1 / 60,
        );
        expect(kart.velocity()).toEqual(retained);
        expect(kart.feedback().drifting).toBe(false);
        expect(anchor.resolve(kart.forward(), true)).toEqual(held);
        for (const direction of [-1, 1]) {
          const camera = kart.position().addScaledVector(held, direction * 5);
          frames.add(
            selectDriverFrame({
              finished: false,
              steering: 1,
              hitSeconds: 0,
              spinoutSeconds: spin?.remainingSeconds,
              frontFacingCamera: isDriverFrontFacingCamera(kart.position(), kart.forward(), camera),
            }),
          );
        }
        effects.advance(1 / 60);
      }
      expect(effects.spinoutState('player')).toBeNull();
      expect(kart.forward().dot(beforeForward)).toBeGreaterThan(0.999999);
      expect(frames).toEqual(new Set(['hit', 'frontHit']));
      expect(anchor.resolve(kart.forward(), false)).toEqual(kart.forward());
      // Invalid retention never injects speed or alters the existing vector.
      for (const factor of [NaN, Infinity, -1, 2]) kart.retainPlanarVelocity(factor);
      expect(kart.velocity()).toEqual(retained);
      world.free();
    },
  );

  it('adds an exact finite planar velocity delta without moving, rotating, or changing vertical velocity', () => {
    const { world, kart } = makeKart();
    kart.applyArcadeCollisionImpulse(new Vector3(0.2, 0, 1), 8);
    const beforePosition = kart.position();
    const beforeForward = kart.forward();
    const beforeVelocity = kart.velocity();
    expect(kart.addPlanarVelocityDelta(new Vector3(3.5, 99, -1.25))).toBe(true);
    const after = kart.velocity();
    expect(after.x).toBeCloseTo(beforeVelocity.x + 3.5, 7);
    expect(after.z).toBeCloseTo(beforeVelocity.z - 1.25, 7);
    expect(after.y).toBe(beforeVelocity.y);
    expect(kart.position()).toEqual(beforePosition);
    expect(kart.forward()).toEqual(beforeForward);
    expect(kart.addPlanarVelocityDelta(new Vector3(Number.NaN, 0, 1))).toBe(false);
    expect(kart.velocity()).toEqual(after);
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
