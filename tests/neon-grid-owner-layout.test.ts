import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const sourceFile =
  process.env.NEON_GRID_OWNER_LAYOUT_SOURCE ??
  path.resolve('docs/evidence/2026-10-19-neon-grid-owner-layout/owner-layout-export.json');
const normalizerFile = path.resolve('tools/prepare-neon-grid-owner-layout.mjs');
const scratch = mkdtempSync(path.join(tmpdir(), 'neon-grid-owner-layout-'));

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('Neon Grid owner layout handoff', () => {
  it('verifies the handoff and emits a deterministic source-pinned runtime payload', () => {
    const firstOutput = path.join(scratch, 'first.json');
    const first = spawnSync(process.execPath, [normalizerFile, sourceFile, firstOutput], {
      encoding: 'utf8',
    });
    expect(first.status, first.stderr || first.stdout).toBe(0);

    const sourceBytes = readFileSync(sourceFile);
    const outputBytes = readFileSync(firstOutput);
    expect(createHash('sha256').update(outputBytes).digest('hex')).toBe(
      '983a282ead80cabc1a3faae0f062d12677d8c4e0514cf5882655c6f1907be0f9',
    );
    const normalized = JSON.parse(outputBytes.toString('utf8')) as {
      schemaVersion: number;
      sourceSha256: string;
      baseline: { runtimeSourceSha: string; editorBuildSha: string; selectors: Record<string, string> };
      sourceCounts: { components: number; overrides: number; projectionBindings: number; actions: number; deleted: number };
      baselineRoad: { controlPoints: unknown[]; shortcutPaths: Record<string, unknown> };
      components: Array<{ id: string; baselineMatrix: number[]; matrix: number[]; deleted: boolean }>;
      integrity: { verified: boolean; digests: Record<string, string> };
    };

    expect(createHash('sha256').update(sourceBytes).digest('hex')).toBe(
      '2f48eea9e634f1f371525c458d9509b8e3f0900a3cf7981b3f5e9f8e5aae1240',
    );
    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.sourceSha256).toBe(
      '2f48eea9e634f1f371525c458d9509b8e3f0900a3cf7981b3f5e9f8e5aae1240',
    );
    expect(normalized.baseline).toEqual({
      runtimeSourceSha: 'addab4c7c2421f52c4731691b8a9f3e2d9e39f94',
      editorBuildSha: '4182fb797aa232d6cf38651beb9b017efd0c3f4f',
      catalogueVersion: 2,
      catalogueHash: 'c6cbe7f024182e372ccbe3797490d8475c6eca47e49616fcb7f5b840309d349d',
      selectors: {
        material: 'concrete-coverage-c2-001',
        visual: 'c2-task-a-fog-overlay',
      },
    });
    expect(normalized.sourceCounts).toEqual({
      components: 1331,
      overrides: 985,
      projectionBindings: 371,
      actions: 110,
      deleted: 7,
    });
    expect(normalized.baselineRoad.controlPoints).toHaveLength(34);
    expect(Object.keys(normalized.baselineRoad.shortcutPaths)).toEqual([
      'service-tunnel',
      'billboard-gap',
      'waterfall-dive',
    ]);
    expect(normalized.components).toHaveLength(1331);
    expect(new Set(normalized.components.map((component) => component.id)).size).toBe(1331);
    expect(normalized.components.map((component) => component.id)).toEqual(
      normalized.components.map((component) => component.id).toSorted(),
    );
    expect(normalized.components.every((component) =>
      [...component.baselineMatrix, ...component.matrix].every(Number.isFinite),
    )).toBe(true);
    expect(normalized.components.filter((component) => component.deleted)).toHaveLength(7);
    expect(normalized.integrity).toEqual({
      verified: true,
      digests: {
        baseline: 'c1aa792c5f3a3ecbbe43784d4d03e907edbb5f994d98607bc13ea61b76da8701',
        design: 'db881465ccd5a1d884761b9557b7213c9d2037658548502945f052a712e0ca95',
        document: '8207b672fcf1864bdd55657a85710bd0c0d75060ef7f4e5876e5d0cdf0430e8a',
        projection: 'e876483e7af6c4e45b94499c7f028bf49575a9a38510374fb759f74717e2fd14',
      },
    });
  });
});
