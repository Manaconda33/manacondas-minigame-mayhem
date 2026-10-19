import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const require = createRequire(
  `${process.env.NEON_GRID_EDITOR_PLAYWRIGHT ?? '/workspace/mayhem-browser-tools/node_modules'}/package.json`,
);
const { chromium } = require('playwright');
const base = process.env.NEON_GRID_EDITOR_URL ?? 'http://127.0.0.1:5179/';
const output = resolve(
  process.argv[2] ?? 'docs/evidence/2026-10-19-neon-grid-layout-editor/browser',
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.NEON_GRID_EDITOR_CHROME ?? '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const context = await browser.newContext({
  viewport: { width: 1500, height: 940 },
  deviceScaleFactor: 1,
  acceptDownloads: true,
});
const page = await context.newPage();
page.setDefaultTimeout(120000);
const errors = [],
  responses = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('response', (r) => {
  if (r.status() >= 400) responses.push({ url: r.url(), status: r.status() });
});
const checks = [];
const check = (name, result) => {
  if (!result) throw new Error(`Verification failed: ${name}`);
  checks.push({ name, passed: true });
  console.log(`PASS ${name}`);
};
const report = { base, checks, errors, responses, captures: [] };
try {
  await page.goto(base);
  await page.waitForFunction(() => !!window.neonGridEditor);
  await page.locator('#loading').waitFor({ state: 'hidden' });
  const baseline = await page.evaluate(() => {
    const a = window.neonGridEditor;
    return {
      baseline: a.session.baseline,
      coverage: a.session.catalogue.coverage,
      groups: Object.keys(a.session.catalogue.groups).length,
      metrics: a.scene.metrics(),
      road: a.session.history.snapshot().road,
    };
  });
  report.baseline = baseline;
  check(
    'exact primary source',
    baseline.baseline.runtimeSourceSha === 'addab4c7c2421f52c4731691b8a9f3e2d9e39f94',
  );
  check(
    'mapped editable source catalogue',
    baseline.coverage.registered > 1000 && baseline.coverage.unregistered.length === 0,
  );
  await page.screenshot({ path: join(output, 'studio-baseline.png') });
  await page.locator('#search').fill('skyline city towers');
  await page.locator('#outliner button').first().click();
  const group = await page.evaluate(() => window.neonGridEditor.selection.ids);
  check('logical building selection includes its parts', group.length > 1);
  const original = await page.evaluate(() => {
    const a = window.neonGridEditor;
    return {
      matrices: Object.fromEntries(
        [...a.session.catalogue.components.keys()].map((id) => [
          id,
          a.session.projection.matrixFor(id).toArray(),
        ]),
      ),
      state: a.session.history.snapshot(),
      center: a.selection.bounds().getCenter(a.scene.camera.position.clone()).toArray(),
    };
  });
  const x = page.getByRole('spinbutton', { name: 'position X', exact: true });
  const oldX = Number(await x.inputValue());
  await x.fill(String(oldX + 6));
  await x.press('Tab');
  const moved = await page.evaluate((ids) => {
    const a = window.neonGridEditor;
    return ids.map((id) => a.session.projection.matrixFor(id).toArray());
  }, group);
  check(
    'numeric group move has exact world translation',
    moved.every(
      (m, i) =>
        Math.abs(m[12] - original.matrices[group[i]][12] - (oldX + 6 - original.center[0])) < 1e-6,
    ),
  );
  check(
    'unselected batch neighbours remain untouched',
    await page.evaluate(
      ({ group, matrices }) => {
        const a = window.neonGridEditor;
        return [...a.session.catalogue.components.keys()]
          .filter((id) => !group.includes(id))
          .every(
            (id) =>
              JSON.stringify(a.session.projection.matrixFor(id).toArray()) ===
              JSON.stringify(matrices[id]),
          );
      },
      { group, matrices: original.matrices },
    ),
  );
  const height = page.getByRole('spinbutton', { name: 'dimensions Y', exact: true });
  const oldH = Number(await height.inputValue());
  await height.fill(String(oldH * 1.2));
  await height.press('Tab');
  check(
    'numeric height edit applied',
    Math.abs(Number(await height.inputValue()) - oldH * 1.2) < 0.01,
  );
  await page
    .locator('#outliner button')
    .nth(1)
    .click({ modifiers: ['Control'] });
  check(
    'Ctrl-click adds another building',
    await page.evaluate((n) => window.neonGridEditor.selection.ids.length > n, group.length),
  );
  await page.locator('[data-action="delete"]').click();
  check(
    'deletion is recorded as tombstones',
    await page.evaluate(() =>
      Object.values(window.neonGridEditor.session.history.snapshot().overrides).some(
        (o) => o.deleted,
      ),
    ),
  );
  await page.locator('[data-action="undo"]').click();
  check(
    'undo restores deletion',
    await page.evaluate(
      () =>
        !Object.values(window.neonGridEditor.session.history.snapshot().overrides).some(
          (o) => o.deleted,
        ),
    ),
  );
  await page.locator('[data-action="redo"]').click();
  check(
    'redo reapplies deletion',
    await page.evaluate(() =>
      Object.values(window.neonGridEditor.session.history.snapshot().overrides).some(
        (o) => o.deleted,
      ),
    ),
  );
  await page.locator('[data-mode="road"]').click();
  await page.locator('#view-preset').selectOption('top');
  await page.waitForTimeout(1500);
  const point = await page.evaluate(() => {
    const a = window.neonGridEditor,
      r = a.scene.renderer.domElement.getBoundingClientRect(),
      p = a.scene.track.curve.points[3]
        .clone()
        .fromArray(a.session.history.snapshot().road.controlPoints[3].position)
        .project(a.scene.camera);
    return { x: r.x + ((p.x + 1) * r.width) / 2, y: r.y + ((1 - p.y) * r.height) / 2 };
  });
  await page.mouse.click(point.x, point.y);
  await page.getByText('Track control point 4', { exact: true }).waitFor();
  const beforeRoad = await page.evaluate(() => {
    const a = window.neonGridEditor;
    return Object.fromEntries(
      a.session.catalogue.entries
        .filter((e) => e.attachment.mode === 'fixed')
        .map((e) => [e.id, a.session.projection.matrixFor(e.id).toArray()]),
    );
  });
  const py = page.getByRole('spinbutton', { name: 'position Y', exact: true });
  await py.fill(String(Number(await py.inputValue()) + 3));
  await py.press('Tab');
  const width = page.locator('#width-value');
  await width.fill(String(Number(await width.inputValue()) + 1));
  await width.press('Tab');
  check(
    'track position and width are edited',
    await page.evaluate(() => {
      const p = window.neonGridEditor.session.history.snapshot().road.controlPoints[3];
      return p.position[1] === 17 && p.widthMultiplier > 1;
    }),
  );
  check(
    'road change preserves fixed background placements',
    await page.evaluate((before) => {
      const a = window.neonGridEditor;
      return Object.entries(before).every(
        ([id, m]) =>
          JSON.stringify(a.session.projection.matrixFor(id).toArray()) === JSON.stringify(m),
      );
    }, beforeRoad),
  );
  check(
    'junction/gameplay limitations remain explicit',
    await page.evaluate(() =>
      window.neonGridEditor.session.history.snapshot().warnings.some((w) => w.includes('junction')),
    ),
  );
  await page.locator('[data-mode="select"]').click();
  await page.locator('#search').fill('undercity city buildings');
  await page.locator('#outliner button').first().click();
  await page.locator('[data-action="frame"]').click();
  await page.screenshot({ path: join(output, 'studio-selection.png') });
  const downloaded = page.waitForEvent('download');
  await page.locator('[data-action="download"]').click();
  const download = await downloaded;
  const jsonPath = join(output, 'sample-layout-edits.json');
  await download.saveAs(jsonPath);
  const json = await readFile(jsonPath, 'utf8');
  const payload = JSON.parse(json);
  report.export = {
    file: 'sample-layout-edits.json',
    bytes: Buffer.byteLength(json),
    sha256: createHash('sha256').update(json).digest('hex'),
    integrity: payload.integrity,
    edited: payload.summary,
  };
  check(
    'download includes source mappings and actual derived paths',
    payload.components.length > 0 &&
      payload.projection.finalPaths.main.length === 385 &&
      payload.document.history.actions.length >= 5,
  );
  for (const sector of ['skyline', 'undercity', 'tunnel', 'falls']) {
    await page.locator(`[data-bookmark="${sector}"]`).click();
    await page.waitForTimeout(700);
    const b = `${sector}-edited.png`;
    await page.locator('#scene').screenshot({ path: join(output, b) });
    const camera = await page.evaluate(() => {
      const a = window.neonGridEditor;
      return {
        position: a.scene.camera.position.toArray(),
        quaternion: a.scene.camera.quaternion.toArray(),
      };
    });
    await page.locator('[data-action="compare"]').click();
    await page.waitForTimeout(300);
    const a = `${sector}-original.png`;
    await page.locator('#scene').screenshot({ path: join(output, a) });
    const compared = await page.evaluate(() => {
      const a = window.neonGridEditor;
      return {
        position: a.scene.camera.position.toArray(),
        quaternion: a.scene.camera.quaternion.toArray(),
      };
    });
    check(
      `matched ${sector} comparison camera`,
      JSON.stringify(camera) === JSON.stringify(compared),
    );
    report.captures.push({ sector, original: a, edited: b, camera });
    await page.locator('[data-action="compare"]').click();
  }
  const geometryDigest = async () => {
    const a = window.neonGridEditor;
    const seen = new Map();
    const hash = async (data) =>
      Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), (b) =>
        b.toString(16).padStart(2, '0'),
      ).join('');
    const records = [];
    for (const [id, c] of a.session.catalogue.components) {
      const g = c.object.geometry;
      let digest = seen.get(g);
      if (!digest) {
        const position = g.getAttribute('position').array;
        const index = g.index?.array;
        digest = {
          position: await hash(
            new Uint8Array(position.buffer, position.byteOffset, position.byteLength),
          ),
          index: index
            ? await hash(new Uint8Array(index.buffer, index.byteOffset, index.byteLength))
            : null,
        };
        seen.set(g, digest);
      }
      records.push([id, digest, a.session.projection.matrixFor(id).toArray(), c.visible]);
    }
    return {
      components: records.length,
      uniqueGeometries: seen.size,
      sha256: await hash(new TextEncoder().encode(JSON.stringify(records))),
    };
  };
  report.editedGeometry = await page.evaluate(geometryDigest);
  const fresh = await context.newPage();
  fresh.setDefaultTimeout(120000);
  await fresh.goto(base);
  await fresh.waitForFunction(() => !!window.neonGridEditor);
  await fresh.locator('#edit-file').setInputFiles(jsonPath);
  await fresh.waitForFunction(
    () => window.neonGridEditor.session.history.snapshot().history.cursor > 0,
  );
  const restored = await fresh.evaluate(() => {
    const a = window.neonGridEditor;
    return {
      state: a.session.history.snapshot(),
      projection: a.session.projection.describe(a.session.history.snapshot()),
    };
  });
  check(
    'fresh-page import reproduces final road and overrides',
    JSON.stringify(restored.state.road) === JSON.stringify(payload.document.road) &&
      JSON.stringify(restored.state.overrides) === JSON.stringify(payload.document.overrides),
  );
  report.restoredGeometry = await fresh.evaluate(geometryDigest);
  check(
    'fresh import reproduces every position/index buffer, world matrix and visibility',
    report.editedGeometry.sha256 === report.restoredGeometry.sha256,
  );
  check(
    'fresh-page import reproduces derived geometry paths',
    JSON.stringify(restored.projection.finalPaths) ===
      JSON.stringify(payload.projection.finalPaths),
  );
  const before = await fresh.evaluate(() => {
    const d = window.neonGridEditor.session.history.snapshot();
    return JSON.stringify({ road: d.road, overrides: d.overrides, history: d.history });
  });
  await fresh.locator('#edit-file').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"schemaVersion":999}'),
  });
  await fresh.waitForFunction(() =>
    document.querySelector('#status').textContent.includes('Import rejected'),
  );
  check(
    'corrupt import is transactional',
    await fresh.evaluate((before) => {
      const d = window.neonGridEditor.session.history.snapshot();
      return (
        JSON.stringify({ road: d.road, overrides: d.overrides, history: d.history }) === before
      );
    }, before),
  );
  report.finalMetrics = await page.evaluate(() => window.neonGridEditor.scene.metrics());
  check('no missing asset requests', responses.length === 0);
  check('no browser/WebGL errors', errors.length === 0);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = String(error);
  await page.screenshot({ path: join(output, 'failure.png') }).catch(() => {});
  throw error;
} finally {
  await writeFile(join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(
    JSON.stringify({
      passed: report.passed,
      checks: checks.length,
      output,
      failure: report.failure,
    }),
  );
}
