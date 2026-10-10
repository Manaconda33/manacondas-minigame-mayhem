import * as THREE from 'three';
import type { GraphicsQuality } from '../../config/graphicsQuality';
import type { NeonGrid } from './NeonGrid';
import {
  NeonGridVisualClock,
  neonGridRightAt,
  neonGridSurfaceSliceGeometry,
} from './NeonGridVisualCommon';
import {
  cityGroundFootingBounds,
  mergeInstancedCityMeshesIntoGround,
  neonGridCityGroundOptions,
  neonGridSteppedTowerGeometry,
  neonGridTerracedCityGroundGeometry,
} from './NeonGridCityGround';
import { disposeTrackScene } from './TrackSceneResources';

const START = 0.7;
const END = 0.85;
const SEGMENTS = 56;
// A 2 m route-space overlap lets the outer city floor follow the true world
// projection where lateral offsets shift the visible seam across the protected
// Falls Run section boundary.
const CITY_GROUND_SEAM = 0.002;
const CYAN = 0x37e6ff;
const GOLD = 0xffc63f;
const MAGENTA = 0xff4fd8;

function diveWallOpen(track: NeonGrid, side: number, progress: number): boolean {
  const center = track.curve.getPointAt(progress);
  const right = neonGridRightAt(track, progress);
  const edge = center.addScaledVector(right, side * track.halfWidthAt(progress));
  return track.waterfallDive.junctionContains(edge);
}

function segmentCrossesDiveOpening(
  track: NeonGrid,
  side: number,
  startProgress: number,
  endProgress: number,
): boolean {
  const middleProgress = (startProgress + endProgress) * 0.5;
  return [startProgress, middleProgress, endProgress].some((progress) =>
    diveWallOpen(track, side, progress),
  );
}

export function fallsRunEdgeGeometry(track: NeonGrid): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const thickness = 0.09;
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
          .add(new THREE.Vector3(0, 0.045, 0));
        positions.push(...point.toArray());
      }
      if (i < SEGMENTS) {
        const nextProgress = THREE.MathUtils.lerp(START, END, (i + 1) / SEGMENTS);
        if (segmentCrossesDiveOpening(track, side, progress, nextProgress)) continue;
        const a = base + i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
  }
  return new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    .setIndex(indices);
}

export function fallsRunWallCladdingGeometry(track: NeonGrid): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const side of [-1, 1]) {
    const base = positions.length / 3;
    for (let i = 0; i <= SEGMENTS; i++) {
      const progress = THREE.MathUtils.lerp(START, END, i / SEGMENTS);
      const center = track.curve.getPointAt(progress);
      const right = neonGridRightAt(track, progress);
      const lower = center
        .clone()
        .addScaledVector(right, side * (track.halfWidthAt(progress) + 0.24))
        .add(new THREE.Vector3(0, 0.03, 0));
      const upper = lower.clone().add(new THREE.Vector3(0, 1.38, 0));
      positions.push(...lower.toArray(), ...upper.toArray());
      if (i < SEGMENTS) {
        const nextProgress = THREE.MathUtils.lerp(START, END, (i + 1) / SEGMENTS);
        if (segmentCrossesDiveOpening(track, side, progress, nextProgress)) continue;
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

function fasciaGeometry(track: NeonGrid): THREE.BufferGeometry {
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
      const bottom = top.clone().add(new THREE.Vector3(0, -8.5, 0));
      positions.push(...top.toArray(), ...bottom.toArray());
      if (i < SEGMENTS) {
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
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  material.forceSinglePass = true;
  material.userData.bloomBlackAdapter = true;
  return material;
}

function nightSky(): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        mat4 rotationOnlyView = mat4(mat3(viewMatrix));
        vec4 clip = projectionMatrix * rotationOnlyView * vec4(position, 1.0);
        gl_Position = clip.xyww;
      }`,
    fragmentShader: `varying vec3 vDirection;
      float hash(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      void main() {
        float h = normalize(vDirection).y;
        vec3 zenith = vec3(0.002, 0.006, 0.018);
        vec3 upper = vec3(0.005, 0.018, 0.040);
        vec3 horizon = vec3(0.008, 0.012, 0.028);
        vec3 color = mix(horizon, upper, smoothstep(-0.02, 0.28, h));
        color = mix(color, zenith, smoothstep(0.28, 0.88, h));
        float cityGlow = exp(-abs(h) * 17.0) * (0.45 + 0.25 * sin(atan(vDirection.z, vDirection.x) * 4.0));
        color += vec3(0.035, 0.055, 0.13) * max(cityGlow, 0.0);
        float cyanGlow = exp(-abs(h + 0.02) * 24.0) * max(0.0, sin(atan(vDirection.z, vDirection.x) * 3.0 + 1.7));
        color += vec3(0.01, 0.12, 0.18) * cyanGlow * 0.35;
        vec3 cell = floor(normalize(vDirection) * 520.0);
        float star = step(0.9975, hash(cell)) * smoothstep(0.08, 0.42, h);
        color += vec3(star * 0.55);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  material.userData.bloomBlackAdapter = true;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(820, 36, 20), material);
  sky.name = 'falls-run-night-sky';
  sky.frustumCulled = false;
  sky.userData.cameraRelative = true;
  return sky;
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
        float alpha = edge * clamp(torn, 0.35, 1.0) * 0.90;
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.forceSinglePass = true;
  material.userData.bloomBlackAdapter = true;
  return material;
}

function mistMaterial(): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
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
  material.userData.bloomBlackAdapter = true;
  return material;
}

function addStructure(group: THREE.Group, track: NeonGrid): void {
  const fasciaMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a1420,
    roughness: 0.82,
    metalness: 0.28,
    side: THREE.DoubleSide,
  });
  const fascia = new THREE.Mesh(fasciaGeometry(track), fasciaMaterial);
  fascia.name = 'falls-run-deck-fascia';
  group.add(fascia);

  const pylonMaterial = new THREE.MeshStandardMaterial({
    color: 0x101d29,
    roughness: 0.7,
    metalness: 0.4,
  });
  const pylons = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, 12, 1.25), pylonMaterial, 12);
  pylons.name = 'falls-run-pylons';

  const braces = new THREE.InstancedMesh(new THREE.BoxGeometry(0.32, 0.32, 8.5), pylonMaterial, 22);
  braces.name = 'falls-run-cross-braces';
  const dummy = new THREE.Object3D();

  for (let i = 0; i < pylons.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.008, END - 0.008, i / (pylons.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 2 === 0 ? -1 : 1;
    const point = center.clone().addScaledVector(right, side * (track.halfWidthAt(progress) + 2.4));
    dummy.position.copy(point).add(new THREE.Vector3(0, -6.0, 0));
    dummy.rotation.set(
      0,
      Math.atan2(track.curve.getTangentAt(progress).x, track.curve.getTangentAt(progress).z),
      0,
    );
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    pylons.setMatrixAt(i, dummy.matrix);
  }
  pylons.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < braces.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.004, END - 0.004, i / (braces.count - 1));
    const center = track.curve.getPointAt(progress);
    const tangent = track.curve.getTangentAt(progress).setY(0).normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    dummy.position.copy(center).add(new THREE.Vector3(0, -3.8 - (i % 2) * 1.8, 0));
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), i % 2 === 0 ? 0.66 : -0.66);
    dummy.position.addScaledVector(right, ((i % 3) - 1) * 1.4);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    braces.setMatrixAt(i, dummy.matrix);
  }
  braces.instanceMatrix.needsUpdate = true;
  group.add(pylons, braces);
}

function addCity(group: THREE.Group, track: NeonGrid, quality: GraphicsQuality): void {
  const groundOptions = neonGridCityGroundOptions(
    track,
    START - CITY_GROUND_SEAM,
    END + CITY_GROUND_SEAM,
    13,
  );
  const ground = new THREE.Mesh(
    neonGridTerracedCityGroundGeometry(track, groundOptions),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      side: THREE.DoubleSide,
    }),
  );
  ground.name = 'falls-run-city-terraced-ground';
  ground.userData.presentationOnly = true;
  ground.userData.collision = false;
  ground.userData.progressRange = [groundOptions.start, groundOptions.end];

  const towerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const towers = new THREE.InstancedMesh(neonGridSteppedTowerGeometry(), towerMaterial, 24);
  towers.name = 'falls-run-city-towers';
  towers.userData.presentationOnly = true;
  towers.userData.collision = false;
  const towerDummy = new THREE.Object3D();
  const facadeColors = [
    new THREE.Color(0x1d3d51),
    new THREE.Color(0x223853),
    new THREE.Color(0x332f4d),
    new THREE.Color(0x25464d),
  ];

  const towerData: {
    position: THREE.Vector3;
    width: number;
    depth: number;
    height: number;
    baseY: number;
    foundationBottom: number;
    foundationDepth: number;
    foundationWidth: number;
    foundationDepthWidth: number;
  }[] = [];
  for (let attempt = 0; attempt < 360 && towerData.length < towers.count; attempt++) {
    const i = towerData.length;
    const progressFraction = ((attempt * 37) % 359) / 358;
    const progress = THREE.MathUtils.lerp(START + 0.012, END - 0.012, progressFraction);
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const preferredSide = i % 2 === 0 ? -1 : 1;
    const preferredLateral = 24 + ((attempt * 7) % 25);
    const baseWidth = 7 + ((attempt * 5) % 8);
    const baseDepth = 7 + ((attempt * 11) % 10);
    const originalHeight = 34 + ((i * 13) % 46);
    let placed = false;
    for (const scaleFactor of [1, 0.86, 0.72]) {
      const width = baseWidth * scaleFactor;
      const depth = baseDepth * scaleFactor;
      const foundationWidth = width * 1.18;
      const foundationDepthWidth = depth * 1.18;
      const offsets = [0, -6, -12, -18, 6, 12];
      const sides = [preferredSide, (preferredSide * -1) as -1 | 1];
      for (const side of sides) {
        for (const delta of offsets) {
          const lateral = Math.max(
            groundOptions.innerOffset + Math.max(foundationWidth, foundationDepthWidth) * 0.58,
            preferredLateral + delta,
          );
          const position = center.clone().addScaledVector(right, side * lateral);
          if (towerData.some((tower) =>
            Math.hypot(tower.position.x - position.x, tower.position.z - position.z) <
            (Math.hypot(tower.width, tower.depth) + Math.hypot(width, depth)) * 0.42,
          )) continue;
          let footing: ReturnType<typeof cityGroundFootingBounds>;
          try {
            footing = cityGroundFootingBounds(
              track,
              groundOptions,
              position,
              0,
              foundationWidth,
              foundationDepthWidth,
              1.5,
              ground,
            );
          } catch {
            continue;
          }
          const baseY = footing.topY;
          const height = Math.max(20, center.y - 11 + originalHeight - baseY);
          position.y = baseY + height * 0.5;
          towerData.push({
            position,
            width,
            depth,
            height,
            baseY,
            foundationBottom: footing.bottomY,
            foundationDepth: footing.depth,
            foundationWidth,
            foundationDepthWidth,
          });
          towerDummy.position.copy(position).setY(baseY);
          towerDummy.rotation.set(0, 0, 0);
          towerDummy.scale.set(width, height, depth);
          towerDummy.updateMatrix();
          towers.setMatrixAt(i, towerDummy.matrix);
          towers.setColorAt(
            i,
            facadeColors[i % facadeColors.length] ?? facadeColors[0] ?? new THREE.Color(0x1d3d51),
          );
          placed = true;
          break;
        }
        if (placed) break;
      }
      if (placed) break;
    }
  }
  if (towerData.length !== towers.count)
    throw new Error(`Falls Run requires 24 supported city towers; got ${String(towerData.length)}`);
  towers.instanceMatrix.needsUpdate = true;
  if (towers.instanceColor) towers.instanceColor.needsUpdate = true;

  const foundationLower = new THREE.BoxGeometry(1, 0.58, 1).translate(0, 0.29, 0);
  const foundationUpper = new THREE.BoxGeometry(0.82, 0.28, 0.82).translate(0, 0.72, 0);
  const foundationCap = new THREE.BoxGeometry(0.92, 0.14, 0.92).translate(0, 0.93, 0);
  const foundationGeometry = new THREE.BufferGeometry();
  const foundationPositions: number[] = [];
  const foundationIndices: number[] = [];
  for (const part of [foundationLower, foundationUpper, foundationCap]) {
    const offset = foundationPositions.length / 3;
    const attribute = part.getAttribute('position');
    for (let i = 0; i < attribute.count; i++)
      foundationPositions.push(attribute.getX(i), attribute.getY(i), attribute.getZ(i));
    const index = part.index;
    if (index) for (let i = 0; i < index.count; i++) foundationIndices.push(offset + index.getX(i));
  }
  foundationLower.dispose();
  foundationUpper.dispose();
  foundationCap.dispose();
  foundationGeometry
    .setAttribute('position', new THREE.Float32BufferAttribute(foundationPositions, 3))
    .setIndex(foundationIndices);
  foundationGeometry.computeVertexNormals();
  const foundations = new THREE.InstancedMesh(
    foundationGeometry,
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    towerData.length,
  );
  foundations.name = 'falls-run-city-foundations';
  foundations.userData.presentationOnly = true;
  foundations.userData.collision = false;
  const foundationColors = [
    new THREE.Color(0x263f4d),
    new THREE.Color(0x2b3d4f),
    new THREE.Color(0x343348),
  ];
  towerData.forEach((tower, i) => {
    towerDummy.position.copy(tower.position).setY(tower.foundationBottom);
    towerDummy.rotation.set(0, 0, 0);
    towerDummy.scale.set(
      tower.foundationWidth,
      tower.foundationDepth,
      tower.foundationDepthWidth,
    );
    towerDummy.updateMatrix();
    foundations.setMatrixAt(i, towerDummy.matrix);
    foundations.setColorAt(
      i,
      foundationColors[i % foundationColors.length] ??
        foundationColors[0] ??
        new THREE.Color(0x263f4d),
    );
  });
  foundations.instanceMatrix.needsUpdate = true;
  if (foundations.instanceColor) foundations.instanceColor.needsUpdate = true;

  const windowCount = quality === 'low' ? 160 : quality === 'high' ? 480 : 320;
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const windows = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.7, 0.42),
    windowMaterial,
    windowCount,
  );
  windows.name = 'falls-run-city-windows';
  const dummy = new THREE.Object3D();
  const cyan = new THREE.Color(CYAN);
  const gold = new THREE.Color(0xffb65c);
  const magenta = new THREE.Color(MAGENTA);
  for (let i = 0; i < windowCount; i++) {
    const tower = towerData[(i * 7) % towerData.length];
    if (tower === undefined) continue;
    const row = (i * 5) % 15;
    const column = (i * 11) % 9;
    const heightFraction = 0.12 + (row / 14) * 0.76;
    const tierScale = heightFraction > 0.62 ? 0.74 : 1;
    dummy.position.copy(tower.position);
    dummy.position.y = tower.baseY + heightFraction * tower.height;
    const columnOffset = (column / 8 - 0.5) * 0.74;
    if (i % 2 === 0) {
      dummy.position.x += columnOffset * tower.width * tierScale;
      dummy.position.z += tower.depth * tierScale * 0.505;
      dummy.rotation.set(0, 0, 0);
    } else {
      dummy.position.z += columnOffset * tower.depth * tierScale;
      dummy.position.x += tower.width * tierScale * 0.505;
      dummy.rotation.set(0, Math.PI / 2, 0);
    }
    dummy.scale.set(1.05 + (i % 3) * 0.16, 0.95, 1);
    dummy.updateMatrix();
    windows.setMatrixAt(i, dummy.matrix);
    windows.setColorAt(i, i % 13 === 0 ? magenta : i % 4 === 0 ? gold : cyan);
  }
  windows.instanceMatrix.needsUpdate = true;
  if (windows.instanceColor) windows.instanceColor.needsUpdate = true;

  const roofLights = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 0.16, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    towerData.length,
  );
  roofLights.name = 'falls-run-city-roof-lights';
  for (let i = 0; i < towerData.length; i++) {
    const tower = towerData[i];
    if (tower === undefined) continue;
    dummy.position.copy(tower.position);
    dummy.position.y = tower.baseY + tower.height + 0.12;
    dummy.position.z += tower.depth * 0.26;
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(tower.width * 0.48, 1, 1);
    dummy.updateMatrix();
    roofLights.setMatrixAt(i, dummy.matrix);
    roofLights.setColorAt(i, i % 5 === 0 ? magenta : i % 3 === 0 ? gold : cyan);
  }
  roofLights.instanceMatrix.needsUpdate = true;
  if (roofLights.instanceColor) roofLights.instanceColor.needsUpdate = true;
  group.add(ground, foundations, towers, windows, roofLights);
  mergeInstancedCityMeshesIntoGround(ground, [foundations, towers]);
}

function addWaterfallDistrict(
  group: THREE.Group,
  track: NeonGrid,
  quality: GraphicsQuality,
  waterfallMaterial: THREE.ShaderMaterial,
): void {
  const fallCount = 12;
  const falls = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    waterfallMaterial,
    fallCount,
  );
  falls.name = 'falls-run-ambient-waterfalls';
  falls.frustumCulled = false;
  const lipMaterial = new THREE.MeshBasicMaterial({
    color: 0xa7f4ff,
    transparent: true,
    opacity: 0.76,
  });
  const lips = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 0.08, 0.16),
    lipMaterial,
    fallCount,
  );
  lips.name = 'falls-run-waterfall-lips';

  const mistCount = quality === 'low' ? 16 : quality === 'high' ? 48 : 32;
  const mist = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(2.5, 2.5),
    mistMaterial(),
    mistCount,
  );
  mist.name = 'falls-run-ambient-mist';
  mist.frustumCulled = false;

  const spray = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(2.2, 0.7),
    new THREE.MeshBasicMaterial({
      color: 0xa9e9ef,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    fallCount,
  );
  spray.name = 'falls-run-plunge-spray';

  const dummy = new THREE.Object3D();
  const placements: {
    progress: number;
    side: number;
    width: number;
    height: number;
    position: THREE.Vector3;
  }[] = [];
  for (let i = 0; i < fallCount; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.012, END - 0.012, i / (fallCount - 1));
    const side = i % 2 === 0 ? -1 : 1;
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const width = 4.2 + ((i * 7) % 5) * 0.85;
    const height = 12 + ((i * 11) % 6) * 1.6;
    const position = center
      .clone()
      .addScaledVector(right, side * (track.halfWidthAt(progress) + 1.8));
    placements.push({ progress, side, width, height, position });

    dummy.position.copy(position).add(new THREE.Vector3(0, -height * 0.5 - 0.05, 0));
    dummy.rotation.set(
      0,
      Math.atan2(track.curve.getTangentAt(progress).x, track.curve.getTangentAt(progress).z),
      0,
    );
    dummy.scale.set(width, height, 1);
    dummy.updateMatrix();
    falls.setMatrixAt(i, dummy.matrix);

    dummy.position.copy(position).add(new THREE.Vector3(0, 0.03, 0));
    dummy.scale.set(width, 1, 1);
    dummy.updateMatrix();
    lips.setMatrixAt(i, dummy.matrix);

    dummy.position.copy(position).add(new THREE.Vector3(0, -height + 0.5, 0));
    dummy.scale.set(width * 0.72, 1, 1);
    dummy.updateMatrix();
    spray.setMatrixAt(i, dummy.matrix);
  }
  falls.instanceMatrix.needsUpdate = true;
  lips.instanceMatrix.needsUpdate = true;
  spray.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < mistCount; i++) {
    const fall = placements[(i * 5) % placements.length];
    if (fall === undefined) continue;
    const right = neonGridRightAt(track, fall.progress);
    dummy.position
      .copy(fall.position)
      .addScaledVector(right, ((i % 5) - 2) * 0.65)
      .add(new THREE.Vector3(0, -fall.height + 0.8 + (i % 3) * 0.35, 0));
    dummy.scale.setScalar(1 + (i % 4) * 0.18);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mist.setMatrixAt(i, dummy.matrix);
  }
  mist.instanceMatrix.needsUpdate = true;
  group.add(falls, lips, mist, spray);
}

function addSignageAndDebris(group: THREE.Group, track: NeonGrid): void {
  const signMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: CYAN,
    emissiveIntensity: 1.2,
    roughness: 0.35,
    metalness: 0.18,
    vertexColors: true,
  });
  const signs = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.18, 0.32), signMaterial, 18);
  signs.name = 'falls-run-neon-signage';
  const dummy = new THREE.Object3D();
  const cyan = new THREE.Color(CYAN);
  const gold = new THREE.Color(GOLD);
  for (let i = 0; i < signs.count; i++) {
    const progress = THREE.MathUtils.lerp(START + 0.01, END - 0.01, i / (signs.count - 1));
    const center = track.curve.getPointAt(progress);
    const right = neonGridRightAt(track, progress);
    const side = i % 2 === 0 ? -1 : 1;
    dummy.position.copy(center).addScaledVector(right, side * (track.halfWidthAt(progress) + 1.2));
    dummy.position.y += 0.35 + (i % 3) * 0.35;
    dummy.rotation.set(
      0,
      Math.atan2(track.curve.getTangentAt(progress).x, track.curve.getTangentAt(progress).z),
      side * 0.18,
    );
    dummy.scale.set(0.75 + (i % 4) * 0.12, 1, 1);
    dummy.updateMatrix();
    signs.setMatrixAt(i, dummy.matrix);
    signs.setColorAt(i, i % 7 === 0 ? gold : cyan);
  }
  signs.instanceMatrix.needsUpdate = true;
  if (signs.instanceColor) signs.instanceColor.needsUpdate = true;

  const debris = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.18, 0.18, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x17222c, roughness: 0.7, metalness: 0.58 }),
    10,
  );
  debris.name = 'falls-run-dive-rail-debris';
  const dive = track.waterfallDive;
  for (let i = 0; i < debris.count; i++) {
    const distance = dive.mouthDistance + 2.4 + (i % 5) * 1.25;
    const side = i < 5 ? -1 : 1;
    dummy.position
      .copy(dive.pointAtDistance(distance))
      .addScaledVector(dive.right, side * (dive.roadHalfWidth + 0.72 + (i % 2) * 0.25));
    dummy.position.y += 0.2 + (i % 3) * 0.12;
    dummy.rotation.set(
      (i % 3) * 0.17,
      Math.atan2(dive.direction.x, dive.direction.z),
      side * (0.08 + (i % 2) * 0.13),
    );
    dummy.scale.set(1, 1, 0.8 + (i % 3) * 0.2);
    dummy.updateMatrix();
    debris.setMatrixAt(i, dummy.matrix);
  }
  debris.instanceMatrix.needsUpdate = true;
  group.add(signs, debris);
}

export class FallsRunVisual {
  public readonly group = new THREE.Group();
  private readonly animatedMaterials: THREE.ShaderMaterial[] = [];
  private readonly clock = new NeonGridVisualClock();
  private disposed = false;

  public constructor(track: NeonGrid, quality: GraphicsQuality) {
    this.group.name = 'falls-run-visual';
    this.group.userData.progressRange = [START, END];
    this.group.userData.quality = quality;
    this.group.add(nightSky());

    const roadGeometry = neonGridSurfaceSliceGeometry(track, START, END);
    const asphaltBase = new THREE.Mesh(
      roadGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x07121b,
        roughness: 0.38,
        metalness: 0.28,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    asphaltBase.name = 'falls-run-asphalt-base';
    asphaltBase.receiveShadow = true;
    this.group.add(asphaltBase);

    if (quality !== 'low') {
      const wetMaterial = wetAsphaltMaterial();
      this.animatedMaterials.push(wetMaterial);
      const wet = new THREE.Mesh(roadGeometry.clone(), wetMaterial);
      wet.name = 'falls-run-wet-asphalt';
      // Draw the transparent road-reflection pass before kart-mounted driver
      // sprites so the road cannot blend back over 2D avatar art.
      wet.renderOrder = -10;
      this.group.add(wet);
    }

    const wallCladding = new THREE.Mesh(
      fallsRunWallCladdingGeometry(track),
      new THREE.MeshStandardMaterial({
        color: 0x08131d,
        roughness: 0.48,
        metalness: 0.52,
        side: THREE.DoubleSide,
      }),
    );
    wallCladding.name = 'falls-run-wall-cladding';
    this.group.add(wallCladding);

    const edgeMaterial = new THREE.MeshBasicMaterial({ color: CYAN });
    const edges = new THREE.Mesh(fallsRunEdgeGeometry(track), edgeMaterial);
    edges.name = 'falls-run-luminous-edges';
    this.group.add(edges);

    const topRailGeometry = fallsRunEdgeGeometry(track);
    topRailGeometry.translate(0, 1.34, 0);
    const topRails = new THREE.Mesh(topRailGeometry, edgeMaterial);
    topRails.name = 'falls-run-luminous-top-rails';
    this.group.add(topRails);

    addStructure(this.group, track);
    addCity(this.group, track, quality);

    const waterfallMaterial = waterMaterial();
    this.animatedMaterials.push(waterfallMaterial);
    addWaterfallDistrict(this.group, track, quality, waterfallMaterial);
    addSignageAndDebris(this.group, track);
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
