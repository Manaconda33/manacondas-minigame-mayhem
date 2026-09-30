import { afterEach, expect, it, vi } from 'vitest';
import { mountAppShell } from '../src/app/mountAppShell';
import { MusicDirector } from '../src/audio/MusicDirector';
import { AudioMixer } from '../src/audio/AudioMixer';
import type { MusicOutput } from '../src/audio/WebAudioMusicOutput';
import type { MusicCue } from '../src/audio/musicCatalog';
import type { TimeTrialOptions } from '../src/game/KartTimeTrial';
const races = vi.hoisted(() => ({ options: [] as TimeTrialOptions[] }));
vi.mock('../src/game/KartTimeTrial', () => ({
  KartTimeTrial: {
    create: (options: TimeTrialOptions) => {
      races.options.push(options);
      return { start: () => undefined, dispose: () => undefined };
    },
  },
}));
let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  races.options.length = 0;
  vi.unstubAllGlobals();
});
it('routes real screens and authoritative races, ignoring disposed race callbacks', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  let clock = 0;
  const heard: MusicCue[] = [];
  const output: MusicOutput = {
    time: () => clock,
    ready: () => true,
    unlock: () => Promise.resolve(true),
    load: () => Promise.resolve(true),
    retain: () => undefined,
    dispose: () => undefined,
    play: (cue) => {
      heard.push(cue);
      return { position: () => 0, gain: () => undefined, stop: () => undefined };
    },
  };
  const director = new MusicDirector(output, new AudioMixer(() => undefined));
  const root = document.createElement('div');
  cleanup = mountAppShell(root, director);
  await director.unlock();
  await Promise.resolve();
  expect(heard).toEqual(['hub']);
  must(root.querySelector<HTMLElement>('[data-action="enter"]')).click();
  must(root.querySelector<HTMLElement>('[data-action="play"]')).click();
  await vi.waitFor(() => {
    expect(heard.at(-1)).toBe('select');
  });
  must(root.querySelector<HTMLElement>('[data-action="confirm-character"]')).click();
  await vi.waitFor(() => {
    expect(races.options.length).toBe(1);
  });
  const race = must(races.options[0]);
  race.onMusicState?.({ phase: 'racing', lap: 1, paused: false, prismatic: false });
  await vi.waitFor(() => {
    expect(heard.at(-1)).toBe('race');
  });
  clock = 2;
  race.onMusicState?.({ phase: 'racing', lap: 3, paused: false, prismatic: false });
  await vi.waitFor(() => {
    expect(heard.at(-1)).toBe('final-lap');
  });
  race.onFinish({ place: 1, time: 60, standings: [] });
  await vi.waitFor(() => {
    expect(heard.at(-1)).toBe('results');
  });
  must(root.querySelector<HTMLElement>('[data-action="return-to-hub"]')).click();
  await vi.waitFor(() => {
    expect(heard.at(-1)).toBe('hub');
  });
  race.onMusicState?.({ phase: 'finished', lap: 3, paused: false, prismatic: false });
  await Promise.resolve();
  expect(heard.at(-1)).toBe('hub');
});

it('does not attach a ticker when gesture unlock finishes after app disposal', async () => {
  let resolve!: (v: boolean) => void;
  const output: MusicOutput = {
    time: () => 0,
    ready: () => true,
    unlock: () =>
      new Promise((r) => {
        resolve = r;
      }),
    load: () => Promise.resolve(true),
    retain: () => undefined,
    dispose: () => undefined,
    play: () => null,
  };
  const ticker = vi.spyOn(globalThis, 'setInterval');
  const root = document.createElement('div');
  cleanup = mountAppShell(root, new MusicDirector(output));
  must(root.querySelector<HTMLElement>('[data-action="enter"]')).click();
  cleanup();
  ticker.mockClear();
  resolve(true);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  expect(ticker).not.toHaveBeenCalled();
  ticker.mockRestore();
});

function must<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Required fixture value missing.');
  return value;
}
