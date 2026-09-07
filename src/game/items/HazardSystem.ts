import * as THREE from 'three';
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
import { BLAST_ORB_CONFIG as C } from './itemDefinitions';

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
interface BlastVisual {
  mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  remaining: number;
}

/** Ground-bound hazards own no racer progress or controller state. */
export class HazardSystem {
  public readonly group = new THREE.Group();
  private readonly orbs = new Map<number, Orb>();
  private readonly clears: { center: THREE.Vector3; radius: number }[] = [];
  private readonly blasts: BlastVisual[] = [];

  public constructor(
    private readonly track: CircuitAlpha,
    private readonly capacity: ItemPhysicsCapacity,
  ) {
    this.group.name = 'hazard-runtime';
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
    for (const orb of this.orbs.values()) {
      if (
        this.clears.some(
          ({ center, radius }) => center.distanceToSquared(orb.mesh.position) <= radius ** 2,
        )
      )
        this.remove(orb.id);
    }
    this.clears.length = 0;
    this.updateBlasts(dt);
    const impacts: ProjectileImpact[] = [];
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
    return this.orbs.size;
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
    while (this.blasts.length > 0) this.removeBlast(0);
    this.clears.length = 0;
    this.group.clear();
  }
}
