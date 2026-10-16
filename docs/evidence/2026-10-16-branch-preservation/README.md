# Branch-preservation index — 2026-10-16

This index records one canonical delivery file and proposes durable references for six retained commits. It does not authorize tag creation, branch deletion, runtime or CI changes, or production integration.

## Neon Grid 5.3 delivery record

The canonical [delivery.json](../2026-10-03-neon-5-3-preview/delivery.json) is copied byte-for-byte from `preview/neon-grid-5-3-pages` at [source commit `f5381edfea08e4e1b7c8e887f867ef940c78b369`](https://github.com/Manaconda33/manacondas-minigame-mayhem/commit/f5381edfea08e4e1b7c8e887f867ef940c78b369). Its Git blob SHA is `cd08ddec665a76b3e0e8262bbb2146d386bf96a5`; the canonical file uses that same blob. Only this delivery record is preserved from the preview source.

## Proposed annotated archive tags

These names and exact target SHAs are proposals for a future, separately approved operation. No `archive/*` tags exist, and this index creates none.

| Proposed tag                              | Exact target SHA                           | Purpose and retention reason                                                                                                                                                                                                |
| ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `archive/neon-grid-far300-source`         | `ce6a64cf36b1f110af028536d3ff9c7a306ccbdb` | Preserve the exact Far300 runtime commit pinned by the current Pages workflow. It is outside the active Neon Grid development lines; the retained `review/neon-grid-far300-stopgap` branch currently points to this commit. |
| `archive/neon-grid-task8-diagnostics`     | `71880d187f273d9a868fa543bdb2a7e05b144898` | Retain the Task 8 paired-render diagnostic script and its reproducible investigation checkpoint on `diagnostic/task8-paired-perf`.                                                                                          |
| `archive/neon-grid-c0-c0-1-evidence`      | `48d4b474cf8c9ce590a7623c8e83b44ac0914ef8` | Preserve the separate C0.1 target-selection and visibility-review evidence on `docs/neon-grid-task-c0-1-visibility-review-20261015`; this records a review checkpoint, not production approval.                             |
| `archive/ci1b-runner-image-investigation` | `c4e6f54fffdf3c530196a21cb5d8c4880dae343a` | Retain CI-1B runner-image mismatch logs, root-cause work, and the adoption gate on `engineering/ci1b-runner-image-compatibility-20261014`; it does not approve workflow adoption.                                           |
| `archive/ci2-validation-benchmark`        | `59512851ef963fce7d1c553b1650b53d9d6e7a26` | Retain the CI-2 validation benchmark and its report/tests on `experiment/ci-validation-optimization-benchmark-20261014`; the experiment is not a CI rollout approval.                                                       |
| `archive/ai-handoff-b5-experiment`        | `c8b4ecf8522ae2bc7335260e3f87c827de7a978f` | Preserve the B5-B2 bounded-run authorization fixture on `experiment/b5-b2-unattended-work-001` as historical experiment evidence; it does not enable Stage C.                                                               |

## Reachability and approval boundaries

The current Pages workflow contains 24 unique pinned Neon Grid runtime SHAs. Rechecking against the active development heads found 23 pins ancestral to `design/neon-grid-circuit-02` and/or `fix/neon-grid-task-a-sponsor-visibility-20261014`. Far300 `ce6a64cf36b1f110af028536d3ff9c7a306ccbdb` is outside those lines and remains reachable through its exact retained review branch noted above. The active Task A/B/C1 line is still in progress and will need its own durable reference when it is eventually frozen.

Fog approval states remain distinct: B1 was owner-rejected and PR #292 closed unmerged; B2 is a separate candidate without independent owner approval; the later V3.2 playable review applies only to V3.2. None of these records grants production integration or G-05 physical-device certification.

GitHub currently reports only the default-branch protection ruleset; no tag-specific protection rule was found. Consider an owner-approved tag-protection rule before any future tag creation. No old evidence branches are copied into this index.
