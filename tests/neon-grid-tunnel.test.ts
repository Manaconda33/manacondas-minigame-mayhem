import { ChaseCamera } from '../src/game/camera/ChaseCamera';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { guardrailContact } from '../src/game/track/GuardrailSystem';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';
import { SlickGroundSurface } from '../src/game/items/SlickGroundSurface';

beforeAll(async () => {
  await RAPIER.init();
});
describe('service tunnel native support and scene', () => {
  it('supports every ramp and underground crossing at its own height and removes owned colliders', () => {
    const track = new NeonGrid(),
      tunnel = track.serviceTunnel;
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const before = world.colliders.len();
    const cleanup = createNeonGridColliders(world, track);
    world.step();
    const scene = createNeonGridScene(track);
    const ground = new SlickGroundSurface(scene, true);
    for (let i = 0; i <= 88; i++) {
      const p = tunnel.curve.getPointAt(i / 88);
      for (const lane of [-1.8, 0, 1.8]) {
        const tangent = tunnel.curve.getTangentAt(i / 88);
        const q = p
          .clone()
          .addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(), lane);
        const hit = world.castRayAndGetNormal(
          new RAPIER.Ray({ x: q.x, y: q.y + 1, z: q.z }, { x: 0, y: -1, z: 0 }),
          2,
          true,
        );
        expect(hit, `floor ${String(i)}/${String(lane)}`).not.toBeNull();
        const visible = ground.at(q);
        expect(visible).not.toBeNull();
        expect(
          q.y + 1 - (hit?.timeOfImpact ?? 9),
          `native/visible ${String(i)}/${String(lane)}`,
        ).toBeCloseTo(visible?.point.y ?? 99, 2);
        expect(hit?.normal.y).toBeGreaterThan(0.95);
      }
    }
    ground.dispose();
    disposeTrackScene(scene);
    cleanup();
    cleanup();
    expect(world.colliders.len()).toBe(before);
    world.free();
  });
  it('shares visible floor with ground sampling and leaves roof above real body envelope', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track);
    expect(scene.getObjectByName('service-tunnel')).toBeDefined();
    expect(scene.getObjectByName('service-tunnel-left-wall')).toBeDefined();
    expect(scene.getObjectByName('service-tunnel-right-wall')).toBeDefined();
    expect(scene.getObjectByName('service-tunnel-roof')).toBeDefined();
    const sampler = new SlickGroundSurface(scene, true);
    const p = track.serviceTunnel.curve.getPointAt(0.5);
    expect(sampler.at(p.clone().add(new THREE.Vector3(0, 0.5, 0)))?.point.y).toBeCloseTo(p.y, 2);
    expect(track.serviceTunnel.headroom).toBeGreaterThan(1.2 + 0.34);
    sampler.dispose();
    disposeTrackScene(scene);
  });
});

it.each([-1.8, 0, 1.8])(
  'drives both ramps and underground street crossings continuously at lane %s',
  (lane) => {
    const track = new NeonGrid(),
      tunnel = track.serviceTunnel,
      route = new RacerTrack(track);
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const cleanup = createNeonGridColliders(world, track);
    const stats = characterById('aa-09').stats,
      tuning = createKartTuning(stats);
    const point = tunnel.curve.getPointAt(4 / tunnel.curve.getLength());
    const tangent = tunnel.curve.getTangentAt(4 / tunnel.curve.getLength());
    point.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(), lane);
    const kart = new KartController(world, tuning, stats, point, Math.atan2(tangent.x, tangent.z));
    for (let i = 0; i < 60; i++) world.step();
    kart.body.setLinvel({ x: tangent.x * 20, y: 0, z: tangent.z * 20 }, true);
    let minimumClearance = 99,
      worstLoss = 0,
      roofContact = false;
    for (let i = 0; i < 600; i++) {
      const before = kart.position(),
        projection = tunnel.project(before);
      const d = tunnel.fraction(projection) * tunnel.curve.getLength();
      if (d > tunnel.curve.getLength() - 2) break;
      const target = tunnel.curve.getPointAt(Math.min(1, (d + 8) / tunnel.curve.getLength()));
      const t = tunnel.curve.getTangentAt(Math.min(1, (d + 8) / tunnel.curve.getLength()));
      target.addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), lane);
      const desired = target.sub(before).setY(0).normalize(),
        forward = kart.forward();
      kart.update(
        {
          throttle: 1,
          steering: THREE.MathUtils.clamp(
            (forward.z * desired.x - forward.x * desired.z) * 2.6,
            -1,
            1,
          ),
          brake: false,
          drift: false,
        },
        'asphalt',
        1 / 60,
      );
      const speed = kart.speedMetersPerSecond();
      world.step();
      route.advance(before, kart.position());
      worstLoss = Math.max(worstLoss, speed - kart.speedMetersPerSecond());
      const contact = guardrailContact(route, kart.position(), 1.15);
      if (contact)
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
      const after = kart.position(),
        floor = tunnel.project(after).point.y;
      minimumClearance = Math.min(minimumClearance, after.y - floor);
      if (floor < -3.99 && after.y + 0.34 > floor + tunnel.headroom - 0.01) roofContact = true;
    }
    expect(tunnel.fraction(tunnel.project(kart.position()))).toBeGreaterThan(0.95);
    expect(minimumClearance).toBeGreaterThan(0.2);
    expect(worstLoss).toBeLessThan(1.83);
    expect(roofContact).toBe(false);
    cleanup();
    world.free();
  },
);

it.each([false, true])('keeps a roofed tunnel camera below its ceiling, rear=%s', (rear) => {
  const track = new NeonGrid(),
    tunnel = track.serviceTunnel,
    p = tunnel.curve.getPointAt(0.5),
    t = tunnel.curve.getTangentAt(0.5);
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 2000),
    chase = new ChaseCamera(camera);
  const kart = p.clone().add(new THREE.Vector3(0, 0.5, 0));
  for (let i = 0; i < 240; i++)
    chase.update(kart, t, rear, 1 / 60, p.y, p.y + tunnel.headroom - 0.35);
  expect(camera.position.y).toBeLessThan(p.y + tunnel.headroom - 0.1);
  const scene = createNeonGridScene(track);
  scene.updateMatrixWorld(true);
  const roof = scene.getObjectByName('service-tunnel-roof');
  if (!roof) throw new Error('Missing roof');
  const ray = new THREE.Raycaster(
    camera.position,
    kart.clone().sub(camera.position).normalize(),
    0,
    camera.position.distanceTo(kart),
  );
  expect(ray.intersectObject(roof)).toHaveLength(0);
  disposeTrackScene(scene);
});
