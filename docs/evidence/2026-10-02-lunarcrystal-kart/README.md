# Lunarcrystal Moonlit Carriage candidate 1

Manny approved the name, celestial kart concept and AA-14 Medium profile (6/7/4/8/5/6) on 2026-10-02. Actual candidate geometry remains unapproved.

`candidate-1.json` records exact generated GLB hashes, node/material/triangle counts, passing validation and limitations. Candidate binaries stay local outside runtime paths. Regenerate each LOD with `LUNAR_KART_LOD=LOD0` (or LOD1/LOD2), `LUNAR_KART_OUT=<candidate path>` and `LUNAR_KART_SKIP_PREVIEW=1`, then run `python tools/assets/build_lunarcrystal_kart.py`. With preview enabled, the builder renders the actual geometry in four views.

Asset-only PR #237 remains open; exact-head CI 37010681712 passed. The next gate is Manny’s candidate-geometry approval, then both-camera sprite mounting and gameplay review. No production release is authorized.
