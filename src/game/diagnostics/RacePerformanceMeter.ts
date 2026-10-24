import type {
  RaceCaptureMetadata,
  RaceFrameObservation,
  RacePerformanceCapture,
  RacePerformanceSnapshot,
  RaceRenderingMetadata,
  InitializationSceneSnapshot,
  ItemVfxCapture,
} from './raceDiagnostics';
import type { RenderPassFrameSample } from './RenderPassInstrumentation';

const RENDER_PASS_SAMPLE_INTERVAL = 10;

function cloneRenderPassFrame(frame: RenderPassFrameSample): RenderPassFrameSample {
  return {
    stages: Object.fromEntries(
      Object.entries(frame.stages).map(([name, stage]) => [
        name,
        { ...stage, target: stage.target === null ? null : { ...stage.target } },
      ]),
    ) as RenderPassFrameSample['stages'],
    reconciliation: {
      ...frame.reconciliation,
      unavailableStages: [...frame.reconciliation.unavailableStages],
    },
    context:
      frame.context === null
        ? null
        : {
            ...frame.context,
            cameraPosition: [...frame.context.cameraPosition],
            cameraQuaternion: [...frame.context.cameraQuaternion],
            sectorProgress: { ...frame.context.sectorProgress },
            itemEffectState: {
              ...frame.context.itemEffectState,
              playerHeldItem:
                frame.context.itemEffectState.playerHeldItem === null
                  ? null
                  : { ...frame.context.itemEffectState.playerHeldItem },
            },
          },
  };
}

function cloneRenderingMetadata(metadata: RaceRenderingMetadata): RaceRenderingMetadata {
  return {
    ...metadata,
    actualDrawingBuffer:
      metadata.actualDrawingBuffer === null ? null : { ...metadata.actualDrawingBuffer },
    deviceEnvironment: { ...metadata.deviceEnvironment },
    camera:
      metadata.camera === null
        ? null
        : {
            ...metadata.camera,
            position: [...metadata.camera.position],
            quaternion: [...metadata.camera.quaternion],
          },
    sectorProgress: { ...metadata.sectorProgress },
    racerRoster: metadata.racerRoster.map((racer) => ({ ...racer })),
    itemEffectState: {
      ...metadata.itemEffectState,
      racers: metadata.itemEffectState.racers.map((racer) => ({
        ...racer,
        heldItem: racer.heldItem === null ? null : { ...racer.heldItem },
      })),
    },
    configuration: {
      ...metadata.configuration,
      shadows: { ...metadata.configuration.shadows },
      bloom: metadata.configuration.bloom === null ? null : { ...metadata.configuration.bloom },
      motionBlur:
        metadata.configuration.motionBlur === null
          ? null
          : { ...metadata.configuration.motionBlur },
    },
    unavailableMetrics: [...metadata.unavailableMetrics],
  };
}

function unavailableRenderingMetadata(metadata: RaceCaptureMetadata): RaceRenderingMetadata {
  return {
    schemaVersion: 1,
    trackId: null,
    visualVariant: null,
    materialVariant: null,
    actualDrawingBuffer: null,
    devicePixelRatio: null,
    rendererPixelRatio: null,
    deviceEnvironment: {
      classification: 'unknown',
      explanation: 'Renderer-specific capture metadata was not supplied by the runtime.',
    },
    camera: null,
    sectorProgress: { lap: null, trackProgress: null, sectorIndex: null, sectorName: null },
    racerRoster: [],
    itemEffectState: { activeProjectiles: null, activeHazards: null, racers: [] },
    configuration: {
      shadows: { enabled: null, mapType: null, dynamicCasterCount: null },
      bloom: metadata.bloom ?? null,
      motionBlur: metadata.motionBlur ?? null,
    },
    unavailableMetrics: [
      'trackId',
      'visualVariant',
      'actualDrawingBuffer',
      'devicePixelRatio',
      'cameraFixtureAndTransform',
      'sectorProgress',
      'racerRoster',
      'itemAndEffectState',
      'shadowConfiguration',
      'physicalDeviceIdentity',
    ],
  };
}

function median(sorted: readonly number[]): number | null {
  if (sorted.length === 0) return null;
  const center = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[center] ?? null)
    : ((sorted[center - 1] ?? 0) + (sorted[center] ?? 0)) / 2;
}

/** Race-owned, bounded original window. Never drives simulation or race authority. */
export class RacePerformanceMeter {
  private readonly samples: { rawFrameMs: number; counters: RaceFrameObservation['counters'] }[] =
    [];
  private readonly renderPassSamples: {
    scoredFrameIndex: number;
    frame: RenderPassFrameSample;
  }[] = [];
  private eligibleFrames = 0;
  private skippedFrames = 0;
  private durationMs = 0;
  private over50msFrames = 0;
  private currentOver50msRun = 0;
  private longestOver50msRun = 0;
  private truncated = false;
  private raceCompleted = false;
  private disposed = false;
  private maxDrawCalls: number | null = null;
  private maxTriangles: number | null = null;
  private initializationScene: InitializationSceneSnapshot | null = null;

  public constructor(
    private readonly enabled: boolean,
    private readonly warmupFrames = 120,
    private readonly maxSamples = 36000,
  ) {
    if (
      !Number.isInteger(warmupFrames) ||
      warmupFrames < 0 ||
      !Number.isInteger(maxSamples) ||
      maxSamples < 1
    ) {
      throw new RangeError(
        'Capture bounds must be nonnegative warmup and positive sample integers.',
      );
    }
  }

  /** Predicts whether an upcoming frame will retain pass details without changing meter state. */
  public shouldCaptureRenderPasses(frame: RaceFrameObservation): boolean {
    if (!this.enabled || this.disposed || this.raceCompleted || this.truncated) return false;
    if (
      frame.phase !== 'racing' ||
      frame.paused ||
      frame.hidden ||
      frame.boundary ||
      !Number.isFinite(frame.rawFrameMs) ||
      frame.rawFrameMs <= 0
    )
      return false;
    return (
      this.eligibleFrames + 1 > this.warmupFrames &&
      this.samples.length % RENDER_PASS_SAMPLE_INTERVAL === 0
    );
  }

  public record(frame: RaceFrameObservation): void {
    if (!this.enabled || this.disposed || this.raceCompleted) return;
    if (frame.phase === 'finished') this.raceCompleted = true;
    if (
      frame.phase !== 'racing' ||
      frame.paused ||
      frame.hidden ||
      frame.boundary ||
      !Number.isFinite(frame.rawFrameMs) ||
      frame.rawFrameMs <= 0
    ) {
      this.skippedFrames++;
      this.currentOver50msRun = 0;
      return;
    }
    this.eligibleFrames++;
    if (this.eligibleFrames <= this.warmupFrames || this.truncated) return;
    const scoredFrameIndex = this.samples.length;
    this.samples.push({
      rawFrameMs: frame.rawFrameMs,
      counters: frame.counters === null ? null : { ...frame.counters },
    });
    if (
      frame.renderPasses !== null &&
      frame.renderPasses !== undefined &&
      scoredFrameIndex % RENDER_PASS_SAMPLE_INTERVAL === 0
    ) {
      this.renderPassSamples.push({
        scoredFrameIndex,
        frame: cloneRenderPassFrame(frame.renderPasses),
      });
    }
    this.durationMs += frame.rawFrameMs;
    if (frame.rawFrameMs > 50) {
      this.over50msFrames++;
      this.currentOver50msRun++;
      this.longestOver50msRun = Math.max(this.longestOver50msRun, this.currentOver50msRun);
    } else this.currentOver50msRun = 0;
    if (frame.counters !== null) {
      this.maxDrawCalls = Math.max(this.maxDrawCalls ?? 0, frame.counters.drawCalls);
      this.maxTriangles = Math.max(this.maxTriangles ?? 0, frame.counters.triangles);
    }
    if (this.samples.length >= this.maxSamples) this.truncated = true;
  }

  /** Records only the first post-render scene snapshot; never touches race samples or timing. */
  public recordInitializationScene(snapshot: InitializationSceneSnapshot): void {
    if (!this.enabled || this.disposed || this.initializationScene !== null) return;
    this.initializationScene = {
      ...snapshot,
      actualDrawingBuffer: { ...snapshot.actualDrawingBuffer },
    };
  }

  public snapshot(): RacePerformanceSnapshot {
    const durations = this.samples.map((s) => s.rawFrameMs).sort((a, b) => a - b);
    const fps = durations.map((ms) => 1000 / ms).reverse();
    return {
      scoredFrames: durations.length,
      eligibleFrames: this.eligibleFrames,
      skippedFrames: this.skippedFrames,
      durationMs: this.durationMs,
      medianFrameMs: median(durations),
      p95FrameMs: durations[Math.ceil(durations.length * 0.95) - 1] ?? null,
      maxFrameMs: durations.at(-1) ?? null,
      medianFps: median(fps),
      over50msFrames: this.over50msFrames,
      longestOver50msRun: this.longestOver50msRun,
      truncated: this.truncated,
      maxDrawCalls: this.maxDrawCalls,
      maxTriangles: this.maxTriangles,
    };
  }

  public exportCapture(
    metadata: RaceCaptureMetadata,
    itemVfx: ItemVfxCapture = { availability: 'unavailable', snapshot: null },
  ): RacePerformanceCapture {
    return {
      schemaVersion: 1,
      metadata: {
        ...metadata,
        nominalViewport: { ...metadata.nominalViewport },
        rendering: cloneRenderingMetadata(
          metadata.rendering ?? unavailableRenderingMetadata(metadata),
        ),
      },
      summary: this.snapshot(),
      samples: this.samples.map((s) => ({
        rawFrameMs: s.rawFrameMs,
        counters: s.counters === null ? null : { ...s.counters },
      })),
      raceCompleted: this.raceCompleted,
      initializationScene:
        this.initializationScene === null
          ? { availability: 'unavailable', reason: 'no-completed-rendered-frame' }
          : {
              availability: 'captured',
              ...this.initializationScene,
              actualDrawingBuffer: { ...this.initializationScene.actualDrawingBuffer },
            },
      itemVfx:
        itemVfx.availability === 'available'
          ? { availability: 'available', snapshot: { ...itemVfx.snapshot } }
          : { ...itemVfx },
      policies: {
        warmupFrames: this.warmupFrames,
        maxSamples: this.maxSamples,
        percentileMethod: 'nearest-rank',
        medianMethod: 'mean-of-center-pair',
        excluded: 'countdown,pause,hidden,boundary,invalid',
      },
      unavailableMetrics: [
        'gpuFrameMs',
        'estimatedTextureBytes',
        ...(metadata.jsHeapBytes === null ? ['jsHeapBytes'] : []),
        'dynamicShadowObjects',
        'gameplayParticles',
      ],
      renderPasses: {
        schemaVersion: 1,
        samplingPolicy: {
          scoredFrameInterval: RENDER_PASS_SAMPLE_INTERVAL,
          maximumSamples: Math.ceil(this.maxSamples / RENDER_PASS_SAMPLE_INTERVAL),
          firstScoredFrameIndex: 0,
        },
        samples: this.renderPassSamples.map(({ scoredFrameIndex, frame }) => ({
          scoredFrameIndex,
          frame: cloneRenderPassFrame(frame),
        })),
        attributionDefinitions: [
          'Draw calls are renderer submissions, not distinct objects.',
          'Triangles are submitted triangles, not unique mesh geometry.',
          'The main scene delta includes shadow-map submissions when Three.js performs them inside that render; shadow calls are not separately split.',
          'Bloom mask and filter/composite stages are deltas around the existing renderer.render boundaries.',
          'Motion-blur framebuffer copies are recorded separately from renderer draw-call and triangle counters.',
          'Target pixels are width multiplied by height; they do not estimate GPU processing cost or bandwidth.',
          'Whole-frame counters retain their existing meaning and are reconciled against measured stage deltas.',
          'Frame time is CPU-observed; no GPU timer query is collected.',
        ],
        unavailableMetrics: [
          'gpuFrameMs',
          'gpuProcessingCost',
          'distinctObjects',
          'uniqueMeshGeometry',
          'trueGpuTextureBytes',
          'dynamicShadowCasterCount',
        ],
      },
    };
  }

  public dispose(): void {
    this.disposed = true;
    this.samples.length = 0;
    this.renderPassSamples.length = 0;
    this.initializationScene = null;
    this.eligibleFrames =
      this.skippedFrames =
      this.durationMs =
      this.over50msFrames =
      this.currentOver50msRun =
      this.longestOver50msRun =
        0;
    this.maxDrawCalls = this.maxTriangles = null;
    this.raceCompleted = this.truncated = false;
  }
}
