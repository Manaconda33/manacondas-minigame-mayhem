# Mobile race controls, camera framing, and Character Select art

**Date:** 2026-09-26

**Status:** Approved by Manny on 2026-09-26 for implementation planning; no implementation or visual acceptance claimed.

## Intent and authority

Manny's September 26 desktop and mobile screenshots show a full-body selected driver that is too small at 100% desktop zoom and a portrait mobile race view whose HUD and touch controls obscure the racers and road. His preferred mobile mockup places compact race information above the course, a steering wheel at the lower left, and thumb controls along the bottom. It also shows less sky, more rendered road, and racers higher in the frame. The mockup's icons are approximations except for the requested steering-wheel interaction; they are not approved runtime art.

Success means the complete selected driver reads prominently while stats and Start Race stay reachable at 100% desktop zoom; the mobile race remains readable and operable without overlapping control labels and item/drift panels; and holding the steering wheel, even at center, accelerates until Brake/Reverse takes priority or the wheel is released. Existing approved character, kart, item, HUD, and Results assets remain unchanged.

This design follows the current Slice 6 HUD/Results brief and its live-data rule. The branch preview under `/previews/race-hud-results/` is a test surface, not a production deployment or Task 11 acceptance.

**Visual references:** Manny's preferred mobile mockup is Library file `Image 4.png` (`libfile_afbfc12171208191a519eef0fbe45a5a`); the current mobile HUD screenshot is `image(4).png` (`libfile_697c52186a6c81918aa4e3114a65ee16`); the desktop selected-driver screenshot is `image(3).png` (`libfile_a4459ce90fa881918d7bdf6709055d52`). The mockup is guidance for composition and interaction, not a file to copy into the runtime or a source for approved graphics.

## Approach

The recommended approach is one coordinated mobile presentation and input change using the existing typed `HudState`, `ItemHudSnapshot`, `KartTimeTrial` input path, and `ChaseCamera`. Pure CSS rearrangement would ease overlap but leave seven independent touch targets and no wheel acceleration; a rendered HUD image would be unable to own live values or responsive controls. Reuse the approved decorative assets and live DOM/SVG data, and author the wheel as a responsive CSS/SVG control rather than treating the mockup image as a runtime asset.

The desktop portrait change is a separate layout adjustment in the same review increment. It must not change avatar image files or their approved identities.

## Mobile layout and information

- Apply the compact race layout only to a coarse primary pointer without hover, matching `isMobileSession()`. Desktop/fine-pointer HUD and keyboard controls remain intact. Responsive sizing must also handle narrow portrait widths and safe-area insets.
- Put lap and race time across the upper left/center, and keep speed and position legible at upper right. Place the existing live Circuit Alpha minimap beneath the upper-left row. Keep the countdown and urgent warnings in a clear central lane. Do not copy the mockup's example numbers, map shape, boost percentage, or icons as game state.
- Use the lower edge as a driving zone: a large steerable wheel at left, compact item/drift readouts and status near the controls, and distinct Rear View, Brake/Reverse, Use Item, and Drift targets within thumb reach. The labels and live art must not cover one another or the wheel. Keep Recover available as a smaller, clearly labeled secondary control away from accidental driving touches.
- Retain surface information, active boost/effect status, item charge feedback, wrong-way and incoming warnings. Compress or relocate nonessential persistent text so the road and player remain visible. Do not invent a fuel, gear, boost inventory, or new speed value just because the mockup depicts one.
- Existing decorative race HUD assets may frame information where readable. Text, controls, item state, positions, time, map markers, and accessibility names remain live DOM/SVG/runtime data. Finish hides race HUD and touch controls using the existing Results contract.

## Steering and other touch input

- A pointer captured on the wheel immediately applies forward throttle even when centered. Horizontal dragging within the wheel gives continuous left/right steering with a neutral center and bounded full-lock extremes. A visible wheel response tracks the command. Leaving its visual bounds while captured does not strand throttle or steering; pointerup, pointercancel, lostpointercapture, route disposal, and visibility loss release the wheel state.
- Holding Brake/Reverse overrides wheel throttle, first slowing forward motion and then engaging the existing reverse behavior. Releasing Brake/Reverse while the wheel is still held restores forward throttle. Releasing the wheel coasts unless a keyboard input remains held. This priority is explicit and independent of the order of pointer events.
- Drift remains a hold action usable simultaneously with wheel steering. Rear View remains hold-to-view. Use Item is a discrete action on press; holding Brake/Reverse while using an item retains the existing backward-use modifier where the item supports it. Recover remains a discrete press. Keyboard controls and item behavior retain their current semantics.
- One pointer owns the wheel; separate pointers may hold Brake/Reverse, Drift, or Rear View concurrently. Do not translate this gesture into synthetic keyboard events. Feed a normalized touch steering value and wheel-held flag to the existing drive-input composition; preserve spinout, rocket autopilot, modifiers, physics, and AI authority.

## Item visualization

The Use Item button contains a distinct empty-slot visualization initially. During roulette it may show a neutral pending treatment, but it must not reveal the final item prematurely. When `ItemHudSnapshot.phase` becomes `held`, show the already approved item graphic resolved through the existing base-aware `routeNightItemAssetUrl(itemId)` mapping. Use the same snapshot for the button and compact item readout, including charges. After final charge/use or inventory loss, return immediately to the empty slot. A failed image load falls back to the existing textual/symbol identity without breaking input or hiding item state. The button remains accessible as “Use item” with the item name and charge state available as appropriate; it does not become a second inventory authority.

## Camera and Character Select

- Tune only the mobile forward chase framing, after the existing intro transition, so the road occupies more of the portrait view and the player/nearby racers sit higher in frame with less empty sky. Adjust the camera target/framing rather than cropping the canvas or adding blank space. Check road sightline, speed cues, hazard visibility, and player/kart occlusion in actual gameplay. Preserve desktop chase geometry and the established rear camera and spinout orientation behavior.
- Give the selected full-body art more of the existing desktop profile stage. Rebalance identity copy, driver art lane, and kart lane, and use the available width/height without clipping the driver's feet or hiding the kart. Keep the stats and Start Race button in the 100% zoom viewport at representative desktop sizes, with scroll fallback at shorter heights. Keep the mobile Character Select flow usable and image fallback intact.

## Implementation boundaries and verification

Expected edits are concentrated in `src/app/touchControls.ts`, `src/app/mountAppShell.ts`, `src/app/raceHud.ts`, `src/app/itemHud.ts`, `src/game/KartTimeTrial.ts`, `src/game/camera/ChaseCamera.ts`, and `src/style.css`, with focused tests and the three evidence documents. A small touch-input adapter may be extracted if it makes pointer cleanup and throttle priority independently testable. Avoid unrelated gameplay balance, item assets, audio, post-processing, race authority, hosting settings, and Results art.

Focused tests should cover center/left/right wheel input, throttle on contact, brake priority in either press order, release/cancel/visibility cleanup, simultaneous drift/rear/item use, backward item modifier, empty/roulette/held/consumed item graphic transitions and fallback, coarse-pointer-only rendering, desktop/rear camera invariants, and mobile chase framing. Run the repository validation, focused suites, targeted formatting, diff whitespace, and LFS checks. Review the hosted branch preview on desktop and real mobile at 100% zoom, with several selected drivers and a live item pickup/use. Record the exact commit, URL, viewport/device, outcomes, and limits. Task 10 cleanup/memory evidence and Task 11 deployed desktop/mobile acceptance remain open until their separate required observations and Manny's explicit acceptance.
