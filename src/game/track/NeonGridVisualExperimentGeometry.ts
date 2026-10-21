import * as THREE from 'three';

export interface TriangleRange {
  readonly startTriangle: number;
  readonly triangleCount: number;
}

/** Remove an exact complete-triangle span without changing neighboring geometry. */
export function suppressIndexedGeometryTriangles(
  geometry: THREE.BufferGeometry,
  indexStart: number,
  indexCount: number,
): void {
  const index = geometry.getIndex();
  if (!index) throw new Error('Neon Grid visual filtering requires indexed geometry');
  if (geometry.groups.length > 0)
    throw new Error('Neon Grid visual filtering cannot safely edit grouped geometry');
  if (
    !Number.isInteger(indexStart) ||
    !Number.isInteger(indexCount) ||
    indexStart < 0 ||
    indexCount < 0 ||
    indexStart % 3 !== 0 ||
    indexCount % 3 !== 0 ||
    indexStart + indexCount > index.count
  ) {
    throw new Error('Neon Grid visual filtering range is outside the geometry index');
  }
  if (indexCount === 0) return;

  const removedStartTriangle = indexStart / 3;
  const removedEndTriangle = (indexStart + indexCount) / 3;
  const removedTriangles = indexCount / 3;
  const source = index.array;
  const kept = new Uint32Array(source.length - indexCount);
  let cursor = 0;
  for (let i = 0; i < source.length; i++) {
    if (i >= indexStart && i < indexStart + indexCount) continue;
    kept[cursor] = index.getX(i);
    cursor++;
  }
  geometry.setIndex(new THREE.BufferAttribute(kept, 1));

  const ranges = geometry.userData.geometryRanges as Record<string, TriangleRange> | undefined;
  if (ranges) {
    for (const [name, range] of Object.entries(ranges)) {
      const start = range.startTriangle;
      const end = start + range.triangleCount;
      if (start === removedStartTriangle && end === removedEndTriangle) {
        ranges[name] = { startTriangle: start, triangleCount: 0 };
      } else if (start >= removedEndTriangle) {
        ranges[name] = { startTriangle: start - removedTriangles, triangleCount: range.triangleCount };
      } else if (end > removedStartTriangle && start < removedEndTriangle) {
        throw new Error(`Neon Grid visual filtering partially overlaps geometry range ${name}`);
      }
    }
    geometry.userData.geometryRanges = ranges;
  }

  const rasterRanges = geometry.userData.rasterSurfaceRanges as
    | readonly { start: number; count: number }[]
    | undefined;
  if (rasterRanges) {
    geometry.userData.rasterSurfaceRanges = rasterRanges
      .map((range) => {
        const end = range.start + range.count;
        if (range.start >= indexStart + indexCount)
          return { start: range.start - indexCount, count: range.count };
        if (range.start >= indexStart && end <= indexStart + indexCount) return { start: 0, count: 0 };
        if (end <= indexStart) return range;
        throw new Error('Neon Grid visual filtering partially overlaps a raster surface range');
      })
      .filter((range) => range.count > 0);
  }

  const suppressed = (geometry.userData.suppressedGeometryRanges ?? []) as {
    startTriangle: number;
    triangleCount: number;
  }[];
  suppressed.push({ startTriangle: removedStartTriangle, triangleCount: removedTriangles });
  geometry.userData.suppressedGeometryRanges = suppressed;
}

export function suppressIndexedGeometryRange(
  geometry: THREE.BufferGeometry,
  rangeName: string,
): void {
  const ranges = geometry.userData.geometryRanges as
    | Record<string, TriangleRange>
    | undefined;
  const range = ranges?.[rangeName];
  if (!range) throw new Error(`Neon Grid geometry has no named range ${rangeName}`);
  suppressIndexedGeometryTriangles(
    geometry,
    range.startTriangle * 3,
    range.triangleCount * 3,
  );
}

/** Hide one instanced batch range while compacting all retained instance data in place. */
export function suppressInstancedMeshRange(
  mesh: THREE.InstancedMesh,
  start: number,
  count: number,
  rangeName: string,
): void {
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(count) ||
    start < 0 ||
    count < 0 ||
    start + count > mesh.count
  ) {
    throw new Error(`${mesh.name} has an invalid instance range for ${rangeName}`);
  }
  if (count === 0) return;

  const oldCount = mesh.count;
  const end = start + count;
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  for (let source = end; source < oldCount; source++) {
    const target = source - count;
    mesh.getMatrixAt(source, matrix);
    mesh.setMatrixAt(target, matrix);
    if (mesh.instanceColor) {
      mesh.getColorAt(source, color);
      mesh.setColorAt(target, color);
    }
  }
  mesh.count = oldCount - count;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const ranges = mesh.userData.partRanges as
    | Record<string, { start: number; count: number }>
    | undefined;
  if (ranges) {
    for (const [name, range] of Object.entries(ranges)) {
      const rangeEnd = range.start + range.count;
      if (range.start >= start && rangeEnd <= end) {
        ranges[name] = { start: 0, count: 0 };
      } else if (range.start >= end) {
        ranges[name] = { start: range.start - count, count: range.count };
      } else if (rangeEnd > start && range.start < end) {
        throw new Error(`${mesh.name} suppression partially overlaps instance range ${name}`);
      }
    }
    mesh.userData.partRanges = ranges;
  }
  mesh.userData.suppressedInstanceRanges = [
    ...((mesh.userData.suppressedInstanceRanges ?? []) as string[]),
    rangeName,
  ];
}

export function suppressIndexedGroundTriangles(
  geometry: THREE.BufferGeometry,
  indexStart: number,
  indexCount: number,
): void {
  if (indexCount === 0) return;
  suppressIndexedGeometryTriangles(geometry, indexStart, indexCount);
  geometry.userData.originalFloorIndexStart = indexStart;
  geometry.userData.originalFloorIndexCount = indexCount;
  geometry.userData.suppressedGroundIndexStart = indexStart;
  geometry.userData.suppressedGroundIndexCount = indexCount;
  geometry.userData.suppressedGroundTriangleCount = indexCount / 3;
  geometry.userData.floorIndexStart = 0;
  geometry.userData.floorIndexCount = 0;
  geometry.userData.floorTriangleCount = 0;
  geometry.userData.rasterSurfaceIndexStart = 0;
  geometry.userData.rasterSurfaceIndexCount = 0;
  geometry.userData.cityGroundSuppressed = true;
}
