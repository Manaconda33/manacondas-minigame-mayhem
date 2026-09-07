import * as THREE from 'three';

export interface SlickSurface {
  readonly point: THREE.Vector3;
  readonly normal: THREE.Vector3;
}

/** Sample existing road art once per placement, including the raised ramp/pads. */
export class SlickGroundSurface {
  private readonly meshes: THREE.Mesh[] = [];
  private readonly queryMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  private readonly ray = new THREE.Raycaster();

  public constructor(trackScene: THREE.Group) {
    const names = new Set([
      'track-ground',
      'track-shoulder',
      'track-road',
      'asphalt-racing-wear',
      'split-bend-dirt-line',
      'crest-ramp-deck',
    ]);
    trackScene.updateMatrixWorld(true);
    trackScene.traverse((object) => {
      if (
        object instanceof THREE.Mesh &&
        (names.has(object.name) || object.parent?.name.startsWith('boost-pad-'))
      ) {
        // Query both triangle sides without changing the rendered track materials.
        const source = object as THREE.Mesh;
        const query = new THREE.Mesh(source.geometry, this.queryMaterial);
        query.matrixWorld.copy(source.matrixWorld);
        query.matrixAutoUpdate = false;
        this.meshes.push(query);
      }
    });
  }

  public dispose(): void {
    this.meshes.length = 0;
    this.queryMaterial.dispose();
  }

  public at(position: THREE.Vector3): SlickSurface | null {
    this.ray.set(new THREE.Vector3(position.x, 20, position.z), new THREE.Vector3(0, -1, 0));
    const hit = this.ray.intersectObjects(this.meshes, false)[0];
    if (hit?.face == null) return null;
    const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if (normal.y < 0) normal.negate();
    return { point: hit.point, normal };
  }
}
