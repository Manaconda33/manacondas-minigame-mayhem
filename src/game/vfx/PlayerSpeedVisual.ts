import * as THREE from 'three';
import { graphicsQualityProfile, type GraphicsQuality } from '../../config/graphicsQuality';

/** Player-only projection and crisp edge strokes. No camera transform or gameplay writes. */
export class PlayerSpeedVisual {
  public readonly group = new THREE.Group();
  private readonly mesh: THREE.InstancedMesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private readonly dummy = new THREE.Object3D();
  private readonly fades: THREE.InstancedBufferAttribute;
  private readonly baseFov: number;
  private readonly strength = { value: 0 };
  private intensity = 0;
  private clock = 0;
  private disposed = false;

  public constructor(
    private readonly camera: THREE.PerspectiveCamera,
    quality: GraphicsQuality,
  ) {
    this.baseFov = camera.fov;
    const capacity = graphicsQualityProfile(quality).speedLineCapacity;
    const geometry = new THREE.PlaneGeometry(1, 1);
    this.fades = new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1);
    this.fades.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('strokeFade', this.fades);
    this.mesh = new THREE.InstancedMesh(
      geometry,
      new THREE.ShaderMaterial({
        uniforms: { strength: this.strength },
        vertexShader: `
          attribute float strokeFade;
          varying float fade;
          void main() {
            fade = strokeFade;
            gl_Position = instanceMatrix * vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          uniform float strength;
          varying float fade;
          void main() {
            gl_FragColor = vec4(0.75, 0.88, 1.0, strength * fade);
          }
        `,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
      capacity,
    );
    this.mesh.material.userData.bloomBlackAdapter = true;
    this.mesh.name = 'speed-line-pool';
    this.mesh.count = 0;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Clip-space strokes are deliberately independent of the world's bounding volume.
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 100;
    this.group.name = 'PlayerSpeedVisual';
    this.group.visible = false;
    this.group.add(this.mesh);
  }

  public update(normalizedForwardSpeed: number, seconds: number, enabled = true): void {
    if (this.disposed) return;
    if (!enabled) {
      this.clear();
      return;
    }
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const dt = Math.min(seconds, 0.1);
    const speed = Number.isFinite(normalizedForwardSpeed) ? normalizedForwardSpeed : 0;
    const ratio = THREE.MathUtils.clamp((speed - 0.7) / 0.3, 0, 1);
    const target = ratio * ratio * (3 - 2 * ratio);
    this.intensity += (target - this.intensity) * (1 - Math.exp(-5 * dt));
    this.setFov(this.baseFov + (68 - this.baseFov) * this.intensity);
    this.clock = (this.clock + dt * (0.8 + 1.2 * this.intensity)) % 1;
    this.strength.value = this.intensity * 0.15;
    this.mesh.count = this.intensity > 0.01 ? this.mesh.instanceMatrix.count : 0;
    this.group.visible = this.mesh.count > 0;
    for (let i = 0; i < this.mesh.count; i++) {
      const phase = (this.clock + ((i * 0.61803398875) % 1)) % 1;
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const y = -0.4 + (row / Math.max(1, this.mesh.count / 2 - 1)) * 1.02;
      const x = side * (0.86 + phase * 0.1);
      this.dummy.position.set(x, y, 0);
      this.dummy.rotation.set(0, 0, Math.atan2(y, x));
      this.dummy.scale.set(0.065 + phase * 0.035, 0.0025, 1);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.fades.setX(i, Math.sin(Math.PI * phase));
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.fades.needsUpdate = true;
  }

  public clear(): void {
    this.intensity = 0;
    this.clock = 0;
    this.mesh.count = 0;
    this.group.visible = false;
    this.strength.value = 0;
    this.setFov(this.baseFov);
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

  private setFov(fov: number): void {
    if (Math.abs(this.camera.fov - fov) < 0.000001) return;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }
}
