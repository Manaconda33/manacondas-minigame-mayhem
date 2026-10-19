import * as THREE from 'three';
import type { EditorCatalogue } from './ComponentCatalogue';
import type { EditorHistory } from './EditorHistory';
import type { EditorProjection } from './EditorProjection';
import { validateMatrix } from './EditorCodec';
export class EditorTransforms {
  private initial = new Map<string, THREE.Matrix4>();
  public constructor(
    private readonly catalogue: EditorCatalogue,
    private readonly history: EditorHistory,
    private readonly projection: EditorProjection,
  ) {}
  public begin(ids: readonly string[], label: string): void {
    this.initial.clear();
    const selected = new Set(ids);
    // A selected mesh's independently catalogued children inherit the delta exactly once.
    for (const [id, c] of this.catalogue.components)
      for (const parentId of ids) {
        const p = this.catalogue.components.get(parentId);
        if (p?.instance !== null) continue;
        for (let n: THREE.Object3D | null = c.object.parent; n; n = n.parent)
          if (n === p.object) selected.add(id);
      }
    for (const id of selected)
      if (this.catalogue.components.has(id)) this.initial.set(id, this.projection.matrixFor(id));
    if (!this.initial.size) throw new Error('Select at least one component.');
    this.history.begin(label);
  }
  public preview(delta: THREE.Matrix4): void {
    validateMatrix(delta.toArray());
    this.history.preview((state) => {
      for (const [id, original] of this.initial) {
        const matrix = this.projection
          .unprojectMatrix(id, delta.clone().multiply(original))
          .toArray();
        state.overrides[id] = {
          ...state.overrides[id],
          matrix,
          deleted: state.overrides[id]?.deleted ?? false,
        };
      }
    });
    this.projection.apply(this.history.snapshot());
  }
  public commit(): void {
    this.history.commit();
    this.initial.clear();
  }
  public cancel(): void {
    this.history.cancel();
    this.initial.clear();
    this.projection.apply(this.history.snapshot());
  }
  public setDimensions(ids: readonly string[], size: THREE.Vector3): void {
    if (size.toArray().some((v) => !Number.isFinite(v) || v <= 0.001))
      throw new Error('Dimensions must be finite and positive.');
    const bounds = new THREE.Box3();
    for (const id of new Set(ids)) {
      const c = this.catalogue.components.get(id);
      if (c)
        bounds.union(
          (c.instance === null ? (c.object.geometry.boundingBox ?? c.localBounds) : c.localBounds)
            .clone()
            .applyMatrix4(this.projection.matrixFor(id)),
        );
    }
    const current = bounds.getSize(new THREE.Vector3()),
      pivot = bounds.getCenter(new THREE.Vector3());
    if (current.toArray().some((v) => v < 1e-6))
      throw new Error(
        'This planar component has no editable volume in that dimension; use scale instead.',
      );
    const scale = size.clone().divide(current);
    const delta = new THREE.Matrix4()
      .makeTranslation(...pivot.toArray())
      .multiply(new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z))
      .multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
    this.begin(ids, 'Change dimensions');
    try {
      this.preview(delta);
      this.commit();
    } catch (error) {
      this.cancel();
      throw error;
    }
  }
}
