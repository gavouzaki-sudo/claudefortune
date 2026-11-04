import React, { useState, useRef, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { StickResult } from '../types';
import { PuaPoi } from './PuaPoi';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { spiritualSpeechEngine } from '../utils/spiritualSpeech';
import { saveJournalEntry } from '../utils/fortuneJournal';
import type { CardData } from '../utils/luckyCardCanvas';
import { buildStickCardData } from '../utils/cardDataBuilder';
import { logger } from '../utils/logger';

interface SiameseSticksProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

type StickRitualStep = 'cylinder' | 'puapoi' | 'prophecy';

export const SiameseSticks: React.FC<SiameseSticksProps> = ({ bridge, onToast, onOpenCard }) => {
  const [step, setStep] = useState<StickRitualStep>('cylinder');
  const [prophecyMode, setProphecyMode] = useState<'read' | 'listen'>('read');
  const [shakeMeter, setShakeMeter] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fallenNum, setFallenNum] = useState<number | null>(null);
  const [showFallen, setShowFallen] = useState(false);
  const [result, setResult] = useState<StickResult | null>(null);
  const [puaPoiVerified, setPuaPoiVerified] = useState<boolean>(false);
  const [isJournalSaved, setIsJournalSaved] = useState<boolean>(false);

  const shakeValueRef = useRef(0);
  const shakeRawRef = useRef(0);
  const shakeTimeoutRef = useRef<number | null>(null);
  const lastPointerRef = useRef<[number, number]>([0, 0]);
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

      setTimeout(() => {
        setShowFallen(true);
      }, 20);

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      await new Promise((r) => setTimeout(r, reduceMotion ? 100 : 750));

      setStep('puapoi');
      setPuaPoiVerified(false);
      onToast(`✨ ไม้เซียมซีใบที่ ${res.stick} หล่นออกมาแล้ว! โปรดโยนไม้ปัวปวยขอยืนยัน`);
    } catch (err) {
      logger.error('Error drawing Siamese stick:', err);
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      shakeValueRef.current = 0;
      shakeRawRef.current = 0;
      setShakeMeter(0);
      setBusy(false);
    }
  }, [bridge, onToast]);

  const addShake = useCallback(
    (amount: number) => {
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
    },
    [busy, finishShake]
  );

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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      logger.debug('Pointer capture error:', err);
    }
    lastPointerRef.current = [e.clientX, e.clientY];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!lastPointerRef.current) return;
    const d = Math.hypot(e.clientX - lastPointerRef.current[0], e.clientY - lastPointerRef.current[1]);
    lastPointerRef.current = [e.clientX, e.clientY];
    addShake(d / 18);
  };

  const handleResetToShake = () => {
    spiritualSpeechEngine.stop();
    setStep('cylinder');
    setFallenNum(null);
    setShowFallen(false);
    setResult(null);
    setPuaPoiVerified(false);
    setIsJournalSaved(false);
    setProphecyMode('read');
    shakeValueRef.current = 0;
    shakeRawRef.current = 0;
    setShakeMeter(0);
  };

  const handleSaveAndShare = () => {
    if (!result) return;
    const cardData = buildStickCardData(result);
    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'stick',
        title: cardData.title,
        summary: `${result.level_name}: ${result.verse.slice(0, 80)}`,
        details: cardData.details,
      });
      setIsJournalSaved(true);
      onToast('📖 บันทึกลงในสมุดดวงชะตาเรียบร้อยแล้ว');
    }
    if (onOpenCard) {
      onOpenCard(cardData);
    }
  };

  const handleConfirmFortune = (mode: 'read' | 'listen' = 'read') => {
    setPuaPoiVerified(true);
    setProphecyMode(mode);
    setStep('prophecy');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);

    if (mode === 'listen' && result) {
      const fullText = [
        `เซียมซีใบที่ ${result.stick} ${result.title}`,
        `คำทำนาย: ${result.level_name}`,
        result.verse,
        ...result.aspects.map((a) => `${a.name} ${a.text}`),
      ].join('\n');
      spiritualSpeechEngine.speak(fullText, { withChime: true });
    } else {
      spiritualSpeechEngine.stop();
    }
  };

  return (
    <section id="tab-stick" className="ritual-frameless-stage tab" role="tabpanel">
      {/* Step Indicator Header */}
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
            if (result && puaPoiVerified) setStep('prophecy');
          }}
          disabled={!result || !puaPoiVerified}
          title={!puaPoiVerified ? 'ต้องเสี่ยงทายไม้ปัวปวยจนเทพเจ้าเห็นชอบก่อน' : 'อ่านคำทำนาย'}
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

      {/* PHASE 2: PUA POI VERIFICATION */}
      {step === 'puapoi' && result && (
        <PuaPoi
          stickNumber={result.stick}
          stickTitle={result.title}
          onConfirmFortune={handleConfirmFortune}
          onReshakeStick={handleResetToShake}
          onToast={onToast}
        />
      )}

      {/* PHASE 3: REVEALED PROPHECY */}
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

          <div className="prophecy-mode-switch-row" role="tablist" aria-label="รูปแบบการรับคำทำนาย">
            <button
              type="button"
              className={`btn-prophecy-mode ${prophecyMode === 'read' ? 'is-active' : ''}`}
              onClick={() => {
                setProphecyMode('read');
                spiritualSpeechEngine.stop();
              }}
              title="แสดงเฉพาะข้อความคำทำนาย"
            >
              <span>📖 เฉพาะข้อความ (อ่าน)</span>
            </button>
            <button
              type="button"
              className={`btn-prophecy-mode ${prophecyMode === 'listen' ? 'is-active' : ''}`}
              onClick={() => {
                setProphecyMode('listen');
                const fullText = [
                  `เซียมซีใบที่ ${result.stick} ${result.title}`,
                  `คำทำนาย: ${result.level_name}`,
                  result.verse,
                  ...result.aspects.map((a) => `${a.name} ${a.text}`),
                ].join('\n');
                spiritualSpeechEngine.speak(fullText, { withChime: true });
              }}
              title="สุ่มเสียงและเริ่มอ่านออกเสียงทันที"
            >
              <span>🔊 อ่าน</span>
            </button>
          </div>

          {prophecyMode === 'listen' && (
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
          )}

          <p className="verse">{result.verse}</p>

          <div className="aspects">
            {result.aspects.map((a, i) => (
              <div key={i} className="aspect">
                <b>{a.name}</b>
                <span>{a.text}</span>
              </div>
            ))}
          </div>

          <div className="prophecy-actions-footer">
            {onOpenCard && (
              <button
                type="button"
                className="btn gold btn-view-lucky-card"
                onClick={handleSaveAndShare}
                title="บันทึกและแชร์การ์ดมงคล"
              >
                <span>🎴 บันทึก&แชร์</span>
              </button>
            )}
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
