const APPROVED_VICTORY_HASH_BY_CHARACTER: Readonly<Record<string, string>> = {
  'aa-01': '9b8751e027a5e62883ec5b1aab280a7dae1bef6d9dfd6e015b034914a1686aaa',
  'aa-02': '704148c27f72300d3f6ff9937b155e71bbeca63a38bb2c0ec9768efa5b5a1af3',
  'aa-03': '5a548d229cea14cd824c13014f51cfbef3e9329a77f26573a0aadcd0c28140d2',
  'aa-04': '4e4ffce804a8ff94d15eca9a04211c309ea3ec24c995c40761f39811754ddf06',
  'aa-05': 'd71c483a32290bbb68f5eb8f13d4bf8cf487b8f0af1cbbcf43e1b5eb2fb9578b',
  'aa-06': 'c2fda346f374a34b5aa190c8c4549422863688db3da49b4e5948394a411f710d',
};

export function raceResultsVictoryUrl(characterId: string, place: number | null): string | null {
  if (place === null || place < 1 || place > 3) return null;
  const hash = APPROVED_VICTORY_HASH_BY_CHARACTER[characterId];
  if (hash === undefined) return null;
  return `${import.meta.env.BASE_URL}assets/characters/${characterId}/results/victory.png?v=${hash}`;
}
