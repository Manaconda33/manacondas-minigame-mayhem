import { describe, expect, it } from 'vitest';
import {
  OWNER_LAYOUT_CAPTURE_COVERAGE,
  OWNER_LAYOUT_NONSCREEN_DELETED_IDS,
  OWNER_LAYOUT_SCREEN_ID,
  validateOwnerLayoutCapture,
} from '../tools/diagnostics/neon-grid-owner-layout-capture-schema.mjs';

const sourceSha256 = '2f48eea9e634f1f371525c458d9509b8e3f0900a3cf7981b3f5e9f8e5aae1240';

interface Capture {
  variant: 'A' | 'B';
  screenMode: 'retained' | 'removed';
  scenario: string;
  viewport: string;
  view: string;
  sourceSha256: string;
  visualVariant: string;
  materialVariant: string;
  fogV32Enabled: boolean;
  camera: { position: number[]; quaternion: number[] };
  racers: number;
  quality: string;
  projection: {
    matchedComponents: number;
    deletedComponentIds: string[];
    changedComponentIds: string[];
    meshCountBefore: number;
    meshCountAfter: number;
    rangeGeometryCount: number;
    addedMeshes: number;
    addedTriangles: number;
  };
  resources: { meshes: number; geometries: number; materials: number; textures: number };
  frame: { calls: number; triangles: number };
  fixture: { scenario: string; viewport: string; view: string };
  routeSignature: string;
  colliderSignature: string;
  glStatus: { error: number; isContextLost: boolean };
  screenshot: { sha256: string };
}

interface CaptureReport {
  schemaVersion: 1;
  sourceCommit: string;
  errors: string[];
  captures: Capture[];
}

type Mutation = (report: CaptureReport) => void;

function captureAt(report: CaptureReport, index: number): Capture {
  const capture = report.captures[index];
  if (!capture) throw new Error(`Capture ${String(index)} is missing from the fixture.`);
  return capture;
}

function lastCapture(report: CaptureReport): Capture {
  const capture = report.captures.at(-1);
  if (!capture) throw new Error('The fixture has no captures.');
  return capture;
}

function makeReport(): CaptureReport {
  const captures: Capture[] = [];
  for (const variant of ['A', 'B'] as const) {
    for (const [index, view] of OWNER_LAYOUT_CAPTURE_COVERAGE.entries()) {
      const removed = variant === 'B';
      captures.push({
        variant,
        screenMode: removed ? 'removed' : 'retained',
        ...view,
        sourceSha256,
        visualVariant: 'fog-experiment-c2-background',
        materialVariant: 'concrete-coverage-c2-001',
        fogV32Enabled: true,
        camera: { position: [1, 2, 3], quaternion: [0, 0, 0, 1] },
        racers: 8,
        quality: 'medium',
        projection: {
          matchedComponents: 1331,
          deletedComponentIds: removed
            ? [...OWNER_LAYOUT_NONSCREEN_DELETED_IDS, OWNER_LAYOUT_SCREEN_ID].sort()
            : [...OWNER_LAYOUT_NONSCREEN_DELETED_IDS],
          changedComponentIds: removed
            ? [
                'matrix-change',
                ...OWNER_LAYOUT_NONSCREEN_DELETED_IDS,
                OWNER_LAYOUT_SCREEN_ID,
              ].sort()
            : ['matrix-change', ...OWNER_LAYOUT_NONSCREEN_DELETED_IDS].sort(),
          meshCountBefore: 544,
          meshCountAfter: 544,
          rangeGeometryCount: 12,
          addedMeshes: 0,
          addedTriangles: 0,
        },
        resources: { meshes: 138, geometries: 136, materials: 41, textures: 13 },
        frame: { calls: 298, triangles: removed ? 399304 : 400000 },
        fixture: { scenario: view.scenario, viewport: view.viewport, view: view.view },
        routeSignature: 'route-signature',
        colliderSignature: 'collider-signature',
        glStatus: { error: 0, isContextLost: false },
        screenshot: {
          sha256: `${variant === 'A' && view.scenario === 'billboard-gap-detail' ? 'a' : 'b'}${String(index).padStart(63, '0')}`,
        },
      });
    }
  }
  return { schemaVersion: 1, sourceCommit: '1'.repeat(40), errors: [], captures };
}

describe('Neon Grid owner layout capture validation', () => {
  it('accepts a complete matched A/B report with Fog V3.2 and the authored screen as the only change', () => {
    expect(() => validateOwnerLayoutCapture(makeReport())).not.toThrow();
  });

  it('rejects a whole-frame triangle delta that does not match the main and bloom-mask screen submissions', () => {
    const report = makeReport();
    lastCapture(report).frame.triangles = 399_999;
    expect(() => validateOwnerLayoutCapture(report)).toThrow();
  });

  const invalidCases: [string, Mutation][] = [
    [
      'missing a required sector',
      (report) => {
        report.captures.pop();
      },
    ],
    [
      'a mismatched camera',
      (report) => {
        captureAt(report, report.captures.length - 1).camera.position[0] = 99;
      },
    ],
    [
      'Fog V3.2 disabled',
      (report) => {
        captureAt(report, 0).fogV32Enabled = false;
      },
    ],
    [
      'the wrong owner-layout source marker',
      (report) => {
        captureAt(report, 0).sourceSha256 = '0'.repeat(64);
      },
    ],
    [
      'a browser or WebGL error',
      (report) => {
        report.errors = ['shader compile failed'];
      },
    ],
    [
      'a route mismatch',
      (report) => {
        lastCapture(report).routeSignature = 'changed-route';
      },
    ],
    [
      'a collider mismatch',
      (report) => {
        lastCapture(report).colliderSignature = 'changed-collider';
      },
    ],
    [
      'an over-budget frame',
      (report) => {
        captureAt(report, 0).frame.calls = 501;
      },
    ],
    [
      'a mesh-count change',
      (report) => {
        lastCapture(report).resources.meshes += 1;
      },
    ],
    [
      'a non-screen component difference',
      (report) => {
        lastCapture(report).projection.deletedComponentIds.push('extra');
      },
    ],
  ];

  it.each(invalidCases)('rejects %s', (_description, mutate) => {
    const report = makeReport();
    mutate(report);
    expect(() => validateOwnerLayoutCapture(report)).toThrow();
  });
});
