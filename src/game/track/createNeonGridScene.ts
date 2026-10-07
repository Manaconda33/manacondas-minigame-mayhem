import type { GraphicsQuality } from '../../config/graphicsQuality';
import { FallsRunVisual } from './FallsRunVisual';
import { SkylineVisual } from './SkylineVisual';
import { NeonGridDiveVisual } from './NeonGridDiveVisual';
import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';
import layout from './neonGridLayout.json';
import { serviceTunnelGeometry } from './ServiceTunnelGeometry';
import { billboardFloorGeometry } from './NeonGridBillboard';
import { NeonGridBillboardVisual } from './NeonGridBillboardVisual';
import { neonGridRibbon } from './NeonGridGeometry';

export class NeonGridScene extends THREE.Group {
  public readonly billboard: NeonGridBillboardVisual;
  public readonly dive: NeonGridDiveVisual;
  public readonly fallsRun: FallsRunVisual;
  public readonly skyline: SkylineVisual;
  public constructor(track: NeonGrid, quality: GraphicsQuality = 'medium') {
    super();
    this.billboard = new NeonGridBillboardVisual(track.billboardGap);
    this.add(this.billboard.group);
    this.dive = new NeonGridDiveVisual(track.waterfallDive);
    this.add(this.dive.group);
    this.fallsRun = new FallsRunVisual(track, quality);
    this.add(this.fallsRun.group);
    this.skyline = new SkylineVisual(track, quality);
    this.add(this.skyline.group);
  }
}

/** Main blockout with the approved Task 6 local visual pass. */
export function createNeonGridScene(
  track: NeonGrid,
  quality: GraphicsQuality = 'medium',
): NeonGridScene {
  const group = new NeonGridScene(track, quality);
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
    const wall = new THREE.Mesh(neonGridRibbon(track, side, true), wallMaterial);
    wall.name = `neon-grid-wall-${String(side)}`;
    walls.add(wall);
  }
  group.add(walls);
  const tunnelGroup = new THREE.Group();
  tunnelGroup.name = 'service-tunnel';
  const tunnelMaterial = new THREE.MeshStandardMaterial({
    color: 0x733059,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  for (const kind of ['floor', 'left-wall', 'right-wall', 'roof'] as const) {
    const mesh = new THREE.Mesh(serviceTunnelGeometry(track.serviceTunnel, kind), tunnelMaterial);
    mesh.name = `service-tunnel-${kind}`;
    mesh.receiveShadow = true;
    tunnelGroup.add(mesh);
  }
  group.add(tunnelGroup);
  const plaza = new THREE.Mesh(
    billboardFloorGeometry(track.billboardGap),
    new THREE.MeshStandardMaterial({
      color: 0x34485e,
      roughness: 0.75,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  plaza.name = 'billboard-plaza';
  plaza.receiveShadow = true;
  group.add(plaza);
  // Subtle inset grid, without moving or changing the shared support surface.
  const gap = track.billboardGap,
    length = gap.curve.getLength();
  const lines: number[] = [];
  const floorRay = new THREE.Raycaster();
  const floorPoint = (point: THREE.Vector3) => {
    if (gap.fraction(gap.project(point)) > 400 / 512) {
      floorRay.set(new THREE.Vector3(point.x, point.y + 5, point.z), new THREE.Vector3(0, -1, 0));
      const support = floorRay.intersectObjects([road, plaza], false)[0];
      if (support) point.y = support.point.y;
    }
    point.y += 0.012;
    return point;
  };
  for (let d = 0; d <= length; d += 3) {
    const fraction = d / length,
      p = gap.curve.getPointAt(fraction),
      t = gap.curve.getTangentAt(fraction);
    const right = new THREE.Vector3(t.z, 0, -t.x).normalize();
    // Subdivide only the repaired join crossbars so the subtle inlay follows
    // both floor meshes across their exact common boundary.
    const steps = fraction > 400 / 512 ? 8 : 1;
    for (let step = 0; step < steps; step++)
      for (const edge of [step, step + 1])
        lines.push(
          ...floorPoint(
            p
              .clone()
              .addScaledVector(
                right,
                THREE.MathUtils.lerp(-gap.roadHalfWidth, gap.roadHalfWidth, edge / steps),
              ),
          ).toArray(),
        );
  }
  for (const lane of [-2, 0, 2]) {
    for (let i = 0; i < 128; i++) {
      for (const fraction of [i / 128, (i + 1) / 128]) {
        const p = gap.curve.getPointAt(fraction),
          t = gap.curve.getTangentAt(fraction);
        p.addScaledVector(new THREE.Vector3(t.z, 0, -t.x).normalize(), lane);
        lines.push(...floorPoint(p).toArray());
      }
    }
  }
  const inlay = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lines, 3)),
    new THREE.LineBasicMaterial({ color: 0x7893a8, transparent: true, opacity: 0.35 }),
  );
  inlay.name = 'billboard-plaza-inlay';
  group.add(inlay);
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
  const billboardBoost = new THREE.Group();
  billboardBoost.name = 'billboard-boost-pad';
  const billboardBoostDeck = new THREE.Mesh(
    new THREE.BoxGeometry(
      track.billboardGap.boostPad.halfWidth * 2,
      0.025,
      track.billboardGap.boostPad.halfLength * 2,
    ),
    padMaterial,
  );
  billboardBoost.position.copy(
    track.billboardGap.curve.getPointAt(track.billboardGap.boostPad.centerFraction),
  );
  billboardBoost.position.y += 0.025;
  billboardBoost.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    track.billboardGap.curve.getTangentAt(track.billboardGap.boostPad.centerFraction),
  );
  billboardBoost.add(billboardBoostDeck);
  group.add(billboardBoost);
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
