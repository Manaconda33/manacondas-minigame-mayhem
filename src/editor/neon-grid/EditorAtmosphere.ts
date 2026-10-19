import * as THREE from 'three';

/** A world-anchored atmosphere layer. Geometry edits never move its source anchors. */
export function createAtmosphereLayer(scene: THREE.Scene, root: THREE.Object3D) {
  const fog = scene.fog;
  const group = root.getObjectByName('neon-grid-abyss-fog-v3');
  const backdrop = group ?? root.getObjectByName('neon-grid-abyss-fog-v3-backdrop');
  const uniforms = new Map<THREE.IUniform<number>, number>();
  const callbacks = new Map<THREE.Material, THREE.Material['onBeforeCompile']>();
  let visible = true;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = (
      Array.isArray(object.material) ? object.material : [object.material]
    ) as THREE.Material[];
    for (const material of materials) {
      if (callbacks.has(material) || !material.userData.abyssVerticalFog) continue;
      const original = material.onBeforeCompile.bind(material);
      callbacks.set(material, original);
      material.onBeforeCompile = function (shader, renderer) {
        original.call(this, shader, renderer);
        const uniform = shader.uniforms.uAbyssFogV3MaximumBlend as
          THREE.IUniform<number> | undefined;
        if (uniform) {
          if (!uniforms.has(uniform)) uniforms.set(uniform, uniform.value);
          uniform.value = visible ? (uniforms.get(uniform) ?? uniform.value) : 0;
        }
      };
    }
  });
  return {
    setVisible(value: boolean) {
      visible = value;
      scene.fog = visible ? fog : null;
      if (backdrop) backdrop.visible = visible;
      for (const [uniform, maximum] of uniforms) uniform.value = visible ? maximum : 0;
    },
    dispose() {
      for (const [material, original] of callbacks) material.onBeforeCompile = original;
      callbacks.clear();
      uniforms.clear();
    },
  };
}
