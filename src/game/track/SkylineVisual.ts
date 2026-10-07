import * as THREE from 'three';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { markBloomMaterial } from '../rendering/bloomEligibility';
import type { NeonGrid } from './NeonGrid';
import {
  NeonGridVisualClock,
  neonGridRibbonGeometry,
  neonGridRightAt,
} from './NeonGridVisualCommon';
import { disposeTrackScene } from './TrackSceneResources';

const START = 0;
const END = 0.24654910452879084;
const SEGMENTS = 80;
const CYAN = 0x37e6ff;
const MAGENTA = 0xff4fd8;

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
  });
  material.forceSinglePass = true;
  material.userData.bloomBlackAdapter = true;
  return material;
}

function addStructure(group: THREE.Group, track: NeonGrid): void {
  const fascia = new THREE.Mesh(
    skylineFasciaGeometry(track),
    new THREE.MeshStandardMaterial({
      color: 0x08131f,
      roughness: 0.82,
      metalness: 0.3,
      side: THREE.DoubleSide,
    }),
  );
  fascia.name = 'skyline-deck-fascia';
  group.add(fascia);

  const material = new THREE.MeshStandardMaterial({
    color: 0x0c1b28,
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
    const side = i % 2 === 0 ? -1 : 1;
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

function addCity(group: THREE.Group, track: NeonGrid, quality: GraphicsQuality): void {
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: 0x07111d,
    roughness: 0.9,
    metalness: 0.16,
    vertexColors: true,
  });
  const towers = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), towerMaterial, 22);
  towers.name = 'skyline-city-towers';
  const towerDummy = new THREE.Object3D();
  const cool = new THREE.Color(0x0b1a28);
  const violet = new THREE.Color(0x171327);
  const towerData: { position: THREE.Vector3; width: number; depth: number; height: number }[] = [];

  for (let i = 0; i < towers.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.005, END - 0.005, i / (towers.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 2 === 0 ? -1 : 1;
    const lateral = 27 + ((i * 9) % 24);
    const width = 7 + ((i * 5) % 9);
    const depth = 7 + ((i * 11) % 10);
    const height = 32 + ((i * 13) % 42);
    const baseY = Math.min(0, center.y - 11);
    const position = center
      .clone()
      .addScaledVector(right, side * lateral)
      .setY(baseY + height * 0.5);
    towerData.push({ position, width, depth, height });
    towerDummy.position.copy(position);
    towerDummy.rotation.set(0, 0, 0);
    towerDummy.scale.set(width, height, depth);
    towerDummy.updateMatrix();
    towers.setMatrixAt(i, towerDummy.matrix);
    towers.setColorAt(i, i % 5 === 0 ? violet : cool);
  }
  towers.instanceMatrix.needsUpdate = true;
  if (towers.instanceColor) towers.instanceColor.needsUpdate = true;

  const windowCount = quality === 'low' ? 120 : quality === 'high' ? 360 : 240;
  const windows = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.72, 0.42, 0.04),
    new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true }),
    windowCount,
  );
  windows.name = 'skyline-city-windows';
  const dummy = new THREE.Object3D();
  const cyan = new THREE.Color(CYAN);
  const pale = new THREE.Color(0x9cefff);
  const magenta = new THREE.Color(MAGENTA);
  for (let i = 0; i < windowCount; i++) {
    const tower = towerData[(i * 7) % towerData.length];
    if (tower === undefined) continue;
    const row = (i * 5) % 15;
    const column = (i * 11) % 9;
    const columnOffset = (column / 8 - 0.5) * 0.74;
    dummy.position.copy(tower.position);
    dummy.position.y += -tower.height * 0.38 + (row / 14) * tower.height * 0.76;
    if (i % 2 === 0) {
      dummy.position.x += columnOffset * tower.width;
      dummy.position.z += tower.depth * 0.505;
      dummy.rotation.set(0, 0, 0);
    } else {
      dummy.position.z += columnOffset * tower.depth;
      dummy.position.x += tower.width * 0.505;
      dummy.rotation.set(0, Math.PI / 2, 0);
    }
    dummy.scale.set(1.05 + (i % 3) * 0.14, 0.95, 1);
    dummy.updateMatrix();
    windows.setMatrixAt(i, dummy.matrix);
    windows.setColorAt(i, i % 17 === 0 ? magenta : i % 5 === 0 ? pale : cyan);
  }
  windows.instanceMatrix.needsUpdate = true;
  if (windows.instanceColor) windows.instanceColor.needsUpdate = true;
  group.add(towers, windows);
}

function addProceduralSignage(group: THREE.Group, track: NeonGrid): void {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: CYAN,
    emissiveIntensity: 0.82,
    roughness: 0.42,
    metalness: 0.18,
    vertexColors: true,
  });
  markBloomMaterial(material, 'emissive');
  const signs = new THREE.InstancedMesh(new THREE.BoxGeometry(2.8, 1.1, 0.12), material, 18);
  signs.name = 'skyline-procedural-signage';
  const dummy = new THREE.Object3D();
  const cyan = new THREE.Color(CYAN);
  const magenta = new THREE.Color(MAGENTA);
  const gapSide = billboardSide(track);

  for (let i = 0; i < signs.count; i++) {
    const progress = THREE.MathUtils.lerp(0.045, END - 0.01, i / (signs.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 4 === 0 ? -gapSide : gapSide;
    dummy.position
      .copy(center)
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 7.5 + (i % 3) * 1.8));
    dummy.position.y += 2.5 + (i % 4) * 1.05;
    const normal = right.clone().multiplyScalar(-side);
    dummy.rotation.set(0, Math.atan2(normal.x, normal.z), 0);
    dummy.scale.set(0.85 + (i % 3) * 0.12, 0.9 + (i % 2) * 0.15, 1);
    dummy.updateMatrix();
    signs.setMatrixAt(i, dummy.matrix);
    signs.setColorAt(i, i % 5 === 0 ? magenta : cyan);
  }
  signs.instanceMatrix.needsUpdate = true;
  if (signs.instanceColor) signs.instanceColor.needsUpdate = true;
  group.add(signs);
}

interface AdMaterial {
  readonly path: string;
  readonly material: THREE.MeshBasicMaterial;
}

function addApprovedAds(group: THREE.Group, track: NeonGrid, materials: AdMaterial[]): void {
  const gapSide = billboardSide(track);
  const definitions = [
    {
      name: 'skyline-ad-manaconda-racing',
      path: 'assets/track/neon-grid/signage/manaconda-racing-v1.webp',
      progresses: [0.071, 0.136, 0.191],
    },
    {
      name: 'skyline-ad-taco-bell-live-mas',
      path: 'assets/track/neon-grid/signage/taco-bell-live-mas-v1.webp',
      progresses: [0.089, 0.161, 0.232],
    },
  ] as const;

  for (const [definitionIndex, definition] of definitions.entries()) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: new THREE.Texture(),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    materials.push({ path: definition.path, material });
    const ads = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(8, 4),
      material,
      definition.progresses.length,
    );
    ads.name = definition.name;
    const dummy = new THREE.Object3D();
    definition.progresses.forEach((progress, i) => {
      const center = track.curve.getPointAt(progress);
      const right = neonGridRightAt(track, progress);
      const side = i === 1 ? -gapSide : gapSide;
      dummy.position
        .copy(center)
        .addScaledVector(right, side * (track.halfWidthAt(progress) + 11 + i * 1.7));
      dummy.position.y += 5 + ((i + definitionIndex) % 2) * 1.4;
      const normal = right.clone().multiplyScalar(-side);
      dummy.rotation.set(0, Math.atan2(normal.x, normal.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ads.setMatrixAt(i, dummy.matrix);
    });
    ads.instanceMatrix.needsUpdate = true;
    group.add(ads);
  }
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

    const asphaltBase = new THREE.Mesh(
      neonGridRibbonGeometry(track, START, END, SEGMENTS, 5.96, 0.012),
      new THREE.MeshStandardMaterial({
        color: 0x06121d,
        roughness: 0.36,
        metalness: 0.3,
        side: THREE.DoubleSide,
      }),
    );
    asphaltBase.name = 'skyline-asphalt-base';
    asphaltBase.receiveShadow = true;
    this.group.add(asphaltBase);

    if (quality !== 'low') {
      const wetMaterial = wetAsphaltMaterial();
      this.animatedMaterials.push(wetMaterial);
      const wet = new THREE.Mesh(
        neonGridRibbonGeometry(track, START, END, SEGMENTS, 5.86, 0.018),
        wetMaterial,
      );
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
    addCity(this.group, track, quality);
    addProceduralSignage(this.group, track);
    addApprovedAds(this.group, track, this.adMaterials);
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
