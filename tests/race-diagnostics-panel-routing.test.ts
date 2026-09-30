import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mountAppShell } from '../src/app/mountAppShell';
import type { TimeTrialOptions } from '../src/game/KartTimeTrial';
import { RacePerformanceMeter } from '../src/game/diagnostics/RacePerformanceMeter';
import type { RaceCaptureMetadata } from '../src/game/diagnostics/raceDiagnostics';
const harness = vi.hoisted(() => ({
  games: [] as { options: TimeTrialOptions; meter: RacePerformanceMeter }[],
  deferred: false,
  releases: [] as (() => void)[],
  starts: 0,
  disposals: 0,
}));
vi.mock('../src/game/KartTimeTrial', () => ({
  KartTimeTrial: {
    create(options: TimeTrialOptions) {
      const meter = new RacePerformanceMeter(true, 0);
      harness.games.push({ options, meter });
      const instance = {
        start() {
          harness.starts++;
        },
        dispose: () => {
          harness.disposals++;
          meter.dispose();
        },
        exportPerformanceCapture: (m: RaceCaptureMetadata) => meter.exportCapture(m),
      };
      return harness.deferred
        ? new Promise<typeof instance>((resolve) => {
            harness.releases.push(() => {
              resolve(instance);
            });
          })
        : instance;
    },
  },
}));
vi.mock('../src/ui/characterKartPreview', () => ({
  CharacterKartPreview: class {
    dispose() {
      /* External renderer/audio/UI behavior is outside this diagnostic test. */
    }
  },
}));
const cleanups: (() => void)[] = [];
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  harness.games.length = 0;
  harness.deferred = false;
  harness.releases.length = 0;
  harness.starts = harness.disposals = 0;
  localStorage.clear();
});
it('disposes an asynchronously created race after the shell closes instead of installing stale diagnostics', async () => {
  harness.deferred = true;
  await race('?testRacePerf=1');
  cleanups.splice(0).forEach((c) => {
    c();
  });
  harness.releases[0]?.();
  await vi.waitFor(() => { expect(harness.disposals).toBe(1); });
  expect(harness.starts).toBe(0);
});
afterEach(() => {
  cleanups.splice(0).forEach((c) => {
    c();
  });
  history.replaceState(null, '', '/');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function race(query: string) {
  history.replaceState(null, '', query || '/');
  const root = document.createElement('div');
  cleanups.push(mountAppShell(root));
  root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
  root.querySelector<HTMLElement>('[data-action="play"]')?.click();
  root.querySelector<HTMLElement>('[data-action="confirm-character"]')?.click();
  await vi.waitFor(() => {
    expect(harness.games.length).toBeGreaterThan(0);
  });
  return root;
}
it.each(['', '?testRacePerf=0', '?testRacePerf=true'])(
  'ordinary HUD has no diagnostic panel or callback (%s)',
  async (q) => {
    const root = await race(q);
    expect(root.querySelector('[data-race-diagnostics]')).toBeNull();
    expect(harness.games[0]?.options.onDiagnostics).toBeUndefined();
    expect(root.querySelector('#game-canvas')).not.toBeNull();
  },
);
it('shows opt-in counters and downloads independent schema JSON with URL cleanup, including Results', async () => {
  const root = await race('?testRacePerf=1');
  const r = harness.games[0];
  if (!r) throw new Error('Missing race');
  r.meter.record({
    rawFrameMs: 250,
    phase: 'racing',
    paused: false,
    hidden: false,
    boundary: false,
    counters: {
      drawCalls: 12,
      triangles: 300,
      geometries: 4,
      textures: 5,
      width: 1920,
      height: 1080,
      pixelRatio: 1,
    },
  });
  r.options.onDiagnostics?.(r.meter.snapshot());
  expect(root.querySelector('[data-race-diagnostics]')?.textContent).toContain('250.0');
  const create = vi.fn<(blob: Blob) => string>().mockReturnValue('blob:test');
  const revoke = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = create;
      static revokeObjectURL = revoke;
    },
  );
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
    /* External renderer/audio/UI behavior is outside this diagnostic test. */
  });
  r.meter.record({
    rawFrameMs: 16,
    phase: 'finished',
    paused: false,
    hidden: false,
    boundary: false,
    counters: null,
  });
  r.options.onFinish({ time: 100, place: 1, standings: [] });
  root.querySelector<HTMLElement>('[data-download-race-capture]')?.click();
  expect(create).toHaveBeenCalledTimes(1);
  expect(revoke).toHaveBeenCalledWith('blob:test');
  const blob = create.mock.calls[0]?.[0] as unknown as Blob;
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = reject;
    reader.readAsText(blob);
  });
  const capture: unknown = JSON.parse(text);
  expect(capture).toMatchObject({
    schemaVersion: 1,
    raceCompleted: true,
    metadata: { quality: 'medium', racerCount: 8 },
  });
  expect(capture).not.toHaveProperty('summary.pass');
});
it('rejects stale callback/download after restart and shell disposal', async () => {
  const root = await race('?testRacePerf=1');
  const old = harness.games[0];
  if (!old) throw new Error('Missing race');
  const button = root.querySelector<HTMLElement>('[data-download-race-capture]');
  old.options.onFinish({ time: 100, place: 1, standings: [] });
  root.querySelector<HTMLElement>('[data-action="race-again"]')?.click();
  await vi.waitFor(() => {
    expect(harness.games).toHaveLength(2);
  });
  const before = root.querySelector('[data-race-diagnostics]')?.textContent;
  old.options.onDiagnostics?.({ ...old.meter.snapshot(), maxFrameMs: 999 });
  expect(root.querySelector('[data-race-diagnostics]')?.textContent).toBe(before);
  const create = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = create;
    },
  );
  button?.click();
  expect(create).not.toHaveBeenCalled();
  cleanups.splice(0).forEach((c) => {
    c();
  });
  root.querySelector<HTMLElement>('[data-download-race-capture]')?.click();
  expect(create).not.toHaveBeenCalled();
});
