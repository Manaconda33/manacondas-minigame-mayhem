import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(`${process.env.NEON_GRID_TASK_C2_PLAYWRIGHT}/package.json`);
const { chromium } = require('playwright');
const outputDirectory = process.argv[2] ?? 'docs/evidence/2026-10-18-neon-grid-task-c2/captures';
const sourceCommit = process.env.NEON_GRID_TASK_C2_SOURCE_SHA;
const baseUrl = (
  process.env.NEON_GRID_TASK_C2_BASE_URL ?? 'http://127.0.0.1:5173/manacondas-minigame-mayhem'
).replace(/\/$/, '');
if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? ''))
  throw new Error('Set NEON_GRID_TASK_C2_SOURCE_SHA to the exact C2 implementation commit.');
if (!process.env.NEON_GRID_TASK_C2_PLAYWRIGHT)
  throw new Error('Set NEON_GRID_TASK_C2_PLAYWRIGHT to the browser-tools node_modules directory.');
mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_TASK_C2_CHROME ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const variants = [
  { id: 'A-c1-concrete-001', query: 'service-tunnel-concrete-001' },
  { id: 'B-c2-concrete-coverage-001', query: 'concrete-coverage-c2-001' },
];
const captures = [];
const errors = [];
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

for (const variant of variants) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const flags = [
    'sector=course',
    'tunnelFraction=0.5',
    'quality=medium',
    'neonGridVisual=neon-grid-task-a-001',
    `neonGridMaterial=${variant.query}`,
  ].join('&');
  await page.goto(`${baseUrl}/tools/diagnostics/neon-grid-course.html?${flags}`);
  await page.waitForFunction(() => window.ready, undefined, { timeout: 90_000 });
  await page.waitForFunction(
    ({ requiresRoofUvs }) =>
      ['service-tunnel-left-wall', 'service-tunnel-right-wall'].every((name) => {
        const material = window.game?.trackScene.getObjectByName(name)?.material;
        return material?.map?.image?.width === 1024;
      }) &&
      (!requiresRoofUvs ||
        Boolean(
          window.game?.trackScene
            .getObjectByName('service-tunnel-roof')
            ?.geometry?.getAttribute('uv'),
        )),
    { requiresRoofUvs: variant.id === 'B-c2-concrete-coverage-001' },
    { timeout: 90_000 },
  );

  const detail = await page.evaluate(() => {
    const game = window.game;
    window.stageServiceTunnelAtFraction(0.5);
    const tunnel = game.track.serviceTunnel;
    const cameraFraction = 0.59;
    const targetFraction = 0.64;
    const center = tunnel.curve.getPointAt(cameraFraction);
    const tangent = tunnel.curve.getTangentAt(cameraFraction).setY(0).normalize();
    const right = new window.THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const lookAt = tunnel.curve.getPointAt(targetFraction).addScaledVector(right, -1.6);
    lookAt.y = tunnel.curve.getPointAt(targetFraction).y + tunnel.headroom - 0.12;
    const camera = center.clone().addScaledVector(right, -tunnel.roadHalfWidth + 0.45);
    camera.y = center.y + 1.0;
    game.camera.position.copy(camera);
    game.camera.lookAt(lookAt);
    game.camera.updateMatrixWorld(true);
    game.renderer.info.reset();
    game.bloom.render(game.scene, game.camera);
    game.motionBlur.render(false);
    const roof = game.trackScene.getObjectByName('service-tunnel-roof');
    return {
      cameraFraction,
      targetFraction,
      camera: game.camera.position.toArray(),
      lookAt: lookAt.toArray(),
      roofUvCount: roof.geometry.getAttribute('uv')?.count ?? 0,
      roofPositionCount: roof.geometry.getAttribute('position').count,
      roofIndexCount: roof.geometry.index?.count ?? 0,
      roofMaterialName: roof.material.name,
      rendererPrograms: game.renderer.info.programs?.length ?? null,
      rendererMemory: { ...game.renderer.info.memory },
    };
  });
  const filename = `${variant.id}-service-tunnel-roof-detail-desktop-1920x1080.png`;
  const path = join(outputDirectory, filename);
  const bytes = await page.screenshot({ path, timeout: 120_000 });
  const glStatus = await page.evaluate(() => {
    const gl = window.game.renderer.getContext();
    return { error: gl.getError(), contextLost: gl.isContextLost() };
  });
  captures.push({
    variant: variant.id,
    viewport: 'desktop-1920x1080',
    quality: 'medium',
    visualVariant: 'neon-grid-task-a-001',
    sourceCommit,
    purpose: 'Controlled close-up from the actual game camera and Neon Grid race scene.',
    ...detail,
    glStatus,
    screenshot: { path, bytes: bytes.length, sha256: sha256(bytes) },
  });
  await page.evaluate(() => window.game.dispose());
  await context.close();
}

await browser.close();
const report = {
  schemaVersion: 1,
  sourceCommit,
  environment: 'Headless Chromium / SwiftShader software WebGL; visual detail only, not G-05.',
  matchedCamera:
    JSON.stringify(captures[0]?.camera) === JSON.stringify(captures[1]?.camera) &&
    JSON.stringify(captures[0]?.lookAt) === JSON.stringify(captures[1]?.lookAt),
  errors,
  captures,
};
writeFileSync(join(outputDirectory, 'roof-detail-capture.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ matchedCamera: report.matchedCamera, errors, captures }, null, 2));
if (
  errors.length ||
  !report.matchedCamera ||
  captures.some((capture) => capture.glStatus.error !== 0 || capture.glStatus.contextLost)
)
  throw new Error('Roof detail capture reported a browser, camera, or WebGL invariant failure.');
