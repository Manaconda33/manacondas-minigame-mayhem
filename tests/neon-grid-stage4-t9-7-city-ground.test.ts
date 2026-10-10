import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import {
  cityGroundFootingBounds,
  mergeInstancedCityMeshesIntoGround,
  neonGridCityGroundColorAt,
  neonGridCityGroundOptions,
  neonGridTerracedCityGroundGeometry,
} from '../src/game/track/NeonGridCityGround';
import { neonGridRightAt } from '../src/game/track/NeonGridVisualCommon';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

function requireInstanced(scene: THREE.Object3D, name: string): THREE.InstancedMesh {
  const object = scene.getObjectByName(name);
  expect(object, name).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh;
}

function requireGround(
  scene: THREE.Object3D,
  name: string,
): THREE.Mesh {
  const object = scene.getObjectByName(name);
  const metadata: unknown = object?.userData as unknown;
  const renderTarget = typeof metadata === 'object' && metadata !== null && 'renderMesh' in metadata
    ? metadata.renderMesh
    : undefined;
  const rendered: THREE.Mesh | null =
    object instanceof THREE.Mesh
      ? object as THREE.Mesh
      : renderTarget instanceof THREE.Mesh
        ? renderTarget as THREE.Mesh
        : null;
  expect(rendered, name).toBeInstanceOf(THREE.Mesh);
  if (!rendered) throw new Error(`${name} has no rendered mesh`);
  const geometryMetadata: unknown = rendered.geometry.userData as unknown;
  const floorIndexCount = typeof geometryMetadata === 'object' && geometryMetadata !== null
    ? (geometryMetadata as { floorIndexCount?: unknown }).floorIndexCount
    : undefined;
  if (typeof floorIndexCount === 'number') {
    rendered.geometry.setDrawRange(
      Number(
        typeof geometryMetadata === 'object' && geometryMetadata !== null
          ? (geometryMetadata as { floorIndexStart?: unknown }).floorIndexStart ?? 0
          : 0,
      ),
      floorIndexCount,
    );
  }
  return rendered;
}

function triangleCount(geometry: THREE.BufferGeometry): number {
  const index = geometry.getIndex();
  if (index === null) throw new Error('City ground geometry must be indexed');
  const start = geometry.drawRange.start;
  const count = Number.isFinite(geometry.drawRange.count)
    ? geometry.drawRange.count
    : index.count;
  return Math.min(count, Math.max(0, index.count - start)) / 3;
}

function expectServiceTunnelClear(ground: THREE.Mesh, track: NeonGrid): void {
  const raycaster = new THREE.Raycaster();
  const up = new THREE.Vector3(0, 1, 0);
  const down = new THREE.Vector3(0, -1, 0);
  for (let fraction = 0.1; fraction <= 0.9; fraction += 0.05) {
    const road = track.serviceTunnel.curve.getPointAt(fraction);
    raycaster.set(road.clone().addScaledVector(up, 5), down);
    raycaster.far = 8;
    const hits = raycaster.intersectObject(ground, false);
    expect(
      hits[0]?.point.y ?? -Infinity,
      `city ground must leave at least 0.75m below the service tunnel road at ${fraction.toFixed(2)}`,
    ).toBeLessThanOrEqual(road.y - 0.75);
  }
}

function expectRoadCorridorClear(
  ground: THREE.Mesh,
  label: string,
  length: number,
  centerAtDistance: (distance: number) => THREE.Vector3,
  tangentAtDistance: (distance: number) => THREE.Vector3,
  halfWidthAtDistance: (distance: number) => number,
): void {
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  ground.updateMatrixWorld(true);
  const sampleCount = Math.ceil(length);
  for (let sample = 0; sample <= sampleCount; sample++) {
    const distance = (sample / sampleCount) * length;
    const center = centerAtDistance(distance);
    const tangent = tangentAtDistance(distance).clone().setY(0).normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const halfWidth = halfWidthAtDistance(distance);
    for (const laneFraction of [-1, -0.5, 0, 0.5, 1]) {
      const lane = halfWidth * laneFraction;
      const road = center.clone().addScaledVector(right, lane);
      raycaster.set(road.clone().add(new THREE.Vector3(0, 5, 0)), down);
      raycaster.far = 8;
      const intersections = raycaster.intersectObject(ground, false);
      expect(
        intersections,
        `${label} city ground overlaps the road at ${distance.toFixed(1)}m lane ${lane.toFixed(1)}; ` +
          `roadY=${road.y.toFixed(2)} floorY=${intersections[0]?.point.y.toFixed(2) ?? 'none'}`,
      ).toHaveLength(0);
    }
  }
}

function expectGroundClearUnderSurface(
  ground: THREE.Mesh,
  label: string,
  surface: THREE.BufferGeometry,
): void {
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const positions = surface.getAttribute('position');
  const vertex = (index: number) => new THREE.Vector3().fromBufferAttribute(positions, index);
  const samples = Array.from({ length: positions.count }, (_, index) => ({
    label: `vertex ${String(index)}`,
    point: vertex(index),
  }));
  const indices = surface.index;
  const triangleCount = indices ? indices.count / 3 : positions.count / 3;
  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const a = vertex(indices ? indices.getX(triangle * 3) : triangle * 3);
    const b = vertex(indices ? indices.getX(triangle * 3 + 1) : triangle * 3 + 1);
    const c = vertex(indices ? indices.getX(triangle * 3 + 2) : triangle * 3 + 2);
    samples.push({
      label: `triangle ${String(triangle)} center`,
      point: a.add(b).add(c).multiplyScalar(1 / 3),
    });
  }

  ground.updateMatrixWorld(true);
  for (const sample of samples) {
    raycaster.set(sample.point.clone().add(new THREE.Vector3(0, 5, 0)), down);
    raycaster.far = 8;
    const intersections = raycaster.intersectObject(ground, false);
    expect(
      intersections,
      `${label} city ground intersects the authored support ${sample.label}; ` +
        `supportY=${sample.point.y.toFixed(2)} floorY=${intersections[0]?.point.y.toFixed(2) ?? 'none'}`,
    ).toHaveLength(0);
  }
}

function expectGroundSupportsFoundations(
  ground: THREE.Mesh,
  foundations: THREE.InstancedMesh,
  minimumVisibleRise = 0,
): void {
  ground.updateMatrixWorld(true);
  foundations.updateMatrixWorld(true);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const up = new THREE.Vector3(0, 1, 0);
  const down = new THREE.Vector3(0, -1, 0);
  const footprintFractions = [-0.5, -0.375, -0.25, -0.125, 0, 0.125, 0.25, 0.375, 0.5];
  foundations.geometry.computeBoundingBox();
  const foundationTop = foundations.geometry.boundingBox?.max.y ?? 1;

  for (let i = 0; i < foundations.count; i++) {
    foundations.getMatrixAt(i, matrix);
    matrix.decompose(position, rotation, scale);
    const foundationBottom = position.y;
    let lowestFootprintGround = Infinity;
    for (const xSign of [-0.44, 0.44]) {
      for (const zSign of [-0.44, 0.44]) {
        const foot = new THREE.Vector3(xSign * scale.x, 0, zSign * scale.z)
          .applyQuaternion(rotation)
          .add(position);
        raycaster.set(new THREE.Vector3(foot.x, foundationBottom - 20, foot.z), up);
        const hits = raycaster.intersectObject(ground, false);
        const supportingTop = Math.max(...hits.map((hit) => hit.point.y));
        expect(
          supportingTop,
          `${foundations.name} footing ${String(i)} corner at (${foot.x.toFixed(2)}, ${foot.z.toFixed(2)})`,
        ).toBeGreaterThanOrEqual(foundationBottom - 0.05);
      }
    }
    for (const xFraction of footprintFractions) {
      for (const zFraction of footprintFractions) {
        const sample = new THREE.Vector3(xFraction * scale.x, 0, zFraction * scale.z)
          .applyQuaternion(rotation)
          .add(position);
        raycaster.set(new THREE.Vector3(sample.x, position.y + scale.y + 30, sample.z), down);
        const hits = raycaster.intersectObject(ground, false);
        if (hits.length > 0) {
          lowestFootprintGround = Math.min(
            lowestFootprintGround,
            Math.max(...hits.map((hit) => hit.point.y)),
          );
        }
      }
    }
    expect(
      position.y + scale.y * foundationTop - lowestFootprintGround,
      `${foundations.name} footing ${String(i)} visible rise above the lowest terrace`,
    ).toBeGreaterThanOrEqual(minimumVisibleRise);
  }
}

describe('T9.7 city ground and waterfall-side massing', () => {
  it('gives the city ground a readable street to block color separation', () => {
    const base = new THREE.Color(0x405b68);
    const street = neonGridCityGroundColorAt(0, 0, base);
    const block = neonGridCityGroundColorAt(13.5, 13.5, base);
    const contrast = Math.hypot(street.r - block.r, street.g - block.g, street.b - block.b);
    expect(contrast).toBeGreaterThanOrEqual(0.12);
  });

  it('limits shortcut projection checks to ground cells near the shortcuts', () => {
    const track = new NeonGrid();
    const routeProjections = [
      vi.spyOn(track.serviceTunnel, 'project'),
      vi.spyOn(track.billboardGap, 'project'),
      vi.spyOn(track.waterfallDive, 'project'),
    ];
    const ground = neonGridTerracedCityGroundGeometry(
      track,
      neonGridCityGroundOptions(track, 0.5, 0.52),
    );

    expect(routeProjections.reduce((sum, projection) => sum + projection.mock.calls.length, 0))
      .toBeLessThan(100);
    ground.dispose();
    for (const projection of routeProjections) projection.mockRestore();
  });

  it('bounds city-ground cutouts to local surface cells beside the Billboard Gap', () => {
    const track = new NeonGrid();
    const ground = neonGridTerracedCityGroundGeometry(
      track,
      neonGridCityGroundOptions(track, 0, 0.25255),
    );
    const maxSpanByCorridor = ground.userData.maxOmittedCellSpanByCorridor as
      Record<string, number>;
    const billboardGapSpan = maxSpanByCorridor['billboard-gap'];

    expect(billboardGapSpan).toBeDefined();
    expect(billboardGapSpan).toBeLessThanOrEqual(11);
    ground.dispose();
  });

  it('checks rendered terrain foundations with a bounded mesh-query grid', () => {
    const track = new NeonGrid();
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    );
    ground.position.y = -2;
    let meshQueries = 0;
    const raycast = ground.raycast.bind(ground);
    ground.raycast = (...args) => {
      meshQueries++;
      raycast(...args);
    };

    cityGroundFootingBounds(
      track,
      {
        start: 0,
        end: 1,
        segments: 2,
        maximumRowSpacing: 10,
        innerOffset: 0,
        terraces: [{ outerOffset: 50, drop: 0 }],
        baseElevationAt: () => 0,
      },
      new THREE.Vector3(),
      0,
      10,
      10,
      1,
      ground,
    );

    expect(meshQueries).toBeLessThanOrEqual(5);
  });

  it('keeps the combined city-floor tessellation within the optimized presentation budget', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const floorMeshes = [
        scene.getObjectByName('skyline-deck-fascia'),
        scene.getObjectByName('undercity-wallside-sightline-screens'),
        scene.getObjectByName('falls-run-city-terraced-ground'),
        scene.getObjectByName('falls-run-extension-city-terraced-ground'),
      ];
      const floorTriangles = floorMeshes.map((object) =>
        Number((object as THREE.Mesh).geometry.userData.floorTriangleCount),
      );
      const skylineGround = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const billboardUnderlay = (skylineGround.geometry.userData.underlayCellsByCorridor as
        Record<string, number>)['billboard-gap'];

      expect(floorTriangles.every(Number.isFinite)).toBe(true);
      expect(floorTriangles.every((count) => count > 0)).toBe(true);
      expect(billboardUnderlay).toBeGreaterThan(0);
      expect(floorTriangles.reduce((total, count) => total + count, 0)).toBeLessThanOrEqual(6000);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('records disjoint triangle ranges for the rendered Skyline fascia components', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const fascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const rawRanges = fascia.userData.geometryRanges as
        | Record<string, { startTriangle: number; triangleCount: number }>
        | undefined;

      expect(rawRanges).toBeDefined();
      const ranges = rawRanges ?? {};
      const ordered = [
        ranges.outerFascia,
        ranges.roadsideScreens,
        ranges.billboardGapWing,
        ranges.cityGround,
        ranges.cityFoundations,
      ];
      expect(ordered.every((range) => range !== undefined)).toBe(true);
      let nextTriangle = 0;
      for (const range of ordered) {
        expect(range).toBeDefined();
        expect(range?.startTriangle).toBe(nextTriangle);
        expect(range?.triangleCount).toBeGreaterThan(0);
        nextTriangle += range?.triangleCount ?? 0;
      }
      expect(nextTriangle).toBe(triangleCount(fascia.geometry));
      expect(ranges.billboardGapWing?.triangleCount).toBeGreaterThan(0);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('prevents overlapping rendered city-floor surfaces around the Billboard Gap', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const fascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const geometry = fascia.geometry;
      const floorStart = Number(geometry.userData.floorIndexStart) / 3;
      const floorEnd = floorStart + Number(geometry.userData.floorIndexCount) / 3;
      const raycaster = new THREE.Raycaster();
      const direction = new THREE.Vector3(0, -1, 0);
      const overlaps: { x: number; z: number; elevations: number[] }[] = [];

      // Sweep the shortcut's full curved footprint plus its adjacent city
      // terraces. The former axis-aligned rectangle made more than 2,700
      // raycasts, most far from the shortcut, and timed out with CI coverage.
      const gap = track.billboardGap;
      const alongSteps = Math.ceil(gap.curve.getLength() / 4);
      for (let along = 0; along <= alongSteps; along++) {
        const fraction = along / alongSteps;
        const center = gap.curve.getPointAt(fraction);
        const tangent = gap.curve.getTangentAt(fraction);
        const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
        for (let lateral = -32; lateral <= 32; lateral += 8) {
          const sample = center.clone().addScaledVector(right, lateral);
          raycaster.set(new THREE.Vector3(sample.x, 100, sample.z), direction);
          const hits = raycaster
            .intersectObject(fascia, false)
            .filter((hit) => typeof hit.faceIndex === 'number' &&
              hit.faceIndex >= floorStart && hit.faceIndex < floorEnd)
            .map((hit) => hit.point.y)
            .sort((a, b) => b - a);
          const elevations = hits;
          const lowestElevation = elevations.at(-1);
          if (elevations[0] !== undefined && lowestElevation !== undefined &&
              elevations[0] - lowestElevation > 0.75) {
            overlaps.push({ x: sample.x, z: sample.z, elevations });
          }
        }
      }

      expect(overlaps).toEqual([]);
    } finally {
      disposeTrackScene(scene);
    }
  }, 15_000);

  it('bounds rendered Skyline terrace triangle edges after curvature adaptation', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const fascia = scene.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
      const geometry = fascia.geometry;
      const position = geometry.getAttribute('position');
      const index = geometry.getIndex();
      const start = Number(geometry.userData.floorIndexStart);
      const end = start + Number(geometry.userData.floorIndexCount);
      let maximumHorizontalEdge = 0;

      for (let cursor = start; cursor < end; cursor += 3) {
        const vertices = [0, 1, 2].map((offset) => {
          const vertex = index?.getX(cursor + offset) ?? cursor + offset;
          return new THREE.Vector3().fromBufferAttribute(position, vertex);
        });
        for (let edge = 0; edge < vertices.length; edge++) {
          const first = vertices[edge];
          const second = vertices[(edge + 1) % vertices.length];
          if (!first || !second) continue;
          maximumHorizontalEdge = Math.max(
            maximumHorizontalEdge,
            Math.hypot(first.x - second.x, first.z - second.z),
          );
        }
      }

      expect(maximumHorizontalEdge).toBeLessThanOrEqual(24);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('renders Falls Run city windows as two-sided low-polygon facade panels', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      for (const name of ['falls-run-city-windows', 'falls-run-extension-city-windows']) {
        const windows = requireInstanced(scene, name);
        expect(triangleCount(windows.geometry), `${name} triangles per window`).toBe(2);
        expect((windows.material as THREE.MeshBasicMaterial).side).toBe(THREE.DoubleSide);
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('bakes static city massing into the ground draw while preserving floor-only raycasts', () => {
    const floorGeometry = new THREE.PlaneGeometry(2, 2);
    floorGeometry.rotateX(-Math.PI / 2);
    floorGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(
        Array.from({ length: floorGeometry.getAttribute('position').count }, () => [0.1, 0.2, 0.3]).flat(),
        3,
      ),
    );
    const ground = new THREE.Mesh(
      floorGeometry,
      new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }),
    );
    ground.name = 'test-city-ground';

    const tower = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      1,
    );
    tower.name = 'test-city-towers';
    const towerMatrix = new THREE.Matrix4().makeTranslation(5, 1, 0);
    tower.setMatrixAt(0, towerMatrix);
    tower.setColorAt(0, new THREE.Color(0.8, 0.4, 0.2));

    const footing = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.3, 0.4) }),
      1,
    );
    footing.name = 'test-city-foundations';
    footing.setMatrixAt(0, new THREE.Matrix4().makeTranslation(-5, 0.5, 0));

    const floorIndexCount = floorGeometry.getIndex()?.count ?? 0;
    mergeInstancedCityMeshesIntoGround(ground, [tower, footing]);

    expect(ground.geometry.userData.floorIndexCount).toBe(floorIndexCount);
    expect(ground.geometry.getIndex()?.count).toBeGreaterThan(floorIndexCount);
    expect(ground.geometry.userData.bakedCityMeshes).toEqual([
      'test-city-towers',
      'test-city-foundations',
    ]);
    expect(tower.visible).toBe(false);
    expect(footing.visible).toBe(false);
    ground.geometry.computeBoundingBox();
    expect(ground.geometry.boundingBox?.max.x).toBeGreaterThan(5.49);
    expect(ground.geometry.boundingBox?.min.x).toBeLessThan(-5.49);

    const colors = ground.geometry.getAttribute('color');
    const positions = ground.geometry.getAttribute('position');
    const towerVertex = Array.from({ length: positions.count }, (_, index) => index).find(
      (index) => positions.getX(index) > 4.49 && positions.getX(index) < 5.51,
    );
    expect(towerVertex).toBeDefined();
    if (towerVertex === undefined) throw new Error('Baked tower vertex is missing');
    expect(colors.getX(towerVertex)).toBeCloseTo(0.8);
    expect(colors.getY(towerVertex)).toBeCloseTo(0.4);
    expect(colors.getZ(towerVertex)).toBeCloseTo(0.2);
  });

  it('keeps the exposed city horizon in the approved cool nighttime palette', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const sky = scene.getObjectByName('falls-run-night-sky');
      expect(sky).toBeInstanceOf(THREE.Mesh);
      const material = (sky as THREE.Mesh).material as THREE.ShaderMaterial;
      expect(material.fragmentShader).toContain('vec3 horizon = vec3(0.008, 0.012, 0.028)');
      expect(material.fragmentShader).toContain('vec3(0.035, 0.055, 0.13) * max(cityGlow, 0.0)');
      expect(material.fragmentShader).not.toContain('vec3(0.42, 0.16, 0.035)');
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('provides renderable city ground through Undercity and both Falls approaches', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const sectors = [
        {
          name: 'undercity-city-terraced-ground',
          progresses: [0.26, 0.31, 0.37, 0.43, 0.46],
        },
        {
          name: 'falls-run-extension-city-terraced-ground',
          progresses: [0.47, 0.54, 0.63, 0.69, 0.86, 0.92, 0.99],
        },
      ];
      const raycaster = new THREE.Raycaster();
      const down = new THREE.Vector3(0, -1, 0);
      for (const sector of sectors) {
        const ground = requireGround(scene, sector.name);
        expect(ground.userData.presentationOnly).toBe(true);
        expect(ground.userData.collision).toBe(false);
        if (sector.name === 'falls-run-extension-city-terraced-ground') {
          const towers = requireInstanced(scene, 'falls-run-extension-city-towers');
          const foundations = requireInstanced(scene, 'falls-run-extension-city-foundations');
          expect(towers.count).toBe(16);
          expect(foundations.count).toBe(16);
          expect(towers.visible).toBe(false);
          expect(foundations.visible).toBe(false);
          expect(ground.geometry.userData.bakedCityMeshes).toEqual([
            'falls-run-extension-city-towers',
            'falls-run-extension-city-foundations',
          ]);
        }
        ground.updateMatrixWorld(true);
        for (const progress of sector.progresses) {
          const center = track.curve.getPointAt(progress);
          let supportedSamples = 0;
          let samplesOnAnotherRaceRoad = 0;
          for (const side of [-1, 1] as const) {
            const sample = center.clone().addScaledVector(neonGridRightAt(track, progress), side * 18);
            const nearestRoad = track.projectMain(sample);
            if (nearestRoad.lateralDistance <= track.roadHalfWidth + 2.5) {
              samplesOnAnotherRaceRoad++;
              continue;
            }
            raycaster.set(sample.clone().add(new THREE.Vector3(0, 30, 0)), down);
            raycaster.far = 60;
            if (raycaster.intersectObject(ground, false).length > 0) supportedSamples++;
          }
          expect(
            supportedSamples + samplesOnAnotherRaceRoad,
            `${sector.name} should support exposed city sides or identify another road at course progress ${progress.toFixed(5)}`,
          ).toBe(2);
          expect(
            supportedSamples,
            `${sector.name} should support every exposed city side at course progress ${progress.toFixed(5)}`,
          ).toBe(2 - samplesOnAnotherRaceRoad);
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps generated city-ground triangles finite, nondegenerate, and continuous at sector joins', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const grounds = [
        requireGround(scene, 'skyline-city-terraced-ground'),
        requireGround(scene, 'undercity-city-terraced-ground'),
        requireGround(scene, 'falls-run-city-terraced-ground'),
        requireGround(scene, 'falls-run-extension-city-terraced-ground'),
      ];
      const seams = [0.25255, 0.46154128347522666, 0.69935, 0.852];
      const raycaster = new THREE.Raycaster();
      const down = new THREE.Vector3(0, -1, 0);
      for (const ground of grounds) {
        const geometry = ground.geometry;
        const positions = geometry.getAttribute('position');
        const index = geometry.getIndex();
        expect(index, `${ground.name} must use indexed geometry`).not.toBeNull();
        if (!index) throw new Error(`${ground.name} must use indexed geometry`);
        expect(geometry.userData.foldedTriangleCount, `${ground.name} folded triangles`).toBe(0);
        expect(Array.from(positions.array).every(Number.isFinite), ground.name).toBe(true);
        for (let triangle = 0; triangle < index.count / 3; triangle++) {
          const a = new THREE.Vector3().fromBufferAttribute(positions, index.getX(triangle * 3));
          const b = new THREE.Vector3().fromBufferAttribute(positions, index.getX(triangle * 3 + 1));
          const c = new THREE.Vector3().fromBufferAttribute(positions, index.getX(triangle * 3 + 2));
          expect(
            b.clone().sub(a).cross(c.clone().sub(a)).length(),
            `${ground.name} triangle ${String(triangle)} must have world-space area`,
          ).toBeGreaterThan(1e-5);
        }
      }
      for (const seam of seams) {
        for (const progress of [seam - 0.0002, seam + 0.0002]) {
          const center = track.curve.getPointAt(progress);
          for (const side of [-1, 1] as const) {
            const sample = center.clone().addScaledVector(neonGridRightAt(track, progress), side * 18);
            raycaster.set(sample.clone().add(new THREE.Vector3(0, 30, 0)), down);
            raycaster.far = 60;
            const hits = grounds.flatMap((ground) => raycaster.intersectObject(ground, false));
            expect(hits.length, `city-ground seam ${seam.toFixed(5)} side ${String(side)}`)
              .toBeGreaterThan(0);
          }
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('keeps rendered city-ground tiles shared, bounded and free of world-space overlaps', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const grounds = [
        requireGround(scene, 'skyline-city-terraced-ground'),
        requireGround(scene, 'undercity-city-terraced-ground'),
        requireGround(scene, 'falls-run-city-terraced-ground'),
        requireGround(scene, 'falls-run-extension-city-terraced-ground'),
      ];
      const layeredSurfaceHeights = new Map<
        string,
        { height: number; layer: string }[]
      >();
      for (const ground of grounds) {
        const geometry = ground.geometry;
        const index = geometry.getIndex();
        const positions = geometry.getAttribute('position');
        expect(index, `${ground.name} rendered geometry must be indexed`).not.toBeNull();
        if (!index) throw new Error(`${ground.name} has no index buffer`);
        const metadata = geometry.userData;
        const rawRanges = metadata.rasterSurfaceRanges as
          | { start: number; count: number }[]
          | undefined;
        const ranges = rawRanges ?? [{
          start: Number(metadata.rasterSurfaceIndexStart ?? 0),
          count: Number(metadata.rasterSurfaceIndexCount ?? 0),
        }];
        expect(ranges.some((range) => range.count > 0), `${ground.name} raster surface ranges`)
          .toBe(true);
        expect(Number(metadata.retainingWallTriangleCount ?? 0), `${ground.name} grid risers`)
          .toBe(0);

        for (const [rangeIndex, range] of ranges.entries()) {
          expect(range.start % 6, `${ground.name} raster range starts on quad boundaries`).toBe(0);
          expect(range.count % 6, `${ground.name} raster range ends on quad boundaries`).toBe(0);
          const layer = `${ground.name} range ${String(rangeIndex)}`;
          const localVertexHeights = new Map<string, number>();
          for (let offset = range.start; offset < range.start + range.count; offset += 6) {
            const quadVertices = [...new Set([
              index.getX(offset), index.getX(offset + 1), index.getX(offset + 2),
              index.getX(offset + 3), index.getX(offset + 4), index.getX(offset + 5),
            ])].map((vertexIndex) =>
              new THREE.Vector3().fromBufferAttribute(positions, vertexIndex),
            );
            const heights = quadVertices.map((vertex) => vertex.y);
            const centerX = quadVertices.reduce((total, vertex) => total + vertex.x, 0) /
              quadVertices.length;
            const centerY = heights.reduce((total, height) => total + height, 0) /
              heights.length;
            const centerZ = quadVertices.reduce((total, vertex) => total + vertex.z, 0) /
              quadVertices.length;
            expect(
              Math.max(...heights) - Math.min(...heights),
              `${ground.name} raster quad ${String(offset / 6)} must grade smoothly`,
            ).toBeLessThanOrEqual(1.51);
            const cellKey = `${String(Math.round(centerX * 1000))},${String(Math.round(centerZ * 1000))}`;
            const cellLayers = layeredSurfaceHeights.get(cellKey) ?? [];
            cellLayers.push({ height: centerY, layer });
            layeredSurfaceHeights.set(cellKey, cellLayers);
            for (const vertex of quadVertices) {
              const key = `${String(Math.round(vertex.x * 1000))},${String(Math.round(vertex.z * 1000))}`;
              const previous = localVertexHeights.get(key);
              if (previous) {
                expect(
                  Math.abs(previous - vertex.y),
                  `shared city-ground vertex ${key} in ${layer}`,
                ).toBeLessThanOrEqual(1e-3);
              } else {
                localVertexHeights.set(key, vertex.y);
              }
            }
          }
        }
      }
      for (const [key, layers] of layeredSurfaceHeights) {
        for (let first = 0; first < layers.length; first++) {
          for (let second = first + 1; second < layers.length; second++) {
            const a = layers[first];
            const b = layers[second];
            if (!a || !b || a.layer === b.layer) continue;
            expect(
              Math.abs(a.height - b.height),
              `coincident city-ground cells ${a.layer} and ${b.layer} at ${key}`,
            ).toBeGreaterThan(0.25);
          }
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('does not turn terrace ownership changes beside the Billboard Gap into sloped wedges', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const ground = requireGround(scene, 'skyline-city-terraced-ground');
      const geometry = ground.geometry;
      const positions = geometry.getAttribute('position');
      const index = geometry.getIndex();
      expect(index).not.toBeNull();
      if (!index) throw new Error('Skyline city ground must use indexed geometry');
      const start = Number(geometry.userData.rasterSurfaceIndexStart ?? 0) / 3;
      const end = start + Number(geometry.userData.rasterSurfaceIndexCount ?? 0) / 3;
      let largestHeightRange = 0;
      let worstCell: { progress: number; lateralDistance: number } | null = null;

      for (let triangle = start; triangle < end; triangle += 2) {
        const vertexIndices = [...new Set([
          index.getX(triangle * 3),
          index.getX(triangle * 3 + 1),
          index.getX(triangle * 3 + 2),
          index.getX(triangle * 3 + 3),
          index.getX(triangle * 3 + 4),
          index.getX(triangle * 3 + 5),
        ])];
        const vertices = vertexIndices.map((vertexIndex) =>
          new THREE.Vector3().fromBufferAttribute(positions, vertexIndex),
        );
        const center = vertices.reduce((sum, vertex) => sum.add(vertex), new THREE.Vector3())
          .multiplyScalar(1 / vertices.length);
        const projection = track.billboardGap.project(center, track.sampleCount);
        if (projection.progress < 0.02 || projection.progress > 0.98 || projection.lateralDistance > 25) {
          continue;
        }
        const heights = vertices.map((vertex) => vertex.y);
        const heightRange = Math.max(...heights) - Math.min(...heights);
        if (heightRange > largestHeightRange) {
          largestHeightRange = heightRange;
          worstCell = { progress: projection.progress, lateralDistance: projection.lateralDistance };
        }
      }

      expect(
        largestHeightRange,
        `Billboard Gap city-ground cell at ${worstCell?.progress.toFixed(3) ?? 'unknown'} ` +
          `and ${worstCell?.lateralDistance.toFixed(1) ?? 'unknown'} m from the shortcut ` +
          'must not bridge unrelated terrace elevations as a sloped face',
      ).toBeLessThanOrEqual(1.51);
    } finally {
      disposeTrackScene(scene);
    }
  }, 30000);

  it('keeps closed Billboard Gap screen sections continuous up to the measured road opening', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const fascia = scene.getObjectByName('skyline-deck-fascia');
      expect(fascia).toBeInstanceOf(THREE.Mesh);
      const intervals = (fascia?.userData.billboardWallOpenings ?? []) as {
        start: number;
        end: number;
      }[];
      expect(intervals.length).toBeGreaterThan(0);
      for (const interval of intervals) {
        const progress = (interval.start + interval.end) * 0.5;
        const center = track.curve.getPointAt(progress);
        const right = neonGridRightAt(track, progress);
        const billboardCenter = track.billboardGap.curve.getPointAt(0.5);
        const side = Math.sign(track.projectMain(billboardCenter).lateralOffset) || 1;
        const edge = center.addScaledVector(right, side * track.halfWidthAt(progress));
        const junction = track.billboardGap.project(edge, track.sampleCount);
        const gapLength = track.billboardGap.curve.getLength();
        const junctionDistance = track.billboardGap.fraction(junction) * gapLength;
        expect(
          junction.lateralDistance,
          `screen opening at ${progress.toFixed(4)} must correspond to the measured Billboard Gap aperture`,
        ).toBeLessThanOrEqual(track.billboardGap.roadHalfWidth + 1.5);
        expect(Math.abs(edge.y - junction.point.y)).toBeLessThan(1.5);
        expect(
          junctionDistance < track.billboardGap.mouthDistance + 10 ||
            junctionDistance > gapLength - 22,
        ).toBe(true);
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps early Billboard artwork above the ordinary wall and its raised supports in front of the screen', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      for (const name of ['skyline-ad-manaconda-racing', 'skyline-ad-taco-bell-live-mas']) {
        const ads = scene.getObjectByName(name);
        expect(ads).toBeInstanceOf(THREE.InstancedMesh);
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        (ads as THREE.InstancedMesh).getMatrixAt(3, matrix);
        matrix.decompose(position, rotation, scale);
        expect(position.y - 2 * scale.y, `${name} lower artwork edge`).toBeGreaterThan(1.4);
      }
      const supports = requireInstanced(scene, 'skyline-mask-roadside-billboard-supports');
      const matrix = new THREE.Matrix4();
      supports.getMatrixAt(0, matrix);
      const support = new THREE.Vector3().setFromMatrixPosition(matrix);
      const progress = 0.135;
      const center = track.curve.getPointAt(progress);
      const right = neonGridRightAt(track, progress);
      const billboardCenter = track.billboardGap.curve.getPointAt(0.5);
      const side = Math.sign(track.projectMain(billboardCenter).lateralOffset) || 1;
      const inward = right.clone().multiplyScalar(-side);
      const expected = center
        .clone()
        .addScaledVector(right, side * (track.halfWidthAt(progress) + 0.66))
        .addScaledVector(inward, 0.32);
      expect(support.distanceTo(expected), 'raised billboard supports should sit on the visible front face').toBeLessThan(1e-4);
      supports.geometry.computeBoundingBox();
      const backingFront = supports.geometry.boundingBox?.max.z;
      expect(backingFront, 'raised billboard backing needs measurable depth').toBeDefined();
      for (const [sponsorIndex, name] of [
        [0, 'skyline-ad-manaconda-racing'],
        [1, 'skyline-ad-taco-bell-live-mas'],
      ] as const) {
        const ads = scene.getObjectByName(name) as THREE.InstancedMesh;
        for (let i = 0; i < 2; i++) {
          const adMatrix = new THREE.Matrix4();
          const supportMatrix = new THREE.Matrix4();
          const adPosition = new THREE.Vector3();
          const supportPosition = new THREE.Vector3();
          const supportRotation = new THREE.Quaternion();
          ads.getMatrixAt(5 + i, adMatrix);
          supports.getMatrixAt(sponsorIndex * 2 + i, supportMatrix);
          adMatrix.decompose(adPosition, new THREE.Quaternion(), new THREE.Vector3());
          supportMatrix.decompose(supportPosition, supportRotation, new THREE.Vector3());
          const supportNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(supportRotation);
          const artworkDepth = adPosition.clone().sub(supportPosition).dot(supportNormal);
          expect(
            artworkDepth,
            `${name} raised artwork ${String(i)} must render in front of its backing face`,
          ).toBeGreaterThan((backingFront ?? Infinity) + 0.02);
        }
      }
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps the Falls city shelf visible just beyond the road edge', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const ground = requireGround(scene, 'falls-run-city-terraced-ground');
      const progress = 0.72;
      const roadPoint = track.curve.getPointAt(progress);
      const sample = roadPoint
        .clone()
        .addScaledVector(neonGridRightAt(track, progress), 16);
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(sample.x, roadPoint.y + 30, sample.z),
        new THREE.Vector3(0, -1, 0),
      );
      const hit = raycaster.intersectObject(ground, false)[0];

      expect(hit, 'expected the city floor on the outer terrace').toBeDefined();
      expect(hit?.point.y).toBeGreaterThan(roadPoint.y - 3.1);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps the Skyline city shelf visible just beyond the road edge', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const ground = requireGround(scene, 'skyline-city-terraced-ground');
      const progress = 0.12;
      const roadPoint = track.curve.getPointAt(progress);
      const sample = roadPoint
        .clone()
        .addScaledVector(neonGridRightAt(track, progress), 16);
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(sample.x, roadPoint.y + 30, sample.z),
        new THREE.Vector3(0, -1, 0),
      );
      const hit = raycaster.intersectObject(ground, false)[0];

      expect(hit, 'expected the city floor on the outer terrace').toBeDefined();
      expect(hit?.point.y).toBeGreaterThan(roadPoint.y - 3.1);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps the terraced city floors clear of the service tunnel and within their mesh budgets', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const skyline = requireGround(scene, 'skyline-city-terraced-ground');
      const falls = requireGround(scene, 'falls-run-city-terraced-ground');
      expect(triangleCount(skyline.geometry)).toBeLessThanOrEqual(2500);
      expect(triangleCount(falls.geometry)).toBeLessThanOrEqual(1200);
      expectServiceTunnelClear(skyline, track);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps Skyline city ground clear of the Billboard Gap shortcut roadway', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const ground = requireGround(scene, 'skyline-city-terraced-ground');
      const length = track.billboardGap.curve.getLength();
      expectRoadCorridorClear(
        ground,
        'Billboard Gap',
        length,
        (distance) => track.billboardGap.curve.getPointAt(distance / length),
        (distance) => track.billboardGap.curve.getTangentAt(distance / length),
        () => track.billboardGap.roadHalfWidth,
      );
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('keeps Falls city ground clear of the Waterfall Dive roadway and landing pad', () => {
    const track = new NeonGrid();
    const scene = createNeonGridScene(track, 'medium');
    try {
      const ground = requireGround(scene, 'falls-run-city-terraced-ground');
      const dive = track.waterfallDive;
      expectRoadCorridorClear(
        ground,
        'Waterfall Dive',
        dive.length,
        (distance) => dive.pointAtDistance(distance),
        () => dive.direction,
        () => dive.roadHalfWidth,
      );
      expectGroundClearUnderSurface(ground, 'Waterfall Dive landing pad', dive.landingGeometry);
    } finally {
      disposeTrackScene(scene);
    }
  });

  it('grounds every Skyline footing on a terraced, non-colliding city floor', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const track = new NeonGrid();
      const ground = requireGround(scene, 'skyline-city-terraced-ground');
      const foundations = requireInstanced(scene, 'skyline-city-foundations');
      const fascia = scene.getObjectByName('skyline-deck-fascia');
      expect(fascia).toBeInstanceOf(THREE.Mesh);
      expect(ground.userData.presentationOnly).toBe(true);
      expect(ground.userData.collision).toBe(false);
      expect(ground.visible).toBe(false);
      expect(foundations.visible).toBe(false);
      expect((fascia as THREE.Mesh).geometry.userData.terracedCityGround).toBe(true);
      expect((fascia as THREE.Mesh).geometry.userData.includesCityFoundations).toBe(22);
      expect(ground.geometry.userData.innerOffset).toBeGreaterThanOrEqual(track.roadHalfWidth + 5);
      expect(ground.geometry.getAttribute('color')).toBeDefined();
      expect(ground.geometry.userData.terraceCount).toBeGreaterThanOrEqual(3);
      expectGroundSupportsFoundations(ground, foundations, 0.4);
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('grounds stepped Falls towers on a terraced city floor without changing their count', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const track = new NeonGrid();
      const ground = requireGround(scene, 'falls-run-city-terraced-ground');
      const towers = requireInstanced(scene, 'falls-run-city-towers');
      const foundations = requireInstanced(scene, 'falls-run-city-foundations');
      const windows = requireInstanced(scene, 'falls-run-city-windows');
      const roofLights = requireInstanced(scene, 'falls-run-city-roof-lights');
      expect(towers.count).toBe(24);
      expect(foundations.count).toBe(24);
      expect(towers.visible).toBe(false);
      expect(foundations.visible).toBe(false);
      expect(ground.geometry.userData.bakedCityMeshes).toEqual([
        'falls-run-city-foundations',
        'falls-run-city-towers',
      ]);
      expect(ground.userData.presentationOnly).toBe(true);
      expect(ground.userData.collision).toBe(false);
      expect(ground.geometry.userData.innerOffset).toBeGreaterThanOrEqual(track.roadHalfWidth + 5);
      expect(ground.geometry.userData.terraceCount).toBeGreaterThanOrEqual(3);
      expectGroundSupportsFoundations(ground, foundations, 1.4);

      const positions = towers.geometry.getAttribute('position');
      expect(positions.count).toBeGreaterThanOrEqual(48);
      const widthAt = (y: number) => {
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < positions.count; i++) {
          if (Math.abs(positions.getY(i) - y) > 0.001) continue;
          min = Math.min(min, positions.getX(i));
          max = Math.max(max, positions.getX(i));
        }
        return max - min;
      };
      expect(widthAt(0)).toBeGreaterThan(widthAt(1));

      const towerMatrix = new THREE.Matrix4();
      const windowMatrix = new THREE.Matrix4();
      const towerPosition = new THREE.Vector3();
      const windowPosition = new THREE.Vector3();
      const towerRotation = new THREE.Quaternion();
      const windowRotation = new THREE.Quaternion();
      const towerScale = new THREE.Vector3();
      const windowScale = new THREE.Vector3();
      for (let i = 0; i < windows.count; i++) {
        const towerIndex = (i * 7) % towers.count;
        const row = (i * 5) % 15;
        const fraction = 0.12 + (row / 14) * 0.76;
        const tierScale = fraction > 0.62 ? 0.74 : 1;
        towers.getMatrixAt(towerIndex, towerMatrix);
        windows.getMatrixAt(i, windowMatrix);
        towerMatrix.decompose(towerPosition, towerRotation, towerScale);
        windowMatrix.decompose(windowPosition, windowRotation, windowScale);
        expect(windowPosition.y).toBeCloseTo(towerPosition.y + fraction * towerScale.y, 3);
        if (i % 2 === 0) {
          expect(windowPosition.z - towerPosition.z).toBeCloseTo(
            towerScale.z * tierScale * 0.505,
            2,
          );
        } else {
          expect(windowPosition.x - towerPosition.x).toBeCloseTo(
            towerScale.x * tierScale * 0.505,
            2,
          );
        }
      }

      const roofMatrix = new THREE.Matrix4();
      const roofPosition = new THREE.Vector3();
      const roofRotation = new THREE.Quaternion();
      const roofScale = new THREE.Vector3();
      expect(roofLights.count).toBe(towers.count);
      for (let i = 0; i < roofLights.count; i++) {
        towers.getMatrixAt(i, towerMatrix);
        roofLights.getMatrixAt(i, roofMatrix);
        towerMatrix.decompose(towerPosition, towerRotation, towerScale);
        roofMatrix.decompose(roofPosition, roofRotation, roofScale);
        expect(roofPosition.y).toBeCloseTo(towerPosition.y + towerScale.y + 0.12, 3);
        expect(roofPosition.z - towerPosition.z).toBeCloseTo(towerScale.z * 0.26, 3);
        expect(roofScale.x).toBeCloseTo(towerScale.x * 0.48, 3);
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);

  it('joins every Falls extension foundation to its stepped tower above the terraces', () => {
    const scene = createNeonGridScene(new NeonGrid(), 'medium');
    try {
      const towers = requireInstanced(scene, 'falls-run-extension-city-towers');
      const foundations = requireInstanced(scene, 'falls-run-extension-city-foundations');
      expect(towers.count).toBe(16);
      expect(foundations.count).toBe(towers.count);
      expect(towers.visible).toBe(false);
      expect(foundations.visible).toBe(false);

      towers.geometry.computeBoundingBox();
      foundations.geometry.computeBoundingBox();
      const towerBounds = towers.geometry.boundingBox;
      const foundationBounds = foundations.geometry.boundingBox;
      if (!towerBounds || !foundationBounds) {
        throw new Error('Falls extension city meshes must have finite bounds');
      }
      const towerMatrix = new THREE.Matrix4();
      const foundationMatrix = new THREE.Matrix4();
      const towerPosition = new THREE.Vector3();
      const foundationPosition = new THREE.Vector3();
      const towerScale = new THREE.Vector3();
      const foundationScale = new THREE.Vector3();
      const rotation = new THREE.Quaternion();

      for (let i = 0; i < towers.count; i++) {
        towers.getMatrixAt(i, towerMatrix);
        foundations.getMatrixAt(i, foundationMatrix);
        towerMatrix.decompose(towerPosition, rotation, towerScale);
        foundationMatrix.decompose(foundationPosition, rotation, foundationScale);
        const towerBottom = towerPosition.y + towerScale.y * towerBounds.min.y;
        const foundationTop = foundationPosition.y + foundationScale.y * foundationBounds.max.y;
        expect(foundationTop, `extension foundation ${String(i)} top`)
          .toBeCloseTo(towerBottom, 3);
      }
    } finally {
      disposeTrackScene(scene);
    }
  }, 20000);
});
