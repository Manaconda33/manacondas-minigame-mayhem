import { describe, expect, it, vi } from 'vitest';
import { SeekerWarningAudio } from '../src/audio/SeekerWarningAudio';

function audioFixture() {
  const oscillators: { stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] =
    [];
  const gains: {
    gain: { setValueAtTime: ReturnType<typeof vi.fn> };
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  const context = {
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => {
      const oscillator = {
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn((gain: unknown) => gain),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
        onended: null,
      };
      oscillators.push(oscillator);
      return oscillator;
    }),
    createGain: vi.fn(() => {
      const gain = { gain: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
      gains.push(gain);
      return gain;
    }),
  };
  const factory = vi.fn(() => context as unknown as AudioContext);
  return { context, oscillators, gains, factory, audio: new SeekerWarningAudio(factory) };
}

describe('Seeker warning audio ownership', () => {
  it('waits for a user gesture and respects master volume including silence', async () => {
    const f = audioFixture();
    f.audio.update(1, 0.1, 1, false);
    expect(f.factory).not.toHaveBeenCalled();
    await f.audio.unlock();
    f.audio.update(1, 0.1, 0.5, false);
    expect(f.context.createOscillator).toHaveBeenCalledTimes(1);
    expect(f.gains[0]?.gain.setValueAtTime).toHaveBeenCalledWith(0.03, 0);
    f.audio.update(1, 0.1, 0, false);
    expect(f.oscillators[0]?.disconnect).toHaveBeenCalled();
    expect(f.context.createOscillator).toHaveBeenCalledTimes(1);
    f.audio.dispose();
    expect(f.context.close).toHaveBeenCalledOnce();
  });
  it('escalates pulse cadence and cancels immediately on pause or target expiry', async () => {
    const f = audioFixture();
    await f.audio.unlock();
    f.audio.update(1, 0, 1, false);
    f.audio.update(1, 0.2, 1, false);
    expect(f.context.createOscillator).toHaveBeenCalledTimes(1);
    f.audio.update(3, 0.01, 1, false);
    expect(f.context.createOscillator).toHaveBeenCalledTimes(2);
    f.audio.update(3, 0.21, 1, false);
    expect(f.context.createOscillator).toHaveBeenCalledTimes(3);
    f.audio.update(3, 10, 1, true);
    expect(f.oscillators[2]?.disconnect).toHaveBeenCalled();
    f.audio.update(3, 10, 1, true);
    expect(f.context.createOscillator).toHaveBeenCalledTimes(3);
    f.audio.update(null, 0.1, 1, false);
    f.audio.dispose();
    expect(f.gains.every((gain) => gain.disconnect.mock.calls.length > 0)).toBe(true);
  });
  it('supports suspended contexts and unavailable browser audio without losing the race', async () => {
    const f = audioFixture();
    f.context.state = 'suspended';
    await f.audio.unlock();
    expect(f.context.resume).toHaveBeenCalledOnce();
    f.audio.dispose();
    const unavailable = new SeekerWarningAudio(() => {
      throw new Error('Audio unavailable');
    });
    await unavailable.unlock();
    expect(() => {
      unavailable.update(3, 0.1, 1, false);
    }).not.toThrow();
    unavailable.dispose();
  });
});
