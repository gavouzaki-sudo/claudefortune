import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { t } = useLanguage();

  // If already running as standalone PWA, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="btn-header-install-action"
        title={t.installApp}
        aria-label={t.installApp}
      >
        <span className="btn-install-icon">📥</span>
        <span className="btn-install-label">{t.installApp}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="btn-header-install-action"
          title={t.installApp}
          aria-label={t.installApp}
        >
          <span className="btn-install-icon">📱</span>
          <span className="btn-install-label">{t.installApp}</span>
        </button>

        {showIOSGuide && (
          <div
            className="pwa-ios-modal-overlay"
            onClick={() => setShowIOSGuide(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="pwa-ios-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pwa-ios-modal-header">
                <span className="pwa-ios-emblem">⛩️</span>
                <h4>{t.pwaInstallTitle}</h4>
              </div>
              <p className="pwa-ios-modal-desc">{t.pwaInstallDesc}</p>
              <div className="pwa-ios-instructions">
                <div className="pwa-ios-step">
                  <span className="step-badge">1</span>
                  <span>{t.pwaIosStep1}</span>
                </div>
                <div className="pwa-ios-step">
                  <span className="step-badge">2</span>
                  <span>{t.pwaIosStep2}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn gold btn-block pwa-ios-close-btn"
                onClick={() => setShowIOSGuide(false)}
              >
                {t.pwaClose}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
