import { Vector2, type WebGLRenderer } from 'three';
import type { RendererCounterSnapshot } from './raceDiagnostics';

export function readRendererCounters(renderer: WebGLRenderer): RendererCounterSnapshot {
  const size = renderer.getDrawingBufferSize(new Vector2());
  return {
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
    width: size.x,
    height: size.y,
    pixelRatio: renderer.getPixelRatio(),
  };
}
