import type { Vector3 } from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { HazardSystem } from './HazardSystem';

/** One marked incoming hazard per race; no inventory or AI-policy side effects. */
export class IncomingSlickFixture {
  private spawned = false;
  public constructor(private readonly enabled: boolean) {}
  public update(
    elapsed: number,
    finished: boolean,
    position: Vector3,
    track: CircuitAlpha,
    hazards: HazardSystem,
  ): void {
    if (!this.enabled || this.spawned || finished || elapsed < 5) return;
    const progress = (track.project(position).progress + 8 / track.curve.getLength()) % 1;
    this.spawned =
      hazards.placeSlick('incoming-slick-fixture', track.curve.getPointAt(progress)) !== null;
  }
}
