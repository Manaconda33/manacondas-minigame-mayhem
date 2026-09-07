import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { ProjectileSystem, SeekerResolution } from './ProjectileSystem';
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

/** Explain completed fixture threats only in the explicitly marked test mode. */
export function incomingSeekerResolutionMessage(
  enabled: boolean,
  resolutions: readonly SeekerResolution[],
  racerName: (id: string) => string,
): string | null {
  if (!enabled) return null;
  const resolution = [...resolutions]
    .reverse()
    .find((event) => event.ownerId === 'incoming-seeker-fixture' && event.targetId === 'player');
  if (resolution === undefined) return null;
  switch (resolution.reason) {
    case 'racer-hit':
      return resolution.hitRacerId === 'player'
        ? 'TEST SEEKER · HIT YOU'
        : `TEST SEEKER · INTERCEPTED BY ${racerName(resolution.hitRacerId ?? '').toUpperCase()}`;
    case 'guardrail':
      return 'TEST SEEKER · HIT GUARDRAIL';
    case 'expired':
      return 'TEST SEEKER · LIFETIME EXPIRED';
    case 'target-finished':
      return 'TEST SEEKER · CLEARED AT RACE FINISH';
    case 'target-lost':
      return 'TEST SEEKER · TARGET LOST';
    case 'removed':
      return 'TEST SEEKER · REMOVED';
  }
}
