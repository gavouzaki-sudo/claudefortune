import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface FireworksHandle {
  launch: (bursts?: number) => void;
}

export const Fireworks = forwardRef<FireworksHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fwRunningRef = useRef(false);

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
      ctx.scale(dpr, dpr);
    }

    const cs = getComputedStyle(document.body);
    const colors = [
      cs.getPropertyValue('--gold'),
      cs.getPropertyValue('--red'),
      cs.getPropertyValue('--glow'),
      '#ffffff',
    ].map((c) => c.trim() || '#ffd24a');

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      col: string;
    }

    const parts: Particle[] = [];
    const burst = () => {
      const cx = window.innerWidth * (0.15 + Math.random() * 0.7);
      const cy = window.innerHeight * (0.15 + Math.random() * 0.4);
      const col = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 70; i++) {
        const a = (i / 70) * Math.PI * 2;
        const v = 1.5 + Math.random() * 3.2;
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1,
          col,
        });
      }
    };

    for (let i = 0; i < bursts; i++) {
      setTimeout(burst, i * 380);
    }

    if (fwRunningRef.current) return;
    fwRunningRef.current = true;
    const t0 = performance.now();

    const frame = (t: number) => {
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
      if (parts.length || t - t0 < bursts * 380 + 200) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        fwRunningRef.current = false;
      }
    };

    requestAnimationFrame(frame);
  };

  useImperativeHandle(ref, () => ({
    launch,
  }));

  useEffect(() => {
    const handleResize = () => {
      const cv = canvasRef.current;
      if (!cv || fwRunningRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      const ctx = cv.getContext('2d');
      ctx?.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas id="fireworks" ref={canvasRef} className="fireworks" aria-hidden="true" />;
});
