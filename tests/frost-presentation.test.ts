import { describe, it, expect, vi } from 'vitest';
import { FrostAudio } from '../src/audio/FrostAudio';
import { frostTestFromSearch, FrostFixture } from '../src/game/items/FrostFixture';

describe('Frost fixture isolation and audio lifecycle', () => {
  it.each([
    ['', null],
    ['?testFrost=hit', null],
    ['?testItem=blaze-orbs&testFrost=hit', null],
    ['?testItem=frost-orbs&testFrost=hit', 'hit'],
    ['?testItem=frost-orbs&testFrost=refresh', 'refresh'],
    ['?testItem=shockwave&testFrost=shockwave', 'shockwave'],
    ['?testItem=prismatic-invincibility&testFrost=prismatic&testFrostPhase=protected', 'protected'],
    ['?testItem=prismatic-invincibility&testFrost=prismatic&testFrostPhase=expired', 'expired'],
    ['?testItem=prismatic-invincibility&testFrost=prismatic&testFrostPhase=invalid', null],
  ])('parses only valid fixed-item fixture combination %s', (search, result) => {
    expect(frostTestFromSearch(search)).toBe(result);
    const f = new FrostFixture(null);
    expect(f.badge()).toBeNull();
    expect(f.group.children).toHaveLength(0);
    f.dispose();
  });
  it('requires unlocked audio, bounds voices, disconnects ended voices, and clears on pause/disposal', () => {
    const audio = new FrostAudio();
    const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
    const oscillators: {
      stop: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
      onended: (() => void) | null;
    }[] = [];
    const context = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => {
        const o = {
          type: '',
          frequency: param(),
          start: vi.fn(),
          stop: vi.fn(),
          connect: vi.fn((g: unknown) => g),
          disconnect: vi.fn(),
          onended: null as (() => void) | null,
        };
        oscillators.push(o);
        return o;
      }),
      createGain: vi.fn(() => ({ gain: param(), connect: vi.fn(), disconnect: vi.fn() })),
    };
    audio.play('launch', null, 1);
    audio.play('launch', context as unknown as AudioContext, 0);
    context.state = 'suspended';
    audio.play('launch', context as unknown as AudioContext, 1);
    expect(context.createOscillator).not.toHaveBeenCalled();
    context.state = 'running';
    for (let i = 0; i < 20; i++) audio.play('impact', context as unknown as AudioContext, 0.5);
    expect(oscillators).toHaveLength(8);
    const ended = oscillators[0]?.onended;
    if (!ended) throw new Error('Missing ended callback');
    ended();
    audio.play('launch', context as unknown as AudioContext, 1);
    expect(oscillators).toHaveLength(9);
    audio.dispose();
    expect(oscillators.every((o) => o.disconnect.mock.calls.length > 0)).toBe(true);
    audio.play('impact', context as unknown as AudioContext, 1);
    expect(oscillators).toHaveLength(10);
    audio.dispose();
  });
});
