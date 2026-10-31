import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { StickResult } from '../types';

interface SiameseSticksProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
}

export const SiameseSticks: React.FC<SiameseSticksProps> = ({ bridge, onToast }) => {
  const [shakeMeter, setShakeMeter] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fallenNum, setFallenNum] = useState<number | null>(null);
  const [showFallen, setShowFallen] = useState(false);
  const [result, setResult] = useState<StickResult | null>(null);
  const [motionAvailable, setMotionAvailable] = useState(false);

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
      setShowFallen(false);

      // force reflow trigger animation
      setTimeout(() => {
        setShowFallen(true);
      }, 20);

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 700));

      setResult(res);
      resultRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
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

  // Device Motion
  useEffect(() => {
    let prev = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
      const delta = Math.abs(mag - prev);
      prev = mag;
      if (delta > 5) addShake(delta * 0.5);
    };

    const isDeviceMotionSupported = typeof window !== 'undefined' && typeof window.DeviceMotionEvent !== 'undefined';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dm = window.DeviceMotionEvent as any;
    if (isDeviceMotionSupported && typeof dm.requestPermission === 'function') {
      setMotionAvailable(true);
    } else if (isDeviceMotionSupported) {
      window.addEventListener('devicemotion', onMotion);
      return () => window.removeEventListener('devicemotion', onMotion);
    }
  }, [addShake]);

  const requestMotionPermission = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dm = window.DeviceMotionEvent as any;
    try {
      const res = await dm.requestPermission();
      if (res === 'granted') {
        const onMotion = (e: DeviceMotionEvent) => {
          const a = e.accelerationIncludingGravity;
          if (!a) return;
          const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
          addShake(mag * 0.3);
        };
        window.addEventListener('devicemotion', onMotion);
        setMotionAvailable(false);
        onToast('เปิดเซ็นเซอร์แล้ว เขย่ามือถือได้เลย');
      } else {
        onToast('ไม่ได้รับอนุญาตใช้เซ็นเซอร์');
      }
    } catch {
      onToast('ใช้เซ็นเซอร์ไม่ได้บนอุปกรณ์นี้');
    }
  };

  return (
    <section id="tab-stick" className="panel tab" role="tabpanel">
      <h2 className="title">เสี่ยงเซียมซี</h2>
      <p className="lead">
        ตั้งจิตอธิษฐาน แล้วเขย่ากระบอกจนไม้เซียมซีหล่นออกมา — กดปุ่ม ลากเมาส์ หรือเขย่ามือถือก็ได้
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
        {motionAvailable && (
          <button
            id="btn-motion"
            className="btn ghost"
            type="button"
            onClick={requestMotionPermission}
          >
            เปิดเซ็นเซอร์เขย่ามือถือ
          </button>
        )}
      </div>

      {result && (
        <article ref={resultRef} id="stick-result" className="result" aria-live="polite">
          <h3>
            ใบที่ {result.stick} · {result.title}
          </h3>
          <p className="center">
            ผลเซียมซี{' '}
            <span className={`badge lv${result.level}`}>
              {result.level_name}
            </span>
          </p>
          <p className="verse">{result.verse}</p>
          <div className="aspects">
            {result.aspects.map((a, i) => (
              <div key={i} className="aspect">
                <b>{a.name}</b>
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        </article>
      )}
    </section>
  );
};
