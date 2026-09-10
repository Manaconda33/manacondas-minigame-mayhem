/** Short original crystal cues. Voices are bounded and stopped on pause/disposal. */
export class FrostAudio {
  private readonly voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>();
  public play(
    kind: 'launch' | 'impact',
    context: AudioContext | null | undefined,
    volume: number,
  ): void {
    if (
      context?.state !== 'running' ||
      !Number.isFinite(volume) ||
      volume <= 0 ||
      this.voices.size >= 8
    )
      return;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const voice = { oscillator, gain };
      const now = context.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(kind === 'launch' ? 1000 : 1600, now);
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'launch' ? 1500 : 650, now + 0.1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.min(1, volume) * 0.045, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        this.voices.delete(voice);
      };
      this.voices.add(voice);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
    } catch {
      this.dispose();
    }
  }
  public dispose(): void {
    for (const { oscillator, gain } of this.voices) {
      try {
        oscillator.stop();
      } catch {
        /* Already stopped or unavailable. */
      }
      oscillator.disconnect();
      gain.disconnect();
    }
    this.voices.clear();
  }
}
