import * as THREE from 'three';

const CYAN = new THREE.Color(0x66ffff);
const PALETTE = [0x66ffff, 0xa77dff, 0xff8ed7, 0xffd66b].map((color) => new THREE.Color(color));
function chromatic(color: THREE.Color, phase: number): void {
  const index = (((phase % 1) + 1) % 1) * PALETTE.length;
  color
    .copy(PALETTE[Math.floor(index)] ?? CYAN)
    .lerp(PALETTE[(Math.floor(index) + 1) % PALETTE.length] ?? CYAN, index % 1);
}

/** Fixed-size procedural pool; simulation time owns every animation. */
export class PrismaticVisual {
  public readonly group = new THREE.Group();
  public readonly shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x94ffff,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    }),
  );
  private readonly edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(this.shell.geometry),
    new THREE.LineBasicMaterial({
      color: 0xaaffff,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    }),
  );
  private readonly particles = Array.from({ length: 18 }, () => ({
    mesh: new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    ),
    age: 1,
  }));
  private time = 0;
  private shimmer = 0;
  private emission = 0;
  private cursor = 0;
  private active = false;

  public constructor() {
    this.group.name = 'prismatic-visual';
    this.shell.add(this.edges);
    this.shell.scale.set(2, 1.5, 2.4);
    this.group.add(this.shell, ...this.particles.map((p) => p.mesh));
    this.group.visible = false;
  }

  public blocked(): void {
    if (this.shimmer <= 0) this.shimmer = 0.25;
  }

  public update(remaining: number, position: THREE.Vector3, dt: number): void {
    if (remaining <= 0) {
      this.clear();
      return;
    }
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.group.visible = true;
    if (!this.active) this.time = 0;
    this.active = true;
    this.time += dt;
    this.shimmer = Math.max(0, this.shimmer - dt);
    const fade = Math.min(1, remaining) * Math.min(1, this.time / 0.18);
    const hue = (0.5 + this.time * 0.12) % 1;
    this.shell.position.copy(position).y += 1.35;
    this.shell.rotation.y = this.time * 0.35;
    chromatic(this.shell.material.color, hue);
    chromatic(this.edges.material.color, hue + 0.15);
    this.shell.material.opacity =
      fade * (0.075 + 0.025 * Math.sin(this.time * 3) + this.shimmer * 0.3);
    this.edges.material.opacity = fade * (0.3 + this.shimmer);
    this.emission += dt;
    if (this.emission >= 0.04) {
      this.emission %= 0.04;
      const particle = this.particles[this.cursor++ % this.particles.length];
      if (!particle) return;
      particle.age = 0;
      particle.mesh.position.copy(position).y += 0.55;
      particle.mesh.position.x += Math.sin(this.cursor * 2.4) * 0.65;
      chromatic(particle.mesh.material.color, hue + this.cursor * 0.08);
    }
    for (const particle of this.particles) {
      particle.age += dt;
      particle.mesh.visible = particle.age < 0.65;
      particle.mesh.material.opacity = fade * Math.max(0, 1 - particle.age / 0.65) * 0.65;
      particle.mesh.position.y += dt * 0.2;
      particle.mesh.rotation.y += dt * 2;
    }
  }

  public clear(): void {
    this.group.visible = false;
    this.active = false;
    this.shimmer = this.emission = this.time = 0;
    for (const p of this.particles) {
      p.age = 1;
      p.mesh.visible = false;
    }
  }

  public dispose(): void {
    this.clear();
    for (const object of [this.shell, this.edges, ...this.particles.map((p) => p.mesh)]) {
      object.geometry.dispose();
      object.material.dispose();
    }
    this.group.removeFromParent();
    this.group.clear();
  }
}
