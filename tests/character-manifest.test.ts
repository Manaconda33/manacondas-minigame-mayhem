import { describe, expect, it } from 'vitest';
import {
  ACCU_ASSET_REVISION,
  ALEX_ASSET_REVISION,
  archivedCleo,
  CHARACTER_SELECTION_ART_REVISION,
  characterById,
  characterManifest,
  DRAGON_QUEEN_ASSET_REVISION,
  LAVI_ASSET_REVISION,
  KRAKEN_ASSET_REVISION,
  KEEG_ASSET_REVISION,
  KRIOS_ASSET_REVISION,
  JENNIFER_ASSET_REVISION,
  MANACONDA_ASSET_REVISION,
  MCFLEURDEL_ASSET_REVISION,
  TOPH_ASSET_REVISION,
  LULA_ASSET_REVISION,
  NEGATIVE_Z_KART_VISUAL_YAW,
  statValues,
  STAT_TOTAL,
  validateCharacterManifest,
} from '../src/characters/manifest';

describe('character manifest', () => {
  it('contains exactly twelve unique, valid profiles', () => {
    expect(validateCharacterManifest()).toEqual([]);
    expect(characterManifest).toHaveLength(12);
    expect(new Set(characterManifest.map(({ id }) => id)).size).toBe(12);
  });

  it('maps every active racer to selection-only full-body art', () => {
    for (const character of characterManifest) {
      expect(character.selectionArt).toContain(
        `/assets/characters/${character.id}/selection/full-body.png?v=${CHARACTER_SELECTION_ART_REVISION}`,
      );
      expect(character.selectionArt).not.toContain('/driver/');
      expect(character.selectionArt).not.toBe(character.driver?.front);
    }
  });

  it('maps Alex to The Neon Vector and the approved AA-01 profile', () => {
    const alex = characterById('aa-01');
    expect(alex.displayName).toBe('Alex');
    expect(alex.descriptor).toBe('Feather Sprinter');
    expect(alex.assetState).toBe('production');
    expect(alex.kartName).toBe('The Neon Vector');
    expect(alex.kart).toContain(`/assets/characters/aa-01/kart.glb?v=${ALEX_ASSET_REVISION}`);
    expect(alex.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(alex.driverSpritePosition).toEqual([0, 0.92, -0.12]);
    expect(alex.frontDriverSpritePosition).toEqual([0, 0.84, -0.12]);
    expect(alex.driverSpriteIncludesSteeringControl).toBeUndefined();
    expect(alex.driver?.rear).toContain(`?v=${ALEX_ASSET_REVISION}`);
    expect(alex.driver?.front).toContain(`?v=${ALEX_ASSET_REVISION}`);
    expect(alex.driver?.steerLeft).toContain(`?v=${ALEX_ASSET_REVISION}`);
    expect(alex.driver?.steerRight).toContain(`?v=${ALEX_ASSET_REVISION}`);
    expect(alex.driver?.hit).toContain(`?v=${ALEX_ASSET_REVISION}`);
    expect(alex.driver?.victory).toContain(`?v=${ALEX_ASSET_REVISION}`);
    expect(alex.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-01/driver/front-steer-left.png?v=${ALEX_ASSET_REVISION}`,
    );
    expect(alex.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-01/driver/front-steer-right.png?v=${ALEX_ASSET_REVISION}`,
    );
    expect(alex.driver?.frontHit).toContain(
      `/assets/characters/aa-01/driver/front-hit.png?v=${ALEX_ASSET_REVISION}`,
    );
    expect(alex.driver?.frontVictory).toContain(
      `/assets/characters/aa-01/driver/front-victory.png?v=${ALEX_ASSET_REVISION}`,
    );
    expect(alex.stats).toEqual({
      speed: 6,
      acceleration: 9,
      weight: 2,
      handling: 8,
      miniTurbo: 7,
      traction: 4,
    });
  });

  it('maps Manaconda to the approved production package and AA-09 profile', () => {
    const manaconda = characterById('aa-09');
    expect(manaconda.displayName).toBe('Manaconda');
    expect(manaconda.assetState).toBe('production');
    expect(manaconda.kart).toContain(
      `/assets/characters/aa-09/kart.glb?v=${MANACONDA_ASSET_REVISION}`,
    );
    expect(manaconda.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(manaconda.frontDriverSpritePosition).toEqual([0, 0.45, -0.12]);
    expect(manaconda.driver?.rear).toContain(`?v=${MANACONDA_ASSET_REVISION}`);
    expect(manaconda.driver?.front).toContain(`?v=${MANACONDA_ASSET_REVISION}`);
    expect(manaconda.driver?.steerLeft).toContain(`?v=${MANACONDA_ASSET_REVISION}`);
    expect(manaconda.driver?.steerRight).toContain(`?v=${MANACONDA_ASSET_REVISION}`);
    expect(manaconda.driver?.hit).toContain(`?v=${MANACONDA_ASSET_REVISION}`);
    expect(manaconda.driver?.victory).toContain(`?v=${MANACONDA_ASSET_REVISION}`);
    expect(manaconda.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-09/driver/front-steer-left.png?v=${MANACONDA_ASSET_REVISION}`,
    );
    expect(manaconda.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-09/driver/front-steer-right.png?v=${MANACONDA_ASSET_REVISION}`,
    );
    expect(manaconda.driver?.frontHit).toContain(
      `/assets/characters/aa-09/driver/front-hit.png?v=${MANACONDA_ASSET_REVISION}`,
    );
    expect(manaconda.driver?.frontVictory).toContain(
      `/assets/characters/aa-09/driver/front-victory.png?v=${MANACONDA_ASSET_REVISION}`,
    );
    expect(manaconda.stats).toEqual({
      speed: 7,
      acceleration: 6,
      weight: 6,
      handling: 6,
      miniTurbo: 6,
      traction: 5,
    });
  });

  it('maps Accu to Pink Precision and the approved AA-11 profile', () => {
    const accu = characterById('aa-11');
    expect(accu.displayName).toBe('Accu');
    expect(accu.descriptor).toBe('Perfect aim. Maximum armor.');
    expect(accu.assetState).toBe('production');
    expect(accu.kart).toContain(`/assets/characters/aa-11/kart.glb?v=${ACCU_ASSET_REVISION}`);
    expect(accu.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(accu.driverSpritePosition).toEqual([0, 0.82, -0.72]);
    expect(accu.frontDriverSpritePosition).toEqual([0, 0.9, 0.22]);
    expect(accu.frontModeledSteeringControlPosition).toEqual([0, 1.46, -0.46]);
    expect(accu.driverSpriteIncludesSteeringControl).toBe(true);
    expect(accu.driver?.rear).toContain(`?v=${ACCU_ASSET_REVISION}`);
    expect(accu.driver?.front).toContain(`?v=${ACCU_ASSET_REVISION}`);
    expect(accu.driver?.steerLeft).toContain(`?v=${ACCU_ASSET_REVISION}`);
    expect(accu.driver?.steerRight).toContain(`?v=${ACCU_ASSET_REVISION}`);
    expect(accu.driver?.hit).toContain(`?v=${ACCU_ASSET_REVISION}`);
    expect(accu.driver?.victory).toContain(`?v=${ACCU_ASSET_REVISION}`);
    expect(accu.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-11/driver/front-steer-left.png?v=${ACCU_ASSET_REVISION}`,
    );
    expect(accu.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-11/driver/front-steer-right.png?v=${ACCU_ASSET_REVISION}`,
    );
    expect(accu.driver?.frontHit).toContain(
      `/assets/characters/aa-11/driver/front-hit.png?v=${ACCU_ASSET_REVISION}`,
    );
    expect(accu.driver?.frontVictory).toContain(
      `/assets/characters/aa-11/driver/front-victory.png?v=${ACCU_ASSET_REVISION}`,
    );
    expect(accu.stats).toEqual({
      speed: 8,
      acceleration: 4,
      weight: 10,
      handling: 3,
      miniTurbo: 5,
      traction: 6,
    });
  });

  it('maps Kraken to The Abyssal Drifter and the approved AA-05 profile', () => {
    const kraken = characterById('aa-05');
    expect(kraken.displayName).toBe('Kraken');
    expect(kraken.descriptor).toBe('Drift Specialist');
    expect(kraken.assetState).toBe('production');
    expect(kraken.kart).toContain(`/assets/characters/aa-05/kart.glb?v=${KRAKEN_ASSET_REVISION}`);
    expect(kraken.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(kraken.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-05/driver/front-steer-left.png?v=${KRAKEN_ASSET_REVISION}`,
    );
    expect(kraken.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-05/driver/front-steer-right.png?v=${KRAKEN_ASSET_REVISION}`,
    );
    expect(kraken.driver?.frontHit).toContain(
      `/assets/characters/aa-05/driver/front-hit.png?v=${KRAKEN_ASSET_REVISION}`,
    );
    expect(kraken.driver?.frontVictory).toContain(
      `/assets/characters/aa-05/driver/front-victory.png?v=${KRAKEN_ASSET_REVISION}`,
    );
    expect(kraken.driver?.rear).toContain(`?v=${KRAKEN_ASSET_REVISION}`);
    expect(kraken.driver?.front).toContain(`?v=${KRAKEN_ASSET_REVISION}`);
    expect(kraken.driver?.steerLeft).toContain(`?v=${KRAKEN_ASSET_REVISION}`);
    expect(kraken.driver?.steerRight).toContain(`?v=${KRAKEN_ASSET_REVISION}`);
    expect(kraken.driver?.hit).toContain(`?v=${KRAKEN_ASSET_REVISION}`);
    expect(kraken.driver?.victory).toContain(`?v=${KRAKEN_ASSET_REVISION}`);
    expect(kraken.stats).toEqual({
      speed: 6,
      acceleration: 7,
      weight: 5,
      handling: 6,
      miniTurbo: 9,
      traction: 3,
    });
  });

  it('maps Dragon Queen to The Sovereign Wyrm and preserves Cleo in the archive', () => {
    const aa06 = characterById('aa-06');
    expect(aa06.displayName).toBe('Dragon Queen');
    expect(aa06.descriptor).toBe('Grip Specialist');
    expect(aa06.assetState).toBe('production');
    expect(aa06.kartName).toBe('The Sovereign Wyrm');
    expect(aa06.kart).toContain(
      `/assets/characters/aa-06/kart.glb?v=${DRAGON_QUEEN_ASSET_REVISION}`,
    );
    expect(aa06.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(aa06.driverSpritePosition).toEqual([0, 0.95, -0.12]);
    expect(aa06.frontDriverSpritePosition).toEqual([0, 0.84, -0.12]);
    expect(aa06.driverFramePositions).toEqual({
      frontSteerRight: [0, 0.8, -0.12],
    });
    expect(aa06.driver?.rear).toContain(`?v=${DRAGON_QUEEN_ASSET_REVISION}`);
    expect(aa06.driver?.front).toContain(`?v=${DRAGON_QUEEN_ASSET_REVISION}`);
    expect(aa06.driver?.steerLeft).toContain(`?v=${DRAGON_QUEEN_ASSET_REVISION}`);
    expect(aa06.driver?.steerRight).toContain(`?v=${DRAGON_QUEEN_ASSET_REVISION}`);
    expect(aa06.driver?.hit).toContain(`?v=${DRAGON_QUEEN_ASSET_REVISION}`);
    expect(aa06.driver?.victory).toContain(`?v=${DRAGON_QUEEN_ASSET_REVISION}`);
    expect(aa06.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-06/driver/front-steer-left.png?v=${DRAGON_QUEEN_ASSET_REVISION}`,
    );
    expect(aa06.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-06/driver/front-steer-right.png?v=${DRAGON_QUEEN_ASSET_REVISION}`,
    );
    expect(aa06.driver?.frontHit).toContain(
      `/assets/characters/aa-06/driver/front-hit.png?v=${DRAGON_QUEEN_ASSET_REVISION}`,
    );
    expect(aa06.driver?.frontVictory).toContain(
      `/assets/characters/aa-06/driver/front-victory.png?v=${DRAGON_QUEEN_ASSET_REVISION}`,
    );
    expect(aa06.stats).toEqual({
      speed: 6,
      acceleration: 6,
      weight: 5,
      handling: 7,
      miniTurbo: 5,
      traction: 7,
    });
    expect(characterManifest.some(({ displayName }) => displayName === 'Cleo')).toBe(false);

    expect(archivedCleo.displayName).toBe('Cleo');
    expect(archivedCleo.assetState).toBe('production');
    expect(archivedCleo.kart).toContain('/assets/archive/characters/cleo-aa-06/kart.glb');
    expect(archivedCleo.driverSpritePosition).toEqual([0, 0.9, -0.72]);
    expect(archivedCleo.driver?.front).toContain(
      '/assets/archive/characters/cleo-aa-06/driver/front.png',
    );
    expect(archivedCleo.driver?.victory).toContain(
      '/assets/archive/characters/cleo-aa-06/driver/victory.png',
    );
  });

  it('maps Krios to The Hornbreaker and the approved AA-10 profile', () => {
    const krios = characterById('aa-10');
    expect(krios.displayName).toBe('Krios');
    expect(krios.descriptor).toBe('Straight-Line Heavy');
    expect(krios.assetState).toBe('production');
    expect(krios.kart).toContain(`/assets/characters/aa-10/kart.glb?v=${KRIOS_ASSET_REVISION}`);
    expect(krios.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(krios.driver?.rear).toContain(`?v=${KRIOS_ASSET_REVISION}`);
    expect(krios.driver?.front).toContain(`?v=${KRIOS_ASSET_REVISION}`);
    expect(krios.driver?.steerLeft).toContain(`?v=${KRIOS_ASSET_REVISION}`);
    expect(krios.driver?.steerRight).toContain(`?v=${KRIOS_ASSET_REVISION}`);
    expect(krios.driver?.hit).toContain(`?v=${KRIOS_ASSET_REVISION}`);
    expect(krios.driver?.victory).toContain(`?v=${KRIOS_ASSET_REVISION}`);
    expect(krios.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-10/driver/front-steer-left.png?v=${KRIOS_ASSET_REVISION}`,
    );
    expect(krios.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-10/driver/front-steer-right.png?v=${KRIOS_ASSET_REVISION}`,
    );
    expect(krios.driver?.frontHit).toContain(
      `/assets/characters/aa-10/driver/front-hit.png?v=${KRIOS_ASSET_REVISION}`,
    );
    expect(krios.driver?.frontVictory).toContain(
      `/assets/characters/aa-10/driver/front-victory.png?v=${KRIOS_ASSET_REVISION}`,
    );
    expect(krios.stats).toEqual({
      speed: 10,
      acceleration: 4,
      weight: 9,
      handling: 3,
      miniTurbo: 4,
      traction: 6,
    });
  });

  it('maps Keeg to The Mycelial Majesty and the approved AA-04 profile', () => {
    const keeg = characterById('aa-04');
    expect(keeg.displayName).toBe('Keeg');
    expect(keeg.descriptor).toBe('Balanced Racer');
    expect(keeg.assetState).toBe('production');
    expect(keeg.kartName).toBe('The Mycelial Majesty');
    expect(keeg.kart).toContain(`/assets/characters/aa-04/kart.glb?v=${KEEG_ASSET_REVISION}`);
    expect(keeg.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(keeg.driverSpritePosition).toEqual([0, 0.72, -0.12]);
    expect(keeg.driver?.rear).toContain(`?v=${KEEG_ASSET_REVISION}`);
    expect(keeg.driver?.front).toContain(`?v=${KEEG_ASSET_REVISION}`);
    expect(keeg.driver?.steerLeft).toContain(`?v=${KEEG_ASSET_REVISION}`);
    expect(keeg.driver?.steerRight).toContain(`?v=${KEEG_ASSET_REVISION}`);
    expect(keeg.driver?.hit).toContain(`?v=${KEEG_ASSET_REVISION}`);
    expect(keeg.driver?.victory).toContain(`?v=${KEEG_ASSET_REVISION}`);
    expect(keeg.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-04/driver/front-steer-left.png?v=${KEEG_ASSET_REVISION}`,
    );
    expect(keeg.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-04/driver/front-steer-right.png?v=${KEEG_ASSET_REVISION}`,
    );
    expect(keeg.driver?.frontHit).toContain(
      `/assets/characters/aa-04/driver/front-hit.png?v=${KEEG_ASSET_REVISION}`,
    );
    expect(keeg.driver?.frontVictory).toContain(
      `/assets/characters/aa-04/driver/front-victory.png?v=${KEEG_ASSET_REVISION}`,
    );
    expect(keeg.stats).toEqual({
      speed: 7,
      acceleration: 7,
      weight: 5,
      handling: 7,
      miniTurbo: 5,
      traction: 5,
    });
  });

  it('maps McFleurdel to The Fleur de Nuit and the approved AA-07 profile', () => {
    const mcfleurdel = characterById('aa-07');
    expect(mcfleurdel.displayName).toBe('McFleurdel');
    expect(mcfleurdel.descriptor).toBe('High-Speed Cruiser');
    expect(mcfleurdel.assetState).toBe('production');
    expect(mcfleurdel.kartName).toBe('The Fleur de Nuit');
    expect(mcfleurdel.kart).toContain(
      `/assets/characters/aa-07/kart.glb?v=${MCFLEURDEL_ASSET_REVISION}`,
    );
    expect(mcfleurdel.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(mcfleurdel.driver?.rear).toContain(`?v=${MCFLEURDEL_ASSET_REVISION}`);
    expect(mcfleurdel.driver?.front).toContain(`?v=${MCFLEURDEL_ASSET_REVISION}`);
    expect(mcfleurdel.driver?.steerLeft).toContain(`?v=${MCFLEURDEL_ASSET_REVISION}`);
    expect(mcfleurdel.driver?.steerRight).toContain(`?v=${MCFLEURDEL_ASSET_REVISION}`);
    expect(mcfleurdel.driver?.hit).toContain(`?v=${MCFLEURDEL_ASSET_REVISION}`);
    expect(mcfleurdel.driver?.victory).toContain(`?v=${MCFLEURDEL_ASSET_REVISION}`);
    expect(mcfleurdel.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-07/driver/front-steer-left.png?v=${MCFLEURDEL_ASSET_REVISION}`,
    );
    expect(mcfleurdel.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-07/driver/front-steer-right.png?v=${MCFLEURDEL_ASSET_REVISION}`,
    );
    expect(mcfleurdel.driver?.frontHit).toContain(
      `/assets/characters/aa-07/driver/front-hit.png?v=${MCFLEURDEL_ASSET_REVISION}`,
    );
    expect(mcfleurdel.driver?.frontVictory).toContain(
      `/assets/characters/aa-07/driver/front-victory.png?v=${MCFLEURDEL_ASSET_REVISION}`,
    );
    expect(mcfleurdel.stats).toEqual({
      speed: 8,
      acceleration: 6,
      weight: 7,
      handling: 5,
      miniTurbo: 4,
      traction: 6,
    });
  });

  it.each(characterManifest.map((character) => [character.id, character.stats] as const))(
    '%s totals 36',
    (_id, stats) => {
      expect(statValues(stats).reduce((sum, value) => sum + value, 0)).toBe(STAT_TOTAL);
    },
  );

  it('maps Lavi to the approved production package and profile', () => {
    const lavi = characterById('aa-02');
    expect(lavi.displayName).toBe('Lavi');
    expect(lavi.assetState).toBe('production');
    expect(lavi.kart).toContain(`/assets/characters/aa-02/kart.glb?v=${LAVI_ASSET_REVISION}`);
    expect(lavi.frontDriverSpritePosition).toEqual([0, 0.9, -0.12]);
    expect(lavi.driver?.front).toContain(`?v=${LAVI_ASSET_REVISION}`);
    expect(lavi.driver?.steerLeft).toContain(`?v=${LAVI_ASSET_REVISION}`);
    expect(lavi.driver?.steerRight).toContain(`?v=${LAVI_ASSET_REVISION}`);
    expect(lavi.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-02/driver/front-steer-left.png?v=${LAVI_ASSET_REVISION}`,
    );
    expect(lavi.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-02/driver/front-steer-right.png?v=${LAVI_ASSET_REVISION}`,
    );
    expect(lavi.driver?.frontHit).toContain(
      `/assets/characters/aa-02/driver/front-hit.png?v=${LAVI_ASSET_REVISION}`,
    );
    expect(lavi.driver?.frontVictory).toContain(
      `/assets/characters/aa-02/driver/front-victory.png?v=${LAVI_ASSET_REVISION}`,
    );
    expect(lavi.stats).toEqual({
      speed: 5,
      acceleration: 8,
      weight: 2,
      handling: 9,
      miniTurbo: 8,
      traction: 4,
    });
  });

  it('falls back to Lavi for an unknown selection id', () => {
    expect(characterById('missing').id).toBe('aa-02');
  });

  it('rejects a production kart that bypasses the enforced orientation contract', () => {
    const invalid = characterManifest.map((character) =>
      character.id === 'aa-11' ? { ...character, kartVisualYaw: 0 } : character,
    );
    expect(validateCharacterManifest(invalid)).toContain(
      'aa-11 production kart must use the enforced negative-Z visual yaw.',
    );
  });
  it('maps Toph to The Grave Shift and the approved AA-08 profile', () => {
    const toph = characterById('aa-08');
    expect(toph.displayName).toBe('Toph');
    expect(toph.descriptor).toBe('Turbo Bruiser');
    expect(toph.assetState).toBe('production');
    expect(toph.kartName).toBe('The Grave Shift');
    expect(toph.kart).toContain(`/assets/characters/aa-08/kart.glb?v=${TOPH_ASSET_REVISION}`);
    expect(toph.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(toph.frontDriverSpritePosition).toEqual([0, 0.45, -0.12]);
    expect(toph.driver?.rear).toContain(`?v=${TOPH_ASSET_REVISION}`);
    expect(toph.driver?.front).toContain(`?v=${TOPH_ASSET_REVISION}`);
    expect(toph.driver?.steerLeft).toContain(`?v=${TOPH_ASSET_REVISION}`);
    expect(toph.driver?.steerRight).toContain(`?v=${TOPH_ASSET_REVISION}`);
    expect(toph.driver?.hit).toContain(`?v=${TOPH_ASSET_REVISION}`);
    expect(toph.driver?.victory).toContain(`?v=${TOPH_ASSET_REVISION}`);
    expect(toph.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-08/driver/front-steer-left.png?v=${TOPH_ASSET_REVISION}`,
    );
    expect(toph.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-08/driver/front-steer-right.png?v=${TOPH_ASSET_REVISION}`,
    );
    expect(toph.driver?.frontHit).toContain(
      `/assets/characters/aa-08/driver/front-hit.png?v=${TOPH_ASSET_REVISION}`,
    );
    expect(toph.driver?.frontVictory).toContain(
      `/assets/characters/aa-08/driver/front-victory.png?v=${TOPH_ASSET_REVISION}`,
    );
    expect(toph.stats).toEqual({
      speed: 7,
      acceleration: 5,
      weight: 7,
      handling: 4,
      miniTurbo: 8,
      traction: 5,
    });
  });

  it('maps Lula to The Verdant Hart and the approved AA-03 profile', () => {
    const lula = characterById('aa-03');
    expect(lula.displayName).toBe('Lula');
    expect(lula.descriptor).toBe('Feather Dirt Ace');
    expect(lula.assetState).toBe('production');
    expect(lula.kartName).toBe('The Verdant Hart');
    expect(lula.kart).toContain(`/assets/characters/aa-03/kart.glb?v=${LULA_ASSET_REVISION}`);
    expect(lula.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(lula.frontDriverSpritePosition).toEqual([0, 0.45, -0.12]);
    expect(lula.driver?.rear).toContain(`?v=${LULA_ASSET_REVISION}`);
    expect(lula.driver?.front).toContain(`?v=${LULA_ASSET_REVISION}`);
    expect(lula.driver?.steerLeft).toContain(`?v=${LULA_ASSET_REVISION}`);
    expect(lula.driver?.steerRight).toContain(`?v=${LULA_ASSET_REVISION}`);
    expect(lula.driver?.hit).toContain(`?v=${LULA_ASSET_REVISION}`);
    expect(lula.driver?.victory).toContain(`?v=${LULA_ASSET_REVISION}`);
    expect(lula.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-03/driver/front-steer-left.png?v=${LULA_ASSET_REVISION}`,
    );
    expect(lula.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-03/driver/front-steer-right.png?v=${LULA_ASSET_REVISION}`,
    );
    expect(lula.driver?.frontHit).toContain(
      `/assets/characters/aa-03/driver/front-hit.png?v=${LULA_ASSET_REVISION}`,
    );
    expect(lula.driver?.frontVictory).toContain(
      `/assets/characters/aa-03/driver/front-victory.png?v=${LULA_ASSET_REVISION}`,
    );
    expect(lula.stats).toEqual({
      speed: 5,
      acceleration: 8,
      weight: 3,
      handling: 7,
      miniTurbo: 6,
      traction: 7,
    });
  });

  it('maps Jennifer to The Hearthwarden and the approved AA-12 profile', () => {
    const jennifer = characterById('aa-12');
    expect(jennifer.displayName).toBe('Jennifer');
    expect(jennifer.descriptor).toBe('All-Surface Heavy');
    expect(jennifer.assetState).toBe('production');
    expect(jennifer.kartName).toBe('The Hearthwarden');
    expect(jennifer.kart).toContain(
      `/assets/characters/aa-12/kart.glb?v=${JENNIFER_ASSET_REVISION}`,
    );
    expect(jennifer.kartVisualYaw).toBe(NEGATIVE_Z_KART_VISUAL_YAW);
    expect(jennifer.driverSpritePosition).toEqual([0, 0.92, -0.12]);
    expect(jennifer.frontDriverSpritePosition).toEqual([0, 0.84, -0.12]);
    expect(jennifer.frontModeledSteeringControlPosition).toEqual([0, 1.86, -0.42]);
    expect(jennifer.driverSpriteIncludesSteeringControl).toBeUndefined();
    expect(jennifer.driver?.rear).toContain(`?v=${JENNIFER_ASSET_REVISION}`);
    expect(jennifer.driver?.front).toContain(`?v=${JENNIFER_ASSET_REVISION}`);
    expect(jennifer.driver?.steerLeft).toContain(`?v=${JENNIFER_ASSET_REVISION}`);
    expect(jennifer.driver?.steerRight).toContain(`?v=${JENNIFER_ASSET_REVISION}`);
    expect(jennifer.driver?.hit).toContain(`?v=${JENNIFER_ASSET_REVISION}`);
    expect(jennifer.driver?.victory).toContain(`?v=${JENNIFER_ASSET_REVISION}`);
    expect(jennifer.driver?.frontSteerLeft).toContain(
      `/assets/characters/aa-12/driver/front-steer-left.png?v=${JENNIFER_ASSET_REVISION}`,
    );
    expect(jennifer.driver?.frontSteerRight).toContain(
      `/assets/characters/aa-12/driver/front-steer-right.png?v=${JENNIFER_ASSET_REVISION}`,
    );
    expect(jennifer.driver?.frontHit).toContain(
      `/assets/characters/aa-12/driver/front-hit.png?v=${JENNIFER_ASSET_REVISION}`,
    );
    expect(jennifer.driver?.frontVictory).toContain(
      `/assets/characters/aa-12/driver/front-victory.png?v=${JENNIFER_ASSET_REVISION}`,
    );
    expect(jennifer.stats).toEqual({
      speed: 8,
      acceleration: 5,
      weight: 8,
      handling: 4,
      miniTurbo: 4,
      traction: 7,
    });
  });
});
