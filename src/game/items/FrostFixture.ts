import * as THREE from 'three';
import { CircuitAlpha } from '../track/CircuitAlpha';
import { FROST, FROST_ORB_CONFIG } from './FrostOrbs';
import { ProjectileSystem, type ProjectileTarget } from './ProjectileSystem';
import { disposeFrostGroup, frostCrystal } from './FrostVisual';

export type FrostTest = 'hit' | 'refresh' | 'shockwave' | 'protected' | 'expired';
export interface FrostEvidence {
  velocity: THREE.Vector3;
  stacks: number;
  remaining: number;
  steering: number;
  spun: boolean;
}
export function frostTestFromSearch(search: string): FrostTest | null {
  const p = new URLSearchParams(search);
  const test = p.get('testFrost');
  const item = p.get('testItem');
  if ((test === 'hit' || test === 'refresh') && item === 'frost-orbs') return test;
  if (test === 'shockwave' && item === 'shockwave') return test;
  const phase = p.get('testFrostPhase');
  if (
    test === 'prismatic' &&
    item === 'prismatic-invincibility' &&
    (phase === 'protected' || phase === 'expired')
  )
    return phase;
  return null;
}

export interface FrostFixtureContext {
  track: CircuitAlpha;
  projectiles: ProjectileSystem;
  player: ProjectileTarget;
  held: string | null;
  protection: number;
  placeRival: (position: THREE.Vector3, forward: THREE.Vector3, speed: number) => string | null;
  startPlayer: (velocity: THREE.Vector3) => void;
}

/** Explicit test mode only. Setup precedes measurement; no lap/checkpoint edits. */
export class FrostFixture {
  public readonly group = new THREE.Group();
  private rival: string | null = null;
  private objectId: number | null = null;
  private armed = false;
  private activated = false;
  private elapsed = 0;
  private hits = 0;
  private readySeconds = 0;
  private readyForProtection = false;
  private protectedBefore: FrostEvidence | null = null;
  private counterCandidate = false;
  private contacted = false;
  private result: string | null = null;
  private message = 'Collect fixed item; stop near road center on a clear straight';
  public constructor(public readonly test: FrostTest | null) {
    this.group.visible = false;
    if (test) {
      const marker = frostCrystal(0.4);
      marker.position.y = 2.5;
      this.group.add(marker);
    }
  }
  public controlledRacer(): string | null {
    return this.result ? null : this.rival;
  }
  public activationAllowed(position: THREE.Vector3, projectiles: ProjectileSystem): boolean {
    if (!this.test || this.result) return true;
    if (this.test === 'protected' || this.test === 'expired') return this.readyForProtection;
    if (!this.armed) return false;
    if (this.test !== 'shockwave') return true;
    const orb = projectiles.snapshots().find((p) => p.id === this.objectId);
    return !!orb && orb.position.clone().sub(position).setY(0).length() <= 5;
  }
  public cancel(): void {
    if (this.test && !this.result) this.result = 'INCONCLUSIVE · recovery; restart';
    this.group.visible = false;
  }
  public badge(): string | null {
    return this.test
      ? `FROST ${this.test.toUpperCase()} · ${this.result ?? this.message} · Restart to retry`
      : null;
  }
  public update(dt: number, c: FrostFixtureContext): void {
    if (!this.test || this.result || dt <= 0) return;
    this.readyForProtection = false;
    if (c.player.finished) {
      this.result = 'INCONCLUSIVE · racer finished';
      return;
    }
    if (this.armed) {
      this.elapsed += dt;
      if (this.elapsed > 5) this.result = 'INCONCLUSIVE · no verified encounter';
      const orb = c.projectiles.snapshots().find((p) => p.id === this.objectId);
      if (this.test === 'shockwave' && orb) {
        const distance = orb.position.clone().sub(c.player.position).setY(0).length();
        this.message = `${distance.toFixed(1)}m · ${distance <= 5 ? 'PULSE NOW' : 'incoming; wait for 5m'}`;
        this.group.position.copy(orb.position);
        this.group.visible = true;
      }
      return;
    }
    const required =
      this.test === 'shockwave'
        ? 'shockwave'
        : this.test === 'hit' || this.test === 'refresh'
          ? 'frost-orbs'
          : 'prismatic-invincibility';
    if (c.protection > 0) this.activated = true;
    if (c.held !== required && !this.activated) return;
    const projection = c.track.project(c.player.position);
    const speed = c.player.velocity?.clone().setY(0).length() ?? 0;
    if (projection.surface !== 'asphalt' || Math.abs(projection.lateralOffset) > 2 || speed >= 1) {
      this.readySeconds = 0;
      this.message = 'Stop below 1m/s within 2m of road center on asphalt';
      return;
    }
    const forward = projection.tangent.clone().setY(0).normalize();
    if (c.player.forward.dot(forward) < 0.98) {
      this.readySeconds = 0;
      this.message = 'Face along the road';
      return;
    }
    for (let d = 5; d <= 45; d += 5) {
      const projected = c.track.project(c.player.position.clone().addScaledVector(forward, d));
      if (Math.abs(projected.lateralOffset) > 2 || projected.surface !== 'asphalt') {
        this.readySeconds = 0;
        this.message = 'Find a longer clear asphalt straight';
        return;
      }
    }
    this.readyForProtection = true;
    if (this.test === 'protected' && c.protection <= 0) {
      this.message = 'READY · activate Prismatic while stopped';
      return;
    }
    if (this.test === 'expired' && (!this.activated || c.protection > 0)) {
      this.message = this.activated
        ? 'Wait stopped for protection expiry'
        : 'READY · activate Prismatic';
      return;
    }
    if (this.test === 'hit' || this.test === 'refresh' || this.test === 'shockwave') {
      this.readySeconds += dt;
      if (this.readySeconds < 3) {
        this.message = `READY · stay stopped · encounter in ${(3 - this.readySeconds).toFixed(1)}s`;
        return;
      }
    }
    if (this.test === 'hit' || this.test === 'refresh') {
      this.rival = c.placeRival(c.player.position.clone().addScaledVector(forward, 12), forward, 8);
      if (!this.rival) return;
      c.startPlayer(forward.clone().multiplyScalar(10));
      this.message =
        this.test === 'refresh'
          ? 'Moving marked rival · fire twice, 0.55s apart'
          : 'Moving marked rival · fire now';
    } else {
      const origin = c.player.position
        .clone()
        .addScaledVector(forward, this.test === 'shockwave' ? 16 : 12);
      this.objectId = c.projectiles.spawn({
        itemId: 'frost-orbs',
        ownerId: 'frost-fixture',
        direction: 'forward',
        config: FROST_ORB_CONFIG,
        launch: {
          position: origin,
          forward: forward.clone().negate(),
          velocity: new THREE.Vector3(),
        },
      });
      if (this.objectId === null) return;
      if (this.test !== 'shockwave') c.startPlayer(forward.clone().multiplyScalar(10));
      this.message =
        this.test === 'shockwave' ? 'Incoming Frost · pulse at 5m' : 'Moving protection encounter';
    }
    this.armed = true;
  }
  public observeContact(
    id: number | undefined,
    target: string,
    blocked: boolean,
    speed: number,
    evidence?: FrostEvidence,
  ): void {
    if (!this.armed || this.result || id !== this.objectId) return;
    this.contacted = true;
    if (target !== 'player') {
      this.result = 'INCONCLUSIVE · intercepted';
      return;
    }
    if (this.test === 'protected') {
      if (!blocked) this.result = 'FAIL · protected contact';
      else if (speed <= 1 || !evidence) this.result = 'INCONCLUSIVE · no moving-state evidence';
      else this.protectedBefore = evidence;
    }
    if (this.test === 'shockwave') this.result = 'INCONCLUSIVE · missed counter window';
    if (this.test === 'expired' && blocked) this.result = 'FAIL · expired contact absorbed';
  }
  public observeApplied(
    target: string,
    before: THREE.Vector3,
    after: THREE.Vector3,
    stacks: number,
    remaining: number,
    spun: boolean,
    objectId?: number,
    steering = 1,
  ): void {
    if (!this.armed || this.result || target !== (this.rival ?? 'player')) return;
    if (this.objectId !== null && objectId !== this.objectId) return;
    const beforeSpeed = before.clone().setY(0).length();
    if (beforeSpeed <= 1) {
      this.result = 'INCONCLUSIVE · target too slow';
      return;
    }
    this.hits++;
    if (this.test === 'refresh' && this.hits > 1 && stacks === 1) {
      this.result = 'INCONCLUSIVE · second hit after expiry';
      return;
    }
    const valid =
      Math.abs(after.x - before.x * FROST.retention) < 1e-5 &&
      Math.abs(after.z - before.z * FROST.retention) < 1e-5 &&
      Math.abs(after.y - before.y) < 1e-5 &&
      stacks === this.hits &&
      remaining === FROST.duration &&
      Math.abs(steering - FROST.steering ** stacks) < 1e-8 &&
      !spun;
    const detail = `${beforeSpeed.toFixed(1)}→${after.clone().setY(0).length().toFixed(1)}m/s · ×${String(stacks)} · 1.2s · steer ${steering.toFixed(2)}`;
    if (!valid) this.result = 'FAIL · ' + detail;
    else if (this.test !== 'refresh' || this.hits >= 2) this.result = 'PASS · ' + detail;
    else this.message = detail + ' · fire again before expiry';
  }
  public observePulse(center: THREE.Vector3, projectiles: ProjectileSystem): void {
    const orb = projectiles.snapshots().find((p) => p.id === this.objectId);
    if (this.test === 'shockwave' && orb && orb.position.clone().sub(center).setY(0).length() <= 5)
      this.counterCandidate = true;
  }
  public afterProjectiles(projectiles: ProjectileSystem, evidence?: FrostEvidence): void {
    if (this.protectedBefore && evidence && !this.result) {
      const before = this.protectedBefore;
      const valid =
        before.velocity.distanceTo(evidence.velocity) < 1e-5 &&
        before.stacks === evidence.stacks &&
        before.remaining === evidence.remaining &&
        before.steering === evidence.steering &&
        !evidence.spun &&
        !projectiles.snapshots().some((p) => p.id === this.objectId);
      this.result = valid
        ? 'PASS · moving contact absorbed; velocity/handling unchanged'
        : 'FAIL · protected state changed';
    }
    if (
      this.counterCandidate &&
      !this.contacted &&
      !projectiles.snapshots().some((p) => p.id === this.objectId)
    )
      this.result = 'PASS · cleared inside 5m before contact';
  }
  public updateMarker(targets: readonly ProjectileTarget[]): void {
    const rival = targets.find((t) => t.id === this.rival);
    if (rival) {
      this.group.position.copy(rival.position);
      this.group.visible = true;
    }
  }
  public dispose(): void {
    disposeFrostGroup(this.group);
    this.group.visible = false;
  }
}
