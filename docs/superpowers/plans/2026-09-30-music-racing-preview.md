# Approved music racing preview integration

> **For agentic workers:** Use superpowers:executing-plans for native execution of this approved bounded integration. Steps use checkbox syntax.

**Goal:** Integrate Manny's listening-approved revision 2 music into a private full-game review without publishing production.

**Architecture:** One app-owned music director follows routes and authoritative race phase/lap/pause/Prismatic state. A small Web Audio transport on a gesture-created context independent of Howler auto-suspension decodes the exact approved WAV loops and schedules sources against the audio clock; direct output receives effective Master × Music once. Gameplay, SFX, controls and presentation remain unchanged.

**Tech Stack:** Existing TypeScript, Web Audio, Howler, Vitest; five exact approved normal-Git runtime music exceptions (ADR-095), with existing SFX remaining in Git LFS.

**Spec:** PRD sections 10.6, 24.5–24.6, HUB-002, AUD-003–004 plus Manny's approved five-cue plan and revision 2 loop/transition acceptance, 2026-09-30.

## Global constraints

- Main baseline `dff4e409b54068c3053ec67b8fb3fb586d4dc383`; use a review branch.
- Preserve Task 10/11 and all SFX acceptance. No next-slice or production approval.
- Exact revision 2 WAV bytes use the five narrowly approved runtime exceptions in `.gitattributes`, with SHA-256/signature/sample-count verification.
- No branch Pages deployment or protection change; owner-private listening snapshot only.

## Review focus

- Late decode after navigating away must never start stale music.
- Pause/hidden before a scheduled final-lap transition must not leave stale voices.
- Finish or restart during a transition must bound voices and clear old race state.
- Music gain must respect saved controls once; Prismatic should remain distinguishable.
- Failed/suspended audio must not block gameplay or replay queued stale music.

## Task 1: Asset catalog and transport

- [x] Add exact approved loops and approval/edit/hash manifest; record the explicit alternative-path instruction and exact attribute exceptions.
- [x] Write/run failing tests for decoding, exact loop duration, audio availability, disposal and cache retention.
- [x] Implement `WebAudioMusicOutput` and base-aware revisioned `musicCatalog`.
- [x] Add `tools/verify-music-assets.mjs` to the production build; run focused checks.

## Task 2: Director and production event routing

- [x] Write/run failing director tests for routes, bar scheduling, pause, visibility, gains, stale loads and teardown.
- [x] Implement `MusicDirector`; use 0.5 base gain, 0.25 pause gain, 0.25 Prismatic duck and a two-bar race/final-lap crossfade. Menu changes crossfade over 0.7 seconds; Results entry over 0.8 seconds.
- [x] Integrate route calls and optional `onMusicState` callback carrying `phase`, `lap`, `paused`, `prismatic`; add production-path routing tests.
- [x] Run focused tests and full validation; commit local checkpoint.

## Task 3: Review publication and handoff

- [x] Review the complete diff independently; address important findings with regression tests.
- [x] Publish the canonical review branch/PR through connected GitHub binary/tree APIs; independently verify uploaded bytes against the approved manifest. Existing LFS objects remain unchanged.
- [x] Build an exact root-base private listening snapshot with source commit/hash provenance; publish without changing public Pages.
- [x] Record approval, validation, alternative upload/publication evidence, private preview, and pending integrated/production gates in status/testing/decision records.

## Authorization and execution

Manny approved the five-cue plan, supplied the tracks, authorized edits, rejected revision 1 seams, accepted revision 2 loops/transition, and then explicitly authorized integration and a private review preview. Native execution proceeds within that scope; no duplicate plan-approval request is required.

## Verified handoff

Draft PR #210; code source `f4c381b8ac101e2acc5157c4328c5eeac060ef23`; hosted CI `36765665421` passed. Private integrated preview: https://manaconda-music-integration-review.manaconda2433.chatgpt.site. All five exact approved files uploaded using connected GitHub binary blobs, fetched back and hash-verified. Local validation: 81 files / 642 tests. Asset/listening acceptance remains complete; integrated listening, merge and separate production publication remain pending.
