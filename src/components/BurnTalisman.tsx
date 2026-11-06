import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BurnTalismanProps {
  burnLevel: number; // 0, 1, 2, 3
  luckyNumber: string;
  category: 0 | 1; // 0 = 2 digits, 1 = 3 digits
  isBurning: boolean;
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  drift: number;
  stickIndex: number;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  wobble: number;
}

export const BurnTalisman: React.FC<BurnTalismanProps> = ({
  burnLevel,
  luckyNumber,
  category,
  isBurning,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth interpolated values for physics & visuals
  const smoothBurnRef = useRef<number>(burnLevel);
  const smoothIncenseRef = useRef<number>(burnLevel);
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);
  const emberParticlesRef = useRef<EmberParticle[]>([]);
  const flameTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Screen size indicator for responsive rendering (reduced by 50%)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 480,
    height: 130,
  });

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(300, Math.floor(rect.width));
      // Adaptive height: 50% reduced (~116px on small mobile, ~138px on desktop)
      const h = w < 420 ? 116 : w < 600 ? 128 : 138;
      setDimensions({ width: w, height: h });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Spawn ignition fire burst when winning a round
  const spawnFireBurst = useCallback((cx: number, cy: number, count = 45) => {
    const embers = emberParticlesRef.current;
    const colors = ['#ffffff', '#fff3b0', '#ffc107', '#ff9800', '#ff3d00'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 4.2;
      embers.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        size: 1.5 + Math.random() * 2.8,
        alpha: 1,
        maxLife: 35 + Math.random() * 30,
        life: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        wobble: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  // Trigger burst when isBurning changes to true
  useEffect(() => {
    if (isBurning) {
      const w = dimensions.width;
      const h = dimensions.height;
      spawnFireBurst(w * 0.62, h * 0.5, 60);
    }
  }, [isBurning, dimensions, spawnFireBurst]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(dimensions.width * dpr);
    canvas.height = Math.floor(dimensions.height * dpr);

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const w = dimensions.width;
      const h = dimensions.height;

      // Scale context for Retina displays
      ctx.save();
      ctx.scale(dpr, dpr);

      // Smooth interpolation towards target burn level
      smoothBurnRef.current += (burnLevel - smoothBurnRef.current) * 0.055;
      smoothIncenseRef.current += (burnLevel - smoothIncenseRef.current) * 0.045;
      flameTimeRef.current += 0.06;
      const ft = flameTimeRef.current;
      const curBurn = smoothBurnRef.current;
      const curIncense = smoothIncenseRef.current;

      // -------------------------------------------------------------
      // 1. DRAW BACKGROUND & SACRED ALTAR ENVIRONMENT
      // -------------------------------------------------------------
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0c0608');
      bgGrad.addColorStop(0.5, '#160a0c');
      bgGrad.addColorStop(1, '#0e0507');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle warm ambient radial glow behind the talisman
      const talisCx = Math.floor(w * 0.63);
      const talisCy = Math.floor(h * 0.52);
      const glowR = Math.floor(Math.min(w, h) * 0.55);
      const ambGlow = ctx.createRadialGradient(talisCx, talisCy, 10, talisCx, talisCy, glowR);
      const glowAlpha = curBurn >= 3 ? 0.35 : curBurn >= 2 ? 0.22 : curBurn >= 1 ? 0.14 : 0.08;
      ambGlow.addColorStop(0, `rgba(255, 120, 20, ${glowAlpha})`);
      ambGlow.addColorStop(0.5, `rgba(200, 40, 10, ${glowAlpha * 0.5})`);
      ambGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambGlow;
      ctx.fillRect(0, 0, w, h);

      // Ornate Sacred Altar Bottom Trim (Wood & Gold Inlay)
      const altarY = h - 9;
      ctx.fillStyle = '#1a0d0a';
      ctx.fillRect(0, altarY, w, 9);

      ctx.fillStyle = 'rgba(232, 185, 74, 0.45)';
      ctx.fillRect(0, altarY, w, 1.2);

      // -------------------------------------------------------------
      // 2. DRAW BRASS INCENSE CENSER & 3 BURNING INCENSE STICKS
      // -------------------------------------------------------------
      // Censer position (Left side of altar)
      const censerX = Math.floor(w * (w < 440 ? 0.17 : 0.20));
      const censerY = altarY - 1;

      // Stick configuration
      const stickAngles = [-0.1, 0, 0.1]; // slight fan angles in radians
      const fullStickLen = w < 440 ? 35 : 42;
      // Burning down calculation: 0 = 100%, 1 = 68%, 2 = 36%, 3 = 8%
      const stickRatio = Math.max(0.08, 1 - (curIncense / 3) * 0.92);
      const curStickLen = fullStickLen * stickRatio;

      // Draw each incense stick
      stickAngles.forEach((ang, sIdx) => {
        const baseX = censerX + (sIdx - 1) * 6;
        const baseY = censerY - 8;

        const tipX = baseX + Math.sin(ang) * curStickLen;
        const tipY = baseY - Math.cos(ang) * curStickLen;

        // Stick stem (Dark incense vermilion)
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(tipX, tipY);
        ctx.strokeStyle = '#8a2323';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glowing burning ember tip at the top
        const flicker = Math.sin(ft * 4 + sIdx * 1.5) * 0.3 + 0.7;
        const emberRad = (curBurn >= 3 ? 1.5 : 2.2) * flicker;

        const tipGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, emberRad * 3.5);
        tipGrad.addColorStop(0, '#ffffff');
        tipGrad.addColorStop(0.2, '#ffe082');
        tipGrad.addColorStop(0.5, '#ff5722');
        tipGrad.addColorStop(1, 'rgba(255, 87, 34, 0)');

        ctx.fillStyle = tipGrad;
        ctx.beginPath();
        ctx.arc(tipX, tipY, emberRad * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Solid hot core
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 1.0, 0, Math.PI * 2);
        ctx.fill();

        // Spawn smoke particles continuously from glowing tip
        if (Math.random() < 0.6) {
          smokeParticlesRef.current.push({
            x: tipX + (Math.random() - 0.5) * 2,
            y: tipY,
            vx: (Math.random() - 0.5) * 0.2,
            vy: -0.45 - Math.random() * 0.45,
            size: 1.8 + Math.random() * 1.6,
            alpha: 0.35 + Math.random() * 0.2,
            maxLife: 55 + Math.random() * 35,
            life: 0,
            drift: Math.random() * Math.PI * 2,
            stickIndex: sIdx,
          });
        }
      });

      // Draw Brass Incense Censer Bowl (กระถางธูปทองเหลือง)
      const bowlW = w < 440 ? 26 : 32;
      const bowlH = 12;

      // Censer Body Gradient
      const censerGrad = ctx.createLinearGradient(censerX - bowlW / 2, censerY, censerX + bowlW / 2, censerY);
      censerGrad.addColorStop(0, '#5a3d1b');
      censerGrad.addColorStop(0.3, '#d4af37');
      censerGrad.addColorStop(0.7, '#f6d365');
      censerGrad.addColorStop(1, '#4a3216');

      ctx.fillStyle = censerGrad;
      ctx.beginPath();
      ctx.ellipse(censerX, censerY - bowlH / 2, bowlW / 2, bowlH / 2, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#e8b94a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Censer Ash Bed (Rim top)
      ctx.fillStyle = '#423c3a';
      ctx.beginPath();
      ctx.ellipse(censerX, censerY - bowlH + 2, bowlW / 2 - 2, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Censer Stand Feet
      ctx.fillStyle = '#b38f2a';
      ctx.fillRect(censerX - bowlW / 2 + 3, censerY - 1, 4, 3);
      ctx.fillRect(censerX + bowlW / 2 - 7, censerY - 1, 4, 3);

      // Censer text label
      ctx.font = '7px sans-serif';
      ctx.fillStyle = 'rgba(232, 185, 74, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('ธูปนำโชค', censerX, censerY + 7);

      // -------------------------------------------------------------
      // 3. DRAW RISING INCENSE SMOKE (ควันธูปพริ้วไหว)
      // -------------------------------------------------------------
      const smokeList = smokeParticlesRef.current;
      for (let i = smokeList.length - 1; i >= 0; i--) {
        const p = smokeList[i];
        p.life++;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.life * 0.04 + p.drift) * 0.45;
        p.size += 0.16;

        const progress = p.life / p.maxLife;
        if (progress >= 1 || p.y < 0) {
          smokeList.splice(i, 1);
          continue;
        }

        // Smooth fade in & fade out
        const curAlpha = Math.sin(progress * Math.PI) * p.alpha;

        const smokeGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        smokeGrad.addColorStop(0, `rgba(245, 235, 220, ${curAlpha})`);
        smokeGrad.addColorStop(0.5, `rgba(200, 190, 180, ${curAlpha * 0.5})`);
        smokeGrad.addColorStop(1, 'rgba(180, 170, 160, 0)');

        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 4. DRAW SACRED TALISMAN & BURNING FIRE (ยันต์ไฟเบิกโชค)
      // -------------------------------------------------------------
      // Talisman Dimensions (Reduced 50% in height)
      const talisW = Math.min(145, Math.floor(w * 0.42));
      const talisH = Math.min(94, Math.floor(h * 0.82));
      const talisLeft = talisCx - talisW / 2;
      const talisTop = talisCy - talisH / 2;

      // 4A. REVEALED CHAMBER UNDERNEATH (Always present behind paper)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(talisLeft, talisTop, talisW, talisH, 7);
      ctx.clip();

      // Dark sacred shrine chamber background
      const chamGrad = ctx.createRadialGradient(talisCx, talisCy, 6, talisCx, talisCy, talisW);
      chamGrad.addColorStop(0, '#2e0a0a');
      chamGrad.addColorStop(0.7, '#140506');
      chamGrad.addColorStop(1, '#080203');
      ctx.fillStyle = chamGrad;
      ctx.fillRect(talisLeft, talisTop, talisW, talisH);

      // Gold halo glow ring
      const haloPulse = Math.sin(ft * 2) * 3;
      const haloGrad = ctx.createRadialGradient(talisCx, talisCy, 10, talisCx, talisCy, talisW * 0.5 + haloPulse);
      haloGrad.addColorStop(0, curBurn >= 3 ? 'rgba(255, 215, 0, 0.45)' : 'rgba(255, 100, 20, 0.25)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(talisCx, talisCy, talisW * 0.5 + haloPulse, 0, Math.PI * 2);
      ctx.fill();

      // Badge title
      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = curBurn >= 3 ? '#ffe57f' : '#ffab91';
      ctx.textAlign = 'center';
      ctx.fillText(
        category === 0 ? '✦ เลขท้าย 2 ตัวมงคล ✦' : '✦ เลขท้าย 3 ตัวมงคล ✦',
        talisCx,
        talisTop + 13
      );

      // Render the Digits
      const digits = Array.from(luckyNumber || (category === 0 ? '89' : '889'));
      const digitSpacing = talisW / (digits.length + 1);

      digits.forEach((digit, idx) => {
        const dx = talisLeft + digitSpacing * (idx + 1);
        const dy = talisCy + 4;

        if (curBurn >= 2.9) {
          // Fully Revealed: Glowing Gold Calligraphy
          ctx.font = 'bold 24px "Cinzel", "Noto Serif Thai", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Outer Gold Glow
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(digit, dx, dy);

          // Core Gold Calligraphy
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffea00';
          ctx.fillText(digit, dx, dy);
        } else if (curBurn >= 1.8) {
          // Smoke Haze Obscured: Mysterious silhouette
          ctx.font = 'bold 22px "Cinzel", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255, 140, 50, 0.45)';
          ctx.filter = 'blur(3px)';
          ctx.fillText(digit, dx, dy);
          ctx.filter = 'none';

          // Smoke particles over numbers
          ctx.fillStyle = 'rgba(255, 180, 80, 0.7)';
          ctx.font = 'bold 18px serif';
          ctx.fillText('?', dx, dy);
        } else {
          // Round 0 & 1: Completely Hidden Question Marks
          ctx.font = 'bold 20px "Cinzel", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = curBurn >= 0.8 ? 'rgba(255, 100, 30, 0.35)' : 'rgba(255, 255, 255, 0.15)';
          ctx.fillText('?', dx, dy);
        }
      });

      // Bottom seal/message
      if (curBurn >= 2.9) {
        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#ffea00';
        ctx.shadowColor = '#ff9800';
        ctx.shadowBlur = 5;
        ctx.fillText('✦ มงคลฤกษ์โชคลาภพูนทวี ✦', talisCx, talisTop + talisH - 8);
        ctx.shadowBlur = 0;
      } else if (curBurn >= 1.8) {
        ctx.font = '7.5px sans-serif';
        ctx.fillStyle = '#ffb74d';
        ctx.fillText('🔥 ควันเพลิงบดบัง... ชนะอีก 1 ตา!', talisCx, talisTop + talisH - 8);
      } else {
        ctx.font = '7.5px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(
          curBurn >= 0.8 ? '🔥 เพลิงเริ่มลาม... ชนะอีก 2 ตา' : 'ชนะมินิเกมด้านล่างเพื่อจุดไฟ',
          talisCx,
          talisTop + talisH - 8
        );
      }

      ctx.restore(); // restore clip of revealed layer

      // 4B. THE PARCHMENT TALISMAN & ORGANIC BURN EDGE
      // If talisman is not yet 100% burned, render the paper and fire line!
      if (curBurn < 2.98) {
        ctx.save();

        // Calculate burning progression ratio (0.0 to 1.0)
        const burnRatio = Math.min(1, Math.max(0, curBurn / 3));

        // Create clipping region for the UNBURNED portion of paper
        // Burn proceeds from bottom upward with organic jagged edge
        const burnFrontY = talisTop + talisH * (1 - burnRatio);

        ctx.beginPath();
        ctx.moveTo(talisLeft, talisTop);
        ctx.lineTo(talisLeft + talisW, talisTop);
        ctx.lineTo(talisLeft + talisW, burnFrontY);

        // Organic jagged burn boundary across the width
        const steps = 24;
        const stepW = talisW / steps;
        for (let i = steps; i >= 0; i--) {
          const px = talisLeft + i * stepW;
          // Organic noise offset
          const noise =
            Math.sin(i * 0.6 + ft * 3) * 5 +
            Math.cos(i * 1.4 - ft * 2) * 3 +
            (burnRatio > 0.05 ? Math.sin(i * 2.5 + ft * 4) * 4 : 0);
          const py = Math.min(talisTop + talisH, burnFrontY + noise);
          ctx.lineTo(px, py);
        }
        ctx.lineTo(talisLeft, burnFrontY);
        ctx.closePath();
        ctx.clip();

        // 1. Ancient Yellow Parchment Background
        const paperGrad = ctx.createLinearGradient(talisLeft, talisTop, talisLeft, talisTop + talisH);
        paperGrad.addColorStop(0, '#f2d488');
        paperGrad.addColorStop(0.5, '#e8be66');
        paperGrad.addColorStop(1, '#caa34d');
        ctx.fillStyle = paperGrad;
        ctx.fill();

        // Parchment border lines
        ctx.strokeStyle = '#8b1e16';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(talisLeft + 3, talisTop + 3, talisW - 6, talisH - 6);
        ctx.strokeStyle = 'rgba(139, 30, 22, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(talisLeft + 5, talisTop + 5, talisW - 10, talisH - 10);

        // 2. Ancient Cinnabar Inscriptions (หมึกชาดจีนโบราณ)
        ctx.fillStyle = '#8b1e16';
        ctx.textAlign = 'center';

        // Dragon Seal Header (敕令)
        ctx.font = 'bold 11px "Noto Serif Thai", serif';
        ctx.fillText('敕令', talisCx, talisTop + 16);

        // Talisman Thai Sub-Seal
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = '#6d1811';
        ctx.fillText('ยันต์ไฟเบิกโชค', talisCx, talisTop + 25);

        // Mystical Bagua / Wealth Diagram
        const baguaCy = talisTop + 51;
        ctx.strokeStyle = '#8b1e16';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(talisCx, baguaCy, 15, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(talisCx, baguaCy, 11, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139, 30, 22, 0.6)';
        ctx.setLineDash([2, 1.5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Central Seal (招財進寶)
        ctx.font = 'bold 9px serif';
        ctx.fillStyle = '#8b1e16';
        ctx.fillText('招財', talisCx, baguaCy + 3.5);

        // Charred scorched shadow just inside the burn front
        if (burnRatio > 0.05) {
          const charGrad = ctx.createLinearGradient(0, burnFrontY - 22, 0, burnFrontY + 8);
          charGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          charGrad.addColorStop(0.6, 'rgba(40, 10, 5, 0.6)');
          charGrad.addColorStop(1, 'rgba(15, 3, 2, 0.95)');
          ctx.fillStyle = charGrad;
          ctx.fillRect(talisLeft, burnFrontY - 22, talisW, 30);
        }

        ctx.restore(); // restore clipping of paper

        // 3. FIERY GLOWING BURN PERIMETER & DANCING FLAMES (Draw on top of edge)
        if (burnRatio > 0.03) {
          ctx.save();
          // Draw blazing ember boundary line
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const px = talisLeft + i * stepW;
            const noise =
              Math.sin(i * 0.6 + ft * 3) * 5 +
              Math.cos(i * 1.4 - ft * 2) * 3 +
              Math.sin(i * 2.5 + ft * 4) * 4;
            const py = burnFrontY + noise;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);

            // Spawn floating ember particles along this active fire edge
            if (Math.random() < (isBurning ? 0.45 : 0.18)) {
              emberParticlesRef.current.push({
                x: px + (Math.random() - 0.5) * 6,
                y: py + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 0.9,
                vy: -1.2 - Math.random() * 2.2,
                size: 1.2 + Math.random() * 2.2,
                alpha: 1,
                maxLife: 30 + Math.random() * 25,
                life: 0,
                color: Math.random() > 0.4 ? '#ffb300' : '#ff3d00',
                wobble: Math.random() * Math.PI * 2,
              });
            }
          }

          // Intense glowing outline
          ctx.strokeStyle = '#ff3d00';
          ctx.lineWidth = 4.5;
          ctx.shadowColor = '#ff6d00';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // White-hot inner core
          ctx.strokeStyle = '#ffea00';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 6;
          ctx.stroke();

          ctx.restore();
        }
      }

      // Outer Frame border of the whole talisman chamber
      ctx.strokeStyle = curBurn >= 3 ? '#ffd700' : 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(talisLeft, talisTop, talisW, talisH, 7);
      ctx.stroke();

      // -------------------------------------------------------------
      // 5. DRAW FLYING EMBER & ASH PARTICLES (สะเก็ดไฟลอย)
      // -------------------------------------------------------------
      const embers = emberParticlesRef.current;
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.y += e.vy;
        e.x += e.vx + Math.sin(e.life * 0.12 + e.wobble) * 0.6;

        const progress = e.life / e.maxLife;
        if (progress >= 1 || e.y < 0) {
          embers.splice(i, 1);
          continue;
        }

        const alpha = (1 - progress) * e.alpha;

        ctx.fillStyle = e.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore(); // restore dpr scale

      // Continue loop
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [dimensions, burnLevel, luckyNumber, category, isBurning]);

  const burnPercent = Math.min(100, Math.round((burnLevel / 3) * 100));

  return (
    <div className={`talisman-burn-stage ${isBurning ? 'is-burning-active' : ''}`} ref={containerRef}>
      {/* Burn Progress Status Header */}
      <div className="burn-status-bar">
        <div className="burn-status-text">
          <span className="burn-status-left">
            <span className="burn-fire-icon">🔥</span>
            <span>
              เพลิงเผายันต์: <b className="burn-highlight">{burnLevel} / 3 ตา</b>
            </span>
          </span>
          <span className="burn-status-hint">
            {burnLevel === 0 && 'ชนะมินิเกมด้านล่างเพื่อเริ่มจุดไฟ'}
            {burnLevel === 1 && 'ชนะตาที่ 1: เพลิงเริ่มติดขอบยันต์'}
            {burnLevel === 2 && 'ชนะตาที่ 2: เพลิงลามใจกลางควันโขมง'}
            {burnLevel === 3 && 'ชนะตาที่ 3: เผาไหม้สมบูรณ์! ปรากฏเลขมงคล'}
          </span>
        </div>
        <div className="burn-meter-track" aria-hidden="true">
          <div
            className={`burn-meter-fill burn-lv-${burnLevel}`}
            style={{ width: `${burnPercent}%` }}
          />
        </div>
      </div>

      {/* Canvas 1: Sacred Altar Canvas (ยันต์ไฟเบิกโชค + ธูปไหม้ควันลอย) */}
      <div
        className="talisman-canvas-frame"
        style={{
          width: '100%',
          height: `${dimensions.height}px`,
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow:
            burnLevel === 3
              ? '0 0 28px rgba(255, 180, 50, 0.55), 0 8px 24px rgba(0, 0, 0, 0.7)'
              : '0 6px 20px rgba(0, 0, 0, 0.65), 0 0 16px rgba(212, 175, 55, 0.2)',
          border: burnLevel === 3 ? '1.5px solid #ffd700' : '1.5px solid rgba(212, 175, 55, 0.5)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            touchAction: 'manipulation',
          }}
          aria-label={`แท่นบูชายันต์ไฟเบิกโชคและธูปมงคล เลขมงคล: ${burnLevel === 3 ? luckyNumber : 'ยังไม่เปิดเผย'}`}
        />
      </div>
    </div>
  );
};
