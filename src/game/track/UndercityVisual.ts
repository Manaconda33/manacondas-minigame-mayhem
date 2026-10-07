import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { markBloomMaterial } from '../rendering/bloomEligibility';
import type { NeonGrid } from './NeonGrid';
import {
  NeonGridVisualClock,
  neonGridRightAt,
  neonGridSurfaceSliceGeometry,
} from './NeonGridVisualCommon';
import { disposeTrackScene } from './TrackSceneResources';

const START = 0.24654910452879084;
const END = 0.46154128347522666;
const SEGMENTS = 72;
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
  const positions: number[] = [];
  const indices: number[] = [];
  const thickness = 0.075;
  for (const side of [-1, 1] as const) {
    const base = positions.length / 3;
    for (let i = 0; i <= SEGMENTS; i++) {
      const progress = THREE.MathUtils.lerp(START, END, i / SEGMENTS);
      const center = track.curve.getPointAt(progress);
      const right = neonGridRightAt(track, progress);
      const offset = track.halfWidthAt(progress) - 0.15;
      for (const delta of [-thickness, thickness]) {
        const point = center
          .clone()
          .addScaledVector(right, side * (offset + delta))
          .add(new THREE.Vector3(0, 0.048, 0));
        positions.push(...point.toArray());
      }
      if (i < SEGMENTS) {
        const next = THREE.MathUtils.lerp(START, END, (i + 1) / SEGMENTS);
        if (segmentCrossesTunnelOpening(track, side, progress, next)) continue;
        const a = base + i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
  }
  return new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
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
  return projection.lateralDistance - track.serviceTunnel.roadHalfWidth - radius;
}

function buildingGeometry(): THREE.BufferGeometry {
  const lower = new THREE.BoxGeometry(1, 0.58, 1);
  lower.translate(0, 0.29, 0);
  const middle = new THREE.BoxGeometry(0.84, 0.3, 0.82);
  middle.translate(0.08, 0.73, 0);
  const upper = new THREE.BoxGeometry(0.64, 0.12, 0.68);
  upper.translate(-0.08, 0.94, 0);
  const merged = mergeGeometries([lower, middle, upper], false);
  lower.dispose();
  middle.dispose();
  upper.dispose();
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
    const width = 7 + ((attempt * 5) % 5);
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
    new THREE.Color(0x161425),
    new THREE.Color(0x20162d),
    new THREE.Color(0x13222b),
    new THREE.Color(0x25172d),
  ];
  data.forEach((building, i) => {
    dummy.position.set(building.position.x, building.baseY, building.position.z);
    dummy.rotation.set(0, Math.atan2(building.tangent.x, building.tangent.z), 0);
    dummy.scale.set(building.width, building.height, building.depth);
    dummy.updateMatrix();
    buildings.setMatrixAt(i, dummy.matrix);
    buildings.setColorAt(i, colors[i % colors.length] ?? colors[0] ?? new THREE.Color(0x161425));
  });
  buildings.instanceMatrix.needsUpdate = true;
  if (buildings.instanceColor) buildings.instanceColor.needsUpdate = true;

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
      .setY(building.baseY + building.height * (0.16 + (((i * 5) % 13) / 12) * 0.62));
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

  group.add(buildings, windows);
  group.userData.undercityLogicalBuildingCount = data.length;
  return data;
}

function addUtilityClutter(group: THREE.Group, track: NeonGrid): void {
  const utilityMaterial = new THREE.MeshStandardMaterial({
    color: 0x171b28,
    roughness: 0.66,
    metalness: 0.46,
  });
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), utilityMaterial, 20);
  boxes.name = 'undercity-utility-boxes';
  const dummy = new THREE.Object3D();

  for (let i = 0; i < boxes.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.008, END - 0.008, i / (boxes.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const side = i % 2 === 0 ? -1 : 1;
    dummy.position
      .copy(center)
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 3.0 + (i % 3) * 0.8))
      .add(new THREE.Vector3(0, 0.7 + (i % 2) * 0.18, 0));
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z) + (i % 3 - 1) * 0.22, 0);
    dummy.scale.set(1.2 + (i % 3) * 0.28, 1.4 + (i % 4) * 0.25, 1 + (i % 2) * 0.3);
    dummy.updateMatrix();
    boxes.setMatrixAt(i, dummy.matrix);
  }
  boxes.instanceMatrix.needsUpdate = true;

  const pipeMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b3752,
    roughness: 0.52,
    metalness: 0.58,
  });
  const pipes = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.14, 1, 8),
    pipeMaterial,
    26,
  );
  pipes.name = 'undercity-pipes';
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < pipes.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.004, END - 0.004, i / (pipes.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const side = i % 2 === 0 ? -1 : 1;
    const vertical = i % 3 === 0;
    dummy.position
      .copy(center)
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 4.6 + (i % 4) * 0.45))
      .add(new THREE.Vector3(0, vertical ? 2.7 : 3.4 + (i % 2) * 0.45, 0));
    dummy.quaternion.identity();
    if (!vertical) dummy.quaternion.setFromUnitVectors(up, tangent);
    dummy.scale.set(1, vertical ? 5.2 + (i % 4) * 0.6 : 5.5 + (i % 3) * 1.0, 1);
    dummy.updateMatrix();
    pipes.setMatrixAt(i, dummy.matrix);
  }
  pipes.instanceMatrix.needsUpdate = true;

  const lightMaterial = new THREE.MeshBasicMaterial({ color: MAGENTA, vertexColors: true });
  markBloomMaterial(lightMaterial, 'color');
  const lights = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.12, 0.16), lightMaterial, 24);
  lights.name = 'undercity-work-lights';
  const magenta = new THREE.Color(MAGENTA);
  const cyan = new THREE.Color(CYAN);
  for (let i = 0; i < lights.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.006, END - 0.006, i / (lights.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const side = i % 2 === 0 ? -1 : 1;
    dummy.position
      .copy(center)
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 2.25))
      .add(new THREE.Vector3(0, 2.0 + (i % 4) * 0.55, 0));
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lights.setMatrixAt(i, dummy.matrix);
    lights.setColorAt(i, i % 8 === 0 ? cyan : magenta);
  }
  lights.instanceMatrix.needsUpdate = true;
  if (lights.instanceColor) lights.instanceColor.needsUpdate = true;

  group.add(boxes, pipes, lights);
}

function addServiceBayMask(group: THREE.Group, track: NeonGrid): void {
  const material = new THREE.MeshStandardMaterial({
    color: 0x121523,
    emissive: 0x5f1a65,
    emissiveIntensity: 0.34,
    roughness: 0.57,
    metalness: 0.5,
  });
  const bays = new THREE.InstancedMesh(new THREE.BoxGeometry(2.8, 3.7, 0.22), material, 10);
  bays.name = 'undercity-service-bays';
  const authoredProgress = [
    START + 0.01,
    START + 0.021,
    START + 0.034,
    START + 0.049,
    START + 0.064,
    END - 0.064,
    END - 0.049,
    END - 0.034,
    END - 0.021,
    END - 0.01,
  ];
  const dummy = new THREE.Object3D();
  authoredProgress.forEach((progress, i) => {
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 2 === 0 ? -1 : 1;
    dummy.position
      .copy(center)
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 4.9))
      .add(new THREE.Vector3(0, 1.85, 0));
    dummy.rotation.set(0, Math.atan2(-side * right.x, -side * right.z), 0);
    dummy.scale.set(0.9 + (i % 3) * 0.12, 1, 1);
    dummy.updateMatrix();
    bays.setMatrixAt(i, dummy.matrix);
  });
  bays.instanceMatrix.needsUpdate = true;
  group.add(bays);
}

function addApprovedAds(
  group: THREE.Group,
  buildings: UndercityBuilding[],
  materials: AdMaterial[],
): void {
  const definitions = [
    {
      name: 'undercity-ad-nightshift-noodles',
      path: 'assets/track/neon-grid/signage/nightshift-noodles-v1.webp',
      buildingIndices: [2, 10],
    },
    {
      name: 'undercity-ad-voltline-industrial',
      path: 'assets/track/neon-grid/signage/voltline-industrial-v1.webp',
      buildingIndices: [5, 13],
    },
  ] as const;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x24172b,
    emissive: MAGENTA,
    emissiveIntensity: 0.2,
    roughness: 0.48,
    metalness: 0.46,
  });
  const frames = new THREE.InstancedMesh(new THREE.BoxGeometry(7.45, 3.95, 0.12), frameMaterial, 4);
  frames.name = 'undercity-ad-supports';
  const dummy = new THREE.Object3D();
  let frameIndex = 0;

  for (const definition of definitions) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: new THREE.Texture(),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    materials.push({ path: definition.path, material });
    const ads = new THREE.InstancedMesh(new THREE.PlaneGeometry(7, 3.5), material, 2);
    ads.name = definition.name;
    definition.buildingIndices.forEach((buildingIndex, i) => {
      const building = buildings[buildingIndex];
      if (!building) throw new Error('Undercity ad requires an authored building mount');
      const inward = building.right.clone().multiplyScalar(-building.side);
      const y = building.baseY + Math.min(building.height * 0.48, building.height - 4.2);
      const facade = building.position
        .clone()
        .addScaledVector(inward, building.width * 0.5 + 0.08)
        .setY(y);
      dummy.position.copy(facade);
      dummy.rotation.set(0, Math.atan2(inward.x, inward.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ads.setMatrixAt(i, dummy.matrix);

      dummy.position.copy(facade).addScaledVector(inward, -0.075);
      dummy.updateMatrix();
      frames.setMatrixAt(frameIndex, dummy.matrix);
      frameIndex++;
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
    const edges = new THREE.Mesh(edgeGeometry(track), edgeMaterial);
    edges.name = 'undercity-magenta-edges';
    this.group.add(edges);

    const buildings = addBuildings(this.group, track, quality);
    addUtilityClutter(this.group, track);
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
