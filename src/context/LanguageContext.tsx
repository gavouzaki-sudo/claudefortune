import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { TRANSLATIONS, type SupportedLang, type Translations } from '../data/translations';
import { safeStorage } from '../utils/storage';

const STORAGE_KEY = 'shrine.lang';

interface LanguageContextType {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  cycleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'th',
  setLang: () => {},
  cycleLang: () => {},
  t: TRANSLATIONS.th,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLang>(() => {
    const saved = safeStorage.get<string>('local', STORAGE_KEY, 'th');
    return saved === 'en' || saved === 'zh' ? saved : 'th';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((newLang: SupportedLang) => {
    setLangState(newLang);
    safeStorage.set('local', STORAGE_KEY, newLang);
  }, []);

  const cycleLang = useCallback(() => {
    setLangState((curr) => {
      const next: SupportedLang = curr === 'th' ? 'en' : curr === 'en' ? 'zh' : 'th';
      safeStorage.set('local', STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      cycleLang,
      t: TRANSLATIONS[lang],
    }),
    [lang, setLang, cycleLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

