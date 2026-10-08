import * as THREE from 'three';
import type { ServiceTunnel } from './ServiceTunnel';

const SOURCE = 'assets/track/neon-grid/signage/service-tunnel-do-not-enter-v1.png';
const MAX_OPACITY = 0.63;
const FADE_START_METERS = 5;
const FADE_END_METERS = 16;

// Presentation only: a warning, not a collision blocker, shortcut gate or
// alternate road surface. The exact approved RGBA texture is shared by both
// legal Service Tunnel portals; the camera/player can pass through either.
export class ServiceTunnelWarningVisual {
  public readonly group = new THREE.Group();
  private readonly panels: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly portalCenters: THREE.Vector3[] = [];
  private readonly placeholder = new THREE.Texture();

  public constructor(tunnel: ServiceTunnel) {
    this.group.name = 'service-tunnel-warning-holograms';
    this.group.userData.presentationOnly = true;
    this.group.userData.approvedAsset = SOURCE;

    const plane = new THREE.PlaneGeometry(5.85, 2.925);
    for (const [name, fraction, normalDirection] of [
      ['service-tunnel-warning-entry', 0.015, -1],
      ['service-tunnel-warning-exit', 0.985, 1],
    ] as const) {
      const center = tunnel.curve.getPointAt(fraction);
      const normal = tunnel.curve.getTangentAt(fraction).setY(0).normalize()
        .multiplyScalar(normalDirection);
      const material = new THREE.MeshBasicMaterial({
        map: this.placeholder,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: MAX_OPACITY,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(plane, material);
      mesh.name = name;
      mesh.position.copy(center).add(new THREE.Vector3(0, 1.55, 0));
      mesh.lookAt(mesh.position.clone().add(normal));
      mesh.userData.presentationOnly = true;
      mesh.userData.nonColliding = true;
      mesh.userData.portalFraction = fraction;
      this.panels.push(mesh);
      this.portalCenters.push(center);
      this.group.add(mesh);
    }
  }

  public async load(): Promise<void> {
    const loaded = await new THREE.TextureLoader().loadAsync(import.meta.env.BASE_URL + SOURCE);
    loaded.colorSpace = THREE.SRGBColorSpace;
    for (const mesh of this.panels) {
      mesh.material.map = loaded;
      mesh.material.needsUpdate = true;
    }
    this.placeholder.dispose();
  }

  public update(kartPosition: THREE.Vector3): void {
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i];
      const center = this.portalCenters[i];
      if (!panel || !center) continue;
      // Planar distance avoids a jump in opacity on sloped entrance ramps.
      // At the portal the sign disappears so it cannot obscure the kart,
      // immediate roadway, or the legal entrance when crossing its plane.
      const distance = Math.hypot(kartPosition.x - center.x, kartPosition.z - center.z);
      const t = THREE.MathUtils.clamp(
        (distance - FADE_START_METERS) / (FADE_END_METERS - FADE_START_METERS), 0, 1,
      );
      panel.material.opacity = MAX_OPACITY * t * t * (3 - 2 * t);
      panel.visible = panel.material.opacity > 0.01;
    }
  }
}
