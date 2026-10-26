import * as THREE from 'three';
import type { LensZoneConfig, Point3, ZoneId } from '../types';

export const zoneConfigs: LensZoneConfig[] = [
  {
    id: 'distance',
    color: 0x4f86c6,
    labelKey: 'distanceTitle',
    explanationKey: 'distanceExplanation',
    targetPosition: { x: 0, y: 0, z: -6 },
    highlightOpacity: 0.28
  },
  {
    id: 'intermediate',
    color: 0xe0b84f,
    labelKey: 'intermediateTitle',
    explanationKey: 'intermediateExplanation',
    targetPosition: { x: 0, y: 0, z: -3.2 },
    highlightOpacity: 0.24
  },
  {
    id: 'near',
    color: 0xe07a4f,
    labelKey: 'nearTitle',
    explanationKey: 'nearExplanation',
    targetPosition: { x: 0, y: 0, z: -1.6 },
    highlightOpacity: 0.28
  }
];

export function getZoneConfig(zone: ZoneId): LensZoneConfig {
  const config = zoneConfigs.find((item) => item.id === zone);
  if (!config) throw new Error(`Unknown zone: ${zone}`);
  return config;
}

export function zonePosition(zone: ZoneId): THREE.Vector3 {
  const config = getZoneConfig(zone);
  const p: Point3 = config.targetPosition;
  return new THREE.Vector3(p.x, p.y, p.z);
}
