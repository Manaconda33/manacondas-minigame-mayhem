import { describe, expect, it, vi } from 'vitest';
import { mountRaceDiagnosticsPanel } from '../src/app/raceDiagnosticsPanel';
import type { RaceCaptureMetadata } from '../src/game/diagnostics/raceDiagnostics';

describe('T9.6 race capture provenance', () => {
  it('exports the selected Neon Grid track and actual Low setting, never Circuit Alpha/Medium defaults', () => {
    const root = document.createElement('div');
    const received: RaceCaptureMetadata[] = [];
    const capture = vi.fn((metadata: RaceCaptureMetadata) => {
      received.push(metadata);
      return null;
    });
    const panel = mountRaceDiagnosticsPanel(root, capture, {
      trackId: 'neon-grid',
      quality: 'low',
    });
    try {
      root.querySelector<HTMLButtonElement>('[data-download-race-capture]')?.click();
      expect(capture).toHaveBeenCalledOnce();
      expect(received[0]?.quality).toBe('low');
      expect(received[0]?.racerCount).toBe(8);
      expect(received[0]?.scenario).toContain('neon-grid three-lap race;');
    } finally {
      panel.dispose();
    }
    expect(root.querySelector('[data-race-diagnostics]')).toBeNull();
  });

  it('labels Circuit Alpha explicitly without contaminating a Neon Grid benchmark', () => {
    const root = document.createElement('div');
    const received: RaceCaptureMetadata[] = [];
    const capture = vi.fn((metadata: RaceCaptureMetadata) => {
      received.push(metadata);
      return null;
    });
    const panel = mountRaceDiagnosticsPanel(root, capture, {
      trackId: 'circuit-alpha',
      quality: 'high',
    });
    try {
      root.querySelector<HTMLButtonElement>('[data-download-race-capture]')?.click();
      expect(received[0]?.quality).toBe('high');
      expect(received[0]?.scenario).toContain('circuit-alpha three-lap race;');
    } finally {
      panel.dispose();
    }
  });
});
