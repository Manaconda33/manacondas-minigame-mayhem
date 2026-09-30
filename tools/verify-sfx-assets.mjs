import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await readFile('assets/audio/sfx-review-v1/manifest.json', 'utf8'));
for (const cue of manifest.cues) {
  const path = `public/assets/audio/sfx-v1/${cue.file.replace(/^wav\//, '')}`;
  const bytes = await readFile(path);
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE')
    throw new Error(`${path} is not a materialized WAV (Git LFS pointer or corrupt asset).`);
  if (createHash('sha256').update(bytes).digest('hex') !== cue.sha256)
    throw new Error(`${path} differs from the listening-approved SFX bytes.`);
}
console.log(
  `Verified ${manifest.cues.length} listening-approved runtime SFX hashes and WAV signatures.`,
);
