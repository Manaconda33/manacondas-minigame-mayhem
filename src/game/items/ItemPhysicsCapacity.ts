export const MAX_ACTIVE_ITEM_PHYSICS_OBJECTS = 40;

/** Shared Slice 5 budget for active/reserved projectile and hazard physics objects. */
export class ItemPhysicsCapacity {
  private readonly reservations = new Set<number>();
  private nextReservationId = 1;

  public constructor(private readonly maximum = MAX_ACTIVE_ITEM_PHYSICS_OBJECTS) {
    if (!Number.isInteger(maximum) || maximum <= 0) {
      throw new Error('Item physics capacity must be a positive integer');
    }
  }

  public reserve(): number | null {
    if (this.reservations.size >= this.maximum) return null;
    const reservationId = this.nextReservationId;
    this.nextReservationId += 1;
    this.reservations.add(reservationId);
    return reservationId;
  }

  public release(reservationId: number): boolean {
    return this.reservations.delete(reservationId);
  }

  public activeCount(): number {
    return this.reservations.size;
  }

  public maximumCount(): number {
    return this.maximum;
  }
}
