import type { EditorDocument } from '../src/editor/neon-grid/EditorDocument';
import type { ExportComponent } from '../src/editor/neon-grid/EditorCodec';
import { describe, expect, it } from 'vitest';
import {
  createEditorDocument,
  identityMatrix,
  type EditorBaseline,
  requireValue,
} from '../src/editor/neon-grid/EditorDocument';
import { EditorHistory } from '../src/editor/neon-grid/EditorHistory';
import {
  canonicalJson,
  decodeDocument,
  digestJson,
  encodeDocument,
  type DocumentCatalogue,
} from '../src/editor/neon-grid/EditorCodec';
const baseline: EditorBaseline = {
  repository: 'Manaconda33/manacondas-minigame-mayhem',
  runtimeSourceSha: 'addab4c7c2421f52c4731691b8a9f3e2d9e39f94',
  editorBuildSha: 'bdaebcf1cf8dffa099bf8b7a8f7a19f4d0443621',
  selectors: { material: 'concrete-coverage-c2-001', visual: 'c2-task-a-fog-overlay' },
  catalogueVersion: 1,
  catalogueHash: 'abc123',
};
const make = () => createEditorDocument(baseline);
const catalogue: DocumentCatalogue = {
  hash: baseline.catalogueHash,
  baselineRoad: make().road,
  entries: [
    {
      id: 'skyline/building/0',
      label: 'Building 1',
      sourceFile: 'src/game/track/SkylineVisual.ts',
      sourceSymbol: 'cityScenery',
      scenePath: 'skyline/city-towers',
      sourceOrdinal: 0,
      sector: 'Skyline',
      materials: [{ name: '', type: 'MeshBasicMaterial' }],
      geometryHash: 'geometry1',
      baselineMatrix: identityMatrix(),
      dimensions: [1, 1, 1],
      groupId: null,
      attachment: { mode: 'fixed' },
    },
  ],
};
describe('editor document and history', () => {
  it('starts with all 34 authored control points and unchanged widths', () => {
    const d = make();
    expect(d.road.controlPoints).toHaveLength(34);
    expect(d.road.controlPoints[0]?.position).toEqual([0, 14, -125.795]);
    expect(d.road.controlPoints.every((p) => p.widthMultiplier === 1)).toBe(true);
  });
  it('keeps original data immutable and undoes/redoes a whole gesture', () => {
    const original = make();
    const history = new EditorHistory(original);
    history.begin('Move building');
    history.preview((state) => {
      state.overrides['skyline/building/0'] = { matrix: identityMatrix(), deleted: false };
      state.overrides['skyline/building/0'].matrix[12] = 10;
    });
    history.preview((state) => {
      state.overrides['skyline/building/0'] = { matrix: identityMatrix(), deleted: false };
      state.overrides['skyline/building/0'].matrix[12] = 20;
    });
    history.commit();
    expect(original.overrides).toEqual({});
    expect(history.snapshot().history.actions).toHaveLength(1);
    expect(history.snapshot().overrides['skyline/building/0']?.matrix[12]).toBe(20);
    history.undo();
    expect(history.snapshot().overrides).toEqual({});
    history.redo();
    expect(history.snapshot().overrides['skyline/building/0']?.matrix[12]).toBe(20);
  });
  it('cancels without history and clears redo after a new edit', () => {
    const h = new EditorHistory(make());
    h.begin('Cancelled');
    h.preview((s) => {
      requireValue(s.road.controlPoints[0]).position[1] = 25;
    });
    h.cancel();
    expect(h.snapshot().history.actions).toHaveLength(0);
    h.apply('Road up', (s) => {
      requireValue(s.road.controlPoints[0]).position[1] = 30;
    });
    h.undo();
    h.apply('Road down', (s) => {
      requireValue(s.road.controlPoints[0]).position[1] = 5;
    });
    expect(h.canRedo).toBe(false);
    expect(h.snapshot().history.actions).toHaveLength(1);
  });
  it('does not create no-op edits and detects returning to the saved state', () => {
    const h = new EditorHistory(make());
    h.markSaved();
    h.apply('No change', (state) => {
      void state;
    });
    expect(h.dirty).toBe(false);
    expect(h.snapshot().history.actions).toHaveLength(0);
    h.apply('Up', (s) => {
      requireValue(s.road.controlPoints[0]).position[1] = 18;
    });
    expect(h.dirty).toBe(true);
    h.undo();
    expect(h.dirty).toBe(false);
  });
});
describe('source-addressable import/export', () => {
  it('hashes canonical data independently of property order', async () => {
    expect(canonicalJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(await digestJson({ b: 2, a: 1 })).toBe(await digestJson({ a: 1, b: 2 }));
  });
  it('round trips deletion, width, movement and undone actions', async () => {
    const h = new EditorHistory(make());
    h.apply('Delete building', (s) => {
      s.overrides['skyline/building/0'] = { matrix: identityMatrix(), deleted: true };
    });
    h.apply('Widen', (s) => {
      requireValue(s.road.controlPoints[2]).widthMultiplier = 1.4;
    });
    h.apply('Move', (s) => {
      requireValue(s.road.controlPoints[1]).position[0] += 8;
    });
    h.undo();
    const json = await encodeDocument(h.snapshot(), catalogue);
    const result = await decodeDocument(json, baseline, catalogue);
    expect(result).toEqual(h.snapshot());
    const payload = JSON.parse(json) as {
      components: ExportComponent[];
      summary: { deleted: number };
      document: EditorDocument;
    };
    expect(requireValue(payload.components[0]).sourceFile).toContain('SkylineVisual');
    expect(payload.summary.deleted).toBe(1);
    expect(payload.document.history.cursor).toBe(2);
    expect(payload.document.history.actions).toHaveLength(3);
  });
  it('rejects changed content without treating a digest as preservation', async () => {
    const payload = JSON.parse(await encodeDocument(make(), catalogue)) as {
      document: EditorDocument;
    };
    requireValue(payload.document.road.controlPoints[0]).position[1] = 42;
    await expect(decodeDocument(JSON.stringify(payload), baseline, catalogue)).rejects.toThrow(
      /integrity|digest/i,
    );
  });
  it('rejects a different runtime source or catalogue', async () => {
    const json = await encodeDocument(make(), catalogue);
    await expect(
      decodeDocument(json, { ...baseline, runtimeSourceSha: '0'.repeat(40) }, catalogue),
    ).rejects.toThrow(/source|baseline/i);
    await expect(decodeDocument(json, baseline, { ...catalogue, hash: 'other' })).rejects.toThrow(
      /catalogue/i,
    );
  });
  it.each(['unknown', 'singular', 'mirrored', 'nonfinite', 'unknown-property'])(
    'rejects invalid %s edits before export',
    async (kind) => {
      const d = make();
      const matrix = identityMatrix();
      if (kind === 'singular') matrix[0] = 0;
      if (kind === 'mirrored') matrix[0] = -1;
      if (kind === 'nonfinite') matrix[12] = Infinity;
      d.overrides[kind === 'unknown' ? 'missing' : 'skyline/building/0'] = {
        matrix,
        deleted: false,
      };
      if (kind === 'unknown-property') Object.assign(d, { surprise: 'no' });
      await expect(encodeDocument(d, catalogue)).rejects.toThrow();
    },
  );
  it('rejects unsupported schema, oversized files and broken journal cursors', async () => {
    await expect(
      decodeDocument(' '.repeat(20 * 1024 * 1024 + 1), baseline, catalogue),
    ).rejects.toThrow(/size|large/i);
    const p = JSON.parse(await encodeDocument(make(), catalogue)) as { schemaVersion: number };
    p.schemaVersion = 999;
    await expect(decodeDocument(JSON.stringify(p), baseline, catalogue)).rejects.toThrow(
      /version|schema/i,
    );
    const d = make();
    d.history.cursor = 1;
    await expect(encodeDocument(d, catalogue)).rejects.toThrow(/history|cursor/i);
  });
});
