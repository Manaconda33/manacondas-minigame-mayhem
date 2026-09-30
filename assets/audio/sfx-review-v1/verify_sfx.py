"""Verify the committed review manifest against materialized WAV bytes."""
from pathlib import Path
import hashlib, json, struct, wave
root = Path(__file__).parent
manifest = json.loads((root / 'manifest.json').read_text())
assert manifest['cue_count'] == 96
assert len(manifest['cues']) == 96
assert len({c['id'] for c in manifest['cues']}) == 96
assert sum(c['loop'] for c in manifest['cues']) == 13
expected = {c['file'] for c in manifest['cues']}
assert {str(p.relative_to(root)) for p in (root / 'wav').rglob('*.wav')} == expected
for cue in manifest['cues']:
    path = root / cue['file']
    data = path.read_bytes()
    assert hashlib.sha256(data).hexdigest() == cue['sha256'], cue['id']
    with wave.open(str(path), 'rb') as wav:
        assert (wav.getnchannels(), wav.getsampwidth(), wav.getframerate()) == (1, 2, 48000)
        assert wav.getcomptype() == 'NONE'
        frames = wav.readframes(wav.getnframes())
    samples = struct.unpack('<' + 'h' * (len(frames) // 2), frames)
    assert samples and max(abs(s) for s in samples) <= 23171, cue['id']
    assert abs(len(samples) / 48000 - cue['duration_seconds']) <= .001
    if cue['loop']:
        assert abs(samples[-1] - samples[0]) / 32768 <= .025, cue['id']
    else:
        assert samples[0] == 0 and samples[-1] == 0, cue['id']
print('PASS: 96 exact WAV hashes, format/duration/headroom, 13 loop boundaries, one-shot fades')
