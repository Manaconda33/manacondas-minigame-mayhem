import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';
import { LapTracker } from '../src/game/race/LapTracker';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';

describe('swept checkpoint gates', () => {
  it('counts a forward high-speed sweep even when both samples lie beyond the old trigger radius', () => {
    const gate = new THREE.Vector3();
    const tangent = new THREE.Vector3(0, 0, 1);
    const before = new THREE.Vector3(0, 0, -18);
    const after = new THREE.Vector3(0, 0, 18);

    expect(before.distanceToSquared(gate)).toBeGreaterThan(13 ** 2);
    expect(after.distanceToSquared(gate)).toBeGreaterThan(13 ** 2);
    expect(crossesForwardCheckpointGate(before, after, gate, tangent)).toBe(true);
  });

  it('requires a forward, corridor-bounded crossing before advancing the required checkpoint', () => {
    const tracker = new LapTracker(2, 1);
    const firstGate = new THREE.Vector3(0, 0, 20);
    const finishGate = new THREE.Vector3(0, 0, 40);
    const tangent = new THREE.Vector3(0, 0, 1);

    expect(
      crossesForwardCheckpointGate(
        new THREE.Vector3(0, 0, 23),
        new THREE.Vector3(0, 0, 17),
        firstGate,
        tangent,
      ),
    ).toBe(false);
    expect(
      crossesForwardCheckpointGate(
        new THREE.Vector3(14, 0, 17),
        new THREE.Vector3(14, 0, 23),
        firstGate,
        tangent,
      ),
    ).toBe(false);

    expect(
      crossesForwardCheckpointGate(
        new THREE.Vector3(0, 0, 17),
        new THREE.Vector3(0, 0, 23),
        firstGate,
        tangent,
      ),
    ).toBe(true);
    expect(tracker.enterCheckpoint(1, 1, 1)).toBe(true);
    expect(
      crossesForwardCheckpointGate(
        new THREE.Vector3(0, 0, 37),
        new THREE.Vector3(0, 0, 43),
        finishGate,
        tangent,
      ),
    ).toBe(true);
    expect(tracker.enterCheckpoint(0, 1, 2)).toBe(true);
    expect(tracker.snapshot()).toMatchObject({ lap: 1, finished: true });
  });

  it('uses the actual offset Circuit Alpha finish tangent', () => {
    const track = new CircuitAlpha();
    const finish = track.lapCheckpointPosition(0);
    const tangent = track.lapCheckpointTangent(0);
    const before = finish.clone().addScaledVector(tangent, -18);
    const after = finish.clone().addScaledVector(tangent, 18);

    expect(crossesForwardCheckpointGate(before, after, finish, tangent)).toBe(true);
  });
});
