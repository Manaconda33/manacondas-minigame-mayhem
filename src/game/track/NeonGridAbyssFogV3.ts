import * as THREE from 'three';
import type { NeonGrid } from './NeonGrid';

type FogDistrict = 'skyline' | 'undercity' | 'falls-run';

const DEPTH_PROFILE = {
  clearUntilMeters: 4,
  visibleByMeters: 12,
  strongByMeters: 24,
  denseByMeters: 40,
} as const;

const DISTRICT_FOG: Readonly<
  Record<
    FogDistrict,
    {
      readonly color: number;
      readonly clearStart: number;
      readonly visibleBy: number;
      readonly strongBy: number;
      readonly denseBy: number;
      readonly distanceStart: number;
      readonly distanceEnd: number;
      readonly distanceStrength: number;
    }
  >
> = {
  skyline: {
    color: 0x3e5266,
    clearStart: 4,
    visibleBy: 11,
    strongBy: 23,
    denseBy: 38,
    distanceStart: 62,
    distanceEnd: 210,
    distanceStrength: 0.4,
  },
  undercity: {
    color: 0x3e5266,
    clearStart: -2,
    visibleBy: 0,
    strongBy: 9,
    denseBy: 20,
    distanceStart: 28,
    distanceEnd: 145,
    distanceStrength: 0.54,
  },
  'falls-run': {
    color: 0x3e5266,
    clearStart: 4,
    visibleBy: 11,
    strongBy: 22,
    denseBy: 36,
    distanceStart: 68,
    distanceEnd: 235,
    distanceStrength: 0.38,
  },
};

// These are existing presentation meshes. Gameplay road, collision, tunnel,
// shortcut and approved signage meshes are intentionally excluded.
const FOG_TARGET_DISTRICT = new Map<string, FogDistrict>([
  ['skyline-deck-fascia', 'skyline'],
  ['skyline-city-towers', 'skyline'],
  ['skyline-city-roof-caps', 'skyline'],
  ['skyline-city-spires', 'skyline'],
  ['skyline-city-roof-accents', 'skyline'],
  ['skyline-city-corner-lights', 'skyline'],
  ['skyline-city-windows', 'skyline'],
  ['skyline-pylons', 'skyline'],
  ['skyline-cross-braces', 'skyline'],
  ['undercity-city-buildings', 'undercity'],
  ['undercity-city-windows', 'undercity'],
  ['undercity-wallside-sightline-screens', 'undercity'],
  ['undercity-industrial-architecture', 'undercity'],
  ['undercity-facade-vent-banks', 'undercity'],
  ['undercity-pipes', 'undercity'],
  ['undercity-utility-clutter', 'undercity'],
  ['undercity-work-lights', 'undercity'],
  ['undercity-service-bays', 'undercity'],
  ['undercity-ad-supports', 'undercity'],
  // V3 exposes these side surfaces at the open bridge. The tunnel floor and
  // roof stay outside the fog treatment to preserve the drivable aperture.
  ['service-tunnel-left-wall', 'undercity'],
  ['service-tunnel-right-wall', 'undercity'],
  ['falls-run-city-terraced-ground', 'falls-run'],
  ['falls-run-deck-fascia', 'falls-run'],
  ['falls-run-city-windows', 'falls-run'],
  ['falls-run-city-roof-lights', 'falls-run'],
  ['falls-run-pylons', 'falls-run'],
  ['falls-run-cross-braces', 'falls-run'],
  ['falls-run-extension-city-terraced-ground', 'falls-run'],
  ['falls-run-extension-city-windows', 'falls-run'],
  ['falls-run-extension-supported-pylons', 'falls-run'],
]);

export interface AbyssFogV3BuildingPlacement {
  readonly baseY: number;
  readonly height: number;
  readonly roadY: number;
  readonly roofAboveRoad: number;
}

/** Place existing building masses at the local district height, not one global offset. */
export function abyssFogV3BuildingPlacement(
  track: NeonGrid,
  position: THREE.Vector3,
  index: number,
  district: FogDistrict,
): AbyssFogV3BuildingPlacement {
  const skylineRoofOffsets = [
    18, -3, 26, 3, 14, -6, 22, 5, 11, -2, 28, -5, 8, 20, -3, 16, 0, 24, -6, 13, 6, 19,
  ];
  const roadY = track.projectMain(position).point.y;
  const height =
    district === 'undercity'
      ? 28 + (index % 5) * 2
      : district === 'skyline'
        ? Math.max(
            32,
            38 + (index % 3) * 4 + (skylineRoofOffsets[index % skylineRoofOffsets.length] ?? 0),
          )
        : 34 + (index % 6) * 2.4;
  const roofAboveRoad =
    district === 'undercity'
      ? 1.5 + (index % 5) * 0.65
      : district === 'skyline'
        ? (skylineRoofOffsets[index % skylineRoofOffsets.length] ?? 0)
        : -1.5 - (index % 5) * 0.7;
  return {
    baseY: roadY + roofAboveRoad - height,
    height,
    roadY,
    roofAboveRoad,
  };
}

interface FogUniformState {
  readonly roadY: THREE.IUniform<number>;
  readonly color: THREE.IUniform<THREE.Color>;
  readonly clearStart: THREE.IUniform<number>;
  readonly visibleBy: THREE.IUniform<number>;
  readonly strongBy: THREE.IUniform<number>;
  readonly denseBy: THREE.IUniform<number>;
  readonly distanceStart: THREE.IUniform<number>;
  readonly distanceEnd: THREE.IUniform<number>;
  readonly distanceStrength: THREE.IUniform<number>;
  readonly worldCamera: THREE.Vector3;
  readonly routePoint: THREE.Vector3;
}

function patchFogShader(
  material: THREE.Material,
  objectName: string,
  state: FogUniformState,
): void {
  const previousCompile = material.onBeforeCompile.bind(material);
  const previousProgramKey = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    previousCompile(shader, renderer);
    const worldPositionChunk = '#include <worldpos_vertex>';
    if (!shader.vertexShader.includes(worldPositionChunk)) {
      throw new Error(`${objectName} material cannot expose world position to Abyss Fog v3`);
    }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
          varying float vAbyssFogV3WorldY;
          varying float vAbyssFogV3ViewDepth;`,
      )
      .replace(
        worldPositionChunk,
        `${worldPositionChunk}
          vec4 abyssFogV3WorldPosition = vec4(transformed, 1.0);
          #ifdef USE_BATCHING
            abyssFogV3WorldPosition = batchingMatrix * abyssFogV3WorldPosition;
          #endif
          #ifdef USE_INSTANCING
            abyssFogV3WorldPosition = instanceMatrix * abyssFogV3WorldPosition;
          #endif
          abyssFogV3WorldPosition = modelMatrix * abyssFogV3WorldPosition;
          vAbyssFogV3WorldY = abyssFogV3WorldPosition.y;
          vAbyssFogV3ViewDepth = length((viewMatrix * abyssFogV3WorldPosition).xyz);`,
      );

    const opaqueFragment = '#include <opaque_fragment>';
    if (!shader.fragmentShader.includes(opaqueFragment)) {
      throw new Error(`${objectName} material cannot expose opaque color to Abyss Fog v3`);
    }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
          uniform float uAbyssFogV3RoadY;
          uniform vec3 uAbyssFogV3Color;
          uniform float uAbyssFogV3ClearStart;
          uniform float uAbyssFogV3VisibleBy;
          uniform float uAbyssFogV3StrongBy;
          uniform float uAbyssFogV3DenseBy;
          uniform float uAbyssFogV3DistanceStart;
          uniform float uAbyssFogV3DistanceEnd;
          uniform float uAbyssFogV3DistanceStrength;
          varying float vAbyssFogV3WorldY;
          varying float vAbyssFogV3ViewDepth;`,
      )
      .replace(
        opaqueFragment,
        `${opaqueFragment}
          float abyssFogV3DepthBelowRoad = uAbyssFogV3RoadY - vAbyssFogV3WorldY;
          float abyssFogV3Early = smoothstep(uAbyssFogV3ClearStart, uAbyssFogV3VisibleBy,
            abyssFogV3DepthBelowRoad) * 0.38;
          float abyssFogV3Middle = smoothstep(uAbyssFogV3VisibleBy,
            uAbyssFogV3StrongBy, abyssFogV3DepthBelowRoad) * 0.38;
          float abyssFogV3Deep = smoothstep(uAbyssFogV3StrongBy,
            uAbyssFogV3DenseBy, abyssFogV3DepthBelowRoad) * 0.24;
          float abyssFogV3Height = clamp(abyssFogV3Early + abyssFogV3Middle +
            abyssFogV3Deep, 0.0, 1.0);
          float abyssFogV3Distance = smoothstep(uAbyssFogV3DistanceStart,
            uAbyssFogV3DistanceEnd, vAbyssFogV3ViewDepth) *
            uAbyssFogV3DistanceStrength;
          float abyssFogV3Amount = 1.0 - (1.0 - abyssFogV3Height) *
            (1.0 - abyssFogV3Distance);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uAbyssFogV3Color,
            clamp(abyssFogV3Amount, 0.0, 0.97));`,
      );
    shader.uniforms.uAbyssFogV3RoadY = state.roadY;
    shader.uniforms.uAbyssFogV3Color = state.color;
    shader.uniforms.uAbyssFogV3ClearStart = state.clearStart;
    shader.uniforms.uAbyssFogV3VisibleBy = state.visibleBy;
    shader.uniforms.uAbyssFogV3StrongBy = state.strongBy;
    shader.uniforms.uAbyssFogV3DenseBy = state.denseBy;
    shader.uniforms.uAbyssFogV3DistanceStart = state.distanceStart;
    shader.uniforms.uAbyssFogV3DistanceEnd = state.distanceEnd;
    shader.uniforms.uAbyssFogV3DistanceStrength = state.distanceStrength;
  };
  material.customProgramCacheKey = () =>
    `${previousProgramKey()}|neon-grid-abyss-fog-v3:${objectName}`;
  material.userData.abyssVerticalFog = true;
  material.userData.abyssFogVersion = 3;
  material.userData.abyssFogTarget = objectName;
  material.userData.abyssFogDepthProfile = DEPTH_PROFILE;
  material.needsUpdate = true;
}

function fogDistrictForProgress(progress: number): FogDistrict {
  if (progress < 0.24654910452879084) return 'skyline';
  if (progress < 0.46154128347522666) return 'undercity';
  return 'falls-run';
}

interface FogRouteReference {
  readonly route: 'main-road' | 'service-tunnel';
  readonly district: FogDistrict;
  readonly roadY: number;
  readonly mainDistance: number;
  readonly tunnelDistance: number;
}

function updateFogRoute(
  track: NeonGrid,
  state: FogUniformState,
  camera: THREE.Camera,
): FogRouteReference {
  camera.getWorldPosition(state.worldCamera);
  const main = track.projectMain(state.worldCamera);
  const tunnel = track.serviceTunnel.project(state.worldCamera);
  const mainDistance = state.worldCamera.distanceTo(main.point);
  const tunnelDistance = state.worldCamera.distanceTo(tunnel.point);
  let district: FogDistrict;
  let route: FogRouteReference['route'];
  if (
    tunnel.lateralDistance <= track.serviceTunnel.roadHalfWidth + 8 &&
    tunnelDistance < mainDistance
  ) {
    state.routePoint.copy(tunnel.point);
    route = 'service-tunnel';
    district = 'undercity';
  } else {
    state.routePoint.copy(main.point);
    route = 'main-road';
    district = fogDistrictForProgress(main.progress);
  }
  state.roadY.value = state.routePoint.y;
  return { route, district, roadY: state.routePoint.y, mainDistance, tunnelDistance };
}

function createFogBank(state: FogUniformState, track: NeonGrid): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthTest: false,
    depthWrite: false,
    vertexShader: `varying vec3 vFogDirection;
      void main() {
        vFogDirection = normalize(position);
        mat4 rotationOnlyView = mat4(mat3(viewMatrix));
        vec4 clip = projectionMatrix * rotationOnlyView * vec4(position, 1.0);
        gl_Position = clip.xyww;
      }`,
    fragmentShader: `varying vec3 vFogDirection;
      float fogHash(vec2 point) {
        return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
      }
      float fogValueNoise(vec2 point) {
        vec2 cell = floor(point);
        vec2 blend = fract(point);
        blend = blend * blend * (3.0 - 2.0 * blend);
        float lower = mix(fogHash(cell), fogHash(cell + vec2(1.0, 0.0)), blend.x);
        float upper = mix(fogHash(cell + vec2(0.0, 1.0)),
          fogHash(cell + vec2(1.0, 1.0)), blend.x);
        return mix(lower, upper, blend.y);
      }
      void main() {
        vec3 direction = normalize(vFogDirection);
        float elevation = direction.y;
        float azimuth = atan(direction.x, direction.z);
        vec2 cloudField = vec2(azimuth * 5.5, elevation * 8.5);
        float broadClouds = fogValueNoise(cloudField);
        float fineClouds = fogValueNoise(cloudField * 2.1);
        float cloudNoise = broadClouds * 0.72 + fineClouds * 0.28;
        float cloudShape = smoothstep(0.32, 0.72, cloudNoise);
        float bankCenter = -0.18 + (cloudNoise - 0.5) * 0.12;
        float bank = exp(-pow((elevation - bankCenter) / 0.22, 2.0));
        float lowerVeil = 1.0 - smoothstep(-0.68, -0.16, elevation);
        vec3 zenith = vec3(0.002, 0.006, 0.016);
        vec3 upper = vec3(0.004, 0.012, 0.026);
        vec3 lowerSky = vec3(0.007, 0.019, 0.032);
        vec3 denseMist = vec3(0.050, 0.084, 0.130);
        vec3 color = mix(lowerSky, upper, smoothstep(-0.08, 0.50, elevation));
        color = mix(color, zenith, smoothstep(0.46, 0.88, elevation));
        float bankDensity = bank * mix(0.20, 0.82, cloudShape);
        float lowerDensity = lowerVeil * mix(0.08, 0.25, cloudShape);
        color = mix(color, denseMist, clamp(bankDensity + lowerDensity, 0.0, 0.86));
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  material.userData.bloomBlackAdapter = true;
  material.userData.abyssFogBackdrop = true;
  material.userData.abyssFogVersion = 3;
  material.userData.abyssFogDepthProfile = DEPTH_PROFILE;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), material);
  mesh.name = 'neon-grid-abyss-fog-v3-backdrop';
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  mesh.userData.presentationOnly = true;
  mesh.userData.abyssFogBackdrop = true;
  mesh.userData.abyssFogAtmosphere = 'soft-procedural-cloud-bank';
  mesh.onBeforeRender = (_renderer, _scene, camera) => {
    mesh.userData.abyssFogRouteReference = updateFogRoute(track, state, camera);
  };
  return mesh;
}

/** Apply the Stage 1 atmosphere to existing city and support materials only. */
export function addNeonGridAbyssFogV3(scene: THREE.Group, track: NeonGrid): void {
  const state: FogUniformState = {
    roadY: { value: 0 },
    color: { value: new THREE.Color(0x3e5266) },
    clearStart: { value: DISTRICT_FOG.skyline.clearStart },
    visibleBy: { value: DISTRICT_FOG.skyline.visibleBy },
    strongBy: { value: DISTRICT_FOG.skyline.strongBy },
    denseBy: { value: DISTRICT_FOG.skyline.denseBy },
    distanceStart: { value: DISTRICT_FOG.skyline.distanceStart },
    distanceEnd: { value: DISTRICT_FOG.skyline.distanceEnd },
    distanceStrength: { value: DISTRICT_FOG.skyline.distanceStrength },
    worldCamera: new THREE.Vector3(),
    routePoint: new THREE.Vector3(),
  };
  const fogGroup = new THREE.Group();
  fogGroup.name = 'neon-grid-abyss-fog-v3';
  fogGroup.userData.presentationOnly = true;
  fogGroup.userData.stage = 1;
  fogGroup.userData.depthProfile = DEPTH_PROFILE;
  fogGroup.userData.districts = {
    skyline: { treatment: 'open-bridge-fog', ...DISTRICT_FOG.skyline },
    undercity: { treatment: 'street-level-enclosure', ...DISTRICT_FOG.undercity },
    'falls-run': { treatment: 'vertical-drop-fog', ...DISTRICT_FOG['falls-run'] },
  };
  const districtReport = fogGroup.userData.districts as Record<string, unknown>;
  fogGroup.userData.transparentFogVolumeCount = 0;
  fogGroup.add(createFogBank(state, track));

  const foggedObjects: string[] = [];
  const unsupportedObjects: string[] = [];
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const district = FOG_TARGET_DISTRICT.get(object.name);
    if (!district) return;
    const districtFog = DISTRICT_FOG[district];
    const fog =
      object.name === 'undercity-wallside-sightline-screens'
        ? {
            ...districtFog,
            clearStart: -2,
            visibleBy: 2,
            strongBy: 7,
            denseBy: 16,
            distanceStart: 8,
            distanceEnd: 70,
            distanceStrength: 0.68,
          }
        : object.name === 'service-tunnel-left-wall' || object.name === 'service-tunnel-right-wall'
          ? {
              ...districtFog,
              clearStart: -2,
              visibleBy: 2,
              strongBy: 8,
              denseBy: 18,
              distanceStart: 0,
              distanceEnd: 40,
              distanceStrength: 0.72,
            }
          : districtFog;
    const materialValue = object.material as THREE.Material | THREE.Material[];
    const sourceMaterials: THREE.Material[] = Array.isArray(materialValue)
      ? materialValue
      : [materialValue];
    const nextMaterials = sourceMaterials.map((source) => {
      if (
        !(source instanceof THREE.MeshBasicMaterial) &&
        !(source instanceof THREE.MeshStandardMaterial)
      ) {
        unsupportedObjects.push(`${object.name}:${source.type}`);
        return source;
      }
      const material = source.clone();
      if (
        (object.name === 'service-tunnel-left-wall' ||
          object.name === 'service-tunnel-right-wall') &&
        material instanceof THREE.MeshStandardMaterial
      ) {
        material.color.set(0x353a4a);
      }
      patchFogShader(material, object.name, {
        ...state,
        color: { value: new THREE.Color(fog.color) },
        clearStart: { value: fog.clearStart },
        visibleBy: { value: fog.visibleBy },
        strongBy: { value: fog.strongBy },
        denseBy: { value: fog.denseBy },
        distanceStart: { value: fog.distanceStart },
        distanceEnd: { value: fog.distanceEnd },
        distanceStrength: { value: fog.distanceStrength },
      });
      material.userData.abyssFogColor = new THREE.Color(fog.color).getHexString();
      material.userData.abyssFogDistrict = district;
      return material;
    });
    object.material = Array.isArray(materialValue)
      ? nextMaterials
      : (nextMaterials[0] ?? sourceMaterials[0] ?? new THREE.MeshBasicMaterial());
    object.userData.abyssVerticalFog = true;
    object.userData.abyssFogDistrict = district;
    object.userData.abyssFogProfile = {
      clearStart: fog.clearStart,
      visibleBy: fog.visibleBy,
      strongBy: fog.strongBy,
      denseBy: fog.denseBy,
      distanceStart: fog.distanceStart,
      distanceEnd: fog.distanceEnd,
      distanceStrength: fog.distanceStrength,
    };
    foggedObjects.push(object.name);
  });

  const tunnelFloorObject = scene.getObjectByName('service-tunnel-floor');
  const tunnelFloor = tunnelFloorObject instanceof THREE.Mesh ? tunnelFloorObject : undefined;
  const tunnelFloorMaterials = tunnelFloor?.material as
    THREE.Material | THREE.Material[] | undefined;
  const sourceFloorMaterials = Array.isArray(tunnelFloorMaterials)
    ? tunnelFloorMaterials
    : tunnelFloorMaterials
      ? [tunnelFloorMaterials]
      : [];
  if (tunnelFloor && sourceFloorMaterials.length > 0) {
    const tintedFloorMaterials = sourceFloorMaterials.map((source) => {
      if (!(source instanceof THREE.MeshStandardMaterial)) return source;
      const material = source.clone();
      material.color.set(0x27384b);
      return material;
    });
    tunnelFloor.material = Array.isArray(tunnelFloorMaterials)
      ? tintedFloorMaterials
      : (tintedFloorMaterials[0] ?? tunnelFloorMaterials);
    tunnelFloor.userData.abyssTunnelSurfaceTint = '27384b';
  }

  const names = [...new Set(foggedObjects)].sort();
  const unsupported = [...new Set(unsupportedObjects)].sort();
  fogGroup.userData.foggedObjects = names;
  fogGroup.userData.unsupportedObjects = unsupported;
  scene.userData.abyssFogV3 = {
    enabled: true,
    stage: 1,
    addedDecorativeStructures: 0,
    transparentFogVolumeCount: 0,
    atmosphere:
      'cloud-shaped backdrop with district-local world-height fog on existing city structures',
    palette: { fogColor: '3e5266', backdropMistLinear: [0.05, 0.084, 0.13] },
    distanceBlendStrength: Object.fromEntries(
      Object.entries(DISTRICT_FOG).map(([district, fog]) => [district, fog.distanceStrength]),
    ),
    presentationTintedObjects: [
      'service-tunnel-left-wall',
      'service-tunnel-right-wall',
      'service-tunnel-floor',
    ],
    depthProfile: DEPTH_PROFILE,
    districts: districtReport,
    foggedObjects: names,
    unsupportedObjects: unsupported,
  };
  scene.add(fogGroup);
}
