# R2.17 — Formal v1.0 Public-Release Acceptance and Repository Closeout

**Decision date:** October 27, 2026  
**Applicable PRD gates:** §§36–39  
**Record status:** Owner decision approved; this documentation checkpoint awaits PR review and merge.

## Owner decision

**Question presented:** “Do you formally accept Manaconda's Minigame Mayhem v1.0, represented by the approved "MMM-v1.0.0-rc1" candidate, for public release under PRD §§38–39, including the previously approved exceptions and deferred scope?”

**Owner response:** The initial response contained a typing error and was explicitly corrected: **“I do, not idk 😂”**.

**Decision: FORMAL v1.0 PUBLIC-RELEASE ACCEPTANCE APPROVED.** The corrected response is affirmative. The earlier typo is not uncertainty, rejection, or an outstanding approval.

## Final acceptance status

| Gate or authorization | Status |
|---|---|
| Candidate designated under §38.1 | **YES** |
| Formal v1.0 public-release acceptance | **APPROVED** |
| Existing candidate validation evidence | **PASS**, as documented |
| Technical exceptions and deferred scope | **PRESERVED AND INCLUDED IN OWNER ACCEPTANCE** |
| Known implementation blockers in current release evidence | **NONE IDENTIFIED** |
| Original technical thresholds | **PRESERVED** |
| New deployment authorized by this decision | **NO** |
| GitHub Release or tag authorized by this decision | **NO** |
| Further gameplay testing required for acceptance | **NO** |

This record documents the already granted product-owner acceptance. Its integration into the repository is a separate documentation checkpoint and does not make the owner decision pending.

## Fixed accepted candidate

| Property | Approved value |
|---|---|
| Candidate | `MMM-v1.0.0-rc1` |
| Source commit | `6532290d4aac9611015b9eda5e78beca7b95a699` |
| Merged source PR | [#348](https://github.com/Manaconda33/manacondas-minigame-mayhem/pull/348) |
| GitHub Pages artifact | `12705570756` (`github-pages`) |
| Archive size | 211,507,778 bytes |
| Archive SHA-256 | `ab5f4c72f1f49d882906bbf24285c794de7a8e6f0d14e5d5e3bba6a6c1c25026` |
| Main CI/Pages run | [40437806862](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40437806862) |
| Trusted pinned-runtime run | [40437806842](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40437806842) |
| Exact production delivery | 417/417 files verified |

This is the exact artifact designated by the owner under §38.1 and accepted for v1.0. Later Pages runs are separate publication records and do not substitute for or rename this candidate. The original Actions archive follows GitHub retention and may expire; this ledger preserves its identity and evidence references without claiming immutable or permanent availability.

## Acceptance basis and preserved ledger

The acceptance relies on the completed [R2.15B §37 matrix and linked §§36/38/39 preconditions](../2026-10-26-r2-15-final-v1-acceptance/README.md), the fixed candidate designation above, its existing hosted validation/deployment evidence, established owner gameplay/desktop/mobile/visual/restart approvals, and the explicit v1 owner decisions recorded below. The §37 ledger remains unchanged: all 140 criteria retain their original wording, order, and historical checkbox state.

| §37 disposition | Rows |
|---|---:|
| VERIFIED COMPLETE | 114 |
| OWNER ACCEPTED / DOCUMENTATION OR METRIC INCOMPLETE | 15 |
| OWNER ACCEPTED BY EXCEPTION | 7 |
| UNMEASURED | 2 |
| GENUINE TESTING OR IMPLEMENTATION GAP | 0 |
| DEFERRED OR SUPERSEDED WITH DOCUMENTED BASIS | 2 |
| CONFLICTING DOCUMENTATION | 0 |
| **Total** | **140** |

No unchecked historical box is reclassified as a technical pass by this decision.

## Included exceptions, deferred scope, and unknowns

- **Amendment 2.30:** The 6 MB shell result remains PASS. The historical 45 MB first-playable comparison remains FAIL and non-blocking for v1; it is not changed to PASS.
- **Amendment 2.31:** Chrome and Edge WebGL2 remain the supported v1 browser baseline. Firefox and desktop Safari remain deferred and unmeasured.
- **Amendment 2.32:** G-05 remains OWNER ACCEPTED BY EXCEPTION. Recorded performance deviations and unavailable subsystem measurements remain; original targets are unchanged.
- **Amendment 2.33:** Backup/rollback remains OWNER ACCEPTED BY EXCEPTION, with the immediately preceding artifact, immutable retention, and byte-identical restoration limitations preserved.
- **Amendment 2.34:** PH-001, PF-004, PF-006, and PF-007 remain OWNER ACCEPTED BY EXCEPTION. Their technical evidence limits remain, including the absent continuous 30-minute full-game soak, non-universal draw-call samples, unmeasured aggregate particle budget, and unmeasured aggregate audio voices.
- **Other unmeasured targets:** PF-003 and PF-005 remain unmeasured. Approval does not establish missing GPU, CPU subsystem, particle, audio, heap, or physics-soak values.
- The 14-character ownership attestation, approved roster, eight-racer grid, approved two-track selection with Circuit Alpha default, and existing gameplay and presentation approvals remain in force.

These v1 release dispositions do not alter original thresholds, convert exceptions into technical PASS, or waive future engineering requirements.

## Later routine publication — separate from RC1

The R2.16 documentation-triggered main publication remains separately recorded:

| Property | Publication record |
|---|---|
| Source commit | `1a8a3da82c4f2eb415cd2315839386c1121bc466` |
| Main CI/Pages run | [40445840651](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40445840651) — success |
| Trusted pinned-runtime run | [40445840589](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/40445840589) — success |
| Pages artifact | `12708123670` (`github-pages`) |
| Archive size | 211,509,267 bytes |
| GitHub-reported artifact SHA-256 | `sha256:9d23a636b5ad4dca4d9ac7c7145682d28110b7e03e6769d9f3e84ffe3ce551a0` |
| Delivery-verification artifact | `12708856787` |

GitHub's current artifact metadata reports the digest above; it corrects a different value in the prior handoff. The verification artifact contains **417** production file records, each with HTTP 200, and **zero** paths under `previews/`. This confirms exact production delivery for that run. The previously approved retirement of 27 historical preview URLs remains documented; this record does not claim new HTTP 404 checks.

The routine publication does not replace the approved RC1 or change its fixed source/artifact identity. The Actions artifacts are subject to GitHub retention.

## Repository and release boundary

- Product-owner formal v1.0 acceptance: **COMPLETE**.
- Candidate designation: **COMPLETE**.
- R2.17 documentation integration: **pending review and merge of its PR**.
- New GitHub Release/tag: **NOT CREATED**.
- Additional deployment requested by this acceptance: **NO**.

No runtime, asset, test, CI, hosting, or acceptance-threshold change is included. No new gameplay, physics, performance, visual, or browser campaign is required for this acceptance. The final public-release decision has been made by the owner; the remaining action in this checkpoint is review and integration of this documentation record.
