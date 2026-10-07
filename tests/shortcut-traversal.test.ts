import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { ShortcutTraversal } from '../src/game/track/ShortcutTraversal';

function setup() {
  const track = new NeonGrid();
  const tunnel = track.serviceTunnel;
  const traversal = new ShortcutTraversal(tunnel, track);
  const at = (distance: number) =>
    tunnel.curve.getPointAt(distance / tunnel.curve.getLength()).add(new THREE.Vector3(0, 0.5, 0));
  return { track, tunnel, traversal, at };
}
describe('racer-owned tunnel traversal', () => {
  it('allows physical entry from either end while rejecting wrong-height crossings', () => {
    const { traversal, at, tunnel } = setup();
    expect(
      traversal.update(
        at(5).add(new THREE.Vector3(0, 5, 0)),
        at(9).add(new THREE.Vector3(0, 5, 0)),
      ),
    ).toBeNull();
    expect(traversal.update(at(5), at(9))?.pathId).toBe('service-tunnel');
    traversal.reset();

    const reverseMouth = tunnel.curve.getLength() - tunnel.mouthDistance;
    expect(traversal.update(at(reverseMouth + 1), at(reverseMouth - 1))?.pathId).toBe(
      'service-tunnel',
    );
    expect(traversal.update(at(reverseMouth - 1), at(reverseMouth + 1))).toBeNull();
  });
  it('lets a reverse traveler own the tunnel until the opposite mouth without granting main-route state', () => {
    const { traversal, at, tunnel } = setup();
    const reverseMouth = tunnel.curve.getLength() - tunnel.mouthDistance;
    traversal.update(at(reverseMouth + 1), at(reverseMouth - 1));
    expect(traversal.update(at(reverseMouth - 2), at(30))?.pathId).toBe('service-tunnel');
    expect(traversal.update(at(9), at(5))).toBeNull();
  });
  it('allows reverse Billboard chord entry without misclassifying reverse main-road travel', () => {
    const track = new NeonGrid();
    const gap = track.billboardGap;
    const chord = new ShortcutTraversal(gap, track);
    const reverseMouthFraction = 1 - gap.mouthDistance / gap.curve.getLength();
    const reverseMouth = gap.curve.getPointAt(reverseMouthFraction).add(new THREE.Vector3(0, 0.5, 0));
    const gapTangent = gap.curve.getTangentAt(reverseMouthFraction).setY(0).normalize();

    expect(
      chord.update(
        reverseMouth.clone().addScaledVector(gapTangent, 1),
        reverseMouth.clone().addScaledVector(gapTangent, -1),
      )?.pathId,
    ).toBe('billboard-gap');

    const mainOnly = new ShortcutTraversal(gap, track);
    const epsilon = 0.001;
    const previous = track.curve
      .getPointAt(gap.exitProgress + epsilon)
      .add(new THREE.Vector3(0, 0.5, 0));
    const current = track.curve
      .getPointAt(gap.exitProgress - epsilon)
      .add(new THREE.Vector3(0, 0.5, 0));
    expect(mainOnly.update(previous, current)).toBeNull();
  });
  it('retains projection through pause, leaving entry window and partial reversal', () => {
    const { traversal, at, tunnel } = setup();
    traversal.update(at(5), at(9));
    const advanced = traversal.update(at(9), at(45));
    expect(advanced?.progress).toBeGreaterThan(tunnel.entry.progress[1]);
    expect(traversal.update(at(45), at(45))?.progress).toBeCloseTo(advanced?.progress ?? 0);
    expect(traversal.update(at(45), at(30))?.progress).toBeLessThan(advanced?.progress ?? 0);
    expect(traversal.project(at(30))?.pathId).toBe('service-tunnel');
  });
  it('releases only at physical rejoin or reversing out the mouth; reset is racer-local', () => {
    const { traversal, at, tunnel, track } = setup();
    const other = new ShortcutTraversal(tunnel, track);
    traversal.update(at(5), at(9));
    expect(other.project(at(40))).toBeNull();
    expect(traversal.update(at(9), at(5))).toBeNull();
    traversal.update(at(5), at(9));
    const end = tunnel.curve.getPointAt(1).add(new THREE.Vector3(0, 0.5, 0));
    const tangent = tunnel.curve.getTangentAt(1);
    expect(
      traversal.update(at(tunnel.curve.getLength() - 1), end.clone().addScaledVector(tangent, 1)),
    ).toBeNull();
    traversal.update(at(5), at(9));
    traversal.reset();
    expect(traversal.project(at(40))).toBeNull();
  });
  it('maps real path arc length into the gate-free main interval and owns copies', () => {
    const { traversal, at, track, tunnel } = setup();
    traversal.update(at(5), at(9));
    const p = traversal.project(at(45));
    expect(p?.progress).toBeCloseTo(
      tunnel.entry.progress[0] +
        ((tunnel.exitProgress - tunnel.entry.progress[0]) * 45) / tunnel.curve.getLength(),
      3,
    );
    for (let i = 0; i < 12; i++)
      expect(
        track.lapCheckpointProgress(i) > tunnel.entry.progress[0] &&
          track.lapCheckpointProgress(i) < tunnel.exitProgress,
      ).toBe(false);
    p?.point.set(999, 999, 999);
    expect(traversal.project(at(45))?.point.x).not.toBe(999);
  });
});
