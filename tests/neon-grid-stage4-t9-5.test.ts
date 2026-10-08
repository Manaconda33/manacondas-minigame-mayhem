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
        expect(instanced(scene, 'undercity-facade-vent-banks').count).toBe(16);
        expect(instanced(scene, 'undercity-facade-vent-banks').geometry.userData.slatsPerBank).toBe(3);
        expect(instanced(scene, 'falls-run-extension-deck-service-fixtures').count).toBe(16);
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
      const banks = instanced(scene, 'undercity-facade-vent-banks');
      expect(banks.geometry.userData.ventParts).toBe(4);
      expect(banks.geometry.userData.slatsPerBank).toBe(3);
      const ventColors = banks.geometry.getAttribute('color');
      expect(ventColors.count).toBeGreaterThan(24);
      expect(new THREE.Color().fromBufferAttribute(ventColors, 0)
        .equals(new THREE.Color().fromBufferAttribute(ventColors, ventColors.count - 1))).toBe(false);
      banks.geometry.computeBoundingBox();
      expect(banks.geometry.boundingBox?.min.z).toBeLessThan(-0.2);
      expect(banks.geometry.boundingBox?.max.z).toBeGreaterThan(0.3);
      for (let i = 0; i < banks.count; i++) {
        const building = transform(buildings, i);
        const bank = transform(banks, i);
        expect(bank.position.y).toBeGreaterThan(building.position.y);
        expect(bank.position.y).toBeLessThan(building.position.y + building.scale.y);
        expect(bank.position.distanceTo(building.position)).toBeLessThan(26);
      }
      const pylons = instanced(scene, 'falls-run-extension-supported-pylons');
      const fixtures = instanced(scene, 'falls-run-extension-deck-service-fixtures');
      expect(fixtures.geometry.userData.supportedFixtureParts).toBe(2);
      expect(fixtures.geometry.userData.hasCyanUndersideLight).toBe(true);
      const colors = fixtures.geometry.getAttribute('color');
      expect(colors.count).toBeGreaterThan(24);
      const firstColor = new THREE.Color().fromBufferAttribute(colors, 0);
      const lastColor = new THREE.Color().fromBufferAttribute(colors, colors.count - 1);
      expect(firstColor.equals(lastColor)).toBe(false);
      fixtures.geometry.computeBoundingBox();
      const bounds = fixtures.geometry.boundingBox;
      expect(bounds).not.toBeNull();
      expect(bounds?.max.y).toBeGreaterThan(0.15);
      expect(bounds?.min.y).toBeLessThan(-0.25);
      for (let i = 0; i < pylons.count; i++) {
        const pylon = transform(pylons, i);
        const fixture = transform(fixtures, i);
        const top = pylon.position.y + pylon.scale.y * 0.5;
        expect(Math.abs(fixture.position.y - (top - 0.18))).toBeLessThan(0.01);
        expect(new THREE.Vector2(fixture.position.x, fixture.position.z)
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
      expect(instanced(scene, 'skyline-ad-manaconda-racing').count).toBe(7);
      expect(instanced(scene, 'skyline-ad-taco-bell-live-mas').count).toBe(7);
      expect(instanced(scene, 'undercity-ad-nightshift-noodles').count).toBe(2);
      expect(instanced(scene, 'undercity-ad-voltline-industrial').count).toBe(2);
      expect(instanced(scene, 'undercity-service-bays').count).toBe(14);
      const ambient = instanced(scene, 'falls-run-extension-ambient-waterfalls');
      const material = ambient.material as THREE.ShaderMaterial;
      expect(material.uniforms.time).toBeDefined();
      expect(scene.children.filter((item) => item.name.startsWith('boost-pad-'))).toHaveLength(4);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('positions decoy structures beside real shortcut approaches without replacing the approved tells', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const billboard = instanced(scene, 'skyline-mask-roadside-billboard-supports');
      expect(billboard.count).toBe(8);
      expect(billboard.userData.immutableSponsorArt).toBe(true);
      const positions = billboard.userData.camouflageProgress as number[];
      expect(positions).toHaveLength(8);
      expect(positions.filter((p) => Math.abs(p - track.billboardGap.entry.progress[0]) < 0.051).length)
        .toBeGreaterThanOrEqual(4);
      expect(instanced(scene, 'skyline-ad-supports').count).toBe(14);
      for (let i = 0; i < billboard.count; i++) {
        const support = transform(billboard, i);
        const main = track.projectMain(support.position);
        const gap = track.billboardGap.project(support.position);
        expect(main.lateralDistance - track.halfWidthAt(main.progress), `billboard decoy ${String(i)} main-clear`).toBeGreaterThan(3);
        expect(gap.lateralDistance - track.billboardGap.roadHalfWidth, `billboard decoy ${String(i)} shortcut-clear`).toBeGreaterThan(3);
        expect(support.scale.toArray().every(Number.isFinite)).toBe(true);
      }

      const bays = instanced(scene, 'undercity-service-bays');
      expect(bays.count).toBe(14);
      expect(bays.geometry.userData.prefabParts).toBe(6);
      const bayColors = bays.geometry.getAttribute('color');
      expect(new THREE.Color().fromBufferAttribute(bayColors, 0)
        .equals(new THREE.Color().fromBufferAttribute(bayColors, bayColors.count - 1))).toBe(false);
      bays.geometry.computeBoundingBox();
      expect(bays.geometry.boundingBox?.max.z).toBeGreaterThan(0.5);
      expect(bays.geometry.boundingBox?.min.z).toBeLessThan(-0.5);
      const approaches = bays.userData.camouflageProgress as number[];
      expect(approaches).toHaveLength(14);
      expect(approaches[0]).toBeCloseTo(track.serviceTunnel.entry.progress[0] + 0.004, 6);
      expect(approaches.at(-1)).toBeCloseTo(track.serviceTunnel.exitProgress - 0.003, 6);
      for (let i = 0; i < bays.count; i++) {
        const back = transform(bays, i);
        const main = track.projectMain(back.position);
        const tunnel = track.serviceTunnel.project(back.position);
        // Measure the prefab footprint, not merely its center. The former
        // five-step placement search could leave a decoy inside a hairpin.
        expect(main.lateralDistance - track.halfWidthAt(main.progress) - 3.8, `service bay ${String(i)} main-clear`).toBeGreaterThan(1.5);
        const actualTunnelDistance = Math.hypot(
          back.position.x - tunnel.point.x, back.position.z - tunnel.point.z,
        );
        expect(actualTunnelDistance - track.serviceTunnel.roadHalfWidth - 3.8, `service bay ${String(i)} tunnel-clear`).toBeGreaterThan(1.5);
      }

      const falls = instanced(scene, 'falls-run-extension-ambient-waterfalls');
      expect(falls.count).toBe(24);
      expect(falls.userData.noGold).toBe(true);
      const fallsPositions = falls.userData.camouflageProgress as number[];
      expect(fallsPositions).toHaveLength(24);
      expect(fallsPositions.every((p) => p < 0.7 || p > 0.85)).toBe(true);
      expect(fallsPositions.filter((p) => p >= 0.65 && p < 0.7).length).toBeGreaterThanOrEqual(8);
      expect(fallsPositions.filter((p) => p > 0.85 && p < 0.89).length).toBeGreaterThanOrEqual(4);
      expect(scene.getObjectByName('billboard-ad-paprika')).toBeDefined();
      expect(scene.getObjectByName('dive-launch-tell')).toBeDefined();
      expect(scene.getObjectByName('dive-landing-marker')).toBeDefined();
      expect(scene.getObjectByName('service-tunnel')).toBeDefined();
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);


  it('screens shortcut interiors along the real road edges without disguising the actual mouths', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      scene.updateMatrixWorld(true);
      const skyline = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const undercity = scene.getObjectByName('undercity-wallside-sightline-screens') as THREE.Mesh;
      expect(skyline).toBeInstanceOf(THREE.Mesh);
      expect(undercity).toBeInstanceOf(THREE.Mesh);
      expect(skyline.userData.sightlinePanels as number).toBeGreaterThan(70);
      expect(undercity.userData.sightlinePanels as number).toBeGreaterThan(100);
      expect(skyline.userData.mouthCuts as number).toBeGreaterThan(0);
      for (const screen of [skyline, undercity]) {
        const material = screen.material as THREE.MeshStandardMaterial;
        expect(material.transparent).toBe(false);
        expect(material.depthWrite).toBe(true);
        expect(screen.userData.presentationOnly).toBe(true);
      }

      const raycaster = new THREE.Raycaster();
      const hidden = (mesh: THREE.Mesh, progress: number, side: -1 | 1): boolean => {
        const center = track.curve.getPointAt(progress);
        const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
        const right = new THREE.Vector3(tangent.z, 0, -tangent.x);
        // Eye height is deliberately a little above the kart cockpit.
        const from = center.clone().add(new THREE.Vector3(0, 2.45, 0));
        const target = center.clone()
          .addScaledVector(right, side * (track.halfWidthAt(progress) + 12))
          .add(new THREE.Vector3(0, 2.45, 0));
        const toward = target.sub(from);
        raycaster.set(from, toward.clone().normalize());
        raycaster.far = toward.length();
        return raycaster.intersectObject(mesh, false).length > 0;
      };
      const billboardSide = (Math.sign(
        track.projectMain(track.billboardGap.curve.getPointAt(0.5)).lateralOffset,
      ) || 1) as -1 | 1;
      // Verify the assembled opaque mesh, not merely declared instance counts.
      const skylineSamples = [0.053, 0.070, 0.086, 0.131, 0.155, 0.180, 0.195];
      const undercitySamples = [0.266, 0.282, 0.301, 0.332, 0.366, 0.413, 0.442];
      expect(skylineSamples.filter((p) => hidden(skyline, p, billboardSide)).length)
        .toBeGreaterThanOrEqual(5);
      expect(undercitySamples.filter((p) => hidden(undercity, p, -1) &&
        hidden(undercity, p, 1)).length).toBeGreaterThanOrEqual(5);
      // Do not put a newly introduced facade across the true open entrances.
      expect(hidden(skyline, 0.103, billboardSide)).toBe(false);
      expect(hidden(undercity, 0.249, 1)).toBe(false);
      expect(hidden(undercity, 0.249, -1)).toBe(false);
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

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
    const housing = instanced(scene, 'undercity-facade-vent-banks');
    const cap = instanced(scene, 'falls-run-extension-deck-service-fixtures');
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
          'undercity-facade-vent-banks',
          'falls-run-extension-deck-service-fixtures',
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
