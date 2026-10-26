import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ViewMode } from '../types';

const BASE_POSITION = new THREE.Vector3(0, 0.2, 6.2);

export function createCamera(aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
  camera.position.copy(BASE_POSITION);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function resetCamera(camera: THREE.PerspectiveCamera, controls: OrbitControls): void {
  camera.position.copy(BASE_POSITION);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
}

export function setViewMode(camera: THREE.PerspectiveCamera, controls: OrbitControls, mode: ViewMode): void {
  if (mode === 'front') {
    camera.position.set(0, 0, 6.2);
  } else {
    camera.position.set(3.2, 1.4, 4.6);
  }
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
}
