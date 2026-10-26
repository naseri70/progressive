import * as THREE from 'three';
import type { TargetSet, ZoneId } from '../types';

function makeBox(color: number, scale: THREE.Vector3): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
}

export function createTargets(scene: THREE.Scene): TargetSet {
  const distance = makeBox(0x4f86c6, new THREE.Vector3(1.6, 1.0, 0.12));
  distance.position.set(0, 0.2, -6);
  scene.add(distance);

  const intermediate = makeBox(0xe0b84f, new THREE.Vector3(1.4, 0.9, 0.08));
  intermediate.position.set(0, 0.1, -3.2);
  scene.add(intermediate);

  const near = makeBox(0xe07a4f, new THREE.Vector3(0.9, 1.2, 0.06));
  near.position.set(0, -0.1, -1.6);
  near.rotation.x = -0.25;
  scene.add(near);

  const show = (zone: ZoneId | null) => {
    distance.visible = zone === 'distance';
    intermediate.visible = zone === 'intermediate';
    near.visible = zone === 'near';
  };

  const dispose = () => {
    [distance, intermediate, near].forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
      scene.remove(obj);
    });
  };

  show('distance');

  return { distance, intermediate, near, show, dispose };
}
