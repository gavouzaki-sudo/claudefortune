import React, { useState, useEffect } from 'react';
import { Bridge } from '../bridge';
import type { LuckyNumbersResult } from '../types';

interface LuckyNumbersProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
}

interface NumberReelProps {
  digit: string;
  delay: number;
}

const NumberReel: React.FC<NumberReelProps> = ({ digit, delay }) => {
  const [val, setVal] = useState('0');
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVal(digit);
      setSettled(true);
      return;
    }

    const iv = setInterval(() => {
      setVal(String(Math.floor(Math.random() * 10)));
    }, 60);

    const timeout = setTimeout(() => {
      clearInterval(iv);
      setVal(digit);
      setSettled(true);
    }, 700 + delay);

    return () => {
      clearInterval(iv);
      clearTimeout(timeout);
    };
  }, [digit, delay]);

  return <span className={`reel ${settled ? 'settled' : ''}`}>{val}</span>;
};

export const LuckyNumbers: React.FC<LuckyNumbersProps> = ({ bridge, onToast }) => {
  const [category, setCategory] = useState<number>(0);
  const [result, setResult] = useState<LuckyNumbersResult | null>(null);

  const handleGenerate = () => {
    try {
      const res = bridge.luckyNumbers(category);
      setResult(res);
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    }
  };

  const groups: Array<{ label: string; items: string[] }> = [];
  if (result?.two) groups.push({ label: 'เลขท้าย 2 ตัว', items: result.two });
  if (result?.three) groups.push({ label: 'เลขท้าย 3 ตัว', items: result.three });
  if (result?.run) groups.push({ label: 'เลขวิ่ง', items: [result.run.join('')] });

  let cumulativeDelay = 0;

  return (
    <section id="tab-number" className="ritual-frameless-stage tab" role="tabpanel">
      <h2 className="title">เลขมงคลประจำตัว</h2>
      <p className="lead">
        คำนวณจากชื่อ ปีเกิด นักษัตร และวันนี้ — <strong>เพื่อความบันเทิงเท่านั้น ไม่ใช่การทำนายผลสลากจริง</strong>
      </p>

      <div className="chips" role="radiogroup" aria-label="ประเภทเลข">
        <label className="chip">
          <input
            type="radio"
            name="numcat"
            value="0"
            checked={category === 0}
            onChange={() => setCategory(0)}
          />
          <span>เลขท้าย 2 ตัว</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="numcat"
            value="1"
            checked={category === 1}
            onChange={() => setCategory(1)}
          />
          <span>เลขท้าย 3 ตัว</span>
        </label>
        <label className="chip">
          <input
            type="radio"
            name="numcat"
            value="2"
            checked={category === 2}
            onChange={() => setCategory(2)}
          />
          <span>ครบชุด + เลขวิ่ง</span>
        </label>
      </div>

      <div className="row center">
        <button id="btn-number" className="btn primary" type="button" onClick={handleGenerate}>
          เปิดเลขมงคล
        </button>
      </div>

      {result && (
        <>
          <div id="number-out" className="number-out" aria-live="polite">
            {groups.map((grp) =>
              grp.items.map((numStr, itemIdx) => {
                const itemDelay = cumulativeDelay;
                cumulativeDelay += 150 + numStr.length * 260;
                return (
                  <div key={`${grp.label}-${itemIdx}`} className="nset">
                    <div className="lbl">
                      {grp.items.length > 1 ? `${grp.label} · ชุดที่ ${itemIdx + 1}` : grp.label}
                    </div>
                    <div className="reels">
                      {Array.from(numStr).map((d, dIdx) => (
                        <NumberReel
                          key={dIdx}
                          digit={d}
                          delay={itemDelay + dIdx * 260}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <p id="number-note" className="note">
            {result.note}
          </p>
        </>
      )}
    </section>
  );
};
