import { markBloomMaterial } from '../rendering/bloomEligibility';
import * as THREE from 'three';
import { graphicsQualityProfile, type GraphicsQuality } from '../../config/graphicsQuality';

export interface ExhaustEmitter {
  id: string;
  mesh: THREE.Group;
  speedRatio: number;
  boostActive: boolean;
  purpleBoost: boolean;
  itemExhaustActive: boolean;
  active: boolean;
  player: boolean;
}
interface State {
  emitter: ExhaustEmitter;
  strength: number;
  time: number;
}

/** One unlit batch for all racers. No simulation writes, lights, textures or shadow passes. */
export class ExhaustVisual {
  public readonly group = new THREE.Group();
  private readonly mesh: THREE.InstancedMesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>;
  private readonly anchors = new WeakMap<THREE.Object3D, THREE.Vector3[]>();
  private readonly states = new Map<string, State>();
  private readonly frustum = new THREE.Frustum();
  private readonly viewProjection = new THREE.Matrix4();
  private readonly sphere = new THREE.Sphere(new THREE.Vector3(), 3);
  private readonly matrix = new THREE.Matrix4();
  private readonly local = new THREE.Matrix4();
  private readonly point = new THREE.Vector3();
  private readonly scale = new THREE.Vector3();
  private readonly quaternion = new THREE.Quaternion();
  private readonly color = new THREE.Color();
  private readonly perRacer: number;
  private readonly present = new Set<string>();
  private disposed = false;

  public constructor(quality: GraphicsQuality) {
    const capacity = graphicsQualityProfile(quality).exhaustInstanceCapacity;
    this.perRacer = capacity / 8;
    // Tip points rearward (-Z); translate so the wide base sits at the outlet.
    const geometry = new THREE.ConeGeometry(1, 1, 6, 1, true);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, 0, -0.5);
    this.mesh = new THREE.InstancedMesh(
      geometry,
      markBloomMaterial(new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }), 'color'),
      capacity,
    );
    this.mesh.name = 'exhaust-flare-pool';
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.group.name = 'ExhaustVisual';
    this.group.visible = false;
    this.group.add(this.mesh);
  }

  /** Called on normalized, unattached models before static batching removes their nodes. */
  public captureModel(root: THREE.Object3D, model: THREE.Object3D): void {
    if (this.disposed) return;
    model.updateWorldMatrix(true, true);
    const outlets: THREE.Vector3[] = [];
    for (const name of ['Exhaust_L', 'Exhaust_R']) {
      const outlet = model.getObjectByName(name);
      if (outlet === undefined) continue;
      const bounds = new THREE.Box3().setFromObject(outlet);
      const point = bounds.getCenter(new THREE.Vector3());
      point.z = bounds.min.z; // Normalized kart forward is +Z; outlet end is rearward.
      if ([point.x, point.y, point.z].every(Number.isFinite)) outlets.push(point);
    }
    if (outlets.length > 0) this.anchors.set(root, outlets);
  }

  public update(
    emitters: readonly ExhaustEmitter[],
    camera: THREE.PerspectiveCamera,
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
    camera.updateWorldMatrix(true, false);
    this.frustum.setFromProjectionMatrix(
      this.viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
    );
    this.present.clear();
    for (const emitter of emitters) {
      this.present.add(emitter.id);
      emitter.mesh.updateWorldMatrix(true, false);
      this.sphere.center.setFromMatrixPosition(emitter.mesh.matrixWorld);
      const visible =
        emitter.player ||
        (this.sphere.center.distanceToSquared(camera.position) <= 3600 &&
          this.frustum.intersectsSphere(this.sphere));
      // Accepted purple pulse and item exhaust retain sole ownership while active.
      const active =
        emitter.active && visible && !emitter.purpleBoost && !emitter.itemExhaustActive;
      const speed = Number.isFinite(emitter.speedRatio) ? emitter.speedRatio : 0;
      if (!active || speed <= 0) {
        this.states.delete(emitter.id);
        continue;
      }
      let state = this.states.get(emitter.id);
      if (state === undefined) {
        state = { emitter, strength: 0, time: 0 };
        this.states.set(emitter.id, state);
      }
      state.emitter = emitter;
      const target = emitter.boostActive ? 1 : THREE.MathUtils.smoothstep(speed, 0.7, 1) * 0.4;
      state.strength = THREE.MathUtils.lerp(state.strength, target, 1 - Math.exp(-12 * dt));
      state.time += dt;
    }
    for (const id of this.states.keys()) if (!this.present.has(id)) this.states.delete(id);
    this.draw();
  }

  public clearRacer(id: string): void {
    this.states.delete(id);
    this.draw();
  }
  public clear(): void {
    this.states.clear();
    this.mesh.count = 0;
    this.group.visible = false;
  }
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clear();
    this.mesh.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.group.clear();
  }

  private draw(): void {
    let count = 0;
    for (const state of this.states.values()) {
      if (state.strength < 0.01) continue;
      const e = state.emitter;
      const anchors = this.outlets(e.mesh);
      const pulse = 0.94 + Math.sin(state.time * 32) * 0.06;
      this.color.setHex(e.boostActive ? 0x9defff : 0x74b5df);
      for (const anchor of anchors) {
        if (count >= this.mesh.instanceMatrix.count) break;
        this.point.copy(anchor);
        this.scale.set(0.12, 0.12, (0.25 + state.strength * 1.0) * pulse);
        this.local.compose(this.point, this.quaternion, this.scale);
        this.matrix.multiplyMatrices(e.mesh.matrixWorld, this.local);
        this.mesh.setMatrixAt(count, this.matrix);
        this.mesh.setColorAt(
          count++,
          this.color.setHex(e.boostActive ? 0x9defff : 0x74b5df).multiplyScalar(state.strength),
        );
      }
      if (e.boostActive) {
        // Short pale cyan/violet streaks remain near the exhaust, never across the screen.
        for (
          let i = anchors.length;
          i < this.perRacer && count < this.mesh.instanceMatrix.count;
          i++
        ) {
          const anchor = anchors[i % anchors.length];
          if (anchor === undefined) continue;
          const phase = (state.time * 4 + i * 0.37) % 1;
          this.point.copy(anchor);
          this.point.x += Math.sin(i * 3) * 0.06;
          this.point.y += 0.06 * phase;
          this.point.z -= phase * 1.4;
          this.scale.setScalar(0.025 * (1 - phase) * state.strength);
          this.scale.z *= 5;
          this.local.compose(this.point, this.quaternion, this.scale);
          this.matrix.multiplyMatrices(e.mesh.matrixWorld, this.local);
          this.mesh.setMatrixAt(count, this.matrix);
          this.color.setHex(i % 3 === 0 ? 0xc5a5ff : 0xa5eaff).multiplyScalar((1 - phase) * 0.7);
          this.mesh.setColorAt(count++, this.color);
        }
      }
      if (count >= this.mesh.instanceMatrix.count) break;
    }
    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor !== null) this.mesh.instanceColor.needsUpdate = true;
    this.group.visible = count > 0;
  }

  private outlets(root: THREE.Object3D): THREE.Vector3[] {
    let anchors = this.anchors.get(root);
    if (anchors === undefined) {
      anchors = [new THREE.Vector3(-0.45, 0.35, -1.35), new THREE.Vector3(0.45, 0.35, -1.35)];
      this.anchors.set(root, anchors);
    }
    return anchors;
  }
}
