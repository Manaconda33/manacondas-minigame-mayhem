import * as THREE from 'three';
import type { NeonGrid } from '../../game/track/NeonGrid';
import type { EditorCatalogue } from './ComponentCatalogue';
import { type EditorDocument, requireValue } from './EditorDocument';
import { createEditedPaths, type EditorPaths } from './EditorRoad';
import { buildRoadBindings, roadDelta, projectVertices } from './RoadBindings';
import { validateMatrix } from './EditorCodec';
export class EditorProjection {
  private readonly bindings;
  private paths: EditorPaths;
  private readonly worlds = new Map<string, THREE.Matrix4>();
  private readonly generated = new Map<string, THREE.BufferGeometry>();
  private lastRoad = '';
  private detached = new Set<string>();
  private filter: (component: import('./ComponentCatalogue').SceneComponent) => boolean = () =>
    true;
  public setFilter(
    filter: (component: import('./ComponentCatalogue').SceneComponent) => boolean,
  ): void {
    this.filter = filter;
  }
  public constructor(
    private readonly catalogue: EditorCatalogue,
    private readonly track: NeonGrid,
  ) {
    this.bindings = buildRoadBindings(catalogue, track);
    this.paths = createEditedPaths(track, catalogue.baselineRoad);
    for (const [id, c] of catalogue.components) this.worlds.set(id, c.baselineWorld.clone());
  }
  public canDetach(id: string): boolean {
    const binding = this.bindings.get(id);
    return !!binding && !binding.vertices;
  }
  public matrixFor(id: string): THREE.Matrix4 {
    return requireValue(this.worlds.get(id)).clone();
  }
  public unprojectMatrix(id: string, world: THREE.Matrix4): THREE.Matrix4 {
    const binding = this.bindings.get(id);
    return binding && !binding.vertices && !this.detached.has(id) && !this.paths.unchanged
      ? roadDelta(binding, this.paths).invert().multiply(world)
      : world.clone();
  }
  public apply(document: EditorDocument) {
    for (const [id, override] of Object.entries(document.overrides))
      if (override.attachment?.mode === 'fixed' && this.bindings.get(id)?.vertices)
        throw new Error(
          'Cannot detach deformable road geometry; edit its control points or transform it while attached.',
        );
    const paths = createEditedPaths(this.track, document.road);
    for (const override of Object.values(document.overrides)) validateMatrix(override.matrix);
    const roadKey = JSON.stringify({
        road: document.road,
        attachments: Object.entries(document.overrides)
          .filter(([, o]) => o.attachment)
          .map(([id, o]) => [id, o.attachment]),
      }),
      changed = roadKey !== this.lastRoad;
    const nextGeometries = new Map<string, THREE.BufferGeometry>();
    try {
      if (changed && !paths.unchanged)
        for (const [id, binding] of this.bindings) {
          const c = requireValue(this.catalogue.components.get(id));
          if (binding.vertices)
            nextGeometries.set(id, projectVertices(c, binding, paths, this.track));
        }
    } catch (error) {
      for (const g of nextGeometries.values()) g.dispose();
      throw error;
    }
    const instances = new Set<THREE.InstancedMesh>();
    const derivedAttachmentChanges: string[] = [];
    this.detached = new Set(
      Object.entries(document.overrides)
        .filter(([, o]) => o.attachment?.mode === 'fixed')
        .map(([id]) => id),
    );
    for (const [id, c] of this.catalogue.components) {
      const override = document.overrides[id];
      c.visible = !override?.deleted && this.filter(c);
      const world = override
        ? new THREE.Matrix4().fromArray(override.matrix)
        : c.baselineWorld.clone();
      const binding = this.bindings.get(id);
      const attached = override?.attachment?.mode !== 'fixed';
      if (binding && attached && !paths.unchanged) {
        derivedAttachmentChanges.push(id);
        if (!binding.vertices) world.premultiply(roadDelta(binding, paths));
      }
      this.worlds.set(id, world.clone());
      const parent = c.object.parent?.matrixWorld ?? new THREE.Matrix4();
      const local = parent.clone().invert().multiply(world);
      if (c.instance !== null && c.object instanceof THREE.InstancedMesh) {
        const instanceMatrix = c.object.matrixWorld.clone().invert().multiply(world);
        c.object.setMatrixAt(
          c.instance,
          !c.visible ? new THREE.Matrix4().makeScale(0, 0, 0) : instanceMatrix,
        );
        c.object.instanceMatrix.needsUpdate = true;
        instances.add(c.object as THREE.InstancedMesh);
      } else {
        c.object.visible = c.visible;
        c.object.matrixAutoUpdate = false;
        c.object.matrix.copy(local);
        local.decompose(c.object.position, c.object.quaternion, c.object.scale);
        c.object.updateMatrixWorld(true);
        if (changed) {
          const old = this.generated.get(id);
          if (old) old.dispose();
          const next = attached ? nextGeometries.get(id) : undefined;
          if (!attached) nextGeometries.get(id)?.dispose();
          c.object.geometry = next ?? c.baselineGeometry;
          if (next) this.generated.set(id, next);
          else this.generated.delete(id);
        }
      }
    }
    for (const mesh of instances) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
    this.paths = paths;
    this.lastRoad = roadKey;
    return { paths, warnings: [...paths.warnings], derivedAttachmentChanges };
  }
  public describe(document: EditorDocument) {
    return {
      finalPaths: {
        main: Array.from({ length: 385 }, (_, i) => this.paths.main.getPointAt(i / 384).toArray()),
        shortcuts: Object.fromEntries(
          Object.entries(this.paths.shortcuts).map(([id, curve]) => [
            id,
            Array.from({ length: 65 }, (_, i) => curve.getPointAt(i / 64).toArray()),
          ]),
        ),
      },
      bindings: [...this.bindings].map(([id, b]) => ({
        id,
        path: b.path,
        progress: b.progress,
        sourceFrameInverse: b.inverseFrame.toArray(),
        matrix: this.matrixFor(id).toArray(),
        deleted: document.overrides[id]?.deleted ?? false,
      })),
      warnings: this.paths.warnings,
    };
  }
  public dispose(): void {
    for (const [id, g] of this.generated) {
      requireValue(this.catalogue.components.get(id)).object.geometry = requireValue(
        this.catalogue.components.get(id),
      ).baselineGeometry;
      g.dispose();
    }
    this.generated.clear();
  }
}
