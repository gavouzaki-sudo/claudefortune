import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useChantAudioState } from '../hooks/useChantAudioState';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onGoHome?: () => void;
  hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  hasActiveSession,
}) => {
  const { lang, cycleLang, t } = useLanguage();
  const { isMuted, toggle: toggleAudio } = useChantAudioState();


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
            onClick={cycleLang}
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
              className={`btn-speaker-icon-only ${isMuted ? 'is-muted' : 'is-active'}`}
              onClick={toggleAudio}
              title={isMuted ? t.soundOn : t.soundOff}
              aria-label={isMuted ? t.soundOn : t.soundOff}
            >
              <span className="speaker-icon">{isMuted ? '🔇' : '🔊'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
