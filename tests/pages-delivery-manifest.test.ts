import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const helper = 'tools/ci/pages_delivery_manifest.py';

function withTemporaryDirectory(run: (directory: string) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'production-pages-manifest-'));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function python(source: string): string {
  const result = spawnSync('python3', ['-c', source], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout;
}

describe('production-only Pages delivery manifest', () => {
  it('keeps PR preview checks while making Pages assembly production-only and PR deployment impossible', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
    const assemble = workflow.slice(
      workflow.indexOf('  assemble:\n'),
      workflow.indexOf('\n  spillway-render:', workflow.indexOf('  assemble:\n')),
    );
    const deploy = workflow.slice(workflow.indexOf('  deploy:\n'));
    const previewBuild = workflow.slice(
      workflow.indexOf('  preview-build:\n'),
      workflow.indexOf('\n  task-c1-pinned-validation:', workflow.indexOf('  preview-build:\n')),
    );

    expect(workflow).toContain('  validate:\n    name: validate');
    expect(previewBuild).toContain("if: github.event_name == 'pull_request'");
    expect(workflow).toContain("if: github.event_name == 'pull_request'\n    runs-on: ubuntu-latest\n    timeout-minutes: 15\n    steps:");
    expect(workflow).toContain('  pinned-runtime-validation:\n    name: pinned-runtime-validation (${{ matrix.id }})\n    if: always() && github.event_name == \'pull_request\'');
    expect(assemble).toContain('needs: [validate, preview-plan]');
    expect(assemble).toContain('tools/ci/pages_delivery_manifest.py');
    expect(assemble).toContain('actions/upload-pages-artifact@v5');
    expect(assemble).not.toContain('preview-output/');
    expect(assemble).not.toContain('actions/cache/restore@');
    expect(deploy).toContain("if: github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(deploy).toContain('--verify-live delivery-expected.json');
    expect(workflow).not.toMatch(/^\s+paths(-ignore)?:/m);
  });

  it('retains exact production files, filters only .gitkeep, and refuses preview trees', () => {
    withTemporaryDirectory((directory) => {
      const root = join(directory, 'site-root');
      mkdirSync(join(root, 'assets', 'models'), { recursive: true });
      writeFileSync(join(root, 'index.html'), '<main>game</main>');
      writeFileSync(join(root, 'assets', 'models', 'kart.glb'), 'model');
      writeFileSync(join(root, 'assets', '.gitkeep'), '');
      const output = join(directory, 'delivery.json');
      execFileSync('python3', [helper, '--root', root, '--output', output]);

      const manifest = JSON.parse(readFileSync(output, 'utf8')) as {
        path: string;
        sha256: string;
        bytes: number;
      }[];
      expect(manifest.map((entry) => entry.path)).toEqual([
        'assets/models/kart.glb',
        'index.html',
      ]);
      expect(manifest[0]).toMatchObject({
        sha256: createHash('sha256').update('model').digest('hex'),
        bytes: 5,
      });

      mkdirSync(join(root, 'previews', 'historical'), { recursive: true });
      writeFileSync(join(root, 'previews', 'historical', 'index.html'), 'preview');
      const rejected = spawnSync('python3', [helper, '--root', root, '--output', output], {
        encoding: 'utf8',
      });
      expect(rejected.status).not.toBe(0);
      expect(rejected.stderr).toContain('must not contain a previews/ directory');
    });
  });

  it('accepts only the previously approved exact paths and hashes', () => {
    const checks = [
      [
        'assets/audio/music-opus-192k/01-circuit-alpha-race-loop.ogg',
        'c361e256dab8b02faea12f49ad3d8ffffddc1e1a84c604d8a0488f52122501d4',
      ],
      [
        'assets/audio/music-opus-192k/02-circuit-alpha-final-lap-loop.ogg',
        '4c25b5a7e903af69ff1f3569af9310f09f6e0476bd78cd29ccb95900d43f27f8',
      ],
      [
        'assets/audio/music-opus-192k/03-route-night-title-hub-loop.ogg',
        '3f590baa08d0ea2a1dd3900ea7c05965d1bb38cee3028bbbee4556c1f82841b7',
      ],
      [
        'assets/audio/music-opus-192k/04-grid-preparation-character-select-loop.ogg',
        'efbee32d1ac0ece009530fb0f1f8231f16f4a5d2bb96f35e7023b3af323fdaa8',
      ],
      [
        'assets/audio/music-opus-192k/05-finish-celebration-results-podium-loop.ogg',
        '6dad9dfef171913daec3974e59ce82ea9e708e8c4e854bb682ee11808994bd9a',
      ],
    ];
    const script = `import sys\nsys.path.insert(0, 'tools/ci')\nimport pages_delivery_manifest as gate\nchecks = ${JSON.stringify(checks)}\nfor path, digest in checks:\n    assert gate.is_approved_new_production_asset(path, digest)\n    try:\n        gate.is_approved_new_production_asset(path, '0' * 64)\n    except RuntimeError:\n        pass\n    else:\n        raise AssertionError('wrong hash accepted: ' + path)\nfor path in ['assets/audio/music-opus-192k/06-unlisted.ogg', 'assets/audio/music-opus-192k-extra/01-circuit-alpha-race-loop.ogg']:\n    assert not gate.is_approved_new_production_asset(path, '0' * 64)`;
    expect(python(script)).toBe('');
  });

  it('preserves pre-publication HTTP 404 and byte/hash mismatch failures', () => {
    const script = [
      "import sys, urllib.error, urllib.request",
      "sys.path.insert(0, 'tools/ci')",
      'import pages_delivery_manifest as gate',
      'class Response:',
      '    status = 200',
      '    def __enter__(self): return self',
      '    def __exit__(self, *args): return False',
      '    def read(self): return b"existing bytes"',
      'def fake_urlopen(request, timeout):',
      '    if request.full_url.endswith("/missing"): raise urllib.error.HTTPError(request.full_url, 404, "Not Found", {}, None)',
      '    return Response()',
      'urllib.request.urlopen = fake_urlopen',
      "import hashlib\nexpected = hashlib.sha256(b'existing bytes').hexdigest()",
      "gate.verify_published_file('https://example.invalid/real', 'assets/audio/real.wav', expected)",
      'try:',
      "    gate.verify_published_file('https://example.invalid/missing', 'assets/audio/missing.wav', expected)",
      'except RuntimeError as error:',
      '    assert "HTTP 404" in str(error)',
      'else: raise AssertionError("HTTP 404 was accepted")',
      'try:',
      "    gate.verify_published_file('https://example.invalid/real', 'assets/audio/real.wav', '0' * 64)",
      'except AssertionError as error:',
      '    assert "Production bytes differ" in str(error)',
      'else: raise AssertionError("hash mismatch was accepted")',
    ].join('\n');
    expect(python(script)).toBe('');
  });

  it('keeps rebuilt entrypoint exemptions narrow and records those files for live verification', () => {
    const script = [
      "import sys\nsys.path.insert(0, 'tools/ci')",
      'import pages_delivery_manifest as gate',
      "assert gate.is_rebuilt_application_entrypoint('index.html')",
      "assert gate.is_rebuilt_application_entrypoint('assets/index-abcd.js')",
      "assert gate.is_rebuilt_application_entrypoint('assets/index-abcd.css')",
      "assert not gate.is_rebuilt_application_entrypoint('assets/models/kart.glb')",
      "assert not gate.is_rebuilt_application_entrypoint('previews/old/index.html')",
    ].join('\n');
    expect(python(script)).toBe('');
  });
});
