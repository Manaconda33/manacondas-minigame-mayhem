import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const require = createRequire('/workspace/mayhem-browser-tools/node_modules/package.json');
const { chromium } = require('playwright');
const out = resolve(process.argv[2] ?? '/tmp/neon-grid-editor-layers');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.NEON_GRID_EDITOR_CHROME ?? '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1500, height: 940 } });
page.setDefaultTimeout(60000);
const report = { checks: [], errors: [] };
page.on('pageerror', (e) => report.errors.push(String(e)));
function check(name, passed) {
  if (!passed) throw Error(name);
  report.checks.push({ name, passed });
  console.log(`PASS ${name}`);
}
try {
  await page.goto(process.env.NEON_GRID_EDITOR_URL ?? 'http://127.0.0.1:5179/');
  await page.waitForFunction(() => !!window.neonGridEditor);
  await page.locator('#loading').waitFor({ state: 'hidden' });
  const records = await page.evaluate(() => {
    const a = window.neonGridEditor;
    const entries = a.session.catalogue.entries;
    const towers = entries.filter((e) =>
      e.scenePath.includes('falls-run-city-terraced-ground::cityTowers/'),
    );
    const foundations = entries.filter((e) =>
      e.scenePath.includes('falls-run-city-terraced-ground::cityFoundations/'),
    );
    const ground = entries.find((e) =>
      e.scenePath.includes('falls-run-city-terraced-ground::cityGround'),
    );
    return {
      source: a.session.baseline.editorBuildSha,
      catalogueHash: a.session.catalogue.hash,
      total: entries.length,
      towers,
      foundations,
      ground,
      platforms: entries.filter((e) => e.scenePath.includes('::cityGround')).length,
    };
  });
  report.catalogue = records;
  check(
    'all four city platform families and 24 individual Falls towers/foundations are editable',
    records.platforms >= 4 &&
      records.towers.length === 24 &&
      records.foundations.length === 24 &&
      records.ground.groupId === null,
  );
  await page.locator('#logical-groups').uncheck();
  await page.locator('[data-bookmark="falls"]').click();
  await page.locator('#search').fill(records.ground.label);
  await page.locator('#outliner button').first().click();
  check(
    'terraced platform selects independently through the outliner',
    await page.evaluate(
      (id) => JSON.stringify(window.neonGridEditor.selection.ids) === JSON.stringify([id]),
      records.ground.id,
    ),
  );
  await page.locator('[data-action="frame"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, 'falls-platform-selected.png') });
  await page.locator('[data-action="delete"]').click();
  check(
    'deleting the platform leaves all individual tower bodies visible',
    await page.evaluate(({ ground, towers }) => {
      const a = window.neonGridEditor;
      return (
        a.session.history.snapshot().overrides[ground.id]?.deleted === true &&
        towers.every((t) => a.session.catalogue.components.get(t.id).visible)
      );
    }, records),
  );
  await page.locator('[data-action="undo"]').click();
  check(
    'undo restores the platform',
    await page.evaluate(
      (id) => window.neonGridEditor.session.catalogue.components.get(id).visible,
      records.ground.id,
    ),
  );
  const tower = records.towers[0];
  await page.locator('#search').fill(tower.label);
  await page.locator('#outliner button').first().click();
  check(
    'one tower body selects independently',
    await page.evaluate(
      (id) => JSON.stringify(window.neonGridEditor.selection.ids) === JSON.stringify([id]),
      tower.id,
    ),
  );
  const position = page.locator('[data-fields="position"] input').first();
  await position.fill(String(Number(await position.inputValue()) + 5));
  await position.press('Tab');
  const exported = await page.evaluate(() => window.neonGridEditor.session.download());
  const payload = JSON.parse(exported);
  check(
    'moving one tower exports only that override',
    Object.keys(payload.document.overrides).length === 1 && !!payload.document.overrides[tower.id],
  );
  await page.evaluate(async (json) => {
    const a = window.neonGridEditor;
    a.session.reset();
    await a.session.load(json);
    a.refresh(false);
  }, exported);
  check(
    'export/import exactly restores the isolated tower transform',
    await page.evaluate(
      ({ id, matrix }) =>
        JSON.stringify(window.neonGridEditor.session.projection.matrixFor(id).toArray()) ===
        JSON.stringify(matrix),
      { id: tower.id, matrix: payload.document.overrides[tower.id].matrix },
    ),
  );
  await page.locator('#logical-groups').check();
  await page.locator('#outliner button').first().click();
  check(
    'whole-building selection groups its parts and excludes the platform',
    await page.evaluate(
      ({ id, ground }) => {
        const a = window.neonGridEditor,
          entry = a.session.catalogue.components.get(id).record;
        return (
          a.selection.ids.length > 1 &&
          !a.selection.ids.includes(ground) &&
          a.selection.ids.every(
            (x) => a.session.catalogue.components.get(x).record.groupId === entry.groupId,
          )
        );
      },
      { id: tower.id, ground: records.ground.id },
    ),
  );
  const before = await page.evaluate(() =>
    [...window.neonGridEditor.session.catalogue.components].map(([id, c]) => [
      id,
      c.object.matrixWorld.toArray(),
      c.visible,
    ]),
  );
  await page.locator('#show-fog').uncheck();
  await page.waitForTimeout(250);
  check(
    'fog layer hides atmosphere while preserving every geometry transform and visibility',
    await page.evaluate((before) => {
      const a = window.neonGridEditor;
      return (
        a.scene.scene.fog === null &&
        !a.scene.root.getObjectByName('neon-grid-abyss-fog-v3').visible &&
        JSON.stringify(before) ===
          JSON.stringify(
            [...a.session.catalogue.components].map(([id, c]) => [
              id,
              c.object.matrixWorld.toArray(),
              c.visible,
            ]),
          )
      );
    }, before),
  );
  await page.screenshot({ path: join(out, 'falls-independent-buildings-fog-off.png') });
  await page.locator('#show-fog').check();
  check(
    'track edits leave fog source anchors and backdrop fixed',
    await page.evaluate(() => {
      const a = window.neonGridEditor,
        backdrop = a.scene.root.getObjectByName('neon-grid-abyss-fog-v3');
      const matrix = JSON.stringify(backdrop.matrixWorld.toArray()),
        project = a.scene.track.projectMain;
      a.session.edit('Raise track without moving atmosphere', (s) => {
        s.road.controlPoints[0].position[1] += 3;
      });
      a.refresh(false);
      return (
        project === a.scene.track.projectMain &&
        matrix === JSON.stringify(backdrop.matrixWorld.toArray())
      );
    }),
  );
  report.metrics = await page.evaluate(() => window.neonGridEditor.scene.metrics());
  check('no browser errors', report.errors.length === 0);
} finally {
  await writeFile(join(out, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
