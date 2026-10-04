import { requireValue } from './requireValue';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { RacerTrack } from '../src/game/track/RacerTrack';

describe('Billboard visible route and race-time cues', () => {
  it('renders the exact supported plaza and a 16:9 passable mouth with posts outside the route', () => {
    const scene = createNeonGridScene(new NeonGrid());
    const floor = scene.getObjectByName('billboard-plaza') as THREE.Mesh;
    expect(floor).toBeDefined();
    const bounds = new THREE.Box3().setFromObject(
      requireValue(scene.getObjectByName('billboard-ad-paprika')),
    );
    const size = bounds.getSize(new THREE.Vector3());
    expect(Math.hypot(size.x, size.z) / size.y).toBeCloseTo(16 / 9, 2);
    expect(scene.getObjectByName('billboard-frame')).toBeDefined();
  });
  it('shows Paprika only OFF, rotates ON sponsors, and freezes cues when race time freezes', () => {
    const scene = createNeonGridScene(new NeonGrid());
    const visual = scene.billboard;
    expect(visual).toBeDefined();
    visual.update(0);
    expect(scene.getObjectByName('billboard-ad-arin')?.visible).toBe(true);
    visual.update(2);
    expect(scene.getObjectByName('billboard-ad-raven')?.visible).toBe(true);
    visual.update(4);
    expect(scene.getObjectByName('billboard-ad-paprika')?.visible).toBe(true);
    const mesh = scene.getObjectByName('billboard-ad-paprika') as THREE.Mesh<
      THREE.PlaneGeometry,
      THREE.ShaderMaterial
    >;
    expect(mesh.material.uniforms.opacity?.value).toBeLessThan(0.6);
    visual.smash(new THREE.Vector3(), false, 4);
    visual.update(4.3);
    const shards = scene.getObjectByName('billboard-shards') as THREE.InstancedMesh;
    const frozen = new THREE.Matrix4();
    shards.getMatrixAt(0, frozen);
    visual.update(4.3);
    const next = new THREE.Matrix4();
    shards.getMatrixAt(0, next);
    expect(next.equals(frozen)).toBe(true);
    visual.update(5);
    expect(shards.visible).toBe(false);
    expect(mesh.material.uniforms.time?.value).toBe(5);
    visual.update(5.6);
    expect(mesh.material.uniforms.tell?.value).toBeCloseTo(0.5);
    for (let i = 0; i < 100; i++) visual.smash(new THREE.Vector3(), true, 6);
    visual.update(6.1);
    expect(shards.count).toBeLessThanOrEqual(96);
  });
  it('announces a crossing once at the physical mouth, independently of the exit penalty', () => {
    const track = new NeonGrid(),
      route = new RacerTrack(track),
      gap = track.billboardGap;
    const at = (distance: number) =>
      gap.curve.getPointAt(distance / gap.curve.getLength()).add(new THREE.Vector3(0, 0.5, 0));
    route.advance(at(gap.mouthDistance - 1), at(gap.mouthDistance + 1), 0);
    expect(route.takeBillboardCrossing()).toBe(true);
    expect(route.takeBillboardCrossing()).toBeNull();
    route.advance(at(gap.mouthDistance + 1), at(gap.mouthDistance + 2), 4);
    expect(route.takeBillboardCrossing()).toBeNull();
    route.reset();
    route.advance(at(gap.mouthDistance - 1), at(gap.mouthDistance + 1), 4);
    expect(route.takeBillboardCrossing()).toBe(false);
    route.reset();
    expect(route.takeBillboardCrossing()).toBeNull();
  });
});

it('keeps every pooled shard transform finite before and after unused slots expire', () => {
  const scene = createNeonGridScene(new NeonGrid());
  scene.billboard.smash(new THREE.Vector3(10, 14, 20), true, 0);
  scene.billboard.update(0.2);
  const shards = scene.getObjectByName('billboard-shards') as THREE.InstancedMesh;
  expect(Array.from(shards.instanceMatrix.array).every(Number.isFinite)).toBe(true);
  scene.billboard.update(2);
  expect(Array.from(shards.instanceMatrix.array).every(Number.isFinite)).toBe(true);
});

it('opens rendered main walls wherever the supported plaza joins the road', () => {
  const track = new NeonGrid(),
    scene = createNeonGridScene(track);
  const walls = scene.getObjectByName('neon-grid-walls') as THREE.Group;
  let joins = 0;
  for (const child of walls.children) {
    const mesh = child as THREE.Mesh;
    const p = mesh.geometry.getAttribute('position'),
      index = requireValue(mesh.geometry.index);
    for (let i = 0; i < index.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(p, index.getX(i));
      const b = new THREE.Vector3().fromBufferAttribute(p, index.getX(i + 1));
      const c = new THREE.Vector3().fromBufferAttribute(p, index.getX(i + 2));
      const mid = a
        .add(b)
        .add(c)
        .multiplyScalar(1 / 3);
      if (track.billboardGap.junctionContains(mid)) joins++;
    }
  }
  expect(joins).toBe(0);
});

it('faces both portal ads toward racers approaching each opening', () => {
  const track = new NeonGrid(),
    scene = createNeonGridScene(track);
  scene.updateMatrixWorld(true);
  for (const [portalName, adName] of [
    ['billboard-portal-entrance', 'billboard-ad-paprika'],
    ['billboard-portal-exit', 'billboard-exit-ad-paprika'],
  ] as const) {
    const portal = requireValue(scene.getObjectByName(portalName));
    const ad = requireValue(scene.getObjectByName(adName)) as THREE.Mesh;
    const front = new THREE.Vector3(0, 0, 1).transformDirection(ad.matrixWorld);
    const fraction = track.billboardGap.fraction(track.billboardGap.project(portal.position));
    const approach = track.billboardGap.curve.getTangentAt(fraction);
    const wall = track.projectMain(portal.position).tangent;
    expect(front.dot(approach)).toBeLessThan(0);
    expect(Math.abs(front.dot(wall))).toBeGreaterThan(0.99);
  }
});

it('places entrance and exit portals at grounded main-wall aperture crossings', () => {
  const track = new NeonGrid(),
    scene = createNeonGridScene(track),
    gap = track.billboardGap;
  const portals = [
    { name: 'billboard-portal-entrance', end: 'entrance' },
    { name: 'billboard-portal-exit', end: 'exit' },
  ] as const;
  for (const { name, end } of portals) {
    const portal = requireValue(scene.getObjectByName(name));
    const position = portal.getWorldPosition(new THREE.Vector3());
    const projection = track.projectMain(position);
    expect(
      Math.abs(projection.lateralDistance - track.halfWidthAt(projection.progress)),
      end,
    ).toBeLessThan(0.12);
    const nearest = gap.project(position);
    expect(Math.abs(position.y - nearest.point.y), `${end} support grounding`).toBeLessThan(0.02);
    const adName = end === 'entrance' ? 'billboard-ad-paprika' : 'billboard-exit-ad-paprika';
    const bounds = new THREE.Box3().setFromObject(requireValue(scene.getObjectByName(adName)));
    const size = bounds.getSize(new THREE.Vector3());
    expect(Math.hypot(size.x, size.z) / size.y, `${end} artwork ratio`).toBeCloseTo(16 / 9, 2);
  }
  const entrance = requireValue(scene.getObjectByName('billboard-portal-entrance'));
  const exit = requireValue(scene.getObjectByName('billboard-portal-exit'));
  expect(entrance.position.distanceTo(exit.position)).toBeGreaterThan(20);
});
