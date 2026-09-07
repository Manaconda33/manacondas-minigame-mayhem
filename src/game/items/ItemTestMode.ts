import { ITEM_IDS, type ItemId } from './itemDefinitions';

const ITEM_ID_SET = new Set<string>(ITEM_IDS);

export function forcedItemFromSearch(search: string): ItemId | null {
  const value = new URLSearchParams(search).get('testItem');
  return value !== null && ITEM_ID_SET.has(value) ? (value as ItemId) : null;
}

export function forcedItemForRacer(forcedItem: ItemId | null, racerId: string): ItemId | null {
  return racerId === 'player' ? forcedItem : null;
}

/** Incoming fixture is independent of inventory forcing and never implicit. */
export function incomingSeekerFromSearch(search: string): boolean {
  return new URLSearchParams(search).get('testSeekerIncoming') === '1';
}

export function incomingApexFromSearch(search: string): boolean {
  return new URLSearchParams(search).get('testApexIncoming') === '1';
}

export function incomingBlastOrbFromSearch(search: string): boolean {
  return new URLSearchParams(search).get('testBlastOrbIncoming') === '1';
}

export function incomingSlickFromSearch(search: string): boolean {
  return new URLSearchParams(search).get('testSlickAhead') === '1';
}
