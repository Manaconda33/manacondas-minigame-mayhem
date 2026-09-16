import * as THREE from 'three';

function energyMaterial(color: number, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function disposeObject(object: THREE.Object3D): void {
  object.removeFromParent();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  object.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const mesh = node as THREE.Mesh;
    geometries.add(mesh.geometry);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
      materials.add(material);
  });
  geometries.forEach((geometry) => {
    geometry.dispose();
  });
  materials.forEach((material) => {
    material.dispose();
  });
  object.clear();
}

/** Original procedural double-headed Hammer model and a short world-space trail. */
export class ArcHammerVisual {
  public readonly hammer = new THREE.Group();
  public readonly trail: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  private readonly points: THREE.Vector3[] = [];
  private readonly positions = new Float32Array(8 * 2 * 3);

  public constructor() {
    this.hammer.name = 'arc-hammer-double-headed';

    const graphite = new THREE.MeshStandardMaterial({
      color: 0x202b3b,
      metalness: 0.82,
      roughness: 0.28,
    });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.66, 8), graphite);
    handle.name = 'arc-hammer-graphite-handle';
    handle.rotation.z = Math.PI / 2;
    this.hammer.add(handle);

    const core = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.18), graphite);
    core.name = 'arc-hammer-graphite-core';
    this.hammer.add(core);

    const cyanHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.25, 0.2),
      energyMaterial(0x49e9ff),
    );
    cyanHead.name = 'arc-hammer-cyan-edge';
    cyanHead.position.x = -0.38;
    this.hammer.add(cyanHead);

    const amberHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.25, 0.2),
      energyMaterial(0xffc45e),
    );
    amberHead.name = 'arc-hammer-amber-edge';
    amberHead.position.x = 0.38;
    this.hammer.add(amberHead);

    const hub = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.018, 6, 16),
      energyMaterial(0x9ff8ff, 0.7),
    );
    hub.name = 'arc-hammer-energy-hub';
    hub.rotation.y = Math.PI / 2;
    this.hammer.add(hub);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    const indices: number[] = [];
    for (let index = 0; index < 7; index += 1)
      indices.push(
        index * 2,
        index * 2 + 1,
        index * 2 + 2,
        index * 2 + 1,
        index * 2 + 3,
        index * 2 + 2,
      );
    geometry.setIndex(indices);
    geometry.setDrawRange(0, 0);
    this.trail = new THREE.Mesh(geometry, energyMaterial(0x61eaff, 0.42));
    this.trail.name = 'arc-hammer-finite-trail';
    this.trail.frustumCulled = false;
  }

  public update(position: THREE.Vector3, velocity: THREE.Vector3, dt: number): void {
    if (dt > 0) this.hammer.rotation.z += dt * 24;
    const sample = this.points.length === 8 ? this.points.pop() : new THREE.Vector3();
    if (sample) this.points.unshift(sample.copy(position));
    const direction = velocity.clone();
    if (direction.lengthSq() < 1e-8) direction.set(0, 1, 0);
    else direction.normalize();
    const side = new THREE.Vector3(-direction.z, 0, direction.x);
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
    else side.normalize();

    for (let index = 0; index < this.points.length; index += 1) {
      const point = this.points[index];
      if (!point) continue;
      const width = 0.11 * (1 - index / 8);
      this.positions.set(
        [
          point.x + side.x * width,
          point.y + side.y * width,
          point.z + side.z * width,
          point.x - side.x * width,
          point.y - side.y * width,
          point.z - side.z * width,
        ],
        index * 6,
      );
    }
    this.trail.geometry.getAttribute('position').needsUpdate = true;
    this.trail.geometry.setDrawRange(0, Math.max(0, (this.points.length - 1) * 6));
  }

  public dispose(): void {
    disposeObject(this.hammer);
    disposeObject(this.trail);
    this.points.length = 0;
  }
}

interface HammerCue {
  readonly group: THREE.Group;
  remainingSeconds: number;
}

/** Finite bounce/impact cues kept separate from the live Hammer mesh lifecycle. */
export class ArcHammerCues {
  public readonly group = new THREE.Group();
  private readonly cues: HammerCue[] = [];

  public constructor() {
    this.group.name = 'arc-hammer-cues';
  }

  public emitBounce(position: THREE.Vector3): void {
    if (this.cues.length >= 40) return;
    const cue = new THREE.Group();
    cue.name = 'arc-hammer-bounce-ring';
    cue.position.copy(position);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.16, 0.34, 24),
      energyMaterial(0x6beaff, 0.9),
    );
    ring.rotation.x = -Math.PI / 2;
    cue.add(ring);
    for (let index = 0; index < 6; index += 1) {
      const spark = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.045),
        energyMaterial(index % 2 ? 0xffc45e : 0x6beaff),
      );
      const angle = (index / 6) * Math.PI * 2;
      spark.position.set(Math.cos(angle) * 0.25, 0.08 + (index % 2) * 0.04, Math.sin(angle) * 0.25);
      cue.add(spark);
    }
    this.add(cue, 0.2);
  }

  public emitImpact(position: THREE.Vector3): void {
    if (this.cues.length >= 40) return;
    const cue = new THREE.Group();
    cue.name = 'arc-hammer-impact-flash';
    cue.position.copy(position);
    cue.add(
      new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), energyMaterial(0xffd27a, 0.9)),
      new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 20), energyMaterial(0x65edff, 0.82)),
    );
    this.add(cue, 0.14);
  }

  public update(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    for (let index = this.cues.length - 1; index >= 0; index -= 1) {
      const cue = this.cues[index];
      if (!cue) continue;
      cue.remainingSeconds = Math.max(0, cue.remainingSeconds - dt);
      const ratio = cue.remainingSeconds / 0.2;
      cue.group.scale.setScalar(1 + (1 - ratio) * 1.7);
      cue.group.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshBasicMaterial) material.opacity = Math.max(0, ratio);
        });
      });
      if (cue.remainingSeconds > 0) continue;
      disposeObject(cue.group);
      this.cues.splice(index, 1);
    }
  }

  public count(): number {
    return this.cues.length;
  }

  public dispose(): void {
    this.cues.forEach(({ group }) => {
      disposeObject(group);
    });
    this.cues.length = 0;
    this.group.clear();
  }

  private add(group: THREE.Group, lifetime: number): void {
    this.group.add(group);
    this.cues.push({ group, remainingSeconds: lifetime });
  }
}
