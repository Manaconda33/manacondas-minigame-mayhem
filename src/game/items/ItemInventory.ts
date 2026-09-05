import { ITEM_DEFINITIONS, type ItemId } from './itemDefinitions';

export interface HeldItem {
  itemId: ItemId;
  remainingCharges: number;
}

export class ItemInventory {
  private heldItem: HeldItem | null = null;

  public isOccupied(): boolean {
    return this.heldItem !== null;
  }

  public acquire(itemId: ItemId): boolean {
    if (this.heldItem !== null) return false;

    this.heldItem = {
      itemId,
      remainingCharges: ITEM_DEFINITIONS[itemId].charges,
    };
    return true;
  }

  public snapshot(): HeldItem | null {
    return this.heldItem === null ? null : { ...this.heldItem };
  }

  public consumeCharge(): boolean {
    if (this.heldItem === null) return false;

    this.heldItem.remainingCharges -= 1;
    if (this.heldItem.remainingCharges <= 0) {
      this.heldItem = null;
    }
    return true;
  }

  public clear(): void {
    this.heldItem = null;
  }
}
