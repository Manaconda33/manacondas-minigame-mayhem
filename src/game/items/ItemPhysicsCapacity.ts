export const MAX_ITEM_PHYSICS_OBJECTS = 40;

/** Race-owned budget for live projectiles, hazards and non-colliding reservations. */
export class ItemPhysicsCapacity {
  private nextId = 1;
  private readonly slots = new Set<number>();

  public acquire(): number | null {
    if (this.slots.size >= MAX_ITEM_PHYSICS_OBJECTS) return null;
    const id = this.nextId++;
    this.slots.add(id);
    return id;
  }

  public release(id: number): void {
    this.slots.delete(id);
  }
  public count(): number {
    return this.slots.size;
  }
}
