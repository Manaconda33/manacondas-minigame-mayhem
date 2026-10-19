import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
const require = createRequire(
  `${process.env.NEON_GRID_EDITOR_PLAYWRIGHT ?? '/workspace/mayhem-browser-tools/node_modules'}/package.json`,
);
const { chromium } = require('playwright');
const out = resolve(process.argv[2] ?? 'docs/evidence/2026-10-19-neon-grid-layout-editor/gestures');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.NEON_GRID_EDITOR_CHROME ?? '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const context = await browser.newContext({ viewport: { width: 1500, height: 940 } });
const page = await context.newPage();
page.setDefaultTimeout(60000);
const report = { checks: [], parity: [], errors: [] };
page.on('pageerror', (e) => report.errors.push(String(e)));
function check(name, ok) {
  if (!ok) throw Error(name);
  report.checks.push({ name, passed: true });
  console.log(`PASS ${name}`);
}
const state = () =>
  page.evaluate(() => {
    const a = window.neonGridEditor;
    const d = a.session.history.snapshot();
    return {
      camera: a.scene.camera.position.toArray(),
      view: d.view,
      road: d.road,
      overrides: d.overrides,
      cursor: d.history.cursor,
    };
  });
try {
  await page.goto(process.env.NEON_GRID_EDITOR_URL ?? 'http://127.0.0.1:5179/');
  await page.waitForFunction(() => !!window.neonGridEditor);
  await page.locator('#loading').waitFor({ state: 'hidden' });
  const canvas = await page.locator('#scene').boundingBox();
  const cx = canvas.x + canvas.width * 0.55,
    cy = canvas.y + canvas.height * 0.5;
  const initial = await state();
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 70, cy + 25, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  check(
    'left-drag orbits the camera',
    JSON.stringify((await state()).camera) !== JSON.stringify(initial.camera),
  );
  const beforePan = await state();
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(cx + 50, cy + 15, { steps: 8 });
  await page.mouse.up({ button: 'right' });
  await page.waitForTimeout(1200);
  check(
    'right-drag pans the target',
    JSON.stringify((await state()).view.target) !== JSON.stringify(beforePan.view.target),
  );
  const beforeZoom = await state();
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(1200);
  check(
    'wheel zoom changes camera distance',
    JSON.stringify((await state()).camera) !== JSON.stringify(beforeZoom.camera),
  );
  check('camera navigation never edits geometry', (await state()).cursor === 0);
  await page.locator('[data-bookmark="course"]').click();
  await page.waitForTimeout(1500);
  await page.locator('[data-mode="box"]').click();
  const beforeBox = await state();
  await page.mouse.move(canvas.x + 40, canvas.y + 60);
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width - 35, canvas.y + canvas.height - 60, { steps: 8 });
  await page.mouse.up();
  check(
    'actual marquee drag selects multiple visible components',
    await page.evaluate(() => window.neonGridEditor.selection.ids.length > 10),
  );
  check(
    'marquee selection does not orbit camera',
    JSON.stringify((await state()).camera) === JSON.stringify(beforeBox.camera),
  );
  await page.locator('#logical-groups').uncheck();
  await page.locator('#search').fill('skyline city towers');
  await page.locator('#outliner button').first().click();
  await page.locator('[data-action="frame"]').click();
  await page.waitForTimeout(1500);
  // Real ray-pick at the framed building centre, rather than invoking a selection method.
  await page.locator('[data-mode="select"]').click();
  await page.mouse.click(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  check(
    'viewport ray picking selects one component',
    await page.evaluate(() => window.neonGridEditor.selection.ids.length === 1),
  );
  await page.locator('#outliner button').first().click();
  await page.locator('[data-mode="translate"]').click();
  await page.waitForTimeout(400);
  const handle = await page.evaluate(() => {
    const a = window.neonGridEditor;
    let gizmo;
    a.scene.overlayScene.traverse((o) => {
      if (o.type === 'TransformControlsGizmo') gizmo = o;
    });
    const o = gizmo.gizmo.translate.children.find((o) => o.name === 'X' && o.isMesh && o.visible);
    o.geometry.computeBoundingBox();
    const p = o.geometry.boundingBox
      .getCenter(a.scene.camera.position.clone())
      .applyMatrix4(o.matrixWorld)
      .project(a.scene.camera);
    const r = a.scene.renderer.domElement.getBoundingClientRect();
    return { x: r.x + ((p.x + 1) * r.width) / 2, y: r.y + ((1 - p.y) * r.height) / 2 };
  });
  const beforeGizmo = await state();
  await page.mouse.move(handle.x, handle.y);
  await page.mouse.down();
  check(
    'real gizmo pointer begins a transaction',
    await page.evaluate(() => window.neonGridEditor.session.history.inGesture),
  );
  await page.mouse.move(handle.x + 45, handle.y, { steps: 10 });
  await page.mouse.up();
  check('gizmo drag creates one undo action', (await state()).cursor === beforeGizmo.cursor + 1);
  check(
    'gizmo drag changes source-mapped transforms',
    JSON.stringify((await state()).overrides) !== JSON.stringify(beforeGizmo.overrides),
  );
  await page.locator('[data-action="undo"]').click();
  check(
    'gizmo undo restores exact transforms',
    JSON.stringify((await state()).overrides) === JSON.stringify(beforeGizmo.overrides),
  );
  const x = page.getByRole('spinbutton', { name: 'position X', exact: true });
  await x.focus();
  await page.keyboard.press('Control+z');
  check(
    'text-field undo does not consume editor history',
    (await state()).cursor === beforeGizmo.cursor,
  );
  await x.press('Tab');
  // Exact save-A / hold-preview-B / cancel-B timing through the real UI recovery pipeline.
  const recoveryState = await page.evaluate(() => {
    const a = window.neonGridEditor,
      id = a.selection.ids[0];
    a.session.edit('Recovery A', (s) => {
      s.overrides[id] = { matrix: a.session.projection.matrixFor(id).toArray(), deleted: false };
      s.overrides[id].matrix[12] += 2;
    });
    a.refresh();
    const committed = a.session.history.snapshot();
    a.session.history.begin('Held B');
    a.session.history.preview((s) => {
      s.overrides[id].matrix[12] += 8;
    });
    a.refresh(false);
    return { id, matrix: committed.overrides[id].matrix };
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const a = window.neonGridEditor;
    a.session.history.cancel();
    a.refresh(false);
  });
  await page.waitForTimeout(1300);
  const recovered = await page.context().newPage();
  await recovered.goto(process.env.NEON_GRID_EDITOR_URL ?? 'http://127.0.0.1:5179/');
  await recovered.waitForFunction(() => !!window.neonGridEditor);
  await recovered.locator('[data-action="recover"]').waitFor({ state: 'visible' });
  await recovered.locator('[data-action="recover"]').click();
  await recovered.waitForFunction(
    () => window.neonGridEditor.session.history.snapshot().history.cursor > 0,
  );
  check(
    'cancelled held drag preserves preceding edit in actual IndexedDB recovery',
    await recovered.evaluate(
      ({ id, matrix }) =>
        JSON.stringify(window.neonGridEditor.session.history.snapshot().overrides[id].matrix) ===
        JSON.stringify(matrix),
      recoveryState,
    ),
  );
  await recovered.close();
  // Restore the source design before pixel comparisons.
  await page.evaluate(() => {
    const a = window.neonGridEditor;
    a.session.reset();
    a.refresh(false);
  });
  // Compare extracted editor ranges with the actual untouched source mesh at identical cameras.
  await page.evaluate(() => {
    const a = window.neonGridEditor;
    a.selection.clear();
    a.setMode('select');
    a.refresh(false);
  });
  await page.locator('#show-helpers').uncheck();
  for (const sector of ['skyline', 'undercity', 'tunnel', 'falls']) {
    await page.locator(`[data-bookmark="${sector}"]`).click();
    await page.waitForTimeout(1500);
    const edited = Buffer.from(
      (
        await page.evaluate(() => {
          const a = window.neonGridEditor;
          a.scene.render(a.session.history.view());
          return a.scene.renderer.domElement.toDataURL('image/png');
        })
      ).split(',')[1],
      'base64',
    );
    await writeFile(join(out, `${sector}-editor-baseline.png`), edited);
    await page.evaluate(() => {
      const a = window.neonGridEditor;
      a.scene.root.traverse((o) => {
        if (o.userData.editorSourceRange) o.visible = false;
        if (o.userData.editorExtracted) o.visible = true;
      });
      a.scene.render(a.session.history.view());
    });
    const source = Buffer.from(
      (
        await page.evaluate(() => {
          const a = window.neonGridEditor;
          a.scene.render(a.session.history.view());
          return a.scene.renderer.domElement.toDataURL('image/png');
        })
      ).split(',')[1],
      'base64',
    );
    await writeFile(join(out, `${sector}-source-mesh.png`), source);
    const hash = (b) => createHash('sha256').update(b).digest('hex');
    report.parity.push({
      sector,
      editor_sha256: hash(edited),
      source_sha256: hash(source),
      exact_png_match: edited.equals(source),
    });
    await page.evaluate(() => {
      const a = window.neonGridEditor;
      a.scene.root.traverse((o) => {
        if (o.userData.editorSourceRange) o.visible = true;
        if (o.userData.editorExtracted) o.visible = false;
      });
      a.scene.render(a.session.history.view());
    });
  }
  check('no browser exceptions', report.errors.length === 0);
  report.passed = true;
} catch (e) {
  report.passed = false;
  report.failure = String(e);
  await page.screenshot({ path: join(out, 'failure.png') }).catch(() => {});
  throw e;
} finally {
  await writeFile(join(out, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(
    JSON.stringify({
      passed: report.passed,
      failure: report.failure,
      checks: report.checks.length,
    }),
  );
}
