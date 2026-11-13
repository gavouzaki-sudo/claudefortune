import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { getRandomArrayItem } from '../utils/formatters';

export interface FireworksHandle {
  launch: (bursts?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  col: string;
}

export const Fireworks = forwardRef<FireworksHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fwRunningRef = useRef(false);
  const isMountedRef = useRef(true);
  const partsRef = useRef<Particle[]>([]);
  const endTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const [isActive, setIsActive] = useState(false);

  const launch = (bursts = 7) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const cv = canvasRef.current;
    if (!cv) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    if (!fwRunningRef.current) {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setIsActive(true);
    }

    const cs = getComputedStyle(document.body);
    const colors = [
      cs.getPropertyValue('--gold'),
      cs.getPropertyValue('--red'),
      cs.getPropertyValue('--glow'),
      '#ffffff',
    ].map((c) => c.trim() || '#ffd24a');

    const burst = () => {
      if (!isMountedRef.current) return;
      const cx = window.innerWidth * (0.15 + Math.random() * 0.7);
      const cy = window.innerHeight * (0.15 + Math.random() * 0.4);
      const col = getRandomArrayItem(colors, colors[0]);
      for (let i = 0; i < 70; i++) {
        const a = (i / 70) * Math.PI * 2;
        const v = 1.5 + Math.random() * 3.2;
        partsRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1,
          col,
        });
      }
    };

    const now = performance.now();
    endTimeRef.current = Math.max(endTimeRef.current, now + bursts * 380 + 200);

    for (let i = 0; i < bursts; i++) {
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter((t) => t !== id);
        burst();
      }, i * 380);
      timersRef.current.push(id);
    }

    if (fwRunningRef.current) return;
    fwRunningRef.current = true;

    const frame = (t: number) => {
      if (!isMountedRef.current) return;
      const parts = partsRef.current;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035;
        p.vx *= 0.99;
        p.life -= 0.013;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (parts.length || t < endTimeRef.current) {
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        fwRunningRef.current = false;
        rafIdRef.current = null;
        if (isMountedRef.current) {
          setIsActive(false);
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(frame);
  };

  useImperativeHandle(ref, () => ({
    launch,
  }));

  useEffect(() => {
    isMountedRef.current = true;
    const handleResize = () => {
      const cv = canvasRef.current;
      if (!cv || fwRunningRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      const ctx = cv.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      partsRef.current = [];
      fwRunningRef.current = false;
    };
  }, []);

  return (
    <canvas
      id="fireworks"
      ref={canvasRef}
      className={`fireworks ${isActive ? 'is-active' : ''}`}
      aria-hidden="true"
    />
  );
});
