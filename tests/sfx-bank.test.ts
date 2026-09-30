import { describe, expect, it } from 'vitest';
import { AudioMixer } from '../src/audio/AudioMixer';
import { SfxBank, playbackReady, type SfxOutput } from '../src/audio/SfxBank';

function fixture(ready = true) {
  const output: {
    url: string;
    gain: number;
    stopped: boolean;
    unloaded: boolean;
    looped: boolean;
  }[] = [];
  const mixer = new AudioMixer(() => undefined);
  const bank = new SfxBank(mixer, (url): SfxOutput => {
    const state = { url, gain: 0, stopped: false, unloaded: false, looped: false };
    output.push(state);
    return {
      ready: () => ready,
      play: () => 1,
      stop: () => {
        state.stopped = true;
      },
      volume: (gain) => {
        state.gain = gain;
      },
      rate: () => undefined,
      pos: () => undefined,
      loop: (looped) => {
        state.looped = looped;
      },
      once: () => undefined,
      unload: () => {
        state.unloaded = true;
      },
    };
  });
  return { bank, mixer, output };
}

describe('asset SFX bank', () => {
  it('waits for both Howler and native context after auto-suspension', () => {
    let wakes = 0;
    const controller = {
      usingWebAudio: true,
      ctx: { state: 'running' },
      state: 'suspended',
      _autoResume: () => {
        wakes++;
      },
    };
    expect(playbackReady(controller, false)).toBe(false);
    expect(wakes).toBe(1);
    controller.state = 'suspending';
    expect(playbackReady(controller, false)).toBe(false);
    controller.state = 'running';
    expect(playbackReady(controller, true)).toBe(false);
    expect(playbackReady(controller, false)).toBe(true);
  });
  it('applies bus gain once: Howler already owns Master', () => {
    const { bank, mixer, output } = fixture();
    mixer.configure({ master: 0.5, sfx: 0.4, engine: 0.6, music: 1 });
    bank.play('countdown-tick', { gain: 0.5 });
    expect(output[0]?.gain).toBeCloseTo(0.2);
    expect(output[0]?.url).toMatch(/assets\/audio\/sfx-v1\/02-race-events\/countdown-tick.wav\?v=/);
    bank.loop('engine-low-rpm', 'player-low', { gain: 0.5, bus: 'engine' });
    expect(output[1]?.gain).toBeCloseTo(0.3);
  });
  it('reuses keyed loops, enforces a voice cap, and unloads every source on disposal', () => {
    const { bank, output } = fixture();
    for (let n = 0; n < 50; n++) bank.loop('engine-low-rpm', 'player-low', { gain: 0.2 });
    expect(bank.voiceCount()).toBe(1);
    for (let n = 0; n < 100; n++) bank.play('kart-contact-light');
    expect(bank.voiceCount()).toBeLessThanOrEqual(24);
    bank.dispose();
    expect(bank.voiceCount()).toBe(0);
    expect(output.every((s) => s.unloaded)).toBe(true);
    bank.play('race-start-go');
    expect(bank.voiceCount()).toBe(0);
  });
  it('silences immediately on pause and does not queue one-shots for resume', () => {
    const { bank, output } = fixture();
    bank.loop('engine-low-rpm', 'player-low');
    bank.play('seeker-warning');
    bank.setPaused(true);
    expect(bank.voiceCount()).toBe(0);
    expect(output.every((s) => s.stopped)).toBe(true);
    bank.play('race-finish');
    expect(bank.voiceCount()).toBe(0);
    bank.setPaused(false);
    expect(bank.voiceCount()).toBe(0);
    bank.loop('engine-low-rpm', 'player-low');
    expect(bank.voiceCount()).toBe(1);
  });
  it('never submits stale sounds to a suspended playback backend', () => {
    const { bank } = fixture(false);
    bank.play('race-finish');
    bank.loop('engine-low-rpm', 'engine');
    expect(bank.voiceCount()).toBe(0);
    bank.setPaused(true);
    bank.setPaused(false);
    expect(bank.voiceCount()).toBe(0);
  });
  it('updates live bus changes and rejects unknown cues without throwing', () => {
    const { bank, mixer, output } = fixture();
    bank.loop('engine-low-rpm', 'player-low', { bus: 'engine' });
    mixer.configure({ master: 1, music: 1, sfx: 1, engine: 0 });
    bank.refreshMix();
    expect(output[0]?.gain).toBe(0);
    expect(() => {
      bank.play('missing-cue');
    }).not.toThrow();
    expect(output).toHaveLength(1);
  });
});
