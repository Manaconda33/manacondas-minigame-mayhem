# Neon Grid residual jump/stall — owner report and recording review, 2026-10-03

## Scope and owner direction

Recording review and documentation only. Manny explicitly directed: “I don't want you to begin working on a solution.” No corrective implementation, tuning, collider experiments, runtime instrumentation, merges or deployments were performed for this review. Further solution work requires Manny's direction.

## Owner report and acceptance

Manny reports the road-contact orientation repair “nearly fixed the issue completely,” with one remaining tight turn that combines curvature and elevation changes causing a jump/stall during his three-lap run. Broad sticking is materially improved according to the owner; full main-route acceptance remains unresolved.

This feedback follows the preview pinned to e441ab73ed0a5c3a2d75663de7a89a57606689b8:
https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid/?review=e441ab7

Recording-to-build association comes from this session's review context; the captured game viewport itself does not expose a source marker.

## Source recording

Manny supplied MP4 and WebM and confirmed both contain the same recording. Reviewed the MP4 only; WebM was not separately decoded or counted as another playthrough.

- Original filename: Manaconda's Minigame Mayhem.mp4
- Supplied snapshot file ID: file_0000000065c481f6998a6fc740814d8d
- Supplied exact Google Drive locator: 1N2AusG20kVdwND6u39eATCA4bbajQYlT
- Materialized source: 151,324,422 bytes; duration 208.501997 seconds; 1920×910; nominal 60 frames/second.
- MP4 SHA-256: f85841efe2f5f7ba8343bc11b0147c3ef818dca4d45503e496328d8fe0d25908
- Recording shows Manaconda / The Wayfinder, Neon Grid, all three laps and Results. Landscape viewport displays keyboard hints and no touch overlay. Device/browser/hardware and portrait behavior are not established by the footage.
- Search had previously failed to locate the uploads; direct supplied snapshots resolved access. No source-file edits, video upload to GitHub, sharing changes or derivative publication.
- Review method: sample the entire recording every four seconds; inspect three six-second event windows at four frames/second; inspect targeted full-resolution frames at 69.1, 125.6, 125.85, 126.85, 184.7 and 184.9 seconds. Timestamp precision is approximate (frame selection and capture timing); HUD race-time readings below are transcribed from displayed frames, not simulation telemetry.

## Located residual issue

**Gold Falls Run climbing S-bend, after the late cyan boost pad and before the next item-box row.** The player marker is on the left side of the minimap. This is the gold return/climb, not the fuchsia Undercity hairpin sequence. Look for the visible cross-road crease and abrupt inner-rail corner where the gold road changes direction/height, with another road strip crossing the camera's view ahead. The same landmark sequence recurs on each lap.

The recording confirms a repeatable localized hop/impact-like reaction with a substantial displayed speed drop. Severity differs across laps:

| Lap | Recording seek window (approx.) | HUD race time (approx.) | Observed sequence |
| --- | --- | --- | --- |
| 1 | 01:08.8–01:10.4 | 0:49–0:51 | Approaches around 107 km/h; at the crease/inner corner, small lift and raised-arms driver reaction; speed falls through 68 and 45 to roughly 43 km/h, then recovers while exiting the bend. |
| 2 | 02:05.4–02:08.0 | 1:45.6–1:48.2 | Strongest example: visibly lifts off the road before nearing the outer rail; drops from about 106/107 through 99 to 22 km/h; AIRBORNE is displayed. It lands facing the outside boundary, slows to 1 km/h, briefly shows WRONG WAY, then turns back onto the route. |
| 3 | 03:04.4–03:05.8 | 2:44.6–2:46.0 | Approaches around 107 km/h; raised-arms reaction and small lift at the same corner, followed by a sharp fall to 37, 15 and 11 km/h. It stays on the road and accelerates away. |

### Full-resolution frame anchors

| Recording time | Lap / displayed race clock | Displayed speed | Visible evidence |
| --- | --- | ---: | --- |
| 69.1 s | 1 / 0:49.33 | 68 km/h | Raised-arms reaction beside the jutting inner rail; road crease ahead/across the bend. |
| 125.6 s | 2 / 1:45.85 | 99 km/h | Kart clearly separated from its road shadow, while approaching the outside of the bend. |
| 125.85 s | 2 / 1:46.08 | 22 km/h | Large lift, raised-arms reaction and AIRBORNE HUD; outer rail ahead. |
| 126.85 s | 2 / 1:47.08 | 1 km/h | Landed near outside boundary and almost stopped. |
| 184.7 s | 3 / 2:44.88 | 37 km/h | Small lift/raised-arms reaction at the bend exit. |
| 184.9 s | 3 / 2:45.10 | 11 km/h | Low speed near the outer side of the gold road, with reaction frame still visible. |

## What the recording does and does not establish

- Three visibly corresponding events establish the location and repeatability within this playthrough. Lap 2 is the primary seek point for future investigation.
- No rival kart is visibly contacting the player in these event windows; inventory is EMPTY, and there is no visible active drift charge. The lap-2 incoming Apex warning appears after the initial hop/near-stop, so it does not visually coincide with the onset. These observations do not rule out every item or contact mechanism.
- Wall proximity/contact is part of the visible sequence, particularly lap 2's landing near the outside rail. Driver reaction and AIRBORNE are visual state evidence, not proof of a specific impulse source.
- The performance HUD remains around 60 FPS / 16.6–16.7 ms in the cited full-resolution frames. This is reported HUD data, not an independent device-performance or frame-pacing measurement.
- The recording supports a remaining local driving/contact discontinuity. It cannot distinguish road support, seam/grade contact, barrier correction, steering/braking input or another mechanism without later investigation. No root cause or repair is asserted.
- Do not equate this event with the earlier native 0.8-region probe simply because both concern a climbing bend. Precise main-route progress, body trajectory, contact normals/impulses, inputs and support state were not measured here.
- Waterfall Dive/shortcuts are not installed in this Stage 2 build; this lift is on the existing main route and is not acceptance of an authored jump.

## Repository state and next gate

Verified branch before this review: design/neon-grid-circuit-02 at 97ae8482960bed61af29b6798854e1547ece10de. Deployed runtime remains e441ab7. Runtime PR #242 is draft/unmerged; production is unchanged.

This recording review supersedes the prior recording-access-pending note. IMPLEMENTATION-STATUS records the remaining issue and restricted scope. Next session should start with the lap-2 video window and this evidence, then await or confirm Manny's explicit direction before solution work. Main-route acceptance remains unresolved; Stage 3 shortcuts/Dive, scenery and production release remain gated; tokens remain omitted.
