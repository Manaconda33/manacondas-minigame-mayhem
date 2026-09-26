import { describe, expect, it } from 'vitest';
import { buildRaceStandings } from '../src/game/raceResults';

const identities = [
  { racerId: 'player', characterId: 'aa-09', displayName: 'Manaconda', portrait: '/manaconda.png' },
  { racerId: 'ai-1', characterId: 'aa-01', displayName: 'Alex', portrait: '/alex.png' },
  { racerId: 'ai-2', characterId: 'aa-02', displayName: 'Lavi', portrait: '/lavi.png' },
  { racerId: 'ai-3', characterId: 'aa-03', displayName: 'Lula', portrait: '/lula.png' },
  { racerId: 'ai-4', characterId: 'aa-04', displayName: 'Keeg', portrait: '/keeg.png' },
  { racerId: 'ai-5', characterId: 'aa-05', displayName: 'Kraken', portrait: '/kraken.png' },
  {
    racerId: 'ai-6',
    characterId: 'aa-06',
    displayName: 'Dragon Queen',
    portrait: '/dragon-queen.png',
  },
  {
    racerId: 'ai-7',
    characterId: 'aa-07',
    displayName: 'McFleurdel',
    portrait: '/mcfleurdel.png',
  },
] as const;

describe('race result identity snapshots', () => {
  it('maps all eight stable racer identities without changing authoritative order or legacy fields', () => {
    const standings = buildRaceStandings(
      [
        { id: 'ai-5', finishPlace: 1, finishTime: 61.125 },
        { id: 'player', finishPlace: 2, finishTime: 62.5 },
        { id: 'ai-7', finishPlace: 3, finishTime: 63.75 },
        { id: 'ai-1', finishPlace: 4, finishTime: 64.25 },
        { id: 'ai-2', finishPlace: 5, finishTime: 65.5 },
        { id: 'ai-3', finishPlace: 6, finishTime: 66.75 },
        { id: 'ai-4', finishPlace: 7, finishTime: 68 },
        { id: 'ai-6', finishPlace: null, finishTime: null },
      ],
      identities,
    );

    expect(
      standings.map(({ racerId, characterId, displayName, name, portrait, place, time }) => ({
        racerId,
        characterId,
        displayName,
        name,
        portrait,
        place,
        time,
      })),
    ).toEqual([
      {
        racerId: 'ai-5',
        characterId: 'aa-05',
        displayName: 'Kraken',
        name: 'Kraken',
        portrait: '/kraken.png',
        place: 1,
        time: 61.125,
      },
      {
        racerId: 'player',
        characterId: 'aa-09',
        displayName: 'Manaconda',
        name: 'YOU',
        portrait: '/manaconda.png',
        place: 2,
        time: 62.5,
      },
      {
        racerId: 'ai-7',
        characterId: 'aa-07',
        displayName: 'McFleurdel',
        name: 'McFleurdel',
        portrait: '/mcfleurdel.png',
        place: 3,
        time: 63.75,
      },
      {
        racerId: 'ai-1',
        characterId: 'aa-01',
        displayName: 'Alex',
        name: 'Alex',
        portrait: '/alex.png',
        place: 4,
        time: 64.25,
      },
      {
        racerId: 'ai-2',
        characterId: 'aa-02',
        displayName: 'Lavi',
        name: 'Lavi',
        portrait: '/lavi.png',
        place: 5,
        time: 65.5,
      },
      {
        racerId: 'ai-3',
        characterId: 'aa-03',
        displayName: 'Lula',
        name: 'Lula',
        portrait: '/lula.png',
        place: 6,
        time: 66.75,
      },
      {
        racerId: 'ai-4',
        characterId: 'aa-04',
        displayName: 'Keeg',
        name: 'Keeg',
        portrait: '/keeg.png',
        place: 7,
        time: 68,
      },
      {
        racerId: 'ai-6',
        characterId: 'aa-06',
        displayName: 'Dragon Queen',
        name: 'Dragon Queen',
        portrait: '/dragon-queen.png',
        place: null,
        time: null,
      },
    ]);
    expect(new Set(standings.map(({ characterId }) => characterId)).size).toBe(8);
  });

  it('keeps the player place and time locked when a late AI finish updates the standings', () => {
    const initial = buildRaceStandings(
      [
        { id: 'player', finishPlace: 1, finishTime: 72.375 },
        { id: 'ai-1', finishPlace: null, finishTime: null },
      ],
      identities,
    );
    const refreshed = buildRaceStandings(
      [
        { id: 'player', finishPlace: 1, finishTime: 72.375 },
        { id: 'ai-1', finishPlace: 2, finishTime: 73.125 },
      ],
      identities,
    );

    expect(initial[0]).toMatchObject({ racerId: 'player', place: 1, time: 72.375 });
    expect(refreshed.map(({ racerId, place, time }) => ({ racerId, place, time }))).toEqual([
      { racerId: 'player', place: 1, time: 72.375 },
      { racerId: 'ai-1', place: 2, time: 73.125 },
    ]);
  });
});
