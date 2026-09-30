import type {
  RaceCaptureMetadata,
  RaceFrameObservation,
  RacePerformanceCapture,
  RacePerformanceSnapshot,
} from './raceDiagnostics';

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
    this.samples.push({
      rawFrameMs: frame.rawFrameMs,
      counters: frame.counters === null ? null : { ...frame.counters },
    });
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

  public exportCapture(metadata: RaceCaptureMetadata): RacePerformanceCapture {
    return {
      schemaVersion: 1,
      metadata: { ...metadata, nominalViewport: { ...metadata.nominalViewport } },
      summary: this.snapshot(),
      samples: this.samples.map((s) => ({
        rawFrameMs: s.rawFrameMs,
        counters: s.counters === null ? null : { ...s.counters },
      })),
      raceCompleted: this.raceCompleted,
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
    };
  }

  public dispose(): void {
    this.disposed = true;
    this.samples.length = 0;
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
