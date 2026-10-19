import { describe, expect, it } from 'vitest';
import { packJournal, unpackJournal } from '../src/editor/neon-grid/EditorJournal';
import { createEditorDocument, identityMatrix } from '../src/editor/neon-grid/EditorDocument';
import { EditorHistory } from '../src/editor/neon-grid/EditorHistory';
const doc = () =>
  createEditorDocument({
    repository: 'repo',
    runtimeSourceSha: 'a'.repeat(40),
    editorBuildSha: 'b'.repeat(40),
    selectors: { material: 'c', visual: 'v' },
    catalogueHash: 'c',
    catalogueVersion: 1,
  });
describe('lossless compact edit journals', () => {
  it('restores exact before/after states and undone actions without repeating unchanged roads', () => {
    const h = new EditorHistory(doc());
    for (let i = 0; i < 120; i++)
      h.apply('move', (s) => {
        s.overrides.building = { matrix: identityMatrix(), deleted: false };
        s.overrides.building.matrix[12] = i;
      });
    h.undo();
    h.undo();
    const d = h.snapshot();
    const packed = packJournal(d.history, d);
    expect(JSON.stringify(packed).length).toBeLessThan(JSON.stringify(d.history).length / 4);
    expect(unpackJournal(packed)).toEqual(d.history);
  });
  it('rejects an over-capacity edit before accepting it or losing the last state', () => {
    const h = new EditorHistory(doc());
    const before = h.snapshot();
    expect(() =>
      { h.apply('oversized', (s) => {
        s.groups.large = ['x'.repeat(11 * 1024 * 1024)];
      }); },
    ).toThrow(/capacity/i);
    expect(h.snapshot()).toEqual(before);
    expect(h.inGesture).toBe(false);
  });
  it('rejects malformed patches and preserves input final state', () => {
    const d = doc(),
      before = JSON.stringify(d);
    const wire = packJournal(d.history, d);
    expect(unpackJournal(wire)).toEqual(d.history);
    expect(JSON.stringify(d)).toBe(before);
    expect(() =>
      unpackJournal({ ...wire, actions: [{ id: 'x', label: 'bad', patch: { surprise: true } }] }),
    ).toThrow();
  });
});
