import { cloneData, designState, type DesignState, type EditorDocument } from './EditorDocument';
type Journal = EditorDocument['history'];
interface Patch {
  road?: DesignState['road'];
  overrides?: Record<string, DesignState['overrides'][string] | null>;
  groups?: Record<string, string[] | null>;
}
interface CompactJournal {
  encoding: 'changes-v1';
  cursor: number;
  initial: DesignState;
  actions: { id: string; label: string; patch: Patch }[];
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function difference(before: DesignState, after: DesignState): Patch {
  const patch: Patch = {};
  if (!same(before.road, after.road)) patch.road = after.road;
  for (const field of ['overrides', 'groups'] as const) {
    const delta: Record<string, unknown> = {};
    for (const id of new Set([...Object.keys(before[field]), ...Object.keys(after[field])]))
      if (!same(before[field][id], after[field][id]))
        Object.defineProperty(delta, id, { value: after[field][id] ?? null, enumerable: true });
    if (Object.keys(delta).length) Object.assign(patch, { [field]: delta });
  }
  return patch;
}
export function packJournal(journal: Journal, final: DesignState): CompactJournal {
  return {
    encoding: 'changes-v1',
    cursor: journal.cursor,
    initial: journal.actions[0]?.before ?? designState(final),
    actions: journal.actions.map((a) => ({
      id: a.id,
      label: a.label,
      patch: difference(a.before, a.after),
    })),
  };
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Invalid compact journal object.');
  return value as Record<string, unknown>;
}
export function unpackJournal(value: unknown): Journal {
  const wire = object(value);
  if (
    wire.encoding !== 'changes-v1' ||
    Object.keys(wire).some((k) => !['encoding', 'cursor', 'initial', 'actions'].includes(k)) ||
    !Array.isArray(wire.actions)
  )
    throw Error('Invalid compact journal encoding.');
  const initial = object(wire.initial);
  let state = cloneData(initial) as unknown as DesignState;
  if (
    Object.keys(initial).some((k) => !['road', 'overrides', 'groups'].includes(k)) ||
    !initial.road ||
    !initial.overrides ||
    !initial.groups
  )
    throw Error('Invalid journal initial state.');
  const actions: Journal['actions'] = [];
  // Bound expansion too: a small hostile patch file must not allocate unbounded snapshot memory.
  let expandedBytes = 0;
  for (const item of wire.actions) {
    const a = object(item),
      patch = object(a.patch);
    if (
      Object.keys(a).some((k) => !['id', 'label', 'patch'].includes(k)) ||
      typeof a.id !== 'string' ||
      typeof a.label !== 'string' ||
      Object.keys(patch).some((k) => !['road', 'overrides', 'groups'].includes(k))
    )
      throw Error('Invalid journal patch.');
    const before = state;
    state = cloneData(before);
    if (patch.road !== undefined) state.road = cloneData(patch.road) as DesignState['road'];
    for (const field of ['overrides', 'groups'] as const)
      if (patch[field] !== undefined) {
        let next: Record<string, unknown> = { ...state[field] };
        for (const [id, value] of Object.entries(object(patch[field]))) {
          if (value === null)
            next = Object.fromEntries(Object.entries(next).filter(([key]) => key !== id));
          else
            Object.defineProperty(next, id, {
              value: cloneData(value),
              enumerable: true,
              configurable: true,
              writable: true,
            });
        }
        Object.assign(state, { [field]: next });
      }
    expandedBytes += JSON.stringify(state).length * 2;
    if (expandedBytes > 128 * 1024 * 1024)
      throw Error('Journal exceeds supported recovery memory.');
    actions.push({ id: a.id, label: a.label, before, after: state });
  }
  return { cursor: wire.cursor as number, actions };
}
/** Leave ample room for source mappings, final paths and integrity records in the 20 MiB file. */
export function assertJournalCapacity(journal: Journal, final: DesignState): void {
  const wire = packJournal(journal, final);
  const bytes = new TextEncoder().encode(
    JSON.stringify({ state: final, history: wire }, null, 2),
  ).byteLength;
  const expanded = journal.actions.reduce((n, a) => n + JSON.stringify(a.after).length * 2, 0);
  if (bytes > 10 * 1024 * 1024 || expanded > 128 * 1024 * 1024)
    throw Error(
      'Session capacity reached. This edit was not applied. Download the saved design before starting a new session.',
    );
}
