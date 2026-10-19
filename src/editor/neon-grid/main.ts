import { requireValue } from './EditorDocument';
import { NeonGrid } from '../../game/track/NeonGrid';
import { buildCatalogue } from './ComponentCatalogue';
import { createEditorScene } from './EditorScene';
import { EditorSession } from './EditorSession';
import { editorMarkup, mountEditorUI } from './EditorUI';
import './editor.css';
const host = document.querySelector<HTMLElement>('#editor-root');
if (!host) throw new Error('Editor root missing.');
host.innerHTML = editorMarkup();
try {
  const canvas = requireValue(host.querySelector<HTMLCanvasElement>('#scene'));
  const scene = await createEditorScene(canvas);
  try {
    const referenceTrack = new NeonGrid();
    const catalogue = await buildCatalogue(scene.root, referenceTrack);
    const build: unknown = import.meta.env.VITE_NEON_EDITOR_BUILD_SHA;
    const session = new EditorSession(catalogue, referenceTrack, {
      repository: 'Manaconda33/manacondas-minigame-mayhem',
      runtimeSourceSha: 'addab4c7c2421f52c4731691b8a9f3e2d9e39f94',
      editorBuildSha: typeof build === 'string' ? build : 'development',
      catalogueVersion: 2,
      catalogueHash: catalogue.hash,
      selectors: { material: 'concrete-coverage-c2-001', visual: 'c2-task-a-fog-overlay' },
    });
    const app = mountEditorUI(host, scene, session);
    Object.assign(window, { neonGridEditor: app });
    window.addEventListener(
      'pagehide',
      () => {
        app.dispose();
      },
      { once: true },
    );
  } catch (error) {
    scene.dispose();
    throw error;
  }
} catch (error) {
  const loading = host.querySelector<HTMLElement>('#loading');
  if (loading) {
    loading.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = 'The scene could not load';
    const detail = document.createElement('p');
    detail.textContent = String(error);
    loading.append(heading, detail);
  }
  console.error(error);
}
