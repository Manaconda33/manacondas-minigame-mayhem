import * as THREE from 'three';
export interface SourceFamily {
  file: string;
  symbol: string;
  sector: string;
  binding: 'fixed' | 'road';
  path: string;
  inspectOnly: boolean;
}
export function sourceFamily(object: THREE.Object3D): SourceFamily | null {
  let node: THREE.Object3D | null = object;
  while (node) {
    const name = node.name;
    let file = '',
      symbol = '',
      sector = 'Course',
      binding: 'fixed' | 'road' = 'road',
      path = 'main';
    if (name.startsWith('falls-run-extension')) {
      file = 'FallsRunExtensionVisual';
      symbol = 'FallsRunExtensionVisual';
      sector = 'Falls Run';
    } else if (name.startsWith('falls-run')) {
      file = 'FallsRunVisual';
      symbol = 'FallsRunVisual';
      sector = 'Falls Run';
    } else if (name.startsWith('skyline')) {
      file = 'SkylineVisual';
      symbol = 'SkylineVisual';
      sector = 'Skyline';
    } else if (name.startsWith('undercity')) {
      file = 'UndercityVisual';
      symbol = 'UndercityVisual';
      sector = 'Undercity';
    } else if (name.startsWith('service-tunnel-warning') || name.includes('do-not-enter')) {
      file = 'ServiceTunnelWarningVisual';
      symbol = 'ServiceTunnelWarningVisual';
      sector = 'Service Tunnel';
      path = 'service-tunnel';
    } else if (name.startsWith('service-tunnel')) {
      file = 'createNeonGridScene';
      symbol = 'createServiceTunnelMeshGroup → serviceTunnelGeometry';
      sector = 'Service Tunnel';
      path = 'service-tunnel';
    } else if (name.startsWith('dive-') || name === 'waterfall-dive') {
      file = 'NeonGridDiveVisual';
      symbol = 'NeonGridDiveVisual';
      sector = 'Waterfall Dive';
      path = 'waterfall-dive';
    } else if (name.startsWith('billboard-')) {
      file = 'NeonGridBillboardVisual';
      symbol = 'NeonGridBillboardVisual';
      sector = 'Billboard Gap';
      path = 'billboard-gap';
      if (
        name === 'billboard-plaza' ||
        name === 'billboard-plaza-inlay' ||
        name === 'billboard-boost-pad'
      ) {
        file = 'createNeonGridScene';
        symbol = 'createNeonGridScene';
      }
    } else if (
      name === 'track-road' ||
      /^(neon-grid-wall|boost-pad-|checkpoint-)/.test(name) ||
      name === 'neon-grid-blockout'
    ) {
      file = 'createNeonGridScene';
      symbol = 'createNeonGridScene';
    }
    if (file) {
      if (
        /-city-|industrial-architecture|facade-vent|service-bays|utility-clutter|procedural-signage|ambient-waterfall|waterfall-lips|cityGround|cityFoundations/.test(
          object.name,
        )
      )
        binding = 'fixed';
      return {
        file: `src/game/track/${file}.ts`,
        symbol,
        sector,
        binding,
        path,
        inspectOnly:
          /night-sky|abyss-fog|ambient-mist|plunge-spray|dive-mist|splashes|billboard-shards/.test(
            object.name,
          ),
      };
    }
    node = node.parent;
  }
  return null;
}
export function sourceGroup(root: THREE.Object3D, name: string, ordinal: number): string | null {
  const families = [
    ['skyline', 'skyline-city-towers'],
    ['undercity', 'undercity-city-buildings'],
    ['falls-run-extension', 'falls-run-extension-city-towers'],
    ['falls-run', 'falls-run-city-towers'],
  ] as const;
  for (const [sector, towerName] of families) {
    if (!name.startsWith(`${sector}-`)) continue;
    const towers = root.getObjectByName(towerName);
    if (!(towers instanceof THREE.InstancedMesh) || !towers.count) return null;
    let building: number | null = null;
    if (
      name === towerName ||
      /city-roof-caps|city-roof-accents|city-foundations|city-roof-lights/.test(name)
    )
      building = ordinal;
    else if (name.endsWith('city-windows')) building = (ordinal * 7) % towers.count;
    else if (name === 'skyline-city-corner-lights') building = Math.floor(ordinal / 2);
    else if (name === 'skyline-city-spires') building = ordinal * 2;
    else if (name === 'skyline-procedural-signage') building = (ordinal * 5 + 3) % towers.count;
    else if (name.startsWith('skyline-deck-fascia::cityFoundations')) building = ordinal;
    else if (name === 'undercity-industrial-architecture') {
      const n = towers.count;
      building =
        ordinal < n
          ? ordinal
          : ordinal < n * 3
            ? Math.floor((ordinal - n) / 2)
            : ordinal < n * 5
              ? Math.floor((ordinal - n * 3) / 2)
              : ordinal - n * 5;
    }
    if (building !== null && building >= 0 && building < towers.count)
      return `${sector}/building/${String(building)}`;
  }
  return null;
}
/** Split only authored index ranges in the editor-owned scene, preserving pixels/materials. */
export function extractAuthoredRanges(root: THREE.Object3D): void {
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if (
      o instanceof THREE.Mesh &&
      !(o instanceof THREE.InstancedMesh) &&
      o.visible &&
      o.userData.geometryRanges &&
      !o.userData.editorExtracted
    )
      meshes.push(o as THREE.Mesh);
  });
  for (const original of meshes) {
    const ranges = original.userData.geometryRanges as Record<
      string,
      {
        startTriangle: number;
        triangleCount: number;
      }
    >;
    const sourceIndex = original.geometry.getIndex();
    if (!sourceIndex || !original.parent) continue;
    let total = 0;
    const sorted = Object.entries(ranges).sort((a, b) => a[1].startTriangle - b[1].startTriangle);
    if (
      sorted.some(([, r]) => {
        const start = r.startTriangle * 3;
        const valid = start === total && r.triangleCount >= 0;
        total += r.triangleCount * 3;
        return !valid;
      }) ||
      total !== sourceIndex.count
    )
      continue;
    original.userData.editorExtracted = true;
    original.visible = false;
    for (const [name, range] of sorted) {
      const foundationCount =
        name === 'cityFoundations' ? Number(original.geometry.userData.includesCityFoundations) : 1;
      const count = Number.isInteger(foundationCount) && foundationCount > 0 ? foundationCount : 1;
      if ((range.triangleCount * 3) % count)
        throw new Error('Authored foundation index ranges are not separable.');
      for (let ordinal = 0; ordinal < count; ordinal++) {
        const start = range.startTriangle * 3 + ordinal * ((range.triangleCount * 3) / count);
        const length = (range.triangleCount * 3) / count;
        if (!length) continue;
        const map = new Map<number, number>();
        const indices: number[] = [];
        const values: Record<string, number[]> = {};
        for (const attr of Object.keys(original.geometry.attributes)) values[attr] = [];
        for (let i = start; i < start + length; i++) {
          const old = sourceIndex.getX(i);
          let next = map.get(old);
          if (next === undefined) {
            next = map.size;
            map.set(old, next);
            for (const [key, buffer] of Object.entries(values)) {
              const attr = original.geometry.getAttribute(key);
              for (let c = 0; c < attr.itemSize; c++) buffer.push(attr.getComponent(old, c));
            }
          }
          indices.push(next);
        }
        const geometry = new THREE.BufferGeometry().setIndex(indices);
        for (const [name, buffer] of Object.entries(values))
          geometry.setAttribute(
            name,
            new THREE.Float32BufferAttribute(buffer, original.geometry.getAttribute(name).itemSize),
          );
        const piece = new THREE.Mesh(geometry, original.material);
        piece.name = `${original.name}::${name}${count > 1 ? `/${String(ordinal)}` : ''}`;
        piece.position.copy(original.position);
        piece.quaternion.copy(original.quaternion);
        piece.scale.copy(original.scale);
        piece.onBeforeRender = original.onBeforeRender.bind(original);
        piece.onAfterRender = original.onAfterRender.bind(original);
        piece.userData.editorSourceRange = [start, length];
        piece.userData.editorSourceOrdinal = count > 1 ? ordinal : null;
        piece.userData.editorCombined = count === 1;
        piece.receiveShadow = original.receiveShadow;
        original.parent.add(piece);
      }
    }
  }
}
