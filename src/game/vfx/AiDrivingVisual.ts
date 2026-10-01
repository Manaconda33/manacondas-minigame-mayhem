import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import type { KartController } from '../physics/KartController';
import type { CircuitAlpha } from '../track/CircuitAlpha';
import { DriftVisual, type DriftEmitter } from './DriftVisual';
import { WheelDustVisual, type DustEmitter } from './WheelDustVisual';

interface Racer {
  id: string;
  controller: KartController;
  mesh: THREE.Group;
  progress: { finished: boolean };
}
interface Entry {
  drift: DriftEmitter;
  dust: DustEmitter;
}

/** Two shared batches for seven opponents; presentation never writes simulation state. */
export class AiDrivingVisual {
  public readonly group = new THREE.Group();
  private readonly drift: DriftVisual;
  private readonly dust: WheelDustVisual;
  private readonly entries = new Map<string, Entry>();
  private readonly anchors = new WeakMap<THREE.Object3D, THREE.Vector3[]>();
  private readonly frustum = new THREE.Frustum();
  private readonly viewProjection = new THREE.Matrix4();
  private readonly sphere = new THREE.Sphere(new THREE.Vector3(), 3);
  private readonly driftEmitters: DriftEmitter[] = [];
  private readonly dustEmitters: DustEmitter[] = [];
  private disposed = false;

  public constructor(quality: GraphicsQuality) {
    this.drift = new DriftVisual(quality);
    this.dust = new WheelDustVisual(quality);
    this.group.name = 'AiDrivingVisual';
    this.group.add(this.drift.group, this.dust.group);
  }

  public captureModel(root: THREE.Object3D, model: THREE.Object3D): void {
    model.updateWorldMatrix(true, true);
    const anchors = this.wheelAnchors(root);
    for (const [i, name] of ['Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR'].entries()) {
      const wheel = model.getObjectByName(name);
      const anchor = anchors[i];
      if (wheel !== undefined && anchor !== undefined) wheel.getWorldPosition(anchor);
    }
  }

  public update(
    racers: readonly Racer[],
    world: RAPIER.World,
    track: CircuitAlpha,
    camera: THREE.PerspectiveCamera,
    seconds: number,
    enabled: boolean,
    blocked: (id: string) => boolean,
  ): void {
    if (this.disposed) return;
    if (!enabled) {
      this.clear();
      return;
    }
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    camera.updateWorldMatrix(true, false);
    this.frustum.setFromProjectionMatrix(
      this.viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
    );
    this.driftEmitters.length = this.dustEmitters.length = 0;
    for (const racer of racers) {
      let entry = this.entries.get(racer.id);
      if (entry === undefined) {
        entry = {
          drift: {
            id: racer.id,
            feedback: racer.controller.feedback(),
            kartWorld: racer.mesh.matrixWorld,
            active: false,
          },
          dust: {
            id: racer.id,
            active: false,
            wheels: this.wheelAnchors(racer.mesh).map(() => ({
              position: new THREE.Vector3(),
              surface: 'asphalt',
              grounded: false,
            })),
            velocity: new THREE.Vector3(),
            forward: new THREE.Vector3(),
          },
        };
        this.entries.set(racer.id, entry);
      }
      racer.controller.position(this.sphere.center);
      const active =
        !racer.progress.finished &&
        !blocked(racer.id) &&
        this.sphere.center.distanceToSquared(camera.position) <= 60 * 60 &&
        this.frustum.intersectsSphere(this.sphere);
      racer.mesh.updateWorldMatrix(true, false);
      entry.drift.feedback = racer.controller.feedback();
      entry.drift.active = active;
      entry.dust.active = active;
      racer.controller.velocity(entry.dust.velocity);
      racer.controller.forward(entry.dust.forward);
      if (active) {
        const anchors = this.wheelAnchors(racer.mesh);
        for (const [i, wheel] of entry.dust.wheels.entries()) {
          const anchor = anchors[i];
          wheel.grounded = false;
          if (anchor === undefined || entry.drift.feedback.airborne) continue;
          wheel.position.copy(anchor).applyMatrix4(racer.mesh.matrixWorld);
          wheel.position.y = this.sphere.center.y;
          const hit = world.castRay(
            new RAPIER.Ray(wheel.position, { x: 0, y: -1, z: 0 }),
            0.65,
            true,
            RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC,
            undefined,
            undefined,
            racer.controller.body,
          );
          if (hit === null) continue;
          wheel.position.y -= hit.timeOfImpact;
          wheel.grounded = true;
          wheel.surface = track.project(wheel.position).surface;
        }
      }
      this.driftEmitters.push(entry.drift);
      this.dustEmitters.push(entry.dust);
    }
    this.drift.updateEmitters(this.driftEmitters, seconds);
    this.dust.updateEmitters(this.dustEmitters, camera.quaternion, seconds);
  }

  public clearRacer(id: string): void {
    this.drift.clearEmitter(id);
    this.dust.clearEmitter(id);
  }

  public clear(): void {
    this.drift.clear();
    this.dust.clear();
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.drift.dispose();
    this.dust.dispose();
    this.entries.clear();
    this.driftEmitters.length = this.dustEmitters.length = 0;
    this.group.clear();
  }

  private wheelAnchors(root: THREE.Object3D): THREE.Vector3[] {
    let anchors = this.anchors.get(root);
    if (anchors === undefined) {
      // Procedural AI chassis has no explicit wheel meshes; use its outside corners.
      anchors = [
        new THREE.Vector3(-0.8, 0, 0.9),
        new THREE.Vector3(0.8, 0, 0.9),
        new THREE.Vector3(-0.8, 0, -0.9),
        new THREE.Vector3(0.8, 0, -0.9),
      ];
      this.anchors.set(root, anchors);
    }
    return anchors;
  }
}
