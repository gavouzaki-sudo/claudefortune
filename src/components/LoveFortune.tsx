import React, { useState, useRef, useEffect } from 'react';
import type { UserSession } from '../types';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { getLocalizedLoveReading } from '../data/ritualProphecies';
import { getLocalizedZodiacItem, ZODIAC_SYSTEMS } from '../data/zodiacSystems';
import { getWeeklyProphecySetIndex } from '../utils/prophecyCycle';
import { useLanguage } from '../context/LanguageContext';

interface LoveFortuneProps {
  session: UserSession;
  onToast: (msg: string) => void;
}

export const LoveFortune: React.FC<LoveFortuneProps> = ({ session, onToast }) => {
  const { t, lang, format } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<'single' | 'crush' | 'couple'>('single');
  const [readingMeta, setReadingMeta] = useState<{
    status: 'single' | 'crush' | 'couple';
    setIdx: number;
  } | null>(null);
  const [isReading, setIsReading] = useState(false);
  const divinateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (divinateTimerRef.current !== null) {
        clearTimeout(divinateTimerRef.current);
        divinateTimerRef.current = null;
      }
    };
  }, []);

  const handleDivinate = () => {
    if (divinateTimerRef.current !== null) {
      clearTimeout(divinateTimerRef.current);
    }
    setIsReading(true);
    setReadingMeta(null);

    divinateTimerRef.current = window.setTimeout(() => {
      divinateTimerRef.current = null;
      const setIdx = getWeeklyProphecySetIndex();
      const chosen = getLocalizedLoveReading(selectedStatus, setIdx, lang);
      setReadingMeta({ status: selectedStatus, setIdx });
      setIsReading(false);
      onToast(format(t.loveToastDone, { score: chosen.score }));
    }, 850);
  };

  const reading = readingMeta
    ? getLocalizedLoveReading(readingMeta.status, readingMeta.setIdx, lang)
    : null;

  const matchedSystem = ZODIAC_SYSTEMS.find((s) => s.id === session.systemId);
  const matchedItem = matchedSystem?.items.find((i) => i.id === session.zodiac);
  const localizedSymbolName = matchedItem
    ? getLocalizedZodiacItem(matchedItem, session.systemId, lang).name
    : session.symbolName;

  return (
    <section id="love-fortune" className="ritual-frameless-stage love-fortune-panel">
      {/* Relationship Status Selector */}
      <div className="status-selector-row">
        <label className="status-choice-label">{t.loveStatusLabel}</label>
        <div className="status-button-group">
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'single' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('single')}
          >
            {t.loveStatusSingle}
          </button>
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'crush' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('crush')}
          >
            {t.loveStatusCrush}
          </button>
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'couple' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('couple')}
          >
            {t.loveStatusCouple}
          </button>
        </div>
      </div>

      {/* Lotus Pond Action Button */}
      <div className="love-action-center">
        <button
          type="button"
          className="btn primary btn-love-divine"
          onClick={handleDivinate}
          disabled={isReading}
        >
          {isReading ? (
            <span>{t.loveDiviningBtn}</span>
          ) : (
            <span>{t.loveDivineBtn}</span>
          )}
        </button>
      </div>

      {/* Reading Result Card */}
      {reading && (
        <div className="result love-result-card animate-rise">
          <div className="love-card-header">
            <span className="love-badge">{reading.status} ({localizedSymbolName})</span>
            <span className="love-score-badge">{format(t.loveScoreLabel, { score: reading.score })}</span>
          </div>

          <h3 className="love-verdict-title">{reading.verdict}</h3>
          <p className="love-prediction-text">{reading.prediction}</p>

          {/* Spiritual Voice Reader for Love Oracle & Mantra */}
          <SpiritualTTSPlayer
            textToRead={[
              format(t.loveTtsHeading, { status: reading.status }),
              reading.verdict,
              reading.prediction,
              `${t.loveSoulmateElement}: ${reading.soulmateElement}`,
              `${t.loveSoulmateTrait}: ${reading.soulmateTrait}`,
              t.loveTtsMantraPrefix,
              reading.mantra,
            ].join('\n')}
            title={t.loveTtsTitle}
            subtitle={t.loveTtsSubtitle}
            initialExpanded={false}
          />

          <div className="love-traits-grid">
            <div className="trait-box">
              <span className="trait-title">{t.loveSoulmateElement}</span>
              <span className="trait-value">{reading.soulmateElement}</span>
            </div>
            <div className="trait-box">
              <span className="trait-title">{t.loveSoulmateTrait}</span>
              <span className="trait-value">{reading.soulmateTrait}</span>
            </div>
          </div>

          <div className="love-mantra-box">
            <span className="mantra-label">{t.loveMantraLabel}</span>
            <p className="mantra-text">"{reading.mantra}"</p>
          </div>
        </div>
      )}
    </section>
  );
};

