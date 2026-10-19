import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import * as trackCatalog from '../src/game/track/trackCatalog';

describe('Neon Grid owner layout selector', () => {
  it('preserves default and existing visual/material selectors when the layout key is absent or unknown', () => {
    const api = trackCatalog as unknown as Record<string, unknown>;
    const select = api.neonGridReviewSceneSelectionFromSearch as
      | ((search: string) => {
          ownerLayoutScreen: 'retained' | 'removed' | null;
          visualVariant: string;
          materialVariant: string;
        })
      | undefined;
    expect(typeof select).toBe('function');
    if (typeof select !== 'function') return;

    expect(select('')).toEqual({
      ownerLayoutScreen: null,
      visualVariant: 'approved',
      materialVariant: 'blockout',
    });
    expect(select('?neonGridLayout=unknown&neonGridVisual=abyss-fog-004&neonGridMaterial=service-tunnel-concrete-001'))
      .toEqual({
        ownerLayoutScreen: null,
        visualVariant: 'fog-experiment-v3-2',
        materialVariant: 'concrete-wall-007-c1',
      });
  });

  it('forces C2 concrete and Fog V3.2 in both screen states despite other visual or fog flags', () => {
    const api = trackCatalog as unknown as Record<string, unknown>;
    const select = api.neonGridReviewSceneSelectionFromSearch as
      | ((search: string) => {
          ownerLayoutScreen: 'retained' | 'removed' | null;
          visualVariant: string;
          materialVariant: string;
        })
      | undefined;
    expect(typeof select).toBe('function');
    if (typeof select !== 'function') return;

    for (const mode of ['retained', 'removed'] as const) {
      const selection = select(
        `?neonGridLayout=owner-2026-10-19&neonGridGapScreen=${mode}&neonGridVisual=abyss-fog-001&neonGridMaterial=service-tunnel-concrete-001&fog=0`,
      );
      expect(selection).toEqual({
        ownerLayoutScreen: mode,
        visualVariant: 'fog-experiment-c2-background',
        materialVariant: 'concrete-coverage-c2-001',
      });
      const scene = createNeonGridScene(
        new NeonGrid(),
        'medium',
        selection.visualVariant as Parameters<typeof createNeonGridScene>[2],
        selection.materialVariant as Parameters<typeof createNeonGridScene>[3],
      );
      try {
        expect(scene.userData.visualVariant).toBe('fog-experiment-c2-background');
        expect(scene.userData.serviceTunnelMaterialVariant).toBe('concrete-coverage-c2-001');
        const fogV32 = scene.userData.abyssFogV3_2 as { enabled?: boolean } | undefined;
        expect(fogV32?.enabled).toBe(true);
      } finally {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            const mesh = object as {
              geometry: THREE.BufferGeometry;
              material: THREE.Material | THREE.Material[];
            };
            mesh.geometry.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const material of materials) material.dispose();
          }
        });
      }
    }
  });
});
