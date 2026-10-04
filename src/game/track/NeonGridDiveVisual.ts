import * as THREE from 'three';
import type { WaterfallDive } from './NeonGridDive';

/** Shared bounded procedural water; animation follows authoritative race time. */
export class NeonGridDiveVisual {
  public readonly group = new THREE.Group();
  private readonly water: THREE.InstancedMesh;
  private readonly mist: THREE.InstancedMesh;
  private readonly splashes: THREE.InstancedMesh;
  private splashCursor = 0;
  private readonly splashEvents: ({ position: THREE.Vector3; time: number } | null)[] = Array.from(
    { length: 8 },
    () => null,
  );
  private readonly dummy = new THREE.Object3D();
  public constructor(private readonly dive: WaterfallDive) {
    this.group.name = 'waterfall-dive';
    const asphalt = new THREE.MeshStandardMaterial({
      color: 0x34485e,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    for (const [name, geometry] of [
      ['dive-ramp', dive.rampGeometry],
      ['dive-landing', dive.landingGeometry],
    ] as const) {
      const floor = new THREE.Mesh(geometry.clone(), asphalt);
      floor.name = name;
      floor.receiveShadow = true;
      this.group.add(floor);
    }
    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(11, 32),
      new THREE.MeshStandardMaterial({
        color: 0x12677a,
        emissive: 0x06343d,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
      }),
    );
    pool.name = 'dive-pool';
    pool.rotation.x = -Math.PI / 2;
    pool.position.copy(dive.pointAtDistance(19)).setY(0.05);
    this.group.add(pool);
    const gold = new THREE.MeshBasicMaterial({ color: 0xffc63f });
    const tell = new THREE.Group();
    tell.name = 'dive-launch-tell';
    for (const d of [7, 9, 11]) {
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.5, 3), gold);
      arrow.position.copy(dive.pointAtDistance(d));
      arrow.position.y = 6.8 + (d - 7) * 0.45;
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dive.direction);
      tell.add(arrow);
    }
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 0.2), gold);
      post.position.copy(dive.pointAtDistance(8)).addScaledVector(dive.right, side * 3.3);
      post.position.y += 1;
      tell.add(post);
    }
    this.group.add(tell);
    const landing = new THREE.Mesh(new THREE.BoxGeometry(8, 0.04, 0.35), gold);
    landing.name = 'dive-landing-marker';
    landing.position.copy(dive.pointAtDistance(dive.landingDistance)).setY(8.85);
    landing.rotation.y = Math.atan2(dive.direction.x, dive.direction.z);
    this.group.add(landing);
    this.water = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.16, 2, 0.16),
      new THREE.MeshBasicMaterial({ color: 0x37e6ff, transparent: true, opacity: 0.5 }),
      48,
    );
    this.water.name = 'dive-water';
    this.water.frustumCulled = false;
    this.group.add(this.water);
    this.mist = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.6, 0),
      new THREE.MeshBasicMaterial({
        color: 0xb7edf0,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
      16,
    );
    this.mist.name = 'dive-mist';
    this.mist.frustumCulled = false;
    this.group.add(this.mist);
    this.splashes = new THREE.InstancedMesh(
      new THREE.TorusGeometry(0.6, 0.07, 4, 16),
      new THREE.MeshBasicMaterial({
        color: 0xd1faff,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
      8,
    );
    this.splashes.name = 'dive-splashes';
    this.splashes.frustumCulled = false;
    this.group.add(this.splashes);
    this.update(0);
  }
  public splash(position: THREE.Vector3, time: number): void {
    this.splashEvents[this.splashCursor] = { position: position.clone().setY(0.09), time };
    this.splashCursor = (this.splashCursor + 1) % 8;
  }
  public update(time: number): void {
    const center = this.dive.pointAtDistance(18).addScaledVector(this.dive.right, -8);
    for (let i = 0; i < this.water.count; i++) {
      this.dummy.position.copy(center).addScaledVector(this.dive.right, ((i % 8) - 3.5) * 0.45);
      this.dummy.position.y = 1 + THREE.MathUtils.euclideanModulo((i / 48) * 13 - time * 8, 13);
      this.dummy.scale.set(1, 1, 1);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.water.setMatrixAt(i, this.dummy.matrix);
    }
    for (let i = 0; i < this.mist.count; i++) {
      const phase = time * 0.6 + i * 2.4;
      this.dummy.position
        .copy(center)
        .add(
          new THREE.Vector3(
            Math.sin(phase) * 2,
            0.8 + Math.sin(phase * 0.3) * 0.4,
            Math.cos(phase) * 2,
          ),
        );
      this.dummy.scale.setScalar(1.2);
      this.dummy.updateMatrix();
      this.mist.setMatrixAt(i, this.dummy.matrix);
    }
    for (let i = 0; i < 8; i++) {
      const event = this.splashEvents[i],
        age = event ? time - event.time : 2;
      this.dummy.position.copy(event?.position ?? center);
      this.dummy.rotation.set(-Math.PI / 2, 0, 0);
      this.dummy.scale.setScalar(age >= 0 && age < 0.9 ? 1 + age * 6 : 0);
      this.dummy.updateMatrix();
      this.splashes.setMatrixAt(i, this.dummy.matrix);
      if (age >= 0.9) this.splashEvents[i] = null;
    }
    this.splashes.instanceMatrix.needsUpdate = true;
    this.water.instanceMatrix.needsUpdate = true;
    this.mist.instanceMatrix.needsUpdate = true;
  }
}
