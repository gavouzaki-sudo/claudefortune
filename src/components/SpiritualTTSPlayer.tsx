import React, { useState, useEffect } from 'react';
import {
  spiritualSpeechEngine,
  SPIRITUAL_PRESETS,
  isMobileDevice,
  type SpiritualSpeechState,
} from '../utils/spiritualSpeech';

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
      spiritualSpeechEngine.speak(textToRead, { withChime: true });
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
              <h4 className="spiritual-tts-title">{subtitle || 'สดับรับฟัง'}</h4>
            )}
          </div>
        </div>

        <div className="spiritual-tts-header-actions">
          {!isCurrentTextActive ? (
            <button
              type="button"
              className="btn-tts-action-primary"
              onClick={handlePlay}
              title={speechState.isUnsupported ? 'ลองฟังเสียงอ่านอีกครั้ง' : 'เริ่มฟังเสียงอ่านคำทำนาย'}
            >
              <span>▶ อ่าน</span>
            </button>
          ) : speechState.isPaused ? (
            <button
              type="button"
              className="btn-tts-action-primary"
              onClick={handlePlay}
              title="อ่านต่อ"
            >
              <span>▶ อ่านต่อ</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-tts-action-pause"
              onClick={handlePause}
              title="หยุดชั่วคราว"
            >
              <span>⏸ พัก</span>
            </button>
          )}

          {isCurrentTextActive && (
            <button
              type="button"
              className="btn-tts-action-stop"
              onClick={handleStop}
              title="หยุดอ่าน"
            >
              <span>⏹ หยุด</span>
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
                <div className="unsupported-title">ไม่รองรับเสียงพูด</div>
                <div className="unsupported-desc">อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับระบบเสียงพูด</div>
              </div>
            </div>
            <button
              type="button"
              className="btn-unsupported-retry"
              onClick={() => {
                spiritualSpeechEngine.speak(textToRead, { withChime: false });
              }}
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Voice Engine Toggle Selector */}
        <div className="spiritual-engine-selector-row">
          <span className="selector-label">ระบบเสียง:</span>
          <div className="spiritual-engine-selector" role="group" aria-label="เลือกระบบเสียงอ่าน">
            <button
              type="button"
              className={`btn-engine-toggle ${speechState.engineType === 'google' ? 'active' : ''}`}
              onClick={() => spiritualSpeechEngine.setEngineType('google')}
              title="เสียงอ่านภาษาไทย Google Translate (ออกเสียงชัดเจนเป็นธรรมชาติ)"
            >
              <span>🌐 Google Translate</span>
            </button>
            <button
              type="button"
              className={`btn-engine-toggle ${speechState.engineType === 'native' ? 'active' : ''}`}
              onClick={() => spiritualSpeechEngine.setEngineType('native')}
              title="เสียงสังเคราะห์ในตัวเครื่อง (Web Speech API)"
            >
              <span>🎙️ เสียงในเครื่อง</span>
            </button>
          </div>
        </div>

        {/* Speed Adjustment Selector Row: 1.35x option removed & current speed status display removed per request */}
        <div className="spiritual-speed-selector-row">
          <div className="speed-label-wrap">
            <span className="selector-label">ความเร็วเสียง:</span>
          </div>
          <div className="spiritual-speed-selector" role="group" aria-label="ปรับความเร็วเสียงอ่าน">
            {[
              { val: 0.9, label: '0.9x ช้า' },
              { val: 1.0, label: '1.0x ปกติ' },
              { val: 1.2, label: '⚡ 1.2x (+20%)' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`btn-speed-toggle ${speechState.googleTtsSpeed === opt.val ? 'active' : ''}`}
                onClick={() => spiritualSpeechEngine.setGoogleTtsSpeed(opt.val)}
                title={`ตั้งความเร็วเสียงเป็น ${opt.val} เท่า`}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active persona indicator: speed status value omitted per request */}
        {speechState.isUnsupported ? (
          <div className="spiritual-active-persona-pill spiritual-unsupported-pill">
            <span className="persona-badge">⚠️ ไม่รองรับเสียงพูด</span>
            <span className="persona-note">อุปกรณ์หรือเบราว์เซอร์ไม่รองรับระบบเสียงพูด</span>
          </div>
        ) : isCurrentTextActive ? (
          <div className="spiritual-active-persona-pill">
            {speechState.engineType === 'google' ? (
              <>
                <span className="persona-badge">
                  🌐 เสียงอ่าน: Google Translate
                </span>
                <span className="persona-note">
                  {activePreset.icon} สุ่มท่วงทำนอง: {activePreset.title}
                </span>
              </>
            ) : (
              <>
                <span className="persona-badge">
                  {activePreset.icon} ท่วงทำนองสุ่ม: {activePreset.title}
                </span>
                <span className="persona-note">สุ่มอัตโนมัติ · เว้นวรรคสงบใจ</span>
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
                  ? '⚠️ ไม่รองรับเสียงพูด'
                  : speechState.isPaused
                  ? '⏸ พักการอ่านชั่วคราว — กดปุ่มเพื่ออ่านต่อ'
                  : speechState.engineType === 'google'
                  ? `🌐 กำลังอ่านคำทำนายด้วยเสียง Google Translate (ท่วงทำนอง${activePreset.title})...`
                  : `📿 กำลังสวดบรรยายด้วยเสียง${activePreset.title}...`}
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
                        spiritualSpeechEngine.speak(textToRead, { startLine: idx, withChime: false });
                      }}
                      title="คลิกเพื่อเริ่มอ่านจากวรรคนี้"
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
              <span>📱 ข้อแนะนำเสียงบนมือถือ {showMobileTip ? '▲' : '▼'}</span>
            </button>
            {showMobileTip && (
              <div className="mobile-hint-content">
                <p>
                  🔊 <b>ข้อแนะนำสำหรับการฟังเสียงบนมือถือ:</b>
                </p>
                <ul>
                  <li>
                    <b>ระบบเสียง Google Translate:</b> ให้เสียงภาษาไทยที่ชัดเจนเป็นธรรมชาติ สตรีมสดจาก Google Translate พร้อมระบบสุ่มท่วงทำนอง
                  </li>
                  <li>
                    <b>ระบบเสียงในเครื่อง:</b> ใช้งานเอนจินเสียงสังเคราะห์ของระบบ (Web Speech API) ทำงานได้โดยตรง
                  </li>
                  <li>
                    <b>iPhone / iPad:</b> โปรดตรวจดูสวิตช์ปิดเสียง (Silent Mode Switch) ด้านข้างตัวเครื่องว่าไม่ได้เปิดแถบสีส้มอยู่
                  </li>
                  <li>
                    <b>Android:</b> โปรดเพิ่มระดับเสียงของ <u>มีเดีย (Media Volume)</u> ในการตั้งค่าเสียงของเครื่อง
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
