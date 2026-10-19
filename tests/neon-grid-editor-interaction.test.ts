import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { buildCatalogue } from '../src/editor/neon-grid/ComponentCatalogue';
import {
  createEditorDocument,
  cloneData,
  requireValue,
} from '../src/editor/neon-grid/EditorDocument';
import { EditorHistory } from '../src/editor/neon-grid/EditorHistory';
import { EditorProjection } from '../src/editor/neon-grid/EditorProjection';
import { EditorSelection, textInputOwnsKeyboard } from '../src/editor/neon-grid/EditorSelection';
import { EditorTransforms } from '../src/editor/neon-grid/EditorTransforms';
async function fixture() {
  const track = new NeonGrid(),
    root = new THREE.Group();
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial(),
    3,
  );
  mesh.name = 'skyline-city-towers';
  mesh.setMatrixAt(0, new THREE.Matrix4());
  mesh.setMatrixAt(1, new THREE.Matrix4().makeTranslation(5, 0, 0));
  mesh.setMatrixAt(2, new THREE.Matrix4().makeTranslation(0, 0, 25));
  root.add(mesh);
  const catalogue = await buildCatalogue(root, track);
  const d = createEditorDocument({
    repository: 'Manaconda33/manacondas-minigame-mayhem',
    runtimeSourceSha: 'a'.repeat(40),
    editorBuildSha: 'b'.repeat(40),
    selectors: { material: 'concrete-coverage-c2-001', visual: 'c2-task-a-fog-overlay' },
    catalogueVersion: 1,
    catalogueHash: catalogue.hash,
  });
  d.road = cloneData(catalogue.baselineRoad);
  const history = new EditorHistory(d),
    projection = new EditorProjection(catalogue, track);
  projection.apply(d);
  const selection = new EditorSelection(catalogue, projection);
  const transforms = new EditorTransforms(catalogue, history, projection);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 15);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  return {
    catalogue,
    history,
    projection,
    selection,
    transforms,
    mesh,
    camera,
    ids: catalogue.entries.map((e) => e.id),
  };
}
describe('editor component interactions', () => {
  it('picks one instance and toggles selection membership', async () => {
    const f = await fixture();
    expect(f.selection.pick(new THREE.Vector2(0, 0), f.camera)).toBe(f.ids[0]);
    f.selection.replace([requireValue(f.ids[0])]);
    f.selection.toggle(requireValue(f.ids[1]));
    expect(f.selection.ids).toEqual([f.ids[0], f.ids[1]]);
    f.selection.toggle(requireValue(f.ids[0]));
    expect(f.selection.ids).toEqual([f.ids[1]]);
  });
  it('marquee excludes behind-camera objects and respects layer visibility', async () => {
    const f = await fixture();
    expect(
      f.selection.marquee(new THREE.Vector2(-1, -1), new THREE.Vector2(1, 1), f.camera),
    ).toEqual([f.ids[0], f.ids[1]]);
    f.mesh.visible = false;
    expect(
      f.selection.marquee(new THREE.Vector2(-1, -1), new THREE.Vector2(1, 1), f.camera),
    ).toEqual([]);
  });
  it('applies group delta once and leaves the batch neighbour unchanged', async () => {
    const f = await fixture();
    f.transforms.begin([requireValue(f.ids[0]), requireValue(f.ids[0])], 'Move');
    f.transforms.preview(new THREE.Matrix4().makeTranslation(4, 0, 0));
    f.transforms.commit();
    const a = new THREE.Matrix4(),
      b = new THREE.Matrix4();
    f.mesh.getMatrixAt(0, a);
    f.mesh.getMatrixAt(1, b);
    expect(a.elements[12]).toBe(4);
    expect(b.elements[12]).toBe(5);
    expect(f.history.snapshot().history.actions).toHaveLength(1);
    f.history.undo();
    f.projection.apply(f.history.snapshot());
    f.mesh.getMatrixAt(0, a);
    expect(a.elements[12]).toBe(0);
  });
  it('cancels a gesture and enforces positive numeric dimensions', async () => {
    const f = await fixture();
    f.transforms.begin([requireValue(f.ids[0])], 'Move');
    f.transforms.preview(new THREE.Matrix4().makeTranslation(8, 0, 0));
    f.transforms.cancel();
    expect(f.history.snapshot().history.actions).toHaveLength(0);
    expect(() => {
      f.transforms.setDimensions([requireValue(f.ids[0])], new THREE.Vector3(0, 1, 1));
    }).toThrow(/positive|dimension/i);
    f.transforms.setDimensions([requireValue(f.ids[0])], new THREE.Vector3(4, 6, 2));
    expect(
      f.selection
        .bounds([requireValue(f.ids[0])])
        .getSize(new THREE.Vector3())
        .toArray(),
    ).toEqual([4, 6, 2]);
  });
  it('leaves Delete/undo keystrokes to text and numeric fields', () => {
    expect(textInputOwnsKeyboard(document.createElement('input'))).toBe(true);
    expect(textInputOwnsKeyboard(document.createElement('textarea'))).toBe(true);
    expect(textInputOwnsKeyboard(document.createElement('canvas'))).toBe(false);
  });
});
