const APPROVED_VICTORY_HASH_BY_CHARACTER: Readonly<Record<string, string>> = {
  'aa-01': '9b8751e027a5e62883ec5b1aab280a7dae1bef6d9dfd6e015b034914a1686aaa',
  'aa-02': '704148c27f72300d3f6ff9937b155e71bbeca63a38bb2c0ec9768efa5b5a1af3',
  'aa-03': '5a548d229cea14cd824c13014f51cfbef3e9329a77f26573a0aadcd0c28140d2',
  'aa-04': '4e4ffce804a8ff94d15eca9a04211c309ea3ec24c995c40761f39811754ddf06',
  'aa-05': 'd71c483a32290bbb68f5eb8f13d4bf8cf487b8f0af1cbbcf43e1b5eb2fb9578b',
  'aa-06': 'c2fda346f374a34b5aa190c8c4549422863688db3da49b4e5948394a411f710d',
  'aa-07': '21cbd6c61c2510baa22e351fce1564887331b511c0230345e79d7a3f42f91c02',
  'aa-08': '1ab53ed1c8d21314d14a99f9c80f65f4d3242cd929f30d1bf072c00ad86419cf',
  'aa-09': '19adc4de4c6a60d8ceb44ff73579b39812833965d42225305f0badd1be923a9b',
  'aa-10': 'ceb43f0c7b12a7ad16556dfec460ffc29cfc4372561ce1fa9580a8399aa76c98',
  'aa-11': '59dd6987fef114989b7afba9cf13fec40b9896801619285165b646124e88b47b',
  'aa-12': '218ef5b7d5650046d04f5cc9adaeb014b9d7829d4b711079ed50c810173ca107',
};

const APPROVED_REACTION_HASH_BY_CHARACTER: Readonly<Record<string, string>> = {
  'aa-01': 'b6df95f50c0aa83908f2909e231b763031b2099e62b6fb67cff6a5798f97d650',
  'aa-02': '062a932545ab14a2e5db365d60f45fe95b8285ba96850b38ae994c97e408a430',
  'aa-03': '0ae22c91b376259390541dc7193648b6631015eee20b5f18153b31ba97482b91',
  'aa-04': 'cfb9800f7675c85c055acdbd6a9fbdc3e22748bbc9166e404f3e429c5fe6ee9b',
  'aa-05': '57030b478a9b0cdf6607f5c3041385989768abda61d72d1316b8696b5c390445',
  'aa-06': '0997d1684a9fc29c05995bb7e361a507d5e967f8965ab77312590fb6488e8e6b',
  'aa-07': '6ea0df99354f4cb59310ae6ab7d41159940e3b5de23200b94127d6f8da717ca5',
  'aa-08': 'c99be19b82f41a1b2ace6be6f6d153e238056f4750392fa9affa2dffcf7c1b83',
  'aa-09': '899fc626403f9811528acb01aa4f6bc259cdef334e19b3921f4ed488e3c3813f',
  'aa-10': 'c91d9947d42873d3da73f7f31edfca7f9201fcbb2be14f244f1d8fea2ecfbae8',
  'aa-11': '65dc0695310a406f46b7f3574bdea7b28bceab6fcf0ce98c2db5dcf44eba40f5',
  'aa-12': '048275029ea11e85cba10fd1ce918a6d3ec479396324fb1174e5ae7e772462b8',
};

export function raceResultsVictoryUrl(characterId: string, place: number | null): string | null {
  if (place === null || place < 1 || place > 3) return null;
  const hash = APPROVED_VICTORY_HASH_BY_CHARACTER[characterId];
  if (hash === undefined) return null;
  return `${import.meta.env.BASE_URL}assets/characters/${characterId}/results/victory.png?v=${hash}`;
}

export function raceResultsReactionUrl(characterId: string, place: number | null): string | null {
  if (place === null || place < 4 || place > 8) return null;
  const hash = APPROVED_REACTION_HASH_BY_CHARACTER[characterId];
  if (hash === undefined) return null;
  return `${import.meta.env.BASE_URL}assets/characters/${characterId}/results/reaction.png?v=${hash}`;
}
