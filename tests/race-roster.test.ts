import { describe, expect, it } from 'vitest';
import { characterManifest } from '../src/characters/manifest';
import { selectAiRoster } from '../src/characters/raceRoster';

describe('AI character roster selection', () => {
  it('selects seven unique opponents without duplicating the player', () => {
    const opponents = selectAiRoster(characterManifest, 'aa-02', 7, () => 0.42);
    expect(opponents).toHaveLength(7);
    expect(new Set(opponents.map(({ id }) => id)).size).toBe(7);
    expect(opponents.some(({ id }) => id === 'aa-02')).toBe(false);
  });

  it('excludes Archer when he is the player and keeps the eight-racer grid', () => {
    const opponents = selectAiRoster(characterManifest, 'aa-13', 7, () => 0.42);
    expect(opponents).toHaveLength(7);
    expect(new Set(opponents.map(({ id }) => id)).size).toBe(7);
    expect(opponents.some(({ id }) => id === 'aa-13')).toBe(false);
    expect(selectAiRoster(characterManifest, 'aa-01', 13).some(({ id }) => id === 'aa-13')).toBe(
      true,
    );
  });

  it('varies the selected roster when the random source changes', () => {
    const first = selectAiRoster(characterManifest, 'aa-01', 7, () => 0);
    const second = selectAiRoster(characterManifest, 'aa-01', 7, () => 0.999);
    expect(first.map(({ id }) => id)).not.toEqual(second.map(({ id }) => id));
  });

  it('rejects a grid larger than the unique available roster', () => {
    expect(() => selectAiRoster(characterManifest, 'aa-01', 14)).toThrow(
      'AI roster exceeds the available unique racers.',
    );
  });
});
