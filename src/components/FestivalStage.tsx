import React, { useState } from 'react';
import { Bridge } from '../bridge';
import type { BlessingResult, TarotCard } from '../types';

interface FestivalStageProps {
  bridge: Bridge;
  festivalId: number;
  onToast: (msg: string) => void;
  onLaunchFireworks: (bursts?: number) => void;
}

const KRATHONG_SVG = (
  <svg viewBox="0 0 90 70" aria-hidden="true">
    <ellipse cx="45" cy="56" rx="38" ry="9" fill="#2e7d32" />
    <g fill="#43a047">
      <path d="M10 52 Q45 22 80 52 Q45 44 10 52Z" />
      <path d="M18 48 Q45 28 72 48 Q45 42 18 48Z" fill="#66bb6a" />
    </g>
    <g fill="#ff80ab">
      <path d="M45 20 Q54 34 45 46 Q36 34 45 20Z" />
      <path d="M45 26 Q64 30 62 46 Q50 44 45 30Z" fill="#f06292" />
      <path d="M45 26 Q26 30 28 46 Q40 44 45 30Z" fill="#f06292" />
    </g>
    <rect x="43" y="10" width="4" height="22" fill="#fff1d3" />
    <path d="M45 1 Q50 7 45 12 Q40 7 45 1Z" fill="#ffb347" />
  </svg>
);

const GLYPHS = [
  "🃏", "🪄", "🌙", "👑", "🏛️", "📿", "💞", "🛞", "🦁", "🏮", "☸️", "⚖️", "🙃", "🦋", "⚗️", "⛓️", "🗼", "⭐", "🌕", "☀️", "📯", "🌏"
];

export const FestivalStage: React.FC<FestivalStageProps> = ({
  bridge,
  festivalId,
  onToast,
  onLaunchFireworks,
}) => {
  const [blessing, setBlessing] = useState<BlessingResult | null>(null);

  // Stage specific state
  const [drops, setDrops] = useState<Array<{ id: number; left: string; dx: string; dy: string }>>([]);
  const [coffinOpen, setCoffinOpen] = useState(false);
  const [coffinCard, setCoffinCard] = useState<TarotCard | null>(null);
  const [krathongs, setKrathongs] = useState<number[]>([]);
  const [angpaoOpen, setAngpaoOpen] = useState(false);

  const fetchBlessing = (id: number): BlessingResult | null => {
    try {
      const res = bridge.blessing(id);
      setBlessing(res);
      return res;
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
      return null;
    }
  };

  const info = bridge.festivalInfo(festivalId);

  // Songkran splash
  const handleSplash = () => {
    const newDrops = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      left: `${90 + Math.random() * 40}px`,
      dx: `${Math.round(Math.random() * 260 - 130)}px`,
      dy: `${Math.round(-40 - Math.random() * 140)}px`,
    }));
    setDrops((prev) => [...prev, ...newDrops]);
    setTimeout(() => {
      setDrops((prev) => prev.filter((d) => !newDrops.includes(d)));
    }, 1200);
    fetchBlessing(1);
  };

  // Halloween coffin
  const toggleCoffin = async () => {
    const nextState = !coffinOpen;
    setCoffinOpen(nextState);
    if (!nextState) {
      setCoffinCard(null);
      setBlessing(null);
      return;
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 900));
    try {
      const tarot = bridge.drawTarot(1);
      setCoffinCard(tarot.cards[0]);
      fetchBlessing(2);
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    }
  };

  // Loy Krathong
  const handleFloatKrathong = async () => {
    const id = Date.now();
    setKrathongs((prev) => [...prev, id]);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 3200));
    fetchBlessing(3);
    setTimeout(() => {
      setKrathongs((prev) => prev.filter((k) => k !== id));
    }, 4200);
  };

  // CNY Angpao
  const handleToggleAngpao = () => {
    if (angpaoOpen) {
      setAngpaoOpen(false);
      setBlessing(null);
      return;
    }
    const b = fetchBlessing(4);
    if (b) {
      setAngpaoOpen(true);
    }
  };

  // New Year Fireworks
  const handleNewYearPray = () => {
    onLaunchFireworks(7);
    fetchBlessing(5);
  };

  const now = new Date();
  const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();

  return (
    <section id="tab-festival" className="panel tab" role="tabpanel">
      <h2 id="fest-title" className="title">
        {festivalId === 0 ? 'ขอพรประจำวัน' : `เทศกาล${info.name}`}
      </h2>
      <p id="fest-tag" className="lead">
        {info.tagline}
      </p>

      <div id="fest-stage" className="fest-stage">
        {/* Stage 0: Daily */}
        {festivalId === 0 && (
          <>
            <div className="yantra active" style={{ opacity: 0.9 }}>
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="94" className="y-ring" />
                <circle cx="100" cy="100" r="78" className="y-ring thin" />
                <g className="y-spin">
                  <circle cx="100" cy="100" r="62" className="y-ring dash" />
                </g>
                <polygon points="100,28 160,132 40,132" className="y-tri" />
                <polygon points="100,172 40,68 160,68" className="y-tri" />
                <text x="100" y="108" textAnchor="middle" className="y-glyph">
                  นะ
                </text>
              </svg>
            </div>
            <button
              className="btn primary stage-btn"
              type="button"
              onClick={() => fetchBlessing(0)}
            >
              จุดธูปขอพร
            </button>
          </>
        )}

        {/* Stage 1: Songkran */}
        {festivalId === 1 && (
          <>
            <div
              className="bowl"
              role="button"
              tabIndex={0}
              aria-label="สาดน้ำทายโชค"
              onClick={handleSplash}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSplash();
                }
              }}
            >
              <div className="base" />
              <div className="rim" />
              <div className="water" />
              {drops.map((d) => (
                <span
                  key={d.id}
                  className="drop-p"
                  style={
                    {
                      left: d.left,
                      top: '10px',
                      '--dx': d.dx,
                      '--dy': d.dy,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <p className="hint">แตะขันน้ำเพื่อสาดน้ำทายโชค</p>
          </>
        )}

        {/* Stage 2: Halloween */}
        {festivalId === 2 && (
          <>
            <div
              className={`coffin ${coffinOpen ? 'open' : ''}`}
              role="button"
              tabIndex={0}
              aria-label="เปิดโลงศพ"
              onClick={toggleCoffin}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCoffin();
                }
              }}
            >
              <div className="box" />
              <div className="lid" />
            </div>
            <p className="hint">แตะโลงศพเพื่อเปิดฝา (แตะอีกครั้งเพื่อปิด)</p>
            {coffinCard && (
              <div className="coffin-card">
                <div className="tslot revealed">
                  <div className="pos">ไพ่จากโลงศพ</div>
                  <div className="tcard flipped">
                    <div className="tcard-in">
                      <div className="tface tback" />
                      <div className={`tface tfront ${coffinCard.reversed ? 'rev' : ''}`}>
                        <div className="num">{String(coffinCard.id).padStart(2, '0')}</div>
                        <div className="glyph">{GLYPHS[coffinCard.id] || '🎴'}</div>
                        <div>
                          <div className="nm">{coffinCard.name}</div>
                          <div className="en">{coffinCard.en}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tmean">
                    {coffinCard.reversed && <span className="rv">ไพ่กลับหัว</span>}
                    {coffinCard.meaning}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stage 3: Loy Krathong */}
        {festivalId === 3 && (
          <>
            <div className="pond">
              <div className="moon" />
              {krathongs.map((k) => (
                <div key={k} className="krathong">
                  {KRATHONG_SVG}
                </div>
              ))}
            </div>
            <button
              className="btn primary stage-btn"
              type="button"
              onClick={handleFloatKrathong}
            >
              ลอยกระทง
            </button>
          </>
        )}

        {/* Stage 4: Chinese New Year */}
        {festivalId === 4 && (
          <>
            <div
              className={`angpao ${angpaoOpen ? 'open' : ''}`}
              role="button"
              tabIndex={0}
              aria-label="เปิดอั่งเปา"
              onClick={handleToggleAngpao}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleAngpao();
                }
              }}
            >
              <div className="env">福</div>
              <div className="amount">
                {blessing?.angpao ? `มงคล ${blessing.angpao}` : ''}
              </div>
              <div className="flap" />
            </div>
            <p className="hint">แตะซองอั่งเปาเพื่อเปิด</p>
          </>
        )}

        {/* Stage 5: New Year */}
        {festivalId === 5 && (
          <>
            <div className="countdown">
              สวัสดีปีใหม่ {nextYear + 543} / {nextYear}
            </div>
            <button
              className="btn primary stage-btn"
              type="button"
              onClick={handleNewYearPray}
            >
              จุดพลุอธิษฐาน
            </button>
          </>
        )}
      </div>

      {blessing && (
        <article id="fest-result" className="result" aria-live="polite">
          <h3>{blessing.title}</h3>
          <p className="verse">{blessing.text}</p>
          <p className="center">
            เลขมงคลเทศกาล <span className="badge lv0">{blessing.lucky}</span>
          </p>
          {blessing.angpao != null && (
            <p className="center">
              ค่ามงคลในอั่งเปา <span className="badge lv0">{blessing.angpao}</span> (สัญลักษณ์เท่านั้น ไม่ใช่เงินจริง)
            </p>
          )}
        </article>
      )}
    </section>
  );
};
