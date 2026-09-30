import { describe, expect, it } from 'vitest';
import { RaceSfx, type RaceSoundFrame } from '../src/audio/RaceSfx';
import { SfxBank } from '../src/audio/SfxBank';
import { AudioMixer } from '../src/audio/AudioMixer';

function fixture() {
  const heard: string[] = [];
  const bank = new SfxBank(new AudioMixer(() => undefined), (url) => ({
    play: () => {
      heard.push(url.split('/').at(-1)?.split('.wav')[0] ?? '');
      return heard.length;
    },
    stop: () => undefined,
    volume: () => undefined,
    rate: () => undefined,
    pos: () => undefined,
    loop: () => undefined,
    once: () => undefined,
    unload: () => undefined,
  }));
  const sound = new RaceSfx(bank, () => undefined);
  const frame: RaceSoundFrame = {
    paused: false,
    countdown: '3',
    finished: false,
    lap: 1,
    place: 1,
    speed: 0,
    throttle: 0,
    driftTier: 'none',
    boost: false,
    airborne: false,
    surface: 'asphalt',
    wrongWay: false,
    itemPhase: 'empty',
    spinout: false,
    prismatic: false,
    overdrive: false,
    rocket: false,
    frost: false,
    position: { x: 0, y: 0, z: 0 },
    forward: { x: 0, y: 0, z: 1 },
    ai: [],
    projectiles: [],
    hazards: [],
    seekerWarning: null,
    apexWarning: null,
  };
  return { sound, bank, heard, frame };
}

describe('race SFX integration state', () => {
  it('plays countdown, final lap, finish and placement exactly once per transition', () => {
    const { sound, heard, frame } = fixture();
    sound.update(frame, 0.016);
    sound.update(frame, 0.016);
    frame.countdown = 'GO!';
    sound.update(frame, 0.016);
    sound.update(frame, 0.016);
    frame.countdown = '';
    frame.lap = 3;
    sound.update(frame, 0.016);
    frame.finished = true;
    sound.update(frame, 0.016);
    sound.update(frame, 0.016);
    expect(heard.filter((x) => x === 'countdown-tick')).toHaveLength(1);
    expect(heard.filter((x) => x === 'race-start-go')).toHaveLength(1);
    expect(heard.filter((x) => x === 'final-lap')).toHaveLength(1);
    expect(heard.filter((x) => x === 'race-finish')).toHaveLength(1);
    expect(heard.filter((x) => x === 'placement-win')).toHaveLength(1);
  });
  it('silences all loops on pause/finish and resumes the current engine state', () => {
    const { sound, bank, frame } = fixture();
    frame.countdown = '';
    frame.speed = 20;
    sound.update(frame, 0.016);
    expect(bank.voiceCount()).toBeGreaterThan(0);
    frame.paused = true;
    sound.update(frame, 0.016);
    expect(bank.voiceCount()).toBe(0);
    frame.paused = false;
    sound.update(frame, 0.016);
    expect(bank.voiceCount()).toBeGreaterThan(0);
    sound.dispose();
    expect(bank.voiceCount()).toBe(0);
  });
  it('plays committed launches even when the projectile has already disappeared', () => {
    const { sound, heard, frame } = fixture();
    sound.itemUse('seeker-drone', true, frame.position);
    sound.itemUse('prismatic-invincibility', true, frame.position);
    sound.update(frame, 0.016);
    expect(heard.filter((x) => x === 'seeker-launch')).toHaveLength(1);
    expect(heard.filter((x) => x === 'prismatic-activate')).toHaveLength(1);
  });
  it('gives distinct escalating warnings and avoids repeating pickup/ready/landing every frame', () => {
    const { sound, heard, frame } = fixture();
    frame.countdown = '';
    sound.update(frame, 0.016);
    frame.itemPhase = 'roulette';
    sound.update(frame, 0.016);
    sound.update(frame, 0.016);
    frame.itemPhase = 'held';
    frame.airborne = true;
    sound.update(frame, 0.016);
    frame.airborne = false;
    frame.seekerWarning = 3;
    frame.apexWarning = 'diving';
    sound.update(frame, 0.016);
    sound.update(frame, 0.016);
    expect(heard.filter((x) => x === 'item-box-collect')).toHaveLength(1);
    expect(heard.filter((x) => x === 'item-ready')).toHaveLength(1);
    expect(heard.filter((x) => x.startsWith('landing-'))).toHaveLength(1);
    expect(heard).toContain('seeker-warning-urgent');
    expect(heard).toContain('apex-warning-urgent');
  });
});
