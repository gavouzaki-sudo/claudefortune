// Multilingual UI translation dictionary for Lucky Shrine (TH, EN, ZH)
// Dictionaries are modularized under src/data/locales/{types,th,en,zh}.ts
// and re-exported here to preserve backward compatibility across components and tests.

export {
  type SupportedLang,
  type Translations,
  getCurrentYearRemedyLabel,
} from './locales/types';

import type { SupportedLang, Translations } from './locales/types';
import { TH_TRANSLATIONS } from './locales/th';
import { EN_TRANSLATIONS } from './locales/en';
import { ZH_TRANSLATIONS } from './locales/zh';

export const TRANSLATIONS: Record<SupportedLang, Translations> = {
  th: TH_TRANSLATIONS,
  en: EN_TRANSLATIONS,
  zh: ZH_TRANSLATIONS,
};
