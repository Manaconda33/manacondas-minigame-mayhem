import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Pages delivery manifest', () => {
  it('omits only .gitkeep placeholders from public verification', () => {
    expect(() => {
      execFileSync('python3', [
        '-c',
        [
          'from pathlib import Path',
          'from tools.ci.pages_delivery_manifest import public_delivery_paths',
          "paths = [Path('assets/audio/.gitkeep'), Path('assets/audio/engine.wav'), Path('assets/audio/keep.gitkeep')]",
          'assert public_delivery_paths(paths) == paths[1:]',
        ].join('\n'),
      ]);
    }).not.toThrow();
  });

  it('applies the placeholder filter to the assembled delivery inventory', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
    const previewInventory = workflow.indexOf(
      "paths += [item for item in sorted(abyss_v32.rglob('*')) if item.is_file()]",
    );
    const filter = workflow.indexOf('paths = public_delivery_paths(paths)');
    const verification = workflow.indexOf('for path in paths:', filter);

    expect(workflow).toContain(
      'from tools.ci.pages_delivery_manifest import public_delivery_paths',
    );
    expect(previewInventory).toBeGreaterThanOrEqual(0);
    expect(filter).toBeGreaterThan(previewInventory);
    expect(verification).toBeGreaterThan(filter);
  });
});
