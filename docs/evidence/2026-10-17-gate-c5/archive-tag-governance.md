# Six proposed annotated archive tags — review only

No tag creation, movement, deletion or ruleset change is authorized. All six supporting branches remain retained. The [original index](../2026-10-16-branch-preservation/README.md) remains canonical.

| Proposed annotated tag | Exact target SHA | Supporting branch | Retention purpose | Necessity before source retirement |
|---|---|---|---|---|
| `archive/neon-grid-far300-source` | `ce6a64cf36b1f110af028536d3ff9c7a306ccbdb` | `review/neon-grid-far300-stopgap` | Exact current pinned runtime outside active lines; also covers ancestral Task8 implementation. | Exact-target durable reference or explicitly approved equivalent required before supporting-source retirement. |
| `archive/neon-grid-task8-diagnostics` | `71880d187f273d9a868fa543bdb2a7e05b144898` | `diagnostic/task8-paired-perf` | Diagnostic script/reproducibility checkpoint; separate Actions category-matrix retention required. | Exact-target durable reference or explicitly approved equivalent required before supporting-source retirement. |
| `archive/neon-grid-c0-c0-1-evidence` | `48d4b474cf8c9ce590a7623c8e83b44ac0914ef8` | `docs/neon-grid-task-c0-1-visibility-review-20261015` | C0/C0.1 selection and visibility review, including the ancestral vent-target checkpoint. | Exact-target durable reference or explicitly approved equivalent required before supporting-source retirement. |
| `archive/ci1b-runner-image-investigation` | `c4e6f54fffdf3c530196a21cb5d8c4880dae343a` | `engineering/ci1b-runner-image-compatibility-20261014` | Mismatch diagnosis, utilities, regression evidence and PARTIAL/BLOCKED adoption boundary. | Exact-target durable reference or explicitly approved equivalent required before supporting-source retirement. |
| `archive/ci2-validation-benchmark` | `59512851ef963fce7d1c553b1650b53d9d6e7a26` | `experiment/ci-validation-optimization-benchmark-20261014` | Local benchmark measurements/report; not merged production CI adoption. | Exact-target durable reference or explicitly approved equivalent required before supporting-source retirement. |
| `archive/ai-handoff-b5-experiment` | `c8b4ecf8522ae2bc7335260e3f87c827de7a978f` | `experiment/b5-b2-unattended-work-001` | Authorization fixture plus ancestral B1/A2 records; not proof of unattended execution. | Exact-target durable reference or explicitly approved equivalent required before supporting-source retirement. |

## Required verification

Resolve each exact existing commit; verify its tree/history and required LFS payload availability. Preserve external Actions content separately. Recheck current pins and supporting refs. For any subsequently approved annotated tag, verify the tag object and peeled commit independently against the exact proposal; retain object IDs and owner approval.

Only default-branch protection is currently reported. No tag-specific rule was found. A tag preserves neither Actions artifacts nor remote LFS payloads by itself.

## Proposed protection policy — pending Manny approval

Prefer a repository tag ruleset covering `refs/tags/archive/*`: restrict creation to an explicitly designated owner-approved actor; prohibit updates/deletions; narrowly assign and audit any bypass. Verify repository-plan and GitHub capabilities before implementation. Consider protection before tag creation. No rule or bypass is changed here.

Keep all six source branches until replacement references and external evidence/LFS gates pass. One B5 target covers B1/A2; C0.1 covers C0; Far300 covers earlier Task8 source. Do not create redundant tags. Far300 stays RETAIN while it is the necessary runtime reference. No archive operation grants CI, automation, product or production approval.
