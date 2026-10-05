# Approved Billboard entrance and exit visual design

Approved by Manny on 2026-10-04 at 07:00 America/Chicago. Approval: “Approved. Log the design on the repo. I'm going to continue the work in a new session”. This records the approved bounded design; implementation is deferred to the next session.

## Intended result

Fit the entrance Billboard to the shortcut's actual opening in the main-road wall. Add a matching, passable Billboard at the shortcut's exit/rejoin opening, facing racers approaching through the bypass. Both panels reuse the approved 16:9 sponsor artwork and existing race-clock cues. Preserve the now owner-approved smooth exit driving and the prior positive remainder review.

## Placement and behavior

Derive placement and frame fit from the actual wall opening and supported route, rather than using a fixed distance along the bypass. The current entrance visual is19m along the bypass; a read-only projection puts its centerline/main-wall crossing near12m. These are diagnostic approximate distances, not approved final coordinates. Exact opening edges, panel width, orientation and grounded height must be measured during implementation. Fit the full frame to each aperture without extending into the normal racing corridor. Keep lettering readable from the approach and preserve artwork aspect ratio. The repaired exit support differs locally from the original curve height; ground exit visuals to the actual shared rendered/native support.

Use existing approved Paprika OFF / Arin and Raven ON artwork, translucency and race-clock tells at both ends. Both remain passable holograms. The second visual adds no physical blockage and no additional slowdown; retain existing once-only traversal/ON tax semantics. Do not infer a second gameplay crossing penalty from the second panel. Any visual crossing effects must remain bounded and must not duplicate gameplay state or retention.

## Binding scope

Visual placement/frame fit and the additional exit display only. Preserve repaired support geometry, main-road geometry, route curve, checkpoint gates, controller/collider behavior, physics/tuning, cycle/retention and AI rates. Reuse approved assets; no generation, binary asset replacement or LFS operations. Production gameplay and accepted tunnel preview92025b5 remain unchanged. Keep runtime PR242 draft/open/unmerged. Task6Step4 first-lap timing, ON/OFF balance and AI rates remain separate and pending; no Dive or Stage4.

## Verification and delivery

Verify entrance and exit from actual chase-camera approaches, including readable orientation, both wall-opening/frame fits, road clearance, support grounding and existing cycle behavior. Retain native exit motion regressions and main-geometry bytehash protection; verify no extra penalty. Run repository-required validation, then publish a replacement isolated pinned GitHub Pages preview under the existing Billboard path after exact-head hosted CI. Verify HTTP200, served source marker, file byte counts/SHA256, and unchanged production/accepted-preview hashes using the established publication evidence pattern. Stop for focused owner visual retest; do not treat this approval as runtime acceptance or production release.

## Next-session handoff

Resume design/neon-grid-circuit-02 from this documentation checkpoint. Follow AGENTS.md and verify GitHub state before acting. Read this approved design, owner-playtest.md, repair.md and publication.json in this directory plus the implementation-status top entry. Implement this bounded entrance/exit visual correction, validate it and deliver the isolated Pages preview. No further design approval is needed within this recorded scope; expand scope only with separate owner direction.

Current served runtime:45da17cdab7f7ce5a084f3d60da08e1c676dae1d. Review: https://manaconda33.github.io/manacondas-minigame-mayhem/previews/neon-grid-billboard/?review=45da17c . Pages mainffc3e01/run37180497965 passed publication/hash verification. Owner explicitly passed smooth exit motion, then opened the visual placement issue (screenshot1000028930.jpg). The attached local path was unavailable; the screenshot is visible in the conversation and its feedback is recorded in owner-playtest.md. This checkpoint changes documentation only and does not deploy anything.
