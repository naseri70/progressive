import * as THREE from 'three';

export function createLighting(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 5, 6);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbfd7ff, 0.45);
  fill.position.set(-4, 2, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.25);
  rim.position.set(0, -3, -4);
  scene.add(rim);
}
