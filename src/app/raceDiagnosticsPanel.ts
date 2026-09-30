import type {
  RaceCaptureMetadata,
  RacePerformanceCapture,
  RacePerformanceSnapshot,
} from '../game/diagnostics/raceDiagnostics';

/** Diagnostic-only UI. Its listener and race closure end together on navigation. */
export function mountRaceDiagnosticsPanel(
  root: HTMLElement,
  capture: (metadata: RaceCaptureMetadata) => RacePerformanceCapture | null,
): { update: (snapshot: RacePerformanceSnapshot) => void; dispose: () => void } {
  const panel = document.createElement('details');
  panel.dataset.raceDiagnostics = '';
  panel.className = 'race-diagnostics';
  panel.innerHTML = `<summary>Race diagnostics</summary><p data-diagnostics-summary>Warmup: 120 eligible frames · Original window: 36,000 frames max</p><p>Renderer geometry/texture fields are object counts; GPU time and texture bytes are unavailable. No automatic performance pass.</p><label>Hardware / OS / browser version <input data-diagnostics-hardware placeholder="Unknown until entered" /></label><button type="button" data-download-race-capture>Download Capture</button>`;
  root.append(panel);
  const summary = panel.querySelector<HTMLElement>('[data-diagnostics-summary]');
  const hardware = panel.querySelector<HTMLInputElement>('[data-diagnostics-hardware]');
  const button = panel.querySelector<HTMLButtonElement>('[data-download-race-capture]');
  let disposed = false;
  const download = (): void => {
    if (disposed) return;
    const heap = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory
      ?.usedJSHeapSize;
    const jsHeapBytes =
      typeof heap === 'number' && Number.isFinite(heap) && heap >= 0 ? heap : null;
    const sourceCommit: unknown = import.meta.env.VITE_SOURCE_COMMIT;
    const hardwareDescription = hardware?.value.trim();
    const result = capture({
      schemaVersion: 1,
      sourceCommit: typeof sourceCommit === 'string' && sourceCommit !== '' ? sourceCommit : null,
      capturedAt: new Date().toISOString(),
      quality: 'medium',
      userAgent: navigator.userAgent,
      hardwareDescription: hardwareDescription === '' ? null : (hardwareDescription ?? null),
      scenario: `Circuit Alpha three-lap race; query=${window.location.search}`,
      racerCount: 8,
      nominalViewport: { width: window.innerWidth, height: window.innerHeight },
      gpuFrameMs: null,
      jsHeapBytes,
      estimatedTextureBytes: null,
      jsHeapMethod:
        jsHeapBytes === null
          ? 'performance.memory unavailable'
          : 'Nonstandard performance.memory.usedJSHeapSize at export; whole-page estimate, not race allocation',
    });
    if (result === null) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `race-performance-${result.metadata.capturedAt.replaceAll(':', '-')}.json`;
    try {
      link.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  button?.addEventListener('click', download);
  const stopDrivingKeys = (event: KeyboardEvent): void => {
    event.stopPropagation();
  };
  panel.addEventListener('keydown', stopDrivingKeys);
  const value = (n: number | null): string => (n === null ? 'unavailable' : n.toFixed(1));
  return {
    update(snapshot) {
      if (disposed || summary === null) return;
      summary.textContent = `Scored ${String(snapshot.scoredFrames)} / eligible ${String(snapshot.eligibleFrames)}; skipped ${String(snapshot.skippedFrames)} · median FPS ${value(snapshot.medianFps)} · p95 ${value(snapshot.p95FrameMs)} ms · max ${value(snapshot.maxFrameMs)} ms · >50 ms ${String(snapshot.over50msFrames)} / longest run ${String(snapshot.longestOver50msRun)} · max draw calls ${value(snapshot.maxDrawCalls)} / triangles ${value(snapshot.maxTriangles)} · Warmup 120; original window 36,000 max${snapshot.truncated ? ' · TRUNCATED' : ''}`;
    },
    dispose() {
      disposed = true;
      button?.removeEventListener('click', download);
      panel.removeEventListener('keydown', stopDrivingKeys);
      panel.remove();
    },
  };
}
