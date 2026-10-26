import * as THREE from 'three';
import { isWebGLAvailable, createScene } from './scene/createScene';
import { createCamera, resetCamera, setViewMode } from './scene/createCamera';
import { createLighting } from './scene/createLighting';
import { createLens } from './scene/createLens';
import { createGazeMarker } from './scene/createGazeMarker';
import { createTargets } from './scene/createTargets';
import { setupControls } from './components/controls';
import { createEducationMode } from './components/educationMode';
import { createI18n } from './i18n';
import { setupUi } from './components/ui';
import type { LanguageCode, ViewMode, ZoneId } from './types';

const canvas = document.getElementById('app') as HTMLCanvasElement | null;
const fallback = document.getElementById('webgl-fallback');

if (!canvas || !isWebGLAvailable()) {
  if (fallback) fallback.hidden = false;
  if (canvas) canvas.style.display = 'none';
  throw new Error('WebGL is not available');
}

const i18n = createI18n('fa');

const camera = createCamera(window.innerWidth / window.innerHeight);
const { scene, renderer } = createScene(canvas, camera);
const controls = setupControls(camera, renderer, canvas);

createLighting(scene);
const lens = createLens(scene);
const gaze = createGazeMarker(scene);
const targets = createTargets(scene);

let selectedZone: ZoneId = 'distance';
let viewMode: ViewMode = 'front';

const zoneMarkerPosition = (zone: ZoneId): THREE.Vector3 => {
  const y = zone === 'distance' ? 0.62 : zone === 'intermediate' ? 0.0 : -0.62;
  return new THREE.Vector3(0, y, 0.32);
};

const selectZone = (zone: ZoneId) => {
  selectedZone = zone;
  lens.setHighlight(zone);
  targets.show(zone);
  gaze.animateTo(zoneMarkerPosition(zone));
  ui.setActiveZone(zone);
  ui.updateExplanation(i18n, zone);
};

const toggleView = () => {
  viewMode = viewMode === 'front' ? 'angled' : 'front';
  setViewMode(camera, controls, viewMode);
  ui.setViewLabel(viewMode);
};

let guidedPaused = false;
const toggleGuidedPause = () => {
  if (education.isPaused()) {
    education.resume();
    guidedPaused = false;
  } else {
    education.pause();
    guidedPaused = true;
  }
  ui.setPauseLabel(guidedPaused);
};

const resetView = () => {
  resetCamera(camera, controls);
};

const toggleLanguage = () => {
  const next: LanguageCode = i18n.getLanguage() === 'fa' ? 'en' : 'fa';
  i18n.setLanguage(next);
  ui.updateLanguage(i18n);
  ui.setViewLabel(viewMode);
  ui.setPauseLabel(guidedPaused);
  ui.updateExplanation(i18n, selectedZone);
};

const education = createEducationMode((step) => {
  const zone: ZoneId = step === 0 ? 'distance' : step === 1 ? 'intermediate' : 'near';
  selectZone(zone);
});

const ui = setupUi(i18n, {
  onSelectZone: selectZone,
  onResetView: resetView,
  onToggleView: toggleView,
  onToggleGazePath: (visible) => {
    gaze.setPathVisible(visible);
  },
  onToggleLanguage: toggleLanguage,
  onGuidedStart: () => education.start(),
  onGuidedPause: () => education.pause(),
  onGuidedResume: () => education.resume(),
  onGuidedNext: () => education.next(),
  onGuidedPrevious: () => education.previous(),
  onGuidedRestart: () => education.restart(),
  onToggleGuidedPause: toggleGuidedPause
});

ui.setGazePathVisible(true);
ui.setViewLabel(viewMode);
ui.setPauseLabel(false);
ui.updateExplanation(i18n, selectedZone);
selectZone('distance');

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update();
  gaze.update(delta);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('beforeunload', () => {
  lens.dispose();
  gaze.dispose();
  targets.dispose();
  controls.dispose();
  renderer.dispose();
});
