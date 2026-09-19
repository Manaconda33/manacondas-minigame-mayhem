# Slice 6 Route Night Character Select checkpoint

Date: 2026-09-19

Status: **IMPLEMENTED ON FEATURE BRANCH / PUBLICATION AND DEPLOYED VISUAL ACCEPTANCE PENDING**

## Authority and bounded objective

This checkpoint implements the next bounded Slice 6 screen under ADR-090. The governing references are:

- `docs/PRD.md`, especially Sections 10.2 and 10.3;
- `docs/DECISIONS.md`, ADR-086 Route Night, ADR-087 settings/audio foundation, ADR-088 Circuit Alpha PBR baseline, and ADR-090 Character Select;
- `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png`;
- the live-accepted Circuit Alpha material baseline recorded by ADR-088.

The increment is limited to Character Select, the shared preview seam required by that screen, and three bounded original atmospheric layers. Race HUD, mini-map, pause/results, production race audio, post-processing, gameplay, topology, and the accepted asphalt/PBR implementation remain outside the change.

## Implemented surface

- Replaces the earlier rounded Character Select scaffold with a responsive Route Night driver checkpoint: clipped graphite panels, cyan route/node/checkpoint grammar, gold selected/confirm states, violet energy, route-board density, focus-visible treatment, and reduced-motion fallback.
- Renders all twelve approved manifest entries as live roster controls with real portrait assets and the existing portrait fallback behavior.
- Renders the selected production driver front art, approved class label, approved kart name, and the six fixed manifest statistics in a stable presentation order.
- Preserves the title → hub → Character Select → race handoff, selected-driver state, audio unlock, confirm action, and back-to-hub navigation.
- Adds `CharacterKartPreview`, an isolated Three.js UI preview that loads the selected manifest GLB through `GLTFLoader`, applies the governed `kartVisualYaw`, rotates slowly when motion is allowed, renders a static preview for reduced motion, and uses a procedural 3D fallback for missing GLBs plus a visible CSS fallback panel when WebGL is unavailable. It does not modify `KartTimeTrial` or gameplay kart loading.
- Keeps copy, layout, interaction, identity, and accessibility semantics in DOM/CSS/SVG. Generated image layers support atmosphere only and do not replace responsive controls or live text.

## Original generated Character Select atmosphere package

The package adds three original WebP layers under `public/assets/ui/route-night/`:

| Runtime asset                                 | Placement                                                                       |  Dimensions | Format      | SHA-256                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------- | ----------: | ----------- | ------------------------------------------------------------------ |
| `route-night-character-select-bay.webp`       | Full-screen dark route-bay backdrop behind the roster/profile panels            |  1672 × 941 | Opaque WebP | `e820e3b1a874ffd9c815692cfb52abf83e576a4b598bdbffb951ef4c6dc5d635` |
| `route-night-character-select-energy.webp`    | Low-opacity screen-wide cyan/gold/violet route-energy layer                     | 1536 × 1024 | Alpha WebP  | `c624b1002d20e4e50a7a3efe9646dd29da220e60a0368028506d23b94a2ffe8c` |
| `route-night-character-select-hero-aura.webp` | Restrained selected-driver/profile aura behind the live driver and kart preview | 1122 × 1402 | Alpha WebP  | `7832f92cff9373e62f35d4ca00dc25786f0d636c1897a28afea3baacfa5a2857` |

The images were generated as original project atmosphere with the built-in OpenAI image-generation tool on 2026-09-19. The canonical Route Night reference was used only as a visual-language reference. The accepted images contain no characters, logos, copy, vehicles, commercial artwork, or copied layout. A separate editorial brush-strip candidate was rejected for visible edge fringing and is not shipped. Full generation and derivative provenance is recorded in `docs/ASSET-PROVENANCE.md`.

## Validation evidence

Local validation on this feature branch:

- focused Character Select, Route Night, and app-shell tests: **20 passed**;
- full CI test suite: **67 test files / 532 tests passed**;
- coverage: **81.20% statements / 75.93% branches / 86.39% functions / 82.91% lines**;
- strict TypeScript: passed;
- zero-warning ESLint: passed;
- branding validation: passed;
- runtime-asset validation: passed;
- production build: passed, with the repository's known nonblocking Vite large-chunk warning unchanged;
- `git diff --check`: passed;
- `git lfs fsck`: passed;
- targeted Prettier checks for all changed source, test, and provenance files: passed.

The canonical reference and all three accepted generated layers were inspected directly. The available cloud browser could not reach the local preview URL and returned `ERR_BLOCKED_BY_CLIENT`; no local browser-rendered acceptance is claimed. A hosted PR/deployment checkpoint must provide the desktop/mobile visual review before this increment can be considered live accepted.

## Acceptance gate and boundaries

After normal publication, the deployed review must verify Character Select at representative desktop and mobile sizes: roster density and readability, selected portrait/driver art, real rotating kart GLB preview and yaw, fallback behavior, route-board/panel hierarchy, focus-visible states, reduced motion, race handoff, and back-to-hub navigation. The deployed result must be compared directly with ADR-086 and the canonical Route Night reference.

This checkpoint does not authorize or include race HUD, mini-map, pause/results screens, race/engine/final-lap audio, post-processing, PBR/material changes, Circuit Alpha topology, racer statistics, item behavior/probability, AI tactics, avatar likeness changes, kart identity/geometry changes, Candidate B experiments, hosting changes, or later Slice 6 work. Stop at Manny's deployed Character Select visual-acceptance gate.
