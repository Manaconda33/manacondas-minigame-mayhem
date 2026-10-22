import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/manacondas-minigame-mayhem/',
  test: {
    environment: 'jsdom',
    testTimeout: 20_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
    },
  },
});
