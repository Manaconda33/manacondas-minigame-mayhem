# Motion blur preview-only publication proposal — 2026-10-01

Status: **Prepared; Manny's preview-only merge/publication approval pending.**

Implementation review: PR #231, branch feature/slice6-motion-blur, pinned runtime `949fd77993b9859bc9ca68da5b8f3bc01bd846d6`. Its exact tree matches locally validated tree `acc05a478383680ff2b5ee7003e0c4e2ef9d6cb4`: typecheck, zero-warning lint, 98 files / 764 tests, approved asset gates, build, LFS fsck and diff checks passed. Source-bound software-WebGL pixel evidence and scope/limitations are in that branch's docs/evidence/2026-10-01-motion-blur/.

## Proposed infrastructure change

From accepted main `b07c5b1ba054f0d4af999b72caf59ee13568ca01`, change only the Pages workflow and continuity records:

- Keep the root production build on current main; do not merge PR #231.
- Preserve existing pinned Race Results and Archer previews.
- Check out only the named motion-blur commit with LFS, verify LFS, install from its unchanged lockfile, and build with base `/manacondas-minigame-mayhem/previews/motion-blur/`.
- Copy that separate build into the existing Pages artifact at previews/motion-blur.
- Use the existing protected-main Pages deployment, Node-24 Action chain and project Node 22. No hosting, environment/protection or dependency changes.

Intended URL after an approved merge and successful Pages deployment:
https://manaconda33.github.io/manacondas-minigame-mayhem/previews/motion-blur/

The URL is **not live yet**. Approval here authorizes public preview publication only. Product-owner new-effect acceptance and implementation merge/production-root publication remain separate gates.

## Verification before presenting the link

Pre-publication checks: implementation PR #231 CI run `36917312154` passed. The pinned implementation also built locally with the intended preview base; workflow YAML structure, the exact pinned ref, main-only publication conditions and diff checks passed. The preview publication steps themselves require the approved post-merge main run below.

1. Require this PR's CI success and inspect its diff for workflow/docs-only scope.
2. After Manny approves, merge this preview-infrastructure PR only.
3. Require post-merge main validation, all three pinned-preview builds, artifact assembly and Pages deployment success.
4. Fetch preview HTML/module/CSS, validate named assets and exact bytes against a build at this base. Preserve source/version and delivery evidence.
5. Provide the verified gameplay link. Normal settings compare Medium/High to Low/Off; testMotionBlur=0 provides same-quality bypass. testRacePerf=1 exposes actual-frame captures.

All prior gameplay, visual, Archer, audio, HUD/Results and acceptance checkpoints remain closed. Context-loss recovery remains waived. Full Slice 6 performance/browser/final release evidence is still open; this proposal claims none of those gates.
