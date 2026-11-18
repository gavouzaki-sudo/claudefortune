import React, { useState, useEffect } from 'react';
import {
  spiritualSpeechEngine,
  SPIRITUAL_PRESETS,
  isMobileDevice,
  type SpiritualSpeechState,
} from '../utils/spiritualSpeech';
import { useLanguage } from '../context/LanguageContext';

interface SpiritualTTSPlayerProps {
  /** The full text to read (e.g. poem verse + prophecy details) */
  textToRead: string;
  /** Optional title for the chanting banner */
  title?: string;
  /** Optional short subtitle */
  subtitle?: string;
  /** Optional whether expanded */
  initialExpanded?: boolean;
  /** Whether to show duplicate lines of text in the player (defaults to false) */
  showTextLines?: boolean;
}

export const SpiritualTTSPlayer: React.FC<SpiritualTTSPlayerProps> = ({
  textToRead,
  title,
  subtitle,
  showTextLines = false,
}) => {
  const { t, lang, format } = useLanguage();
  const [speechState, setSpeechState] = useState<SpiritualSpeechState>(
    spiritualSpeechEngine.getState()
  );
  const [showMobileTip, setShowMobileTip] = useState(false);

  useEffect(() => {
    const unsub = spiritualSpeechEngine.subscribe((state) => {
      setSpeechState(state);
    });
    return () => unsub();
  }, []);

  const isMobile = isMobileDevice();

  // Is this specific text currently being recited?
  const isCurrentTextActive = speechState.currentText === textToRead && speechState.isSpeaking;

  const handlePlay = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (speechState.isPaused && speechState.currentText === textToRead) {
      spiritualSpeechEngine.resume();
    } else {
      // Direct synchronous execution ensures mobile user gesture authorization is retained!
      spiritualSpeechEngine.speak(textToRead, { withChime: true, lang });
    }
  };

  const handlePause = (e?: React.MouseEvent) => {
    e?.preventDefault();
    spiritualSpeechEngine.pause();
  };

  const handleStop = (e?: React.MouseEvent) => {
    e?.preventDefault();
    spiritualSpeechEngine.stop();
  };

  // Split lines for synchronized display
  const lines = textToRead
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('---'));

  const activePreset = SPIRITUAL_PRESETS[speechState.activePresetId] || SPIRITUAL_PRESETS.sinsei;
  const localizedPresetTitle =
    activePreset.id === 'dharma'
      ? t.ttsPresetDharma
      : activePreset.id === 'meditation'
      ? t.ttsPresetMeditation
      : t.ttsPresetSinsei;

  return (
    <div className={`spiritual-tts-container ${isCurrentTextActive ? 'is-reciting' : ''}`}>
      {/* Header bar */}
      <div className="spiritual-tts-header">
        <div className="spiritual-tts-title-wrap">
          <span className="spiritual-tts-icon" aria-hidden="true">
            {speechState.isUnsupported ? '⚠️' : isCurrentTextActive ? '📿' : '🎙️'}
          </span>
          <div>
            {title ? (
              <>
                <h4 className="spiritual-tts-title">{title}</h4>
                {subtitle && <p className="spiritual-tts-sub">{subtitle}</p>}
              </>
            ) : (
              <h4 className="spiritual-tts-title">{subtitle || t.ttsDefaultSubtitle}</h4>
            )}
          </div>
        </div>

        <div className="spiritual-tts-header-actions">
          {!isCurrentTextActive ? (
            <button
              type="button"
              className="btn-tts-action-primary"
              onClick={handlePlay}
              title={speechState.isUnsupported ? t.ttsRetryTitle : t.ttsPlayTitle}
            >
              <span>{t.ttsPlay}</span>
            </button>
          ) : speechState.isPaused ? (
            <button
              type="button"
              className="btn-tts-action-primary"
              onClick={handlePlay}
              title={t.ttsResume}
            >
              <span>{t.ttsResume}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-tts-action-pause"
              onClick={handlePause}
              title={t.ttsPause}
            >
              <span>{t.ttsPause}</span>
            </button>
          )}

          {isCurrentTextActive && (
            <button
              type="button"
              className="btn-tts-action-stop"
              onClick={handleStop}
              title={t.ttsStop}
            >
              <span>{t.ttsStop}</span>
            </button>
          )}
        </div>
      </div>

      {/* Recitation Content & Active Aura Lines */}
      <div className="spiritual-tts-body">
        {/* Unsupported notice banner */}
        {speechState.isUnsupported && (
          <div className="spiritual-unsupported-banner" role="alert">
            <div className="unsupported-msg-wrap">
              <span className="unsupported-icon">⚠️</span>
              <div>
                <div className="unsupported-title">{t.ttsUnsupportedTitle}</div>
                <div className="unsupported-desc">{t.ttsUnsupportedDesc}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn-unsupported-retry"
              onClick={() => {
                spiritualSpeechEngine.speak(textToRead, { withChime: false, lang });
              }}
            >
              {t.ttsRetry}
            </button>
          </div>
        )}

        {/* Voice Engine Toggle Selector */}
        <div className="spiritual-engine-selector-row">
          <span className="selector-label">{t.ttsEngineLabel}</span>
          <div className="spiritual-engine-selector" role="group" aria-label={t.ttsEngineGroupAria}>
            <button
              type="button"
              className={`btn-engine-toggle ${speechState.engineType === 'google' ? 'active' : ''}`}
              onClick={() => spiritualSpeechEngine.setEngineType('google')}
              title={t.ttsMobileHintGoogle}
            >
              <span>{t.ttsEngineGoogle}</span>
            </button>
            <button
              type="button"
              className={`btn-engine-toggle ${speechState.engineType === 'native' ? 'active' : ''}`}
              onClick={() => spiritualSpeechEngine.setEngineType('native')}
              title={t.ttsMobileHintNative}
            >
              <span>{t.ttsEngineNative}</span>
            </button>
          </div>
        </div>

        {/* Speed Adjustment Selector Row */}
        <div className="spiritual-speed-selector-row">
          <div className="speed-label-wrap">
            <span className="selector-label">{t.ttsSpeedLabel}</span>
          </div>
          <div className="spiritual-speed-selector" role="group" aria-label={t.ttsSpeedGroupAria}>
            {[
              { val: 0.9, label: t.ttsSpeedSlow },
              { val: 1.0, label: t.ttsSpeedNormal },
              { val: 1.2, label: t.ttsSpeedFast },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`btn-speed-toggle ${speechState.googleTtsSpeed === opt.val ? 'active' : ''}`}
                onClick={() => spiritualSpeechEngine.setGoogleTtsSpeed(opt.val)}
                title={format(t.ttsSpeedTitle, { speed: opt.val })}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active persona indicator */}
        {speechState.isUnsupported ? (
          <div className="spiritual-active-persona-pill spiritual-unsupported-pill">
            <span className="persona-badge">⚠️ {t.ttsUnsupportedTitle}</span>
            <span className="persona-note">{t.ttsUnsupportedDesc}</span>
          </div>
        ) : isCurrentTextActive ? (
          <div className="spiritual-active-persona-pill">
            {speechState.engineType === 'google' ? (
              <>
                <span className="persona-badge">
                  {t.ttsPersonaGoogle}
                </span>
                <span className="persona-note">
                  {activePreset.icon} {format(t.ttsPersonaStyle, { preset: localizedPresetTitle })}
                </span>
              </>
            ) : (
              <>
                <span className="persona-badge">
                  {activePreset.icon} {format(t.ttsPersonaNative, { preset: localizedPresetTitle })}
                </span>
                <span className="persona-note">{t.ttsPersonaNote}</span>
              </>
            )}
          </div>
        ) : null}

        {/* Synchronized Recitation Verse Highlight - only displayed when active or unsupported */}
        {(isCurrentTextActive || speechState.isUnsupported) && (
          <div className="spiritual-verse-box">
            <div className="spiritual-verse-ambient-indicator">
              {isCurrentTextActive && !speechState.isPaused ? (
                <div className="audio-wave-bars" aria-hidden="true">
                  <span className="bar b1" />
                  <span className="bar b2" />
                  <span className="bar b3" />
                  <span className="bar b4" />
                  <span className="bar b5" />
                </div>
              ) : (
                <span className="static-meditation-dot">🕯️</span>
              )}
              <span className="verse-reading-status">
                {speechState.isUnsupported
                  ? `⚠️ ${t.ttsUnsupportedTitle}`
                  : speechState.isPaused
                  ? t.ttsStatusPaused
                  : speechState.engineType === 'google'
                  ? format(t.ttsStatusReadingGoogle, { preset: localizedPresetTitle })
                  : format(t.ttsStatusReadingNative, { preset: localizedPresetTitle })}
              </span>
            </div>

            {showTextLines && (
              <div className="spiritual-lines-display">
                {lines.map((line, idx) => {
                  const isLineActive = isCurrentTextActive && speechState.currentLineIndex === idx;
                  const isPassed = isCurrentTextActive && speechState.currentLineIndex > idx;
                  return (
                    <p
                      key={idx}
                      className={`spiritual-verse-line ${isLineActive ? 'line-reciting' : ''} ${
                        isPassed ? 'line-passed' : ''
                      }`}
                      onClick={() => {
                        // Click line to jump recitation directly
                        spiritualSpeechEngine.speak(textToRead, { startLine: idx, withChime: false, lang });
                      }}
                      title={t.ttsLineJumpTitle}
                    >
                      {isLineActive && <span className="line-golden-cursor">✨</span>}
                      {line}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Mobile Audio Helper / Silent Mode Reminder */}
        {isMobile && (
          <div className="spiritual-mobile-hint-box">
            <button
              type="button"
              className="btn-toggle-mobile-hint"
              onClick={() => setShowMobileTip((prev) => !prev)}
            >
              <span>{t.ttsMobileHintToggle} {showMobileTip ? '▲' : '▼'}</span>
            </button>
            {showMobileTip && (
              <div className="mobile-hint-content">
                <p>
                  <b>{t.ttsMobileHintHeading}</b>
                </p>
                <ul>
                  <li>
                    <b>Google Translate:</b> {t.ttsMobileHintGoogle}
                  </li>
                  <li>
                    <b>{t.ttsEngineNative}:</b> {t.ttsMobileHintNative}
                  </li>
                  <li>
                    <b>iPhone / iPad:</b> {t.ttsMobileHintIos}
                  </li>
                  <li>
                    <b>Android:</b> {t.ttsMobileHintAndroid}
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
