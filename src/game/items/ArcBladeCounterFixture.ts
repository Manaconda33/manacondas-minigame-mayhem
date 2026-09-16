import { Vector3 } from 'three';
import { guardrailContact } from '../track/GuardrailSystem';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import { ARC_BLADE_CONFIG, arcCoordinates, type ArcEvent } from './ArcBlade';
import type { ProjectileSystem, ProjectileTarget } from './ProjectileSystem';

export type ArcCounterTest = 'shockwave' | 'protected' | 'expired';
export function arcCounterFromSearch(search: string): ArcCounterTest | null {
  const p = new URLSearchParams(search);
  if (p.get('testArcBladeCounter') === 'shockwave' && p.get('testItem') === 'shockwave')
    return 'shockwave';
  const phase = p.get('testArcBladePhase');
  if (
    p.get('testArcBladeCounter') === 'prismatic' &&
    p.get('testItem') === 'prismatic-invincibility' &&
    (phase === 'protected' || phase === 'expired')
  )
    return phase;
  return null;
}
export interface ArcCounterEvidence {
  velocity: Vector3;
  protection: number;
  immune: boolean;
  spinId: string | null;
  spinSeconds: number;
}

/** Opt-in incoming attacks only. No racer repositioning, inventory grants or input gate. */
export class ArcBladeCounterFixture {
  private id: number | null = null;
  private activated = false;
  private readySeconds = 0;
  private elapsed = 0;
  private pulseInRange = false;
  private contact: { blocked: boolean; before: ArcCounterEvidence } | null = null;
  private result: string | null = null;
  private message = 'Collect the fixed item and keep racing';
  public constructor(public readonly test: ArcCounterTest | null) {}

  public badge(): string | null {
    return this.test
      ? `ARC ${this.test.toUpperCase()} · ${this.result ?? this.message}${this.result ? ' · Restart to retry' : ''}`
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
    const player = c.targets.find((r) => r.id === 'player');
    if (!player || player.finished) {
      this.cancel(c.projectiles);
      return;
    }
    if (this.id !== null) {
      this.elapsed += dt;
      const blade = c.projectiles.snapshots().find((p) => p.id === this.id);
      if (blade) {
        const distance = blade.position.clone().sub(player.position).setY(0).length();
        this.message =
          this.test === 'shockwave'
            ? `${distance.toFixed(1)}m · ${distance <= 5 ? 'PULSE NOW' : 'incoming; pulse within 5m'}`
            : 'Incoming Arc · checking actual contact';
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
        this.message = 'Protection active; incoming Arc after expiry';
        return;
      }
      if (this.test === 'protected' && c.protection <= 0) {
        this.result = 'INCONCLUSIVE · protection expired before a clear approach';
        return;
      }
    }
    this.readySeconds += dt;
    if (this.readySeconds < 0.75) {
      this.message = `Incoming Arc in ${(0.75 - this.readySeconds).toFixed(1)}s · keep racing`;
      return;
    }
    const owner = c.targets.find((r) => r.id !== 'player' && !r.finished);
    if (!owner) {
      this.result = 'INCONCLUSIVE · no unfinished rival';
      return;
    }
    const forward = player.forward.clone().setY(0).normalize();
    const right = new Vector3(forward.z, 0, -forward.x);
    const aimTime = 0.5;
    const coordinates = arcCoordinates(42 * aimTime);
    const predicted = player.position
      .clone()
      .addScaledVector(player.velocity ?? new Vector3(), aimTime);
    const spawn = predicted
      .addScaledVector(forward, -coordinates.forward)
      .addScaledVector(right, -coordinates.right)
      .setY(Math.max(0.55, player.position.y));
    if (forward.lengthSq() < 0.99 || spawn.clone().sub(player.position).setY(0).length() < 3) {
      this.message = 'Waiting for a clear incoming approach; ITEM stays available';
      return;
    }
    for (let i = 0; i <= 20; i++) {
      const point = arcCoordinates((42 * aimTime * i) / 20);
      if (
        guardrailContact(
          c.track,
          spawn.clone().addScaledVector(forward, point.forward).addScaledVector(right, point.right),
          ARC_BLADE_CONFIG.radiusMeters,
        )
      ) {
        this.message = 'Waiting for a clear incoming approach; ITEM stays available';
        return;
      }
    }
    this.id = c.projectiles.spawn({
      itemId: 'arc-blade',
      ownerId: owner.id,
      direction: 'forward',
      config: ARC_BLADE_CONFIG,
      launch: {
        position: spawn.clone().addScaledVector(forward, -(1.75 + ARC_BLADE_CONFIG.radiusMeters)),
        forward,
        velocity: new Vector3(),
      },
    });
    this.message =
      this.id === null
        ? 'Waiting for projectile capacity; ITEM stays available'
        : 'Incoming Arc · keep racing';
  }

  public observePulse(center: Vector3, projectiles: ProjectileSystem): void {
    if (this.test !== 'shockwave' || this.result) return;
    const blade = projectiles.snapshots().find((p) => p.id === this.id);
    this.pulseInRange ||= !!blade && blade.position.clone().sub(center).setY(0).length() <= 5;
  }

  public observe(event: ArcEvent, before: ArcCounterEvidence): void {
    if (event.id !== this.id || this.result) return;
    if (event.kind === 'hit' || event.kind === 'absorbed') {
      if (event.targetId !== 'player') {
        this.result = 'INCONCLUSIVE · rival intercepted the blade';
        return;
      }
      if (this.test === 'shockwave') {
        this.result = 'INCONCLUSIVE · missed counter window';
        return;
      }
      this.contact = { blocked: event.kind === 'absorbed', before };
    } else if (event.kind === 'cleared') {
      this.result =
        this.test === 'shockwave' && this.pulseInRange
          ? 'PASS · cleared inside 5m before movement/contact'
          : 'INCONCLUSIVE · another pulse cleared the blade';
    } else if (['catch', 'wall', 'expired', 'cancelled'].includes(event.kind) && !this.contact) {
      this.result = `INCONCLUSIVE · ${event.kind}; no verified contact`;
    }
  }

  public afterProjectiles(projectiles: ProjectileSystem, after: ArcCounterEvidence): void {
    if (!this.contact || this.result) return;
    const { blocked, before } = this.contact;
    if (this.test === 'protected') {
      if (before.protection <= 0) this.result = 'INCONCLUSIVE · protection expired before contact';
      else
        this.result =
          blocked &&
          !projectiles.snapshots().some((p) => p.id === this.id) &&
          before.velocity.distanceTo(after.velocity) < 1e-6 &&
          before.spinId === after.spinId &&
          before.spinSeconds === after.spinSeconds
            ? 'PASS · verified contact absorbed; velocity and spin unchanged'
            : 'FAIL · protected contact';
    } else if (this.test === 'expired') {
      if (before.protection > 0 || before.immune)
        this.result = 'INCONCLUSIVE · protection still active';
      else
        this.result =
          !blocked &&
          after.spinId === 'arc-blade-spinout' &&
          Math.abs(after.spinSeconds - 0.85) < 1e-8
            ? 'PASS · verified contact applied 0.85s spin after expiry'
            : 'FAIL · expired contact did not apply Arc spin';
    }
  }

  public cancel(projectiles: ProjectileSystem): void {
    if (this.test && !this.result) this.result = 'INCONCLUSIVE · recovery or finish';
    if (this.id !== null) projectiles.remove(this.id);
    this.id = null;
  }
}
