# Lunarcrystal isolated Pages preview publication

This preview-only branch is based on production main `47f32422545414e0f1a13daae9548aa63f94d1a6`. It changes only CI preview assembly and this record. Production source and all four existing previews are unchanged.

Published immutable integration source: `1051cd9c8c6b1ff7237dc605417b17869f4cea9b` on `review/lunarcrystal-integration`, tree `04140ee96c6363842bda9a2c43cc31ecd2218223`. This tree exactly matches locally checked `4c16efe`. The original prepared source `6ca7c48` was published through the connected API as `a4e8603`, with identical tree `85f1fb7886d9a1dc939b6ac84d1b80d3b9d8bc7a`, then received the owner-authorized delivery correction.

Manny explicitly authorized branch publication, both PRs, and merging/deploying only this preview PR. He then directed no LFS and the previously used direct-upload workflow. ADR-102 adds only three exact Lunarcrystal GLB path exceptions to normal Git. The original approved binaries were uploaded unchanged through the binary blob API. The failed bridge run `37018057458` did not upload any objects; its temporary workflow is removed.

Approved binary delivery inventory (all SHA-256s remain in the runtime approved-kart ledger):

| Path below public/assets/characters/lunarcrystal/ | Git blob SHA | Bytes |
| --- | --- | ---: |
| kart.glb | eb62321694e921c74df8625b8bb9a424df639a1a | 1159364 |
| lod/kart-lod1.glb | 5e6c843cb64b26d4e6b6ba0ae429549c79d5524c | 645032 |
| lod/kart-lod2.glb | 4043fb579096bef36c41892757768e14860a3328 | 328544 |

The remote created tree equals the complete local tree, including all fourteen unchanged approved PNG blob IDs. Local runtime build/asset gate and LFS fsck for remaining governed assets pass. Hosted exact-head CI is pending at branch-publication time; check its current state before merging.

Review path: `/manacondas-minigame-mayhem/previews/lunarcrystal/`. The workflow builds the immutable published integration and writes `review-build.json` with its source SHA. Main still builds production from its own source. Merge ONLY this preview-publication PR after CI passes. Verify post-merge Pages run, delivered marker, index/modules and all seventeen Lunarcrystal assets against the pinned build, plus unchanged production root. Stop for Manny's actual gameplay and chase/rear-camera review before production. Runtime PR and asset-only PR #237 must stay unmerged. No actual camera/device acceptance is inferred from local offline mounts.
