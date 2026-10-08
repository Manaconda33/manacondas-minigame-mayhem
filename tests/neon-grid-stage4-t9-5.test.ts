import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { GraphicsQuality } from '../src/config/graphicsQuality';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene, type NeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

function instanced(scene: THREE.Object3D, name: string): THREE.InstancedMesh {
  const mesh = scene.getObjectByName(name);
  expect(mesh, name).toBeInstanceOf(THREE.InstancedMesh);
  return mesh as THREE.InstancedMesh;
}

function transform(mesh: THREE.InstancedMesh, index: number): {
  position: THREE.Vector3; scale: THREE.Vector3;
} {
  const matrix = new THREE.Matrix4();
  mesh.getMatrixAt(index, matrix);
  expect(matrix.elements.every(Number.isFinite), mesh.name).toBe(true);
  const position = new THREE.Vector3(), rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, rotation, scale);
  return { position, scale };
}

function assertRoadCompositing(scene: NeonGridScene, quality: GraphicsQuality): void {
  for (const name of [
    'skyline-wet-asphalt',
    'undercity-wet-asphalt',
    'falls-run-wet-asphalt',
    'falls-run-extension-wet-asphalt',
  ]) {
    const mesh = scene.getObjectByName(name);
    if (quality === 'low') {
      expect(mesh, name).toBeUndefined();
    } else {
      expect(mesh, name).toBeInstanceOf(THREE.Mesh);
      const road = mesh as THREE.Mesh;
      const material = road.material as THREE.Material;
      expect(road.renderOrder, name).toBe(-10);
      expect(material.transparent, name).toBe(true);
      expect(material.depthWrite, name).toBe(false);
      expect(material.depthTest, name).toBe(true);
    }
  }
}

describe('Neon Grid Stage 4 T9.5 course lifecycle and masking', () => {
  it('bounds all four presentation owners and supported detail on every quality tier', () => {
    const bounds = {
      low: { skyline: 120, undercity: 80, task8: 160, falls: 80, task8Mist: 16, extensionMist: 0 },
      medium: { skyline: 240, undercity: 160, task8: 320, falls: 160, task8Mist: 32, extensionMist: 14 },
      high: { skyline: 360, undercity: 240, task8: 480, falls: 240, task8Mist: 48, extensionMist: 28 },
    } as const;
    const track = new NeonGrid();
    for (const quality of ['low', 'medium', 'high'] as const) {
      const scene = createNeonGridScene(track, quality);
      try {
        const expected = bounds[quality];
        expect(instanced(scene, 'skyline-city-windows').count).toBe(expected.skyline);
        expect(instanced(scene, 'undercity-city-windows').count).toBe(expected.undercity);
        expect(instanced(scene, 'falls-run-city-windows').count).toBe(expected.task8);
        expect(instanced(scene, 'falls-run-extension-city-windows').count).toBe(expected.falls);
        expect(instanced(scene, 'falls-run-ambient-mist').count).toBe(expected.task8Mist);
        expect((scene.getObjectByName('falls-run-extension-ambient-mist') as THREE.InstancedMesh | undefined)?.count ?? 0).toBe(expected.extensionMist);
        expect(instanced(scene, 'undercity-facade-vent-housings').count).toBe(16);
        expect(instanced(scene, 'undercity-facade-vent-louvers').count).toBe(48);
        expect(instanced(scene, 'falls-run-extension-deck-service-caps').count).toBe(16);
        expect(instanced(scene, 'falls-run-extension-deck-downlights').count).toBe(16);
        assertRoadCompositing(scene, quality);
        for (const name of [
          'skyline-visual', 'undercity-visual',
          'falls-run-visual', 'falls-run-extension-visual',
        ]) {
          const owner = scene.getObjectByName(name);
          expect(owner, name).toBeInstanceOf(THREE.Group);
          expect(owner?.userData.quality, name).toBe(quality);
        }
      } finally {
        disposeTrackScene(scene);
      }
    }
  }, 20000);

  it('physically backs Undercity ventilation and Falls deck fixtures with existing structure', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const buildings = instanced(scene, 'undercity-city-buildings');
      const housings = instanced(scene, 'undercity-facade-vent-housings');
      const louvers = instanced(scene, 'undercity-facade-vent-louvers');
      for (let i = 0; i < housings.count; i++) {
        const building = transform(buildings, i);
        const housing = transform(housings, i);
        expect(housing.position.y).toBeGreaterThan(building.position.y);
        expect(housing.position.y).toBeLessThan(building.position.y + building.scale.y);
        expect(housing.position.distanceTo(building.position)).toBeLessThan(26);
        for (let slot = 0; slot < 3; slot++) {
          const slat = transform(louvers, i * 3 + slot);
          expect(slat.position.distanceTo(housing.position)).toBeLessThan(0.55);
        }
      }
      const pylons = instanced(scene, 'falls-run-extension-supported-pylons');
      const caps = instanced(scene, 'falls-run-extension-deck-service-caps');
      const lamps = instanced(scene, 'falls-run-extension-deck-downlights');
      for (let i = 0; i < pylons.count; i++) {
        const pylon = transform(pylons, i);
        const cap = transform(caps, i);
        const lamp = transform(lamps, i);
        const top = pylon.position.y + pylon.scale.y * 0.5;
        expect(Math.abs(cap.position.y - (top - 0.18))).toBeLessThan(0.01);
        expect(Math.abs(lamp.position.y - (top - 0.425))).toBeLessThan(0.01);
        expect(cap.position.distanceTo(lamp.position)).toBeLessThan(0.3);
        expect(new THREE.Vector2(cap.position.x, cap.position.z)
          .distanceTo(new THREE.Vector2(pylon.position.x, pylon.position.z))).toBeLessThan(0.001);
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('preserves three distinguishable shortcut masks and all existing route cues', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      for (const name of [
        'billboard-hologram', 'billboard-boost-pad', 'service-tunnel',
        'waterfall-dive', 'skyline-procedural-signage',
        'skyline-ad-manaconda-racing', 'skyline-ad-taco-bell-live-mas',
        'undercity-service-bays', 'undercity-ad-nightshift-noodles',
        'undercity-ad-voltline-industrial',
        'falls-run-extension-ambient-waterfalls',
      ]) {
        expect(scene.getObjectByName(name), name).toBeDefined();
      }
      expect(instanced(scene, 'skyline-ad-manaconda-racing').count).toBe(3);
      expect(instanced(scene, 'skyline-ad-taco-bell-live-mas').count).toBe(3);
      expect(instanced(scene, 'undercity-ad-nightshift-noodles').count).toBe(2);
      expect(instanced(scene, 'undercity-ad-voltline-industrial').count).toBe(2);
      expect(instanced(scene, 'undercity-service-bays').count).toBe(10);
      const ambient = instanced(scene, 'falls-run-extension-ambient-waterfalls');
      const material = ambient.material as THREE.ShaderMaterial;
      expect(material.uniforms.time).toBeDefined();
      expect(scene.children.filter((item) => item.name.startsWith('boost-pad-'))).toHaveLength(4);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('freezes all four visual clocks when hidden, without resume catch-up', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const owners = [scene.skyline, scene.undercity, scene.fallsRun, scene.fallsRunExtension];
      const roads = [
        'skyline-wet-asphalt', 'undercity-wet-asphalt',
        'falls-run-wet-asphalt', 'falls-run-extension-wet-asphalt',
      ];
      owners.forEach((owner) => { owner.update(2); });
      owners.forEach((owner) => { owner.group.visible = false; owner.update(9); });
      for (const name of roads) {
        const road = scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
        expect(road.material.uniforms.time?.value, name).toBe(2);
      }
      owners.forEach((owner) => { owner.group.visible = true; owner.update(10); });
      for (const name of roads) {
        const road = scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
        expect(road.material.uniforms.time?.value, name).toBe(3);
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('disposes owned detail once without disposing accepted neighboring scene resources', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    const housing = instanced(scene, 'undercity-facade-vent-housings');
    const cap = instanced(scene, 'falls-run-extension-deck-service-caps');
    const skylineRoad = scene.getObjectByName('skyline-asphalt-base') as THREE.Mesh;
    const task8Road = scene.getObjectByName('falls-run-asphalt-base') as THREE.Mesh;
    const housingSpy = vi.spyOn(housing.geometry, 'dispose');
    const capSpy = vi.spyOn(cap.geometry, 'dispose');
    const skylineSpy = vi.spyOn(skylineRoad.geometry, 'dispose');
    const task8Spy = vi.spyOn(task8Road.geometry, 'dispose');
    try {
      scene.undercity.dispose(); scene.undercity.dispose();
      scene.fallsRunExtension.dispose(); scene.fallsRunExtension.dispose();
      expect(housingSpy).toHaveBeenCalledTimes(1);
      expect(capSpy).toHaveBeenCalledTimes(1);
      expect(skylineSpy).not.toHaveBeenCalled();
      expect(task8Spy).not.toHaveBeenCalled();
      expect(scene.getObjectByName('billboard-hologram')).toBeDefined();
      expect(scene.getObjectByName('waterfall-dive')).toBeDefined();
    } finally {
      disposeTrackScene(scene);
    }
    expect(housingSpy).toHaveBeenCalledTimes(1);
    expect(capSpy).toHaveBeenCalledTimes(1);
    expect(skylineSpy).toHaveBeenCalledTimes(1);
    expect(task8Spy).toHaveBeenCalledTimes(1);
  });

  it('does not accumulate scene children or invalid matrices across repeated create/dispose cycles', () => {
    const track = new NeonGrid();
    for (let cycle = 0; cycle < 3; cycle++) {
      const scene = createNeonGridScene(track, 'medium');
      try {
        expect(scene.children.length).toBeGreaterThan(8);
        for (const name of [
          'undercity-facade-vent-housings', 'undercity-facade-vent-louvers',
          'falls-run-extension-deck-service-caps', 'falls-run-extension-deck-downlights',
        ]) {
          const mesh = instanced(scene, name);
          for (let i = 0; i < mesh.count; i++) transform(mesh, i);
        }
      } finally {
        disposeTrackScene(scene);
      }
      expect(scene.children).toHaveLength(0);
    }
  }, 20000);
});
