import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import layout from './neonGridLayout.json';
import { neonGridRibbon } from './NeonGridGeometry';

/** Deliberately simple driving blockout, ahead of the separate visual gate. */
export function createNeonGridScene(track: NeonGrid): THREE.Group {
  const group = new THREE.Group();
  group.name = 'neon-grid-blockout';
  const materials = [0x236b7c, 0x733059, 0x78602d].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide }),
  );
  const road = new THREE.Mesh(neonGridRibbon(track), materials);
  road.name = 'track-road';
  road.receiveShadow = true;
  group.add(road);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x93b4c9,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
  const walls = new THREE.Group();
  walls.name = 'neon-grid-walls';
  for (const side of [-1, 1] as const) {
    const wall = new THREE.Mesh(neonGridRibbon(track, side), wallMaterial);
    wall.name = `neon-grid-wall-${String(side)}`;
    walls.add(wall);
  }
  group.add(walls);
  const padMaterial = new THREE.MeshStandardMaterial({
    color: 0x37e6ff,
    emissive: 0x37e6ff,
    emissiveIntensity: 0.7,
  });
  for (const progress of layout.boostPadCenters) {
    const pad = new THREE.Group();
    pad.name = `boost-pad-${String(progress)}`;
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(9, 0.025, track.curve.getLength() * 0.015),
      padMaterial,
    );
    pad.position.copy(track.curve.getPointAt(progress));
    pad.position.y += 0.025;
    const tangent = track.curve.getTangentAt(progress);
    pad.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    pad.add(deck);
    group.add(pad);
  }
  const gateMaterial = new THREE.MeshStandardMaterial({ color: 0xffe4a0, emissive: 0x705a12 });
  const postGeometry = new THREE.BoxGeometry(0.3, 2.8, 0.3);
  for (let i = 0; i < 12; i++) {
    const gate = new THREE.Group();
    gate.name = `checkpoint-${String(i)}`;
    const p = track.lapCheckpointPosition(i);
    const t = track.lapCheckpointTangent(i);
    const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(postGeometry, gateMaterial);
      post.position
        .copy(p)
        .addScaledVector(right, side * (track.halfWidthAt(track.lapCheckpointProgress(i)) + 0.35));
      post.position.y += 1.4;
      gate.add(post);
    }
    group.add(gate);
  }
  return group;
}
