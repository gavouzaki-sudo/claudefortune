import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { CandleResult, OfferingResult, RemedyResult } from '../types';

const CHONG_ZODIAC_OPTIONS = [
  { value: 0, label: "ชวด (หนู)" },
  { value: 1, label: "ฉลู (วัว)" },
  { value: 2, label: "ขาล (เสือ)" },
  { value: 3, label: "เถาะ (กระต่าย)" },
  { value: 4, label: "มะโรง (งูใหญ่ / มังกร)" },
  { value: 5, label: "มะเส็ง (งูเล็ก)" },
  { value: 6, label: "มะเมีย (ม้า)" },
  { value: 7, label: "มะแม (แพะ)" },
  { value: 8, label: "วอก (ลิง)" },
  { value: 9, label: "ระกา (ไก่)" },
  { value: 10, label: "จอ (สุนัข)" },
  { value: 11, label: "กุน (หมู / ช้างมงคล)" },
];

const WISH_PRESETS = [
  { icon: '🕊️', title: 'หมดเคราะห์', text: 'ขอให้หมดเคราะห์หมดโศก โรคภัยมลายสิ้น มีแต่ความสุขสงบ' },
  { icon: '💰', title: 'โชคลาภเงินทอง', text: 'ขอให้เงินทองไหลมาเทมา มีโชคลาภ ค้าขายร่ำรวยมั่งคั่ง' },
  { icon: '💼', title: 'การงานราบรื่น', text: 'ขอให้การงานราบรื่น ก้าวหน้ามั่นคง ได้รับการสนับสนุนที่ดี' },
  { icon: '💖', title: 'ความรักสมหวัง', text: 'ขอให้พบเจอคู่แท้ ครอบครัวอบอุ่น มีกัลยาณมิตรที่จริงใจ' },
  { icon: '🌿', title: 'สุขภาพแข็งแรง', text: 'ขอให้สุขภาพร่างกายแข็งแรง จิตใจแจ่มใส ปราศจากโรคภัย' },
];

const AMBIENT_LANTERNS = [
  { id: 1, left: '15%', bottom: '40px', size: 14, delay: '0s', drift: '25px' },
  { id: 2, left: '28%', bottom: '20px', size: 10, delay: '3s', drift: '-20px' },
  { id: 3, left: '72%', bottom: '50px', size: 12, delay: '1.5s', drift: '30px' },
  { id: 4, left: '85%', bottom: '30px', size: 16, delay: '4.5s', drift: '-25px' },
  { id: 5, left: '48%', bottom: '70px', size: 9, delay: '6s', drift: '15px' },
];

interface RitualsProps {
  bridge: Bridge;
  userZodiac: number;
  onToast: (msg: string) => void;
}

export const Rituals: React.FC<RitualsProps> = ({ bridge, userZodiac, onToast }) => {
  const [activeRit, setActiveRit] = useState<'candle' | 'lantern' | 'chong'>(() => {
    try {
      const saved = sessionStorage.getItem('shrine.activeRit');
      if (saved === 'candle' || saved === 'lantern' || saved === 'chong') return saved;
    } catch {
      // Ignore
    }
    return 'candle';
  });

  const handleSelectRit = (rit: 'candle' | 'lantern' | 'chong') => {
    setActiveRit(rit);
    try {
      sessionStorage.setItem('shrine.activeRit', rit);
    } catch {
      // Ignore
    }
  };

  // Candle state
  const [candleLevel, setCandleLevel] = useState(0);
  const [candleHint, setCandleHint] = useState('ยังไม่ได้จุดเทียน');
  const [candleResult, setCandleResult] = useState<CandleResult | null>(null);
  const candleDownRef = useRef(false);
  const candleStartRef = useRef(0);
  const candleRafRef = useRef<number | null>(null);
  const candleDoneRef = useRef(false);

  // Lantern state
  const [lanternText, setLanternText] = useState('');
  const [lanternResult, setLanternResult] = useState<OfferingResult | null>(null);
  const [lanternFlying, setLanternFlying] = useState(false);
  const [lanternStyle, setLanternStyle] = useState<{ left: string; dx: string } | null>(null);
  const lanternTimerRef = useRef<number | null>(null);

  // Chong state
  const [chongZodiac, setChongZodiac] = useState(userZodiac >= 0 ? userZodiac : 0);
  const [chongProblem, setChongProblem] = useState(0);
  const [chongSpinning, setChongSpinning] = useState(false);
  const [chongGlyph, setChongGlyph] = useState('นะ');
  const [chongResult, setChongResult] = useState<RemedyResult | null>(null);

  useEffect(() => {
    if (userZodiac >= 0) {
      setChongZodiac(userZodiac);
    }
  }, [userZodiac]);

  useEffect(() => {
    return () => {
      if (lanternTimerRef.current) {
        clearTimeout(lanternTimerRef.current);
        lanternTimerRef.current = null;
      }
      if (candleRafRef.current) {
        cancelAnimationFrame(candleRafRef.current);
      }
    };
  }, []);

  // Candle Logic
  const loopCandle = useCallback(() => {
    if (!candleDownRef.current) return;
    const held = performance.now() - candleStartRef.current;
    const level = Math.min(100, held / 50);
    setCandleLevel(level);

    if (held < 4000) {
      setCandleHint(`ค้างไว้อีก ${((4000 - held) / 1000).toFixed(1)} วินาที…`);
      candleRafRef.current = requestAnimationFrame(loopCandle);
    } else if (!candleDoneRef.current) {
      candleDoneRef.current = true;
      try {
        const res = bridge.candle(held);
        setCandleResult(res);
        setCandleHint('เทียนสว่างแล้ว ✨');
      } catch {
        onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
      }
    }
  }, [bridge, onToast]);

  const pressCandle = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (candleDownRef.current) return;
    candleDownRef.current = true;
    candleDoneRef.current = false;
    candleStartRef.current = performance.now();
    setCandleResult(null);
    if (candleRafRef.current) cancelAnimationFrame(candleRafRef.current);
    loopCandle();
  };

  const releaseCandle = () => {
    if (!candleDownRef.current) return;
    candleDownRef.current = false;
    if (candleRafRef.current) cancelAnimationFrame(candleRafRef.current);
    if (!candleDoneRef.current) {
      setCandleLevel(0);
      setCandleHint('เทียนดับก่อนเวลา ลองกดค้างให้นานขึ้นอีกนิด');
    }
  };

  // Lantern Logic
  const handleLaunchLantern = async () => {
    const trimmed = lanternText.trim();
    if (!trimmed) {
      onToast('กรุณาพิมพ์หรือเลือกคำอธิษฐานก่อนปล่อยโคมนะ');
      return;
    }

    setLanternStyle({
      left: `${30 + Math.random() * 40}%`,
      dx: `${Math.round(Math.random() * 90 - 45)}px`,
    });
    setLanternFlying(true);

    try {
      const res = bridge.offering(1, trimmed);
      setLanternResult(res);
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    }

    if (lanternTimerRef.current) clearTimeout(lanternTimerRef.current);
    lanternTimerRef.current = window.setTimeout(() => {
      setLanternFlying(false);
      lanternTimerRef.current = null;
    }, 6200);
  };

  const handleSelectPreset = (text: string) => {
    setLanternText(text);
  };

  // Chong Logic
  const handlePerformChong = async () => {
    setChongSpinning(true);
    setChongResult(null);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 2300));

    try {
      const res = bridge.remedy(chongZodiac, chongProblem);
      const glyphs = res.yantra.split(' ');
      setChongGlyph(glyphs[Math.floor(Math.random() * glyphs.length)] || 'นะ');
      setChongResult(res);
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setChongSpinning(false);
    }
  };

  const flameScale = (0.3 + (candleLevel / 100) * 0.95).toFixed(3);
  const flameOpacity = candleLevel > 0 ? (0.35 + (candleLevel / 100) * 0.65).toFixed(3) : '0';
  const glowOpacity = (candleLevel / 100).toFixed(3);

  return (
    <section id="tab-ritual" className="ritual-frameless-stage tab" role="tabpanel">
      <h2 className="title">สะเดาะเคราะห์ออนไลน์</h2>

      {/* High-visibility Ceremonial Ritual Tabs */}
      <div className="pills" role="tablist" aria-label="พิธีกรรมสะเดาะเคราะห์">
        <button
          className={`pill ${activeRit === 'candle' ? 'active' : ''}`}
          type="button"
          onClick={() => handleSelectRit('candle')}
          aria-selected={activeRit === 'candle'}
        >
          <span aria-hidden="true">🕯️</span>
          <span>จุดเทียนต่อดวง</span>
        </button>
        <button
          className={`pill ${activeRit === 'lantern' ? 'active' : ''}`}
          type="button"
          onClick={() => handleSelectRit('lantern')}
          aria-selected={activeRit === 'lantern'}
        >
          <span aria-hidden="true">🏮</span>
          <span>ลอยโคมสะเดาะเคราะห์</span>
        </button>
        <button
          className={`pill ${activeRit === 'chong' ? 'active' : ''}`}
          type="button"
          onClick={() => handleSelectRit('chong')}
          aria-selected={activeRit === 'chong'}
        >
          <span aria-hidden="true">☯️</span>
          <span>แก้ปีชง</span>
        </button>
      </div>

      {/* Candle Ritual */}
      {activeRit === 'candle' && (
        <div id="rit-candle" className="rit">
          <p className="lead">
            แตะค้างหรือกดเมาส์ค้างที่เทียนหรือปุ่มด้านล่าง ยิ่งนานเทียนยิ่งสว่าง ค้างไว้ 4 วินาทีเพื่อปลดล็อกบทสวดและเลขมงคล
          </p>

          <div
            id="candle-wrap"
            className="candle-wrap"
            tabIndex={0}
            role="button"
            aria-label="กดค้างเพื่อจุดเทียน"
            onPointerDown={pressCandle}
            onPointerUp={releaseCandle}
            onPointerCancel={releaseCandle}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) pressCandle(e);
            }}
            onKeyUp={(e) => {
              if (e.key === ' ' || e.key === 'Enter') releaseCandle();
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg viewBox="0 0 200 300" className="candle-svg" aria-hidden="true">
              <defs>
                <radialGradient id="glowg" cx="50%" cy="50%" r="50%">
                  <stop offset="0" stopColor="var(--glow)" stopOpacity=".9" />
                  <stop offset="1" stopColor="var(--glow)" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="waxg" x1="0" x2="1">
                  <stop offset="0" stopColor="#d9b98a" />
                  <stop offset=".5" stopColor="#fff1d3" />
                  <stop offset="1" stopColor="#c79c64" />
                </linearGradient>
              </defs>
              <circle id="candle-glow" cx="100" cy="95" r="95" fill="url(#glowg)" opacity={glowOpacity} />
              <rect x="70" y="140" width="60" height="140" rx="6" fill="url(#waxg)" />
              <rect x="62" y="272" width="76" height="14" rx="4" fill="#7a1f16" />
              <rect x="98" y="128" width="4" height="16" fill="#2a1a10" />
              <g
                id="flame"
                className="flame"
                style={{
                  transformOrigin: '100px 128px',
                  opacity: flameOpacity,
                  transform: `scale(${flameScale})`,
                }}
              >
                <path d="M100 70 C118 92 120 112 100 128 C80 112 82 92 100 70Z" fill="#ffb347" />
                <path d="M100 90 C110 104 110 114 100 126 C90 114 90 104 100 90Z" fill="#fff2b8" />
              </g>
            </svg>
            <div className="ring">
              <div id="candle-ring" style={{ width: `${candleLevel}%` }} />
            </div>
          </div>

          <p id="candle-hint" className="center hint">
            {candleHint}
          </p>

          {/* Prominent High-Contrast Action Button */}
          <div className="candle-action-row">
            <button
              id="btn-candle-hold"
              className="btn primary btn-candle-press"
              type="button"
              onPointerDown={pressCandle}
              onPointerUp={releaseCandle}
              onPointerCancel={releaseCandle}
              aria-label="กดค้างเพื่อจุดเทียนต่อดวง"
            >
              <span>🕯️ กดค้างที่นี่ (หรือที่ตัวเทียน) เพื่อต่อดวงชะตา</span>
              {candleLevel > 0 && <span className="candle-btn-pct">({candleLevel.toFixed(0)}%)</span>}
            </button>
          </div>

          {candleResult && (
            <article id="candle-result" className="result" aria-live="polite">
              <h3>เทียนต่อดวงชะตาสว่างแล้ว</h3>
              <p className="verse">{candleResult.dedication}</p>
              {candleResult.mantra.map((m, i) => (
                <div key={i} className="mantra">
                  {m}
                </div>
              ))}
              <p className="center">
                เลขมงคลจากแสงเทียน:{' '}
                <span className="badge lv0">{candleResult.lucky2}</span>{' '}
                <span className="badge lv1">{candleResult.lucky3}</span>
              </p>
              <p className="note">เพื่อความบันเทิง ไม่ใช่การทำนายผลสลากจริง</p>
            </article>
          )}
        </div>
      )}

      {/* Lantern Ritual */}
      {activeRit === 'lantern' && (
        <div id="rit-lantern" className="rit">
          <p className="lead">
            เขียนความทุกข์ใจ ความกังวล หรือคำอธิษฐานลงบนโคม แล้วปล่อยให้ลอยขึ้นสู่ฟากฟ้า เพื่อปัดเป่าเคราะห์ภัยให้สลายไป
          </p>

          {/* Interactive Sky with Ambient and Main Ceremonial Lantern */}
          <div id="sky" className="sky">
            <div className="sky-moon" aria-hidden="true" />

            {/* Ambient distant floating lanterns */}
            {AMBIENT_LANTERNS.map((l) => (
              <div
                key={l.id}
                className="ambient-distant-lantern"
                style={{
                  left: l.left,
                  bottom: l.bottom,
                  width: `${l.size}px`,
                  height: `${l.size * 1.3}px`,
                  animationDelay: l.delay,
                  '--drift': l.drift,
                } as React.CSSProperties}
                aria-hidden="true"
              />
            ))}

            {/* Main Ceremonial Lantern (Resting/Hovering before launch) */}
            {!lanternFlying && (
              <div
                className="ceremonial-lantern-preview"
                role="button"
                tabIndex={0}
                onClick={handleLaunchLantern}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLaunchLantern();
                  }
                }}
                title="แตะที่โคมหรือกดปุ่มด้านล่างเพื่อปล่อยโคม"
                aria-label="โคมลอยสะเดาะเคราะห์ แตะเพื่อปล่อย"
              >
                <svg viewBox="0 0 100 140" className="lantern-body-svg" aria-hidden="true">
                  <defs>
                    <radialGradient id="lanternGlow" cx="50%" cy="65%" r="60%">
                      <stop offset="0%" stopColor="#fff8e7" />
                      <stop offset="35%" stopColor="#ffb347" />
                      <stop offset="70%" stopColor="#e64a19" />
                      <stop offset="100%" stopColor="#8d1b09" />
                    </radialGradient>
                    <linearGradient id="goldRim" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#c79c64" />
                      <stop offset="50%" stopColor="#fff1d3" />
                      <stop offset="100%" stopColor="#b3823c" />
                    </linearGradient>
                  </defs>
                  {/* Bamboo top frame */}
                  <rect x="25" y="8" width="50" height="6" rx="3" fill="url(#goldRim)" />
                  {/* Lantern parchment body */}
                  <path
                    d="M26 14 C12 40, 10 95, 28 120 L72 120 C90 95, 88 40, 74 14 Z"
                    fill="url(#lanternGlow)"
                    stroke="rgba(255,215,100,0.85)"
                    strokeWidth="1.5"
                  />
                  {/* Internal candle flame */}
                  <circle cx="50" cy="98" r="14" fill="#fff" opacity="0.8" />
                  <path d="M50 82 C55 92 56 102 50 108 C44 102 45 92 50 82Z" fill="#ffecb3" />
                  {/* Bottom bamboo rim */}
                  <rect x="26" y="118" width="48" height="6" rx="2" fill="url(#goldRim)" />
                  {/* Auspicious red hanging tassel */}
                  <line x1="50" y1="124" x2="50" y2="138" stroke="#d32f2f" strokeWidth="2.5" />
                  <circle cx="50" cy="138" r="3" fill="#ffb300" />
                </svg>
                <div className="lantern-inner-wish-text">
                  {lanternText.trim() ? lanternText.trim() : 'คำอธิษฐาน'}
                </div>
                <span className="lantern-tap-prompt">✨ แตะที่ตัวโคมเพื่อปล่อยลอย</span>
              </div>
            )}

            {/* Flying Lantern Ascending into Sky */}
            {lanternFlying && lanternStyle && (
              <div
                className="flying-lantern"
                style={{
                  left: lanternStyle.left,
                  '--dx': lanternStyle.dx,
                } as React.CSSProperties}
                aria-hidden="true"
              >
                <svg viewBox="0 0 100 140" className="lantern-body-svg">
                  <defs>
                    <radialGradient id="flyGlow" cx="50%" cy="65%" r="60%">
                      <stop offset="0%" stopColor="#fff8e7" />
                      <stop offset="35%" stopColor="#ffb347" />
                      <stop offset="70%" stopColor="#e64a19" />
                      <stop offset="100%" stopColor="#8d1b09" />
                    </radialGradient>
                  </defs>
                  <rect x="25" y="8" width="50" height="6" rx="3" fill="#ffd54f" />
                  <path
                    d="M26 14 C12 40, 10 95, 28 120 L72 120 C90 95, 88 40, 74 14 Z"
                    fill="url(#flyGlow)"
                    stroke="#ffe082"
                    strokeWidth="1.5"
                  />
                  <circle cx="50" cy="98" r="14" fill="#fff" opacity="0.95" />
                  <rect x="26" y="118" width="48" height="6" rx="2" fill="#ffd54f" />
                  <line x1="50" y1="124" x2="50" y2="138" stroke="#d32f2f" strokeWidth="2.5" />
                </svg>
              </div>
            )}
          </div>

          {/* Quick Wish Presets */}
          <div className="wish-presets-group">
            <span className="wish-presets-label">
              <span>เลือกคำอธิษฐานด่วน</span>
              <span aria-hidden="true">👇</span>
            </span>
            <div className="wish-preset-chips">
              {WISH_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`wish-preset-chip ${lanternText === p.text ? 'selected' : ''}`}
                  onClick={() => handleSelectPreset(p.text)}
                >
                  <span>{p.icon}</span>
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            ความในใจ หรือคำอธิษฐานสะเดาะเคราะห์ของคุณ
            <textarea
              id="lantern-text"
              maxLength={300}
              rows={3}
              placeholder="เช่น ขอให้หมดเคราะห์หมดโศก สุขภาพแข็งแรง การงานการเงินเจริญรุ่งเรือง..."
              value={lanternText}
              onChange={(e) => setLanternText(e.target.value)}
            />
          </label>

          <div className="row center" style={{ marginTop: '0.8rem', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button
              id="btn-lantern"
              className="btn primary"
              type="button"
              onClick={handleLaunchLantern}
              disabled={lanternFlying}
            >
              <span>🏮</span>
              <span>{lanternFlying ? 'โคมลอยกำลังนำพาคำอธิษฐานขึ้นสู่ฟากฟ้า...' : 'ปล่อยโคมลอยสะเดาะเคราะห์ขึ้นฟ้า'}</span>
            </button>
            {lanternResult && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setLanternResult(null);
                  setLanternText('');
                }}
              >
                <span>🏮 ปล่อยโคมอีกดวง</span>
              </button>
            )}
          </div>

          {lanternResult && (
            <article
              id="lantern-result"
              className={`result ${lanternResult.care ? 'care' : ''}`}
              aria-live="polite"
            >
              {lanternResult.care ? (
                <>
                  <h3>มีคนรับฟังอยู่เสมอ</h3>
                  <p>{lanternResult.message}</p>
                  <p className="center">
                    <a className="btn primary" href="tel:1323">
                      โทร 1323 สายด่วนสุขภาพจิต
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <h3>โคมลอยขึ้นสู่ฟากฟ้าสำเร็จแล้ว</h3>
                  <p className="center">
                    เรื่องที่ปัดเป่า: <span className="badge lv1">{lanternResult.category}</span>
                  </p>
                  <p>{lanternResult.message}</p>
                  <p className="center">
                    คะแนนบุญวันนี้ {lanternResult.merit} · เลขมงคล{' '}
                    <span className="badge lv0">{lanternResult.lucky}</span> · สีมงคล{' '}
                    <span className="badge lv1">{lanternResult.color}</span>
                  </p>
                </>
              )}
            </article>
          )}
        </div>
      )}

      {/* Chong Ritual */}
      {activeRit === 'chong' && (
        <div id="rit-chong" className="rit">
          <p className="lead">
            เลือกนักษัตรและเรื่องที่กังวล เพื่อตรวจสอบว่าปีนี้ชงหรือไม่ พร้อมรับยันต์มงคลและวิธีเสริมดวงชะตา
          </p>
          <div className="grid2">
            <label>
              นักษัตรของคุณ
              <select
                id="chong-zodiac"
                value={chongZodiac}
                onChange={(e) => setChongZodiac(parseInt(e.target.value, 10))}
              >
                {CHONG_ZODIAC_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              เรื่องที่กังวลใจ
              <select
                id="chong-problem"
                value={chongProblem}
                onChange={(e) => setChongProblem(parseInt(e.target.value, 10))}
              >
                <option value={0}>การเงินและโชคลาภ</option>
                <option value={1}>ความรักและความสัมพันธ์</option>
                <option value={2}>สุขภาพและอุบัติเหตุ</option>
                <option value={3}>การงานและธุรกิจ</option>
              </select>
            </label>
          </div>

          <div className="yantra-wrap">
            <div id="yantra" className={`yantra ${chongSpinning ? 'active' : ''}`} aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="94" className="y-ring" />
                <circle cx="100" cy="100" r="78" className="y-ring thin" />
                <g className="y-spin">
                  <circle cx="100" cy="100" r="62" className="y-ring dash" />
                </g>
                <polygon points="100,28 160,132 40,132" className="y-tri" />
                <polygon points="100,172 40,68 160,68" className="y-tri" />
                <text x="100" y="108" textAnchor="middle" className="y-glyph">
                  {chongGlyph}
                </text>
              </svg>
            </div>
          </div>

          <div className="row center">
            <button
              id="btn-chong"
              className="btn primary"
              type="button"
              onClick={handlePerformChong}
              disabled={chongSpinning}
            >
              <span>☯️</span>
              <span>{chongSpinning ? 'กำลังสวดปัดเป่าดวงชะตา...' : 'ทำพิธีปัดเป่าเคราะห์'}</span>
            </button>
          </div>

          {chongResult && (
            <article id="chong-result" className="result" aria-live="polite">
              <h3>
                นักษัตร{chongResult.zodiac_name} × ปี{chongResult.year_name} {chongResult.year}
              </h3>
              <p className="center">
                <span className={`badge lv${chongResult.severity}`}>{chongResult.relation_name}</span>
              </p>
              <div
                className={`sev s${chongResult.severity}`}
                aria-label={`ระดับ ${chongResult.severity} จาก 3`}
              >
                {[0, 1, 2].map((i) => (
                  <i key={i} className={i < chongResult.severity ? 'on' : ''} />
                ))}
              </div>
              <p>{chongResult.summary}</p>
              <dl className="kv">
                <dt>ด้าน{chongResult.problem}</dt>
                <dd>{chongResult.practical}</dd>
                <dt>เสริมมงคล</dt>
                <dd>{chongResult.merit}</dd>
                <dt>สีมงคล</dt>
                <dd>{chongResult.color}</dd>
                <dt>ทิศมงคล</dt>
                <dd>{chongResult.direction}</dd>
              </dl>
              {chongResult.mantra.map((m, i) => (
                <div key={i} className="mantra">
                  {m}
                </div>
              ))}
              <p className="note">
                เป็นความเชื่อเชิงวัฒนธรรมเพื่อความบันเทิง — เรื่องสุขภาพ การเงิน หรือกฎหมาย ควรปรึกษาผู้เชี่ยวชาญ
              </p>
            </article>
          )}
        </div>
      )}
    </section>
  );
};
