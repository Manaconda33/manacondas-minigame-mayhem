import { requireValue } from '../src/editor/neon-grid/EditorDocument';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { buildCatalogue } from '../src/editor/neon-grid/ComponentCatalogue';
import { NeonGrid } from '../src/game/track/NeonGrid';
function fixture() {
  const root = new THREE.Group();
  root.name = 'neon-grid-blockout';
  const undercity = new THREE.Group();
  undercity.name = 'undercity-visual';
  root.add(undercity);
  const buildings = new THREE.InstancedMesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
    2,
  );
  buildings.name = 'undercity-city-buildings';
  const industrial = new THREE.InstancedMesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
    12,
  );
  industrial.name = 'undercity-industrial-architecture';
  industrial.userData.partRanges = {
    foundations: { start: 0, count: 2 },
    roofPlants: { start: 2, count: 4 },
    facadeRibs: { start: 6, count: 4 },
    loadingBays: { start: 10, count: 2 },
  };
  for (const mesh of [buildings, industrial])
    for (let i = 0; i < mesh.count; i++)
      mesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(i * 4, 0, 0));
  undercity.add(buildings, industrial);
  return { root, buildings, industrial };
}
describe('source-pinned component catalogue', () => {
  it('assigns stable source IDs independently of Three UUIDs', async () => {
    const a = await buildCatalogue(fixture().root, new NeonGrid());
    const b = await buildCatalogue(fixture().root, new NeonGrid());
    expect(a.entries).toEqual(b.entries);
    expect(a.hash).toBe(b.hash);
    expect(a.entries).toHaveLength(14);
    expect(a.entries.every((e) => e.sector === 'Undercity')).toBe(true);
    expect(
      a.entries.every(
        (e) => e.materials.length === 1 && e.materials[0]?.type === 'MeshBasicMaterial',
      ),
    ).toBe(true);
    expect(new Set(a.entries.map((e) => e.id)).size).toBe(14);
    expect(a.entries.every((e) => e.sourceFile === 'src/game/track/UndercityVisual.ts')).toBe(true);
  });
  it('preserves source matrices and maps industrial parts to their exact building', async () => {
    const { root, buildings } = fixture();
    const c = await buildCatalogue(root, new NeonGrid());
    const building = requireValue(
      c.entries.find(
        (e) => e.scenePath.includes('undercity-city-buildings') && e.sourceOrdinal === 0,
      ),
    );
    const members = requireValue(c.groups[requireValue(building.groupId)]);
    expect(members).toHaveLength(7);
    expect(members).toContain(building.id);
    const roof = requireValue(
      c.entries.find((e) => e.scenePath.includes('industrial') && e.sourceOrdinal === 2),
    );
    expect(members).toContain(roof.id);
    const neighbour = requireValue(
      c.entries.find((e) => e.scenePath.includes('city-buildings') && e.sourceOrdinal === 1),
    );
    expect(members).not.toContain(neighbour.id);
    const matrix = new THREE.Matrix4();
    buildings.getMatrixAt(1, matrix);
    expect(c.components.get(neighbour.id)?.baselineWorld.toArray()).toEqual(matrix.toArray());
  });
  it('distinguishes duplicate named paths and fingerprints altered geometry', async () => {
    const { root } = fixture();
    const a = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    a.name = 'track-road';
    const b = a.clone();
    root.add(a, b);
    const c = await buildCatalogue(root, new NeonGrid());
    expect(
      c.entries.filter((e) => e.sourceSymbol === 'createNeonGridScene').map((e) => e.id),
    ).toHaveLength(2);
    const originalHash = c.hash;
    b.geometry = b.geometry.clone().scale(2, 1, 1);
    expect((await buildCatalogue(root, new NeonGrid())).hash).not.toBe(originalHash);
  });
  it('labels unresolved merged internals as combined and unknown source as inspect-only', async () => {
    const root = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    mesh.name = 'skyline-deck-fascia';
    root.add(mesh);
    const unknown = mesh.clone();
    unknown.name = 'unexpected-family';
    root.add(unknown);
    const c = await buildCatalogue(root, new NeonGrid());
    expect(c.entries).toHaveLength(1);
    expect(c.entries[0]?.label).toContain('combined');
    expect(c.coverage.unregistered).toContain('unexpected-family');
  });
});
