import * as THREE from 'three';
import { graphicsQualityProfile, type GraphicsQuality } from '../../config/graphicsQuality';
import type { SurfaceType } from '../../config/kartTuning';

export interface DustWheelContact {
  readonly position: THREE.Vector3;
  surface: SurfaceType;
  grounded: boolean;
}
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifetime: number;
  size: number;
  color: number;
}

/** Player-only, world-space wheel dust. No physics writes or gameplay random draws. */
export class WheelDustVisual {
  public readonly group = new THREE.Group();
  private readonly mesh: THREE.InstancedMesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly pool: Particle[];
  private readonly emission = [0, 0, 0, 0];
  private readonly dummy = new THREE.Object3D();
  private readonly color = new THREE.Color();
  private readonly opacity: THREE.InstancedBufferAttribute;
  private randomState = 0x47a639;
  private disposed = false;

  public constructor(quality: GraphicsQuality) {
    const capacity = graphicsQualityProfile(quality).dustParticleCapacity;
    this.pool = Array.from({ length: capacity }, () => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      age: 0,
      lifetime: 0,
      size: 0,
      color: 0,
    }));
    const pixels = new Uint8Array(32 * 32 * 4);
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        const index = (y * 32 + x) * 4;
        const radius = Math.hypot((x + 0.5) / 32 - 0.5, (y + 0.5) / 32 - 0.5) * 2;
        pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
        pixels[index + 3] = Math.round(255 * Math.pow(Math.max(0, 1 - radius), 1.5));
      }
    const texture = new THREE.DataTexture(pixels, 32, 32);
    texture.magFilter = texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nattribute float dustOpacity;\nvarying float vDustOpacity;',
        )
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDustOpacity = dustOpacity;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vDustOpacity;')
        .replace(
          '#include <map_fragment>',
          '#include <map_fragment>\ndiffuseColor.a *= vDustOpacity;',
        );
    };
    material.customProgramCacheKey = () => 'player-wheel-dust-v1';
    const geometry = new THREE.PlaneGeometry(1, 1);
    this.opacity = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
    this.opacity.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('dustOpacity', this.opacity);
    this.mesh = new THREE.InstancedMesh(geometry, material, capacity);
    this.mesh.name = 'wheel-dust-pool';
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.group.name = 'WheelDustVisual';
    this.group.visible = false;
    this.group.add(this.mesh);
  }

  public update(
    wheels: readonly DustWheelContact[],
    velocity: THREE.Vector3,
    forward: THREE.Vector3,
    cameraRotation: THREE.Quaternion,
    seconds: number,
    enabled = true,
  ): void {
    if (this.disposed) return;
    if (!enabled) {
      this.clear();
      return;
    }
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const dt = Math.min(seconds, 0.1);
    for (const particle of this.pool) {
      if (particle.age >= particle.lifetime) continue;
      particle.age += dt;
      particle.position.addScaledVector(particle.velocity, dt);
      particle.velocity.multiplyScalar(Math.exp(-dt * 1.8));
    }
    const speed = Math.hypot(velocity.x, velocity.z);
    const slip = Math.abs(velocity.x * forward.z - velocity.z * forward.x);
    for (let i = 0; i < this.emission.length; i++) {
      const wheel = wheels[i];
      if (
        wheel === undefined ||
        !wheel.grounded ||
        speed < 1.2 ||
        !Number.isFinite(speed + slip) ||
        (wheel.surface !== 'dirt' && wheel.surface !== 'grass') ||
        !Number.isFinite(wheel.position.x + wheel.position.y + wheel.position.z)
      ) {
        this.emission[i] = 0;
        continue;
      }
      const rate =
        (Math.min(24, speed * 0.8 + slip * 1.4) *
          (wheel.surface === 'grass' ? 0.7 : 1) *
          this.pool.length) /
        64;
      this.emission[i] = Math.min(2, (this.emission[i] ?? 0) + dt * rate);
      while ((this.emission[i] ?? 0) >= 1) {
        this.spawn(wheel, velocity);
        this.emission[i] = (this.emission[i] ?? 0) - 1;
      }
    }
    this.draw(cameraRotation);
  }

  public clear(): void {
    for (const particle of this.pool) particle.lifetime = 0;
    this.emission.fill(0);
    this.mesh.count = 0;
    this.group.visible = false;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.clear();
    this.disposed = true;
    this.mesh.dispose();
    this.mesh.material.map?.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.group.clear();
  }

  private random(): number {
    this.randomState ^= this.randomState << 13;
    this.randomState ^= this.randomState >>> 17;
    this.randomState ^= this.randomState << 5;
    return (this.randomState >>> 0) / 4294967296;
  }

  private spawn(wheel: DustWheelContact, velocity: THREE.Vector3): void {
    const particle = this.pool.find((candidate) => candidate.age >= candidate.lifetime);
    if (particle === undefined) return;
    particle.position.copy(wheel.position);
    particle.position.x += (this.random() - 0.5) * 0.08;
    particle.position.z += (this.random() - 0.5) * 0.08;
    particle.position.y += 0.1;
    particle.velocity.set(
      -velocity.x * 0.08 + (this.random() - 0.5) * 0.8,
      0.35 + this.random() * 0.3,
      -velocity.z * 0.08 + (this.random() - 0.5) * 0.8,
    );
    particle.age = 0;
    particle.lifetime = 0.45 + this.random() * 0.2;
    particle.size = 0.3 + this.random() * 0.18;
    particle.color = wheel.surface === 'dirt' ? 0xc5a073 : 0x8b9870;
  }

  private draw(cameraRotation: THREE.Quaternion): void {
    let count = 0;
    for (const particle of this.pool) {
      if (particle.age >= particle.lifetime) continue;
      const progress = particle.age / particle.lifetime;
      this.dummy.position.copy(particle.position);
      this.dummy.quaternion.copy(cameraRotation);
      this.dummy.scale.setScalar(particle.size * (0.55 + progress * 1.5));
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(count, this.dummy.matrix);
      this.mesh.setColorAt(count, this.color.setHex(particle.color));
      this.opacity.setX(count, Math.pow(1 - progress, 1.5));
      count++;
    }
    this.mesh.count = count;
    this.group.visible = count > 0;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor !== null) this.mesh.instanceColor.needsUpdate = true;
    this.opacity.needsUpdate = true;
  }
}
