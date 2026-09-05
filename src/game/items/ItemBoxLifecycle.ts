export type ItemBoxPhase = 'available' | 'popping' | 'hidden' | 'respawning';

export interface ItemBoxPresentation {
  phase: ItemBoxPhase;
  visible: boolean;
  collectible: boolean;
  opacity: number;
  scale: number;
}

export const ITEM_BOX_TIMING = {
  respawnSeconds: 4.5,
  popSeconds: 0.12,
  fadeSeconds: 0.45,
  popScale: 1.3,
  fadeStartScale: 0.88,
} as const;

export class ItemBoxLifecycle {
  private elapsedSinceCollection: number | null = null;

  public collect(): boolean {
    if (this.elapsedSinceCollection !== null) return false;
    this.elapsedSinceCollection = 0;
    return true;
  }

  public advance(dt: number): void {
    if (this.elapsedSinceCollection === null || dt <= 0) return;

    this.elapsedSinceCollection += dt;
    if (this.elapsedSinceCollection >= ITEM_BOX_TIMING.respawnSeconds) {
      this.elapsedSinceCollection = null;
    }
  }

  public isCollectible(): boolean {
    return this.elapsedSinceCollection === null;
  }

  public presentation(): ItemBoxPresentation {
    const elapsed = this.elapsedSinceCollection;
    if (elapsed === null) {
      return {
        phase: 'available',
        visible: true,
        collectible: true,
        opacity: 1,
        scale: 1,
      };
    }

    if (elapsed < ITEM_BOX_TIMING.popSeconds) {
      const progress = elapsed / ITEM_BOX_TIMING.popSeconds;
      return {
        phase: 'popping',
        visible: true,
        collectible: false,
        opacity: 1 - progress,
        scale: 1 + (ITEM_BOX_TIMING.popScale - 1) * progress,
      };
    }

    const fadeStart = ITEM_BOX_TIMING.respawnSeconds - ITEM_BOX_TIMING.fadeSeconds;
    if (elapsed < fadeStart) {
      return {
        phase: 'hidden',
        visible: false,
        collectible: false,
        opacity: 0,
        scale: 0,
      };
    }

    const fadeProgress = Math.min(
      1,
      Math.max(0, (elapsed - fadeStart) / ITEM_BOX_TIMING.fadeSeconds),
    );
    return {
      phase: 'respawning',
      visible: true,
      collectible: false,
      opacity: fadeProgress,
      scale:
        ITEM_BOX_TIMING.fadeStartScale +
        (1 - ITEM_BOX_TIMING.fadeStartScale) * fadeProgress,
    };
  }
}
