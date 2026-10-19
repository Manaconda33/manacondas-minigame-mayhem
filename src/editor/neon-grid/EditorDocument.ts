import layout from '../../game/track/neonGridLayout.json';
export function requireValue<T>(value: T | null | undefined): T {
  if (value === null || value === undefined)
    throw new Error('Required editor source component is missing.');
  return value;
}
export type Vec3 = [number, number, number];
export type Matrix4Data = number[];
export interface EditorBaseline {
  repository: string;
  runtimeSourceSha: string;
  editorBuildSha: string;
  selectors: {
    material: string;
    visual: string;
  };
  catalogueVersion: number;
  catalogueHash: string;
}
export interface RoadPoint {
  id: string;
  position: Vec3;
  widthMultiplier: number;
}
export interface ShortcutPath {
  entryProgress: number;
  exitProgress: number;
  points: Vec3[];
}
export interface RoadState {
  controlPoints: RoadPoint[];
  shortcutPaths: Record<string, ShortcutPath>;
}
export type Attachment =
  | {
      mode: 'fixed';
    }
  | {
      mode: 'road';
      path: string;
      progress: number;
    };
export interface ComponentOverride {
  matrix: Matrix4Data;
  deleted: boolean;
  attachment?: Attachment;
}
export interface DesignState {
  road: RoadState;
  overrides: Record<string, ComponentOverride>;
  groups: Record<string, string[]>;
}
export interface EditorAction {
  id: string;
  label: string;
  before: DesignState;
  after: DesignState;
}
export interface EditorView {
  position: Vec3;
  target: Vec3;
  fog: boolean;
  helpers: boolean;
}
export interface EditorDocument extends DesignState {
  schemaVersion: 1;
  baseline: EditorBaseline;
  history: {
    actions: EditorAction[];
    cursor: number;
  };
  view: EditorView;
  warnings: string[];
}
export const cloneData = <T>(data: T): T => structuredClone(data);
export function identityMatrix(): Matrix4Data {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
export function designState(document: DesignState): DesignState {
  return cloneData({ road: document.road, overrides: document.overrides, groups: document.groups });
}
export function createEditorDocument(baseline: EditorBaseline): EditorDocument {
  return {
    schemaVersion: 1,
    baseline: cloneData(baseline),
    road: {
      controlPoints: layout.controlPoints.map((p, i) => ({
        id: `main/control/${String(i).padStart(2, '0')}`,
        position: [...p] as Vec3,
        widthMultiplier: 1,
      })),
      shortcutPaths: {},
    },
    overrides: {},
    groups: {},
    history: { actions: [], cursor: 0 },
    view: { position: [250, 260, 310], target: [20, 0, 10], fog: true, helpers: true },
    warnings: [],
  };
}
