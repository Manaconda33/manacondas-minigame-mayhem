import { describe, expect, it } from 'vitest';
import { resolveBuildSourceCommit } from '../vite.config';

describe('build source identity', () => {
  it('uses the explicit source pin for immutable preview builds', () => {
    expect(
      resolveBuildSourceCommit(
        { VITE_SOURCE_COMMIT: 'pinned-preview-sha', GITHUB_SHA: 'event-sha' },
        { VITE_SOURCE_COMMIT: 'dotenv-sha' },
      ),
    ).toBe('pinned-preview-sha');
  });

  it('stamps the current push commit when the production build runs in GitHub Actions', () => {
    expect(resolveBuildSourceCommit({ GITHUB_SHA: 'main-push-commit-sha' })).toBe(
      'main-push-commit-sha',
    );
  });

  it('uses a local Vite source pin when no CI commit is available and otherwise stays blank', () => {
    expect(resolveBuildSourceCommit({}, { VITE_SOURCE_COMMIT: 'local-source-sha' })).toBe(
      'local-source-sha',
    );
    expect(resolveBuildSourceCommit({}, {})).toBe('');
  });
});
