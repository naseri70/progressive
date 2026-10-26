import * as THREE from 'three';
import type { GazeMarkerParts } from '../types';

export function createGazeMarker(scene: THREE.Scene): GazeMarkerParts {
  const markerGeometry = new THREE.SphereGeometry(0.08, 24, 24);
  const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35 });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.set(0, 0.6, 0.35);
  scene.add(marker);

  const rayGeometry = new THREE.BufferGeometry().setFromPoints([marker.position.clone(), new THREE.Vector3(0, 0.6, -4)]);
  const rayMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  const ray = new THREE.Line(rayGeometry, rayMaterial);
  scene.add(ray);

  let current = marker.position.clone();
  let target = marker.position.clone();
  let progress = 1;
  let duration = 0.45;
  let elapsed = 0;
  let startPosition = marker.position.clone();
  let pathVisible = true;

  const animateTo = (nextTarget: THREE.Vector3, durationMs = 450) => {
    startPosition.copy(current);
    target.copy(nextTarget);
    duration = durationMs / 1000;
    elapsed = 0;
    progress = 0;
  };

  const setPathVisible = (visible: boolean) => {
    pathVisible = visible;
    ray.visible = visible;
  };

  const update = (delta: number) => {
    if (progress < 1) {
      elapsed += delta;
      progress = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      current.lerpVectors(startPosition, target, eased);
      marker.position.copy(current);
    }
    const positions = ray.geometry.attributes.position as THREE.BufferAttribute;
    positions.setXYZ(0, marker.position.x, marker.position.y, marker.position.z);
    positions.setXYZ(1, target.x, target.y, target.z - 0.2);
    positions.needsUpdate = true;
    ray.visible = pathVisible;
  };

  const dispose = () => {
    markerGeometry.dispose();
    markerMaterial.dispose();
    rayGeometry.dispose();
    rayMaterial.dispose();
    scene.remove(marker);
    scene.remove(ray);
  };

  return { marker, ray, animateTo, setPathVisible, dispose, update } as GazeMarkerParts & { update: (delta: number) => void };
}
