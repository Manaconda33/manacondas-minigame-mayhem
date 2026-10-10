import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { DiveState } from '../src/game/track/NeonGridDive';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';

beforeAll(async () => {
  await RAPIER.init();
});
it('retains flight ownership and delays a missed recovery once by 1.5 race seconds', () => {
  const dive = new NeonGrid().waterfallDive;
  const state = new DiveState(dive);
  const p = dive.pointAtDistance(dive.mouthDistance);
  const before = p.clone().addScaledVector(dive.direction, -1);
  state.advance(before, p, dive.direction.clone().multiplyScalar(25), 10);
  expect(state.active).toBe(true);
  const miss = dive.pointAtDistance(19).setY(-1);
  expect(state.advance(p, miss, new THREE.Vector3(0, -5, 0), 11)).toBeNull();
  expect(state.splashing).toBe(true);
  expect(state.advance(miss, miss, new THREE.Vector3(), 12.49)).toBeNull();
  expect(state.advance(miss, miss, new THREE.Vector3(), 12.5)?.position).toEqual(
    dive.recoveryPosition,
  );
  expect(state.advance(miss, miss, new THREE.Vector3(), 20)).toBeNull();
  state.reset();
  expect(state.active).toBe(false);
  state.advance(p, before, dive.direction.clone().multiplyScalar(-25), 21);
  expect(state.active).toBe(false);
});
it('allows reverse physical entry from the landing side without forcing splash recovery', () => {
  const d = new NeonGrid().waterfallDive;
  const state = new DiveState(d);
  const reverseMouth = d.length - d.mouthDistance;
  const before = d.pointAtDistance(reverseMouth + 1);
  const after = d.pointAtDistance(reverseMouth - 1);
  const reverseVelocity = d.direction.clone().multiplyScalar(-12);
  expect(state.advance(before, after, reverseVelocity, 1)).toBeNull();
  expect(state.active).toBe(true);
  expect(state.splashing).toBe(false);
  expect(
    state.advance(
      after,
      d.pointAtDistance(d.mouthDistance - 2),
      reverseVelocity,
      2,
    ),
  ).toBeNull();
  expect(state.active).toBe(false);
});

it.each([
  { speed: 24, angle: 0, lane: 0 },
  { speed: 30, angle: 0, lane: 0 },
  { speed: 26, angle: 6, lane: 0 },
  { speed: 26, angle: -6, lane: 0 },
  { speed: 25, angle: 12, lane: 1 },
])(
  'uses native ramp flight and landing at $speed m/s angle $angle lane $lane',
  ({ speed, angle, lane }) => {
    const track = new NeonGrid(),
      dive = track.waterfallDive;
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    world.timestep = 1 / 60;
    const cleanup = createNeonGridColliders(world, track);
    const stats = characterById('aa-09').stats,
      tuning = createKartTuning(stats);
    const p = dive.pointAtDistance(dive.mouthDistance - 2).addScaledVector(dive.right, lane);
    p.y = track.projectMain(p).point.y;
    const heading = dive.direction
      .clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(angle));
    const kart = new KartController(world, tuning, stats, p, Math.atan2(heading.x, heading.z));
    for (let i = 0; i < 60; i++) world.step();
    kart.body.setLinvel({ x: heading.x * speed, y: 0, z: heading.z * speed }, true);
    const state = new DiveState(dive);
    let air = 0,
      landed = false,
      missed = false;
    for (let i = 0; i < 300; i++) {
      const previous = kart.position();
      const pr = dive.project(previous, 384);
      kart.update(
        { throttle: speed < 24 && !state.active ? 1 : 0, steering: 0, brake: false, drift: false },
        state.active ? pr.surface : 'asphalt',
        1 / 60,
      );
      world.step();
      state.advance(previous, kart.position(), kart.velocity(), i / 60);
      if (state.active && kart.feedback().airborne) air++;
      landed ||= state.landed;
      missed ||= state.splashing;
      if (landed || missed) break;
    }
    expect({ landed, missed, air, position: kart.position().toArray() }).toMatchObject(
      speed >= 24 && Math.abs(angle) <= 6
        ? { landed: true, missed: false }
        : { landed: false, missed: true },
    );
    if (landed) expect(air).toBeGreaterThan(3);
    cleanup();
    world.free();
  },
);

it('owns dive projection per racer, freezes splash at paused race time, and never moves the body or awards gates', async () => {
  const { RacerTrack } = await import('../src/game/track/RacerTrack');
  const track = new NeonGrid(),
    a = new RacerTrack(track),
    b = new RacerTrack(track),
    d = track.waterfallDive;
  const p = d.pointAtDistance(d.mouthDistance),
    v = d.direction.clone().multiplyScalar(25);
  a.advanceDive(p.clone().addScaledVector(d.direction, -1), p, v, 1);
  expect(a.project(p).pathId).toBe('waterfall-dive');
  expect(b.project(p).pathId).toBeUndefined();
  const miss = d.pointAtDistance(19).setY(-1),
    frozen = miss.clone();
  a.advanceDive(p, miss, new THREE.Vector3(0, -5, 0), 2);
  for (let i = 0; i < 100; i++)
    expect(a.advanceDive(miss, miss, new THREE.Vector3(), 2)).toBeNull();
  expect(miss.equals(frozen)).toBe(true);
  expect(a.advanceDive(miss, miss, new THREE.Vector3(), 3.5)).not.toBeNull();
  a.reset();
  expect(a.project(p).pathId).toBeUndefined();
});
it('shows bounded animated water, mist, launch tell and native support; pause freezes water', async () => {
  const { createNeonGridScene } = await import('../src/game/track/createNeonGridScene');
  const scene = createNeonGridScene(new NeonGrid());
  for (const name of [
    'waterfall-dive',
    'dive-ramp',
    'dive-landing',
    'dive-pool',
    'dive-launch-tell',
  ])
    expect(scene.getObjectByName(name)).toBeDefined();
  scene.dive.update(2);
  const water = scene.getObjectByName('dive-water') as THREE.InstancedMesh;
  const a = new THREE.Matrix4(),
    b = new THREE.Matrix4();
  water.getMatrixAt(0, a);
  scene.dive.update(2);
  water.getMatrixAt(0, b);
  expect(a.equals(b)).toBe(true);
  scene.dive.update(3);
  water.getMatrixAt(0, b);
  expect(a.equals(b)).toBe(false);
  expect(water.count).toBeLessThanOrEqual(48);
});

it('classifies a native low-speed undershoot as missed when it falls below the landing', () => {
  const track = new NeonGrid(),
    d = track.waterfallDive,
    world = new RAPIER.World({ x: 0, y: -18, z: 0 }),
    cleanup = createNeonGridColliders(world, track);
  const p = d.pointAtDistance(d.lipDistance + 0.4).setY(10.65);
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x, p.y, p.z).lockRotations(),
  );
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.72, 0.34, 1.18).setFriction(0), body);
  body.setLinvel({ x: d.direction.x * 8, y: 0, z: d.direction.z * 8 }, true);
  let missed = false;
  for (let i = 0; i < 180; i++) {
    world.step();
    const q = body.translation(),
      v = body.linvel();
    if (
      d.classifyDiveContact(new THREE.Vector3(q.x, q.y, q.z), new THREE.Vector3(v.x, v.y, v.z)) ===
      'missed'
    ) {
      missed = true;
      break;
    }
  }
  expect(missed).toBe(true);
  cleanup();
  world.free();
});

it('rearms a completed dive when backing before the mouth and applies the next miss penalty', () => {
  const d = new NeonGrid().waterfallDive,
    state = new DiveState(d),
    at = (n: number) => d.pointAtDistance(n),
    v = d.direction.clone().multiplyScalar(25);
  state.advance(at(6), at(7), v, 0);
  state.advance(at(20), at(27).setY(9.3), new THREE.Vector3(0, 0, -20), 1);
  expect(state.landed).toBe(true);
  state.advance(at(27), at(5), v.clone().negate(), 2);
  state.advance(at(5), at(7), v, 3);
  expect(state.active).toBe(true);
  state.advance(at(7), at(19).setY(-1), new THREE.Vector3(0, -5, 0), 4);
  expect(state.splashing).toBe(true);
  expect(state.advance(at(19), at(19), new THREE.Vector3(), 5.49)).toBeNull();
  expect(state.advance(at(19), at(19), new THREE.Vector3(), 5.5)).not.toBeNull();
});

it('lets an undershoot fall to the actual pool before starting splash recovery', () => {
  const d = new NeonGrid().waterfallDive,
    state = new DiveState(d),
    at = (n: number) => d.pointAtDistance(n),
    v = d.direction.clone().multiplyScalar(25);
  state.advance(at(6), at(7), v, 0);
  state.advance(at(7), at(19).setY(4), new THREE.Vector3(0, -8, 0), 1);
  expect(state.active).toBe(true);
  expect(state.splashing).toBe(false);
  state.advance(at(19).setY(4), at(20).setY(0.4), new THREE.Vector3(0, -10, 0), 2);
  expect(state.splashing).toBe(true);
  expect(state.advance(at(20), at(20), new THREE.Vector3(), 3.49)).toBeNull();
  expect(state.advance(at(20), at(20), new THREE.Vector3(), 3.5)).not.toBeNull();
});

it('pools at most eight splash rings and freezes them with race time', async () => {
  const { createNeonGridScene } = await import('../src/game/track/createNeonGridScene');
  const track = new NeonGrid(),
    scene = createNeonGridScene(track);
  for (let i = 0; i < 30; i++) scene.dive.splash(track.waterfallDive.pointAtDistance(19), 2);
  scene.dive.update(2.3);
  const rings = scene.getObjectByName('dive-splashes') as THREE.InstancedMesh;
  expect(rings.count).toBe(8);
  const a = new THREE.Matrix4(),
    b = new THREE.Matrix4();
  rings.getMatrixAt(0, a);
  scene.dive.update(2.3);
  rings.getMatrixAt(0, b);
  expect(a.equals(b)).toBe(true);
  scene.dive.update(4);
  rings.getMatrixAt(0, b);
  expect(b.elements.every(Number.isFinite)).toBe(true);
  expect(b.elements[0]).toBe(0);
});
