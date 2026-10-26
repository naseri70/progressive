import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { PerspectiveCamera, WebGLRenderer } from 'three';

export function setupControls(camera: PerspectiveCamera, _renderer: WebGLRenderer, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 3.5;
  controls.maxDistance = 9;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI - 0.2;
  controls.target.set(0, 0, 0);
  controls.update();
  return controls;
}
