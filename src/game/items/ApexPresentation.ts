import * as THREE from 'three';
import type { ApexSnapshot, ApexTarget } from './ApexMissileSystem';
import { APEX_CONFIG } from './itemDefinitions';

/** Original procedural forms; fixed mesh count, race-time animation and explicit disposal. */
export class ApexPresentation {
  public readonly group = new THREE.Group();
  private readonly missile = new THREE.Group();
  private readonly marker = new THREE.Mesh(
    new THREE.TorusGeometry(1.65, 0.09, 6, 32),
    new THREE.MeshBasicMaterial({ color: 0xd9a2ff, transparent: true, depthWrite: false }),
  );
  private readonly trail = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 4, 6),
    new THREE.MeshBasicMaterial({
      color: 0xcba0ff,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    }),
  );
  private readonly blast = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1, 40),
    new THREE.MeshBasicMaterial({
      color: 0xedbdff,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  private blastRemaining = 0;
  private time = 0;

  public constructor() {
    this.group.name = 'apex-presentation';
    const hull = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.8),
      new THREE.MeshBasicMaterial({ color: 0xb988ff }),
    );
    hull.scale.set(0.65, 1.7, 0.65);
    const fins = new THREE.Mesh(
      new THREE.TorusGeometry(0.75, 0.13, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xffe6ff }),
    );
    fins.rotation.x = Math.PI / 2;
    this.missile.add(hull, fins, this.trail);
    this.marker.rotation.x = this.blast.rotation.x = -Math.PI / 2;
    this.group.add(this.missile, this.marker, this.blast);
    this.update(null, [], [], 0);
  }

  public update(
    shot: ApexSnapshot | null,
    targets: readonly ApexTarget[],
    blasts: readonly THREE.Vector3[],
    dt: number,
  ): void {
    this.time += Math.max(0, dt);
    this.blastRemaining = Math.max(0, this.blastRemaining - Math.max(0, dt));
    const newBlast = blasts.at(-1);
    if (newBlast !== undefined) {
      this.blastRemaining = 0.45;
      this.blast.position.copy(newBlast).y += 0.12;
    }
    this.blast.visible = this.blastRemaining > 0;
    this.blast.scale.setScalar(APEX_CONFIG.blastRadius * (1 - (0.65 * this.blastRemaining) / 0.45));
    this.blast.material.opacity = this.blastRemaining / 0.45;
    this.missile.visible = shot !== null;
    if (shot !== null) {
      this.missile.position.copy(shot.position);
      this.missile.rotation.y = this.time * 4;
      this.trail.visible = shot.phase === 'rise' || shot.phase === 'dive';
      this.trail.position.y = shot.phase === 'dive' ? 2.4 : -2.4;
      this.trail.rotation.z = shot.phase === 'dive' ? 0 : Math.PI;
    }
    const target = targets.find((racer) => racer.id === shot?.targetId && !racer.finished);
    this.marker.visible = target !== undefined;
    if (target !== undefined) {
      this.marker.position.copy(target.position).y += 2.3;
      const urgent = shot?.phase === 'dive';
      const pulse = 0.5 + 0.5 * Math.sin(this.time * (urgent ? 24 : 10));
      this.marker.scale.setScalar(0.9 + pulse * 0.2);
      this.marker.material.opacity = 0.5 + pulse * 0.5;
      this.marker.material.color.setHex(urgent ? 0xff6ba6 : 0xd9a2ff);
    }
  }

  public dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const mesh = object as THREE.Mesh;
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material: THREE.Material) => {
        material.dispose();
      });
    });
    this.group.clear();
    this.blastRemaining = 0;
  }
}
