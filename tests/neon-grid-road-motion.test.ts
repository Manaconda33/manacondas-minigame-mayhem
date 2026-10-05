import RAPIER from '@dimforge/rapier3d-compat';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';

beforeAll(async () => {
  await RAPIER.init();
});

// A road contact must not silently cancel displacement while reporting the
// requested velocity. Flat authored straights provide an independent v*dt oracle.
it.each([0.001, 0.48])('moves continuously on the flat road at %s', (progress) => {
  const track = new NeonGrid();
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  world.timestep = 1 / 60;
  const cleanup = createNeonGridColliders(world, track);
  const stats = characterById('aa-13').stats;
  const point = track.curve.getPointAt(progress);
  const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
  const kart = new KartController(
    world,
    createKartTuning(stats),
    stats,
    point,
    Math.atan2(tangent.x, tangent.z),
  );
  const driver = new AiDriver(
    track,
    { laneOffset: 0, pace: 0.55, aggression: 0.3 },
    createKartTuning(stats).maxSpeed,
  );
  try {
    for (let i = 0; i < 90; i++) world.step();
    kart.body.setLinvel({ x: tangent.x * 25, y: 0, z: tangent.z * 25 }, true);
    for (let i = 0; i < 120; i++) {
      const input = driver.input(kart.position(), kart.forward(), kart.speedMetersPerSecond());
      input.throttle = 1;
      input.brake = false;
      kart.update(input, 'asphalt', 1 / 60);
      const before = kart.position();
      const expected = kart
        .velocity()
        .setY(0)
        .multiplyScalar(1 / 60);
      world.step();
      const displacement = kart.position().sub(before).setY(0);
      expect(displacement.distanceTo(expected), `step ${String(i)}`).toBeLessThan(0.002);
      expect(kart.position().y).toBeGreaterThan(point.y + 0.3);
      const projection = track.project(kart.position());
      expect(projection.lateralDistance).toBeLessThan(
        track.halfWidthAt(projection.progress) - 1.15,
      );
    }
  } finally {
    cleanup();
    world.free();
  }
});
