import * as THREE from 'three';
import type { LensParts, ZoneId } from '../types';

function applyZoneColors(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const r = Math.sqrt(x * x + y * y) / 1.25;
    const yNorm = THREE.MathUtils.clamp(y / 1.25, -1, 1);

    let red = 0.88;
    let green = 0.72;
    let blue = 0.31;

    if (yNorm > 0.15) {
      const t = (yNorm - 0.15) / 0.85;
      red = THREE.MathUtils.lerp(0.88, 0.31, t);
      green = THREE.MathUtils.lerp(0.72, 0.53, t);
      blue = THREE.MathUtils.lerp(0.31, 0.78, t);
    } else if (yNorm < -0.15) {
      const t = (-yNorm - 0.15) / 0.85;
      red = THREE.MathUtils.lerp(0.88, 0.88, t);
      green = THREE.MathUtils.lerp(0.72, 0.48, t);
      blue = THREE.MathUtils.lerp(0.31, 0.31, t);
    }

    if (r > 0.72) {
      const t = THREE.MathUtils.clamp((r - 0.72) / 0.28, 0, 1) * 0.4;
      red = THREE.MathUtils.lerp(red, 0.55, t);
      green = THREE.MathUtils.lerp(green, 0.55, t);
      blue = THREE.MathUtils.lerp(blue, 0.6, t);
    }

    colors[i * 3] = red;
    colors[i * 3 + 1] = green;
    colors[i * 3 + 2] = blue;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

export function createLens(scene: THREE.Scene): LensParts {
  const geometry = new THREE.CircleGeometry(1.25, 96);

  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    transmission: 0.82,
    opacity: 0.42,
    roughness: 0.06,
    metalness: 0,
    ior: 1.49,
    thickness: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(geometry, lensMaterial);
  scene.add(mesh);

  const frameGeometry = new THREE.TorusGeometry(1.32, 0.075, 16, 96);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8a93a6, metalness: 0.35, roughness: 0.45 });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  scene.add(frame);

  const overlayGeometry = geometry.clone();
  applyZoneColors(overlayGeometry);
  const overlayMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const zoneOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
  zoneOverlay.scale.setScalar(1.002);
  scene.add(zoneOverlay);

  const setHighlight = (zone: ZoneId | null) => {
    overlayMaterial.opacity = zone ? 0.4 : 0.24;
  };

  const dispose = () => {
    geometry.dispose();
    lensMaterial.dispose();
    frameGeometry.dispose();
    frameMaterial.dispose();
    overlayGeometry.dispose();
    overlayMaterial.dispose();
    scene.remove(mesh);
    scene.remove(frame);
    scene.remove(zoneOverlay);
  };

  return { mesh, zoneOverlay, setHighlight, dispose };
}
