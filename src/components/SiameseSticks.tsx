import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Bridge } from '../bridge';
import type { StickResult } from '../types';
import { PuaPoi } from './PuaPoi';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { spiritualSpeechEngine } from '../utils/spiritualSpeech';
import { saveJournalEntry } from '../utils/fortuneJournal';
import type { CardData } from '../utils/luckyCardCanvas';
import { buildStickCardData } from '../utils/cardDataBuilder';
import { logger } from '../utils/logger';
import { useLanguage } from '../context/LanguageContext';

export function formatStickReading(res: StickResult): string {
  return [
    `เซียมซีใบที่ ${res.stick} ${res.title}`,
    `คำทำนาย: ${res.level_name}`,
    res.verse,
    ...res.aspects.map((a) => `${a.name} ${a.text}`),
  ].join('\n');
}

interface SiameseSticksProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

type StickRitualStep = 'cylinder' | 'puapoi' | 'prophecy';

export const SiameseSticks: React.FC<SiameseSticksProps> = ({ bridge, onToast, onOpenCard }) => {
  const { lang, t, format } = useLanguage();
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
  const buttonIntervalRef = useRef<number | null>(null);
  const lastPointerRef = useRef<[number, number]>([0, 0]);
  const isPointerDownRef = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const timersRef = useRef<Set<number>>(new Set());

  const clearTrackedTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current.clear();
  }, []);

  const waitMs = useCallback((ms: number) => {
    return new Promise<boolean>((resolve) => {
      const id = window.setTimeout(() => {
        timersRef.current.delete(id);
        resolve(isMountedRef.current);
      }, ms);
      timersRef.current.add(id);
    });
  }, []);

  const finishShake = useCallback(async () => {
    if (buttonIntervalRef.current) {
      clearInterval(buttonIntervalRef.current);
      buttonIntervalRef.current = null;
    }
    setBusy(true);
    const aliveAfterShake = await waitMs(450);
    if (!aliveAfterShake) return;
    setIsShaking(false);

    try {
      const res = bridge.drawStick(shakeRawRef.current);
      setFallenNum(res.stick);
      setResult(res);
      setShowFallen(false);

      const fallenId = window.setTimeout(() => {
        timersRef.current.delete(fallenId);
        if (isMountedRef.current) {
          setShowFallen(true);
        }
      }, 20);
      timersRef.current.add(fallenId);

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const aliveAfterFall = await waitMs(reduceMotion ? 100 : 750);
      if (!aliveAfterFall) return;

      setStep('puapoi');
      setPuaPoiVerified(false);
      onToast(`✨ ${t.stickFallenNotice} (${res.stick}) — ${t.stickPuaPoiPrompt}`);
    } catch (err) {
      logger.error('Error drawing Siamese stick:', err);
      if (isMountedRef.current) {
        onToast(t.commonErrorRetry);
      }
    } finally {
      shakeValueRef.current = 0;
      shakeRawRef.current = 0;
      if (isMountedRef.current) {
        setShakeMeter(0);
        setBusy(false);
      }
    }
  }, [bridge, onToast, t.commonErrorRetry, t.stickFallenNotice, t.stickPuaPoiPrompt, waitMs]);

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
    if (busy || buttonIntervalRef.current) return;
    buttonIntervalRef.current = window.setInterval(() => {
      if (shakeValueRef.current >= 100) {
        if (buttonIntervalRef.current) {
          clearInterval(buttonIntervalRef.current);
          buttonIntervalRef.current = null;
        }
      } else {
        addShake(3 + Math.random() * 1.5);
      }
    }, 40);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (buttonIntervalRef.current) {
        clearInterval(buttonIntervalRef.current);
        buttonIntervalRef.current = null;
      }
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = null;
      }
      clearTrackedTimers();
    };
  }, [clearTrackedTimers]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      logger.debug('Pointer capture error:', err);
    }
    lastPointerRef.current = [e.clientX, e.clientY];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current && e.buttons === 0) return;
    if (!lastPointerRef.current) return;
    const d = Math.hypot(e.clientX - lastPointerRef.current[0], e.clientY - lastPointerRef.current[1]);
    lastPointerRef.current = [e.clientX, e.clientY];
    addShake(d / 18);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  };

  const handleResetToShake = () => {
    if (buttonIntervalRef.current) {
      clearInterval(buttonIntervalRef.current);
      buttonIntervalRef.current = null;
    }
    clearTrackedTimers();
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
    const cardData = buildStickCardData(result, lang);
    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'stick',
        title: cardData.title,
        summary: `${result.level_name}: ${result.verse.slice(0, 80)}`,
        details: cardData.details,
      });
      setIsJournalSaved(true);
      onToast(t.savedToJournal);
    }
    if (onOpenCard) {
      onOpenCard(cardData);
    }
  };

  const handleConfirmFortune = (mode: 'read' | 'listen' = 'read') => {
    setPuaPoiVerified(true);
    setProphecyMode(mode);
    setStep('prophecy');
    const scrollId = window.setTimeout(() => {
      timersRef.current.delete(scrollId);
      if (isMountedRef.current) {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
    timersRef.current.add(scrollId);

    if (mode === 'listen' && result) {
      const fullText = formatStickReading(result);
      spiritualSpeechEngine.speak(fullText, { withChime: true });
    } else {
      spiritualSpeechEngine.stop();
    }
  };

  return (
    <section id="tab-stick" className="ritual-frameless-stage tab" role="tabpanel" aria-label={t.stickTitle}>
      {/* PHASE 1: CYLINDER SHAKING */}
      {step === 'cylinder' && (
        <div className="stick-cylinder-phase">
          <div className="stick-stage">
            <div
              id="cylinder"
              className={`cylinder ${isShaking ? 'shaking' : ''}`}
              aria-label={t.stickTitle}
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

          <div
            className="meter"
            role="progressbar"
            aria-label={t.stickShakePower}
            aria-valuenow={Math.round(shakeMeter)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div id="shake-meter" style={{ width: `${shakeMeter}%` }} />
          </div>

          <div className="row center stick-action-row">
            <button
              id="btn-shake"
              className="btn primary"
              type="button"
              onClick={handleButtonClick}
              disabled={busy}
            >
              {t.stickShakeBtn}
            </button>
          </div>
          <p className="stick-hint-sub">
            {t.stickLead}
          </p>
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
                {format(t.stickNumberLabel, { num: result.stick })} · {result.title}
              </h3>
              <p className="prophecy-level-line">
                {t.stickResultLabel}{' '}
                <span className={`badge lv${result.level}`}>
                  {result.level_name}
                </span>
                {puaPoiVerified && (
                  <span className="badge-pua-verified" title={t.stickPuaVerifiedTitle}>
                    {t.stickPuaVerifiedBadge}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="prophecy-mode-switch-row" role="tablist" aria-label={t.stickModeAria}>
            <button
              type="button"
              className={`btn-prophecy-mode ${prophecyMode === 'read' ? 'is-active' : ''}`}
              onClick={() => {
                setProphecyMode('read');
                spiritualSpeechEngine.stop();
              }}
              title={t.stickReadTitle}
            >
              <span>📖 {t.stickReadMode}</span>
            </button>
            <button
              type="button"
              className={`btn-prophecy-mode ${prophecyMode === 'listen' ? 'is-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setProphecyMode('listen');
                const fullText = formatStickReading(result);
                const state = spiritualSpeechEngine.getState();
                if (state.isSpeaking && state.isPaused && state.currentText === fullText) {
                  spiritualSpeechEngine.resume();
                } else {
                  spiritualSpeechEngine.speak(fullText, { withChime: true });
                }
              }}
              title={t.stickListenTitle}
            >
              <span>🔊 {t.stickListenMode}</span>
            </button>
          </div>

          {prophecyMode === 'listen' && (
            <SpiritualTTSPlayer
              textToRead={formatStickReading(result)}
              subtitle={t.ttsDefaultSubtitle}
              initialExpanded={true}
              showTextLines={false}
            />
          )}

          {lang !== 'th' && (
            <p className="note" style={{ marginBottom: '0.65rem' }}>
              {t.oracleThaiFallbackNote}
            </p>
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

          {onOpenCard && (
            <div className="prophecy-actions-footer">
              <button
                type="button"
                className="btn gold btn-view-lucky-card"
                onClick={handleSaveAndShare}
                title={t.stickViewCardBtn}
              >
                <span>{t.stickViewCardBtn}</span>
              </button>
            </div>
          )}
        </article>
      )}
    </section>
  );
};
