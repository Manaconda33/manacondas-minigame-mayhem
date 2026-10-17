# Gate C5-B durable preservation checkpoint — 2026-10-17

**DRAFT / REVIEW ONLY. NO RETIREMENT AUTHORIZED.**

This directory checkpoints C5-A's verified 176 historical refs. It authorizes no deletion, tag/ruleset change, runtime/asset/PRD change, CI change, deployment, PR #242 modification or Stage C activation.

## Canonical source record

- [Inventory](inventory.tsv), SHA256 `80dc93b57b082d387b07fe6010e2ee31103e5a1ae1b0c061a9202d96e960c462`.
- [Complete manifest](unified-c5-manifest.json), SHA256 `3f20804af31cd165ea74d4d54a67ca71d28eda278dc91aab3097127daac49ed2`.
- [Classification list](classification.tsv), [14 exceptions](exceptions.json), [source-pin graph](source-pin-graph.json) and original [preservation dependencies](preservation-dependencies.json).
- [Retirement sequence](retirement-sequence.json): **NOT AUTHORIZED**; each group has `execution_authorized: false`.
- [Methodology and losslessly preserved original generation script](methodology/README.md).
- [Separate C5-B status](checkpoint-status.json).

All source copies retain their original hashes in [SOURCE-SHA256SUMS](SOURCE-SHA256SUMS). [SHA256SUMS](SHA256SUMS) covers the complete checkpoint except itself. Run `python3 verify_checkpoint.py` here.

Original counts stay **162 READY AFTER FINAL GATES; 6 PRESERVE FIRST; 4 RETAIN; 4 OWNER DECISION; 0 INVESTIGATE**. Staging evidence in a draft does not change these classifications.

## Live baseline

[Verification record](baseline-verification.json): main `e63a692b79846aedcc49d47b35dee60f4d379a03`; Task A/B/C1 `91393418c9b219fb5689c2041fb98325aa1e7b41`; PR #242 open/draft/unmerged at `6919729ba5e12f48305f543dca153f4ba9c5ae19`; Stage C `PREPARED_DISABLED`; required check `validate`. All 176 refs and 14 exception heads matched C5-A before this branch was created. Recent main CI and trusted-validation runs succeeded.

The new preservation branch is an intentional extra ref outside the frozen snapshot. Subsequent reconciliation must account for it separately.

## Actions evidence

[Artifact index](actions/artifact-index.json) covers 13 small artifacts: four required producer manifests from run 38634108940, Task8 artifact 11424851717/run 37489101962, and eight additional manifests from runs 38580406017 and 38930365120.

**All 13 actual JSON files are included byte-for-byte:** 12 producer manifests and the Task8 category matrix. Each accessed ZIP matched GitHub's archive SHA256; every extracted file has an independently calculated content SHA256 and Git blob identity. Four existing user-provided ZIPs and nine connector/native-transfer downloads were verified. Raw ZIPs are not duplicated.

**No requested artifact content remains missing.** Direct storage URLs were denied by workspace network policy; the supported native Sediment file-transfer route retrieved the connector's downloaded archive references without a policy change. Required CI-1B artifacts expire November 13, 2026; Task8 expires January 4, 2027; all expirations are indexed. Git copies no longer rely on those artifact retention dates. Task8's ZIP is 1,395 bytes; its actual uncompressed JSON is 6,211 bytes, SHA256 `02d4bdbe3f9fa28e8cee9338f8e44015ae846661dfa1de800d71f3cee96cd468`. Earlier descriptions of a 1,395-byte JSON report confused archive size with content size. The result is software-WebGL evidence, not G-05.

Historical producer attempts and environment identities remain distinct. Mixed-attempt run 38580406017 is not a coherent current reuse set. No preservation grants cross-image reuse, CI-1B adoption, CI-2 rollout, production approval or current validation eligibility. An archive digest is not an uncompressed-content digest; tags do not preserve Actions artifacts.

## Results and tag governance

The [Results record](results/README.md) preserves the exact two-file evidence delta from closed-unmerged PR #194 and records its reconstructed blob identities. It preserves deployment evidence, not visual acceptance. Missing historical served-body hashes are not invented.

[Six-tag governance](archive-tag-governance.md) records exact targets/source branches, required checks and a proposed protection policy. **No tag or ruleset was created or modified.** All six source branches remain retained.

## Holds and boundaries

Keep untouched: `experiment/balance-candidate-b`, `experiment/candidate-b-soft-pack`, `experiment/candidate-b-ai-execution` and `experiment/neon-grid-abyss-fog-001`. Product rejection does not release historical-retention holds.

Also retain main, PR #242's development branch, active Task A/B/C1, Far300's source branch, all six supporting sources and every open PR head. All 14 exceptions remain applicable. Final remote LFS availability is unverified.

Stage B installation, Stage C preparation and activation remain distinct. B5 is authorization evidence, not successful unattended execution. Preview delivery/visual approval does not close G-05 or authorize PR #242 production integration.

## Review gate

Review this evidence-only draft. Review the 13 verified artifact contents and Results record, separately approve any archive governance operations, and verify final LFS/evidence availability. After separately authorized merge, reconcile preservation completion against the frozen C5-A exceptions. Eventual deletion still requires exact-head/dependency checks and Manny's explicit bounded authorization.
