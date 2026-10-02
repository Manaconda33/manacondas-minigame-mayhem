"""Prepare approved Lunarcrystal art without repainting, cropping, or alpha removal.

Run from the repository root. --verify checks delivery bytes against the ledger.
Driver frames share the original square canvas and the same 16px inset.
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / 'docs/evidence/2026-10-01-lunarcrystal/approved-art-ledger.json'
DELIVERY = ROOT / 'docs/evidence/2026-10-01-lunarcrystal/runtime-art-ledger.json'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def target(asset):
    if asset == 'portrait':
        return 'portrait.png', (256, 256), 8
    if asset == 'selection-full-body':
        return 'selection/full-body.png', (1024, 1536), 0
    if asset.startswith('results-'):
        return f'results/{asset[8:]}.png', (1024, 1536), 0
    return f'driver/{asset}.png', (512, 512), 16


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    source_ledger = json.loads(LEDGER.read_text())
    expected = json.loads(DELIVERY.read_text()) if args.verify else None
    records = []
    for item in source_ledger['assets']:
        source = ROOT / item['source']
        if not args.verify:
            assert digest(source) == item['sha256'], f'Changed approved source: {source}'
        name, size, inset = target(item['asset'])
        output = ROOT / 'public/assets/characters/lunarcrystal' / name
        if not args.verify:
            with Image.open(source) as image:
                assert image.mode == 'RGBA'
                assert image.size == tuple(item['dimensions'])
                output.parent.mkdir(parents=True, exist_ok=True)
                if inset:
                    # Pillow RGBa is premultiplied; resampling cannot leak the
                    # hidden background RGB into partially transparent edges.
                    resized = image.convert('RGBa').resize(
                        (size[0] - 2 * inset, size[1] - 2 * inset),
                        Image.Resampling.LANCZOS,
                    ).convert('RGBA')
                    canvas = Image.new('RGBA', size)
                    canvas.paste(resized, (inset, inset))
                    canvas.save(output, optimize=True)
                else:
                    output.write_bytes(source.read_bytes())
        with Image.open(output) as runtime:
            assert runtime.mode == 'RGBA' and runtime.size == size
            runtime.load()
            alpha = runtime.getchannel('A')
            assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] > 0
            assert all(alpha.getpixel(p) == 0 for p in
                       ((0, 0), (size[0]-1, 0), (0, size[1]-1), (size[0]-1, size[1]-1)))
            records.append(dict(asset=item['asset'], path=str(output.relative_to(ROOT)),
                                sha256=digest(output), dimensions=list(size),
                                source_sha256=item['sha256'], canvas_inset=inset,
                                alpha_bounds=list(alpha.getbbox())))
    result = dict(character='Lunarcrystal', id='lunarcrystal', revision='lunarcrystal-art-20261001-1',
                  status='asset delivery only; not runtime-active', assets=records)
    if args.verify:
        assert result == expected, 'Delivery differs from checked-in ledger'
    else:
        DELIVERY.write_text(json.dumps(result, indent=2) + '\n')
    print(f'PASS: {len(records)} RGBA delivery sizes, full decoding, transparency and delivery hashes')


if __name__ == '__main__':
    main()
