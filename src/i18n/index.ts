import type { I18nResources, LanguageCode } from '../types';

const resources: I18nResources = {
  fa: {
    title: 'شبیه‌ساز آموزشی عدسی پروگرسیو',
    subtitle: 'عدسی پروگرسیو چگونه در فاصله‌های مختلف کار می‌کند؟',
    distance: 'دور',
    intermediate: 'کامپیوتر',
    near: 'مطالعه',
    reset: 'بازنشانی نما',
    gazePath: 'نمایش مسیر نگاه',
    guided: 'حالت آموزش گام‌به‌گام',
    previous: 'قبلی',
    next: 'بعدی',
    restart: 'شروع مجدد',
    pause: 'توقف',
    resume: 'ادامه',
    language: 'English',
    distanceTitle: 'دید دور',
    intermediateTitle: 'دید میانی و کامپیوتر',
    nearTitle: 'دید نزدیک و مطالعه',
    distanceExplanation: 'بخش بالایی عدسی بیشتر برای دیدن اشیاء دور طراحی شده است.',
    intermediateExplanation: 'کریدور مرکزی به دیدن فاصله‌های میانی، از جمله صفحه کامپیوتر کمک می‌کند. عرض قابل استفاده آن به طراحی عدسی و نسخه بستگی دارد.',
    nearExplanation: 'بخش پایینی عدسی توان اضافی مورد نیاز برای مطالعه و کارهای نزدیک را فراهم می‌کند.',
    illustrative: 'تصویرسازی آموزشی — ابعاد و توان دقیق عدسی نیست.',
    fallback: 'مرورگر شما از WebGL پشتیبانی نمی‌کند. لطفاً مرورگر یا دستگاه دیگری را امتحان کنید.',
    distanceTarget: 'تابلو راهنمایی در دور',
    intermediateTarget: 'مانیتور کامپیوتر',
    nearTarget: 'کتاب یا تلفن همراه'
  },
  en: {
    title: 'Progressive Lens Education Simulator',
    subtitle: 'How a progressive lens works at different distances',
    distance: 'Distance',
    intermediate: 'Computer',
    near: 'Reading',
    reset: 'Reset View',
    gazePath: 'Show Gaze Path',
    guided: 'Guided Mode',
    previous: 'Previous',
    next: 'Next',
    restart: 'Restart',
    pause: 'Pause',
    resume: 'Resume',
    language: 'فارسی',
    distanceTitle: 'Distance Vision',
    intermediateTitle: 'Computer & Intermediate Vision',
    nearTitle: 'Reading & Near Vision',
    distanceExplanation: 'The upper part of the lens is designed primarily for seeing distant objects clearly.',
    intermediateExplanation: 'The central corridor helps you see at intermediate distances, including your computer screen. Its usable width depends on the lens design and prescription.',
    nearExplanation: 'The lower part of the lens provides the additional optical power commonly needed for reading and other close work.',
    illustrative: 'Illustrative educational visualization — not exact lens dimensions or optical power.',
    fallback: 'Your browser does not support WebGL. Please try another browser or device.',
    distanceTarget: 'Road sign in the distance',
    intermediateTarget: 'Computer monitor',
    nearTarget: 'Book or smartphone'
  }
};

export class I18nManager {
  private language: LanguageCode;

  constructor(initialLanguage: LanguageCode = 'fa') {
    this.language = initialLanguage;
    this.applyDocumentDirection();
  }

  t(key: string): string {
    return resources[this.language][key] ?? key;
  }

  setLanguage(language: LanguageCode): void {
    this.language = language;
    this.applyDocumentDirection();
  }

  getLanguage(): LanguageCode {
    return this.language;
  }

  applyDocumentDirection(): void {
    const root = document.documentElement;
    root.lang = this.language;
    root.dir = this.language === 'fa' ? 'rtl' : 'ltr';
  }

  getResources(): I18nResources {
    return resources;
  }
}

export function createI18n(initialLanguage: LanguageCode = 'fa'): I18nManager {
  return new I18nManager(initialLanguage);
}
