import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, type SupportedLang, type Translations } from '../data/translations';

interface LanguageContextType {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'th',
  setLang: () => {},
  t: TRANSLATIONS.th,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLang>('th');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shrine.lang') as SupportedLang | null;
      if (saved && (saved === 'th' || saved === 'en' || saved === 'zh')) {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // Ignore
    }
  }, []);

  const setLang = (newLang: SupportedLang) => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
    try {
      localStorage.setItem('shrine.lang', newLang);
    } catch {
      // Ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
