import { describe, expect, it } from 'vitest';
import {
  ITEM_IDS,
  type ItemId,
  type RaceRank,
} from '../src/game/items/itemDefinitions';
import {
  effectiveItemWeights,
  selectItem,
  type ItemSelectionContext,
} from '../src/game/items/ItemSelector';

const RANKS: readonly RaceRank[] = [1, 2, 3, 4, 5, 6, 7, 8];
const SELECTIONS_PER_RANK = 100_000;
const MAX_ABSOLUTE_DEVIATION_PERCENTAGE_POINTS = 0.5;
const BASE_SEED = 0x5a17c000;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function contextForRank(rank: RaceRank): ItemSelectionContext {
  return {
    rank,
    // Ranks 6-8 use the minimum legal Hyper-Drive gap so the full eligible
    // table is exercised while also applying the approved 1.18 gap factor.
    distanceBehindLeaderMeters: rank >= 6 ? 45 : 0,
    apexAvailable: true,
  };
}

function countsForRank(rank: RaceRank): Readonly<Record<ItemId, number>> {
  const random = mulberry32(BASE_SEED + rank);
  const context = contextForRank(rank);
  const counts = Object.fromEntries(ITEM_IDS.map((itemId) => [itemId, 0])) as Record<
    ItemId,
    number
  >;

  for (let selection = 0; selection < SELECTIONS_PER_RANK; selection += 1) {
    counts[selectItem(context, random)] += 1;
  }

  return counts;
}

describe('Slice 5 seeded item distribution', () => {
  it.each(RANKS)(
    'keeps 100,000 deterministic selections for rank %i within the approved tolerance',
    (rank) => {
      const context = contextForRank(rank);
      const counts = countsForRank(rank);
      const weights = effectiveItemWeights(context);
      const totalWeight = weights.reduce((total, entry) => total + entry.weight, 0);
      const totalSelections = ITEM_IDS.reduce((total, itemId) => total + counts[itemId], 0);

      expect(totalSelections).toBe(SELECTIONS_PER_RANK);

      for (const { itemId, weight } of weights) {
        const expectedPercent = (weight / totalWeight) * 100;
        const observedPercent = (counts[itemId] / SELECTIONS_PER_RANK) * 100;
        const absoluteDeviation = Math.abs(observedPercent - expectedPercent);

        if (weight === 0) {
          expect(counts[itemId], `${itemId} should remain impossible at rank ${String(rank)}`).toBe(0);
          continue;
        }

        expect(
          absoluteDeviation,
          `${itemId} rank ${String(rank)} deviated ${absoluteDeviation.toFixed(3)} percentage points`,
        ).toBeLessThanOrEqual(MAX_ABSOLUTE_DEVIATION_PERCENTAGE_POINTS);
      }
    },
    15_000,
  );
});
