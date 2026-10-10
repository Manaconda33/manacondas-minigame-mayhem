import type { Vector3 } from 'three';
import type { TrackDefinition } from '../track/TrackDefinition';
import type { HazardSystem } from './HazardSystem';

/** One marked incoming hazard per race; no inventory or AI-policy side effects. */
export class IncomingBlastOrbFixture {
  private spawned = false;
  public constructor(private readonly enabled: boolean) {}
  public update(
    elapsed: number,
    finished: boolean,
    position: Vector3,
    track: TrackDefinition,
    hazards: HazardSystem,
  ): void {
    if (!this.enabled || this.spawned || finished || elapsed < 5) return;
    const progress = (track.project(position).progress + 8 / track.curve.getLength()) % 1;
    this.spawned =
      hazards.placeBlastOrb('incoming-blast-fixture', track.curve.getPointAt(progress)) !== null;
  }
}
