import React, { useState } from 'react';
import { Bridge } from '../bridge';
import type { TarotCard } from '../types';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { saveJournalEntry } from '../utils/fortuneJournal';
import { buildTarotCardData, TAROT_GLYPHS } from '../utils/cardDataBuilder';
import type { CardData } from '../utils/luckyCardCanvas';
import { logger } from '../utils/logger';
import { pad2 } from '../utils/formatters';
import { getLocalizedTarotTitle } from '../data/ritualProphecies';
import { useLanguage } from '../context/LanguageContext';

interface TarotProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

export const Tarot: React.FC<TarotProps> = ({ bridge, onToast, onOpenCard }) => {
  const { lang, t, format } = useLanguage();
  const [spread, setSpread] = useState<number>(3);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [isJournalSaved, setIsJournalSaved] = useState<boolean>(false);

  const spreadPositions: Record<number, string[]> = {
    1: [t.tarotPosDaily],
    3: [t.tarotPosPast, t.tarotPosPresent, t.tarotPosFuture],
    5: [t.tarotPosPast, t.tarotPosPresent, t.tarotPosFuture, t.tarotPosAdvice, t.tarotPosOutcome],
  };

  const handleDraw = () => {
    try {
      const res = bridge.drawTarot(spread);
      setCards(res.cards);
      setFlipped({});
      setIsJournalSaved(false);
      onToast(t.tarotDrawnToast);
    } catch (err) {
      logger.error('Error drawing tarot cards:', err);
      onToast(t.commonErrorRetry);
    }
  };

  const handleSaveAndShare = () => {
    if (cards.length === 0) return;
    const activeCards = cards.slice(0, spread);
    const { cardData, details: tarotDetails } = buildTarotCardData(
      activeCards,
      spread,
      TAROT_GLYPHS,
      spreadPositions,
      lang
    );

    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'tarot',
        title: cardData.title,
        summary: activeCards
          .map(
            (c) =>
              `${getLocalizedTarotTitle(c.id, c.name, c.en, lang)}${c.reversed ? ` (${t.tarotReversed})` : ''}`
          )
          .join(' · '),
        details: tarotDetails,
      });
      setIsJournalSaved(true);
      onToast(t.savedToJournal);
    }
    if (onOpenCard) {
      onOpenCard(cardData);
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
        onToast(format(t.tarotSpreadToast, { count: newSpread }));
      } catch (err) {
        logger.warn('Error redrawing tarot on spread change:', err);
        setCards((prev) => prev.slice(0, newSpread));
        setFlipped({});
      }
    }
  };

  const flipTimersRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    return () => {
      flipTimersRef.current.forEach((t) => clearTimeout(t));
      flipTimersRef.current = [];
    };
  }, []);

  const handleFlip = (index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: true }));
  };

  const handleFlipAll = () => {
    flipTimersRef.current.forEach((t) => clearTimeout(t));
    flipTimersRef.current = [];
    const activeCards = cards.slice(0, spread);
    activeCards.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setFlipped((prev) => ({ ...prev, [i]: true }));
      }, i * 180);
      flipTimersRef.current.push(t);
    });
  };

  const positions = spreadPositions[spread] || [];
  const activeCards = cards.slice(0, spread);
  const flippedCount = activeCards.filter((_, idx) => !!flipped[idx]).length;

  return (
    <section id="tab-tarot" className="ritual-frameless-stage tab" role="tabpanel" aria-label={t.tarotTitle}>
      {/* Spread Type Selector */}
      <div className="pills" role="radiogroup" aria-label={t.tarotLead}>
        {[1, 3, 5].map((count) => (
          <button
            key={count}
            type="button"
            role="radio"
            aria-checked={spread === count}
            className={`pill ${spread === count ? 'active' : ''}`}
            onClick={() => handleSpreadChange(count)}
          >
            {count === 1 ? t.tarotDaily : count === 3 ? t.tarot3Cards : t.tarot5Cards}
          </button>
        ))}
      </div>

      {/* Control Actions */}
      <div className="row center" style={{ flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <button id="btn-tarot" className="btn primary" type="button" onClick={handleDraw}>
          {t.tarotShuffleBtn}
        </button>
        {cards.length > 0 && (
          <button id="btn-flip-all" className="btn ghost" type="button" onClick={handleFlipAll}>
            {t.tarotFlipAll}
          </button>
        )}
        {cards.length > 0 && onOpenCard && (
          <button
            id="btn-card-tarot"
            className="btn gold"
            type="button"
            onClick={handleSaveAndShare}
            title={t.tarotViewCardBtn}
          >
            <span>{t.tarotViewCardBtn}</span>
          </button>
        )}
      </div>

      {/* ชุดไพ่ยิปซี (Tarot Cards Table) */}
      {cards.length > 0 && (
        <>
          <div id="tarot-table" className={`tarot-table spread-${spread}`} aria-live="polite">
            {activeCards.map((card, idx) => {
              const isFlipped = !!flipped[idx];
              const label = positions[idx] || format(t.tarotCardNum, { num: idx + 1 });
              const displayCardTitle = getLocalizedTarotTitle(card.id, card.name, card.en, lang);
              return (
                <div key={idx} className={`tslot ${isFlipped ? 'revealed' : ''}`}>
                  <div className="pos">{label}</div>
                  <div
                    className={`tcard ${isFlipped ? 'flipped' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label={format(t.tarotCardAria, {
                      num: idx + 1,
                      label,
                      state: isFlipped ? t.tarotStateRevealed : t.tarotStateTapFlip,
                    })}
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
                        <div className="glyph">{TAROT_GLYPHS[card.id] || '🎴'}</div>
                        <div>
                          <div className="nm">{displayCardTitle}</div>
                          {lang !== 'en' && <div className="en">{card.en}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tmean">
                    {card.reversed && <span className="rv">{t.tarotReversed}</span>}
                    {card.meaning}
                  </div>
                </div>
              );
            })}
          </div>
          {lang !== 'th' && flippedCount > 0 && (
            <p className="note" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              {t.oracleThaiFallbackNote}
            </p>
          )}
        </>
      )}

      {/* กล่องเสียงซินแสอ่านคำทำนายไพ่ยิปซี อยู่ด้านล่างชุดไพ่และคำทำนาย */}
      {cards.length > 0 && flippedCount > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <SpiritualTTSPlayer
            textToRead={activeCards
              .map((card, idx) => {
                const isFlipped = !!flipped[idx];
                if (!isFlipped) return null;
                const pos = positions[idx] || format(t.tarotCardNum, { num: idx + 1 });
                return [
                  `ตำแหน่ง ${pos}: ไพ่ ${card.name} (${card.en})`,
                  card.reversed ? 'สถานะ: ไพ่กลับหัว' : 'สถานะ: ไพ่หัวตั้ง',
                  `ความหมายและคำทำนาย: ${card.meaning}`,
                ].join('\n');
              })
              .filter(Boolean)
              .join('\n\n')}
            title={format(t.tarotTtsTitle, { count: flippedCount })}
            subtitle={t.tarotTtsSubtitle}
            initialExpanded={false}
          />
        </div>
      )}
    </section>
  );
};
