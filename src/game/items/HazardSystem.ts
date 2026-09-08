import * as THREE from 'three';
import type { SlickSurface } from './SlickGroundSurface';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import { guardrailContact } from '../track/GuardrailSystem';
import { ItemPhysicsCapacity, MAX_ITEM_PHYSICS_OBJECTS } from './ItemPhysicsCapacity';
import { areaEffectVictims, finitePosition } from './AreaEffects';

import type {
  ProjectileImpact,
  ProjectileLaunchContext,
  ProjectileTarget,
} from './ProjectileSystem';
import type { ItemUseDirection } from './ItemSystem';
import { BLAST_ORB_CONFIG as C, SLICK_TRAP_CONFIG as S } from './itemDefinitions';

export interface HazardTarget extends ProjectileTarget {
  readonly itemImmune?: boolean;
}

export interface HazardSnapshot {
  readonly id: number;
  readonly ownerId: string;
  readonly position: THREE.Vector3;
  readonly velocity: THREE.Vector3;
  readonly remainingSeconds: number;
  readonly ownerImmuneSeconds: number;
}
interface Orb {
  id: number;
  ownerId: string;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  velocity: THREE.Vector3;
  age: number;
}
interface Slick {
  id: number;
  ownerId: string;
  mesh: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  age: number;
}
interface BlastVisual {
  mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  remaining: number;
}

function squaredHorizontalDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  const x = a.x - b.x;
  const z = a.z - b.z;
  return x * x + z * z;
}

/** Ground-bound hazards own no racer progress or controller state. */
export class HazardSystem {
  public readonly group = new THREE.Group();
  private readonly slicks = new Map<number, Slick>();
  private readonly orbs = new Map<number, Orb>();
  private readonly clears: { center: THREE.Vector3; radius: number }[] = [];
  private readonly blasts: BlastVisual[] = [];

  public constructor(
    private readonly track: CircuitAlpha,
    private readonly capacity: ItemPhysicsCapacity,
    private readonly slickSurface?: (position: THREE.Vector3) => SlickSurface | null,
  ) {
    this.group.name = 'hazard-runtime';
  }

  public canPlaceSlick(ownerId: string): boolean {
    return (
      this.capacity.count() < MAX_ITEM_PHYSICS_OBJECTS ||
      this.ownerSlicks(ownerId).length >= S.maxPerOwner
    );
  }

  private ownerSlicks(ownerId: string): Slick[] {
    return [...this.slicks.values()].filter((slick) => slick.ownerId === ownerId);
  }

  /** Both ITEM directions deliberately share this rear-only placement. */
  public spawnSlick(
    ownerId: string,
    launch: ProjectileLaunchContext,
    commitCharge: () => boolean = () => true,
  ): number | null {
    if (
      !finitePosition(launch.position) ||
      !finitePosition(launch.forward) ||
      !finitePosition(launch.velocity)
    )
      return null;
    const forward = launch.forward.clone().setY(0);
    if (forward.lengthSq() < 0.0001) return null;
    return this.placeSlick(
      ownerId,
      launch.position.clone().addScaledVector(forward.normalize(), -S.spawnOffset),
      commitCharge,
    );
  }

  /** Fixture placement uses the production lifetime, trigger, capacity and owner cap. */
  public placeSlick(
    ownerId: string,
    position: THREE.Vector3,
    commitCharge: () => boolean = () => true,
  ): number | null {
    if (!ownerId.trim() || !finitePosition(position)) return null;
    const owned = this.ownerSlicks(ownerId);
    const oldest = owned.length >= S.maxPerOwner ? owned[0] : undefined;
    const reserved = oldest === undefined ? this.capacity.acquire() : null;
    const candidateSlot = reserved ?? oldest?.id;
    if (candidateSlot === undefined) return null;
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(S.triggerRadius, 32),
      new THREE.MeshBasicMaterial({ color: 0x151222, side: THREE.DoubleSide }),
    );
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1.02, 32),
      new THREE.MeshBasicMaterial({
        color: 0x9991cf,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    mesh.position.copy(position);
    const contact = guardrailContact(this.track, mesh.position, S.triggerRadius);
    if (contact !== null) mesh.position.addScaledVector(contact.inwardNormal, contact.penetration);
    const surface = this.slickSurface?.(mesh.position);
    if (surface != null) {
      mesh.position.copy(surface.point).addScaledVector(surface.normal, 0.04);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surface.normal);
    } else {
      mesh.position.y = this.track.project(mesh.position).point.y + 0.04;
      mesh.rotation.x = -Math.PI / 2;
    }
    ring.position.z = 0.006;
    mesh.add(ring);
    let committed = false;
    try {
      committed = commitCharge();
      if (!committed) return null;
      // All fallible gameplay prerequisites precede the inventory commit. Keep the
      // old pair intact until success, then transfer its slot synchronously.
      const id = oldest === undefined ? candidateSlot : this.capacity.replace(oldest.id);
      if (oldest !== undefined) this.remove(oldest.id);
      mesh.name = `slick-trap-${String(id)}`;
      this.slicks.set(id, { id, ownerId, mesh, ring, age: 0 });
      this.group.add(mesh);
      return id;
    } finally {
      if (!committed) {
        if (reserved !== null) this.capacity.release(reserved);
        ring.geometry.dispose();
        ring.material.dispose();
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    }
  }

  public spawnBlastOrb(
    ownerId: string,
    direction: ItemUseDirection,
    launch: ProjectileLaunchContext,
    commitCharge: () => boolean = () => true,
  ): number | null {
    if (
      !finitePosition(launch.position) ||
      !finitePosition(launch.forward) ||
      !finitePosition(launch.velocity)
    )
      return null;
    const forward = launch.forward.clone().setY(0);
    if (forward.lengthSq() < 0.0001) return null;
    forward.normalize();
    const inherited = launch.velocity.clone().setY(0).clampLength(0, C.inheritedSpeedCap);
    const velocity = inherited.multiplyScalar(
      direction === 'forward' ? C.forwardInheritance : C.backwardInheritance,
    );
    if (direction === 'forward') velocity.addScaledVector(forward, C.forwardSpeed);
    const position = launch.position
      .clone()
      .addScaledVector(forward, direction === 'forward' ? C.spawnOffset : -C.spawnOffset);
    return this.createOrb(ownerId, position, velocity, commitCharge);
  }

  /** Explicit incoming fixture placement: ordinary fuse/contact rules and capacity. */
  public placeBlastOrb(ownerId: string, position: THREE.Vector3): number | null {
    return this.createOrb(ownerId, position, new THREE.Vector3(), () => true);
  }

  private createOrb(
    ownerId: string,
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    commitCharge: () => boolean,
  ): number | null {
    if (!ownerId.trim() || !finitePosition(position)) return null;
    const id = this.capacity.acquire();
    if (id === null) return null;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(C.radius, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xffb65c, wireframe: false }),
    );
    mesh.name = `blast-orb-${String(id)}`;
    mesh.position.copy(position);
    const orb: Orb = { id, ownerId, mesh, velocity, age: 0 };
    this.contain(orb);
    this.orbs.set(id, orb);
    this.group.add(mesh);
    let committed = false;
    try {
      committed = commitCharge();
      return committed ? id : null;
    } finally {
      if (!committed) this.remove(id);
    }
  }

  /** Queued queries resolve before every movement/contact/fuse phase, even at expiry. */
  public queueClearWithinRadius(center: THREE.Vector3, radius: number): void {
    if (
      finitePosition(center) &&
      Number.isFinite(radius) &&
      radius >= 0 &&
      this.clears.length < MAX_ITEM_PHYSICS_OBJECTS
    )
      this.clears.push({ center: center.clone(), radius });
  }

  public update(dt: number, targets: readonly HazardTarget[]): ProjectileImpact[] {
    if (!Number.isFinite(dt) || dt <= 0) return [];
    for (const orb of [...this.orbs.values(), ...this.slicks.values()]) {
      if (
        this.clears.some(
          ({ center, radius }) =>
            squaredHorizontalDistance(center, orb.mesh.position) <= radius ** 2,
        )
      )
        this.remove(orb.id);
    }
    this.clears.length = 0;
    this.updateBlasts(dt);
    const impacts: ProjectileImpact[] = [];
    for (const slick of this.slicks.values()) {
      slick.age += dt;
      if (slick.age >= S.lifetimeSeconds - 1e-9) {
        this.remove(slick.id);
        continue;
      }
      slick.ring.material.opacity = 0.4 + 0.15 * Math.sin(slick.age * 3);
      const target = targets.find(
        (racer) =>
          !racer.finished &&
          !racer.itemImmune &&
          finitePosition(racer.position) &&
          !(racer.id === slick.ownerId && slick.age < S.ownerImmunitySeconds - 1e-9) &&
          (racer.position.x - slick.mesh.position.x) ** 2 +
            (racer.position.z - slick.mesh.position.z) ** 2 <=
            S.triggerRadius ** 2,
      );
      if (target === undefined) continue;
      this.remove(slick.id);
      impacts.push({
        projectileId: slick.id,
        itemId: 'slick-trap',
        targetId: target.id,
        spinoutSeconds: S.spinoutSeconds,
        spinDirection: slick.id % 2 === 0 ? 1 : -1,
        planarSpeedRetention: S.planarSpeedRetention,
        preserveSpinMomentum: true,
      });
    }
    for (const orb of [...this.orbs.values()]) {
      let remaining = Math.min(dt, C.fuseSeconds - orb.age);
      while (remaining > 1e-9 && this.orbs.has(orb.id)) {
        // Test initial contact before drag: the threshold is contact closing speed,
        // not relative speed magnitude (separating or glancing overlaps do not qualify).
        if (this.qualifyingContact(orb, targets)) {
          impacts.push(...this.detonate(orb, targets));
          break;
        }
        const immunityBoundary = C.ownerImmunitySeconds - orb.age;
        const step = Math.min(
          remaining,
          1 / 120,
          C.fuseSeconds - orb.age,
          immunityBoundary > 1e-9 ? immunityBoundary : Infinity,
        );
        remaining -= step;
        const speed = orb.velocity.length();
        const movingTime = Math.min(step, speed / C.drag);
        if (speed > 0) {
          orb.mesh.position.addScaledVector(
            orb.velocity,
            (speed * movingTime - 0.5 * C.drag * movingTime ** 2) / speed,
          );
          orb.velocity.multiplyScalar(Math.max(0, speed - C.drag * step) / speed);
        }
        orb.age += step;
        this.contain(orb);
        orb.mesh.rotation.z += step * speed;
        const pulse = 0.5 + 0.5 * Math.sin(orb.age * (6 + (12 * orb.age) / C.fuseSeconds));
        orb.mesh.material.color.setRGB(1, 0.25 + pulse * 0.45, 0.1 + pulse * 0.15);
        if (this.qualifyingContact(orb, targets) || orb.age >= C.fuseSeconds - 1e-9) {
          impacts.push(...this.detonate(orb, targets));
          break;
        }
      }
    }
    return impacts;
  }

  private qualifyingContact(orb: Orb, targets: readonly HazardTarget[]): boolean {
    return targets.some((racer) => {
      if (
        racer.finished ||
        !finitePosition(racer.position) ||
        (racer.id === orb.ownerId && orb.age < C.ownerImmunitySeconds - 1e-9)
      )
        return false;
      const toward = racer.position.clone().sub(orb.mesh.position).setY(0);
      if (toward.lengthSq() > (1.05 + C.radius) ** 2) return false;
      const relative = orb.velocity
        .clone()
        .sub(racer.velocity ?? new THREE.Vector3())
        .setY(0);
      const closing =
        toward.lengthSq() > 1e-12 ? relative.dot(toward.normalize()) : relative.length();
      return Number.isFinite(closing) && closing >= C.impactClosingSpeed;
    });
  }

  private contain(orb: Orb): void {
    const contact = guardrailContact(this.track, orb.mesh.position, C.radius);
    if (contact !== null) {
      orb.mesh.position.addScaledVector(contact.inwardNormal, contact.penetration + 0.001);
      const outward = orb.velocity.dot(contact.inwardNormal);
      if (outward < 0) orb.velocity.addScaledVector(contact.inwardNormal, -outward);
    }
    orb.mesh.position.y = this.track.project(orb.mesh.position).point.y + C.radius;
  }

  private detonate(orb: Orb, targets: readonly HazardTarget[]): ProjectileImpact[] {
    const eligible =
      orb.age < C.ownerImmunitySeconds - 1e-9
        ? targets.filter((racer) => racer.id !== orb.ownerId)
        : targets;
    const impacts: ProjectileImpact[] = areaEffectVictims(
      orb.mesh.position,
      C.blastRadius,
      eligible,
    ).map((racer) => ({
      projectileId: orb.id,
      itemId: 'blast-orb',
      targetId: racer.id,
      spinoutSeconds: C.spinoutSeconds,
      spinDirection: orb.id % 2 === 0 ? 1 : -1,
    }));
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffbe70,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(orb.mesh.position).y -= C.radius - 0.12;
    mesh.scale.setScalar(C.blastRadius * 0.4);
    if (this.blasts.length >= MAX_ITEM_PHYSICS_OBJECTS) this.removeBlast(0);
    this.blasts.push({ mesh, remaining: 0.45 });
    this.group.add(mesh);
    this.remove(orb.id);
    return impacts;
  }

  private updateBlasts(dt: number): void {
    for (let i = this.blasts.length - 1; i >= 0; i--) {
      const blast = this.blasts[i];
      if (blast === undefined) continue;
      blast.remaining -= dt;
      if (blast.remaining <= 0) {
        this.removeBlast(i);
        continue;
      }
      blast.mesh.scale.setScalar(C.blastRadius * (1 - (0.6 * blast.remaining) / 0.45));
      blast.mesh.material.opacity = blast.remaining / 0.45;
    }
  }

  private removeBlast(index: number): void {
    const blast = this.blasts.splice(index, 1)[0];
    if (blast === undefined) return;
    this.group.remove(blast.mesh);
    blast.mesh.geometry.dispose();
    blast.mesh.material.dispose();
  }

  public remove(id: number): boolean {
    const slick = this.slicks.get(id);
    if (slick !== undefined) {
      this.slicks.delete(id);
      this.capacity.release(id);
      this.group.remove(slick.mesh);
      slick.ring.geometry.dispose();
      slick.ring.material.dispose();
      slick.mesh.geometry.dispose();
      slick.mesh.material.dispose();
      return true;
    }
    const orb = this.orbs.get(id);
    if (orb === undefined) return false;
    this.orbs.delete(id);
    this.capacity.release(id);
    this.group.remove(orb.mesh);
    orb.mesh.geometry.dispose();
    orb.mesh.material.dispose();
    return true;
  }
  public activeCount(): number {
    return this.orbs.size + this.slicks.size;
  }
  public activeSnapshots(): (HazardSnapshot & { readonly kind: 'slick' | 'blast' })[] {
    return [
      ...this.snapshots().map((snapshot) => ({ ...snapshot, kind: 'blast' as const })),
      ...this.slickSnapshots().map((snapshot) => ({ ...snapshot, kind: 'slick' as const })),
    ];
  }
  public slickSnapshots(): HazardSnapshot[] {
    return [...this.slicks.values()].map((slick) => ({
      id: slick.id,
      ownerId: slick.ownerId,
      position: slick.mesh.position.clone(),
      velocity: new THREE.Vector3(),
      remainingSeconds: Math.max(0, S.lifetimeSeconds - slick.age),
      ownerImmuneSeconds: Math.max(0, S.ownerImmunitySeconds - slick.age),
    }));
  }
  public snapshots(): HazardSnapshot[] {
    return [...this.orbs.values()].map((orb) => ({
      id: orb.id,
      ownerId: orb.ownerId,
      position: orb.mesh.position.clone(),
      velocity: orb.velocity.clone(),
      remainingSeconds: Math.max(0, C.fuseSeconds - orb.age),
      ownerImmuneSeconds: Math.max(0, C.ownerImmunitySeconds - orb.age),
    }));
  }
  public dispose(): void {
    for (const id of this.orbs.keys()) this.remove(id);
    for (const id of this.slicks.keys()) this.remove(id);
    while (this.blasts.length > 0) this.removeBlast(0);
    this.clears.length = 0;
    this.group.clear();
  }
}
