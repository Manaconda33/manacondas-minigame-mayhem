import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { RacerProgress } from '../race/RaceDirector';
import type { ApexMissileSystem, ApexTarget } from './ApexMissileSystem';
import { BLAZE_ORB_CONFIG } from './BlazeOrbs';
import type { HazardSystem } from './HazardSystem';
import type { ShockwaveCounterTest } from './ItemTestMode';
import { currentRaceLeader } from './ItemTargeting';
import type { ProjectileSystem } from './ProjectileSystem';
import { ITEM_DEFINITIONS } from './itemDefinitions';

/** One-shot acceptance scenarios; no fixture reads or spends AI inventory. */
export class ShockwaveCounterFixture {
  private placed = false;
  private playerShockwaveReady = false;

  public constructor(private readonly mode: ShockwaveCounterTest | null) {}

  public update(
    playerFinished: boolean,
    playerShockwaveReady: boolean,
    playerPosition: THREE.Vector3,
    track: CircuitAlpha,
    projectiles: ProjectileSystem,
    hazards: HazardSystem,
    apex: ApexMissileSystem,
    racers: readonly RacerProgress[],
    targets: readonly ApexTarget[],
  ): void {
    this.playerShockwaveReady = playerShockwaveReady;
    if (this.mode === null || this.placed || playerFinished || !playerShockwaveReady) return;
    if (this.mode === 'racer') {
      this.placed = true;
      return;
    }

    const projection = track.project(playerPosition);
    const length = track.curve.getLength();
    const inwardPosition = (): THREE.Vector3 => {
      const right = new THREE.Vector3(projection.tangent.z, 0, -projection.tangent.x).normalize();
      const inwardSign = projection.lateralOffset >= 0 ? -1 : 1;
      return playerPosition.clone().addScaledVector(right, inwardSign * 3.5);
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
          launch: launchAtOffset(-18),
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
          launch: launchAtOffset(-45),
        }) !== null;
      return;
    }

    if (this.mode === 'blaze') {
      const incoming = launchAtOffset(-12);
      incoming.forward.copy(playerPosition).sub(incoming.position).setY(0).normalize();
      this.placed =
        projectiles.spawn({
          itemId: 'blaze-orbs',
          ownerId: 'shockwave-counter-blaze-fixture',
          direction: 'forward',
          config: BLAZE_ORB_CONFIG,
          launch: incoming,
        }) !== null;
      return;
    }

    if (this.mode === 'slick') {
      this.placed =
        hazards.placeSlick('shockwave-counter-slick-fixture', inwardPosition()) !== null;
      return;
    }

    if (this.mode === 'blast') {
      this.placed =
        hazards.placeBlastOrb('shockwave-counter-blast-fixture', inwardPosition()) !== null;
      return;
    }

    const leader = currentRaceLeader(racers);
    if (leader?.id !== 'player' || targets.every((target) => target.finished)) return;
    this.placed = apex.launch(
      'shockwave-counter-apex-fixture',
      launchAtOffset(-45).position,
      racers,
    );
  }

  public badge(): string {
    if (this.mode === null) return '';
    if (!this.playerShockwaveReady) return 'SHOCKWAVE COUNTER · COLLECT THE FORCED SHOCKWAVE';
    if (this.mode === 'apex' && !this.placed)
      return 'SHOCKWAVE COUNTER · DRIVE INTO FIRST TO LAUNCH APEX';
    if (this.mode === 'racer') return 'SHOCKWAVE COUNTER · USE WITHIN 5m OF A RACER';
    if (this.mode === 'kinetic') return 'SHOCKWAVE COUNTER · INCOMING KINETIC · TIME ITEM';
    if (this.mode === 'seeker') return 'SHOCKWAVE COUNTER · INCOMING SEEKER · TIME ITEM';
    if (this.mode === 'blaze') return 'SHOCKWAVE COUNTER · INCOMING BLAZE · TIME ITEM';
    if (this.mode === 'slick') return 'SHOCKWAVE COUNTER · SLICK 3.5m INWARD · USE ITEM';
    if (this.mode === 'blast') return 'SHOCKWAVE COUNTER · BLAST 3.5m INWARD · USE ITEM';
    return 'SHOCKWAVE COUNTER · APEX INBOUND · COUNTER TERMINAL DIVE';
  }

  public reset(): void {
    this.placed = false;
    this.playerShockwaveReady = false;
  }
}
