import * as THREE from 'three';
import ownerLayout from './neonGridOwnerLayout.json';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import {
  ownerLayoutScenePath,
  resolveNeonGridOwnerLayoutSourceMap,
  type OwnerLayoutMesh,
  type OwnerLayoutComponentRecord,
  type ResolvedOwnerLayoutComponent,
} from './NeonGridOwnerLayoutSourceMap';

export type NeonGridOwnerLayoutScreen = 'retained' | 'removed';

export const NEON_GRID_OWNER_LAYOUT_SCREEN_ID =
  'Scene[0]/neon-grid-blockout[0]/skyline-visual[0]/skyline-deck-fascia::billboardGapWing[0]';

const QUALITY_SCALED_WINDOW_MESHES: Readonly<Record<string, {
  groupName: string;
  counts: Readonly<Record<GraphicsQuality, number>>;
}>> = {
  'skyline-city-windows': { groupName: 'skyline-visual', counts: { low: 120, medium: 240, high: 360 } },
  'undercity-city-windows': { groupName: 'undercity-visual', counts: { low: 80, medium: 160, high: 240 } },
  'falls-run-city-windows': { groupName: 'falls-run-visual', counts: { low: 160, medium: 320, high: 480 } },
  'falls-run-extension-city-windows': {
    groupName: 'falls-run-extension-visual',
    counts: { low: 80, medium: 160, high: 240 },
  },
};

const LOW_QUALITY_OPTIONAL_MESHES: Readonly<Record<string, string>> = {
  'Scene[0]/neon-grid-blockout[0]/skyline-visual[0]/skyline-wet-asphalt[0]': 'skyline-visual',
  'Scene[0]/neon-grid-blockout[0]/undercity-visual[0]/undercity-wet-asphalt[0]': 'undercity-visual',
  'Scene[0]/neon-grid-blockout[0]/falls-run-visual[0]/falls-run-wet-asphalt[0]': 'falls-run-visual',
  'Scene[0]/neon-grid-blockout[0]/falls-run-extension-visual[0]/falls-run-extension-wet-asphalt[0]':
    'falls-run-extension-visual',
};

export interface NeonGridOwnerLayoutApplicationReport {
  screen: NeonGridOwnerLayoutScreen;
  matchedIds: string[];
  changedIds: string[];
  deletedIds: string[];
  meshCountBefore: number;
  meshCountAfter: number;
  rangeGeometryCount: number;
  addedTriangles: 0;
  addedMeshes: 0;
}

function fail(message: string): never {
  throw new Error(message);
}

function matricesDiffer(a: readonly number[], b: readonly number[]): boolean {
  return a.length !== 16 || b.length !== 16 || a.some((value, index) =>
    Math.abs(value - (b[index] ?? Number.NaN)) > 1e-12,
  );
}

function isScreenDeleted(
  record: OwnerLayoutComponentRecord,
  screen: NeonGridOwnerLayoutScreen,
): boolean {
  return record.deleted &&
    (record.id !== NEON_GRID_OWNER_LAYOUT_SCREEN_ID || screen === 'removed');
}

function sceneMeshes(root: THREE.Object3D): OwnerLayoutMesh[] {
  const meshes: OwnerLayoutMesh[] = [];
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) meshes.push(object as OwnerLayoutMesh);
  });
  return meshes;
}

function runtimeOwnerLayoutRecords(
  scene: THREE.Object3D,
  records: readonly OwnerLayoutComponentRecord[],
): OwnerLayoutComponentRecord[] {
  const objectsByPath = new Map<string, THREE.Object3D>();
  scene.traverse((object) => objectsByPath.set(ownerLayoutScenePath(object), object));
  const applicable: OwnerLayoutComponentRecord[] = [];

  for (const record of records) {
    const pathObject = objectsByPath.get(record.scenePath);
    const instanceMatch = record.indexRange === null ? /\/instance\/(\d+)$/.exec(record.id) : null;
    if (instanceMatch) {
      const meshName = pathObject?.name ?? record.scenePath.slice(record.scenePath.lastIndexOf('/') + 1).replace(/\[\d+\]$/, '');
      const qualityConfig = QUALITY_SCALED_WINDOW_MESHES[meshName];
      if (qualityConfig) {
        if (!(pathObject instanceof THREE.InstancedMesh))
          fail(`Quality-scaled owner layout window source '${record.scenePath}' is missing.`);
        const quality = scene.getObjectByName(qualityConfig.groupName)?.userData.quality as GraphicsQuality | undefined;
        const expectedCount = quality === undefined ? undefined : qualityConfig.counts[quality];
        if (expectedCount === undefined || pathObject.count !== expectedCount)
          fail(`Quality-scaled owner layout window source '${meshName}' does not match its recorded graphics tier.`);
        if (Number(instanceMatch[1]) >= pathObject.count) continue;
      }
    }

    if (!pathObject && record.indexRange === null) {
      const lowQualityGroup = LOW_QUALITY_OPTIONAL_MESHES[record.scenePath];
      if (lowQualityGroup && scene.getObjectByName(lowQualityGroup)?.userData.quality === 'low') continue;
    }
    applicable.push(record);
  }

  return applicable;
}

function appendTransformedRangeVertices(
  geometry: THREE.BufferGeometry,
  originalIndex: THREE.BufferAttribute,
  range: readonly [number, number],
  delta: THREE.Matrix4,
  indices: number[],
  attributeValues: Map<string, number[]>,
): void {
  const positionAttribute = geometry.getAttribute('position');
  if (positionAttribute.itemSize !== 3) fail('Owner layout source positions must be vec3 values.');
  const hasNormal = geometry.hasAttribute('normal');
  const normalAttribute = geometry.getAttribute('normal');
  if (hasNormal && normalAttribute.itemSize !== 3) fail('Owner layout source normals must be vec3 values.');
  const hasTangent = geometry.hasAttribute('tangent');
  const tangentAttribute = geometry.getAttribute('tangent');
  if (hasTangent && tangentAttribute.itemSize !== 4) fail('Owner layout source tangents must be vec4 values.');
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(delta);
  const tangentMatrix = new THREE.Matrix3().setFromMatrix4(delta);
  const [start, count] = range;
  const positionValues = attributeValues.get('position');
  if (!positionValues) fail('Owner layout source positions are missing from the edit buffer.');
  const appendedVertexBase = positionValues.length / positionAttribute.itemSize;
  const remapped = new Map<number, number>();
  const point = new THREE.Vector3();

  for (let offset = start; offset < start + count; offset++) {
    const sourceVertex = originalIndex.getX(offset);
    let targetVertex = remapped.get(sourceVertex);
    if (targetVertex === undefined) {
      targetVertex = appendedVertexBase + remapped.size;
      remapped.set(sourceVertex, targetVertex);
      for (const [name, values] of attributeValues) {
        const attribute = geometry.getAttribute(name);
        if (!(attribute.array instanceof Float32Array))
          fail(`Owner layout cannot safely transform non-Float32 attribute '${name}'.`);
        if (name === 'position') {
          point.set(attribute.getX(sourceVertex), attribute.getY(sourceVertex), attribute.getZ(sourceVertex));
          point.applyMatrix4(delta);
          values.push(point.x, point.y, point.z);
        } else if (name === 'normal' && hasNormal) {
          point.set(attribute.getX(sourceVertex), attribute.getY(sourceVertex), attribute.getZ(sourceVertex));
          point.applyNormalMatrix(normalMatrix);
          values.push(point.x, point.y, point.z);
        } else if (name === 'tangent' && hasTangent) {
          point.set(attribute.getX(sourceVertex), attribute.getY(sourceVertex), attribute.getZ(sourceVertex));
          point.applyMatrix3(tangentMatrix).normalize();
          values.push(point.x, point.y, point.z, attribute.getW(sourceVertex));
        } else {
          for (let component = 0; component < attribute.itemSize; component++)
            values.push(attribute.getComponent(sourceVertex, component));
        }
      }
    }
    indices[offset] = targetVertex;
  }
}

function applyRangeEdits(
  scene: THREE.Object3D,
  object: OwnerLayoutMesh,
  edits: readonly ResolvedOwnerLayoutComponent[],
  screen: NeonGridOwnerLayoutScreen,
): void {
  const sourceGeometry = object.geometry;
  const sourceIndex = sourceGeometry.index;
  if (!sourceIndex) fail(`Authored range source '${object.name}' no longer has an index buffer.`);
  const activeEdits = edits.filter((edit) =>
    isScreenDeleted(edit.record, screen) || matricesDiffer(edit.record.matrix, edit.record.baselineMatrix),
  );
  if (!activeEdits.length) return;
  const ranges = activeEdits.map((edit) => {
    if (!edit.indexRange) fail(`Missing index range for ${edit.record.id}`);
    return { edit, start: edit.indexRange[0], count: edit.indexRange[1] };
  }).sort((a, b) => a.start - b.start);
  for (let index = 1; index < ranges.length; index++) {
    const previous = ranges[index - 1];
    const current = ranges[index];
    if (previous && current && previous.start + previous.count > current.start)
      fail(`Owner layout component ranges overlap on '${object.name}'.`);
  }

  const nextGeometry = sourceGeometry.clone();
  const originalIndices = Array.from(sourceIndex.array);
  const indices = [...originalIndices];
  const removed = new Uint8Array(originalIndices.length);
  let appendedVertices = false;
  const attributeValues = new Map<string, number[]>();
  for (const name of Object.keys(sourceGeometry.attributes)) {
    const attribute = sourceGeometry.getAttribute(name);
    if (!(attribute.array instanceof Float32Array))
      fail(`Owner layout source geometry '${object.name}' has unsupported ${name} attribute storage.`);
    attributeValues.set(name, Array.from(attribute.array));
  }

  for (const { edit, start, count } of ranges) {
    if (start < 0 || count < 0 || start + count > originalIndices.length || start % 3 !== 0 || count % 3 !== 0)
      fail(`Owner layout component ${edit.record.id} has an invalid index range.`);
    if (isScreenDeleted(edit.record, screen)) {
      removed.fill(1, start, start + count);
      continue;
    }
    const delta = edit.baselineWorld.clone().invert().multiply(new THREE.Matrix4().fromArray([...edit.record.matrix]));
    if (!matricesDiffer(delta.toArray(), new THREE.Matrix4().toArray())) continue;
    appendTransformedRangeVertices(sourceGeometry, sourceIndex, [start, count], delta, indices, attributeValues);
    appendedVertices = true;
  }

  const deletedIndexCount = removed.reduce((total, value) => total + value, 0);
  if (deletedIndexCount > 0 && nextGeometry.groups.length > 0) {
    const originalGroups = [...sourceGeometry.groups];
    nextGeometry.clearGroups();
    const deletedRanges = ranges.filter(({ edit }) => isScreenDeleted(edit.record, screen));
    for (const group of originalGroups) {
      const deletedBefore = deletedRanges.reduce((total, range) =>
        total + Math.max(0, Math.min(group.start, range.start + range.count) - range.start), 0,
      );
      const overlap = deletedRanges.reduce((total, range) =>
        total + Math.max(0, Math.min(group.start + group.count, range.start + range.count) - Math.max(group.start, range.start)), 0,
      );
      const count = group.count - overlap;
      if (count > 0) nextGeometry.addGroup(group.start - deletedBefore, count, group.materialIndex);
    }
  }
  if (deletedIndexCount > 0 && Number.isFinite(sourceGeometry.drawRange.count)) {
    const sourceRange = sourceGeometry.drawRange;
    const deletedRanges = ranges.filter(({ edit }) => isScreenDeleted(edit.record, screen));
    const deletedBefore = deletedRanges.reduce((total, range) =>
      total + Math.max(0, Math.min(sourceRange.start, range.start + range.count) - range.start), 0,
    );
    const overlap = deletedRanges.reduce((total, range) =>
      total + Math.max(0, Math.min(sourceRange.start + sourceRange.count, range.start + range.count) - Math.max(sourceRange.start, range.start)), 0,
    );
    nextGeometry.setDrawRange(sourceRange.start - deletedBefore, sourceRange.count - overlap);
  }

  if (appendedVertices) {
    for (const [name, values] of attributeValues) {
      const sourceAttribute = sourceGeometry.getAttribute(name);
      const attribute = new THREE.Float32BufferAttribute(values, sourceAttribute.itemSize, sourceAttribute.normalized);
      attribute.name = sourceAttribute.name;
      nextGeometry.setAttribute(name, attribute);
    }
  }
  if (deletedIndexCount > 0 || ranges.some(({ edit }) =>
    !isScreenDeleted(edit.record, screen) && matricesDiffer(edit.record.matrix, edit.record.baselineMatrix),
  )) {
    const remaining = indices.filter((_, index) => removed[index] === 0);
    nextGeometry.setIndex(remaining);
  }
  nextGeometry.computeBoundingBox();
  nextGeometry.computeBoundingSphere();

  const geometryOwners = sceneMeshes(scene).filter((mesh) => mesh.geometry === sourceGeometry).length;
  object.geometry = nextGeometry;
  if (geometryOwners === 1) sourceGeometry.dispose();
}

function applyObjectEdit(edit: ResolvedOwnerLayoutComponent, screen: NeonGridOwnerLayoutScreen): void {
  const { record, object, instanceIndex } = edit;
  if (isScreenDeleted(record, screen)) {
    if (instanceIndex !== null && object instanceof THREE.InstancedMesh) {
      object.setMatrixAt(instanceIndex, new THREE.Matrix4().makeScale(0, 0, 0));
      object.instanceMatrix.needsUpdate = true;
      object.computeBoundingBox();
      object.computeBoundingSphere();
    } else {
      object.visible = false;
    }
    return;
  }
  if (!matricesDiffer(record.matrix, record.baselineMatrix)) return;
  const targetWorld = new THREE.Matrix4().fromArray([...record.matrix]);
  if (instanceIndex !== null && object instanceof THREE.InstancedMesh) {
    const instanceMatrix = object.matrixWorld.clone().invert().multiply(targetWorld);
    object.setMatrixAt(instanceIndex, instanceMatrix);
    object.instanceMatrix.needsUpdate = true;
    object.computeBoundingBox();
    object.computeBoundingSphere();
    return;
  }
  const parentWorld = object.parent?.matrixWorld ?? new THREE.Matrix4();
  const local = parentWorld.clone().invert().multiply(targetWorld);
  object.matrixAutoUpdate = false;
  object.matrix.copy(local);
  local.decompose(object.position, object.quaternion, object.scale);
  object.updateMatrixWorld(true);
}

function reattachFallsRunExtensionWindows(
  scene: THREE.Object3D,
  resolved: ReadonlyMap<string, ResolvedOwnerLayoutComponent>,
  screen: NeonGridOwnerLayoutScreen,
): void {
  const windows = scene.getObjectByName('falls-run-extension-city-windows');
  const towers = scene.getObjectByName('falls-run-extension-city-towers');
  if (!(windows instanceof THREE.InstancedMesh) || !(towers instanceof THREE.InstancedMesh))
    fail('Falls Run extension windows cannot be reattached without their source instances.');

  const windowsMetadata = windows.userData as { ownerLayoutTowerIndices?: unknown };
  const candidateTowerIndices = windowsMetadata.ownerLayoutTowerIndices;
  if (!Array.isArray(candidateTowerIndices) || candidateTowerIndices.length !== windows.count ||
    !candidateTowerIndices.every((index: unknown) =>
      typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < towers.count,
    ))
    fail('Falls Run extension windows have an invalid tower association map.');
  const towerIndices = candidateTowerIndices as number[];

  const windowEdits = [...resolved.values()].filter((edit) => edit.object === windows);
  const windowEditsByIndex = new Map<number, ResolvedOwnerLayoutComponent>();
  if (windowEdits.some((edit) => edit.kind !== 'instance' || edit.instanceIndex === null ||
    edit.instanceIndex < 0 || edit.instanceIndex >= windows.count ||
    windowEditsByIndex.has(edit.instanceIndex)))
    fail('Falls Run extension window source mapping is incomplete.');
  for (const edit of windowEdits) {
    if (edit.instanceIndex === null) continue;
    windowEditsByIndex.set(edit.instanceIndex, edit);
  }

  const towerEditsByIndex = new Map<number, ResolvedOwnerLayoutComponent>();
  for (const edit of resolved.values()) {
    if (edit.object.name !== 'falls-run-extension-city-terraced-ground' ||
      edit.rangeKey !== 'cityTowers' || edit.rangeOrdinal === null) continue;
    if (towerEditsByIndex.has(edit.rangeOrdinal))
      fail(`Falls Run tower ${String(edit.rangeOrdinal)} has duplicate saved transforms.`);
    towerEditsByIndex.set(edit.rangeOrdinal, edit);
  }

  scene.updateMatrixWorld(true);
  windows.updateWorldMatrix(true, false);
  towers.updateWorldMatrix(true, false);
  for (let instanceIndex = 0; instanceIndex < windows.count; instanceIndex++) {
    const edit = windowEditsByIndex.get(instanceIndex);
    const towerIndex = towerIndices[instanceIndex];
    if (towerIndex === undefined)
      fail(`Falls Run extension window ${String(instanceIndex)} has no tower association.`);
    let reattachedWorld: THREE.Matrix4;
    if (edit) {
      if (isScreenDeleted(edit.record, screen)) continue;
      const towerLocal = new THREE.Matrix4();
      towers.getMatrixAt(towerIndex, towerLocal);
      const towerWorld = towers.matrixWorld.clone().multiply(towerLocal);
      const pivot = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      towerWorld.decompose(pivot, rotation, scale);
      const reattachment = new THREE.Matrix4()
        .makeTranslation(pivot.x, pivot.y, pivot.z)
        .multiply(new THREE.Matrix4().makeRotationFromQuaternion(rotation))
        .multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
      const baselineWorld = new THREE.Matrix4().fromArray([...edit.record.baselineMatrix]);
      const targetWorld = new THREE.Matrix4().fromArray([...edit.record.matrix]);
      const authoredDelta = targetWorld.clone().multiply(baselineWorld.clone().invert());
      reattachedWorld = authoredDelta.multiply(reattachment).multiply(baselineWorld);
    } else {
      const quality = scene.getObjectByName('falls-run-extension-visual')?.userData.quality as
        GraphicsQuality | undefined;
      if (quality !== 'high')
        fail(`Falls Run extension window ${String(instanceIndex)} is absent from the saved source at ${String(quality)} quality.`);
      const towerEdit = towerEditsByIndex.get(towerIndex);
      if (!towerEdit)
        fail(`Falls Run extension tower ${String(towerIndex)} has no saved transform for its high-quality window.`);
      const baselineWindowLocal = new THREE.Matrix4();
      windows.getMatrixAt(instanceIndex, baselineWindowLocal);
      const baselineWindowWorld = windows.matrixWorld.clone().multiply(baselineWindowLocal);
      const baselineTowerWorld = new THREE.Matrix4().fromArray([...towerEdit.record.baselineMatrix]);
      const targetTowerWorld = new THREE.Matrix4().fromArray([...towerEdit.record.matrix]);
      const towerDelta = targetTowerWorld.multiply(baselineTowerWorld.invert());
      reattachedWorld = towerDelta.multiply(baselineWindowWorld);
    }
    const local = windows.matrixWorld.clone().invert().multiply(reattachedWorld);
    windows.setMatrixAt(instanceIndex, local);
  }
  windows.instanceMatrix.needsUpdate = true;
  windows.computeBoundingBox();
  windows.computeBoundingSphere();
}

export async function applyNeonGridOwnerLayout(
  scene: THREE.Object3D,
  screen: NeonGridOwnerLayoutScreen,
  onProgress?: (completed: number, total: number) => void,
): Promise<NeonGridOwnerLayoutApplicationReport> {
  if (ownerLayout.sourceSha256 !== '2f48eea9e634f1f371525c458d9509b8e3f0900a3cf7981b3f5e9f8e5aae1240' ||
    !ownerLayout.integrity.verified)
    fail('The owner layout handoff has not passed its source integrity gate.');
  const records = ownerLayout.components as OwnerLayoutComponentRecord[];
  const runtimeRecords = runtimeOwnerLayoutRecords(scene, records);
  const resolved = await resolveNeonGridOwnerLayoutSourceMap(scene, runtimeRecords, onProgress);
  const screenRecord = resolved.get(NEON_GRID_OWNER_LAYOUT_SCREEN_ID);
  if (screenRecord?.kind !== 'range' || !screenRecord.record.deleted)
    fail('The exported Billboard Gap screen does not resolve to its expected authored range.');

  const meshCountBefore = sceneMeshes(scene).length;
  const rangeGroups = new Map<OwnerLayoutMesh, ResolvedOwnerLayoutComponent[]>();
  const changedIds: string[] = [];
  const deletedIds: string[] = [];
  for (const edit of resolved.values()) {
    const deleted = isScreenDeleted(edit.record, screen);
    const changed = deleted || matricesDiffer(edit.record.matrix, edit.record.baselineMatrix);
    if (!changed) continue;
    if (edit.record.id.includes('/track-road[') || edit.object.userData.collision === true)
      fail(`Owner layout attempts to edit protected road/collision source ${edit.record.id}.`);
    changedIds.push(edit.record.id);
    if (deleted) deletedIds.push(edit.record.id);
    if (edit.kind === 'range') {
      const group = rangeGroups.get(edit.object) ?? [];
      group.push(edit);
      rangeGroups.set(edit.object, group);
    } else applyObjectEdit(edit, screen);
  }
  for (const [object, edits] of rangeGroups) applyRangeEdits(scene, object, edits, screen);
  reattachFallsRunExtensionWindows(scene, resolved, screen);
  const meshCountAfter = sceneMeshes(scene).length;
  if (meshCountAfter !== meshCountBefore) fail('Owner layout projection unexpectedly changed mesh batching.');
  return {
    screen,
    matchedIds: [...resolved.keys()].sort(),
    changedIds: changedIds.sort(),
    deletedIds: deletedIds.sort(),
    meshCountBefore,
    meshCountAfter,
    rangeGeometryCount: rangeGroups.size,
    addedTriangles: 0,
    addedMeshes: 0,
  };
}
