import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createEditorWorld, loadEditorAssets } from '../src/editor/neon-grid/EditorScene';
import { createEditorDocument } from '../src/editor/neon-grid/EditorDocument';
import { createEditedPaths } from '../src/editor/neon-grid/EditorRoad';
describe('primary editor world', () => {
  it('constructs the actual primary concrete/fog scene without starting a race', () => {
    const world = createEditorWorld();
    expect(world.root.userData.visualVariant).toBe('fog-experiment-c2-background');
    expect(world.root.userData.serviceTunnelMaterialVariant).toBe('concrete-coverage-c2-001');
    expect(world.root.getObjectByName('neon-grid-abyss-fog-v3-backdrop')).toBeDefined();
    expect(world.root.getObjectByName('billboard-hologram')).toBeDefined();
    expect(world.scene.fog).toBeInstanceOf(THREE.Fog);
    expect(world.scene.children.some((o) => o instanceof THREE.HemisphereLight)).toBe(true);
    const geometry = (world.root.getObjectByName('track-road') as THREE.Mesh).geometry;
    const dispose = vi.spyOn(geometry, 'dispose');
    world.dispose();
    world.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(world.scene.children).toHaveLength(0);
  });
  it('waits for every asset loader to settle and propagates a real failure', async () => {
    const calls: string[] = [];
    const loaders = ['billboard', 'skyline', 'undercity', 'tunnelWarnings'].map(
      (name) => () =>
        Promise.resolve().then(() => {
          calls.push(name);
          if (name === 'skyline') throw new Error('missing approved sign');
        }),
    );
    await expect(loadEditorAssets(loaders)).rejects.toThrow('missing approved sign');
    expect(calls.sort()).toEqual(['billboard', 'skyline', 'tunnelWarnings', 'undercity']);
  });
  it('lets editor-only fog reference the edited road and restores the exact source projection on undo', () => {
    const world = createEditorWorld(),
      original = world.track.projectMain.bind(world.track);
    const road = createEditorDocument({
      repository: '',
      runtimeSourceSha: '',
      editorBuildSha: '',
      selectors: { material: '', visual: '' },
      catalogueVersion: 1,
      catalogueHash: '',
    }).road;
    road.controlPoints.forEach((p) => {
      p.position[1] += 20;
    });
    const paths = createEditedPaths(world.track, road);
    world.setFogPaths(paths);
    expect(world.track.projectMain(paths.main.getPointAt(0.2)).point.y).toBeGreaterThan(20);
    world.setFogPaths(
      createEditedPaths(
        world.track,
        createEditorDocument({
          repository: '',
          runtimeSourceSha: '',
          editorBuildSha: '',
          selectors: { material: '', visual: '' },
          catalogueVersion: 1,
          catalogueHash: '',
        }).road,
      ),
    );
    expect(world.track.projectMain(new THREE.Vector3()).point.toArray()).toEqual(
      original(new THREE.Vector3()).point.toArray(),
    );
    world.dispose();
  });
});
