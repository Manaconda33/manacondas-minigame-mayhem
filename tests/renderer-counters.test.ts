import { describe, expect, it, vi } from 'vitest';
import type { WebGLRenderer, Vector2 } from 'three';
import { readRendererCounters } from '../src/game/diagnostics/RendererCounters';

describe('renderer counter adapter', () => {
  it('reads frame totals and actual drawing buffer without additive memory or renderer mutation', () => {
    const reset = vi.fn();
    const render = vi.fn();
    const renderer = {
      info: {
        render: { calls: 23, triangles: 700 },
        memory: { geometries: 11, textures: 8 },
        reset,
      },
      getDrawingBufferSize: (target: Vector2) => target.set(1920, 1080),
      getPixelRatio: () => 1.5,
      render,
      shadowMap: { enabled: true },
    } as unknown as WebGLRenderer;
    const first = readRendererCounters(renderer);
    expect(first).toEqual({
      drawCalls: 23,
      triangles: 700,
      geometries: 11,
      textures: 8,
      width: 1920,
      height: 1080,
      pixelRatio: 1.5,
    });
    expect(readRendererCounters(renderer)).toEqual(first);
    renderer.info.render.calls = 3;
    expect(readRendererCounters(renderer).drawCalls).toBe(3);
    expect(first.drawCalls).toBe(23);
    expect(reset).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    expect(renderer.shadowMap.enabled).toBe(true);
  });
});
