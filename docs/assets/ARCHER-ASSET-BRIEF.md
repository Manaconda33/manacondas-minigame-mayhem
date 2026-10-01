# Archer Asset Brief

The approved character/kart specification and AA-13 mapping are recorded in `docs/avatars/ARCHER.md`. The supplied sheet governs likeness, kart shape, ivory/gold/purple palette and VHS/glitch styling. Each of fourteen source art outputs was approved individually; the exact original bytes are listed in `docs/evidence/2026-10-01-archer/approved-art-ledger.json`.

## Delivery preparation remaining

- COMPLETE: portrait 256 × 256; ten drivers 512 × 512 RGBA. Uniform premultiplied resizing and shared 16px driver inset preserve original pose positions; no cropping, repainting, alpha thresholding, wheel or kart added. Cockpit mounting remains a later geometry/integration check.
- COMPLETE: selection and both results delivery files retain the exact approved 1024 × 1536 RGBA bytes. All 14 images fully decode and were visually inspected together against a dark background.
- Prepare deterministic kart LODs and a four-view geometry review with new candidate URLs/filenames. Validate hierarchy, triangle budgets, structural attachment, forward metadata and modeled steering wheel.
- Bind controlled, base-aware revisioned URLs and all ten driver states; verify chase and rear cameras and fallbacks.
- Integrate page navigation and AA-13 without remapping existing profiles. Record the approved roster expansion in PRD/decisions before runtime integration.
- Verify current graphics/exhaust integration and eight-racer identity sampling against latest main.
- Complete hosted validation, owner gameplay review and explicit publication approval before production activation.

## Publication boundary

Source masters under `public/assets/characters/aa-13/source/` are LFS-governed. Source masters cannot be pushed because shell Git/LFS authentication is unavailable. They are excluded from remote publication and retained locally for authenticated external LFS handoff; the Actions bridge cannot reproduce AI-generated source images. All 14 verified runtime derivatives use the existing normal-Git delivery exceptions. Manny requested repository delivery on 2026-10-01; production activation remains separate.
