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

/** Original procedural rear exhaust and pulse treatment for Nitro Overdrive. */
export class NitroOverdriveVisual {
  public readonly group = new THREE.Group();
  private readonly exhaust: THREE.Mesh[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly windowRing: THREE.Mesh;
  private readonly pulseRing: THREE.Mesh;

  public constructor() {
    this.group.name = 'NitroOverdriveVisual';
    this.group.visible = false;

    for (const x of [-0.48, 0.48]) {
      const outerGeometry = new THREE.ConeGeometry(0.22, 1.25, 10);
      const outerMaterial = additiveMaterial(0x56e6ff, 0.8);
      const outer = new THREE.Mesh(outerGeometry, outerMaterial);
      outer.rotation.x = -Math.PI / 2;
      outer.position.set(x, 0.08, -1.5);

      const coreGeometry = new THREE.ConeGeometry(0.1, 0.84, 8);
      const coreMaterial = additiveMaterial(0xfff1a4, 0.96);
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.rotation.x = -Math.PI / 2;
      core.position.set(x, 0.08, -1.43);

      this.geometries.push(outerGeometry, coreGeometry);
      this.materials.push(outerMaterial, coreMaterial);
      this.exhaust.push(outer, core);
      this.group.add(outer, core);
    }

    const windowRingGeometry = new THREE.TorusGeometry(0.82, 0.045, 6, 32);
    const windowRingMaterial = additiveMaterial(0x80f4ff, 0.58);
    this.windowRing = new THREE.Mesh(windowRingGeometry, windowRingMaterial);
    this.windowRing.position.set(0, 0.14, -1.92);
    this.geometries.push(windowRingGeometry);
    this.materials.push(windowRingMaterial);
    this.group.add(this.windowRing);

    const pulseRingGeometry = new THREE.TorusGeometry(1.04, 0.075, 7, 36);
    const pulseRingMaterial = additiveMaterial(0xffdf78, 0.92);
    this.pulseRing = new THREE.Mesh(pulseRingGeometry, pulseRingMaterial);
    this.pulseRing.position.set(0, 0.16, -2.02);
    this.pulseRing.visible = false;
    this.geometries.push(pulseRingGeometry);
    this.materials.push(pulseRingMaterial);
    this.group.add(this.pulseRing);

    const glow = new THREE.PointLight(0x5de8ff, 2.6, 5.6, 2);
    glow.position.set(0, 0.24, -1.18);
    this.group.add(glow);
  }

  public update(windowActive: boolean, pulseActive: boolean, elapsedSeconds: number): void {
    this.group.visible = windowActive;
    this.pulseRing.visible = windowActive && pulseActive;
    if (!windowActive) return;

    const exhaustPulse = 1 + Math.sin(elapsedSeconds * 30) * 0.14;
    for (const flame of this.exhaust) flame.scale.y = exhaustPulse;
    const ringPulse = 0.96 + Math.sin(elapsedSeconds * 18) * 0.07;
    this.windowRing.scale.setScalar(ringPulse);
    this.windowRing.rotation.z = elapsedSeconds * 2.4;
    if (pulseActive) {
      const burst = 1.04 + Math.sin(elapsedSeconds * 42) * 0.12;
      this.pulseRing.scale.setScalar(burst);
      this.pulseRing.rotation.z = -elapsedSeconds * 3.6;
    }
  }

  public dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.group.clear();
    this.group.visible = false;
  }
}
