import * as THREE from 'three';
import type { ProjectileSnapshot, ProjectileTarget } from './ProjectileSystem';
import { SEEKER_GUIDANCE } from './itemDefinitions';

export type SeekerWarningLevel = 1 | 2 | 3;
export interface SeekerThreat {
  targetId: string;
  level: SeekerWarningLevel;
  arrivalSeconds: number;
}

export function seekerThreats(
  shots: readonly ProjectileSnapshot[],
  targets: readonly ProjectileTarget[],
): SeekerThreat[] {
  const threats = new Map<string, SeekerThreat>();
  for (const shot of shots) {
    if (shot.itemId !== 'seeker-drone') continue;
    const target = targets.find((racer) => racer.id === shot.targetId && !racer.finished);
    if (target === undefined) continue;
    const toward = target.position.clone().sub(shot.position).setY(0);
    const distance = toward.length();
    toward.normalize();
    const closing = shot.velocity
      .clone()
      .sub(target.velocity ?? new THREE.Vector3())
      .dot(toward);
    const arrivalSeconds = distance / Math.max(1, closing);
    const level: SeekerWarningLevel =
      arrivalSeconds <= SEEKER_GUIDANCE.warningUrgentSeconds
        ? 3
        : arrivalSeconds <= SEEKER_GUIDANCE.warningNearSeconds
          ? 2
          : 1;
    const previous = threats.get(target.id);
    if (previous === undefined || arrivalSeconds < previous.arrivalSeconds)
      threats.set(target.id, { targetId: target.id, level, arrivalSeconds });
  }
  return [...threats.values()];
}

export class SeekerWarningVisual {
  public readonly group = new THREE.Group();
  private readonly markers = new Map<
    string,
    THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  >();

  public update(
    threats: readonly SeekerThreat[],
    targets: readonly ProjectileTarget[],
    time: number,
  ): void {
    for (const [id, marker] of this.markers) {
      if (threats.some((threat) => threat.targetId === id)) continue;
      this.group.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
      this.markers.delete(id);
    }
    for (const threat of threats) {
      const target = targets.find((racer) => racer.id === threat.targetId);
      if (target === undefined) continue;
      let marker = this.markers.get(target.id);
      if (marker === undefined) {
        marker = new THREE.Mesh(
          new THREE.TorusGeometry(1.25, 0.06, 6, 32),
          new THREE.MeshBasicMaterial({ color: 0xffc66d, transparent: true, depthWrite: false }),
        );
        marker.rotation.x = Math.PI / 2;
        this.group.add(marker);
        this.markers.set(target.id, marker);
      }
      marker.position.copy(target.position).add(new THREE.Vector3(0, 1.5, 0));
      marker.material.color.setHex(threat.level === 3 ? 0xff536e : 0xffc66d);
      const pulse = 0.5 + 0.5 * Math.sin(time * threat.level * 6);
      marker.scale.setScalar(0.9 + pulse * 0.25);
      marker.material.opacity = 0.5 + pulse * 0.5;
    }
  }

  public dispose(): void {
    this.update([], [], 0);
  }
}
