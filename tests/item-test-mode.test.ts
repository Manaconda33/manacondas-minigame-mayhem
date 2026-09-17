import { describe, expect, it } from 'vitest';
import { ITEM_IDS } from '../src/game/items/itemDefinitions';
import {
  aiForcedItemForRacer,
  aiForcedItemFromSearch,
  aiForcedRacerFromSearch,
  forcedItemForRacer,
  forcedItemFromSearch,
} from '../src/game/items/ItemTestMode';

describe('Slice 5 live item-test mode', () => {
  it('accepts every governed item id', () => {
    for (const itemId of ITEM_IDS) {
      expect(forcedItemFromSearch(`?testItem=${itemId}`)).toBe(itemId);
    }
  });
  it('ignores missing or invalid overrides', () => {
    expect(forcedItemFromSearch('')).toBeNull();
    expect(forcedItemFromSearch('?foo=nitro-surge')).toBeNull();
    expect(forcedItemFromSearch('?testItem=not-a-real-item')).toBeNull();
  });
  it('forces only the player inventory', () => {
    expect(forcedItemForRacer('nitro-surge', 'player')).toBe('nitro-surge');
    expect(forcedItemForRacer('nitro-surge', 'ai-1')).toBeNull();
    expect(forcedItemForRacer(null, 'player')).toBeNull();
  });
  it('keeps deterministic AI forcing separate and scoped to one valid AI racer', () => {
    expect(aiForcedItemFromSearch('?testAiItem=shockwave')).toBe('shockwave');
    expect(aiForcedRacerFromSearch('?testAiItem=shockwave')).toBe('ai-1');
    expect(aiForcedRacerFromSearch('?testAiItem=shockwave&testAiRacer=ai-6')).toBe('ai-6');
    expect(aiForcedRacerFromSearch('?testAiItem=shockwave&testAiRacer=player')).toBeNull();
    expect(aiForcedItemForRacer('shockwave', 'ai-1', 'ai-1')).toBe('shockwave');
    expect(aiForcedItemForRacer('shockwave', 'ai-1', 'ai-2')).toBeNull();
    expect(aiForcedItemFromSearch('?testAiItem=not-a-real-item')).toBeNull();
  });
});
