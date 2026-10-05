// @vitest-environment node
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { beforeAll, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { RacerTrack } from '../src/game/track/RacerTrack';
import { createNeonGridColliders } from '../src/game/track/NeonGridCollision';
import { KartController } from '../src/game/physics/KartController';
import { createKartTuning } from '../src/config/kartTuning';
import { characterById } from '../src/characters/manifest';

beforeAll(async () => {
  await RAPIER.init();
});
it.each([-2, 0, 2])(
  'moves continuously through the real exit at lane %s',
  (lane) => {
    const track = new NeonGrid(),
      gap = track.billboardGap,
      route = new RacerTrack(track);
    const world = new RAPIER.World({ x: 0, y: -18, z: 0 });
    const cleanup = createNeonGridColliders(world, track);
    const stats = characterById('aa-09').stats,
      tuning = createKartTuning(stats);
    const t = gap.curve.getTangentAt(0.82).setY(0).normalize();
    const p = gap.curve.getPointAt(0.82).addScaledVector(new THREE.Vector3(t.z, 0, -t.x), lane);
    const kart = new KartController(world, tuning, stats, p, Math.atan2(t.x, t.z));
    for (let i = 0; i < 90; i++) world.step();
    const mouth = gap.mouthDistance / gap.curve.getLength();
    route.advance(
      gap.curve.getPointAt(mouth - 0.001).add(new THREE.Vector3(0, 0.4, 0)),
      gap.curve.getPointAt(mouth + 0.001).add(new THREE.Vector3(0, 0.4, 0)),
      4,
    );
    kart.body.setLinvel({ x: t.x * 12, y: 0, z: t.z * 12 }, true);
    let minimumRatio = Infinity,
      exits = 0,
      air = 0;
    for (let i = 0; i < 180; i++) {
      const before = kart.position(),
        pr = route.project(before);
      const d = gap.fraction(gap.project(before)) * gap.curve.getLength() + 6;
      const onGap = pr.pathId === 'billboard-gap' && d < gap.curve.getLength();
      const progress =
        pr.pathId === 'billboard-gap'
          ? gap.exitProgress + (d - gap.curve.getLength()) / track.curve.getLength()
          : track.projectMain(before).progress + 6 / track.curve.getLength();
      const target = onGap
        ? gap.curve.getPointAt(d / gap.curve.getLength())
        : track.curve.getPointAt(progress);
      const tangent = onGap
        ? gap.curve.getTangentAt(d / gap.curve.getLength())
        : track.curve.getTangentAt(progress);
      target.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x).normalize(), lane);
      const desired = target.sub(before).setY(0).normalize(),
        forward = kart.forward();
      const angle = Math.atan2(forward.z * desired.x - forward.x * desired.z, forward.dot(desired));
      kart.update(
        {
          throttle: 1,
          steering: THREE.MathUtils.clamp(angle * 2.5, -1, 1),
          brake: false,
          drift: false,
        },
        pr.surface,
        1 / 60,
      );
      const expected = kart.speedMetersPerSecond() / 60;
      world.step();
      const after = kart.position();
      if (gap.fraction(gap.project(after)) > 0.9 && track.projectMain(after).progress < 0.235) {
        minimumRatio = Math.min(
          minimumRatio,
          Math.hypot(after.x - before.x, after.z - before.z) / expected,
        );
        if (kart.feedback().airborne) air++;
      }
      if (route.advance(before, after, 4)) exits++;
    }
    cleanup();
    world.free();
    expect(minimumRatio).toBeGreaterThan(0.9);
    expect(exits).toBe(1);
    expect(air).toBe(0);
  },
  30000,
);

it('retains the accepted main support byte-for-byte and removes exit overlap', async () => {
  const { neonGridRibbon } = await import('../src/game/track/NeonGridGeometry');
  const { billboardFloorGeometry } = await import('../src/game/track/NeonGridBillboard');
  const track = new NeonGrid(),
    main = neonGridRibbon(track),
    plaza = billboardFloorGeometry(track.billboardGap);
  const mainIndex = main.getIndex(),
    plazaIndex = plaza.getIndex();
  if (!mainIndex || !plazaIndex) throw new Error('Indexed floors required');
  const parts = [
    new Uint8Array(main.getAttribute('position').array.buffer),
    new Uint8Array(mainIndex.array.buffer),
    new TextEncoder().encode(JSON.stringify(main.groups)),
  ];
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  expect(hash).toBe('3ac25d647b1c9953dd987594964cf3c404fee749f282691be20d34eb3c9eadc1');
  const triangle = (g: THREE.BufferGeometry, index: number) => {
    const indices = g.getIndex();
    if (!indices) throw new Error('Indexed floors required');
    return [0, 1, 2].map((offset) =>
      new THREE.Vector3().fromBufferAttribute(
        g.getAttribute('position'),
        indices.getX(index + offset),
      ),
    ) as [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  };
  const cross = (a: THREE.Vector3, b: THREE.Vector3, p: THREE.Vector3) =>
    (b.z - a.z) * (p.x - a.x) - (b.x - a.x) * (p.z - a.z);
  let overlap = 0;
  for (let i = 2400; i < plazaIndex.count; i += 3) {
    const points = triangle(plaza, i);
    const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
    expect(normal.y).toBeGreaterThan(0);
    expect((Math.atan2(Math.hypot(normal.x, normal.z), normal.y) * 180) / Math.PI).toBeLessThan(16);
    for (let row = 280; row < 340; row++)
      for (let face = 0; face < 2; face++) {
        const clip = triangle(main, (row * 2 + face) * 3);
        let polygon: THREE.Vector3[] = points;
        for (let edge = 0; edge < 3 && polygon.length; edge++) {
          const a = clip[edge] ?? new THREE.Vector3(),
            b = clip[(edge + 1) % 3] ?? new THREE.Vector3(),
            output: THREE.Vector3[] = [];
          for (let j = 0; j < polygon.length; j++) {
            const p = polygon[j] ?? new THREE.Vector3(),
              q = polygon[(j + 1) % polygon.length] ?? new THREE.Vector3(),
              before = cross(a, b, p),
              after = cross(a, b, q);
            if (before >= 0) output.push(p);
            if (before >= 0 !== after >= 0)
              output.push(p.clone().lerp(q, before / (before - after)));
          }
          polygon = output;
        }
        let area = 0;
        for (let j = 0; j < polygon.length; j++) {
          const a = polygon[j] ?? new THREE.Vector3(),
            b = polygon[(j + 1) % polygon.length] ?? new THREE.Vector3();
          area += a.x * b.z - a.z * b.x;
        }
        overlap += Math.abs(area) / 2;
      }
  }
  // Float32 intersection rounding leaves micrometre-scale shared-edge slivers.
  // This area tolerance is 0.0001 square metres across the entire join.
  expect(overlap).toBeLessThan(1e-4);
  main.dispose();
  plaza.dispose();
});

it('keeps the repaired exit inlay on the rendered support', async () => {
  const { createNeonGridScene } = await import('../src/game/track/createNeonGridScene');
  const track = new NeonGrid(),
    scene = createNeonGridScene(track);
  scene.updateMatrixWorld(true);
  const inlay = scene.getObjectByName('billboard-plaza-inlay') as THREE.LineSegments;
  const positions = inlay.geometry.getAttribute('position');
  const road = scene.getObjectByName('track-road'),
    plaza = scene.getObjectByName('billboard-plaza');
  if (!road || !plaza) throw new Error('Shared rendered floors required');
  const ray = new THREE.Raycaster();
  let checked = 0;
  for (let i = 0; i < positions.count; i++) {
    const p = new THREE.Vector3().fromBufferAttribute(positions, i),
      q = track.billboardGap.project(p);
    if (track.billboardGap.fraction(q) <= 400 / 512 || q.lateralDistance > 3) continue;
    ray.set(new THREE.Vector3(p.x, p.y + 5, p.z), new THREE.Vector3(0, -1, 0));
    const support = ray.intersectObjects([road, plaza], false)[0];
    expect(support).toBeDefined();
    expect(p.y - (support?.point.y ?? -99)).toBeCloseTo(0.012, 3);
    checked++;
  }
  expect(checked).toBeGreaterThan(20);
}, 15000);
