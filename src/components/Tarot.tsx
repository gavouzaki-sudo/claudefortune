import React, { useState } from 'react';
import { Bridge } from '../bridge';
import type { TarotCard } from '../types';

interface TarotProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
}

const GLYPHS = [
  "🃏", "🪄", "🌙", "👑", "🏛️", "📿", "💞", "🛞", "🦁", "🏮", "☸️", "⚖️", "🙃", "🦋", "⚗️", "⛓️", "🗼", "⭐", "🌕", "☀️", "📯", "🌏"
];

const SPREAD_POSITIONS: Record<number, string[]> = {
  1: ["ไพ่ประจำวัน"],
  3: ["อดีต", "ปัจจุบัน", "อนาคต"],
  5: ["อดีต", "ปัจจุบัน", "อนาคต", "สิ่งที่ควรทำ", "ผลลัพธ์"],
};

export const Tarot: React.FC<TarotProps> = ({ bridge, onToast }) => {
  const [spread, setSpread] = useState<number>(3);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const handleDraw = () => {
    try {
      const res = bridge.drawTarot(spread);
      setCards(res.cards);
      setFlipped({});
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    }
  };

  const handleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: true }));
  };

  const handleFlipAll = () => {
    cards.forEach((_, i) => {
      setTimeout(() => {
        setFlipped((prev) => ({ ...prev, [i]: true }));
      }, i * 250);
    });
  };

  const positions = SPREAD_POSITIONS[spread] || [];

  return (
    <section id="tab-tarot" className="panel tab" role="tabpanel">
      <h2 className="title">ไพ่ยิปซี</h2>
      <p className="lead">เลือกรูปแบบการเปิดไพ่ ตั้งคำถามในใจ แล้วแตะไพ่แต่ละใบเพื่อพลิกดู</p>

      <div className="chips" role="radiogroup" aria-label="รูปแบบการเปิดไพ่">
        <label className="chip">
          <input
            type="radio"
            name="spread"
            value="1"
            checked={spread === 1}
            onChange={() => setSpread(1)}
          />
          <span>ไพ่ประจำวัน (1 ใบ)</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="spread"
            value="3"
            checked={spread === 3}
            onChange={() => setSpread(3)}
          />
          <span>อดีต · ปัจจุบัน · อนาคต (3 ใบ)</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="spread"
            value="5"
            checked={spread === 5}
            onChange={() => setSpread(5)}
          />
          <span>ไพ่ 5 ใบ</span>
        </label>
      </div>

      <div className="row center">
        <button id="btn-tarot" className="btn primary" type="button" onClick={handleDraw}>
          สับไพ่และจั่ว
        </button>
        {cards.length > 0 && (
          <button id="btn-flip-all" className="btn ghost" type="button" onClick={handleFlipAll}>
            พลิกทั้งหมด
          </button>
        )}
      </div>

      <div id="tarot-table" className="tarot-table" aria-live="polite">
        {cards.map((card, idx) => {
          const isFlipped = !!flipped[idx];
          const label = positions[idx] || `ใบที่ ${idx + 1}`;
          return (
            <div key={idx} className={`tslot ${isFlipped ? 'revealed' : ''}`}>
              <div className="pos">{label}</div>
              <div
                className={`tcard ${isFlipped ? 'flipped' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`ไพ่ใบที่ ${idx + 1} แตะเพื่อพลิก`}
                style={{ '--i': idx } as React.CSSProperties}
                onClick={() => handleFlip(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFlip(idx);
                  }
                }}
              >
                <div className="tcard-in">
                  <div className="tface tback" />
                  <div className={`tface tfront ${card.reversed ? 'rev' : ''}`}>
                    <div className="num">{String(card.id).padStart(2, '0')}</div>
                    <div className="glyph">{GLYPHS[card.id] || '🎴'}</div>
                    <div>
                      <div className="nm">{card.name}</div>
                      <div className="en">{card.en}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tmean">
                {card.reversed && <span className="rv">ไพ่กลับหัว</span>}
                {card.meaning}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
