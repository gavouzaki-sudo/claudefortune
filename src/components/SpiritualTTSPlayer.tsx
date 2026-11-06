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
}

export const SpiritualTTSPlayer: React.FC<SpiritualTTSPlayerProps> = ({
  textToRead,
  title = 'สดับฟังคำทำนายด้วยเสียงสวด / ธรรมบรรยาย',
  subtitle = 'เสียงอ่านสังเคราะห์ช้าๆ กังวาน นุ่มนวล สุ่มท่วงทำนองสงบใจอัตโนมัติ',
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
            {isCurrentTextActive ? (speechState.isFallbackMelody ? '🎵' : '📿') : '🎙️'}
          </span>
          <div>
            <h4 className="spiritual-tts-title">{title}</h4>
            <p className="spiritual-tts-sub">{subtitle}</p>
          </div>
        </div>

        <div className="spiritual-tts-header-actions">
          {!isCurrentTextActive ? (
            <button
              type="button"
              className="btn-tts-action-primary"
              onClick={handlePlay}
              title="เริ่มฟังเสียงอ่านธรรมบรรยาย (สุ่มท่วงทำนองอัตโนมัติ)"
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
        {/* Active randomized persona pill or Fallback Melodic Chant Pill */}
        {isCurrentTextActive && (
          <div className="spiritual-active-persona-pill">
            {speechState.isFallbackMelody ? (
              <>
                <span className="persona-badge">
                  🎵 ดนตรีสวดมงคล: ระนาดเอก 7TET & ขิมสยาม
                </span>
                <span className="persona-note">สวดทำนองเสนาะคลอคำทำนาย</span>
              </>
            ) : (
              <>
                <span className="persona-badge">
                  {activePreset.icon} ท่วงทำนอง: {activePreset.title}
                </span>
                <span className="persona-note">สุ่มอัตโนมัติ · เว้นวรรคสงบใจ</span>
              </>
            )}
          </div>
        )}

        {/* Synchronized Recitation Verse Highlight */}
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
              {isCurrentTextActive
                ? speechState.isPaused
                  ? '⏸ พักการอ่านชั่วคราว — กดปุ่มเพื่ออ่านต่อ'
                  : speechState.isFallbackMelody
                  ? '🎵 กำลังบรรเลงดนตรีสวดระนาดและขิมมงคลคลอบทอ่าน...'
                  : `📿 กำลังสวดบรรยายด้วยเสียง${activePreset.title}...`
                : 'กดปุ่มด้านบนเพื่อสดับรับฟังเสียง'}
            </span>
          </div>

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
        </div>

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
                  🔊 <b>หากกดอ่านแล้วเสียงไม่ออกในมือถือ:</b>
                </p>
                <ul>
                  <li>
                    <b>iPhone / iPad:</b> โปรดตรวจดูสวิตช์ปิดเสียง (Silent Mode Switch) ด้านข้างตัวเครื่องว่าไม่ได้เปิดแถบสีส้มอยู่
                  </li>
                  <li>
                    <b>Android:</b> โปรดเพิ่มระดับเสียงของ <u>มีเดีย (Media Volume)</u> ไม่ใช่แค่เสียงเรียกเข้า
                  </li>
                  <li>
                    ระบบรองรับทั้งเสียงสังเคราะห์ของเครื่อง และสตรีมมิ่งเสียงอ่านภาษาไทยความคมชัดสูงอัตโนมัติ
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
