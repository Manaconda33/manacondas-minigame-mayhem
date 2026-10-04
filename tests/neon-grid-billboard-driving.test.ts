import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { billboardFloorGeometry } from '../src/game/track/NeonGridBillboard';
import { neonGridRibbon } from '../src/game/track/NeonGridGeometry';
import { KartController } from '../src/game/physics/KartController';
import { AiDriver } from '../src/game/ai/AiDriver';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { guardrailContact } from '../src/game/track/GuardrailSystem';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';

beforeAll(async () => {
  await RAPIER.init();
});
it('supports the entire plaza and owns no solid hologram collider', () => {
  const track = new NeonGrid(),
    gap = track.billboardGap;
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
  const cleanup = createNeonGridColliders(world, track);
  let plazaHandle = -1;
  world.colliders.forEach((c) => {
    plazaHandle = c.handle;
  });
  const visible = new THREE.Group();
  visible.add(new THREE.Mesh(neonGridRibbon(track)), new THREE.Mesh(billboardFloorGeometry(gap)));
  visible.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  world.step();
  for (let i = 1; i < 40; i++) {
    const p = gap.curve.getPointAt(i / 40),
      t = gap.curve.getTangentAt(i / 40),
      r = new THREE.Vector3(t.z, 0, -t.x).normalize();
    for (const lane of [-3, 0, 3]) {
      const q = p.clone().addScaledVector(r, lane);
      const lift = i / 40 > 400 / 512 ? 5 : 1;
      // Before the repaired join inspect the unchanged isolated plaza; at the
      // join the shared main boundary owns the single native/render surface.
      const hit = world.castRayAndGetNormal(
        new RAPIER.Ray({ x: q.x, y: q.y + lift, z: q.z }, { x: 0, y: -1, z: 0 }),
        lift + 1,
        true,
        undefined,
        undefined,
        undefined,
        undefined,
        (c) => i / 40 > 400 / 512 || c.handle === plazaHandle,
      );
      expect(hit, `support ${String(i)}/${String(lane)}`).not.toBeNull();
      if (i / 40 <= 400 / 512) {
        expect(q.y + lift - (hit?.timeOfImpact ?? 99)).toBeCloseTo(p.y, 2);
      } else {
        // The single joined support replaces the old conflicting overlap.
        // Native support must match the actual rendered floor, including its shared edge.
        ray.set(new THREE.Vector3(q.x, q.y + lift, q.z), new THREE.Vector3(0, -1, 0));
        const rendered = ray.intersectObject(visible, true)[0];
        expect(rendered).toBeDefined();
        expect(q.y + lift - (hit?.timeOfImpact ?? 99)).toBeCloseTo(rendered?.point.y ?? -99, 3);
      }
      expect(hit?.normal.y).toBeGreaterThan(0.85);
    }
  }
  // The common main road owns support at the exact joined boundary; an
  // isolated triangle ray at a Float32 end edge is not the support contract.
  for (const fraction of [0, 1]) {
    const p = gap.curve.getPointAt(fraction),
      t = gap.curve.getTangentAt(fraction);
    const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
    for (const lane of [-3, 0, 3]) {
      const q = p.clone().addScaledVector(right, lane);
      const hit = world.castRay(
        new RAPIER.Ray({ x: q.x, y: q.y + 1, z: q.z }, { x: 0, y: -1, z: 0 }),
        2,
        true,
      );
      expect(hit).not.toBeNull();
      expect(Math.abs(q.y + 1 - (hit?.timeOfImpact ?? 99) - p.y)).toBeLessThan(0.05);
    }
  }
  const t = gap.curve.getTangentAt(0),
    p = gap.curve
      .getPointAt(0)
      .addScaledVector(t, 3)
      .add(new THREE.Vector3(0, 1, 0));
  expect(world.castRay(new RAPIER.Ray(p, t), 25, true)).toBeNull();
  visible.traverse((object) => {
    if (object instanceof THREE.Mesh) (object as THREE.Mesh).geometry.dispose();
  });
  cleanup();
  cleanup();
  expect(world.colliders.len()).toBe(0);
  world.free();
});
it('does not cap or repeatedly reduce a controller while on static; exit is an explicit event', () => {
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 }),
    track = new NeonGrid();
  const cleanup = createNeonGridColliders(world, track);
  const stats = characterById('aa-09').stats,
    tuning = createKartTuning(stats),
    gap = track.billboardGap;
  const p = gap.curve.getPointAt(0.5),
    t = gap.curve.getTangentAt(0.5);
  const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
  for (let i = 0; i < 60; i++) world.step();
  kart.body.setLinvel({ x: t.x * 28, y: 0, z: t.z * 28 }, true);
  for (let i = 0; i < 10; i++) {
    kart.update({ throttle: 1, steering: 0, brake: false, drift: false }, 'static', 1 / 60);
    world.step();
  }
  expect(kart.speedMetersPerSecond()).toBeGreaterThan(27);
  const before = kart.speedMetersPerSecond();
  kart.retainPlanarVelocity(0.82);
  expect(kart.speedMetersPerSecond()).toBeCloseTo(before * 0.82, 4);
  cleanup();
  world.free();
});
it('allows configured AI entry without changing the existing tunnel choice stream', () => {
  const track = new NeonGrid(),
    gap = track.billboardGap;
  const yes = new RacerTrack(track, 1, 1, 1),
    no = new RacerTrack(track, 1, 1, 0),
    rocket = new RacerTrack(track, 1, 1, 1);
  const progress = gap.entry.progress[0] - 25 / track.curve.getLength(),
    p = track.curve.getPointAt(progress),
    t = track.curve.getTangentAt(progress);
  yes.prepareAiRoute(p, t, 20);
  no.prepareAiRoute(p, t, 20);
  rocket.prepareAiRoute(p, t, 20, false);
  expect(yes.navigationAt(p, 10).pathId).toBeUndefined();
  const approachProgress = gap.entry.progress[0] - 19 / track.curve.getLength();
  const approach = track.curve.getPointAt(approachProgress);
  const heading = track.curve.getTangentAt(approachProgress);
  yes.prepareAiRoute(approach, heading, 20);
  expect(yes.navigationAt(approach, 10).pathId).toBe('billboard-gap');
  const input = new AiDriver(yes, { laneOffset: 0, pace: 0.6, aggression: 0.6 }, 30).input(
    approach,
    heading,
    15,
  );
  expect(input.brake).toBe(false);
  expect(input.throttle).toBeGreaterThan(0);
  expect(no.navigationAt(p, 10).pathId).toBeUndefined();
  expect(rocket.navigationAt(p, 10).pathId).toBeUndefined();
  const tunnelProgress = track.serviceTunnel.entry.progress[0] - 25 / track.curve.getLength();
  for (const route of [yes, no]) {
    route.prepareAiRoute(
      track.curve.getPointAt(tunnelProgress),
      track.curve.getTangentAt(tunnelProgress),
      20,
    );
    expect(route.navigationAt(track.curve.getPointAt(tunnelProgress), 10).pathId).toBe(
      'service-tunnel',
    );
  }
});

it.each([
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
])(
  'physically traces all ordered gates for three laps with tunnel=%s billboard=%s',
  (tunnelRate, billboardRate) => {
    const track = new NeonGrid(),
      route = new RacerTrack(track, 1, tunnelRate, billboardRate);
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 }),
      cleanup = createNeonGridColliders(world, track);
    const stats = characterById('aa-09').stats,
      tuning = createKartTuning(stats),
      p = track.curve.getPointAt(0.001),
      t = track.curve.getTangentAt(0.001);
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
    const driver = new AiDriver(
        route,
        { laneOffset: 0, pace: 0.6, aggression: 0.6 },
        tuning.maxSpeed,
      ),
      laps = new LapTracker(),
      crossed: number[] = [];
    let billboardSteps = 0,
      exitEvents = 0;
    for (let i = 0; i < 60 * 360 && !laps.snapshot().finished; i++) {
      const before = kart.position(),
        projection = route.project(before);
      kart.update(
        driver.input(before, kart.forward(), kart.speedMetersPerSecond()),
        projection.surface,
        1 / 60,
      );
      world.step();
      const event = route.advance(before, kart.position(), i / 60);
      if (event) {
        exitEvents++;
        kart.retainPlanarVelocity(event.speedRetention);
      }
      if (route.project(kart.position()).pathId === 'billboard-gap') billboardSteps++;
      const contact = guardrailContact(route, kart.position(), 1.15);
      if (contact)
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
      const gate = laps.snapshot().nextCheckpoint;
      if (
        crossesForwardCheckpointGate(
          before,
          kart.position(),
          track.lapCheckpointPosition(gate),
          track.lapCheckpointTangent(gate),
          13,
          1.5,
        )
      ) {
        laps.enterCheckpoint(gate, 1, i / 60);
        crossed.push(gate);
      }
    }
    expect({
      crossed,
      billboardSteps,
      exitEvents,
      position: kart.position().toArray(),
    }).toMatchObject({
      crossed: Array.from({ length: 3 }, () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]).flat(),
      exitEvents: billboardRate ? 3 : 0,
    });
    if (billboardRate) expect(billboardSteps).toBeGreaterThan(300);
    cleanup();
    world.free();
  },
  30000,
);

it.each(
  [12, 24, 30].flatMap((speed) =>
    [-2, 0, 2].flatMap((lane) => [0, 4].map((phase) => ({ speed, lane, phase }))),
  ),
)(
  'supports KartController passage with curve-following input at $speed m/s, lane $lane, phase $phase',
  ({ speed, lane, phase }) => {
    const track = new NeonGrid(),
      gap = track.billboardGap,
      route = new RacerTrack(track);
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 }),
      cleanup = createNeonGridColliders(world, track);
    const stats = characterById('aa-09').stats,
      tuning = createKartTuning(stats),
      t = gap.curve.getTangentAt((gap.mouthDistance - 2) / gap.curve.getLength()),
      r = new THREE.Vector3(t.z, 0, -t.x).normalize();
    const p = gap.curve
      .getPointAt((gap.mouthDistance - 2) / gap.curve.getLength())
      .addScaledVector(r, lane);
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
    for (let i = 0; i < 60; i++) world.step();
    kart.body.setLinvel({ x: t.x * speed, y: 0, z: t.z * speed }, true);
    let entered = false,
      events = 0,
      belowFloor = false;
    for (let i = 0; i < 600; i++) {
      const before = kart.position();
      const distance = gap.fraction(gap.project(before)) * gap.curve.getLength();
      const target = gap.curve.getPointAt(Math.min(1, (distance + 6) / gap.curve.getLength()));
      const desired = target.sub(before).setY(0).normalize(),
        forward = kart.forward();
      const steering = THREE.MathUtils.clamp(
        (forward.z * desired.x - forward.x * desired.z) * 2.6,
        -1,
        1,
      );
      kart.update(
        { throttle: 1, steering, brake: false, drift: false },
        route.project(before).surface,
        1 / 60,
      );
      world.step();
      const event = route.advance(before, kart.position(), phase);
      entered ||= route.project(kart.position()).pathId === 'billboard-gap';
      belowFloor ||= kart.position().y < gap.project(kart.position()).point.y - 0.5;
      if (event) {
        const exitSpeed = kart.speedMetersPerSecond();
        kart.retainPlanarVelocity(event.speedRetention);
        expect(kart.speedMetersPerSecond()).toBeCloseTo(exitSpeed * (phase === 0 ? 0.82 : 1), 4);
        events++;
        break;
      }
      const contact = guardrailContact(route, kart.position(), 1.15);
      if (contact)
        kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
    }
    expect({ entered, events, belowFloor, position: kart.position().toArray() }).toMatchObject({
      entered: true,
      events: 1,
      belowFloor: false,
    });
    cleanup();
    world.free();
  },
);
