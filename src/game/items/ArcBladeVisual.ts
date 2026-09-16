import * as THREE from 'three';
import type { ArcPhase } from './ArcBlade';

function energy(color: number, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}
function dispose(group: THREE.Object3D): void {
  group.removeFromParent();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  group.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const mesh = node as THREE.Mesh;
    geometries.add(mesh.geometry);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
      materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  group.clear();
}

/** Three bent energy segments, horizontal rotation and a short world-space ribbon. */
export class ArcBladeVisual {
  public readonly blade = new THREE.Group();
  public readonly trail: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  private readonly accent: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  private readonly points: THREE.Vector3[] = [];
  private readonly positions = new Float32Array(10 * 2 * 3);

  public constructor() {
    this.blade.name = 'arc-three-segment-blade';
    for (let i = 0; i < 3; i++) {
      const shape = new THREE.Shape();
      shape.moveTo(0.03, 0);
      shape.lineTo(0.19, -0.11);
      shape.lineTo(0.32, 0.01);
      shape.lineTo(0.12, -0.015);
      shape.lineTo(0.065, 0.07);
      shape.closePath();
      const wing = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        energy(i === 1 ? 0x65f6ff : 0xad70ff),
      );
      wing.rotation.x = -Math.PI / 2;
      const segment = new THREE.Group();
      segment.rotation.y = (i * Math.PI * 2) / 3;
      segment.add(wing);
      this.blade.add(segment);
    }
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.065), energy(0xf5eaff));
    this.accent = new THREE.Mesh(
      new THREE.TorusGeometry(0.105, 0.02, 5, 20),
      energy(0x70efff, 0.35),
    );
    this.accent.name = 'arc-return-accent';
    this.accent.rotation.x = Math.PI / 2;
    this.blade.add(core, this.accent);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    const indices: number[] = [];
    for (let i = 0; i < 9; i++)
      indices.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    geometry.setIndex(indices);
    geometry.setDrawRange(0, 0);
    this.trail = new THREE.Mesh(geometry, energy(0x9874ff, 0.45));
    this.trail.name = 'arc-ribbon-trail';
    this.trail.frustumCulled = false;
  }

  public update(position: THREE.Vector3, phase: ArcPhase, dt: number): void {
    this.accent.material.opacity = phase === 'return' ? 1 : 0.35;
    this.accent.material.color.setHex(phase === 'return' ? 0xffffff : 0x70efff);
    this.trail.material.color.setHex(phase === 'return' ? 0x65f6ff : 0x9874ff);
    if (dt <= 0) return;
    this.blade.rotation.y += dt * 28;
    const sample = this.points.length === 10 ? this.points.pop() : new THREE.Vector3();
    if (sample) this.points.unshift(sample.copy(position));
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      if (!point) continue;
      const next = this.points[i + 1];
      const previous = this.points[i - 1] ?? point;
      const dx = next ? point.x - next.x : previous.x - point.x;
      const dz = next ? point.z - next.z : previous.z - point.z;
      const width = (0.07 * (1 - i / 9)) / (Math.hypot(dx, dz) || 1);
      this.positions.set(
        [
          point.x + dz * width,
          point.y,
          point.z - dx * width,
          point.x - dz * width,
          point.y,
          point.z + dx * width,
        ],
        i * 6,
      );
    }
    this.trail.geometry.getAttribute('position').needsUpdate = true;
    this.trail.geometry.setDrawRange(0, Math.max(0, (this.points.length - 1) * 6));
  }

  public dispose(): void {
    dispose(this.blade);
    dispose(this.trail);
    this.points.length = 0;
  }
}

export class ArcBladeFlashes {
  public readonly group = new THREE.Group();
  private readonly flashes: { group: THREE.Group; remaining: number }[] = [];
  public constructor() {
    this.group.name = 'arc-hit-and-catch-flashes';
  }
  public emit(position: THREE.Vector3, caught: boolean): void {
    if (this.flashes.length >= 40) return;
    const group = new THREE.Group();
    group.name = caught ? 'arc-catch-flash' : 'arc-hit-sparks';
    group.position.copy(position);
    const geometry = new THREE.OctahedronGeometry(caught ? 0.07 : 0.05);
    const violet = energy(0x9e7fff);
    const cyan = energy(0xb9ffff);
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(geometry, i % 2 ? violet : cyan);
      const angle = (i * Math.PI * 2) / 6;
      mesh.position.set(Math.sin(angle) * 0.25, (i % 2) * 0.08, Math.cos(angle) * 0.25);
      group.add(mesh);
    }
    this.group.add(group);
    this.flashes.push({ group, remaining: 0.18 });
  }
  public update(dt: number): void {
    if (dt <= 0) return;
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const flash = this.flashes[i];
      if (!flash) continue;
      flash.remaining = Math.max(0, flash.remaining - dt);
      flash.group.scale.setScalar(1 + (1 - flash.remaining / 0.18) * 1.5);
      flash.group.traverse((node) => {
        if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshBasicMaterial)
          node.material.opacity = flash.remaining / 0.18;
      });
      if (flash.remaining > 0) continue;
      dispose(flash.group);
      this.flashes.splice(i, 1);
    }
  }
  public dispose(): void {
    this.flashes.forEach((flash) => {
      dispose(flash.group);
    });
    this.flashes.length = 0;
  }
}
