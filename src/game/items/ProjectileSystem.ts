import * as THREE from 'three';
import { Howler } from 'howler';
import { playBlazeTone } from '../../audio/blazeTone';
import { FrostAudio } from '../../audio/FrostAudio';
import { frostCrystal } from './FrostVisual';
import { ItemPhysicsCapacity, MAX_ITEM_PHYSICS_OBJECTS } from './ItemPhysicsCapacity';
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
  readonly itemImmune?: boolean;
  readonly onItemContact?: (itemId: ItemId, blocked: boolean, objectId?: number) => void;
  readonly velocity?: THREE.Vector3;
  readonly id: string;
  readonly position: THREE.Vector3;
  readonly forward: THREE.Vector3;
  readonly finished: boolean;
}

export interface ProjectileImpact {
  readonly effect?: 'frost';
  readonly planarSpeedRetention?: number;
  readonly preserveSpinMomentum?: boolean;
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

interface BlazeBurst {
  readonly group: THREE.Group;
  remainingSeconds: number;
}

const RACER_HIT_RADIUS_METERS = 1.05;
const PROJECTILE_SUBSTEP_METERS = 0.35;
const MAX_PROJECTILE_SUBSTEPS = 12;
const BLAZE_BURST_SECONDS = 0.18;
export const MAX_ACTIVE_PROJECTILES = MAX_ITEM_PHYSICS_OBJECTS;
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
    (config.impactEffect === 'frost' ? config.spinoutSeconds === 0 : config.spinoutSeconds > 0)
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

function howlerContext(): AudioContext | null | undefined {
  return (Howler as unknown as { ctx?: AudioContext | null }).ctx;
}

export class ProjectileSystem {
  private readonly frostAudio = new FrostAudio();
  public silenceFrostAudio(): void {
    this.frostAudio.dispose();
  }
  public readonly group = new THREE.Group();
  private readonly active = new Map<number, ActiveProjectile>();
  private readonly reservations = new Set<number>();
  private readonly clears: { center: THREE.Vector3; radius: number }[] = [];
  private readonly blazeBursts: BlazeBurst[] = [];

  public constructor(
    private readonly track: CircuitAlpha,
    public readonly capacity = new ItemPhysicsCapacity(),
  ) {
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

    const id = this.capacity.acquire();
    if (id === null) return null;
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
    } else if (request.itemId === 'frost-orbs') {
      core.visible = false;
      ring.visible = false;
      const shell = frostCrystal(request.config.radiusMeters);
      shell.name = 'frost-faceted-orb';
      const whiteCore = frostCrystal(request.config.radiusMeters * 0.6, 0xffffff);
      const trail = new THREE.Group();
      trail.name = 'frost-crystal-trail';
      for (let i = 0; i < 5; i++) {
        const crystal = frostCrystal(0.065 - i * 0.008);
        crystal.position.set((i % 2 ? 1 : -1) * 0.08, 0, -0.3 - i * 0.19);
        trail.add(crystal);
      }
      group.add(shell, whiteCore, trail);
      group.userData.itemPresentation = 'frost-orb';
    } else if (request.itemId === 'blaze-orbs') {
      core.visible = false;
      ring.material.color.setHex(0xff7a18);
      ring.scale.set(1.1, 1.1, 1.1);
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(request.config.radiusMeters * 1.05, 14, 10),
        new THREE.MeshBasicMaterial({
          color: 0xff861c,
          transparent: true,
          opacity: 0.48,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      glow.name = 'blaze-orb-glow';
      const hotCore = new THREE.Mesh(
        new THREE.SphereGeometry(request.config.radiusMeters * 0.68, 14, 10),
        new THREE.MeshBasicMaterial({ color: 0xffe4a1 }),
      );
      hotCore.name = 'blaze-orb-hot-core';
      const trail = new THREE.Group();
      trail.name = 'blaze-ember-trail';
      for (let index = 0; index < 4; index += 1) {
        const ember = new THREE.Mesh(
          new THREE.SphereGeometry(request.config.radiusMeters * (0.22 - index * 0.025), 7, 5),
          new THREE.MeshBasicMaterial({
            color: index % 2 === 0 ? 0xff9b2f : 0xffcf66,
            transparent: true,
            opacity: 0.72 - index * 0.12,
            depthWrite: false,
          }),
        );
        ember.position.set((index % 2 === 0 ? -1 : 1) * 0.035, 0, -0.22 - index * 0.16);
        trail.add(ember);
      }
      group.add(glow, hotCore, trail);
      group.userData.itemPresentation = 'blaze-orb';
    }
    group.add(spinner);
    group.position.copy(spawnPosition);
    group.name = `projectile-${String(id)}`;

    const projectile: ActiveProjectile = {
      id,
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
    if (request.itemId === 'frost-orbs')
      this.frostAudio.play('launch', howlerContext(), Howler.volume());
    if (request.itemId === 'blaze-orbs') {
      this.spawnBlazeBurst(spawnPosition);
      playBlazeTone('launch', howlerContext(), Howler.volume());
    }
    return projectile.id;
  }

  /** Queued Shockwave clears resolve before ordinary projectile movement/contact. */
  public queueClearWithinRadius(center: THREE.Vector3, radius: number): void {
    if (
      finiteVector(center) &&
      Number.isFinite(radius) &&
      radius >= 0 &&
      this.clears.length < MAX_ACTIVE_PROJECTILES
    )
      this.clears.push({ center: center.clone(), radius });
  }

  public update(
    dt: number,
    targets: readonly ProjectileTarget[],
    onImpact?: (impact: ProjectileImpact) => void,
  ): ProjectileImpact[] {
    if (!Number.isFinite(dt) || dt <= 0) return [];
    this.resolveQueuedClears();
    this.advanceBlazeBursts(dt);
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
              this.remove(projectile.id, true);
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
          if (
            target.id === projectile.ownerId &&
            projectile.ownerArmSeconds > (projectile.itemId === 'frost-orbs' ? 1e-9 : 0)
          )
            continue;
          const hitRadius = RACER_HIT_RADIUS_METERS + projectile.config.radiusMeters;
          if (
            squaredHorizontalDistance(projectile.group.position, target.position) >
            hitRadius ** 2
          )
            continue;

          target.onItemContact?.(projectile.itemId, target.itemImmune === true, projectile.id);
          if (target.itemImmune) {
            this.remove(projectile.id, true);
            destroyed = true;
            break;
          }
          const cross =
            projectile.velocity.x * target.forward.z - projectile.velocity.z * target.forward.x;
          const fallbackClockwise = (projectile.id + target.id.length) % 2 === 0;
          const spinDirection: -1 | 1 =
            Math.abs(cross) < 0.05 ? (fallbackClockwise ? 1 : -1) : cross < 0 ? -1 : 1;
          const impact: ProjectileImpact = {
            effect: projectile.config.impactEffect,
            projectileId: projectile.id,
            itemId: projectile.itemId,
            targetId: target.id,
            spinDirection,
            spinoutSeconds: projectile.config.spinoutSeconds,
          };
          impacts.push(impact);
          onImpact?.(impact);
          this.remove(projectile.id, true);
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
        racer.onItemContact?.(projectile.itemId, racer.itemImmune === true, projectile.id);
        this.remove(projectile.id);
        if (racer.itemImmune) return null;
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

  private resolveQueuedClears(): void {
    for (const projectile of [...this.active.values()]) {
      if (
        projectile.itemId !== 'kinetic-disc' &&
        projectile.itemId !== 'seeker-drone' &&
        projectile.itemId !== 'blaze-orbs' &&
        projectile.itemId !== 'frost-orbs'
      )
        continue;
      if (
        this.clears.some(
          ({ center, radius }) =>
            squaredHorizontalDistance(center, projectile.group.position) <= radius * radius,
        )
      )
        this.remove(projectile.id);
    }
    this.clears.length = 0;
  }

  public remove(projectileId: number, impactPresentation = false): boolean {
    const projectile = this.active.get(projectileId);
    if (projectile === undefined) return false;
    if (impactPresentation && projectile.itemId === 'frost-orbs') {
      this.spawnBlazeBurst(projectile.group.position, true);
      this.frostAudio.play('impact', howlerContext(), Howler.volume());
    }
    if (impactPresentation && projectile.itemId === 'blaze-orbs') {
      this.spawnBlazeBurst(projectile.group.position);
      playBlazeTone('impact', howlerContext(), Howler.volume());
    }
    this.active.delete(projectileId);
    this.capacity.release(projectileId);
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

  private spawnBlazeBurst(position: THREE.Vector3, frost = false): void {
    if (this.blazeBursts.length >= MAX_ACTIVE_PROJECTILES) return;
    const group = new THREE.Group();
    group.name = frost ? 'frost-crystal-burst' : 'blaze-spark-burst';
    group.position.copy(position);
    for (let index = 0; index < 6; index += 1) {
      const angle = (index / 6) * Math.PI * 2;
      const spark = new THREE.Mesh(
        frost
          ? new THREE.OctahedronGeometry(0.06)
          : new THREE.SphereGeometry(0.045 + (index % 2) * 0.012, 6, 4),
        new THREE.MeshBasicMaterial({
          color: frost
            ? index % 2 === 0
              ? 0xffffff
              : 0x9ae5ff
            : index % 2 === 0
              ? 0xffb23e
              : 0xff6a18,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      spark.position.set(Math.cos(angle) * 0.28, (index % 3) * 0.05, Math.sin(angle) * 0.28);
      group.add(spark);
    }
    this.group.add(group);
    this.blazeBursts.push({ group, remainingSeconds: BLAZE_BURST_SECONDS });
  }

  private advanceBlazeBursts(dt: number): void {
    for (let index = this.blazeBursts.length - 1; index >= 0; index -= 1) {
      const burst = this.blazeBursts[index];
      if (burst === undefined) continue;
      burst.remainingSeconds = Math.max(0, burst.remainingSeconds - dt);
      const ratio = burst.remainingSeconds / BLAZE_BURST_SECONDS;
      burst.group.scale.setScalar(1 + (1 - ratio) * 0.7);
      burst.group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const mesh = object as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          if (material instanceof THREE.MeshBasicMaterial) material.opacity = 0.85 * ratio;
        }
      });
      if (burst.remainingSeconds > 0) continue;
      burst.group.removeFromParent();
      burst.group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const mesh = object as THREE.Mesh;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          material.dispose();
        });
      });
      this.blazeBursts.splice(index, 1);
    }
  }

  public reserveSlot(): number | null {
    if (this.activeCount() >= MAX_ACTIVE_PROJECTILES) return null;
    const id = this.capacity.acquire();
    if (id === null) return null;
    this.reservations.add(id);
    return id;
  }

  public releaseSlot(id: number): void {
    this.reservations.delete(id);
    this.capacity.release(id);
  }

  public activeCount(): number {
    return this.capacity.count();
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
    this.frostAudio.dispose();
    for (const projectileId of [...this.active.keys()]) this.remove(projectileId);
    for (const id of this.reservations) this.capacity.release(id);
    this.reservations.clear();
    this.clears.length = 0;
    for (const burst of this.blazeBursts) {
      burst.group.removeFromParent();
      burst.group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const mesh = object as THREE.Mesh;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          material.dispose();
        });
      });
    }
    this.blazeBursts.length = 0;
    this.group.clear();
  }
}
