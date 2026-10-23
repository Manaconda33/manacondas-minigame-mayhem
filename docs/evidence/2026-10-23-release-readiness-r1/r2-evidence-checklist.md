# Release Readiness R2 — minimum evidence checklist

**Status:** Planned only; not run. This checklist does not authorize runtime edits, deployment, preview removal, CI-policy changes, optimization, PR closure, or release sign-off.

**Baseline reference:** production `main` was `d0b9acf889d669832c97a9187886d9e6289c9abe` on 2026-10-23. Its successful main CI/Pages run [39711768852](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/39711768852) is build/deployment evidence, not a representative-hardware capture. Recheck the exact source and deployed marker when R2 begins.

## 1. G-05 and §2.6 performance evidence — required

Use one source-pinned, instrumented representative desktop session of the current approved production build. The minimum gameplay sample is one ordinary three-lap race on the production default Circuit Alpha with one player and seven AI racers. This supplies normal race load without repeating the already accepted gameplay scenarios. Run Medium quality at a real **1920×1080 drawing buffer** on representative desktop hardware; use WebGL2. Record the exact main/deployed commit, Pages run, browser/version, OS, CPU/GPU/model/driver and memory, display mode, device-pixel ratio, actual drawing-buffer dimensions, quality setting, roster/racer count, start/end and any interruptions. Capture the complete active-race frame trace after the countdown through Results; exclude loading/menu time and state the scored interval.

The prior 59.9 FPS mobile summary is not a failed desktop G-05 sample and is not used for pass/fail. Report the current desktop run's existing G-05 outcomes exactly:

- Median frame rate **≥60 FPS**.
- 95th-percentile frame time **≤18.3 ms**.
- No sustained sequence of three consecutive frames above **50 ms**.

Measure and report the unchanged §2.6 system budgets from the same trace: rendering submission CPU **≤5.5 ms**, physics **≤2.5 ms**, AI/race **≤1.5 ms**, item/VFX **≤1.0 ms**, HUD/UI **≤1.0 ms**, audio/update **≤0.5 ms**, amortized GC **≤0.5 ms**, CPU headroom **≥4.17 ms**, GPU frame **≤12 ms preferred**, and total frame **≤16.67 ms target**. Record current scene measurements against the existing caps/targets: **500** global race-scene calls (hard cap), **750,000** global visible triangles (target/cap), **12** dynamic shadow casters, **2,500** gameplay particles, **40** active physics projectiles, **32** audio voices, **250 MB** JS heap after race load (target), and approximately **256 MB** Medium GPU texture residency (target). Task 9's **425,000** engineering-triangle ceiling remains task-scoped and is not substituted for the global 750,000 limit. Use the existing automated checks to verify current scene caps for both selectable tracks; if a current track is not covered by those checks, capture its scene counters at initialization rather than requiring a second full owner playthrough.

A G-05 pass requires the stated FPS/frame-time results from representative hardware; CI, SwiftShader, a viewport screenshot, or historical mobile results cannot substitute. Do not require multiple races, thermal soak, or renewed subjective owner acceptance. If existing instrumentation cannot expose any required §2.6 budget category, record it as unmeasured and propose only the smallest observability change for separate review; do not imply full §2.6 evidence or begin optimization.

## 2. Browser and WebGL2 compatibility — required

For the PRD §36.5 baseline, record latest stable Chrome, Edge, Firefox, and current desktop Safari where its WebGL2 capabilities meet baseline. Use a focused smoke: cold load to Title/Hub, select each available track, start a race, and confirm the rendered game scene initializes on WebGL2. Do not replay full races in each browser. For at least one compatible environment, explicitly verify WebGL2 gameplay with WebGPU unavailable or disabled. Record browser/OS versions, WebGL2 context result, WebGPU availability/disabled state, console/network failures, track tested, and result. An environment that cannot provide required WebGL2 capabilities is reported as unsupported, not silently counted as a pass.

## 3. First-playable network size — required

With a cold browser cache and a fresh session, capture compressed response bytes from first request until the title is interactive, then the additional bytes through the first controllable Kart Racer session. Report the shell and first-playable package separately against PRD §2.6: shell **≤6 MB compressed before Title** and first-playable Kart Racer content **≤45 MB compressed**; secondary avatar/kart assets may remain lazy-loaded. Save the request/resource manifest, content-encoding and byte-count method, cache/service-worker state, source marker, and totals. Also report the separately loaded Neon Grid delta so it is not concealed inside or confused with the Circuit Alpha default measurement. The Pages assembly ZIP size is not a player transfer-size measurement.

## 4. Immutable rollback retention — required before release closure

Identify the previous successful production bundle and verify that an immutable copy remains available in an owner-approved durable location beyond the current one-day Actions artifact retention. Record its source commit, Pages run/deployment, artifact identity/location, manifest/checksum, retention/availability check, and the documented restore procedure. Verify the previous bundle can be retrieved and validated without deploying it. A source commit that can theoretically be rebuilt is not by itself evidence that the previous bundle is retained. Do not perform a rollback or production publication in R2.

## 5. Pages packaging risk — required maintenance assessment; no preview removals

The successful main run [39711768852](https://github.com/Manaconda33/manacondas-minigame-mayhem/actions/runs/39711768852) assembled a **5,155,286,547-byte** Pages artifact and emitted the upload action's >1 GB warning; deployment still succeeded and verified **2,655/2,655** expected paths. Treat this as a packaging reliability risk, not a failed deployment or proof of a player download exceeding the PRD target.

Inventory artifact bytes by production root, pinned preview, and shared asset; identify duplicate bytes and build sources. Any later packaging proposal must preserve every existing published preview URL, source marker, expected byte/hash check, and delivery contract. Provide before/after path and hash manifests, total size, and successful preservation verification. Do not remove a preview, alter a workflow, or publish a packaging change without separate owner approval.

## Preserved acceptance and non-gates

Manny's prior desktop/mobile gameplay approvals and five-race-restart manual acceptance remain valid. Do not repeat those approvals because numeric details were not captured. The numerical heap target after race load belongs to §2.6 and should be recorded in the G-05 session where available; a numeric five-restart heap-delta series is supplementary, not a renewed acceptance gate. Additional CPU/GPU sub-system profiling is required only to the extent it measures an explicit §2.6 budget; deeper thermal, cross-device, and multi-run diagnostics are supplementary unless a measured failure motivates them.

Keep the accepted Neon Grid appearance, all gameplay, Circuit Alpha default, current renderer limits, CI acceptance criteria, and published previews unchanged. Do not run speculative optimization. If a required target fails, report the exact trace and propose a separately reviewed, visually neutral response before implementation.

## 6. Final PRD acceptance closure ledger — pending R2

PRD §37 is the original acceptance checklist. Preserve its wording and existing checkbox state; this documentation checkpoint does not mark those boxes, revise criteria, or treat prior partial approvals as blanket v1 completion. The checklist records the acceptance requirements, while the following item-by-item closure matrix will establish their final evidence status.

During R2, prepare one dated matrix covering every applicable §37 item and any explicitly applicable release criterion referenced by it. For each item, record the PRD reference and unchanged criterion, disposition (verified complete; owner-tested/accepted with documentation or metric incomplete; genuine testing/implementation gap; deferred/superseded; or conflicting documentation), exact evidence link plus commit/run/build and date where applicable, and the prior owner-acceptance record if one exists. State the smallest missing evidence for each pending item. Reuse valid owner approvals without asking Manny to repeat accepted gameplay or broad visual testing. Keep explicit numeric PRD gates separate from supplementary diagnostics. Mark an item not applicable or superseded only with its documented basis.

Formal v1 closure remains pending until this matrix reconciles all applicable checklist items and any genuine required gap is closed or governed by an explicit owner decision. This is an evidence reconciliation procedure; it does not add, remove, or weaken acceptance requirements.
