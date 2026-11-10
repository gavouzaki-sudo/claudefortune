import React, { useState } from 'react';
import type { Bridge } from '../bridge';
import type { BlessingResult } from '../types';

interface FestivalStageProps {
  bridge: Bridge;
  festivalId: number;
  onToast: (msg: string) => void;
  onLaunchFireworks: (bursts?: number) => void;
}

export const FestivalStage: React.FC<FestivalStageProps> = ({
  bridge,
  festivalId,
  onToast,
  onLaunchFireworks,
}) => {
  // Seasonal festivals: 1 = Songkran, 4 = Chinese New Year, 5 = New Year, 0 = Daily Prayer
  const [activeFestivalId, setActiveFestivalId] = useState<number>(() => {
    return festivalId === 0 ? 1 : festivalId;
  });

  const [blessing, setBlessing] = useState<BlessingResult | null>(null);

  // Stage specific state
  const [drops, setDrops] = useState<Array<{ id: number; left: string; dx: string; dy: string }>>([]);
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
    <section id="tab-festival" className="ritual-frameless-stage tab festival-section-stage" role="tabpanel">
      {/* Festival Selector Bar */}
      <div className="festival-tab-bar" role="tablist" aria-label="เลือกเทศกาลขอพร">
        {[
          { id: 1, name: '💦 สงกรานต์' },
          { id: 4, name: '🧧 ตรุษจีน' },
          { id: 5, name: '🎆 วันขึ้นปีใหม่' },
          { id: 0, name: '🏮 ขอพรประจำวัน' },
        ].map((fest) => (
          <button
            key={fest.id}
            type="button"
            className={`festival-tab-btn ${activeFestivalId === fest.id ? 'active' : ''}`}
            onClick={() => {
              setActiveFestivalId(fest.id);
              setBlessing(null);
            }}
          >
            {fest.name}
          </button>
        ))}
      </div>

      <div id="fest-stage" className="fest-stage">
        {/* Stage 0: Daily Blessing */}
        {activeFestivalId === 0 && (
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
              จุดธูปขอพรประจำวัน
            </button>
          </>
        )}

        {/* Stage 1: Songkran */}
        {activeFestivalId === 1 && (
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
            <p className="hint">แตะขันน้ำเพื่อสาดน้ำทายโชคชุ่มฉ่ำใจ</p>
          </>
        )}

        {/* Stage 4: Chinese New Year */}
        {activeFestivalId === 4 && (
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
            <p className="hint">แตะซองอั่งเปาเพื่อเปิดรับโชครับทรัพย์</p>
          </>
        )}

        {/* Stage 5: New Year */}
        {activeFestivalId === 5 && (
          <>
            <div className="countdown">
              สวัสดีปีใหม่ {nextYear + 543} / {nextYear}
            </div>
            <button
              className="btn primary stage-btn"
              type="button"
              onClick={handleNewYearPray}
            >
              จุดพลุอธิษฐานรับปีใหม่
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
