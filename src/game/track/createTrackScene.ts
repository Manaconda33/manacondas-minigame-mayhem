import * as THREE from 'three';
import { CircuitAlpha } from './CircuitAlpha';
import { createGuardrailVisual } from './GuardrailSystem';

interface TrackPose {
  point: THREE.Vector3;
  tangent: THREE.Vector3;
  right: THREE.Vector3;
  yaw: number;
}

const COLORS = {
  asphalt: 0x2b2d34,
  asphaltWear: 0x24262c,
  shoulder: 0x6e587f,
  shoulderEdge: 0xa68bc2,
  dirt: 0x865536,
  grass: 0x284b35,
  forest: 0x173326,
  forestLight: 0x2f6244,
  trunk: 0x493629,
  stone: 0x4f4656,
  stoneDark: 0x352f3d,
  bronze: 0x8a6743,
  violet: 0x8f6db0,
  violetDark: 0x4c365e,
  cyan: 0x32d7ff,
  gold: 0xf1c85c,
  warmLight: 0xffd6a0,
} as const;

function createStrip(
  track: CircuitAlpha,
  halfWidth: number,
  material: THREE.Material,
  y: number,
): THREE.Mesh {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= track.sampleCount; index += 1) {
    const wrapped = index % track.sampleCount;
    const point = track.samples[wrapped]?.clone() ?? new THREE.Vector3();
    const tangent = track.tangents[wrapped] ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const leftPoint = point.clone().addScaledVector(right, -halfWidth);
    const rightPoint = point.clone().addScaledVector(right, halfWidth);
    positions.push(leftPoint.x, y, leftPoint.z, rightPoint.x, y, rightPoint.z);

    if (index < track.sampleCount) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function createSegmentStrip(
  track: CircuitAlpha,
  startProgress: number,
  endProgress: number,
  centerOffset: number,
  halfWidth: number,
  material: THREE.Material,
  y: number,
): THREE.Mesh {
  const positions: number[] = [];
  const indices: number[] = [];
  const start = Math.floor(startProgress * track.sampleCount);
  const end = Math.ceil(endProgress * track.sampleCount);

  for (let index = start; index <= end; index += 1) {
    const wrapped = index % track.sampleCount;
    const point = track.samples[wrapped]?.clone() ?? new THREE.Vector3();
    const tangent = track.tangents[wrapped] ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const center = point.addScaledVector(right, centerOffset);
    const leftPoint = center.clone().addScaledVector(right, -halfWidth);
    const rightPoint = center.clone().addScaledVector(right, halfWidth);
    positions.push(leftPoint.x, y, leftPoint.z, rightPoint.x, y, rightPoint.z);
    const local = index - start;
    if (index < end) {
      const base = local * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function poseAt(track: CircuitAlpha, progress: number, lateralOffset = 0, y = 0): TrackPose {
  const point = track.curve.getPointAt(progress);
  const tangent = track.curve.getTangentAt(progress).normalize();
  const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
  point.addScaledVector(right, lateralOffset).setY(y);
  return {
    point,
    tangent,
    right,
    yaw: Math.atan2(tangent.x, tangent.z),
  };
}

function createSky(): THREE.Mesh {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(760, 40, 22),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x241d46) },
        upperColor: { value: new THREE.Color(0x584977) },
        horizonColor: { value: new THREE.Color(0xe2a5b6) },
        lowerColor: { value: new THREE.Color(0x69546f) },
        sunColor: { value: new THREE.Color(0xffd3a0) },
      },
      vertexShader: `varying vec3 worldPosition;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          worldPosition = world.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 topColor;
        uniform vec3 upperColor;
        uniform vec3 horizonColor;
        uniform vec3 lowerColor;
        uniform vec3 sunColor;
        varying vec3 worldPosition;
        void main() {
          vec3 direction = normalize(worldPosition);
          float h = direction.y;
          vec3 upper = mix(horizonColor, upperColor, smoothstep(0.0, 0.36, h));
          upper = mix(upper, topColor, smoothstep(0.36, 0.88, h));
          vec3 color = h >= 0.0
            ? upper
            : mix(horizonColor, lowerColor, smoothstep(0.0, -0.34, h));
          float sun = pow(max(dot(direction, normalize(vec3(-0.55, 0.20, -0.82))), 0.0), 120.0);
          float glow = pow(max(dot(direction, normalize(vec3(-0.55, 0.20, -0.82))), 0.0), 10.0);
          color = mix(color, sunColor, min(1.0, sun * 1.7 + glow * 0.22));
          gl_FragColor = vec4(color, 1.0);
        }`,
    }),
  );
  sky.name = 'dusk-sky';
  return sky;
}

function createRoadsideCurbs(track: CircuitAlpha): THREE.InstancedMesh {
  const step = 8;
  const count = Math.floor(track.sampleCount / step) * 2;
  const geometry = new THREE.BoxGeometry(0.62, 0.18, 1.7);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.04,
    vertexColors: true,
  });
  const curbs = new THREE.InstancedMesh(geometry, material, count);
  curbs.name = 'roadside-curbs';
  curbs.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const violet = new THREE.Color(COLORS.shoulderEdge);
  const gold = new THREE.Color(0xe4bd62);
  let instance = 0;

  for (let sampleIndex = 0; sampleIndex < track.sampleCount; sampleIndex += step) {
    const point = track.samples[sampleIndex];
    const tangent = track.tangents[sampleIndex];
    if (point === undefined || tangent === undefined) continue;
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    for (const side of [-1, 1]) {
      dummy.position
        .copy(point)
        .addScaledVector(right, side * (track.roadHalfWidth + 0.42))
        .setY(0.07);
      dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      curbs.setMatrixAt(instance, dummy.matrix);
      curbs.setColorAt(instance, (sampleIndex / step + (side > 0 ? 1 : 0)) % 2 === 0 ? violet : gold);
      instance += 1;
    }
  }

  curbs.instanceMatrix.needsUpdate = true;
  if (curbs.instanceColor !== null) curbs.instanceColor.needsUpdate = true;
  return curbs;
}

function createRoadsideReflectors(track: CircuitAlpha): THREE.InstancedMesh {
  const step = 16;
  const count = Math.floor(track.sampleCount / step) * 2;
  const geometry = new THREE.BoxGeometry(0.14, 0.7, 0.14);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x372745,
    emissiveIntensity: 0.55,
    roughness: 0.4,
    metalness: 0.25,
    vertexColors: true,
  });
  const reflectors = new THREE.InstancedMesh(geometry, material, count);
  reflectors.name = 'roadside-reflectors';

  const dummy = new THREE.Object3D();
  const cyan = new THREE.Color(0x77e7ff);
  const violet = new THREE.Color(0xc1a0e2);
  let instance = 0;

  for (let sampleIndex = 0; sampleIndex < track.sampleCount; sampleIndex += step) {
    const point = track.samples[sampleIndex];
    const tangent = track.tangents[sampleIndex];
    if (point === undefined || tangent === undefined) continue;
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    for (const side of [-1, 1]) {
      dummy.position
        .copy(point)
        .addScaledVector(right, side * (track.roadHalfWidth + 1.25))
        .setY(0.35);
      dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      reflectors.setMatrixAt(instance, dummy.matrix);
      reflectors.setColorAt(instance, side > 0 ? cyan : violet);
      instance += 1;
    }
  }

  reflectors.instanceMatrix.needsUpdate = true;
  if (reflectors.instanceColor !== null) reflectors.instanceColor.needsUpdate = true;
  return reflectors;
}

function createForest(track: CircuitAlpha): THREE.Group {
  const group = new THREE.Group();
  group.name = 'trackside-forest';
  const count = 64;
  const trunkGeometry = new THREE.CylinderGeometry(0.28, 0.42, 3.4, 6);
  const crownGeometry = new THREE.ConeGeometry(2.4, 6.5, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.trunk,
    roughness: 1,
  });
  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    vertexColors: true,
    flatShading: true,
  });
  const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, count);
  const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, count);
  trunks.name = 'forest-trunks';
  crowns.name = 'forest-canopy';
  trunks.castShadow = true;
  crowns.castShadow = true;

  const dummy = new THREE.Object3D();
  const dark = new THREE.Color(COLORS.forest);
  const light = new THREE.Color(COLORS.forestLight);

  for (let instance = 0; instance < count; instance += 1) {
    const sampleIndex = (instance * 6) % track.sampleCount;
    const point = track.samples[sampleIndex]?.clone() ?? new THREE.Vector3();
    const tangent = track.tangents[sampleIndex] ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const side = instance % 2 === 0 ? 1 : -1;
    const lateral = 18 + ((instance * 17) % 13);
    const along = ((instance % 5) - 2) * 1.35;
    const scale = 0.88 + ((instance * 11) % 8) * 0.055;
    point.addScaledVector(right, side * lateral).addScaledVector(tangent, along);

    dummy.position.copy(point).setY(1.7 * scale - 0.02);
    dummy.rotation.set(0, (instance * 1.618) % (Math.PI * 2), 0);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    trunks.setMatrixAt(instance, dummy.matrix);

    dummy.position.copy(point).setY(5.3 * scale);
    dummy.rotation.set(0, (instance * 0.83) % (Math.PI * 2), 0);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    crowns.setMatrixAt(instance, dummy.matrix);
    crowns.setColorAt(instance, instance % 3 === 0 ? light : dark);
  }

  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  if (crowns.instanceColor !== null) crowns.instanceColor.needsUpdate = true;
  group.add(trunks, crowns);
  return group;
}

function createTracksideRocks(track: CircuitAlpha): THREE.InstancedMesh {
  const count = 36;
  const geometry = new THREE.DodecahedronGeometry(1, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.96,
    metalness: 0.02,
    vertexColors: true,
    flatShading: true,
  });
  const rocks = new THREE.InstancedMesh(geometry, material, count);
  rocks.name = 'trackside-rocks';
  rocks.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const warm = new THREE.Color(0x69586a);
  const cool = new THREE.Color(COLORS.stone);

  for (let instance = 0; instance < count; instance += 1) {
    const sampleIndex = (instance * 11) % track.sampleCount;
    const point = track.samples[sampleIndex]?.clone() ?? new THREE.Vector3();
    const tangent = track.tangents[sampleIndex] ?? new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    const side = instance % 2 === 0 ? 1 : -1;
    const lateral = 12.5 + ((instance * 7) % 14);
    const scaleX = 1.1 + ((instance * 5) % 7) * 0.22;
    const scaleY = 0.75 + ((instance * 3) % 5) * 0.18;
    const scaleZ = 1 + ((instance * 13) % 6) * 0.2;
    point.addScaledVector(right, side * lateral);

    dummy.position.copy(point).setY(scaleY * 0.55 - 0.06);
    dummy.rotation.set(instance * 0.17, instance * 0.71, instance * 0.09);
    dummy.scale.set(scaleX, scaleY, scaleZ);
    dummy.updateMatrix();
    rocks.setMatrixAt(instance, dummy.matrix);
    rocks.setColorAt(instance, instance % 3 === 0 ? warm : cool);
  }

  rocks.instanceMatrix.needsUpdate = true;
  if (rocks.instanceColor !== null) rocks.instanceColor.needsUpdate = true;
  return rocks;
}

function createDistantMountains(): THREE.InstancedMesh {
  const count = 18;
  const geometry = new THREE.ConeGeometry(1, 1, 7);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    vertexColors: true,
    flatShading: true,
  });
  const mountains = new THREE.InstancedMesh(geometry, material, count);
  mountains.name = 'distant-mountains';

  const dummy = new THREE.Object3D();
  const violet = new THREE.Color(0x4c405d);
  const green = new THREE.Color(0x344d44);

  for (let instance = 0; instance < count; instance += 1) {
    const angle = (instance / count) * Math.PI * 2;
    const radius = 315 + ((instance * 29) % 58);
    const width = 38 + ((instance * 17) % 28);
    const height = 72 + ((instance * 23) % 66);
    dummy.position.set(Math.cos(angle) * radius, height * 0.5 - 11, Math.sin(angle) * radius);
    dummy.rotation.set(0, -angle + instance * 0.07, 0);
    dummy.scale.set(width, height, width * (0.82 + (instance % 4) * 0.08));
    dummy.updateMatrix();
    mountains.setMatrixAt(instance, dummy.matrix);
    mountains.setColorAt(instance, instance % 3 === 0 ? green : violet);
  }

  mountains.instanceMatrix.needsUpdate = true;
  if (mountains.instanceColor !== null) mountains.instanceColor.needsUpdate = true;
  return mountains;
}

function createCenterMesa(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'center-mesa';

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.stoneDark,
    roughness: 0.95,
    flatShading: true,
  });
  const midMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.stone,
    roughness: 0.92,
    flatShading: true,
  });
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0x294f39,
    roughness: 1,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(69, 82, 15, 12), baseMaterial);
  base.position.y = 7.25;
  base.receiveShadow = true;
  base.castShadow = true;

  const mid = new THREE.Mesh(new THREE.CylinderGeometry(58, 68, 8, 12), midMaterial);
  mid.position.y = 18.5;
  mid.receiveShadow = true;
  mid.castShadow = true;

  const top = new THREE.Mesh(new THREE.CylinderGeometry(52, 57, 3.5, 14), topMaterial);
  top.position.y = 24.2;
  top.receiveShadow = true;
  group.add(base, mid, top);

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x61556a,
    roughness: 0.98,
    flatShading: true,
  });
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2 + 0.23;
    const radius = 34 + (index % 3) * 6;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2 + (index % 4) * 0.55, 0), stoneMaterial);
    rock.position.set(Math.cos(angle) * radius, 26.3 + (index % 2) * 0.8, Math.sin(angle) * radius);
    rock.rotation.set(index * 0.13, index * 0.41, index * 0.08);
    rock.castShadow = true;
    group.add(rock);
  }

  const trunkMaterial = new THREE.MeshStandardMaterial({ color: COLORS.trunk, roughness: 1 });
  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0x224d34,
    roughness: 0.95,
    flatShading: true,
  });
  for (let index = 0; index < 9; index += 1) {
    const angle = (index / 9) * Math.PI * 2 + 0.5;
    const radius = 17 + (index % 3) * 7;
    const heightScale = 0.8 + (index % 4) * 0.09;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 3, 6), trunkMaterial);
    trunk.position.set(Math.cos(angle) * radius, 27, Math.sin(angle) * radius);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(2.6, 6.7, 8), crownMaterial);
    crown.position.set(Math.cos(angle) * radius, 31.4, Math.sin(angle) * radius);
    crown.scale.setScalar(heightScale);
    trunk.castShadow = true;
    crown.castShadow = true;
    group.add(trunk, crown);
  }

  const beaconMaterial = new THREE.MeshStandardMaterial({
    color: 0x8d75a9,
    emissive: 0x5e3d81,
    emissiveIntensity: 0.9,
    roughness: 0.35,
    metalness: 0.3,
  });
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(2.5, 0), beaconMaterial);
  beacon.name = 'mesa-beacon';
  beacon.position.set(0, 37, 0);
  group.add(beacon);

  return group;
}

function createStartFinishGate(track: CircuitAlpha): THREE.Group {
  const visualProgress = 22 / track.curve.getLength();
  const pose = poseAt(track, visualProgress);
  const gate = new THREE.Group();
  gate.name = 'start-finish-gate';
  gate.position.copy(pose.point);
  gate.rotation.y = pose.yaw;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x332b3c,
    roughness: 0.58,
    metalness: 0.48,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    emissive: 0x5b4411,
    emissiveIntensity: 0.7,
    roughness: 0.38,
    metalness: 0.28,
  });

  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.8, 0.7), frameMaterial);
    post.position.set(side * (track.roadHalfWidth + 1.25), 2.4, 0);
    post.castShadow = true;
    gate.add(post);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.5), accentMaterial);
    foot.position.set(side * (track.roadHalfWidth + 1.25), 0.16, 0);
    gate.add(foot);
  }

  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(track.roadHalfWidth * 2 + 3.2, 0.85, 0.75),
    frameMaterial,
  );
  crossbar.position.y = 4.6;
  crossbar.castShadow = true;
  gate.add(crossbar);

  const panelCount = 10;
  const panels = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.22, 0.46, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, vertexColors: true }),
    panelCount,
  );
  panels.name = 'start-finish-panels';
  const dummy = new THREE.Object3D();
  const gold = new THREE.Color(COLORS.gold);
  const violet = new THREE.Color(COLORS.violet);
  for (let index = 0; index < panelCount; index += 1) {
    dummy.position.set((index - (panelCount - 1) / 2) * 1.25, 4.6, -0.405);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    panels.setMatrixAt(index, dummy.matrix);
    panels.setColorAt(index, index % 2 === 0 ? gold : violet);
  }
  panels.instanceMatrix.needsUpdate = true;
  if (panels.instanceColor !== null) panels.instanceColor.needsUpdate = true;
  gate.add(panels);

  return gate;
}

function createUnderpass(track: CircuitAlpha): THREE.Group {
  const pose = poseAt(track, 0.745);
  const underpass = new THREE.Group();
  underpass.name = 'underpass-gate';
  underpass.position.copy(pose.point);
  underpass.rotation.y = pose.yaw;

  const stone = new THREE.MeshStandardMaterial({
    color: 0x40384a,
    roughness: 0.92,
    metalness: 0.03,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: COLORS.bronze,
    roughness: 0.62,
    metalness: 0.46,
  });
  const glow = new THREE.MeshStandardMaterial({
    color: 0x80e7ff,
    emissive: 0x2e8eaa,
    emissiveIntensity: 1.1,
    roughness: 0.3,
  });

  for (const side of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(2.1, 5.2, 4.8), stone);
    pier.position.set(side * (track.roadHalfWidth + 2), 2.55, 0);
    pier.castShadow = true;
    underpass.add(pier);

    const trimPost = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.2, 5), trim);
    trimPost.position.set(side * (track.roadHalfWidth + 0.95), 2.35, 0);
    underpass.add(trimPost);
  }

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(track.roadHalfWidth * 2 + 5.6, 1.25, 5.4),
    stone,
  );
  deck.position.y = 5.05;
  deck.castShadow = true;
  underpass.add(deck);

  const band = new THREE.Mesh(
    new THREE.BoxGeometry(track.roadHalfWidth * 2 + 2.4, 0.22, 5.58),
    trim,
  );
  band.position.y = 4.56;
  underpass.add(band);

  for (const side of [-1, 1]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 0.22), glow);
    lamp.position.set(side * 3.3, 4.35, 1.65);
    underpass.add(lamp);
  }

  return underpass;
}

function createBoostPad(track: CircuitAlpha, progress: number): THREE.Group {
  const pose = poseAt(track, progress, 0, 0.08);
  const pad = new THREE.Group();
  pad.name = `boost-pad-${progress.toFixed(3)}`;
  pad.position.copy(pose.point);
  pad.rotation.y = pose.yaw;

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.12, 3.2),
    new THREE.MeshStandardMaterial({
      color: 0x173846,
      emissive: 0x0d5568,
      emissiveIntensity: 0.55,
      roughness: 0.42,
      metalness: 0.35,
    }),
  );
  pad.add(base);

  const chevronMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.cyan,
    emissive: 0x27b7db,
    emissiveIntensity: 1.15,
    roughness: 0.28,
    metalness: 0.15,
  });
  for (const x of [-3.1, -1.55, 0, 1.55, 3.1]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 2.45), chevronMaterial);
    bar.position.set(x, 0.09, 0);
    bar.rotation.y = THREE.MathUtils.degToRad(18);
    pad.add(bar);
  }
  return pad;
}

function createRamp(track: CircuitAlpha): THREE.Group {
  const pose = poseAt(track, 0.5, 0, 0.04);
  const ramp = new THREE.Group();
  ramp.name = 'crest-ramp-visual';
  ramp.position.copy(pose.point);
  ramp.rotation.y = pose.yaw;

  const width = 5;
  const length = 9.5;
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const lowHeight = 0.08;
  const highHeight = 1.3;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [
        -halfWidth, 0, -halfLength,
        halfWidth, 0, -halfLength,
        -halfWidth, 0, halfLength,
        halfWidth, 0, halfLength,
        -halfWidth, lowHeight, -halfLength,
        halfWidth, lowHeight, -halfLength,
        -halfWidth, highHeight, halfLength,
        halfWidth, highHeight, halfLength,
      ],
      3,
    ),
  );
  geometry.setIndex([
    0, 2, 1, 1, 2, 3,
    4, 5, 6, 5, 7, 6,
    0, 1, 4, 1, 5, 4,
    2, 6, 3, 3, 6, 7,
    0, 4, 2, 4, 6, 2,
    1, 3, 5, 3, 7, 5,
  ]);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const deck = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0x5e4931,
      roughness: 0.72,
      metalness: 0.18,
    }),
  );
  deck.name = 'crest-ramp-deck';
  deck.receiveShadow = true;
  deck.castShadow = true;
  ramp.add(deck);

  const railMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    emissive: 0x795715,
    emissiveIntensity: 0.75,
    roughness: 0.38,
    metalness: 0.3,
  });
  const rise = highHeight - lowHeight;
  const slope = Math.atan2(rise, length);
  const railLength = Math.hypot(length, rise) + 0.08;
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, railLength), railMaterial);
    rail.position.set(side * (halfWidth - 0.12), (lowHeight + highHeight) / 2 + 0.1, 0);
    rail.rotation.x = -slope;
    ramp.add(rail);
  }

  const approachLip = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.12, 0.28),
    railMaterial,
  );
  approachLip.name = 'crest-ramp-approach-edge';
  approachLip.position.set(0, lowHeight + 0.05, -halfLength + 0.14);
  ramp.add(approachLip);

  return ramp;
}

function createCheckpointPylons(track: CircuitAlpha): THREE.InstancedMesh {
  const count = track.checkpointIndices.length * 2;
  const geometry = new THREE.CylinderGeometry(0.24, 0.36, 3.2, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.16,
    vertexColors: true,
  });
  const pylons = new THREE.InstancedMesh(geometry, material, count);
  pylons.name = 'checkpoint-pylons';
  const dummy = new THREE.Object3D();
  const startColor = new THREE.Color(0xf3dd69);
  const checkpointColor = new THREE.Color(0x76538f);
  let instance = 0;

  track.checkpointIndices.forEach((sampleIndex, checkpointIndex) => {
    const point = track.samples[sampleIndex];
    const tangent = track.tangents[sampleIndex];
    if (point === undefined || tangent === undefined) return;
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    for (const side of [-1, 1]) {
      dummy.position
        .copy(point)
        .addScaledVector(right, side * (track.roadHalfWidth + 1.55))
        .setY(1.6);
      dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      pylons.setMatrixAt(instance, dummy.matrix);
      pylons.setColorAt(instance, checkpointIndex === 0 ? startColor : checkpointColor);
      instance += 1;
    }
  });

  pylons.instanceMatrix.needsUpdate = true;
  if (pylons.instanceColor !== null) pylons.instanceColor.needsUpdate = true;
  return pylons;
}

function createLandmarkBeacons(track: CircuitAlpha): THREE.Group {
  const group = new THREE.Group();
  group.name = 'landmark-beacons';
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x46394f,
    roughness: 0.62,
    metalness: 0.22,
  });
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0xcda7ff,
    emissive: 0x7348a0,
    emissiveIntensity: 0.95,
    roughness: 0.32,
  });

  for (const progress of [0.17, 0.36, 0.66, 0.89]) {
    const side = progress === 0.36 || progress === 0.89 ? -1 : 1;
    const pose = poseAt(track, progress, side * (track.roadHalfWidth + 5.2));
    const beacon = new THREE.Group();
    beacon.position.copy(pose.point);
    beacon.rotation.y = pose.yaw;

    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.2, 0.55), frameMaterial);
    stem.position.y = 2.05;
    stem.castShadow = true;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), glowMaterial);
    gem.position.y = 4.55;
    beacon.add(stem, gem);
    group.add(beacon);
  }

  return group;
}

export function createTrackScene(track: CircuitAlpha): THREE.Group {
  const group = new THREE.Group();
  group.name = 'circuit-alpha-environment';
  group.add(createSky());

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 900),
    new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 1, metalness: 0 }),
  );
  ground.name = 'track-ground';
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  group.add(ground);

  const shoulder = createStrip(
    track,
    track.roadHalfWidth + 0.78,
    new THREE.MeshStandardMaterial({
      color: COLORS.shoulder,
      roughness: 0.92,
      metalness: 0.01,
    }),
    -0.025,
  );
  shoulder.name = 'track-shoulder';
  shoulder.receiveShadow = true;
  group.add(shoulder);

  const road = createStrip(
    track,
    track.roadHalfWidth,
    new THREE.MeshStandardMaterial({
      color: COLORS.asphalt,
      roughness: 0.82,
      metalness: 0.02,
    }),
    0,
  );
  road.name = 'track-road';
  road.receiveShadow = true;
  group.add(road);

  const racingWear = createStrip(
    track,
    track.roadHalfWidth - 1.15,
    new THREE.MeshStandardMaterial({
      color: COLORS.asphaltWear,
      roughness: 0.7,
      metalness: 0.015,
    }),
    0.009,
  );
  racingWear.name = 'asphalt-racing-wear';
  racingWear.receiveShadow = true;
  group.add(racingWear);

  const dirt = createSegmentStrip(
    track,
    0.235,
    0.315,
    3.75,
    2.25,
    new THREE.MeshStandardMaterial({
      color: COLORS.dirt,
      roughness: 1,
      metalness: 0,
    }),
    0.026,
  );
  dirt.name = 'split-bend-dirt-line';
  dirt.receiveShadow = true;
  group.add(dirt);

  group.add(
    createRoadsideCurbs(track),
    createRoadsideReflectors(track),
    createGuardrailVisual(track),
    createForest(track),
    createTracksideRocks(track),
    createDistantMountains(),
    createCenterMesa(),
    createStartFinishGate(track),
    createUnderpass(track),
    createBoostPad(track, 0.45),
    createBoostPad(track, 0.815),
    createRamp(track),
    createCheckpointPylons(track),
    createLandmarkBeacons(track),
  );

  return group;
}
