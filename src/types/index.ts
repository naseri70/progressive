import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type LanguageCode = 'fa' | 'en';
export type ZoneId = 'distance' | 'intermediate' | 'near';
export type ViewMode = 'front' | 'angled';
export type EducationStep = 0 | 1 | 2;

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface LensZoneConfig {
  id: ZoneId;
  color: number;
  labelKey: string;
  explanationKey: string;
  targetPosition: Point3;
  highlightOpacity: number;
}

export type I18nDictionary = Record<string, string>;
export type I18nResources = Record<LanguageCode, I18nDictionary>;

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}

export interface LensParts {
  mesh: THREE.Mesh;
  zoneOverlay: THREE.Mesh;
  setHighlight: (zone: ZoneId | null) => void;
  dispose: () => void;
}

export interface GazeMarkerParts {
  marker: THREE.Mesh;
  ray: THREE.Line;
  animateTo: (target: THREE.Vector3, durationMs?: number) => void;
  setPathVisible: (visible: boolean) => void;
  update: (delta: number) => void;
  dispose: () => void;
}

export interface TargetSet {
  distance: THREE.Object3D;
  intermediate: THREE.Object3D;
  near: THREE.Object3D;
  show: (zone: ZoneId | null) => void;
  dispose: () => void;
}
