import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NeonGrid } from '../src/game/track/NeonGrid';
import { crossesForwardCheckpointGate } from '../src/game/race/CheckpointGate';

describe('approved Neon Grid main topology', () => {
  const track = new NeonGrid();
  it('uses a finite 1450 m closed course with twelve ordered common-road gates', () => {
    expect(track.curve.getLength()).toBeGreaterThan(1400);
    expect(track.curve.getLength()).toBeLessThan(1500);
    expect(track.samples).toHaveLength(384);
    expect(track.samples.every((p) => p.toArray().every(Number.isFinite))).toBe(true);
    expect(track.curve.getPointAt(0).distanceTo(track.curve.getPointAt(1))).toBeLessThan(0.001);
    expect(track.checkpointIndices).toHaveLength(12);
    expect(new Set(track.checkpointIndices).size).toBe(12);
    expect(track.checkpointIndices).toEqual([...track.checkpointIndices].sort((a, b) => a - b));
    expect(track.lapCheckpointPosition(0).distanceTo(track.checkpointPosition(0))).toBeCloseTo(
      22,
      0,
    );
  });
  it('resolves main width by sector, interpolates transitions, and preserves elevation', () => {
    expect(track.halfWidthAt(0.1)).toBe(6);
    expect(track.halfWidthAt(0.35)).toBe(4.5);
    expect(track.halfWidthAt(0.65)).toBe(6);
    const transition = track.halfWidthAt(0.24655);
    expect(transition).toBeGreaterThan(4.5);
    expect(transition).toBeLessThan(6);
    expect(track.curve.getPointAt(0.1).y).toBeCloseTo(14, 1);
    expect(track.curve.getPointAt(0.35).y).toBeCloseTo(0, 1);
    expect(track.curve.getPointAt(0.9).y).toBeGreaterThan(12);
  });
  it('measures lateral offset horizontally, independent of suspension height', () => {
    const road = track.curve.getPointAt(0.35);
    const ground = track.project(road);
    const lifted = track.project(road.clone().add(new THREE.Vector3(0, 1, 0)));
    expect(lifted.lateralDistance).toBeLessThan(0.1);
    expect(lifted.surface).toBe(ground.surface);
    expect(lifted.progress).toBeCloseTo(ground.progress, 3);
  });
  it('rejects street crossings at deck gates without changing legacy Alpha defaults', () => {
    const gate = track.lapCheckpointPosition(1);
    const t = track.lapCheckpointTangent(1);
    const before = gate.clone().addScaledVector(t, -3);
    const after = gate.clone().addScaledVector(t, 3);
    expect(crossesForwardCheckpointGate(before, after, gate, t, 13, 1.5)).toBe(true);
    expect(
      crossesForwardCheckpointGate(before.clone().setY(0), after.clone().setY(0), gate, t, 13, 1.5),
    ).toBe(false);
    expect(
      crossesForwardCheckpointGate(before.clone().setY(0), after.clone().setY(0), gate, t),
    ).toBe(true);
  });
});
