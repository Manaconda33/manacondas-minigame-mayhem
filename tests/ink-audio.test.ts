import { describe, expect, it, vi } from 'vitest';
import { InkSplatAudio } from '../src/audio/InkSplatAudio';

function audioFixture(state: AudioContextState = 'running') {
  const setFrequency = vi.fn();
  const rampGain = vi.fn();
  const createOscillator = vi.fn();
  const createGain = vi.fn();
  const resume = vi.fn().mockResolvedValue(undefined);
  const oscillator = {
    frequency: {
      setValueAtTime: setFrequency,
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn((gain: unknown) => gain),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    onended: null,
    type: 'sine' as OscillatorType,
  };
  const gain = {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: rampGain,
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  const context = {
    state,
    currentTime: 0,
    destination: {},
    resume,
    createOscillator,
    createGain,
  } as unknown as AudioContext;
  createOscillator.mockReturnValue(oscillator);
  createGain.mockReturnValue(gain);
  return { context, oscillator, gain, createOscillator, setFrequency, rampGain, resume };
}

describe('Ink Splat audio ownership', () => {
  it('plays one bounded original cue, respects silence, and stops on disposal', async () => {
    const fixture = audioFixture();
    const audio = new InkSplatAudio(() => fixture.context);
    await audio.unlock();
    audio.play(0.5);

    expect(fixture.createOscillator).toHaveBeenCalledOnce();
    expect(fixture.oscillator.type).toBe('sawtooth');
    expect(fixture.setFrequency).toHaveBeenCalledWith(190, 0);
    expect(fixture.rampGain).toHaveBeenCalledWith(0.0275, 0.006);

    audio.play(0);
    expect(fixture.createOscillator).toHaveBeenCalledOnce();
    audio.stop();
    expect(fixture.oscillator.disconnect).toHaveBeenCalled();
    audio.dispose();
  });

  it('contains unavailable and suspended browser audio failures', async () => {
    const unavailable = new InkSplatAudio(() => {
      throw new Error('Audio unavailable');
    });
    await expect(unavailable.unlock()).resolves.toBeUndefined();
    expect(() => {
      unavailable.play(1);
    }).not.toThrow();

    const suspended = audioFixture('suspended');
    const audio = new InkSplatAudio(() => suspended.context);
    await audio.unlock();
    expect(suspended.resume).toHaveBeenCalledOnce();
    audio.dispose();
    unavailable.dispose();
  });
});
