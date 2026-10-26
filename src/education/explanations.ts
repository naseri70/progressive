import type { LanguageCode, ZoneId } from '../types';

export const zoneExplanationKeys: Record<ZoneId, string> = {
  distance: 'distanceExplanation',
  intermediate: 'intermediateExplanation',
  near: 'nearExplanation'
};

export const zoneTitleKeys: Record<ZoneId, string> = {
  distance: 'distanceTitle',
  intermediate: 'intermediateTitle',
  near: 'nearTitle'
};

export function getExplanationKey(zone: ZoneId): string {
  return zoneExplanationKeys[zone];
}

export function getTitleKey(zone: ZoneId): string {
  return zoneTitleKeys[zone];
}

export function getExplanation(zone: ZoneId, language: LanguageCode): string {
  // Consumers should use I18nManager.t; this helper keeps compatibility.
  return `${zone}:${language}`;
}
