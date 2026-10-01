import type { Material } from 'three';
export type BloomEmission = 'color' | 'emissive';
export function markBloomMaterial<T extends Material>(material: T, emission: BloomEmission): T {
  material.userData.bloomEmission = emission;
  return material;
}
export function bloomEmission(material: Material): BloomEmission | null {
  const value: unknown = material.userData.bloomEmission;
  return value === 'color' || value === 'emissive' ? value : null;
}

export function bloomDisabledFromSearch(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('testRacePerf') === '1' && params.get('testBloom') === 'off';
}
