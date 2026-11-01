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

interface RitualsProps {
  bridge: Bridge;
  userZodiac: number;
  onToast: (msg: string) => void;
}

export const Rituals: React.FC<RitualsProps> = ({ bridge, userZodiac, onToast }) => {
  const [activeRit, setActiveRit] = useState<'candle' | 'lantern' | 'chong'>('candle');

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
      onToast('พิมพ์ความในใจก่อนปล่อยโคมนะ');
      return;
    }

    setLanternStyle({
      left: `${20 + Math.random() * 60}%`,
      dx: `${Math.round(Math.random() * 80 - 40)}px`,
    });
    setLanternFlying(true);

    try {
      const res = bridge.offering(1, trimmed);
      setLanternResult(res);
      setLanternText(''); // The wish leaves the device with the lantern
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    }

    setTimeout(() => {
      setLanternFlying(false);
    }, 6200);
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
      <div className="pills" role="tablist" aria-label="พิธีกรรม">
        <button
          className={`pill ${activeRit === 'candle' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveRit('candle')}
        >
          จุดเทียนต่อดวง
        </button>
        <button
          className={`pill ${activeRit === 'lantern' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveRit('lantern')}
        >
          ลอยโคมสะเดาะเคราะห์
        </button>
        <button
          className={`pill ${activeRit === 'chong' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveRit('chong')}
        >
          แก้ปีชง
        </button>
      </div>

      {/* Candle */}
      {activeRit === 'candle' && (
        <div id="rit-candle" className="rit">
          <p className="lead">
            แตะค้างหรือกดเมาส์ค้างที่เทียน ยิ่งนานเทียนยิ่งสว่าง ค้างไว้ 4 วินาทีเพื่อปลดล็อกบทสวดและเลขมงคล
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

      {/* Lantern */}
      {activeRit === 'lantern' && (
        <div id="rit-lantern" className="rit">
          <p className="lead">
            พิมพ์ความทุกข์ใจหรือความกังวลลงไป แล้วปล่อยโคมให้ลอยขึ้นฟ้า — ข้อความไม่ถูกส่งออกจากเครื่องของคุณ
          </p>
          <div id="sky" className="sky" aria-hidden="true">
            {lanternFlying && lanternStyle && (
              <div
                className="lantern"
                style={
                  {
                    left: lanternStyle.left,
                    '--dx': lanternStyle.dx,
                  } as React.CSSProperties
                }
              />
            )}
          </div>
          <label className="block">
            ความในใจของคุณ
            <textarea
              id="lantern-text"
              maxLength={300}
              rows={3}
              placeholder="เช่น กังวลเรื่องงาน อยากให้ทุกอย่างดีขึ้น..."
              value={lanternText}
              onChange={(e) => setLanternText(e.target.value)}
            />
          </label>
          <div className="row center">
            <button
              id="btn-lantern"
              className="btn primary"
              type="button"
              onClick={handleLaunchLantern}
              disabled={lanternFlying}
            >
              ปล่อยโคมลอยขึ้นฟ้า
            </button>
          </div>

          {lanternResult && (
            <article
              id="lantern-result"
              className={`result ${lanternResult.care ? 'care' : ''}`}
              aria-live="polite"
            >
              {lanternResult.care ? (
                <>
                  <h3>มีคนรับฟังอยู่</h3>
                  <p>{lanternResult.message}</p>
                  <p className="center">
                    <a className="btn primary" href="tel:1323">
                      โทร 1323 สายด่วนสุขภาพจิต
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <h3>โคมลอยขึ้นฟ้าแล้ว</h3>
                  <p className="center">
                    เรื่องที่กังวล: <span className="badge lv1">{lanternResult.category}</span>
                  </p>
                  <p>{lanternResult.message}</p>
                  <p className="center">
                    คะแนนบุญวันนี้ {lanternResult.merit} · เลขมงคล{' '}
                    <span className="badge lv0">{lanternResult.lucky}</span> · สีมงคล
                    {lanternResult.color}
                  </p>
                </>
              )}
            </article>
          )}
        </div>
      )}

      {/* Chong */}
      {activeRit === 'chong' && (
        <div id="rit-chong" className="rit">
          <p className="lead">
            เลือกนักษัตรและเรื่องที่กังวล เพื่อดูว่าปีนี้ชงหรือไม่ พร้อมวิธีเสริมดวง
          </p>
          <div className="grid2">
            <label>
              นักษัตร
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
              เรื่องที่กังวล
              <select
                id="chong-problem"
                value={chongProblem}
                onChange={(e) => setChongProblem(parseInt(e.target.value, 10))}
              >
                <option value={0}>การเงิน</option>
                <option value={1}>ความรัก</option>
                <option value={2}>สุขภาพ</option>
                <option value={3}>การงาน</option>
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
              ทำพิธีปัดเป่า
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
