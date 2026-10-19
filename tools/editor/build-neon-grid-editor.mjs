import { build } from 'vite';
import { readFile, writeFile, mkdir, copyFile, readdir, stat, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function assertBuildIdentity(sha) {
  if (!/^[a-f0-9]{40}$/.test(sha ?? ''))
    throw new Error('Set an exact 40-character editor source SHA.');
}
export function verifyAsset(bytes, entry) {
  if (bytes.subarray(0, 50).toString().startsWith('version https://git-lfs.github.com/spec/v1'))
    throw new Error(`Unmaterialized LFS pointer: ${entry.path}`);
  if (
    entry.path.endsWith('.png') &&
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    throw new Error(`PNG signature mismatch: ${entry.path}`);
  if (
    entry.path.endsWith('.webp') &&
    (bytes.subarray(0, 4).toString() !== 'RIFF' || bytes.subarray(8, 12).toString() !== 'WEBP')
  )
    throw new Error(`WEBP signature mismatch: ${entry.path}`);
  if (sha256(bytes) !== entry.sha256)
    throw new Error(`Approved asset hash mismatch: ${entry.path}`);
}
export const editorHtmlAtRoot = (html) => html.replaceAll('../../assets/', './assets/');
export async function buildEditor() {
  const manifest = JSON.parse(
    await readFile(join(root, 'tools/editor/neon-grid-assets.json'), 'utf8'),
  );
  const source =
    process.env.NEON_GRID_EDITOR_SOURCE_SHA ??
    execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  assertBuildIdentity(source);
  const base = process.env.NEON_GRID_EDITOR_BASE ?? './';
  if (base !== './' && !/^\/[a-zA-Z0-9/_-]+\/$/.test(base))
    throw new Error('Editor base must be ./ or an absolute bounded preview path.');
  const out = join(root, 'dist-neon-grid-editor');
  // Verify approved source bytes before Vite empties its dedicated output directory.
  for (const entry of manifest.assets)
    verifyAsset(await readFile(join(root, 'public', entry.path)), entry);
  await build({
    configFile: false,
    root,
    base,
    publicDir: false,
    define: { 'import.meta.env.VITE_NEON_EDITOR_BUILD_SHA': JSON.stringify(source) },
    build: {
      outDir: out,
      emptyOutDir: true,
      target: 'es2022',
      rollupOptions: { input: join(root, 'tools/editor/neon-grid.html') },
    },
  });
  const generated = join(out, 'tools/editor/neon-grid.html');
  await writeFile(join(out, 'index.html'), editorHtmlAtRoot(await readFile(generated, 'utf8')));
  await rm(join(out, 'tools'), { recursive: true, force: true });
  for (const entry of manifest.assets) {
    const destination = join(out, entry.path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(join(root, 'public', entry.path), destination);
    verifyAsset(await readFile(destination), entry);
  }
  await writeFile(
    join(out, 'review-build.json'),
    JSON.stringify(
      {
        product: "Manaconda's Minigame Mayhem",
        artifact: 'Neon Grid Layout Studio',
        source,
        runtime_source: manifest.runtime_source,
        selectors: { material: 'concrete-coverage-c2-001', visual: 'c2-task-a-fog-overlay' },
        publication: 'separate editor artifact; no runtime application or production authorization',
        assets: manifest.assets,
      },
      null,
      2,
    ) + '\n',
  );
  await writeFile(
    join(out, 'START-HERE.md'),
    `# Neon Grid Layout Studio\n\nOpen a terminal in this extracted folder and run:\n\n    python3 serve.py\n\nOn Windows, use: py serve.py\n\nThe helper serves only this folder on your own computer and opens the editor in a browser. Keep the terminal open while editing. Do not open index.html directly as a file; browser module/texture security requires HTTP.\n\nOrbit: left drag. Pan: right drag. Zoom: scroll. Ctrl/Cmd-click adds to selection. Use Box select or Shift-drag for group selection (through objects on visible layers). W/E/R move/rotate/scale. T shows track control points. F frames selection. Delete hides selected components. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z redoes.\n\nSelect whole buildings is on initially; turn it off for individual parts. Inspector dimensions are world bounding sizes in metres. Rotate by and Scale by apply increments and then reset. Main track control points edit position/elevation and road width. Road attachments follow; background buildings stay put.\n\nDownload edits produces the JSON to share back with Codex. It contains the exact source/catalogue, original and final values, deleted components, road/shortcut paths, attachment evidence and action history. Load edits restores that file. Local recovery is a convenience; keep your downloaded file.\n\nThis is a visual design tool. Layout proposals may need shortcut/junction, triangulation, collision, AI and performance work before applying them to the game. Frozen scene lighting/materials/fog reuse the primary C2+Task A Fog V3.2 source. No driving or race simulation is included.\n\nSource: ${source}\nPrimary runtime: ${manifest.runtime_source}\n`,
  );
  await writeFile(
    join(out, 'serve.py'),
    `from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler\nfrom pathlib import Path\nfrom functools import partial\nimport webbrowser\n\nfolder = Path(__file__).resolve().parent\nserver = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(folder)))\nurl = "http://127.0.0.1:%d/" % server.server_address[1]\nprint("Neon Grid Layout Studio: " + url + " (Ctrl+C to stop)")\nwebbrowser.open(url)\ntry:\n    server.serve_forever()\nexcept KeyboardInterrupt:\n    server.server_close()\n`,
  );
  const files = [];
  async function walk(dir) {
    for (const name of (await readdir(dir)).sort()) {
      const p = join(dir, name);
      if ((await stat(p)).isDirectory()) await walk(p);
      else
        files.push({
          path: relative(out, p).replaceAll('\\', '/'),
          sha256: sha256(await readFile(p)),
        });
    }
  }
  await walk(out);
  await writeFile(
    join(out, 'FILE-MANIFEST.json'),
    JSON.stringify({ source, files }, null, 2) + '\n',
  );
  console.log(`Editor ready: ${out}/index.html; ${manifest.assets.length} exact approved assets.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await buildEditor();
