import * as THREE from 'three';
import { guardrailContact } from '../track/GuardrailSystem';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import { ARC_HAMMER_CONFIG, ARC_HAMMER_PROJECTILE_CONFIG } from './ArcHammers';
import type { ProjectileSystem, ProjectileTarget } from './ProjectileSystem';

export type ArcHammerCounterTest = 'shockwave' | 'protected' | 'expired';

export function arcHammerCounterFromSearch(search: string): ArcHammerCounterTest | null {
  const params = new URLSearchParams(search);
  if (params.get('testArcHammerCounter') === 'shockwave' && params.get('testItem') === 'shockwave')
    return 'shockwave';
  const phase = params.get('testArcHammerPhase');
  if (
    params.get('testArcHammerCounter') === 'prismatic' &&
    params.get('testItem') === 'prismatic-invincibility' &&
    (phase === 'protected' || phase === 'expired')
  )
    return phase;
  return null;
}

export interface ArcHammerCounterEvidence {
  velocity: THREE.Vector3;
  protection: number;
  immune: boolean;
  spinId: string | null;
  spinSeconds: number;
}

/** Opt-in incoming Hammer encounters only; no inventory grants or input gates. */
export class ArcHammerCounterFixture {
  private id: number | null = null;
  private activated = false;
  private readySeconds = 0;
  private elapsed = 0;
  private pulseInRange = false;
  private contact: { blocked: boolean; before: ArcHammerCounterEvidence } | null = null;
  private result: string | null = null;
  private message = 'Collect the fixed item and keep racing';

  public constructor(public readonly test: ArcHammerCounterTest | null) {}

  public badge(): string | null {
    return this.test
      ? `HAMMERS ${this.test.toUpperCase()} · ${this.result ?? this.message}${this.result ? ' · Restart to retry' : ''}`
      : null;
  }

  public update(
    dt: number,
    c: {
      track: CircuitAlpha;
      projectiles: ProjectileSystem;
      targets: readonly ProjectileTarget[];
      held: string | null;
      protection: number;
    },
  ): void {
    if (!this.test || this.result || dt <= 0) return;
    const player = c.targets.find((target) => target.id === 'player');
    if (!player || player.finished) {
      this.cancel(c.projectiles);
      return;
    }

    if (this.id !== null) {
      this.elapsed += dt;
      const hammer = c.projectiles.snapshots().find((projectile) => projectile.id === this.id);
      if (hammer) {
        const distance = hammer.position.clone().sub(player.position).setY(0).length();
        this.message =
          this.test === 'shockwave'
            ? `${distance.toFixed(1)}m · ${distance <= 5 ? 'PULSE NOW' : 'incoming; pulse within 5m'}`
            : 'Incoming Hammer · checking actual contact';
      }
      if (this.elapsed > 4.5) this.result = 'INCONCLUSIVE · no verified encounter';
      return;
    }

    if (c.protection > 0) this.activated = true;
    if (this.test === 'shockwave' && c.held !== 'shockwave') return;
    if (this.test !== 'shockwave') {
      if (!this.activated) {
        this.message = 'Activate Prismatic while racing';
        return;
      }
      if (this.test === 'expired' && c.protection > 0) {
        this.message = 'Protection active; incoming Hammer after expiry';
        return;
      }
      if (this.test === 'protected' && c.protection <= 0) {
        this.result = 'INCONCLUSIVE · protection expired before a clear approach';
        return;
      }
    }

    this.readySeconds += dt;
    if (this.readySeconds < 0.75) {
      this.message = `Incoming Hammer in ${(0.75 - this.readySeconds).toFixed(1)}s · keep racing`;
      return;
    }

    const forward = player.forward.clone().setY(0);
    if (forward.lengthSq() < 0.99) {
      this.message = 'Waiting for a clear incoming approach; ITEM stays available';
      return;
    }
    forward.normalize();
    const predicted = player.position
      .clone()
      .addScaledVector(player.velocity ?? new THREE.Vector3(), 0.4);
    const desiredProjectilePosition = predicted.clone().addScaledVector(forward, 14);
    desiredProjectilePosition.y = Math.max(0.55, player.position.y);
    for (let index = 0; index <= 20; index += 1) {
      const point = desiredProjectilePosition.clone().lerp(predicted, index / 20);
      if (guardrailContact(c.track, point, ARC_HAMMER_CONFIG.radiusMeters) !== null) {
        this.message = 'Waiting for a clear incoming approach; ITEM stays available';
        return;
      }
    }

    const incomingForward = forward.clone().multiplyScalar(-1);
    const launchPosition = desiredProjectilePosition
      .clone()
      .addScaledVector(
        forward,
        ARC_HAMMER_CONFIG.spawnOffsetMeters + ARC_HAMMER_CONFIG.radiusMeters,
      );
    this.id = c.projectiles.spawn({
      itemId: 'arc-hammers',
      ownerId: 'arc-hammer-counter-fixture',
      direction: 'forward',
      config: ARC_HAMMER_PROJECTILE_CONFIG,
      launch: {
        position: launchPosition,
        forward: incomingForward,
        velocity: new THREE.Vector3(),
      },
    });
    this.message =
      this.id === null
        ? 'Waiting for projectile capacity; ITEM stays available'
        : 'Incoming Hammer · keep racing';
  }

  public observePulse(center: THREE.Vector3, projectiles: ProjectileSystem): void {
    if (this.test !== 'shockwave' || this.result || this.id === null) return;
    const hammer = projectiles.snapshots().find((projectile) => projectile.id === this.id);
    this.pulseInRange ||=
      !!hammer &&
      hammer.position.clone().sub(center).setY(0).length() <=
        ARC_HAMMER_CONFIG.shockwaveClearRadiusMeters;
  }

  public observeContact(
    objectId: number | undefined,
    blocked: boolean,
    before: ArcHammerCounterEvidence,
  ): void {
    if (objectId !== this.id || this.result || this.test === 'shockwave') return;
    this.contact = { blocked, before };
  }

  public afterProjectiles(projectiles: ProjectileSystem, after: ArcHammerCounterEvidence): void {
    if (this.result || this.id === null) return;
    const stillActive = projectiles.snapshots().some((projectile) => projectile.id === this.id);
    if (this.test === 'shockwave') {
      if (this.pulseInRange && !stillActive) {
        this.result = 'PASS · cleared inside 5m before movement/contact';
      } else if (!stillActive && !this.pulseInRange) {
        this.result = 'INCONCLUSIVE · Hammer ended before the counter window';
      }
      return;
    }
    if (!this.contact) {
      if (!stillActive) this.result = 'INCONCLUSIVE · no verified contact';
      return;
    }

    const { blocked, before } = this.contact;
    if (this.test === 'protected') {
      if (before.protection <= 0) this.result = 'INCONCLUSIVE · protection expired before contact';
      else
        this.result =
          blocked &&
          !stillActive &&
          before.velocity.distanceTo(after.velocity) < 1e-6 &&
          before.spinId === after.spinId &&
          before.spinSeconds === after.spinSeconds
            ? 'PASS · verified contact absorbed; velocity and spin unchanged'
            : 'FAIL · protected contact';
    } else if (before.protection > 0 || before.immune) {
      this.result = 'INCONCLUSIVE · protection still active';
    } else {
      this.result =
        !blocked &&
        after.spinId === 'arc-hammers-spinout' &&
        Math.abs(after.spinSeconds - ARC_HAMMER_CONFIG.spinoutSeconds) < 1e-8
          ? 'PASS · verified contact applied 0.85s spin after expiry'
          : 'FAIL · expired contact did not apply Hammer spin';
    }
  }

  public cancel(projectiles: ProjectileSystem): void {
    if (this.test && !this.result) this.result = 'INCONCLUSIVE · recovery or finish';
    if (this.id !== null) projectiles.remove(this.id);
    this.id = null;
  }
}
