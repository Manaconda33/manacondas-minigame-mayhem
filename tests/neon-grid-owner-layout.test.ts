import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import * as trackCatalog from '../src/game/track/trackCatalog';
import ownerLayout from '../src/game/track/neonGridOwnerLayout.json';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { createNeonGridScene } from '../src/game/track/createNeonGridScene';
import { disposeTrackScene } from '../src/game/track/TrackSceneResources';

const sourceFile =
  process.env.NEON_GRID_OWNER_LAYOUT_SOURCE ??
  path.resolve('docs/evidence/2026-10-19-neon-grid-owner-layout/owner-layout-export.json');
const normalizerFile = path.resolve('tools/prepare-neon-grid-owner-layout.mjs');
const scratch = mkdtempSync(path.join(tmpdir(), 'neon-grid-owner-layout-'));
const screenId =
  'Scene[0]/neon-grid-blockout[0]/skyline-visual[0]/skyline-deck-fascia::billboardGapWing[0]';

function authoredRangeMeshName(componentId: string): string {
  const marker = componentId.lastIndexOf('::');
  if (marker < 0) throw new Error(`Not an authored range ID: ${componentId}`);
  return componentId.slice(0, marker).slice(componentId.slice(0, marker).lastIndexOf('/') + 1);
}

afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

describe('Neon Grid owner layout handoff', () => {
  it('verifies the handoff and emits a deterministic source-pinned runtime payload', () => {
    const firstOutput = path.join(scratch, 'first.json');
    const first = spawnSync(process.execPath, [normalizerFile, sourceFile, firstOutput], {
      encoding: 'utf8',
    });
    expect(first.status, first.stderr || first.stdout).toBe(0);

    const sourceBytes = readFileSync(sourceFile, 'utf8');
    const outputBytes = readFileSync(firstOutput, 'utf8');
    expect(createHash('sha256').update(outputBytes).digest('hex')).toBe(
      '983a282ead80cabc1a3faae0f062d12677d8c4e0514cf5882655c6f1907be0f9',
    );
    const normalized = JSON.parse(outputBytes) as {
      schemaVersion: number;
      sourceSha256: string;
      baseline: { runtimeSourceSha: string; editorBuildSha: string; selectors: Record<string, string> };
      sourceCounts: { components: number; overrides: number; projectionBindings: number; actions: number; deleted: number };
      baselineRoad: { controlPoints: unknown[]; shortcutPaths: Record<string, unknown> };
      components: { id: string; baselineMatrix: number[]; matrix: number[]; deleted: boolean }[];
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
      [...normalized.components.map((component) => component.id)].sort(),
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

  it('resolves every exported component to its exact C2 source path, instance, range, geometry, and world matrix', async () => {
    const api = trackCatalog as unknown as Record<string, unknown>;
    const resolve = api.resolveNeonGridOwnerLayoutSourceMap as
      | ((scene: THREE.Object3D, components: readonly unknown[]) => Promise<Map<string, {
          kind: 'object' | 'instance' | 'range';
          object: THREE.Mesh;
          indexRange: readonly [number, number] | null;
          baselineWorld: THREE.Matrix4;
        }>>)
      | undefined;
    expect(typeof resolve).toBe('function');
    if (typeof resolve !== 'function') return;

    const root = new THREE.Scene();
    root.add(createNeonGridScene(
      new NeonGrid(),
      'medium',
      'fog-experiment-c2-background',
      'concrete-coverage-c2-001',
    ));
    root.updateMatrixWorld(true);
    try {
      const mapped = await resolve(root, ownerLayout.components);
      expect(mapped.size).toBe(1331);
      expect([...mapped.keys()].sort()).toEqual(ownerLayout.components.map((component) => component.id).sort());
      expect([...mapped.values()].filter((component) => component.kind === 'range')).toHaveLength(106);
      for (const record of ownerLayout.components) {
        const source = mapped.get(record.id);
        expect(source, `source mapping missing ${record.id}`).toBeDefined();
        expect(
          source?.baselineWorld.toArray().every((value, index) =>
            Math.abs(value - (record.baselineMatrix[index] ?? Number.NaN)) <= 1e-8,
          ),
          `world matrix mismatch ${record.id}`,
        ).toBe(true);
        expect(source?.indexRange, `authored range mismatch ${record.id}`).toEqual(record.indexRange);
      }
      const firstComponent = ownerLayout.components[0];
      if (!firstComponent) throw new Error('The owner layout must include a source component.');
      await expect(resolve(root, [firstComponent, firstComponent])).rejects.toThrow(
        firstComponent.id,
      );
      await expect(resolve(root, [{ ...firstComponent, id: 'missing-owner-component' }])).rejects.toThrow(
        'missing-owner-component',
      );
    } finally {
      disposeTrackScene(root);
    }
  });

  it('applies the retained-screen layout to visuals without changing road or collision inputs', async () => {
    const api = trackCatalog as unknown as Record<string, unknown>;
    const apply = api.applyNeonGridOwnerLayout as
      | ((scene: THREE.Object3D, screen: 'retained' | 'removed') => Promise<{
          matchedIds: string[];
          changedIds: string[];
          deletedIds: string[];
          screen: 'retained' | 'removed';
          meshCountBefore: number;
          meshCountAfter: number;
        }>)
      | undefined;
    expect(typeof apply).toBe('function');
    if (typeof apply !== 'function') return;

    const track = new NeonGrid();
    const root = new THREE.Scene();
    root.add(createNeonGridScene(
      track,
      'medium',
      'fog-experiment-c2-background',
      'concrete-coverage-c2-001',
    ));
    root.updateMatrixWorld(true);
    const positions = (geometry: THREE.BufferGeometry) =>
      Array.from(geometry.getAttribute('position').array);
    const indices = (geometry: THREE.BufferGeometry) => Array.from(geometry.index?.array ?? []);
    const mainRoad = root.getObjectByName('track-road') as THREE.Mesh;
    const roadBefore = { positions: positions(mainRoad.geometry), indices: indices(mainRoad.geometry) };
    const ground = root.getObjectByName('falls-run-extension-city-terraced-ground') as THREE.Mesh;
    const groundBefore = {
      positionCount: ground.geometry.getAttribute('position').count,
      indexCount: ground.geometry.index?.count ?? 0,
    };
    const cityGroundRangeMeshes = [
      'skyline-deck-fascia',
      'undercity-wallside-sightline-screens',
      'falls-run-city-terraced-ground',
      'falls-run-extension-city-terraced-ground',
    ].map((name) => {
      const mesh = root.getObjectByName(name) as THREE.Mesh | undefined;
      expect(mesh, `expected source mesh for authored city-ground range ${name}`).toBeInstanceOf(THREE.Mesh);
      return { name, mesh, indexCount: mesh?.geometry.index?.count ?? 0 };
    });
    const deletedGroundIndexCounts = new Map(cityGroundRangeMeshes.map(({ name }) => [
      name,
      ownerLayout.components
        .filter((component) => component.deleted && component.id.endsWith('::cityGround[0]') &&
          component.indexRange !== null && authoredRangeMeshName(component.id) === name)
        .reduce((count, component) => count + (component.indexRange?.[1] ?? 0), 0),
    ]));
    const deletedGroundIndexCount = deletedGroundIndexCounts.get(ground.name) ?? 0;
    const transformedRangeIds = [
      'Scene[0]/neon-grid-blockout[0]/skyline-visual[0]/skyline-deck-fascia::cityFoundations/0[0]',
      'Scene[0]/neon-grid-blockout[0]/falls-run-visual[0]/falls-run-city-terraced-ground::cityFoundations/0[0]',
      'Scene[0]/neon-grid-blockout[0]/falls-run-visual[0]/falls-run-city-terraced-ground::cityTowers/0[0]',
      'Scene[0]/neon-grid-blockout[0]/falls-run-extension-visual[0]/falls-run-extension-city-terraced-ground::cityTowers/0[0]',
      'Scene[0]/neon-grid-blockout[0]/falls-run-extension-visual[0]/falls-run-extension-city-terraced-ground::cityFoundations/0[0]',
    ];
    const transformedRangeChecks = transformedRangeIds.map((id) => {
      const record = ownerLayout.components.find((component) => component.id === id);
      const mesh = root.getObjectByName(authoredRangeMeshName(id)) as THREE.Mesh | undefined;
      expect(record?.indexRange, `expected indexed source range ${id}`).not.toBeNull();
      expect(mesh, `expected source mesh for ${id}`).toBeInstanceOf(THREE.Mesh);
      return { record, sourceGeometry: mesh?.geometry.clone() };
    });
    const routeBefore = {
      main: track.samples.map((point) => point.toArray()),
      tunnel: Array.from({ length: 65 }, (_, index) =>
        track.serviceTunnel.curve.getPointAt(index / 64).toArray(),
      ),
      billboard: Array.from({ length: 65 }, (_, index) =>
        track.billboardGap.curve.getPointAt(index / 64).toArray(),
      ),
      dive: Array.from({ length: 65 }, (_, index) =>
        track.waterfallDive.pointAtDistance((track.waterfallDive.length * index) / 64).toArray(),
      ),
      ramp: positions(track.waterfallDive.rampGeometry),
      landing: positions(track.waterfallDive.landingGeometry),
    };
    const report = await apply(root, 'retained');
    try {
      expect(report.screen).toBe('retained');
      expect(report.matchedIds).toHaveLength(1331);
      expect(report.meshCountAfter).toBe(report.meshCountBefore);
      expect(report.deletedIds).toHaveLength(6);
      expect(report.deletedIds).not.toContain(
        screenId,
      );
      expect(report.deletedIds).toEqual(expect.arrayContaining([
        'Scene[0]/neon-grid-blockout[0]/waterfall-dive[0]/dive-waterway-banks[0]',
        'Scene[0]/neon-grid-blockout[0]/waterfall-dive[0]/dive-waterway[0]',
        'Scene[0]/neon-grid-blockout[0]/skyline-visual[0]/skyline-deck-fascia::cityGround[0]',
        'Scene[0]/neon-grid-blockout[0]/undercity-visual[0]/undercity-wallside-sightline-screens::cityGround[0]',
        'Scene[0]/neon-grid-blockout[0]/falls-run-visual[0]/falls-run-city-terraced-ground::cityGround[0]',
        'Scene[0]/neon-grid-blockout[0]/falls-run-extension-visual[0]/falls-run-extension-city-terraced-ground::cityGround[0]',
      ]));
      expect(report.changedIds).toContain(
        'Scene[0]/neon-grid-blockout[0]/billboard-hologram[0]/billboard-portal-exit[0]/billboard-exit-ad-arin[0]',
      );
      const movedAd = root.getObjectByName('billboard-exit-ad-arin');
      const movedRecord = ownerLayout.components.find((component) => component.id.endsWith('/billboard-exit-ad-arin[0]'));
      expect(movedAd).toBeDefined();
      expect(movedRecord).toBeDefined();
      root.updateMatrixWorld(true);
      expect(movedAd?.matrixWorld.toArray().every((value, index) =>
        Math.abs(value - (movedRecord?.matrix[index] ?? Number.NaN)) <= 1e-8,
      )).toBe(true);
      expect(ground.geometry.getAttribute('position').count).toBeGreaterThan(groundBefore.positionCount);
      expect(deletedGroundIndexCount).toBeGreaterThan(0);
      expect(ground.geometry.index?.count).toBe(groundBefore.indexCount - deletedGroundIndexCount);
      for (const cityGround of cityGroundRangeMeshes) {
        expect(cityGround.mesh?.geometry.index?.count,
          `${cityGround.name} must remove its authored city-ground range and preserve other ranges`,
        ).toBe(cityGround.indexCount - (deletedGroundIndexCounts.get(cityGround.name) ?? 0));
        expect(cityGround.mesh?.geometry.index?.count).toBeGreaterThan(0);
      }
      for (const { record, sourceGeometry } of transformedRangeChecks) {
        if (!record?.indexRange || !sourceGeometry?.index) {
          throw new Error('The representative transformed building range is incomplete.');
        }
        const mesh = root.getObjectByName(authoredRangeMeshName(record.id)) as THREE.Mesh;
        const actualIndex = mesh.geometry.index;
        if (!actualIndex) throw new Error('The transformed building mesh has no index buffer.');
        const sourcePosition = sourceGeometry.getAttribute('position');
        const actualPosition = mesh.geometry.getAttribute('position');
        const sourceStart = record.indexRange[0];
        const indexCount = record.indexRange[1];
        if (sourceStart === undefined || indexCount === undefined) {
          throw new Error('The representative transformed building range has invalid indices.');
        }
        const removedBefore = ownerLayout.components
          .filter((component) => {
            const rangeStart = component.indexRange?.[0];
            const rangeCount = component.indexRange?.[1];
            return component.deleted && component.id.includes('::') && component.id !== screenId &&
              authoredRangeMeshName(component.id) === mesh.name &&
              rangeStart !== undefined && rangeCount !== undefined &&
              rangeStart + rangeCount <= sourceStart;
          })
          .reduce((count, component) => count + (component.indexRange?.[1] ?? 0), 0);
        const actualStart = sourceStart - removedBefore;
        const expectedTransform = new THREE.Matrix4()
          .fromArray([...record.baselineMatrix])
          .invert()
          .multiply(new THREE.Matrix4().fromArray([...record.matrix]));
        const [m0, m1, m2, , m4, m5, m6, , m8, m9, m10, , m12, m13, m14] = expectedTransform.elements;
        let maximumError = 0;
        for (let offset = 0; offset < indexCount; offset++) {
          const sourceVertex = sourceGeometry.index.getX(sourceStart + offset);
          const actualVertex = actualIndex.getX(actualStart + offset);
          const x = sourcePosition.getX(sourceVertex);
          const y = sourcePosition.getY(sourceVertex);
          const z = sourcePosition.getZ(sourceVertex);
          const expectedX = x * m0 + y * m4 + z * m8 + m12;
          const expectedY = x * m1 + y * m5 + z * m9 + m13;
          const expectedZ = x * m2 + y * m6 + z * m10 + m14;
          const error = Math.hypot(
            actualPosition.getX(actualVertex) - expectedX,
            actualPosition.getY(actualVertex) - expectedY,
            actualPosition.getZ(actualVertex) - expectedZ,
          );
          maximumError = Math.max(maximumError, error);
        }
        expect(maximumError, `${record.id} transformed range`).toBeLessThan(1e-4);
      }
      expect(ground.geometry.groups.every((group) => group.start >= 0 &&
        group.count >= 0 && group.start + group.count <= (ground.geometry.index?.count ?? 0))).toBe(true);
      expect(positions(mainRoad.geometry)).toEqual(roadBefore.positions);
      expect(indices(mainRoad.geometry)).toEqual(roadBefore.indices);
      expect({
        main: track.samples.map((point) => point.toArray()),
        tunnel: Array.from({ length: 65 }, (_, index) =>
          track.serviceTunnel.curve.getPointAt(index / 64).toArray(),
        ),
        billboard: Array.from({ length: 65 }, (_, index) =>
          track.billboardGap.curve.getPointAt(index / 64).toArray(),
        ),
        dive: Array.from({ length: 65 }, (_, index) =>
          track.waterfallDive.pointAtDistance((track.waterfallDive.length * index) / 64).toArray(),
        ),
        ramp: positions(track.waterfallDive.rampGeometry),
        landing: positions(track.waterfallDive.landingGeometry),
      }).toEqual(routeBefore);
    } finally {
      for (const { sourceGeometry } of transformedRangeChecks) sourceGeometry?.dispose();
      disposeTrackScene(root);
    }
  });

  it('keeps Falls Run extension windows attached to authored tower transforms', async () => {
    const api = trackCatalog as unknown as Record<string, unknown>;
    const apply = api.applyNeonGridOwnerLayout as
      | ((scene: THREE.Object3D, screen: 'retained' | 'removed') => Promise<unknown>)
      | undefined;
    expect(typeof apply).toBe('function');
    if (typeof apply !== 'function') return;

    const root = new THREE.Scene();
    root.add(createNeonGridScene(
      new NeonGrid(),
      'medium',
      'fog-experiment-c2-background',
      'concrete-coverage-c2-001',
    ));
    try {
      root.updateMatrixWorld(true);
      const windows = root.getObjectByName('falls-run-extension-city-windows') as THREE.InstancedMesh;
      const towers = root.getObjectByName('falls-run-extension-city-towers') as THREE.InstancedMesh;
      const ground = root.getObjectByName('falls-run-extension-city-terraced-ground') as THREE.Mesh;
      expect(windows).toBeInstanceOf(THREE.InstancedMesh);
      expect(towers).toBeInstanceOf(THREE.InstancedMesh);
      expect(ground).toBeInstanceOf(THREE.Mesh);
      const towerIndices = windows.userData.ownerLayoutTowerIndices as number[];
      expect(towerIndices).toHaveLength(windows.count);

      const towerRange = ownerLayout.components.find((component) =>
        component.id.includes('falls-run-extension-visual') &&
        component.id.includes('::cityTowers/0[0]'),
      );
      expect(towerRange?.indexRange).not.toBeNull();
      if (!towerRange?.indexRange) throw new Error('Expected the first authored tower geometry range.');
      const rangeStart = towerRange.indexRange[0];
      const rangeCount = towerRange.indexRange[1];
      if (rangeStart === undefined || rangeCount === undefined)
        throw new Error('Expected a complete authored tower geometry range.');
      const sourceIndices = ground.geometry.getIndex();
      const sourcePositions = ground.geometry.getAttribute('position');
      if (!sourceIndices) throw new Error('Expected indexed Falls Run extension ground geometry.');
      const originalPositionCount = sourcePositions.count;
      const rangeDelta = new THREE.Matrix4()
        .fromArray(towerRange.baselineMatrix)
        .invert()
        .multiply(new THREE.Matrix4().fromArray(towerRange.matrix));
      const expectedTowerVertices = Array.from({ length: rangeCount }, (_, offset) =>
        new THREE.Vector3()
          .fromBufferAttribute(sourcePositions, sourceIndices.getX(rangeStart + offset))
          .applyMatrix4(rangeDelta),
      );

      await apply(root, 'retained');
      root.updateMatrixWorld(true);

      const renderedPositions = ground.geometry.getAttribute('position');
      expectedTowerVertices.filter((_, offset) => offset % 19 === 0).forEach((expected) => {
        let closest = Number.POSITIVE_INFINITY;
        for (let vertexIndex = originalPositionCount; vertexIndex < renderedPositions.count; vertexIndex++) {
          const candidate = new THREE.Vector3().fromBufferAttribute(renderedPositions, vertexIndex);
          closest = Math.min(closest, candidate.distanceTo(expected));
        }
        expect(closest, 'the owner-authored tower transform must remain applied').toBeLessThan(1e-5);
      });

      let rotatedWindowCount = 0;
      for (let instanceIndex = 0; instanceIndex < windows.count; instanceIndex++) {
        const record = ownerLayout.components.find((component) =>
          component.id.endsWith(`/falls-run-extension-city-windows[0]/instance/${String(instanceIndex)}`),
        );
        expect(record, `missing exported window instance ${String(instanceIndex)}`).toBeDefined();
        if (!record) continue;
        const towerIndex = towerIndices[instanceIndex];
        expect(towerIndex).toBeDefined();
        if (towerIndex === undefined) continue;

        const towerLocal = new THREE.Matrix4();
        towers.getMatrixAt(towerIndex, towerLocal);
        const towerWorld = towers.matrixWorld.clone().multiply(towerLocal);
        const pivot = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        towerWorld.decompose(pivot, rotation, scale);
        if (Math.abs(rotation.angleTo(new THREE.Quaternion())) > 1e-8) rotatedWindowCount++;

        const correction = new THREE.Matrix4()
          .makeTranslation(pivot.x, pivot.y, pivot.z)
          .multiply(new THREE.Matrix4().makeRotationFromQuaternion(rotation))
          .multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
        const baseline = new THREE.Matrix4().fromArray(record.baselineMatrix);
        const ownerDelta = new THREE.Matrix4().fromArray(record.matrix)
          .multiply(baseline.clone().invert());
        const actualLocal = new THREE.Matrix4();
        windows.getMatrixAt(instanceIndex, actualLocal);
        const actualWorld = windows.matrixWorld.clone().multiply(actualLocal);
        const towerRecord = ownerLayout.components.find((component) =>
          component.id.includes('/falls-run-extension-visual[0]/') &&
          component.id.endsWith(`::cityTowers/${String(towerIndex)}[0]`),
        );
        expect(towerRecord, `missing authored tower range ${String(towerIndex)}`).toBeDefined();
        if (!towerRecord) continue;
        const towerDelta = new THREE.Matrix4().fromArray([...towerRecord.matrix])
          .multiply(new THREE.Matrix4().fromArray([...towerRecord.baselineMatrix]).invert());
        expect(towerDelta.toArray().every((value, index) =>
          Math.abs(value - (ownerDelta.elements[index] ?? Number.NaN)) <= 1e-5,
        ), `window ${String(instanceIndex)} must retain the same authored transform as tower ${String(towerIndex)}`,
        ).toBe(true);
        const towerGeometryPositions = towers.geometry.getAttribute('position');
        const editedTowerBounds = new THREE.Box3();
        for (let vertexIndex = 0; vertexIndex < towerGeometryPositions.count; vertexIndex++) {
          editedTowerBounds.expandByPoint(new THREE.Vector3()
            .fromBufferAttribute(towerGeometryPositions, vertexIndex)
            .applyMatrix4(towerWorld)
            .applyMatrix4(towerDelta));
        }
        const windowCenter = new THREE.Vector3().setFromMatrixPosition(actualWorld);
        expect(editedTowerBounds.distanceToPoint(windowCenter),
          `window ${String(instanceIndex)} must sit against edited tower ${String(towerIndex)}`,
        ).toBeLessThan(0.75);
        const expectedAttachedWorld = towerDelta.multiply(correction).multiply(baseline);
        expect(actualWorld.toArray().every((value, index) =>
          Math.abs(value - (expectedAttachedWorld.elements[index] ?? Number.NaN)) <= 1e-5,
        ), `window ${String(instanceIndex)} must follow its tower`).toBe(true);
      }
      expect(rotatedWindowCount).toBeGreaterThan(0);
    } finally {
      disposeTrackScene(root);
    }
  });

  it('removes only the Billboard Gap screen for layout B while preserving the same underlying C2/Fog edits', async () => {
    const api = trackCatalog as unknown as Record<string, unknown>;
    const apply = api.applyNeonGridOwnerLayout as
      | ((scene: THREE.Object3D, screen: 'retained' | 'removed') => Promise<{
          changedIds: string[];
          deletedIds: string[];
          meshCountBefore: number;
          meshCountAfter: number;
        }>)
      | undefined;
    expect(typeof apply).toBe('function');
    if (typeof apply !== 'function') return;

    const root = new THREE.Scene();
    root.add(createNeonGridScene(
      new NeonGrid(),
      'medium',
      'fog-experiment-c2-background',
      'concrete-coverage-c2-001',
    ));
    const screen = ownerLayout.components.find((component) => component.id === screenId);
    const screenMesh = root.getObjectByName('skyline-deck-fascia') as THREE.Mesh;
    const screenIndexCountBefore = screenMesh.geometry.index?.count ?? 0;
    const deletedFasciaIndexCount = ownerLayout.components
      .filter((component) => component.deleted && component.indexRange !== null &&
        authoredRangeMeshName(component.id) === 'skyline-deck-fascia')
      .reduce((count, component) => count + (component.indexRange?.[1] ?? 0), 0);
    expect(deletedFasciaIndexCount).toBeGreaterThan(screen?.indexRange?.[1] ?? 0);
    const report = await apply(root, 'removed');
    try {
      expect(report.deletedIds).toHaveLength(7);
      expect(report.deletedIds).toContain(screenId);
      expect(report.deletedIds).toContain(
        'Scene[0]/neon-grid-blockout[0]/waterfall-dive[0]/dive-waterway-banks[0]',
      );
      expect(report.deletedIds).toContain(
        'Scene[0]/neon-grid-blockout[0]/waterfall-dive[0]/dive-waterway[0]',
      );
      expect(report.deletedIds.filter((id) => id.includes('::cityGround[0]'))).toHaveLength(4);
      expect(report.changedIds).toContain(screenId);
      expect(report.meshCountAfter).toBe(report.meshCountBefore);
      expect(screenMesh.geometry.index?.count).toBe(
        screenIndexCountBefore - deletedFasciaIndexCount,
      );
    } finally {
      disposeTrackScene(root);
    }
  });
});
