import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { markBloomMaterial } from '../rendering/bloomEligibility';
import { neonGridRibbon } from './NeonGridGeometry';
import type { NeonGrid } from './NeonGrid';
import {
  NeonGridVisualClock,
  neonGridRightAt,
  neonGridSurfaceSliceGeometry,
} from './NeonGridVisualCommon';
import { disposeTrackScene } from './TrackSceneResources';

// T9.4 owns only the two gaps around the accepted Task 8 Falls Run.
const START = 0.46154128347522666;
const TASK8_START = 0.7;
const TASK8_END = 0.85;
const END = 1.0;
// An entire native ribbon row separates presentation owners at both seams.
const SEAM = 1 / 1536;
const RANGES = [[START, TASK8_START - SEAM], [TASK8_END + SEAM, END]] as const;
const CYAN = 0x37e6ff;
const GOLD = 0xffc63f;

function wetAsphaltMaterial(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      cyan: { value: new THREE.Color(CYAN) },
      gold: { value: new THREE.Color(GOLD) },
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
      uniform vec3 gold;
      varying vec2 vUv;
      varying vec3 vWorld;
      varying vec3 vNormal;
      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      void main() {
        float lane = abs(vUv.x - 0.5) * 2.0;
        float segment = floor(vUv.y * 0.72);
        float jitter = hash(segment * 17.17);
        float band = abs(fract(vUv.y * 0.72 + jitter) - 0.5);
        float streak = 1.0 - smoothstep(0.018, 0.085, band);
        streak *= mix(0.35, 1.0, hash(segment + floor(vUv.x * 13.0)));
        streak *= 0.45 + 0.55 * pow(1.0 - abs(fract(vUv.x * 9.0 + jitter) - 0.5) * 2.0, 5.0);
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float grazing = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 1.6);
        float edge = smoothstep(0.58, 0.98, lane);
        float goldPulse = smoothstep(0.58, 0.82, fract(vUv.y * 0.025 + 0.25));
        vec3 tint = mix(vec3(0.42, 0.66, 0.74), cyan, edge * 0.75);
        tint = mix(tint, gold, goldPulse * 0.12);
        float alpha = streak * grazing * (0.08 + edge * 0.12);
        alpha += grazing * 0.018 * (0.55 + 0.45 * sin(vUv.y * 0.17 + time * 0.08));
        gl_FragColor = vec4(tint, clamp(alpha, 0.0, 0.24));
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

function waterMaterial(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 p = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * p;
      }`,
    fragmentShader: `uniform float time; varying vec2 vUv;
      void main() {
        float travel = vUv.y + time * 1.6;
        float torn = 0.74 + 0.22 * sin(vUv.x * 19.0 + travel * 5.0)
          + 0.10 * sin(vUv.x * 43.0 - travel * 8.0);
        float edge = smoothstep(0.0, 0.09, vUv.x) * smoothstep(0.0, 0.09, 1.0 - vUv.x);
        float ribbon = pow(0.5 + 0.5 * sin(vUv.x * 58.0 + travel * 10.0), 9.0);
        float foam = clamp(ribbon * 0.35 + (1.0 - edge) * 0.45, 0.0, 1.0);
        vec3 deep = vec3(0.018, 0.30, 0.44);
        vec3 bright = vec3(0.58, 0.95, 1.0);
        vec3 color = mix(deep, bright, foam);
        float alpha = edge * clamp(torn, 0.35, 1.0) * 0.40;
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.forceSinglePass = true;
  return material;
}

function mistMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 center = vec4(0.0, 0.0, 0.0, 1.0);
        #ifdef USE_INSTANCING
          center = instanceMatrix * center;
        #endif
        vec4 viewCenter = modelViewMatrix * center;
        float sx = 1.0;
        #ifdef USE_INSTANCING
          sx = length(instanceMatrix[0].xyz);
        #endif
        viewCenter.xy += position.xy * sx;
        gl_Position = projectionMatrix * viewCenter;
      }`,
    fragmentShader: `varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        if (r > 1.0) discard;
        float a = exp(-r * r * 4.8) * (1.0 - smoothstep(0.58, 1.0, r));
        gl_FragColor = vec4(0.50, 0.84, 0.92, a * 0.18);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
}

/** Native ribbon vertex positions, never independently interpolated over steep faces. */
function nativeEdgeGeometry(track: NeonGrid): THREE.BufferGeometry {
  const ribbon = neonGridRibbon(track);
  const positions = ribbon.getAttribute('position');
  const rows = Number(ribbon.userData.ribbonRows);
  const baseCount = Number(ribbon.userData.baseVertexCount);
  if (!Number.isInteger(rows) || rows <= 0 || baseCount < (rows + 1) * 2) {
    ribbon.dispose();
    throw new Error('Falls extension requires native ribbon edge rows');
  }
  const verts: number[] = [];
  const indices: number[] = [];
  const left = new THREE.Vector3();
  const right = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (const [start, end] of RANGES) {
    for (const side of [-1, 1]) {
      const from = Math.ceil(start * rows);
      const to = Math.floor(end * rows);
      let last = -1;
      for (let row = from; row <= to; row++) {
        left.fromBufferAttribute(positions, row * 2);
        right.fromBufferAttribute(positions, row * 2 + 1);
        const next = verts.length / 3;
        for (const factor of (side < 0 ? [0.022, 0.047] : [0.953, 0.978])) {
          p.copy(left).lerp(right, factor);
          p.y += 0.018;
          verts.push(p.x, p.y, p.z);
        }
        if (last >= 0) indices.push(last, last + 1, next, last + 1, next + 1, next);
        last = next;
      }
    }
  }
  ribbon.dispose();
  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    .setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.nativeRibbonEdges = true;
  geometry.userData.progressRanges = RANGES.map(([start, end]) => [start, end]);
  return geometry;
}

/** A single pair of road meshes serves both intervals, with no Task 8 overlap. */
function roadGeometry(track: NeonGrid): THREE.BufferGeometry {
  const first = neonGridSurfaceSliceGeometry(track, ...RANGES[0]);
  const second = neonGridSurfaceSliceGeometry(track, ...RANGES[1]);
  const merged = mergeGeometries([first, second], false);
  first.dispose();
  second.dispose();
  merged.userData.conformsToMainRibbon = true;
  merged.userData.progressRanges = RANGES.map(([start, end]) => [start, end]);
  return merged;
}

function addDeckStructure(group: THREE.Group, track: NeonGrid): void {
  const material = new THREE.MeshStandardMaterial({
    color: 0x132532, roughness: 0.72, metalness: 0.32,
  });
  const pylons = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, 16);
  pylons.name = 'falls-run-extension-supported-pylons';
  const footings = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x1c303c, roughness: 0.92 }),
    16,
  );
  footings.name = 'falls-run-extension-pylon-footings';
  const dummy = new THREE.Object3D();
  for (let i = 0; i < pylons.count; i++) {
    const range = RANGES[i < 10 ? 0 : 1];
    const localIndex = i < 10 ? i : i - 10;
    const localCount = i < 10 ? 10 : 6;
    const progress = THREE.MathUtils.lerp(range[0] + 0.009, range[1] - 0.009, localIndex / (localCount - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 2 === 0 ? -1 : 1;
    const support = center.clone().addScaledVector(right, side * (track.halfWidthAt(progress) + 2));
    const ground = Math.min(0, center.y - 13);
    const top = center.y - 0.3;
    const height = top - ground;
    dummy.position.set(support.x, ground + height * 0.5, support.z);
    dummy.rotation.set(0, Math.atan2(track.curve.getTangentAt(progress).x, track.curve.getTangentAt(progress).z), 0);
    dummy.scale.set(1.6, height, 1.6);
    dummy.updateMatrix();
    pylons.setMatrixAt(i, dummy.matrix);
    dummy.position.y = ground + 0.28;
    dummy.scale.set(3.8, 0.56, 3.8);
    dummy.updateMatrix();
    footings.setMatrixAt(i, dummy.matrix);
  }
  pylons.instanceMatrix.needsUpdate = true;
  footings.instanceMatrix.needsUpdate = true;
  group.add(pylons, footings);
}

/**
 * T9.5 physically supported cap + cyan downlight, fused into one instanced
 * geometry/material family so their combined presentation costs one draw call.
 * This preserves the inherited +12-call T9.4 extension A/B budget.
 */
function addDeckServiceFixtures(group: THREE.Group): void {
  const pylons = group.getObjectByName('falls-run-extension-supported-pylons');
  if (!(pylons instanceof THREE.InstancedMesh)) {
    throw new Error('Falls deck fixtures require their supporting pylons');
  }
  const cap = new THREE.BoxGeometry(4.1, 0.38, 3.1);
  const lamp = new THREE.BoxGeometry(2.6, 0.07, 0.18);
  // Relative to the cap center: both remain physically attached to the pylon.
  lamp.translate(0, -0.245, 0);
  for (const [geometry, tint] of [
    [cap, new THREE.Color(0x294453)],
    [lamp, new THREE.Color(0x6bbdcc)],
  ] as const) {
    const count = geometry.getAttribute('position').count;
    const colors = new Float32Array(count * 3);
    for (let vertex = 0; vertex < count; vertex++) {
      colors[vertex * 3] = tint.r;
      colors[vertex * 3 + 1] = tint.g;
      colors[vertex * 3 + 2] = tint.b;
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  const geometry = mergeGeometries([cap, lamp], false);
  cap.dispose();
  lamp.dispose();
  geometry.userData.supportedFixtureParts = 2;
  geometry.userData.hasCyanUndersideLight = true;
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true });
  markBloomMaterial(material, 'color');
  const fixtures = new THREE.InstancedMesh(geometry, material, pylons.count);
  fixtures.name = 'falls-run-extension-deck-service-fixtures';

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const dummy = new THREE.Object3D();
  for (let i = 0; i < pylons.count; i++) {
    pylons.getMatrixAt(i, matrix);
    matrix.decompose(position, rotation, scale);
    const top = position.y + scale.y * 0.5;
    dummy.position.set(position.x, top - 0.18, position.z);
    dummy.quaternion.copy(rotation);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    fixtures.setMatrixAt(i, dummy.matrix);
  }
  fixtures.instanceMatrix.needsUpdate = true;
  group.add(fixtures);
}

interface Tower {
  readonly position: THREE.Vector3;
  readonly baseY: number;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
}

function steppedTowerGeometry(): THREE.BufferGeometry {
  const lower = new THREE.BoxGeometry(1, 0.64, 1).translate(0, 0.32, 0);
  const middle = new THREE.BoxGeometry(0.82, 0.27, 0.78).translate(0.04, 0.775, -0.06);
  const top = new THREE.BoxGeometry(0.56, 0.12, 0.56).translate(-0.04, 0.97, 0.02);
  const rail = new THREE.BoxGeometry(0.68, 0.025, 0.7).translate(-0.04, 1.038, 0.02);
  const result = mergeGeometries([lower, middle, top, rail], false);
  for (const part of [lower, middle, top, rail]) part.dispose();
  return result;
}

function addCity(group: THREE.Group, track: NeonGrid, quality: GraphicsQuality): void {
  const data: Tower[] = [];
  for (let i = 0; i < 96 && data.length < 16; i++) {
    const range = RANGES[i % 3 === 0 ? 1 : 0];
    const u = ((i * 37) % 97) / 96;
    const progress = THREE.MathUtils.lerp(range[0] + 0.012, range[1] - 0.012, u);
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 2 === 0 ? -1 : 1;
    const lateral = 33 + ((i * 13) % 20);
    const position = center.clone().addScaledVector(right, side * lateral);
    const width = 10 + (i * 7) % 7;
    const depth = 11 + (i * 11) % 8;
    const radius = Math.hypot(width, depth) * 0.55;
    const nearest = track.projectMain(position);
    if (nearest.lateralDistance - track.halfWidthAt(nearest.progress) < radius + 5) continue;
    if (track.serviceTunnel.project(position).lateralDistance < track.serviceTunnel.roadHalfWidth + radius + 7) continue;
    if (data.some(tower => Math.hypot(tower.position.x - position.x, tower.position.z - position.z) <
      (Math.hypot(tower.width, tower.depth) * 0.5 + radius) * 0.8)) continue;
    data.push({ position, baseY: Math.min(0, center.y - 13), width, depth, height: 36 + (i * 17) % 31 });
  }
  if (data.length === 0) throw new Error('Falls extension has no safe city anchors');

  const silhouetteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true });
  const buildings = new THREE.InstancedMesh(steppedTowerGeometry(), silhouetteMaterial, data.length);
  buildings.name = 'falls-run-extension-city-towers';
  const dummy = new THREE.Object3D();
  const colors = [new THREE.Color(0x1a3342), new THREE.Color(0x183443),
    new THREE.Color(0x2d2b42), new THREE.Color(0x25434d)];
  data.forEach((tower, i) => {
    dummy.position.set(tower.position.x, tower.baseY, tower.position.z);
    dummy.rotation.set(0, (i % 3) * 0.22, 0);
    dummy.scale.set(tower.width, tower.height, tower.depth);
    dummy.updateMatrix();
    buildings.setMatrixAt(i, dummy.matrix);
    buildings.setColorAt(i, colors[i % colors.length] ?? new THREE.Color(0x1a3342));
  });
  buildings.instanceMatrix.needsUpdate = true;
  if (buildings.instanceColor) buildings.instanceColor.needsUpdate = true;

  const windowCount = quality === 'low' ? 80 : quality === 'high' ? 240 : 160;
  const windows = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.7, 0.35, 0.04),
    new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true }),
    windowCount,
  );
  windows.name = 'falls-run-extension-city-windows';
  const cyan = new THREE.Color(0x43c9de);
  const warm = new THREE.Color(0xa08b69);
  for (let i = 0; i < windowCount; i++) {
    const tower = data[(i * 7) % data.length];
    if (!tower) continue;
    const row = (i * 5) % 13;
    const column = (i * 11) % 7;
    dummy.position.copy(tower.position);
    dummy.position.y = tower.baseY + tower.height * (0.09 + (row / 12) * 0.5);
    dummy.position.x += ((column / 6) - 0.5) * tower.width * 0.72;
    dummy.position.z += tower.depth * 0.507;
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(0.9 + (i % 3) * 0.17, 1, 1);
    dummy.updateMatrix();
    windows.setMatrixAt(i, dummy.matrix);
    windows.setColorAt(i, i % 6 === 0 ? warm : cyan);
  }
  windows.instanceMatrix.needsUpdate = true;
  if (windows.instanceColor) windows.instanceColor.needsUpdate = true;

  const foundations = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x112934 }),
    data.length,
  );
  foundations.name = 'falls-run-extension-city-foundations';
  data.forEach((tower, i) => {
    dummy.position.set(tower.position.x, tower.baseY - 1, tower.position.z);
    dummy.rotation.set(0, (i % 3) * 0.22, 0);
    dummy.scale.set(tower.width * 1.28, 2, tower.depth * 1.25);
    dummy.updateMatrix();
    foundations.setMatrixAt(i, dummy.matrix);
  });
  foundations.instanceMatrix.needsUpdate = true;
  group.add(buildings, foundations, windows);
}

function addAmbientFalls(group: THREE.Group, track: NeonGrid, quality: GraphicsQuality, material: THREE.ShaderMaterial): void {
  // T9.5: enough ordinary, non-gold spillways on BOTH approaches to make
  // the Dive waterfall less singular. The accepted Task 8 0.70–0.85 region
  // and its unique gold launch cue are not modified or occluded.
  const progresses = [
    0.480, 0.513, 0.542, 0.570, 0.598, 0.623, 0.640, 0.650,
    0.659, 0.668, 0.676, 0.683, 0.688, 0.693, 0.696, 0.698,
    0.853, 0.861, 0.872, 0.886, 0.909, 0.938, 0.964, 0.982,
  ];
  const count = progresses.length;
  const falls = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material, count);
  falls.name = 'falls-run-extension-ambient-waterfalls';
  falls.userData.camouflageProgress = progresses;
  falls.userData.noGold = true;
  falls.frustumCulled = false;
  const lips = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 0.12, 0.18),
    new THREE.MeshBasicMaterial({ color: 0x68bfd5, transparent: true, opacity: 0.75 }),
    count,
  );
  lips.name = 'falls-run-extension-waterfall-lips';
  const drops: { position: THREE.Vector3; height: number; width: number }[] = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const progress = progresses[i];
    if (progress === undefined) continue;
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 2 === 0 ? -1 : 1;
    const point = center.clone().addScaledVector(right, side * (track.halfWidthAt(progress) + 1.8));
    const height = 10 + (i % 5) * 1.3;
    const width = 2.9 + (i % 4) * 0.8;
    drops.push({ position: point, height, width });
    dummy.position.copy(point);
    dummy.position.y -= height * 0.5;
    dummy.rotation.set(0, Math.atan2(track.curve.getTangentAt(progress).x, track.curve.getTangentAt(progress).z), 0);
    dummy.scale.set(width, height, 1);
    dummy.updateMatrix();
    falls.setMatrixAt(i, dummy.matrix);
    dummy.position.copy(point);
    dummy.position.y += 0.03;
    dummy.scale.set(width, 1, 1);
    dummy.updateMatrix();
    lips.setMatrixAt(i, dummy.matrix);
  }
  falls.instanceMatrix.needsUpdate = true;
  lips.instanceMatrix.needsUpdate = true;
  group.add(falls, lips);
  // Costliest atmospheric detail is absent on Low.
  if (quality === 'low') return;
  const countMist = quality === 'high' ? 28 : 14;
  const mist = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.5, 2.5), mistMaterial(), countMist);
  mist.name = 'falls-run-extension-ambient-mist';
  mist.frustumCulled = false;
  for (let i = 0; i < countMist; i++) {
    const drop = drops[(i * 3) % drops.length];
    if (!drop) continue;
    dummy.position.copy(drop.position).add(new THREE.Vector3(
      ((i % 3) - 1) * 0.5, -drop.height + 0.5, ((i % 5) - 2) * 0.35,
    ));
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(0.65 + (i % 4) * 0.12);
    dummy.updateMatrix();
    mist.setMatrixAt(i, dummy.matrix);
  }
  mist.instanceMatrix.needsUpdate = true;
  group.add(mist);
}

export class FallsRunExtensionVisual {
  public readonly group = new THREE.Group();
  private readonly clock = new NeonGridVisualClock();
  private readonly animatedMaterials: THREE.ShaderMaterial[] = [];
  private disposed = false;

  public constructor(track: NeonGrid, quality: GraphicsQuality) {
    this.group.name = 'falls-run-extension-visual';
    this.group.userData.progressRange = [START, END];
    this.group.userData.excludedRange = [TASK8_START, TASK8_END];
    this.group.userData.progressRanges = RANGES.map(([start, end]) => [start, end]);
    this.group.userData.quality = quality;

    const geometry = roadGeometry(track);
    const asphalt = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: 0x07121b, roughness: 0.38, metalness: 0.28,
      side: THREE.DoubleSide, polygonOffset: true,
      polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    }));
    asphalt.name = 'falls-run-extension-asphalt-base';
    asphalt.receiveShadow = true;
    this.group.add(asphalt);

    if (quality !== 'low') {
      const wetMaterial = wetAsphaltMaterial();
      this.animatedMaterials.push(wetMaterial);
      const wet = new THREE.Mesh(geometry.clone(), wetMaterial);
      wet.name = 'falls-run-extension-wet-asphalt';
      wet.renderOrder = -10; // translucent road before 2D driver sprite artwork
      this.group.add(wet);
    }

    const edgesMaterial = new THREE.MeshBasicMaterial({ color: CYAN, side: THREE.DoubleSide });
    markBloomMaterial(edgesMaterial, 'color');
    edgesMaterial.depthWrite = false;
    edgesMaterial.polygonOffset = true;
    edgesMaterial.polygonOffsetFactor = -3;
    edgesMaterial.polygonOffsetUnits = -3;
    const edges = new THREE.Mesh(nativeEdgeGeometry(track), edgesMaterial);
    edges.name = 'falls-run-extension-cyan-edges';
    edges.renderOrder = 2;
    this.group.add(edges);

    addDeckStructure(this.group, track);
    addDeckServiceFixtures(this.group);
    addCity(this.group, track, quality);
    const water = waterMaterial();
    this.animatedMaterials.push(water);
    addAmbientFalls(this.group, track, quality, water);
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
    disposeTrackScene(this.group);
  }
}
