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

interface LuckyNumbersProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

export const LuckyNumbers: React.FC<LuckyNumbersProps> = ({ bridge, onToast, onOpenCard }) => {
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
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [isJournalSaved, setIsJournalSaved] = useState<boolean>(false);

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
        setTimeout(() => {
          onToast('เกิดข้อผิดพลาดในการคำนวณเลขมงคล');
        }, 0);
      }
    },
    [bridge, onToast]
  );

  useEffect(() => {
    if (category !== null) {
      generateNumber(category);
    }
  }, [category, generateNumber]);

  // Handle category selection before playing the game
  const handleSelectCategory = (cat: 0 | 1) => {
    categoryRef.current = cat;
    setCategory(cat);
    setBurnLevel(0);
    setIsJournalSaved(false);
    generateNumber(cat);
    setTimeout(() => {
      onToast(`ตั้งจิตขอ ${cat === 0 ? 'เลข 2 หลัก' : 'เลข 3 หลัก'} สำเร็จ! เริ่มเล่นมินิเกมได้เลย`);
    }, 0);
  };


  // Reset back to category selection prompt
  const handleResetToCategorySelection = () => {
    categoryRef.current = null;
    setCategory(null);
    setBurnLevel(0);
    setIsJournalSaved(false);
    setTimeout(() => {
      onToast('กลับสู่ขั้นตอนเลือกเลข 2 หลัก หรือ 3 หลัก');
    }, 0);
  };

  // When player wins a round in any mini-game
  const handleWin = useCallback(() => {
    if (categoryRef.current === null) {
      setTimeout(() => {
        onToast('⚠️ กรุณาเลือกประเภทเลข 2 หลัก หรือ 3 หลักก่อน');
      }, 0);
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

    setBurnLevel((prev) => {
      const next = Math.min(3, prev + 1);
      setTimeout(() => {
        if (next === 3) {
          onToast('🔥 ยันต์มอดไหม้สมบูรณ์! ปรากฏเลขมงคล 100%!');
        } else {
          onToast(`🔥 เพลิงเผายันต์ลามขึ้น! (${next}/3 ตา) ชนะอีก ${3 - next} ตา!`);
        }
      }, 0);
      return next;
    });

    setTimeout(() => {
      setIsBurning(false);
    }, 1100);
  }, [onToast]);

  // Save to journal and open card modal
  const handleSaveAndShare = () => {
    if (burnLevel < 3 || category === null) return;
    const { cardData, details: detailsObj } = buildLuckyNumbersCardData(luckyNumber, category);

    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'number',
        title: `เลขมงคล (${category === 0 ? 'เลข 2 หลัก' : 'เลข 3 หลัก'})`,
        summary: `เลขเด่น: ${luckyNumber} — เผายันต์สำเร็จ`,
        details: detailsObj,
      });
      setIsJournalSaved(true);
      onToast('📖 บันทึกลงในสมุดดวงชะตาเรียบร้อยแล้ว');
    }
    if (onOpenCard) {
      onOpenCard(cardData);
    }
  };

  // When player loses a round
  const handleLose = useCallback(() => {
    setTimeout(() => {
      onToast('🏮 ตานี้ยังไม่ชนะ เพลิงจึงยังไม่ลาม — เล่นใหม่อีกครั้ง!');
    }, 0);
  }, [onToast]);

  // Reset to start a new burning talisman with currently selected category
  const handleReset = () => {
    if (category === null) return;
    setBurnLevel(0);
    setIsJournalSaved(false);
    generateNumber(category);
    setTimeout(() => {
      onToast('รีเซ็ตพร้อมเริ่มเผายันต์ขอเลขใหม่');
    }, 0);
  };

  return (
    <section
      id="tab-number"
      className="ritual-frameless-stage tab lucky-numbers-section-stage"
      role="tabpanel"
    >
      {category === null ? (
        /* Asking first before playing the game: 2 digits or 3 digits - Centered & Frameless */
        <div className="lucky-category-choice-row" role="region" aria-label="เลือกประเภทเลขมงคล">
          <button
            type="button"
            className="btn-lucky-choice choice-2-btn"
            onClick={() => handleSelectCategory(0)}
            aria-label="เลือกขอเลข 2 หลัก"
          >
            <span>เลข 2 หลัก</span>
          </button>

          <button
            type="button"
            className="btn-lucky-choice choice-3-btn"
            onClick={() => handleSelectCategory(1)}
            aria-label="เลือกขอเลข 3 หลัก"
          >
            <span>เลข 3 หลัก</span>
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
                <span className="lucky-final-seal">✦ มงคลฤกษ์ ✦</span>
                <h3>
                  เลขมงคลประจำตัวของคุณ:{' '}
                  <span className="highlight-lucky-number">{luckyNumber}</span>
                </h3>
                <p className="lucky-final-sub">
                  ประเภท: <b>{category === 0 ? 'เลข 2 หลัก (เลขท้าย 2 ตัว)' : 'เลข 3 หลัก (เลขท้าย 3 ตัว)'}</b> · เผาด้วยจิตศรัทธาครบ 3 ตา
                </p>
              </div>

              {luckyResult?.note && (
                <p className="verse lucky-verse-text">{luckyResult.note}</p>
              )}

              <div className="aspects lucky-advice-grid">
                <div className="aspect">
                  <b>ทิศนำโชคประจำวัน</b>
                  <span>ทิศตะวันออกเฉียงเหนือ (ทิศทรัพย์มงคล)</span>
                </div>
                <div className="aspect">
                  <b>สีกระเป๋าสตางค์เสริมดวง</b>
                  <span>สีทองคำ, สีส้มอิฐ และสีเขียวมรกต</span>
                </div>
                <div className="aspect">
                  <b>ข้อแนะนำการใช้เลข</b>
                  <span>เหมาะสำหรับใช้เป็นเลขตั้งเป้าหมาย หรือรหัสเสริมพลังใจ</span>
                </div>
                <div className="aspect">
                  <b>คำเตือนมงคล</b>
                  <span>เพื่อความบันเทิงและกำลังใจ ไม่ใช่การทำนายสลากจริง</span>
                </div>
              </div>

              <div className="row center" style={{ marginTop: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                {onOpenCard && (
                  <button
                    type="button"
                    className="btn gold"
                    onClick={handleSaveAndShare}
                    title="บันทึกและแชร์การ์ดเลขมงคล"
                  >
                    <span>🎴 บันทึก&แชร์</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn primary glow-gold"
                  onClick={handleReset}
                >
                  <span>🔥 เผาแผ่นยันต์ขอเลขใหม่</span>
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleResetToCategorySelection}
                  title="เปลี่ยนไปเลือกเลข 2 หลัก หรือ 3 หลักใหม่"
                >
                  <span>🔄 เลือก 2 หรือ 3 หลักใหม่</span>
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
