import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bridge } from '../bridge';
import type { LuckyNumbersResult } from '../types';
import { BurnTalisman } from './BurnTalisman';
import { LuckyMiniGames } from './LuckyMiniGames';
import { playFireCrackle } from '../utils/chantAudio';
import { saveJournalEntry } from '../utils/fortuneJournal';
import type { CardData } from '../utils/luckyCardCanvas';
import { logger } from '../utils/logger';

interface LuckyNumbersProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

export const LuckyNumbers: React.FC<LuckyNumbersProps> = ({ bridge, onToast, onOpenCard }) => {
  // Category: 0 = เลขท้าย 2 ตัว, 1 = เลขท้าย 3 ตัว, null = ค่าเริ่มต้น ยังไม่เลือก
  const [category, setCategory] = useState<0 | 1 | null>(null);
  const categoryRef = useRef<0 | 1 | null>(category);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  const [luckyResult, setLuckyResult] = useState<LuckyNumbersResult | null>(null);
  const [luckyNumber, setLuckyNumber] = useState<string>('89');

  // Burn level: 0 = unburned, 1 = 33%, 2 = 66%, 3 = 100% (fully revealed)
  const [burnLevel, setBurnLevel] = useState<number>(0);
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [isJournalSaved, setIsJournalSaved] = useState<boolean>(false);

  // Initialize or fetch numbers when category changes or on mount
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

  // Handle category switch
  const handleCategoryChange = (newCat: 0 | 1) => {
    categoryRef.current = newCat;
    setCategory(newCat);
    setBurnLevel(0);
    setIsJournalSaved(false);
    generateNumber(newCat);
    setTimeout(() => {
      onToast(`เริ่มขอเลขมงคล: ${newCat === 0 ? 'เลข 2 ตัว' : 'เลข 3 ตัว'}`);
    }, 0);
  };

  // When player wins a round in any mini-game
  const handleWin = useCallback(() => {
    if (categoryRef.current === null) {
      setTimeout(() => {
        onToast('⚠️ กรุณาเลือกประเภทเลข 2 ตัว หรือ 3 ตัว ด้านบนก่อน');
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
    if (burnLevel < 3) return;
    const detailsObj = {
      luckyNumbers: {
        twoDigits: category === 0 ? [luckyNumber] : ['89'],
        threeDigits: category === 1 ? [luckyNumber] : ['728'],
      },
    };

    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'number',
        title: `เลขมงคล (${category === 0 ? 'เลขท้าย 2 ตัว' : 'เลขท้าย 3 ตัว'})`,
        summary: `เลขเด่น: ${luckyNumber} — เผายันต์สำเร็จ`,
        details: detailsObj,
      });
      setIsJournalSaved(true);
      onToast('📖 บันทึกลงในสมุดดวงชะตาเรียบร้อยแล้ว');
    }
    if (onOpenCard) {
      onOpenCard({
        type: 'number',
        title: `เลขมงคลประจำตัว (${category === 0 ? 'เลข 2 ตัว' : 'เลข 3 ตัว'})`,
        details: detailsObj,
      });
    }
  };

  // When player loses a round
  const handleLose = useCallback(() => {
    setTimeout(() => {
      onToast('🏮 ตานี้ยังไม่ชนะ เพลิงจึงยังไม่ลาม — เล่นใหม่อีกครั้ง!');
    }, 0);
  }, [onToast]);

  // Reset to start a new burning talisman (returns to unselected state)
  const handleReset = () => {
    setBurnLevel(0);
    setIsJournalSaved(false);
    setCategory(null);
    setTimeout(() => {
      onToast('รีเซ็ตพร้อมเลือกประเภทเลขมงคลใหม่');
    }, 0);
  };

  return (
    <section
      id="tab-number"
      className={`ritual-frameless-stage tab lucky-numbers-section-stage ${
        category !== null ? 'has-category-selected' : 'awaiting-category'
      }`}
      role="tabpanel"
    >
      {/* Category Selector Bar: Only visible when NOT yet selected (ค่าเริ่มต้น ยังไม่เลือก) */}
      {/* Button 2 digits on far LEFT, Button 3 digits on far RIGHT */}
      {category === null ? (
        <div className="lucky-choose-category-bar" role="group" aria-label="เลือกประเภทเลขมงคล">
          <button
            type="button"
            className="btn gold btn-choose-cat btn-cat-left"
            onClick={() => handleCategoryChange(0)}
            title="เลือกเลขท้าย 2 ตัว"
          >
            <span>🏮 เลข 2 ตัว</span>
          </button>

          <span className="choose-cat-center-hint">
            แตะเลือกประเภทเลขมงคล
          </span>

          <button
            type="button"
            className="btn gold btn-choose-cat btn-cat-right"
            onClick={() => handleCategoryChange(1)}
            title="เลือกเลขท้าย 3 ตัว"
          >
            <span>✨ เลข 3 ตัว</span>
          </button>
        </div>
      ) : null}

      {/* Talisman Burning Stage (When chosen, automatically moves up to touch top edge) */}
      <BurnTalisman
        burnLevel={burnLevel}
        luckyNumber={luckyNumber}
        category={category}
        isBurning={isBurning}
        onResetCategory={() => setCategory(null)}
      />

      {/* When fully burned (3/3): Show Complete Prophecy Card */}
      {burnLevel === 3 ? (
        <article className="result lucky-final-card" aria-live="polite">
          <div className="lucky-final-header">
            <span className="lucky-final-seal">✦ มงคลฤกษ์ ✦</span>
            <h3>
              เลขมงคลประจำตัวของคุณ:{' '}
              <span className="highlight-lucky-number">{luckyNumber}</span>
            </h3>
            <p className="lucky-final-sub">
              ประเภท: <b>{category === 0 ? 'เลขท้าย 2 ตัว' : 'เลขท้าย 3 ตัว'}</b> · เผาด้วยจิตศรัทธาครบ 3 ตา
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
          </div>
        </article>
      ) : category === null ? (
        /* When NOT yet chosen (category === null): Lock mini-games and guide user to select 2 or 3 digits first */
        <div className="lucky-choose-prompt-card" role="region" aria-label="คำแนะนำเลือกเลขมงคล">
          <div className="prompt-glow-ring">🏮</div>
          <h4 className="prompt-title">กรุณาเลือกประเภทเลขมงคลด้านบน</h4>
          <p className="prompt-text">
            แตะปุ่ม <b>"🏮 เลข 2 ตัว"</b> (ซ้าย) หรือ <b>"✨ เลข 3 ตัว"</b> (ขวา) ด้านบน<br />
            เพื่อปลดล็อกมินิเกมจุดไฟเผายันต์ขอเลขมงคล
          </p>
        </div>
      ) : (
        /* While burning (0..2) and category is chosen: Show the 5 Mini-Games Section */
        <LuckyMiniGames
          onWin={handleWin}
          onLose={handleLose}
          burnLevel={burnLevel}
        />
      )}
    </section>
  );
};
