import { describe, expect, it, vi } from 'vitest';
import { PrismaticMusic } from '../src/audio/PrismaticMusic';

function fixture() {
  const voices: {
    frequency: { setValueAtTime: ReturnType<typeof vi.fn> };
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  const gain = { gain: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
  const context = {
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => gain),
    createOscillator: vi.fn(() => {
      const voice = {
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
      };
      voices.push(voice);
      return voice;
    }),
  };
  const factory = vi.fn(() => context as unknown as AudioContext);
  return { voices, gain, context, factory, music: new PrismaticMusic(factory) };
}

describe('Prismatic musical layer', () => {
  it('requires unlock, plays a bounded chord/arpeggio, follows volume/fade and pauses without advancing its phrase', async () => {
    const f = fixture();
    f.music.update(6, 0, 1, false);
    expect(f.factory).not.toHaveBeenCalled();
    await f.music.unlock();
    f.music.update(6, 0.01, 0.5, false);
    expect(f.voices).toHaveLength(3);
    expect(f.gain.gain.setValueAtTime).toHaveBeenLastCalledWith(0.009, 0);
    const first = f.voices[0]?.frequency.setValueAtTime.mock.lastCall;
    f.music.update(5, 0.3, 1, false);
    expect(f.voices[0]?.frequency.setValueAtTime.mock.lastCall).not.toEqual(first);
    const paused = f.voices[0]?.frequency.setValueAtTime.mock.lastCall;
    f.music.update(5, 99, 1, true);
    expect(f.voices.every((v) => v.disconnect.mock.calls.length === 1)).toBe(true);
    f.music.update(5, 0, 1, false);
    expect(f.voices[3]?.frequency.setValueAtTime.mock.lastCall).toEqual(paused);
    f.music.update(0.25, 0.01, 1, false);
    expect(f.gain.gain.setValueAtTime).toHaveBeenLastCalledWith(0.0045, 0);
    f.music.update(0.2, 0.01, 0, false);
    expect(f.voices[3]?.disconnect).toHaveBeenCalledOnce();
    f.music.update(0, 0, 1, false);
    f.music.dispose();
    expect(f.context.close).toHaveBeenCalledOnce();
    const count = f.voices.length;
    await f.music.unlock();
    f.music.update(6, 1, 1, false);
    expect(f.voices).toHaveLength(count);
  });

  it('tolerates unavailable/suspended/failed audio and cleans partially created voices', async () => {
    const absent = new PrismaticMusic(() => {
      throw new Error('Unavailable');
    });
    await absent.unlock();
    absent.update(6, 0.1, 1, false);
    absent.dispose();
    const f = fixture();
    f.context.state = 'suspended';
    await f.music.unlock();
    expect(f.context.resume).toHaveBeenCalledOnce();
    f.music.update(6, 0.1, 1, false);
    expect(f.voices).toHaveLength(0);
    f.context.state = 'running';
    f.context.createOscillator.mockImplementationOnce(() => {
      throw new Error('Failed node');
    });
    expect(() => {
      f.music.update(6, 0.1, 1, false);
    }).not.toThrow();
    expect(f.gain.disconnect).toHaveBeenCalled();
    f.music.dispose();
  });
});
