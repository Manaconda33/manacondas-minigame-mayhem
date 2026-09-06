import { describe, expect, it } from 'vitest';
import { ITEM_IDS } from '../src/game/items/itemDefinitions';
import { forcedItemForRacer, forcedItemFromSearch } from '../src/game/items/ItemTestMode';

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
});
