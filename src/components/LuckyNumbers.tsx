import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bridge } from '../bridge';
import type { LuckyNumbersResult } from '../types';
import { BurnTalisman } from './BurnTalisman';
import { LuckyMiniGames } from './LuckyMiniGames';
import { playFireCrackle } from '../utils/chantAudio';
import { saveJournalEntry } from '../utils/fortuneJournal';
import { buildLuckyNumbersCardData } from '../utils/cardDataBuilder';
import type { CardData } from '../utils/luckyCardCanvas';
import { logger } from '../utils/logger';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedLuckyNumberNote } from '../data/locales/propheciesRituals';

interface LuckyNumbersProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

export const LuckyNumbers: React.FC<LuckyNumbersProps> = ({ bridge, onToast, onOpenCard }) => {
  const { lang, t, format } = useLanguage();
  // Category: null = ยังไม่ได้เลือก (ถามก่อนเล่นเกม), 0 = เลข 2 หลัก, 1 = เลข 3 หลัก
  const [category, setCategory] = useState<0 | 1 | null>(null);
  const categoryRef = useRef<0 | 1 | null>(null);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  const [luckyResult, setLuckyResult] = useState<LuckyNumbersResult | null>(null);
  const [luckyNumber, setLuckyNumber] = useState<string>('89');

  // Burn level: 0 = unburned, 1 = 33%, 2 = 66%, 3 = 100% (fully revealed)
  const [burnLevel, setBurnLevel] = useState<number>(0);
  const burnLevelRef = useRef<number>(0);
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [isJournalSaved, setIsJournalSaved] = useState<boolean>(false);
  const burnTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (burnTimerRef.current !== null) {
        clearTimeout(burnTimerRef.current);
        burnTimerRef.current = null;
      }
    };
  }, []);

  // Initialize or fetch numbers when category changes
  const generateNumber = useCallback(
    (cat: 0 | 1) => {
      try {
        const res = bridge.luckyNumbers(cat);
        setLuckyResult(res);

        if (cat === 0) {
          const num = res.two && res.two.length > 0 ? res.two[0] : '89';
          setLuckyNumber(num);
        } else {
          const num = res.three && res.three.length > 0 ? res.three[0] : '728';
          setLuckyNumber(num);
        }
      } catch (err) {
        logger.error('Error in bridge.luckyNumbers:', err);
        onToast(t.commonErrorRetry);
      }
    },
    [bridge, onToast, t.commonErrorRetry]
  );

  useEffect(() => {
    if (category !== null) {
      generateNumber(category);
    }
  }, [category, generateNumber]);

  // Handle category selection before playing the game
  const handleSelectCategory = (cat: 0 | 1) => {
    categoryRef.current = cat;
    burnLevelRef.current = 0;
    setCategory(cat);
    setBurnLevel(0);
    setIsJournalSaved(false);
    onToast(`${cat === 0 ? t.lucky2Digits : t.lucky3Digits} — ${t.luckyTalismanBurnHint}`);
  };


  // Reset back to category selection prompt
  const handleResetToCategorySelection = () => {
    if (burnTimerRef.current !== null) {
      clearTimeout(burnTimerRef.current);
      burnTimerRef.current = null;
    }
    setIsBurning(false);
    categoryRef.current = null;
    burnLevelRef.current = 0;
    setCategory(null);
    setBurnLevel(0);
    setIsJournalSaved(false);
    onToast(t.luckyBackToChoiceToast);
  };

  // When player wins a round in any mini-game
  const handleWin = useCallback(() => {
    if (categoryRef.current === null) {
      onToast(t.luckyNeedCategoryToast);
      return;
    }

    setIsBurning(true);
    playFireCrackle();

    // Haptic vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 60, 40]);
      } catch (err) {
        logger.debug('Vibration API error:', err);
      }
    }

    const next = Math.min(3, burnLevelRef.current + 1);
    burnLevelRef.current = next;
    setBurnLevel(next);

    if (next === 3) {
      onToast(`🔥 ${t.luckyRevealComplete}`);
    } else {
      onToast(format(t.luckyBurnProgressToast, { next, rem: 3 - next }));
    }

    if (burnTimerRef.current !== null) {
      clearTimeout(burnTimerRef.current);
    }
    burnTimerRef.current = window.setTimeout(() => {
      burnTimerRef.current = null;
      if (isMountedRef.current) {
        setIsBurning(false);
      }
    }, 1100);
  }, [format, onToast, t.luckyBurnProgressToast, t.luckyNeedCategoryToast, t.luckyRevealComplete]);

  // Save to journal and open card modal
  const handleSaveAndShare = () => {
    if (burnLevel < 3 || category === null) return;
    const { cardData, details: detailsObj } = buildLuckyNumbersCardData(luckyNumber, category, lang);
    const catLabel = category === 0 ? t.lucky2Digits : t.lucky3Digits;

    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'number',
        title: format(t.luckyJournalTitle, { category: catLabel }),
        summary: format(t.luckyJournalSummary, { number: luckyNumber }),
        details: detailsObj,
      });
      setIsJournalSaved(true);
      onToast(t.savedToJournal);
    }
    if (onOpenCard) {
      onOpenCard(cardData);
    }
  };

  // When player loses a round
  const handleLose = useCallback(() => {
    onToast(t.luckyLoseToast);
  }, [onToast, t.luckyLoseToast]);

  // Reset to start a new burning talisman with currently selected category
  const handleReset = () => {
    if (category === null) return;
    if (burnTimerRef.current !== null) {
      clearTimeout(burnTimerRef.current);
      burnTimerRef.current = null;
    }
    setIsBurning(false);
    burnLevelRef.current = 0;
    setBurnLevel(0);
    setIsJournalSaved(false);
    generateNumber(category);
    onToast(t.luckyResetToast);
  };

  return (
    <section
      id="tab-number"
      className="ritual-frameless-stage tab lucky-numbers-section-stage"
      role="tabpanel"
      aria-label={t.luckyNumberTitle}
    >
      {category === null ? (
        /* Asking first before playing the game: 2 digits or 3 digits - Centered & Frameless */
        <div className="lucky-category-choice-row" role="region" aria-label={t.luckyNumberLead}>
          <button
            type="button"
            className="btn-lucky-choice choice-2-btn"
            onClick={() => handleSelectCategory(0)}
            aria-label={t.lucky2Digits}
          >
            <span>{t.lucky2Digits}</span>
          </button>

          <button
            type="button"
            className="btn-lucky-choice choice-3-btn"
            onClick={() => handleSelectCategory(1)}
            aria-label={t.lucky3Digits}
          >
            <span>{t.lucky3Digits}</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. Mini Games Section: Shown only while burning the talisman, hidden once successfully burned */}
          {burnLevel < 3 && (
            <LuckyMiniGames
              onWin={handleWin}
              onLose={handleLose}
            />
          )}

          {/* 2. Visual Altar Stage (Incense, Burning Talisman, and Wealth Treasure) */}
          {burnLevel === 3 ? (
            <article className="result lucky-final-card" aria-live="polite">
              <div className="lucky-final-header">
                <span className="lucky-final-seal">{t.luckyFinalSeal}</span>
                <h3>
                  {t.luckyFinalHeading}{' '}
                  <span className="highlight-lucky-number">{luckyNumber}</span>
                </h3>
                <p className="lucky-final-sub">
                  <b>{category === 0 ? t.lucky2Digits : t.lucky3Digits}</b> · {t.luckyBurnLevelNotice}: {burnLevel}/3
                </p>
              </div>

              {luckyResult?.note && (
                <p className="verse lucky-verse-text">{getLocalizedLuckyNumberNote(lang)}</p>
              )}

              <div className="aspects lucky-advice-grid">
                <div className="aspect">
                  <b>{t.luckyAdviceDirTitle}</b>
                  <span>{t.luckyAdviceDirText}</span>
                </div>
                <div className="aspect">
                  <b>{t.luckyAdviceWalletTitle}</b>
                  <span>{t.luckyAdviceWalletText}</span>
                </div>
                <div className="aspect">
                  <b>{t.luckyAdviceUsageTitle}</b>
                  <span>{t.luckyAdviceUsageText}</span>
                </div>
                <div className="aspect">
                  <b>{t.luckyAdviceWarnTitle}</b>
                  <span>{t.luckyAdviceWarnText}</span>
                </div>
              </div>

              <div className="row center" style={{ marginTop: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                {onOpenCard && (
                  <button
                    type="button"
                    className="btn gold"
                    onClick={handleSaveAndShare}
                    title={t.luckyViewCardBtn}
                  >
                    <span>{t.luckyViewCardBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn primary glow-gold"
                  onClick={handleReset}
                >
                  <span>{t.luckyBurnAgainBtn}</span>
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleResetToCategorySelection}
                  title={t.luckyChangeCatTitle}
                >
                  <span>{t.luckyChangeCatBtn}</span>
                </button>
              </div>
            </article>
          ) : (
            <BurnTalisman
              burnLevel={burnLevel}
              luckyNumber={luckyNumber}
              category={category}
              isBurning={isBurning}
            />
          )}
        </>
      )}
    </section>
  );
};
