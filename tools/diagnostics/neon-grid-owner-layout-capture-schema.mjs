export const OWNER_LAYOUT_SOURCE_SHA256 =
  '2f48eea9e634f1f371525c458d9509b8e3f0900a3cf7981b3f5e9f8e5aae1240';
export const OWNER_LAYOUT_SCREEN_ID =
  'Scene[0]/neon-grid-blockout[0]/skyline-visual[0]/skyline-deck-fascia::billboardGapWing[0]';
export const OWNER_LAYOUT_SCREEN_TRIANGLES = 348;
export const OWNER_LAYOUT_CAPTURE_COVERAGE = [
  { scenario: 'skyline', viewport: 'desktop-1280x720', view: 'chase' },
  { scenario: 'skyline', viewport: 'desktop-1280x720', view: 'rear' },
  { scenario: 'skyline', viewport: 'mobile-390x844', view: 'chase' },
  { scenario: 'undercity', viewport: 'desktop-1280x720', view: 'chase' },
  { scenario: 'undercity', viewport: 'desktop-1280x720', view: 'rear' },
  { scenario: 'undercity', viewport: 'mobile-390x844', view: 'chase' },
  { scenario: 'service-tunnel-entry', viewport: 'desktop-1280x720', view: 'chase' },
  { scenario: 'service-tunnel-entry', viewport: 'desktop-1280x720', view: 'rear' },
  { scenario: 'service-tunnel-entry', viewport: 'mobile-390x844', view: 'chase' },
  { scenario: 'service-tunnel-interior', viewport: 'desktop-1280x720', view: 'chase' },
  { scenario: 'service-tunnel-interior', viewport: 'desktop-1280x720', view: 'rear' },
  { scenario: 'service-tunnel-interior', viewport: 'mobile-390x844', view: 'chase' },
  { scenario: 'service-tunnel-exit', viewport: 'desktop-1280x720', view: 'chase' },
  { scenario: 'service-tunnel-exit', viewport: 'desktop-1280x720', view: 'rear' },
  { scenario: 'service-tunnel-exit', viewport: 'mobile-390x844', view: 'chase' },
  { scenario: 'falls-run', viewport: 'desktop-1280x720', view: 'chase' },
  { scenario: 'falls-run', viewport: 'desktop-1280x720', view: 'rear' },
  { scenario: 'falls-run', viewport: 'mobile-390x844', view: 'chase' },
  { scenario: 'terraced-platform-detail', viewport: 'desktop-1280x720', view: 'detail' },
  { scenario: 'waterfall-dive-detail', viewport: 'desktop-1280x720', view: 'detail' },
  { scenario: 'billboard-gap-detail', viewport: 'desktop-1280x720', view: 'detail' },
];

export const OWNER_LAYOUT_NONSCREEN_DELETED_IDS = [
  'Scene[0]/neon-grid-blockout[0]/falls-run-extension-visual[0]/falls-run-extension-city-terraced-ground::cityGround[0]',
  'Scene[0]/neon-grid-blockout[0]/falls-run-visual[0]/falls-run-city-terraced-ground::cityGround[0]',
  'Scene[0]/neon-grid-blockout[0]/skyline-visual[0]/skyline-deck-fascia::cityGround[0]',
  'Scene[0]/neon-grid-blockout[0]/undercity-visual[0]/undercity-wallside-sightline-screens::cityGround[0]',
  'Scene[0]/neon-grid-blockout[0]/waterfall-dive[0]/dive-waterway-banks[0]',
  'Scene[0]/neon-grid-blockout[0]/waterfall-dive[0]/dive-waterway[0]',
].sort();

function fail(message) {
  throw new Error(`Owner layout capture is invalid: ${message}`);
}

function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
    .join(',')}}`;
}

function require(condition, message) {
  if (!condition) fail(message);
}

function captureKey(capture) {
  return `${capture.variant}|${capture.scenario}|${capture.viewport}|${capture.view}`;
}

export function validateOwnerLayoutCapture(report) {
  require(report?.schemaVersion === 1, 'unsupported report schema');
  require(/^[0-9a-f]{40}$/.test(
    report.sourceCommit ?? '',
  ), 'missing exact candidate source commit');
  require(Array.isArray(report.errors) &&
    report.errors.length === 0, 'browser or WebGL errors were recorded');
  require(Array.isArray(report.captures), 'captures must be an array');

  const captures = new Map();
  for (const capture of report.captures) {
    require(capture.variant === 'A' || capture.variant === 'B', 'unknown A/B state');
    const key = captureKey(capture);
    require(!captures.has(key), `duplicate capture ${key}`);
    captures.set(key, capture);
  }

  const expectedCaptureCount = OWNER_LAYOUT_CAPTURE_COVERAGE.length * 2;
  require(captures.size ===
    expectedCaptureCount, `expected ${expectedCaptureCount} A/B captures, found ${captures.size}`);
  for (const coverage of OWNER_LAYOUT_CAPTURE_COVERAGE) {
    for (const variant of ['A', 'B']) {
      const key = `${variant}|${coverage.scenario}|${coverage.viewport}|${coverage.view}`;
      require(captures.has(key), `missing required capture ${key}`);
    }
  }

  const paired = [];
  for (const coverage of OWNER_LAYOUT_CAPTURE_COVERAGE) {
    const baseKey = `${coverage.scenario}|${coverage.viewport}|${coverage.view}`;
    const a = captures.get(`A|${baseKey}`);
    const b = captures.get(`B|${baseKey}`);
    require(a && b, `missing A/B pair ${baseKey}`);
    for (const [capture, expectedMode] of [
      [a, 'retained'],
      [b, 'removed'],
    ]) {
      require(capture.screenMode === expectedMode, `${baseKey} has the wrong screen mode`);
      require(capture.sourceSha256 ===
        OWNER_LAYOUT_SOURCE_SHA256, `${baseKey} has the wrong export marker`);
      require(capture.visualVariant ===
        'fog-experiment-c2-background', `${baseKey} does not use Fog V3.2 C2 composition`);
      require(capture.materialVariant ===
        'concrete-coverage-c2-001', `${baseKey} does not use C2 concrete`);
      require(capture.fogV32Enabled === true, `${baseKey} has Fog V3.2 disabled`);
      require(capture.racers === 8 &&
        capture.quality === 'medium', `${baseKey} uses a different race or quality setup`);
      require(capture.projection?.matchedComponents ===
        1331, `${baseKey} did not resolve every export component`);
      require(capture.projection?.meshCountBefore ===
        capture.projection?.meshCountAfter, `${baseKey} changed mesh batching`);
      require(capture.projection?.addedMeshes === 0 &&
        capture.projection?.addedTriangles === 0, `${baseKey} added geometry or triangles`);
      require(capture.glStatus?.error === 0 &&
        capture.glStatus?.isContextLost === false, `${baseKey} has a WebGL failure`);
      require(/^[0-9a-f]{64}$/.test(
        capture.screenshot?.sha256 ?? '',
      ), `${baseKey} lacks a screenshot digest`);
      require(Number.isInteger(capture.frame?.calls) &&
        capture.frame.calls >= 0 &&
        capture.frame.calls <= 500, `${baseKey} exceeds the 500-call scene budget`);
      require(Number.isInteger(capture.frame?.triangles) &&
        capture.frame.triangles >= 0 &&
        capture.frame.triangles <=
          750000, `${baseKey} exceeds the 750,000 visible-triangle budget`);
      require(capture.frame.triangles <=
        425000, `${baseKey} exceeds the 425,000 Task 9 engineering-triangle ceiling`);
    }

    require(stable(a.camera) === stable(b.camera), `${baseKey} A/B camera settings differ`);
    require(stable(a.fixture) === stable(b.fixture), `${baseKey} A/B fixture settings differ`);
    require(a.routeSignature === b.routeSignature, `${baseKey} route signature changed`);
    require(a.colliderSignature === b.colliderSignature, `${baseKey} collider signature changed`);
    require(a.resources.meshes === b.resources.meshes, `${baseKey} A/B mesh counts differ`);
    require(a.resources.geometries ===
      b.resources.geometries, `${baseKey} A/B geometry counts differ`);
    require(a.resources.materials ===
      b.resources.materials, `${baseKey} A/B material counts differ`);
    require(a.resources.textures === b.resources.textures, `${baseKey} A/B texture counts differ`);
    require(a.frame.calls === b.frame.calls, `${baseKey} A/B draw-call counts differ`);
    const frameTriangleDelta = a.frame.triangles - b.frame.triangles;
    const expectedVisibleScreenDelta = OWNER_LAYOUT_SCREEN_TRIANGLES * 2;
    require(frameTriangleDelta === 0 ||
      frameTriangleDelta ===
        expectedVisibleScreenDelta, `${baseKey} whole-frame triangle delta is not explained by the screen's main-scene and bloom-mask submissions`);
    require(stable(
      a.projection.changedComponentIds.filter((id) => id !== OWNER_LAYOUT_SCREEN_ID),
    ) ===
      stable(
        b.projection.changedComponentIds.filter((id) => id !== OWNER_LAYOUT_SCREEN_ID),
      ), `${baseKey} changed a different non-screen component between A and B`);
    require(stable(a.projection.deletedComponentIds) ===
      stable(
        OWNER_LAYOUT_NONSCREEN_DELETED_IDS,
      ), `${baseKey} A does not contain exactly the six fixed non-screen deletions`);
    require(stable(b.projection.deletedComponentIds) ===
      stable(
        [...OWNER_LAYOUT_NONSCREEN_DELETED_IDS, OWNER_LAYOUT_SCREEN_ID].sort(),
      ), `${baseKey} B does not add exactly the Billboard Gap screen deletion`);
    paired.push({
      scenario: coverage.scenario,
      viewport: coverage.viewport,
      view: coverage.view,
      sameCamera: true,
      sameRoute: true,
      sameColliders: true,
      sameResources: true,
      sameDrawCalls: true,
      frameTriangleDelta,
      expectedScreenRangeTriangles: OWNER_LAYOUT_SCREEN_TRIANGLES,
      expectedWholeFrameScreenDelta: expectedVisibleScreenDelta,
      aScreenshotSha256: a.screenshot.sha256,
      bScreenshotSha256: b.screenshot.sha256,
    });
  }

  const billboardPair = paired.find((pair) => pair.scenario === 'billboard-gap-detail');
  require(billboardPair?.aScreenshotSha256 !==
    billboardPair?.bScreenshotSha256, 'the Billboard Gap detail capture does not visibly distinguish the screen states');
  return { valid: true, captureCount: captures.size, pairCount: paired.length, paired };
}
