import React, { useState, useEffect, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { LuckyNumbersResult } from '../types';
import { BurnTalisman } from './BurnTalisman';
import { LuckyMiniGames } from './LuckyMiniGames';
import { playFireCrackle } from '../utils/chantAudio';

interface LuckyNumbersProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
}

export const LuckyNumbers: React.FC<LuckyNumbersProps> = ({ bridge, onToast }) => {
  // Category: 0 = เลขท้าย 2 ตัว, 1 = เลขท้าย 3 ตัว
  const [category, setCategory] = useState<0 | 1>(0);
  const [luckyResult, setLuckyResult] = useState<LuckyNumbersResult | null>(null);
  const [luckyNumber, setLuckyNumber] = useState<string>('89');

  // Burn level: 0 = unburned, 1 = 33%, 2 = 66%, 3 = 100% (fully revealed)
  const [burnLevel, setBurnLevel] = useState<number>(0);
  const [isBurning, setIsBurning] = useState<boolean>(false);

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
      } catch {
        onToast('เกิดข้อผิดพลาดในการคำนวณเลขมงคล');
      }
    },
    [bridge, onToast]
  );

  useEffect(() => {
    generateNumber(category);
  }, [category, generateNumber]);

  // Handle category switch
  const handleCategoryChange = (newCat: 0 | 1) => {
    setCategory(newCat);
    setBurnLevel(0);
    generateNumber(newCat);
    onToast(`เปลี่ยนประเภทเป็น: ${newCat === 0 ? 'เลขท้าย 2 ตัว' : 'เลขท้าย 3 ตัว'}`);
  };

  // When player wins a round in any mini-game
  const handleWin = useCallback(() => {
    setIsBurning(true);
    playFireCrackle();

    // Haptic vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 60, 40]);
      } catch {
        // Ignore
      }
    }

    setBurnLevel((prev) => {
      const next = Math.min(3, prev + 1);
      if (next === 3) {
        onToast('🔥 ยันต์มอดไหม้สมบูรณ์! ปรากฏเลขมงคล 100%!');
      } else {
        onToast(`🔥 เพลิงเผายันต์ลามขึ้น! (${next}/3 ตา) ชนะอีก ${3 - next} ตา!`);
      }
      return next;
    });

    setTimeout(() => {
      setIsBurning(false);
    }, 1100);
  }, [onToast]);

  // When player loses a round
  const handleLose = useCallback(() => {
    onToast('🏮 ตานี้ยังไม่ชนะ เพลิงจึงยังไม่ลาม — เล่นใหม่อีกครั้ง!');
  }, [onToast]);

  // Reset to start a new burning talisman
  const handleReset = () => {
    setBurnLevel(0);
    generateNumber(category);
    onToast('เริ่มต้นแผ่นยันต์ใหม่เรียบร้อย');
  };

  return (
    <section id="tab-number" className="ritual-frameless-stage tab" role="tabpanel">
      <h2 className="title">เพลิงเผายันต์เบิกเลขมงคล</h2>
      <p className="lead">
        เลือกเลขท้าย 2 หรือ 3 ตัว — เล่นมินิเกมให้ชนะ 3 ตา เพื่อจุดไฟเผาแผ่นยันต์จนมอดไหม้เผยตัวเลขมงคล!
      </p>

      {/* Category selector chips (Strictly only 2-digit & 3-digit as requested) */}
      <div className="chips lucky-category-chips" role="radiogroup" aria-label="เลือกประเภทเลข">
        <label className="chip">
          <input
            type="radio"
            name="lucky-cat"
            value="0"
            checked={category === 0}
            onChange={() => handleCategoryChange(0)}
          />
          <span>🏮 เลขท้าย 2 ตัว</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="lucky-cat"
            value="1"
            checked={category === 1}
            onChange={() => handleCategoryChange(1)}
          />
          <span>✨ เลขท้าย 3 ตัว</span>
        </label>
      </div>

      {/* Talisman Burning Stage */}
      <BurnTalisman
        burnLevel={burnLevel}
        luckyNumber={luckyNumber}
        category={category}
        isBurning={isBurning}
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

          <div className="row center" style={{ marginTop: '1.1rem' }}>
            <button
              type="button"
              className="btn primary glow-gold"
              onClick={handleReset}
            >
              <span>🔥 เผาแผ่นยันต์ขอเลขใหม่</span>
            </button>
          </div>
        </article>
      ) : (
        /* While burning (0..2): Show the 5 Mini-Games Section */
        <LuckyMiniGames
          onWin={handleWin}
          onLose={handleLose}
          onToast={onToast}
          burnLevel={burnLevel}
        />
      )}
    </section>
  );
};
