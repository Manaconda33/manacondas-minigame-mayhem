/** Debounce committed edits; a held/cancelled drag never consumes the pending save. */
export class EditorAutosave {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private generation = 0;
  private disposed = false;
  private saving = false;
  public constructor(
    private readonly busy: () => boolean,
    private readonly save: (isCurrent: () => boolean) => Promise<void>,
    private readonly delay = 600,
  ) {}
  public schedule(): void {
    if (this.disposed) return;
    const token = ++this.generation;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.flush(token);
    }, this.delay);
  }
  private async flush(token: number): Promise<void> {
    if (this.disposed || token !== this.generation) return;
    if (this.busy() || this.saving) {
      this.schedule();
      return;
    }
    this.saving = true;
    try {
      await this.save(() => !this.disposed && token === this.generation && !this.busy());
    } finally {
      this.saving = false;
    }
  }
  public dispose(): void {
    this.disposed = true;
    this.generation++;
    if (this.timer) clearTimeout(this.timer);
  }
}
