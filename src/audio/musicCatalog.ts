import manifest from '../../assets/audio/music-review-v2/manifest.json';
import opusManifest from '../../assets/audio/music-opus-192k/manifest.json';

export type MusicCue = 'hub' | 'select' | 'race' | 'final-lap' | 'results';
export interface MusicDefinition {
  readonly file: string;
  readonly duration: number;
  readonly bpm: number;
  readonly sha256: string;
  readonly opusFile: string;
  readonly opusSha256: string;
}
const opusTracks = new Map(opusManifest.tracks.map((track) => [track.id, track]));
export const musicCatalog = Object.fromEntries(
  manifest.tracks.map((track) => [
    track.id,
    (() => {
      const opus = opusTracks.get(track.id);
      if (!opus) throw new Error(`Missing experimental Opus track: ${track.id}`);
      return {
        file: track.file,
        duration: track.loop_seconds,
        bpm: track.estimated_bpm,
        sha256: track.wav_sha256,
        opusFile: opus.file,
        opusSha256: opus.sha256,
      };
    })(),
  ]),
) as Record<MusicCue, MusicDefinition>;

export type MusicFormat = 'wav' | 'opus-192k';

export function musicFormatFromSearch(
  search = typeof location === 'undefined' ? '' : location.search,
): MusicFormat {
  return new URLSearchParams(search).get('musicFormat') === 'opus-192k' ? 'opus-192k' : 'wav';
}

export function musicUrl(cue: MusicCue, format: MusicFormat = 'wav'): string {
  const track = musicCatalog[cue];
  if (format === 'opus-192k')
    return `${import.meta.env.BASE_URL}assets/audio/music-opus-192k/${track.opusFile}?v=${track.opusSha256.slice(0, 12)}`;
  return `${import.meta.env.BASE_URL}assets/audio/music-v2/${track.file}?v=${track.sha256.slice(0, 12)}`;
}

export interface RaceMusicState {
  phase: 'countdown' | 'racing' | 'finished';
  lap: number;
  paused: boolean;
  prismatic: boolean;
}
