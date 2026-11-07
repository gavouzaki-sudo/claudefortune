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
  subtitle = 'เสียงอ่านภาษาไทยความคมชัดสูง สตรีมมิ่งสดผ่าน Google Translate TTS & เสียงสังเคราะห์',
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
              title="เริ่มฟังเสียงอ่านคำทำนาย"
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
        {/* Voice Engine Toggle Selector */}
        <div className="spiritual-engine-selector-row">
          <span className="selector-label">ระบบเสียง:</span>
          <div className="spiritual-engine-selector" role="group" aria-label="เลือกระบบเสียงอ่าน">
            <button
              type="button"
              className={`btn-engine-toggle ${speechState.engineType === 'google' ? 'active' : ''}`}
              onClick={() => spiritualSpeechEngine.setEngineType('google')}
              title="เสียงอ่านภาษาไทยออนไลน์ Google TTS (แนะนำสำหรับมือถือและทุกอุปกรณ์ ออกเสียงชัดเจน 100%)"
            >
              <span>🌐 Google TTS (ชัดเจน)</span>
            </button>
            <button
              type="button"
              className={`btn-engine-toggle ${speechState.engineType === 'native' ? 'active' : ''}`}
              onClick={() => spiritualSpeechEngine.setEngineType('native')}
              title="เสียงสังเคราะห์ของเครื่องเบราว์เซอร์"
            >
              <span>🎙️ เสียงในเครื่อง</span>
            </button>
          </div>
        </div>

        {/* Active persona or Google TTS pill */}
        {isCurrentTextActive && (
          <div className="spiritual-active-persona-pill">
            {speechState.isFallbackMelody ? (
              <>
                <span className="persona-badge">
                  🎵 ดนตรีสวดมงคล: ระนาดเอก 7TET & ขิมสยาม
                </span>
                <span className="persona-note">สวดทำนองเสนาะคลอคำทำนาย</span>
              </>
            ) : speechState.engineType === 'google' ? (
              <>
                <span className="persona-badge">
                  🌐 เสียงอ่าน: Google Thai TTS
                </span>
                <span className="persona-note">สตรีมเสียงอ่านภาษาไทยชัดเจนทุกวรรณยุกต์</span>
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
                  : speechState.engineType === 'google'
                  ? '🌐 กำลังอ่านคำทำนายด้วยเสียง Google Thai TTS...'
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
                  🔊 <b>ข้อแนะนำสำหรับการฟังเสียงบนมือถือ:</b>
                </p>
                <ul>
                  <li>
                    <b>ระบบเลือก Google Thai TTS เป็นค่าเริ่มต้น:</b> ออกเสียงภาษาไทยชัดเจน 100% ครบทุกวรรณยุกต์ ไม่จำเป็นต้องมีชุดเสียงในเครื่อง
                  </li>
                  <li>
                    <b>iPhone / iPad:</b> โปรดตรวจดูสวิตช์ปิดเสียง (Silent Mode Switch) ด้านข้างตัวเครื่องว่าไม่ได้เปิดแถบสีส้มอยู่
                  </li>
                  <li>
                    <b>Android:</b> โปรดเพิ่มระดับเสียงของ <u>มีเดีย (Media Volume)</u> ไม่ใช่แค่เสียงเรียกเข้า
                  </li>
                  <li>
                    สามารถสลับไปฟัง <b>"🎙️ เสียงในเครื่อง"</b> เพื่อสัมผัสท่วงทำนองซินแสอาวุโสได้ตามต้องการ
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
