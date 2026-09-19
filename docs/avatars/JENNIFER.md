# Jennifer - Racer Intake Record

## Approval state

- Character lock: Approved by Manny, 2026-09-03
- Definitive visual authority: Supplied Jennifer racer collage, with the written character lock controlling any conflict
- Transformation rights: Confirmed by Manny, 2026-09-03
- Kart lock: The Hearthwarden, approved by Manny, 2026-09-03
- Balance mapping: AA-12 All-Surface Heavy, approved by Manny, 2026-09-03
- Portrait design: Approved by Manny, 2026-09-03
- Portrait runtime derivative: Normalized and validated, 2026-09-03
- Ten-frame driver design package: Approved by Manny, normalized, and validated, 2026-09-03
- 3D kart geometry: Candidate 2 approved and prepared, 2026-09-03
- Runtime activation: Pending

## Character lock

Jennifer is a tall druidic herbalist, caretaker, and protector. She stands about 5 feet 9 inches tall and has a buff, lanky, softly chubby build shaped by practical work. Her presence is calm and authoritative. She is kind and observant, but her physical strength and protective nature must remain clear.

She has ivory-toned skin, an angular oblong face, dark-teal eyes, and no makeup. Purple wire-rimmed glasses are mandatory. Her long dark chocolate-brown hair is thick and curly, worn half-up with braids and threaded feathers. Her usual expression is a small, sincere smile with a stern, watchful quality.

Jennifer wears handmade deep forest-green druidic robes with readable floral motifs and bronze bohemian fringe. Turquoise jewelry, especially a necklace and matching ring, provides the principal accent. Simple sandals complete the outfit. Her clothing must remain earthy and functional rather than sleek or glamorous.

Her signature item is a heavy six-foot pear-wood staff. It is gnarled, natural, and visibly used. An amethyst at the head emits only a restrained glow. Jennifer's magic is deliberate and practical, without explosive or ornate effects.

## Newfoundland companion lock

Jennifer's companion is a massive gray Newfoundland dog. The dog is heavy-set, calm, loyal, and protective. It must read as a working companion with its own physical presence, not as a decorative mascot. Its movement and attitude mirror Jennifer's steady pace and watchfulness.

In the racer package, the Newfoundland rides on a reinforced right-rear companion perch and appears in all ten driver frames. The dog braces during turns, becomes alert during a hit, and sits proudly during victory without becoming comic relief. Jennifer remains alone in the portrait so her face stays readable in the Character Select, HUD, results, and minimap treatments.

## Reference precedence

The supplied collage is definitive visual authority for Jennifer, her Newfoundland, and the kart design language. The approved written lock takes precedence where the collage differs. In particular:

- Jennifer wears purple wire-rimmed glasses even if the reference frames appear darker or heavier.
- The Newfoundland's coat is gray even if the reference renders it nearly black.
- The staff glow remains subtle.
- Jennifer's build remains tall, sturdy, lanky, and softly chubby.

## Kart lock

The Hearthwarden is a low, broad druidic field roadster converted from a working apothecary wagon. It is built from shaped pear wood, woven willow panels, visible bronze brackets, and practical mechanical joints. Deep forest-green painted surfaces, turquoise accents, aged bronze, and restrained amethyst light connect it to Jennifer without making the kart glossy or ornamental.

A large round tree-of-life medallion anchors the nose. Four wide practical tires use bronze hubs with turquoise-green rim details. The open cockpit is sized for Jennifer's tall, sturdy frame, with the Newfoundland's reinforced perch behind her on the kart's right side. Her six-foot staff mounts upright on the left-rear rail to balance the companion silhouette. Its amethyst remains a small controlled light source.

The kart owns the modeled steering wheel. Every driver frame remains free of wheel and kart geometry. Boost effects use restrained teal exhaust and brief herbal particles.

The Hearthwarden is visibly constructed and maintained by hand. It must not use The Verdant Hart's living-root body, stag face, antlers, structural foliage, or delicate woodland silhouette. Vines and medicinal flowers may appear only as secured cargo or small trim. The design must not become a fragile basket, a living plant creature, or a display of ornate magic.

## Balance mapping

AA-12 All-Surface Heavy: Speed 8 / Acceleration 5 / Weight 8 / Handling 4 / Mini-Turbo 4 / Traction 7.

Jennifer's driving identity is patient, planted, and dependable across imperfect terrain. The Hearthwarden holds momentum, resists displacement, and retains more performance on dirt and grass than most heavy racers. Lower Acceleration and Handling make sudden recovery and tight direction changes costly. Mini-Turbo 4 prevents drift chains from replacing deliberate line choice.

The profile keeps Jennifer distinct from Krios's Speed 10 straight-line dominance and Accu's Weight 10 collision specialization. It also avoids turning the substantial Hearthwarden and Newfoundland package into the light AA-01 Feather Sprinter or the more agile AA-06 Grip Specialist.

## Required production contract

- Portrait: 256 x 256 transparent sRGBA PNG
- Driver frames: front, rear, steer-left, steer-right, hit, victory, front-steer-left, front-steer-right, front-hit, and front-victory
- Every driver frame: 512 x 512 transparent sRGBA PNG with transparent corners
- Kart package: deterministic LOD0, LOD1, and LOD2 GLBs with `extras.forward: "-Z"`
- Runtime orientation: `NEGATIVE_Z_KART_VISUAL_YAW`
- Controlled runtime revision required before publication
- Desktop and mobile live acceptance required before production closure

## Approved portrait design

Manny approved the corrected solo portrait on 2026-09-03. It locks Jennifer's natural bare-faced appearance, dark-teal eyes, thin purple wire-rimmed glasses, small sincere smile, dense dark chocolate-brown curls, half-up braids, threaded feathers, turquoise jewelry, and forest-green floral robe with restrained bronze detailing.

The approved 1254 x 1254 RGB preview remains visual authority and does not enter the runtime path. Its baked checkerboard was removed deterministically from the runtime derivative without regenerating the approved artwork.

Manny approved deterministic background removal for Jennifer's 2D package on 2026-09-03 and directed that it occur only after all eleven designs were approved. The completed normalization removes edge-connected checker pixels, enclosed checker pockets between curls, and the source's narrow pale outline before a premultiplied-alpha resize.

Manny approved the ten-frame driver set on 2026-09-03. It includes neutral, steer-left, steer-right, hit, and victory in both chase-facing and camera-facing orientations. The Newfoundland remains on Jennifer's physical right across every camera orientation. All ten runtime frames are wheel-free 512 x 512 transparent sRGBA PNGs with transparent corners; the solo portrait is a 256 x 256 transparent sRGBA PNG.

## Approved Hearthwarden geometry

Manny approved Candidate 2 on 2026-09-03. LOD0, LOD1, and LOD2 use 14,220, 8,604, and 4,156 triangles. Every GLB provides four materials, thirteen required nodes, one modeled steering wheel, and negative Z as authored forward.

The model preserves the constructed pear-wood and willow field-roadster silhouette, forest-green panels, bronze hardware, turquoise details, wide practical tires, kart-right dog perch, kart-left staff, restrained amethyst, remedy cargo, and tree-of-life nose emblem. Candidate 2 roots the rear herb stems inside their boxes and connects the emblem to the hood and front frame with a central wood boss and paired bronze braces.

## Next approval gates

1. Publication
2. Desktop and mobile live playtest

## Local runtime integration

Jennifer is locally active in `characterManifest` as AA-12 under `jennifer-runtime-20260903-2`. The manifest uses chase-facing driver position `[0, 0.92, -0.12]`, camera-facing position `[0, 0.84, -0.12]`, camera-facing modeled-wheel position `[0, 1.86, -0.42]`, and `NEGATIVE_Z_KART_VISUAL_YAW`. Her wheel-free raster package leaves The Hearthwarden's single modeled steering wheel visible. Offline cockpit review confirms the intended seated occlusion, dog-side continuity, and hand-to-wheel relationship; deployed desktop and mobile checks remain required before production closure.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-12/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, normal-Git runtime delivery derivative under ADR-092.
- Approval: Manny approved Jennifer's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: The selection image intentionally presents Jennifer alone; her Newfoundland remains a racer-package companion outside this image. The approved portrait, race driver package, The Hearthwarden identity/geometry, statistics, and PBR/material implementation remain unchanged.
