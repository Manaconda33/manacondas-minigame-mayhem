import * as THREE from 'three';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { bloomEmission } from './bloomEligibility';

/** One local shadow map; budgets count racers/projectiles, not their submeshes. */
export class RaceShadows {
  private readonly sun = new THREE.DirectionalLight(0xffe8c5, 2.4);
  private readonly offset = new THREE.Vector3(-120, 180, -80);
  private readonly right = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly center = new THREE.Vector3();
  private readonly position = new THREE.Vector3();
  private readonly casting = new Set<THREE.Object3D>();
  private readonly enabled: boolean;
  private disposed = false;

  public constructor(scene: THREE.Scene, quality: GraphicsQuality) {
    this.enabled = quality !== 'low';
    this.sun.castShadow = this.enabled;
    this.sun.shadow.mapSize.set(2048, 2048);
    const camera = this.sun.shadow.camera;
    camera.left = camera.bottom = -72;
    camera.right = camera.top = 72;
    camera.near = 1;
    camera.far = 500;
    camera.updateProjectionMatrix();
    this.sun.shadow.bias = -0.001;
    this.sun.shadow.normalBias = 0.2;
    this.sun.position.copy(this.offset);
    const basis = new THREE.Matrix4().lookAt(this.offset, new THREE.Vector3(), this.sun.up);
    this.right.setFromMatrixColumn(basis, 0);
    this.up.setFromMatrixColumn(basis, 1);
    scene.add(this.sun, this.sun.target);
  }

  public update(
    anchor: THREE.Vector3,
    player: THREE.Object3D,
    rivals: readonly THREE.Object3D[],
    projectiles: readonly THREE.Object3D[],
  ): void {
    if (this.disposed) return;
    for (const object of this.casting) object.castShadow = false;
    this.casting.clear();
    const roots = [player, ...rivals, ...projectiles];
    for (const root of roots)
      root.traverse((object) => {
        object.castShadow = false;
      });
    if (!this.enabled) return;

    // Snap in the constant light basis, not world X/Z, to avoid moving texels every frame.
    const texel = 144 / 2048;
    const x = anchor.dot(this.right);
    const y = anchor.dot(this.up);
    this.center
      .copy(anchor)
      .addScaledVector(this.right, Math.round(x / texel) * texel - x)
      .addScaledVector(this.up, Math.round(y / texel) * texel - y);
    this.sun.target.position.copy(this.center);
    this.sun.position.copy(this.center).add(this.offset);
    this.sun.updateMatrixWorld();
    this.sun.target.updateMatrixWorld();
    this.sun.shadow.updateMatrices(this.sun);

    const distance = (root: THREE.Object3D): number => {
      root.getWorldPosition(this.position);
      return this.position.distanceToSquared(anchor);
    };
    const nearest = (candidates: readonly THREE.Object3D[]): THREE.Object3D[] =>
      candidates
        .map((root) => ({ root, distance: distance(root) }))
        .filter((entry) => entry.distance <= 55 * 55)
        .sort((a, b) => a.distance - b.distance)
        .map((entry) => entry.root);
    let count = 0;
    for (const root of [player, ...nearest(rivals), ...nearest(projectiles)]) {
      if (count >= 12) break;
      const eligible: THREE.Mesh[] = [];
      root.traverseVisible((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const mesh = object as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        if (
          !materials.every(
            (material) =>
              !material.transparent &&
              material.visible &&
              bloomEmission(material) !== 'color' &&
              material.opacity === 1 &&
              material.depthWrite &&
              material.blending === THREE.NormalBlending,
          )
        )
          return;
        object.castShadow = true;
        this.casting.add(object);
        eligible.push(mesh);
      });
      if (eligible.length > 0) count += 1;
    }
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const object of this.casting) object.castShadow = false;
    this.casting.clear();
    this.sun.shadow.dispose();
    this.sun.removeFromParent();
    this.sun.target.removeFromParent();
  }
}
