import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import { TrackSegmentIndex } from './TrackSegmentIndex';
import { neonGridRightAt } from './NeonGridVisualCommon';

export interface CityGroundTerrace {
  readonly outerOffset: number;
  readonly drop: number;
}

export interface TerracedCityGroundOptions {
  readonly start: number;
  readonly end: number;
  readonly segments: number;
  readonly maximumRowSpacing: number;
  readonly innerOffset: number;
  readonly terraces: readonly CityGroundTerrace[];
  readonly baseElevationAt: (progress: number) => number;
}

export interface CityGroundFootingBounds {
  readonly bottomY: number;
  readonly topY: number;
  readonly depth: number;
}

const NEON_GRID_CITY_BLOCK_SIZE = 27;

/** Return the vertex tint used to distinguish city streets from their blocks. */
export function neonGridCityGroundColorAt(x: number, z: number, base: THREE.Color): THREE.Color {
  const localX = ((x % NEON_GRID_CITY_BLOCK_SIZE) + NEON_GRID_CITY_BLOCK_SIZE) % NEON_GRID_CITY_BLOCK_SIZE;
  const localZ = ((z % NEON_GRID_CITY_BLOCK_SIZE) + NEON_GRID_CITY_BLOCK_SIZE) % NEON_GRID_CITY_BLOCK_SIZE;
  const streetDistance = Math.min(
    localX,
    NEON_GRID_CITY_BLOCK_SIZE - localX,
    localZ,
    NEON_GRID_CITY_BLOCK_SIZE - localZ,
  );
  const blockX = Math.floor(x / NEON_GRID_CITY_BLOCK_SIZE);
  const blockZ = Math.floor(z / NEON_GRID_CITY_BLOCK_SIZE);
  const hash = Math.abs(Math.sin(blockX * 12.9898 + blockZ * 78.233) * 43758.5453) % 1;
  const parcelColor = base.clone().multiplyScalar(0.92 + hash * 0.14);
  const streetBlend = 1 - THREE.MathUtils.smoothstep(streetDistance, 3, 7);
  return parcelColor.lerp(new THREE.Color(0x10202a), streetBlend * 0.96);
}

/** Bake opaque static city massing into its ground mesh to save draw calls. */
export function mergeInstancedCityMeshesIntoGround(
  ground: THREE.Mesh,
  sources: readonly THREE.InstancedMesh[],
): void {
  const floor = ground.geometry;
  if (!floor.hasAttribute('position')) {
    throw new Error(`${ground.name} has no floor positions`);
  }
  const floorPositions = floor.getAttribute('position');
  const floorIndex = floor.getIndex();
  if (!floorIndex) throw new Error(`${ground.name} must use indexed floor geometry`);
  const floorIndexCount = floorIndex.count;
  const positions = Array.from(floorPositions.array as ArrayLike<number>);
  if (!floor.hasAttribute('color')) {
    throw new Error(`${ground.name} has no floor colors`);
  }
  const floorColors = floor.getAttribute('color');
  const colors = Array.from(floorColors.array as ArrayLike<number>);
  const indices = Array.from(floorIndex.array as ArrayLike<number>);
  const bakedCityMeshes: string[] = [];
  const vertex = new THREE.Vector3();
  const instanceMatrix = new THREE.Matrix4();
  const inverseGround = ground.matrixWorld.clone().invert();

  ground.updateWorldMatrix(true, false);
  inverseGround.copy(ground.matrixWorld).invert();
  for (const source of sources) {
    const material = source.material;
    if (
      Array.isArray(material) ||
      !(material instanceof THREE.MeshBasicMaterial) ||
      material.transparent ||
      material.opacity !== 1 ||
      material.map
    ) {
      throw new Error(`${source.name} must use an opaque untextured MeshBasicMaterial`);
    }
    if (!source.geometry.hasAttribute('position')) {
      throw new Error(`${source.name} has no positions`);
    }
    const sourcePositions = source.geometry.getAttribute('position');
    const sourceColors = source.geometry.hasAttribute('color')
      ? source.geometry.getAttribute('color')
      : undefined;
    const usesVertexColors = material.vertexColors && sourceColors !== undefined;
    const sourceIndex = source.geometry.getIndex();
    const sourceIndexCount = sourceIndex?.count ?? sourcePositions.count;
    const sourceToGround = new THREE.Matrix4();
    const baseColor = material.color.clone();
    const instanceColor = new THREE.Color();
    const vertexColor = new THREE.Color();

    source.updateWorldMatrix(true, false);
    for (let instance = 0; instance < source.count; instance++) {
      source.getMatrixAt(instance, instanceMatrix);
      sourceToGround.copy(inverseGround).multiply(source.matrixWorld).multiply(instanceMatrix);
      if (source.instanceColor) source.getColorAt(instance, instanceColor);
      else instanceColor.set(1, 1, 1);
      const colorStart = colors.length / 3;
      for (let i = 0; i < sourcePositions.count; i++) {
        vertex.fromBufferAttribute(sourcePositions, i).applyMatrix4(sourceToGround);
        positions.push(vertex.x, vertex.y, vertex.z);
        vertexColor.copy(baseColor).multiply(instanceColor);
        if (usesVertexColors) {
          vertexColor.multiply(
            new THREE.Color().fromBufferAttribute(sourceColors, i),
          );
        }
        colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
      }
      for (let i = 0; i < sourceIndexCount; i++) {
        const index = sourceIndex?.getX(i) ?? i;
        indices.push(colorStart + index);
      }
    }
    source.visible = false;
    source.userData.bakedInto = ground.name;
    bakedCityMeshes.push(source.name);
  }

  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    .setIndex(indices);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.userData = { ...floor.userData };
  geometry.userData.floorIndexCount = floorIndexCount;
  geometry.userData.floorTriangleCount = floorIndexCount / 3;
  geometry.userData.bakedCityMeshes = bakedCityMeshes;
  geometry.userData.bakedCityTriangleCount = (indices.length - floorIndexCount) / 3;
  floor.dispose();
  ground.geometry = geometry;
}

export function cityGroundElevation(
  track: NeonGrid,
  options: TerracedCityGroundOptions,
  progress: number,
  lateralOffset: number,
): number {
  const safeProgress = THREE.MathUtils.clamp(progress, 0, 1);
  const offset = Math.abs(lateralOffset);
  const tolerance = 1e-4;
  if (
    safeProgress < options.start - tolerance ||
    safeProgress > options.end + tolerance ||
    offset < options.innerOffset - tolerance
  ) return Number.NaN;
  const profile = cityGroundOffsetProfile(track, options, safeProgress, lateralOffset < 0 ? -1 : 1);
  if (!profile) return Number.NaN;
  const maximumOffset = profile.outerOffsets.at(-1) ?? options.innerOffset;
  if (offset > maximumOffset + tolerance) return Number.NaN;
  const terraceIndex = profile.outerOffsets.findIndex((outerOffset) => offset <= outerOffset);
  const terrace = options.terraces[terraceIndex < 0 ? options.terraces.length - 1 : terraceIndex];
  return (
    options.baseElevationAt(safeProgress) + (terrace?.drop ?? options.terraces.at(-1)?.drop ?? 0)
  );
}

interface CityGroundOffsetProfile {
  readonly innerOffset: number;
  readonly outerOffsets: readonly number[];
}

function cityCorridorBounds(
  pointAt: (fraction: number) => THREE.Vector3,
  pathLength: number,
  horizontalPadding: number,
  verticalBelow: number,
  verticalAbove: number,
): THREE.Box3 {
  const bounds = new THREE.Box3();
  const sampleCount = Math.max(16, Math.ceil(pathLength));
  const padding = horizontalPadding + 1;
  for (let sample = 0; sample <= sampleCount; sample++) {
    const point = pointAt(sample / sampleCount);
    bounds.expandByPoint(new THREE.Vector3(
      point.x - padding,
      point.y - verticalBelow,
      point.z - padding,
    ));
    bounds.expandByPoint(new THREE.Vector3(
      point.x + padding,
      point.y + verticalAbove,
      point.z + padding,
    ));
  }
  return bounds;
}

function signedPlanarCurvature(track: NeonGrid, progress: number): number {
  const step = 0.001;
  const before = track.curve.getTangentAt(THREE.MathUtils.euclideanModulo(progress - step, 1))
    .setY(0)
    .normalize();
  const after = track.curve.getTangentAt(THREE.MathUtils.euclideanModulo(progress + step, 1))
    .setY(0)
    .normalize();
  const angle = Math.atan2(before.z * after.x - before.x * after.z, before.dot(after));
  const beforePoint = track.curve.getPointAt(THREE.MathUtils.euclideanModulo(progress - step, 1));
  const afterPoint = track.curve.getPointAt(THREE.MathUtils.euclideanModulo(progress + step, 1));
  const planarDistance = Math.hypot(afterPoint.x - beforePoint.x, afterPoint.z - beforePoint.z);
  return planarDistance > 1e-4 ? angle / planarDistance : 0;
}

/**
 * Offset terraces compress toward the road on tight inside curves. A constant
 * lateral offset can reverse its tangent when it exceeds the curve radius,
 * folding the floor back over itself. The row profile keeps every terrace on
 * the safe side of that curvature limit while preserving the same tier heights.
 */
function cityGroundOffsetProfile(
  track: NeonGrid,
  options: TerracedCityGroundOptions,
  progress: number,
  side: -1 | 1,
): CityGroundOffsetProfile | null {
  const desiredOuter = options.terraces.at(-1)?.outerOffset ?? options.innerOffset;
  // Use a sliding row-width curvature envelope. Looking only at the row end
  // points lets a tight bend in the middle push the outer terrace through
  // itself, even when both endpoint profiles appear safe.
  const window = options.maximumRowSpacing / track.curve.getLength();
  const sampleCount = 9;
  let safeOuter = desiredOuter;
  let minimumOuter = 0;
  for (let i = 0; i <= sampleCount; i++) {
    const sample = THREE.MathUtils.euclideanModulo(
      progress - window + (2 * window * i) / sampleCount,
      1,
    );
    const curvature = signedPlanarCurvature(track, sample);
    const insideCurvature = curvature * side;
    if (insideCurvature > 1e-5) safeOuter = Math.min(safeOuter, 0.82 / insideCurvature);
    minimumOuter = Math.max(minimumOuter, track.halfWidthAt(sample) + 1.25);
  }
  if (safeOuter < minimumOuter) return null;

  const innerOffset = Math.min(options.innerOffset, safeOuter - 1.0);
  const requestedWidth = Math.max(1e-6, desiredOuter - options.innerOffset);
  const safeWidth = Math.max(0, safeOuter - innerOffset);
  const scale = safeWidth / requestedWidth;
  const outerOffsets = options.terraces.map((terrace) =>
    innerOffset + (terrace.outerOffset - options.innerOffset) * scale,
  );
  return { innerOffset, outerOffsets };
}

/**
 * Conservative footing elevation: the building stem reaches the lowest part of
 * its entire footprint, so the higher inner terraces overlap it instead of
 * leaving exposed gaps below corners.
 */
export function cityGroundFootingBounds(
  track: NeonGrid,
  options: TerracedCityGroundOptions,
  center: THREE.Vector3,
  rotationY: number,
  footprintWidth: number,
  footprintDepth: number,
  visibleRise: number,
  renderedGround?: THREE.Mesh,
): CityGroundFootingBounds {
  let lowestSurface = Infinity;
  let highestSurface = -Infinity;
  let unsupportedSamples = 0;
  const local = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const footprintSamples: readonly (readonly [number, number])[] = renderedGround
    ? [[-0.44, -0.44], [-0.44, 0.44], [0, 0], [0.44, -0.44], [0.44, 0.44]]
    : [-0.5, -0.375, -0.25, -0.125, 0, 0.125, 0.25, 0.375, 0.5].flatMap((xFraction) =>
      [-0.5, -0.375, -0.25, -0.125, 0, 0.125, 0.25, 0.375, 0.5].map((zFraction) =>
        [xFraction, zFraction] as const,
      ),
    );
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  if (renderedGround) {
    renderedGround.updateMatrixWorld(true);
    raycaster.far = 500;
  }
  for (const [xFraction, zFraction] of footprintSamples) {
    local.set(xFraction * footprintWidth, 0, zFraction * footprintDepth);
    offset.copy(local).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rotationY);
    const samplePoint = center.clone().add(offset);
    let surface: number;
    if (renderedGround) {
      raycaster.set(samplePoint.clone().add(new THREE.Vector3(0, 250, 0)), down);
      const hits = raycaster.intersectObject(renderedGround, false);
      surface = hits[0]?.point.y ?? Number.NaN;
    } else {
      const projection = track.projectMain(samplePoint);
      surface = cityGroundElevation(track, options, projection.progress, projection.lateralOffset);
    }
    if (!Number.isFinite(surface)) {
      unsupportedSamples++;
      continue;
    }
    if (!renderedGround) {
      const projection = track.projectMain(samplePoint);
      const surfacePoint = track.curve.getPointAt(projection.progress)
        .addScaledVector(neonGridRightAt(track, projection.progress), projection.lateralOffset)
        .setY(surface);
      const tunnel = track.serviceTunnel.project(surfacePoint, track.sampleCount);
      if (
        tunnel.lateralDistance <= Math.max(1.5, track.serviceTunnel.roadHalfWidth + 1.25) &&
        surfacePoint.y >= tunnel.point.y - 0.75 &&
        surfacePoint.y <= tunnel.point.y + track.serviceTunnel.headroom + 1.25
      ) {
        unsupportedSamples++;
        continue;
      }
      const billboard = track.billboardGap.project(surfacePoint, track.sampleCount);
      if (
        Math.hypot(surfacePoint.x - billboard.point.x, surfacePoint.z - billboard.point.z) <=
          track.billboardGap.roadHalfWidth + 1 &&
        Math.abs(surfacePoint.y - billboard.point.y) <= 3
      ) {
        unsupportedSamples++;
        continue;
      }
      const dive = track.waterfallDive.project(surfacePoint, track.sampleCount);
      if (
        Math.hypot(surfacePoint.x - dive.point.x, surfacePoint.z - dive.point.z) <=
          Math.max(track.waterfallDive.roadHalfWidth, 5) + 1 &&
        Math.abs(surfacePoint.y - dive.point.y) <= 3
      ) {
        unsupportedSamples++;
        continue;
      }
    }
    lowestSurface = Math.min(lowestSurface, surface);
    highestSurface = Math.max(highestSurface, surface);
  }
  if (
    unsupportedSamples > 0 ||
    !Number.isFinite(lowestSurface) ||
    !Number.isFinite(highestSurface)
  ) {
    throw new Error(
      `City building footprint has ${String(unsupportedSamples)} unsupported ground samples`,
    );
  }
  // Embed the full footing below the lowest terrace while keeping its top
  // visibly above the highest terrace crossed by the building footprint.
  const bottomY = lowestSurface - 0.75;
  const topY = highestSurface + visibleRise;
  return { bottomY, topY, depth: topY - bottomY };
}

export function neonGridTerracedCityGroundGeometry(
  track: NeonGrid,
  options: TerracedCityGroundOptions,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const terraceColors = [
    new THREE.Color(0x405b68),
    new THREE.Color(0x365461),
    new THREE.Color(0x2c4958),
    new THREE.Color(0x274557),
    new THREE.Color(0x1f384a),
    new THREE.Color(0x172b3a),
  ];
  const corridorUnderlayColor = new THREE.Color(0x203744);
  const topSurfaceQuads: {
    readonly corners: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
    readonly color: THREE.Color;
  }[] = [];
  const pendingUnderlays: {
    readonly corners: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
    readonly color: THREE.Color;
  }[] = [];
  const coarseRowCount = Math.max(2, options.segments);
  const profileCache = new Map<number, Map<-1 | 1, CityGroundOffsetProfile | null>>();
  const profilesAt = (progress: number) => {
    const cached = profileCache.get(progress);
    if (cached) return cached;
    const profiles = new Map<-1 | 1, CityGroundOffsetProfile | null>();
    for (const side of [-1, 1] as const)
      profiles.set(side, cityGroundOffsetProfile(track, options, progress, side));
    profileCache.set(progress, profiles);
    return profiles;
  };
  const rowProgresses = [options.start];
  for (let row = 0; row < coarseRowCount; row++) {
    const end = THREE.MathUtils.lerp(options.start, options.end, (row + 1) / coarseRowCount);
    rowProgresses.push(end);
  }
  const rowProfiles = new Map<-1 | 1, (CityGroundOffsetProfile | null)[]>();
  for (const side of [-1, 1] as const) {
    rowProfiles.set(
      side,
      rowProgresses.map((progress) => profilesAt(progress).get(side) ?? null),
    );
  }
  const serviceTunnelBounds = cityCorridorBounds(
    (fraction) => track.serviceTunnel.curve.getPointAt(fraction),
    track.serviceTunnel.curve.getLength(),
    Math.max(1.5, track.serviceTunnel.roadHalfWidth + 1.25),
    0.75,
    track.serviceTunnel.headroom + 1.25,
  );
  const billboardGapBounds = cityCorridorBounds(
    (fraction) => track.billboardGap.curve.getPointAt(fraction),
    track.billboardGap.curve.getLength(),
    track.billboardGap.roadHalfWidth + 1,
    3,
    3,
  );
  const waterfallDiveBounds = cityCorridorBounds(
    (fraction) => track.waterfallDive.pointAtDistance(fraction * track.waterfallDive.length),
    track.waterfallDive.length,
    Math.max(track.waterfallDive.roadHalfWidth, 5) + 1,
    3,
    3,
  );
  const omittedByCorridor = new Map<string, number>();
  const underlayByCorridor = new Map<string, number>();
  const maxOmittedCellSpanByCorridor = new Map<string, number>();
  let foldedTriangles = 0;

  const point = (progress: number, side: -1 | 1, offset: number, drop: number) => {
    const safeProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const center = track.curve.getPointAt(safeProgress);
    return center
      .addScaledVector(neonGridRightAt(track, safeProgress), side * offset)
      .setY(options.baseElevationAt(safeProgress) + drop);
  };

  const writeQuad = (
    corners: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3],
    color: THREE.Color,
    vertexColors?: readonly THREE.Color[],
  ) => {
    const first = positions.length / 3;
    for (const [index, corner] of corners.entries()) {
      const vertexColor = vertexColors?.[index] ?? color;
      positions.push(...corner.toArray());
      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }
    indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
  };
  const appendQuad = (
    corners: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3],
    color: THREE.Color,
    side: -1 | 1,
  ) => {
    // Terrace tops are rasterized in world XZ after route sampling so nearby
    // route passes can share one visible ground surface. The old route ribbons
    // are retained only as coverage/color sources, never as overlapping faces.
    const normal = corners[1]
      .clone()
      .sub(corners[0])
      .cross(corners[2].clone().sub(corners[0]));
    if (normal.lengthSq() < 1e-8 || normal.y * side <= 1e-5) foldedTriangles += 2;
    topSurfaceQuads.push({
      corners: corners.map((corner) => corner.clone()) as
        [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3],
      color: color.clone(),
    });
    return true;
  };

  const surfaceBucketSize = 32;
  const surfaceBuckets = new Map<string, number[]>();
  let surfaceBucketsReady = false;
  interface CityGroundSurfaceSample {
    height: number;
    color: THREE.Color;
    plane: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  }
  const surfaceOwnerAt = (
    x: number,
    z: number,
  ): CityGroundSurfaceSample | null => {
    let highest: CityGroundSurfaceSample | null = null;
    const bucketX = Math.floor(x / surfaceBucketSize);
    const bucketZ = Math.floor(z / surfaceBucketSize);
    const candidates = surfaceBucketsReady
      ? (surfaceBuckets.get(`${String(bucketX)},${String(bucketZ)}`) ?? [])
      : topSurfaceQuads.map((_, index) => index);
    for (const index of candidates) {
      const quad = topSurfaceQuads[index];
      if (!quad) continue;
      const [a, b, c, d] = quad.corners;
      for (const [first, second, third] of [[a, b, c], [a, c, d]] as const) {
        const denominator = (second.z - third.z) * (first.x - third.x) +
          (third.x - second.x) * (first.z - third.z);
        if (Math.abs(denominator) < 1e-8) continue;
        const firstWeight = ((second.z - third.z) * (x - third.x) +
          (third.x - second.x) * (z - third.z)) / denominator;
        const secondWeight = ((third.z - first.z) * (x - third.x) +
          (first.x - third.x) * (z - third.z)) / denominator;
        const thirdWeight = 1 - firstWeight - secondWeight;
        if (firstWeight < -1e-5 || secondWeight < -1e-5 || thirdWeight < -1e-5) continue;
        const elevation = firstWeight * first.y + secondWeight * second.y + thirdWeight * third.y;
        if (highest === null || elevation > highest.height) {
          highest = {
            height: elevation,
            color: quad.color,
            plane: [first, second, third],
          };
        }
      }
    }
    return highest;
  };
  const surfaceHeightOnOwnerPlane = (
    owner: CityGroundSurfaceSample,
    x: number,
    z: number,
  ): number => {
    const [first, second, third] = owner.plane;
    const denominator = (second.z - third.z) * (first.x - third.x) +
      (third.x - second.x) * (first.z - third.z);
    if (Math.abs(denominator) < 1e-8) return owner.height;
    const firstWeight = ((second.z - third.z) * (x - third.x) +
      (third.x - second.x) * (z - third.z)) / denominator;
    const secondWeight = ((third.z - first.z) * (x - third.x) +
      (first.x - third.x) * (z - third.z)) / denominator;
    const thirdWeight = 1 - firstWeight - secondWeight;
    return firstWeight * first.y + secondWeight * second.y + thirdWeight * third.y;
  };
  const surfaceNodeCache = new Map<string, CityGroundSurfaceSample | null>();
  const surfaceNodeAt = (
    x: number,
    z: number,
  ): CityGroundSurfaceSample | null => {
    const key = `${x.toFixed(3)},${z.toFixed(3)}`;
    const cached = surfaceNodeCache.get(key);
    if (cached !== undefined) return cached;
    const direct = surfaceOwnerAt(x, z);
    if (direct) {
      surfaceNodeCache.set(key, direct);
      return direct;
    }
    for (let radius = 2; radius <= 16; radius += 2) {
      let nearest: { owner: CityGroundSurfaceSample; distance: number } | null = null;
      for (let sample = 0; sample < 8; sample++) {
        const angle = (Math.PI * 2 * sample) / 8;
        const owner = surfaceOwnerAt(x + Math.cos(angle) * radius, z + Math.sin(angle) * radius);
        if (!owner) continue;
        if (nearest === null || radius < nearest.distance ||
            (radius === nearest.distance && owner.height > nearest.owner.height)) {
          nearest = { owner, distance: radius };
        }
      }
      if (nearest) {
        surfaceNodeCache.set(key, nearest.owner);
        return nearest.owner;
      }
    }
    surfaceNodeCache.set(key, null);
    return null;
  };

  const blockedByRaceCorridor = (
    x: number,
    y: number,
    z: number,
    includeMainCourse: boolean,
  ): string | null => {
    const point = new THREE.Vector3(x, y, z);
    if (serviceTunnelBounds.containsPoint(point)) {
      const tunnel = track.serviceTunnel.project(point, track.sampleCount);
      if (
        tunnel.lateralDistance <= Math.max(1.5, track.serviceTunnel.roadHalfWidth + 1.25) &&
        y >= tunnel.point.y - 0.75 &&
        y <= tunnel.point.y + track.serviceTunnel.headroom + 1.25
      ) return 'service-tunnel';
    }
    if (billboardGapBounds.containsPoint(point)) {
      const billboard = track.billboardGap.project(point, track.sampleCount);
      if (
        Math.hypot(x - billboard.point.x, z - billboard.point.z) <=
          track.billboardGap.roadHalfWidth + 1 &&
        Math.abs(y - billboard.point.y) <= 3
      ) return 'billboard-gap';
    }
    if (waterfallDiveBounds.containsPoint(point)) {
      const dive = track.waterfallDive.project(point, track.sampleCount);
      if (
        Math.hypot(x - dive.point.x, z - dive.point.z) <=
          Math.max(track.waterfallDive.roadHalfWidth, 5) + 1 &&
        Math.abs(y - dive.point.y) <= 3
      ) return 'waterfall-dive';
    }
    if (!includeMainCourse) return null;
    const main = track.projectMain(point);
    if (
      main.lateralDistance <= track.roadHalfWidth + 0.75 &&
      Math.abs(y - main.point.y) <= 2.5
    ) return 'main-course';
    return null;
  };

  let occludedCityGroundSurfacesRemoved = 0;
  let occludedCorridorUnderlaysRemoved = 0;
  for (const side of [-1, 1] as const) {
    for (let band = 0; band < options.terraces.length; band++) {
      const terrace = options.terraces[band];
      if (!terrace) continue;
      const color =
        terraceColors[band % terraceColors.length] ?? terraceColors[0] ?? new THREE.Color(0x19313c);

    const rowCount = rowProgresses.length - 1;
    for (let row = 0; row < rowCount; row++) {
        const p0 = rowProgresses[row] ?? options.start;
        const p1 = rowProgresses[row + 1] ?? options.end;
        const profiles = rowProfiles.get(side);
        const profile0 = profiles?.[row] ?? null;
        const profile1 = profiles?.[row + 1] ?? null;
        if (!profile0 || !profile1) continue;
        const inner0 = band === 0 ? profile0.innerOffset : profile0.outerOffsets[band - 1];
        const outer0 = profile0.outerOffsets[band];
        const inner1 = band === 0 ? profile1.innerOffset : profile1.outerOffsets[band - 1];
        const outer1 = profile1.outerOffsets[band];
        if (inner0 === undefined || outer0 === undefined || inner1 === undefined || outer1 === undefined) continue;
        const drop0 = terrace.drop;
        const drop1 = terrace.drop;
        const laneCount = Math.max(1, Math.ceil(Math.max(outer0 - inner0, outer1 - inner1) / 16));
        const makeCell = (
          alongStart: number,
          alongEnd: number,
          acrossStart: number,
          acrossEnd: number,
        ) => {
          const cellP0 = THREE.MathUtils.lerp(p0, p1, alongStart);
          const cellP1 = THREE.MathUtils.lerp(p0, p1, alongEnd);
          const cellInner0 = THREE.MathUtils.lerp(inner0, inner1, alongStart);
          const cellOuter0 = THREE.MathUtils.lerp(outer0, outer1, alongStart);
          const cellInner1 = THREE.MathUtils.lerp(inner0, inner1, alongEnd);
          const cellOuter1 = THREE.MathUtils.lerp(outer0, outer1, alongEnd);
          const cellOffset00 = THREE.MathUtils.lerp(cellInner0, cellOuter0, acrossStart);
          const cellOffset01 = THREE.MathUtils.lerp(cellInner0, cellOuter0, acrossEnd);
          const cellOffset10 = THREE.MathUtils.lerp(cellInner1, cellOuter1, acrossStart);
          const cellOffset11 = THREE.MathUtils.lerp(cellInner1, cellOuter1, acrossEnd);
          return [
            point(cellP0, side, cellOffset00, drop0),
            point(cellP1, side, cellOffset10, drop1),
            point(cellP1, side, cellOffset11, drop1),
            point(cellP0, side, cellOffset01, drop0),
          ] as const;
        };
        const appendCell = (
          alongStart: number,
          alongEnd: number,
          acrossStart: number,
          acrossEnd: number,
          depth: number,
        ): void => {
          const corners = makeCell(alongStart, alongEnd, acrossStart, acrossEnd);
          const alongMiddle = (alongStart + alongEnd) * 0.5;
          const midProgress = THREE.MathUtils.lerp(p0, p1, alongMiddle);
          const midInner = THREE.MathUtils.lerp(inner0, inner1, alongMiddle);
          const midOuter = THREE.MathUtils.lerp(outer0, outer1, alongMiddle);
          const maximumCurveError = Math.max(
            point(
              midProgress,
              side,
              THREE.MathUtils.lerp(midInner, midOuter, acrossStart),
              drop0,
            ).distanceTo(corners[0].clone().lerp(corners[1], 0.5)),
            point(
              midProgress,
              side,
              THREE.MathUtils.lerp(midInner, midOuter, acrossEnd),
              drop0,
            ).distanceTo(corners[3].clone().lerp(corners[2], 0.5)),
          );
          // Refine source faces in world space where route curvature makes
          // their XZ footprint diverge from the sampled centerline. These
          // faces feed the shared heightfield and are not emitted as triangles.
          if (maximumCurveError > 0.5 && depth < 8) {
            appendCell(alongStart, alongMiddle, acrossStart, acrossEnd, depth + 1);
            appendCell(alongMiddle, alongEnd, acrossStart, acrossEnd, depth + 1);
            return;
          }
          appendQuad(corners, color, side);
        };
        for (let lane = 0; lane < laneCount; lane++) {
          const laneStart = lane / laneCount;
          const laneEnd = (lane + 1) / laneCount;
          appendCell(0, 1, laneStart, laneEnd, 0);
        }

        // No independent risers are emitted: all city-ground top faces share
        // the same bounded height field, avoiding overlapping wall strips.
      }
    }
  }


  const gridBounds = new THREE.Box3();
  for (let index = 0; index < topSurfaceQuads.length; index++) {
    const quad = topSurfaceQuads[index];
    if (!quad) continue;
    const box = new THREE.Box3().setFromPoints([...quad.corners]);
    gridBounds.union(box);
    const minBucketX = Math.floor(box.min.x / surfaceBucketSize);
    const maxBucketX = Math.floor(box.max.x / surfaceBucketSize);
    const minBucketZ = Math.floor(box.min.z / surfaceBucketSize);
    const maxBucketZ = Math.floor(box.max.z / surfaceBucketSize);
    for (let bucketX = minBucketX; bucketX <= maxBucketX; bucketX++) {
      for (let bucketZ = minBucketZ; bucketZ <= maxBucketZ; bucketZ++) {
        const key = `${String(bucketX)},${String(bucketZ)}`;
        const bucket = surfaceBuckets.get(key) ?? [];
        bucket.push(index);
        surfaceBuckets.set(key, bucket);
      }
    }
  }
  surfaceBucketsReady = true;

  const rasterCellSize = 9;
  const minCellX = Math.floor(gridBounds.min.x / rasterCellSize);
  const maxCellX = Math.ceil(gridBounds.max.x / rasterCellSize);
  const minCellZ = Math.floor(gridBounds.min.z / rasterCellSize);
  const maxCellZ = Math.ceil(gridBounds.max.z / rasterCellSize);
  const mainRouteXZIndex = new TrackSegmentIndex(
    track.samples.map((sample) => new THREE.Vector3(sample.x, 0, sample.z)),
  );
  const cellIntersectsXZBounds = (bounds: THREE.Box3, x: number, z: number, size: number) =>
    x <= bounds.max.x && x + size >= bounds.min.x &&
    z <= bounds.max.z && z + size >= bounds.min.z;
  interface RasterCell {
    readonly x: number;
    readonly z: number;
    readonly owner: CityGroundSurfaceSample;
  }
  const rasterCells = new Map<string, RasterCell>();
  const rasterCellKey = (x: number, z: number) => `${String(x)},${String(z)}`;
  const rasterSurfaceIndexStart = indices.length;
  const emitRasterCell = (x: number, z: number, size: number): void => {
    const centerX = x + size * 0.5;
    const centerZ = z + size * 0.5;
    const centerOwner = surfaceNodeAt(centerX, centerZ);
    if (centerOwner === null) {
      occludedCityGroundSurfacesRemoved++;
      return;
    }
    const cellOwner = centerOwner;
    const centerMainProjection = track.projectMain(
      new THREE.Vector3(centerX, cellOwner.height, centerZ),
    );
    if (
      centerMainProjection.progress < options.start ||
      centerMainProjection.progress >= options.end
    ) {
      // A folded course can bring distinct sectors into the same world-space
      // cell. Let only the sector nearest the visible surface own that cell;
      // otherwise overlapping city floors can z-fight or cut through each other.
      occludedCityGroundSurfacesRemoved++;
      return;
    }
    const corners = [
      { x, z },
      { x: x + size, z },
      { x: x + size, z: z + size },
      { x, z: z + size },
    ];
    const cornerOwners = corners.map((corner) => surfaceNodeAt(corner.x, corner.z));
    const edgeSamples = [
      { x: centerX, z },
      { x: x + size, z: centerZ },
      { x: centerX, z: z + size },
      { x, z: centerZ },
    ];
    const edgeOwners = edgeSamples.map((sample) => surfaceNodeAt(sample.x, sample.z));
    const hasGroundAtSamples = [centerOwner, ...cornerOwners, ...edgeOwners]
      .every((owner) => owner !== null);
    if (!hasGroundAtSamples) {
      occludedCityGroundSurfacesRemoved++;
      return;
    }
    const corridorCauses = new Set<string>();
    const centerRouteXZ = mainRouteXZIndex.nearest(new THREE.Vector3(centerX, 0, centerZ)).point;
    const centerRouteDistance = Math.hypot(centerX - centerRouteXZ.x, centerZ - centerRouteXZ.z);
    const mainCourseMayIntersect = centerRouteDistance <=
      track.roadHalfWidth + 0.75 + (size * Math.SQRT2) / 2;
    const alternateCorridorMayIntersect =
      cellIntersectsXZBounds(serviceTunnelBounds, x, z, size) ||
      cellIntersectsXZBounds(billboardGapBounds, x, z, size) ||
      cellIntersectsXZBounds(waterfallDiveBounds, x, z, size);
    if (mainCourseMayIntersect || alternateCorridorMayIntersect) {
      for (let stepX = 0; stepX <= 4; stepX++) {
        for (let stepZ = 0; stepZ <= 4; stepZ++) {
          const sampleX = x + size * (stepX / 4);
          const sampleZ = z + size * (stepZ / 4);
          const owner = surfaceNodeAt(sampleX, sampleZ);
          if (owner) {
            const cause = blockedByRaceCorridor(
              sampleX,
              owner.height,
              sampleZ,
              mainCourseMayIntersect,
            );
            if (cause) corridorCauses.add(cause);
          }
        }
      }
    }
    const intersectsRaceCorridor = corridorCauses.size > 0;
    if (corridorCauses.has('main-course') && !['service-tunnel', 'billboard-gap', 'waterfall-dive']
      .some((cause) => corridorCauses.has(cause))) {
      occludedCityGroundSurfacesRemoved++;
      return;
    }
    if (intersectsRaceCorridor) {
      for (const cause of corridorCauses) {
        omittedByCorridor.set(cause, (omittedByCorridor.get(cause) ?? 0) + 1);
        underlayByCorridor.set(cause, (underlayByCorridor.get(cause) ?? 0) + 1);
        maxOmittedCellSpanByCorridor.set(
          cause,
          Math.max(maxOmittedCellSpanByCorridor.get(cause) ?? 0, size),
        );
      }
      pendingUnderlays.push({
        corners: corners.map((corner) =>
          new THREE.Vector3(
            corner.x,
            surfaceHeightOnOwnerPlane(cellOwner, corner.x, corner.z) - 8,
            corner.z,
          ),
        ) as [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3],
        color: corridorUnderlayColor,
      });
      occludedCityGroundSurfacesRemoved++;
      return;
    }
    rasterCells.set(rasterCellKey(x, z), {
      x,
      z,
      owner: cellOwner,
    });
  };
  for (let cellX = minCellX; cellX < maxCellX; cellX++) {
    for (let cellZ = minCellZ; cellZ < maxCellZ; cellZ++) {
      emitRasterCell(cellX * rasterCellSize, cellZ * rasterCellSize, rasterCellSize);
    }
  }
  const sharedVertexCache = new Map<string, THREE.Vector3>();
  const sharedVertexAt = (x: number, z: number): THREE.Vector3 => {
    const key = rasterCellKey(x, z);
    const cached = sharedVertexCache.get(key);
    if (cached) return cached;

    // Average the adjacent route-owned samples into one shared world-space
    // height. Neighboring cells then grade into one city surface instead of
    // becoming independent slabs joined by a checkerboard of retaining walls.
    let heightTotal = 0;
    let heightSamples = 0;
    for (const offsetX of [-rasterCellSize, 0]) {
      for (const offsetZ of [-rasterCellSize, 0]) {
        const neighbor = rasterCells.get(rasterCellKey(x + offsetX, z + offsetZ));
        if (!neighbor) continue;
        heightTotal += THREE.MathUtils.clamp(
          surfaceHeightOnOwnerPlane(neighbor.owner, x, z),
          neighbor.owner.height - 0.75,
          neighbor.owner.height + 0.75,
        );
        heightSamples++;
      }
    }
    const directOwner = surfaceNodeAt(x, z);
    const fallbackHeight = heightSamples > 0 ? heightTotal / heightSamples : directOwner?.height ?? 0;
    const vertex = new THREE.Vector3(
      x,
      directOwner?.height ?? fallbackHeight,
      z,
    );
    sharedVertexCache.set(key, vertex);
    return vertex;
  };

  const cellCorners = new Map<
    string,
    readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3]
  >();
  for (const cell of rasterCells.values()) {
    cellCorners.set(rasterCellKey(cell.x, cell.z), [
      sharedVertexAt(cell.x, cell.z),
      sharedVertexAt(cell.x + rasterCellSize, cell.z),
      sharedVertexAt(cell.x + rasterCellSize, cell.z + rasterCellSize),
      sharedVertexAt(cell.x, cell.z + rasterCellSize),
    ]);
  }

  // Constrain each terrain quad after shared edge heights have been assigned.
  // Without this bounded relaxation, unrelated route levels that pass near one
  // another can pull opposite corners of a single city tile into a steep wedge.
  for (let iteration = 0; iteration < 48; iteration++) {
    let adjusted = false;
    for (const corners of cellCorners.values()) {
      const minimum = Math.min(...corners.map((corner) => corner.y));
      const maximum = Math.max(...corners.map((corner) => corner.y));
      const range = maximum - minimum;
      if (range <= 1.25) continue;
      const center = corners.reduce((sum, corner) => sum + corner.y, 0) / corners.length;
      const scale = 1.25 / range;
      for (const corner of corners)
        corner.y = center + (corner.y - center) * scale;
      adjusted = true;
    }
    if (!adjusted) break;
  }

  for (const cell of rasterCells.values()) {
    const corners = cellCorners.get(rasterCellKey(cell.x, cell.z));
    if (!corners) continue;
    const centerX = cell.x + rasterCellSize * 0.5;
    const centerZ = cell.z + rasterCellSize * 0.5;
    const cityTint = neonGridCityGroundColorAt(centerX, centerZ, cell.owner.color);
    writeQuad(corners, cell.owner.color, corners.map(() => cityTint));
  }
  const rasterSurfaceIndexCount = indices.length - rasterSurfaceIndexStart;

  for (const underlay of pendingUnderlays) {
    const [a, b, c, d] = underlay.corners;
    const centerX = (a.x + b.x + c.x + d.x) * 0.25;
    const centerY = (a.y + b.y + c.y + d.y) * 0.25;
    const centerZ = (a.z + b.z + c.z + d.z) * 0.25;
    const testSamples = [
      { x: centerX, z: centerZ },
      ...underlay.corners.map((corner) => ({ x: corner.x, z: corner.z })),
      { x: (a.x + b.x) * 0.5, z: (a.z + b.z) * 0.5 },
      { x: (b.x + c.x) * 0.5, z: (b.z + c.z) * 0.5 },
      { x: (c.x + d.x) * 0.5, z: (c.z + d.z) * 0.5 },
      { x: (d.x + a.x) * 0.5, z: (d.z + a.z) * 0.5 },
    ];
    const visibleFloor = testSamples.some((sample) => {
      const floor = surfaceNodeAt(sample.x, sample.z);
      return floor !== null && floor.height > centerY + 0.75;
    });
    if (
      visibleFloor
    ) {
      occludedCorridorUnderlaysRemoved++;
      continue;
    }
    writeQuad(
      underlay.corners,
      underlay.color,
    );
  }

  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    .setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.presentationOnly = true;
  geometry.userData.collision = false;
  geometry.userData.terraceCount = options.terraces.length;
  geometry.userData.progressRange = [options.start, options.end];
  geometry.userData.generatedRowCount = rowProgresses.length - 1;
  geometry.userData.innerOffset = options.innerOffset;
  geometry.userData.outerOffset = options.terraces.at(-1)?.outerOffset;
  geometry.userData.excludedCorridors = ['service-tunnel', 'billboard-gap', 'waterfall-dive'];
  geometry.userData.omittedCellsByCorridor = Object.fromEntries(omittedByCorridor);
  geometry.userData.underlayCellsByCorridor = Object.fromEntries(underlayByCorridor);
  geometry.userData.maxOmittedCellSpanByCorridor = Object.fromEntries(maxOmittedCellSpanByCorridor);
  geometry.userData.foldedTriangleCount = foldedTriangles;
  geometry.userData.occludedCityGroundSurfacesRemoved = occludedCityGroundSurfacesRemoved;
  geometry.userData.occludedCorridorUnderlaysRemoved = occludedCorridorUnderlaysRemoved;
  geometry.userData.floorIndexCount = geometry.getIndex()?.count ?? 0;
  geometry.userData.floorTriangleCount = (geometry.getIndex()?.count ?? 0) / 3;
  geometry.userData.rasterCellCount = rasterCells.size;
  geometry.userData.rasterCellSize = rasterCellSize;
  geometry.userData.rasterSurfaceIndexStart = rasterSurfaceIndexStart;
  geometry.userData.rasterSurfaceIndexCount = rasterSurfaceIndexCount;
  geometry.userData.maxRasterCellHeightRange = Math.max(
    0,
    ...[...cellCorners.values()].map((corners) =>
      Math.max(...corners.map((corner) => corner.y)) -
      Math.min(...corners.map((corner) => corner.y)),
    ),
  );
  geometry.userData.retainingWallTriangleCount = 0;
  return geometry;
}

export const NEON_GRID_CITY_TERRACES: readonly CityGroundTerrace[] = [
  { outerOffset: 26, drop: 0 },
  { outerOffset: 38, drop: -1.8 },
  { outerOffset: 50, drop: -3.8 },
  { outerOffset: 62, drop: -6.0 },
  { outerOffset: 74, drop: -8.5 },
  { outerOffset: 86, drop: -11.5 },
];

export function neonGridCityGroundOptions(
  track: NeonGrid,
  start: number,
  end: number,
  maximumRowSpacing = 12,
): TerracedCityGroundOptions {
  const segmentLength = Math.max(0.001, (end - start) * track.curve.getLength());
  return {
    start,
    end,
    segments: Math.max(2, Math.ceil(segmentLength / maximumRowSpacing)),
    maximumRowSpacing,
    innerOffset: track.roadHalfWidth + 6,
    terraces: NEON_GRID_CITY_TERRACES,
    baseElevationAt: (progress) => track.curve.getPointAt(progress).y - 0.45,
  };
}

export function neonGridSteppedTowerGeometry(): THREE.BufferGeometry {
  const lower = new THREE.BoxGeometry(1, 0.62, 1);
  lower.translate(0, 0.31, 0);
  const upper = new THREE.BoxGeometry(0.74, 0.27, 0.74);
  upper.translate(0, 0.755, 0);
  const crown = new THREE.BoxGeometry(0.48, 0.11, 0.48);
  crown.translate(0, 0.945, 0);
  const positions: number[] = [];
  const indices: number[] = [];
  for (const part of [lower, upper, crown]) {
    const offset = positions.length / 3;
    const attribute = part.getAttribute('position');
    for (let i = 0; i < attribute.count; i++)
      positions.push(attribute.getX(i), attribute.getY(i), attribute.getZ(i));
    const index = part.index;
    if (index) for (let i = 0; i < index.count; i++) indices.push(offset + index.getX(i));
  }
  lower.dispose();
  upper.dispose();
  crown.dispose();
  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.presentationOnly = true;
  return geometry;
}
