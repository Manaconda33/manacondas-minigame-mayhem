import {
  ITEM_IDS,
  ITEM_PROBABILITY_BY_RANK,
  type ItemId,
  type RaceRank,
} from './itemDefinitions';

const GAP_WEIGHT_ITEMS = new Set<ItemId>([
  'apex-missile',
  'nitro-overdrive',
  'hyper-drive-rocket',
  'prismatic-invincibility',
]);

export interface ItemSelectionContext {
  rank: RaceRank;
  distanceBehindLeaderMeters: number;
  apexAvailable?: boolean;
  isRuntimeEligible?: (itemId: ItemId) => boolean;
}

export interface ItemWeight {
  itemId: ItemId;
  weight: number;
}

export function itemGapFactor(distanceBehindLeaderMeters: number): number {
  const raw = 1 + distanceBehindLeaderMeters / 250;
  return Math.min(1.35, Math.max(1, raw));
}

export function effectiveItemWeights(context: ItemSelectionContext): ItemWeight[] {
  const baseWeights = ITEM_PROBABILITY_BY_RANK[context.rank];
  const applyGapWeight = context.rank >= 6;
  const gapFactor = itemGapFactor(context.distanceBehindLeaderMeters);

  return ITEM_IDS.map((itemId) => {
    let weight = baseWeights[itemId];

    if (itemId === 'apex-missile' && context.apexAvailable === false) {
      weight = 0;
    }

    if (
      itemId === 'hyper-drive-rocket' &&
      (context.rank < 6 || context.distanceBehindLeaderMeters < 45)
    ) {
      weight = 0;
    }

    if (context.isRuntimeEligible && !context.isRuntimeEligible(itemId)) {
      weight = 0;
    }

    if (weight > 0 && applyGapWeight && GAP_WEIGHT_ITEMS.has(itemId)) {
      weight *= gapFactor;
    }

    return { itemId, weight };
  });
}

export function selectItem(
  context: ItemSelectionContext,
  random: () => number = Math.random,
): ItemId {
  const weights = effectiveItemWeights(context);
  const totalWeight = weights.reduce((total, entry) => total + entry.weight, 0);

  if (totalWeight <= 0) {
    throw new Error('No eligible item remains after Slice 5 runtime restrictions.');
  }

  const boundedRandom = Math.min(0.999999999999, Math.max(0, random()));
  const roll = boundedRandom * totalWeight;
  let cursor = 0;

  for (const entry of weights) {
    cursor += entry.weight;
    if (roll < cursor) return entry.itemId;
  }

  throw new Error('Weighted item selection failed to resolve an eligible item.');
}
