import * as THREE from 'three';

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

export class NitroSurgeVisual {
  public readonly group = new THREE.Group();
  private readonly flames: THREE.Mesh[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly wakeRing: THREE.Mesh;

  public constructor() {
    this.group.name = 'NitroSurgeVisual';
    this.group.visible = false;
    for (const x of [-0.48, 0.48]) {
      const outerGeometry = new THREE.ConeGeometry(0.2, 1.05, 10);
      const outerMaterial = additiveMaterial(0x43d9ff, 0.82);
      const outer = new THREE.Mesh(outerGeometry, outerMaterial);
      outer.rotation.x = -Math.PI / 2;
      outer.position.set(x, 0.08, -1.52);

      const coreGeometry = new THREE.ConeGeometry(0.095, 0.72, 8);
      const coreMaterial = additiveMaterial(0xfff2a8, 0.95);
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.rotation.x = -Math.PI / 2;
      core.position.set(x, 0.08, -1.43);

      this.geometries.push(outerGeometry, coreGeometry);
      this.materials.push(outerMaterial, coreMaterial);
      this.flames.push(outer, core);
      this.group.add(outer, core);
    }

    const ringGeometry = new THREE.TorusGeometry(0.82, 0.045, 6, 28);
    const ringMaterial = additiveMaterial(0x79ebff, 0.68);
    this.wakeRing = new THREE.Mesh(ringGeometry, ringMaterial);
    this.wakeRing.position.set(0, 0.12, -1.98);
    this.geometries.push(ringGeometry);
    this.materials.push(ringMaterial);
    this.group.add(this.wakeRing);

    const glow = new THREE.PointLight(0x4fdcff, 2.2, 5.2, 2);
    glow.position.set(0, 0.22, -1.15);
    this.group.add(glow);
  }

  public update(active: boolean, elapsedSeconds: number): void {
    this.group.visible = active;
    if (!active) return;
    const flamePulse = 0.92 + Math.sin(elapsedSeconds * 34) * 0.12;
    for (const flame of this.flames) flame.scale.y = flamePulse;
    const ringPulse = 0.94 + Math.sin(elapsedSeconds * 22) * 0.08;
    this.wakeRing.scale.setScalar(ringPulse);
    this.wakeRing.rotation.z = elapsedSeconds * 2.8;
  }

  public dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.group.clear();
    this.group.visible = false;
  }
}
