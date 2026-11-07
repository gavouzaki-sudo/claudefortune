import React, { useState, useEffect } from 'react';
import { toggleMuteChant, isChantMuted, subscribeChantState } from '../utils/chantAudio';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onGoHome?: () => void;
  hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  hasActiveSession,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [muted, setMuted] = useState<boolean>(() => isChantMuted());

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

  const handleCycleLang = () => {
    if (lang === 'th') {
      setLang('en');
    } else if (lang === 'en') {
      setLang('zh');
    } else {
      setLang('th');
    }
  };

  return (
    <header className={`mystical-header-sticky-wrapper ${hasActiveSession ? 'header-session-compact' : ''}`}>
      <div className="top mystical-header">
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
          {/* Single Cycle Language Button (TH -> EN -> CN -> TH) */}
          <button
            type="button"
            className="btn-lang-cycle"
            onClick={handleCycleLang}
            title={
              lang === 'th'
                ? 'ภาษาไทย (คลิกเพื่อเปลี่ยนเป็น EN)'
                : lang === 'en'
                ? 'English (Click to change to CN)'
                : '中文 (点击切换为 TH)'
            }
            aria-label="เปลี่ยนภาษา"
          >
            {lang === 'th' ? 'TH' : lang === 'en' ? 'EN' : 'CN'}
          </button>

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
      </div>
    </header>
  );
};
