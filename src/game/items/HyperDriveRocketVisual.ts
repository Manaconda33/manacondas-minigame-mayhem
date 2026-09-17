import * as THREE from 'three';
import type { HyperDriveRocketSnapshot } from './HyperDriveRocket';

function additiveMaterial(color: number, opacity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

/** Original procedural rocket shell, fins, exhaust, and return fade. */
export class HyperDriveRocketVisual {
  public readonly group = new THREE.Group();
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly exhaust: THREE.Mesh[] = [];
  private readonly fins: THREE.Mesh[] = [];
  private readonly ring: THREE.Mesh;
  private readonly nose: THREE.Mesh;

  public constructor() {
    this.group.name = 'HyperDriveRocketVisual';
    this.group.visible = false;

    const shellGeometry = new THREE.ConeGeometry(0.48, 1.7, 12);
    const shellMaterial = additiveMaterial(0x70eaff, 0.72);
    this.nose = new THREE.Mesh(shellGeometry, shellMaterial);
    this.nose.rotation.x = -Math.PI / 2;
    this.nose.position.set(0, 0.18, 0.78);
    this.geometries.push(shellGeometry);
    this.materials.push(shellMaterial);
    this.group.add(this.nose);

    for (const x of [-0.44, 0.44]) {
      const finGeometry = new THREE.ConeGeometry(0.14, 0.72, 5);
      const finMaterial = additiveMaterial(0xffd56e, 0.82);
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      fin.rotation.x = -Math.PI / 2;
      fin.position.set(x, 0.08, 0.05);
      fin.scale.x = 0.8;
      this.geometries.push(finGeometry);
      this.materials.push(finMaterial);
      this.fins.push(fin);
      this.group.add(fin);
    }

    for (const x of [-0.33, 0.33]) {
      const outerGeometry = new THREE.ConeGeometry(0.2, 1.3, 10);
      const outerMaterial = additiveMaterial(0x4fe1ff, 0.9);
      const outer = new THREE.Mesh(outerGeometry, outerMaterial);
      outer.rotation.x = Math.PI / 2;
      outer.position.set(x, 0.1, -1.05);
      const coreGeometry = new THREE.ConeGeometry(0.09, 0.9, 8);
      const coreMaterial = additiveMaterial(0xfff0a3, 0.98);
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.rotation.x = Math.PI / 2;
      core.position.set(x, 0.1, -0.98);
      this.geometries.push(outerGeometry, coreGeometry);
      this.materials.push(outerMaterial, coreMaterial);
      this.exhaust.push(outer, core);
      this.group.add(outer, core);
    }

    const ringGeometry = new THREE.TorusGeometry(0.88, 0.05, 7, 36);
    const ringMaterial = additiveMaterial(0xa9f5ff, 0.68);
    this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ring.position.set(0, 0.13, 0.1);
    this.geometries.push(ringGeometry);
    this.materials.push(ringMaterial);
    this.group.add(this.ring);

    const glow = new THREE.PointLight(0x53e5ff, 3.8, 6, 2);
    glow.position.set(0, 0.24, -0.75);
    this.group.add(glow);
  }

  public update(snapshot: HyperDriveRocketSnapshot, elapsedSeconds: number): void {
    this.group.visible = snapshot.active;
    if (!snapshot.active) return;

    const fade = 0.34 + snapshot.autopilotWeight * 0.66;
    (this.nose.material as THREE.MeshBasicMaterial).opacity = 0.72 * fade;
    for (const fin of this.fins) (fin.material as THREE.MeshBasicMaterial).opacity = 0.82 * fade;
    for (const exhaust of this.exhaust)
      (exhaust.material as THREE.MeshBasicMaterial).opacity = 0.9 * fade;
    (this.ring.material as THREE.MeshBasicMaterial).opacity = 0.68 * fade;
    const flamePulse = 0.92 + Math.sin(elapsedSeconds * 38) * 0.14;
    for (const flame of this.exhaust) flame.scale.y = flamePulse;
    this.ring.scale.setScalar(0.95 + Math.sin(elapsedSeconds * 19) * 0.08);
    this.ring.rotation.z = elapsedSeconds * 3.2;
  }

  public dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.group.clear();
    this.group.visible = false;
  }
}
