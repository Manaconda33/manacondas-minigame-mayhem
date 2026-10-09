import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { neonGridRightAt } from '../src/game/track/NeonGridVisualCommon';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

function requireInstanced(scene: THREE.Object3D, name: string): THREE.InstancedMesh {
  const object = scene.getObjectByName(name);
  expect(object, name).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh;
}

function requireGround(scene: THREE.Object3D, name: string): THREE.Mesh {
  const object = scene.getObjectByName(name);
  expect(object, name).toBeInstanceOf(THREE.Mesh);
  return object as THREE.Mesh;
}

function triangleCount(geometry: THREE.BufferGeometry): number {
  const index = geometry.getIndex();
  if (index === null) throw new Error('City ground geometry must be indexed');
  return index.count / 3;
}

function expectServiceTunnelClear(ground: THREE.Mesh, track: NeonGrid): void {
  const raycaster = new THREE.Raycaster();
  const up = new THREE.Vector3(0, 1, 0);
  const down = new THREE.Vector3(0, -1, 0);
  for (let fraction = 0.1; fraction <= 0.9; fraction += 0.05) {
    const road = track.serviceTunnel.curve.getPointAt(fraction);
    raycaster.set(road.clone().addScaledVector(up, 5), down);
    raycaster.far = 8;
    expect(
      raycaster.intersectObject(ground, false),
      `city ground overlaps the service tunnel at ${(fraction).toFixed(2)}`,
    ).toHaveLength(0);
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
          `${foundations.name} footing ${String(i)} corner`,
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
      expect(hit?.point.y).toBeGreaterThan(roadPoint.y - 0.65);
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
      expect(hit?.point.y).toBeGreaterThan(roadPoint.y - 0.65);
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
});
