import { expect, it } from 'vitest';
import * as THREE from 'three';
import { RenderPassInstrumentation } from '../src/game/diagnostics/RenderPassInstrumentation';

function fixture() {
  let target: THREE.WebGLRenderTarget | null = null;
  const drawingBuffer = new THREE.Vector2(320, 240);
  const state = {
    info: {
      autoReset: true,
      render: { calls: 4, triangles: 80 },
      resetCount: 0,
      reset() {
        this.resetCount++;
        this.render.calls = this.render.triangles = 0;
      },
    },
    autoClear: true,
    getRenderTarget: () => target,
    getDrawingBufferSize: (size: THREE.Vector2) => size.copy(drawingBuffer),
    setRenderTarget: (next: THREE.WebGLRenderTarget | null) => {
      target = next;
    },
  };
  return { renderer: state as unknown as THREE.WebGLRenderer, state };
}

it('measures pass deltas and target pixels without changing renderer state or resetting counters', () => {
  const f = fixture();
  const target = new THREE.WebGLRenderTarget(128, 72);
  const instrumentation = new RenderPassInstrumentation(true);
  instrumentation.beginFrame();
  instrumentation.measure('mainScene', f.renderer, null, 'includedWhenUpdated', () => {
    f.state.info.render.calls += 3;
    f.state.info.render.triangles += 36;
  });
  f.state.setRenderTarget(target);
  instrumentation.measure('bloomMask', f.renderer, target, 'disabled', () => {
    f.state.info.render.calls += 2;
    f.state.info.render.triangles += 24;
  });

  const frame = instrumentation.finishFrame({ drawCalls: 9, triangles: 140 });
  expect(frame.stages.mainScene).toMatchObject({
    status: 'measured',
    drawCalls: 3,
    triangles: 36,
    target: { width: 320, height: 240, pixels: 76800 },
    shadowWork: 'includedWhenUpdated',
  });
  expect(frame.stages.bloomMask).toMatchObject({
    status: 'measured',
    drawCalls: 2,
    triangles: 24,
    target: { width: 128, height: 72, pixels: 9216 },
    shadowWork: 'disabled',
  });
  expect(frame.reconciliation).toMatchObject({
    status: 'partial',
    attributedDrawCalls: 5,
    unattributedDrawCalls: 4,
    attributedTriangles: 60,
    unattributedTriangles: 80,
  });
  expect(f.state.info.resetCount).toBe(0);
  expect(f.state.info.autoReset).toBe(true);
  expect(f.state.autoClear).toBe(true);
  target.dispose();
});

it('reports renderer counter resets as unavailable deltas rather than negative work', () => {
  const f = fixture();
  const instrumentation = new RenderPassInstrumentation(true);
  instrumentation.beginFrame();
  instrumentation.measure('mainScene', f.renderer, null, 'includedWhenUpdated', () => {
    f.state.info.render.calls = 1;
    f.state.info.render.triangles = 5;
  });
  const frame = instrumentation.finishFrame({ drawCalls: 1, triangles: 5 });
  expect(frame.stages.mainScene).toMatchObject({
    status: 'unavailable',
    drawCalls: null,
    triangles: null,
    reason: 'counterResetOrInvalidDelta',
  });
  expect(frame.reconciliation.status).toBe('partial');
  expect(frame.reconciliation.unattributedDrawCalls).toBeNull();
});

it('does no counter or target reads when disabled', () => {
  const f = fixture();
  const instrumentation = new RenderPassInstrumentation(false);
  f.state.getDrawingBufferSize = () => {
    throw new Error('should not inspect target size');
  };
  let rendered = false;
  instrumentation.beginFrame();
  instrumentation.measure('mainScene', f.renderer, null, 'includedWhenUpdated', () => {
    rendered = true;
  });
  expect(rendered).toBe(true);
  expect(instrumentation.finishFrame({ drawCalls: 4, triangles: 80 }).stages.mainScene.status).toBe(
    'notRun',
  );
});

it('marks unsupported renderer counters unavailable without suppressing the original render', () => {
  const renderer = {
    getRenderTarget: () => null,
    getDrawingBufferSize: (size: THREE.Vector2) => size.set(64, 64),
  } as unknown as THREE.WebGLRenderer;
  const instrumentation = new RenderPassInstrumentation(true);
  instrumentation.beginFrame();
  let rendered = false;
  instrumentation.measure('mainScene', renderer, null, 'includedWhenUpdated', () => {
    rendered = true;
  });
  const frame = instrumentation.finishFrame({ drawCalls: null, triangles: null });
  expect(rendered).toBe(true);
  expect(frame.stages.mainScene).toMatchObject({
    status: 'unavailable',
    reason: 'rendererCountersUnavailable',
  });
  expect(frame.reconciliation.status).toBe('unavailable');
});

it('clears the current frame on disposal and leaves later render calls observationally unrecorded', () => {
  const f = fixture();
  const instrumentation = new RenderPassInstrumentation(true);
  instrumentation.beginFrame();
  instrumentation.measure('mainScene', f.renderer, null, 'includedWhenUpdated', () => {
    f.state.info.render.calls++;
  });
  instrumentation.dispose();
  let rendered = false;
  instrumentation.beginFrame();
  instrumentation.measure('mainScene', f.renderer, null, 'includedWhenUpdated', () => {
    rendered = true;
  });
  const frame = instrumentation.finishFrame({ drawCalls: 5, triangles: 80 });
  expect(rendered).toBe(true);
  expect(frame.stages.mainScene.status).toBe('notRun');
});
