import React, { useState } from 'react';
import { Bridge } from '../bridge';
import type { TarotCard } from '../types';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { saveJournalEntry } from '../utils/fortuneJournal';
import type { CardData } from '../utils/luckyCardCanvas';
import { logger } from '../utils/logger';
import { pad2 } from '../utils/formatters';

interface TarotProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

const GLYPHS = [
  "🃏", "🪄", "🌙", "👑", "🏛️", "📿", "💞", "🛞", "🦁", "🏮", "☸️", "⚖️", "🙃", "🦋", "⚗️", "⛓️", "🗼", "⭐", "🌕", "☀️", "📯", "🌏"
];

const SPREAD_POSITIONS: Record<number, string[]> = {
  1: ["ไพ่ประจำวัน"],
  3: ["อดีต", "ปัจจุบัน", "อนาคต"],
  5: ["อดีต", "ปัจจุบัน", "อนาคต", "สิ่งที่ควรทำ", "ผลลัพธ์"],
};

export const Tarot: React.FC<TarotProps> = ({ bridge, onToast, onOpenCard }) => {
  const [spread, setSpread] = useState<number>(3);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [isJournalSaved, setIsJournalSaved] = useState<boolean>(false);

  const handleDraw = () => {
    try {
      const res = bridge.drawTarot(spread);
      setCards(res.cards);
      setFlipped({});
      setIsJournalSaved(false);
      onToast('✨ สับไพ่เรียบร้อย แตะไพ่เพื่อพลิกดูชะตา');
    } catch (err) {
      logger.error('Error drawing tarot cards:', err);
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    }
  };

  const handleSaveAndShare = () => {
    if (cards.length === 0) return;
    const activeCards = cards.slice(0, spread);
    const tarotDetails = {
      tarotCards: activeCards.map((c, i) => ({
        name: c.name,
        nameEn: c.en,
        glyph: GLYPHS[c.id] || '🔮',
        reversed: c.reversed,
        position: SPREAD_POSITIONS[spread]?.[i] || `ใบที่ ${i + 1}`,
      })),
    };

    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'tarot',
        title: `ไพ่ยิปซี (${spread} ใบ)`,
        summary: activeCards.map((c) => `${c.name}${c.reversed ? ' (กลับหัว)' : ''}`).join(' · '),
        details: tarotDetails,
      });
      setIsJournalSaved(true);
      onToast('📖 บันทึกลงในสมุดดวงชะตาเรียบร้อยแล้ว');
    }
    if (onOpenCard) {
      onOpenCard({
        type: 'tarot',
        title: `ไพ่ยิปซี (${spread} ใบ)`,
        details: tarotDetails,
      });
    }
  };

  const handleSpreadChange = (newSpread: number) => {
    setSpread(newSpread);
    setIsJournalSaved(false);
    if (cards.length > 0) {
      try {
        const res = bridge.drawTarot(newSpread);
        setCards(res.cards);
        setFlipped({});
        onToast(`✨ ปรับเป็น ${newSpread} ใบ — สับไพ่ใหม่เรียบร้อย`);
      } catch (err) {
        logger.warn('Error redrawing tarot on spread change:', err);
        setCards((prev) => prev.slice(0, newSpread));
        setFlipped({});
      }
    }
  };

  const handleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: true }));
  };

  const handleFlipAll = () => {
    const activeCards = cards.slice(0, spread);
    activeCards.forEach((_, i) => {
      setTimeout(() => {
        setFlipped((prev) => ({ ...prev, [i]: true }));
      }, i * 180);
    });
  };

  const positions = SPREAD_POSITIONS[spread] || [];
  const activeCards = cards.slice(0, spread);
  const flippedCount = activeCards.filter((_, idx) => !!flipped[idx]).length;

  return (
    <section id="tab-tarot" className="ritual-frameless-stage tab" role="tabpanel">
      {/* Spread Type Selector */}
      <div className="chips" role="radiogroup" aria-label="รูปแบบการเปิดไพ่">
        <label className="chip">
          <input
            type="radio"
            name="spread"
            value="1"
            checked={spread === 1}
            onChange={() => handleSpreadChange(1)}
          />
          <span>ไพ่ 1 ใบ</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="spread"
            value="3"
            checked={spread === 3}
            onChange={() => handleSpreadChange(3)}
          />
          <span>ไพ่ 3 ใบ</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="spread"
            value="5"
            checked={spread === 5}
            onChange={() => handleSpreadChange(5)}
          />
          <span>ไพ่ 5 ใบ</span>
        </label>
      </div>

      {/* Control Actions */}
      <div className="row center" style={{ flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <button id="btn-tarot" className="btn primary" type="button" onClick={handleDraw}>
          สับไพ่และจั่ว
        </button>
        {cards.length > 0 && (
          <button id="btn-flip-all" className="btn ghost" type="button" onClick={handleFlipAll}>
            พลิกทั้งหมด
          </button>
        )}
        {cards.length > 0 && onOpenCard && (
          <button
            id="btn-card-tarot"
            className="btn gold"
            type="button"
            onClick={handleSaveAndShare}
            title="บันทึกและแชร์การ์ดคำทำนาย"
          >
            <span>🎴 บันทึก&แชร์</span>
          </button>
        )}
      </div>

      {/* ชุดไพ่ยิปซี (Tarot Cards Table) */}
      <div id="tarot-table" className={`tarot-table spread-${spread}`} aria-live="polite">
        {activeCards.map((card, idx) => {
          const isFlipped = !!flipped[idx];
          const label = positions[idx] || `ใบที่ ${idx + 1}`;
          return (
            <div key={idx} className={`tslot ${isFlipped ? 'revealed' : ''}`}>
              <div className="pos">{label}</div>
              <div
                className={`tcard ${isFlipped ? 'flipped' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`ไพ่ใบที่ ${idx + 1} (${label}) ${isFlipped ? 'เปิดแล้ว' : 'แตะเพื่อพลิก'}`}
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
                    <div className="num">{pad2(card.id)}</div>
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

      {/* กล่องเสียงซินแสอ่านคำทำนายไพ่ยิปซี อยู่ด้านล่างชุดไพ่และคำทำนาย */}
      {cards.length > 0 && flippedCount > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <SpiritualTTSPlayer
            textToRead={activeCards
              .map((card, idx) => {
                const isFlipped = !!flipped[idx];
                if (!isFlipped) return null;
                const pos = positions[idx] || `ตำแหน่งที่ ${idx + 1}`;
                return [
                  `ตำแหน่ง ${pos}: ไพ่ ${card.name} (${card.en})`,
                  card.reversed ? 'สถานะ: ไพ่กลับหัว' : 'สถานะ: ไพ่หัวตั้ง',
                  `ความหมายและคำทำนาย: ${card.meaning}`,
                ].join('\n');
              })
              .filter(Boolean)
              .join('\n\n')}
            title={`เสียงซินแสอ่านคำทำนายไพ่ยิปซี (${flippedCount} ใบ)`}
            subtitle="สดับรับฟังเสียงสวดและธรรมบรรยายอ่านความหมายไพ่ชะตาชีวิต"
            initialExpanded={false}
          />
        </div>
      )}
    </section>
  );
};
