> **Circuit Alpha terrain materials: LIVE ACCEPTED / DEPLOYED (2026-10-01).** Manny approved production merge/publication after the pinned gameplay preview with “merge & publication to main approved.” PR #234 merged at `0aaea588b1260548cd96d5e4226da7ecfc8397f3`; exact-head PR CI `36932505230` and post-merge main CI/Pages `36934885453` passed. Production HTML, JS, CSS and all nine terrain JPEGs were fetched and matched the validated production build byte-for-byte. Review validation passed 99 files / 768 tests plus typecheck, zero-warning lint, exact assets, LFS and build; hosted preview desktop/portrait startup passed with nine textures and no page/console errors. Accepted asphalt, track geometry/physics, gameplay, karts/art, HUD/Results, audio, bloom and motion blur remain intact. Context-loss recovery remains waived; diagnostics deferred. No separate owner production-root playtest or numeric hardware performance result is inferred. Lighting/shadow/camera increments and final Slice 6 gates remain separate. Evidence: `docs/evidence/2026-10-01-terrain-materials/production-delivery.json`. Earlier review/pending entries are historical.

# Circuit Alpha terrain material completion — 2026-10-01

Status: **IMPLEMENTED / LOCAL VALIDATION PASSED; OWNER VISUAL REVIEW AND PUBLICATION PENDING.**

## Authority and boundary

Manny approved completing Circuit Alpha’s materials with “I'm aligned with completing Circuit Alpha’s materials.” He explicitly deferred diagnostics until the visual improvements are finished, reporting positive performance on all devices so far. This changes work order, not the PRD performance criteria or recorded numeric evidence. Baseline main: `68dc1c9a3f68d953c9468d926b533bba21781459`. Active Slice 6, PRD v1.1/amendments through 2.22.

Existing asphalt/racing-wear, topology, collision/surface physics, race authority, roster/karts/art, HUD/Results, audio, bloom and motion blur remain unchanged. Context-loss recovery remains waived. This increment does not authorize the later lighting/shadow or camera polish increments, public production merge/deployment, or Slice 6 closure.

## Implementation

- Grass: Poly Haven Leafy Grass at 2m per tile on the existing 900m plane; UVs only change, not geometry or transform.
- Dirt: Poly Haven Brown Mud, dry granular soil at the source 1.3m tile scale; existing optional dirt lane remains in place.
- Shoulder: Poly Haven Gravel Floor 02 at 2m, seam-safe existing loop coordinates and retained violet identity.
- Three 1K JPEG maps per material: sRGB albedo, linear OpenGL normal, and shared linear ARM (red AO / green roughness; metalness stays zero). Restrained baked surface AO; no scene-wide contact-AO or new lighting pass is claimed. No displacement or additional triangles/draw batches.
- Base-aware revision `slice6-terrain-20261001-1`; anisotropy 4 with mipmaps. A missing albedo restores the original palette; failed normal/ARM maps detach independently. Failed maps and shared textures release once; late failure after disposal cannot update retired material.
- Source JPEG bytes are unchanged and verified against Poly Haven API MD5 at download and the committed SHA-256 inventory at build. These compact runtime JPGs follow the existing normal-Git track-JPG policy; no `.gitattributes` exception or LFS bypass was introduced.
- Added payload: **9,298,938 bytes (8.87 MiB)**. Conservative nine-texture RGBA+mip estimate: **48 MiB**, approximately **64 MiB including the accepted asphalt maps**. This is an estimate for these maps, not total GPU residency or device certification.

## Verification

- Baseline: 98 files / 764 tests passed, `git lfs fsck` passed.
- `red.txt`: four behavioral tests failed before implementation (missing maps, unscaled ground UVs, absent fallbacks).
- `green.txt`: focused terrain/material/scene suites passed, 3 files / 12 tests.
- `validation.txt`: full `npm run validate` passed: typecheck, zero-warning lint, **99 files / 768 tests**, 89.29% statement coverage, asset gates and production build. Existing Vite large-chunk warning remains nonblocking.
- Build gate rejects both a fabricated LFS pointer and a one-byte JPEG mutation; original bytes restored and all nine hashes then passed.
- `browser.json`: Chromium 153 software WebGL loaded 1024x1024 maps, used shared ARM/UV0, compiled/rendered the real scene/materials without WebGL errors; real aborted texture requests restored all original colors. Actual race startup/countdown passed at 960x640 desktop and 375x667 touch/portrait, each with all nine JPEG responses HTTP 200 and zero page/console errors. This is startup evidence, not a complete race or hardware-performance pass.
- Comparison PNGs use identical camera/key/fill colors with shadows disabled. They compare new terrain materials to the original color-only materials on the same geometry; asphalt is unchanged. These are material comparisons, not owner acceptance or hardware performance evidence.

## Review route

Prepare a pinned GitHub Pages preview at `/previews/terrain-materials/` through a separate preview-only PR. Publication to main requires Manny’s explicit preview-publication approval; the runtime implementation PR stays unmerged. Owner review: grass reads as terrain rather than a flat field; dirt retains distinct warm granular identity; shoulder stays violet with fine gravel detail; no visible tiling seam or shimmer distracts from driving; accepted asphalt/road readability, karts, HUD, bloom/blur and controls remain intact. Review a restart for missing-map artifacts. No accepted whole-flow or five-restart gate is reopened.

After preview acceptance, production merge/publication remains a separate explicit gate. Diagnostics stays deferred until visual work is finished. No next slice is authorized.
