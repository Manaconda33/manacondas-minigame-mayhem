import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { markBloomMaterial } from '../rendering/bloomEligibility';
import type { NeonGrid } from './NeonGrid';
import {
  NeonGridVisualClock,
  neonGridRightAt,
  neonGridRoadsideScreenGeometry,
  neonGridSurfaceSliceGeometry,
} from './NeonGridVisualCommon';
import { disposeTrackScene } from './TrackSceneResources';

const START = 0;
const END = 0.24654910452879084;
const SEGMENTS = 80;
const CYAN = 0x37e6ff;
const MAGENTA = 0xff4fd8;

interface SkylineTower {
  readonly position: THREE.Vector3;
  readonly right: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  readonly side: -1 | 1;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly baseY: number;
}

interface AdMaterial {
  readonly path: string;
  readonly material: THREE.MeshBasicMaterial;
}

function planarDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function billboardSide(track: NeonGrid): number {
  const middle = track.billboardGap.curve.getPointAt(0.5);
  return Math.sign(track.projectMain(middle).lateralOffset) || 1;
}

function billboardWallOpen(track: NeonGrid, side: number, progress: number): boolean {
  if (side !== billboardSide(track)) return false;
  const center = track.curve.getPointAt(progress);
  const right = neonGridRightAt(track, progress);
  const edge = center.addScaledVector(right, side * track.halfWidthAt(progress));
  const entry =
    (track.billboardGap.entry.progress[0] + track.billboardGap.entry.progress[1]) * 0.5;
  return (
    track.billboardGap.junctionContains(edge) ||
    Math.abs(progress - entry) < 0.006 ||
    Math.abs(progress - track.billboardGap.exitProgress) < 0.006
  );
}

function segmentCrossesBillboardOpening(
  track: NeonGrid,
  side: number,
  startProgress: number,
  endProgress: number,
): boolean {
  const middle = (startProgress + endProgress) * 0.5;
  return [startProgress, middle, endProgress].some((progress) =>
    billboardWallOpen(track, side, progress),
  );
}

function skylineEdgeGeometry(track: NeonGrid): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const thickness = 0.08;
  for (const side of [-1, 1]) {
    const base = positions.length / 3;
    for (let i = 0; i <= SEGMENTS; i++) {
      const progress = THREE.MathUtils.lerp(START, END, i / SEGMENTS);
      const center = track.curve.getPointAt(progress);
      const right = neonGridRightAt(track, progress);
      const offset = track.halfWidthAt(progress) - 0.16;
      for (const delta of [-thickness, thickness]) {
        const point = center
          .clone()
          .addScaledVector(right, side * (offset + delta))
          .add(new THREE.Vector3(0, 0.05, 0));
        positions.push(...point.toArray());
      }
      if (i < SEGMENTS) {
        const nextProgress = THREE.MathUtils.lerp(START, END, (i + 1) / SEGMENTS);
        if (segmentCrossesBillboardOpening(track, side, progress, nextProgress)) continue;
        const a = base + i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
  }
  return new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setIndex(indices);
}

function skylineFasciaGeometry(track: NeonGrid): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const side of [-1, 1]) {
    const base = positions.length / 3;
    for (let i = 0; i <= SEGMENTS; i++) {
      const progress = THREE.MathUtils.lerp(START, END, i / SEGMENTS);
      const center = track.curve.getPointAt(progress);
      const right = neonGridRightAt(track, progress);
      const top = center
        .clone()
        .addScaledVector(right, side * (track.halfWidthAt(progress) + 0.28));
      const bottom = top.clone().add(new THREE.Vector3(0, -7.5, 0));
      positions.push(...top.toArray(), ...bottom.toArray());
      if (i < SEGMENTS) {
        const nextProgress = THREE.MathUtils.lerp(START, END, (i + 1) / SEGMENTS);
        if (segmentCrossesBillboardOpening(track, side, progress, nextProgress)) continue;
        const a = base + i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function wetAsphaltMaterial(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      cyan: { value: new THREE.Color(CYAN) },
    },
    vertexShader: `varying vec2 vUv;
      varying vec3 vWorld;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `uniform float time;
      uniform vec3 cyan;
      varying vec2 vUv;
      varying vec3 vWorld;
      varying vec3 vNormal;
      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      void main() {
        float lane = abs(vUv.x - 0.5) * 2.0;
        float segment = floor(vUv.y * 0.68);
        float jitter = hash(segment * 13.37);
        float band = abs(fract(vUv.y * 0.68 + jitter) - 0.5);
        float streak = 1.0 - smoothstep(0.022, 0.09, band);
        streak *= mix(0.32, 0.92, hash(segment + floor(vUv.x * 11.0)));
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float grazing = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 1.7);
        float edge = smoothstep(0.64, 0.98, lane);
        float shimmer = 0.82 + 0.18 * sin(vUv.y * 0.14 + time * 0.07);
        vec3 tint = mix(vec3(0.24, 0.43, 0.52), cyan, 0.36 + edge * 0.42);
        float alpha = streak * grazing * shimmer * (0.055 + edge * 0.09);
        gl_FragColor = vec4(tint, clamp(alpha, 0.0, 0.19));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  material.forceSinglePass = true;
  material.userData.bloomBlackAdapter = true;
  return material;
}

function gapClearance(track: NeonGrid, point: THREE.Vector3, radius: number): number {
  const projection = track.billboardGap.project(point);
  return planarDistance(point, projection.point) - track.billboardGap.roadHalfWidth - radius;
}

function mainClearance(track: NeonGrid, point: THREE.Vector3, radius: number): number {
  const projection = track.projectMain(point);
  return projection.lateralDistance - track.halfWidthAt(projection.progress) - radius;
}

function towerFootprintClear(track: NeonGrid, point: THREE.Vector3, radius: number): boolean {
  return mainClearance(track, point, radius) >= 5 && gapClearance(track, point, radius) >= 6;
}

function steppedTowerGeometry(): THREE.BufferGeometry {
  const lower = new THREE.BoxGeometry(1, 0.62, 1);
  lower.translate(0, 0.31, 0);
  const upper = new THREE.BoxGeometry(0.74, 0.27, 0.74);
  upper.translate(0, 0.755, 0);
  const crown = new THREE.BoxGeometry(0.48, 0.11, 0.48);
  crown.translate(0, 0.945, 0);
  const merged = mergeGeometries([lower, upper, crown], false);
  lower.dispose();
  upper.dispose();
  crown.dispose();
  merged.computeVertexNormals();
  return merged;
}

function placeTowers(track: NeonGrid): SkylineTower[] {
  const towers: SkylineTower[] = [];
  for (let attempt = 0; attempt < 180 && towers.length < 22; attempt++) {
    const fraction = ((attempt * 37) % 179) / 178;
    const progress = THREE.MathUtils.lerp(START + 0.008, END - 0.008, fraction);
    const center = track.curve.getPointAt(progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const right = neonGridRightAt(track, progress);
    const side: -1 | 1 = attempt % 2 === 0 ? -1 : 1;
    const lateral = 38 + ((attempt * 17) % 31);
    const width = 11 + ((attempt * 5) % 7);
    const depth = 12 + ((attempt * 11) % 9);
    const height = 30 + ((attempt * 13) % 35);
    const position = center.clone().addScaledVector(right, side * lateral);
    const radius = Math.hypot(width, depth) * 0.52;
    if (!towerFootprintClear(track, position, radius)) continue;
    if (
      towers.some(
        (tower) =>
          planarDistance(tower.position, position) <
          (Math.hypot(tower.width, tower.depth) * 0.5 + radius) * 0.72,
      )
    )
      continue;
    towers.push({
      position,
      right,
      tangent,
      side,
      width,
      depth,
      height,
      baseY: Math.min(0, center.y - 12),
    });
  }
  if (towers.length !== 22) throw new Error(`Skyline requires 22 clear towers; got ${String(towers.length)}`);
  return towers;
}

function addStructure(group: THREE.Group, track: NeonGrid): void {
  // The formerly separate ad supports did not actually hide alternate asphalt.
  // Fuse opaque facade panels into the existing elevated-deck fascia draw call.
  const originalFascia = skylineFasciaGeometry(track);
  const billboardScreenSide = billboardSide(track) as -1 | 1;
  const wallScreens = neonGridRoadsideScreenGeometry(track, [
    {
      start: 0.038, end: 0.224, side: billboardScreenSide,
      opening: (p) => billboardWallOpen(track, billboardScreenSide, p) ||
        Math.abs(p - track.billboardGap.entry.progress[0]) < 0.010 ||
        Math.abs(p - track.billboardGap.exitProgress) < 0.010,
    },
    // Short supported expressway facades also obscure the tunnel approach.
    { start: 0.220, end: 0.244, side: -1 },
    { start: 0.220, end: 0.244, side: 1 },
  ]);
  const fasciaGeometry = mergeGeometries([originalFascia, wallScreens], false);
  if (!fasciaGeometry) throw new Error('Unable to merge Skyline roadside screens');
  const screenPanelCount = wallScreens.userData.panelCount as number;
  const mouthCuts = wallScreens.userData.openingSegments as number;
  originalFascia.dispose();
  wallScreens.dispose();
  const fascia = new THREE.Mesh(
    fasciaGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x08131f,
      roughness: 0.82,
      metalness: 0.3,
      side: THREE.DoubleSide,
    }),
  );
  fascia.name = 'skyline-deck-fascia';
  fascia.userData.sightlinePanels = screenPanelCount;
  fascia.userData.mouthCuts = mouthCuts;
  fascia.userData.presentationOnly = true;
  group.add(fascia);

  const material = new THREE.MeshStandardMaterial({
    color: 0x102536,
    roughness: 0.72,
    metalness: 0.42,
  });
  const pylons = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 11, 1.2), material, 14);
  pylons.name = 'skyline-pylons';
  const braces = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.3, 8), material, 24);
  braces.name = 'skyline-cross-braces';
  const dummy = new THREE.Object3D();

  for (let i = 0; i < pylons.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.008, END - 0.008, i / (pylons.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const preferred: -1 | 1 = i % 2 === 0 ? -1 : 1;
    const candidates = [preferred, (preferred * -1) as -1 | 1];
    const side =
      candidates.find((candidate) => {
        const point = center
          .clone()
          .addScaledVector(right, candidate * (track.halfWidthAt(progress) + 2.6));
        return gapClearance(track, point, 0.9) > 1.2;
      }) ?? preferred;
    dummy.position
      .copy(center)
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 2.6))
      .add(new THREE.Vector3(0, -5.5, 0));
    const tangent = track.curve.getTangentAt(progress);
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    pylons.setMatrixAt(i, dummy.matrix);
  }
  pylons.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < braces.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.006, END - 0.006, i / (braces.count - 1));
    const center = track.curve.getPointAt(progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const right = neonGridRightAt(track, progress);
    dummy.position.copy(center).add(new THREE.Vector3(0, -3.2 - (i % 2) * 1.7, 0));
    dummy.position.addScaledVector(right, ((i % 3) - 1) * 1.5);
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), i % 2 === 0 ? 0.62 : -0.62);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    braces.setMatrixAt(i, dummy.matrix);
  }
  braces.instanceMatrix.needsUpdate = true;
  group.add(pylons, braces);
}

function addCity(
  group: THREE.Group,
  track: NeonGrid,
  quality: GraphicsQuality,
): SkylineTower[] {
  const towerData = placeTowers(track);
  const towerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: true,
  });
  const towers = new THREE.InstancedMesh(steppedTowerGeometry(), towerMaterial, towerData.length);
  towers.name = 'skyline-city-towers';
  const dummy = new THREE.Object3D();
  const colors = [
    new THREE.Color(0x17354a),
    new THREE.Color(0x1c2f49),
    new THREE.Color(0x30294b),
    new THREE.Color(0x203d46),
  ];
  towerData.forEach((tower, i) => {
    dummy.position.set(tower.position.x, tower.baseY, tower.position.z);
    dummy.rotation.set(0, Math.atan2(tower.tangent.x, tower.tangent.z), 0);
    dummy.scale.set(tower.width, tower.height, tower.depth);
    dummy.updateMatrix();
    towers.setMatrixAt(i, dummy.matrix);
    towers.setColorAt(i, colors[i % colors.length] ?? colors[0] ?? new THREE.Color(0x142a3d));
  });
  towers.instanceMatrix.needsUpdate = true;
  if (towers.instanceColor) towers.instanceColor.needsUpdate = true;

  const rooftopMaterial = new THREE.MeshBasicMaterial({ color: 0x243e52, vertexColors: true });
  const rooftopGeometry = mergeGeometries(
    [
      new THREE.BoxGeometry(0.52, 0.24, 0.58).translate(0, 0.12, 0),
      new THREE.BoxGeometry(0.18, 0.28, 0.18).translate(0.18, 0.38, -0.12),
    ],
    false,
  );
  const rooftops = new THREE.InstancedMesh(rooftopGeometry, rooftopMaterial, towerData.length);
  rooftops.name = 'skyline-city-rooftops';
  towerData.forEach((tower, i) => {
    dummy.position.copy(tower.position).setY(tower.baseY + tower.height);
    dummy.rotation.set(0, Math.atan2(tower.tangent.x, tower.tangent.z) + (i % 3) * 0.16, 0);
    dummy.scale.set(
      tower.width * (0.38 + (i % 3) * 0.06),
      3.2 + (i % 4) * 1.15,
      tower.depth * (0.34 + ((i + 1) % 3) * 0.05),
    );
    dummy.updateMatrix();
    rooftops.setMatrixAt(i, dummy.matrix);
    rooftops.setColorAt(i, colors[(i + 1) % colors.length] ?? colors[0] ?? new THREE.Color(0x243e52));
  });
  rooftops.instanceMatrix.needsUpdate = true;
  if (rooftops.instanceColor) rooftops.instanceColor.needsUpdate = true;

  const spireMaterial = new THREE.MeshBasicMaterial({ color: 0x65ecff });
  markBloomMaterial(spireMaterial, 'color');
  const spires = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.14, 1, 6), spireMaterial, 9);
  spires.name = 'skyline-city-spires';
  let spireIndex = 0;
  for (let i = 0; i < towerData.length && spireIndex < spires.count; i += 2 + (i % 2)) {
    const tower = towerData[i];
    if (!tower) continue;
    dummy.position.copy(tower.position).setY(tower.baseY + tower.height + 3.8 + (i % 4));
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 7 + (i % 4) * 1.8, 1);
    dummy.updateMatrix();
    spires.setMatrixAt(spireIndex, dummy.matrix);
    spireIndex++;
  }
  spires.count = spireIndex;
  spires.instanceMatrix.needsUpdate = true;

  const roofMaterial = new THREE.MeshBasicMaterial({ color: CYAN });
  markBloomMaterial(roofMaterial, 'color');
  const roofs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.08, 0.16), roofMaterial, towerData.length);
  roofs.name = 'skyline-city-roof-accents';
  towerData.forEach((tower, i) => {
    dummy.position.copy(tower.position).setY(tower.baseY + tower.height + 0.08);
    dummy.rotation.set(0, Math.atan2(tower.tangent.x, tower.tangent.z), 0);
    dummy.scale.set(tower.depth * 0.34, 1, 1);
    dummy.updateMatrix();
    roofs.setMatrixAt(i, dummy.matrix);
  });
  roofs.instanceMatrix.needsUpdate = true;

  const cyan = new THREE.Color(CYAN);
  const pale = new THREE.Color(0xa9f4ff);
  const magenta = new THREE.Color(MAGENTA);

  const cornerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true });
  markBloomMaterial(cornerMaterial, 'color');
  const cornerLights = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.18, 1, 0.18),
    cornerMaterial,
    towerData.length * 2,
  );
  cornerLights.name = 'skyline-city-corner-lights';
  let cornerIndex = 0;
  towerData.forEach((tower, towerIndex) => {
    const inward = tower.right.clone().multiplyScalar(-tower.side);
    for (const along of [-1, 1]) {
      dummy.position
        .copy(tower.position)
        .addScaledVector(inward, tower.width * 0.5 + 0.09)
        .addScaledVector(tower.tangent, along * tower.depth * 0.39)
        .setY(tower.baseY + tower.height * 0.43);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, tower.height * 0.68, 1);
      dummy.updateMatrix();
      cornerLights.setMatrixAt(cornerIndex, dummy.matrix);
      cornerLights.setColorAt(cornerIndex, towerIndex % 4 === 0 ? magenta : cyan);
      cornerIndex++;
    }
  });
  cornerLights.instanceMatrix.needsUpdate = true;
  if (cornerLights.instanceColor) cornerLights.instanceColor.needsUpdate = true;

  const windowCount = quality === 'low' ? 120 : quality === 'high' ? 360 : 240;
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  markBloomMaterial(windowMaterial, 'color');
  const windows = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(1.6, 0.5),
    windowMaterial,
    windowCount,
  );
  windows.name = 'skyline-city-windows';
  for (let i = 0; i < windowCount; i++) {
    const tower = towerData[(i * 7) % towerData.length];
    if (!tower) continue;
    const rowFraction = 0.12 + (((i * 5) % 17) / 16) * 0.7;
    const upper = rowFraction > 0.62;
    const stageWidth = tower.width * (upper ? 0.74 : 1);
    const stageDepth = tower.depth * (upper ? 0.74 : 1);
    const inward = tower.right.clone().multiplyScalar(-tower.side);
    const useInwardFace = i % 4 !== 0;
    const normal = useInwardFace
      ? inward
      : tower.tangent.clone().multiplyScalar(i % 8 === 0 ? 1 : -1);
    const horizontal = useInwardFace ? tower.tangent : tower.right;
    const span = useInwardFace ? stageDepth : stageWidth;
    const column = ((i * 11) % 7) / 6 - 0.5;
    dummy.position.copy(tower.position).setY(tower.baseY + tower.height * rowFraction);
    dummy.position.addScaledVector(
      normal,
      (useInwardFace ? stageWidth : stageDepth) * 0.5 + 0.12,
    );
    dummy.position.addScaledVector(horizontal, column * span * 0.72);
    dummy.rotation.set(0, Math.atan2(normal.x, normal.z), 0);
    dummy.scale.set(1.25 + (i % 4) * 0.42, 1 + (i % 2) * 0.22, 1);
    dummy.updateMatrix();
    windows.setMatrixAt(i, dummy.matrix);
    windows.setColorAt(i, i % 19 === 0 ? magenta : i % 5 === 0 ? pale : cyan);
  }
  windows.instanceMatrix.needsUpdate = true;
  if (windows.instanceColor) windows.instanceColor.needsUpdate = true;

  group.add(towers, rooftops, spires, roofs, cornerLights, windows);
  group.userData.skylineLogicalTowerCount = towerData.length;
  return towerData;
}

function addProceduralSignage(group: THREE.Group, towers: SkylineTower[]): void {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: CYAN,
    emissiveIntensity: 0.82,
    roughness: 0.42,
    metalness: 0.18,
    vertexColors: true,
  });
  markBloomMaterial(material, 'emissive');
  const signs = new THREE.InstancedMesh(new THREE.BoxGeometry(3.2, 1.15, 0.1), material, 18);
  signs.name = 'skyline-procedural-signage';
  const dummy = new THREE.Object3D();
  const cyan = new THREE.Color(CYAN);
  const magenta = new THREE.Color(MAGENTA);
  for (let i = 0; i < signs.count; i++) {
    const tower = towers[(i * 5 + 3) % towers.length];
    if (!tower) continue;
    const inward = tower.right.clone().multiplyScalar(-tower.side);
    dummy.position
      .copy(tower.position)
      .addScaledVector(inward, tower.width * 0.5 + 0.06)
      .setY(tower.baseY + tower.height * (0.28 + (i % 4) * 0.11));
    dummy.position.addScaledVector(tower.tangent, (((i * 7) % 5) / 4 - 0.5) * tower.depth * 0.42);
    dummy.rotation.set(0, Math.atan2(inward.x, inward.z), 0);
    dummy.scale.set(0.85 + (i % 3) * 0.12, 0.9 + (i % 2) * 0.12, 1);
    dummy.updateMatrix();
    signs.setMatrixAt(i, dummy.matrix);
    signs.setColorAt(i, i % 5 === 0 ? magenta : cyan);
  }
  signs.instanceMatrix.needsUpdate = true;
  if (signs.instanceColor) signs.instanceColor.needsUpdate = true;
  group.add(signs);
}

function addApprovedAds(
  group: THREE.Group,
  track: NeonGrid,
  towers: SkylineTower[],
  materials: AdMaterial[],
): void {
  const definitions = [
    {
      name: 'skyline-ad-manaconda-racing',
      path: 'assets/track/neon-grid/signage/manaconda-racing-v1.webp',
      towerIndices: [2, 9, 16],
    },
    {
      name: 'skyline-ad-taco-bell-live-mas',
      path: 'assets/track/neon-grid/signage/taco-bell-live-mas-v1.webp',
      towerIndices: [5, 12, 20],
    },
  ] as const;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x102332,
    emissive: CYAN,
    emissiveIntensity: 0.18,
    roughness: 0.5,
    metalness: 0.5,
  });
  const frames = new THREE.InstancedMesh(new THREE.BoxGeometry(8.45, 4.45, 0.12), frameMaterial, 14);
  frames.name = 'skyline-ad-supports';
  // T9.5 camouflage: reuse already-approved sponsor textures as ordinary,
  // architecturally supported roadside advertising, not new hologram tells.
  // Four boards per sponsor flank BOTH sides of the real billboard approach.
  const feet = new THREE.BoxGeometry(0.48, 5.5, 0.65).translate(-3.55, 2.75, -0.25);
  const secondFoot = new THREE.BoxGeometry(0.48, 5.5, 0.65).translate(3.55, 2.75, -0.25);
  const backing = new THREE.BoxGeometry(8.7, 4.7, 0.48).translate(0, 5.45, -0.12);
  const supportGeometry = mergeGeometries([feet, secondFoot, backing], false);
  for (const part of [feet, secondFoot, backing]) part.dispose();
  const supports = new THREE.InstancedMesh(
    supportGeometry,
    new THREE.MeshStandardMaterial({ color: 0x243747, roughness: 0.76, metalness: 0.33 }),
    8,
  );
  supports.name = 'skyline-mask-roadside-billboard-supports';
  supports.userData.immutableSponsorArt = true;
  supports.userData.camouflageProgress = [0.052, 0.076, 0.135, 0.184, 0.060, 0.085, 0.146, 0.194];
  const decoyProgresses = [
    [0.052, 0.076, 0.135, 0.184],
    [0.060, 0.085, 0.146, 0.194],
  ];
  const dummy = new THREE.Object3D();
  let frameIndex = 0;
  let supportIndex = 0;
  let sponsorIndex = 0;

  for (const definition of definitions) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: new THREE.Texture(),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    materials.push({ path: definition.path, material });
    const ads = new THREE.InstancedMesh(new THREE.PlaneGeometry(8, 4), material, 7);
    ads.name = definition.name;
    definition.towerIndices.forEach((towerIndex, i) => {
      const tower = towers[towerIndex];
      if (!tower) throw new Error('Skyline ad requires an authored tower mount');
      const inward = tower.right.clone().multiplyScalar(-tower.side);
      const y = tower.baseY + Math.min(tower.height * 0.48, tower.height - 5.5);
      const facade = tower.position
        .clone()
        .addScaledVector(inward, tower.width * 0.5 + 0.085)
        .setY(y);
      dummy.position.copy(facade);
      dummy.rotation.set(0, Math.atan2(inward.x, inward.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ads.setMatrixAt(i, dummy.matrix);

      dummy.position.copy(facade).addScaledVector(inward, -0.08);
      dummy.updateMatrix();
      frames.setMatrixAt(frameIndex, dummy.matrix);
      frameIndex++;
    });
    const progressSamples = decoyProgresses[sponsorIndex];
    if (!progressSamples) throw new Error('Skyline sponsor mask progress unavailable');
    for (let i = 0; i < progressSamples.length; i++) {
      const progress = progressSamples[i];
      if (progress === undefined) continue;
      const center = track.curve.getPointAt(progress);
      const right = neonGridRightAt(track, progress);
      const side = (i + sponsorIndex) % 2 === 0 ? -1 : 1;
      const inward = right.clone().multiplyScalar(-side);
      let offset = track.halfWidthAt(progress) + 8.5;
      let foot = center.clone().addScaledVector(right, side * offset);
      // Never mask a real route or shortcut aperture with a static ad support.
      for (let attempt = 0; attempt < 6 &&
        (mainClearance(track, foot, 5) < 3 || gapClearance(track, foot, 5) < 4);
        attempt++
      ) {
        offset += 5;
        foot = center.clone().addScaledVector(right, side * offset);
      }
      foot.y = center.y - 2.4;
      const facing = Math.atan2(inward.x, inward.z);
      dummy.position.copy(foot);
      dummy.rotation.set(0, facing, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      supports.setMatrixAt(supportIndex++, dummy.matrix);
      // Fixed billboards share approved artwork with tower advertisements.
      // Unlike the real portal, they never flicker or indicate ON/OFF state.
      dummy.position.copy(foot).add(new THREE.Vector3(0, 5.45, 0))
        .addScaledVector(inward, 0.21);
      dummy.updateMatrix();
      ads.setMatrixAt(3 + i, dummy.matrix);
      dummy.position.addScaledVector(inward, -0.20);
      dummy.updateMatrix();
      frames.setMatrixAt(frameIndex++, dummy.matrix);
    }
    sponsorIndex++;
    ads.instanceMatrix.needsUpdate = true;
    group.add(ads);
  }
  supports.instanceMatrix.needsUpdate = true;
  frames.instanceMatrix.needsUpdate = true;
  group.add(frames, supports);
}

export class SkylineVisual {
  public readonly group = new THREE.Group();
  private readonly animatedMaterials: THREE.ShaderMaterial[] = [];
  private readonly adMaterials: AdMaterial[] = [];
  private readonly clock = new NeonGridVisualClock();
  private disposed = false;

  public constructor(track: NeonGrid, quality: GraphicsQuality) {
    this.group.name = 'skyline-visual';
    this.group.userData.progressRange = [START, END];
    this.group.userData.quality = quality;

    const roadGeometry = neonGridSurfaceSliceGeometry(track, START, END);
    const asphaltBase = new THREE.Mesh(
      roadGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x06121d,
        roughness: 0.36,
        metalness: 0.3,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    asphaltBase.name = 'skyline-asphalt-base';
    asphaltBase.receiveShadow = true;
    this.group.add(asphaltBase);

    if (quality !== 'low') {
      const wetMaterial = wetAsphaltMaterial();
      this.animatedMaterials.push(wetMaterial);
      const wet = new THREE.Mesh(roadGeometry.clone(), wetMaterial);
      wet.name = 'skyline-wet-asphalt';
      wet.renderOrder = -10;
      this.group.add(wet);
    }

    const edgeMaterial = new THREE.MeshBasicMaterial({ color: CYAN });
    markBloomMaterial(edgeMaterial, 'color');
    const edges = new THREE.Mesh(skylineEdgeGeometry(track), edgeMaterial);
    edges.name = 'skyline-cyan-edges';
    this.group.add(edges);

    addStructure(this.group, track);
    const towers = addCity(this.group, track, quality);
    addProceduralSignage(this.group, towers);
    addApprovedAds(this.group, track, towers, this.adMaterials);
  }

  public async load(): Promise<void> {
    const loader = new THREE.TextureLoader();
    const results = await Promise.allSettled(
      this.adMaterials.map(({ path }) => loader.loadAsync(`${import.meta.env.BASE_URL}${path}`)),
    );
    results.forEach((result, i) => {
      if (result.status === 'rejected') return;
      const texture = result.value;
      const target = this.adMaterials[i];
      if (!target || this.disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      target.material.map?.dispose();
      target.material.map = texture;
      target.material.needsUpdate = true;
    });
    if (results.some((result) => result.status === 'rejected'))
      throw new Error('Neon Grid Skyline approved signage failed to load');
  }

  public update(time: number): void {
    if (this.disposed) return;
    const visualTime = this.clock.update(time, this.group.visible);
    if (!this.group.visible) return;
    for (const material of this.animatedMaterials) {
      const clock = material.uniforms.time;
      if (clock) clock.value = visualTime;
    }
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.animatedMaterials.length = 0;
    this.adMaterials.length = 0;
    disposeTrackScene(this.group);
  }
}
