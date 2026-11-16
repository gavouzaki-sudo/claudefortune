import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="foot">
      <p>
        <strong>{t.footerDisclaimerLabel}</strong> {t.footerDisclaimerText}
      </p>
      <p>
        {t.footerHelplinePrefix} <a href="tel:1323">1323</a> {t.footerHelplineHours}
      </p>
    </footer>
  );
};
