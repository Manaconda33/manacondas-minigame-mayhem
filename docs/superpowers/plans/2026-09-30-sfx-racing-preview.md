# Approved SFX racing preview integration

Manny approved the 96 SFX assets by listening on 2026-09-30, requested hearing them in the full racing environment, and approved implementation and a playable review preview. Integration is authorized; production publication/merge and in-game mix acceptance are not.

1. Add a base-aware asset catalog and bounded Howler playback bank. Master applies once through Howler; per-bus gains, rate/spatialization, pause/hidden-tab silence, no queued stale cues, failure fallback, teardown, and <=32 total voices are required. Cover these with injectable output tests.
2. Connect current gameplay events: player/two nearest AI engine layers, terrain/drift/boost/air/landing, actual collisions/recovery, countdown/lap/final-lap/finish/placement, committed item use and pickup/reveal, real projectile/hazard outcomes and warnings, and UI/actions. Suppress the replaced procedural cues while retaining the Prismatic music layer. Add actual production-path commit/rejection tests.
3. Copy the approved WAV bytes to revisioned public runtime paths through existing LFS objects; build must verify exact audio hashes/signatures. Preserve gameplay/control/layout behavior. Validate the full repo and independently review the final diff.
4. Publish an isolated review branch/PR and Pages preview at /previews/sfx-racing/. The preview workflow rebuilds the exact current production commit plus existing pinned Race Results preview, guards that main has not changed, and adds the new audio review subtree. It does not merge runtime changes into main. Record runtime/preview commits and CI/Pages evidence; obtain Manny's in-game listening review before any production publication.

## Progress

- Context: isolated clone from asset PR #207 head eb2ef32; main f4fc103, last CI/Pages passed. Direct authenticated Git/LFS available again.
- Assets: all 96 local WAVs materialized; asset listening approved, prior standalone source package contains no in-game acceptance.

- Runtime integration and exact-hash public copies implemented. Independent review identified deferred Howler playback, hidden UI/Prismatic audio, and snapshot-only item activation gaps; corrected them with regression tests, including mismatched Howler/native context states.
- Local `npm run validate` passed: 78 files / 621 tests, typecheck, zero-warning lint, 96 exact WAV/hash checks, branding/runtime checks and build. Coverage 81.55% statements / 75.74% branches / 85.60% functions / 83.42% lines. `git diff --check` and `git lfs fsck` passed. Existing large bundle warning remains.
- Isolated review Pages workflow preserves pinned main/Results builds and checks main before assembly/deploy; avoid concurrent main publication during this checkpoint. Hosted/public verification and Manny's perceptual acceptance remain pending.

- Hosted CI 36717679327 passed at runtime commit 970d897. Pages run 36717675616 passed preview validation/pinned assembly, but environment protection rejected the branch before deployment. Removed blocked branch workflow and selected a separate owner-private listening host for the exact runtime build. Main/production unchanged; protection is retained. Private-host publication evidence will be recorded in PR #208.

- Private listening deployment succeeded: https://manaconda-sfx-listening-review.manaconda2433.chatgpt.site, snapshot b9c87fa from runtime 970d897. Approval handoff ready; no perceptual/device acceptance claimed. Runtime PR CI passed; documentation checkpoint CI remains to verify. Main/production unchanged.

- Manny approved the full racing sound experience on 2026-09-30. In-game listening checkpoint PASSED BY PRODUCT-OWNER REVIEW at runtime 970d897 (runtime-identical head 2fba07f; CI 36718861105 passed). Production merge/publication remains separately pending. Ready for concrete approval to merge PR #208 (including asset PR #207) and verify the existing main CI/Pages deployment.
