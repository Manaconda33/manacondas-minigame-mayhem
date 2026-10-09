import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import { neonGridRightAt } from './NeonGridVisualCommon';

export interface CityGroundTerrace {
  readonly outerOffset: number;
  readonly drop: number;
}

export interface TerracedCityGroundOptions {
  readonly start: number;
  readonly end: number;
  readonly segments: number;
  readonly innerOffset: number;
  readonly terraces: readonly CityGroundTerrace[];
  readonly baseElevationAt: (progress: number) => number;
}

export interface CityGroundFootingBounds {
  readonly bottomY: number;
  readonly topY: number;
  readonly depth: number;
}

export function cityGroundElevation(
  options: TerracedCityGroundOptions,
  progress: number,
  lateralOffset: number,
): number {
  const safeProgress = THREE.MathUtils.clamp(progress, 0, 1);
  const offset = Math.abs(lateralOffset);
  const terrace = options.terraces.find((candidate) => offset <= candidate.outerOffset);
  return (
    options.baseElevationAt(safeProgress) + (terrace?.drop ?? options.terraces.at(-1)?.drop ?? 0)
  );
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
): CityGroundFootingBounds {
  let lowestSurface = Infinity;
  let highestSurface = -Infinity;
  const local = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const footprintFractions = [-0.5, -0.375, -0.25, -0.125, 0, 0.125, 0.25, 0.375, 0.5];
  for (const xFraction of footprintFractions) {
    for (const zFraction of footprintFractions) {
      local.set(xFraction * footprintWidth, 0, zFraction * footprintDepth);
      offset.copy(local).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rotationY);
      const projection = track.projectMain(center.clone().add(offset));
      const surface = cityGroundElevation(options, projection.progress, projection.lateralOffset);
      lowestSurface = Math.min(lowestSurface, surface);
      highestSurface = Math.max(highestSurface, surface);
    }
  }
  if (!Number.isFinite(lowestSurface) || !Number.isFinite(highestSurface)) {
    throw new Error('City building footprint does not intersect the terraced ground profile');
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
    new THREE.Color(0x526f7c),
    new THREE.Color(0x3d5d6b),
    new THREE.Color(0x315161),
    new THREE.Color(0x274557),
    new THREE.Color(0x1f384a),
    new THREE.Color(0x172b3a),
  ];
  const wallColor = new THREE.Color(0x172a35);
  const rowCount = Math.max(2, options.segments);

  const point = (progress: number, side: -1 | 1, offset: number, drop: number) => {
    const safeProgress = THREE.MathUtils.clamp(progress, 0, 1);
    const center = track.curve.getPointAt(safeProgress);
    return center
      .addScaledVector(neonGridRightAt(track, safeProgress), side * offset)
      .setY(options.baseElevationAt(safeProgress) + drop);
  };

  const appendQuad = (
    corners: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3],
    color: THREE.Color,
    depth = 0,
  ) => {
    const center = corners[0]
      .clone()
      .add(corners[1])
      .add(corners[2])
      .add(corners[3])
      .multiplyScalar(0.25);
    const corridorSamples: THREE.Vector3[] = [];
    for (const along of [0, 0.25, 0.5, 0.75, 1]) {
      const inner = corners[0].clone().lerp(corners[1], along);
      const outer = corners[3].clone().lerp(corners[2], along);
      for (const across of [0, 0.25, 0.5, 0.75, 1]) {
        corridorSamples.push(inner.clone().lerp(outer, across));
      }
    }
    const tunnelTouchesQuad = corners.some((corner) => {
      const projection = track.serviceTunnel.project(corner, track.sampleCount);
      return projection.lateralDistance <= track.serviceTunnel.roadHalfWidth + 8;
    });
    const shortcutTouchesQuad = corridorSamples.some((sample) => {
      const billboard = track.billboardGap.project(sample, track.sampleCount);
      const billboardDistance = Math.hypot(
        sample.x - billboard.point.x,
        sample.z - billboard.point.z,
      );
      if (
        billboardDistance <= track.billboardGap.roadHalfWidth + 3 &&
        Math.abs(sample.y - billboard.point.y) <= 3
      )
        return true;

      const dive = track.waterfallDive.project(sample, track.sampleCount);
      const diveDistance = Math.hypot(sample.x - dive.point.x, sample.z - dive.point.z);
      return (
        diveDistance <= Math.max(track.waterfallDive.roadHalfWidth, 5) + 3 &&
        Math.abs(sample.y - dive.point.y) <= 3
      );
    });
    const sharedMouthTouchesQuad =
      track.billboardGap.junctionContains(center) || track.waterfallDive.junctionContains(center);
    if (tunnelTouchesQuad) return;
    if (shortcutTouchesQuad || sharedMouthTouchesQuad) {
      if (depth >= 3) return;
      const innerMid = corners[0].clone().lerp(corners[1], 0.5);
      const outerMid = corners[3].clone().lerp(corners[2], 0.5);
      const startMid = corners[0].clone().lerp(corners[3], 0.5);
      const endMid = corners[1].clone().lerp(corners[2], 0.5);
      const middle = innerMid.clone().lerp(outerMid, 0.5);
      appendQuad([corners[0], innerMid, middle, startMid], color, depth + 1);
      appendQuad([innerMid, corners[1], endMid, middle], color, depth + 1);
      appendQuad([middle, endMid, corners[2], outerMid], color, depth + 1);
      appendQuad([startMid, middle, outerMid, corners[3]], color, depth + 1);
      return;
    }
    const first = positions.length / 3;
    for (const corner of corners) {
      positions.push(...corner.toArray());
      colors.push(color.r, color.g, color.b);
    }
    indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
  };

  for (const side of [-1, 1] as const) {
    for (let band = 0; band < options.terraces.length; band++) {
      const terrace = options.terraces[band];
      if (!terrace) continue;
      const inner =
        band === 0
          ? options.innerOffset
          : (options.terraces[band - 1]?.outerOffset ?? options.innerOffset);
      const color =
        terraceColors[band % terraceColors.length] ?? terraceColors[0] ?? new THREE.Color(0x19313c);
      const stepCount = Math.max(1, Math.ceil((terrace.outerOffset - inner) / 12));
      const offsets = Array.from({ length: stepCount + 1 }, (_, i) =>
        THREE.MathUtils.lerp(inner, terrace.outerOffset, i / stepCount),
      );

      for (let row = 0; row < rowCount; row++) {
        const p0 = THREE.MathUtils.lerp(options.start, options.end, row / rowCount);
        const p1 = THREE.MathUtils.lerp(options.start, options.end, (row + 1) / rowCount);
        const drop0 = terrace.drop;
        const drop1 = terrace.drop;
        for (let lane = 0; lane < stepCount; lane++) {
          const o0 = offsets[lane];
          const o1 = offsets[lane + 1];
          if (o0 === undefined || o1 === undefined) continue;
          appendQuad(
            [
              point(p0, side, o0, drop0),
              point(p1, side, o0, drop1),
              point(p1, side, o1, drop1),
              point(p0, side, o1, drop0),
            ],
            color,
          );
        }

        // Retaining riser between adjacent city terraces.
        if (band > 0) {
          const edge = options.terraces[band - 1]?.outerOffset;
          const upperDrop = options.terraces[band - 1]?.drop;
          if (edge !== undefined && upperDrop !== undefined && upperDrop !== terrace.drop) {
            appendQuad(
              [
                point(p0, side, edge, upperDrop),
                point(p1, side, edge, upperDrop),
                point(p1, side, edge, terrace.drop),
                point(p0, side, edge, terrace.drop),
              ],
              wallColor,
            );
          }
        }

        // A short dark fascia at the outside edge gives the terraces a visible
        // cut-stone profile instead of a floating, paper-thin horizon slab.
        if (band === options.terraces.length - 1) {
          const low = terrace.drop - 2.2;
          appendQuad(
            [
              point(p0, side, terrace.outerOffset, terrace.drop),
              point(p1, side, terrace.outerOffset, terrace.drop),
              point(p1, side, terrace.outerOffset, low),
              point(p0, side, terrace.outerOffset, low),
            ],
            wallColor,
          );
        }
      }
    }
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
  geometry.userData.innerOffset = options.innerOffset;
  geometry.userData.outerOffset = options.terraces.at(-1)?.outerOffset;
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
