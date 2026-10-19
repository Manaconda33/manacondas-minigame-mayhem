import * as THREE from 'three';
import type { EditorCatalogue, SceneComponent } from './ComponentCatalogue';
import type { EditorProjection } from './EditorProjection';
export function textInputOwnsKeyboard(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    !!target.closest('input,textarea,select,[contenteditable="true"]')
  );
}
export class EditorSelection {
  private readonly selected = new Set<string>();
  private readonly raycaster = new THREE.Raycaster();
  public constructor(
    private readonly catalogue: EditorCatalogue,
    private readonly projection: EditorProjection,
  ) {}
  public get ids(): string[] {
    return [...this.selected];
  }
  public replace(ids: readonly string[]): void {
    this.selected.clear();
    for (const id of ids) if (this.catalogue.components.has(id)) this.selected.add(id);
  }
  public toggle(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else if (this.catalogue.components.has(id)) this.selected.add(id);
  }
  public clear(): void {
    this.selected.clear();
  }
  private visible(c: SceneComponent): boolean {
    if (!c.visible) return false;
    for (let n: THREE.Object3D | null = c.object; n; n = n.parent) if (!n.visible) return false;
    return true;
  }
  public pick(pointer: THREE.Vector2, camera: THREE.Camera): string | null {
    this.raycaster.setFromCamera(pointer, camera);
    const lookup = new Map<THREE.Object3D, Map<number | null, string>>();
    for (const [id, c] of this.catalogue.components) {
      if (!this.visible(c) || !camera.layers.test(c.object.layers)) continue;
      let instances = lookup.get(c.object);
      if (!instances) {
        instances = new Map();
        lookup.set(c.object, instances);
      }
      instances.set(c.instance, id);
    }
    const hits = this.raycaster.intersectObjects([...lookup.keys()], false);
    for (const hit of hits) {
      const id = lookup.get(hit.object)?.get(hit.instanceId ?? null);
      if (id) return id;
    }
    return null;
  }
  public bounds(ids: readonly string[] = this.ids): THREE.Box3 {
    const bounds = new THREE.Box3();
    for (const id of ids) {
      const c = this.catalogue.components.get(id);
      if (!c) continue;
      const local =
        c.instance === null ? (c.object.geometry.boundingBox ?? c.localBounds) : c.localBounds;
      bounds.union(local.clone().applyMatrix4(this.projection.matrixFor(id)));
    }
    return bounds;
  }
  public marquee(a: THREE.Vector2, b: THREE.Vector2, camera: THREE.Camera): string[] {
    const min = new THREE.Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y)),
      max = new THREE.Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
    const ids: string[] = [];
    for (const [id, c] of this.catalogue.components) {
      if (!this.visible(c) || !camera.layers.test(c.object.layers)) continue;
      const box = this.bounds([id]),
        center = box.getCenter(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse);
      if (center.z >= 0) continue;
      let left = Infinity,
        right = -Infinity,
        bottom = Infinity,
        top = -Infinity;
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z]) {
            const p = new THREE.Vector3(x, y, z).project(camera);
            left = Math.min(left, p.x);
            right = Math.max(right, p.x);
            bottom = Math.min(bottom, p.y);
            top = Math.max(top, p.y);
          }
      if (right >= min.x && left <= max.x && top >= min.y && bottom <= max.y) ids.push(id);
    }
    return ids;
  }
}
