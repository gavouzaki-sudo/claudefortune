import React, { useState, useRef, useEffect } from 'react';
import type { UserSession } from '../types';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { LOVE_FORTUNE_SETS, type LoveReadingSet } from '../data/ritualProphecies';
import { getWeeklyProphecySetIndex } from '../utils/prophecyCycle';

interface LoveFortuneProps {
  session: UserSession;
  onToast: (msg: string) => void;
}

export const LoveFortune: React.FC<LoveFortuneProps> = ({ session, onToast }) => {
  const [selectedStatus, setSelectedStatus] = useState<'single' | 'crush' | 'couple'>('single');
  const [reading, setReading] = useState<LoveReadingSet | null>(null);
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
    setReading(null);

    divinateTimerRef.current = window.setTimeout(() => {
      divinateTimerRef.current = null;
      const setIdx = getWeeklyProphecySetIndex();
      const pool = LOVE_FORTUNE_SETS[selectedStatus] || LOVE_FORTUNE_SETS.single;
      const chosen = pool[setIdx] || pool[0];
      setReading(chosen);
      setIsReading(false);
      onToast(`✨ ดวงความรักคลี่คลาย: คะแนนรัก ${chosen.score}%`);
    }, 850);
  };

  return (
    <section id="love-fortune" className="ritual-frameless-stage love-fortune-panel">
      {/* Relationship Status Selector */}
      <div className="status-selector-row">
        <label className="status-choice-label">สถานะหัวใจของคุณ:</label>
        <div className="status-button-group">
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'single' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('single')}
          >
            🌸 คนโสด (ตามหารักแท้)
          </button>
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'crush' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('crush')}
          >
            💌 คนแอบชอบ (วัดใจ)
          </button>
          <button
            type="button"
            className={`btn-status ${selectedStatus === 'couple' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('couple')}
          >
            💍 คนมีคู่ (เสริมสายใย)
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
            <span>กำลังส่องจิตผ่านเงาจันทร์... 🌙</span>
          ) : (
            <span>🪷 เสี่ยงทายดวงความรัก ➔</span>
          )}
        </button>
      </div>

      {/* Reading Result Card */}
      {reading && (
        <div className="result love-result-card animate-rise">
          <div className="love-card-header">
            <span className="love-badge">{reading.status} ({session.symbolName})</span>
            <span className="love-score-badge">ความสมพงษ์ {reading.score}%</span>
          </div>

          <h3 className="love-verdict-title">{reading.verdict}</h3>
          <p className="love-prediction-text">{reading.prediction}</p>

          {/* Spiritual Voice Reader for Love Oracle & Mantra */}
          <SpiritualTTSPlayer
            textToRead={[
              `คำทำนายดวงความรัก ${reading.status}`,
              reading.verdict,
              reading.prediction,
              `ธาตุคู่แท้ที่สมพงษ์: ${reading.soulmateElement}`,
              `ลักษณะเด่นคู่ชะตา: ${reading.soulmateTrait}`,
              `บทสวดพระคาถาเสริมเมตตามหาเสน่ห์:`,
              reading.mantra,
            ].join('\n')}
            title="เสียงสวดมนต์เมตตามหานิยม & ดวงความรัก"
            subtitle="สดับรับฟังเสียงสวดพระคาถาเมตตามหาเสน่ห์และคำทำนายคู่แท้"
            initialExpanded={false}
          />

          <div className="love-traits-grid">
            <div className="trait-box">
              <span className="trait-title">ธาตุคู่แท้ที่สมพงษ์</span>
              <span className="trait-value">{reading.soulmateElement}</span>
            </div>
            <div className="trait-box">
              <span className="trait-title">ลักษณะเด่นของคู่ชะตา</span>
              <span className="trait-value">{reading.soulmateTrait}</span>
            </div>
          </div>

          <div className="love-mantra-box">
            <span className="mantra-label">บทสวดมนต์เสริมเมตตามหาเสน่ห์ประจำดวงชะตา:</span>
            <p className="mantra-text">"{reading.mantra}"</p>
          </div>
        </div>
      )}
    </section>
  );
};
