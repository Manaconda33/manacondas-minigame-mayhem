import * as THREE from 'three';
import type { TrackDefinition } from '../track/TrackDefinition';
import { ItemBoxLifecycle, type ItemBoxPresentation } from './ItemBoxLifecycle';
import { ITEM_BOX_LAYOUT } from './itemDefinitions';

export interface ItemBoxPlacement {
  index: number;
  row: number;
  column: number;
  progress: number;
  lateralOffset: number;
  position: THREE.Vector3;
}

export interface ItemBoxRacerState {
  id: string;
  position: THREE.Vector3;
  finished: boolean;
  canCollect: boolean;
}

export interface ItemBoxCollection {
  boxIndex: number;
  row: number;
  column: number;
  racerId: string;
}

interface RuntimeItemBox {
  placement: ItemBoxPlacement;
  lifecycle: ItemBoxLifecycle;
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
  materials: THREE.MeshStandardMaterial[];
}

interface ItemBoxCandidate {
  box: RuntimeItemBox;
  racer: ItemBoxRacerState;
  distanceSq: number;
}

const ITEM_BOX_TRIGGER_RADIUS = 1.65;
const ITEM_BOX_BASE_Y = 1.55;
const ITEM_BOX_LATERAL_HALF_SPAN = 4.4;

export function createItemBoxPlacements(track: TrackDefinition): ItemBoxPlacement[] {
  const placements: ItemBoxPlacement[] = [];

  for (let row = 0; row < ITEM_BOX_LAYOUT.rowProgress.length; row += 1) {
    const progress = ITEM_BOX_LAYOUT.rowProgress[row];
    if (progress === undefined) continue;
    const center = track.curve.getPointAt(progress);
    const tangent = track.curve.getTangentAt(progress).normalize();
    const right = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();

    const halfSpan =
      track.id === 'circuit-alpha'
        ? ITEM_BOX_LATERAL_HALF_SPAN
        : Math.min(ITEM_BOX_LATERAL_HALF_SPAN, track.halfWidthAt(progress) - 0.5);
    const columnStep = (halfSpan * 2) / (ITEM_BOX_LAYOUT.boxesPerRow - 1);
    for (let column = 0; column < ITEM_BOX_LAYOUT.boxesPerRow; column += 1) {
      const lateralOffset = -halfSpan + column * columnStep;
      const position = center
        .clone()
        .addScaledVector(right, lateralOffset)
        .setY((track.id === 'neon-grid' ? center.y : 0) + ITEM_BOX_BASE_Y);
      placements.push({
        index: placements.length,
        row,
        column,
        progress,
        lateralOffset,
        position,
      });
    }
  }

  return placements;
}

function createPickupVisual(): {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
  materials: THREE.MeshStandardMaterial[];
} {
  const group = new THREE.Group();

  const shellMaterial = new THREE.MeshStandardMaterial({
    color: 0xb894e8,
    emissive: 0x3c1d62,
    emissiveIntensity: 1.15,
    roughness: 0.26,
    metalness: 0.42,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
    wireframe: true,
  });
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x52ddff,
    emissive: 0x126a87,
    emissiveIntensity: 1.55,
    roughness: 0.22,
    metalness: 0.28,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2cc6b,
    emissive: 0x6f4b13,
    emissiveIntensity: 0.9,
    roughness: 0.34,
    metalness: 0.58,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  const shellGeometry = new THREE.OctahedronGeometry(1.08, 0);
  const coreGeometry = new THREE.IcosahedronGeometry(0.42, 0);
  const ringGeometry = new THREE.TorusGeometry(0.74, 0.08, 8, 20);

  const shell = new THREE.Mesh(shellGeometry, shellMaterial);
  shell.rotation.set(Math.PI * 0.25, 0, Math.PI * 0.25);
  shell.castShadow = true;

  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.castShadow = true;

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI * 0.5;

  group.add(shell, core, ring);
  return {
    group,
    geometries: [shellGeometry, coreGeometry, ringGeometry],
    materials: [shellMaterial, coreMaterial, ringMaterial],
  };
}

export class ItemBoxSystem {
  public readonly group = new THREE.Group();
  public readonly placements: readonly ItemBoxPlacement[];
  private readonly boxes: RuntimeItemBox[];
  private elapsed = 0;

  public constructor(track: TrackDefinition) {
    this.group.name = 'slice-5-item-boxes';
    this.placements = createItemBoxPlacements(track);
    this.boxes = this.placements.map((placement) => {
      const visual = createPickupVisual();
      visual.group.name = `item-box-${String(placement.index)}`;
      visual.group.position.copy(placement.position);
      this.group.add(visual.group);
      return {
        placement,
        lifecycle: new ItemBoxLifecycle(),
        group: visual.group,
        geometries: visual.geometries,
        materials: visual.materials,
      };
    });
  }

  public update(
    dt: number,
    racers: readonly ItemBoxRacerState[],
    onCollectionRequest: (collection: ItemBoxCollection) => boolean,
  ): void {
    if (dt <= 0) return;
    this.elapsed += dt;

    for (const box of this.boxes) box.lifecycle.advance(dt);

    const candidates = this.collectionCandidates(racers);
    const assignedRacers = new Set<string>();
    const assignedBoxes = new Set<number>();

    for (const candidate of candidates) {
      const boxIndex = candidate.box.placement.index;
      if (assignedRacers.has(candidate.racer.id) || assignedBoxes.has(boxIndex)) continue;

      assignedRacers.add(candidate.racer.id);
      assignedBoxes.add(boxIndex);
      if (
        onCollectionRequest({
          boxIndex,
          row: candidate.box.placement.row,
          column: candidate.box.placement.column,
          racerId: candidate.racer.id,
        })
      ) {
        candidate.box.lifecycle.collect();
      }
    }

    for (const box of this.boxes) this.applyPresentation(box);
  }

  public presentation(index: number): ItemBoxPresentation | null {
    return this.boxes[index]?.lifecycle.presentation() ?? null;
  }

  public dispose(): void {
    for (const box of this.boxes) {
      for (const geometry of box.geometries) geometry.dispose();
      for (const material of box.materials) material.dispose();
    }
    this.group.clear();
  }

  private collectionCandidates(racers: readonly ItemBoxRacerState[]): ItemBoxCandidate[] {
    const triggerDistanceSq = ITEM_BOX_TRIGGER_RADIUS * ITEM_BOX_TRIGGER_RADIUS;
    const candidates: ItemBoxCandidate[] = [];

    for (const racer of racers) {
      if (racer.finished || !racer.canCollect) continue;
      for (const box of this.boxes) {
        if (!box.lifecycle.isCollectible()) continue;
        const dx = racer.position.x - box.placement.position.x;
        const dz = racer.position.z - box.placement.position.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq <= triggerDistanceSq) candidates.push({ box, racer, distanceSq });
      }
    }

    candidates.sort((first, second) => {
      const distanceDifference = first.distanceSq - second.distanceSq;
      if (Math.abs(distanceDifference) > 0.000001) return distanceDifference;
      const boxDifference = first.box.placement.index - second.box.placement.index;
      if (boxDifference !== 0) return boxDifference;
      return first.racer.id.localeCompare(second.racer.id);
    });
    return candidates;
  }

  private applyPresentation(box: RuntimeItemBox): void {
    const presentation = box.lifecycle.presentation();
    box.group.visible = presentation.visible;
    box.group.scale.setScalar(presentation.scale);
    box.group.position.y =
      box.placement.position.y + Math.sin(this.elapsed * 2.8 + box.placement.index * 0.47) * 0.12;
    box.group.rotation.y = this.elapsed * 1.45 + box.placement.index * 0.31;
    box.group.rotation.z = Math.sin(this.elapsed * 1.1 + box.placement.row) * 0.08;
    for (const material of box.materials) {
      material.opacity = presentation.opacity;
    }
  }
}
