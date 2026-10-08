import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { neonGridRibbon } from './NeonGridGeometry';
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

const START = 0.24654910452879084;
const END = 0.46154128347522666;
const MAGENTA = 0xff4fd8;
const CYAN = 0x37e6ff;

interface UndercityBuilding {
  readonly position: THREE.Vector3;
  readonly right: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  readonly side: -1 | 1;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly baseY: number;
  readonly progress: number;
}

interface AdMaterial {
  readonly path: string;
  readonly material: THREE.MeshBasicMaterial;
}

function tunnelWallOpen(track: NeonGrid, side: number, progress: number): boolean {
  const center = track.curve.getPointAt(progress);
  const right = neonGridRightAt(track, progress);
  const edge = center.addScaledVector(right, side * track.halfWidthAt(progress));
  return track.serviceTunnel.junctionContains(edge);
}

function segmentCrossesTunnelOpening(
  track: NeonGrid,
  side: number,
  startProgress: number,
  endProgress: number,
): boolean {
  const middle = (startProgress + endProgress) * 0.5;
  return [startProgress, middle, endProgress].some((progress) =>
    tunnelWallOpen(track, side, progress),
  );
}

function edgeGeometry(track: NeonGrid): THREE.BufferGeometry {
  // Sample the accepted dense native road *edge vertices* instead of drawing a coarse
  // 72-chord ribbon across the switchbacks. The latter cut through the driving mesh.
  const native = neonGridRibbon(track);
  const positions = native.getAttribute('position');
  const rows = Number(native.userData.ribbonRows);
  const vertices: number[] = [];
  const indices: number[] = [];
  const edge = new THREE.Vector3();
  for (const side of [-1, 1] as const) {
    const samples: { progress: number; index: number }[] = [];
    for (let row = 0; row <= rows; row++) {
      const progress = row / rows;
      if (progress < START || progress > END) continue;
      const start = vertices.length / 3;
      edge.fromBufferAttribute(positions, row * 2 + (side === -1 ? 0 : 1));
      const inward = neonGridRightAt(track, progress).multiplyScalar(-side);
      for (const lateral of [0.13, 0.28]) {
        const point = edge.clone().addScaledVector(inward, lateral);
        point.y += 0.055;
        vertices.push(...point.toArray());
      }
      samples.push({ progress, index: start });
    }
    for (let i = 1; i < samples.length; i++) {
      const previous = samples[i - 1];
      const current = samples[i];
      if (!previous || !current) continue;
      if (segmentCrossesTunnelOpening(track, side, previous.progress, current.progress)) continue;
      indices.push(previous.index, current.index, previous.index + 1);
      indices.push(previous.index + 1, current.index, current.index + 1);
    }
  }
  native.dispose();
  return new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    .setIndex(indices);
}

function wetAsphaltMaterial(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      magenta: { value: new THREE.Color(MAGENTA) },
      cyan: { value: new THREE.Color(CYAN) },
    },
    vertexShader: [
      'varying vec2 vUv;',
      'varying vec3 vWorld;',
      'varying vec3 vNormal;',
      'void main() {',
      '  vUv = uv;',
      '  vec4 world = modelMatrix * vec4(position, 1.0);',
      '  vWorld = world.xyz;',
      '  vNormal = normalize(mat3(modelMatrix) * normal);',
      '  gl_Position = projectionMatrix * viewMatrix * world;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform float time;',
      'uniform vec3 magenta;',
      'uniform vec3 cyan;',
      'varying vec2 vUv;',
      'varying vec3 vWorld;',
      'varying vec3 vNormal;',
      'float hash(float n) { return fract(sin(n) * 43758.5453123); }',
      'void main() {',
      '  float lane = abs(vUv.x - 0.5) * 2.0;',
      '  float segment = floor(vUv.y * 0.61);',
      '  float jitter = hash(segment * 11.73);',
      '  float band = abs(fract(vUv.y * 0.61 + jitter) - 0.5);',
      '  float streak = 1.0 - smoothstep(0.024, 0.105, band);',
      '  streak *= mix(0.28, 0.78, hash(segment + floor(vUv.x * 9.0)));',
      '  vec3 viewDir = normalize(cameraPosition - vWorld);',
      '  float grazing = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 1.8);',
      '  float edge = smoothstep(0.68, 0.98, lane);',
      '  float shimmer = 0.88 + 0.12 * sin(vUv.y * 0.12 + time * 0.055);',
      '  vec3 tint = mix(vec3(0.24, 0.12, 0.28), magenta, 0.42 + edge * 0.35);',
      '  tint = mix(tint, cyan, edge * 0.08);',
      '  float alpha = streak * grazing * shimmer * (0.042 + edge * 0.07);',
      '  gl_FragColor = vec4(tint, clamp(alpha, 0.0, 0.15));',
      '  #include <tonemapping_fragment>',
      '  #include <colorspace_fragment>',
      '}',
    ].join('\n'),
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

function mainClearance(track: NeonGrid, point: THREE.Vector3, radius: number): number {
  const projection = track.projectMain(point);
  return projection.lateralDistance - track.halfWidthAt(projection.progress) - radius;
}

function tunnelClearance(track: NeonGrid, point: THREE.Vector3, radius: number): number {
  const projection = track.serviceTunnel.project(point);
  // The tunnel is a finite chord. lateralDistance alone treats its infinite
  // extension beyond each mouth as another drivable corridor, rejecting safe
  // decoys near adjacent switchbacks. Use the planar distance to the clamped
  // tunnel centerline instead, including each endpoint.
  const planar = Math.hypot(point.x - projection.point.x, point.z - projection.point.z);
  return planar - track.serviceTunnel.roadHalfWidth - radius;
}

function buildingGeometry(): THREE.BufferGeometry {
  // Single merged silhouette keeps the original one-draw-call building family.
  const parts: THREE.BoxGeometry[] = [];
  function tier(x: number, y: number, z: number, sx: number, sy: number, sz: number): void {
    const box = new THREE.BoxGeometry(sx, sy, sz);
    box.translate(x, y, z);
    parts.push(box);
  }
  tier(0, 0.29, 0, 1, 0.58, 1);          // load-bearing main floor block
  tier(0.08, 0.73, 0.01, 0.84, 0.3, 0.82); // recessed warehouse upper floor
  tier(-0.08, 0.94, 0, 0.64, 0.12, 0.68); // roof plant level
  tier(0.08, 0.89, 0.01, 0.91, 0.035, 0.9); // projecting cornice
  tier(-0.08, 0.998, 0, 0.71, 0.025, 0.76); // roof parapet
  tier(0.39, 0.17, -0.29, 0.2, 0.34, 0.28); // service annexes
  tier(-0.36, 0.22, 0.27, 0.24, 0.44, 0.31);
  const merged = mergeGeometries(parts, false);
  for (const part of parts) part.dispose();
  merged.computeVertexNormals();
  return merged;
}

function placeBuildings(track: NeonGrid): UndercityBuilding[] {
  const buildings: UndercityBuilding[] = [];
  for (let attempt = 0; attempt < 220 && buildings.length < 16; attempt++) {
    const fraction = ((attempt * 43) % 211) / 210;
    const progress = THREE.MathUtils.lerp(START + 0.006, END - 0.006, fraction);
    const center = track.curve.getPointAt(progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const right = neonGridRightAt(track, progress);
    const side: -1 | 1 = attempt % 2 === 0 ? -1 : 1;
    const width = 7 + ((attempt * 3) % 5);
    const depth = 8 + ((attempt * 7) % 6);
    const height = 12 + ((attempt * 11) % 13);
    const lateral = 17 + ((attempt * 13) % 11);
    const position = center.clone().addScaledVector(right, side * lateral);
    const radius = Math.hypot(width, depth) * 0.5;
    if (mainClearance(track, position, radius) < 3) continue;
    if (tunnelClearance(track, position, radius) < 4) continue;
    if (
      buildings.some(
        (building) =>
          Math.hypot(building.position.x - position.x, building.position.z - position.z) <
          (Math.hypot(building.width, building.depth) * 0.5 + radius) * 0.68,
      )
    )
      continue;
    buildings.push({
      position,
      right,
      tangent,
      side,
      width,
      depth,
      height,
      baseY: center.y - 0.12,
      progress,
    });
  }
  if (buildings.length !== 16)
    throw new Error('Undercity requires 16 clear building masses; got ' + String(buildings.length));
  return buildings;
}

function addBuildings(
  group: THREE.Group,
  track: NeonGrid,
  quality: GraphicsQuality,
): UndercityBuilding[] {
  const data = placeBuildings(track);
  const buildingMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: true,
  });
  const buildings = new THREE.InstancedMesh(buildingGeometry(), buildingMaterial, data.length);
  buildings.name = 'undercity-city-buildings';
  const dummy = new THREE.Object3D();
  const colors = [
    new THREE.Color(0x303b4d),
    new THREE.Color(0x393349),
    new THREE.Color(0x283d43),
    new THREE.Color(0x40344a),
  ];
  data.forEach((building, i) => {
    dummy.position.set(building.position.x, building.baseY, building.position.z);
    dummy.rotation.set(0, Math.atan2(building.tangent.x, building.tangent.z), 0);
    dummy.scale.set(building.width, building.height, building.depth);
    dummy.updateMatrix();
    buildings.setMatrixAt(i, dummy.matrix);
    buildings.setColorAt(i, colors[i % colors.length] ?? colors[0] ?? new THREE.Color(0x303b4d));
  });
  buildings.instanceMatrix.needsUpdate = true;
  if (buildings.instanceColor) buildings.instanceColor.needsUpdate = true;

  // T9.5: preserve every accepted physical support, roof plant, facade rib
  // and loading door, but batch the cube-based parts in one instanced family.
  // The ranges are explicit so tests validate every former visual component.
  const buildingCount = data.length;
  const partRanges = {
    foundations: { start: 0, count: buildingCount },
    roofPlants: { start: buildingCount, count: buildingCount * 2 },
    facadeRibs: { start: buildingCount * 3, count: buildingCount * 2 },
    loadingBays: { start: buildingCount * 5, count: buildingCount },
  };
  const industrial = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.72, metalness: 0.4,
    }),
    buildingCount * 6,
  );
  industrial.name = 'undercity-industrial-architecture';
  industrial.userData.partRanges = partRanges;
  const foundationColor = new THREE.Color(0x252f3c);
  const roofColor = new THREE.Color(0x344452);
  const loadingColor = new THREE.Color(0x586276);
  data.forEach((building, i) => {
    dummy.position.set(building.position.x, building.baseY - 4.25, building.position.z);
    dummy.rotation.set(0, Math.atan2(building.tangent.x, building.tangent.z), 0);
    dummy.scale.set(building.width + 1.4, 8.6, building.depth + 1.4);
    dummy.updateMatrix();
    industrial.setMatrixAt(partRanges.foundations.start + i, dummy.matrix);
    industrial.setColorAt(partRanges.foundations.start + i, foundationColor);
    const inward = building.right.clone().multiplyScalar(-building.side);
    dummy.position.copy(building.position)
      .addScaledVector(inward, building.width * 0.5 + 0.25)
      .setY(building.baseY + 2.15);
    dummy.rotation.set(0, Math.atan2(inward.x, inward.z), 0);
    dummy.scale.set(3.1, 4.1, 0.22);
    dummy.updateMatrix();
    industrial.setMatrixAt(partRanges.loadingBays.start + i, dummy.matrix);
    industrial.setColorAt(partRanges.loadingBays.start + i, loadingColor);
    for (let index = 0; index < 2; index++) {
      dummy.position.copy(building.position)
        .addScaledVector(inward, building.width * 0.5 + 0.07)
        .addScaledVector(building.tangent, (index === 0 ? -1 : 1) * building.depth * 0.34)
        .setY(building.baseY + building.height * 0.29);
      dummy.scale.set(0.32, building.height * 0.58, 0.34);
      dummy.updateMatrix();
      const ribIndex = partRanges.facadeRibs.start + i * 2 + index;
      industrial.setMatrixAt(ribIndex, dummy.matrix);
      industrial.setColorAt(ribIndex, roofColor);
      dummy.position.copy(building.position)
        .addScaledVector(building.tangent, (index === 0 ? -1 : 1) * building.depth * 0.2)
        .setY(building.baseY + building.height + 0.64);
      dummy.scale.set(index === 0 ? 2.5 : 1.8, 1.28, index === 0 ? 2 : 1.6);
      dummy.updateMatrix();
      const roofIndex = partRanges.roofPlants.start + i * 2 + index;
      industrial.setMatrixAt(roofIndex, dummy.matrix);
      industrial.setColorAt(roofIndex, roofColor);
    }
  });
  industrial.instanceMatrix.needsUpdate = true;
  if (industrial.instanceColor) industrial.instanceColor.needsUpdate = true;

  const windowCount = quality === 'low' ? 80 : quality === 'high' ? 240 : 160;
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  markBloomMaterial(windowMaterial, 'color');
  const windows = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(1.15, 0.34),
    windowMaterial,
    windowCount,
  );
  windows.name = 'undercity-city-windows';
  const magenta = new THREE.Color(MAGENTA);
  const cyan = new THREE.Color(CYAN);
  const violet = new THREE.Color(0xb466ff);
  for (let i = 0; i < windowCount; i++) {
    const building = data[(i * 7) % data.length];
    if (!building) continue;
    const inward = building.right.clone().multiplyScalar(-building.side);
    const useInwardFace = i % 5 !== 0;
    const normal = useInwardFace
      ? inward
      : building.tangent.clone().multiplyScalar(i % 10 === 0 ? 1 : -1);
    const horizontal = useInwardFace ? building.tangent : building.right;
    const span = useInwardFace ? building.depth : building.width;
    dummy.position
      .copy(building.position)
      .setY(building.baseY + building.height * (0.12 + (((i * 5) % 13) / 12) * 0.4));
    dummy.position.addScaledVector(
      normal,
      (useInwardFace ? building.width : building.depth) * 0.5 + 0.08,
    );
    dummy.position.addScaledVector(horizontal, ((((i * 11) % 7) / 6) - 0.5) * span * 0.68);
    dummy.rotation.set(0, Math.atan2(normal.x, normal.z), 0);
    dummy.scale.set(0.9 + (i % 3) * 0.22, 0.9 + (i % 2) * 0.2, 1);
    dummy.updateMatrix();
    windows.setMatrixAt(i, dummy.matrix);
    windows.setColorAt(i, i % 17 === 0 ? cyan : i % 7 === 0 ? violet : magenta);
  }
  windows.instanceMatrix.needsUpdate = true;
  if (windows.instanceColor) windows.instanceColor.needsUpdate = true;

  group.add(buildings, industrial, windows);
  group.userData.undercityLogicalBuildingCount = data.length;
  return data;
}

function addUtilityClutter(
  group: THREE.Group, track: NeonGrid, buildings: UndercityBuilding[],
): void {
  // The 20 junction boxes and their 20 solid pads share one static batch;
  // colors and exact transforms are retained for every individual piece.
  const utilityCount = 20;
  const utility = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.74, metalness: 0.35 }),
    utilityCount * 2,
  );
  utility.name = 'undercity-utility-clutter';
  utility.userData.boxCount = utilityCount;
  utility.userData.padCount = utilityCount;
  const utilityBoxColor = new THREE.Color(0x171b28);
  const utilityPadColor = new THREE.Color(0x222432);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < utilityCount; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.008, END - 0.008, i / (utilityCount - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const side = i % 2 === 0 ? -1 : 1;
    const x = 1.2 + (i % 3) * 0.28;
    const y = 1.4 + (i % 4) * 0.25;
    const z = 1 + (i % 2) * 0.3;
    const foot = center.clone()
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 3.8 + (i % 3) * 0.8));
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z) + (i % 3 - 1) * 0.22, 0);
    dummy.position.copy(foot).add(new THREE.Vector3(0, y * 0.5, 0));
    dummy.scale.set(x, y, z);
    dummy.updateMatrix();
    utility.setMatrixAt(i, dummy.matrix);
    utility.setColorAt(i, utilityBoxColor);
    dummy.position.copy(foot).add(new THREE.Vector3(0, -0.32, 0));
    dummy.scale.set(x + 0.7, 0.7, z + 0.7);
    dummy.updateMatrix();
    utility.setMatrixAt(utilityCount + i, dummy.matrix);
    utility.setColorAt(utilityCount + i, utilityPadColor);
  }
  utility.instanceMatrix.needsUpdate = true;
  if (utility.instanceColor) utility.instanceColor.needsUpdate = true;

  // Pipes terminate at the foundation and roof of actual buildings. Former
  // road-relative horizontal cylinders had no architectural anchors.
  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b3752, roughness: 0.52, metalness: 0.58,
  });
  const pipes = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.14, 1, 8), pipeMaterial, 26,
  );
  pipes.name = 'undercity-pipes';
  for (let i = 0; i < pipes.count; i++) {
    const building = buildings[i % buildings.length];
    if (!building) continue;
    const inward = building.right.clone().multiplyScalar(-building.side);
    const lane = i % 2 === 0 ? -0.35 : 0.35;
    const height = building.height * (i % 4 === 0 ? 0.93 : 0.6);
    dummy.position.copy(building.position)
      .addScaledVector(inward, building.width * 0.5 + 0.2)
      .addScaledVector(building.tangent, lane * building.depth)
      .setY(building.baseY + height * 0.5);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, height, 1);
    dummy.updateMatrix();
    pipes.setMatrixAt(i, dummy.matrix);
  }
  pipes.instanceMatrix.needsUpdate = true;

  // Facade-mounted lamps no longer hang in open air beside the corridor.
  const lightMaterial = new THREE.MeshBasicMaterial({ color: MAGENTA, vertexColors: true });
  markBloomMaterial(lightMaterial, 'color');
  const lights = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.12, 0.16), lightMaterial, 24);
  lights.name = 'undercity-work-lights';
  const magenta = new THREE.Color(MAGENTA);
  const cyan = new THREE.Color(CYAN);
  for (let i = 0; i < lights.count; i++) {
    const building = buildings[i % buildings.length];
    if (!building) continue;
    const inward = building.right.clone().multiplyScalar(-building.side);
    dummy.position.copy(building.position)
      .addScaledVector(inward, building.width * 0.5 + 0.21)
      .addScaledVector(building.tangent, ((i % 3) - 1) * building.depth * 0.22)
      .setY(building.baseY + building.height * 0.34);
    dummy.rotation.set(0, Math.atan2(inward.x, inward.z), 0);
    dummy.scale.set(1.5, 1.2, 1);
    dummy.updateMatrix();
    lights.setMatrixAt(i, dummy.matrix);
    lights.setColorAt(i, i % 8 === 0 ? cyan : magenta);
  }
  lights.instanceMatrix.needsUpdate = true;
  if (lights.instanceColor) lights.instanceColor.needsUpdate = true;
  group.add(utility, pipes, lights);
}

/**
 * T9.5 facade ventilation is physically wall-backed, with all 48 slats
 * permanently baked into the 16 local housing prefabs. One material/batch
 * replaces separate housing/louver draws without losing geometry.
 */
function addFacadeVentilation(group: THREE.Group, buildings: UndercityBuilding[]): void {
  const parts: { geometry: THREE.BoxGeometry; color: THREE.Color }[] = [
    { geometry: new THREE.BoxGeometry(2.2, 1.45, 0.45), color: new THREE.Color(0x42505d) },
  ];
  for (let slot = 0; slot < 3; slot++) {
    parts.push({
      geometry: new THREE.BoxGeometry(1.82, 0.11, 0.12)
        .translate(0, (slot - 1) * 0.32, 0.255),
      color: new THREE.Color(0x9ba3b2),
    });
  }
  for (const { geometry, color } of parts) {
    const count = geometry.getAttribute('position').count;
    const colors = new Float32Array(count * 3);
    for (let j = 0; j < count; j++) color.toArray(colors, j * 3);
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  const geometry = mergeGeometries(parts.map((part) => part.geometry), false);
  for (const part of parts) part.geometry.dispose();
  geometry.userData.ventParts = 4;
  geometry.userData.slatsPerBank = 3;
  const banks = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: true, roughness: 0.56, metalness: 0.66,
    }),
    buildings.length,
  );
  banks.name = 'undercity-facade-vent-banks';
  const dummy = new THREE.Object3D();
  buildings.forEach((building, i) => {
    const outward = building.right.clone().multiplyScalar(-building.side);
    const y = building.baseY + Math.min(building.height * 0.74, building.height - 2.2);
    const wall = building.position.clone()
      .addScaledVector(outward, building.width * 0.5 + 0.28).setY(y);
    dummy.position.copy(wall);
    dummy.rotation.set(0, Math.atan2(outward.x, outward.z), 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    banks.setMatrixAt(i, dummy.matrix);
  });
  banks.instanceMatrix.needsUpdate = true;
  group.add(banks);
}


function addWallsideSightlineScreens(group: THREE.Group, track: NeonGrid): void {
  // Existing false service bays are useful texture but did not occlude the
  // actual shortcut roadway. This continuous opaque facade now does.
  const opening = (side: -1 | 1, progress: number): boolean =>
    tunnelWallOpen(track, side, progress) ||
    Math.abs(progress - track.serviceTunnel.entry.progress[0]) < 0.009 ||
    Math.abs(progress - track.serviceTunnel.exitProgress) < 0.010;
  const screens = new THREE.Mesh(
    neonGridRoadsideScreenGeometry(track, [
      { start: START + 0.009, end: END - 0.006, side: -1,
        opening: (progress) => opening(-1, progress) },
      { start: START + 0.009, end: END - 0.006, side: 1,
        opening: (progress) => opening(1, progress) },
    ]),
    new THREE.MeshStandardMaterial({
      color: 0x242637, roughness: 0.76, metalness: 0.28,
      side: THREE.DoubleSide,
    }),
  );
  screens.name = 'undercity-wallside-sightline-screens';
  screens.userData.presentationOnly = true;
  screens.userData.sightlinePanels = screens.geometry.userData.panelCount as number;
  screens.userData.mouthCuts = screens.geometry.userData.openingSegments as number;
  group.add(screens);
}

function addServiceBayMask(group: THREE.Group, track: NeonGrid): void {
  // T9.5: the actual tunnel mouth must read as ONE of many similar service
  // openings. Distribute dark bays throughout the driving corridor, including
  // immediately after its real entrance and before its exit. The fake bays
  // have solid backing, no physical drivable branch and no collider.
  const progresses = [
    START + 0.004, START + 0.014, START + 0.027, START + 0.045,
    START + 0.064, START + 0.084, START + 0.105, START + 0.125,
    START + 0.148, START + 0.168, END - 0.032, END - 0.018,
    END - 0.009, END - 0.003,
  ];
  // Combine the solid support, jambs, lintel, threshold and dark false
  // opening into one instanced prefab. Colors remain per vertex: no extra
  // draw pass and no opening gains physical gameplay collision.
  const base = new THREE.BoxGeometry(6.45, 6.4, 1.15);
  const left = new THREE.BoxGeometry(0.34, 4.05, 0.23).translate(-2.92, 0.25, 0.65);
  const rightJamb = new THREE.BoxGeometry(0.34, 4.05, 0.23).translate(2.92, 0.25, 0.65);
  const lintel = new THREE.BoxGeometry(6.1, 0.32, 0.25).translate(0, 2.42, 0.65);
  const threshold = new THREE.BoxGeometry(6.45, 0.35, 1.75).translate(0, -3.15, 0.38);
  // The old face was 0.67 m above and 0.64 m forward of the back's origin.
  const face = new THREE.BoxGeometry(5.45, 3.72, 0.18).translate(0, 0.67, 0.64);
  const parts = [base, left, rightJamb, lintel, threshold, face];
  parts.forEach((geometry, index) => {
    const color = new THREE.Color(index === parts.length - 1 ? 0x111320 : 0x272d3b);
    const count = geometry.getAttribute('position').count;
    const colors = new Float32Array(count * 3);
    for (let j = 0; j < count; j++) color.toArray(colors, j * 3);
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  });
  const geometry = mergeGeometries(parts, false);
  for (const part of parts) part.dispose();
  geometry.userData.prefabParts = parts.length;
  const bays = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: true, emissive: 0x08030a,
      emissiveIntensity: 0.18, roughness: 0.75, metalness: 0.38,
    }),
    progresses.length,
  );
  bays.name = 'undercity-service-bays';
  bays.userData.camouflageProgress = progresses;
  const dummy = new THREE.Object3D();
  progresses.forEach((progress, i) => {
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const preferredSide = i % 2 === 0 ? -1 : 1;
    // Switchback loops can put a *different* stretch of road behind the
    // intended roadside facade. Search both sides and fail closed rather
    // than silently placing an unsafe bay after a fixed five retries.
    let placement: { foot: THREE.Vector3; side: number } | null = null;
    // Sparse escalating offsets avoid dozens of expensive full-route
    // projections per bay on low-power mobile hardware and CI SwiftShader.
    // Both sides are checked at each distance; never accept an unsafe fallback.
    for (const distance of [5.4, 9, 14, 21, 30, 42, 57, 75]) {
      if (placement) break;
      const offset = track.halfWidthAt(progress) + distance;
      for (const candidateSide of [preferredSide, -preferredSide]) {
        const candidate = center.clone().addScaledVector(right, candidateSide * offset);
        if (mainClearance(track, candidate, 3.8) >= 3 &&
            tunnelClearance(track, candidate, 3.8) >= 3) {
          placement = { foot: candidate, side: candidateSide };
          break;
        }
      }
    }
    if (!placement) throw new Error('Service bay ' + String(i) + ' has no safe roadside position');
    const { foot, side } = placement;
    const yaw = Math.atan2(-side * right.x, -side * right.z);
    dummy.position.copy(foot).add(new THREE.Vector3(0, -0.65, 0));
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bays.setMatrixAt(i, dummy.matrix);
  });
  bays.instanceMatrix.needsUpdate = true;
  group.add(bays);
}

function addApprovedAds(
  group: THREE.Group, buildings: UndercityBuilding[], materials: AdMaterial[],
): void {
  // Spread the approved masks along the actual driving corridor instead of
  // assigning them to arbitrary generation indices that may be behind bends.
  const definitions = [
    { name: 'undercity-ad-nightshift-noodles',
      path: 'assets/track/neon-grid/signage/nightshift-noodles-v1.webp',
      targets: [0.29, 0.39] },
    { name: 'undercity-ad-voltline-industrial',
      path: 'assets/track/neon-grid/signage/voltline-industrial-v1.webp',
      targets: [0.34, 0.43] },
  ] as const;
  const used = new Set<number>();
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x24172b, emissive: MAGENTA, emissiveIntensity: 0.28,
    roughness: 0.48, metalness: 0.46,
  });
  const frames = new THREE.InstancedMesh(new THREE.BoxGeometry(8.95, 4.55, 0.22), frameMaterial, 4);
  frames.name = 'undercity-ad-supports';
  const dummy = new THREE.Object3D();
  let frameIndex = 0;
  for (const definition of definitions) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff, map: new THREE.Texture(),
      side: THREE.DoubleSide, toneMapped: false,
    });
    materials.push({ path: definition.path, material });
    const ads = new THREE.InstancedMesh(new THREE.PlaneGeometry(8.55, 4.15), material, 2);
    ads.name = definition.name;
    definition.targets.forEach((target, i) => {
      const candidate = buildings.map((building, index) => ({ building, index }))
        .filter(({ index }) => !used.has(index))
        .sort((a, b) => Math.abs(a.building.progress - target) - Math.abs(b.building.progress - target))[0];
      if (!candidate) throw new Error('Undercity ad requires an available building mount');
      const { building, index } = candidate;
      used.add(index);
      const inward = building.right.clone().multiplyScalar(-building.side);
      // Both the backing and face are supported against the LOWER facade.
      const y = building.baseY + Math.min(building.height * 0.32, building.height - 3.5);
      const facade = building.position.clone()
        .addScaledVector(inward, building.width * 0.5 + 0.26).setY(y);
      dummy.position.copy(facade);
      dummy.rotation.set(0, Math.atan2(inward.x, inward.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ads.setMatrixAt(i, dummy.matrix);
      dummy.position.copy(facade).addScaledVector(inward, -0.15);
      dummy.updateMatrix();
      frames.setMatrixAt(frameIndex++, dummy.matrix);
    });
    ads.instanceMatrix.needsUpdate = true;
    group.add(ads);
  }
  frames.instanceMatrix.needsUpdate = true;
  group.add(frames);
}

export class UndercityVisual {
  public readonly group = new THREE.Group();
  private readonly animatedMaterials: THREE.ShaderMaterial[] = [];
  private readonly adMaterials: AdMaterial[] = [];
  private readonly clock = new NeonGridVisualClock();
  private disposed = false;

  public constructor(track: NeonGrid, quality: GraphicsQuality) {
    this.group.name = 'undercity-visual';
    this.group.userData.progressRange = [START, END];
    this.group.userData.quality = quality;

    const roadGeometry = neonGridSurfaceSliceGeometry(track, START, END);
    const asphaltBase = new THREE.Mesh(
      roadGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x100d18,
        roughness: 0.42,
        metalness: 0.24,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    asphaltBase.name = 'undercity-asphalt-base';
    asphaltBase.receiveShadow = true;
    this.group.add(asphaltBase);

    if (quality !== 'low') {
      const wetMaterial = wetAsphaltMaterial();
      this.animatedMaterials.push(wetMaterial);
      const wet = new THREE.Mesh(roadGeometry.clone(), wetMaterial);
      wet.name = 'undercity-wet-asphalt';
      wet.renderOrder = -10;
      this.group.add(wet);
    }

    const edgeMaterial = new THREE.MeshBasicMaterial({ color: MAGENTA });
    markBloomMaterial(edgeMaterial, 'color');
    edgeMaterial.depthWrite = false;
    edgeMaterial.polygonOffset = true;
    edgeMaterial.polygonOffsetFactor = -3;
    edgeMaterial.polygonOffsetUnits = -3;
    const edges = new THREE.Mesh(edgeGeometry(track), edgeMaterial);
    edges.renderOrder = 2; // opaque dressing follows the native road; depth offset avoids fighting
    edges.name = 'undercity-magenta-edges';
    this.group.add(edges);

    const buildings = addBuildings(this.group, track, quality);
    addUtilityClutter(this.group, track, buildings);
    addFacadeVentilation(this.group, buildings);
    addWallsideSightlineScreens(this.group, track);
    addServiceBayMask(this.group, track);
    addApprovedAds(this.group, buildings, this.adMaterials);
  }

  public async load(): Promise<void> {
    const loader = new THREE.TextureLoader();
    const results = await Promise.allSettled(
      this.adMaterials.map(({ path }) => loader.loadAsync(import.meta.env.BASE_URL + path)),
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
      throw new Error('Neon Grid Undercity approved signage failed to load');
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
