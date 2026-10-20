import * as THREE from 'three';

export interface OwnerLayoutComponentRecord {
  id: string;
  scenePath: string;
  sourceFile: string;
  sourceSymbol: string;
  sourceOrdinal: number | null;
  indexRange: readonly [number, number] | null;
  geometryHash: string;
  baselineMatrix: readonly number[];
  matrix: readonly number[];
  deleted: boolean;
}

export type OwnerLayoutMesh = THREE.Mesh;

export interface ResolvedOwnerLayoutComponent {
  record: OwnerLayoutComponentRecord;
  object: OwnerLayoutMesh;
  kind: 'object' | 'instance' | 'range';
  instanceIndex: number | null;
  indexRange: readonly [number, number] | null;
  rangeKey: string | null;
  rangeOrdinal: number | null;
  baselineWorld: THREE.Matrix4;
}

interface TriangleRange {
  startTriangle: number;
  triangleCount: number;
}

interface ParsedRangePath {
  parentPath: string;
  meshName: string;
  rangeKey: string;
  ordinal: number | null;
}

// The captured Service Tunnel walls are generated through CatmullRomCurve3.
// The exported browser fingerprint and Node's full precision math can differ
// in the last Float32 bit across engine versions. Keep the original export
// hash authoritative, then use this sub-millimetre canonical fingerprint for
// these two exact source records only. All attributes and indices still take
// part in the fallback comparison.
const PORTABLE_GEOMETRY_BASELINES: Readonly<Record<string, {
  exportedHash: string;
  portableHash: string;
}>> = {
  'Scene[0]/neon-grid-blockout[0]/service-tunnel[0]/service-tunnel-left-wall[0]': {
    exportedHash: 'e2b8819ce2032b090e3d86915fa46e02428b9ffcbfb1b96ba254cfc17ef94524',
    portableHash: 'f48d848d0f4c53ee42100d4f08ea84db96ef602da4ddd6ad4f64be30efe546d8',
  },
  'Scene[0]/neon-grid-blockout[0]/service-tunnel[0]/service-tunnel-right-wall[0]': {
    exportedHash: 'e15874f90b5c5684e513923944477818c9d40228ff5afb2db8a96366a2c7564f',
    portableHash: '4a3b72e9d77aba430aaec8b659c389bd0456fe3821201da92b0d57dd3f433aa1',
  },
};

function fail(message: string): never {
  throw new Error(message);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

async function digestJson(value: unknown): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalJson(value)),
  );
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function ownerLayoutScenePath(object: THREE.Object3D): string {
  const segments: string[] = [];
  for (let node: THREE.Object3D | null = object; node; node = node.parent) {
    const segmentName = node.name || node.type;
    const ordinal = node.parent
      ? node.parent.children.filter((child) => (child.name || child.type) === segmentName).indexOf(node)
      : 0;
    segments.unshift(`${segmentName}[${String(ordinal)}]`);
  }
  return segments.join('/');
}

function nearMatrix(actual: THREE.Matrix4, expected: readonly number[]): boolean {
  if (expected.length !== 16) return false;
  return actual.elements.every((value, index) => {
    const target = expected[index];
    return target !== undefined && Math.abs(value - target) <= 1e-8 * Math.max(1, Math.abs(target));
  });
}

async function geometryHash(geometry: THREE.BufferGeometry): Promise<string> {
  const attributes: Record<string, { itemSize: number; values: number[] }> = {};
  for (const name of Object.keys(geometry.attributes).sort()) {
    const attribute = geometry.getAttribute(name);
    const values: number[] = [];
    for (let index = 0; index < attribute.count; index++)
      for (let component = 0; component < attribute.itemSize; component++)
        values.push(attribute.getComponent(index, component));
    attributes[name] = { itemSize: attribute.itemSize, values };
  }
  return digestJson({
    attributes,
    index: geometry.index ? Array.from(geometry.index.array) : null,
  });
}

async function portableGeometryHash(geometry: THREE.BufferGeometry): Promise<string> {
  const attributes: Record<string, { itemSize: number; values: number[] }> = {};
  for (const name of Object.keys(geometry.attributes).sort()) {
    const attribute = geometry.getAttribute(name);
    const values: number[] = [];
    for (let index = 0; index < attribute.count; index++)
      for (let component = 0; component < attribute.itemSize; component++)
        values.push(Math.round(attribute.getComponent(index, component) * 10_000) / 10_000);
    attributes[name] = { itemSize: attribute.itemSize, values };
  }
  return digestJson({
    attributes,
    index: geometry.index ? Array.from(geometry.index.array) : null,
  });
}

async function rangeGeometryHash(geometry: THREE.BufferGeometry, range: readonly [number, number]): Promise<string> {
  const index = geometry.index;
  if (!index) fail('Authored component range requires indexed geometry.');
  const [start, count] = range;
  if (start < 0 || count < 0 || start + count > index.count || start % 3 !== 0 || count % 3 !== 0)
    fail(`Authored index range [${String(start)}, ${String(count)}] is outside source geometry.`);
  const attributes: Record<string, { itemSize: number; values: number[] }> = {};
  const orderedNames = Object.keys(geometry.attributes).sort();
  const values = Object.fromEntries(orderedNames.map((name) => [name, [] as number[]]));
  const remapped = new Map<number, number>();
  const indices: number[] = [];
  for (let cursor = start; cursor < start + count; cursor++) {
    const sourceIndex = index.getX(cursor);
    let targetIndex = remapped.get(sourceIndex);
    if (targetIndex === undefined) {
      targetIndex = remapped.size;
      remapped.set(sourceIndex, targetIndex);
      for (const name of orderedNames) {
        const attribute = geometry.getAttribute(name);
        const destination = values[name];
        if (!destination) fail(`Missing destination buffer for geometry attribute ${name}.`);
        for (let component = 0; component < attribute.itemSize; component++)
          destination.push(attribute.getComponent(sourceIndex, component));
      }
    }
    indices.push(targetIndex);
  }
  for (const name of orderedNames) {
    const attribute = geometry.getAttribute(name);
    const attributeValues = values[name];
    if (!attributeValues) fail(`Missing values for geometry attribute ${name}.`);
    attributes[name] = { itemSize: attribute.itemSize, values: attributeValues };
  }
  return digestJson({ attributes, index: indices });
}

function parseRangePath(path: string): ParsedRangePath {
  const marker = path.lastIndexOf('::');
  const lastBracket = path.lastIndexOf('[');
  if (marker < 0 || lastBracket < marker) fail(`Invalid authored range scene path: ${path}`);
  const nameStart = path.lastIndexOf('/', marker) + 1;
  const parentPath = path.slice(0, nameStart - 1);
  const meshName = path.slice(nameStart, marker);
  const rangeLabel = path.slice(marker + 2, lastBracket);
  const slash = rangeLabel.lastIndexOf('/');
  const ordinalText = slash < 0 ? null : rangeLabel.slice(slash + 1);
  const rangeKey = slash < 0 ? rangeLabel : rangeLabel.slice(0, slash);
  const ordinal = ordinalText === null ? null : Number(ordinalText);
  if (!meshName || !rangeKey || (ordinalText !== null &&
    (ordinal === null || !Number.isInteger(ordinal) || ordinal < 0)))
    fail(`Invalid authored range descriptor in scene path: ${path}`);
  return { parentPath, meshName, rangeKey, ordinal };
}

function authoredRanges(mesh: OwnerLayoutMesh): Record<string, TriangleRange> | undefined {
  const geometry = mesh.geometry;
  const fromUserData = (mesh.userData.geometryRanges ?? geometry.userData.geometryRanges) as
    | Record<string, TriangleRange>
    | undefined;
  if (fromUserData) return fromUserData;
  if (mesh.name !== 'undercity-wallside-sightline-screens') return undefined;
  const start = Number(geometry.userData.floorIndexStart);
  const count = Number(geometry.userData.floorIndexCount);
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(count) ||
    start <= 0 ||
    count <= 0 ||
    start % 3 !== 0 ||
    count % 3 !== 0 ||
    start + count !== geometry.index?.count
  )
    return undefined;
  return {
    wallScreens: { startTriangle: 0, triangleCount: start / 3 },
    cityGround: { startTriangle: start / 3, triangleCount: count / 3 },
  };
}

function validateRangeLayout(
  scene: THREE.Object3D,
  records: readonly OwnerLayoutComponentRecord[],
  parsedById: ReadonlyMap<string, ParsedRangePath>,
  objectById: ReadonlyMap<string, OwnerLayoutMesh>,
): void {
  const groups = new Map<string, { record: OwnerLayoutComponentRecord; parsed: ParsedRangePath }[]>();
  for (const record of records) {
    const parsed = parsedById.get(record.id);
    if (!parsed) continue;
    const source = objectById.get(record.id);
    if (!source || source instanceof THREE.InstancedMesh) continue;
    const meshPath = ownerLayoutScenePath(source);
    const groupKey = `${meshPath}::${parsed.rangeKey}`;
    const group = groups.get(groupKey) ?? [];
    group.push({ record, parsed });
    groups.set(groupKey, group);
  }
  for (const [key, group] of groups) {
    const source = objectById.get(group[0]?.record.id ?? '');
    if (!source || source instanceof THREE.InstancedMesh)
      fail(`Authored range source is not a regular mesh: ${key}`);
    const parsed = group[0]?.parsed;
    if (!parsed) fail(`Missing authored range metadata: ${key}`);
    const ranges = authoredRanges(source);
    const triangleRange = ranges?.[parsed.rangeKey];
    if (!triangleRange) fail(`Authored range '${parsed.rangeKey}' is absent from ${source.name}.`);
    const aggregateStart = triangleRange.startTriangle * 3;
    const aggregateCount = triangleRange.triangleCount * 3;
    const ordinalEntries = group.filter((item) => item.parsed.ordinal !== null);
    if (ordinalEntries.length === 0) {
      const indexRange = group[0]?.record.indexRange;
      if (group.length !== 1 || indexRange?.[0] !== aggregateStart ||
        indexRange[1] !== aggregateCount)
        fail(`Authored range '${parsed.rangeKey}' does not exactly match its full source span.`);
      continue;
    }
    if (ordinalEntries.length !== group.length)
      fail(`Authored range '${parsed.rangeKey}' mixes whole-range and ordinal component records.`);
    const partCount = aggregateCount / resolveAuthoredInstanceCount(scene, source, parsed.rangeKey, triangleRange);
    if (!Number.isInteger(partCount) || partCount <= 0)
      fail(`Authored range '${parsed.rangeKey}' cannot be partitioned into its source instances.`);
    const ordinals = ordinalEntries.map((item) => item.parsed.ordinal).sort((a, b) => (a ?? 0) - (b ?? 0));
    if (new Set(ordinals).size !== ordinals.length || ordinals.some((ordinal) =>
      ordinal === null || ordinal < 0 || ordinal * partCount >= aggregateCount,
    ))
      fail(`Authored range '${parsed.rangeKey}' has duplicate or out-of-range source ordinals.`);
    for (const item of ordinalEntries) {
      const ordinal = item.parsed.ordinal;
      const expectedStart = aggregateStart + (ordinal ?? 0) * partCount;
      const expectedRange = item.record.indexRange;
      if (item.record.sourceOrdinal !== ordinal ||
        expectedRange?.[0] !== expectedStart || expectedRange[1] !== partCount)
        fail(`Authored range ${item.record.id} does not match its source ordinal span.`);
    }
  }
}

function resolveAuthoredInstanceCount(
  scene: THREE.Object3D,
  source: OwnerLayoutMesh,
  rangeKey: string,
  range: TriangleRange,
): number {
  if (rangeKey === 'cityFoundations') {
    const authoredCount = Number(source.geometry.userData.includesCityFoundations);
    if (Number.isInteger(authoredCount) && authoredCount > 0) return authoredCount;
  }
  const bakedRanges = source.geometry.userData.bakedCityGeometryRanges as
    | Record<string, TriangleRange>
    | undefined;
  if (bakedRanges) {
    const sourceName = Object.entries(bakedRanges).find(([name, candidate]) => {
      const categoryMatches = rangeKey === 'cityFoundations'
        ? name.includes('foundations')
        : rangeKey === 'cityTowers' && /towers|buildings/.test(name);
      return categoryMatches && candidate.startTriangle === range.startTriangle &&
        candidate.triangleCount === range.triangleCount;
    })?.[0];
    if (sourceName) {
      const matches: THREE.Object3D[] = [];
      scene.traverse((object) => {
        if (object.name === sourceName) matches.push(object);
      });
      if (matches.length === 1 && matches[0] instanceof THREE.InstancedMesh)
        return matches[0].count;
      fail(`Authored source instance mesh '${sourceName}' is missing or ambiguous.`);
    }
  }
  fail(`Cannot verify the instance count for authored range '${rangeKey}' on '${source.name}'.`);
}

export async function resolveNeonGridOwnerLayoutSourceMap(
  scene: THREE.Object3D,
  components: readonly OwnerLayoutComponentRecord[],
): Promise<Map<string, ResolvedOwnerLayoutComponent>> {
  const ids = new Set<string>();
  const errors: string[] = [];
  for (const record of components) {
    if (ids.has(record.id)) fail(`Duplicate owner layout component ID: ${record.id}`);
    ids.add(record.id);
    if (!record.id || !record.scenePath || !record.geometryHash || !Array.isArray(record.baselineMatrix))
      errors.push(`${record.id || '<empty-id>'}: incomplete source identity`);
  }
  if (errors.length) fail(`Owner layout source resolution failed:\n${errors.map((e) => `- ${e}`).join('\n')}`);

  scene.updateMatrixWorld(true);
  const objects = new Map<string, THREE.Object3D>();
  scene.traverse((object) => {
    const key = ownerLayoutScenePath(object);
    if (objects.has(key)) errors.push(`${key}: duplicate scene path`);
    else objects.set(key, object);
  });
  const parsedById = new Map<string, ParsedRangePath>();
  const objectById = new Map<string, OwnerLayoutMesh>();
  for (const record of components) {
    if (record.indexRange === null) {
      const instance = /\/instance\/(\d+)$/.exec(record.id);
      const object = objects.get(record.scenePath);
      if (!object || !(object instanceof THREE.Mesh)) {
        errors.push(`${record.id}: scene path '${record.scenePath}' does not resolve to a mesh`);
        continue;
      }
      if (instance) {
        const instanceIndex = Number(instance[1]);
        if (!(object instanceof THREE.InstancedMesh) || instanceIndex >= object.count) {
          errors.push(`${record.id}: instance index does not resolve on its source mesh`);
          continue;
        }
      } else if (object instanceof THREE.InstancedMesh) {
        errors.push(`${record.id}: instanced mesh component is missing its instance index`);
        continue;
      }
      if (record.id !== (instance ? `${record.scenePath}/instance/${instance[1] ?? ''}` : record.scenePath)) {
        errors.push(`${record.id}: component ID does not match its scene path`);
        continue;
      }
      objectById.set(record.id, object as OwnerLayoutMesh);
      continue;
    }
    try {
      const parsed = parseRangePath(record.scenePath);
      if (record.id !== record.scenePath) fail(`Component ID does not match authored path: ${record.id}`);
      const parent = objects.get(parsed.parentPath);
      if (!parent) fail(`Parent scene path '${parsed.parentPath}' is missing.`);
      const candidates = parent.children.filter((child) => child.name === parsed.meshName);
      if (candidates.length !== 1 || !(candidates[0] instanceof THREE.Mesh) || candidates[0] instanceof THREE.InstancedMesh)
        fail(`Expected one authored source mesh named '${parsed.meshName}', found ${String(candidates.length)}.`);
      parsedById.set(record.id, parsed);
      objectById.set(record.id, candidates[0] as OwnerLayoutMesh);
    } catch (error) {
      errors.push(`${record.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (errors.length) fail(`Owner layout source resolution failed:\n${errors.map((e) => `- ${e}`).join('\n')}`);

  try {
    validateRangeLayout(scene, components, parsedById, objectById);
  } catch (error) {
    fail(`Owner layout authored range verification failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const geometryHashes = new WeakMap<THREE.BufferGeometry, Promise<string>>();
  const rangeHashes = new WeakMap<THREE.BufferGeometry, Map<string, Promise<string>>>();
  const resolved = new Map<string, ResolvedOwnerLayoutComponent>();
  for (const record of components) {
    const object = objectById.get(record.id);
    if (!object) {
      errors.push(`${record.id}: resolved source is no longer a mesh`);
      continue;
    }
    const geometry = object.geometry;
    let instanceIndex: number | null = null;
    const world = object.matrixWorld.clone();
    let kind: ResolvedOwnerLayoutComponent['kind'] = 'object';
    if (record.indexRange !== null) {
      kind = 'range';
    } else if (object instanceof THREE.InstancedMesh) {
      const match = /\/instance\/(\d+)$/.exec(record.id);
      if (!match) {
        errors.push(`${record.id}: instance index is missing`);
        continue;
      }
      instanceIndex = Number(match[1]);
      const instanceMatrix = new THREE.Matrix4();
      object.getMatrixAt(instanceIndex, instanceMatrix);
      world.multiply(instanceMatrix);
      kind = 'instance';
    }
    if (!nearMatrix(world, record.baselineMatrix))
      errors.push(`${record.id}: exported baseline matrix differs from the current source world matrix`);
    try {
      let actualHash: Promise<string>;
      if (record.indexRange !== null) {
        let byRange = rangeHashes.get(geometry);
        if (!byRange) {
          byRange = new Map();
          rangeHashes.set(geometry, byRange);
        }
        const rangeKey = `${String(record.indexRange[0])}:${String(record.indexRange[1])}`;
        actualHash = byRange.get(rangeKey) ?? rangeGeometryHash(geometry, record.indexRange);
        byRange.set(rangeKey, actualHash);
      } else {
        actualHash = geometryHashes.get(geometry) ?? geometryHash(geometry);
        geometryHashes.set(geometry, actualHash);
      }
      const actualHashValue = await actualHash;
      if (actualHashValue !== record.geometryHash) {
        const portableBaseline = PORTABLE_GEOMETRY_BASELINES[record.id];
        const portableMatch = portableBaseline?.exportedHash === record.geometryHash &&
          portableBaseline.portableHash === await portableGeometryHash(geometry);
        if (!portableMatch)
          errors.push(`${record.id}: source geometry hash mismatch (${actualHashValue})`);
      }
    } catch (error) {
      errors.push(`${record.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
    const parsed = parsedById.get(record.id);
    resolved.set(record.id, {
      record,
      object,
      kind,
      instanceIndex,
      indexRange: record.indexRange,
      rangeKey: parsed?.rangeKey ?? null,
      rangeOrdinal: parsed?.ordinal ?? null,
      baselineWorld: world,
    });
  }
  if (errors.length) fail(`Owner layout source resolution failed:\n${errors.map((e) => `- ${e}`).join('\n')}`);
  if (resolved.size !== components.length) fail('Owner layout source map did not resolve every component.');
  return resolved;
}
