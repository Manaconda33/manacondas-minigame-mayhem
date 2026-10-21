import * as THREE from 'three';
import type { ServiceTunnel } from './ServiceTunnel';

export type ServiceTunnelMaterialVariant =
  'blockout' | 'concrete-wall-007-c1' | 'concrete-coverage-c2-001';

export const SERVICE_TUNNEL_CONCRETE_TILE_METERS = 2.2;
export const SERVICE_TUNNEL_CONCRETE_ASSET_REVISION = 'task-c1-concrete-wall-007-20261015-1';

const ASSET_ROOT = 'assets/track/materials/concrete-wall-007';
const C1_PENDING_MATERIAL_NAME = 'service-tunnel-concrete-wall-007-c1-pending';
const C2_WALL_PENDING_MATERIAL_NAME = 'service-tunnel-concrete-wall-007-c2-wall-pending';
const C2_ROOF_PENDING_MATERIAL_NAME = 'service-tunnel-concrete-wall-007-c2-roof-pending';

interface ServiceTunnelConcreteTextures {
  diffuse: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
}

const TEXTURE_FILES = [
  'concrete_wall_007_diff_1k.png',
  'concrete_wall_007_nor_gl_1k.png',
  'concrete_wall_007_rough_1k.png',
] as const;

function assetUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}${ASSET_ROOT}/${fileName}?v=${SERVICE_TUNNEL_CONCRETE_ASSET_REVISION}`;
}

function hasUvAttribute(geometry: unknown): boolean {
  return geometry instanceof THREE.BufferGeometry && geometry.hasAttribute('uv');
}

export function serviceTunnelMaterialVariantFromSearch(
  search: string,
): ServiceTunnelMaterialVariant {
  const selection = new URLSearchParams(search).get('neonGridMaterial');
  if (selection === 'service-tunnel-concrete-001') return 'concrete-wall-007-c1';
  if (selection === 'concrete-coverage-c2-001') return 'concrete-coverage-c2-001';
  return 'blockout';
}

export function addServiceTunnelWallUvs(
  geometry: THREE.BufferGeometry,
  tunnel: ServiceTunnel,
  side: -1 | 1,
): void {
  const [start, end] = tunnel.wallRange(side);
  const positions = geometry.getAttribute('position');
  if (positions.itemSize !== 3 || positions.count < 4 || positions.count % 2 !== 0) {
    throw new RangeError('Service Tunnel wall UV generation expects paired lower/upper vertices.');
  }

  const curveLength = tunnel.curve.getLength();
  const rows = positions.count / 2 - 1;
  const uvs: number[] = [];
  for (let row = 0; row <= rows; row++) {
    const fraction = THREE.MathUtils.lerp(start, end, row / rows);
    const u = ((fraction - start) * curveLength) / SERVICE_TUNNEL_CONCRETE_TILE_METERS;
    const lower = tunnel.wallElevationAt(fraction, side, false);
    const bottomY = positions.getY(row * 2);
    const topY = positions.getY(row * 2 + 1);
    uvs.push(
      u,
      (bottomY - lower) / SERVICE_TUNNEL_CONCRETE_TILE_METERS,
      u,
      (topY - lower) / SERVICE_TUNNEL_CONCRETE_TILE_METERS,
    );
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.userData.materialCoordinates = {
    mapping: 'service-tunnel-arc-length-and-wall-height',
    tileMeters: SERVICE_TUNNEL_CONCRETE_TILE_METERS,
    longitudinalMeters: (end - start) * curveLength,
  };
}

export function addServiceTunnelRoofUvs(
  geometry: THREE.BufferGeometry,
  tunnel: ServiceTunnel,
): void {
  const positions = geometry.getAttribute('position');
  if (positions.itemSize !== 3 || positions.count < 4 || positions.count % 2 !== 0) {
    throw new RangeError('Service Tunnel roof UV generation expects paired lateral vertices.');
  }

  const rows = positions.count / 2 - 1;
  const curveLength = tunnel.curve.getLength();
  const transverseMeters = tunnel.roadHalfWidth * 2;
  const leftEntrance = tunnel.wallRange(-1)[0];
  const rightEntrance = tunnel.wallRange(1)[0];
  const anchorFraction = (leftEntrance + rightEntrance) / 2;
  const uvs: number[] = [];
  for (let row = 0; row <= rows; row++) {
    const fraction = row / rows;
    const u = ((fraction - anchorFraction) * curveLength) / SERVICE_TUNNEL_CONCRETE_TILE_METERS;
    uvs.push(u, 0, u, transverseMeters / SERVICE_TUNNEL_CONCRETE_TILE_METERS);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.userData.materialCoordinates = {
    mapping: 'service-tunnel-arc-length-and-roof-width',
    tileMeters: SERVICE_TUNNEL_CONCRETE_TILE_METERS,
    longitudinalMeters: curveLength,
    transverseMeters,
    anchorFraction,
  };
}

function createPendingMaterial(name: string): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  material.name = name;
  return material;
}

export function createPendingServiceTunnelConcreteMaterial(): THREE.MeshStandardMaterial {
  return createPendingMaterial(C1_PENDING_MATERIAL_NAME);
}

export function createPendingServiceTunnelC2WallMaterial(): THREE.MeshStandardMaterial {
  return createPendingMaterial(C2_WALL_PENDING_MATERIAL_NAME);
}

export function createPendingServiceTunnelC2RoofMaterial(): THREE.MeshStandardMaterial {
  return createPendingMaterial(C2_ROOF_PENDING_MATERIAL_NAME);
}

async function loadTextures(loader: THREE.TextureLoader): Promise<ServiceTunnelConcreteTextures> {
  const results = await Promise.allSettled(
    TEXTURE_FILES.map((fileName) => loader.loadAsync(assetUrl(fileName))),
  );
  const failed = results.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected') {
    for (const result of results) {
      if (result.status === 'fulfilled') result.value.dispose();
    }
    throw new Error(
      `Unable to load the complete Concrete Wall 007 map set: ${String(failed.reason)}`,
    );
  }

  const loaded = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const diffuse = loaded[0];
  const normal = loaded[1];
  const roughness = loaded[2];
  if (diffuse === undefined || normal === undefined || roughness === undefined) {
    throw new Error('Concrete Wall 007 texture loading returned an incomplete map set.');
  }

  for (const [texture, name, colorSpace] of [
    [diffuse, 'service-tunnel-concrete-wall-007-diffuse-1k', THREE.SRGBColorSpace],
    [normal, 'service-tunnel-concrete-wall-007-normal-gl-1k', THREE.NoColorSpace],
    [roughness, 'service-tunnel-concrete-wall-007-roughness-1k', THREE.NoColorSpace],
  ] as const) {
    texture.name = name;
    texture.colorSpace = colorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
  }

  return { diffuse, normal, roughness };
}

export async function loadServiceTunnelConcreteWallMaterial(
  root: THREE.Object3D,
  loader: THREE.TextureLoader = new THREE.TextureLoader(),
): Promise<void> {
  const left = root.getObjectByName('service-tunnel-left-wall');
  const right = root.getObjectByName('service-tunnel-right-wall');
  if (!(left instanceof THREE.Mesh) || !(right instanceof THREE.Mesh)) {
    throw new Error(
      'The Service Tunnel sidewall meshes are unavailable for the C1 material prototype.',
    );
  }
  const variant = root.userData.serviceTunnelMaterialVariant as ServiceTunnelMaterialVariant;
  const courseWallNames = ['neon-grid-wall--1', 'neon-grid-wall-1'];
  const courseWallObjects = courseWallNames.map((name) => root.getObjectByName(name));
  const courseWalls = courseWallObjects.filter(
    (object): object is THREE.Mesh => object instanceof THREE.Mesh,
  );
  const expectedPendingWallName =
    variant === 'concrete-wall-007-c1'
      ? C1_PENDING_MATERIAL_NAME
      : variant === 'concrete-coverage-c2-001'
        ? C2_WALL_PENDING_MATERIAL_NAME
        : null;
  const roof = root.getObjectByName('service-tunnel-roof');
  const c2RoofMaterial: THREE.MeshStandardMaterial | null =
    variant === 'concrete-coverage-c2-001' &&
    roof instanceof THREE.Mesh &&
    roof.material instanceof THREE.MeshStandardMaterial
      ? roof.material
      : null;
  if (
    left.material !== right.material ||
    !(left.material instanceof THREE.MeshStandardMaterial) ||
    expectedPendingWallName === null ||
    left.material.name !== expectedPendingWallName ||
    !hasUvAttribute(left.geometry as unknown) ||
    !hasUvAttribute(right.geometry as unknown) ||
    (variant === 'concrete-coverage-c2-001' &&
      courseWallObjects.some((object) => object !== undefined) &&
      (courseWalls.length !== courseWallNames.length ||
        courseWalls.some(
          (wall) =>
            !(wall.material instanceof THREE.MeshStandardMaterial) ||
            wall.material.name !== C2_WALL_PENDING_MATERIAL_NAME ||
            !hasUvAttribute(wall.geometry),
        ))) ||
    (variant === 'concrete-coverage-c2-001' &&
      (!(roof instanceof THREE.Mesh) ||
        c2RoofMaterial?.name !== C2_ROOF_PENDING_MATERIAL_NAME ||
        !hasUvAttribute(roof.geometry)))
  ) {
    throw new Error(
      `The scene was not built with the selected concrete material variant: ${JSON.stringify({
        sharedMaterial: left.material === right.material,
        standardMaterial: left.material instanceof THREE.MeshStandardMaterial,
        materialTag: left.material instanceof THREE.Material ? left.material.type : null,
        materialName: left.material instanceof THREE.Material ? left.material.name : null,
        leftWallUvs: hasUvAttribute(left.geometry as unknown),
        rightWallUvs: hasUvAttribute(right.geometry as unknown),
        variant,
        roofUvs: roof instanceof THREE.Mesh ? hasUvAttribute(roof.geometry) : false,
        courseWallNames,
        courseWallUvs: courseWalls.map((wall) => hasUvAttribute(wall.geometry as unknown)),
      })}`,
    );
  }

  const textures = await loadTextures(loader);
  const wallMaterials = new Set<THREE.MeshStandardMaterial>([
    left.material,
    ...courseWalls.flatMap((wall) =>
      wall.material instanceof THREE.MeshStandardMaterial ? [wall.material] : [],
    ),
  ]);
  for (const material of wallMaterials) {
    material.name =
      variant === 'concrete-wall-007-c1'
        ? 'service-tunnel-concrete-wall-007-c1'
        : 'service-tunnel-concrete-wall-007-c2-wall';
    material.color.set(0xffffff);
    material.map = textures.diffuse;
    material.normalMap = textures.normal;
    material.normalScale.set(0.45, 0.45);
    material.roughness = 1;
    material.roughnessMap = textures.roughness;
    material.metalness = 0;
    material.side = THREE.DoubleSide;
    material.needsUpdate = true;
  }

  if (variant === 'concrete-coverage-c2-001') {
    if (c2RoofMaterial === null) {
      throw new Error('The C2 Service Tunnel roof material was unavailable after validation.');
    }
    const roofMaterial = c2RoofMaterial;
    roofMaterial.name = 'service-tunnel-concrete-wall-007-c2-roof';
    roofMaterial.color.set(0xffffff);
    roofMaterial.map = textures.diffuse;
    roofMaterial.normalMap = textures.normal;
    roofMaterial.normalScale.set(0.45, 0.45);
    roofMaterial.roughness = 1;
    roofMaterial.roughnessMap = textures.roughness;
    roofMaterial.metalness = 0;
    roofMaterial.side = THREE.DoubleSide;
    roofMaterial.needsUpdate = true;
  }
}
