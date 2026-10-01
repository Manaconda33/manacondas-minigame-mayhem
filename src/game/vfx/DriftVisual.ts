import * as THREE from 'three';
import { graphicsQualityProfile, type GraphicsQuality } from '../../config/graphicsQuality';
import type { DriftTier, KartFeedback } from '../physics/KartController';

export interface DriftEmitter {
  id: string;
  feedback: KartFeedback;
  kartWorld: THREE.Matrix4;
  active: boolean;
}
interface EmissionState {
  emission: number;
  previousTier: DriftTier;
  previousDrifting: boolean;
}
interface Particle {
  owner: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifetime: number;
  color: number;
  width: number;
  length: number;
}
const COLORS = { blue: 0x38bdf8, orange: 0xff8a28, purple: 0xa855f7 } as const;
const UP = new THREE.Vector3(0, 1, 0);

/** Drift presentation for one kart or a shared bounded set of racers. One bounded world-space batch, independent of gameplay RNG. */
export class DriftVisual {
  public readonly group = new THREE.Group();
  private readonly mesh: THREE.InstancedMesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>;
  private readonly pool: Particle[];
  private readonly dummy = new THREE.Object3D();
  private readonly color = new THREE.Color();
  private readonly direction = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly playerState: EmissionState = {
    emission: 0,
    previousTier: 'none',
    previousDrifting: false,
  };
  private readonly emitters = new Map<string, EmissionState>();
  private owner = 'player';
  private emissionScale = 1;
  private randomState = 0x619a43;
  private disposed = false;

  public constructor(quality: GraphicsQuality) {
    const capacity = graphicsQualityProfile(quality).driftParticleCapacity;
    this.pool = Array.from({ length: capacity }, () => ({
      owner: 'player',
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      age: 0,
      lifetime: 0,
      color: COLORS.blue,
      width: 0,
      length: 0,
    }));
    this.mesh = new THREE.InstancedMesh(
      new THREE.ConeGeometry(1, 1, 4, 1),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      capacity,
    );
    this.mesh.name = 'drift-spark-pool';
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.count = 0;
    // Positions are world-space, and the small pool can span a trail beyond the kart's bounds.
    this.mesh.frustumCulled = false;
    this.group.name = 'DriftVisual';
    this.group.visible = false;
    this.group.add(this.mesh);
  }

  public update(
    feedback: KartFeedback,
    kartWorld: THREE.Matrix4,
    seconds: number,
    enabled = true,
  ): void {
    if (!this.prepare(seconds, enabled)) return;
    this.advance(Math.min(seconds, 0.1));
    this.owner = 'player';
    this.emissionScale = 1;
    this.emit(feedback, kartWorld, Math.min(seconds, 0.1), this.playerState, true);
    this.draw();
  }

  public updateEmitters(emitters: readonly DriftEmitter[], seconds: number, enabled = true): void {
    if (!this.prepare(seconds, enabled)) return;
    const dt = Math.min(seconds, 0.1);
    this.advance(dt);
    let activeCount = 0;
    for (const emitter of emitters) if (emitter.active) activeCount++;
    this.emissionScale = 1 / Math.max(1, activeCount);
    for (const emitter of emitters) {
      let state = this.emitters.get(emitter.id);
      if (state === undefined) {
        state = { emission: 0, previousTier: 'none', previousDrifting: false };
        this.emitters.set(emitter.id, state);
      }
      this.owner = emitter.id;
      this.emit(emitter.feedback, emitter.kartWorld, dt, state, emitter.active);
    }
    this.draw();
  }

  public clearEmitter(id: string): void {
    this.emitters.delete(id);
    for (const p of this.pool) if (p.owner === id) p.lifetime = 0;
    this.draw();
  }

  private prepare(seconds: number, enabled: boolean): boolean {
    if (this.disposed) return false;
    if (!enabled) {
      this.clear();
      return false;
    }
    return Number.isFinite(seconds) && seconds > 0;
  }

  private advance(dt: number): void {
    for (const particle of this.pool) {
      if (particle.age >= particle.lifetime) continue;
      particle.age += dt;
      particle.position.addScaledVector(particle.velocity, dt);
      particle.velocity.y -= dt * 2.2;
    }
  }

  private emit(
    feedback: KartFeedback,
    kartWorld: THREE.Matrix4,
    dt: number,
    state: EmissionState,
    active: boolean,
  ): void {
    this.forward.set(0, 0, 1).transformDirection(kartWorld);
    this.right.set(1, 0, 0).transformDirection(kartWorld);
    const tier = feedback.driftTier;
    if (!feedback.airborne && active) {
      if (feedback.drifting && tier === 'purple' && state.previousTier !== 'purple') {
        this.burst(kartWorld, false);
      }
      if (
        state.previousDrifting &&
        !feedback.drifting &&
        state.previousTier === 'purple' &&
        feedback.boostActive
      ) {
        this.burst(kartWorld, true);
      }
      if (feedback.drifting && tier !== 'none') {
        const rate = ((tier === 'blue' ? 36 : tier === 'orange' ? 60 : 84) * this.pool.length) / 96;
        state.emission = Math.min(
          state.emission + dt * rate * this.emissionScale,
          this.pool.length,
        );
        while (state.emission >= 2) {
          this.spawn(kartWorld, -0.72, tier, false);
          this.spawn(kartWorld, 0.72, tier, false);
          state.emission -= 2;
        }
      } else state.emission = 0;
    } else state.emission = 0;
    state.previousTier = feedback.drifting && !feedback.airborne ? tier : 'none';
    state.previousDrifting = feedback.drifting && !feedback.airborne;
  }

  public clear(): void {
    for (const particle of this.pool) particle.lifetime = 0;
    this.playerState.emission = 0;
    this.playerState.previousTier = 'none';
    this.playerState.previousDrifting = false;
    this.emitters.clear();
    this.mesh.count = 0;
    this.group.visible = false;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.clear();
    this.disposed = true;
    this.mesh.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.group.clear();
  }

  private random(): number {
    // A visual-only generator must not consume random draws used for grid/items/AI.
    this.randomState ^= this.randomState << 13;
    this.randomState ^= this.randomState >>> 17;
    this.randomState ^= this.randomState << 5;
    return (this.randomState >>> 0) / 4294967296;
  }

  private burst(kartWorld: THREE.Matrix4, exhaust: boolean): void {
    const count = Math.round(this.pool.length * (exhaust ? 0.125 : 0.167) * this.emissionScale);
    for (let i = 0; i < count; i += 1)
      this.spawn(kartWorld, exhaust ? 0 : i % 2 === 0 ? -0.72 : 0.72, 'purple', exhaust);
  }

  private spawn(
    kartWorld: THREE.Matrix4,
    x: number,
    tier: Exclude<DriftTier, 'none'>,
    exhaust: boolean,
  ): void {
    const particle = this.pool.find((candidate) => candidate.age >= candidate.lifetime);
    if (particle === undefined) return;
    particle.owner = this.owner;
    const flame = tier === 'orange' && this.random() > 0.5;
    particle.position.set(x, -0.08, exhaust ? -1.6 : -1.15).applyMatrix4(kartWorld);
    particle.velocity.copy(this.forward).multiplyScalar(exhaust ? -7 : -1.8 - this.random() * 1.5);
    particle.velocity.addScaledVector(
      this.right,
      (exhaust ? (this.random() < 0.5 ? -1 : 1) : x < 0 ? -1 : 1) * (0.3 + this.random() * 1.2),
    );
    particle.velocity.y += flame ? 1.9 : 0.35 + this.random() * 1.1;
    particle.age = 0;
    particle.lifetime = exhaust ? 0.38 : flame ? 0.38 : 0.35 + this.random() * 0.25;
    particle.color = flame ? 0xffc36a : COLORS[tier];
    particle.width = exhaust ? 0.11 : flame ? 0.085 : 0.035 + this.random() * 0.02;
    particle.length = exhaust ? 0.65 : flame ? 0.48 : tier === 'purple' ? 0.35 : 0.22;
  }

  private draw(): void {
    let count = 0;
    for (const particle of this.pool) {
      if (particle.age >= particle.lifetime) continue;
      const fade = 1 - particle.age / particle.lifetime;
      this.dummy.position.copy(particle.position);
      this.direction.copy(particle.velocity).normalize();
      this.dummy.quaternion.setFromUnitVectors(UP, this.direction);
      this.dummy.scale.set(
        particle.width * fade,
        particle.length * (0.45 + fade * 0.55),
        particle.width * fade,
      );
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(count, this.dummy.matrix);
      this.color.setHex(particle.color).multiplyScalar(fade);
      this.mesh.setColorAt(count, this.color);
      count += 1;
    }
    this.mesh.count = count;
    this.group.visible = count > 0;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor !== null) this.mesh.instanceColor.needsUpdate = true;
  }
}
