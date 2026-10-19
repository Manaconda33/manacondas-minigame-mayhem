import * as THREE from 'three';
import type { NeonGrid } from '../../game/track/NeonGrid';
import { createEditorDocument, type Attachment } from './EditorDocument';
import { digestJson, type DocumentCatalogue, type ExportComponent } from './EditorCodec';
import { extractAuthoredRanges, sourceFamily, sourceGroup } from './SourceAdapters';
export interface SceneComponent {
  record: ExportComponent;
  object: THREE.Mesh;
  instance: number | null;
  baselineWorld: THREE.Matrix4;
  baselineGeometry: THREE.BufferGeometry;
  localBounds: THREE.Box3;
  visible: boolean;
}
export interface EditorCatalogue extends DocumentCatalogue {
  components: Map<string, SceneComponent>;
  groups: Record<string, string[]>;
  coverage: {
    registered: number;
    unregistered: string[];
    inspectOnly: string[];
    families: Record<string, number>;
  };
}
function scenePath(object: THREE.Object3D): string {
  const segments: string[] = [];
  for (let node: THREE.Object3D | null = object; node; node = node.parent) {
    const ordinal = node.parent
      ? node.parent.children.filter((o) => o.name === node.name).indexOf(node)
      : 0;
    segments.unshift(`${node.name || node.type}[${String(ordinal)}]`);
  }
  return segments.join('/');
}
function visible(object: THREE.Object3D): boolean {
  for (let n: THREE.Object3D | null = object; n; n = n.parent) if (!n.visible) return false;
  return true;
}
async function geometryHash(geometry: THREE.BufferGeometry): Promise<string> {
  const attributes: Record<
    string,
    {
      itemSize: number;
      values: number[];
    }
  > = {};
  for (const name of Object.keys(geometry.attributes).sort()) {
    const attr = geometry.getAttribute(name);
    const values: number[] = [];
    for (let i = 0; i < attr.count; i++)
      for (let c = 0; c < attr.itemSize; c++) values.push(attr.getComponent(i, c));
    attributes[name] = { itemSize: attr.itemSize, values };
  }
  return digestJson({
    attributes,
    index: geometry.index ? Array.from(geometry.index.array) : null,
  });
}
export async function buildCatalogue(
  root: THREE.Object3D,
  track: NeonGrid,
): Promise<EditorCatalogue> {
  extractAuthoredRanges(root);
  root.updateMatrixWorld(true);
  const entries: ExportComponent[] = [],
    components = new Map<string, SceneComponent>(),
    groups: Record<string, string[]> = {};
  const coverage: EditorCatalogue['coverage'] = {
    registered: 0,
    unregistered: [],
    inspectOnly: [],
    families: {},
  };
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && visible(o)) meshes.push(o as THREE.Mesh);
  });
  const hashes = new Map<THREE.BufferGeometry, string>();
  for (const mesh of meshes) {
    const family = sourceFamily(mesh);
    if (!family) {
      coverage.unregistered.push(mesh.name || scenePath(mesh));
      continue;
    }
    if (family.inspectOnly) {
      coverage.inspectOnly.push(mesh.name);
      continue;
    }
    mesh.geometry.computeBoundingBox();
    const bounds = mesh.geometry.boundingBox?.clone();
    if (!bounds || bounds.isEmpty()) continue;
    let hash = hashes.get(mesh.geometry);
    if (!hash) {
      hash = await geometryHash(mesh.geometry);
      hashes.set(mesh.geometry, hash);
    }
    const instanceCount = mesh instanceof THREE.InstancedMesh ? mesh.count : 1;
    for (let i = 0; i < instanceCount; i++) {
      const instance = mesh instanceof THREE.InstancedMesh ? i : null;
      const world = mesh.matrixWorld.clone();
      if (mesh instanceof THREE.InstancedMesh) {
        const m = new THREE.Matrix4();
        mesh.getMatrixAt(i, m);
        world.multiply(m);
      }
      const sourceOrdinal: unknown = mesh.userData.editorSourceOrdinal;
      const ordinal: number | null = typeof sourceOrdinal === 'number' ? sourceOrdinal : instance;
      const path = scenePath(mesh);
      const id = `${path}${instance === null ? '' : `/instance/${String(i)}`}`;
      const groupId = sourceGroup(root, mesh.name, ordinal ?? i);
      const center = bounds.getCenter(new THREE.Vector3()).applyMatrix4(world);
      const progress =
        family.path === 'main'
          ? track.projectMain(center).progress
          : family.path === 'service-tunnel'
            ? track.serviceTunnel.fraction(track.serviceTunnel.project(center))
            : family.path === 'billboard-gap'
              ? track.billboardGap.fraction(track.billboardGap.project(center))
              : 0.5;
      const attachment: Attachment =
        family.binding === 'fixed' || groupId
          ? { mode: 'fixed' }
          : { mode: 'road', path: family.path, progress };
      const record: ExportComponent = {
        id,
        label: `${mesh.name.replaceAll('-', ' ')}${mesh.userData.editorCombined || (instance === null && !mesh.userData.editorSourceRange) ? ' (combined component)' : ''}${instance === null ? '' : ` ${String(i + 1)}`}`,
        sourceFile: family.file,
        sourceSymbol: family.symbol,
        sector: family.sector,
        materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(
          (m: THREE.Material) => ({
            name: m.name,
            type: m.type,
          }),
        ),
        scenePath: path,
        sourceOrdinal: ordinal,
        geometryHash: hash,
        baselineMatrix: world.toArray(),
        dimensions: bounds.clone().applyMatrix4(world).getSize(new THREE.Vector3()).toArray(),
        groupId,
        attachment,
        ...(Array.isArray(mesh.userData.editorSourceRange)
          ? { indexRange: mesh.userData.editorSourceRange as [number, number] }
          : {}),
      };
      entries.push(record);
      components.set(id, {
        record,
        object: mesh,
        instance,
        baselineWorld: world,
        baselineGeometry: mesh.geometry as THREE.BufferGeometry,
        localBounds: bounds.clone(),
        visible: true,
      });
      if (groupId) (groups[groupId] ??= []).push(id);
      coverage.families[mesh.name] = (coverage.families[mesh.name] ?? 0) + 1;
    }
  }
  coverage.registered = entries.length;
  const baselineRoad = createEditorDocument({
    repository: '',
    runtimeSourceSha: '',
    editorBuildSha: '',
    selectors: { material: '', visual: '' },
    catalogueVersion: 1,
    catalogueHash: '',
  }).road;
  for (const shortcut of [track.serviceTunnel, track.billboardGap])
    baselineRoad.shortcutPaths[shortcut.id] = {
      entryProgress: shortcut.entry.progress[0],
      exitProgress: shortcut.exitProgress,
      points: Array.from({ length: 65 }, (_, i) => shortcut.curve.getPointAt(i / 64).toArray()),
    };
  const dive = track.waterfallDive;
  baselineRoad.shortcutPaths[dive.id] = {
    entryProgress: dive.entryProgress,
    exitProgress: dive.exitProgress,
    points: Array.from({ length: 65 }, (_, i) =>
      dive.pointAtDistance((dive.length * i) / 64).toArray(),
    ),
  };
  return {
    entries,
    components,
    groups,
    coverage,
    baselineRoad,
    hash: await digestJson({ entries, groups, baselineRoad }),
  };
}
