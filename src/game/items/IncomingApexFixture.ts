import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { RacerProgress } from '../race/RaceDirector';
import type { ApexMissileSystem, ApexTarget } from './ApexMissileSystem';
import { currentRaceLeader } from './ItemTargeting';

/** Explicit fixture uses production leader choice and global availability, never AI inventory. */
export class IncomingApexFixture {
  private nextTime = 5;
  public constructor(private readonly enabled: boolean) {}

  public update(
    elapsed: number,
    track: CircuitAlpha,
    system: ApexMissileSystem,
    racers: readonly RacerProgress[],
    targets: readonly ApexTarget[],
  ): void {
    if (!this.enabled || elapsed < this.nextTime) return;
    const leader = currentRaceLeader(racers);
    const target = targets.find((racer) => racer.id === leader?.id && !racer.finished);
    if (target === undefined || !system.available('incoming-apex-fixture', racers)) return;
    const progress =
      (track.project(target.position).progress - 45 / track.curve.getLength() + 1) % 1;
    const position = track.curve.getPointAt(progress);
    position.y += 0.72;
    if (system.launch('incoming-apex-fixture', position, racers)) this.nextTime = elapsed + 18;
  }
}
