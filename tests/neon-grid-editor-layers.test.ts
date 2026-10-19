import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { mergeInstancedCityMeshesIntoGround } from '../src/game/track/NeonGridCityGround';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { buildCatalogue } from '../src/editor/neon-grid/ComponentCatalogue';
import { EditorProjection } from '../src/editor/neon-grid/EditorProjection';
import { createEditorDocument, requireValue } from '../src/editor/neon-grid/EditorDocument';
import { createAtmosphereLayer } from '../src/editor/neon-grid/EditorAtmosphere';

function city() {
  const root = new THREE.Group();
  root.name = 'falls-run-visual';
  const geometry = new THREE.BoxGeometry(30, 1, 30);
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(
      new Float32Array(geometry.getAttribute('position').count * 3).fill(1),
      3,
    ),
  );
  const ground = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true }));
  ground.name = 'falls-run-city-terraced-ground';
  const towers = new THREE.InstancedMesh(
    new THREE.BoxGeometry(3, 10, 3),
    new THREE.MeshBasicMaterial(),
    2,
  );
  towers.name = 'falls-run-city-towers';
  const foundations = new THREE.InstancedMesh(
    new THREE.BoxGeometry(4, 2, 4),
    new THREE.MeshBasicMaterial(),
    2,
  );
  foundations.name = 'falls-run-city-foundations';
  for (let i = 0; i < 2; i++) {
    towers.setMatrixAt(i, new THREE.Matrix4().makeTranslation(i * 10, 7, 0));
    foundations.setMatrixAt(i, new THREE.Matrix4().makeTranslation(i * 10, 1, 0));
  }
  root.add(ground, towers, foundations);
  mergeInstancedCityMeshesIntoGround(ground, [foundations, towers]);
  return { root, ground };
}

describe('independent city and atmosphere layers', () => {
  it('separates baked Falls Run floors, individual towers and foundations without losing triangles', async () => {
    const { root, ground } = city();
    const triangles = requireValue(ground.geometry.index).count;
    const c = await buildCatalogue(root, new NeonGrid());
    expect(c.entries.filter((e) => e.scenePath.includes('::cityGround'))).toHaveLength(1);
    expect(c.entries.filter((e) => e.scenePath.includes('::cityTowers/'))).toHaveLength(2);
    expect(c.entries.filter((e) => e.scenePath.includes('::cityFoundations/'))).toHaveLength(2);
    expect(
      [...c.components.values()].reduce(
        (n, p) => n + requireValue(p.object.geometry.index).count,
        0,
      ),
    ).toBe(triangles);
    expect(c.entries.find((e) => e.scenePath.includes('::cityGround'))?.groupId).toBeNull();
    expect(c.groups['falls-run/building/0']).toHaveLength(2);
    expect(c.groups['falls-run/building/1']).toHaveLength(2);
  });

  it('moves one tower independently while keeping the ground and neighbouring building fixed', async () => {
    const { root } = city(),
      track = new NeonGrid();
    const c = await buildCatalogue(root, track),
      projection = new EditorProjection(c, track);
    const d = createEditorDocument({
      repository: '',
      runtimeSourceSha: '',
      editorBuildSha: '',
      selectors: { material: '', visual: '' },
      catalogueVersion: 1,
      catalogueHash: c.hash,
    });
    d.road = c.baselineRoad;
    const tower = requireValue(c.entries.find((e) => e.scenePath.includes('::cityTowers/0')));
    const before = new Map(
      [...c.components].map(([id, part]) => [id, part.baselineWorld.toArray()]),
    );
    d.overrides[tower.id] = {
      matrix: new THREE.Matrix4()
        .makeTranslation(5, 0, 0)
        .multiply(new THREE.Matrix4().fromArray(tower.baselineMatrix))
        .toArray(),
      deleted: false,
    };
    projection.apply(d);
    expect(projection.matrixFor(tower.id).elements[12]).toBe(5);
    for (const [id, matrix] of before)
      if (id !== tower.id) expect(projection.matrixFor(id).toArray()).toEqual(matrix);
    projection.dispose();
  });

  it('toggles fog as its own layer without changing any geometry or building transform', () => {
    const scene = new THREE.Scene(),
      root = new THREE.Group();
    const fog = new THREE.Fog(0x10192b, 180, 650);
    scene.fog = fog;
    const backdrop = new THREE.Group();
    backdrop.name = 'neon-grid-abyss-fog-v3';
    const material = new THREE.MeshBasicMaterial();
    material.userData.abyssVerticalFog = true;
    const uniform = { value: 0.9 };
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uAbyssFogV3MaximumBlend = uniform;
    };
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
    root.add(mesh, backdrop);
    scene.add(root);
    const positions = Array.from(mesh.geometry.getAttribute('position').array),
      matrix = mesh.matrix.toArray();
    const layer = createAtmosphereLayer(scene, root);
    layer.setVisible(false);
    material.onBeforeCompile(
      { uniforms: {} } as THREE.WebGLProgramParametersWithUniforms,
      {} as THREE.WebGLRenderer,
    );
    expect(uniform.value).toBe(0);
    expect(scene.fog).toBeNull();
    expect(backdrop.visible).toBe(false);
    expect(mesh.visible).toBe(true);
    expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(positions);
    expect(mesh.matrix.toArray()).toEqual(matrix);
    layer.setVisible(true);
    expect(uniform.value).toBe(0.9);
    expect(scene.fog).toBe(fog);
    expect(backdrop.visible).toBe(true);
    layer.dispose();
  });
});
