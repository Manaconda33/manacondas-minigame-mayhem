import { expect, it, vi } from 'vitest';
import { uiSfx } from '../src/audio/uiSfx';
it('silences menu and results voices when the document becomes hidden', () => {
  const pause = vi.spyOn(uiSfx, 'setPaused');
  try {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(pause).toHaveBeenLastCalledWith(true);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(pause).toHaveBeenLastCalledWith(false);
  } finally {
    Reflect.deleteProperty(document, 'hidden');
    pause.mockRestore();
  }
});
