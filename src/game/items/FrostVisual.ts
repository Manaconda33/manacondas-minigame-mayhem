import * as THREE from 'three';
import { FROST } from './FrostOrbs';

export function frostCrystal(radius: number, color = 0x9ae5ff): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.OctahedronGeometry(radius),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false }),
  );
}

/** One small following fleck cluster per affected racer, released at expiry. */
export class FrostVisual {
  public readonly group = new THREE.Group();
  private readonly clusters = new Map<string, THREE.Group>();
  private time = 0;
  public update(
    targets: readonly { id: string; position: THREE.Vector3; remaining: number }[],
    dt: number,
  ): void {
    this.time += Math.max(0, dt);
    const active = new Set<string>();
    for (const target of targets) {
      if (target.remaining <= 0) continue;
      active.add(target.id);
      let cluster = this.clusters.get(target.id);
      if (!cluster) {
        cluster = new THREE.Group();
        cluster.name = 'frost-flecks-' + target.id;
        for (let i = 0; i < 8; i++) {
          const fleck = frostCrystal(0.06, i % 2 ? 0xffffff : 0x9ae5ff);
          fleck.position.set(
            Math.cos((i * Math.PI) / 4) * 0.9,
            0.35 + (i % 3) * 0.3,
            Math.sin((i * Math.PI) / 4) * 1.1,
          );
          cluster.add(fleck);
        }
        this.group.add(cluster);
        this.clusters.set(target.id, cluster);
      }
      cluster.position.copy(target.position);
      cluster.rotation.y = this.time * 1.5;
      for (const child of cluster.children) {
        const mesh = child as THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>;
        mesh.rotation.z = this.time * 2;
        mesh.material.opacity = 0.7 * Math.min(1, target.remaining / (FROST.duration * 0.25));
      }
    }
    for (const [id, cluster] of this.clusters) {
      if (active.has(id)) continue;
      cluster.removeFromParent();
      disposeFrostGroup(cluster);
      this.clusters.delete(id);
    }
  }
  public dispose(): void {
    this.update([], 0);
    this.time = 0;
  }
}

export function disposeFrostGroup(group: THREE.Group): void {
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const mesh = object as THREE.Mesh;
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      material.dispose();
    });
  });
  group.clear();
}
