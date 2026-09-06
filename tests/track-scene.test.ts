import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CircuitAlpha } from '../src/game/track/CircuitAlpha';
import { createTrackScene } from '../src/game/track/createTrackScene';

function requireInstanced(scene: THREE.Object3D, name: string): THREE.InstancedMesh {
  const object = scene.getObjectByName(name);
  expect(object).toBeInstanceOf(THREE.InstancedMesh);
  return object as THREE.InstancedMesh;
}

describe('Circuit Alpha environment scene', () => {
  it('adds the visual-landmark pass without mutating canonical track samples', () => {
    const track = new CircuitAlpha();
    const before = track.samples.map((point) => point.toArray());
    const scene = createTrackScene(track);

    expect(scene.name).toBe('circuit-alpha-environment');
    expect(scene.getObjectByName('track-road')).toBeDefined();
    expect(scene.getObjectByName('track-shoulder')).toBeDefined();
    expect(scene.getObjectByName('asphalt-racing-wear')).toBeDefined();
    expect(scene.getObjectByName('split-bend-dirt-line')).toBeDefined();
    expect(scene.getObjectByName('center-mesa')).toBeDefined();
    expect(scene.getObjectByName('start-finish-gate')).toBeDefined();
    expect(scene.getObjectByName('underpass-gate')).toBeDefined();
    expect(scene.getObjectByName('crest-ramp-visual')).toBeDefined();
    expect(scene.getObjectByName('track-guardrails')).toBeDefined();
    expect(scene.getObjectByName('guardrail-posts')).toBeInstanceOf(THREE.InstancedMesh);
    expect(scene.getObjectByName('boost-pad-0.450')).toBeDefined();
    expect(scene.getObjectByName('boost-pad-0.815')).toBeDefined();
    expect(track.samples.map((point) => point.toArray())).toEqual(before);
  });

  it('stages the visible start-finish gantry ahead of the grid at the race finish crossing', () => {
    const track = new CircuitAlpha();
    const scene = createTrackScene(track);
    const gate = scene.getObjectByName('start-finish-gate');
    expect(gate).toBeInstanceOf(THREE.Group);
    if (!(gate instanceof THREE.Group)) throw new Error('Missing start-finish gate');

    const tangent = track.checkpointTangent(0);
    const spawn = track.checkpointPosition(0).addScaledVector(tangent, 8);
    const forwardOffset = gate.position.clone().sub(spawn).dot(tangent);
    expect(forwardOffset).toBeGreaterThan(10);
    expect(gate.position.distanceTo(track.lapCheckpointPosition(0))).toBeLessThan(0.001);
  });

  it('builds the Crest Ramp as a forward-rising wedge', () => {
    const scene = createTrackScene(new CircuitAlpha());
    const deck = scene.getObjectByName('crest-ramp-deck');
    expect(deck).toBeInstanceOf(THREE.Mesh);

    const geometry = (deck as THREE.Mesh).geometry;
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    expect(bounds).not.toBeNull();
    if (bounds === null) throw new Error('Missing Crest Ramp bounds');
    const size = bounds.getSize(new THREE.Vector3());
    expect(size.z).toBeGreaterThan(size.x);

    const position = geometry.getAttribute('position');
    const nearYs: number[] = [];
    const farYs: number[] = [];
    for (let index = 0; index < position.count; index += 1) {
      if (position.getZ(index) < 0) nearYs.push(position.getY(index));
      else farYs.push(position.getY(index));
    }
    expect(Math.max(...farYs) - Math.max(...nearYs)).toBeGreaterThan(1);

    const approachEdge = scene.getObjectByName('crest-ramp-approach-edge');
    expect(approachEdge).toBeInstanceOf(THREE.Mesh);
    if (!(approachEdge instanceof THREE.Mesh)) throw new Error('Missing Crest Ramp approach edge');
    expect(approachEdge.position.z).toBeLessThan(0);
  });

  it('uses instancing for repeated trackside dressing', () => {
    const scene = createTrackScene(new CircuitAlpha());

    expect(requireInstanced(scene, 'roadside-curbs').count).toBeGreaterThanOrEqual(90);
    expect(requireInstanced(scene, 'roadside-reflectors').count).toBeGreaterThanOrEqual(48);
    expect(requireInstanced(scene, 'forest-trunks').count).toBe(64);
    expect(requireInstanced(scene, 'forest-canopy').count).toBe(64);
    expect(requireInstanced(scene, 'trackside-rocks').count).toBe(36);
    expect(requireInstanced(scene, 'distant-mountains').count).toBe(18);
    expect(requireInstanced(scene, 'checkpoint-pylons').count).toBe(24);
  });
});
