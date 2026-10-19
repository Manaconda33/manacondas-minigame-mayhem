import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  OWNER_LAYOUT_CAPTURE_COVERAGE,
  OWNER_LAYOUT_SOURCE_SHA256,
  validateOwnerLayoutCapture,
} from './neon-grid-owner-layout-capture-schema.mjs';

const playwrightRoot =
  process.env.NEON_GRID_OWNER_LAYOUT_PLAYWRIGHT ?? '/workspace/mayhem-browser-tools/node_modules';
const require = createRequire(`${playwrightRoot}/package.json`);
const { chromium } = require('playwright');
const outputDirectory =
  process.argv[2] ?? 'docs/evidence/2026-10-19-neon-grid-owner-layout/captures';
const sourceCommit = process.env.NEON_GRID_OWNER_LAYOUT_SOURCE_SHA;
const baseUrl = (
  process.env.NEON_GRID_OWNER_LAYOUT_BASE_URL ?? 'http://127.0.0.1:5173/manacondas-minigame-mayhem'
).replace(/\/$/, '');

if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? ''))
  throw new Error(
    'Set NEON_GRID_OWNER_LAYOUT_SOURCE_SHA to the exact 40-character runtime commit.',
  );
mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_OWNER_LAYOUT_CHROME ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const variants = [
  { id: 'A', screenMode: 'retained' },
  { id: 'B', screenMode: 'removed' },
];
const viewports = [
  { id: 'desktop-1280x720', viewport: { width: 1280, height: 720 }, scale: 1.5 },
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 }, scale: 1 },
];
const scenarios = {
  skyline: { progress: 0.16 },
  undercity: { progress: 0.355 },
  'service-tunnel-entry': { tunnelFraction: 0.15 },
  'service-tunnel-interior': { tunnelFraction: 0.5 },
  'service-tunnel-exit': { tunnelFraction: 0.85 },
  'falls-run': { progress: 0.57 },
};
const browserErrors = [];
const captures = [];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
    .join(',')}}`;
}

function digest(value) {
  return sha256(stable(value));
}

async function readFixtureSignatures(page) {
  return page.evaluate(() => {
    const game = window.game;
    const sample = (curve, count = 65) =>
      Array.from({ length: count }, (_, index) => curve.getPointAt(index / (count - 1)).toArray());
    const track = game.track;
    const vectorAttributes = (geometry) =>
      geometry.getAttribute('position') ? Array.from(geometry.getAttribute('position').array) : [];
    const route = {
      mainSamples: track.samples.map((point) => point.toArray()),
      roadWidths: Array.from({ length: 34 }, (_, index) => track.halfWidthAt(index / 33)),
      serviceTunnel: sample(track.serviceTunnel.curve),
      billboardGap: sample(track.billboardGap.curve),
      waterfallDive: Array.from({ length: 65 }, (_, index) =>
        track.waterfallDive.pointAtDistance((track.waterfallDive.length * index) / 64).toArray(),
      ),
      diveDirection: track.waterfallDive.direction.toArray(),
      diveRamp: vectorAttributes(track.waterfallDive.rampGeometry),
      diveLanding: vectorAttributes(track.waterfallDive.landingGeometry),
    };
    const colliders = [];
    game.world.forEachCollider((collider) => {
      const translation = collider.translation();
      const rotation = collider.rotation();
      const halfExtents = collider.halfExtents();
      colliders.push({
        handle: collider.handle,
        parentHandle: collider.parent()?.handle ?? null,
        shapeType: collider.shapeType(),
        translation: [translation.x, translation.y, translation.z],
        rotation: [rotation.x, rotation.y, rotation.z, rotation.w],
        halfExtents: halfExtents ? [halfExtents.x, halfExtents.y, halfExtents.z] : null,
        sensor: collider.isSensor(),
        friction: collider.friction(),
        restitution: collider.restitution(),
        collisionGroups: collider.collisionGroups(),
        activeCollisionTypes: collider.activeCollisionTypes(),
      });
    });
    colliders.sort((left, right) => left.handle - right.handle);

    const resources = new Map();
    const meshMaterials = new Set();
    const textures = new Set();
    let meshes = 0;
    game.trackScene.traverse((object) => {
      if (!object.isMesh) return;
      meshes += 1;
      resources.set(object.geometry, true);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        meshMaterials.add(material);
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'].forEach(
          (key) => {
            if (material[key]) textures.add(material[key]);
          },
        );
      });
    });
    return {
      route,
      colliders,
      resources: {
        meshes,
        geometries: resources.size,
        materials: meshMaterials.size,
        textures: textures.size,
        textureImageDimensions: [...textures]
          .map((texture) => ({
            width: texture.image?.width ?? null,
            height: texture.image?.height ?? null,
          }))
          .sort((left, right) => (left.width ?? 0) - (right.width ?? 0)),
      },
    };
  });
}

async function captureScenario(page, variant, viewport, coverage) {
  const scenario = scenarios[coverage.scenario];
  if (scenario) {
    const staged = await page.evaluate((next) => {
      if (next.tunnelFraction !== undefined)
        window.stageServiceTunnelAtFraction(next.tunnelFraction);
      else window.stageC2CourseAtProgress(next.progress);
      return true;
    }, scenario);
    if (!staged) throw new Error(`Could not stage ${coverage.scenario}`);
  }

  const customCamera = coverage.view === 'detail';
  const details = customCamera
    ? await page.evaluate((scenarioId) => {
        const game = window.game;
        const target = new window.THREE.Vector3();
        const cameraPosition = new window.THREE.Vector3();
        if (scenarioId === 'terraced-platform-detail') {
          const ground = game.trackScene.getObjectByName(
            'falls-run-extension-city-terraced-ground',
          );
          if (!ground) throw new Error('Terraced platform source mesh is missing.');
          ground.geometry.computeBoundingBox();
          ground.geometry.boundingBox.getCenter(target).applyMatrix4(ground.matrixWorld);
          cameraPosition.copy(target).add(new window.THREE.Vector3(18, 15, 18));
        } else if (scenarioId === 'waterfall-dive-detail') {
          target.copy(game.track.waterfallDive.pointAtDistance(15));
          cameraPosition
            .copy(target)
            .addScaledVector(game.track.waterfallDive.right, 13)
            .addScaledVector(game.track.waterfallDive.direction, -9)
            .add(new window.THREE.Vector3(0, 12, 0));
        } else if (scenarioId === 'billboard-gap-detail') {
          const gap = game.track.billboardGap;
          target.copy(gap.curve.getPointAt(0.5)).add(new window.THREE.Vector3(0, 4, 0));
          const tangent = gap.curve.getTangentAt(0.5).setY(0).normalize();
          cameraPosition
            .copy(target)
            .addScaledVector(tangent, -16)
            .add(new window.THREE.Vector3(0, 8, 0));
        } else {
          throw new Error(`Unknown detail scenario ${scenarioId}`);
        }
        game.camera.position.copy(cameraPosition);
        game.camera.lookAt(target);
        game.camera.updateMatrixWorld(true);
        game.renderer.info.reset();
        game.bloom.render(game.scene, game.camera);
        game.motionBlur.render(false);
        const size = game.renderer.getDrawingBufferSize(new window.THREE.Vector2());
        const cameraPositionArray = game.camera.position.toArray();
        const cameraQuaternion = [
          game.camera.quaternion.x,
          game.camera.quaternion.y,
          game.camera.quaternion.z,
          game.camera.quaternion.w,
        ];
        const resource = game.renderer.info.memory;
        return {
          camera: { position: cameraPositionArray, quaternion: cameraQuaternion },
          frame: {
            calls: game.renderer.info.render.calls,
            triangles: game.renderer.info.render.triangles,
            geometries: resource.geometries,
            textures: resource.textures,
            width: size.x,
            height: size.y,
            pixelRatio: game.renderer.getPixelRatio(),
          },
          passFrame: game.passInstrumentation.finishFrame(
            {
              drawCalls: game.renderer.info.render.calls,
              triangles: game.renderer.info.render.triangles,
            },
            null,
          ),
          progress: null,
          sectorIndex: null,
          roster: game.opponents.length + 1,
        };
      }, coverage.scenario)
    : await page.evaluate(
        ({ scenarioId, viewName }) => {
          const game = window.game;
          const scenarioConfig = {
            skyline: { progress: 0.16 },
            undercity: { progress: 0.355 },
            'falls-run': { progress: 0.57 },
            'service-tunnel-entry': { tunnelFraction: 0.15 },
            'service-tunnel-interior': { tunnelFraction: 0.5 },
            'service-tunnel-exit': { tunnelFraction: 0.85 },
          }[scenarioId];
          const progress =
            scenarioConfig.tunnelFraction === undefined
              ? scenarioConfig.progress
              : (game.track.serviceTunnel.entry.progress[0] +
                  game.track.serviceTunnel.exitProgress) /
                2;
          const sectorIndex =
            scenarioConfig.tunnelFraction !== undefined
              ? 1
              : progress < 0.247
                ? 0
                : progress < 0.46155
                  ? 1
                  : 2;
          for (let index = 0; index < 3; index++) window.renderFrame(true, viewName);
          const durations = [];
          let wholeFrame;
          for (let index = 0; index < 6; index++) {
            const start = performance.now();
            wholeFrame = window.renderFrame(true, viewName);
            durations.push(performance.now() - start);
          }
          durations.sort((a, b) => a - b);
          const sorted = durations;
          const camera = {
            position: game.camera.position.toArray(),
            quaternion: [
              game.camera.quaternion.x,
              game.camera.quaternion.y,
              game.camera.quaternion.z,
              game.camera.quaternion.w,
            ],
          };
          const passFrame = game.passInstrumentation.finishFrame(
            { drawCalls: wholeFrame.calls, triangles: wholeFrame.triangles },
            {
              cameraFixture: viewName === 'rear' ? 'rearView' : 'chase',
              cameraPosition: camera.position,
              cameraQuaternion: camera.quaternion,
              sectorProgress: {
                lap: 0,
                trackProgress: progress,
                sectorIndex,
                sectorName: scenarioId,
              },
              itemEffectState: {
                activeProjectiles: game.projectiles.activeCount(),
                activeHazards: game.hazards.activeCount(),
                playerHeldItem: game.itemSystem.heldItem('player') ?? null,
                playerFrostStacks: game.racerEffects.frostState('player')?.stacks ?? 0,
                playerSpinoutId: game.racerEffects.spinoutState('player')?.id ?? null,
                activeBoostLabel: game.racerEffects.driveModifiers('player').activeBoostLabel,
                nitroOverdriveActive: game.nitroOverdrive.snapshot('player').active,
                hyperDriveRocketActive: game.hyperDriveRocket.snapshot('player').active,
              },
            },
          );
          return {
            camera,
            frame: {
              calls: wholeFrame.calls,
              triangles: wholeFrame.triangles,
              geometries: wholeFrame.geometries,
              textures: wholeFrame.textures,
              width: wholeFrame.width,
              height: wholeFrame.height,
              pixelRatio: wholeFrame.pixelRatio,
            },
            passFrame,
            renderTimingMs: {
              measurement: 'CPU wall time around renderFrame; not GPU time or full frame pacing.',
              warmupCalls: 3,
              scoredCalls: sorted.length,
              median: (sorted[2] + sorted[3]) / 2,
              p95: sorted[5],
              maximum: sorted.at(-1),
            },
            progress,
            sectorIndex,
            roster: wholeFrame.racers,
          };
        },
        { scenarioId: coverage.scenario, viewName: coverage.view },
      );

  const screenshotPath = join(
    outputDirectory,
    `${variant.id}-${coverage.scenario}-${coverage.view}-${viewport.id}.jpg`,
  );
  const screenshot = await page.screenshot({
    path: screenshotPath,
    type: 'jpeg',
    quality: 92,
    timeout: 120_000,
  });
  const state = await page.evaluate(() => {
    const game = window.game;
    const marker = game.trackScene.userData.neonGridOwnerLayout;
    const gl = game.renderer.getContext();
    return {
      sourceSha256: marker?.sourceSha256 ?? null,
      visualVariant: game.trackScene.userData.visualVariant ?? null,
      materialVariant: game.trackScene.userData.serviceTunnelMaterialVariant ?? null,
      fogV32Enabled: game.trackScene.userData.abyssFogV3_2?.enabled === true,
      racers: game.opponents.length + 1,
      quality: 'medium',
      projection: marker
        ? {
            screen: marker.screen,
            matchedComponents: marker.matchedComponents,
            changedComponents: marker.changedComponents,
            changedComponentIds: marker.changedComponentIds,
            deletedComponents: marker.deletedComponents,
            deletedComponentIds: marker.deletedComponentIds,
            meshCountBefore: marker.meshCountBefore,
            meshCountAfter: marker.meshCountAfter,
            rangeGeometryCount: marker.rangeGeometryCount,
            addedMeshes: marker.addedMeshes,
            addedTriangles: marker.addedTriangles,
          }
        : null,
      glStatus: { error: gl.getError(), isContextLost: gl.isContextLost() },
    };
  });

  return {
    variant: variant.id,
    screenMode: variant.screenMode,
    scenario: coverage.scenario,
    viewport: viewport.id,
    view: coverage.view,
    sourceSha256: state.sourceSha256,
    visualVariant: state.visualVariant,
    materialVariant: state.materialVariant,
    fogV32Enabled: state.fogV32Enabled,
    camera: details.camera,
    fixture: {
      sourceCommit,
      viewport: viewport.id,
      view: coverage.view,
      progress: details.progress,
      sectorIndex: details.sectorIndex,
      racers: details.roster,
      quality: 'medium',
    },
    racers: state.racers,
    quality: state.quality,
    projection: state.projection,
    resources: details.resources ?? null,
    frame: details.frame,
    passFrame: details.passFrame,
    renderTimingMs: details.renderTimingMs ?? null,
    glStatus: state.glStatus,
    screenshot: { path: screenshotPath, sha256: sha256(screenshot), bytes: screenshot.length },
  };
}

try {
  for (const variant of variants) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: viewport.viewport,
        deviceScaleFactor: viewport.scale,
      });
      const page = await context.newPage();
      page.setDefaultTimeout(90_000);
      page.on('response', (response) => {
        if (response.status() >= 400) browserErrors.push(`${response.status()} ${response.url()}`);
      });
      page.on('pageerror', (error) => browserErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') browserErrors.push(message.text());
      });
      await page.addInitScript(() => {
        const originalRandom = Math.random;
        let state = 1417;
        Math.random = () => {
          if (!(new Error().stack ?? '').includes('raceRoster')) return originalRandom();
          state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
          return state / 0x100000000;
        };
      });

      const query = [
        'sector=course',
        'tunnelFraction=0.5',
        'quality=medium',
        'testRacePerf=1',
        'neonGridVisual=abyss-fog-001',
        'neonGridMaterial=service-tunnel-concrete-001',
        'fog=0',
        `neonGridLayout=owner-2026-10-19`,
        `neonGridGapScreen=${variant.screenMode}`,
      ].join('&');
      await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?${query}`);
      await page.waitForFunction(() => window.ready, undefined, { timeout: 90_000 });
      await page.waitForFunction(
        (expectedScreen) => {
          const marker = window.game?.trackScene?.userData?.neonGridOwnerLayout;
          return marker?.matchedComponents === 1331 && marker.screen === expectedScreen;
        },
        variant.screenMode,
        { timeout: 90_000 },
      );
      await page.waitForFunction(
        () => {
          const roof = window.game?.trackScene?.getObjectByName('service-tunnel-roof');
          const material = roof?.material;
          return material?.map?.image?.width === 1024 && material?.normalMap?.image?.width === 1024;
        },
        undefined,
        { timeout: 90_000 },
      );

      const fixture = await readFixtureSignatures(page);
      const routeSignature = digest(fixture.route);
      const colliderSignature = digest(fixture.colliders);
      for (const coverage of OWNER_LAYOUT_CAPTURE_COVERAGE.filter(
        (entry) => entry.viewport === viewport.id,
      )) {
        const capture = await captureScenario(page, variant, viewport, coverage);
        capture.routeSignature = routeSignature;
        capture.colliderSignature = colliderSignature;
        capture.resources = fixture.resources;
        captures.push(capture);
        writeFileSync(
          join(outputDirectory, 'owner-layout-ab-capture-progress.json'),
          JSON.stringify(
            {
              schemaVersion: 1,
              sourceCommit,
              capturedAt: new Date().toISOString(),
              capturedCount: captures.length,
              expectedCount: OWNER_LAYOUT_CAPTURE_COVERAGE.length * variants.length,
              captures,
            },
            null,
            2,
          ),
        );
      }
      await page.evaluate(() => window.game.dispose());
      await context.close();
    }
  }

  const report = {
    schemaVersion: 1,
    sourceCommit,
    capturedAt: new Date().toISOString(),
    fixture: {
      runtime:
        'Actual KartTimeTrial, NeonGridScene, game camera, route and Rapier world through tools/diagnostics/neon-grid-course.html.',
      trackId: 'neon-grid',
      materialVariant: 'concrete-coverage-c2-001',
      visualVariant: 'fog-experiment-c2-background',
      racers: 8,
      rosterSeed: 1417,
      quality: 'medium',
      variants,
      viewports,
      coverage: OWNER_LAYOUT_CAPTURE_COVERAGE,
      softwareRenderer:
        'Headless Chromium with SwiftShader software WebGL; not G-05 hardware certification.',
      browserVersion: browser.version(),
      routeSignature: digest(captures[0] ? { route: captures[0].routeSignature } : null),
      colliderSignature: captures[0]?.colliderSignature ?? null,
    },
    limits: {
      globalDrawCalls: 500,
      task9EngineeringTriangles: 425000,
      globalVisibleTriangles: 750000,
    },
    errors: browserErrors,
    captures,
  };
  const validation = validateOwnerLayoutCapture(report);
  report.validation = validation;
  report.maximums = {
    wholeFrameDrawCalls: Math.max(...captures.map((capture) => capture.frame.calls)),
    wholeFrameTriangles: Math.max(...captures.map((capture) => capture.frame.triangles)),
    trackSceneMeshes: Math.max(...captures.map((capture) => capture.resources.meshes)),
    trackSceneGeometries: Math.max(...captures.map((capture) => capture.resources.geometries)),
    trackSceneMaterials: Math.max(...captures.map((capture) => capture.resources.materials)),
    trackSceneTextures: Math.max(...captures.map((capture) => capture.resources.textures)),
  };
  writeFileSync(
    join(outputDirectory, 'owner-layout-ab-capture.json'),
    JSON.stringify(report, null, 2),
  );
  unlinkSync(join(outputDirectory, 'owner-layout-ab-capture-progress.json'));
  console.log(
    JSON.stringify(
      {
        sourceCommit,
        captureCount: captures.length,
        pairCount: validation.pairCount,
        errors: browserErrors,
        maximums: report.maximums,
        allPairsValidated: validation.valid,
        screenshotDirectory: outputDirectory,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
