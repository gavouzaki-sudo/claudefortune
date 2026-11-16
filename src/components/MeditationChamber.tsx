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
import {
  getLocalizedMeditationQuote,
  MEDITATION_QUOTES_5,
} from '../data/ritualProphecies';
import { getLocalizedZodiacSystem, ZODIAC_SYSTEMS } from '../data/zodiacSystems';
import { getWeeklyProphecySetIndex } from '../utils/prophecyCycle';
import { useLanguage } from '../context/LanguageContext';

interface MeditationChamberProps {
  systemId: string;
  systemName: string;
  onToast: (msg: string) => void;
}

export const MeditationChamber: React.FC<MeditationChamberProps> = ({
  systemId,
  systemName,
  onToast,
}) => {
  const { t, lang, format } = useLanguage();
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>(
    ambientSoundEngine.getSoundscape()
  );
  const [activeMusic, setActiveMusic] = useState<string | null>(getActiveChantId());
  const [volume, setVolume] = useState<number>(ambientSoundEngine.getVolume());
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerRunId, setTimerRunId] = useState<number>(0);
  const [quoteIndex, setQuoteIndex] = useState<number>(() => getWeeklyProphecySetIndex());

  const timerRef = useRef<number | null>(null);
  const finishedToastRef = useRef(t.medToastFinished);
  finishedToastRef.current = t.medToastFinished;

  const matchedSystem = ZODIAC_SYSTEMS.find((s) => s.id === systemId);
  const localizedSystemName = matchedSystem
    ? getLocalizedZodiacSystem(matchedSystem, lang).name
    : systemName;

  const getSoundscapeText = (id: SoundscapeType, fallbackTitle: string, fallbackSub: string, fallbackDesc: string) => {
    switch (id) {
      case 'bamboo_chime':
        return { title: t.medSoundBambooTitle, subtitle: t.medSoundBambooSub, description: t.medSoundBambooDesc };
      case 'temple_rain':
        return { title: t.medSoundRainTitle, subtitle: t.medSoundRainSub, description: t.medSoundRainDesc };
      case 'tibetan_bowl':
        return { title: t.medSoundBowlTitle, subtitle: t.medSoundBowlSub, description: t.medSoundBowlDesc };
      case 'temple_bell':
        return { title: t.medSoundBellTitle, subtitle: t.medSoundBellSub, description: t.medSoundBellDesc };
      default:
        return { title: fallbackTitle, subtitle: fallbackSub, description: fallbackDesc };
    }
  };

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

    let remaining = timerSeconds;
    setTimerRemaining(remaining);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setTimerRemaining(0);
        setTimerSeconds(null);
        spiritualSpeechEngine.playTempleChime();
        onToast(finishedToastRef.current);
        return;
      }
      setTimerRemaining(remaining);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerSeconds, timerRunId, onToast]);

  // Audio coordination: Ensure only ONE sound plays to prevent audio clashes
  const handleSelectSoundscape = (type: SoundscapeType) => {
    stopChant();
    spiritualSpeechEngine.stop();

    if (activeSoundscape === type) {
      ambientSoundEngine.setSoundscape('none');
      onToast(t.medToastAmbientOff);
    } else {
      ambientSoundEngine.setSoundscape(type);
      const found = SOUNDSCAPES.find((s) => s.id === type);
      if (found) {
        const loc = getSoundscapeText(found.id, found.title, found.subtitle, found.description);
        onToast(format(t.medToastAmbientOn, { title: loc.title }));
      }
    }
  };

  const handlePlayCulturalMusic = () => {
    ambientSoundEngine.setSoundscape('none');
    spiritualSpeechEngine.stop();

    if (activeMusic) {
      stopChant();
      onToast(t.medToastMusicOff);
    } else {
      playChant(systemId);
      onToast(format(t.medToastMusicOn, { system: localizedSystemName }));
    }
  };

  const handleStopAll = () => {
    ambientSoundEngine.setSoundscape('none');
    stopChant();
    spiritualSpeechEngine.stop();
    onToast(t.medToastAllStopped);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientSoundEngine.setVolume(val);
  };

  const isAudioPlaying = activeSoundscape !== 'none' || !!activeMusic;
  const currentQuote = getLocalizedMeditationQuote(quoteIndex, lang);

  return (
    <section id="meditation-chamber" className="ritual-frameless-stage meditation-stage">
      {/* Center Breathing Lotus Visualizer */}
      <div className="meditation-pacer-card">
        <div className={`meditation-lotus-wrap phase-${breathPhase}`}>
          <div className="lotus-glow-aura" />
          <div className="lotus-icon-center">🪷</div>
          <span className="breath-instruction">
            {breathPhase === 'inhale' && t.medBreathInhale}
            {breathPhase === 'hold' && t.medBreathHold}
            {breathPhase === 'exhale' && t.medBreathExhale}
          </span>
        </div>

        {/* Dharma quote of the week */}
        <div
          className="dharma-quote-box"
          onClick={() => setQuoteIndex((prev) => (prev + 1) % MEDITATION_QUOTES_5.length)}
          title={t.medQuoteTapTitle}
        >
          <span className="quote-pali">"{currentQuote.pali}"</span>
          <span className="quote-thai">— {currentQuote.thai}</span>
        </div>
      </div>

      {/* Soundscape Selection Cards */}
      <div className="meditation-sounds-container">
        <div className="meditation-section-title-row">
          <h3 className="sub-title">{t.medSoundsHeading}</h3>
          {isAudioPlaying && (
            <button
              type="button"
              className="btn-stop-all-audio"
              onClick={handleStopAll}
              title={t.medStopAllTitle}
            >
              {t.medStopAllBtn}
            </button>
          )}
        </div>

        <div className="meditation-sound-grid">
          {SOUNDSCAPES.filter((s) => s.id !== 'none').map((s) => {
            const isSelected = activeSoundscape === s.id;
            const loc = getSoundscapeText(s.id, s.title, s.subtitle, s.description);
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
                    {isSelected ? t.medStatusPlaying : t.medStatusListen}
                  </span>
                </div>
                <strong className="sound-title">{loc.title}</strong>
                <span className="sound-sub">{loc.subtitle}</span>
                <p className="sound-desc">{loc.description}</p>
                {isSelected && <span className="playing-indicator-wave">{t.medWaveIndicator}</span>}
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
                {activeMusic ? t.medStatusActiveMusic : t.medStatusListen}
              </span>
            </div>
            <strong className="sound-title">{format(t.medMusicTitle, { system: localizedSystemName })}</strong>
            <span className="sound-sub">{t.medMusicSub}</span>
            <p className="sound-desc">{t.medMusicDesc}</p>
            {activeMusic && <span className="playing-indicator-wave">{t.medWaveIndicator}</span>}
          </button>
        </div>

        {/* Volume Slider */}
        {isAudioPlaying && (
          <div className="meditation-volume-bar">
            <span className="volume-label">
              {format(t.medVolumeLabel, { volume: Math.round(volume * 100) })}
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
        <h3 className="sub-title">{t.medTimerHeading}</h3>
        <div className="timer-buttons-row">
          {[180, 300, 600].map((sec) => (
            <button
              key={sec}
              type="button"
              className={`btn-timer-pill ${timerSeconds === sec ? 'active' : ''}`}
              onClick={() => {
                setTimerSeconds(sec);
                setTimerRunId((id) => id + 1);
              }}
            >
              {format(t.medTimerMinuteBtn, { min: sec / 60 })}
            </button>
          ))}
          {timerSeconds !== null && (
            <button
              type="button"
              className="btn-timer-cancel"
              onClick={() => setTimerSeconds(null)}
            >
              {t.medTimerCancelBtn}
            </button>
          )}
        </div>

        {timerSeconds !== null && (
          <div className="timer-countdown-display">
            <span>{t.medTimerRemainingLabel}</span>
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

