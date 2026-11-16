import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  const { t, lang } = useLanguage();

  if (!message) return null;

  return (
    <div id="toast" className="toast" role="status" aria-live="polite" aria-label={t.toastAriaLabel} lang={lang}>
      {message}
    </div>
  );
};
