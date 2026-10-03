# Neon Grid mobile owner feedback — 2026-10-03

## Review outcome

Manny reports that stuttering is **still occurring** on the corrected Neon Grid preview. Smooth main-route driving acceptance is **FAIL / UNRESOLVED**, superseding the previous owner-retest-pending status. This is feedback documentation only; no corrective investigation or implementation was authorized in this turn.

Reviewed preview: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid/?review=6edd4fc

Pinned runtime: `6edd4fcaeeb1898bc842175976c678f0b6214b90`. Prior delivery-record checkpoint: `32c9d447a2e6709617f9d0dcd3a6fa2ba09e04e7`.

## Owner observations and hypothesis

- The driving stutter persists after the projection-cost, collision-authority and minimap repairs.
- Items and their effects look smooth during the same gameplay experience.
- Manny believes this is not a performance issue and suspects how the kart interacts with the track.

The smooth item/effect observation and track/kart-interaction hypothesis are owner feedback, not a measured frame-time result or a proven root cause. The desktop CPU improvements remain valid benchmark evidence but did not resolve the observed mobile driving problem. Do not present passing tests or lower CPU cost as smooth-driving acceptance.

No specific track location, speed, wall-contact condition, device/quality setting, portrait/landscape distinction, or new minimap acceptance was supplied in this feedback. Do not invent those details or infer that the minimap/camera passed from this report.

## Next-session handoff

Start from GitHub and follow AGENTS.md repository catch-up. Read this note alongside `rough-driving-diagnosis.md`, the repair README/raw comparisons, the Neon spec/build contract/layout references and the implementation plan. Prioritize reproducing and diagnosing the kart/track interaction in light of the smooth item/effect observation; retain separate evidence for simulation cost versus discontinuous kart motion/contact response. Do not assume that the remaining defect is solved by further performance optimization or that the suspected interaction is already proven.

Manny explicitly requested documentation only: do not start correcting this in the current session. No runtime, physics, controls, camera, assets, tests, workflow pin or deployment changes were made for this feedback. Runtime PR #242 must remain draft/unmerged; no production release is authorized. Accepted Circuit Alpha behavior remains the preservation contract. Tokens remain omitted, scenery placeholder, and shortcuts/waterfall Dive remain paused until smooth main-route driving passes. A subsequent session should establish its authorized investigation/repair scope before acting.
