import { packJournal, unpackJournal } from './EditorJournal';
import * as THREE from 'three';
import {
  designState,
  type Attachment,
  type EditorBaseline,
  type EditorDocument,
  type Matrix4Data,
  type RoadState,
  type Vec3,
  requireValue,
} from './EditorDocument';
export interface ExportComponent {
  id: string;
  label: string;
  sourceFile: string;
  sourceSymbol: string;
  sector: string;
  materials: { name: string; type: string }[];
  scenePath: string;
  sourceOrdinal: number | null;
  geometryHash: string;
  baselineMatrix: Matrix4Data;
  dimensions: Vec3;
  groupId: string | null;
  attachment: Attachment;
  indexRange?: [number, number];
}
export interface DocumentCatalogue {
  hash: string;
  baselineRoad: RoadState;
  entries: readonly ExportComponent[];
}
export interface ProjectionEvidence {
  finalPaths: {
    main: number[][];
    shortcuts: Record<string, number[][]>;
  };
  bindings: {
    id: string;
    path: string;
    progress: number;
    sourceFrameInverse: number[];
    matrix: number[];
    deleted: boolean;
  }[];
  warnings: string[];
}
const MAX_BYTES = 20 * 1024 * 1024;
const FORMAT = 'manacondas-neon-grid-edits';
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}
export async function digestJson(value: unknown): Promise<string> {
  const subtle: SubtleCrypto | undefined = (crypto as Partial<Crypto>).subtle;
  if (!subtle) throw new Error('Secure browser context required for integrity verification.');
  const hash = await subtle.digest('SHA-256', new TextEncoder().encode(canonicalJson(value)));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}
function fail(message: string): never {
  throw new Error(message);
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Expected a JSON object.');
  return value as Record<string, unknown>;
}
function keys(value: unknown, allowed: string[]): Record<string, unknown> {
  const r = object(value);
  if (Object.keys(r).some((k) => !allowed.includes(k))) fail('Unknown document property.');
  return r;
}
function finite(value: unknown, limit = 1e6): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
}
function vector(value: unknown, length: number): value is number[] {
  return Array.isArray(value) && value.length === length && value.every((v) => finite(v));
}
export function validateMatrix(value: unknown): asserts value is Matrix4Data {
  if (
    !vector(value, 16) ||
    value[3] !== 0 ||
    value[7] !== 0 ||
    value[11] !== 0 ||
    value[15] !== 1 ||
    new THREE.Matrix4().fromArray(value).determinant() <= 1e-12
  )
    fail('Transform must be finite, affine, non-mirrored and non-singular.');
}
function validateRoad(value: unknown, baseline: RoadState): void {
  const r = keys(value, ['controlPoints', 'shortcutPaths']);
  if (!Array.isArray(r.controlPoints) || r.controlPoints.length !== baseline.controlPoints.length)
    fail('Road control point count mismatch.');
  r.controlPoints.forEach((point, i) => {
    const p = keys(point, ['id', 'position', 'widthMultiplier']);
    if (
      p.id !== baseline.controlPoints[i]?.id ||
      !vector(p.position, 3) ||
      !finite(p.widthMultiplier, 100) ||
      p.widthMultiplier <= 0.01
    )
      fail('Invalid road control point or width.');
  });
  const paths = object(r.shortcutPaths);
  if (
    Object.keys(paths).some((id) => !Object.hasOwn(baseline.shortcutPaths, id)) ||
    Object.keys(paths).length !== Object.keys(baseline.shortcutPaths).length
  )
    fail('Unknown shortcut path.');
  for (const [id, path] of Object.entries(paths)) {
    const p = keys(path, ['entryProgress', 'exitProgress', 'points']);
    const original = requireValue(baseline.shortcutPaths[id]);
    if (
      p.entryProgress !== original.entryProgress ||
      p.exitProgress !== original.exitProgress ||
      !Array.isArray(p.points) ||
      p.points.length !== original.points.length ||
      p.points.some((v) => !vector(v, 3))
    )
      fail('Invalid shortcut path.');
  }
}
function validateState(value: unknown, catalogue: DocumentCatalogue): void {
  const state = keys(value, ['road', 'overrides', 'groups']);
  validateRoad(state.road, catalogue.baselineRoad);
  const known = new Set(catalogue.entries.map((e) => e.id));
  const overrides = object(state.overrides);
  for (const [id, value] of Object.entries(overrides)) {
    if (!known.has(id)) fail(`Unknown component: ${id}`);
    const r = keys(value, ['matrix', 'deleted', 'attachment']);
    validateMatrix(r.matrix);
    if (typeof r.deleted !== 'boolean') fail('Invalid deletion state.');
    if (r.attachment !== undefined) {
      const a = keys(r.attachment, ['mode', 'path', 'progress']);
      if (
        a.mode !== 'fixed' &&
        (a.mode !== 'road' ||
          typeof a.path !== 'string' ||
          (a.path !== 'main' && !Object.hasOwn(catalogue.baselineRoad.shortcutPaths, a.path)) ||
          !finite(a.progress, 1) ||
          a.progress < 0)
      )
        fail('Invalid road attachment.');
      if (
        a.mode === 'road' &&
        canonicalJson(a) !== canonicalJson(catalogue.entries.find((e) => e.id === id)?.attachment)
      )
        fail(
          'Rebinding to a different road anchor is unsupported; detach or restore the original anchor.',
        );
    }
  }
  for (const [id, group] of Object.entries(object(state.groups))) {
    if (
      !id ||
      !Array.isArray(group) ||
      group.some((x) => typeof x !== 'string' || !known.has(x)) ||
      new Set(group).size !== group.length
    )
      fail('Invalid component group.');
  }
}
export function validateDocument(
  value: unknown,
  expected: EditorBaseline,
  catalogue: DocumentCatalogue,
): asserts value is EditorDocument {
  const d = keys(value, [
    'schemaVersion',
    'baseline',
    'road',
    'overrides',
    'groups',
    'history',
    'view',
    'warnings',
  ]);
  if (d.schemaVersion !== 1) fail('Unsupported document schema version.');
  const b = keys(d.baseline, [
    'repository',
    'runtimeSourceSha',
    'editorBuildSha',
    'selectors',
    'catalogueVersion',
    'catalogueHash',
  ]);
  if (
    b.repository !== expected.repository ||
    b.runtimeSourceSha !== expected.runtimeSourceSha ||
    canonicalJson(b.selectors) !== canonicalJson(expected.selectors)
  )
    fail('Baseline source mismatch.');
  if (
    b.catalogueHash !== catalogue.hash ||
    b.catalogueHash !== expected.catalogueHash ||
    b.catalogueVersion !== expected.catalogueVersion
  )
    fail('Catalogue mismatch.');
  if (typeof b.editorBuildSha !== 'string' || !/^[a-f0-9]{40}$/.test(b.editorBuildSha))
    fail('Missing editor source identity.');
  validateState({ road: d.road, overrides: d.overrides, groups: d.groups }, catalogue);
  const h = keys(d.history, ['actions', 'cursor']);
  if (
    !Array.isArray(h.actions) ||
    !Number.isInteger(h.cursor) ||
    (h.cursor as number) < 0 ||
    (h.cursor as number) > h.actions.length
  )
    fail('Invalid history cursor.');
  const ids = new Set<string>();
  h.actions.forEach((action, i) => {
    const a = keys(action, ['id', 'label', 'before', 'after']);
    if (typeof a.id !== 'string' || ids.has(a.id) || typeof a.label !== 'string')
      fail('Invalid history action.');
    ids.add(a.id);
    validateState(a.before, catalogue);
    validateState(a.after, catalogue);
    if (
      i > 0 &&
      canonicalJson(requireValue((h.actions as Record<string, unknown>[])[i - 1]).after) !==
        canonicalJson(a.before)
    )
      fail('Broken history chain.');
  });
  if (h.actions.length) {
    const cursor = h.cursor as number;
    const state = cursor
      ? (h.actions[cursor - 1] as Record<string, unknown>).after
      : (h.actions[0] as Record<string, unknown>).before;
    if (canonicalJson(state) !== canonicalJson(designState(value as EditorDocument)))
      fail('History does not match final design.');
  }
  const v = keys(d.view, ['position', 'target', 'fog', 'helpers']);
  if (
    !vector(v.position, 3) ||
    !vector(v.target, 3) ||
    typeof v.fog !== 'boolean' ||
    typeof v.helpers !== 'boolean' ||
    !Array.isArray(d.warnings) ||
    d.warnings.some((v) => typeof v !== 'string')
  )
    fail('Invalid view or warning record.');
}
function validateProjection(
  value: unknown,
  catalogue: DocumentCatalogue,
): asserts value is ProjectionEvidence | null {
  if (value === null) return;
  const p = keys(value, ['finalPaths', 'bindings', 'warnings']),
    paths = keys(p.finalPaths, ['main', 'shortcuts']);
  if (
    !Array.isArray(paths.main) ||
    paths.main.length !== 385 ||
    paths.main.some((p) => !vector(p, 3))
  )
    fail('Invalid projected main path.');
  for (const [id, points] of Object.entries(object(paths.shortcuts)))
    if (
      !Object.hasOwn(catalogue.baselineRoad.shortcutPaths, id) ||
      !Array.isArray(points) ||
      points.length !== 65 ||
      points.some((p) => !vector(p, 3))
    )
      fail('Invalid projected shortcut path.');
  if (
    !Array.isArray(p.bindings) ||
    !Array.isArray(p.warnings) ||
    p.warnings.some((w) => typeof w !== 'string')
  )
    fail('Invalid projection evidence.');
  const known = new Set(catalogue.entries.map((e) => e.id)),
    seen = new Set<string>();
  for (const b of p.bindings) {
    const r = keys(b, ['id', 'path', 'progress', 'sourceFrameInverse', 'matrix', 'deleted']);
    if (
      typeof r.id !== 'string' ||
      !known.has(r.id) ||
      seen.has(r.id) ||
      typeof r.path !== 'string' ||
      !finite(r.progress, 1) ||
      typeof r.deleted !== 'boolean'
    )
      fail('Unknown or duplicate projection binding.');
    seen.add(r.id);
    validateMatrix(r.matrix);
    validateMatrix(r.sourceFrameInverse);
  }
}
export async function encodeDocument(
  document: EditorDocument,
  catalogue: DocumentCatalogue,
  projection: ProjectionEvidence | null = null,
): Promise<string> {
  validateDocument(document, document.baseline, catalogue);
  validateProjection(projection, catalogue);
  const edited = new Set(Object.keys(document.overrides));
  for (const b of projection?.bindings ?? []) edited.add(b.id);
  const components = catalogue.entries.filter((e) => edited.has(e.id));
  const payload = {
    format: FORMAT,
    schemaVersion: 1,
    document: { ...document, history: packJournal(document.history, document) },
    projection,
    baselineRoad: catalogue.baselineRoad,
    components,
    conventions: {
      units: 'metres',
      up: '+Y',
      matrices: 'column-major, world-space',
      rotation: 'radians',
    },
    summary: {
      edited: edited.size,
      deleted: Object.values(document.overrides).filter((v) => v.deleted).length,
      appliedActions: document.history.cursor,
      warnings: document.warnings,
    },
    integrity: {
      baseline: await digestJson({
        baseline: document.baseline,
        baselineRoad: catalogue.baselineRoad,
        components,
      }),
      design: await digestJson(designState(document)),
      document: await digestJson(document),
      projection: await digestJson(projection),
    },
  };
  const json = JSON.stringify(payload, null, 2);
  if (new TextEncoder().encode(json).byteLength > MAX_BYTES)
    fail('Export exceeds the 20 MiB size limit; save a smaller edit session.');
  return json;
}
export async function decodeDocument(
  json: string,
  expected: EditorBaseline,
  catalogue: DocumentCatalogue,
): Promise<EditorDocument> {
  if (json.length > MAX_BYTES || new TextEncoder().encode(json).byteLength > MAX_BYTES)
    fail('Import exceeds the 20 MiB size limit.');
  const p = keys(JSON.parse(json), [
    'format',
    'schemaVersion',
    'document',
    'baselineRoad',
    'components',
    'conventions',
    'summary',
    'integrity',
    'projection',
  ]);
  if (p.format !== FORMAT || p.schemaVersion !== 1) fail('Unsupported editor file schema version.');
  const rawDocument = object(p.document);
  if (object(rawDocument.history).encoding !== undefined)
    rawDocument.history = unpackJournal(rawDocument.history);
  validateDocument(p.document, expected, catalogue);
  const d = p.document;
  validateProjection(p.projection, catalogue);
  const edited = new Set(Object.keys(d.overrides));
  for (const b of p.projection?.bindings ?? []) edited.add(b.id);
  const expectedComponents = catalogue.entries.filter((e) => edited.has(e.id));
  if (
    canonicalJson(p.components) !== canonicalJson(expectedComponents) ||
    canonicalJson(p.baselineRoad) !== canonicalJson(catalogue.baselineRoad)
  )
    fail('Catalogue source evidence mismatch.');
  const integrity = object(p.integrity);
  if (
    integrity.baseline !==
      (await digestJson({
        baseline: d.baseline,
        baselineRoad: p.baselineRoad,
        components: p.components,
      })) ||
    integrity.design !== (await digestJson(designState(d))) ||
    integrity.document !== (await digestJson(d)) ||
    integrity.projection !== (await digestJson(p.projection))
  )
    fail('Edit file integrity digest mismatch.');
  return d;
}
