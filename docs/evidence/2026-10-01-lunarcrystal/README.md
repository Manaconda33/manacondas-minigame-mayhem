# Lunarcrystal 2D asset checkpoint

Manny individually approved all fourteen art outputs and authorized repository upload before kart work on 2026-10-01 (America/Chicago). Initial rear-turn versions are rejected and excluded; replacement steering frames are approved.

- `approved-art-ledger.json`: approved original hashes, dimensions, alpha observations and rejected-version inventory.
- `runtime-art-ledger.json`: fourteen exact delivery hashes, source hashes, dimensions, insets and alpha bounds.
- `python tools/assets/prepare_lunarcrystal_2d.py --verify`: verification without source masters.

Delivery-only namespace is `lunarcrystal`. No balance assignment or production activation. Source masters are local, LFS-governed and excluded from remote publication. Preparation follows Archer's existing premultiplied resize/inset pipeline and preserves approved selection/Results bytes. Actual kart-mounted rendering remains a later gate.
