import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { guardrailContact } from '../src/game/track/GuardrailSystem';

beforeAll(async () => {
  await RAPIER.init();
});
it('uses the accepted scripted barrier response without a second native wall impulse at Falls Run', () => {
  const track = new NeonGrid();
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  const cleanup = createNeonGridColliders(world, track);
  const stats = characterById('aa-13').stats;
  const position = new THREE.Vector3(-172.37921142578125, 8.884919166564941, 33.262901306152344);
  const forward = new THREE.Vector3(0.11918646756529044, 0, -0.9928718879841991);
  const kart = new KartController(
    world,
    createKartTuning(stats),
    stats,
    position,
    Math.atan2(forward.x, forward.z),
  );
  kart.body.setTranslation(position, true);
  kart.body.setLinvel({ x: 3.596496820449829, y: 0.6349323391914368, z: -30.56700897216797 }, true);
  world.step();
  const after = kart.speedMetersPerSecond();
  cleanup();
  world.free();
  expect(after).toBeGreaterThan(30);
});
it.each([0.1, 0.35, 0.55, 0.8154, 0.9])(
  'contains both edges at %s with one bounded inward response and road support',
  (progress) => {
    for (const side of [-1, 1]) {
      const track = new NeonGrid();
      const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
      const cleanup = createNeonGridColliders(world, track);
      const stats = characterById('aa-13').stats;
      const p = track.curve.getPointAt(progress),
        t = track.curve.getTangentAt(progress);
      const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
      const start = p.clone().addScaledVector(right, side * (track.halfWidthAt(progress) - 1));
      const kart = new KartController(
        world,
        createKartTuning(stats),
        stats,
        start,
        Math.atan2(t.x, t.z),
      );
      for (let i = 0; i < 60; i++) world.step();
      const velocity = t
        .clone()
        .setY(0)
        .normalize()
        .multiplyScalar(8)
        .addScaledVector(right, side * 6);
      kart.body.setLinvel(velocity, true);
      let impacts = 0;
      for (let i = 0; i < 30; i++) {
        world.step();
        const contact = guardrailContact(track, kart.position(), 1.15);
        if (contact) {
          impacts++;
          kart.resolveStaticBarrierCollision(
            contact.inwardNormal,
            contact.penetration + 0.02,
            0.82,
            0.22,
          );
          expect(kart.velocity().dot(contact.inwardNormal)).toBeGreaterThanOrEqual(-0.001);
        }
        const projection = track.project(kart.position());
        expect(projection.lateralDistance).toBeLessThanOrEqual(
          track.halfWidthAt(projection.progress) - 1.1,
        );
        expect(kart.position().y).toBeGreaterThan(projection.point.y - 0.1);
      }
      expect(impacts).toBeGreaterThan(0);
      expect(impacts).toBeLessThan(4);
      cleanup();
      world.free();
    }
  },
);
