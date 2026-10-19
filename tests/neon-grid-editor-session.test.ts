import { requireValue } from '../src/editor/neon-grid/EditorDocument';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { buildCatalogue } from '../src/editor/neon-grid/ComponentCatalogue';
import { EditorSession } from '../src/editor/neon-grid/EditorSession';
import { EditorStorage } from '../src/editor/neon-grid/EditorStorage';
import { updateRoadState } from '../src/editor/neon-grid/EditorRoad';
async function session() {
  const track = new NeonGrid(),
    root = new THREE.Group();
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 2);
  m.name = 'skyline-city-towers';
  m.setMatrixAt(0, new THREE.Matrix4());
  m.setMatrixAt(1, new THREE.Matrix4().makeTranslation(5, 0, 0));
  root.add(m);
  const c = await buildCatalogue(root, track);
  const s = new EditorSession(c, track, {
    repository: 'Manaconda33/manacondas-minigame-mayhem',
    runtimeSourceSha: 'a'.repeat(40),
    editorBuildSha: 'b'.repeat(40),
    selectors: { material: 'concrete-coverage-c2-001', visual: 'c2-task-a-fog-overlay' },
    catalogueVersion: 1,
    catalogueHash: c.hash,
  });
  return { s, c, track };
}
describe('editor session persistence', () => {
  it('keeps the last valid document and projection after invalid input', async () => {
    const { s } = await session();
    const before = s.history.snapshot();
    expect(() => {
      s.edit('Invalid width', (d) => {
        requireValue(d.road.controlPoints[0]).widthMultiplier = 0;
      });
    }).toThrow();
    expect(s.history.snapshot()).toEqual(before);
    await expect(s.load('{"schemaVersion":999}')).rejects.toThrow();
    expect(s.history.snapshot()).toEqual(before);
  });
  it('reproduces a complete mixed edit session on a fresh import including undone actions', async () => {
    const { s, c, track } = await session();
    const [a, b] = c.entries.map((e) => e.id);
    s.edit('Delete', (d) => {
      d.overrides[requireValue(a)] = {
        matrix: requireValue(c.entries[0]).baselineMatrix,
        deleted: true,
      };
    });
    s.edit('Scale neighbour', (d) => {
      d.overrides[requireValue(b)] = {
        matrix: new THREE.Matrix4().makeScale(2, 3, 1).setPosition(9, 0, 0).toArray(),
        deleted: false,
      };
    });
    s.edit('Move road', (d) => {
      requireValue(d.road.controlPoints[2]).position[0] += 12;
      requireValue(d.road.controlPoints[3]).widthMultiplier = 1.3;
      d.road = updateRoadState(track, c.baselineRoad, d.road);
    });
    s.edit('Undo this', (d) => {
      requireValue(d.road.controlPoints[0]).position[1] += 5;
      d.road = updateRoadState(track, c.baselineRoad, d.road);
    });
    s.undo();
    const json = await s.download();
    const fresh = (await session()).s;
    await fresh.load(json);
    expect(fresh.history.snapshot()).toEqual(s.history.snapshot());
    expect(fresh.projection.matrixFor(requireValue(b)).toArray()).toEqual(
      s.projection.matrixFor(requireValue(b)).toArray(),
    );
    const exported = JSON.parse(json) as {
      projection: { finalPaths: { main: number[][] } };
      components: unknown[];
    };
    expect(exported.projection.finalPaths.main).toHaveLength(385);
    expect(exported.components).toHaveLength(2);
  });
  it('rejects a stale asynchronous import after a newer edit or gesture begins', async () => {
    const { s } = await session();
    const json = await s.download();
    const pending = s.load(json);
    s.edit('Newer height', (d) => {
      requireValue(d.road.controlPoints[0]).position[1] += 2;
    });
    const newer = s.history.snapshot();
    await expect(pending).rejects.toThrow(/changed|stale/i);
    expect(s.history.snapshot()).toEqual(newer);
    const second = s.load(json);
    s.history.begin('New drag');
    await expect(second).rejects.toThrow(/changed|stale/i);
    expect(s.history.inGesture).toBe(true);
    s.history.cancel();
  });
  it('treats view changes as inspection rather than an undoable design edit', async () => {
    const { s } = await session();
    s.history.setView({ ...s.history.snapshot().view, fog: false });
    expect(s.history.dirty).toBe(false);
    expect(s.history.snapshot().history.actions).toHaveLength(0);
  });
  it('reports unavailable local recovery without claiming success or changing design', async () => {
    const { s } = await session();
    const store = new EditorStorage('test', () => undefined);
    const result = await store.save('content');
    expect(result.ok).toBe(false);
    expect((await store.recover()).ok).toBe(false);
    expect(s.history.snapshot().overrides).toEqual({});
  });
});
