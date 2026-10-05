import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

function requireInstanced(root: THREE.Object3D, name: string): THREE.InstancedMesh {
  const object = root.getObjectByName(name);
  expect(object).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh;
}

function expectFiniteInstances(mesh: THREE.InstancedMesh): void {
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < mesh.count; i++) {
    mesh.getMatrixAt(i, matrix);
    for (const value of matrix.elements) expect(Number.isFinite(value)).toBe(true);
  }
}

function expectTrianglesAvoidDiveJunction(mesh: THREE.Mesh, track: NeonGrid): void {
  const position = mesh.geometry.getAttribute('position');
  const index = mesh.geometry.index;
  expect(index).not.toBeNull();
  if (!index) return;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const centroid = new THREE.Vector3();
  for (let i = 0; i < index.count; i += 3) {
    a.fromBufferAttribute(position, index.getX(i));
    b.fromBufferAttribute(position, index.getX(i + 1));
    c.fromBufferAttribute(position, index.getX(i + 2));
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    expect(track.waterfallDive.junctionContains(centroid)).toBe(false);
  }
}

describe('Neon Grid Stage 4 Task 8 Falls Run representative stretch', () => {
  it('adds the approved Falls Run groups while preserving existing named route systems', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');

    const falls = scene.getObjectByName('falls-run-visual');
    expect(falls).toBeInstanceOf(THREE.Group);
    expect(falls?.userData.progressRange).toEqual([0.7, 0.85]);
    expect(scene.getObjectByName('billboard')).toBeDefined();
    expect(scene.getObjectByName('service-tunnel')).toBeDefined();
    expect(scene.getObjectByName('waterfall-dive')).toBeDefined();
    expect(scene.getObjectByName('billboard-boost-pad')).toBeDefined();

    const mainBoostPads = scene.children.filter((child) => child.name.startsWith('boost-pad-'));
    expect(mainBoostPads).toHaveLength(4);

    expect(scene.getObjectByName('falls-run-night-sky')).toBeInstanceOf(THREE.Mesh);
    expect(scene.getObjectByName('falls-run-wet-asphalt')).toBeInstanceOf(THREE.Mesh);
    expect(scene.getObjectByName('falls-run-luminous-edges')).toBeInstanceOf(THREE.Mesh);
    expect(scene.getObjectByName('falls-run-wall-cladding')).toBeInstanceOf(THREE.Mesh);
    expect(scene.getObjectByName('falls-run-luminous-top-rails')).toBeInstanceOf(THREE.Mesh);
    expect(scene.getObjectByName('falls-run-deck-fascia')).toBeInstanceOf(THREE.Mesh);
    expect(requireInstanced(scene, 'falls-run-pylons').count).toBe(12);
    expect(requireInstanced(scene, 'falls-run-cross-braces').count).toBe(22);
    expect(requireInstanced(scene, 'falls-run-city-towers').count).toBe(24);
    expect(requireInstanced(scene, 'falls-run-city-windows').count).toBe(320);
    expect(requireInstanced(scene, 'falls-run-ambient-waterfalls').count).toBe(12);
    expect(requireInstanced(scene, 'falls-run-waterfall-lips').count).toBe(12);
    expect(requireInstanced(scene, 'falls-run-ambient-mist').count).toBe(32);
    expect(requireInstanced(scene, 'falls-run-plunge-spray').count).toBe(12);
    expect(requireInstanced(scene, 'falls-run-neon-signage').count).toBe(18);
    expect(requireInstanced(scene, 'falls-run-dive-rail-debris').count).toBe(10);

    disposeTrackScene(scene);
  });

  it('keeps the accepted Waterfall Dive wall opening clear of Task 8 cladding and neon rails', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');

    for (const name of [
      'falls-run-wall-cladding',
      'falls-run-luminous-edges',
      'falls-run-luminous-top-rails',
    ]) {
      const mesh = scene.getObjectByName(name);
      expect(mesh).toBeInstanceOf(THREE.Mesh);
      if (!(mesh instanceof THREE.Mesh)) throw new Error(`Missing Task 8 mesh: ${name}`);
      expectTrianglesAvoidDiveJunction(mesh, track);
    }

    disposeTrackScene(scene);
  });

  it('quality-scales only the approved expensive dressing and skips wet streaks on Low', () => {
    const track = new NeonGrid();
    const low = createNeonGridScene(track, 'low');
    const medium = createNeonGridScene(track, 'medium');
    const high = createNeonGridScene(track, 'high');

    expect(low.getObjectByName('falls-run-wet-asphalt')).toBeUndefined();
    expect(medium.getObjectByName('falls-run-wet-asphalt')).toBeDefined();
    expect(high.getObjectByName('falls-run-wet-asphalt')).toBeDefined();

    expect(requireInstanced(low, 'falls-run-city-windows').count).toBe(160);
    expect(requireInstanced(medium, 'falls-run-city-windows').count).toBe(320);
    expect(requireInstanced(high, 'falls-run-city-windows').count).toBe(480);
    expect(requireInstanced(low, 'falls-run-ambient-mist').count).toBe(16);
    expect(requireInstanced(medium, 'falls-run-ambient-mist').count).toBe(32);
    expect(requireInstanced(high, 'falls-run-ambient-mist').count).toBe(48);

    disposeTrackScene(low);
    disposeTrackScene(medium);
    disposeTrackScene(high);
  });

  it('keeps repeated Task 8 transforms finite and introduces no textures or real lights', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'high');
    const task8 = scene.getObjectByName('falls-run-visual');
    expect(task8).toBeDefined();

    let textures = 0;
    let lights = 0;
    task8?.traverse((object) => {
      if (object instanceof THREE.Light) lights += 1;
      if (object instanceof THREE.InstancedMesh)
        expectFiniteInstances(object as unknown as THREE.InstancedMesh);
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const key of [
          'map',
          'alphaMap',
          'aoMap',
          'bumpMap',
          'displacementMap',
          'emissiveMap',
          'envMap',
          'lightMap',
          'metalnessMap',
          'normalMap',
          'roughnessMap',
        ] as const) {
          if ((material as THREE.MeshStandardMaterial)[key] instanceof THREE.Texture) textures += 1;
        }
      }
    });

    expect(lights).toBe(0);
    expect(textures).toBe(0);
    disposeTrackScene(scene);
  });

  it('uses race time for animated wet-road and waterfall shaders without touching track data', () => {
    const track = new NeonGrid();
    const samples = track.samples.map((point) => point.toArray());
    const scene = createNeonGridScene(track, 'medium');
    const wet = scene.getObjectByName('falls-run-wet-asphalt') as THREE.Mesh;
    const falls = scene.getObjectByName('falls-run-ambient-waterfalls') as THREE.InstancedMesh;
    const wetMaterial = wet.material as THREE.ShaderMaterial;
    const fallsMaterial = falls.material as THREE.ShaderMaterial;

    scene.fallsRun.update(2.5);
    expect(wetMaterial.uniforms.time?.value).toBe(2.5);
    expect(fallsMaterial.uniforms.time?.value).toBe(2.5);
    scene.fallsRun.update(2.5);
    expect(wetMaterial.uniforms.time?.value).toBe(2.5);
    expect(track.samples.map((point) => point.toArray())).toEqual(samples);

    disposeTrackScene(scene);
  });
});
