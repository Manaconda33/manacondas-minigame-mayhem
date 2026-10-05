import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { billboardFloorGeometry } from '../src/game/track/NeonGridBillboard';
import { linearJoinBlend } from '../src/game/track/BillboardExitGeometry';
import { neonGridRibbon } from '../src/game/track/NeonGridGeometry';
import { AiDriver } from '../src/game/ai/AiDriver';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';
import { guardrailContact } from '../src/game/track/GuardrailSystem';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';

beforeAll(async () => {
  await RAPIER.init();
});

it('joins the early descent without a heading kink and projects the curved driving line', () => {
  const track = new NeonGrid(),
    gap = track.billboardGap;
  expect(gap.curve.getPointAt(1).y).toBeLessThan(8);
  for (const fraction of [0, 1]) {
    const progress = fraction === 0 ? gap.entry.progress[0] : gap.exitProgress;
    expect(
      gap.curve.getTangentAt(fraction).dot(track.curve.getTangentAt(progress)),
    ).toBeGreaterThan(0.999);
  }
  for (const fraction of [0.12, 0.35, 0.65, 0.88]) {
    const p = gap.curve.getPointAt(fraction),
      t = gap.curve.getTangentAt(fraction);
    const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
    for (const lane of [-2, 0, 2]) {
      const q = gap.project(p.clone().addScaledVector(right, lane));
      expect(q.point.distanceTo(p)).toBeLessThan(0.12);
      expect(q.lateralOffset).toBeCloseTo(lane, 1);
      expect(gap.fraction(q)).toBeCloseTo(fraction, 2);
    }
  }
});

it('keeps both portal frames out of the main route except at supported wall openings', () => {
  const track = new NeonGrid(),
    scene = createNeonGridScene(track);
  scene.updateMatrixWorld(true);
  for (const name of ['billboard-frame', 'billboard-exit-frame']) {
    const frame = scene.getObjectByName(name);
    if (!frame) throw new Error(`Missing ${name}`);
    frame.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const mesh = object as THREE.Mesh;
      const positions = mesh.geometry.getAttribute('position');
      const indices = mesh.geometry.getIndex();
      expect(indices).not.toBeNull();
      if (!indices) throw new Error('Frame requires indexed geometry');
      for (let triangle = 0; triangle < indices.count; triangle += 3) {
        const corners = [0, 1, 2].map((offset) =>
          new THREE.Vector3()
            .fromBufferAttribute(positions, indices.getX(triangle + offset))
            .applyMatrix4(object.matrixWorld),
        ) as [THREE.Vector3, THREE.Vector3, THREE.Vector3];
        for (let a = 0; a <= 10; a++)
          for (let b = 0; b <= 10 - a; b++) {
            const point = corners[0]
              .clone()
              .multiplyScalar(a / 10)
              .addScaledVector(corners[1], b / 10)
              .addScaledVector(corners[2], 1 - (a + b) / 10);
            const main = track.projectMain(point.clone().setY(14));
            const clearance = main.lateralDistance - track.halfWidthAt(main.progress);
            if (clearance > 0.5) continue;
            const support = track.billboardGap.project(point);
            const grounded = point.clone().setY(support.point.y);
            expect(
              track.billboardGap.junctionContains(grounded),
              `${name} overlaps main route outside its supported aperture`,
            ).toBe(true);
          }
      }
    });
  }
});

it('supports every lane of the descending curved plaza with upward native faces', () => {
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
      t = gap.curve.getTangentAt(i / 40);
    const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
    for (const lane of [-3, 0, 3]) {
      const q = p.clone().addScaledVector(right, lane);
      const lift = i / 40 > 400 / 512 ? 5 : 1;
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
      expect(hit, `plaza ${String(i)}/${String(lane)}`).not.toBeNull();
      if (i / 40 <= 400 / 512) {
        expect(q.y + lift - (hit?.timeOfImpact ?? 99)).toBeCloseTo(p.y, 1);
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
  cleanup();
  world.free();
});

function driveSection(shortcut: boolean, speed: number, phase = 1, character = 'aa-09') {
  const track = new NeonGrid(),
    route = new RacerTrack(track, 1, 0, shortcut ? 1 : 0);
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 }),
    cleanup = createNeonGridColliders(world, track);
  const stats = characterById(character).stats,
    tuning = createKartTuning(stats);
  const p = track.curve.getPointAt(0.07),
    t = track.curve.getTangentAt(0.07);
  const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
  const driver = new AiDriver(
    route,
    { laneOffset: 0, pace: 0.6, aggression: 0.6 },
    tuning.maxSpeed,
  );
  for (let i = 0; i < 60; i++) world.step();
  kart.body.setLinvel({ x: t.x * speed, y: 0, z: t.z * speed }, true);
  let entered = false,
    events = 0,
    contacts = 0,
    seconds = Infinity,
    billboardBoostSteps = 0;
  const crossed: number[] = [];
  for (let i = 0; i < 60 * 30; i++) {
    const before = kart.position();
    const beforeProjection = route.project(before);
    if (beforeProjection.pathId === 'billboard-gap' && beforeProjection.surface === 'boost')
      billboardBoostSteps++;
    kart.update(
      driver.input(before, kart.forward(), kart.speedMetersPerSecond()),
      beforeProjection.surface,
      1 / 60,
    );
    world.step();
    const event = route.advance(before, kart.position(), phase);
    entered ||= route.project(kart.position()).pathId === 'billboard-gap';
    if (event) {
      events++;
      kart.retainPlanarVelocity(event.speedRetention);
    }
    const contact = guardrailContact(route, kart.position(), 1.15);
    if (contact) {
      contacts++;
      kart.resolveStaticBarrierCollision(contact.inwardNormal, contact.penetration, 0.82, 0.22);
    }
    for (const gate of Array.from({ length: 12 }, (_, i) => i))
      if (
        crossesForwardCheckpointGate(
          before,
          kart.position(),
          track.lapCheckpointPosition(gate),
          track.lapCheckpointTangent(gate),
          13,
          1.5,
        )
      )
        crossed.push(gate);
    if (
      crossesForwardCheckpointGate(
        before,
        kart.position(),
        track.curve.getPointAt(0.236),
        track.curve.getTangentAt(0.236),
        6,
        1.5,
      )
    ) {
      seconds = (i + 1) / 60;
      break;
    }
  }
  cleanup();
  world.free();
  return { seconds, entered, events, contacts, crossed, billboardBoostSteps };
}

it('records paired Billboard balance measurements with the approved boost pad', () => {
  const rows = ['aa-01', 'aa-09'].flatMap((character) =>
    [12, 22, 30].map((speed) => {
      const main = driveSection(false, speed, 1, character),
        off = driveSection(true, speed, 1, character),
        on = driveSection(true, speed, 0, character);
      expect(off).toMatchObject({ entered: true, events: 1, contacts: 0 });
      expect(on).toMatchObject({ entered: true, events: 1, contacts: 0 });
      expect(off.billboardBoostSteps).toBeGreaterThan(0);
      expect(on.billboardBoostSteps).toBeGreaterThan(0);
      return {
        character,
        speed,
        main: main.seconds,
        off: off.seconds,
        on: on.seconds,
        offSaving: main.seconds - off.seconds,
        onSaving: main.seconds - on.seconds,
        tellSeparation: on.seconds - off.seconds,
      };
    }),
  );
  console.info('BILLBOARD_BALANCE_MEASUREMENTS ' + JSON.stringify(rows));
  expect(rows.every((row) => Number.isFinite(row.offSaving) && Number.isFinite(row.onSaving))).toBe(
    true,
  );
});

it.each([12, 22, 30])(
  'earns a clean time advantage through real route selection at %s m/s',
  (speed) => {
    const main = driveSection(false, speed),
      gap = driveSection(true, speed);
    expect(main.crossed).toEqual([1, 2, 3, 4]);
    expect(gap).toMatchObject({ entered: true, events: 1, contacts: 0, crossed: [1, 2, 3, 4] });
    expect(main.seconds - gap.seconds).toBeGreaterThan(0.2);
  },
  30000,
);

it('does not project an open shortcut onto a fictitious closing edge', async () => {
  const { TrackSegmentIndex } = await import('../src/game/track/TrackSegmentIndex');
  const index = new TrackSegmentIndex(
    [new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0), new THREE.Vector3(10, 0, 10)],
    false,
  );
  expect(index.nearest(new THREE.Vector3(5, 0, 5)).point.toArray()).toEqual([5, 0, 0]);
});

it('keeps the inside driving edges from folding back at the curved joins', () => {
  const gap = new NeonGrid().billboardGap;
  for (const lane of [-4, 4]) {
    let previous: THREE.Vector3 | undefined;
    for (let i = 0; i <= 512; i++) {
      const fraction = i / 512,
        p = gap.curve.getPointAt(fraction),
        t = gap.curve.getTangentAt(fraction);
      const edge = p.addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), lane);
      if (previous) expect(edge.clone().sub(previous).dot(t)).toBeGreaterThan(0);
      previous = edge;
    }
  }
});

it('keeps the supported plaza approach asphalt without selecting a route before the ad', () => {
  const track = new NeonGrid(),
    gap = track.billboardGap,
    route = new RacerTrack(track);
  const p = gap.curve
    .getPointAt((gap.mouthDistance - 1) / gap.curve.getLength())
    .add(new THREE.Vector3(0, 0.4, 0));
  expect(route.project(p).pathId).toBeUndefined();
  expect(route.project(p).surface).toBe('asphalt');
});


it('keeps a gradual constant grade through the shortcut height join', () => {
  expect(linearJoinBlend(0)).toBe(0);
  expect(linearJoinBlend(1)).toBe(1);
  expect(linearJoinBlend(0.5)).toBeCloseTo(0.5, 6);
  expect(linearJoinBlend(0.01)).toBeCloseTo(0.01, 6);
  expect(1 - linearJoinBlend(0.99)).toBeCloseTo(0.01, 6);
  let maximumGradeScale = 0;
  for (let i = 0; i < 1000; i++)
    maximumGradeScale = Math.max(
      maximumGradeScale,
      (linearJoinBlend((i + 1) / 1000) - linearJoinBlend(i / 1000)) * 1000,
    );
  expect(maximumGradeScale).toBeCloseTo(1, 3);
});
