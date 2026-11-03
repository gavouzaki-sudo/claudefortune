import React, { useState, useRef, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { StickResult } from '../types';
import { PuaPoi } from './PuaPoi';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';

interface SiameseSticksProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
}

type StickRitualStep = 'cylinder' | 'puapoi' | 'prophecy';

export const SiameseSticks: React.FC<SiameseSticksProps> = ({ bridge, onToast }) => {
  const [step, setStep] = useState<StickRitualStep>('cylinder');
  const [shakeMeter, setShakeMeter] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fallenNum, setFallenNum] = useState<number | null>(null);
  const [showFallen, setShowFallen] = useState(false);
  const [result, setResult] = useState<StickResult | null>(null);
  const [puaPoiVerified, setPuaPoiVerified] = useState<boolean>(false);

  const shakeValueRef = useRef(0);
  const shakeRawRef = useRef(0);
  const shakeTimeoutRef = useRef<number | null>(null);
  const lastPointerRef = useRef<[number, number] | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const finishShake = useCallback(async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    setIsShaking(false);

    try {
      const res = bridge.drawStick(shakeRawRef.current);
      setFallenNum(res.stick);
      setResult(res);
      setShowFallen(false);

      // Trigger fallen stick animation
      setTimeout(() => {
        setShowFallen(true);
      }, 20);

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      await new Promise((r) => setTimeout(r, reduceMotion ? 100 : 750));

      // Transition to authentic Pua Poi verification step
      setStep('puapoi');
      setPuaPoiVerified(false);
      onToast(`✨ ไม้เซียมซีใบที่ ${res.stick} หล่นออกมาแล้ว! โปรดโยนไม้ปัวปวยขอยืนยัน`);
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      shakeValueRef.current = 0;
      shakeRawRef.current = 0;
      setShakeMeter(0);
      setBusy(false);
    }
  }, [bridge, onToast]);

  const addShake = useCallback((amount: number) => {
    if (busy) return;
    if (shakeValueRef.current === 0) {
      setShowFallen(false);
    }

    shakeValueRef.current += amount;
    shakeRawRef.current += amount * 10;
    const bounded = Math.min(100, shakeValueRef.current);
    setShakeMeter(bounded);
    setIsShaking(true);

    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = window.setTimeout(() => {
      if (!busy) setIsShaking(false);
    }, 220);

    if (shakeValueRef.current >= 100) {
      finishShake();
    }
  }, [busy, finishShake]);

  const handleButtonClick = () => {
    if (busy) return;
    const iv = setInterval(() => {
      if (shakeValueRef.current >= 100) {
        clearInterval(iv);
      } else {
        addShake(3 + Math.random() * 1.5);
      }
    }, 40);
  };

  // Pointer drag on the cylinder
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointerRef.current = [e.clientX, e.clientY];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!lastPointerRef.current) return;
    const d = Math.hypot(e.clientX - lastPointerRef.current[0], e.clientY - lastPointerRef.current[1]);
    lastPointerRef.current = [e.clientX, e.clientY];
    addShake(d / 18);
  };

  const handlePointerUp = () => {
    lastPointerRef.current = null;
  };

  // User resets to shake a new stick
  const handleResetToShake = () => {
    setStep('cylinder');
    setFallenNum(null);
    setShowFallen(false);
    setResult(null);
    setPuaPoiVerified(false);
    shakeValueRef.current = 0;
    shakeRawRef.current = 0;
    setShakeMeter(0);
  };

  // User confirms fortune through Pua Poi or skips
  const handleConfirmFortune = () => {
    setPuaPoiVerified(true);
    setStep('prophecy');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  return (
    <section id="tab-stick" className="ritual-frameless-stage tab" role="tabpanel">
      {/* Step Indicator Header (Compact & Mobile-friendly) */}
      <div className="stick-step-progress" aria-label="ขั้นตอนพิธีกรรมเซียมซี">
        <button
          type="button"
          className={`step-pill ${step === 'cylinder' ? 'active' : ''}`}
          onClick={handleResetToShake}
        >
          <span className="step-num">1</span>
          <span>เขย่าเซียมซี</span>
        </button>
        <span className="step-divider">&gt;</span>
        <button
          type="button"
          className={`step-pill ${step === 'puapoi' ? 'active' : ''}`}
          onClick={() => {
            if (result) setStep('puapoi');
          }}
          disabled={!result}
        >
          <span className="step-num">2</span>
          <span>เสี่ยงปัวปวย (筊杯)</span>
        </button>
        <span className="step-divider">&gt;</span>
        <button
          type="button"
          className={`step-pill ${step === 'prophecy' ? 'active' : ''}`}
          onClick={() => {
            if (result) setStep('prophecy');
          }}
          disabled={!result}
        >
          <span className="step-num">3</span>
          <span>อ่านคำทำนาย</span>
        </button>
      </div>

      {/* PHASE 1: CYLINDER SHAKING */}
      {step === 'cylinder' && (
        <div className="stick-cylinder-phase">
          <h2 className="title">เสี่ยงเซียมซีโบราณ</h2>
          <p className="lead">
            ตั้งจิตอธิษฐาน แล้วเขย่ากระบอกจนไม้เซียมซีหล่นออกมา — กดปุ่มเขย่า หรือใช้นิ้วลาก/ปัดที่กระบอกเซียมซี
          </p>

          <div className="stick-stage">
            <div
              id="cylinder"
              className={`cylinder ${isShaking ? 'shaking' : ''}`}
              aria-label="กระบอกเซียมซี"
              role="img"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div className="sticks">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="cyl-body">
                <span className="cyl-mark">福</span>
              </div>
            </div>
            <div id="fallen" className={`fallen ${showFallen ? 'show' : ''}`} aria-hidden="true">
              <span id="fallen-num">{fallenNum ?? 0}</span>
            </div>
          </div>

          <div className="meter" aria-hidden="true">
            <div id="shake-meter" style={{ width: `${shakeMeter}%` }} />
          </div>

          <div className="row center">
            <button
              id="btn-shake"
              className="btn primary"
              type="button"
              onClick={handleButtonClick}
              disabled={busy}
            >
              เขย่าเซียมซี
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: PUA POI VERIFICATION (ไม้ปัวปวย) */}
      {step === 'puapoi' && result && (
        <PuaPoi
          stickNumber={result.stick}
          stickTitle={result.title}
          onConfirmFortune={handleConfirmFortune}
          onReshakeStick={handleResetToShake}
          onToast={onToast}
        />
      )}

      {/* PHASE 3: REVEALED PROPHECY (คำทำนายเซียมซี) */}
      {step === 'prophecy' && result && (
        <article ref={resultRef} id="stick-result" className="result prophecy-result-card" aria-live="polite">
          <div className="prophecy-header-row">
            <div className="prophecy-title-block">
              <h3>
                ใบที่ {result.stick} · {result.title}
              </h3>
              <p className="prophecy-level-line">
                ผลเซียมซี{' '}
                <span className={`badge lv${result.level}`}>
                  {result.level_name}
                </span>
                {puaPoiVerified && (
                  <span className="badge-pua-verified" title="ผ่านการโยนไม้ปัวปวยยืนยันความศักดิ์สิทธิ์">
                    ✓ ปัวปวยยืนยันแล้ว
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Spiritual Chanting & Dharma TTS Recitation Player */}
          <SpiritualTTSPlayer
            textToRead={[
              `เซียมซีใบที่ ${result.stick} ${result.title}`,
              `คำทำนาย: ${result.level_name}`,
              result.verse,
              ...result.aspects.map((a) => `${a.name} ${a.text}`),
            ].join('\n')}
            title={`เสียงสวดบทกลอนเซียมซี ใบที่ ${result.stick}`}
            subtitle="สดับรับฟังเสียงสวดบทกลอนแบบช้าๆ กังวาน นุ่มนวล เสมือนซินแสผู้เฒ่าอ่านให้ฟัง"
            initialExpanded={true}
          />

          <p className="verse">{result.verse}</p>

          <div className="aspects">
            {result.aspects.map((a, i) => (
              <div key={i} className="aspect">
                <b>{a.name}</b>
                <span>{a.text}</span>
              </div>
            ))}
          </div>

          {/* Action Row at Bottom of Prophecy */}
          <div className="prophecy-actions-footer">
            <button
              type="button"
              className="btn ghost btn-reshake-prophecy"
              onClick={handleResetToShake}
            >
              <span>🔄 เสี่ยงเซียมซีใบใหม่</span>
            </button>
            <button
              type="button"
              className="btn ghost btn-retest-puapoi"
              onClick={() => setStep('puapoi')}
              title="กลับไปหน้าเสี่ยงทายไม้ปัวปวย"
            >
              <span>🎲 โยนไม้ปัวปวยอีกครั้ง</span>
            </button>
          </div>
        </article>
      )}
    </section>
  );
};
