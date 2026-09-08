import * as THREE from 'three';
import { SHOCKWAVE_CONFIG as C } from './itemDefinitions';
import type { SlickSurface } from './SlickGroundSurface';

export interface ShockwaveTarget {
  readonly id: string;
  readonly position: THREE.Vector3;
  readonly finished: boolean;
  readonly itemImmune?: boolean;
}

export interface ShockwavePulse {
  readonly ownerId: string;
  readonly center: THREE.Vector3;
}

export interface ShockwavePush {
  readonly targetId: string;
  readonly velocityDelta: THREE.Vector3;
}

export interface ShockwaveCounterRuntime {
  readonly projectileSystem: {
    queueClearWithinRadius(center: THREE.Vector3, radius: number): void;
  };
  readonly hazardSystem: {
    queueClearWithinRadius(center: THREE.Vector3, radius: number): void;
  };
  readonly apexSystem: {
    queueCounterPulse(center: THREE.Vector3): void;
  };
  readonly targets: readonly ShockwaveTarget[];
}

interface ShockwaveVisual {
  readonly ownerId: string;
  readonly mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  elapsed: number;
}

const MAX_PENDING_PULSES = 8;
const VISUAL_BASE_RADIUS = 0.95;

function finitePosition(position: THREE.Vector3): boolean {
  return [position.x, position.y, position.z].every(Number.isFinite);
}

function fallbackDirection(ownerId: string, targetId: string): THREE.Vector3 {
  const key = `${ownerId}:${targetId}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const angle = ((hash >>> 0) / 0x100000000) * Math.PI * 2;
  return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
}

/** Pure governed racer effect: horizontal velocity delta only. */
export function shockwavePushDelta(
  pulse: ShockwavePulse,
  target: ShockwaveTarget,
): THREE.Vector3 | null {
  if (
    target.id === pulse.ownerId ||
    target.finished ||
    target.itemImmune ||
    !finitePosition(pulse.center) ||
    !finitePosition(target.position)
  )
    return null;

  const dx = target.position.x - pulse.center.x;
  const dz = target.position.z - pulse.center.z;
  const distance = Math.hypot(dx, dz);
  if (!Number.isFinite(distance) || distance > C.radius) return null;

  const direction =
    distance > 1e-9
      ? new THREE.Vector3(dx / distance, 0, dz / distance)
      : fallbackDirection(pulse.ownerId, target.id);
  const ratio = THREE.MathUtils.clamp(distance / C.radius, 0, 1);
  const magnitude = THREE.MathUtils.lerp(
    C.centerPushMetersPerSecond,
    C.edgePushMetersPerSecond,
    ratio,
  );
  return direction.multiplyScalar(magnitude);
}

/**
 * Owns the one-frame pulse queue and finite gameplay-readability VFX. It does
 * not own race progress, racer transforms, projectile lifecycles, or hazards.
 */
export class ShockwaveSystem {
  public readonly group = new THREE.Group();
  private readonly pending: ShockwavePulse[] = [];
  private readonly visuals: ShockwaveVisual[] = [];
  private visualSerial = 0;

  public constructor(
    private readonly groundSurface?: (position: THREE.Vector3) => SlickSurface | null,
    private readonly ownerPosition?: (ownerId: string) => THREE.Vector3 | undefined,
  ) {
    this.group.name = 'shockwave-runtime';
  }

  public activate(
    ownerId: string,
    center: THREE.Vector3,
    commitCharge: () => boolean = () => true,
  ): boolean {
    if (
      ownerId.trim().length === 0 ||
      !finitePosition(center) ||
      this.pending.length >= MAX_PENDING_PULSES
    )
      return false;

    const visual = this.createVisual(ownerId, center);
    let committed = false;
    try {
      committed = commitCharge();
      if (!committed) return false;
      this.pending.push({ ownerId, center: center.clone() });
      this.visuals.push(visual);
      this.group.add(visual.mesh);
      return true;
    } finally {
      if (!committed) this.disposeVisual(visual);
    }
  }

  public drainPulses(): ShockwavePulse[] {
    const pulses = this.pending.map((pulse) => ({
      ownerId: pulse.ownerId,
      center: pulse.center.clone(),
    }));
    this.pending.length = 0;
    return pulses;
  }

  public dispatch(pulse: ShockwavePulse, runtime: ShockwaveCounterRuntime): ShockwavePush[] {
    runtime.projectileSystem.queueClearWithinRadius(pulse.center, C.radius);
    runtime.hazardSystem.queueClearWithinRadius(pulse.center, C.radius);
    runtime.apexSystem.queueCounterPulse(pulse.center);
    return runtime.targets.flatMap((target) => {
      const velocityDelta = shockwavePushDelta(pulse, target);
      return velocityDelta === null ? [] : [{ targetId: target.id, velocityDelta }];
    });
  }

  public advance(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    for (let index = this.visuals.length - 1; index >= 0; index -= 1) {
      const visual = this.visuals[index];
      if (visual === undefined) continue;
      const position = this.ownerPosition?.(visual.ownerId);
      if (position !== undefined && finitePosition(position))
        this.positionVisual(visual.mesh, position);
      visual.elapsed += dt;
      const ratio = THREE.MathUtils.clamp(visual.elapsed / C.visualSeconds, 0, 1);
      const radius = THREE.MathUtils.lerp(0.65, C.radius, ratio);
      visual.mesh.scale.setScalar(radius / VISUAL_BASE_RADIUS);
      visual.mesh.material.opacity = 0.82 * (1 - ratio);
      if (ratio >= 1) {
        this.visuals.splice(index, 1);
        this.group.remove(visual.mesh);
        this.disposeVisual(visual);
      }
    }
  }

  public pendingCount(): number {
    return this.pending.length;
  }

  public visualCount(): number {
    return this.visuals.length;
  }

  public reset(): void {
    this.pending.length = 0;
    while (this.visuals.length > 0) {
      const visual = this.visuals.pop();
      if (visual === undefined) continue;
      this.group.remove(visual.mesh);
      this.disposeVisual(visual);
    }
  }

  public dispose(): void {
    this.reset();
    this.group.clear();
  }

  private createVisual(ownerId: string, center: THREE.Vector3): ShockwaveVisual {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.72, VISUAL_BASE_RADIUS, 48),
      new THREE.MeshBasicMaterial({
        color: 0x9cecff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    );
    mesh.name = `shockwave-pulse-${String(this.visualSerial++)}`;
    this.positionVisual(mesh, center);
    mesh.scale.setScalar(0.65 / VISUAL_BASE_RADIUS);
    return { ownerId, mesh, elapsed: 0 };
  }

  private positionVisual(mesh: ShockwaveVisual['mesh'], center: THREE.Vector3): void {
    mesh.rotation.set(-Math.PI / 2, 0, 0);
    mesh.position.copy(center);
    // Presentation only: the pulse queue retains the original kart center.
    // Subtracting a chassis offset can bury the ring below the visible road.
    const surface = this.groundSurface?.(center);
    if (surface != null) {
      mesh.position.copy(surface.point).addScaledVector(surface.normal, 0.08);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), surface.normal);
    }
  }

  private disposeVisual(visual: ShockwaveVisual): void {
    visual.mesh.geometry.dispose();
    visual.mesh.material.dispose();
  }
}
