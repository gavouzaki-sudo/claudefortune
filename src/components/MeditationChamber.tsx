import React, { useState, useEffect, useRef } from 'react';
import {
  ambientSoundEngine,
  SOUNDSCAPES,
  type SoundscapeType,
  subscribeSoundscapeState,
} from '../utils/ambientSoundscapes';
import {
  stopChant,
  playChant,
  subscribeChantState,
  getActiveChantId,
} from '../utils/chantAudio';
import { spiritualSpeechEngine } from '../utils/spiritualSpeech';

interface MeditationChamberProps {
  systemId: string;
  systemName: string;
  onToast: (msg: string) => void;
}

const DHARMA_QUOTES = [
  { pali: 'นตฺถิ สนฺติปรํ สุขํ', thai: 'สุขอื่นยิ่งกว่าความสงบไม่มี' },
  { pali: 'จิตฺตํ ทนฺตํ สุขาวหํ', thai: 'จิตที่ฝึกดีแล้ว ย่อมนำความสุขมาให้' },
  { pali: 'อโรคฺยา ปรมา ลาภา', thai: 'ความไม่มีโรคและความสงบแห่งจิต เป็นลาภอันประเสริฐ' },
  { pali: 'สพฺเพ ตสนฺติ ทณฺฑสฺส', thai: 'สัตว์ทั้งหลายย่อมกลัวต่อความทุกข์ จงแผ่เมตตาแก่สรรพสัตว์' },
];

export const MeditationChamber: React.FC<MeditationChamberProps> = ({
  systemId,
  systemName,
  onToast,
}) => {
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>(
    ambientSoundEngine.getSoundscape()
  );
  const [activeMusic, setActiveMusic] = useState<string | null>(getActiveChantId());
  const [volume, setVolume] = useState<number>(ambientSoundEngine.getVolume());
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const timerRef = useRef<number | null>(null);

  // Sync with global audio states
  useEffect(() => {
    const unsubAmbient = subscribeSoundscapeState(() => {
      setActiveSoundscape(ambientSoundEngine.getSoundscape());
      setVolume(ambientSoundEngine.getVolume());
    });

    const unsubChant = subscribeChantState((chantId) => {
      setActiveMusic(chantId);
    });

    return () => {
      unsubAmbient();
      unsubChant();
    };
  }, []);

  // Breath pacing loop (4s inhale -> 4s hold -> 4s exhale)
  useEffect(() => {
    let phase = 0;
    const interval = window.setInterval(() => {
      phase = (phase + 1) % 3;
      if (phase === 0) setBreathPhase('inhale');
      else if (phase === 1) setBreathPhase('hold');
      else setBreathPhase('exhale');
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Meditation timer countdown
  useEffect(() => {
    if (timerSeconds === null) return;

    setTimerRemaining(timerSeconds);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setTimerSeconds(null);
          // Play temple bell completion tone
          spiritualSpeechEngine.playTempleChime();
          onToast('🔔 สิ้นสุดเวลาฝึกสมาธิ ขออนุโมทนาในกุศลจิต');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerSeconds, onToast]);

  // Audio coordination: Ensure only ONE sound plays to prevent audio clashes
  const handleSelectSoundscape = (type: SoundscapeType) => {
    // Stop competing cultural music and TTS
    stopChant();
    spiritualSpeechEngine.stop();

    if (activeSoundscape === type) {
      ambientSoundEngine.setSoundscape('none');
      onToast('ปิดเสียงบรรยากาศแล้ว');
    } else {
      ambientSoundEngine.setSoundscape(type);
      const found = SOUNDSCAPES.find((s) => s.id === type);
      if (found) {
        onToast(`🌿 เริ่มบรรเลง: ${found.title}`);
      }
    }
  };

  const handlePlayCulturalMusic = () => {
    // Stop competing soundscapes and TTS
    ambientSoundEngine.setSoundscape('none');
    spiritualSpeechEngine.stop();

    if (activeMusic) {
      stopChant();
      onToast('พักการบรรเลงดนตรี');
    } else {
      playChant(systemId);
      onToast(`🎵 บรรเลงดนตรีสมาธิอารยธรรม ${systemName}`);
    }
  };

  const handleStopAll = () => {
    ambientSoundEngine.setSoundscape('none');
    stopChant();
    spiritualSpeechEngine.stop();
    onToast('🔇 ปิดเสียงทั้งหมด เข้าสู่ความสงบเงียบ');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientSoundEngine.setVolume(val);
  };

  const isAudioPlaying = activeSoundscape !== 'none' || !!activeMusic;

  const currentQuote = DHARMA_QUOTES[quoteIndex];

  return (
    <section id="meditation-chamber" className="ritual-frameless-stage meditation-stage">
      <div className="meditation-header-center">
        <h2 className="title">🧘 มณฑลสมาธิ & คลื่นเสียงบำบัดจิต</h2>
        <p className="lead">
          พักผ่อนจิตใจในความสงบเงียบ กำหนดลมหายใจเข้าออก พร้อมรับฟังคลื่นเสียงธรรมชาติและเสียงสวดมนต์ศักดิ์สิทธิ์
        </p>
      </div>

      {/* Center Breathing Lotus Visualizer */}
      <div className="meditation-pacer-card">
        <div className={`meditation-lotus-wrap phase-${breathPhase}`}>
          <div className="lotus-glow-aura" />
          <div className="lotus-icon-center">🪷</div>
          <span className="breath-instruction">
            {breathPhase === 'inhale' && 'หายใจเข้าลึกๆ... รับพลังบริสุทธิ์ (พุท)'}
            {breathPhase === 'hold' && 'กลั้นลมหายใจเบาๆ... จิตนิ่งสงบ'}
            {breathPhase === 'exhale' && 'ผ่อนลมหายใจออกช้าๆ... ปล่อยวางทุกสิ่ง (โธ)'}
          </span>
        </div>

        {/* Dharma quote of the day */}
        <div
          className="dharma-quote-box"
          onClick={() => setQuoteIndex((prev) => (prev + 1) % DHARMA_QUOTES.length)}
          title="แตะเพื่อเปลี่ยนคติธรรม"
        >
          <span className="quote-pali">"{currentQuote.pali}"</span>
          <span className="quote-thai">— {currentQuote.thai}</span>
        </div>
      </div>

      {/* Soundscape Selection Cards */}
      <div className="meditation-sounds-container">
        <div className="meditation-section-title-row">
          <h3 className="sub-title">🌿 เลือกคลื่นเสียงสมาธิ (เล่นครั้งละ 1 เสียงอย่างนุ่มนวล)</h3>
          {isAudioPlaying && (
            <button
              type="button"
              className="btn-stop-all-audio"
              onClick={handleStopAll}
              title="ปิดเสียงทั้งหมดทันที"
            >
              🔇 ปิดเสียงทั้งหมด
            </button>
          )}
        </div>

        <div className="meditation-sound-grid">
          {SOUNDSCAPES.filter((s) => s.id !== 'none').map((s) => {
            const isSelected = activeSoundscape === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`meditation-sound-card ${isSelected ? 'active-sound' : ''}`}
                onClick={() => handleSelectSoundscape(s.id)}
              >
                <div className="card-top-status">
                  <span className="sound-emoji">{s.icon}</span>
                  <span className="sound-status-tag">
                    {isSelected ? '✓ กำลังเปิด' : 'เปิดฟัง'}
                  </span>
                </div>
                <strong className="sound-title">{s.title}</strong>
                <span className="sound-sub">{s.subtitle}</span>
                <p className="sound-desc">{s.description}</p>
                {isSelected && <span className="playing-indicator-wave">🎶 กำลังขับกล่อม</span>}
              </button>
            );
          })}

          {/* Cultural Melodic Music Option */}
          <button
            type="button"
            className={`meditation-sound-card ${activeMusic ? 'active-sound' : ''}`}
            onClick={handlePlayCulturalMusic}
          >
            <div className="card-top-status">
              <span className="sound-emoji">🎵</span>
              <span className="sound-status-tag">
                {activeMusic ? '✓ กำลังบรรเลง' : 'เปิดฟัง'}
              </span>
            </div>
            <strong className="sound-title">ดนตรีสมาธิ ({systemName})</strong>
            <span className="sound-sub">Procedural Melodic Harmony</span>
            <p className="sound-desc">
              บรรเลงเครื่องดนตรีโบราณประจำอารยธรรม เช่น ขิม ระนาดเอก หรือกู่เจิง คลอเบาๆ
            </p>
            {activeMusic && <span className="playing-indicator-wave">🎶 กำลังขับกล่อม</span>}
          </button>
        </div>

        {/* Volume Slider */}
        {isAudioPlaying && (
          <div className="meditation-volume-bar">
            <span className="volume-label">
              🔊 ระดับเสียง ({Math.round(volume * 100)}%):
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="spiritual-range"
            />
          </div>
        )}
      </div>

      {/* Meditation Timer Options */}
      <div className="meditation-timer-section">
        <h3 className="sub-title">⏱️ ตั้งเวลานั่งสมาธิ (พร้อมเสียงระฆังเมื่อครบเวลา)</h3>
        <div className="timer-buttons-row">
          {[180, 300, 600].map((sec) => (
            <button
              key={sec}
              type="button"
              className={`btn-timer-pill ${timerSeconds === sec ? 'active' : ''}`}
              onClick={() => setTimerSeconds(sec)}
            >
              {sec / 60} นาที
            </button>
          ))}
          {timerSeconds !== null && (
            <button
              type="button"
              className="btn-timer-cancel"
              onClick={() => setTimerSeconds(null)}
            >
              ✕ ยกเลิกเวลา
            </button>
          )}
        </div>

        {timerSeconds !== null && (
          <div className="timer-countdown-display">
            <span>เวลาสมาธิที่เหลือ:</span>
            <span className="countdown-time">
              {Math.floor(timerRemaining / 60)}:
              {String(timerRemaining % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
