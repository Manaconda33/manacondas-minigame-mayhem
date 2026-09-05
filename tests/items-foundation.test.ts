import { describe, expect, it } from 'vitest';
import { ItemBoxLifecycle, ITEM_BOX_TIMING } from '../src/game/items/ItemBoxLifecycle';
import { ItemInventory } from '../src/game/items/ItemInventory';
import {
  ITEM_DEFINITIONS,
  ITEM_IDS,
  ITEM_PROBABILITY_BY_RANK,
  probabilityTotalForRank,
  type RaceRank,
} from '../src/game/items/itemDefinitions';
import {
  effectiveItemWeights,
  itemGapFactor,
  selectItem,
} from '../src/game/items/ItemSelector';

const RANKS: readonly RaceRank[] = [1, 2, 3, 4, 5, 6, 7, 8];

describe('Slice 5 item configuration', () => {
  it('defines all fifteen unique items and preserves the approved rank totals', () => {
    expect(ITEM_IDS).toHaveLength(15);
    expect(new Set(ITEM_IDS).size).toBe(15);
    expect(Object.keys(ITEM_DEFINITIONS)).toHaveLength(15);

    for (const rank of RANKS) {
      expect(probabilityTotalForRank(rank)).toBe(100);
      expect(Object.keys(ITEM_PROBABILITY_BY_RANK[rank])).toHaveLength(15);
    }
  });

  it('keeps multi-charge counts in configuration', () => {
    expect(ITEM_DEFINITIONS['blaze-orbs'].charges).toBe(5);
    expect(ITEM_DEFINITIONS['frost-orbs'].charges).toBe(3);
    expect(ITEM_DEFINITIONS['arc-blade'].charges).toBe(3);
    expect(ITEM_DEFINITIONS['arc-hammers'].charges).toBe(5);
  });
});

describe('Slice 5 weighted selector', () => {
  it('clamps the PRD gap factor to the approved 1.00-1.35 range', () => {
    expect(itemGapFactor(-100)).toBe(1);
    expect(itemGapFactor(0)).toBe(1);
    expect(itemGapFactor(45)).toBeCloseTo(1.18);
    expect(itemGapFactor(250)).toBe(1.35);
    expect(itemGapFactor(1000)).toBe(1.35);
  });

  it('removes Hyper-Drive below the approved 45 m meaningful-gap threshold', () => {
    const belowThreshold = effectiveItemWeights({
      rank: 8,
      distanceBehindLeaderMeters: 44.99,
    });
    const atThreshold = effectiveItemWeights({
      rank: 8,
      distanceBehindLeaderMeters: 45,
    });

    expect(belowThreshold.find((entry) => entry.itemId === 'hyper-drive-rocket')?.weight).toBe(0);
    expect(atThreshold.find((entry) => entry.itemId === 'hyper-drive-rocket')?.weight).toBeGreaterThan(15);
  });

  it('filters unavailable Apex and arbitrary runtime prerequisites before selection', () => {
    const weights = effectiveItemWeights({
      rank: 8,
      distanceBehindLeaderMeters: 100,
      apexAvailable: false,
      isRuntimeEligible: (itemId) => itemId === 'nitro-surge',
    });

    expect(weights.find((entry) => entry.itemId === 'apex-missile')?.weight).toBe(0);
    expect(selectItem(
      {
        rank: 8,
        distanceBehindLeaderMeters: 100,
        apexAvailable: false,
        isRuntimeEligible: (itemId) => itemId === 'nitro-surge',
      },
      () => 0.73,
    )).toBe('nitro-surge');
  });

  it('fails explicitly when runtime restrictions leave no valid item', () => {
    expect(() =>
      selectItem({
        rank: 1,
        distanceBehindLeaderMeters: 0,
        isRuntimeEligible: () => false,
      }),
    ).toThrow('No eligible item remains');
  });
});

describe('Slice 5 one-slot inventory', () => {
  it('rejects a second pickup until the held item is exhausted or cleared', () => {
    const inventory = new ItemInventory();

    expect(inventory.acquire('blaze-orbs')).toBe(true);
    expect(inventory.acquire('kinetic-disc')).toBe(false);
    expect(inventory.snapshot()).toEqual({ itemId: 'blaze-orbs', remainingCharges: 5 });

    for (let charge = 4; charge >= 1; charge -= 1) {
      expect(inventory.consumeCharge()).toBe(true);
      expect(inventory.snapshot()).toEqual({ itemId: 'blaze-orbs', remainingCharges: charge });
    }

    expect(inventory.consumeCharge()).toBe(true);
    expect(inventory.snapshot()).toBeNull();
    expect(inventory.acquire('kinetic-disc')).toBe(true);
  });
});

describe('Slice 5 item-box lifecycle', () => {
  it('pops on collection, disappears, then fades back before becoming collectible', () => {
    const box = new ItemBoxLifecycle();

    expect(box.presentation()).toEqual({
      phase: 'available',
      visible: true,
      collectible: true,
      opacity: 1,
      scale: 1,
    });

    expect(box.collect()).toBe(true);
    expect(box.presentation().phase).toBe('popping');
    expect(box.presentation().collectible).toBe(false);

    box.advance(ITEM_BOX_TIMING.popSeconds / 2);
    const midPop = box.presentation();
    expect(midPop.phase).toBe('popping');
    expect(midPop.opacity).toBeCloseTo(0.5);
    expect(midPop.scale).toBeGreaterThan(1);

    box.advance(ITEM_BOX_TIMING.popSeconds / 2);
    expect(box.presentation()).toEqual({
      phase: 'hidden',
      visible: false,
      collectible: false,
      opacity: 0,
      scale: 0,
    });

    box.advance(ITEM_BOX_TIMING.respawnSeconds - ITEM_BOX_TIMING.fadeSeconds - ITEM_BOX_TIMING.popSeconds + 0.05);
    const fading = box.presentation();
    expect(fading.phase).toBe('respawning');
    expect(fading.visible).toBe(true);
    expect(fading.collectible).toBe(false);
    expect(fading.opacity).toBeGreaterThan(0);
    expect(fading.opacity).toBeLessThan(1);
    expect(box.collect()).toBe(false);

    box.advance(ITEM_BOX_TIMING.fadeSeconds);
    expect(box.isCollectible()).toBe(true);
    expect(box.presentation().phase).toBe('available');
    expect(box.presentation().opacity).toBe(1);
    expect(box.presentation().scale).toBe(1);
  });
});
