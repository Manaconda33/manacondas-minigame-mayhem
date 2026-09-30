import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebAudioMusicOutput } from '../src/audio/WebAudioMusicOutput';
import { musicCatalog } from '../src/audio/musicCatalog';
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

function must<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Required fixture value missing.');
  return value;
}
