import React, { useState, useEffect } from 'react';
import { toggleMuteChant, isChantMuted, subscribeChantState } from '../utils/chantAudio';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onGoHome?: () => void;
  onOpenAuspicious?: () => void;
  hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenAuspicious,
  hasActiveSession,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [muted, setMuted] = useState<boolean>(isChantMuted());

  // Sync chant mute state
  useEffect(() => {
    const unsub = subscribeChantState(() => {
      setMuted(isChantMuted());
    });
    return () => unsub();
  }, []);

  const handleToggleAudio = () => {
    const next = toggleMuteChant();
    setMuted(next);
  };

  return (
    <header className={`top mystical-header ${hasActiveSession ? 'header-session-compact' : ''}`}>
      <div
        className="brand"
        onClick={onGoHome}
        style={{ cursor: onGoHome ? 'pointer' : 'default' }}
        title={onGoHome ? t.backHome : undefined}
        role={onGoHome ? 'button' : undefined}
        tabIndex={onGoHome ? 0 : undefined}
        onKeyDown={(e) => {
          if (onGoHome && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onGoHome();
          }
        }}
      >
        <span className="brand-lantern" aria-hidden="true" />
        <div>
          <h1>{t.appName}</h1>
          <p className="sub">{t.appSubtitle}</p>
        </div>
      </div>

      <div className="header-actions-right">
        {/* Home Button (Active Session) */}
        {hasActiveSession && onGoHome && (
          <button
            type="button"
            className="btn-header-home-action"
            onClick={onGoHome}
            title={t.backHome}
            aria-label={t.backHome}
          >
            <span className="btn-home-icon">🏠</span>
            <span className="btn-home-label-full">{t.backHome}</span>
            <span className="btn-home-label-short">{t.home}</span>
          </button>
        )}

        {/* Language Segmented Toggle (TH / EN / CN) */}
        <div className="header-lang-toggle-group" role="group" aria-label="Language selector">
          <button
            type="button"
            className={`btn-lang-toggle ${lang === 'th' ? 'is-active' : ''}`}
            onClick={() => setLang('th')}
            title="ภาษาไทย (TH)"
          >
            TH
          </button>
          <button
            type="button"
            className={`btn-lang-toggle ${lang === 'en' ? 'is-active' : ''}`}
            onClick={() => setLang('en')}
            title="English (EN)"
          >
            EN
          </button>
          <button
            type="button"
            className={`btn-lang-toggle ${lang === 'zh' ? 'is-active' : ''}`}
            onClick={() => setLang('zh')}
            title="中文 (CN)"
          >
            CN
          </button>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Audio Speaker Toggle */}
        <div className="header-audio-control">
          <button
            type="button"
            className={`btn-speaker-icon-only ${muted ? 'is-muted' : 'is-active'}`}
            onClick={handleToggleAudio}
            title={muted ? t.soundOn : t.soundOff}
            aria-label={muted ? t.soundOn : t.soundOff}
          >
            <span className="speaker-icon">{muted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
