import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import type { GraphicsQuality } from '../src/config/graphicsQuality';

function requireInstanced(scene: THREE.Object3D, name: string): THREE.InstancedMesh {
  const object = scene.getObjectByName(name);
  expect(object).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh;
}

function assertFiniteInstances(mesh: THREE.InstancedMesh): void {
  const matrix = new THREE.Matrix4();
  const elements = matrix.elements;
  for (let index = 0; index < mesh.count; index += 1) {
    mesh.getMatrixAt(index, matrix);
    for (const value of elements) expect(Number.isFinite(value)).toBe(true);
  }
}

function task8Scene(quality: GraphicsQuality) {
  return createNeonGridScene(new NeonGrid(), quality);
}

describe('Neon Grid Stage 4 Task 8 Falls Run presentation', () => {
  it('adds the approved representative stretch while preserving the existing shortcut scene groups', () => {
    const scene = task8Scene('medium');

    const fallsRun = scene.getObjectByName('falls-run-presentation');
    expect(fallsRun).toBeInstanceOf(THREE.Group);
    expect(fallsRun?.userData.progressStart).toBe(0.7);
    expect(fallsRun?.userData.progressEnd).toBe(0.85);

    expect(scene.getObjectByName('neon-grid-night-sky')).toBeDefined();
    expect(scene.getObjectByName('falls-run-wet-asphalt')).toBeDefined();
    expect(scene.getObjectByName('falls-run-edge-lights')).toBeDefined();
    expect(scene.getObjectByName('falls-run-deck-fascia')).toBeDefined();
    expect(scene.getObjectByName('falls-run-city')).toBeDefined();
    expect(scene.getObjectByName('falls-run-ambient-waterfalls')).toBeDefined();

    expect(scene.getObjectByName('neon-grid-billboard')).toBeDefined();
    expect(scene.getObjectByName('service-tunnel')).toBeDefined();
    expect(scene.getObjectByName('waterfall-dive')).toBeDefined();

    const ordinaryBoostPads = scene.children.filter((child) => child.name.startsWith('boost-pad-'));
    expect(ordinaryBoostPads).toHaveLength(4);
    expect(scene.getObjectByName('billboard-boost-pad')).toBeDefined();
  });

  it('keeps camouflage systems batched and quality-bounded', () => {
    const low = task8Scene('low');
    const medium = task8Scene('medium');
    const high = task8Scene('high');

    expect(low.getObjectByName('falls-run-wet-asphalt')).toBeUndefined();
    expect(medium.getObjectByName('falls-run-wet-asphalt')).toBeDefined();
    expect(high.getObjectByName('falls-run-wet-asphalt')).toBeDefined();

    expect(requireInstanced(low, 'falls-run-city-windows').count).toBe(160);
    expect(requireInstanced(medium, 'falls-run-city-windows').count).toBe(320);
    expect(requireInstanced(high, 'falls-run-city-windows').count).toBe(480);

    expect(requireInstanced(low, 'falls-run-mist').count).toBe(16);
    expect(requireInstanced(medium, 'falls-run-mist').count).toBe(32);
    expect(requireInstanced(high, 'falls-run-mist').count).toBe(48);

    for (const scene of [low, medium, high]) {
      expect(requireInstanced(scene, 'falls-run-ambient-waterfalls').count).toBe(12);
      expect(requireInstanced(scene, 'falls-run-waterfall-lips').count).toBe(12);
      expect(requireInstanced(scene, 'falls-run-waterfall-spray').count).toBe(12);
      expect(requireInstanced(scene, 'falls-run-pylons').count).toBe(12);
      expect(requireInstanced(scene, 'falls-run-braces').count).toBe(24);
      expect(requireInstanced(scene, 'falls-run-city-towers').count).toBe(24);
      expect(requireInstanced(scene, 'falls-run-signage').count).toBe(18);
      expect(requireInstanced(scene, 'falls-run-dive-rail-debris').count).toBe(10);
    }
  });

  it('uses only finite visual transforms and adds no Task 8 textures or lights', () => {
    const scene = task8Scene('medium');
    const task8 = scene.getObjectByName('falls-run-presentation');
    expect(task8).toBeInstanceOf(THREE.Group);
    if (!(task8 instanceof THREE.Group)) throw new Error('Missing Falls Run presentation');

    let lights = 0;
    const textures = new Set<THREE.Texture>();
    task8.traverse((object) => {
      if (object instanceof THREE.Light) lights += 1;
      if (object instanceof THREE.InstancedMesh) assertFiniteInstances(object);
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
        if (material instanceof THREE.ShaderMaterial) {
          for (const uniform of Object.values(material.uniforms)) {
            if (uniform.value instanceof THREE.Texture) textures.add(uniform.value as THREE.Texture);
          }
        }
      }
    });

    expect(lights).toBe(0);
    expect(textures.size).toBe(0);
  });

  it('animates Falls Run water from authoritative race time without advancing on repeated time', () => {
    const scene = task8Scene('medium');
    const waterfalls = scene.getObjectByName('falls-run-ambient-waterfalls') as THREE.InstancedMesh;
    expect(waterfalls).toBeInstanceOf(THREE.InstancedMesh);
    expect(waterfalls.material).toBeInstanceOf(THREE.ShaderMaterial);
    const material = waterfalls.material as THREE.ShaderMaterial;

    scene.falls.update(2);
    expect(material.uniforms.time?.value).toBe(2);
    scene.falls.update(2);
    expect(material.uniforms.time?.value).toBe(2);
    scene.falls.update(3.25);
    expect(material.uniforms.time?.value).toBe(3.25);
  });
});
