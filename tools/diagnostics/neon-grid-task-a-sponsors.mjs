import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const require = createRequire(`${process.env.NEON_GRID_COURSE_PLAYWRIGHT}/package.json`);
const { chromium } = require('playwright');
const baseUrl = process.argv[2],
  variant = process.argv[3],
  out = process.argv[4];
if (!baseUrl || !variant || !out)
  throw new Error('Pass base URL, visual selector, output directory');
const layout = process.argv[5] ?? 'desktop';
const viewport =
  layout === 'mobile-portrait' ? { width: 390, height: 844 } : { width: 1920, height: 1080 };
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.NEON_GRID_COURSE_CHROME ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
await page.addInitScript(() => {
  let state = 1417;
  const original = Math.random;
  Math.random = () => {
    if (!(new Error().stack ?? '').includes('raceRoster')) return original();
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
});
await page.goto(
  `${baseUrl.replace(/\/$/, '')}/tools/diagnostics/neon-grid-course.html?quality=medium&testRacePerf=1&neonGridVisual=${variant}`,
);
await page.waitForFunction(
  () =>
    window.ready &&
    window.game.opponents.length === 7 &&
    window.game.opponents.every((o) => o.mesh.children[0]?.type === 'Group'),
);
await page.waitForFunction(() =>
  [
    'skyline-ad-manaconda-racing',
    'skyline-ad-taco-bell-live-mas',
    'undercity-ad-nightshift-noodles',
    'undercity-ad-voltline-industrial',
  ].every((n) => window.game.trackScene.getObjectByName(n).material.map.image?.width > 0),
);
const inventory = await page.evaluate(() => {
  const g = window.game,
    T = window.THREE;
  g.trackScene.updateMatrixWorld(true);
  const signs = [];
  for (const name of [
    'skyline-ad-manaconda-racing',
    'skyline-ad-taco-bell-live-mas',
    'undercity-ad-nightshift-noodles',
    'undercity-ad-voltline-industrial',
  ]) {
    const mesh = g.trackScene.getObjectByName(name);
    for (let i = 0; i < mesh.count; i++) {
      const m = new T.Matrix4();
      mesh.getMatrixAt(i, m);
      m.premultiply(mesh.matrixWorld);
      const p = new T.Vector3().setFromMatrixPosition(m),
        q = g.track.projectMain(p);
      signs.push({
        name,
        index: i,
        center: p.toArray(),
        progress: q.progress,
        roadY: q.point.y,
        heightAboveRoad: p.y - q.point.y,
        normal: new T.Vector3(0, 0, 1).transformDirection(m).toArray(),
        matrix: m.toArray(),
        width: mesh.geometry.parameters.width,
        height: mesh.geometry.parameters.height,
        image: mesh.material.map.image.currentSrc ?? mesh.material.map.image.src,
        imageWidth: mesh.material.map.image.width,
        imageHeight: mesh.material.map.image.height,
      });
    }
  }
  const architecture = {};
  for (const name of ['skyline-city-towers', 'undercity-city-buildings']) {
    const mesh = g.trackScene.getObjectByName(name);
    architecture[name] = [];
    for (let i = 0; i < mesh.count; i++) {
      const m = new T.Matrix4();
      mesh.getMatrixAt(i, m);
      const p = new T.Vector3(),
        q = new T.Quaternion(),
        s = new T.Vector3();
      m.decompose(p, q, s);
      architecture[name].push({
        index: i,
        center: p.toArray(),
        size: s.toArray(),
        roof: p.y + s.y,
        road: g.track.projectMain(p).point.y,
        progress: g.track.projectMain(p).progress,
      });
    }
  }
  return { signs, architecture, roster: g.opponents.map((o) => o.characterId).sort() };
});
const captures = [];
const assets = [];
for (const url of [...new Set(inventory.signs.map((s) => s.image))]) {
  const response = await page.request.get(url);
  const bytes = await response.body();
  assets.push({
    url,
    status: response.status(),
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
  });
  if (!response.ok()) throw new Error(`Sponsor asset failed: ${url}`);
}
const anchors = layout === 'desktop'
  ? [0.076, 0.135, 0.17, 0.245, 0.278, 0.34, 0.402, 0.43, 0.755]
  : [0.045, 0.125, 0.17, 0.245, 0.278, 0.34, 0.402, 0.43, 0.755];
for (const p of anchors) {
  await page.evaluate((p) => window.stageCourseAtProgress(p), p);
  for (const view of layout === 'desktop' ? ['chase', 'rear'] : ['chase']) {
    const frame = await page.evaluate((view) => window.renderFrame(true, view), view);
    const visibility = await page.evaluate(() => {
      const g = window.game,
        T = window.THREE,
        results = [],
        ray = new T.Raycaster(),
        m = new T.Matrix4();
      const blockers = [];
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        for (let a = o; a; a = a.parent) if (!a.visible) return;
        const mat = Array.isArray(o.material) ? o.material[0] : o.material;
        if (mat.transparent && mat.opacity < 0.9) return;
        blockers.push(o);
      });
      for (const name of [
        'skyline-ad-manaconda-racing',
        'skyline-ad-taco-bell-live-mas',
        'undercity-ad-nightshift-noodles',
        'undercity-ad-voltline-industrial',
      ]) {
        const mesh = g.trackScene.getObjectByName(name),
          w = mesh.geometry.parameters.width,
          h = mesh.geometry.parameters.height;
        for (let i = 0; i < mesh.count; i++) {
          mesh.getMatrixAt(i, m);
          m.premultiply(mesh.matrixWorld);
          const center = new T.Vector3().setFromMatrixPosition(m),
            ndc = center.clone().project(g.camera);
          if (ndc.z < -1 || ndc.z > 1 || Math.abs(ndc.x) > 1.2 || Math.abs(ndc.y) > 1.2) continue;
          const points = [],
            hidden = [];
          let visible = 0;
          for (const [u, v] of [
            [0, 0],
            [-0.4, -0.4],
            [0.4, -0.4],
            [-0.4, 0.4],
            [0.4, 0.4],
          ]) {
            const point = new T.Vector3(u * w, v * h, 0).applyMatrix4(m),
              projected = point.clone().project(g.camera);
            points.push(projected.toArray());
            const direction = point.clone().sub(g.camera.position);
            ray.set(g.camera.position, direction.clone().normalize());
            ray.far = direction.length() + 0.1;
            const hits = ray.intersectObjects(blockers, false),
              own = hits.find((x) => x.object === mesh && x.instanceId === i),
              block = hits.find(
                (x) =>
                  !(x.object === mesh && x.instanceId === i) &&
                  x.distance < (own?.distance ?? Infinity) - 0.02,
              );
            if (own && !block && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1)
              visible++;
            if (block) hidden.push(block.object.name);
          }
          const xs = points.map((p) => p[0]),
            ys = points.map((p) => p[1]);
          results.push({
            name,
            index: i,
            visibleSamples: visible,
            totalSamples: 5,
            widthPx: ((Math.max(...xs) - Math.min(...xs)) * innerWidth) / 2,
            heightPx: ((Math.max(...ys) - Math.min(...ys)) * innerHeight) / 2,
            blockers: [...new Set(hidden)],
          });
        }
      }
      return results;
    });
    await page.screenshot({ path: `${out}/${p}-${view}.png` });
    const camera = await page.evaluate(() => ({
      position: window.game.camera.position.toArray(),
      rotation: window.game.camera.rotation.toArray(),
      fov: window.game.camera.fov,
      aspect: window.game.camera.aspect,
    }));
    captures.push({
      progress: p,
      view,
      camera,
      frame: {
        calls: frame.calls,
        triangles: frame.triangles,
        geometries: frame.geometries,
        textures: frame.textures,
        width: frame.width,
        height: frame.height,
        pixelRatio: frame.pixelRatio,
        racers: frame.racers,
      },
      visibility,
    });
    console.log(
      p,
      view,
      visibility
        .filter((x) => x.visibleSamples >= 3)
        .map((x) => `${x.name}:${x.index} ${Math.round(x.widthPx)}px`)
        .join(','),
    );
  }
}
const courseLength = await page.evaluate(() => window.game.track.curve.getLength());
const stationCount = Math.ceil(courseLength / 8);
const sweep = await page.evaluate(
  ({ stationCount, layout }) => {
    const frames = [];
    for (let i = 0; i < stationCount; i++) {
      const progress = i / stationCount;
      window.stageCourseAtProgress(progress);
      for (const view of layout === 'desktop' ? ['chase', 'rear'] : ['chase']) {
        const f = window.renderFrame(true, view);
        frames.push({ progress, view, calls: f.calls, triangles: f.triangles });
      }
    }
    return frames;
  },
  { stationCount, layout },
);
const maximum = {
  calls: Math.max(...sweep.map((f) => f.calls)),
  triangles: Math.max(...sweep.map((f) => f.triangles)),
};
writeFileSync(
  `${out}/audit.json`,
  JSON.stringify(
    {
      variant,
      layout,
      viewport,
      renderer: 'Chromium software WebGL/SwiftShader; not G-05',
      inventory,
      assets,
      captures,
      courseLength,
      stationCount,
      maximumSampleSpacing: courseLength / stationCount,
      sweep,
      maximum,
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
console.log('Full course sweep', stationCount, maximum);
if (errors.length || maximum.calls > 500 || maximum.triangles > 425000)
  throw new Error('Task A browser/budget gate failed');
