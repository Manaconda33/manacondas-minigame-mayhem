> **Execution update:** Manny approved implementation/Native execution with “Approved, let's get started.” Implementation and local validation are complete; review fixes are verified. Canonical review CI/private preview and owner new-bloom acceptance remain pending. Separate public merge/publication approval is still required. Earlier awaiting-implementation status is historical.

# Selective race bloom design — 2026-10-01

Status: written design approved by Manny with “Plan approved.” on 2026-10-01 (America/Chicago). Implementation plan awaits review/execution selection. Documentation only; implementation and publication have not begun.

## Intent and authority

Manny requested: “Let's skip the context-loss recovery & remove it from our work. I've run this game hundreds of times across mobile & desktop & this has never occurred. Let's do bloom.” He then approved selective player/AI drift, exhaust, boost-strip and item-energy glow, Low off, capped Medium/High buffers, preserved road/art/HUD, private review and separate publication approval.

Baseline: main `4fe73c58e4c51201f917658e705fca8b2b3db8ec`; CI/Pages `36883019805` passed validation and deployment. Existing diagnostics, kart optimization, drift/dust, speed cues, exhaust, gameplay, HUD/Results and audio acceptance remain closed. Concurrent Archer work is separate. Context-loss recovery is removed from the remaining implementation and release gates by owner decision; this is a scope waiver, not a claim that recovery exists or has been tested. Motion blur and the next slice remain outside this work.

## Approach and alternatives

Use a dedicated race-owned selective glow pipeline around the existing Three.js renderer. Keep the original scene-to-screen render, color management, antialiasing and camera unchanged. Add a depth-occluded low-resolution emission mask, two separable spatial-filter passes and one additive screen composite. The spatial filter creates the bloom halo; it does not blur the base race image or implement motion blur.

A whole-scene brightness threshold is rejected because white portraits, sky and reflective road/karts can glow accidentally. A general HDR/composer conversion is deferred because it changes the base rendering/color contract and introduces a larger pass chain. The selective overlay gives explicit eligibility and bounded buffers without new dependencies or assets.

## Eligibility and visual contract

Explicit object/material registration owns eligibility; names, brightness and inherited group membership alone never enable it. Register player and AI drift sparks, purple release pulses, ordinary exhaust and boost flecks, boost-pad cyan chevrons, and existing luminous portions of item effects. Solid item bodies, kart paint, drivers, portraits, road, boost-pad bases, dust, speed lines, sky, track scenery and DOM HUD/Results are excluded. Item eligibility follows existing visibility, lifetime, owner and camera rules; bloom never creates or prolongs an effect. Existing blue/orange/purple colors and item identities remain authoritative.

Keep halos narrow and subdued, with crisp cores. Mask eligibility is identical in chase and rear views. World occlusion must prevent glow from objects behind the road, walls or karts; a halo may naturally spread a few pixels around a visible silhouette. Transparent driver sprites must preserve alpha cutouts in mask occlusion. No global exposure/tone-mapping adjustment, new lights, shadow casters, simulation writes or gameplay RNG use.

## Render ownership and mask

`RaceBloom` owns three linear RGBA8 render targets (mask plus horizontal/vertical filter), cached mask materials, a full-screen triangle and composite/filter materials. Its public contract is register/unregister eligible renderables, resize from actual drawing-buffer dimensions, render(scene, camera), and idempotent dispose. Low creates no bloom targets/materials and calls the original renderer path directly.

For enabled tiers, render the ordinary scene exactly once to screen. Render a black-background, no-fog emission mask at capped resolution. Eligible objects supply their current effect color/alpha; standard boost-chevron materials provide an unlit emissive-only mask. Noneligible visible geometry still participates as a black depth occluder, retaining transforms, skinning/instancing, side, alpha maps/test, transparency and depth behavior. Custom shader objects require explicit mask adapters preserving their vertex positioning and coverage; do not silently use a generic mask that misplaces screen-space geometry. Cache variants by source material/adapter and release only pipeline-owned resources. Per-frame intensity/opacity reads remain synchronized with originals.

Temporary material/background/fog/renderer state changes must be restored in a `finally` block. Reuse the base pass's shadow maps without refreshing shadows during mask rendering. Existing camera layers, render order and frustum rules remain intact. Mask/filter outputs are linear; the final glow overlay performs output-color conversion once. At zero glow the base image is unchanged. Do not take ownership of existing source materials/textures.

## Quality and cost bounds

| Preset | Enabled | Mask scale            | Long-edge cap | Filter radius | Initial composite gain |
| ------ | ------- | --------------------- | ------------- | ------------- | ---------------------- |
| Low    | No      | —                     | —             | —             | 0                      |
| Medium | Yes     | 0.5 of drawing buffer | 768 px        | 2 mask pixels | 0.18                   |
| High   | Yes     | 0.5 of drawing buffer | 1024 px       | 3 mask pixels | 0.24                   |

Preserve aspect ratio; clamp each dimension to at least one pixel. Use a normalized, fixed nine-tap filter in each direction. No temporal history, mip chain, adaptive quality or additional bloom layers. The three square color buffers have an upper bound of about 6.75 MiB Medium / 12 MiB High, plus mask depth storage and driver overhead. One additional mask scene traversal/draw set and three full-screen draws are expected; there is no claim of one extra draw total. Mask shadows are not regenerated. Reuse scratch state and avoid per-frame material/target allocation. These are implementation limits, not measured device performance guarantees. Visual tuning within these limits is part of the new bloom review.

Existing next-race preset application remains. Resize/orientation changes update targets within caps. If allocation, initialization or bloom rendering fails, release owned bloom resources, restore all scene/renderer state and render the ordinary race path; expose the fallback reason in opt-in diagnostics without adding a normal HUD warning. Do not add context-loss listeners or recovery UX.

## Lifecycle and diagnostics

Race startup creates/warm-compiles the enabled pipeline after effect/model loading. Late-created effects register through their existing visual owners. Pause/hidden state adds no animation or simulation clock; restart, finish/Results, return to Hub and disposal respect the existing lifecycle. Repeated disposal releases bloom targets, depth storage, mask variants and full-screen resources once, without disposing borrowed resources.

Renderer diagnostics must count the entire frame across base, mask and filter/composite passes. Reset counters once at frame start and read after all passes, then restore normal renderer bookkeeping. Preserve existing raw timing, pause/hidden attribution and export semantics. Record bloom tier, actual mask dimensions and enabled/fallback state in the opt-in capture so comparisons are attributable. No full PRD performance pass is inferred from mocked tests or prior screenshots.

## Verification and review

Focused tests cover explicit eligibility/exclusions, per-instance/material-array handling, live alpha/intensity, occluding geometry/alpha cutouts, state restoration on failure, Low bypass, caps/aspect resize, borrowed-resource preservation, once-only disposal and aggregate render counters. Real-race routing covers player/AI, boost strips, item lifecycle and restart cleanup. Observe red-before-fix for meaningful behavioral tests, then run full repository validation, diff checks and LFS verification; no dependency/assets/workflow/protection change is intended.

Rendered verification must inspect colors, narrow halos, road and sprite clarity, occlusion, chase/rear cameras and portrait/landscape resize. If a rendered automation environment is unavailable, record that limit and rely on the owner's new-bloom private gameplay review for perceptual acceptance; never label structural mocks a visual pass. Capture attributable before/after whole-frame diagnostics on the same preview/device/settings where available, report added calls and frame timings, and optimize or reduce bloom if the owner sees a regression. Preserve earlier performance substitutions and accepted reviews.

After written-design approval, create an implementation plan for owner review and execution-method selection. Implementation uses an isolated review branch, exact-head CI and private gameplay preview. New bloom acceptance precedes separate merge/publication approval; after authorized merge, verify main CI/Pages and actual public bundle hashes. Final Slice 6 closure remains separate.
