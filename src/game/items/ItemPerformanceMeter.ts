export const ITEM_VFX_CPU_BUDGET_MS = 1;
export const ITEM_PERF_WARMUP_FRAMES = 120;
export const ITEM_PERF_MIN_SAMPLES = 300;
export const ITEM_PERF_MAX_SAMPLES = 600;

export type ItemPerformanceStatus =
  | 'disabled'
  | 'warming'
  | 'collecting'
  | 'pass'
  | 'fail';

export interface ItemPerformanceSnapshot {
  enabled: boolean;
  status: ItemPerformanceStatus;
  budgetMs: number;
  warmupFramesRemaining: number;
  sampleCount: number;
  latestMs: number;
  medianMs: number;
  p95Ms: number;
  maxMs: number;
  simulationMs: number;
  vfxMs: number;
}

type Clock = () => number;

function percentile(sorted: readonly number[], ratio: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index] ?? 0;
}

/**
 * Opt-in live CPU instrumentation for the PRD Item/VFX subsystem budget.
 *
 * Samples are per rendered frame. Simulation timing accumulates across every fixed
 * step executed inside that rendered frame, while VFX timing captures the live
 * item-presentation work once per rendered frame. Renderer, physics, racer AI,
 * HUD and audio are intentionally outside this meter because the PRD budgets them
 * separately.
 */
export class ItemPerformanceMeter {
  private collecting = false;
  private warmupFramesRemaining = ITEM_PERF_WARMUP_FRAMES;
  private simulationMs = 0;
  private vfxMs = 0;
  private latestMs = 0;
  private readonly samples: number[] = [];

  public constructor(
    public readonly enabled: boolean,
    private readonly clock: Clock = () => performance.now(),
  ) {}

  public beginFrame(racing: boolean): void {
    this.collecting = this.enabled && racing;
    this.simulationMs = 0;
    this.vfxMs = 0;
  }

  public startSimulation(): number {
    return this.collecting ? this.clock() : -1;
  }

  public stopSimulation(start: number): void {
    if (!this.collecting || start < 0) return;
    this.simulationMs += Math.max(0, this.clock() - start);
  }

  public startVfx(): number {
    return this.collecting ? this.clock() : -1;
  }

  public stopVfx(start: number): void {
    if (!this.collecting || start < 0) return;
    this.vfxMs += Math.max(0, this.clock() - start);
  }

  public endFrame(): void {
    if (!this.collecting) return;

    if (this.warmupFramesRemaining > 0) {
      this.warmupFramesRemaining -= 1;
      return;
    }

    this.latestMs = this.simulationMs + this.vfxMs;
    this.samples.push(this.latestMs);
    if (this.samples.length > ITEM_PERF_MAX_SAMPLES) this.samples.shift();
  }

  public snapshot(): ItemPerformanceSnapshot {
    if (!this.enabled) {
      return {
        enabled: false,
        status: 'disabled',
        budgetMs: ITEM_VFX_CPU_BUDGET_MS,
        warmupFramesRemaining: ITEM_PERF_WARMUP_FRAMES,
        sampleCount: 0,
        latestMs: 0,
        medianMs: 0,
        p95Ms: 0,
        maxMs: 0,
        simulationMs: 0,
        vfxMs: 0,
      };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);
    const medianMs = percentile(sorted, 0.5);
    const p95Ms = percentile(sorted, 0.95);
    const maxMs = sorted.at(-1) ?? 0;
    const status: ItemPerformanceStatus =
      this.warmupFramesRemaining > 0
        ? 'warming'
        : this.samples.length < ITEM_PERF_MIN_SAMPLES
          ? 'collecting'
          : p95Ms <= ITEM_VFX_CPU_BUDGET_MS
            ? 'pass'
            : 'fail';

    return {
      enabled: true,
      status,
      budgetMs: ITEM_VFX_CPU_BUDGET_MS,
      warmupFramesRemaining: this.warmupFramesRemaining,
      sampleCount: this.samples.length,
      latestMs: this.latestMs,
      medianMs,
      p95Ms,
      maxMs,
      simulationMs: this.simulationMs,
      vfxMs: this.vfxMs,
    };
  }

  public badge(): string | null {
    if (!this.enabled) return null;
    const snapshot = this.snapshot();
    if (snapshot.status === 'warming')
      return `PERF ITEM/VFX WARMUP ${String(snapshot.warmupFramesRemaining)}F`;
    if (snapshot.status === 'collecting')
      return `PERF ITEM/VFX N${String(snapshot.sampleCount)}/${String(ITEM_PERF_MIN_SAMPLES)} · P95 ${snapshot.p95Ms.toFixed(2)}MS`;
    return `PERF ITEM/VFX P95 ${snapshot.p95Ms.toFixed(2)}MS / ${snapshot.budgetMs.toFixed(2)}MS · MED ${snapshot.medianMs.toFixed(2)} · MAX ${snapshot.maxMs.toFixed(2)} · N${String(snapshot.sampleCount)} · ${snapshot.status.toUpperCase()}`;
  }
}
