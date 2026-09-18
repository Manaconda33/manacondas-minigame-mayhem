import { describe, expect, it, vi } from 'vitest';
import { AudioMixer } from '../src/audio/AudioMixer';

describe('Slice 6 audio mixer', () => {
  it('applies master volume globally and composes per-bus volume', () => {
    const setGlobalVolume = vi.fn();
    const mixer = new AudioMixer(setGlobalVolume);

    mixer.configure({
      master: 0.8,
      music: 0.5,
      sfx: 0.75,
      engine: 0.25,
    });

    expect(setGlobalVolume).toHaveBeenLastCalledWith(0.8);
    expect(mixer.volume('music')).toBeCloseTo(0.4);
    expect(mixer.volume('sfx')).toBeCloseTo(0.6);
    expect(mixer.volume('engine')).toBeCloseTo(0.2);
  });

  it('clamps invalid bus values before exposing them', () => {
    const mixer = new AudioMixer(() => undefined);

    mixer.configure({
      master: 2,
      music: -1,
      sfx: Number.NaN,
      engine: 0.5,
    });

    expect(mixer.snapshot()).toEqual({
      master: 1,
      music: 0,
      sfx: 0,
      engine: 0.5,
    });
  });
});
