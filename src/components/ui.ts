import { I18nManager } from '../i18n';
import type { ZoneId } from '../types';

export interface UiCallbacks {
  onSelectZone: (zone: ZoneId) => void;
  onResetView: () => void;
  onToggleGazePath: (visible: boolean) => void;
  onToggleLanguage: () => void;
  onGuidedStart: () => void;
  onGuidedPause: () => void;
  onGuidedNext: () => void;
  onGuidedPrevious: () => void;
  onGuidedRestart: () => void;
}

export interface UiController {
  setActiveZone: (zone: ZoneId | null) => void;
  setGazePathVisible: (visible: boolean) => void;
  setGuidedActive: (active: boolean) => void;
  updateLanguage: (i18n: I18nManager) => void;
  updateExplanation: (i18n: I18nManager, zone: ZoneId) => void;
}

export function setupUi(i18n: I18nManager, callbacks: UiCallbacks): UiController {
  const q = (id: string) => document.getElementById(id);

  const title = q('title');
  const subtitle = q('subtitle');
  const explanationTitle = q('explanation-title');
  const explanationText = q('explanation-text');
  const illustrative = q('illustrative');

  const btnDistance = q('btn-distance') as HTMLButtonElement;
  const btnIntermediate = q('btn-intermediate') as HTMLButtonElement;
  const btnNear = q('btn-near') as HTMLButtonElement;
  const btnReset = q('btn-reset') as HTMLButtonElement;
  const btnGaze = q('btn-gaze') as HTMLButtonElement;
  const btnLang = q('btn-lang') as HTMLButtonElement;
  const btnGuided = q('btn-guided') as HTMLButtonElement;
  const guidedControls = q('guided-controls') as HTMLElement;
  const btnPrev = q('btn-prev') as HTMLButtonElement;
  const btnNext = q('btn-next') as HTMLButtonElement;
  const btnRestart = q('btn-restart') as HTMLButtonElement;

  let gazeVisible = true;
  let guidedActive = false;

  const zoneButtons: Record<ZoneId, HTMLButtonElement> = {
    distance: btnDistance,
    intermediate: btnIntermediate,
    near: btnNear
  };

  const setActiveZone = (zone: ZoneId | null) => {
    (Object.keys(zoneButtons) as ZoneId[]).forEach((key) => {
      zoneButtons[key].classList.toggle('active', key === zone);
    });
  };

  const setGazePathVisible = (visible: boolean) => {
    gazeVisible = visible;
    btnGaze.classList.toggle('active', visible);
    btnGaze.textContent = i18n.t('gazePath');
    callbacks.onToggleGazePath(visible);
  };

  btnDistance.addEventListener('click', () => callbacks.onSelectZone('distance'));
  btnIntermediate.addEventListener('click', () => callbacks.onSelectZone('intermediate'));
  btnNear.addEventListener('click', () => callbacks.onSelectZone('near'));
  btnReset.addEventListener('click', () => callbacks.onResetView());
  btnGaze.addEventListener('click', () => setGazePathVisible(!gazeVisible));
  btnLang.addEventListener('click', () => callbacks.onToggleLanguage());
  btnGuided.addEventListener('click', () => {
    guidedActive = !guidedActive;
    btnGuided.classList.toggle('active', guidedActive);
    if (guidedActive) callbacks.onGuidedStart();
    else callbacks.onGuidedPause();
    guidedControls.classList.toggle('hidden', !guidedActive);
  });
  btnPrev.addEventListener('click', () => callbacks.onGuidedPrevious());
  btnNext.addEventListener('click', () => callbacks.onGuidedNext());
  btnRestart.addEventListener('click', () => callbacks.onGuidedRestart());

  const updateLanguage = (manager: I18nManager) => {
    if (title) title.textContent = manager.t('title');
    if (subtitle) subtitle.textContent = manager.t('subtitle');
    if (illustrative) illustrative.textContent = manager.t('illustrative');
    btnDistance.textContent = manager.t('distance');
    btnIntermediate.textContent = manager.t('intermediate');
    btnNear.textContent = manager.t('near');
    btnReset.textContent = manager.t('reset');
    btnGaze.textContent = manager.t('gazePath');
    btnLang.textContent = manager.t('language');
    btnGuided.textContent = manager.t('guided');
    btnPrev.textContent = manager.t('previous');
    btnNext.textContent = manager.t('next');
    btnRestart.textContent = manager.t('restart');
  };

  const updateExplanation = (manager: I18nManager, zone: ZoneId) => {
    if (!explanationTitle || !explanationText) return;
    const titleKey = zone === 'distance' ? 'distanceTitle' : zone === 'intermediate' ? 'intermediateTitle' : 'nearTitle';
    const explanationKey = zone === 'distance' ? 'distanceExplanation' : zone === 'intermediate' ? 'intermediateExplanation' : 'nearExplanation';
    explanationTitle.textContent = manager.t(titleKey);
    explanationText.textContent = manager.t(explanationKey);
  };

  updateLanguage(i18n);

  return { setActiveZone, setGazePathVisible, setGuidedActive: (active) => { guidedActive = active; guidedControls.classList.toggle('hidden', !active); }, updateLanguage, updateExplanation };
}
