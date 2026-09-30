import manifest from '../../assets/audio/music-review-v2/manifest.json';

export type MusicCue = 'hub' | 'select' | 'race' | 'final-lap' | 'results';
export interface MusicDefinition {
  readonly file: string;
  readonly duration: number;
  readonly bpm: number;
  readonly sha256: string;
}
export const musicCatalog = Object.fromEntries(
  manifest.tracks.map((track) => [
    track.id,
    {
      file: track.file,
      duration: track.loop_seconds,
      bpm: track.estimated_bpm,
      sha256: track.wav_sha256,
    },
  ]),
) as Record<MusicCue, MusicDefinition>;

export function musicUrl(cue: MusicCue): string {
  const track = musicCatalog[cue];
  return `${import.meta.env.BASE_URL}assets/audio/music-v2/${track.file}?v=${track.sha256.slice(0, 12)}`;
}

export interface RaceMusicState {
  phase: 'countdown' | 'racing' | 'finished';
  lap: number;
  paused: boolean;
  prismatic: boolean;
}
