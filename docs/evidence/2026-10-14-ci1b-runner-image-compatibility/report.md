# CI-1B runner environment investigation and adoption proposal

Date: 2026-10-14. Branch: `engineering/ci1b-runner-image-compatibility-20261014`.
Verified base: `54f422a5885865a8a418da79c2c96eb904426c93`.

## Verdict and scope

**PARTIAL engineering checkpoint; compatibility adoption BLOCKED.** The legacy fingerprint and exact artifact-name mismatch are reproducible. This branch adds a diagnostic command and regression coverage of the actual existing lookup/verifier, plus this design packet. It does **not** implement or approve a cross-image equivalence group, change evidence schema, remove ImageVersion, change workflow configuration, or claim CI-1B acceptance. Under the task's explicit design-only fallback, implementing compatibility stops until a defensible complete execution environment is available. No ADR or PRD approval is created.

PR #304 is merged at the base SHA. PR #305's public GitHub data now reports `state=CLOSED`; the fixture file is absent from main, and main remains at the PR #304 merge. The historical benchmark branch is preserved at `59512851ef963fce7d1c553b1650b53d9d6e7a26`; its documentation was not merged here. Git fetch/push is available through the existing HTTPS connection. GitHub CLI reports the injected GH_TOKEN invalid; Actions API/ruleset/PR writes and authenticated expanded logs cannot be used here. Ruleset 24865992 requiring only `validate` remains owner-reported rather than freshly API-verified.

## Root cause, evidence, and limits

`validationToolchainFingerprint` hashes `[nodeVersion, npmVersion, runnerImage].join('\0')` with SHA-256. `runnerImage` is `ImageOS/ImageVersion`, assembled in both the writer and restorer. Native execution of the production helper reproduces:

| Input (Node v22.23.3 / npm 10.9.9) | Exact fingerprint |
| --- | --- |
| ubuntu24/20261004.327.1 | `78b5fd1cb6fad7cb213ca27e0721e1c1357ebad96709566523c96a97dac7641c` |
| ubuntu24/20261012.334.1 | `02e97030c6713c011b2995e049482488a486bb1dcf7af3c1b63a967094c73687` |

The producer run is [38634108940](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/38634108940), successful attempt 1. Its artifact names contain these fingerprints. The owner supplied the expanded ImageVersion assignments below; the two supplied consumer text logs collapse the `Runner Image` section and omit its actual values. Public check pages confirm job outcomes, but authenticated expanded setup logs and producer manifests remain unavailable. Thus the arithmetic/key mismatch is independently verified; the ImageVersion-to-job assignments are explicitly owner-supplied evidence, not independently retrieved expanded logs.

| Runtime | Producer image | Consumer image | Exact key result | Observed outcome |
| --- | --- | --- | --- | --- |
| Billboard | 20261004.327.1 | 20261012.334.1 | Different | Miss; full fallback PASS, 126 files / 1001 tests |
| Far300 | 20261012.334.1 | 20261004.327.1 | Different | Miss; full fallback PASS, 122 files / 961 tests |
| Dive | 20261004.327.1 | 20261004.327.1 | Identical | Hit |
| Abyss Fog V3.2 | 20261004.327.1 | 20261004.327.1 | Identical | Hit |

`node tools/ci/diagnose-runner-image-evidence.mjs` prints all eight exact artifact names, source SHAs, versioned contract identity, and match decisions. Its output is retained in [root-cause.json](root-cause.json). It performs no network writes and grants no compatibility.

The restorer builds the name using its own exact toolchain, then queries Actions with `actions/artifacts?name=<exact-name>`. Different ImageVersion means a different final name component, so an artifact under the producer key is not returned. The generic no-matching-artifact message occurs before any download or manifest inspection. The actual lookup regression replicates this path through `findTrustedValidationArtifact`, not a substitute verifier. Relabeling the artifact is also rejected by `decideValidationReuse` because manifest toolchain/runner identities still differ.

After a candidate is found, the existing code validates the successful independent main push, exact workflow path, one matching successful job and all required steps, matching attempts, GitHub archive digest, one-file archive layout, and complete success manifest. It checks source/tree, contract/workflow, both lockfiles, LFS inventory, Node/npm/runner identity, commands, and manifest run/job provenance. Image mismatch alone is sufficient to explain both reported misses. No other rejection was reached for those missing names; additional manifest defects cannot be ruled out without authenticated artifact inspection. Missing artifacts, failed producer jobs, and authentication are not assigned as the cause of those two hosted misses.

## Hosted runner behavior and material dependencies

GitHub's [runner-images README](https://github.com/actions/runner-images/blob/main/README.md) documents weekly GA image updates and release rollout. `ubuntu-latest` selects an OS family, not an immutable filesystem image; even `ubuntu-24.04` does not select a dated build. A matrix can therefore receive differing images during rollout. Selecting a historical ImageVersion is not a supported deterministic selector for these standard runners.

Inputs requiring consideration include architecture, kernel, glibc/libstdc++, Git/Git LFS, Python and unzip, locale/timezone, Node/npm, optional native npm binaries such as Rollup, CPU/RAM scheduling and filesystem behavior. Node/npm and lockfiles alone do not prove equivalence. The current schema has no separate architecture or compatibility-policy field; the current standard x64 workflow and workflow hash constrain runner selection. A future environment declaration must explicitly bind OS/architecture and policy version instead of assuming them from an OS label. CPU/kernel differences can affect timing even inside a container; unknown capabilities, GPU dependencies, and privileged container execution must remain excluded.

## Comparison

| Criterion | Immutable validation container | Versioned runner compatibility policy |
| --- | --- | --- |
| Trust/security | Approved complete image digest, audited tool inventory and origin; no floating trusted tags | Exact finite approved groups with per-runtime equivalence evidence; no future image auto-acceptance |
| Reproducibility | Stable userspace/native libraries; host kernel and resources still vary | Native runner versions differ; inventory and behavioral equivalence require explicit assessment |
| Complexity | Complete image build, registry delivery, environment probes, workflow integration | Smaller code change but stronger ongoing qualification/provenance work |
| Startup overhead | Pull/extraction/probe cost; hosted cost not measured | Small policy lookup; hosted cost not measured |
| Reuse reliability | Stable digest across routine host userspace updates | Reliable only among verified allowlisted versions; unknown images intentionally miss |
| Maintenance | Governed image refresh, digest change, full revalidation; registry retention | Requalify each runner rollout; update policy/version/contract and regenerate evidence |
| Incompatible evidence risk | Reject unknown digest/OS/arch/tool versions or incomplete declaration; verify trusted workflow actually used the image | Unsafe if matching OS or pass counts are treated as equivalence; require qualified exact members |
| Reversibility | Protected revert PR restores exact-runner policy; regenerate old contract evidence | Protected revert PR restores exact-runner policy; regenerate old contract evidence |

### Option A experiment

Docker daemon 28.4.0 was reachable. Official Docker Library Node discovery resolved `node:22.23.3-bookworm` to immutable repository digest `node@sha256:0e5f906573693feaa1e21057ebdcfdb5bd5021f050b2dc7c9deceb629c7da2a8`. Actual execution by digest confirms Node v22.23.3 / npm 10.9.9, Debian 12/bookworm, amd64, Git 2.39.5, glibc 2.36-9+deb12u14, Python3 and unzip. **Git LFS is absent**, so this image cannot execute the complete existing contract or LFS checkout. Inspection is retained in [node-container-inspection.json](node-container-inspection.json); uncompressed image size is 1,138,457,074 bytes. The local startup/probe took about 4 seconds; that is not a hosted pull/validation benchmark.

A discovery pull of `mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm` found an image but failed layer delivery with `Forbidden` after Docker's bounded retries. It was not used or certified. No TLS verification was disabled. Using a tag for discovery does not make that tag a trusted validation identity. No complete, independently verified public image digest was established. Unpinned apt installation would defeat the proposed environment identity and is rejected.

**Recommended long-term design:** a dedicated immutable validation image derived from an approved Node digest, including exact Git LFS/Git/Python/unzip/native tools and system libraries. Record recipe, base and platform digest, package inventory, license/provenance, vulnerability assessment, and reproducible build evidence. Publish under an existing owner-approved authenticated registry process, retain its immutable digest, and qualify all four unchanged pinned-runtime contracts. This image lifecycle and registry publication are material engineering choices requiring owner approval before implementation. No image publication or permissions change is performed here.

Future evidence schema must bind a versioned environment declaration, exact platform image digest, accepted Node/npm versions, Linux distro/architecture, tool inventory, and probe identity. Host ImageVersion remains recorded for audit, while the approved container execution identity controls reuse. Accept only a trusted workflow whose fingerprint includes the digest and successful environment verification before validation/evidence creation. Reject missing/malformed declaration, wrong policy version/image/OS/arch/tools. Never accept a caller-supplied digest string as execution proof. Keep exact source/commands/locks/assets/run-attempt/artifact verification. Host kernel/resource risks must be evaluated before host image differences are made audit-only.

### Option B evaluation

There is successful full-validation evidence for Billboard on old/new images and Far300 on new/old images. There is no full new-image validation for Dive or Abyss in the supplied comparison. Native tool and system-library inventories for the two images are also unavailable. Equal file/test counts and Node/npm versions do not close these gaps. A global old/new group would silently expand approval beyond verified evidence. A per-runtime group could cover the two reported misses only after inventory/equivalence review, but would still miss if Dive/Abyss lands on the new image. Neither is a verified repeatable four-of-four solution today.

If pursued later, policy membership must be exact, finite, versioned and source-controlled, include runtime/contract qualification records, OS/arch/tool requirements, exact producer image and compatible consumer members, and immutable evidence links. Policy bytes belong in the contract fingerprint and artifact key. Each new member must pass all four complete existing contracts and native-tool review before owner approval; unknown versions, families, architectures and missing declarations fall back. Preserve the exact original producer environment in every manifest. Do not remove ImageVersion or normalize to ubuntu24 alone.

## Validation and acceptance

This checkpoint validates diagnosis and retention of the existing strict policy, not a new compatibility implementation. Tests use the production fingerprint, artifact lookup, manifest verifier, and archive-restoration code. Positive same-image lookup and the existing successful exact manifest remain covered. Four observed image assignments are simulated in unit tests using the actual lookup; this is not hosted cross-version acceptance. Negative cases include wrong source/tree, validation fingerprint, workflow identity, both lockfiles, LFS inventory, commands, Node/npm/runner identities, invalid/expired artifacts, wrong archive digest, unsuccessful/incomplete jobs/steps and run-attempt mismatch. The unchanged schema has no compatibility declaration or independent architecture field: those future-policy cases are expressly unimplemented, not claimed as passed.

Local and hosted results will be recorded in testing documentation after commands finish. New tools/tests and docs/TESTING.md alter the validation contract. The existing producer evidence must miss on this PR; that is required, not a performance failure. Workflows and the stable required check are unchanged. Authenticated draft-PR creation and hosted verification remain blocked by the existing invalid CLI token/API access limitation. Git pushes alone do not establish PR/Actions access.

## Proposed rollout and rollback (pending owner approval)

1. Owner selects/approves the complete execution-environment lifecycle; qualify and publish its immutable platform digest without changing production gameplay.
2. Implement the separately reviewed environment schema, writer/restore checks and bounded workflow integration. Add all positive/negative actual-verifier tests, including architecture, policy version and malformed declarations. Candidate PR must perform full validation on old-evidence misses, keep `validate`, and pass hosted checks. Container qualification must run unchanged source pins, commands, coverage and timeouts.
3. After explicit merge approval, the changed contract triggers the independent main-push producer. Require all four successful jobs, complete manifests, matching current contract/environment identity, archive digests and run-attempt provenance. No failed workflow artifact is eligible.
4. Only then create a **new** unmerged fixture outside the documentation fast path and validation fingerprint. Do not reopen PR #305. Require four hits, zero pinned full-validation-on-miss executions, successful `validate`, exact selected artifact/run/job/attempt identity, and no main-only deployment from the fixture.
5. Test negative controls changing one identity at a time, with simulated API/unit tests and safe isolated hosted diagnostics: every invalid/missing/expired/unavailable environment or artifact must execute the existing full validation path. Never introduce tampered evidence into the trusted producer store. Report simulated tests separately from actual hosted runs.
6. Measure complete PR wall time and summed job minutes against the documented 19m58s full fallback and 5m24s partial-hit fixture. Under five minutes remains a goal. Inspect container resource/timeout stability on real hosted runners; no two-worker CI-2 changes are included.
7. If any incompatible artifact is accepted or required validation is skipped, close the fixture without merging and submit a protected revert PR restoring exact runner identity. No force push, artifact deletion/overwrite, permissions change or test relaxation. Generate fresh evidence for the reverted contract; missing evidence continues full validation.

## Existing economics and approval gate

Historical producer 38634108940: 18m47s wall / 28.38 summed pinned-job minutes. Historical consumer 38638418993: 5m24s wall / 15.47 summed job minutes, with two hits. Four-hit cost and under-five-minute achievement remain unmeasured. Container pull/startup costs and policy savings are not projected as measured results. Producer scheduling, Pages artifact size, CI-2 concurrency and gameplay remain out of scope.

**STOP before merge or adoption.** Review this diagnostic/design packet. The next substantive owner decision is approval of a complete immutable validation-image lifecycle, or provision of sufficient independently verifiable per-image qualification evidence to justify a finite compatibility policy. Neither policy is currently enabled. CI-1B acceptance requires four real hosted hits after an approved implementation merge, plus preserved full fallback. Production workflows, required checks, deployment permissions, source pins, benchmarks and gameplay are unchanged.

## Verified local checkpoint results

Node v22.23.3 / npm 10.9.9. Clean `npm ci --cache /workspace/.npm-cache`, strict `npm run typecheck`, zero-warning `npm run lint`, focused coverage suite `npm run test:ci -- tests/ci-validation-optimization.test.ts --maxWorkers=1` (37/37 tests, 1.21s), full `npm run test:ci -- --maxWorkers=1` (105 files / 839 tests, command 114.791s), `npm run build` (8.374s), `git lfs fsck` and `git diff --check` all returned exit 0. Full-suite coverage: 88.66% statements, 80.16% branches, 89.82% functions, 90.88% lines. Asset validators passed; the existing >500 kB Vite advisory remains. Both workflow YAML files parse; native Node syntax checks and targeted formatting pass. Exact commands, exits and measured times are in [validation-results.json](validation-results.json), with raw full-suite/build/LFS outputs.

This diagnostic change adds five regression cases, taking the focused suite from 32 to 37 tests and the complete main suite from 834 to 839 tests; none were removed. Same-image positive lookup and strict negative manifest/archive tests pass. New compatibility-policy positives and architecture/policy-declaration negatives are **not implemented**, because no compatibility policy was approved or enabled. No hosted candidate run or cross-image container trial is claimed. The expected main and preserved benchmark remote SHAs were rechecked before commit.

Candidate validation contract: `21e3b78e90c48a9f44e8f6713186b195ead89bafa78674301375b669580e8405`, 188 tracked inputs. Trusted-producer workflow blob remains `171ca6863f409d15b0b4a1ab08d22d18f984dc1d`. This differs from historical producer `76e203…`, so existing evidence is ineligible. Record: [candidate-contract.json](candidate-contract.json).

Exact command stdout is preserved as JSON strings in [logs.json](logs.json), with SHA-256 identities. JSON escaping preserves the original trailing spaces and newlines without introducing whitespace errors in tracked evidence text.
