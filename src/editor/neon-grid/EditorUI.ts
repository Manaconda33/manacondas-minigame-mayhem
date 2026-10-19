import { EditorAutosave } from './EditorAutosave';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import type { EditorScene } from './EditorScene';
import { EditorSession } from './EditorSession';
import { EditorSelection, textInputOwnsKeyboard } from './EditorSelection';
import { EditorTransforms } from './EditorTransforms';
import { EditorStorage } from './EditorStorage';
import { cloneData, createEditorDocument, type Vec3, requireValue } from './EditorDocument';
import { createEditedPaths, updateRoadState } from './EditorRoad';
export function editorMarkup(): string {
  return `<header class="studio-header"><div class="studio-brand"><span class="brand-mark">NG</span><div><h1>Neon Grid <span>Layout Studio</span></h1><p>MANACONDA'S MINIGAME MAYHEM</p></div></div><span class="version-badge">C2 CONCRETE + FOG V3.2</span><div class="file-tools"><button data-action="load">Load edits</button><button data-action="download" class="primary">Download edits <span>↓</span></button><input id="edit-file" type="file" accept="application/json,.json" hidden></div></header>
  <nav class="studio-toolbar" aria-label="Editor tools"><div class="tool-group"><button data-mode="select" class="active" title="Select / camera">↖ <span>Select</span></button><button data-mode="box" title="Box selection (B); includes objects behind objects">▧ <span>Box select</span></button><button data-mode="translate" title="Move (W)">↔ <span>Move</span></button><button data-mode="rotate" title="Rotate (E)">⟳ <span>Rotate</span></button><button data-mode="scale" title="Scale (R)">⤢ <span>Scale</span></button><button data-mode="road" title="Edit track control points (T)">⌁ <span>Track</span></button></div><select id="transform-space" aria-label="Transform axes"><option value="world">World axes</option><option value="local">Local axes</option></select><div class="tool-group"><button data-action="undo" title="Undo (Ctrl/Cmd+Z)">↶ Undo</button><button data-action="redo" title="Redo (Ctrl/Cmd+Shift+Z)">↷ Redo</button><button data-action="delete" title="Delete selected components">Delete</button></div><button data-action="compare" id="compare">Show original</button><button data-action="reset" class="quiet">Reset</button></nav>
  <div class="studio-workspace"><aside class="explorer"><div class="panel-heading"><h2>Scene explorer</h2><span id="component-count"></span></div><input id="search" type="search" placeholder="Find buildings, walls, signs…" aria-label="Search components"><select id="sector-filter" aria-label="Show sector"><option value="all">All sectors visible</option><option>Skyline</option><option>Undercity</option><option>Service Tunnel</option><option>Falls Run</option><option>Billboard Gap</option><option>Waterfall Dive</option></select><label class="check"><input id="logical-groups" type="checkbox" checked>Select whole buildings</label><p class="panel-note">Ctrl/Cmd-click adds to selection. Turn off whole buildings to edit individual parts.</p><div id="outliner" role="listbox" aria-label="Scene components" aria-multiselectable="true"></div><div id="catalogue-note" class="panel-note"></div></aside>
  <main class="viewport"><canvas id="scene" aria-label="Neon Grid editable 3D scene" tabindex="0"></canvas><div class="viewport-top"><div class="bookmarks"><button data-bookmark="course">Full course</button><button data-bookmark="skyline">Skyline</button><button data-bookmark="undercity">Undercity</button><button data-bookmark="tunnel">Tunnel</button><button data-bookmark="falls">Falls Run</button></div><div class="view-actions"><select id="view-preset" aria-label="Camera view"><option value="perspective">Perspective</option><option value="top">Top</option><option value="front">Front</option><option value="side">Side</option></select><button data-action="frame" title="Frame selection (F)">Frame ↗</button></div></div><div id="comparison-badge" hidden>ORIGINAL — editing paused</div><div id="marquee" hidden></div><div class="viewport-bottom"><div class="view-toggles"><label><input id="show-fog" type="checkbox" checked>Fog</label><label><input id="show-helpers" type="checkbox" checked>Handles</label></div><span id="render-info">Loading scene…</span></div><div id="loading" class="loading-card"><span class="loading-orbit"></span><h2>Building your workspace</h2><p>Loading the approved concrete, fog and source geometry.</p></div></main>
  <aside class="inspector"><div class="panel-heading"><h2>Inspector</h2><span id="selection-count">0</span></div><div id="selection-info"><div class="empty-selection">Select a building or track component.<p>Orbit with left drag.<br>Pan with right drag.<br>Zoom with the scroll wheel.</p></div></div><div id="inspector-fields" hidden><div id="point-name"></div><div class="field-block"><h3>Position <span>world metres</span></h3><div class="xyz" data-fields="position"></div></div><div class="field-block component-field"><h3>Dimensions <span>world bounds · m</span></h3><div class="xyz" data-fields="dimensions"></div></div><div class="field-block component-field"><h3>Rotate by <span>degrees · then resets</span></h3><div class="xyz" data-fields="rotation"></div></div><div class="field-block component-field"><h3>Scale by <span>then resets</span></h3><div class="xyz" data-fields="scale"></div></div><div class="field-block" id="road-width" hidden><h3>Road width <span>metres</span></h3><input id="width-value" type="number" min="0.1" step="0.1"></div><div class="component-field"><button data-action="group" class="wide">Select building group</button><button data-action="detach" class="wide">Detach from road</button></div><details class="source-details component-field"><summary>Source component</summary><pre id="source-detail"></pre></details></div><div class="inspector-bottom"><h3>Design notes</h3><div id="warnings"><p>Visual design only. Applying edits to gameplay requires collision, shortcut, AI and budget verification.</p></div><button data-action="recover" class="wide" hidden>Restore local recovery</button><p id="save-state">No changes</p></div></aside></div><footer class="studio-status"><span id="status" role="status">Loading exact primary scene…</span><span id="source-id"></span></footer>`;
}
export function mountEditorUI(host: HTMLElement, scene: EditorScene, session: EditorSession) {
  const catalogue = session.catalogue;
  const element = (selector: string): HTMLElement => {
    const value = host.querySelector<HTMLElement>(selector);
    if (!value) throw new Error(`Editor element missing: ${selector}`);
    return value;
  };
  const canvas = requireValue(host.querySelector<HTMLCanvasElement>('#scene'));
  const controls = new OrbitControls(scene.camera, canvas);
  controls.target.set(20, 0, 10);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 1;
  controls.maxDistance = 750;
  const transform = new TransformControls(scene.camera, canvas);
  transform.setSize(0.85);
  scene.overlayScene.add(transform.getHelper());
  const proxy = new THREE.Object3D();
  scene.overlayScene.add(proxy);
  const pointGroup = new THREE.Group();
  scene.overlayScene.add(pointGroup);
  const handleGeometry = new THREE.SphereGeometry(1.25, 10, 6),
    handleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffbd6e,
      depthTest: false,
      transparent: true,
      opacity: 0.9,
    });
  const handles = session.history.snapshot().road.controlPoints.map((p, i) => {
    const mesh = new THREE.Mesh(handleGeometry, handleMaterial);
    mesh.userData.controlIndex = i;
    mesh.position.fromArray(p.position);
    pointGroup.add(mesh);
    return mesh;
  });
  pointGroup.visible = false;
  const selection = new EditorSelection(catalogue, session.projection);
  let transforms = new EditorTransforms(catalogue, session.history, session.projection);
  let historyIdentity = session.history;
  let mode = 'select',
    point: number | null = null,
    comparison = false,
    disposed = false;
  let frameId = 0,
    needsRender = true;
  let selectedHelpers: THREE.Box3Helper[] = [];
  const initialPivot = new THREE.Matrix4();
  const store = new EditorStorage(`${session.baseline.runtimeSourceSha}:${catalogue.hash}`);
  let recovery: string | null = null;
  const cleanup: (() => void)[] = [];
  const listen = (
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(event, handler, options);
    cleanup.push(() => {
      target.removeEventListener(event, handler, options);
    });
  };
  function message(text: string, error = false) {
    const status = element('#status');
    status.textContent = text;
    status.classList.toggle('error', error);
  }
  function safe(action: () => void) {
    try {
      action();
    } catch (error) {
      if (session.history.inGesture) {
        transforms.cancel();
        session.project();
      }
      message(String(error), true);
      refresh(false);
    }
  }
  const original = createEditorDocument(session.baseline);
  original.road = cloneData(catalogue.baselineRoad);
  function showProjection() {
    const result = comparison ? session.projection.apply(original) : session.project();
    scene.setFogPaths(result.paths);
    needsRender = true;
  }
  const autosave = new EditorAutosave(
    () => session.history.inGesture,
    async (isCurrent) => {
      try {
        const history = session.history,
          revision = history.revision;
        const json = await session.download();
        if (!isCurrent() || session.history !== history || history.revision !== revision) return;
        const result = await store.save(json);
        if (isCurrent())
          element('#save-state').textContent = result.ok
            ? 'Saved locally · download a copy to share'
            : 'Local save unavailable · download your edits';
        if (comparison) showProjection();
      } catch (error) {
        if (isCurrent()) element('#save-state').textContent = `Not saved: ${String(error)}`;
      }
    },
  );
  function saveLater() {
    autosave.schedule();
  }
  function selectedIds(id: string): string[] {
    const record = catalogue.components.get(id)?.record;
    return requireValue(host.querySelector<HTMLInputElement>('#logical-groups')).checked &&
      record?.groupId
      ? (catalogue.groups[record.groupId] ?? [id])
      : [id];
  }
  function choose(ids: string[], toggle = false) {
    point = null;
    if (toggle) {
      const all = ids.every((id) => selection.ids.includes(id));
      for (const id of ids) if (all || !selection.ids.includes(id)) selection.toggle(id);
    } else selection.replace(ids);
    refresh(false);
  }
  controls.addEventListener('change', () => {
    needsRender = true;
  });
  function redrawHelpers() {
    needsRender = true;
    for (const helper of selectedHelpers) {
      scene.overlayScene.remove(helper);
      helper.geometry.dispose();
      (helper.material as THREE.Material).dispose();
    }
    selectedHelpers = [];
    for (const id of selection.ids.slice(0, 160)) {
      const box = selection.bounds([id]);
      if (box.isEmpty()) continue;
      const helper = new THREE.Box3Helper(box, 0x7bf7d5);
      (helper.material as THREE.Material).depthTest = false;
      helper.renderOrder = 10000;
      scene.overlayScene.add(helper);
      selectedHelpers.push(helper);
    }
  }
  function syncGizmo() {
    transform.detach();
    if (comparison || mode === 'select' || mode === 'box') return;
    if (point !== null && mode === 'road') {
      proxy.position.fromArray(
        requireValue(session.history.snapshot().road.controlPoints[point]).position,
      );
      proxy.quaternion.identity();
      proxy.scale.set(1, 1, 1);
      transform.setMode('translate');
    } else if (selection.ids.length && mode !== 'road') {
      const box = selection.bounds();
      proxy.position.copy(box.getCenter(new THREE.Vector3()));
      proxy.quaternion.identity();
      proxy.scale.set(1, 1, 1);
      if (
        requireValue(host.querySelector<HTMLSelectElement>('#transform-space')).value === 'local' &&
        selection.ids.length === 1
      )
        proxy.quaternion.setFromRotationMatrix(
          new THREE.Matrix4().extractRotation(
            session.projection.matrixFor(requireValue(selection.ids[0])),
          ),
        );
      transform.setMode(mode as 'translate' | 'rotate' | 'scale');
    } else return;
    proxy.updateMatrixWorld(true);
    transform.attach(proxy);
    transform.setSpace(
      requireValue(host.querySelector<HTMLSelectElement>('#transform-space')).value as
        'world' | 'local',
    );
  }
  function numericFields() {
    const doc = session.history.snapshot();
    const selected = selection.ids;
    const active = point !== null ? doc.road.controlPoints[point] : undefined;
    element('#inspector-fields').hidden = !active && !selected.length;
    const info = element('#selection-info');
    info.replaceChildren();
    if (active) {
      const h = document.createElement('h3');
      h.textContent = `Track control point ${String(requireValue(point) + 1)}`;
      info.append(h);
      const p = document.createElement('p');
      p.className = 'panel-note';
      p.textContent =
        'Move the control point to reshape the road. Attached structures follow; background buildings stay in place.';
      info.append(p);
    } else if (selected.length) {
      const h = document.createElement('h3');
      h.textContent =
        selected.length === 1
          ? requireValue(catalogue.components.get(requireValue(selected[0]))).record.label
          : `${String(selected.length)} components selected`;
      info.append(h);
    } else {
      info.innerHTML =
        '<div class="empty-selection">Select a building or track component.<p>Orbit with left drag · right drag to pan · scroll to zoom.<br>Shift-drag or use Box select for a group.</p></div>';
    }
    for (const row of host.querySelectorAll<HTMLElement>('.component-field')) row.hidden = !!active;
    element('#road-width').hidden = !active;
    element('#selection-count').textContent = active ? 'point' : String(selected.length);
    if (!active && !selected.length) return;
    const bounds = selection.bounds(),
      position = active
        ? new THREE.Vector3().fromArray(active.position)
        : bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    for (const name of ['position', 'dimensions', 'rotation', 'scale']) {
      const values =
        name === 'position'
          ? position.toArray()
          : name === 'dimensions'
            ? size.toArray()
            : name === 'scale'
              ? [1, 1, 1]
              : [0, 0, 0];
      const inputs = host.querySelectorAll<HTMLInputElement>(`[data-fields="${name}"] input`);
      inputs.forEach((input, i) => {
        if (document.activeElement !== input)
          input.value = String(Number(requireValue(values[i]).toFixed(3)));
        input.disabled = comparison;
      });
    }
    if (active) {
      const paths = createEditedPaths(scene.track, doc.road);
      const lengths = paths.main.getLengths(3400);
      const progress =
        requireValue(lengths[requireValue(point) * 100]) / requireValue(lengths.at(-1));
      requireValue(host.querySelector<HTMLInputElement>('#width-value')).value = (
        paths.widthAt(progress) * 2
      ).toFixed(3);
    } else {
      const records = selected.map((id) => requireValue(catalogue.components.get(id)).record);
      element('#source-detail').textContent = records
        .slice(0, 3)
        .map(
          (r) =>
            `${r.sourceFile}\n${r.sourceSymbol}\n${r.sourceOrdinal === null ? 'Mesh / authored range' : `Instance ${String(r.sourceOrdinal)}`}\n${r.id}`,
        )
        .join('\n\n');
      const attached = records.some((r) => session.projection.canDetach(r.id));
      requireValue(host.querySelector<HTMLButtonElement>('[data-action="detach"]')).disabled =
        !attached || comparison;
      requireValue(host.querySelector<HTMLButtonElement>('[data-action="group"]')).disabled =
        !records.some((r) => r.groupId) || comparison;
    }
  }
  function outliner() {
    const container = element('#outliner');
    const term = requireValue(host.querySelector<HTMLInputElement>('#search')).value.toLowerCase();
    const sector = requireValue(host.querySelector<HTMLSelectElement>('#sector-filter')).value;
    container.replaceChildren();
    const selected = new Set(selection.ids),
      doc = session.history.snapshot();
    let count = 0;
    for (const record of catalogue.entries) {
      if (!record.label.toLowerCase().includes(term)) continue;
      const source = requireValue(catalogue.components.get(record.id));
      if (sector !== 'all' && record.sector !== 'Course' && record.sector !== sector) continue;
      if (count++ >= 300) continue;
      const button = document.createElement('button');
      button.className = 'object-row';
      button.dataset.componentId = record.id;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(selected.has(record.id)));
      button.classList.toggle('selected', selected.has(record.id));
      button.classList.toggle('deleted', doc.overrides[record.id]?.deleted ?? false);
      const glyph = document.createElement('span');
      glyph.className = 'object-glyph';
      glyph.textContent = record.groupId ? '▦' : source.instance !== null ? '▧' : '◇';
      const label = document.createElement('span');
      label.textContent = record.label;
      button.append(glyph, label);
      button.title = record.scenePath;
      button.addEventListener('click', (event) => {
        choose(selectedIds(record.id), event.ctrlKey || event.metaKey);
      });
      container.append(button);
    }
    if (count > 300) {
      const note = document.createElement('p');
      note.className = 'panel-note';
      note.textContent = `Showing 300 of ${String(count)} matches. Search to narrow the list.`;
      container.append(note);
    }
  }
  function refresh(save = true) {
    if (historyIdentity !== session.history) {
      historyIdentity = session.history;
      transforms = new EditorTransforms(catalogue, session.history, session.projection);
    }
    const d = session.history.snapshot();
    scene.setFogPaths(createEditedPaths(scene.track, (comparison ? original : d).road));
    needsRender = true;
    handles.forEach((handle, i) =>
      handle.position.fromArray(
        requireValue((comparison ? original : d).road.controlPoints[i]).position,
      ),
    );
    pointGroup.visible = mode === 'road' && !comparison;
    requireValue(host.querySelector<HTMLButtonElement>('[data-action="undo"]')).disabled =
      !session.history.canUndo || comparison;
    requireValue(host.querySelector<HTMLButtonElement>('[data-action="redo"]')).disabled =
      !session.history.canRedo || comparison;
    element('#comparison-badge').hidden = !comparison;
    element('#compare').textContent = comparison ? 'Return to edits' : 'Show original';
    element('#warnings').replaceChildren();
    const warnings = d.warnings.length
      ? d.warnings
      : [
          'Visual design only. Gameplay, collision and representative-hardware performance require separate validation.',
        ];
    for (const warning of warnings) {
      const p = document.createElement('p');
      p.textContent = warning;
      element('#warnings').append(p);
    }
    redrawHelpers();
    syncGizmo();
    numericFields();
    outliner();
    if (save) saveLater();
  }
  function setMode(next: string) {
    safe(() => {
      if (session.history.inGesture) transforms.cancel();
      mode = next;
      pointGroup.visible = mode === 'road';
      if (mode !== 'road') point = null;
      for (const button of host.querySelectorAll<HTMLButtonElement>('[data-mode]'))
        button.classList.toggle('active', button.dataset.mode === mode);
      refresh(false);
    });
  }
  function applyNumeric(name: string, axis: number) {
    safe(() => {
      if (comparison) throw new Error('Return to edits first.');
      const values = [
        ...host.querySelectorAll<HTMLInputElement>(`[data-fields="${name}"] input`),
      ].map((i) => Number(i.value));
      if (values.some((v) => !Number.isFinite(v))) throw new Error('Enter finite numeric values.');
      // Only the field the user changed is authoritative; rounded display neighbours stay exact.
      const unchanged =
        point !== null
          ? requireValue(session.history.snapshot().road.controlPoints[point]).position
          : name === 'position'
            ? selection.bounds().getCenter(new THREE.Vector3()).toArray()
            : name === 'dimensions'
              ? selection.bounds().getSize(new THREE.Vector3()).toArray()
              : name === 'scale'
                ? [1, 1, 1]
                : [0, 0, 0];
      for (let i = 0; i < 3; i++) if (i !== axis) values[i] = requireValue(unchanged[i]);
      if (point !== null) {
        if (name === 'position')
          session.edit('Move road control point', (s) => {
            requireValue(s.road.controlPoints[requireValue(point)]).position = values as Vec3;
            s.road = updateRoadState(scene.track, catalogue.baselineRoad, s.road);
          });
      } else if (name === 'dimensions')
        transforms.setDimensions(selection.ids, new THREE.Vector3().fromArray(values));
      else {
        const pivot = selection.bounds().getCenter(new THREE.Vector3());
        const delta = new THREE.Matrix4();
        if (name === 'position')
          delta.makeTranslation(
            requireValue(values[0]) - pivot.x,
            requireValue(values[1]) - pivot.y,
            requireValue(values[2]) - pivot.z,
          );
        else {
          const change =
            name === 'rotation'
              ? new THREE.Matrix4().makeRotationFromEuler(
                  new THREE.Euler(
                    ...(values.map((v) => THREE.MathUtils.degToRad(v)) as [number, number, number]),
                  ),
                )
              : new THREE.Matrix4().makeScale(
                  requireValue(values[0]),
                  requireValue(values[1]),
                  requireValue(values[2]),
                );
          delta
            .makeTranslation(pivot.x, pivot.y, pivot.z)
            .multiply(change)
            .multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
        }
        transforms.begin(
          selection.ids,
          name === 'position'
            ? 'Move components'
            : name === 'rotation'
              ? 'Rotate components'
              : 'Scale components',
        );
        transforms.preview(delta);
        transforms.commit();
      }
      refresh();
      message('Edit recorded. Undo is available.');
    });
  }
  for (const container of host.querySelectorAll<HTMLElement>('[data-fields]'))
    for (const [i, axis] of ['X', 'Y', 'Z'].entries()) {
      const label = document.createElement('label');
      label.textContent = axis;
      const input = document.createElement('input');
      input.type = 'number';
      input.step = '0.1';
      input.setAttribute('aria-label', `${String(container.dataset.fields)} ${axis}`);
      input.dataset.axis = String(i);
      label.append(input);
      container.append(label);
      input.addEventListener('change', () => {
        applyNumeric(requireValue(container.dataset.fields), i);
      });
    }
  requireValue(host.querySelector<HTMLInputElement>('#width-value')).addEventListener(
    'change',
    () => {
      safe(() => {
        if (point === null || comparison) return;
        const width = Number(
          requireValue(host.querySelector<HTMLInputElement>('#width-value')).value,
        );
        if (!Number.isFinite(width) || width <= 0.1)
          throw new Error('Road width must be positive.');
        session.edit('Change road width', (s) => {
          const paths = createEditedPaths(scene.track, s.road),
            lengths = paths.main.getLengths(3400),
            u = requireValue(lengths[requireValue(point) * 100]) / requireValue(lengths.at(-1));
          requireValue(s.road.controlPoints[requireValue(point)]).widthMultiplier =
            width / (scene.track.halfWidthAt(u) * 2);
          s.road = updateRoadState(scene.track, catalogue.baselineRoad, s.road);
        });
        refresh();
      });
    },
  );
  for (const b of host.querySelectorAll<HTMLButtonElement>('[data-mode]'))
    b.addEventListener('click', () => {
      setMode(requireValue(b.dataset.mode));
    });
  element('#transform-space').addEventListener('change', () => {
    syncGizmo();
  });
  element('#search').addEventListener('input', () => {
    outliner();
  });
  element('#sector-filter').addEventListener('change', () => {
    const name = requireValue(host.querySelector<HTMLSelectElement>('#sector-filter')).value;
    session.projection.setFilter(
      (c) => name === 'all' || c.record.sector === 'Course' || c.record.sector === name,
    );
    showProjection();
    selection.clear();
    refresh(false);
  });
  requireValue(host.querySelector<HTMLInputElement>('#show-fog')).addEventListener('change', () => {
    session.history.setView({
      ...session.history.view(),
      fog: requireValue(host.querySelector<HTMLInputElement>('#show-fog')).checked,
    });
    needsRender = true;
  });
  requireValue(host.querySelector<HTMLInputElement>('#show-helpers')).addEventListener(
    'change',
    () => {
      session.history.setView({
        ...session.history.view(),
        helpers: requireValue(host.querySelector<HTMLInputElement>('#show-helpers')).checked,
      });
      needsRender = true;
    },
  );
  function frame(bounds: THREE.Box3, preset = 'perspective') {
    if (bounds.isEmpty()) return;
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    requireValue(host.querySelector<HTMLSelectElement>('#view-preset')).value = preset;
    const center = bounds.getCenter(new THREE.Vector3()),
      extent = Math.max(8, ...bounds.getSize(new THREE.Vector3()).toArray());
    const direction =
      preset === 'top'
        ? new THREE.Vector3(0.001, 1, 0)
        : preset === 'front'
          ? new THREE.Vector3(0, 0.1, 1)
          : preset === 'side'
            ? new THREE.Vector3(1, 0.1, 0)
            : new THREE.Vector3(1, 0.9, 1);
    scene.camera.position.copy(center).addScaledVector(direction.normalize(), extent * 1.5);
    controls.target.copy(center);
    controls.update();
    controls.enableDamping = damping;
  }
  const courseBounds = new THREE.Box3().setFromPoints(scene.track.samples);
  courseBounds.expandByScalar(25);
  for (const b of host.querySelectorAll<HTMLButtonElement>('[data-bookmark]'))
    b.addEventListener('click', () => {
      if (b.dataset.bookmark === 'course') {
        frame(courseBounds);
        return;
      }
      const progress =
        b.dataset.bookmark === 'skyline'
          ? 0.16
          : b.dataset.bookmark === 'undercity'
            ? 0.355
            : b.dataset.bookmark === 'falls'
              ? 0.57
              : 0.33;
      const center =
        b.dataset.bookmark === 'tunnel'
          ? scene.track.serviceTunnel.curve.getPointAt(0.5)
          : createEditedPaths(scene.track, session.history.snapshot().road).main.getPointAt(
              progress,
            );
      frame(new THREE.Box3(center.clone().addScalar(-28), center.clone().addScalar(28)));
    });
  requireValue(host.querySelector<HTMLSelectElement>('#view-preset')).addEventListener(
    'change',
    () => {
      frame(
        selection.ids.length ? selection.bounds() : courseBounds,
        requireValue(host.querySelector<HTMLSelectElement>('#view-preset')).value,
      );
    },
  );
  async function download() {
    try {
      const history = session.history,
        revision = history.revision;
      const json = await session.download();
      const blob = new Blob([json], { type: 'application/json' }),
        url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = `neon-grid-edits-${new Date().toISOString().replaceAll(':', '-')}.json`;
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      const current = session.history === history && history.markSaved(revision);
      element('#save-state').textContent = current
        ? 'Download created · keep this file to share'
        : 'Earlier snapshot downloaded · newer edits still need saving';
      message(
        'Edit document downloaded, with original values, final edits, source mappings and history.',
      );
      if (comparison) showProjection();
    } catch (error) {
      message(String(error), true);
    }
  }
  async function load(json: string | Promise<string>) {
    try {
      await session.load(json);
      comparison = false;
      selection.clear();
      point = null;
      const view = session.history.snapshot().view;
      scene.camera.position.fromArray(view.position);
      controls.target.fromArray(view.target);
      requireValue(host.querySelector<HTMLInputElement>('#show-fog')).checked = view.fog;
      requireValue(host.querySelector<HTMLInputElement>('#show-helpers')).checked = view.helpers;
      refresh();
      message('Edit document verified and restored.');
    } catch (error) {
      message(`Import rejected; existing edits kept. ${String(error)}`, true);
    }
  }
  requireValue(host.querySelector<HTMLInputElement>('#edit-file')).addEventListener(
    'change',
    () => {
      const input = requireValue(host.querySelector<HTMLInputElement>('#edit-file')),
        file = input.files?.[0];
      if (file) {
        if (file.size > 20 * 1024 * 1024) {
          message('Import exceeds the 20 MiB file limit.', true);
          return;
        }
        void load(file.text());
      }
      input.value = '';
    },
  );
  function action(name: string) {
    safe(() => {
      if (name === 'download') {
        void download();
        return;
      }
      if (name === 'load') {
        requireValue(host.querySelector<HTMLInputElement>('#edit-file')).click();
        return;
      }
      if (name === 'recover') {
        if (recovery) void load(recovery);
        return;
      }
      if (name === 'compare') {
        comparison = !comparison;
        showProjection();
        refresh(false);
        return;
      }
      if (name === 'frame') {
        frame(
          point !== null
            ? new THREE.Box3(
                requireValue(handles[point]).position.clone().addScalar(-5),
                requireValue(handles[point]).position.clone().addScalar(5),
              )
            : selection.ids.length
              ? selection.bounds()
              : courseBounds,
        );
        return;
      }
      if (comparison) throw new Error('Return to edits before editing.');
      if (name === 'undo') session.undo();
      if (name === 'redo') session.redo();
      if (name === 'reset') {
        if (
          !window.confirm(
            'Reset the layout and clear this editing session? Download your edits first if you want to keep them.',
          )
        )
          return;
        session.reset();
        selection.clear();
        point = null;
      }
      if (name === 'delete' && selection.ids.length) {
        session.edit('Delete components', (s) => {
          for (const id of selection.ids) {
            const c = requireValue(catalogue.components.get(id));
            s.overrides[id] = {
              ...s.overrides[id],
              matrix: s.overrides[id]?.matrix ?? c.record.baselineMatrix,
              deleted: true,
            };
          }
        });
        selection.clear();
      }
      if (name === 'group') {
        const ids = new Set<string>();
        for (const id of selection.ids) {
          const group = catalogue.components.get(id)?.record.groupId;
          for (const member of group ? (catalogue.groups[group] ?? [id]) : [id]) ids.add(member);
        }
        selection.replace([...ids]);
      }
      if (name === 'detach') {
        session.edit('Detach from road', (s) => {
          for (const id of selection.ids) {
            if (!session.projection.canDetach(id)) continue;
            s.overrides[id] = {
              matrix: session.projection.matrixFor(id).toArray(),
              deleted: false,
              attachment: { mode: 'fixed' },
            };
          }
        });
      }
      refresh();
    });
  }
  for (const b of host.querySelectorAll<HTMLButtonElement>('[data-action]'))
    b.addEventListener('click', () => {
      action(requireValue(b.dataset.action));
    });
  let down: {
    x: number;
    y: number;
    ndc: THREE.Vector2;
    box: boolean;
    toggle: boolean;
  } | null = null;
  const ndc = (event: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - r.left) / r.width) * 2 - 1,
      -((event.clientY - r.top) / r.height) * 2 + 1,
    );
  };
  listen(
    canvas,
    'pointerdown',
    ((event: PointerEvent) => {
      if (event.button !== 0 || transform.axis !== null || transform.dragging) return;
      const box = mode === 'box' || event.shiftKey;
      down = {
        x: event.clientX,
        y: event.clientY,
        ndc: ndc(event),
        box,
        toggle: event.ctrlKey || event.metaKey,
      };
      if (box) {
        controls.enabled = false;
        canvas.setPointerCapture(event.pointerId);
        const r = element('#marquee');
        r.hidden = false;
        r.style.left = '0';
        r.style.width = '0';
        r.style.height = '0';
      }
    }) as EventListener,
    { capture: true },
  );
  listen(canvas, 'pointermove', ((event: PointerEvent) => {
    if (!down?.box) return;
    const r = canvas.getBoundingClientRect(),
      box = element('#marquee');
    box.style.left = `${String(Math.min(down.x, event.clientX) - r.left)}px`;
    box.style.top = `${String(Math.min(down.y, event.clientY) - r.top)}px`;
    box.style.width = `${String(Math.abs(event.clientX - down.x))}px`;
    box.style.height = `${String(Math.abs(event.clientY - down.y))}px`;
  }) as EventListener);
  listen(canvas, 'pointerup', ((event: PointerEvent) => {
    if (!down) return;
    const start = down;
    down = null;
    controls.enabled = true;
    element('#marquee').hidden = true;
    if (transform.dragging) return;
    if (start.box) {
      const ids = selection.marquee(start.ndc, ndc(event), scene.camera);
      choose(ids, start.toggle);
      return;
    }
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) return;
    if (mode === 'road') {
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc(event), scene.camera);
      const hits = ray.intersectObjects(handles, false);
      if (hits.length) {
        point = Number(requireValue(hits[0]).object.userData.controlIndex);
        selection.clear();
        refresh(false);
      }
      return;
    }
    const id = selection.pick(ndc(event), scene.camera);
    if (id) choose(selectedIds(id), start.toggle);
    else if (!start.toggle) {
      selection.clear();
      point = null;
      refresh(false);
    }
  }) as EventListener);
  const cancel = () => {
    down = null;
    element('#marquee').hidden = true;
    controls.enabled = true;
    if (session.history.inGesture) {
      transforms.cancel();
      refresh(false);
    }
  };
  listen(canvas, 'pointercancel', cancel);
  listen(canvas, 'lostpointercapture', () => {
    if (down?.box) cancel();
  });
  transform.addEventListener('dragging-changed', (event) => {
    safe(() => {
      controls.enabled = !event.value;
      if (event.value) {
        if (comparison) throw new Error('Original view is read-only.');
        initialPivot.copy(proxy.matrixWorld);
        if (point !== null) session.history.begin('Move road control point');
        else transforms.begin(selection.ids, `Gizmo ${transform.mode}`);
      } else if (session.history.inGesture) {
        if (point !== null) session.history.commit();
        else transforms.commit();
        refresh();
      }
    });
  });
  transform.addEventListener('objectChange', () => {
    if (!session.history.inGesture) return;
    safe(() => {
      if (point !== null) {
        session.history.preview((s) => {
          requireValue(s.road.controlPoints[requireValue(point)]).position =
            proxy.position.toArray();
          s.road = updateRoadState(scene.track, catalogue.baselineRoad, s.road);
        });
        session.project();
        requireValue(handles[point]).position.copy(proxy.position);
      } else {
        proxy.updateMatrixWorld(true);
        transforms.preview(proxy.matrixWorld.clone().multiply(initialPivot.clone().invert()));
      }
      numericFields();
      redrawHelpers();
    });
  });
  listen(window, 'keydown', ((event: KeyboardEvent) => {
    if (textInputOwnsKeyboard(event.target)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (transform.dragging) transform.reset();
      cancel();
      transform.detach();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      action(event.shiftKey ? 'redo' : 'undo');
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      action('redo');
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      action('delete');
      return;
    }
    const tool: Record<string, string> = {
      w: 'translate',
      e: 'rotate',
      r: 'scale',
      b: 'box',
      t: 'road',
      q: 'select',
    };
    if (tool[event.key.toLowerCase()]) setMode(requireValue(tool[event.key.toLowerCase()]));
    if (event.key.toLowerCase() === 'f') action('frame');
  }) as EventListener);
  const observer = new ResizeObserver(() => {
    scene.resize();
    needsRender = true;
  });
  observer.observe(canvas);
  cleanup.push(() => {
    observer.disconnect();
  });
  element('#component-count').textContent = String(catalogue.entries.length);
  element('#catalogue-note').textContent =
    `${String(catalogue.entries.length)} mapped components · ${String(Object.keys(catalogue.groups).length)} building groups. Combined meshes are labelled; atmosphere stays inspection-only.`;
  element('#source-id').textContent =
    `C2 ${session.baseline.runtimeSourceSha.slice(0, 7)} · editor ${session.baseline.editorBuildSha.slice(0, 7)}`;
  element('#loading').hidden = true;
  frame(courseBounds);
  refresh(false);
  void store.recover().then((result) => {
    if (result.ok && typeof result.value === 'string') {
      recovery = result.value;
      element('[data-action="recover"]').hidden = false;
      message('Local recovery found. Restore it or start a new layout.');
    } else message('Ready. Select a building, or use Track to reshape the road.');
  });
  let lastMetrics = 0;
  function animate(time: number) {
    if (disposed) return;
    controls.update();
    if (needsRender) {
      needsRender = false;
      const view = {
        ...session.history.view(),
        position: scene.camera.position.toArray(),
        target: controls.target.toArray(),
      };
      session.history.setView(view);
      scene.render(view);
    }
    if (time - lastMetrics > 800) {
      const m = scene.metrics();
      element('#render-info').textContent =
        `${String(m.calls)} scene calls · ${m.triangles.toLocaleString()} triangles · ${String(m.helperCalls)} helper calls`;
      lastMetrics = time;
    }
    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
  return {
    selection,
    session,
    scene,
    refresh,
    setMode,
    action,
    selectControl(index: number) {
      mode = 'road';
      point = index;
      pointGroup.visible = true;
      selection.clear();
      refresh(false);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      autosave.dispose();
      for (const f of cleanup) f();
      transform.dispose();
      controls.dispose();
      session.dispose();
      scene.dispose();
    },
  };
}
