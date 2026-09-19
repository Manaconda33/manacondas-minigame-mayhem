export type CharacterAssetState = 'production' | 'placeholder';

export interface CharacterStats {
  speed: number;
  acceleration: number;
  weight: number;
  handling: number;
  miniTurbo: number;
  traction: number;
}

export type DriverSpritePosition = readonly [number, number, number];

export interface CharacterDriverAssets {
  rear: string;
  front: string;
  steerLeft: string;
  steerRight: string;
  hit: string;
  victory: string;
  frontSteerLeft?: string;
  frontSteerRight?: string;
  frontHit?: string;
  frontVictory?: string;
}

export interface CharacterDefinition {
  id: string;
  displayName: string;
  descriptor: string;
  initials: string;
  accent: string;
  assetState: CharacterAssetState;
  portrait?: string;
  /** Optional selection-only hero art; race driver frames remain in `driver`. */
  selectionArt?: string;
  kartName?: string;
  kart?: string;
  kartVisualYaw?: number;
  driverSpritePosition?: DriverSpritePosition;
  frontDriverSpritePosition?: DriverSpritePosition;
  driverFramePositions?: Partial<Record<keyof CharacterDriverAssets, DriverSpritePosition>>;
  frontModeledSteeringControlPosition?: DriverSpritePosition;
  driverSpriteIncludesSteeringControl?: boolean;
  driver?: CharacterDriverAssets;
  stats: CharacterStats;
}

export const STAT_TOTAL = 36;
// Every production kart is authored and validated with glTF metadata
// `extras.forward: "-Z"`. KartMesh's chase-camera visual convention is the
// opposite, so the visual root must rotate PI without touching physics.
export const NEGATIVE_Z_KART_VISUAL_YAW = Math.PI;

export const LAVI_ASSET_REVISION = 'lavi-runtime-20260902-5';
export const MANACONDA_ASSET_REVISION = 'manaconda-runtime-20260901-3';
export const ACCU_ASSET_REVISION = 'accu-runtime-20260903-3';
export const KRAKEN_ASSET_REVISION = 'kraken-runtime-20260901-2';
export const CLEO_ASSET_REVISION = 'cleo-runtime-20260821-1';
export const KRIOS_ASSET_REVISION = 'krios-runtime-20260901-2';
export const KEEG_ASSET_REVISION = 'keeg-runtime-20260901-3';
export const MCFLEURDEL_ASSET_REVISION = 'mcfleurdel-runtime-20260901-2';
export const TOPH_ASSET_REVISION = 'toph-runtime-20260902-2';
export const LULA_ASSET_REVISION = 'lula-runtime-20260903-3';
export const JENNIFER_ASSET_REVISION = 'jennifer-runtime-20260903-2';
export const DRAGON_QUEEN_ASSET_REVISION = 'dragon-queen-runtime-20260904-1';
export const ALEX_ASSET_REVISION = 'alex-runtime-20260905-1';
export const CHARACTER_SELECTION_ART_REVISION = 'character-select-full-body-20260919-4';

const assetUrl = (path: string, revision: string): string =>
  `${import.meta.env.BASE_URL}${path}?v=${revision}`;

const lavi: CharacterDefinition = {
  id: 'aa-02',
  displayName: 'Lavi',
  descriptor: 'Feather Technician',
  initials: 'LV',
  accent: '#ef7f46',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-02/portrait.png', LAVI_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-02/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'Potato',
  kart: assetUrl('assets/characters/aa-02/kart.glb', LAVI_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  frontDriverSpritePosition: [0, 0.9, -0.12],
  driver: {
    rear: assetUrl('assets/characters/aa-02/driver/rear.png', LAVI_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-02/driver/front.png', LAVI_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-02/driver/steer-left.png', LAVI_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-02/driver/steer-right.png', LAVI_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-02/driver/hit.png', LAVI_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-02/driver/victory.png', LAVI_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-02/driver/front-steer-left.png',
      LAVI_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-02/driver/front-steer-right.png',
      LAVI_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-02/driver/front-hit.png', LAVI_ASSET_REVISION),
    frontVictory: assetUrl('assets/characters/aa-02/driver/front-victory.png', LAVI_ASSET_REVISION),
  },
  stats: { speed: 5, acceleration: 8, weight: 2, handling: 9, miniTurbo: 8, traction: 4 },
};

const manaconda: CharacterDefinition = {
  id: 'aa-09',
  displayName: 'Manaconda',
  descriptor: 'Technical Cruiser',
  initials: 'MN',
  accent: '#5546c8',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-09/portrait.png', MANACONDA_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-09/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Wayfinder',
  kart: assetUrl('assets/characters/aa-09/kart.glb', MANACONDA_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  frontDriverSpritePosition: [0, 0.45, -0.12],
  driver: {
    rear: assetUrl('assets/characters/aa-09/driver/rear.png', MANACONDA_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-09/driver/front.png', MANACONDA_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-09/driver/steer-left.png', MANACONDA_ASSET_REVISION),
    steerRight: assetUrl(
      'assets/characters/aa-09/driver/steer-right.png',
      MANACONDA_ASSET_REVISION,
    ),
    hit: assetUrl('assets/characters/aa-09/driver/hit.png', MANACONDA_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-09/driver/victory.png', MANACONDA_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-09/driver/front-steer-left.png',
      MANACONDA_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-09/driver/front-steer-right.png',
      MANACONDA_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-09/driver/front-hit.png', MANACONDA_ASSET_REVISION),
    frontVictory: assetUrl(
      'assets/characters/aa-09/driver/front-victory.png',
      MANACONDA_ASSET_REVISION,
    ),
  },
  stats: { speed: 7, acceleration: 6, weight: 6, handling: 6, miniTurbo: 6, traction: 5 },
};

const accu: CharacterDefinition = {
  id: 'aa-11',
  displayName: 'Accu',
  descriptor: 'Perfect aim. Maximum armor.',
  initials: 'AC',
  accent: '#ec4d91',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-11/portrait.png', ACCU_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-11/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'Pink Precision',
  kart: assetUrl('assets/characters/aa-11/kart.glb', ACCU_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driverSpritePosition: [0, 0.82, -0.72],
  frontDriverSpritePosition: [0, 0.9, 0.22],
  frontModeledSteeringControlPosition: [0, 1.46, -0.46],
  driverSpriteIncludesSteeringControl: true,
  driver: {
    rear: assetUrl('assets/characters/aa-11/driver/rear.png', ACCU_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-11/driver/front.png', ACCU_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-11/driver/steer-left.png', ACCU_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-11/driver/steer-right.png', ACCU_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-11/driver/hit.png', ACCU_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-11/driver/victory.png', ACCU_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-11/driver/front-steer-left.png',
      ACCU_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-11/driver/front-steer-right.png',
      ACCU_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-11/driver/front-hit.png', ACCU_ASSET_REVISION),
    frontVictory: assetUrl('assets/characters/aa-11/driver/front-victory.png', ACCU_ASSET_REVISION),
  },
  stats: { speed: 8, acceleration: 4, weight: 10, handling: 3, miniTurbo: 5, traction: 6 },
};

const kraken: CharacterDefinition = {
  id: 'aa-05',
  displayName: 'Kraken',
  descriptor: 'Drift Specialist',
  initials: 'KR',
  accent: '#20d9e7',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-05/portrait.png', KRAKEN_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-05/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Abyssal Drifter',
  kart: assetUrl('assets/characters/aa-05/kart.glb', KRAKEN_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driver: {
    rear: assetUrl('assets/characters/aa-05/driver/rear.png', KRAKEN_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-05/driver/front.png', KRAKEN_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-05/driver/steer-left.png', KRAKEN_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-05/driver/steer-right.png', KRAKEN_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-05/driver/hit.png', KRAKEN_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-05/driver/victory.png', KRAKEN_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-05/driver/front-steer-left.png',
      KRAKEN_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-05/driver/front-steer-right.png',
      KRAKEN_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-05/driver/front-hit.png', KRAKEN_ASSET_REVISION),
    frontVictory: assetUrl(
      'assets/characters/aa-05/driver/front-victory.png',
      KRAKEN_ASSET_REVISION,
    ),
  },
  stats: { speed: 6, acceleration: 7, weight: 5, handling: 6, miniTurbo: 9, traction: 3 },
};

// Cleo is intentionally retained as a complete archived definition so her
// approved package can be restored without reconstructing paths, placement, or
// tuning. She is not included in characterManifest and therefore cannot be
// selected by the player or sampled into an AI grid.
export const archivedCleo: CharacterDefinition = {
  id: 'aa-06',
  displayName: 'Cleo',
  descriptor: 'Steady hands. Flawless lines.',
  initials: 'CL',
  accent: '#d79a35',
  assetState: 'production',
  portrait: assetUrl('assets/archive/characters/cleo-aa-06/portrait.png', CLEO_ASSET_REVISION),
  kartName: 'The Gilded Stitch',
  kart: assetUrl('assets/archive/characters/cleo-aa-06/kart.glb', CLEO_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driverSpritePosition: [0, 0.9, -0.72],
  driver: {
    rear: assetUrl('assets/archive/characters/cleo-aa-06/driver/rear.png', CLEO_ASSET_REVISION),
    front: assetUrl('assets/archive/characters/cleo-aa-06/driver/front.png', CLEO_ASSET_REVISION),
    steerLeft: assetUrl(
      'assets/archive/characters/cleo-aa-06/driver/steer-left.png',
      CLEO_ASSET_REVISION,
    ),
    steerRight: assetUrl(
      'assets/archive/characters/cleo-aa-06/driver/steer-right.png',
      CLEO_ASSET_REVISION,
    ),
    hit: assetUrl('assets/archive/characters/cleo-aa-06/driver/hit.png', CLEO_ASSET_REVISION),
    victory: assetUrl(
      'assets/archive/characters/cleo-aa-06/driver/victory.png',
      CLEO_ASSET_REVISION,
    ),
  },
  stats: { speed: 6, acceleration: 6, weight: 5, handling: 7, miniTurbo: 5, traction: 7 },
};

const dragonQueen: CharacterDefinition = {
  id: 'aa-06',
  displayName: 'Dragon Queen',
  descriptor: 'Grip Specialist',
  initials: 'DQ',
  accent: '#d6a437',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-06/portrait.png', DRAGON_QUEEN_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-06/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Sovereign Wyrm',
  kart: assetUrl('assets/characters/aa-06/kart.glb', DRAGON_QUEEN_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driverSpritePosition: [0, 0.95, -0.12],
  frontDriverSpritePosition: [0, 0.84, -0.12],
  driverFramePositions: {
    frontSteerRight: [0, 0.8, -0.12],
  },
  driver: {
    rear: assetUrl('assets/characters/aa-06/driver/rear.png', DRAGON_QUEEN_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-06/driver/front.png', DRAGON_QUEEN_ASSET_REVISION),
    steerLeft: assetUrl(
      'assets/characters/aa-06/driver/steer-left.png',
      DRAGON_QUEEN_ASSET_REVISION,
    ),
    steerRight: assetUrl(
      'assets/characters/aa-06/driver/steer-right.png',
      DRAGON_QUEEN_ASSET_REVISION,
    ),
    hit: assetUrl('assets/characters/aa-06/driver/hit.png', DRAGON_QUEEN_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-06/driver/victory.png', DRAGON_QUEEN_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-06/driver/front-steer-left.png',
      DRAGON_QUEEN_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-06/driver/front-steer-right.png',
      DRAGON_QUEEN_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-06/driver/front-hit.png', DRAGON_QUEEN_ASSET_REVISION),
    frontVictory: assetUrl(
      'assets/characters/aa-06/driver/front-victory.png',
      DRAGON_QUEEN_ASSET_REVISION,
    ),
  },
  stats: { speed: 6, acceleration: 6, weight: 5, handling: 7, miniTurbo: 5, traction: 7 },
};

const krios: CharacterDefinition = {
  id: 'aa-10',
  displayName: 'Krios',
  descriptor: 'Straight-Line Heavy',
  initials: 'KI',
  accent: '#d63b24',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-10/portrait.png', KRIOS_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-10/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Hornbreaker',
  kart: assetUrl('assets/characters/aa-10/kart.glb', KRIOS_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driver: {
    rear: assetUrl('assets/characters/aa-10/driver/rear.png', KRIOS_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-10/driver/front.png', KRIOS_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-10/driver/steer-left.png', KRIOS_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-10/driver/steer-right.png', KRIOS_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-10/driver/hit.png', KRIOS_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-10/driver/victory.png', KRIOS_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-10/driver/front-steer-left.png',
      KRIOS_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-10/driver/front-steer-right.png',
      KRIOS_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-10/driver/front-hit.png', KRIOS_ASSET_REVISION),
    frontVictory: assetUrl(
      'assets/characters/aa-10/driver/front-victory.png',
      KRIOS_ASSET_REVISION,
    ),
  },
  stats: { speed: 10, acceleration: 4, weight: 9, handling: 3, miniTurbo: 4, traction: 6 },
};

const keeg: CharacterDefinition = {
  id: 'aa-04',
  displayName: 'Keeg',
  descriptor: 'Balanced Racer',
  initials: 'KE',
  accent: '#8f4de8',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-04/portrait.png', KEEG_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-04/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Mycelial Majesty',
  kart: assetUrl('assets/characters/aa-04/kart.glb', KEEG_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driverSpritePosition: [0, 0.72, -0.12],
  driver: {
    rear: assetUrl('assets/characters/aa-04/driver/rear.png', KEEG_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-04/driver/front.png', KEEG_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-04/driver/steer-left.png', KEEG_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-04/driver/steer-right.png', KEEG_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-04/driver/hit.png', KEEG_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-04/driver/victory.png', KEEG_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-04/driver/front-steer-left.png',
      KEEG_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-04/driver/front-steer-right.png',
      KEEG_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-04/driver/front-hit.png', KEEG_ASSET_REVISION),
    frontVictory: assetUrl('assets/characters/aa-04/driver/front-victory.png', KEEG_ASSET_REVISION),
  },
  stats: { speed: 7, acceleration: 7, weight: 5, handling: 7, miniTurbo: 5, traction: 5 },
};

const mcfleurdel: CharacterDefinition = {
  id: 'aa-07',
  displayName: 'McFleurdel',
  descriptor: 'High-Speed Cruiser',
  initials: 'MF',
  accent: '#a56be2',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-07/portrait.png', MCFLEURDEL_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-07/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Fleur de Nuit',
  kart: assetUrl('assets/characters/aa-07/kart.glb', MCFLEURDEL_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driver: {
    rear: assetUrl('assets/characters/aa-07/driver/rear.png', MCFLEURDEL_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-07/driver/front.png', MCFLEURDEL_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-07/driver/steer-left.png', MCFLEURDEL_ASSET_REVISION),
    steerRight: assetUrl(
      'assets/characters/aa-07/driver/steer-right.png',
      MCFLEURDEL_ASSET_REVISION,
    ),
    hit: assetUrl('assets/characters/aa-07/driver/hit.png', MCFLEURDEL_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-07/driver/victory.png', MCFLEURDEL_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-07/driver/front-steer-left.png',
      MCFLEURDEL_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-07/driver/front-steer-right.png',
      MCFLEURDEL_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-07/driver/front-hit.png', MCFLEURDEL_ASSET_REVISION),
    frontVictory: assetUrl(
      'assets/characters/aa-07/driver/front-victory.png',
      MCFLEURDEL_ASSET_REVISION,
    ),
  },
  stats: { speed: 8, acceleration: 6, weight: 7, handling: 5, miniTurbo: 4, traction: 6 },
};

const toph: CharacterDefinition = {
  id: 'aa-08',
  displayName: 'Toph',
  descriptor: 'Turbo Bruiser',
  initials: 'TP',
  accent: '#8d45d8',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-08/portrait.png', TOPH_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-08/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Grave Shift',
  kart: assetUrl('assets/characters/aa-08/kart.glb', TOPH_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  frontDriverSpritePosition: [0, 0.45, -0.12],
  driver: {
    rear: assetUrl('assets/characters/aa-08/driver/rear.png', TOPH_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-08/driver/front.png', TOPH_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-08/driver/steer-left.png', TOPH_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-08/driver/steer-right.png', TOPH_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-08/driver/hit.png', TOPH_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-08/driver/victory.png', TOPH_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-08/driver/front-steer-left.png',
      TOPH_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-08/driver/front-steer-right.png',
      TOPH_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-08/driver/front-hit.png', TOPH_ASSET_REVISION),
    frontVictory: assetUrl('assets/characters/aa-08/driver/front-victory.png', TOPH_ASSET_REVISION),
  },
  stats: { speed: 7, acceleration: 5, weight: 7, handling: 4, miniTurbo: 8, traction: 5 },
};

const lula: CharacterDefinition = {
  id: 'aa-03',
  displayName: 'Lula',
  descriptor: 'Feather Dirt Ace',
  initials: 'LU',
  accent: '#4f9f3a',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-03/portrait.png', LULA_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-03/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Verdant Hart',
  kart: assetUrl('assets/characters/aa-03/kart.glb', LULA_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  frontDriverSpritePosition: [0, 0.45, -0.12],
  driver: {
    rear: assetUrl('assets/characters/aa-03/driver/rear.png', LULA_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-03/driver/front.png', LULA_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-03/driver/steer-left.png', LULA_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-03/driver/steer-right.png', LULA_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-03/driver/hit.png', LULA_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-03/driver/victory.png', LULA_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-03/driver/front-steer-left.png',
      LULA_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-03/driver/front-steer-right.png',
      LULA_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-03/driver/front-hit.png', LULA_ASSET_REVISION),
    frontVictory: assetUrl('assets/characters/aa-03/driver/front-victory.png', LULA_ASSET_REVISION),
  },
  stats: { speed: 5, acceleration: 8, weight: 3, handling: 7, miniTurbo: 6, traction: 7 },
};

const jennifer: CharacterDefinition = {
  id: 'aa-12',
  displayName: 'Jennifer',
  descriptor: 'All-Surface Heavy',
  initials: 'JN',
  accent: '#2f8f6b',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-12/portrait.png', JENNIFER_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-12/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Hearthwarden',
  kart: assetUrl('assets/characters/aa-12/kart.glb', JENNIFER_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driverSpritePosition: [0, 0.92, -0.12],
  frontDriverSpritePosition: [0, 0.84, -0.12],
  frontModeledSteeringControlPosition: [0, 1.86, -0.42],
  driver: {
    rear: assetUrl('assets/characters/aa-12/driver/rear.png', JENNIFER_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-12/driver/front.png', JENNIFER_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-12/driver/steer-left.png', JENNIFER_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-12/driver/steer-right.png', JENNIFER_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-12/driver/hit.png', JENNIFER_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-12/driver/victory.png', JENNIFER_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-12/driver/front-steer-left.png',
      JENNIFER_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-12/driver/front-steer-right.png',
      JENNIFER_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-12/driver/front-hit.png', JENNIFER_ASSET_REVISION),
    frontVictory: assetUrl(
      'assets/characters/aa-12/driver/front-victory.png',
      JENNIFER_ASSET_REVISION,
    ),
  },
  stats: { speed: 8, acceleration: 5, weight: 8, handling: 4, miniTurbo: 4, traction: 7 },
};

const alex: CharacterDefinition = {
  id: 'aa-01',
  displayName: 'Alex',
  descriptor: 'Feather Sprinter',
  initials: 'AX',
  accent: '#16d9e8',
  assetState: 'production',
  portrait: assetUrl('assets/characters/aa-01/portrait.png', ALEX_ASSET_REVISION),
  selectionArt: assetUrl(
    'assets/characters/aa-01/selection/full-body.png',
    CHARACTER_SELECTION_ART_REVISION,
  ),
  kartName: 'The Neon Vector',
  kart: assetUrl('assets/characters/aa-01/kart.glb', ALEX_ASSET_REVISION),
  kartVisualYaw: NEGATIVE_Z_KART_VISUAL_YAW,
  driverSpritePosition: [0, 0.92, -0.12],
  frontDriverSpritePosition: [0, 0.84, -0.12],
  driver: {
    rear: assetUrl('assets/characters/aa-01/driver/rear.png', ALEX_ASSET_REVISION),
    front: assetUrl('assets/characters/aa-01/driver/front.png', ALEX_ASSET_REVISION),
    steerLeft: assetUrl('assets/characters/aa-01/driver/steer-left.png', ALEX_ASSET_REVISION),
    steerRight: assetUrl('assets/characters/aa-01/driver/steer-right.png', ALEX_ASSET_REVISION),
    hit: assetUrl('assets/characters/aa-01/driver/hit.png', ALEX_ASSET_REVISION),
    victory: assetUrl('assets/characters/aa-01/driver/victory.png', ALEX_ASSET_REVISION),
    frontSteerLeft: assetUrl(
      'assets/characters/aa-01/driver/front-steer-left.png',
      ALEX_ASSET_REVISION,
    ),
    frontSteerRight: assetUrl(
      'assets/characters/aa-01/driver/front-steer-right.png',
      ALEX_ASSET_REVISION,
    ),
    frontHit: assetUrl('assets/characters/aa-01/driver/front-hit.png', ALEX_ASSET_REVISION),
    frontVictory: assetUrl('assets/characters/aa-01/driver/front-victory.png', ALEX_ASSET_REVISION),
  },
  stats: { speed: 6, acceleration: 9, weight: 2, handling: 8, miniTurbo: 7, traction: 4 },
};

export const characterManifest: readonly CharacterDefinition[] = [
  lavi,
  manaconda,
  accu,
  kraken,
  krios,
  keeg,
  mcfleurdel,
  toph,
  lula,
  jennifer,
  dragonQueen,
  alex,
];

export function validateCharacterManifest(
  manifest: readonly CharacterDefinition[] = characterManifest,
): string[] {
  const errors: string[] = [];
  if (manifest.length !== 12)
    errors.push(`Expected 12 characters; found ${String(manifest.length)}.`);
  const ids = new Set<string>();
  for (const character of manifest) {
    if (ids.has(character.id)) errors.push(`Duplicate character id: ${character.id}.`);
    ids.add(character.id);
    const values = statValues(character.stats);
    if (values.some((value) => !Number.isInteger(value) || value < 1 || value > 10)) {
      errors.push(`${character.id} has a stat outside the 1-10 range.`);
    }
    const total = values.reduce((sum, value) => sum + value, 0);
    if (total !== STAT_TOTAL)
      errors.push(`${character.id} totals ${String(total)}, not ${String(STAT_TOTAL)}.`);
    if (
      character.assetState === 'production' &&
      character.kart !== undefined &&
      character.kartVisualYaw !== NEGATIVE_Z_KART_VISUAL_YAW
    ) {
      errors.push(`${character.id} production kart must use the enforced negative-Z visual yaw.`);
    }
    if (
      character.assetState === 'production' &&
      character.kart !== undefined &&
      !character.kartName
    ) {
      errors.push(`${character.id} production kart must declare its approved name.`);
    }
    if (character.assetState === 'production' && character.driver === undefined) {
      errors.push(`${character.id} production character must declare all driver sprite states.`);
    }
    if (character.assetState === 'production' && character.selectionArt === undefined) {
      errors.push(
        `${character.id} production character must declare selection-only full-body art.`,
      );
    }
  }
  return errors;
}

export function characterById(id: string): CharacterDefinition {
  return characterManifest.find((character) => character.id === id) ?? lavi;
}

export function statValues(stats: CharacterStats): number[] {
  return [
    stats.speed,
    stats.acceleration,
    stats.weight,
    stats.handling,
    stats.miniTurbo,
    stats.traction,
  ];
}
