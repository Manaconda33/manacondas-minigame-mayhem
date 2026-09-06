import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { ChaseCamera } from '../src/game/camera/ChaseCamera';

function advance(cameraRig: ChaseCamera, seconds: number, rearView = false): void {
  const position = new THREE.Vector3(0, 0, 0);
  const forward = new THREE.Vector3(0, 0, 1);
  const step = 1 / 60;
  const frames = Math.ceil(seconds / step);
  for (let frame = 0; frame < frames; frame += 1) {
    cameraRig.update(position, forward, rearView, step);
  }
}

describe('race camera presentation', () => {
  it('cranes down from an elevated grid view into the tighter lower chase position', () => {
    const camera = new THREE.PerspectiveCamera();
    const rig = new ChaseCamera(camera);
    const position = new THREE.Vector3(0, 0, 0);
    const forward = new THREE.Vector3(0, 0, 1);

    rig.update(position, forward, false, 1 / 60);
    expect(camera.position.y).toBeGreaterThan(12);
    expect(camera.position.z).toBeGreaterThan(-4);

    advance(rig, 3.1);
    expect(camera.position.y).toBeGreaterThan(2.9);
    expect(camera.position.y).toBeLessThan(3.4);
    expect(camera.position.z).toBeLessThan(-5.3);
    expect(camera.position.z).toBeGreaterThan(-5.9);
  });

  it('keeps the rear camera at the accepted height while moving it closer', () => {
    const camera = new THREE.PerspectiveCamera();
    const rig = new ChaseCamera(camera);

    advance(rig, 3.1);
    rig.update(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), true, 1);

    expect(camera.position.y).toBeGreaterThan(2.8);
    expect(camera.position.y).toBeLessThan(3.4);
    expect(camera.position.z).toBeGreaterThan(5.0);
    expect(camera.position.z).toBeLessThan(5.5);
  });
});

describe('spinout camera anchoring', () => {
  it('holds the pre-impact travel heading while the kart spins and releases afterward', async () => {
    const { SpinoutCameraAnchor } = await import('../src/game/camera/SpinoutCameraAnchor');
    const anchor = new SpinoutCameraAnchor();
    const preImpact = new THREE.Vector3(0, 0, 1);
    anchor.capture(preImpact);
    const halfTurn = new THREE.Vector3(0, 0, -1);
    expect(anchor.resolve(halfTurn, true).dot(preImpact)).toBeGreaterThan(0.99);
    expect(anchor.resolve(halfTurn, false)).toBe(halfTurn);
  });
});

describe('stable spinout camera and live rear-view switching', () => {
  it('anchors actual travel, ignores refresh capture, and supports both views throughout a spin', async () => {
    const { SpinoutCameraAnchor } = await import('../src/game/camera/SpinoutCameraAnchor');
    const anchor = new SpinoutCameraAnchor();
    const travel = new THREE.Vector3(1, 0, 1).normalize();
    const forward = new THREE.Vector3(0, 0, 1);
    anchor.capture(forward, travel.clone().multiplyScalar(15));
    for (let turn = 0; turn < 8; turn += 1) {
      const spinning = new THREE.Vector3(
        Math.sin((turn * Math.PI) / 4),
        0,
        Math.cos((turn * Math.PI) / 4),
      );
      anchor.capture(spinning);
      expect(anchor.resolve(spinning, true).dot(travel)).toBeCloseTo(1);
    }
    const camera = new THREE.PerspectiveCamera();
    const rig = new ChaseCamera(camera);
    const position = new THREE.Vector3();
    rig.update(position, anchor.resolve(forward, true), false, 4);
    expect(camera.position.dot(travel)).toBeLessThan(-5);
    rig.update(position, anchor.resolve(forward.clone().negate(), true), true, 0.4);
    expect(camera.position.dot(travel)).toBeGreaterThan(4);
    rig.update(position, anchor.resolve(forward, true), false, 0.4);
    expect(camera.position.dot(travel)).toBeLessThan(-4);
    expect(anchor.resolve(forward, false)).toBe(forward);
    anchor.capture(forward, new THREE.Vector3());
    expect(anchor.resolve(travel, true).dot(forward)).toBeCloseTo(1);
    anchor.clear();
    expect(anchor.resolve(travel, true).dot(travel)).toBeCloseTo(1);
  });
});
