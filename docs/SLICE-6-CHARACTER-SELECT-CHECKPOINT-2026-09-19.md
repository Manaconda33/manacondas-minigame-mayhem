# Slice 6 Route Night Character Select checkpoint

Date: 2026-09-19

Status: **BASELINE + COMPOSITION CORRECTION + FULL-BODY PACKAGE MERGED / DEPLOYED / LIVE ACCEPTED** — 2026-09-19

## Authority and bounded objective

This checkpoint implements the next bounded Slice 6 screen under ADR-090. The governing references are:

- `docs/PRD.md`, especially Sections 10.2 and 10.3;
- `docs/DECISIONS.md`, ADR-086 Route Night, ADR-087 settings/audio foundation, ADR-088 Circuit Alpha PBR baseline, ADR-090 Character Select, and ADR-091 selection-only full-body art;
- `docs/reference/route-night/ROUTE-NIGHT-CANONICAL-REFERENCE.png`;
- the live-accepted Circuit Alpha material baseline recorded by ADR-088; the live-accepted Character Select package recorded by ADR-090-092; and the next asset-direction decision recorded by ADR-093.

The increment is limited to Character Select, the shared preview seam required by that screen, and three bounded original atmospheric layers. Race HUD, mini-map, pause/results, production race audio, post-processing, gameplay, topology, and the accepted asphalt/PBR implementation remain outside the change.

## Implemented surface

- Replaces the earlier rounded Character Select scaffold with a responsive Route Night driver checkpoint: clipped graphite panels, cyan route/node/checkpoint grammar, gold selected/confirm states, violet energy, route-board density, focus-visible treatment, and reduced-motion fallback.
- Renders all twelve approved manifest entries as live roster controls with real portrait assets and the existing portrait fallback behavior.
- Renders the selected production driver front art, approved class label, approved kart name, and the six fixed manifest statistics in a stable presentation order.
- Renders the selected approved full-body `selectionArt` asset in a dedicated identity lane; roster portraits remain the card art and `driver/*.png` remains the race-facing frame package.
- Preserves the title → hub → Character Select → race handoff, selected-driver state, audio unlock, confirm action, and back-to-hub navigation.
- Adds `CharacterKartPreview`, an isolated Three.js UI preview that loads the selected manifest GLB through `GLTFLoader`, applies the governed `kartVisualYaw`, rotates slowly when motion is allowed, renders a static preview for reduced motion, and uses a procedural 3D fallback for missing GLBs plus a visible CSS fallback panel when WebGL is unavailable. It does not modify `KartTimeTrial` or gameplay kart loading.
- Keeps copy, layout, interaction, identity, and accessibility semantics in DOM/CSS/SVG. Generated image layers support atmosphere only and do not replace responsive controls or live text.

## Deployed review correction

The deployed review identified one bounded presentation defect: the selected 2D driver art and the kart preview occupied the same overlapping absolute stage, allowing the kart to obscure the driver's face at desktop and mobile sizes. The correction preserves the approved driver assets, kart GLBs, manifest yaw, fallback behavior, and Route Night identity while assigning the driver art and kart preview separate responsive visual lanes. Desktop uses adjacent identity and kart lanes; mobile stacks the identity lane before the kart lane so the face remains readable.

This correction is a DOM/CSS composition change. It is followed on this branch by the separately governed full-body selection-art package below; neither change alters roster identity records, kart geometry, gameplay authority, settings behavior, audio behavior, or PBR/material implementation.

## Approved full-body Character Select package

Manny approved twelve original full-body character illustrations on 2026-09-19: Lavi individually, then Manaconda/Accu/Kraken, Krios/Keeg/McFleurdel, Toph/Lula/Jennifer, and Dragon Queen/Alex. The assets are selection-only and are intentionally separate from the existing portraits, race driver frames, and kart previews.

| Profile | Character | Runtime selection asset |
| --- | --- | --- |
| AA-01 | Alex | `public/assets/characters/aa-01/selection/full-body.png` |
| AA-02 | Lavi | `public/assets/characters/aa-02/selection/full-body.png` |
| AA-03 | Lula | `public/assets/characters/aa-03/selection/full-body.png` |
| AA-04 | Keeg | `public/assets/characters/aa-04/selection/full-body.png` |
| AA-05 | Kraken | `public/assets/characters/aa-05/selection/full-body.png` |
| AA-06 | Dragon Queen | `public/assets/characters/aa-06/selection/full-body.png` |
| AA-07 | McFleurdel | `public/assets/characters/aa-07/selection/full-body.png` |
| AA-08 | Toph | `public/assets/characters/aa-08/selection/full-body.png` |
| AA-09 | Manaconda | `public/assets/characters/aa-09/selection/full-body.png` |
| AA-10 | Krios | `public/assets/characters/aa-10/selection/full-body.png` |
| AA-11 | Accu | `public/assets/characters/aa-11/selection/full-body.png` |
| AA-12 | Jennifer | `public/assets/characters/aa-12/selection/full-body.png` |

All files are 1024 × 1536 transparent sRGBA runtime delivery derivatives under the shared revision `character-select-full-body-20260919-4` and the narrow normal-Git classification approved by ADR-092. Original generation, deterministic alpha preparation, source identifiers, runtime hashes, character-specific boundaries, and approval evidence are recorded in `docs/assets/CHARACTER-SELECT-FULL-BODY-ASSET-BRIEF.md` and `docs/ASSET-PROVENANCE.md`. Toph's marked candidate was rejected before staging; Jennifer's image is alone; Dragon Queen remains a literal dragon with wings and tail.

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

- focused Character Select and manifest tests: **38 passed**;
- full CI test suite: **67 test files / 536 tests passed**;
- coverage: **81.20% statements / 75.89% branches / 86.39% functions / 82.91% lines**;
- strict TypeScript: passed;
- zero-warning ESLint: passed;
- branding validation: passed;
- runtime-asset validation: passed, including **117 decoded runtime character PNGs** and the twelve 1024 × 1536 selection assets;
- production build: passed, with the repository's known nonblocking Vite large-chunk warning unchanged;
- `git diff --check`: passed;
- `git lfs fsck`: passed;
- targeted Prettier check for the new asset brief and changed source/test/tool files: passed after the limited formatting cleanup in already-modified files.

The complete suite passes with strict typecheck, zero-warning lint, branding/runtime-asset verification, production build, and `git diff --check` passing. The repository-wide Prettier check still reports pre-existing formatting drift in unrelated historical files; no repository-wide rewrite was applied. The local cloud browser could not reach the workspace preview URL (`ERR_BLOCKED_BY_CLIENT`), so no local browser-rendered acceptance is claimed.

The canonical reference and all three accepted generated layers were inspected directly. The available cloud browser could not reach the local preview URL and returned `ERR_BLOCKED_BY_CLIENT`; no local browser-rendered acceptance is claimed. Direct Git push is also blocked by missing GitHub credentials in this workspace, and the connected GitHub app has no LFS-object upload operation. No pointer-only remote branch or non-reproducible Actions workaround was created. An authenticated Git/LFS handoff must publish the exact committed objects before the hosted PR/deployment checkpoint can provide the desktop/mobile visual review required for live acceptance.

## Live acceptance

- PR #187 merged at `7e8a9ea8901bef6ea4dd785780c4cc8295225ead`.
- Post-merge CI/Pages run `35422609359` passed.
- Manny completed the deployed Character Select visual-acceptance review on desktop and mobile against the approved Route Night design and all twelve approved roster assets: PASS.
- The review covered roster readability, selected full-body identity, driver/kart lane separation and face readability, actual kart preview/fallback behavior, route-board/panel hierarchy, focus-visible and reduced-motion behavior, and Title → Hub → Character Select → Race handoff.
- No defect was reported at the live acceptance checkpoint.

The Character Select acceptance gate is closed. Race HUD, mini-map, Results/Podium, final audio, post-processing, and other later Slice 6 work were not included in this checkpoint and require their own bounded plan and acceptance gate.
## Acceptance boundaries and closeout

The deployed Character Select review verified the following representative desktop and mobile acceptance conditions: roster density and readability, selected portrait/full-body identity art, face readability above the kart preview, real rotating kart GLB preview and yaw, fallback behavior, route-board/panel hierarchy, focus-visible states, reduced motion, race handoff, and back-to-hub navigation. The accepted deployed result was compared directly with ADR-086 and the canonical Route Night reference.

This checkpoint does not include race HUD, mini-map, pause/results screens, race/engine/final-lap audio, post-processing, PBR/material changes, Circuit Alpha topology, racer statistics, item behavior/probability, AI tactics, avatar likeness changes, kart identity/geometry changes, Candidate B experiments, hosting changes, or later Slice 6 work. The gate is closed; the next planned increment is separately defined by ADR-093 and the Race HUD / Results-Podium design brief.
