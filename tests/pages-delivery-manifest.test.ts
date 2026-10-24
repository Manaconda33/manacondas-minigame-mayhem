import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const workflowPath = '.github/workflows/ci.yml';

function readDeliveryManifestScript(): string {
  const workflow = readFileSync(workflowPath, 'utf8');
  const stepStart = workflow.indexOf(
    '- name: Record exact delivery hashes and verify production preservation before publication',
  );
  const pythonStart = workflow.indexOf("python3 - <<'PYTHON'", stepStart);
  const scriptStart = pythonStart + "python3 - <<'PYTHON'".length;
  const scriptEnd = workflow.indexOf('\n          PYTHON', scriptStart);

  expect(stepStart).toBeGreaterThanOrEqual(0);
  expect(pythonStart).toBeGreaterThan(stepStart);
  expect(scriptEnd).toBeGreaterThan(scriptStart);

  return workflow
    .slice(scriptStart, scriptEnd)
    .split('\n')
    .map((line) => line.replace(/^ {10}/, ''))
    .join('\n');
}

function readApprovedProductionAssetVerifier(): string {
  const script = readDeliveryManifestScript();
  const approvalStart = script.indexOf('approved_new_production_assets = {');
  const approvalEnd = script.indexOf("root = Path('site-root')", approvalStart);

  expect(approvalStart).toBeGreaterThanOrEqual(0);
  expect(approvalEnd).toBeGreaterThan(approvalStart);

  return script.slice(approvalStart, approvalEnd);
}

function withTemporaryDirectory(run: (directory: string) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'pages-assembly-without-checkout-'));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('Pages delivery manifest', () => {
  it('approves only the five exact Opus paths and source-manifest hashes', () => {
    const manifest = JSON.parse(
      readFileSync('assets/audio/music-opus-192k/manifest.json', 'utf8'),
    ) as { tracks: { file: string; sha256: string }[] };
    const opusAssets = manifest.tracks.map(({ file, sha256 }) => ({
      path: `assets/audio/music-opus-192k/${file}`,
      sha256,
      bytesSha256: createHash('sha256')
        .update(
          readFileSync(join('public', 'assets', 'audio', 'music-opus-192k', file)).toString('hex'),
          'hex',
        )
        .digest('hex'),
    }));

    expect(opusAssets).toHaveLength(5);
    for (const asset of opusAssets) expect(asset.bytesSha256).toBe(asset.sha256);

    const script = readApprovedProductionAssetVerifier();
    const cases = JSON.stringify(opusAssets.map(({ path, sha256 }) => ({ path, sha256 })));
    const python = [
      'import json',
      'from pathlib import Path',
      'import hashlib, time, urllib.error, urllib.request',
      script,
      `cases = json.loads(${JSON.stringify(cases)})`,
      'for item in cases:',
      '    assert is_approved_new_production_asset(item["path"], item["sha256"]) is True',
      '    try:',
      '        is_approved_new_production_asset(item["path"], "0" * 64)',
      '    except RuntimeError as error:',
      '        assert "Unexpected content for approved new production asset" in str(error)',
      '    else:',
      '        raise AssertionError(f"Wrong hash accepted for {item[\'path\']}")',
      'unlisted = [',
      '    "assets/audio/music-opus-192k/06-unlisted.ogg",',
      '    "assets/audio/music-opus-192k/subdir/01-circuit-alpha-race-loop.ogg",',
      '    "assets/audio/music-opus-192k-extra/01-circuit-alpha-race-loop.ogg",',
      '    "assets/audio/music-opus-192k/01-circuit-alpha-race-loop-copy.ogg",',
      ']',
      'for path in unlisted:',
      '    assert is_approved_new_production_asset(path, "0" * 64) is False',
    ].join('\n');

    withTemporaryDirectory((directory) => {
      execFileSync('python3', [
        '-c',
        `import os; os.chdir(${JSON.stringify(directory)})\n${python}`,
      ]);
    });

    // The existing gate still checks every ordinary production file and every
    // pinned preview before publication. The report append stays outside that
    // decision, so approved Opus files remain in delivery-expected.json.
    const fullScript = readDeliveryManifestScript();
    expect(fullScript).toMatch(
      /if not is_published_preview and not is_rebuilt_application_entrypoint\(relative\) and not is_approved_new_asset:/,
    );
    expect(fullScript).toContain("relative.startswith(('previews/neon-grid-dive/'");
    const approvalDecision = fullScript.indexOf(
      'is_approved_new_asset = is_approved_new_production_asset(relative, sha)',
    );
    const verificationDecision = fullScript.indexOf(
      'if not is_published_preview and not is_rebuilt_application_entrypoint(relative) and not is_approved_new_asset:',
      approvalDecision,
    );
    const deliveryRecord = fullScript.indexOf(
      'report.append(dict(path=relative, url=url, sha256=sha, bytes=len(data)))',
      verificationDecision,
    );
    expect(approvalDecision).toBeGreaterThanOrEqual(0);
    expect(verificationDecision).toBeGreaterThan(approvalDecision);
    expect(deliveryRecord).toBeGreaterThan(verificationDecision);
  });

  it('filters only exact .gitkeep basenames and retains real runtime assets without a checkout', () => {
    const workflow = readFileSync(workflowPath, 'utf8');
    const script = readDeliveryManifestScript();
    const assembleStart = workflow.indexOf('\n  assemble:');
    const assembleEnd = workflow.indexOf('\n  spillway-render:', assembleStart);
    const assembleJob = workflow.slice(assembleStart, assembleEnd);
    const filter = script
      .split('\n')
      .find(
        (line) => line.trim() === "paths = [path for path in paths if path.name != '.gitkeep']",
      );

    expect(assembleStart).toBeGreaterThanOrEqual(0);
    expect(assembleEnd).toBeGreaterThan(assembleStart);
    expect(assembleJob).not.toContain('actions/checkout@');
    expect(workflow).not.toContain('from tools.ci.pages_delivery_manifest import');
    expect(filter).toBe("paths = [path for path in paths if path.name != '.gitkeep']");
    if (!filter) throw new Error('The inline .gitkeep filter is missing from the manifest script');

    withTemporaryDirectory((directory) => {
      const isolatedPython = [
        'import os',
        `os.chdir(${JSON.stringify(directory)})`,
        'from pathlib import Path',
        "assert not Path('tools').exists()",
        "paths = [Path('assets/audio/.gitkeep'), Path('assets/audio/race-engine.wav'), Path('assets/track/signage/neon-grid.webp'), Path('assets/models/kart.glb'), Path('previews/neon-grid/assets/game.js'), Path('previews/neon-grid/review-build.json'), Path('assets/audio/keep.gitkeep'), Path('assets/audio/.gitkeep.txt'), Path('previews/.gitkeep/visible.bin')]",
        filter,
        "assert [path.as_posix() for path in paths] == ['assets/audio/race-engine.wav', 'assets/track/signage/neon-grid.webp', 'assets/models/kart.glb', 'previews/neon-grid/assets/game.js', 'previews/neon-grid/review-build.json', 'assets/audio/keep.gitkeep', 'assets/audio/.gitkeep.txt', 'previews/.gitkeep/visible.bin']",
      ].join('\n');

      execFileSync('python3', ['-c', isolatedPython]);
    });
  });

  it('filters the assembled inventory before reading or publicly verifying bytes', () => {
    const script = readDeliveryManifestScript();
    const inventory = script.indexOf(
      "paths += [item for item in sorted(abyss_v32.rglob('*')) if item.is_file()]",
    );
    const filter = script.indexOf("paths = [path for path in paths if path.name != '.gitkeep']");
    const manifestLoop = script.indexOf('for path in paths:', filter);
    const byteRead = script.indexOf('data = path.read_bytes()', filter);
    const publicVerification = script.indexOf('verify_published_file(url, relative, sha)', filter);

    expect(inventory).toBeGreaterThanOrEqual(0);
    expect(filter).toBeGreaterThan(inventory);
    expect(manifestLoop).toBeGreaterThan(filter);
    expect(byteRead).toBeGreaterThan(filter);
    expect(publicVerification).toBeGreaterThan(filter);
  });

  it('keeps real HTTP errors and SHA-256 mismatches as failures', () => {
    const script = readDeliveryManifestScript();
    const functionStart = script.indexOf('TRANSIENT_HTTP_STATUSES');
    const functionEnd = script.indexOf("root = Path('site-root')", functionStart);
    const verificationFunction = script.slice(functionStart, functionEnd).trim();

    expect(functionStart).toBeGreaterThanOrEqual(0);
    expect(functionEnd).toBeGreaterThan(functionStart);

    withTemporaryDirectory((directory) => {
      const python = [
        'import os',
        `os.chdir(${JSON.stringify(directory)})`,
        'import hashlib, urllib.error, urllib.request',
        verificationFunction,
        'class Response:',
        '    status = 200',
        '    def __enter__(self): return self',
        '    def __exit__(self, *args): return False',
        '    def read(self): return b"published bytes"',
        'def fake_urlopen(request, timeout):',
        '    if request.full_url.endswith("/missing"):',
        '        raise urllib.error.HTTPError(request.full_url, 404, "Not Found", {}, None)',
        '    return Response()',
        'urllib.request.urlopen = fake_urlopen',
        'expected = hashlib.sha256(b"published bytes").hexdigest()',
        'verify_published_file("https://example.invalid/real", "assets/audio/real.wav", expected)',
        'try:',
        '    verify_published_file("https://example.invalid/missing", "assets/audio/missing.wav", expected)',
        'except RuntimeError as error:',
        '    assert "HTTP 404" in str(error)',
        'else:',
        '    raise AssertionError("HTTP 404 was accepted")',
        'try:',
        '    verify_published_file("https://example.invalid/real", "assets/audio/real.wav", "0" * 64)',
        'except AssertionError as error:',
        '    assert "Production bytes differ" in str(error)',
        'else:',
        '    raise AssertionError("SHA-256 mismatch was accepted")',
      ].join('\n');

      execFileSync('python3', ['-c', python]);
    });
  });
});
