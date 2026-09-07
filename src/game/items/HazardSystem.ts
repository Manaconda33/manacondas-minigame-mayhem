import * as THREE from 'three';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import { guardrailContact } from '../track/GuardrailSystem';
import { areaEffectVictims, finitePosition } from './AreaEffects';
import type { ItemUseDirection } from './ItemSystem';
import { ItemPhysicsCapacity, MAX_ACTIVE_ITEM_PHYSICS_OBJECTS } from './ItemPhysicsCapacity';
import type { ItemHazardConfig, ItemId } from './itemDefinitions';

export interface HazardLaunchContext {
  readonly position: THREE.Vector3;
  readonly forward: THREE.Vector3;
  readonly velocity: THREE.Vector3;
}

export interface HazardSpawnRequest {
  readonly itemId: ItemId;
  readonly ownerId: string;
  readonly direction: ItemUseDirection;
  readonly config: Readonly<ItemHazardConfig>;
  readonly launch: HazardLaunchContext;
}

export interface HazardTarget {
  readonly id: string;
  readonly position: THREE.Vector3;
  readonly velocity?: THREE.Vector3;
  readonly finished: boolean;
  readonly itemImmune?: boolean;
}

export interface HazardImpact {
  readonly hazardId: number;
  readonly itemId: ItemId;
  readonly targetId: string;
  readonly spinDirection: -1 | 1;
  readonly spinoutSeconds: number;
}

export interface HazardSnapshot {
  readonly id: number;
  readonly ownerId: string;
  readonly itemId: ItemId;
  readonly position: THREE.Vector3;
  readonly velocity: THREE.Vector3;
  readonly fuseRemainingSeconds: number;
  readonly ownerImmunitySeconds: number;
}

interface ActiveHazard {
  readonly id: number;
  readonly capacityReservationId: number;
  readonly itemId: ItemId;
  readonly ownerId: string;
  readonly config: Readonly<ItemHazardConfig>;
  readonly group: THREE.Group;
  readonly core: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  velocity: THREE.Vector3;
  fuseRemainingSeconds: number;
  ownerImmunitySeconds: number;
}

interface ClearQuery {
  readonly center: THREE.Vector3;
  readonly radius: number;
}

interface BlastVisual {
  readonly group: THREE.Group;
  readonly ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  remainingSeconds: number;
}

const RACER_HIT_RADIUS_METERS = 1.05;
const HAZARD_SUBSTEP_METERS = 0.3;
const MAX_HAZARD_SUBSTEPS = 24;
const BLAST_VISUAL_SECONDS = 0.28;
const EPSILON = 1e-9;

function finiteVector(vector: THREE.Vector3): boolean {
  return [vector.x, vector.y, vector.z].every(Number.isFinite);
}

function validConfig(config: Readonly<ItemHazardConfig>): boolean {
  return (
    Number.isFinite(config.radiusMeters) &&
    config.radiusMeters > 0 &&
    Number.isFinite(config.fuseSeconds) &&
    config.fuseSeconds > 0 &&
    Number.isFinite(config.blastRadiusMeters) &&
    config.blastRadiusMeters > 0 &&
    Number.isFinite(config.spinoutSeconds) &&
    config.spinoutSeconds > 0 &&
    Number.isFinite(config.ownerImmunitySeconds) &&
    config.ownerImmunitySeconds >= 0 &&
    Number.isFinite(config.directImpactMinClosingSpeedMetersPerSecond) &&
    config.directImpactMinClosingSpeedMetersPerSecond >= 0 &&
    Number.isFinite(config.spawnOffsetMeters) &&
    config.spawnOffsetMeters > 0 &&
    Number.isFinite(config.forwardSpeedMetersPerSecond) &&
    config.forwardSpeedMetersPerSecond >= 0 &&
    Number.isFinite(config.forwardInheritedVelocityFactor) &&
    config.forwardInheritedVelocityFactor >= 0 &&
    Number.isFinite(config.backwardInheritedVelocityFactor) &&
    config.backwardInheritedVelocityFactor >= 0 &&
    Number.isFinite(config.maxInheritedSpeedMetersPerSecond) &&
    config.maxInheritedSpeedMetersPerSecond >= 0 &&
    Number.isFinite(config.dragMetersPerSecondSquared) &&
    config.dragMetersPerSecondSquared >= 0
  );
}

function squaredHorizontalDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

export function planarClosingSpeed(
  hazardPosition: THREE.Vector3,
  hazardVelocity: THREE.Vector3,
  targetPosition: THREE.Vector3,
  targetVelocity: THREE.Vector3,
): number {
  const separation = targetPosition.clone().sub(hazardPosition).setY(0);
  const relativeVelocity = targetVelocity.clone().sub(hazardVelocity).setY(0);
  if (separation.lengthSq() < 1e-8) return relativeVelocity.length();
  return Math.max(0, -relativeVelocity.dot(separation.normalize()));
}

/** PRD amendment 2.8 / ADR-069 hazard lifecycle owner. */
export class HazardSystem {
  public readonly group = new THREE.Group();
  private readonly active = new Map<number, ActiveHazard>();
  private readonly pendingClears: ClearQuery[] = [];
  private readonly blastVisuals: BlastVisual[] = [];
  private nextId = 1;

  public constructor(
    private readonly track: CircuitAlpha,
    private readonly capacity = new ItemPhysicsCapacity(),
  ) {
    this.group.name = 'hazard-runtime';
  }

  public spawn(request: HazardSpawnRequest): number | null {
    if (
      request.itemId !== 'blast-orb' ||
      request.ownerId.trim().length === 0 ||
      !validConfig(request.config) ||
      !finiteVector(request.launch.position) ||
      !finiteVector(request.launch.forward) ||
      !finiteVector(request.launch.velocity)
    ) {
      return null;
    }

    const forward = request.launch.forward.clone().setY(0);
    if (forward.lengthSq() < 0.0001) return null;
    forward.normalize();

    const inherited = request.launch.velocity.clone().setY(0);
    const inheritedSpeed = inherited.length();
    if (inheritedSpeed > request.config.maxInheritedSpeedMetersPerSecond && inheritedSpeed > 0) {
      inherited.multiplyScalar(request.config.maxInheritedSpeedMetersPerSecond / inheritedSpeed);
    }

    const spawnSign = request.direction === 'backward' ? -1 : 1;
    const position = request.launch.position
      .clone()
      .addScaledVector(forward, request.config.spawnOffsetMeters * spawnSign);
    const velocity = inherited.multiplyScalar(
      request.direction === 'backward'
        ? request.config.backwardInheritedVelocityFactor
        : request.config.forwardInheritedVelocityFactor,
    );
    if (request.direction === 'forward') {
      velocity.addScaledVector(forward, request.config.forwardSpeedMetersPerSecond);
    }

    return this.createHazard(
      request.itemId,
      request.ownerId,
      request.config,
      position,
      velocity,
      request.config.ownerImmunitySeconds,
      false,
    );
  }

  /** Test-only real hazard spawn; armed immediately and independent of racer inventory. */
  public spawnFixture(
    ownerId: string,
    position: THREE.Vector3,
    config: Readonly<ItemHazardConfig>,
    velocity = new THREE.Vector3(),
  ): number | null {
    if (
      ownerId.trim().length === 0 ||
      !validConfig(config) ||
      !finitePosition(position) ||
      !finiteVector(velocity)
    ) {
      return null;
    }
    return this.createHazard('blast-orb', ownerId, config, position, velocity, 0, true);
  }

  private createHazard(
    itemId: ItemId,
    ownerId: string,
    config: Readonly<ItemHazardConfig>,
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    ownerImmunitySeconds: number,
    fixture: boolean,
  ): number | null {
    const capacityReservationId = this.capacity.reserve();
    if (capacityReservationId === null) return null;

    const grounded = position.clone();
    grounded.y = this.track.project(grounded).point.y + config.radiusMeters;
    const group = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(config.radiusMeters, 2),
      new THREE.MeshBasicMaterial({
        color: fixture ? 0xffb347 : 0xff5d8f,
        transparent: true,
        opacity: 0.95,
      }),
    );
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(config.radiusMeters * 1.3, config.radiusMeters * 0.12, 8, 28),
      new THREE.MeshBasicMaterial({
        color: fixture ? 0xffe19b : 0xff9fcb,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    halo.rotation.x = Math.PI / 2;
    group.add(core, halo);
    group.position.copy(grounded);
    group.name = `${fixture ? 'test-' : ''}blast-orb-${String(this.nextId)}`;

    const hazard: ActiveHazard = {
      id: this.nextId,
      capacityReservationId,
      itemId,
      ownerId,
      config,
      group,
      core,
      velocity: velocity.clone().setY(0),
      fuseRemainingSeconds: config.fuseSeconds,
      ownerImmunitySeconds,
    };
    this.active.set(hazard.id, hazard);
    this.group.add(group);
    this.nextId += 1;
    return hazard.id;
  }

  public queueClearWithinRadius(center: THREE.Vector3, radius: number): void {
    if (
      !finitePosition(center) ||
      !Number.isFinite(radius) ||
      radius < 0 ||
      this.pendingClears.length >= MAX_ACTIVE_ITEM_PHYSICS_OBJECTS
    ) {
      return;
    }
    this.pendingClears.push({ center: center.clone(), radius });
  }

  public update(dt: number, targets: readonly HazardTarget[]): HazardImpact[] {
    if (!Number.isFinite(dt) || dt <= 0) return [];
    this.updateBlastVisuals(dt);
    this.resolvePendingClears();
    const impacts: HazardImpact[] = [];

    for (const hazard of [...this.active.values()]) {
      let remaining = dt;
      while (remaining > EPSILON && this.active.has(hazard.id)) {
        if (hazard.fuseRemainingSeconds <= EPSILON) {
          impacts.push(...this.detonate(hazard, targets));
          break;
        }

        const speed = hazard.velocity.length();
        const movementStep =
          speed > EPSILON ? HAZARD_SUBSTEP_METERS / Math.max(speed, 0.001) : remaining;
        const step = Math.min(
          remaining,
          movementStep,
          hazard.fuseRemainingSeconds,
          dt / Math.max(1, Math.min(MAX_HAZARD_SUBSTEPS, Math.ceil((speed * dt) / HAZARD_SUBSTEP_METERS))),
        );
        if (step <= EPSILON) break;
        remaining -= step;
        hazard.ownerImmunitySeconds = Math.max(0, hazard.ownerImmunitySeconds - step);

        hazard.group.position.addScaledVector(hazard.velocity, step);
        this.resolveGuardrail(hazard);
        hazard.group.position.y =
          this.track.project(hazard.group.position).point.y + hazard.config.radiusMeters;

        const trigger = this.directImpactTrigger(hazard, targets);
        if (trigger !== null) {
          impacts.push(...this.detonate(hazard, targets));
          break;
        }

        const speedBeforeDrag = hazard.velocity.length();
        if (speedBeforeDrag > EPSILON && hazard.config.dragMetersPerSecondSquared > 0) {
          const nextSpeed = Math.max(
            0,
            speedBeforeDrag - hazard.config.dragMetersPerSecondSquared * step,
          );
          hazard.velocity.multiplyScalar(nextSpeed / speedBeforeDrag);
        }
        hazard.fuseRemainingSeconds = Math.max(0, hazard.fuseRemainingSeconds - step);
        this.updateFusePresentation(hazard);
        if (hazard.fuseRemainingSeconds <= EPSILON) {
          impacts.push(...this.detonate(hazard, targets));
          break;
        }
      }
    }

    return impacts;
  }

  private directImpactTrigger(
    hazard: ActiveHazard,
    targets: readonly HazardTarget[],
  ): HazardTarget | null {
    const hitRadius = RACER_HIT_RADIUS_METERS + hazard.config.radiusMeters;
    for (const target of targets) {
      if (target.finished || !finitePosition(target.position)) continue;
      if (target.id === hazard.ownerId && hazard.ownerImmunitySeconds > EPSILON) continue;
      if (squaredHorizontalDistance(hazard.group.position, target.position) > hitRadius ** 2) continue;
      const closingSpeed = planarClosingSpeed(
        hazard.group.position,
        hazard.velocity,
        target.position,
        target.velocity ?? new THREE.Vector3(),
      );
      if (closingSpeed + EPSILON >= hazard.config.directImpactMinClosingSpeedMetersPerSecond) {
        return target;
      }
    }
    return null;
  }

  private resolveGuardrail(hazard: ActiveHazard): void {
    const contact = guardrailContact(
      this.track,
      hazard.group.position,
      hazard.config.radiusMeters,
    );
    if (contact === null) return;
    hazard.group.position.addScaledVector(contact.inwardNormal, contact.penetration + 0.015);
    const outwardNormalSpeed = hazard.velocity.dot(contact.inwardNormal);
    if (outwardNormalSpeed < 0) {
      hazard.velocity.addScaledVector(contact.inwardNormal, -outwardNormalSpeed);
    }
  }

  private detonate(hazard: ActiveHazard, targets: readonly HazardTarget[]): HazardImpact[] {
    if (!this.active.has(hazard.id)) return [];
    const center = hazard.group.position.clone();
    const victims = areaEffectVictims(
      center,
      hazard.config.blastRadiusMeters,
      targets.map((target) =>
        target.id === hazard.ownerId && hazard.ownerImmunitySeconds > EPSILON
          ? { ...target, itemImmune: true }
          : target,
      ),
    );
    const impacts = victims.map((target): HazardImpact => ({
      hazardId: hazard.id,
      itemId: hazard.itemId,
      targetId: target.id,
      spinDirection: (hazard.id + target.id.length) % 2 === 0 ? 1 : -1,
      spinoutSeconds: hazard.config.spinoutSeconds,
    }));
    this.createBlastVisual(center, hazard.config.blastRadiusMeters);
    this.remove(hazard.id);
    return impacts;
  }

  private resolvePendingClears(): void {
    if (this.pendingClears.length === 0) return;
    for (const hazard of [...this.active.values()]) {
      if (
        this.pendingClears.some(
          ({ center, radius }) => squaredHorizontalDistance(center, hazard.group.position) <= radius ** 2,
        )
      ) {
        this.remove(hazard.id);
      }
    }
    this.pendingClears.length = 0;
  }

  private updateFusePresentation(hazard: ActiveHazard): void {
    const ratio = Math.max(0, Math.min(1, hazard.fuseRemainingSeconds / hazard.config.fuseSeconds));
    const pulse = 1 + Math.sin((1 - ratio) * Math.PI * 18) * 0.08;
    hazard.core.scale.setScalar(pulse);
    hazard.core.material.opacity = 0.72 + (1 - ratio) * 0.23;
  }

  private createBlastVisual(center: THREE.Vector3, radius: number): void {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.72, radius, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
    group.position.copy(center);
    group.position.y += 0.05;
    group.scale.setScalar(0.08);
    this.group.add(group);
    this.blastVisuals.push({ group, ring, remainingSeconds: BLAST_VISUAL_SECONDS });
  }

  private updateBlastVisuals(dt: number): void {
    for (let index = this.blastVisuals.length - 1; index >= 0; index -= 1) {
      const visual = this.blastVisuals[index];
      if (visual === undefined) continue;
      visual.remainingSeconds = Math.max(0, visual.remainingSeconds - dt);
      const progress = 1 - visual.remainingSeconds / BLAST_VISUAL_SECONDS;
      visual.group.scale.setScalar(0.08 + progress * 0.92);
      visual.ring.material.opacity = Math.max(0, 0.9 * (1 - progress));
      if (visual.remainingSeconds > 0) continue;
      this.group.remove(visual.group);
      disposeObject(visual.group);
      this.blastVisuals.splice(index, 1);
    }
  }

  public remove(hazardId: number): boolean {
    const hazard = this.active.get(hazardId);
    if (hazard === undefined) return false;
    this.active.delete(hazardId);
    this.capacity.release(hazard.capacityReservationId);
    this.group.remove(hazard.group);
    disposeObject(hazard.group);
    return true;
  }

  public activeCount(): number {
    return this.active.size;
  }

  public sharedPhysicsCount(): number {
    return this.capacity.activeCount();
  }

  public snapshots(): HazardSnapshot[] {
    return [...this.active.values()].map((hazard) => ({
      id: hazard.id,
      ownerId: hazard.ownerId,
      itemId: hazard.itemId,
      position: hazard.group.position.clone(),
      velocity: hazard.velocity.clone(),
      fuseRemainingSeconds: hazard.fuseRemainingSeconds,
      ownerImmunitySeconds: hazard.ownerImmunitySeconds,
    }));
  }

  public dispose(): void {
    for (const hazardId of [...this.active.keys()]) this.remove(hazardId);
    for (const visual of this.blastVisuals) {
      this.group.remove(visual.group);
      disposeObject(visual.group);
    }
    this.blastVisuals.length = 0;
    this.pendingClears.length = 0;
    this.group.clear();
  }
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}
