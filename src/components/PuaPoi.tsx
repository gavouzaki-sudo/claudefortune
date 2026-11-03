import React, { useState, useRef, useCallback } from 'react';
import { playWoodClatter } from '../utils/chantAudio';

export type PuaPoiResultType = 'sheng' | 'yin' | 'xiao';

export interface PuaPoiResult {
  type: PuaPoiResultType;
  title: string;
  subtitle: string;
  meaning: string;
  block1Flat: boolean; // true = หงาย, false = คว่ำ
  block2Flat: boolean;
}

interface PuaPoiProps {
  stickNumber: number;
  stickTitle?: string;
  onConfirmFortune: () => void;
  onReshakeStick: () => void;
  onToast: (msg: string) => void;
}

export const PuaPoi: React.FC<PuaPoiProps> = ({
  stickNumber,
  stickTitle,
  onConfirmFortune,
  onReshakeStick,
  onToast,
}) => {
  const [tossing, setTossing] = useState<boolean>(false);
  const [result, setResult] = useState<PuaPoiResult | null>(null);
  const [tossCount, setTossCount] = useState<number>(0);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const animationTimerRef = useRef<number | null>(null);

  // SVG representation of a single wooden crescent moon block (ไม้ปัวปวย)
  const renderWoodenBlock = (isFlat: boolean, isLeft: boolean) => {
    return (
      <div
        className={`pua-block ${isLeft ? 'block-left' : 'block-right'} ${
          isFlat ? 'face-flat' : 'face-convex'
        } ${tossing ? 'is-tossing' : ''}`}
        aria-label={isFlat ? 'ไม้ปัวปวยด้านหงาย (หน้าเรียบ)' : 'ไม้ปัวปวยด้านคว่ำ (หลังนูน)'}
      >
        <svg
          viewBox="0 0 120 180"
          className="pua-block-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Convex rounded lacquer gradient */}
            <radialGradient
              id={`convexGrad-${isLeft ? 'l' : 'r'}`}
              cx="45%"
              cy="40%"
              r="60%"
              fx="40%"
              fy="35%"
            >
              <stop offset="0%" stopColor="#d33828" />
              <stop offset="45%" stopColor="#a31d14" />
              <stop offset="85%" stopColor="#690e08" />
              <stop offset="100%" stopColor="#3d0603" />
            </radialGradient>

            {/* Flat polished wooden surface gradient */}
            <linearGradient
              id={`flatGrad-${isLeft ? 'l' : 'r'}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#e8b94a" />
              <stop offset="35%" stopColor="#c58a28" />
              <stop offset="70%" stopColor="#8d5b12" />
              <stop offset="100%" stopColor="#5c3606" />
            </linearGradient>

            {/* Subtle inner shadow filter */}
            <filter
              id="blockShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="8"
                floodColor="#000000"
                floodOpacity="0.6"
              />
            </filter>
          </defs>

          {isFlat ? (
            /* FLAT SIDE (หน้าหงาย - ด้านเรียบ มีขอบทองและตรามงคล) */
            <g filter="url(#blockShadow)">
              {/* Outer crescent outline */}
              <path
                d="M 25 15 C 80 35, 105 85, 95 165 C 65 140, 35 105, 25 15 Z"
                fill={`url(#flatGrad-${isLeft ? 'l' : 'r'})`}
                stroke="#ffd700"
                strokeWidth="2.5"
              />
              {/* Inner carved groove */}
              <path
                d="M 32 28 C 72 45, 90 85, 84 150 C 60 130, 40 102, 32 28 Z"
                fill="none"
                stroke="#fff2b2"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity="0.85"
              />
              {/* Woodgrain subtle striations */}
              <path
                d="M 40 50 C 60 70, 75 100, 72 135"
                fill="none"
                stroke="#5c3606"
                strokeWidth="0.8"
                opacity="0.5"
              />
              <path
                d="M 48 40 C 68 65, 78 90, 78 120"
                fill="none"
                stroke="#5c3606"
                strokeWidth="0.8"
                opacity="0.4"
              />
              {/* Auspicious golden character 吉 (Luck) or 福 */}
              <text
                x="56"
                y="96"
                fill="#fff9e6"
                fontSize="24"
                fontWeight="bold"
                fontFamily="serif"
                textAnchor="middle"
                filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
              >
                吉
              </text>
              <circle
                cx="56"
                cy="92"
                r="18"
                fill="none"
                stroke="#ffd700"
                strokeWidth="1"
                opacity="0.7"
              />
            </g>
          ) : (
            /* CONVEX SIDE (หน้าคว่ำ - หลังโค้งนูน สีแดงชาด เคลือบเงาสูง) */
            <g filter="url(#blockShadow)">
              {/* Main 3D rounded crescent */}
              <path
                d="M 25 15 C 80 35, 105 85, 95 165 C 65 140, 35 105, 25 15 Z"
                fill={`url(#convexGrad-${isLeft ? 'l' : 'r'})`}
                stroke="#ff7a70"
                strokeWidth="1.2"
              />
              {/* Specular 3D light reflection along curved spine */}
              <path
                d="M 38 28 C 76 52, 92 85, 84 145"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="blur(1.5px)"
              />
              <path
                d="M 42 34 C 74 56, 88 85, 82 138"
                fill="none"
                stroke="rgba(255, 220, 200, 0.65)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Bottom shadow curve */}
              <path
                d="M 28 30 C 36 90, 60 128, 86 158"
                fill="none"
                stroke="#200301"
                strokeWidth="2.5"
                opacity="0.6"
              />
            </g>
          )}
        </svg>
        <span className="pua-block-tag">
          {isFlat ? 'หงาย (หยาง)' : 'คว่ำ (หยิน)'}
        </span>
      </div>
    );
  };

  // Toss Pua Poi simulation
  const handleToss = useCallback(() => {
    if (tossing) return;
    setTossing(true);

    // Vibration on supported mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 40, 20]);
      } catch {
        // Ignore
      }
    }

    // Play procedural wood clattering sound
    playWoodClatter();

    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

    animationTimerRef.current = window.setTimeout(() => {
      // Determine authentic outcome:
      // In traditional temple odds:
      // Shengbei (เซ้งปวย): 1 flat, 1 convex (~55% odds - most common and auspicious)
      // Yinbei (อิ่มปวย): 2 convex (~22.5%)
      // Xiaobei (เชี่ยวปวย): 2 flat (~22.5%)
      const rand = Math.random();
      let outcome: PuaPoiResult;

      if (rand < 0.55) {
        // Shengbei (เซ้งปวย)
        const firstIsFlat = Math.random() < 0.5;
        outcome = {
          type: 'sheng',
          title: 'เซ้งปวย (1 คว่ำ 1 หงาย)',
          subtitle: 'เทพเจ้าเห็นชอบ — ชะตานี้เป็นของท่าน!',
          meaning:
            'สิ่งศักดิ์สิทธิ์และเทพเจ้าประจำศาลทรงอนุญาตและรับรองว่า ไม้เซียมซีใบนี้เป็นคำทำนายที่แท้จริงของท่านในวันนี้ น้อมรับคำทำนายเพื่อความเป็นสิริมงคล',
          block1Flat: firstIsFlat,
          block2Flat: !firstIsFlat,
        };
      } else if (rand < 0.775) {
        // Yinbei (อิ่มปวย)
        outcome = {
          type: 'yin',
          title: 'อิ่มปวย (คว่ำทั้งคู่)',
          subtitle: 'เทพเจ้าไม่เห็นชอบ — ใบนี้ยังไม่ใช่ของท่าน',
          meaning:
            'สิ่งศักดิ์สิทธิ์ทรงชี้แนะว่าจิตใจของท่านอาจยังมีความกังวลหรือวอกแวกในขณะเขย่า แนะนำให้ตั้งจิตระลึกถึงพระพุทธคุณแล้วเขย่ากระบอกเซียมซีใหม่อีกครั้ง',
          block1Flat: false,
          block2Flat: false,
        };
      } else {
        // Xiaobei (เชี่ยวปวย)
        outcome = {
          type: 'xiao',
          title: 'เชี่ยวปวย (หงายทั้งคู่)',
          subtitle: 'เทพเจ้าทรงพระสรวล — ยังไม่แน่ชัด',
          meaning:
            'สิ่งศักดิ์สิทธิ์ทรงยิ้มรับด้วยความเมตตา แต่คำอธิษฐานอาจยังไม่ชัดเจน หรือผลยังแปรเปลี่ยนได้ตามความเพียร จงสูดหายใจลึกๆ ตั้งจิตให้มั่นแล้วโยนไม้ใหม่อีกครั้ง',
          block1Flat: true,
          block2Flat: true,
        };
      }

      setResult(outcome);
      setTossCount((c) => c + 1);
      setTossing(false);

      if (outcome.type === 'sheng') {
        onToast('✨ เซ้งปวย! เทพเจ้าทรงเห็นชอบ อนุญาตให้อ่านคำทำนาย');
      } else if (outcome.type === 'yin') {
        onToast('🏮 อิ่มปวย — เทพเจ้ายังไม่อนุญาต แนะนำให้เขย่าเซียมซีใหม่');
      } else {
        onToast('😊 เชี่ยวปวย — เทพเจ้าทรงสรวล ตั้งจิตแล้วโยนใหม่อีกครั้ง');
      }
    }, 650);
  }, [tossing, onToast]);

  return (
    <div className="pua-poi-container">
      {/* Compact Header for Mobile & Desktop */}
      <div className="pua-poi-header">
        <div className="pua-poi-badge-row">
          <span className="pua-badge-tradition">พิธีกรรมศาลเจ้าโบราณ</span>
          <span className="pua-stick-tag">
            ไม้เซียมซี: <b>ใบที่ {stickNumber}</b> {stickTitle ? `· ${stickTitle}` : ''}
          </span>
          <button
            type="button"
            className="pua-info-btn"
            onClick={() => setShowInfo((s) => !s)}
            title="ปัวปวยคืออะไร?"
            aria-label="คำอธิบายไม้ปัวปวย"
          >
            ❓ ความหมายปัวปวย
          </button>
        </div>

        <h3 className="pua-title">เสี่ยงทายไม้ปัวปวย (筊杯)</h3>
        <p className="pua-instruction">
          ตั้งจิตอธิษฐานถามเทพเจ้าว่า <i>&ldquo;เซียมซีใบที่ {stickNumber} นี้ ใช่คำทำนายของข้าพเจ้าหรือไม่?&rdquo;</i> แล้วโยนไม้คว่ำหงายเพื่อขอยืนยัน
        </p>

        {showInfo && (
          <div className="pua-info-card">
            <h4>📖 กฎการเสี่ยงทายไม้ปัวปวยตามประเพณี:</h4>
            <ul>
              <li>
                <b>เซ้งปวย (1 คว่ำ 1 หงาย):</b> เทพเจ้าเห็นชอบ &rarr; ได้รับคำทำนายจริงแท้
              </li>
              <li>
                <b>อิ่มปวย (คว่ำทั้งคู่):</b> เทพเจ้าไม่เห็นชอบ &rarr; ให้เขย่ากระบอกเซียมซีใหม่
              </li>
              <li>
                <b>เชี่ยวปวย (หงายทั้งคู่):</b> เทพเจ้าทรงสรวล (ยิ้ม) &rarr; จิตยังไม่นิ่ง ให้โยนใหม่อีกครั้ง
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Blocks Visual Stage (Compact on mobile, responsive) */}
      <div className="pua-blocks-stage" role="region" aria-label="แท่นวางไม้ปัวปวย">
        <div className="pua-mat">
          {/* Block 1 (Left) */}
          {renderWoodenBlock(
            result ? result.block1Flat : false, // Default convex when idle
            true
          )}

          {/* Center altar incense / seal indicator */}
          <div className="pua-mat-center">
            <span className="pua-mat-seal" aria-hidden="true">
              {tossing ? '⚡' : result?.type === 'sheng' ? '✓' : '神'}
            </span>
            {tossCount > 0 && (
              <span className="pua-toss-count">โยนครั้งที่ {tossCount}</span>
            )}
          </div>

          {/* Block 2 (Right) */}
          {renderWoodenBlock(
            result ? result.block2Flat : true, // Default flat when idle
            false
          )}
        </div>
      </div>

      {/* Outcome Banner */}
      {result && !tossing && (
        <div className={`pua-result-banner banner-${result.type}`} aria-live="polite">
          <div className="pua-result-header">
            <span className="pua-result-icon">
              {result.type === 'sheng' ? '🎉' : result.type === 'yin' ? '🏮' : '✨'}
            </span>
            <div>
              <div className="pua-result-title">{result.title}</div>
              <div className="pua-result-sub">{result.subtitle}</div>
            </div>
          </div>
          <p className="pua-result-meaning">{result.meaning}</p>
        </div>
      )}

      {/* Action Buttons Row - Optimized for Mobile Thumb Reach */}
      <div className="pua-actions-row">
        {/* If Shengbei (Approved) -> Prominent button to read fortune */}
        {result?.type === 'sheng' ? (
          <button
            type="button"
            className="btn primary btn-pua-primary glow-gold"
            onClick={onConfirmFortune}
          >
            <span>📜 อ่านคำทำนายใบที่ {stickNumber} (สมบูรณ์)</span>
          </button>
        ) : (
          /* Normal Toss Button */
          <button
            type="button"
            className="btn primary btn-pua-primary"
            onClick={handleToss}
            disabled={tossing}
          >
            <span>{tossing ? 'กำลังโยนหมุนเวียน...' : tossCount === 0 ? '🎲 โยนไม้ปัวปวยเสี่ยงทาย' : '🎲 โยนไม้ปัวปวยอีกครั้ง'}</span>
          </button>
        )}

        {/* If Yinbei (Disapproved) -> Allow reshaking stick */}
        {result?.type === 'yin' && (
          <button
            type="button"
            className="btn ghost btn-pua-reshake"
            onClick={onReshakeStick}
            disabled={tossing}
          >
            <span>🔄 เขย่ากระบอกเซียมซีใหม่</span>
          </button>
        )}

        {/* Fast-Track Skip Option for users in a rush */}
        <button
          type="button"
          className="btn-pua-skip-link"
          onClick={onConfirmFortune}
          title="ข้ามขั้นตอนปัวปวยและอ่านคำทำนายทันที"
        >
          {result?.type === 'sheng'
            ? ''
            : 'หรือ ข้ามไปอ่านคำทำนายทันที (ไม่เสี่ยงปัวปวย) ❯'}
        </button>
      </div>
    </div>
  );
};
