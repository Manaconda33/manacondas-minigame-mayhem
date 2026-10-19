import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorAutosave } from '../src/editor/neon-grid/EditorAutosave';
afterEach(() => vi.useRealTimers());
describe('committed edit recovery scheduling', () => {
  it('retries saving edit A after drag B holds across debounce and is cancelled', async () => {
    vi.useFakeTimers();
    let dragging = false;
    let design = 'A';
    const saved: string[] = [];
    const save = new EditorAutosave(
      () => dragging,
      () => {
        saved.push(design);
        return Promise.resolve();
      },
    );
    save.schedule();
    dragging = true;
    design = 'B preview';
    await vi.advanceTimersByTimeAsync(1200);
    expect(saved).toEqual([]);
    dragging = false;
    design = 'A';
    await vi.advanceTimersByTimeAsync(600);
    expect(saved).toEqual(['A']);
    save.dispose();
  });
  it('invalidates stale asynchronous saves and stops after disposal', async () => {
    vi.useFakeTimers();
    let finish: () => void = () => {
      throw new Error('Save has not started.');
    };
    let stale = false;
    const save = new EditorAutosave(
      () => false,
      async (isCurrent) => {
        await new Promise<void>((r) => {
          finish = r;
        });
        stale = !isCurrent();
      },
    );
    save.schedule();
    await vi.advanceTimersByTimeAsync(600);
    save.schedule();
    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(stale).toBe(true);
    save.dispose();
    await vi.advanceTimersByTimeAsync(600);
  });
});
