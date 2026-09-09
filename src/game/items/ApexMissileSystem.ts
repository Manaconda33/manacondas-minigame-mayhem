import * as THREE from 'three';
import type { RacerProgress } from '../race/RaceDirector';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import type { ProjectileImpact, ProjectileTarget, ProjectileSystem } from './ProjectileSystem';
import { MAX_ACTIVE_PROJECTILES } from './ProjectileSystem';
import { APEX_CONFIG as C } from './itemDefinitions';
import { currentRaceLeader, validTargetingProgress } from './ItemTargeting';
import { areaEffectVictims, finitePosition } from './AreaEffects';

export type ApexPhase = 'rise' | 'sky' | 'warning' | 'dive';
export type ApexWarning = 'locked' | 'diving';
export interface ApexTarget extends ProjectileTarget {
  readonly itemImmune?: boolean;
}
export interface ApexSnapshot {
  readonly id: number;
  readonly ownerId: string;
  readonly phase: ApexPhase;
  readonly targetId: string | null;
  readonly position: THREE.Vector3;
  readonly age: number;
  readonly phaseAge: number;
}
interface ActiveApex {
  id: number;
  ownerId: string;
  phase: ApexPhase;
  targetId: string | null;
  position: THREE.Vector3;
  age: number;
  phaseAge: number;
  riseStartY: number;
  diveStartY: number;
}

/** A race-owned clock and single Apex slot; never writes racer progress. */
export class ApexMissileSystem {
  private elapsed = 0;
  private lastLaunch = -Infinity;
  private active: ActiveApex | null = null;
  private readonly pendingPulses: THREE.Vector3[] = [];
  private blasts: THREE.Vector3[] = [];

  public constructor(
    private readonly track: CircuitAlpha,
    private readonly projectiles: ProjectileSystem,
  ) {}

  public available(ownerId: string, racers: readonly RacerProgress[]): boolean {
    const owner = racers.find((racer) => racer.id === ownerId);
    return (
      ownerId.trim().length > 0 &&
      (owner === undefined || validTargetingProgress(owner)) &&
      this.active === null &&
      this.cooldownRemaining() <= 1e-9 &&
      this.projectiles.activeCount() < MAX_ACTIVE_PROJECTILES &&
      racers.some((racer) => racer.id !== ownerId && validTargetingProgress(racer))
    );
  }

  public cooldownRemaining(): number {
    return Math.max(0, C.cooldownSeconds - (this.elapsed - this.lastLaunch));
  }

  /** Spawn and consume as one synchronous transaction. Failed commit leaves no cooldown. */
  public launch(
    ownerId: string,
    position: THREE.Vector3,
    racers: readonly RacerProgress[],
    commitCharge: () => boolean = () => true,
  ): boolean {
    if (!this.available(ownerId, racers) || !finitePosition(position)) return false;
    const id = this.projectiles.reserveSlot();
    if (id === null) return false;
    this.active = {
      id,
      ownerId,
      phase: 'rise',
      targetId: null,
      position: position.clone(),
      age: 0,
      phaseAge: 0,
      riseStartY: position.y,
      diveStartY: 0,
    };
    let committed = false;
    try {
      committed = commitCharge();
      if (committed) this.lastLaunch = this.elapsed;
      return committed;
    } finally {
      if (!committed) this.cancel();
    }
  }

  /** Future Shockwave dispatch calls this before update; queries run before movement/blast. */
  public queueCounterPulse(center: THREE.Vector3): void {
    if (finitePosition(center) && this.pendingPulses.length < MAX_ACTIVE_PROJECTILES)
      this.pendingPulses.push(center.clone());
  }

  public update(
    dt: number,
    racers: readonly RacerProgress[],
    targets: readonly ApexTarget[],
  ): ProjectileImpact[] {
    if (!Number.isFinite(dt) || dt <= 0) return [];
    this.elapsed += dt;
    const missile = this.active;
    if (
      missile?.phase === 'dive' &&
      this.pendingPulses.some(
        (center) => center.distanceToSquared(missile.position) <= C.counterRadius ** 2,
      )
    )
      this.cancel();
    this.pendingPulses.length = 0;
    let remaining = Math.min(dt, C.lifetimeSeconds);
    while (remaining > 1e-9) {
      const shot = this.active;
      if (shot === null) break;
      const leader =
        shot.targetId === null
          ? currentRaceLeader(racers)
          : racers.find((racer) => racer.id === shot.targetId && validTargetingProgress(racer));
      const target = targets.find(
        (racer) => racer.id === leader?.id && !racer.finished && finitePosition(racer.position),
      );
      if (target === undefined) {
        this.cancel();
        break;
      }
      const duration =
        shot.phase === 'rise'
          ? C.riseSeconds
          : shot.phase === 'sky'
            ? C.skyTimeoutSeconds
            : shot.phase === 'warning'
              ? C.overheadSeconds
              : C.diveSeconds;
      const step = Math.min(
        remaining,
        1 / 60,
        duration - shot.phaseAge,
        C.lifetimeSeconds - shot.age,
      );
      remaining -= step;
      shot.age += step;
      shot.phaseAge += step;

      if (shot.phase === 'rise') {
        const top = this.groundHeight(shot.position) + C.skyHeight;
        shot.position.y = THREE.MathUtils.lerp(shot.riseStartY, top, shot.phaseAge / C.riseSeconds);
      } else if (shot.phase === 'sky') {
        const destination = target.position.clone();
        destination.y = this.groundHeight(destination) + C.skyHeight;
        moveToward(shot.position, destination, C.skySpeed * step);
        if (shot.position.distanceTo(destination) <= C.arrivalRadius) {
          shot.targetId = target.id;
          shot.phase = 'warning';
          shot.phaseAge = 0;
          continue;
        }
      } else {
        const destination = target.position.clone().setY(shot.position.y);
        moveToward(
          shot.position,
          destination,
          (shot.phase === 'dive' ? C.diveSpeed : C.skySpeed) * step,
        );
        const ground = this.groundHeight(shot.position);
        if (shot.phase === 'warning') {
          // Track height continuously without a vertical snap at terminal lock.
          shot.position.y += THREE.MathUtils.clamp(
            ground + C.skyHeight - shot.position.y,
            -C.skySpeed * step,
            C.skySpeed * step,
          );
        } else {
          shot.position.y = THREE.MathUtils.lerp(
            shot.diveStartY,
            ground,
            shot.phaseAge / C.diveSeconds,
          );
        }
      }
      if (shot.age >= C.lifetimeSeconds - 1e-9) {
        this.cancel();
        break;
      }
      if (shot.phaseAge < duration - 1e-9) continue;
      if (shot.phase === 'rise') {
        shot.phase = 'sky';
        shot.phaseAge = 0;
      } else if (shot.phase === 'sky') this.cancel();
      else if (shot.phase === 'warning') {
        shot.phase = 'dive';
        shot.phaseAge = 0;
        shot.diveStartY = shot.position.y;
      } else {
        const victims = areaEffectVictims(shot.position, C.blastRadius, targets, 'apex-missile');
        this.blasts = [shot.position.clone()];
        const impacts: ProjectileImpact[] = victims.map((racer) => ({
          projectileId: shot.id,
          itemId: 'apex-missile',
          targetId: racer.id,
          spinDirection: shot.id % 2 === 0 ? 1 : -1,
          spinoutSeconds: C.spinoutSeconds,
        }));
        this.cancel();
        return impacts;
      }
    }
    return [];
  }

  private groundHeight(position: THREE.Vector3): number {
    return this.track.project(position).point.y;
  }

  public snapshot(): ApexSnapshot | null {
    if (this.active === null) return null;
    const { id, ownerId, phase, targetId, position, age, phaseAge } = this.active;
    return { id, ownerId, phase, targetId, position: position.clone(), age, phaseAge };
  }

  public warningFor(racerId: string): ApexWarning | null {
    if (this.active?.targetId !== racerId) return null;
    return this.active.phase === 'dive'
      ? 'diving'
      : this.active.phase === 'warning'
        ? 'locked'
        : null;
  }

  public drainBlasts(): THREE.Vector3[] {
    const blasts = this.blasts;
    this.blasts = [];
    return blasts;
  }

  public cancel(): void {
    if (this.active !== null) this.projectiles.releaseSlot(this.active.id);
    this.active = null;
  }

  public dispose(): void {
    this.cancel();
    this.elapsed = 0;
    this.lastLaunch = -Infinity;
    this.pendingPulses.length = 0;
    this.blasts = [];
  }
}

function moveToward(
  position: THREE.Vector3,
  destination: THREE.Vector3,
  maxDistance: number,
): void {
  const delta = destination.clone().sub(position);
  const distance = delta.length();
  if (distance > 0) position.addScaledVector(delta, Math.min(1, maxDistance / distance));
}
