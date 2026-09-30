# Route Night music loop review — revision 2

Manny rejected the audible seams in revision 1. This revision selects new
musical boundaries and blends approximately two bars (3.7–4.5 seconds), rather
than the original 140 ms. Upper frequencies use a correlation-compensated
crossfade. Bass/kick use a shorter one-beat handoff within that blend to reduce
overlapping rhythmic/bass material. No audio generation, time stretching or
pitch shifting was used. Originals are unchanged.

## Listening

Each seam-review MP3 contains ONE real loop boundary at 0:12. Its crossfade
begins approximately 0:07.5–0:08.3. There is no inserted excerpt skip.
Each two-cycle-listening MP3 plays the complete revised loop twice, giving an
uninterrupted repetition at the loop duration recorded in the manifest.
The transition preview is 30 seconds; final-lap-only audio starts at 0:12,
following a two-bar crossfade beginning about 0:08.33.

Listen for rhythmic continuity, chord changes, doubled percussion, blend
loudness, and the final lap's additional urgency. Computational checks are
not a listening pass. Manny's acceptance remains pending.

## Delivery and checks

48 kHz stereo PCM16 WAV loop masters; 256 kbps MP3 auditions. Levels match
approximately -20 LUFS with at least 2 dB true-peak headroom. Every MP3 decodes,
every WAV has the required format and safe peaks, source hashes are unchanged,
and terminal samples follow original pre-roll into the loop start. Exact cuts,
hashes, levels and fade lengths are in music-edit-manifest.json.

The first-pass previews also contained an explicitly labelled excerpt skip at
0:14. Revision 2 removes it so the review only exposes the actual loop join.

There are no runtime, repository, or production changes. Integrated music/SFX
mix review and separate production-publication approval remain later gates.
