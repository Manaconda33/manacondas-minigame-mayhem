import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebAudioMusicOutput } from '../src/audio/WebAudioMusicOutput';
import { musicCatalog } from '../src/audio/musicCatalog';
import { MusicDirector } from '../src/audio/MusicDirector';
afterEach(() => vi.unstubAllGlobals());
function context(duration = musicCatalog.hub.duration) {
  const source = {
    buffer: null,
    loop: false,
    loopStart: -1,
    loopEnd: -1,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const gain = {
    gain: { value: 1, setTargetAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  const ctx = {
    state: 'running',
    currentTime: 10,
    destination: {},
    resume: vi.fn(),
    close: vi.fn(() => Promise.resolve(undefined)),
    decodeAudioData: vi.fn(() => Promise.resolve({ duration })),
    createBufferSource: () => source,
    createGain: () => gain,
  };
  return { ctx: ctx as unknown as AudioContext, source, gain, close: ctx.close };
}
describe('music Web Audio transport', () => {
  it('creates its own context only on gesture, outside Howler auto-suspension', async () => {
    const c = context();
    const created = vi.fn();
    vi.stubGlobal(
      'AudioContext',
      // Browser constructor replacement for this isolated transport test.
      // eslint-disable-next-line @typescript-eslint/no-extraneous-class
      class {
        constructor() {
          created();
          return c.ctx;
        }
      },
    );
    const output = new WebAudioMusicOutput();
    expect(created).not.toHaveBeenCalled();
    expect(await output.unlock()).toBe(true);
    expect(created).toHaveBeenCalledTimes(1);
    output.dispose();
    expect(c.close).toHaveBeenCalledTimes(1);
  });
  it('uses the exact decoded loop boundary and scheduled audio clock', async () => {
    const c = context();
    const request = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
      } as Response),
    );
    const output = new WebAudioMusicOutput(() => c.ctx, request);
    output.retain(['hub']);
    expect(await output.load('hub')).toBe(true);
    expect(await output.load('hub')).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    const voice = must(output.play('hub', 12, 3));
    expect(c.source.loopEnd).toBe(musicCatalog.hub.duration);
    expect(c.source.loop).toBe(true);
    expect(c.source.start).toHaveBeenCalledWith(12, 3);
    expect(voice.position()).toBe(3);
    voice.stop();
    voice.stop();
    expect(c.source.stop).toHaveBeenCalledTimes(1);
    output.dispose();
    expect(c.close).not.toHaveBeenCalled();
  });
  it('rejects mismatched durations and never starts a disposed decode', async () => {
    const c = context(1);
    const request = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
      } as Response),
    );
    const output = new WebAudioMusicOutput(() => c.ctx, request);
    output.retain(['hub']);
    expect(await output.load('hub')).toBe(false);
    expect(output.play('hub', 10, 0)).toBeNull();
    output.dispose();
    expect(await output.load('hub')).toBe(false);
  });
});

it('restarts an aborted cue decode and keeps replacement request identity', async () => {
  const c = context();
  const decodes: ((buffer: AudioBuffer) => void)[] = [];
  c.ctx.decodeAudioData = () =>
    new Promise<AudioBuffer>((resolve) => {
      decodes.push(resolve);
    });
  const request = vi.fn(() =>
    Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    } as Response),
  );
  const output = new WebAudioMusicOutput(() => c.ctx, request);
  const director = new MusicDirector(output);
  const flush = async () => {
    for (let n = 0; n < 8; n++) await Promise.resolve();
  };
  await director.unlock();
  director.route('hub');
  await flush();
  director.route('select');
  await flush();
  director.route('hub');
  await flush();
  expect(decodes).toHaveLength(3);
  must(decodes[0])({ duration: musicCatalog.hub.duration } as AudioBuffer);
  await flush();
  const replacement = output.load('hub');
  await flush();
  expect(request).toHaveBeenCalledTimes(3);
  must(decodes[2])({ duration: musicCatalog.hub.duration } as AudioBuffer);
  expect(await replacement).toBe(true);
  await flush();
  expect(c.source.start).toHaveBeenCalledTimes(1);
  director.dispose();
});

function must<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Required fixture value missing.');
  return value;
}

it('keeps prepared race audio across the silent countdown instead of downloading it again at GO', async () => {
  const c = context();
  const cues = Object.keys(musicCatalog) as (keyof typeof musicCatalog)[];
  const fetched: string[] = [];
  c.ctx.decodeAudioData = (bytes) =>
    Promise.resolve({
      duration: musicCatalog[must(cues[new Uint8Array(bytes)[0] ?? 0])].duration,
    } as AudioBuffer);
  const request: typeof fetch = (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    fetched.push(url);
    const index = cues.findIndex((cue) => url.includes(musicCatalog[cue].file));
    return Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(Uint8Array.of(index).buffer),
    } as Response);
  };
  const director = new MusicDirector(new WebAudioMusicOutput(() => c.ctx, request));
  const flush = async () => {
    for (let n = 0; n < 12; n++) await Promise.resolve();
  };
  await director.unlock();
  director.route('select');
  await flush();
  director.race({ phase: 'countdown', lap: 1, paused: false, prismatic: false });
  await flush();
  director.race({ phase: 'racing', lap: 1, paused: false, prismatic: false });
  await flush();
  expect(fetched.filter((url) => url.includes(musicCatalog.race.file))).toHaveLength(1);
  director.dispose();
});
