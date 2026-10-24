import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebAudioMusicOutput } from '../src/audio/WebAudioMusicOutput';
import { musicCatalog, musicFormatFromSearch, musicUrl } from '../src/audio/musicCatalog';
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

describe('opt-in 192k Opus music delivery', () => {
  const response = (ok = true): Response =>
    ({ ok, arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)) }) as Response;

  it('requires the exact experimental query value and keeps unrelated selectors independent', () => {
    expect(musicFormatFromSearch('')).toBe('wav');
    expect(musicFormatFromSearch('?neonGridMaterial=concrete-coverage-c2-001')).toBe('wav');
    expect(musicFormatFromSearch('?musicFormat=opus-192k')).toBe('opus-192k');
    expect(musicFormatFromSearch('?musicFormat=opus-128k')).toBe('wav');
    expect(musicUrl('hub')).toContain('/assets/audio/music-v2/');
    expect(musicUrl('hub', 'opus-192k')).toContain('/assets/audio/music-opus-192k/');
  });

  it('loads Opus successfully without requesting the WAV fallback', async () => {
    const c = context();
    const urls: string[] = [];
    const request: typeof fetch = (input) => {
      urls.push(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
      return Promise.resolve(response());
    };
    const output = new WebAudioMusicOutput(() => c.ctx, request, 'opus-192k');
    output.retain(['hub']);

    expect(await output.load('hub')).toBe(true);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('/assets/audio/music-opus-192k/03-route-night-title-hub-loop.ogg?');
    expect(urls.some((url) => url.includes('/assets/audio/music-v2/'))).toBe(false);
    output.dispose();
  });

  it('loads every experimental cue with its exact authored loop boundary', async () => {
    const cues = Object.keys(musicCatalog) as (keyof typeof musicCatalog)[];
    for (const cue of cues) {
      const c = context(musicCatalog[cue].duration);
      const urls: string[] = [];
      const request: typeof fetch = (input) => {
        urls.push(
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
        );
        return Promise.resolve(response());
      };
      const output = new WebAudioMusicOutput(() => c.ctx, request, 'opus-192k');
      output.retain([cue]);

      expect(await output.load(cue), cue).toBe(true);
      const voice = output.play(cue, 12, 3);
      expect(voice, cue).not.toBeNull();
      expect(c.source.loopEnd, cue).toBe(musicCatalog[cue].duration);
      expect(urls).toHaveLength(1);
      expect(urls[0]).toContain('/assets/audio/music-opus-192k/');
      voice?.stop();
      output.dispose();
    }
  });

  it.each([
    ['unsupported codec response', () => Promise.resolve(response(false))],
    ['failed Opus network request', () => Promise.reject(new TypeError('network failed'))],
  ])('falls back to WAV on %s', async (_name, opusResponse) => {
    const c = context();
    const urls: string[] = [];
    const request: typeof fetch = async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      urls.push(url);
      if (url.includes('music-opus-192k')) return Promise.resolve(opusResponse());
      return Promise.resolve(response());
    };
    const output = new WebAudioMusicOutput(() => c.ctx, request, 'opus-192k');
    output.retain(['hub']);

    expect(await output.load('hub')).toBe(true);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain('music-opus-192k');
    expect(urls[1]).toContain('/assets/audio/music-v2/');
    output.dispose();
  });

  it('falls back to WAV when Opus data is corrupt or fails the exact duration gate', async () => {
    for (const failure of ['corrupt', 'duration'] as const) {
      const c = context();
      let requests = 0;
      c.ctx.decodeAudioData = vi.fn(() =>
        Promise.resolve().then(() => {
          requests++;
          if (failure === 'corrupt' && requests === 1) throw new Error('decode failed');
          return {
            duration: failure === 'duration' && requests === 1 ? 1 : musicCatalog.hub.duration,
          } as AudioBuffer;
        }),
      );
      const urls: string[] = [];
      const request: typeof fetch = (input) => {
        urls.push(
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
        );
        return Promise.resolve(response());
      };
      const output = new WebAudioMusicOutput(() => c.ctx, request, 'opus-192k');
      output.retain(['hub']);

      expect(await output.load('hub'), failure).toBe(true);
      expect(urls).toHaveLength(2);
      expect(urls[1]).toContain('/assets/audio/music-v2/');
      output.dispose();
    }
  });

  it('does not request WAV after intentional cancellation or a rapid cue change', async () => {
    const c = context();
    let activeSignal: AbortSignal | undefined;
    const urls: string[] = [];
    const request: typeof fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      urls.push(url);
      activeSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        activeSignal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    };
    const output = new WebAudioMusicOutput(() => c.ctx, request, 'opus-192k');
    output.retain(['hub']);
    const loading = output.load('hub');
    await Promise.resolve();
    output.retain(['select']);

    expect(await loading).toBe(false);
    expect(activeSignal?.aborted).toBe(true);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('music-opus-192k');
    expect(urls.some((url) => url.includes('/assets/audio/music-v2/'))).toBe(false);
    output.dispose();
  });

  it('does not start a WAV fallback when MusicDirector rapidly changes an Opus cue', async () => {
    const c = context();
    const urls: string[] = [];
    const request: typeof fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      urls.push(url);
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    };
    const output = new WebAudioMusicOutput(() => c.ctx, request, 'opus-192k');
    const director = new MusicDirector(output);
    await director.unlock();
    director.route('hub');
    await Promise.resolve();
    director.route('select');
    await Promise.resolve();
    expect(
      urls.some((url) =>
        url.includes('/assets/audio/music-opus-192k/03-route-night-title-hub-loop.ogg'),
      ),
    ).toBe(true);
    expect(
      urls.some((url) => url.includes('/assets/audio/music-v2/03-route-night-title-hub-loop.wav')),
    ).toBe(false);
    expect(
      urls.some((url) =>
        url.includes('/assets/audio/music-opus-192k/04-grid-preparation-character-select-loop.ogg'),
      ),
    ).toBe(true);
    director.dispose();
  });

  it('keeps WAV as the default delivery mode', async () => {
    const c = context();
    let requested = '';
    const request: typeof fetch = (input) => {
      requested = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      return Promise.resolve(response());
    };
    const output = new WebAudioMusicOutput(() => c.ctx, request);
    output.retain(['hub']);
    expect(await output.load('hub')).toBe(true);
    expect(requested).toContain('/assets/audio/music-v2/');
    expect(requested).not.toContain('music-opus-192k');
    output.dispose();
  });
});
