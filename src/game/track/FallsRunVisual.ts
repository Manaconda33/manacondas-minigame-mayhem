import * as THREE from 'three';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import { markBloomMaterial } from '../rendering/bloomEligibility';
import type { NeonGrid } from './NeonGrid';

const START = 0.7;
const END = 0.85;
const WATERFALL_PROGRESS = [0.706, 0.724, 0.744, 0.765, 0.835, 0.848] as const;
const CYAN = 0x37e6ff;

interface TrackPose {
  readonly point: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  readonly right: THREE.Vector3;
  readonly yaw: number;
}

interface TowerPlacement {
  readonly point: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  readonly right: THREE.Vector3;
  readonly side: -1 | 1;
  readonly lateral: number;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
}

function poseAt(track: NeonGrid, progress: number, lateralOffset = 0, yOffset = 0): TrackPose {
  const point = track.curve.getPointAt(progress);
  const tangent = track.curve.getTangentAt(progress).normalize();
  const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
  point.addScaledVector(right, lateralOffset);
  point.y += yOffset;
  return { point, tangent, right, yaw: Math.atan2(tangent.x, tangent.z) };
}

function repeatable(index: number, salt: number): number {
  const value = Math.sin(index * 91.731 + salt * 37.119) * 43758.5453;
  return value - Math.floor(value);
}

function createNightSky(): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `varying vec3 vDirection;
      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      void main() {
        vec3 d = normalize(vDirection);
        float horizon = 1.0 - smoothstep(-0.08, 0.48, d.y);
        vec3 zenith = vec3(0.004, 0.012, 0.035);
        vec3 cityGlow = mix(vec3(0.02, 0.11, 0.16), vec3(0.13, 0.075, 0.05),
          smoothstep(-0.3, 0.35, d.x));
        vec3 color = mix(zenith, cityGlow, horizon * 0.72);
        vec2 starCell = floor((d.xz / max(0.15, 1.0 + d.y)) * 310.0);
        float starSeed = hash21(starCell);
        float stars = step(0.994, starSeed) * smoothstep(0.02, 0.28, d.y);
        stars *= 0.4 + hash21(starCell + 7.1) * 0.8;
        float moon = pow(max(dot(d, normalize(vec3(-0.38, 0.56, -0.73))), 0.0), 190.0);
        float moonGlow = pow(max(dot(d, normalize(vec3(-0.38, 0.56, -0.73))), 0.0), 14.0);
        color += vec3(0.55, 0.72, 0.82) * stars;
        color += vec3(0.53, 0.72, 0.92) * (moon * 0.7 + moonGlow * 0.08);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  material.userData.bloomBlackAdapter = true;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(760, 32, 18), material);
  sky.name = 'neon-grid-night-sky';
  return sky;
}

function createSegmentRibbon(
  track: NeonGrid,
  start: number,
  end: number,
  halfWidth: number,
  yOffset: number,
  segments = 72,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const f = i / segments;
    const progress = THREE.MathUtils.lerp(start, end, f);
    const pose = poseAt(track, progress, 0, yOffset);
    for (const side of [-1, 1]) {
      const p = pose.point.clone().addScaledVector(pose.right, side * halfWidth);
      positions.push(...p.toArray());
      uvs.push(side < 0 ? 0 : 1, f);
    }
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    .setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createWetAsphalt(track: NeonGrid, quality: GraphicsQuality): THREE.Mesh | null {
  if (quality === 'low') return null;
  const geometry = createSegmentRibbon(track, START, END, 5.92, 0.018);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      streakDensity: { value: quality === 'high' ? 1.28 : 1 },
    },
    vertexShader: `varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPosition = world.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `uniform float streakDensity;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      void main() {
        float lane = abs(vUv.x * 2.0 - 1.0);
        float longA = sin(vUv.y * 390.0 * streakDensity + floor(vUv.x * 11.0) * 1.7);
        float longB = sin(vUv.y * 177.0 - vUv.x * 31.0);
        float broken = smoothstep(0.50, 0.96, longA * 0.5 + longB * 0.32 + 0.64);
        float cell = floor(vUv.y * 54.0) + floor(vUv.x * 9.0) * 17.0;
        broken *= smoothstep(0.18, 0.72, hash(cell));
        float edgeGlow = smoothstep(0.66, 1.0, lane);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float grazing = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDir)), 2.2);
        float streak = broken * (0.18 + grazing * 0.82);
        float diveGold = smoothstep(0.56, 0.63, vUv.y) * (1.0 - smoothstep(0.63, 0.70, vUv.y));
        vec3 cyan = vec3(0.216, 0.902, 1.0);
        vec3 gold = vec3(1.0, 0.776, 0.247);
        vec3 reflection = mix(cyan, gold, diveGold * 0.38);
        vec3 wetBase = vec3(0.008, 0.018, 0.032);
        vec3 color = wetBase + reflection * (edgeGlow * 0.10 + streak * 0.52);
        float alpha = 0.72 + edgeGlow * 0.04 + streak * 0.14;
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.forceSinglePass = true;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'falls-run-wet-asphalt';
  // Render the transparent wet-road pass before kart-mounted driver sprites.
  // Both intentionally keep depthWrite disabled; a positive/default transparent
  // order can otherwise composite the road reflection over the 2D driver art.
  mesh.renderOrder = -10;
  return mesh;
}

function createEdgeLights(track: NeonGrid): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 72;
  const width = 0.11;
  for (const side of [-1, 1] as const) {
    const base = positions.length / 3;
    for (let i = 0; i <= segments; i += 1) {
      const progress = THREE.MathUtils.lerp(START, END, i / segments);
      const pose = poseAt(track, progress, 0, 0.035);
      const halfWidth = track.halfWidthAt(progress) - 0.18;
      for (const offset of [-width, width]) {
        positions.push(
          ...pose.point
            .clone()
            .addScaledVector(pose.right, side * halfWidth + offset * 0.5)
            .toArray(),
        );
      }
      if (i < segments) {
        const a = base + i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = markBloomMaterial(
    new THREE.MeshBasicMaterial({ color: CYAN, side: THREE.DoubleSide }),
    'color',
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'falls-run-edge-lights';
  return mesh;
}

function createDeckFascia(track: NeonGrid): THREE.Mesh {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 48;
  for (const side of [-1, 1] as const) {
    const base = positions.length / 3;
    for (let i = 0; i <= segments; i += 1) {
      const progress = THREE.MathUtils.lerp(START, END, i / segments);
      const pose = poseAt(track, progress);
      const edge = pose.point
        .clone()
        .addScaledVector(pose.right, side * (track.halfWidthAt(progress) + 0.05));
      positions.push(edge.x, edge.y - 0.08, edge.z, edge.x, edge.y - 3.5, edge.z);
      if (i < segments) {
        const a = base + i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0x07121f,
      roughness: 0.82,
      metalness: 0.34,
      side: THREE.DoubleSide,
    }),
  );
  mesh.name = 'falls-run-deck-fascia';
  return mesh;
}

function createPylons(track: NeonGrid): THREE.InstancedMesh {
  const count = 12;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0a1824,
    roughness: 0.74,
    metalness: 0.42,
  });
  const pylons = new THREE.InstancedMesh(geometry, material, count);
  pylons.name = 'falls-run-pylons';
  const dummy = new THREE.Object3D();
  let instance = 0;
  for (let slot = 0; slot < 6; slot += 1) {
    const progress = THREE.MathUtils.lerp(0.712, 0.842, slot / 5);
    const pose = poseAt(track, progress);
    for (const side of [-1, 1] as const) {
      const deckY = pose.point.y - 0.4;
      const baseY = Math.min(-3.5, deckY - 5.5);
      const height = deckY - baseY;
      dummy.position
        .copy(pose.point)
        .addScaledVector(pose.right, side * (track.halfWidthAt(progress) + 7.5));
      dummy.position.y = baseY + height / 2;
      dummy.rotation.set(0, pose.yaw, 0);
      dummy.scale.set(1.5, height, 1.5);
      dummy.updateMatrix();
      pylons.setMatrixAt(instance, dummy.matrix);
      instance += 1;
    }
  }
  pylons.instanceMatrix.needsUpdate = true;
  return pylons;
}

function createBraces(track: NeonGrid): THREE.InstancedMesh {
  const count = 24;
  const braces = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.28, 1, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x102939, roughness: 0.68, metalness: 0.5 }),
    count,
  );
  braces.name = 'falls-run-braces';
  const dummy = new THREE.Object3D();
  let instance = 0;
  for (let slot = 0; slot < 6; slot += 1) {
    const progress = THREE.MathUtils.lerp(0.712, 0.842, slot / 5);
    const pose = poseAt(track, progress);
    for (const side of [-1, 1] as const) {
      for (const lean of [-1, 1] as const) {
        dummy.position
          .copy(pose.point)
          .addScaledVector(pose.right, side * (track.halfWidthAt(progress) + 7.5))
          .addScaledVector(pose.tangent, lean * 1.1);
        dummy.position.y = pose.point.y - 3.25;
        dummy.rotation.set(0, pose.yaw, lean * side * 0.58);
        dummy.scale.set(1, 4.7, 1);
        dummy.updateMatrix();
        braces.setMatrixAt(instance, dummy.matrix);
        instance += 1;
      }
    }
  }
  braces.instanceMatrix.needsUpdate = true;
  return braces;
}

function towerPlacements(track: NeonGrid): TowerPlacement[] {
  return Array.from({ length: 24 }, (_, index) => {
    const progress = THREE.MathUtils.lerp(0.695, 0.855, (index % 12) / 11);
    const side: -1 | 1 = index < 12 ? -1 : 1;
    const pose = poseAt(track, progress);
    const lateral = 28 + repeatable(index, 1) * 44;
    return {
      point: pose.point,
      tangent: pose.tangent,
      right: pose.right,
      side,
      lateral,
      width: 7 + repeatable(index, 2) * 11,
      depth: 7 + repeatable(index, 3) * 13,
      height: 22 + repeatable(index, 4) * 42,
    };
  });
}

function createCity(track: NeonGrid, quality: GraphicsQuality): THREE.Group {
  const group = new THREE.Group();
  group.name = 'falls-run-city';
  const towersData = towerPlacements(track);
  const towers = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0x050c16,
      roughness: 0.88,
      metalness: 0.18,
      vertexColors: true,
    }),
    towersData.length,
  );
  towers.name = 'falls-run-city-towers';
  const dummy = new THREE.Object3D();
  const cool = new THREE.Color(0x07131f);
  const warm = new THREE.Color(0x15100d);
  towersData.forEach((tower, index) => {
    dummy.position
      .copy(tower.point)
      .addScaledVector(tower.right, tower.side * tower.lateral)
      .setY(-4 + tower.height / 2);
    dummy.rotation.set(0, Math.atan2(tower.tangent.x, tower.tangent.z), 0);
    dummy.scale.set(tower.width, tower.height, tower.depth);
    dummy.updateMatrix();
    towers.setMatrixAt(index, dummy.matrix);
    towers.setColorAt(index, index % 5 === 0 ? warm : cool);
  });
  towers.instanceMatrix.needsUpdate = true;
  if (towers.instanceColor !== null) towers.instanceColor.needsUpdate = true;

  const windowCount = quality === 'low' ? 160 : quality === 'high' ? 480 : 320;
  const windowMaterial = markBloomMaterial(
    new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true }),
    'color',
  );
  const windows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.75, 0.42, 0.05), windowMaterial, windowCount);
  windows.name = 'falls-run-city-windows';
  const cyan = new THREE.Color(CYAN);
  const amber = new THREE.Color(0xffb65c);
  for (let index = 0; index < windowCount; index += 1) {
    const tower = towersData[index % towersData.length];
    if (tower === undefined) throw new Error('Missing Falls Run tower placement');
    const row = Math.floor(index / towersData.length);
    const across = ((row * 3 + index) % 7) / 6 - 0.5;
    const vertical = 0.14 + repeatable(index, 7) * 0.72;
    const facadeCenter = tower.point
      .clone()
      .addScaledVector(tower.right, tower.side * (tower.lateral - tower.width * 0.5 - 0.04));
    facadeCenter.y = -4 + tower.height * vertical;
    facadeCenter.addScaledVector(tower.tangent, across * tower.width * 0.72);
    dummy.position.copy(facadeCenter);
    dummy.rotation.set(0, Math.atan2(tower.tangent.x, tower.tangent.z), 0);
    dummy.scale.set(
      0.75 + repeatable(index, 8) * 0.55,
      0.75 + repeatable(index, 9) * 0.5,
      1,
    );
    dummy.updateMatrix();
    windows.setMatrixAt(index, dummy.matrix);
    windows.setColorAt(index, index % 6 === 0 ? amber : cyan);
  }
  windows.instanceMatrix.needsUpdate = true;
  if (windows.instanceColor !== null) windows.instanceColor.needsUpdate = true;
  group.add(towers, windows);
  return group;
}

function waterfallMaterial(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 transformed = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          transformed = instanceMatrix * transformed;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * transformed;
      }`,
    fragmentShader: `uniform float time;
      varying vec2 vUv;
      void main() {
        float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(0.0, 0.12, 1.0 - vUv.x);
        float torn = 0.72 + 0.20 * sin(vUv.y * 19.0 + vUv.x * 41.0)
          + 0.08 * sin(vUv.y * 53.0 - vUv.x * 73.0);
        edge *= smoothstep(0.22, 0.58, torn + sin(vUv.y * 13.0) * 0.08);
        float travel = fract(vUv.y * 5.0 - time * 1.45 + sin(vUv.x * 31.0) * 0.08);
        float ribbon = pow(1.0 - abs(travel * 2.0 - 1.0), 6.0);
        float foam = ribbon * 0.42 + pow(0.5 + 0.5 * sin(vUv.x * 83.0 + vUv.y * 8.0), 12.0) * 0.3;
        vec3 deep = vec3(0.035, 0.19, 0.25);
        vec3 bright = vec3(0.43, 0.88, 0.96);
        vec3 color = mix(deep, bright, clamp(foam, 0.0, 0.85));
        float alpha = edge * (0.46 + foam * 0.33);
        if (alpha < 0.025) discard;
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

function createAmbientWaterfalls(track: NeonGrid): {
  readonly falls: THREE.InstancedMesh;
  readonly lips: THREE.InstancedMesh;
  readonly placements: { point: THREE.Vector3; yaw: number; width: number; height: number }[];
} {
  const placements: { point: THREE.Vector3; yaw: number; width: number; height: number }[] = [];
  for (const [slot, progress] of WATERFALL_PROGRESS.entries()) {
    const pose = poseAt(track, progress);
    for (const side of [-1, 1] as const) {
      const width = 3.1 + repeatable(slot * 2 + (side > 0 ? 1 : 0), 12) * 4.2;
      const bottom = Math.min(-2.5, pose.point.y - 10 - repeatable(slot, 13) * 4);
      const height = Math.max(8, pose.point.y - bottom);
      const point = pose.point
        .clone()
        .addScaledVector(pose.right, side * (track.halfWidthAt(progress) + 0.42));
      point.y -= height / 2 + 0.02;
      placements.push({ point, yaw: pose.yaw + Math.PI / 2, width, height });
    }
  }

  const falls = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), waterfallMaterial(), placements.length);
  falls.name = 'falls-run-ambient-waterfalls';
  const lipMaterial = markBloomMaterial(
    new THREE.MeshBasicMaterial({ color: 0x79f1ff }),
    'color',
  );
  const lips = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.035, 0.12), lipMaterial, placements.length);
  lips.name = 'falls-run-waterfall-lips';
  const dummy = new THREE.Object3D();
  placements.forEach((placement, index) => {
    dummy.position.copy(placement.point);
    dummy.rotation.set(0, placement.yaw, 0);
    dummy.scale.set(placement.width, placement.height, 1);
    dummy.updateMatrix();
    falls.setMatrixAt(index, dummy.matrix);

    dummy.position.copy(placement.point);
    dummy.position.y += placement.height / 2;
    dummy.rotation.set(0, placement.yaw, 0);
    dummy.scale.set(placement.width, 1, 1);
    dummy.updateMatrix();
    lips.setMatrixAt(index, dummy.matrix);
  });
  falls.instanceMatrix.needsUpdate = true;
  lips.instanceMatrix.needsUpdate = true;
  return { falls, lips, placements };
}

function mistMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float scale = length(instanceMatrix[0].xyz);
        center.xy += position.xy * scale;
        gl_Position = projectionMatrix * center;
      }`,
    fragmentShader: `varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        if (r > 1.0) discard;
        float alpha = exp(-r * r * 4.4) * 0.13 * (1.0 - smoothstep(0.62, 1.0, r));
        gl_FragColor = vec4(0.45, 0.78, 0.84, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
}

function createMist(
  quality: GraphicsQuality,
  placements: { point: THREE.Vector3; height: number }[],
): THREE.InstancedMesh {
  const count = quality === 'low' ? 16 : quality === 'high' ? 48 : 32;
  const mist = new THREE.InstancedMesh(new THREE.PlaneGeometry(3, 3), mistMaterial(), count);
  mist.name = 'falls-run-mist';
  const dummy = new THREE.Object3D();
  for (let index = 0; index < count; index += 1) {
    const placement = placements[index % placements.length];
    if (placement === undefined) throw new Error('Missing Falls Run mist placement');
    dummy.position.copy(placement.point);
    dummy.position.y -= placement.height / 2 - 0.4 + repeatable(index, 21) * 1.4;
    dummy.position.x += (repeatable(index, 22) - 0.5) * 5.5;
    dummy.position.z += (repeatable(index, 23) - 0.5) * 5.5;
    dummy.scale.setScalar(0.9 + repeatable(index, 24) * 1.2);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mist.setMatrixAt(index, dummy.matrix);
  }
  mist.instanceMatrix.needsUpdate = true;
  return mist;
}

function createSpray(
  placements: { point: THREE.Vector3; height: number; width: number; yaw: number }[],
): THREE.InstancedMesh {
  const material = new THREE.MeshBasicMaterial({
    color: 0x83eaff,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const spray = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 12), material, placements.length);
  spray.name = 'falls-run-waterfall-spray';
  const dummy = new THREE.Object3D();
  placements.forEach((placement, index) => {
    dummy.position.copy(placement.point);
    dummy.position.y -= placement.height / 2 - 0.08;
    dummy.rotation.set(-Math.PI / 2, placement.yaw, 0);
    dummy.scale.set(placement.width * 0.8, placement.width * 0.45, 1);
    dummy.updateMatrix();
    spray.setMatrixAt(index, dummy.matrix);
  });
  spray.instanceMatrix.needsUpdate = true;
  return spray;
}

function createSignage(track: NeonGrid): THREE.InstancedMesh {
  const count = 18;
  const material = markBloomMaterial(
    new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true }),
    'color',
  );
  const signs = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 1.1, 0.06), material, count);
  signs.name = 'falls-run-signage';
  const dummy = new THREE.Object3D();
  const cyan = new THREE.Color(CYAN);
  const pale = new THREE.Color(0x8af4ff);
  for (let index = 0; index < count; index += 1) {
    const progress = THREE.MathUtils.lerp(0.704, 0.846, index / (count - 1));
    const side = index % 2 === 0 ? -1 : 1;
    const pose = poseAt(track, progress, side * (track.halfWidthAt(progress) + 5.5));
    dummy.position.copy(pose.point);
    dummy.position.y += 2.5 + repeatable(index, 31) * 3.2;
    dummy.rotation.set(0, pose.yaw + (side > 0 ? -Math.PI / 2 : Math.PI / 2), 0);
    dummy.scale.set(0.75 + repeatable(index, 32) * 1.1, 0.75 + repeatable(index, 33) * 0.7, 1);
    dummy.updateMatrix();
    signs.setMatrixAt(index, dummy.matrix);
    signs.setColorAt(index, index % 4 === 0 ? pale : cyan);
  }
  signs.instanceMatrix.needsUpdate = true;
  if (signs.instanceColor !== null) signs.instanceColor.needsUpdate = true;
  return signs;
}

function createDiveRailDebris(track: NeonGrid): THREE.InstancedMesh {
  const dive = track.waterfallDive;
  const count = 10;
  const debris = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.4, 0.12, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x17212a, roughness: 0.72, metalness: 0.58 }),
    count,
  );
  debris.name = 'falls-run-dive-rail-debris';
  const dummy = new THREE.Object3D();
  for (let index = 0; index < count; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const d = 6.2 + Math.floor(index / 2) * 1.65;
    const p = dive
      .pointAtDistance(d)
      .addScaledVector(dive.right, side * (dive.roadHalfWidth + 0.55 + repeatable(index, 41) * 0.65));
    p.y += 0.38 + repeatable(index, 42) * 0.45;
    dummy.position.copy(p);
    dummy.rotation.set(
      (repeatable(index, 43) - 0.5) * 0.65,
      Math.atan2(dive.direction.x, dive.direction.z) + (repeatable(index, 44) - 0.5) * 0.9,
      (repeatable(index, 45) - 0.5) * 0.75,
    );
    dummy.scale.set(0.7 + repeatable(index, 46) * 1.0, 1, 1);
    dummy.updateMatrix();
    debris.setMatrixAt(index, dummy.matrix);
  }
  debris.instanceMatrix.needsUpdate = true;
  return debris;
}

/**
 * Stage 4 Task 8 visual-only representative stretch.
 * This owns no collision, navigation, checkpoint, AI or gameplay authority.
 */
export class FallsRunVisual {
  public readonly group = new THREE.Group();
  private readonly flowMaterials: THREE.ShaderMaterial[] = [];

  public constructor(
    track: NeonGrid,
    quality: GraphicsQuality = 'medium',
  ) {
    this.group.name = 'falls-run-presentation';
    this.group.userData.progressStart = START;
    this.group.userData.progressEnd = END;
    this.group.userData.visualOnly = true;

    this.group.add(createNightSky());

    const wet = createWetAsphalt(track, quality);
    if (wet !== null) this.group.add(wet);
    this.group.add(createEdgeLights(track));
    this.group.add(createDeckFascia(track));
    this.group.add(createPylons(track));
    this.group.add(createBraces(track));
    this.group.add(createCity(track, quality));

    const ambient = createAmbientWaterfalls(track);
    this.flowMaterials.push(ambient.falls.material as THREE.ShaderMaterial);
    this.group.add(ambient.falls, ambient.lips);
    this.group.add(createMist(quality, ambient.placements));
    this.group.add(createSpray(ambient.placements));
    this.group.add(createSignage(track));
    this.group.add(createDiveRailDebris(track));
  }

  public update(time: number): void {
    for (const material of this.flowMaterials) {
      const clock = material.uniforms.time;
      if (clock) clock.value = time;
    }
  }
}

export const FALLS_RUN_VISUAL_RANGE = { start: START, end: END } as const;
