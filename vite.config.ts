import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export function resolveBuildSourceCommit(
  processEnv: Record<string, string | undefined>,
  viteEnv: Record<string, string | undefined> = {},
): string {
  const explicitSource = processEnv.VITE_SOURCE_COMMIT?.trim();
  if (explicitSource) return explicitSource;
  const githubSource = processEnv.GITHUB_SHA?.trim();
  if (githubSource) return githubSource;
  const localSource = viteEnv.VITE_SOURCE_COMMIT?.trim();
  return localSource ?? '';
}

export default defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, '.', 'VITE_');
  const processEnv = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env ?? {};
  const sourceCommit = resolveBuildSourceCommit(processEnv, viteEnv);
  return {
    base: '/manacondas-minigame-mayhem/',
    define: {
      'import.meta.env.VITE_SOURCE_COMMIT': JSON.stringify(sourceCommit),
    },
    test: {
      environment: 'jsdom',
      testTimeout: 20_000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        reportsDirectory: 'coverage',
      },
    },
  };
});
