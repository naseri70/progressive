import type { I18nManager } from '../i18n';
import type { LanguageCode } from '../types';

export function applyLanguage(i18n: I18nManager, language: LanguageCode): void {
  i18n.setLanguage(language);
}
