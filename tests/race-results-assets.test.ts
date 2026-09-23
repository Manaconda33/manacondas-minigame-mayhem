import { describe, expect, it } from 'vitest';
import { raceResultsVictoryUrl } from '../src/ui/raceAssets';

describe('race Results victory assets', () => {
  it.each([
    ['aa-07', '21cbd6c61c2510baa22e351fce1564887331b511c0230345e79d7a3f42f91c02'],
    ['aa-08', '1ab53ed1c8d21314d14a99f9c80f65f4d3242cd929f30d1bf072c00ad86419cf'],
    ['aa-09', '19adc4de4c6a60d8ceb44ff73579b39812833965d42225305f0badd1be923a9b'],
  ])('maps approved %s victory art to its hash-revisioned runtime URL', (characterId, hash) => {
    expect(raceResultsVictoryUrl(characterId, 1)).toBe(
      `/assets/characters/${characterId}/results/victory.png?v=${hash}`,
    );
  });

  it('keeps mapped art limited to podium places', () => {
    expect(raceResultsVictoryUrl('aa-07', 4)).toBeNull();
    expect(raceResultsVictoryUrl('aa-10', 1)).toBeNull();
  });
});
