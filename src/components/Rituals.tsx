import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { CandleResult, OfferingResult, RemedyResult } from '../types';


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

export interface BodySweepPart {
  id: number;
  name: string;
  sub: string;
  blessing: string;
  x: number;
  y: number;
  nodeR: number;
}

export const BODY_SWEEP_PARTS: BodySweepPart[] = [
  { id: 1, name: 'ศีรษะ', sub: 'กระหม่อม', blessing: 'ปัดเคราะห์ความคิด จิตใจปลอดโปร่ง สว่างสดใส', x: 140, y: 38, nodeR: 15 },
  { id: 2, name: 'ใบหน้า', sub: 'หน้าผากและตา', blessing: 'ปัดสิ่งอัปมงคล เสริมสง่าราศี เมตตามหานิยม', x: 140, y: 64, nodeR: 14 },
  { id: 3, name: 'ลำคอ', sub: 'คอและคำพูด', blessing: 'ปัดเคราะห์ทางวาจา พูดจาเป็นทรัพย์ แคล้วคลาดปลอดภัย', x: 140, y: 92, nodeR: 13 },
  { id: 4, name: 'ไหล่ขวา', sub: 'บ่าขวา', blessing: 'ปัดภาระหนักอึ้งและความกดดัน ปลดเปลื้องความทุกข์', x: 88, y: 118, nodeR: 14 },
  { id: 5, name: 'ไหล่ซ้าย', sub: 'บ่าซ้าย', blessing: 'ปัดอุปสรรคขวากหนามและศัตรูคู่อริ ให้พ้นไปจากตัว', x: 192, y: 118, nodeR: 14 },
  { id: 6, name: 'หน้าอก', sub: 'ดวงใจ', blessing: 'ปัดความเศร้าหมองและทุกข์ใจ สุขภาพใจเข้มแข็ง', x: 140, y: 148, nodeR: 15 },
  { id: 7, name: 'แขนขวา', sub: 'มือขวา', blessing: 'ปัดอุปสรรคการงาน หยิบจับสิ่งใดขอให้สำเร็จราบรื่น', x: 56, y: 188, nodeR: 14 },
  { id: 8, name: 'แขนซ้าย', sub: 'มือซ้าย', blessing: 'ปัดเคราะห์การสูญเสีย รับโชคลาภเงินทองมั่นคง', x: 224, y: 188, nodeR: 14 },
  { id: 9, name: 'ท้องและเอว', sub: 'ช่องท้อง', blessing: 'ปัดโรคภัยไข้เจ็บ ปัญหาสุขภาพทั้งปวงมลายสิ้น', x: 140, y: 218, nodeR: 15 },
  { id: 10, name: 'ขาขวา', sub: 'ต้นขาขวา', blessing: 'ปัดอุบัติเหตุในการสัญจร ทุกย่างก้าวปลอดภัย', x: 112, y: 295, nodeR: 14 },
  { id: 11, name: 'ขาซ้าย', sub: 'ต้นขาซ้าย', blessing: 'ปัดสะดุดติดขัด ก้าวหน้ามั่นคง ไร้อุปสรรคกีดขวาง', x: 168, y: 295, nodeR: 14 },
  { id: 12, name: 'เท้าขวา', sub: 'ปลายเท้าขวา', blessing: 'ปัดสิ่งชั่วร้ายทั้งปวงลงสู่ธรณี มิให้หวนคืนกลับมา', x: 102, y: 390, nodeR: 14 },
  { id: 13, name: 'เท้าซ้าย', sub: 'ปลายเท้าซ้าย', blessing: 'ปัดเคราะห์สิ้นสุด ครบ 13 เดือนมงคล ร่มเย็นตลอดปี', x: 178, y: 390, nodeR: 14 },
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

  // Modal state: Displays result as a ceremonial popup window overlay instead of bottom text
  const [activeModal, setActiveModal] = useState<'candle' | 'lantern' | 'chong' | null>(null);

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
  const [candleHint, setCandleHint] = useState('แตะค้างที่เทียนหรือปุ่มด้านล่างเพื่อจุดเทียนต่อดวงชะตา');
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

  // Chong state (Interactive 13-Part Talisman Sweeping Ceremony)
  const chongZodiac = userZodiac >= 0 ? userZodiac : 0;
  const chongProblem = 0;
  const [chongSpinning, setChongSpinning] = useState(false);
  const [chongResult, setChongResult] = useState<RemedyResult | null>(null);

  const [sweptParts, setSweptParts] = useState<number[]>([]);
  const [talismanPos, setTalismanPos] = useState<{ x: number; y: number } | null>(null);
  const [isSweepingAnimation, setIsSweepingAnimation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const touchStartY = useRef<number | null>(null);
  const mouseStartY = useRef<number | null>(null);

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

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
    if (sweptParts.length === 13) {
      setSweptParts([]);
      setTalismanPos(null);
    }
  }, [sweptParts.length]);

  // Keyboard accessibility: ESC closes result popup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, handleCloseModal]);

  // Web Audio Ceremonial Sweep Sound Synthesizer
  const playSweepAudio = useCallback((stepCount: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // 1. Paper rustle noise
      const duration = 0.28;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + (stepCount % 4) * 120, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();

      // 2. Auspicious bronze bell chime
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      const freqs = [528, 587, 659, 784, 880];
      const f = freqs[(stepCount - 1) % freqs.length] || 528;
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f * 0.99, ctx.currentTime + 0.65);

      oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.68);

      // If step 13: Temple Gong
      if (stepCount === 13) {
        const gong = ctx.createOscillator();
        const gongGain = ctx.createGain();
        gong.type = 'triangle';
        gong.frequency.setValueAtTime(145, ctx.currentTime);
        gong.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 1.8);
        gongGain.gain.setValueAtTime(0.4, ctx.currentTime);
        gongGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        gong.connect(gongGain);
        gongGain.connect(ctx.destination);
        gong.start();
        gong.stop(ctx.currentTime + 1.85);
      }
    } catch {
      // AudioContext blocked
    }
  }, []);

  // Candle Logic
  const loopCandle = useCallback(() => {
    if (!candleDownRef.current) return;
    const held = performance.now() - candleStartRef.current;
    const level = Math.min(100, held / 40);
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
        setActiveModal('candle'); // Pops up ceremonial result modal
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
    if (candleRafRef.current) cancelAnimationFrame(candleRafRef.current);
    loopCandle();
  };

  const releaseCandle = () => {
    if (!candleDownRef.current) return;
    candleDownRef.current = false;
    if (candleRafRef.current) cancelAnimationFrame(candleRafRef.current);
    if (!candleDoneRef.current) {
      setCandleLevel(0);
      setCandleHint('เทียนดับก่อนเวลา ลองกดค้างให้นานขึ้นอีกนิด (4 วินาที)');
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
      // Brief lift-off pause before opening popup modal
      window.setTimeout(() => {
        setActiveModal('lantern');
      }, 950);
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

  // Chong 13-Part Sweeping Logic
  const handleSweepPart = useCallback(
    (partId: number) => {
      if (chongSpinning) return;
      if (sweptParts.includes(partId)) return;
      const part = BODY_SWEEP_PARTS.find((p) => p.id === partId);
      if (!part) return;

      const next = [...sweptParts, partId];
      setSweptParts(next);

      // Animate Nging-Tee paper talisman to target part
      setTalismanPos({ x: part.x, y: part.y });
      setIsSweepingAnimation(true);
      window.setTimeout(() => setIsSweepingAnimation(false), 450);

      // Sound & Chanting
      if (soundEnabled) {
        playSweepAudio(next.length);
      }

      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(22);
        } catch {
          // ignore
        }
      }

      // Complete all 13 parts!
      if (next.length === 13) {
        onToast('🪓 ปัดเคราะห์ครบ 13 ส่วนแล้ว กำลังน้อมส่งดวงชะตาสู่ไท้ส่วยเอี๊ย...');
        setChongSpinning(true);
        window.setTimeout(() => {
          try {
            const res = bridge.remedy(chongZodiac, chongProblem);
            setChongResult(res);
            setActiveModal('chong');
          } catch {
            onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
          } finally {
            setChongSpinning(false);
          }
        }, 1100);
      } else {
        onToast(`✨ ปัดเคราะห์ส่วนที่ ${partId} (${part.name}) — ${part.blessing}`);
      }
    },
    [bridge, chongProblem, chongSpinning, chongZodiac, onToast, playSweepAudio, soundEnabled, sweptParts]
  );

  // Sweep the next unbrushed part from head to toe
  const handleSweepNext = useCallback(() => {
    const nextUnbrushed = BODY_SWEEP_PARTS.find((p) => !sweptParts.includes(p.id));
    if (nextUnbrushed) {
      handleSweepPart(nextUnbrushed.id);
    }
  }, [handleSweepPart, sweptParts]);

  // Touch Swipe Down Handlers on Human Figure
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 42) {
      touchStartY.current = e.touches[0].clientY;
      handleSweepNext();
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  // Mouse Drag Down Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartY.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartY.current == null) return;
    if (e.buttons === 1) {
      const diff = e.clientY - mouseStartY.current;
      if (diff > 42) {
        mouseStartY.current = e.clientY;
        handleSweepNext();
      }
    }
  };

  const handleMouseUp = () => {
    mouseStartY.current = null;
  };


  const flameScale = (0.3 + (candleLevel / 100) * 0.95).toFixed(3);
  const flameOpacity = candleLevel > 0 ? (0.35 + (candleLevel / 100) * 0.65).toFixed(3) : '0';
  const glowOpacity = (candleLevel / 100).toFixed(3);

  // Determine current part to guide user
  const currentNextPart = BODY_SWEEP_PARTS.find((p) => !sweptParts.includes(p.id)) || null;

  return (
    <section id="tab-ritual" className="ritual-frameless-stage tab" role="tabpanel">
      {/* High-visibility Ceremonial Ritual Tabs */}
      <div className="pills" role="tablist" aria-label="พิธีกรรมสะเดาะเคราะห์">
        <button
          className={`pill ${activeRit === 'candle' ? 'active' : ''}`}
          type="button"
          onClick={() => handleSelectRit('candle')}
          aria-selected={activeRit === 'candle'}
        >
          <span>ต่อดวง</span>
        </button>
        <button
          className={`pill ${activeRit === 'lantern' ? 'active' : ''}`}
          type="button"
          onClick={() => handleSelectRit('lantern')}
          aria-selected={activeRit === 'lantern'}
        >
          <span>ลอยโคม</span>
        </button>
        <button
          className={`pill ${activeRit === 'chong' ? 'active' : ''}`}
          type="button"
          onClick={() => handleSelectRit('chong')}
          aria-selected={activeRit === 'chong'}
        >
          <span>ปีชง</span>
        </button>
      </div>

      {/* 1. จุดเทียนต่อดวง: Candle image is immediately flush under the top buttons */}
      {activeRit === 'candle' && (
        <div id="rit-candle" className="rit">
          <div
            id="candle-wrap"
            className="candle-wrap"
            tabIndex={0}
            role="button"
            aria-label="กดค้างเพื่อจุดเทียนต่อดวง"
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

          <p id="candle-hint" className="center hint" style={{ margin: '0.2rem auto 0.4rem' }}>
            {candleHint}
          </p>

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
        </div>
      )}

      {/* 2. ลอยโคมสะเดาะเคราะห์: Sky & lantern image immediately flush under top buttons */}
      {activeRit === 'lantern' && (
        <div id="rit-lantern" className="rit">
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

            {/* Ceremonial Lantern */}
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
                  <rect x="25" y="8" width="50" height="6" rx="3" fill="url(#goldRim)" />
                  <path
                    d="M26 14 C12 40, 10 95, 28 120 L72 120 C90 95, 88 40, 74 14 Z"
                    fill="url(#lanternGlow)"
                    stroke="rgba(255,215,100,0.85)"
                    strokeWidth="1.5"
                  />
                  <circle cx="50" cy="98" r="14" fill="#fff" opacity="0.8" />
                  <path d="M50 82 C55 92 56 102 50 108 C44 102 45 92 50 82Z" fill="#ffecb3" />
                  <rect x="26" y="118" width="48" height="6" rx="2" fill="url(#goldRim)" />
                  <line x1="50" y1="124" x2="50" y2="138" stroke="#d32f2f" strokeWidth="2.5" />
                  <circle cx="50" cy="138" r="3" fill="#ffb300" />
                </svg>
                <div className="lantern-inner-wish-text">
                  {lanternText.trim() ? lanternText.trim() : 'คำอธิษฐาน'}
                </div>
                <span className="lantern-tap-prompt">✨ แตะที่โคมเพื่อปล่อยลอย</span>
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
          <div className="wish-presets-group" style={{ margin: '0.4rem auto 0.6rem' }}>
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

          <div style={{ maxWidth: '580px', margin: '0 auto' }}>
            <input
              id="lantern-text"
              type="text"
              maxLength={120}
              placeholder="พิมพ์คำอธิษฐานสะเดาะเคราะห์ของคุณ หรือเลือกจากด้านบน..."
              value={lanternText}
              onChange={(e) => setLanternText(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(232, 185, 74, 0.4)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                color: '#fff5db',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div className="row center" style={{ marginTop: '0.6rem' }}>
            <button
              id="btn-lantern"
              className="btn primary glow-gold"
              type="button"
              onClick={handleLaunchLantern}
              disabled={lanternFlying}
            >
              <span>🏮</span>
              <span>{lanternFlying ? 'โคมลอยกำลังนำพาคำอธิษฐานขึ้นสู่ฟากฟ้า...' : 'ปล่อยโคมลอยสะเดาะเคราะห์ขึ้นฟ้า'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ปีชง: Interactive 13-Part Talisman Sweeping Ceremony */}
      {activeRit === 'chong' && (
        <div id="rit-chong" className="rit chong-interactive-stage">
          {/* Progress Bar without instruction text */}
          <div className="chong-sweep-counter-bar">
            <div className="chong-counter-header">
              <span style={{ fontWeight: 600 }}>
                📜 ปัดตัวด้วยกระดาษหงิ่งเตี๋ย ({sweptParts.length}/13)
              </span>
              <button
                type="button"
                className="btn-sound-toggle"
                onClick={() => setSoundEnabled((v) => !v)}
                title={soundEnabled ? 'ปิดเสียงสวดมนต์และกระดิ่ง' : 'เปิดเสียงสวดมนต์และกระดิ่ง'}
                aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
              >
                {soundEnabled ? '🔊 เสียงเปิด' : '🔇 เสียงปิด'}
              </button>
            </div>
            <div className="chong-progress-track">
              <div
                className="chong-progress-fill"
                style={{ width: `${(sweptParts.length / 13) * 100}%` }}
              />
            </div>
          </div>

          {/* Interactive Humanoid Figure (SVG 280x430) with 13 Clickable / Sweeping Zones */}
          <div
            className="chong-figure-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            title="ใช้นิ้วหรือเมาส์คลิกปุ่มทั้ง 13 ส่วน หรือปัดลงเพื่อปัดตัวสะเดาะเคราะห์"
          >
            <svg
              viewBox="0 0 280 430"
              className="chong-human-svg"
              aria-label="หุ่นจำลองร่างกายมนุษย์สำหรับพิธีปัดตัวสะเดาะเคราะห์ 13 ส่วน"
            >
              <defs>
                <radialGradient id="bodyAura" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#ffb300" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#d4af37" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 223, 128, 0.28)" />
                  <stop offset="50%" stopColor="rgba(212, 175, 55, 0.2)" />
                  <stop offset="100%" stopColor="rgba(180, 140, 40, 0.28)" />
                </linearGradient>
              </defs>

              {/* Background Sacred Aura */}
              <circle cx="140" cy="215" r="170" fill="url(#bodyAura)" />

              {/* Sacred Lotus Petal Base at Feet */}
              <ellipse cx="140" cy="414" rx="85" ry="12" fill="rgba(212, 175, 55, 0.22)" stroke="#d4af37" strokeWidth="1.2" />
              <path
                d="M80 414 C110 406, 140 404, 140 404 C140 404, 170 406, 200 414 C170 422, 140 424, 140 424 C140 424, 110 422, 80 414 Z"
                fill="rgba(255, 215, 0, 0.18)"
              />

              {/* Serene Humanoid Silhouette */}
              {/* Head */}
              <ellipse cx="140" cy="46" rx="20" ry="24" fill="url(#bodyGrad)" stroke="#ffd700" strokeWidth="1.6" />
              {/* Torso & Core */}
              <path
                d="M120 70 C100 80, 75 100, 75 125 C75 145, 90 170, 95 195 C98 215, 105 240, 105 270 L100 375 C98 395, 105 405, 120 405 C130 405, 132 390, 134 350 L136 265 L140 250 L144 265 L146 350 C148 390, 150 405, 160 405 C175 405, 182 395, 180 375 L175 270 C175 240, 182 215, 185 195 C190 170, 205 145, 205 125 C205 100, 180 80, 160 70 Z"
                fill="url(#bodyGrad)"
                stroke="#ffd700"
                strokeWidth="1.8"
              />
              {/* Arms in gentle blessing posture */}
              <path
                d="M75 125 C60 145, 45 175, 52 215 C55 228, 65 228, 68 215 C66 185, 78 155, 88 135 Z"
                fill="url(#bodyGrad)"
                stroke="rgba(255, 215, 0, 0.65)"
                strokeWidth="1.4"
              />
              <path
                d="M205 125 C220 145, 235 175, 228 215 C225 228, 215 228, 212 215 C214 185, 202 155, 192 135 Z"
                fill="url(#bodyGrad)"
                stroke="rgba(255, 215, 0, 0.65)"
                strokeWidth="1.4"
              />

              {/* Central Energy Meridian (เส้นลมปราณแกนกลาง จากหัวจรดเท้า) */}
              <line x1="140" y1="46" x2="140" y2="405" stroke="rgba(255, 215, 0, 0.4)" strokeDasharray="3 3" strokeWidth="1.5" />

              {/* 13 Interactive Clickable/Sweeping Body Nodes */}
              {BODY_SWEEP_PARTS.map((part) => {
                const isSwept = sweptParts.includes(part.id);
                const isCurrent = currentNextPart?.id === part.id;

                return (
                  <g
                    key={part.id}
                    className={`body-node-group ${isSwept ? 'body-node-swept' : ''} ${isCurrent ? 'body-node-current' : ''}`}
                    onClick={() => handleSweepPart(part.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`ส่วนที่ ${part.id}: ${part.name} ${isSwept ? '(ปัดแล้ว)' : '(ยังไม่ได้ปัด)'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSweepPart(part.id);
                      }
                    }}
                  >
                    {/* Pulsing indicator if this is the next recommended part to brush */}
                    {isCurrent && (
                      <circle
                        cx={part.x}
                        cy={part.y}
                        r={part.nodeR + 6}
                        fill="none"
                        stroke="#ffd700"
                        strokeWidth="1.8"
                        opacity="0.8"
                        strokeDasharray="4 3"
                        className="pulse-guide-ring"
                      />
                    )}

                    {/* Node Background Circle */}
                    <circle
                      cx={part.x}
                      cy={part.y}
                      r={part.nodeR}
                      className="body-node-bg"
                      fill={isSwept ? '#2e7d32' : isCurrent ? 'rgba(212, 175, 55, 0.95)' : 'rgba(40, 20, 24, 0.85)'}
                      stroke={isSwept ? '#76ff03' : isCurrent ? '#fff176' : 'rgba(232, 185, 74, 0.6)'}
                      strokeWidth={isCurrent ? 2.4 : 1.5}
                    />

                    {/* Node Text: Checkmark if swept, or number 1..13 */}
                    <text
                      x={part.x}
                      y={part.y + 4.5}
                      textAnchor="middle"
                      fill={isSwept ? '#ffffff' : isCurrent ? '#2a1a00' : '#ffd700'}
                      fontSize={isSwept ? '12px' : '10.5px'}
                      fontWeight="bold"
                    >
                      {isSwept ? '✓' : part.id}
                    </text>

                    {/* Part Name Tag (Placed neatly beside or above node) */}
                    <text
                      x={part.x > 140 ? part.x + part.nodeR + 6 : part.x < 140 ? part.x - part.nodeR - 6 : part.x}
                      y={part.x === 140 ? part.y - part.nodeR - 3 : part.y + 4}
                      textAnchor={part.x > 140 ? 'start' : part.x < 140 ? 'end' : 'middle'}
                      fill={isSwept ? '#a5d6a7' : isCurrent ? '#fff59d' : 'rgba(255, 235, 179, 0.75)'}
                      fontSize="9.5px"
                      fontWeight={isCurrent ? 'bold' : 'normal'}
                      pointerEvents="none"
                    >
                      {part.name}
                    </text>
                  </g>
                );
              })}

              {/* Animated Floating Nging-Tee Paper Talisman (กระดาษหงิ่งเตี๋ย) */}
              <g
                id="nging-tee-talisman"
                transform={
                  talismanPos
                    ? `translate(${talismanPos.x + 12}, ${talismanPos.y - 18})`
                    : currentNextPart
                    ? `translate(${currentNextPart.x + 16}, ${currentNextPart.y - 18})`
                    : 'translate(195, 30)'
                }
                className={`nging-tee-paper-group ${isSweepingAnimation ? 'chong-talisman-flutter' : ''}`}
                pointerEvents="none"
              >
                {/* Gold foil paper with red traditional border */}
                <rect x="0" y="0" width="44" height="60" rx="3" fill="#d4af37" stroke="#b71c1c" strokeWidth="2" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))" />
                <rect x="3" y="3" width="38" height="54" rx="2" fill="#ffd700" stroke="#c62828" strokeWidth="1" strokeDasharray="3 2" />
                {/* Traditional Chinese Talisman Character (太歲 / 福) */}
                <text x="22" y="24" textAnchor="middle" fill="#b71c1c" fontSize="13px" fontWeight="bold">
                  太
                </text>
                <text x="22" y="40" textAnchor="middle" fill="#b71c1c" fontSize="13px" fontWeight="bold">
                  歲
                </text>
                <text x="22" y="52" textAnchor="middle" fill="#8d1313" fontSize="8px">
                  平安
                </text>
              </g>
            </svg>
          </div>

        </div>
      )}

      {/* Ceremonial Result Popup Modal Overlay (หน้าต่างซ้อนป๊อปอัปผลลัพธ์พิธีกรรม) */}
      {activeModal && (
        <div
          className="ritual-modal-overlay"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label="ผลพิธีกรรมสะเดาะเคราะห์"
        >
          <div className="ritual-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="ritual-modal-close-btn"
              onClick={handleCloseModal}
              aria-label="ปิดหน้าต่าง"
            >
              ✕
            </button>

            {/* Candle Result Modal */}
            {activeModal === 'candle' && candleResult && (
              <div className="ritual-modal-inner">
                <div className="ritual-modal-header">
                  <span className="ritual-modal-emblem" aria-hidden="true">🕯️</span>
                  <div>
                    <h3 className="ritual-modal-title">เทียนต่อดวงชะตาสว่างแล้ว</h3>
                    <p className="ritual-modal-sub">แสงประทีปส่องสว่างคุ้มครองดวงชะตาให้รุ่งโรจน์</p>
                  </div>
                </div>

                <div className="ritual-modal-body">
                  <div className="ritual-verse-box">
                    <p className="ritual-verse-text">{candleResult.dedication}</p>
                  </div>

                  <div className="ritual-mantras-list">
                    <div className="ritual-section-heading">บทสวดแผ่เมตตาและขอพร:</div>
                    {candleResult.mantra.map((m, i) => (
                      <div key={i} className="ritual-mantra-item">
                        {m}
                      </div>
                    ))}
                  </div>

                  <p className="center ritual-disclaimer">
                    เพื่อความสบายใจและเป็นสิริมงคล เป็นความเชื่อเชิงวัฒนธรรม
                  </p>
                </div>

                <div className="ritual-modal-footer">
                  <button
                    type="button"
                    className="btn primary glow-gold full-width"
                    onClick={handleCloseModal}
                  >
                    <span>🙏 สาธุ / น้อมรับพรมงคล</span>
                  </button>
                </div>
              </div>
            )}

            {/* Lantern Result Modal */}
            {activeModal === 'lantern' && lanternResult && (
              <div className="ritual-modal-inner">
                {lanternResult.care ? (
                  <>
                    <div className="ritual-modal-header care-header">
                      <span className="ritual-modal-emblem" aria-hidden="true">🕊️</span>
                      <div>
                        <h3 className="ritual-modal-title">มีคนพร้อมรับฟังคุณเสมอ</h3>
                        <p className="ritual-modal-sub">ขอให้ใจเย็นลงและก้าวผ่านช่วงเวลานี้ไปได้อย่างปลอดภัย</p>
                      </div>
                    </div>
                    <div className="ritual-modal-body">
                      <p className="ritual-verse-text" style={{ color: '#ffd59e', textAlign: 'left', lineHeight: 1.6 }}>
                        {lanternResult.message}
                      </p>
                      <div style={{ marginTop: '0.8rem' }}>
                        <a className="btn primary full-width" href="tel:1323" style={{ textAlign: 'center', display: 'block' }}>
                          📞 โทร 1323 สายด่วนสุขภาพจิต (โทรฟรี 24 ชม.)
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ritual-modal-header">
                      <span className="ritual-modal-emblem" aria-hidden="true">🏮</span>
                      <div>
                        <h3 className="ritual-modal-title">โคมลอยขึ้นสู่ฟากฟ้าสำเร็จแล้ว</h3>
                        <p className="ritual-modal-sub">
                          ปัดเป่าเคราะห์ภัย นำพาคำอธิษฐานสู่สิ่งศักดิ์สิทธิ์
                        </p>
                      </div>
                    </div>

                    <div className="ritual-modal-body">
                      <div style={{ textAlign: 'center', margin: '0.2rem 0' }}>
                        <span style={{ fontSize: '0.85rem', color: '#e8c99b', marginRight: '0.5rem' }}>เรื่องที่สะเดาะเคราะห์:</span>
                        <span className="badge lv1">{lanternResult.category}</span>
                      </div>

                      <div className="ritual-verse-box">
                        <p className="ritual-verse-text">{lanternResult.message}</p>
                      </div>

                      <div className="ritual-meta-grid">
                        <div className="ritual-meta-item">
                          <span className="meta-k">คะแนนบุญสะสม</span>
                          <span className="gold-text">+{lanternResult.merit} แต้ม</span>
                        </div>
                        <div className="ritual-meta-item">
                          <span className="meta-k">สีมงคลเสริมโชค</span>
                          <span className="badge lv1">{lanternResult.color}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="ritual-modal-footer">
                  <button
                    type="button"
                    className="btn primary glow-gold full-width"
                    onClick={handleCloseModal}
                  >
                    <span>🙏 สาธุ / น้อมรับพรมงคล</span>
                  </button>
                </div>
              </div>
            )}

            {/* Chong Result Modal (No lucky numbers as requested) */}
            {activeModal === 'chong' && chongResult && (
              <div className="ritual-modal-inner">
                <div className="ritual-modal-header">
                  <span className="ritual-modal-emblem" aria-hidden="true">☯️</span>
                  <div>
                    <h3 className="ritual-modal-title">พิธีปัดตัวแก้ปีชงสำเร็จแล้ว</h3>
                    <p className="ritual-modal-sub">
                      ปัดเป่าเคราะห์ด้วยกระดาษหงิ่งเตี๋ยครบ 13 ส่วน สู่เทพเจ้าไท้ส่วยเอี๊ย
                    </p>
                  </div>
                </div>

                <div className="ritual-modal-body">
                  <div className="ritual-chong-severity-row">
                    <span style={{ fontSize: '0.85rem', color: '#f7e2bd' }}>
                      นักษัตร{chongResult.zodiac_name} × ปี{chongResult.year_name} ({chongResult.year}):
                    </span>
                    <span className={`badge lv${chongResult.severity}`}>{chongResult.relation_name}</span>
                    <div
                      className={`sev s${chongResult.severity}`}
                      aria-label={`ระดับ ${chongResult.severity} จาก 3`}
                    >
                      {[0, 1, 2].map((i) => (
                        <i key={i} className={i < chongResult.severity ? 'on' : ''} />
                      ))}
                    </div>
                  </div>

                  <p className="ritual-chong-summary">{chongResult.summary}</p>

                  <dl className="kv ritual-chong-kv">
                    <dt>ด้าน{chongResult.problem}</dt>
                    <dd>{chongResult.practical}</dd>
                    <dt>วิธีเสริมสิริมงคล</dt>
                    <dd>{chongResult.merit}</dd>
                    <dt>สีนำโชค</dt>
                    <dd>{chongResult.color}</dd>
                    <dt>ทิศมงคล</dt>
                    <dd>{chongResult.direction}</dd>
                  </dl>

                  <div className="ritual-mantras-list">
                    <div className="ritual-section-heading">พระคาถาบูชาไท้ส่วยเอี๊ยคุ้มครองดวงชะตา:</div>
                    {chongResult.mantra.map((m, i) => (
                      <div key={i} className="ritual-mantra-item">
                        {m}
                      </div>
                    ))}
                  </div>

                  <p className="center ritual-disclaimer">
                    เป็นความเชื่อเชิงวัฒนธรรมเพื่อความสบายใจและเป็นกำลังใจในการดำเนินชีวิต
                  </p>
                </div>

                <div className="ritual-modal-footer">
                  <button
                    type="button"
                    className="btn primary glow-gold full-width"
                    onClick={handleCloseModal}
                  >
                    <span>🙏 สาธุ / น้อมรับพรมงคล</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
