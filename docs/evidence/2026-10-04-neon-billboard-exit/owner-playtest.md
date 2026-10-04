# Billboard exit repair owner retest and portal placement feedback

Date: 2026-10-04 America/Chicago. Delivered runtime:45da17cdab7f7ce5a084f3d60da08e1c676dae1d. Branch checkpoint reviewed:29d74b2635c46b4343ca3e7cf211964780488676.

Preview: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-billboard/?review=45da17c

Manny's exact feedback:

> The billboard is in the wrong location (image attached)
>
> We should probably place another billboard to cover the exit of the track while we're at it. The exit choppy driving behavior is fixed, it's now smooth.

Disposition: EXIT/REJOIN CHOPPY DRIVING owner PASS. Preserve the approved repaired support/main geometry and prior positive remainder review. Billboard visual placement is OPEN/FAIL, superseding placement acceptance only. Owner proposes a second billboard covering the shortcut exit. Full Billboard acceptance remains open; Step4 timing/balance/AI-rate approval is not inferred.

Image1000028930.jpg is visible in the conversation: cyan-framed Raven ad across the bypass, with exposed road/wall geometry around it; lap1/3, clock0:26.40 and speed1km/h. Screenshot alone does not identify exact kart coordinates, line or travel direction. Its declared local attachment path is unavailable; no binary was copied or re-published and no device-performance acceptance is inferred.

Read-only placement check: visual uses gap.curve at mouthDistance19m, facing opposite the shortcut tangent. A main-route projection probe finds shortcut center at12m has lateral5.982m against6m main half-width; at19m lateral10.436m. Thus the visual sits beyond the main wall intersection. Earlier test checks the full frame remains outside main racing corridor, not that it coincides with the wall aperture. Wall openings are generated independently from junctionContains. This supports a wall-aperture registration correction; exact post/tip geometry must be derived and verified before implementation. The repaired exit floor differs from the original curve height locally, so any exit visual must anchor to actual rendered/native support.

Proposed bounded visual design, pending owner agreement: fit entrance panel/frame to the actual wall opening; add a matching passable exit panel at the rejoin opening, facing approaching shortcut racers. Reuse approved16:9 art and current race-clock cues. No physical blockage or second slowdown; keep traversal/ON tax once-only, floor geometry, controller, production and tunnel unchanged. Verify both openings in chase camera, wall/frame fit, grounding, approved art/cycle and unchanged native exit motion before replacement pinned Pages delivery. No runtime implementation has begun.

This feedback-only docs checkpoint changes no source, assets, workflows or served preview. PR242 remains draft/unmerged; Step4 and production release remain pending.
