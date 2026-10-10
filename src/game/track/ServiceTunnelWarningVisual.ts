import * as THREE from 'three';
import type { ServiceTunnel } from './ServiceTunnel';

const SOURCE = 'assets/track/neon-grid/signage/service-tunnel-do-not-enter-v1.png';
const MAX_OPACITY = 0.63;
const FADE_START_METERS = 5;
const FADE_END_METERS = 16;

/** Only presentation: neither the face nor its two structural wall mounts
 * participates in collision or in shortcut/lap/direction authority. */
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
    // Each portal is defined by the separately measured left/right wall ends.
    // A fixed interior spline fraction is NOT the real angled wall opening.
    for (const [name, exit, normalDirection] of [
      ['service-tunnel-warning-entry', false, -1],
      ['service-tunnel-warning-exit', true, 1],
    ] as const) {
      const leftFraction = tunnel.wallRange(-1)[exit ? 1 : 0];
      const rightFraction = tunnel.wallRange(1)[exit ? 1 : 0];
      const fraction = (leftFraction + rightFraction) * 0.5;
      const edgeAt = (side: -1 | 1, at: number): THREE.Vector3 => {
        const point = tunnel.curve.getPointAt(at);
        const tangent = tunnel.curve.getTangentAt(at).setY(0).normalize();
        return point.addScaledVector(
          new THREE.Vector3(tangent.z, 0, -tangent.x), side * tunnel.roadHalfWidth,
        );
      };
      const leftEdge = edgeAt(-1, leftFraction);
      const rightEdge = edgeAt(1, rightFraction);
      const crossing = leftEdge.clone().add(rightEdge).multiplyScalar(0.5);
      // The real mouth is oblique to the tunnel spline. Make the sign face
      // perpendicular to the line joining the two physical wall ends, not
      // to an average spline tangent that leaves a skewed detached gantry.
      const portalAcross = rightEdge.clone().sub(leftEdge).setY(0);
      const portalRight = portalAcross.clone().normalize();
      const normal = portalRight.clone().cross(new THREE.Vector3(0, 1, 0))
        .multiplyScalar(normalDirection);
      const material = new THREE.MeshBasicMaterial({
        map: this.placeholder,
        // FrontSide prevents mirrored text from the back. Each of the two
        // independently oriented portals is readable from its legal approach.
        side: THREE.FrontSide,
        transparent: true,
        opacity: MAX_OPACITY,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(plane, material);
      mesh.name = name;
      // Place the lower edge above the accepted 3 m clear roof envelope.
      mesh.position.copy(crossing).setY(Math.max(leftEdge.y, rightEdge.y) + 4.6);
      mesh.lookAt(mesh.position.clone().add(normal));
      mesh.updateMatrixWorld(true);
      mesh.userData.presentationOnly = true;
      mesh.userData.nonColliding = true;
      mesh.userData.portalFraction = fraction;
      mesh.userData.portalWallFractions = [leftFraction, rightFraction];
      mesh.userData.portalEdges = [leftEdge.toArray(), rightEdge.toArray()];
      mesh.userData.readableNormal = normal.toArray();
      mesh.userData.portalSpanMeters = portalAcross.length();
      mesh.userData.portalHeaderY = mesh.position.y + plane.parameters.height * 0.5 + 0.08;

      // One integrated 3-piece portal frame: two truly vertical wall-end
      // uprights plus a rigid, continuous overhead header joining them.
      // Image sits directly beneath the header, never on inward-leaning
      // freestanding posts displaced toward the camera.
      const mounts = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.26, 1, 0.34),
        new THREE.MeshStandardMaterial({ color: 0x437088, roughness: 0.44, metalness: 0.52 }),
        3,
      );
      mounts.name = name + '-wall-mounts';
      mounts.userData.presentationOnly = true;
      mounts.userData.nonColliding = true;
      mounts.userData.portalFrame = true;
      const headerY = mesh.userData.portalHeaderY as number;
      const dummy = new THREE.Object3D();
      for (const [index, side, at, wallEdge] of [
        [0, -1, leftFraction, leftEdge],
        [1, 1, rightFraction, rightEdge],
      ] as const) {
        const footY = tunnel.wallElevationAt(at, side, true) - 0.12;
        const postMid = wallEdge.clone().setY((footY + headerY) / 2);
        dummy.position.copy(mesh.worldToLocal(postMid));
        dummy.quaternion.identity();
        dummy.scale.set(1, headerY - footY, 1);
        dummy.updateMatrix();
        mounts.setMatrixAt(index, dummy.matrix);
      }
      const beamStart = leftEdge.clone().setY(headerY);
      const beamEnd = rightEdge.clone().setY(headerY);
      const first = mesh.worldToLocal(beamStart);
      const last = mesh.worldToLocal(beamEnd);
      const beam = last.clone().sub(first);
      dummy.position.copy(first).add(last).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), beam.clone().normalize());
      dummy.scale.set(1, beam.length(), 1);
      dummy.updateMatrix();
      mounts.setMatrixAt(2, dummy.matrix);
      mounts.instanceMatrix.needsUpdate = true;
      mesh.add(mounts);
      this.panels.push(mesh);
      this.portalCenters.push(crossing);
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
      // The fully clear zone follows the TRUE wall cross-section, not a
      // decorative spline sample; backwards and forwards traversal both fade.
      const distance = Math.hypot(kartPosition.x - center.x, kartPosition.z - center.z);
      const t = THREE.MathUtils.clamp(
        (distance - FADE_START_METERS) / (FADE_END_METERS - FADE_START_METERS), 0, 1,
      );
      panel.material.opacity = MAX_OPACITY * t * t * (3 - 2 * t);
      panel.visible = panel.material.opacity > 0.01;
    }
  }
}
