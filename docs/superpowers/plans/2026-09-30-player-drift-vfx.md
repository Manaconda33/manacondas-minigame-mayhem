# Approved player drift VFX increment

Manny approved this design and native execution in the conversation. This repo checkpoint records the approved bounded scope and implementation sequence; it does not reopen the audit or require repeat design approval.

1. Add a reusable player-only world-space particle pool for blue sparks, orange denser sparks/flame flickers, purple charge burst and purple boost-release exhaust pulse. Quality caps 48/96/144; one batch; no shadows; own visual RNG.
2. Connect existing KartFeedback in KartTimeTrial. Preserve simulation, controls, camera, wheel glow, tones, HUD, Results and all audio. Freeze paused/hidden time; suppress airborne emission; clear on recovery/spinout/non-racing; dispose owned resources. Prewarm its final color-layout shader at race startup.
3. Cover tier/world-space/resource and runtime lifecycle behavior with meaningful red/green tests; run complete project validation and LFS checks. Perform separate author self-review and save evidence.
4. Publish a review branch/PR and update the existing owner-private playable review build. Record source/build/CI/deployment provenance.
5. Stop for owner rendered acceptance and new runtime merge/public production approval. No dust, speed/FOV, bloom, blur, postprocessing or next slice.
