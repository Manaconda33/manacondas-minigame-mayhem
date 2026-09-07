import * as THREE from 'three';
import { steerSeeker } from './SeekerGuidance';
import { guardrailContact } from '../track/GuardrailSystem';
import { CircuitAlpha } from '../track/CircuitAlpha';
import { SEEKER_GUIDANCE, type ItemId, type ItemProjectileConfig } from './itemDefinitions';
import type { ItemUseDirection } from './ItemSystem';

export interface ProjectileLaunchContext {
  readonly position: THREE.Vector3;
  readonly forward: THREE.Vector3;
  readonly velocity: THREE.Vector3;
}

export interface ProjectileSpawnRequest {
  readonly itemId: ItemId;
  readonly ownerId: string;
  readonly direction: ItemUseDirection;
  readonly config: Readonly<ItemProjectileConfig>;
  readonly launch: ProjectileLaunchContext;
  readonly targetId?: string;
}

export interface ProjectileTarget {
  readonly velocity?: THREE.Vector3;
  readonly id: string;
  readonly position: THREE.Vector3;
  readonly forward: THREE.Vector3;
  readonly finished: boolean;
}

export interface ProjectileImpact {
  readonly projectileId: number;
  readonly itemId: ItemId;
  readonly targetId: string;
  readonly spinDirection: -1 | 1;
  readonly spinoutSeconds: number;
}

export interface ProjectileSnapshot {
  readonly id: number;
  readonly ownerId: string;
  readonly targetId: string | null;
  readonly itemId: ItemId;
  readonly position: THREE.Vector3;
  readonly velocity: THREE.Vector3;
  readonly bounceCount: number;
  readonly remainingSeconds: number;
  readonly ownerArmSeconds: number;
}

interface ActiveProjectile {
  readonly targetId: string | null;
  readonly id: number;
  readonly itemId: ItemId;
  readonly ownerId: string;
  readonly config: Readonly<ItemProjectileConfig>;
  readonly group: THREE.Group;
  readonly spinner: THREE.Group;
  velocity: THREE.Vector3;
  bounceCount: number;
  remainingSeconds: number;
  ownerArmSeconds: number;
  bounceCooldownSeconds: number;
}

const RACER_HIT_RADIUS_METERS = 1.05;
const PROJECTILE_SUBSTEP_METERS = 0.35;
const MAX_PROJECTILE_SUBSTEPS = 12;
export const MAX_ACTIVE_PROJECTILES = 40;
const LOCAL_TRAVEL_AXIS = new THREE.Vector3(0, 0, 1);

function validConfig(config: Readonly<ItemProjectileConfig>): boolean {
  return (
    Number.isFinite(config.speedMetersPerSecond) &&
    config.speedMetersPerSecond > 0 &&
    Number.isFinite(config.radiusMeters) &&
    config.radiusMeters > 0 &&
    Number.isFinite(config.lifetimeSeconds) &&
    config.lifetimeSeconds > 0 &&
    Number.isInteger(config.maxWallBounces) &&
    config.maxWallBounces >= 0 &&
    Number.isFinite(config.inheritedVelocityFactor) &&
    config.inheritedVelocityFactor >= 0 &&
    Number.isFinite(config.maxInheritedSpeedMetersPerSecond) &&
    config.maxInheritedSpeedMetersPerSecond >= 0 &&
    Number.isFinite(config.ownerArmSeconds) &&
    config.ownerArmSeconds >= 0 &&
    Number.isFinite(config.spinoutSeconds) &&
    config.spinoutSeconds > 0
  );
}

function finiteVector(vector: THREE.Vector3): boolean {
  return [vector.x, vector.y, vector.z].every(Number.isFinite);
}

function orientProjectile(projectile: ActiveProjectile): void {
  const direction = projectile.velocity.clone().setY(0);
  if (direction.lengthSq() < 0.0001) return;
  direction.normalize();
  projectile.group.quaternion.setFromUnitVectors(LOCAL_TRAVEL_AXIS, direction);
}

function squaredHorizontalDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  const x = a.x - b.x;
  const z = a.z - b.z;
  return x * x + z * z;
}

export class ProjectileSystem {
  public readonly group = new THREE.Group();
  private readonly active = new Map<number, ActiveProjectile>();
  private nextId = 1;
  private readonly reservations = new Set<number>();

  public constructor(private readonly track: CircuitAlpha) {
    this.group.name = 'projectile-runtime';
  }

  public spawn(request: ProjectileSpawnRequest): number | null {
    if (
      this.activeCount() >= MAX_ACTIVE_PROJECTILES ||
      request.ownerId.trim().length === 0 ||
      (request.itemId === 'seeker-drone' &&
        (!request.targetId?.trim() || request.targetId === request.ownerId)) ||
      !validConfig(request.config) ||
      !finiteVector(request.launch.position) ||
      !finiteVector(request.launch.forward) ||
      !finiteVector(request.launch.velocity)
    ) {
      return null;
    }

    const launchDirection = request.launch.forward.clone().setY(0);
    if (launchDirection.lengthSq() < 0.0001) return null;
    launchDirection.normalize();
    if (request.direction === 'backward' && request.itemId !== 'seeker-drone')
      launchDirection.multiplyScalar(-1);

    const inherited = request.launch.velocity.clone().setY(0);
    const inheritedSpeed = inherited.length();
    if (inheritedSpeed > request.config.maxInheritedSpeedMetersPerSecond && inheritedSpeed > 0) {
      inherited.multiplyScalar(request.config.maxInheritedSpeedMetersPerSecond / inheritedSpeed);
    }

    const velocity = launchDirection
      .clone()
      .multiplyScalar(request.config.speedMetersPerSecond)
      .addScaledVector(inherited, request.config.inheritedVelocityFactor);
    const spawnPosition = request.launch.position
      .clone()
      .addScaledVector(launchDirection, 1.75 + request.config.radiusMeters);
    spawnPosition.y = Math.max(0.55, request.launch.position.y);

    const group = new THREE.Group();
    const spinner = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.CircleGeometry(request.config.radiusMeters * 0.7, 20),
      new THREE.MeshBasicMaterial({
        color: 0xa7f3ff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(
        request.config.radiusMeters * 0.86,
        Math.max(0.035, request.config.radiusMeters * 0.12),
        7,
        24,
      ),
      new THREE.MeshBasicMaterial({
        color: 0x48d8ff,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    spinner.add(core, ring);
    if (request.itemId === 'seeker-drone') {
      core.visible = false;
      ring.material.color.setHex(0xffb347);
      const hull = new THREE.Mesh(
        new THREE.OctahedronGeometry(request.config.radiusMeters * 1.5),
        new THREE.MeshBasicMaterial({ color: 0xffad45 }),
      );
      hull.scale.set(0.7, 0.65, 1.6);
      group.add(hull);
      ring.scale.set(1.8, 0.75, 1);
    }
    group.add(spinner);
    group.position.copy(spawnPosition);
    group.name = `projectile-${String(this.nextId)}`;

    const projectile: ActiveProjectile = {
      id: this.nextId,
      targetId: request.itemId === 'seeker-drone' ? (request.targetId ?? null) : null,
      itemId: request.itemId,
      ownerId: request.ownerId,
      config: request.config,
      group,
      spinner,
      velocity,
      bounceCount: 0,
      remainingSeconds: request.config.lifetimeSeconds,
      ownerArmSeconds: request.config.ownerArmSeconds,
      bounceCooldownSeconds: 0,
    };
    orientProjectile(projectile);
    this.group.add(group);
    this.active.set(projectile.id, projectile);
    this.nextId += 1;
    return projectile.id;
  }

  public update(dt: number, targets: readonly ProjectileTarget[]): ProjectileImpact[] {
    if (!Number.isFinite(dt) || dt <= 0) return [];
    const impacts: ProjectileImpact[] = [];

    for (const projectile of [...this.active.values()]) {
      if (projectile.itemId === 'seeker-drone') {
        const impact = this.updateSeeker(projectile, dt, targets);
        if (impact !== null) impacts.push(impact);
        continue;
      }
      projectile.remainingSeconds -= dt;
      projectile.ownerArmSeconds = Math.max(0, projectile.ownerArmSeconds - dt);
      projectile.bounceCooldownSeconds = Math.max(0, projectile.bounceCooldownSeconds - dt);
      projectile.spinner.rotation.z += dt * 18;
      if (projectile.remainingSeconds <= 0) {
        this.remove(projectile.id);
        continue;
      }

      const travelDistance = projectile.velocity.length() * dt;
      const substeps = Math.max(
        1,
        Math.min(MAX_PROJECTILE_SUBSTEPS, Math.ceil(travelDistance / PROJECTILE_SUBSTEP_METERS)),
      );
      const subDt = dt / substeps;
      let destroyed = false;

      for (let step = 0; step < substeps; step += 1) {
        projectile.group.position.addScaledVector(projectile.velocity, subDt);

        const contact = guardrailContact(
          this.track,
          projectile.group.position,
          projectile.config.radiusMeters,
        );
        if (contact !== null) {
          projectile.group.position.addScaledVector(
            contact.inwardNormal,
            contact.penetration + 0.015,
          );
          const normalSpeed = projectile.velocity.dot(contact.inwardNormal);
          if (normalSpeed < -0.01 && projectile.bounceCooldownSeconds <= 0) {
            if (projectile.bounceCount >= projectile.config.maxWallBounces) {
              this.remove(projectile.id);
              break;
            }
            projectile.velocity.addScaledVector(contact.inwardNormal, -2 * normalSpeed);
            projectile.bounceCount += 1;
            projectile.bounceCooldownSeconds = 0.045;
            orientProjectile(projectile);
          }
        }

        for (const target of targets) {
          if (target.finished) continue;
          if (target.id === projectile.ownerId && projectile.ownerArmSeconds > 0) continue;
          const hitRadius = RACER_HIT_RADIUS_METERS + projectile.config.radiusMeters;
          if (
            squaredHorizontalDistance(projectile.group.position, target.position) >
            hitRadius ** 2
          )
            continue;

          const cross =
            projectile.velocity.x * target.forward.z - projectile.velocity.z * target.forward.x;
          const fallbackClockwise = (projectile.id + target.id.length) % 2 === 0;
          const spinDirection: -1 | 1 =
            Math.abs(cross) < 0.05 ? (fallbackClockwise ? 1 : -1) : cross < 0 ? -1 : 1;
          impacts.push({
            projectileId: projectile.id,
            itemId: projectile.itemId,
            targetId: target.id,
            spinDirection,
            spinoutSeconds: projectile.config.spinoutSeconds,
          });
          this.remove(projectile.id);
          destroyed = true;
          break;
        }

        if (destroyed) break;
      }
    }

    return impacts;
  }

  private updateSeeker(
    projectile: ActiveProjectile,
    dt: number,
    targets: readonly ProjectileTarget[],
  ): ProjectileImpact | null {
    const target = targets.find((racer) => racer.id === projectile.targetId && !racer.finished);
    if (
      target === undefined ||
      !finiteVector(target.position) ||
      (target.velocity !== undefined && !finiteVector(target.velocity))
    ) {
      this.remove(projectile.id);
      return null;
    }
    // Bound integration by travel distance, including delayed frames. Lifetime
    // bounds this loop even for an unusually large caller delta.
    let remaining = Math.min(dt, projectile.remainingSeconds);
    while (remaining > 1e-9) {
      const step = Math.min(remaining, PROJECTILE_SUBSTEP_METERS / SEEKER_GUIDANCE.maxSpeed);
      remaining -= step;
      projectile.remainingSeconds = Math.max(0, projectile.remainingSeconds - step);
      projectile.ownerArmSeconds = Math.max(0, projectile.ownerArmSeconds - step);
      if (projectile.remainingSeconds < 1e-9) {
        this.remove(projectile.id);
        return null;
      }
      steerSeeker(
        this.track,
        projectile.group.position,
        projectile.velocity,
        target.position,
        target.velocity ?? new THREE.Vector3(),
        step,
      );
      projectile.group.position.addScaledVector(projectile.velocity, step);
      projectile.spinner.rotation.z += step * 12;
      orientProjectile(projectile);
      if (
        guardrailContact(this.track, projectile.group.position, projectile.config.radiusMeters) !==
        null
      ) {
        this.remove(projectile.id);
        return null;
      }
      if (projectile.ownerArmSeconds > 1e-9) continue;
      for (const racer of targets) {
        if (racer.finished || !finiteVector(racer.position)) continue;
        if (
          squaredHorizontalDistance(projectile.group.position, racer.position) >
          (RACER_HIT_RADIUS_METERS + projectile.config.radiusMeters) ** 2
        )
          continue;
        this.remove(projectile.id);
        return {
          projectileId: projectile.id,
          itemId: projectile.itemId,
          targetId: racer.id,
          spinDirection: projectile.id % 2 === 0 ? 1 : -1,
          spinoutSeconds: projectile.config.spinoutSeconds,
        };
      }
    }
    return null;
  }

  public remove(projectileId: number): boolean {
    const projectile = this.active.get(projectileId);
    if (projectile === undefined) return false;
    this.active.delete(projectileId);
    this.group.remove(projectile.group);
    projectile.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const mesh = object as THREE.Mesh;
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.dispose();
      });
    });
    return true;
  }

  /** Non-colliding item phases reserve capacity before becoming terminal. */
  public reserveSlot(): number | null {
    if (this.activeCount() >= MAX_ACTIVE_PROJECTILES) return null;
    const id = this.nextId++;
    this.reservations.add(id);
    return id;
  }

  public releaseSlot(id: number): void {
    this.reservations.delete(id);
  }

  public activeCount(): number {
    return this.active.size + this.reservations.size;
  }

  public snapshots(): ProjectileSnapshot[] {
    return [...this.active.values()].map((projectile) => ({
      id: projectile.id,
      ownerId: projectile.ownerId,
      targetId: projectile.targetId,
      itemId: projectile.itemId,
      position: projectile.group.position.clone(),
      velocity: projectile.velocity.clone(),
      bounceCount: projectile.bounceCount,
      remainingSeconds: projectile.remainingSeconds,
      ownerArmSeconds: projectile.ownerArmSeconds,
    }));
  }

  public dispose(): void {
    for (const projectileId of [...this.active.keys()]) this.remove(projectileId);
    this.reservations.clear();
    this.group.clear();
  }
}
