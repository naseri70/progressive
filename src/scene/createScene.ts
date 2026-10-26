import * as THREE from 'three';

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export function createScene(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera): { scene: THREE.Scene; renderer: THREE.WebGLRenderer } {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2f5f9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };
  window.addEventListener('resize', onResize);

  return { scene, renderer };
}
