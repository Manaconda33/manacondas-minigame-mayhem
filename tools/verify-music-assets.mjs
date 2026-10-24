import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await readFile('assets/audio/music-review-v2/manifest.json', 'utf8'));
const opusManifest = JSON.parse(
  await readFile('assets/audio/music-opus-192k/manifest.json', 'utf8'),
);
if (manifest.tracks.length !== 5 || new Set(manifest.tracks.map((t) => t.id)).size !== 5)
  throw new Error('Expected exactly five approved music cues.');
if (
  opusManifest.format !== 'Ogg Opus' ||
  opusManifest.profile !== '192k VBR' ||
  opusManifest.source_commit !== '5df72b270e231790f31121496a10cd58d71378f6' ||
  opusManifest.tracks.length !== 5 ||
  new Set(opusManifest.tracks.map((t) => t.id)).size !== 5
)
  throw new Error('Expected exactly five source-pinned experimental Opus cues.');
for (const track of manifest.tracks) {
  const path = `public/assets/audio/music-v2/${track.file}`;
  const bytes = await readFile(path);
  if (
    bytes.toString('ascii', 0, 4) !== 'RIFF' ||
    bytes.toString('ascii', 8, 12) !== 'WAVE' ||
    bytes.readUInt32LE(4) + 8 !== bytes.length
  )
    throw new Error(`${path}: invalid or unmaterialized WAV.`);
  if (
    !track.listening_accepted ||
    createHash('sha256').update(bytes).digest('hex') !== track.wav_sha256
  )
    throw new Error(`${path}: differs from the approved music bytes.`);
  let format;
  let frames;
  for (let start = 12; start + 8 <= bytes.length;) {
    const size = bytes.readUInt32LE(start + 4);
    const data = start + 8;
    if (data + size > bytes.length) throw new Error(`${path}: truncated chunk.`);
    const name = bytes.toString('ascii', start, start + 4);
    if (name === 'fmt ') {
      if (size < 16) throw new Error(`${path}: truncated format.`);
      format = [
        bytes.readUInt16LE(data),
        bytes.readUInt16LE(data + 2),
        bytes.readUInt32LE(data + 4),
        bytes.readUInt16LE(data + 12),
        bytes.readUInt16LE(data + 14),
      ];
    }
    if (name === 'data') frames = size / 4;
    start = data + size + (size % 2);
  }
  if (
    JSON.stringify(format) !== JSON.stringify([1, 2, 48000, 4, 16]) ||
    frames !== Math.round(track.loop_seconds * 48000)
  )
    throw new Error(`${path}: unexpected PCM format or loop sample count.`);
}
for (const track of opusManifest.tracks) {
  const source = manifest.tracks.find((candidate) => candidate.id === track.id);
  if (
    !source ||
    track.source_wav !== source.file ||
    track.source_wav_sha256 !== source.wav_sha256 ||
    track.duration_seconds !== source.loop_seconds ||
    track.sample_rate !== 48000 ||
    track.channels !== 2 ||
    track.decoded_frames !== track.frames ||
    track.frames !== Math.round(track.duration_seconds * track.sample_rate)
  )
    throw new Error(`Opus provenance or loop frames do not match the approved WAV: ${track.id}`);
  const path = `public/assets/audio/music-opus-192k/${track.file}`;
  const bytes = await readFile(path);
  if (
    bytes.toString('ascii', 0, 4) !== 'OggS' ||
    bytes.length !== track.bytes ||
    createHash('sha256').update(bytes).digest('hex') !== track.sha256
  )
    throw new Error(`${path}: differs from the source-hash-pinned Opus candidate.`);
}
console.log(
  'Verified five approved WAV assets and five source-hash-pinned Ogg Opus candidates, with matching loop sample counts.',
);
