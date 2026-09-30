import { describe, expect, it } from 'vitest';
import { AudioMixer } from '../src/audio/AudioMixer';
import { MusicDirector } from '../src/audio/MusicDirector';
import type { MusicCue } from '../src/audio/musicCatalog';
import type { MusicOutput, MusicVoice } from '../src/audio/WebAudioMusicOutput';

function harness() {
  let time = 100;
  let available = true;
  const voices: { cue: MusicCue; at: number; offset: number; gain: number; stopped: boolean }[] =
    [];
  const loads = new Map<MusicCue, Promise<boolean>>();
  const output: MusicOutput = {
    time: () => time,
    ready: () => available,
    unlock: () => Promise.resolve(available),
    load: (cue) => loads.get(cue) ?? Promise.resolve(true),
    retain: () => undefined,
    dispose: () => undefined,
    play: (cue, at, offset): MusicVoice | null => {
      if (!available) return null;
      const v = { cue, at, offset, gain: 0, stopped: false };
      voices.push(v);
      return {
        position: () => Math.max(0, time - at) + offset,
        gain: (value) => {
          v.gain = value;
        },
        stop: () => {
          v.stopped = true;
        },
      };
    },
  };
  const mixer = new AudioMixer(() => undefined);
  const music = new MusicDirector(output, mixer);
  const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
    music.tick();
  };
  return {
    music,
    voices,
    loads,
    mixer,
    flush,
    clock: (v: number) => {
      time = v;
    },
    available: (v: boolean) => {
      available = v;
    },
  };
}

describe('approved game music', () => {
  it('requires gesture unlock and keeps Hub/Title music continuous', async () => {
    const h = harness();
    h.music.route('hub');
    await h.flush();
    expect(h.voices).toHaveLength(0);
    await h.music.unlock();
    await h.flush();
    expect(h.voices).toHaveLength(1);
    h.music.route('hub');
    await h.flush();
    expect(h.voices).toHaveLength(1);
  });

  it('ignores a late decode for a screen that has been left', async () => {
    const h = harness();
    await h.music.unlock();
    let resolve!: (v: boolean) => void;
    h.loads.set(
      'select',
      new Promise((r) => {
        resolve = r;
      }),
    );
    h.music.route('select');
    h.music.route('hub');
    await h.flush();
    resolve(true);
    await h.flush();
    expect(h.voices.map((v) => v.cue)).toEqual(['hub']);
  });

  it('schedules final-lap entry on the next race bar and does not restart it each frame', async () => {
    const h = harness();
    await h.music.unlock();
    h.music.race({ phase: 'racing', lap: 1, paused: false, prismatic: false });
    await h.flush();
    const race = must(h.voices[0]);
    h.clock(102.2);
    h.music.race({ phase: 'racing', lap: 3, paused: false, prismatic: false });
    await h.flush();
    const final = must(h.voices[1]);
    const bar = (4 * 60) / 130.85;
    expect(final.at).toBeCloseTo(race.at + 2 * bar, 6);
    h.music.race({ phase: 'racing', lap: 3, paused: false, prismatic: false });
    await h.flush();
    expect(h.voices).toHaveLength(2);
  });

  it('attenuates pause without restarting and applies Master/Music once', async () => {
    const h = harness();
    h.mixer.configure({ master: 0.5, music: 0.4, sfx: 1, engine: 1 });
    await h.music.unlock();
    h.music.race({ phase: 'racing', lap: 1, paused: false, prismatic: false });
    await h.flush();
    h.music.tick();
    expect(must(h.voices[0]).gain).toBeCloseTo(0.1);
    h.music.race({ phase: 'racing', lap: 1, paused: true, prismatic: false });
    h.music.tick();
    expect(must(h.voices[0]).gain).toBeCloseTo(0.025);
    h.music.race({ phase: 'racing', lap: 1, paused: false, prismatic: true });
    h.music.tick();
    expect(must(h.voices[0]).gain).toBeCloseTo(0.025);
    expect(h.voices).toHaveLength(1);
  });

  it('cancels a not-yet-started final lap when paused, then reschedules on resume', async () => {
    const h = harness();
    await h.music.unlock();
    h.music.race({ phase: 'racing', lap: 1, paused: false, prismatic: false });
    await h.flush();
    h.clock(101);
    h.music.race({ phase: 'racing', lap: 3, paused: false, prismatic: false });
    await h.flush();
    h.music.race({ phase: 'racing', lap: 3, paused: true, prismatic: false });
    await h.flush();
    expect(must(h.voices[1]).stopped).toBe(true);
    expect(must(h.voices[0]).stopped).toBe(false);
    h.music.race({ phase: 'racing', lap: 3, paused: false, prismatic: false });
    await h.flush();
    expect(must(h.voices.at(-1)).cue).toBe('final-lap');
    expect(must(h.voices.at(-1)).at).toBeGreaterThan(101);
  });

  it('silences hidden tabs and restores the existing loop position', async () => {
    const h = harness();
    await h.music.unlock();
    h.music.route('hub');
    await h.flush();
    h.clock(110);
    const previous = must(h.voices[0]);
    h.music.visibility(true);
    expect(previous.stopped).toBe(true);
    h.clock(130);
    h.music.visibility(false);
    await h.flush();
    expect(must(h.voices[1]).offset).toBeCloseTo(110 - previous.at);
  });

  it('finish supersedes pending final-lap playback and bounds outgoing voices', async () => {
    const h = harness();
    await h.music.unlock();
    h.music.race({ phase: 'racing', lap: 1, paused: false, prismatic: false });
    await h.flush();
    h.clock(101);
    h.music.race({ phase: 'racing', lap: 3, paused: false, prismatic: false });
    await h.flush();
    h.music.race({ phase: 'finished', lap: 3, paused: false, prismatic: false });
    await h.flush();
    expect(must(h.voices.at(-1)).cue).toBe('results');
    expect(h.voices.filter((v) => !v.stopped).length).toBeLessThanOrEqual(2);
    h.clock(105);
    h.music.tick();
    expect(h.voices.filter((v) => !v.stopped).map((v) => v.cue)).toEqual(['results']);
  });

  it('disposal prevents a late decode from creating a voice', async () => {
    const h = harness();
    await h.music.unlock();
    let resolve!: (v: boolean) => void;
    h.loads.set(
      'hub',
      new Promise((r) => {
        resolve = r;
      }),
    );
    h.music.route('hub');
    h.music.dispose();
    resolve(true);
    await h.flush();
    expect(h.voices).toHaveLength(0);
  });

  it('failed or suspended audio does not queue a stale screen cue', async () => {
    const h = harness();
    await h.music.unlock();
    h.loads.set('hub', Promise.resolve(false));
    h.music.route('hub');
    await h.flush();
    expect(h.voices).toHaveLength(0);
    h.available(false);
    h.music.route('select');
    await h.flush();
    expect(h.voices).toHaveLength(0);
    h.music.route('results');
    h.available(true);
    await h.music.unlock();
    await h.flush();
    expect(h.voices.map((v) => v.cue)).toEqual(['results']);
  });
  it('retains hidden-tab position until a suspended context is unlocked again', async () => {
    const h = harness();
    await h.music.unlock();
    h.music.route('hub');
    await h.flush();
    h.clock(110);
    h.music.visibility(true);
    h.available(false);
    h.music.visibility(false);
    h.available(true);
    await h.music.unlock();
    await h.flush();
    expect(must(h.voices.at(-1)).offset).toBeCloseTo(10);
  });
  it('recovers when decoding completes while the audio context is suspended', async () => {
    const h = harness();
    await h.music.unlock();
    let resolve!: (v: boolean) => void;
    h.loads.set(
      'hub',
      new Promise((r) => {
        resolve = r;
      }),
    );
    h.music.route('hub');
    h.available(false);
    resolve(true);
    await h.flush();
    h.available(true);
    await h.music.unlock();
    await h.flush();
    expect(must(h.voices.at(-1)).cue).toBe('hub');
  });
  it('resumes the race position before scheduling a hidden final-lap handoff', async () => {
    const h = harness();
    await h.music.unlock();
    h.music.race({ phase: 'racing', lap: 1, paused: false, prismatic: false });
    await h.flush();
    h.clock(101);
    h.music.race({ phase: 'racing', lap: 3, paused: false, prismatic: false });
    await h.flush();
    h.music.visibility(true);
    h.clock(120);
    h.music.visibility(false);
    await h.flush();
    expect(must(h.voices.at(-2)).cue).toBe('race');
    expect(must(h.voices.at(-2)).offset).toBe(1);
    expect(must(h.voices.at(-1)).at).toBeGreaterThan(120);
  });
});

function must<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Required fixture value missing.');
  return value;
}
