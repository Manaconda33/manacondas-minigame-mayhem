# Character Select full-body asset brief

## Status

**APPROVED ASSET PACKAGE / FEATURE-BRANCH INTEGRATION; DEPLOYED VISUAL ACCEPTANCE PENDING** — 2026-09-19.

This package adds one selection-only full-body image for each active racer. Manny approved Lavi individually, then approved the remaining assets in four review batches: Manaconda/Accu/Kraken, Krios/Keeg/McFleurdel, Toph/Lula/Jennifer, and Dragon Queen/Alex. The package is intended to elevate the Route Night Character Select identity lane while preserving the existing race-facing art contract.

## Runtime contract

- Runtime root: `public/assets/characters/aa-##/selection/full-body.png`.
- Format: 1024 × 1536 sRGBA PNG with genuine transparent background pixels; the approved runtime delivery files are normal-Git derivatives through `.gitattributes` under ADR-092. Any future generated/source masters remain outside this delivery path and governed by LFS.
- URL revision: `character-select-full-body-20260919-4`, resolved through the manifest and Vite's base URL.
- Use: selected Character Select hero art only. Existing `portrait.png`, `driver/*.png`, kart GLBs, race cameras, and PBR/material assets remain unchanged.
- Identity: live DOM remains authoritative for names, classes, statistics, controls, and interaction. The art contains no UI copy, logos, scenery, karts, or interaction state.
- Route Night fit: original character illustration with a restrained indigo/cyan/magenta/gold rim-light treatment that sits inside the existing live UI lane.

## Approved source-to-runtime mapping

The source identifiers below are built-in image-generation output names recorded from the approval session. They are provenance references, not runtime dependencies. The production SHA-256 values are the bytes staged in this branch.

| Profile | Character    | Generated source output                         | Source SHA-256                                                     | Runtime asset                                            | Runtime SHA-256                                                    |
| ------- | ------------ | ----------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------ |
| AA-01   | Alex         | `exec-d4dd7328-fdb7-4bb2-a312-c5db5e75b653.png` | `d1d72c215d19da0fd08df545cf1976768fdac83af32741716f6a64872491d38e` | `public/assets/characters/aa-01/selection/full-body.png` | `4df8d0c3a509ff78086bf6ef332ce0ac9846b83f1f6445f97d9341545cff0316` |
| AA-02   | Lavi         | `exec-457db177-dd2f-4c0a-8489-cf975238b070.png` | `8b608dfb16984f8d28829752263cc9a4d8eb99c7e95c93f23899922d87b3628c` | `public/assets/characters/aa-02/selection/full-body.png` | `ec15809c3493cccfcb0b16905ac9769eefb0818868239d61703350721459b53c` |
| AA-03   | Lula         | `exec-b69cef83-6c0e-4d3b-99d9-42d1da2a29ba.png` | `3a6385adf99b8ffeb4e2093c4589fbbc72eb8c877a6a85c6fedcc0f41948cdc9` | `public/assets/characters/aa-03/selection/full-body.png` | `a0636fd124274aea8e3af4b985a91b17aafecf71623bebc5a761e3048b7b5239` |
| AA-04   | Keeg         | `exec-6864dd47-e9f7-4f02-b5a4-6509159b937c.png` | `1ded543758da4b1babbbcb312e4ee4eb2b6485e077ca59e2e3460be92fc01dcb` | `public/assets/characters/aa-04/selection/full-body.png` | `4edbf3029403434ff5a5b0c916cc407001bbdfc57e25a1fdc9afcffd35a4bcc7` |
| AA-05   | Kraken       | `exec-02e4d2ea-8197-4ba9-ae89-df6f7e658b93.png` | `dacb105b17e07c21110508447448d2b6cdb8b8d2d0648c2150e0dd0315a96d69` | `public/assets/characters/aa-05/selection/full-body.png` | `f74fce0220acc173cd14f34cf9275218f2295bd02ef2e9533747423e01860f5b` |
| AA-06   | Dragon Queen | `exec-bd4b4448-ec1b-4652-979d-a1229f4e1f75.png` | `b23aae54ed3c3acd09109d770f722f3dbe7dd0d30c3433ff6d03ba66e4721c06` | `public/assets/characters/aa-06/selection/full-body.png` | `9cbbc3f429d1a2243a6d7082e1cac44c8b6cc87d38c91f583f20891544b10732` |
| AA-07   | McFleurdel   | `exec-75d4e37f-76b3-4c15-9993-bb0022558db0.png` | `f184c073f068e021df9301ffc70dbdae3bc2e5fed5fa91f97fea4ecca7c5b7e0` | `public/assets/characters/aa-07/selection/full-body.png` | `1450dc8c4d2df6d4e46b45768a55d97810d6504d039bc1b141eebb3137a3ece9` |
| AA-08   | Toph         | `exec-88a2b95c-4449-4006-910f-a31485b1b237.png` | `cf3f189b44e484d3daca0d9a1a4e819f0ef86a6d79680ffa0295d865a9f3612a` | `public/assets/characters/aa-08/selection/full-body.png` | `f424600c72af0fc3c7387088790466b63a6d978abf7832476334f65a422c9714` |
| AA-09   | Manaconda    | `exec-9ea999f1-46d2-4e7d-9892-fdc5d54931cc.png` | `6680b7c08a5ff487bfb9b9493b6d5b9fcfaa159fe00995fd82aefba902b852c9` | `public/assets/characters/aa-09/selection/full-body.png` | `533bf8cfa16f89dbd2dfd51abc8102edf855048ec8b59ca7877ad0fff990c077` |
| AA-10   | Krios        | `exec-6cf389dd-fc91-4cb9-a7d2-03a0effde685.png` | `296238f964885c6d457f6dde29452f6ebf3594f14645fd22ded7d2ab070c05af` | `public/assets/characters/aa-10/selection/full-body.png` | `5eca274a95bfefc134798e30d99dc20d3e9df1eaeb0c7c76bc09c7db881c89ba` |
| AA-11   | Accu         | `exec-d92e57d8-a3ad-4081-a98a-00d459c37eee.png` | `15c5042da06df549f736c52e50237a5279447a492f42d00afb898d448e67ab33` | `public/assets/characters/aa-11/selection/full-body.png` | `51fc2a28abee94bc3715dcfb5bb95ae964007e5e014c0a557eea67dab7a2798e` |
| AA-12   | Jennifer     | `exec-4a119c1b-3981-49bb-bc3c-88a5c67fdc3b.png` | `2636cf3f05c26ac01c961af7ce6c898f350c69bb71e06e1d6c61081dc8faba01` | `public/assets/characters/aa-12/selection/full-body.png` | `c20b761581e450f9b7b792c2cc905306fc577cc33d6aa1ff1e8c0b805a48782d` |

## Preparation and review

The approved source renders were generated as original character illustrations from the locked roster records and Route Night visual language. Their flat chroma backgrounds were removed with the deterministic scratch helper `prepare_chroma_selection.py`, including edge-connected spill and enclosed background islands, then saved as transparent sRGBA PNGs. The helper is not part of the runtime bundle.

Toph's first candidate contained a recognizable athletic-brand-like shoe mark and was not used. The edited source `exec-88a2b95c-4449-4006-910f-a31485b1b237.png` removed that mark before alpha preparation. Jennifer's selection art is intentionally alone; her Newfoundland remains a racer-package companion outside this selection-only image. Dragon Queen remains a literal dragon with wings and tail rather than a human-bodied interpretation.

Each batch was reviewed directly in the conversation against the approved roster identity and the Route Night reference before being staged. This package does not copy canonical Route Night pixels, commercial artwork, logos, exact typography, or layout.

## Validation and boundary

- `src/characters/manifest.ts` exposes `selectionArt` separately from `driver` and requires it for every active production character.
- `src/ui/characterSelect.ts` uses `selectionArt` for the selected profile while preserving `data-selected-driver-art` compatibility and all race-facing driver frames.
- Focused tests verify all twelve mappings and the selected-profile source separation.
- `tools/verify-runtime-assets.mjs` verifies all twelve PNG signatures, dimensions, RGBA channels, and transparent corners.
- No kart, race HUD, stats, item, AI, topology, PBR/material, or hosting behavior is changed by this package.
- Publication requires the normal PR/hosted-CI/Pages workflow. Final status remains pending until Manny reviews the deployed Character Select screen at representative desktop and mobile sizes and confirms face readability, full-body presentation, and separation from the kart preview.
