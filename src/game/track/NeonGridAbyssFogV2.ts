import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';

const FOG_TARGETS = new Set([
  'skyline-deck-fascia',
  'skyline-city-towers',
  'skyline-city-roof-caps',
  'skyline-city-spires',
  'skyline-city-roof-accents',
  'skyline-city-corner-lights',
  'skyline-city-windows',
  'skyline-pylons',
  'skyline-cross-braces',
  'undercity-city-buildings',
  'undercity-wallside-sightline-screens',
  'undercity-industrial-architecture',
  'undercity-city-windows',
  'undercity-utility-clutter',
  'undercity-pipes',
  'undercity-work-lights',
  'falls-run-city-terraced-ground',
  'falls-run-deck-fascia',
  'falls-run-city-windows',
  'falls-run-city-roof-lights',
  'falls-run-pylons',
  'falls-run-cross-braces',
  'falls-run-extension-city-terraced-ground',
  'falls-run-extension-city-windows',
  'falls-run-extension-supported-pylons',
]);

const DEPTH_BANDS = {
  clearToMeters: 5,
  visibleByMeters: 15,
  strongByMeters: 28,
  denseByMeters: 44,
} as const;

export interface AbyssFogBuildingPlacement {
  readonly baseY: number;
  readonly height: number;
  readonly roadY: number;
  readonly roofAboveRoad: number;
}

/** Keep only a low roof fragment visible; the tower body descends into the fog. */
export function abyssFogBuildingPlacement(
  track: NeonGrid,
  position: THREE.Vector3,
  index: number,
  minimumHeight = 24,
  maximumHeight = 36,
  geometryTopScale = 1,
): AbyssFogBuildingPlacement {
  const roadY = track.projectMain(position).point.y;
  const height = minimumHeight + ((index * 7) % 7) / 6 * (maximumHeight - minimumHeight);
  const roofAboveRoad = -8 - ((index * 3) % 6) * 0.8;
  return {
    baseY: roadY + roofAboveRoad - height * geometryTopScale,
    height,
    roadY,
    roofAboveRoad,
  };
}

interface FogUniformState {
  readonly roadY: THREE.IUniform<number>;
  readonly color: THREE.IUniform<THREE.Color>;
  readonly worldCamera: THREE.Vector3;
  readonly routePoint: THREE.Vector3;
}

function sectorFogColor(objectName: string): THREE.Color {
  if (objectName.startsWith('undercity-')) return new THREE.Color(0x2a203d);
  if (objectName.startsWith('falls-run-')) return new THREE.Color(0x1c3a4e);
  return new THREE.Color(0x183c54);
}

function patchFogShader(material: THREE.Material, objectName: string, state: FogUniformState): void {
  const previousCompile = material.onBeforeCompile.bind(material);
  const previousProgramKey = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    previousCompile(shader, renderer);
    const worldPositionChunk = '#include <worldpos_vertex>';
    if (!shader.vertexShader.includes(worldPositionChunk)) {
      throw new Error(`${objectName} material does not expose world position for vertical fog`);
    }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
          varying float vAbyssFogWorldY;
          varying float vAbyssFogViewDistance;`,
      )
      .replace(
        worldPositionChunk,
        `${worldPositionChunk}
          vec4 abyssFogWorldPosition = vec4(transformed, 1.0);
          #ifdef USE_BATCHING
            abyssFogWorldPosition = batchingMatrix * abyssFogWorldPosition;
          #endif
          #ifdef USE_INSTANCING
            abyssFogWorldPosition = instanceMatrix * abyssFogWorldPosition;
          #endif
          abyssFogWorldPosition = modelMatrix * abyssFogWorldPosition;
          vAbyssFogWorldY = abyssFogWorldPosition.y;
          vAbyssFogViewDistance = length((viewMatrix * abyssFogWorldPosition).xyz);`,
      );

    const opaqueFragment = '#include <opaque_fragment>';
    if (!shader.fragmentShader.includes(opaqueFragment)) {
      throw new Error(`${objectName} material does not expose its opaque output for vertical fog`);
    }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
          uniform float uAbyssFogRoadY;
          uniform vec3 uAbyssFogColor;
          varying float vAbyssFogWorldY;
          varying float vAbyssFogViewDistance;`,
      )
      .replace(
        opaqueFragment,
        `${opaqueFragment}
          float abyssDepthBelowRoad = uAbyssFogRoadY - vAbyssFogWorldY;
          float abyssHeightFog =
            smoothstep(5.0, 10.0, abyssDepthBelowRoad) * 0.20 +
            smoothstep(10.0, 18.0, abyssDepthBelowRoad) * 0.36 +
            smoothstep(18.0, 28.0, abyssDepthBelowRoad) * 0.28 +
            smoothstep(28.0, 44.0, abyssDepthBelowRoad) * 0.16;
          float abyssDistanceFog = smoothstep(70.0, 260.0, vAbyssFogViewDistance) * 0.96;
          float abyssFog = 1.0 - (1.0 - clamp(abyssHeightFog, 0.0, 1.0)) *
            (1.0 - clamp(abyssDistanceFog, 0.0, 1.0));
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uAbyssFogColor, abyssFog);`,
      );
    shader.uniforms.uAbyssFogRoadY = state.roadY;
    shader.uniforms.uAbyssFogColor = state.color;
  };
  material.customProgramCacheKey = () => `${previousProgramKey()}|neon-grid-abyss-fog-v2:${objectName}`;
  material.userData.abyssVerticalFog = true;
  material.userData.abyssFogDepthBands = DEPTH_BANDS;
  material.userData.abyssFogTarget = objectName;
  material.needsUpdate = true;
}

function createBackdrop(state: FogUniformState, track: NeonGrid): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthTest: false,
    depthWrite: false,
    vertexShader: `varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        mat4 rotationOnlyView = mat4(mat3(viewMatrix));
        vec4 clip = projectionMatrix * rotationOnlyView * vec4(position, 1.0);
        gl_Position = clip.xyww;
      }`,
    fragmentShader: `varying vec3 vDirection;
      float abyssStarHash(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      void main() {
        vec3 direction = normalize(vDirection);
        float elevation = direction.y;
        float lowerHaze = 1.0 - smoothstep(-0.72, -0.08, elevation);
        float horizonGlow = exp(-abs(elevation + 0.025) * 7.0);
        float fogBank = exp(-pow((elevation + 0.18) / 0.30, 2.0));
        float belowHorizon = 1.0 - smoothstep(-0.30, 0.16, elevation);
        vec3 zenith = vec3(0.002, 0.006, 0.016);
        vec3 upper = vec3(0.004, 0.013, 0.032);
        vec3 horizon = vec3(0.016, 0.038, 0.067);
        vec3 lower = vec3(0.048, 0.105, 0.152);
        vec3 color = mix(lower, horizon, smoothstep(-0.70, -0.12, elevation));
        color = mix(color, upper, smoothstep(0.05, 0.40, elevation));
        color = mix(color, zenith, smoothstep(0.42, 0.88, elevation));
        float cyanAccent = horizonGlow * (0.42 + 0.58 * abs(direction.x));
        float magentaAccent = horizonGlow * (1.0 - abs(direction.x)) * 0.18;
        color += vec3(0.003, 0.030, 0.052) * cyanAccent;
        color += vec3(0.025, 0.004, 0.029) * magentaAccent;
        vec3 starCell = floor(direction * 520.0);
        float stars = step(0.9975, abyssStarHash(starCell)) * smoothstep(0.08, 0.42, elevation);
        color += vec3(stars * 0.55);
        vec3 mist = vec3(0.038, 0.078, 0.116);
        color = mix(color, lower, lowerHaze * 0.36);
        color = mix(color, mist, clamp(fogBank * 0.66 + belowHorizon * 0.38, 0.0, 0.92));
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  material.userData.bloomBlackAdapter = true;
  material.userData.abyssFogBackdrop = true;
  material.userData.abyssFogDepthBands = DEPTH_BANDS;
  material.userData.abyssFogPreservesNightSky = true;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), material);
  mesh.name = 'neon-grid-abyss-fog-v2-backdrop';
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  mesh.userData.presentationOnly = true;
  mesh.userData.abyssFogBackdrop = true;
  mesh.onBeforeRender = (_renderer, _scene, camera) => {
    camera.getWorldPosition(state.worldCamera);
    const tunnel = track.serviceTunnel.project(state.worldCamera);
    if (tunnel.lateralDistance <= track.serviceTunnel.roadHalfWidth + 8) {
      state.routePoint.copy(track.serviceTunnel.curve.getPointAt(tunnel.progress));
    } else {
      const main = track.projectMain(state.worldCamera);
      state.routePoint.copy(track.curve.getPointAt(main.progress));
    }
    state.roadY.value = state.routePoint.y;
  };
  return mesh;
}

function countMaterialReferences(
  root: THREE.Object3D,
): { total: Map<THREE.Material, number>; fogged: Map<THREE.Material, number> } {
  const references = new Map<THREE.Material, number>();
  const fogged = new Map<THREE.Material, number>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const mesh = object;
    const materialValue = mesh.material as THREE.Material | THREE.Material[];
    const materials: THREE.Material[] = Array.isArray(materialValue)
      ? materialValue
      : [materialValue];
    for (const material of materials) {
      references.set(material, (references.get(material) ?? 0) + 1);
      if (FOG_TARGETS.has(object.name)) fogged.set(material, (fogged.get(material) ?? 0) + 1);
    }
  });
  return { total: references, fogged };
}

/** Apply v2 atmospheric concealment only to the background city and supports. */
export function addNeonGridAbyssFogV2(scene: THREE.Group, track: NeonGrid): void {
  const state: FogUniformState = {
    roadY: { value: 0 },
    color: { value: new THREE.Color(0x0d1f38) },
    worldCamera: new THREE.Vector3(),
    routePoint: new THREE.Vector3(),
  };
  const fogGroup = new THREE.Group();
  fogGroup.name = 'neon-grid-abyss-fog-v2';
  fogGroup.userData.presentationOnly = true;
  fogGroup.userData.lowerWorldOnly = true;
  fogGroup.userData.depthBands = DEPTH_BANDS;
  fogGroup.userData.ruinedSilhouetteCount = 0;
  fogGroup.add(createBackdrop(state, track));

  const references = countMaterialReferences(scene);
  const foggedObjects: string[] = [];
  const unsupportedObjects: string[] = [];
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || !FOG_TARGETS.has(object.name)) return;
    const mesh = object;
    const materialValue = mesh.material as THREE.Material | THREE.Material[];
    const sourceMaterials: THREE.Material[] = Array.isArray(materialValue)
      ? materialValue
      : [materialValue];
    const nextMaterials: THREE.Material[] = sourceMaterials.map((source) => {
      if (!(source instanceof THREE.MeshBasicMaterial) && !(source instanceof THREE.MeshStandardMaterial)) {
        unsupportedObjects.push(`${object.name}:${source.type}`);
        return source;
      }
      const fogMaterial = source.clone();
      patchFogShader(fogMaterial, object.name, {
        ...state,
        color: { value: sectorFogColor(object.name) },
      });
      fogMaterial.userData.abyssFogColor = sectorFogColor(object.name).getHexString();
      return fogMaterial;
    });
    mesh.material = Array.isArray(materialValue)
      ? nextMaterials
      : nextMaterials[0] ?? sourceMaterials[0] ?? new THREE.MeshBasicMaterial();
    mesh.userData.abyssFogged = true;
    foggedObjects.push(object.name);
  });
  for (const [material, count] of references.fogged) {
    if (count === references.total.get(material)) material.dispose();
  }

  const foggedObjectNames = [...new Set(foggedObjects)].sort();
  const unsupportedObjectNames = [...new Set(unsupportedObjects)].sort();
  fogGroup.userData.foggedObjects = foggedObjectNames;
  fogGroup.userData.unsupportedObjects = unsupportedObjectNames;
  scene.userData.abyssFogV2 = {
    enabled: true,
    lowerWorldOnly: true,
    depthBands: DEPTH_BANDS,
    foggedObjects: foggedObjectNames,
    unsupportedObjects: unsupportedObjectNames,
  };
  scene.add(fogGroup);
}
