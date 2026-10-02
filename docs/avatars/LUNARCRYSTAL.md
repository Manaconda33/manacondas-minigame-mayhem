# Lunarcrystal — Racer Intake Record

## Approval checkpoint — 2026-10-01 (America/Chicago)

Manny supplied a definitive character/kart reference and approved the written visual direction. All fourteen 2D assets were individually reviewed and approved: portrait, full-body selection, ten race-driver frames, full-body podium victory and lower-finish reaction. Manny then explicitly directed: “Let's get these uploaded to the repo before beginning kart work.” This checkpoint publishes the approved delivery art on an asset review branch; it does not activate a racer or authorize production merge/deployment.

## Character visual lock

Flowing chestnut waves with copper highlights, hazel-gold eyes, freckles, warm confident smile, purple-and-gold celestial clothing, white collar/cuffs and pale-blue crystal pendant. Preserve the reference's richly shaded pixel-art style. Purple trousers and dark boots with restrained gold trim were proposed for the reference-obscured lower outfit and approved with full-body selection art. Approved front race sprites include purple fingerless gloves. Drivers are character-only seated upper-body sprites; wheels, seats and kart geometry are excluded.

## Corrected steering approval

Manny withdrew the initial rear-left approval and rejected both initial turn sprites because their arms steered opposite to the intended turn. The replacements were individually approved. Rear left: own left hand lower, own right hand higher. Rear right: own left hand higher, own right hand lower. Front frames preserve the same own-hand relationship, with screen sides reversed by the camera. The two rejected images are recorded in the source ledger and excluded from delivery.

## Delivery and provenance

- Namespace: `public/assets/characters/lunarcrystal/`; AA-14 Lunar Navigator was approved on 2026-10-02; it remains inactive until integration.
- Portrait: 256×256; ten driver frames: 512×512 with the same 16px canvas inset; selection and both Results images: original approved 1024×1536 RGBA bytes.
- `approved-art-ledger.json` records exact approved source hashes, dimensions and alpha observations. `runtime-art-ledger.json` records all delivery hashes and source links.
- Preparation preserves original framing and alpha; resizing uses premultiplied alpha to avoid hidden background RGB leaking into edges. No cropping, repainting, alpha thresholding or pose modification.
- Rear source has alpha 1/255 at one corner; its original bytes are preserved. Runtime padding is fully transparent. Full-body source RGB contains hidden background colors under zero alpha; those bytes are preserved, not composited as a backdrop.
- User-supplied reference `1000028792.png` is the visual authority. Outputs were generated individually and approved in this session. No additional third-party ownership/license claim is inferred.
- High-resolution source masters are retained locally under `source/`, remain LFS-governed and are excluded from this publication. The fourteen fixed-size runtime PNG paths use existing normal-Git exceptions. No LFS pointer or source master is added.

## Remaining gates

Requested placement is page two alongside Archer. Manny approved the new AA-14 profile and fourteen-driver roster extension on 2026-10-02; page one remains unchanged, page two adds Lunarcrystal beside Archer, and races retain eight unique drivers. Kart visual direction follows the supplied purple/gold celestial reference: crescent hood emblem, star hubs, warm lanterns and violet exhaust. The Moonlit Carriage name, celestial kart concept and balance are approved; Candidate 1 geometry was approved on 2026-10-02; gameplay mounting remains in review. Do not begin kart work until this asset upload is verified. Later integration needs revisioned URLs, both-camera mounts, fallbacks, full validation, GitHub Pages gameplay review and separate production approval.

Existing gameplay, thirteen-driver production manifest, Archer, page-one ordering, eight-racer grid, audio and accepted visuals remain untouched. Concurrent shadow-polish work is independent.

## Kart concept and balance approval — 2026-10-02

Manny replied “Approved” to The Moonlit Carriage concept/name, AA-14 Lunar Navigator (Medium), stats Speed 6 / Acceleration 7 / Weight 4 / Handling 8 / Mini-Turbo 5 / Traction 6 (36 total), and page-two placement alongside Archer. The kart follows the supplied definitive reference: purple body, gold scrollwork, crescent hood emblem, star hubs, amber lanterns and twin violet exhaust outlets. Handling and grip are strengths; modest Speed and low Weight retain top-speed/contact weaknesses. This approval permits the bounded deterministic kart candidate build. Candidate geometry, sprite mounting, runtime activation, merge and production release remain separate gates.

## Geometry approval and local integration — 2026-10-02

Manny inspected the actual full-detail Candidate 1 GLB and replied “Looks great! Approved.” This approves the geometry recorded in `docs/evidence/2026-10-02-lunarcrystal-kart/candidate-1.json`; each runtime LOD copies those exact bytes. AA-14 is locally integrated under `lunarcrystal-runtime-20261002-1` in the existing `lunarcrystal` asset namespace. Neutral/chase mount `[0, 0.85, -0.12]` and front mount `[0, 0.78, -0.12]` use the existing 1.45 m billboard and shared PI visual yaw. The offline reviewer applies the actual runtime 2.9 m normalization and ground offset; all ten poses were rendered without editing the approved PNGs. Runtime uses one modeled steering wheel; no sprite wheel is added. These renders are not live camera/device approval.

Page two now shows Archer and Lunarcrystal, page one retains the original twelve IDs/order, reopening restores selection, and race sampling remains seven unique opponents excluding the player. Victory/reaction Results poses map to their exact approval hashes and preserve fallbacks. Publishing the integration/review workflow, materializing the three LFS GLBs, hosted CI, Pages preview review and final production release remain pending separate authorization. Asset-only PR #237 remains unmerged.
