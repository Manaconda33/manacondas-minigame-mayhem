import { assertJournalCapacity } from './EditorJournal';
import {
  cloneData,
  designState,
  type DesignState,
  type EditorDocument,
  requireValue,
} from './EditorDocument';
/** A preview always starts at the gesture's original state, avoiding accumulated drag error. */
export class EditorHistory {
  private document: EditorDocument;
  private pending: {
    label: string;
    before: DesignState;
  } | null = null;
  private saved: string;
  public revision = 0;
  public constructor(document: EditorDocument) {
    this.document = cloneData(document);
    this.saved = JSON.stringify(designState(document));
  }
  public get canUndo(): boolean {
    return this.document.history.cursor > 0 && this.pending === null;
  }
  public get canRedo(): boolean {
    return (
      this.document.history.cursor < this.document.history.actions.length && this.pending === null
    );
  }
  public get inGesture(): boolean {
    return this.pending !== null;
  }
  public get dirty(): boolean {
    return JSON.stringify(designState(this.document)) !== this.saved;
  }
  public snapshot(): EditorDocument {
    return cloneData(this.document);
  }
  public view(): EditorDocument['view'] {
    return cloneData(this.document.view);
  }
  public begin(label: string): void {
    if (this.pending) throw new Error('Finish the current edit first.');
    this.revision++;
    this.pending = { label, before: designState(this.document) };
  }
  public preview(mutate: (state: DesignState) => void): void {
    if (!this.pending) throw new Error('No active edit.');
    const state = cloneData(this.pending.before);
    mutate(state);
    Object.assign(this.document, state);
    this.revision++;
  }
  public commit(): void {
    if (!this.pending) return;
    const { before, label } = this.pending;
    const after = designState(this.document);
    this.pending = null;
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    const journal = this.document.history;
    const actions = [
      ...journal.actions.slice(0, journal.cursor),
      { id: crypto.randomUUID(), label, before, after },
    ];
    try {
      assertJournalCapacity({ actions, cursor: actions.length }, after);
    } catch (error) {
      Object.assign(this.document, cloneData(before));
      throw error;
    }
    journal.actions = actions;
    journal.cursor = actions.length;
    this.revision++;
  }
  public cancel(): void {
    if (this.pending) Object.assign(this.document, cloneData(this.pending.before));
    this.pending = null;
    this.revision++;
  }
  public apply(label: string, mutate: (state: DesignState) => void): void {
    this.begin(label);
    try {
      this.preview(mutate);
      this.commit();
    } catch (error) {
      this.cancel();
      throw error;
    }
  }
  public undo(): void {
    if (!this.canUndo) return;
    const journal = this.document.history;
    Object.assign(
      this.document,
      cloneData(requireValue(journal.actions[journal.cursor - 1]).before),
    );
    journal.cursor--;
    this.revision++;
  }
  public redo(): void {
    if (!this.canRedo) return;
    const journal = this.document.history;
    Object.assign(this.document, cloneData(requireValue(journal.actions[journal.cursor]).after));
    journal.cursor++;
    this.revision++;
  }
  public markSaved(expectedRevision = this.revision): boolean {
    if (this.pending || expectedRevision !== this.revision) return false;
    this.saved = JSON.stringify(designState(this.document));
    return true;
  }
  public setView(view: EditorDocument['view']): void {
    this.document.view = cloneData(view);
  }
  public setWarnings(warnings: string[]): void {
    this.document.warnings = [...warnings];
  }
}
