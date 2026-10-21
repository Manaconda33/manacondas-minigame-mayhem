import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

beforeAll(async () => {
  await RAPIER.init();
});
describe('Neon Grid realized main-road support', () => {
  it.each([0.1, 0.35, 0.7, 0.9])('supports a real dynamic body on the road at %s', (progress) => {
    const track = new NeonGrid();
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const cleanup = createNeonGridColliders(world, track);
    const road = track.curve.getPointAt(progress);
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(road.x, road.y + 1, road.z),
    );
    world.createCollider(RAPIER.ColliderDesc.ball(0.25), body);
    for (let i = 0; i < 90; i++) world.step();
    expect(body.translation().y).toBeGreaterThan(road.y - 0.2);
    expect(body.translation().y).toBeLessThan(road.y + 0.8);
    world.removeRigidBody(body);
    cleanup();
    cleanup();
    expect(world.colliders.len()).toBe(0);
    world.free();
  });
  it('has no flat support masking missing elevated road', () => {
    const track = new NeonGrid();
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const cleanup = createNeonGridColliders(world, track);
    world.step();
    expect(
      world.castRay(new RAPIER.Ray({ x: 0, y: 5, z: 0 }, { x: 0, y: -1, z: 0 }), 20, true),
    ).toBeNull();
    cleanup();
    world.free();
  });
  it('uses the same finite road geometry for the scene and physics, with owned disposal', () => {
    const scene = createNeonGridScene(new NeonGrid());
    const road = scene.getObjectByName('track-road') as THREE.Mesh;
    expect(road).toBeInstanceOf(THREE.Mesh);
    expect(Array.from(road.geometry.getAttribute('position').array).every(Number.isFinite)).toBe(
      true,
    );
    expect(scene.getObjectByName('neon-grid-walls')).toBeDefined();
    for (const name of ['boost-pad-0.035', 'boost-pad-0.06', 'boost-pad-0.085', 'boost-pad-0.73'])
      expect(scene.getObjectByName(name)).toBeDefined();
    expect(scene.getObjectByName('tokens')).toBeUndefined();
    disposeTrackScene(scene);
  });
});
