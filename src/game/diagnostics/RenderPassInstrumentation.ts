import { Vector2, type WebGLRenderer, type WebGLRenderTarget } from 'three';

export const RENDER_PASS_NAMES = [
  'mainScene',
  'bloomMask',
  'bloomHorizontal',
  'bloomVertical',
  'bloomComposite',
  'bloomFallbackScene',
  'motionBlurComposite',
] as const;

export type RenderPassName = (typeof RENDER_PASS_NAMES)[number];
export type RenderPassShadowWork = 'includedWhenUpdated' | 'disabled' | 'notApplicable';

export interface RenderPassTargetSize {
  width: number;
  height: number;
  pixels: number;
}

export interface RenderPassStageSample {
  status: 'measured' | 'notRun' | 'unavailable';
  drawCalls: number | null;
  triangles: number | null;
  target: RenderPassTargetSize | null;
  shadowWork: RenderPassShadowWork;
  framebufferCopies: number;
  copiedPixels: number;
  reason: string | null;
}

export interface RenderPassReconciliation {
  status: 'complete' | 'partial' | 'mismatch' | 'unavailable';
  wholeFrameDrawCalls: number | null;
  wholeFrameTriangles: number | null;
  attributedDrawCalls: number | null;
  attributedTriangles: number | null;
  unattributedDrawCalls: number | null;
  unattributedTriangles: number | null;
  unavailableStages: RenderPassName[];
}

export interface RenderPassFrameContext {
  cameraFixture: 'chase' | 'rearView';
  cameraPosition: readonly [number, number, number];
  cameraQuaternion: readonly [number, number, number, number];
  sectorProgress: {
    lap: number;
    trackProgress: number;
    sectorIndex: number | null;
    sectorName: string | null;
  };
  itemEffectState: {
    activeProjectiles: number;
    activeHazards: number;
    playerHeldItem: { itemId: string; remainingCharges: number } | null;
    playerFrostStacks: number;
    playerSpinoutId: string | null;
    activeBoostLabel: string | null;
    nitroOverdriveActive: boolean;
    hyperDriveRocketActive: boolean;
  };
}

export interface RenderPassFrameSample {
  stages: Record<RenderPassName, RenderPassStageSample>;
  reconciliation: RenderPassReconciliation;
  context: RenderPassFrameContext | null;
}

interface RenderPassMeasureOptions {
  framebufferCopies?: number;
  copiedPixels?: number;
}

const STAGE_SHADOW_WORK: Record<RenderPassName, RenderPassShadowWork> = {
  mainScene: 'includedWhenUpdated',
  bloomMask: 'disabled',
  bloomHorizontal: 'notApplicable',
  bloomVertical: 'notApplicable',
  bloomComposite: 'notApplicable',
  bloomFallbackScene: 'includedWhenUpdated',
  motionBlurComposite: 'notApplicable',
};

function emptyStage(name: RenderPassName): RenderPassStageSample {
  return {
    status: 'notRun',
    drawCalls: null,
    triangles: null,
    target: null,
    shadowWork: STAGE_SHADOW_WORK[name],
    framebufferCopies: 0,
    copiedPixels: 0,
    reason: null,
  };
}

function targetSize(
  renderer: WebGLRenderer,
  target: WebGLRenderTarget | null | undefined,
): RenderPassTargetSize | null {
  try {
    let width: number, height: number;
    if (target !== undefined) {
      if (target === null) {
        const size = renderer.getDrawingBufferSize(new Vector2());
        width = size.x;
        height = size.y;
      } else {
        width = target.width;
        height = target.height;
      }
    } else {
      const active = renderer.getRenderTarget();
      if (active === null) {
        const size = renderer.getDrawingBufferSize(new Vector2());
        width = size.x;
        height = size.y;
      } else {
        width = active.width;
        height = active.height;
      }
    }
    if (
      !Number.isSafeInteger(width) ||
      !Number.isSafeInteger(height) ||
      width < 1 ||
      height < 1 ||
      !Number.isSafeInteger(width * height)
    )
      return null;
    return { width, height, pixels: width * height };
  } catch {
    return null;
  }
}

/** Read-only deltas around existing renderer.render boundaries; never resets renderer.info. */
export class RenderPassInstrumentation {
  private current: Partial<Record<RenderPassName, RenderPassStageSample>> = {};
  private disposed = false;

  public constructor(private readonly enabled: boolean) {}

  public beginFrame(): void {
    if (this.enabled && !this.disposed) this.current = {};
  }

  public measure(
    name: RenderPassName,
    renderer: WebGLRenderer,
    target: WebGLRenderTarget | null | undefined,
    shadowWork: RenderPassShadowWork,
    render: () => void,
    options: RenderPassMeasureOptions = {},
  ): void {
    if (!this.enabled || this.disposed) {
      render();
      return;
    }

    const info = (
      renderer as unknown as {
        info?: { render?: WebGLRenderer['info']['render'] };
      }
    ).info;
    const size = targetSize(renderer, target);
    if (info?.render === undefined) {
      try {
        render();
      } finally {
        this.current[name] = {
          ...emptyStage(name),
          status: 'unavailable',
          target: size,
          shadowWork,
          framebufferCopies: options.framebufferCopies ?? 0,
          copiedPixels: options.copiedPixels ?? 0,
          reason: 'rendererCountersUnavailable',
        };
      }
      return;
    }
    const beforeCalls = info.render.calls;
    const beforeTriangles = info.render.triangles;
    try {
      render();
    } finally {
      const calls = info.render.calls - beforeCalls;
      const triangles = info.render.triangles - beforeTriangles;
      const valid =
        Number.isSafeInteger(calls) &&
        calls >= 0 &&
        Number.isSafeInteger(triangles) &&
        triangles >= 0;
      this.current[name] = {
        status: valid ? 'measured' : 'unavailable',
        drawCalls: valid ? calls : null,
        triangles: valid ? triangles : null,
        target: size,
        shadowWork,
        framebufferCopies: options.framebufferCopies ?? 0,
        copiedPixels: options.copiedPixels ?? 0,
        reason: valid
          ? size === null
            ? 'targetDimensionsUnavailable'
            : null
          : 'counterResetOrInvalidDelta',
      };
    }
  }

  public markUnavailable(
    name: RenderPassName,
    renderer: WebGLRenderer,
    target: WebGLRenderTarget | null | undefined,
    shadowWork: RenderPassShadowWork,
    reason: string,
    options: RenderPassMeasureOptions = {},
  ): void {
    if (!this.enabled || this.disposed || this.current[name] !== undefined) return;
    this.current[name] = {
      ...emptyStage(name),
      status: 'unavailable',
      target: targetSize(renderer, target),
      shadowWork,
      framebufferCopies: options.framebufferCopies ?? 0,
      copiedPixels: options.copiedPixels ?? 0,
      reason,
    };
  }

  public finishFrame(
    wholeFrame: {
      drawCalls: number | null;
      triangles: number | null;
    },
    context: RenderPassFrameContext | null = null,
  ): RenderPassFrameSample {
    const stages = Object.fromEntries(
      RENDER_PASS_NAMES.map((name) => [name, this.current[name] ?? emptyStage(name)]),
    ) as Record<RenderPassName, RenderPassStageSample>;
    const unavailableStages = RENDER_PASS_NAMES.filter(
      (name) => stages[name].status === 'unavailable',
    );
    const measured = RENDER_PASS_NAMES.map((name) => stages[name]).filter(
      (stage) => stage.status === 'measured',
    );
    const attributedDrawCalls = measured.every((stage) => stage.drawCalls !== null)
      ? measured.reduce((sum, stage) => sum + (stage.drawCalls ?? 0), 0)
      : null;
    const attributedTriangles = measured.every((stage) => stage.triangles !== null)
      ? measured.reduce((sum, stage) => sum + (stage.triangles ?? 0), 0)
      : null;
    const unattributedDrawCalls =
      unavailableStages.length > 0 ||
      wholeFrame.drawCalls === null ||
      attributedDrawCalls === null ||
      wholeFrame.drawCalls < attributedDrawCalls
        ? null
        : wholeFrame.drawCalls - attributedDrawCalls;
    const unattributedTriangles =
      unavailableStages.length > 0 ||
      wholeFrame.triangles === null ||
      attributedTriangles === null ||
      wholeFrame.triangles < attributedTriangles
        ? null
        : wholeFrame.triangles - attributedTriangles;
    const mismatch =
      (wholeFrame.drawCalls !== null &&
        attributedDrawCalls !== null &&
        wholeFrame.drawCalls < attributedDrawCalls) ||
      (wholeFrame.triangles !== null &&
        attributedTriangles !== null &&
        wholeFrame.triangles < attributedTriangles);
    let status: RenderPassReconciliation['status'];
    if (wholeFrame.drawCalls === null || wholeFrame.triangles === null) status = 'unavailable';
    else if (mismatch) status = 'mismatch';
    else if (
      unavailableStages.length > 0 ||
      unattributedDrawCalls !== 0 ||
      unattributedTriangles !== 0
    )
      status = 'partial';
    else status = 'complete';

    const frame = {
      stages,
      context,
      reconciliation: {
        status,
        wholeFrameDrawCalls: wholeFrame.drawCalls,
        wholeFrameTriangles: wholeFrame.triangles,
        attributedDrawCalls,
        attributedTriangles,
        unattributedDrawCalls,
        unattributedTriangles,
        unavailableStages,
      },
    } satisfies RenderPassFrameSample;
    this.current = {};
    return frame;
  }

  public dispose(): void {
    this.disposed = true;
    this.current = {};
  }
}
