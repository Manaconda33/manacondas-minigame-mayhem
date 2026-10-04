import * as THREE from 'three';
import { expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { NeonGridDiveVisual } from '../src/game/track/NeonGridDiveVisual';

// Catches the reported detached falls: source must meet the actual ramp lip,
// feed must enter from its left, and the cascade must reach the pool.
it('bonds the flowing water to the supported ramp and carries it from a left waterway to the pool', () => {
  const dive = new NeonGrid().waterfallDive;
  const visual = new NeonGridDiveVisual(dive);
  const flow = visual.group.getObjectByName('dive-ramp-water') as THREE.Mesh;
  const feed = visual.group.getObjectByName('dive-waterway') as THREE.Mesh;
  const falls = visual.group.getObjectByName('dive-water-sheet') as THREE.Mesh;
  expect(flow).toBeDefined();
  expect(feed).toBeDefined();
  expect(falls).toBeDefined();
  const ramp = dive.rampGeometry.getAttribute('position');
  const surface = flow.geometry.getAttribute('position');
  expect(surface.count).toBe(ramp.count);
  for (let i = 0; i < ramp.count; i++) {
    expect(surface.getX(i)).toBeCloseTo(ramp.getX(i), 4);
    expect(surface.getZ(i)).toBeCloseTo(ramp.getZ(i), 4);
    expect(surface.getY(i) - ramp.getY(i)).toBeCloseTo(0.035, 4);
  }
  const vertices = (mesh: THREE.Mesh) => {
    const p = mesh.geometry.getAttribute('position');
    return Array.from({ length: p.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(p, i));
  };
  const source = vertices(feed);
  expect(Math.min(...source.map((p) => dive.lane(p)))).toBeLessThan(-20);
  expect(source.some((p) => Math.abs(dive.lane(p)) < 2.8)).toBe(true);
  const sheet = vertices(falls);
  const lip = vertices(flow).filter((p) => Math.abs(dive.distance(p) - 16) < 0.001);
  for (const p of lip) expect(Math.min(...sheet.map((q) => q.distanceTo(p)))).toBeLessThan(0.001);
  expect(Math.max(...sheet.map((p) => p.y))).toBeCloseTo(10.335, 3);
  expect(Math.min(...sheet.map((p) => p.y))).toBeCloseTo(0.08, 3);
  expect(Math.max(...sheet.map((p) => dive.distance(p)))).toBeLessThan(20);
});

it('freezes procedural flow with race time and keeps spray below the flight sightline', () => {
  const visual = new NeonGridDiveVisual(new NeonGrid().waterfallDive);
  const water = visual.group.getObjectByName('dive-water-sheet') as THREE.Mesh;
  expect(water).toBeDefined();
  const material = water.material as THREE.ShaderMaterial;
  visual.update(2);
  expect(material.uniforms.time?.value).toBe(2);
  visual.update(2);
  expect(material.uniforms.time?.value).toBe(2);
  visual.update(3);
  expect(material.uniforms.time?.value).toBe(3);
  expect(material.depthWrite).toBe(false);
  const mist = visual.group.getObjectByName('dive-mist') as THREE.InstancedMesh;
  for (let i = 0; i < mist.count; i++) {
    const matrix = new THREE.Matrix4();
    mist.getMatrixAt(i, matrix);
    expect(new THREE.Vector3().setFromMatrixPosition(matrix).y).toBeLessThan(2);
  }
  let meshes = 0;
  visual.group.traverse((o) => {
    if (o instanceof THREE.Mesh) meshes++;
  });
  expect(meshes).toBeLessThanOrEqual(18);
});

it('joins both waterway edges flush to the sloping ramp rather than hovering across it', () => {
  const dive = new NeonGrid().waterfallDive;
  const visual = new NeonGridDiveVisual(dive);
  const feed = visual.group.getObjectByName('dive-waterway') as THREE.Mesh;
  const p = feed.geometry.getAttribute('position');
  const ramp = new THREE.Mesh(
    dive.rampGeometry,
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
  );
  for (const i of [p.count - 2, p.count - 1]) {
    const q = new THREE.Vector3().fromBufferAttribute(p, i);
    const ray = new THREE.Raycaster(q.clone().setY(30), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObject(ramp)[0];
    expect(hit).toBeDefined();
    expect(q.y - (hit?.point.y ?? 0)).toBeCloseTo(0.035, 3);
  }
});
