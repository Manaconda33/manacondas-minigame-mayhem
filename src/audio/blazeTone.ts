export type BlazeToneKind = 'launch' | 'impact';

/** Original procedural Blaze cue; no assets, network requests, or persistent voices. */
export function playBlazeTone(
  kind: BlazeToneKind,
  context: AudioContext | null | undefined,
  masterVolume: number,
): boolean {
  if (context?.state !== 'running' || !Number.isFinite(masterVolume) || masterVolume <= 0) return false;

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const volume = Math.min(1, masterVolume);

    oscillator.type = kind === 'launch' ? 'triangle' : 'sawtooth';
    oscillator.frequency.setValueAtTime(kind === 'launch' ? 510 : 240, now);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'launch' ? 860 : 120, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume * (kind === 'launch' ? 0.055 : 0.07), now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.12);
    return true;
  } catch {
    return false;
  }
}
