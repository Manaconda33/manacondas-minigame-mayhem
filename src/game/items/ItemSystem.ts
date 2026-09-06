import { ItemInventory, type HeldItem } from './ItemInventory';
import { ITEM_DEFINITIONS, ITEM_IDS, type ItemId } from './itemDefinitions';

export const ITEM_ROULETTE_SECONDS = 0.85;
export const ITEM_ROULETTE_STEP_SECONDS = 0.07;
export const ITEM_USE_FEEDBACK_SECONDS = 0.45;
export const ITEM_USE_KEY_CODES = ['ShiftLeft', 'KeyE'] as const;

export type ItemUseDirection = 'forward' | 'backward';
export type ItemHudPhase = 'empty' | 'roulette' | 'held';

export interface ItemUseRequest {
  racerId: string;
  itemId: ItemId;
  direction: ItemUseDirection;
  remainingCharges: number;
}

export interface ItemHudSnapshot {
  phase: ItemHudPhase;
  itemId: ItemId | null;
  displayName: string;
  icon: string;
  remainingCharges: number;
  totalCharges: number;
  rouletteProgress: number;
  useFeedback: ItemUseDirection | null;
}

interface RouletteState {
  selectedItemId: ItemId;
  elapsed: number;
}

interface UseFeedbackState {
  direction: ItemUseDirection;
  remaining: number;
}

interface RacerItemState {
  inventory: ItemInventory;
  roulette: RouletteState | null;
  useFeedback: UseFeedbackState | null;
}

const EMPTY_HUD: ItemHudSnapshot = {
  phase: 'empty',
  itemId: null,
  displayName: 'Empty',
  icon: '—',
  remainingCharges: 0,
  totalCharges: 0,
  rouletteProgress: 0,
  useFeedback: null,
};

export function isItemUseKey(code: string): boolean {
  return ITEM_USE_KEY_CODES.some((candidate) => candidate === code);
}

export function itemUseDirection(reverseHeld: boolean): ItemUseDirection {
  return reverseHeld ? 'backward' : 'forward';
}

export class ItemSystem {
  private readonly racers = new Map<string, RacerItemState>();

  public canCollect(racerId: string): boolean {
    return !this.stateFor(racerId).inventory.isOccupied();
  }

  public acquire(racerId: string, itemId: ItemId): boolean {
    const state = this.stateFor(racerId);
    if (!state.inventory.acquire(itemId)) return false;

    state.roulette = { selectedItemId: itemId, elapsed: 0 };
    state.useFeedback = null;
    return true;
  }

  public advance(dt: number, paused = false): void {
    if (paused || dt <= 0) return;

    for (const state of this.racers.values()) {
      if (state.roulette !== null) {
        state.roulette.elapsed = Math.min(ITEM_ROULETTE_SECONDS, state.roulette.elapsed + dt);
        if (state.roulette.elapsed >= ITEM_ROULETTE_SECONDS) state.roulette = null;
      }

      if (state.useFeedback !== null) {
        state.useFeedback.remaining -= dt;
        if (state.useFeedback.remaining <= 0) state.useFeedback = null;
      }
    }
  }

  public requestUse(racerId: string, direction: ItemUseDirection): ItemUseRequest | null {
    const state = this.racers.get(racerId);
    if (state?.roulette !== null) return null;

    const held = state.inventory.snapshot();
    if (held === null) return null;

    state.useFeedback = { direction, remaining: ITEM_USE_FEEDBACK_SECONDS };
    return {
      racerId,
      itemId: held.itemId,
      direction,
      remainingCharges: held.remainingCharges,
    };
  }

  public commitUse(racerId: string): boolean {
    const state = this.racers.get(racerId);
    if (state?.roulette !== null) return false;
    return state.inventory.consumeCharge();
  }

  public heldItem(racerId: string): HeldItem | null {
    return this.racers.get(racerId)?.inventory.snapshot() ?? null;
  }

  public hudSnapshot(racerId: string): ItemHudSnapshot {
    const state = this.racers.get(racerId);
    if (state === undefined) return { ...EMPTY_HUD };

    const held = state.inventory.snapshot();
    if (held === null) return { ...EMPTY_HUD };

    if (state.roulette !== null) {
      const selectedIndex = ITEM_IDS.indexOf(state.roulette.selectedItemId);
      const step = Math.floor(state.roulette.elapsed / ITEM_ROULETTE_STEP_SECONDS);
      const previewIndex = (selectedIndex + step + 1) % ITEM_IDS.length;
      const previewItemId = ITEM_IDS[previewIndex] ?? state.roulette.selectedItemId;
      const definition = ITEM_DEFINITIONS[previewItemId];
      return {
        phase: 'roulette',
        itemId: previewItemId,
        displayName: definition.displayName,
        icon: definition.icon,
        remainingCharges: 0,
        totalCharges: 0,
        rouletteProgress: Math.min(1, state.roulette.elapsed / ITEM_ROULETTE_SECONDS),
        useFeedback: null,
      };
    }

    const definition = ITEM_DEFINITIONS[held.itemId];
    return {
      phase: 'held',
      itemId: held.itemId,
      displayName: definition.displayName,
      icon: definition.icon,
      remainingCharges: held.remainingCharges,
      totalCharges: definition.charges,
      rouletteProgress: 1,
      useFeedback: state.useFeedback?.direction ?? null,
    };
  }

  public clear(racerId: string): void {
    const state = this.racers.get(racerId);
    if (state === undefined) return;
    state.inventory.clear();
    state.roulette = null;
    state.useFeedback = null;
  }

  public dispose(): void {
    this.racers.clear();
  }

  private stateFor(racerId: string): RacerItemState {
    const existing = this.racers.get(racerId);
    if (existing !== undefined) return existing;

    const state: RacerItemState = {
      inventory: new ItemInventory(),
      roulette: null,
      useFeedback: null,
    };
    this.racers.set(racerId, state);
    return state;
  }
}
