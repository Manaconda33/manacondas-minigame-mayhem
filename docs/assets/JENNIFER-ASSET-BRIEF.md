# Jennifer Asset Brief

## Governing locks

- Character lock: Approved by Manny, 2026-09-03
- Definitive reference: Supplied Jennifer racer collage
- Reference rule: Approved written canon overrides conflicts in the collage
- Transformation rights: Confirmed by Manny, 2026-09-03
- Kart name and design: The Hearthwarden, approved by Manny, 2026-09-03
- Balance profile: AA-12 All-Surface Heavy, approved by Manny, 2026-09-03
- Portrait design: Approved by Manny, 2026-09-03
- Portrait runtime derivative: Normalized and validated, 2026-09-03
- Ten driver-state designs: Approved by Manny, normalized, and validated, 2026-09-03
- Kart GLB geometry: Candidate 2 approved and prepared, 2026-09-03
- Runtime activation: Locally integrated under `jennifer-runtime-20260903-2`; publication pending

## Approved visual authority

The approved character package must preserve Jennifer's tall, sturdy silhouette; ivory complexion; dark-teal eyes; purple wire-rimmed glasses; dark chocolate-brown curly half-up hair; braids and feathers; forest-green handmade robes; floral motifs; bronze fringe; turquoise jewelry; simple sandals; and restrained expression.

Her six-foot gnarled pear-wood staff and subtly glowing amethyst are signature elements. The massive gray Newfoundland is a working companion and shares Jennifer's calm, protective presence.

The supplied collage controls the broad racing composition and kart design language. Written canon controls color, material, body, and accessory conflicts.

## Approved kart direction

The Hearthwarden is a planted druidic field roadster built from shaped pear wood, woven willow panels, bronze brackets, and mechanical joints. Its deep forest-green bodywork carries turquoise accents and a round bronze tree-of-life nose medallion. Four wide practical tires use bronze hubs with turquoise-green rim details.

The cockpit must fit Jennifer's tall, sturdy frame without flattening her silhouette. A reinforced right-rear perch carries the Newfoundland, and a left-rear rail holds the six-foot staff upright. The amethyst stays visually restrained. The kart provides the steering wheel, so no driver raster contains a second wheel.

All ten driver frames include the Newfoundland in the same physical kart-right position. Its pose changes with the race state while preserving its heavy gray working-dog identity. Jennifer's portrait excludes the dog so her face remains readable at approximately 48 pixels.

Boost treatment uses restrained teal exhaust and brief herbal particles. The kart remains a constructed field vehicle rather than a living plant body.

## Production boundaries

- Do not omit or recolor the purple wire-rimmed glasses.
- Do not reduce Jennifer to a thin or athletic display build.
- Do not turn the Newfoundland into a small pet, black silhouette, or decorative emblem.
- Do not use flashy spell effects or an oversized amethyst glow.
- Do not make the robes glamorous, sleek, or revealing.
- Do not reuse The Verdant Hart's living-stag construction, antlers, or leaf-forehead identity.
- Do not place the Newfoundland on inconsistent sides of the kart between front- and rear-facing frames.
- Do not add a wheel, seat, kart panel, or staff mount to the driver rasters.
- Do not create runtime rasters or kart GLBs before their corresponding visual approvals.

## Runtime placement

The local manifest uses chase-facing driver position `[0, 0.92, -0.12]`, camera-facing position `[0, 0.84, -0.12]`, and camera-facing modeled-wheel position `[0, 1.86, -0.42]`. The production model scales to 2.9 world units across its widest horizontal dimension and retains the shared `-0.42` ground offset. Offline review with the approved PNGs confirms that the rear structure seats Jennifer's lower body, the Newfoundland remains on kart-right, and the single modeled wheel sits between her camera-facing hands without covering her face. Deployed desktop and mobile playtests remain required.

## Approved portrait candidate

Manny approved the corrected solo portrait on 2026-09-03. It preserves Jennifer's natural bare face, dark-teal eyes, thin purple wire-rimmed glasses, calm smile, dense dark chocolate-brown curls, half-up braided arrangement, feathers, turquoise jewelry, and forest-green floral robe with restrained bronze detail.

The reviewed 1254 x 1254 RGB export remains an approved design reference only. Its baked checkerboard does not enter the runtime path. The faithful production derivative is a 256 x 256 transparent sRGBA PNG with transparent corners.

Manny approved deterministic background removal on 2026-09-03, with execution deferred until every Jennifer 2D design was approved. The completed conversion removes edge-connected checker pixels, enclosed checker pockets between curls, and a narrow pale source outline before premultiplied-alpha resizing.

Manny approved the ten driver-frame designs on 2026-09-03. Neutral, left, right, hit, and victory each have chase-facing and camera-facing versions. All frames keep the Newfoundland on Jennifer's physical right and preserve wheel-free seated poses. The normalized files are 512 x 512 transparent sRGBA PNGs with transparent corners.

## Approved gameplay identity

AA-12 All-Surface Heavy uses Speed 8 / Acceleration 5 / Weight 8 / Handling 4 / Mini-Turbo 4 / Traction 7. The Hearthwarden keeps steady momentum and meaningful off-road traction while giving up launch recovery, tight corrections, and strong drift rewards. Geometry and driver placement must communicate mass without making the cockpit oversized or hiding Jennifer and the Newfoundland.

## Approved 3D package

Manny approved Candidate 2 on 2026-09-03. The model uses a constructed pear-wood frame, woven willow side panels, forest-green bodywork, aged bronze joints, turquoise accents, four wide tires, one modeled steering wheel, a reinforced kart-right dog perch, and the six-foot staff on the kart-left rear rail. The round tree-of-life medallion is tied into the hood and front frame by a pear-wood boss and two bronze braces. Rear herb bundles extend into their remedy boxes rather than floating above them.

| Runtime path                                   | LOD  | Triangles | SHA-256                                                            |
| ---------------------------------------------- | ---- | --------: | ------------------------------------------------------------------ |
| `public/assets/characters/aa-12/kart.glb`      | LOD0 |    14,220 | `0415224b88770726152a3313b6e0fc517a626a6167558af7a6ccbd836b13f3f0` |
| `public/assets/characters/aa-12/kart-lod1.glb` | LOD1 |     8,604 | `545d22ab7f17a17fa14bdb6281db80ac070af159f0a700a57a3694f828e880a8` |
| `public/assets/characters/aa-12/kart-lod2.glb` | LOD2 |     4,156 | `ff7cf64b9eb06defd47d708cf88dfd7780814d9a20d89ac967bc79c8d0baeeb9` |

All three GLBs use four materials, the required thirteen-node hierarchy, exactly one `SteeringWheel` node, and `extras.forward: "-Z"`. Byte-identical reruns passed for LOD0 and LOD2. `tools/assets/build_jennifer_hearthwarden.py` is the deterministic source.

This package reached approval in two candidates. The short review cycle came from translating the kart lock into explicit construction and anti-overlap rules before modeling, reusing the established exporter and scale contract, generating every LOD from one source, and providing direct GLB review alongside a four-angle sheet. Future candidates must also use new filenames after every revision and test physical overlap for all decorative attachments.

## Required runtime outputs

- `portrait.png`: 256 x 256 transparent sRGBA
- Ten driver states under `driver/`: 512 x 512 transparent sRGBA
- `kart.glb`, `kart-lod1.glb`, and `kart-lod2.glb`
- Current controlled asset revision in the character manifest
- Runtime-asset gate coverage for every PNG and GLB

All required outputs are present under controlled revision `jennifer-runtime-20260903-2`. Publication and live acceptance remain gated.

The local integration gate passes strict typecheck, zero-warning lint, 16 Vitest files / 84 tests, 30 materialized GLBs, 83 decoded runtime PNGs, and the production build.

## Character Select full-body selection art

- Runtime asset: `public/assets/characters/aa-12/selection/full-body.png`.
- Format: 1024 × 1536 transparent sRGBA PNG, governed by Git LFS.
- Approval: Manny approved Jennifer's selection-only full-body asset in the 2026-09-19 Character Select batch review.
- Boundary: The selection image intentionally presents Jennifer alone; her Newfoundland remains a racer-package companion outside this image. The portrait, race driver frames, The Hearthwarden kart package, statistics, and PBR/material implementation remain unchanged.
