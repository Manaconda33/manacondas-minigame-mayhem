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
      expect(billboard.count).toBe(4);
      expect(billboard.userData.immutableSponsorArt).toBe(true);
      const positions = billboard.userData.camouflageProgress as number[];
      expect(positions).toHaveLength(4);
      expect(positions.filter((p) => Math.abs(p - track.billboardGap.entry.progress[0]) < 0.10).length)
        .toBeGreaterThanOrEqual(4);
      expect(billboard.userData.wallMountedProgress as number[]).toHaveLength(4);
      expect(instanced(scene, 'skyline-ad-supports').count).toBe(14);
      for (let i = 0; i < billboard.count; i++) {
        const support = transform(billboard, i);
        const main = track.projectMain(support.position);
        const gap = track.billboardGap.project(support.position);
        expect(main.lateralDistance - track.halfWidthAt(main.progress), `billboard decoy ${String(i)} main-clear`).toBeGreaterThan(0.3);
        expect(gap.lateralDistance - track.billboardGap.roadHalfWidth, `billboard decoy ${String(i)} shortcut-clear`).toBeGreaterThan(-0.25);
        expect(support.scale.toArray().every(Number.isFinite)).toBe(true);
      }

      // The raised sponsor image must touch its architectural backing, not
      // hover half a metre in front of a post that happens to exist nearby.
      for (const [sponsor, name] of [
        [0, 'skyline-ad-manaconda-racing'],
        [1, 'skyline-ad-taco-bell-live-mas'],
      ] as const) {
        const artwork = instanced(scene, name);
        for (let i = 0; i < 2; i++) {
          const image = transform(artwork, 5 + i).position;
          const post = transform(billboard, sponsor * 2 + i).position;
          expect(Math.hypot(image.x - post.x, image.z - post.z),
            name + ' raised backing contact ' + i).toBeLessThan(0.31);
          expect(image.y - post.y, name + ' raised vertical mount ' + i).toBeCloseTo(5.45, 2);
        }
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


  it('mounts right-reading warning art at both true angled tunnel wall openings', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      scene.updateMatrixWorld(true);
      const tunnel = track.serviceTunnel;
      const warnings = scene.tunnelWarnings;
      expect(warnings.group.children).toHaveLength(2);
      expect(warnings.group.userData.presentationOnly).toBe(true);
      for (const [name, exit, facing] of [
        ['service-tunnel-warning-entry', false, -1],
        ['service-tunnel-warning-exit', true, 1],
      ] as const) {
        const mesh = scene.getObjectByName(name) as THREE.Mesh<
          THREE.PlaneGeometry, THREE.MeshBasicMaterial
        >;
        expect(mesh, name).toBeInstanceOf(THREE.Mesh);
        expect(mesh.userData.nonColliding).toBe(true);
        expect(mesh.userData.presentationOnly).toBe(true);
        const leftFraction = tunnel.wallRange(-1)[exit ? 1 : 0];
        const rightFraction = tunnel.wallRange(1)[exit ? 1 : 0];
        const fraction = (leftFraction + rightFraction) / 2;
        expect(mesh.userData.portalWallFractions).toEqual([leftFraction, rightFraction]);
        expect(mesh.userData.portalFraction).toBeCloseTo(fraction, 8);
        const left = new THREE.Vector3().fromArray(mesh.userData.portalEdges[0] as number[]);
        const right = new THREE.Vector3().fromArray(mesh.userData.portalEdges[1] as number[]);
        const crossing = left.clone().add(right).multiplyScalar(0.5);
        expect(Math.hypot(mesh.position.x - crossing.x, mesh.position.z - crossing.z)).toBeLessThan(0.01);
        expect(mesh.position.y - Math.max(left.y, right.y) - mesh.geometry.parameters.height / 2)
          .toBeGreaterThanOrEqual(tunnel.headroom);
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion);
        const targetNormal = tunnel.curve.getTangentAt(fraction).setY(0).normalize()
          .multiplyScalar(facing);
        expect(normal.dot(targetNormal)).toBeGreaterThan(0.999);
        expect(mesh.material.side).toBe(THREE.FrontSide);
        expect(mesh.geometry.parameters.width).toBeLessThan(tunnel.roadHalfWidth * 2);
        expect(mesh.material.transparent).toBe(true);
        expect(mesh.material.depthTest).toBe(true);
        expect(mesh.material.depthWrite).toBe(false);
        expect(mesh.material.map).toBeDefined();
        const mounts = instanced(mesh, name + '-wall-mounts');
        expect(mounts.count).toBe(2);
        expect(mounts.userData.nonColliding).toBe(true);
        for (const [index, side, at, edge] of [
          [0, -1, leftFraction, left],
          [1, 1, rightFraction, right],
        ] as const) {
          const matrix = new THREE.Matrix4();
          mounts.getMatrixAt(index, matrix);
          matrix.premultiply(mesh.matrixWorld);
          const contact = new THREE.Vector3(0, -0.5, 0).applyMatrix4(matrix);
          const expected = edge.clone().setY(tunnel.wallElevationAt(at, side, true) - 0.12);
          expect(contact.distanceTo(expected), name + ' wall contact ' + index).toBeLessThan(0.015);
        }
        warnings.update(crossing);
        expect(mesh.visible).toBe(false);
        expect(mesh.material.opacity).toBe(0);
        warnings.update(crossing.clone().add(new THREE.Vector3(50, 0, 50)));
        expect(mesh.visible).toBe(true);
        expect(mesh.material.opacity).toBeCloseTo(0.63, 5);
      }
      expect(warnings.group.userData.approvedAsset).toBe(
        'assets/track/neon-grid/signage/service-tunnel-do-not-enter-v1.png',
      );
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('exposes actual wall-mounted and raised sponsor artwork to the ordinary-road eye', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      scene.updateMatrixWorld(true);
      const wall = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const raycaster = new THREE.Raycaster();
      const samples = [[0.052, 0.076, 0.135, 0.184], [0.060, 0.085, 0.146, 0.194]];
      for (const [sponsor, name] of [
        [0, 'skyline-ad-manaconda-racing'],
        [1, 'skyline-ad-taco-bell-live-mas'],
      ] as const) {
        const art = instanced(scene, name);
        const material = art.material as THREE.MeshBasicMaterial;
        expect(material.map).toBeInstanceOf(THREE.Texture);
        expect(material.transparent).toBe(false);
        for (let i = 0; i < 4; i++) {
          const progress = samples[sponsor]?.[i];
          expect(progress).toBeDefined();
          if (progress === undefined) continue;
          const target = transform(art, 3 + i).position;
          const eye = track.curve.getPointAt(progress).add(new THREE.Vector3(0, 2.2, 0));
          const direction = target.clone().sub(eye);
          raycaster.set(eye, direction.clone().normalize());
          raycaster.far = direction.length() + 0.2;
          const artHit = raycaster.intersectObject(art, false).find((hit) => hit.instanceId === i + 3);
          expect(artHit, name + ' actual image ray ' + i).toBeDefined();
          const firstOpaqueWall = raycaster.intersectObject(wall, false)[0];
          expect(firstOpaqueWall?.distance ?? Infinity, name + ' fascia occlusion ' + i)
            .toBeGreaterThan((artHit?.distance ?? 0) - 0.02);
        }
      }
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
      expect(undercity.userData.innerWingPanels as number).toBeGreaterThan(5);
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

  it('keeps the Service Tunnel cart and ahead-road camera rays clear of camouflage panels', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      scene.updateMatrixWorld(true);
      const screens = scene.getObjectByName('undercity-wallside-sightline-screens') as THREE.Mesh;
      const tunnel = track.serviceTunnel;
      const raycaster = new THREE.Raycaster();
      for (const direction of [1, -1] as const) {
        for (const fraction of [0.03, 0.075, 0.14, 0.22, 0.4, 0.6, 0.78, 0.89, 0.97]) {
          const cameraFraction = THREE.MathUtils.clamp(fraction - direction * 0.035, 0, 1);
          const from = tunnel.curve.getPointAt(cameraFraction)
            .add(new THREE.Vector3(0, 2.2, 0));
          for (const ahead of [0, direction * 0.025]) {
            const target = tunnel.curve.getPointAt(
              THREE.MathUtils.clamp(fraction + ahead, 0, 1),
            ).add(new THREE.Vector3(0, ahead === 0 ? 1.15 : 0.45, 0));
            const ray = target.clone().sub(from);
            raycaster.set(from, ray.clone().normalize());
            raycaster.far = ray.length();
            expect(
              raycaster.intersectObject(screens, false),
              `screen blocks ${String(direction)} traversal at ${String(fraction)}`,
            ).toHaveLength(0);
          }
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('keeps the dark Skyline fascia outside the real Service Tunnel entry corridor', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      scene.updateMatrixWorld(true);
      const fascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const tunnel = track.serviceTunnel;
      const raycaster = new THREE.Raycaster();
      // Use actual entry geometry, not an unrelated road progress sample.
      // The wall may hide deep tunnel, but must not cover immediate turn-in.
      for (const fraction of [0.007, 0.025, 0.045]) {
        const start = tunnel.curve.getPointAt(fraction).add(new THREE.Vector3(0, 1.5, 0));
        const ahead = tunnel.curve.getPointAt(fraction + 0.035)
          .add(new THREE.Vector3(0, 1.0, 0));
        const ray = ahead.clone().sub(start);
        raycaster.set(start, ray.clone().normalize());
        raycaster.far = ray.length();
        expect(raycaster.intersectObject(fascia, false), 'opaque entry fascia at ' + fraction)
          .toHaveLength(0);
      }
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
