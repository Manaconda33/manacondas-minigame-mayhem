import { describe, expect, it } from 'vitest';
import { raceResultsVictoryUrl } from '../src/ui/raceAssets';

describe('race Results victory assets', () => {
  it.each([
    ['aa-07', '21cbd6c61c2510baa22e351fce1564887331b511c0230345e79d7a3f42f91c02'],
    ['aa-08', '1ab53ed1c8d21314d14a99f9c80f65f4d3242cd929f30d1bf072c00ad86419cf'],
    ['aa-09', '19adc4de4c6a60d8ceb44ff73579b39812833965d42225305f0badd1be923a9b'],
    ['aa-10', 'ceb43f0c7b12a7ad16556dfec460ffc29cfc4372561ce1fa9580a8399aa76c98'],
    ['aa-11', '59dd6987fef114989b7afba9cf13fec40b9896801619285165b646124e88b47b'],
    ['aa-12', '218ef5b7d5650046d04f5cc9adaeb014b9d7829d4b711079ed50c810173ca107'],
  ])('maps approved %s victory art to its hash-revisioned runtime URL', (characterId, hash) => {
    expect(raceResultsVictoryUrl(characterId, 1)).toBe(
      `/assets/characters/${characterId}/results/victory.png?v=${hash}`,
    );
  });

  it('keeps mapped art limited to podium places', () => {
    expect(raceResultsVictoryUrl('aa-07', 4)).toBeNull();
    expect(raceResultsVictoryUrl('aa-10', 8)).toBeNull();
    expect(raceResultsVictoryUrl('aa-13', 1)).toBeNull();
  });
});
