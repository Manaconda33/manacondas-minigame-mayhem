import type { NeonGrid } from '../../game/track/NeonGrid';
import {
  cloneData,
  createEditorDocument,
  type DesignState,
  type EditorBaseline,
  type EditorDocument,
} from './EditorDocument';
import { decodeDocument, encodeDocument } from './EditorCodec';
import { EditorHistory } from './EditorHistory';
import { EditorProjection } from './EditorProjection';
import type { EditorCatalogue } from './ComponentCatalogue';
/** Owns the transaction boundary between valid serializable data and scene projection. */
export class EditorSession {
  public history: EditorHistory;
  public readonly projection: EditorProjection;
  private readonly original: EditorDocument;
  private disposed = false;
  public constructor(
    public readonly catalogue: EditorCatalogue,
    track: NeonGrid,
    public readonly baseline: EditorBaseline,
  ) {
    this.original = createEditorDocument(baseline);
    this.original.road = cloneData(catalogue.baselineRoad);
    this.history = new EditorHistory(this.original);
    this.projection = new EditorProjection(catalogue, track);
    this.projection.apply(this.original);
  }
  public edit(label: string, mutate: (state: DesignState) => void): void {
    this.history.begin(label);
    try {
      this.history.preview(mutate);
      this.project();
      this.history.commit();
    } catch (error) {
      this.history.cancel();
      this.project();
      throw error;
    }
  }
  public project() {
    const result = this.projection.apply(this.history.snapshot());
    this.history.setWarnings(result.warnings);
    return result;
  }
  public undo(): void {
    this.history.undo();
    this.project();
  }
  public redo(): void {
    this.history.redo();
    this.project();
  }
  public reset(): void {
    this.history = new EditorHistory(this.original);
    this.project();
  }
  public download(): Promise<string> {
    this.project();
    return encodeDocument(
      this.history.snapshot(),
      this.catalogue,
      this.projection.describe(this.history.snapshot()),
    );
  }
  public async load(json: string): Promise<void> {
    if (this.history.inGesture) throw new Error('Finish the active edit before loading a file.');
    const history = this.history,
      revision = history.revision;
    const candidate = await decodeDocument(json, this.baseline, this.catalogue);
    if (
      this.disposed ||
      this.history !== history ||
      history.revision !== revision ||
      history.inGesture
    )
      throw new Error(
        'Import rejected: the session changed while loading. Retry after finishing the newer edit.',
      );
    try {
      this.projection.apply(candidate);
    } catch (error) {
      this.project();
      throw error;
    }
    this.history = new EditorHistory(candidate);
    this.project();
  }
  public dispose(): void {
    this.disposed = true;
    this.projection.dispose();
  }
}
