import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { ProjectileSystem } from './ProjectileSystem';
import { ITEM_DEFINITIONS } from './itemDefinitions';

/** Explicit acceptance fixture; it never reads or spends any AI inventory. */
export class IncomingSeekerFixture {
  private nextTime = 5;
  public constructor(private readonly enabled: boolean) {}

  public update(
    elapsed: number,
    finished: boolean,
    position: THREE.Vector3,
    track: CircuitAlpha,
    projectiles: ProjectileSystem,
  ): void {
    if (!this.enabled || finished || elapsed < this.nextTime) return;
    this.nextTime = elapsed + 16;
    const projection = track.project(position);
    const progress = (projection.progress - 45 / track.curve.getLength() + 1) % 1;
    const config = ITEM_DEFINITIONS['seeker-drone'].projectile;
    if (config === undefined) return;
    projectiles.spawn({
      itemId: 'seeker-drone',
      ownerId: 'incoming-seeker-fixture',
      targetId: 'player',
      direction: 'forward',
      config,
      launch: {
        position: track.curve.getPointAt(progress).setY(0.72),
        forward: track.curve.getTangentAt(progress),
        velocity: new THREE.Vector3(),
      },
    });
  }
}
