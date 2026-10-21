import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountAppShell } from '../src/app/mountAppShell';

const { createGame } = vi.hoisted(() => ({ createGame: vi.fn() }));

vi.mock('../src/game/KartTimeTrial', () => ({
  KartTimeTrial: { create: createGame },
}));

vi.mock('../src/ui/characterKartPreview', () => ({
  CharacterKartPreview: class {
    dispose() {
      return undefined;
    }
  },
}));

describe('race startup diagnostics', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('shows the rejected initialization stage and error instead of leaving the spinner', async () => {
    createGame.mockRejectedValueOnce(new Error('Synthetic owner-layout source failure'));
    const root = document.createElement('div');
    document.body.append(root);
    const dispose = mountAppShell(root);

    root.querySelector<HTMLElement>('[data-action="enter"]')?.click();
    root.querySelector<HTMLElement>('[data-action="play-neon-grid"]')?.click();
    root.querySelector<HTMLElement>('[data-action="confirm-character"]')?.click();

    await vi.waitFor(() => {
      expect(root.querySelector<HTMLElement>('#loading-error')?.textContent).toBe(
        'Synthetic owner-layout source failure',
      );
    });

    expect(root.querySelector<HTMLElement>('#loading-stage')?.textContent).toBe(
      'Stopped during: Loading game code',
    );
    expect(root.querySelector<HTMLElement>('#loading')?.dataset.state).toBe('error');
    expect(root.querySelector<HTMLButtonElement>('#loading-retry')?.hidden).toBe(false);

    dispose();
    root.remove();
  });
});
