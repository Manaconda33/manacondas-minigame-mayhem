import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { RacerProgress } from '../race/RaceDirector';
import type { ApexMissileSystem, ApexTarget } from './ApexMissileSystem';
import type { HazardSystem } from './HazardSystem';
import type { ShockwaveCounterTest } from './ItemTestMode';
import type { ProjectileSystem } from './ProjectileSystem';
import { ITEM_DEFINITIONS } from './itemDefinitions';

const FIXTURE_SECONDS = 5;

/** One-shot acceptance scenarios; no fixture reads or spends AI inventory. */
export class ShockwaveCounterFixture {
  private placed = false;

  public constructor(private readonly mode: ShockwaveCounterTest | null) {}

  public update(
    elapsed: number,
    playerFinished: boolean,
    playerPosition: THREE.Vector3,
    track: CircuitAlpha,
    projectiles: ProjectileSystem,
    hazards: HazardSystem,
    apex: ApexMissileSystem,
    racers: readonly RacerProgress[],
    targets: readonly ApexTarget[],
  ): void {
    if (this.mode === null || this.placed || playerFinished || elapsed < FIXTURE_SECONDS) return;
    if (this.mode === 'racer') {
      this.placed = true;
      return;
    }

    const projection = track.project(playerPosition);
    const length = track.curve.getLength();
    const positionAtOffset = (meters: number): THREE.Vector3 => {
      const progress = (projection.progress + meters / length + 1) % 1;
      return track.curve.getPointAt(progress);
    };
    const launchAtOffset = (meters: number) => {
      const progress = (projection.progress + meters / length + 1) % 1;
      return {
        position: track.curve.getPointAt(progress).setY(0.72),
        forward: track.curve.getTangentAt(progress),
        velocity: new THREE.Vector3(),
      };
    };

    if (this.mode === 'kinetic') {
      const config = ITEM_DEFINITIONS['kinetic-disc'].projectile;
      if (config === undefined) return;
      this.placed =
        projectiles.spawn({
          itemId: 'kinetic-disc',
          ownerId: 'shockwave-counter-kinetic-fixture',
          direction: 'forward',
          config,
          launch: launchAtOffset(-8),
        }) !== null;
      return;
    }

    if (this.mode === 'seeker') {
      const config = ITEM_DEFINITIONS['seeker-drone'].projectile;
      if (config === undefined) return;
      this.placed =
        projectiles.spawn({
          itemId: 'seeker-drone',
          ownerId: 'shockwave-counter-seeker-fixture',
          targetId: 'player',
          direction: 'forward',
          config,
          launch: launchAtOffset(-18),
        }) !== null;
      return;
    }

    if (this.mode === 'slick') {
      this.placed =
        hazards.placeSlick('shockwave-counter-slick-fixture', positionAtOffset(3.5)) !== null;
      return;
    }

    if (this.mode === 'blast') {
      this.placed =
        hazards.placeBlastOrb('shockwave-counter-blast-fixture', positionAtOffset(3.5)) !== null;
      return;
    }

    const leader = racers.find((racer) => !racer.finished);
    if (leader === undefined || targets.every((target) => target.finished)) return;
    this.placed = apex.launch(
      'shockwave-counter-apex-fixture',
      launchAtOffset(-45).position,
      racers,
    );
  }

  public badge(): string {
    if (this.mode === null) return '';
    if (this.mode === 'racer') return 'SHOCKWAVE COUNTER · USE WITHIN 5m OF A RACER';
    if (this.mode === 'kinetic') return 'SHOCKWAVE COUNTER · ONE KINETIC AFTER 5s';
    if (this.mode === 'seeker') return 'SHOCKWAVE COUNTER · ONE SEEKER AFTER 5s';
    if (this.mode === 'slick') return 'SHOCKWAVE COUNTER · ONE SLICK 3.5m AHEAD AFTER 5s';
    if (this.mode === 'blast') return 'SHOCKWAVE COUNTER · ONE BLAST 3.5m AHEAD AFTER 5s';
    return 'SHOCKWAVE COUNTER · ONE APEX AFTER 5s · DRIVE INTO FIRST';
  }

  public reset(): void {
    this.placed = false;
  }
}
