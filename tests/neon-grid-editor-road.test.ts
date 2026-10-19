import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { buildCatalogue } from '../src/editor/neon-grid/ComponentCatalogue';
import {
  createEditorDocument,
  cloneData,
  requireValue,
} from '../src/editor/neon-grid/EditorDocument';
import { createEditedPaths, updateRoadState } from '../src/editor/neon-grid/EditorRoad';
import { EditorProjection } from '../src/editor/neon-grid/EditorProjection';
async function setup() {
  const track = new NeonGrid();
  const root = new THREE.Group();
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.2), new THREE.MeshBasicMaterial());
  sign.name = 'checkpoint-0';
  sign.position.copy(track.curve.getPointAt(0.15)).add(new THREE.Vector3(0, 3, 0));
  const buildings = new THREE.InstancedMesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
    2,
  );
  buildings.name = 'skyline-city-towers';
  buildings.setMatrixAt(0, new THREE.Matrix4().makeTranslation(0, 10, 0));
  buildings.setMatrixAt(1, new THREE.Matrix4().makeTranslation(12, 10, 0));
  const ribbon = new THREE.Mesh(
    new THREE.BufferGeometry()
      .setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 14, -125.795, 0, 14, -124.795, 1, 14, -125.795], 3),
      )
      .setIndex([0, 1, 2]),
    new THREE.MeshBasicMaterial(),
  );
  ribbon.name = 'track-road';
  root.add(sign, buildings, ribbon);
  const catalogue = await buildCatalogue(root, track);
  const doc = createEditorDocument({
    repository: 'Manaconda33/manacondas-minigame-mayhem',
    runtimeSourceSha: 'a'.repeat(40),
    editorBuildSha: 'b'.repeat(40),
    selectors: { material: 'concrete-coverage-c2-001', visual: 'c2-task-a-fog-overlay' },
    catalogueVersion: 1,
    catalogueHash: catalogue.hash,
  });
  doc.road = cloneData(catalogue.baselineRoad);
  return {
    track,
    root,
    sign,
    buildings,
    ribbon,
    catalogue,
    doc,
    projection: new EditorProjection(catalogue, track),
  };
}
describe('editor-only road deformation', () => {
  it('rejects detaching deformable road geometry instead of silently restoring its baseline shape', async () => {
    const f = await setup();
    const road = requireValue(
      f.catalogue.entries.find(
        (e) => e.sourceSymbol === 'createNeonGridScene' && e.label.includes('track road'),
      ),
    );
    f.doc.overrides[road.id] = {
      matrix: road.baselineMatrix,
      deleted: false,
      attachment: { mode: 'fixed' },
    };
    expect(() => f.projection.apply(f.doc)).toThrow(/deformable|detach/i);
  });
  it('reproduces baseline widths, seam and untouched geometry exactly', async () => {
    const f = await setup();
    const before = Array.from(f.ribbon.geometry.getAttribute('position').array);
    const paths = createEditedPaths(f.track, f.doc.road);
    expect(paths.unchanged).toBe(true);
    for (const p of [0, 0.25, 0.3, 0.46, 0.8])
      expect(paths.widthAt(p)).toBe(f.track.halfWidthAt(p));
    expect(paths.main.getPointAt(0).distanceTo(paths.main.getPointAt(1))).toBeLessThan(1e-7);
    f.projection.apply(f.doc);
    expect(Array.from(f.ribbon.geometry.getAttribute('position').array)).toEqual(before);
  });
  it('moves declared road attachments, keeps background fixed and retains prior edits', async () => {
    const f = await setup();
    const before = f.sign.position.clone();
    const oldMatrix = new THREE.Matrix4();
    f.buildings.getMatrixAt(1, oldMatrix);
    requireValue(f.doc.road.controlPoints[3]).position[0] += 40;
    requireValue(f.doc.road.controlPoints[4]).widthMultiplier = 1.4;
    f.doc.road = updateRoadState(f.track, f.catalogue.baselineRoad, f.doc.road);
    const result = f.projection.apply(f.doc);
    expect(f.sign.position.distanceTo(before)).toBeGreaterThan(1);
    const m = new THREE.Matrix4();
    f.buildings.getMatrixAt(1, m);
    expect(m.toArray()).toEqual(oldMatrix.toArray());
    const first = f.sign.matrixWorld.toArray();
    f.projection.apply(f.doc);
    expect(f.sign.matrixWorld.toArray()).toEqual(first);
    expect(result.warnings.some((s) => /playable|junction|topology/i.test(s))).toBe(true);
    f.doc.road = cloneData(f.catalogue.baselineRoad);
    f.projection.apply(f.doc);
    expect(f.sign.position.distanceTo(before)).toBeLessThan(1e-5);
  });
  it('handles edits around the historical climbing repair without generating invalid numbers', async () => {
    const f = await setup();
    requireValue(f.doc.road.controlPoints[28]).position[0] -= 25;
    requireValue(f.doc.road.controlPoints[29]).position[1] += 12;
    f.doc.road = updateRoadState(f.track, f.catalogue.baselineRoad, f.doc.road);
    f.projection.apply(f.doc);
    expect(
      Array.from(f.ribbon.geometry.getAttribute('position').array).every(Number.isFinite),
    ).toBe(true);
    const paths = createEditedPaths(f.track, f.doc.road);
    const shortcut = requireValue(f.doc.road.shortcutPaths['waterfall-dive']);
    expect(
      new THREE.Vector3()
        .fromArray(requireValue(shortcut.points[0]))
        .distanceTo(paths.main.getPointAt(shortcut.entryProgress)),
    ).toBeLessThan(1e-5);
  });
  it('rejects zero widths and degenerate control points without changing the last valid projection', async () => {
    const f = await setup();
    const original = f.ribbon.geometry;
    requireValue(f.doc.road.controlPoints[0]).widthMultiplier = 0;
    expect(() => f.projection.apply(f.doc)).toThrow(/width/i);
    expect(f.ribbon.geometry).toBe(original);
    const state = cloneData(f.catalogue.baselineRoad);
    state.controlPoints.forEach((p) => {
      p.position = [0, 0, 0];
    });
    expect(() => createEditedPaths(f.track, state)).toThrow(/degenerate|length/i);
  });
});
