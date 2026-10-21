import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { Matrix4 } from 'three';

const EXPECTED_INPUT_SHA256 =
  '2f48eea9e634f1f371525c458d9509b8e3f0900a3cf7981b3f5e9f8e5aae1240';
const EXPECTED_INTEGRITY = {
  baseline: 'c1aa792c5f3a3ecbbe43784d4d03e907edbb5f994d98607bc13ea61b76da8701',
  design: 'db881465ccd5a1d884761b9557b7213c9d2037658548502945f052a712e0ca95',
  document: '8207b672fcf1864bdd55657a85710bd0c0d75060ef7f4e5876e5d0cdf0430e8a',
  projection: 'e876483e7af6c4e45b94499c7f028bf49575a9a38510374fb759f74717e2fd14',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(',')}}`;
}

function digestJson(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function record(value, label) {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), `${label} must be an object.`);
  return value;
}

function expandHistory(wire) {
  record(wire, 'document.history');
  assert(wire.encoding === 'changes-v1', 'Unsupported history encoding.');
  assert(Array.isArray(wire.actions), 'History actions must be an array.');
  assert(Number.isInteger(wire.cursor) && wire.cursor >= 0 && wire.cursor <= wire.actions.length,
    'Invalid history cursor.');
  let state = clone(record(wire.initial, 'history.initial'));
  assert(
    ['road', 'overrides', 'groups'].every((key) => Object.hasOwn(state, key)) &&
      Object.keys(state).every((key) => ['road', 'overrides', 'groups'].includes(key)),
    'History initial state has an unexpected shape.',
  );
  const actions = [];
  let expandedBytes = 0;
  const ids = new Set();
  for (const [index, item] of wire.actions.entries()) {
    const action = record(item, `history.actions[${index}]`);
    const patch = record(action.patch, `history.actions[${index}].patch`);
    assert(typeof action.id === 'string' && !ids.has(action.id), 'History action ID is missing or duplicated.');
    assert(typeof action.label === 'string', 'History action label is invalid.');
    assert(Object.keys(action).every((key) => ['id', 'label', 'patch'].includes(key)), 'Unexpected history action key.');
    assert(Object.keys(patch).every((key) => ['road', 'overrides', 'groups'].includes(key)), 'Unexpected history patch key.');
    ids.add(action.id);
    const before = state;
    state = clone(before);
    if (patch.road !== undefined) state.road = clone(patch.road);
    for (const field of ['overrides', 'groups']) {
      if (patch[field] === undefined) continue;
      const changes = record(patch[field], `history patch ${field}`);
      for (const [id, value] of Object.entries(changes)) {
        if (value === null) delete state[field][id];
        else Object.defineProperty(state[field], id, {
          value: clone(value), enumerable: true, configurable: true, writable: true,
        });
      }
    }
    expandedBytes += JSON.stringify(state).length * 2;
    assert(expandedBytes <= 128 * 1024 * 1024, 'Expanded history exceeds the supported limit.');
    actions.push({ id: action.id, label: action.label, before, after: state });
  }
  return { cursor: wire.cursor, actions, finalState: state };
}

function validateMatrix(matrix, label) {
  assert(Array.isArray(matrix) && matrix.length === 16, `${label} must have 16 values.`);
  assert(matrix.every((value) => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1e6),
    `${label} contains a non-finite or excessive value.`);
  assert(matrix[3] === 0 && matrix[7] === 0 && matrix[11] === 0 && matrix[15] === 1,
    `${label} must be affine.`);
  assert(new Matrix4().fromArray(matrix).determinant() > 1e-12,
    `${label} must be non-mirrored and non-singular.`);
}

function normalize(sourcePath) {
  const bytes = readFileSync(sourcePath);
  const sourceSha256 = createHash('sha256').update(bytes).digest('hex');
  assert(sourceSha256 === EXPECTED_INPUT_SHA256, `Input SHA-256 mismatch: ${sourceSha256}`);
  const input = JSON.parse(bytes.toString('utf8'));
  assert(input.format === 'manacondas-neon-grid-edits' && input.schemaVersion === 1,
    'Unsupported owner layout export format.');

  const document = record(input.document, 'document');
  const baseline = record(document.baseline, 'document.baseline');
  assert(baseline.repository === 'Manaconda33/manacondas-minigame-mayhem', 'Repository identity mismatch.');
  assert(baseline.runtimeSourceSha === 'addab4c7c2421f52c4731691b8a9f3e2d9e39f94', 'Runtime source mismatch.');
  assert(baseline.editorBuildSha === '4182fb797aa232d6cf38651beb9b017efd0c3f4f', 'Editor build mismatch.');
  assert(baseline.catalogueVersion === 2, 'Unexpected component catalogue version.');
  assert(baseline.selectors?.material === 'concrete-coverage-c2-001', 'C2 material selector mismatch.');
  assert(baseline.selectors?.visual === 'c2-task-a-fog-overlay', 'Fog V3.2 visual selector mismatch.');
  assert(input.conventions?.units === 'metres' && input.conventions?.up === '+Y', 'Coordinate convention mismatch.');
  assert(input.conventions?.matrices === 'column-major, world-space', 'Matrix convention mismatch.');

  const components = input.components;
  const overrides = record(document.overrides, 'document.overrides');
  const projection = record(input.projection, 'projection');
  const bindings = projection.bindings;
  assert(Array.isArray(components) && components.length === 1331, 'Expected 1,331 source components.');
  assert(Array.isArray(bindings) && bindings.length === 371, 'Expected 371 projection bindings.');
  assert(Object.keys(overrides).length === 985, 'Expected 985 explicit component overrides.');
  assert(Array.isArray(document.history?.actions) && document.history.actions.length === 110 &&
    document.history.cursor === 110, 'Expected 110 recorded and applied history actions.');
  assert(input.summary?.edited === 1331 && input.summary?.deleted === 7 &&
    input.summary?.appliedActions === 110, 'Export summary counts mismatch.');
  assert(document.warnings?.length === 0 && projection.warnings?.length === 0 && input.summary.warnings?.length === 0,
    'The export contains warnings and cannot be normalized silently.');

  const componentById = new Map();
  for (const [index, component] of components.entries()) {
    record(component, `components[${index}]`);
    assert(typeof component.id === 'string' && !componentById.has(component.id),
      `Missing or duplicate component ID: ${String(component.id)}`);
    assert(typeof component.scenePath === 'string' && component.scenePath.length > 0,
      `Missing scene path for ${component.id}`);
    assert(typeof component.sourceFile === 'string' && typeof component.geometryHash === 'string',
      `Missing source identity for ${component.id}`);
    validateMatrix(component.baselineMatrix, `${component.id} baseline matrix`);
    if (component.indexRange !== undefined) {
      assert(Array.isArray(component.indexRange) && component.indexRange.length === 2 &&
        component.indexRange.every((value) => Number.isInteger(value) && value >= 0) &&
        component.indexRange[0] % 3 === 0 && component.indexRange[1] % 3 === 0,
      `Invalid authored index range for ${component.id}`);
    }
    componentById.set(component.id, component);
  }

  const bindingById = new Map();
  for (const binding of bindings) {
    record(binding, 'projection binding');
    assert(typeof binding.id === 'string' && !bindingById.has(binding.id),
      `Missing or duplicate projection binding: ${String(binding.id)}`);
    assert(componentById.has(binding.id), `Unknown projection component: ${binding.id}`);
    validateMatrix(binding.matrix, `${binding.id} projected matrix`);
    validateMatrix(binding.sourceFrameInverse, `${binding.id} source frame inverse`);
    bindingById.set(binding.id, binding);
  }
  const unionIds = new Set([...Object.keys(overrides), ...bindingById.keys()]);
  assert(unionIds.size === 1331, `Edited component union mismatch: ${unionIds.size}`);
  assert([...componentById.keys()].every((id) => unionIds.has(id)), 'Source catalogue differs from edited component set.');
  assert([...unionIds].every((id) => componentById.has(id)), 'An edit references a component absent from the source catalogue.');

  for (const [id, override] of Object.entries(overrides)) {
    record(override, `override ${id}`);
    assert(componentById.has(id), `Unknown override component: ${id}`);
    validateMatrix(override.matrix, `${id} override matrix`);
    assert(typeof override.deleted === 'boolean', `Invalid deletion flag for ${id}`);
    const binding = bindingById.get(id);
    if (binding) {
      assert(override.matrix.every((value, index) => value === binding.matrix[index]),
        `Override/projection matrix mismatch: ${id}`);
      assert(override.deleted === binding.deleted, `Override/projection deletion mismatch: ${id}`);
    }
  }

  assert(canonicalJson(document.road) === canonicalJson(input.baselineRoad), 'Owner edit changed the authored road or shortcut paths.');
  assert(Array.isArray(input.baselineRoad?.controlPoints) && input.baselineRoad.controlPoints.length === 34,
    'Expected 34 unchanged main road controls.');
  assert(canonicalJson(document.road.controlPoints) === canonicalJson(input.baselineRoad.controlPoints),
    'Road control points or widths differ from their source baseline.');
  assert(canonicalJson(document.road.shortcutPaths) === canonicalJson(input.baselineRoad.shortcutPaths),
    'Shortcut route data differs from its source baseline.');

  const unpackedHistory = expandHistory(document.history);
  const design = { road: document.road, overrides: document.overrides, groups: document.groups };
  assert(canonicalJson(unpackedHistory.finalState) === canonicalJson(design),
    'Applied history does not reconstruct the exported final design.');
  const expandedDocument = { ...document, history: { cursor: unpackedHistory.cursor, actions: unpackedHistory.actions } };
  const verifiedDigests = {
    baseline: digestJson({ baseline, baselineRoad: input.baselineRoad, components }),
    design: digestJson(design),
    document: digestJson(expandedDocument),
    projection: digestJson(projection),
  };
  for (const [name, expected] of Object.entries(EXPECTED_INTEGRITY)) {
    assert(input.integrity?.[name] === expected, `Input ${name} digest does not match the reviewed source value.`);
    assert(verifiedDigests[name] === expected, `${name} integrity digest failed independent verification.`);
  }

  const normalizedComponents = [...componentById.values()]
    .map((component) => {
      const override = overrides[component.id];
      const binding = bindingById.get(component.id);
      const matrix = override?.matrix ?? binding?.matrix ?? component.baselineMatrix;
      validateMatrix(matrix, `${component.id} final matrix`);
      return {
        id: component.id,
        scenePath: component.scenePath,
        sourceFile: component.sourceFile,
        sourceSymbol: component.sourceSymbol,
        sourceOrdinal: component.sourceOrdinal,
        indexRange: component.indexRange ?? null,
        geometryHash: component.geometryHash,
        baselineMatrix: component.baselineMatrix,
        matrix,
        deleted: override?.deleted ?? binding?.deleted ?? false,
      };
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  assert(normalizedComponents.filter((component) => component.deleted).length === 7,
    'Normalized component deletion count mismatch.');

  return {
    format: 'manacondas-neon-grid-owner-layout-runtime',
    schemaVersion: 1,
    sourceSha256,
    baseline: {
      runtimeSourceSha: baseline.runtimeSourceSha,
      editorBuildSha: baseline.editorBuildSha,
      catalogueVersion: baseline.catalogueVersion,
      catalogueHash: baseline.catalogueHash,
      selectors: baseline.selectors,
    },
    sourceCounts: {
      components: components.length,
      overrides: Object.keys(overrides).length,
      projectionBindings: bindings.length,
      actions: unpackedHistory.actions.length,
      deleted: normalizedComponents.filter((component) => component.deleted).length,
    },
    baselineRoad: input.baselineRoad,
    integrity: { verified: true, digests: verifiedDigests },
    components: normalizedComponents,
  };
}

function main() {
  const [, , sourcePath, outputPath] = process.argv;
  if (!sourcePath || !outputPath) {
    throw new Error('Usage: node tools/prepare-neon-grid-owner-layout.mjs <source-json> <output-json>');
  }
  const normalized = normalize(sourcePath);
  writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  process.stdout.write(`Verified input ${normalized.sourceSha256}; wrote ${normalized.components.length} components.\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
