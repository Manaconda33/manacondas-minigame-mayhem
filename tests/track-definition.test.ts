import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createTrack } from '../src/game/track/trackCatalog';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import type { TrackDefinition } from '../src/game/track/TrackDefinition';

describe('shared track contract preserves Circuit Alpha', () => {
  const track: TrackDefinition = new CircuitAlpha();
  it('retains topology, constant width and original rail offset', () => {
    expect(track.id).toBe('circuit-alpha');
    expect(track.sampleCount).toBe(384);
    expect(track.samples).toHaveLength(384);
    expect(track.checkpointIndices).toHaveLength(12);
    expect(track.curve.getLength()).toBeGreaterThan(850);
    expect(track.curve.getLength()).toBeLessThan(950);
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      expect(track.halfWidthAt(progress)).toBe(6);
      expect(track.boundaryHalfWidthAt(track.project(track.curve.getPointAt(progress)))).toBe(9.25);
    }
    expect(track.lapCheckpointPosition(0).distanceTo(track.checkpointPosition(0))).toBeGreaterThan(
      20,
    );
    expect(track.startFinishDistance).toBe(22);
  });
  it('retains authored dirt, boost and ramp windows and grass off the road', () => {
    const position = track.curve.getPointAt(0.27);
    const tangent = track.curve.getTangentAt(0.27);
    position.addScaledVector(new THREE.Vector3(tangent.z, 0, -tangent.x), 3.8);
    expect(track.project(position).surface).toBe('dirt');
    expect(track.project(track.curve.getPointAt(0.27)).surface).toBe('asphalt');
    expect(track.project(track.curve.getPointAt(0.45)).surface).toBe('boost');
    expect(track.project(track.curve.getPointAt(0.815)).surface).toBe('boost');
    expect(track.project(track.curve.getPointAt(0.5)).surface).toBe('ramp');
    expect(
      track.project(track.curve.getPointAt(0.1).add(new THREE.Vector3(0, 0, 40))).surface,
    ).toBe('grass');
  });
});

it('creates independent selected-route topology and defaults through Alpha explicitly', () => {
  expect(createTrack('circuit-alpha').id).toBe('circuit-alpha');
  expect(createTrack('neon-grid').id).toBe('neon-grid');
  expect(createTrack('neon-grid')).not.toBe(createTrack('neon-grid'));
});
