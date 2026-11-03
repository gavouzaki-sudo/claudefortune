import React from 'react';
import { useOnlineStatus } from '../utils/useOnlineStatus';
import { useLanguage } from '../context/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <div
      className="pwa-offline-indicator"
      role="status"
      aria-live="polite"
    >
      <span className="offline-pulse-dot" />
      <span>{t.pwaOfflineMsg}</span>
    </div>
  );
};
