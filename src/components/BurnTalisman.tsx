import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BurnTalismanProps {
  burnLevel: number; // 0, 1, 2, 3
  luckyNumber: string;
  category: 0 | 1 | null; // 0 = 2 digits, 1 = 3 digits, null = unselected
  isBurning: boolean;
  onResetCategory?: () => void;
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

interface GoldSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  twinklePhase: number;
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
  const goldSparklesRef = useRef<GoldSparkle[]>([]);
  const flameTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Responsive dimensions (reduced height 50%)
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

  // Spawn extra celebratory golden sparkles from treasure pile
  const spawnGoldBurst = useCallback((cx: number, cy: number, count = 35) => {
    const sparkles = goldSparklesRef.current;
    const goldColors = ['#ffffff', '#fff8e1', '#ffd700', '#ffea00', '#f6c342'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.8;
      const speed = 1.2 + Math.random() * 3.5;
      sparkles.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy - 10 + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 1.6 + Math.random() * 2.4,
        alpha: 1,
        maxLife: 40 + Math.random() * 25,
        life: 0,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  // Trigger burst when isBurning changes to true
  useEffect(() => {
    if (isBurning) {
      const w = dimensions.width;
      const h = dimensions.height;
      spawnFireBurst(w * 0.50, h * 0.5, 50);
      spawnGoldBurst(w * (w < 440 ? 0.84 : 0.82), h * 0.75, 40);
    }
  }, [isBurning, dimensions, spawnFireBurst, spawnGoldBurst]);

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

    // Helper: Draw a 4-point star sparkle
    const drawStarSparkle = (
      x: number,
      y: number,
      radius: number,
      color: string,
      rotation: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
        const innerAng = ang + Math.PI / 4;
        ctx.lineTo(Math.cos(innerAng) * (radius * 0.28), Math.sin(innerAng) * (radius * 0.28));
      }
      ctx.closePath();
      ctx.fill();

      // Bright white core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Helper: Draw ancient Chinese Gold Ingot (Yuanbao / ตำลึงทอง)
    const drawGoldIngot = (
      cx: number,
      cy: number,
      width: number,
      height: number,
      timeVal: number
    ) => {
      ctx.save();
      const halfW = width / 2;
      const halfH = height / 2;

      // Outer Boat Hull (ฐานตำลึงทอง)
      const hullGrad = ctx.createLinearGradient(cx - halfW, cy - halfH, cx + halfW, cy + halfH);
      hullGrad.addColorStop(0, '#e5ad23');
      hullGrad.addColorStop(0.3, '#ffdf6d');
      hullGrad.addColorStop(0.7, '#ffc021');
      hullGrad.addColorStop(1, '#9b7112');

      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.moveTo(cx - halfW, cy - halfH * 0.4);
      // Top curved dip
      ctx.quadraticCurveTo(cx, cy + halfH * 0.1, cx + halfW, cy - halfH * 0.4);
      // Right wing flare
      ctx.quadraticCurveTo(cx + halfW * 0.85, cy + halfH, cx + halfW * 0.4, cy + halfH);
      // Flat bottom
      ctx.lineTo(cx - halfW * 0.4, cy + halfH);
      // Left wing flare
      ctx.quadraticCurveTo(cx - halfW * 0.85, cy + halfH, cx - halfW, cy - halfH * 0.4);
      ctx.closePath();
      ctx.fill();

      // Border outline
      ctx.strokeStyle = 'rgba(255, 230, 150, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center Upper Crown Dome (ยอดทองกลมมนตรงกลาง)
      const domeGrad = ctx.createRadialGradient(
        cx - width * 0.1,
        cy - halfH * 0.5,
        1,
        cx,
        cy - halfH * 0.3,
        halfW * 0.7
      );
      domeGrad.addColorStop(0, '#fffbe6');
      domeGrad.addColorStop(0.35, '#ffdc63');
      domeGrad.addColorStop(0.85, '#d49a18');
      domeGrad.addColorStop(1, '#8b6410');

      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - halfH * 0.35, halfW * 0.48, halfH * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular Gleam Reflection traveling horizontally
      const sweepPos = Math.sin(timeVal * 1.8) * halfW * 0.8;
      const gleamGrad = ctx.createLinearGradient(cx + sweepPos - 4, cy, cx + sweepPos + 4, cy);
      gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gleamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)');
      gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gleamGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - halfH * 0.35, halfW * 0.44, halfH * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Helper: Draw ancient lucky Gold Coin (เหรียญทองคำมีรูสี่เหลี่ยม)
    const drawGoldCoin = (cx: number, cy: number, radius: number) => {
      ctx.save();
      // Coin base
      const coinGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        1,
        cx,
        cy,
        radius
      );
      coinGrad.addColorStop(0, '#fff3b0');
      coinGrad.addColorStop(0.4, '#ffd54f');
      coinGrad.addColorStop(0.85, '#d49a18');
      coinGrad.addColorStop(1, '#7a520a');

      ctx.fillStyle = coinGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Coin rim
      ctx.strokeStyle = '#ffe57f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.86, 0, Math.PI * 2);
      ctx.stroke();

      // Center square hole
      const holeSize = radius * 0.38;
      ctx.fillStyle = '#261408';
      ctx.fillRect(cx - holeSize / 2, cy - holeSize / 2, holeSize, holeSize);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cx - holeSize / 2, cy - holeSize / 2, holeSize, holeSize);

      ctx.restore();
    };

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

      // Center Talisman Coordinates (Now cleanly centered at w * 0.50!)
      const talisCx = Math.floor(w * 0.50);
      const talisCy = Math.floor(h * 0.52);

      // Warm ambient radial glow behind the talisman
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

      // =============================================================
      // 2. LEFT SECTION (ซ้าย): BRASS INCENSE CENSER & SMOKE (ธูป)
      // =============================================================
      const censerX = Math.floor(w * (w < 440 ? 0.16 : 0.18));
      const censerY = altarY - 1;

      // Stick configuration
      const stickAngles = [-0.1, 0, 0.1]; // slight fan angles in radians
      const fullStickLen = w < 440 ? 33 : 38;
      // Burning down calculation: 0 = 100%, 1 = 68%, 2 = 36%, 3 = 8%
      const stickRatio = Math.max(0.08, 1 - (curIncense / 3) * 0.92);
      const curStickLen = fullStickLen * stickRatio;

      // Draw each incense stick
      stickAngles.forEach((ang, sIdx) => {
        const baseX = censerX + (sIdx - 1) * 5.5;
        const baseY = censerY - 7;

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
      const bowlW = w < 440 ? 25 : 30;
      const bowlH = 11;

      // Censer Body Gradient
      const censerGrad = ctx.createLinearGradient(
        censerX - bowlW / 2,
        censerY,
        censerX + bowlW / 2,
        censerY
      );
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
      ctx.ellipse(censerX, censerY - bowlH + 2, bowlW / 2 - 2, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Censer Stand Feet
      ctx.fillStyle = '#b38f2a';
      ctx.fillRect(censerX - bowlW / 2 + 3, censerY - 1, 3.5, 3);
      ctx.fillRect(censerX + bowlW / 2 - 6.5, censerY - 1, 3.5, 3);

      // Censer text label
      ctx.font = '7px sans-serif';
      ctx.fillStyle = 'rgba(232, 185, 74, 0.75)';
      ctx.textAlign = 'center';
      ctx.fillText('ธูปนำโชค', censerX, censerY + 7);

      // Rising Incense Smoke (ควันธูปพริ้วไหว)
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

      // =============================================================
      // 3. CENTER SECTION (กลาง): SACRED TALISMAN & FIRE (ยันต์)
      // =============================================================
      const talisW = Math.min(136, Math.floor(w * (w < 440 ? 0.35 : 0.37)));
      const talisH = Math.min(94, Math.floor(h * 0.80));
      const talisLeft = talisCx - talisW / 2;
      const talisTop = talisCy - talisH / 2;

      // 3A. REVEALED CHAMBER UNDERNEATH
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(talisLeft, talisTop, talisW, talisH, 7);
      ctx.clip();

      const chamGrad = ctx.createRadialGradient(talisCx, talisCy, 6, talisCx, talisCy, talisW);
      chamGrad.addColorStop(0, '#2e0a0a');
      chamGrad.addColorStop(0.7, '#140506');
      chamGrad.addColorStop(1, '#080203');
      ctx.fillStyle = chamGrad;
      ctx.fillRect(talisLeft, talisTop, talisW, talisH);

      // Gold halo glow ring
      const haloPulse = Math.sin(ft * 2) * 3;
      const haloGrad = ctx.createRadialGradient(
        talisCx,
        talisCy,
        10,
        talisCx,
        talisCy,
        talisW * 0.5 + haloPulse
      );
      haloGrad.addColorStop(
        0,
        curBurn >= 3 ? 'rgba(255, 215, 0, 0.45)' : 'rgba(255, 100, 20, 0.25)'
      );
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(talisCx, talisCy, talisW * 0.5 + haloPulse, 0, Math.PI * 2);
      ctx.fill();

      // Badge title
      ctx.font = 'bold 7.5px sans-serif';
      ctx.fillStyle = curBurn >= 3 ? '#ffe57f' : '#ffab91';
      ctx.textAlign = 'center';
      ctx.fillText(
        category === 0
          ? '✦ เลขท้าย 2 ตัวมงคล ✦'
          : category === 1
          ? '✦ เลขท้าย 3 ตัวมงคล ✦'
          : '✦ ยันต์ไฟเบิกเลขมงคล ✦',
        talisCx,
        talisTop + 12
      );

      // Render the Digits
      const digits = Array.from(luckyNumber || (category === 1 ? '889' : '89'));
      const digitSpacing = talisW / (digits.length + 1);

      digits.forEach((digit, idx) => {
        const dx = talisLeft + digitSpacing * (idx + 1);
        const dy = talisCy + 4;

        if (curBurn >= 2.9) {
          ctx.font = 'bold 22px "Cinzel", "Noto Serif Thai", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(digit, dx, dy);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffea00';
          ctx.fillText(digit, dx, dy);
        } else if (curBurn >= 1.8) {
          ctx.font = 'bold 20px "Cinzel", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255, 140, 50, 0.45)';
          ctx.filter = 'blur(3px)';
          ctx.fillText(digit, dx, dy);
          ctx.filter = 'none';
          ctx.fillStyle = 'rgba(255, 180, 80, 0.7)';
          ctx.font = 'bold 16px serif';
          ctx.fillText('?', dx, dy);
        } else {
          ctx.font = 'bold 18px "Cinzel", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle =
            curBurn >= 0.8 ? 'rgba(255, 100, 30, 0.35)' : 'rgba(255, 255, 255, 0.15)';
          ctx.fillText('?', dx, dy);
        }
      });

      // Bottom seal/message inside talisman
      if (curBurn >= 2.9) {
        ctx.font = 'bold 7.5px sans-serif';
        ctx.fillStyle = '#ffea00';
        ctx.shadowColor = '#ff9800';
        ctx.shadowBlur = 4;
        ctx.fillText('✦ มงคลฤกษ์โชคลาภพูนทวี ✦', talisCx, talisTop + talisH - 7);
        ctx.shadowBlur = 0;
      } else if (curBurn >= 1.8) {
        ctx.font = '7px sans-serif';
        ctx.fillStyle = '#ffb74d';
        ctx.fillText('🔥 ควันเพลิงบดบัง... ชนะอีก 1 ตา!', talisCx, talisTop + talisH - 7);
      } else {
        ctx.font = '7px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(
          curBurn >= 0.8 ? '🔥 เพลิงเริ่มลาม... ชนะอีก 2 ตา' : 'ชนะมินิเกมด้านล่างเพื่อจุดไฟ',
          talisCx,
          talisTop + talisH - 7
        );
      }

      ctx.restore(); // restore clip

      // 3B. THE PARCHMENT TALISMAN & ORGANIC BURN EDGE
      if (curBurn < 2.98) {
        ctx.save();
        const burnRatio = Math.min(1, Math.max(0, curBurn / 3));
        const burnFrontY = talisTop + talisH * (1 - burnRatio);

        ctx.beginPath();
        ctx.moveTo(talisLeft, talisTop);
        ctx.lineTo(talisLeft + talisW, talisTop);
        ctx.lineTo(talisLeft + talisW, burnFrontY);

        const steps = 22;
        const stepW = talisW / steps;
        for (let i = steps; i >= 0; i--) {
          const px = talisLeft + i * stepW;
          const noise =
            Math.sin(i * 0.6 + ft * 3) * 4.5 +
            Math.cos(i * 1.4 - ft * 2) * 2.8 +
            (burnRatio > 0.05 ? Math.sin(i * 2.5 + ft * 4) * 3.5 : 0);
          const py = Math.min(talisTop + talisH, burnFrontY + noise);
          ctx.lineTo(px, py);
        }
        ctx.lineTo(talisLeft, burnFrontY);
        ctx.closePath();
        ctx.clip();

        // Ancient Yellow Parchment
        const paperGrad = ctx.createLinearGradient(
          talisLeft,
          talisTop,
          talisLeft,
          talisTop + talisH
        );
        paperGrad.addColorStop(0, '#f2d488');
        paperGrad.addColorStop(0.5, '#e8be66');
        paperGrad.addColorStop(1, '#caa34d');
        ctx.fillStyle = paperGrad;
        ctx.fill();

        // Parchment border lines
        ctx.strokeStyle = '#8b1e16';
        ctx.lineWidth = 1.1;
        ctx.strokeRect(talisLeft + 3, talisTop + 3, talisW - 6, talisH - 6);
        ctx.strokeStyle = 'rgba(139, 30, 22, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(talisLeft + 5, talisTop + 5, talisW - 10, talisH - 10);

        // Ancient Cinnabar Inscriptions
        ctx.fillStyle = '#8b1e16';
        ctx.textAlign = 'center';
        ctx.font = 'bold 10px "Noto Serif Thai", serif';
        ctx.fillText('敕令', talisCx, talisTop + 15);

        ctx.font = 'bold 6.5px sans-serif';
        ctx.fillStyle = '#6d1811';
        ctx.fillText('ยันต์ไฟเบิกโชค', talisCx, talisTop + 24);

        // Mystical Bagua / Wealth Diagram
        const baguaCy = talisTop + 49;
        ctx.strokeStyle = '#8b1e16';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(talisCx, baguaCy, 13, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(talisCx, baguaCy, 9.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139, 30, 22, 0.6)';
        ctx.setLineDash([2, 1.5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 8px serif';
        ctx.fillStyle = '#8b1e16';
        ctx.fillText('招財', talisCx, baguaCy + 3);

        // Charred scorched shadow
        if (burnRatio > 0.05) {
          const charGrad = ctx.createLinearGradient(0, burnFrontY - 20, 0, burnFrontY + 8);
          charGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          charGrad.addColorStop(0.6, 'rgba(40, 10, 5, 0.6)');
          charGrad.addColorStop(1, 'rgba(15, 3, 2, 0.95)');
          ctx.fillStyle = charGrad;
          ctx.fillRect(talisLeft, burnFrontY - 20, talisW, 28);
        }

        ctx.restore();

        // 3C. FIERY GLOWING BURN PERIMETER & SPARKS
        if (burnRatio > 0.03) {
          ctx.save();
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const px = talisLeft + i * stepW;
            const noise =
              Math.sin(i * 0.6 + ft * 3) * 4.5 +
              Math.cos(i * 1.4 - ft * 2) * 2.8 +
              Math.sin(i * 2.5 + ft * 4) * 3.5;
            const py = burnFrontY + noise;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);

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

          ctx.strokeStyle = '#ff3d00';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ff6d00';
          ctx.shadowBlur = 10;
          ctx.stroke();

          ctx.strokeStyle = '#ffea00';
          ctx.lineWidth = 1.6;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 5;
          ctx.stroke();

          ctx.restore();
        }
      }

      // Outer Frame border of the talisman
      ctx.strokeStyle = curBurn >= 3 ? '#ffd700' : 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(talisLeft, talisTop, talisW, talisH, 7);
      ctx.stroke();

      // =============================================================
      // 4. RIGHT SECTION (ขวา): กองเงินทองเปล่งประกาย (SPARKLING GOLD)
      // =============================================================
      const goldCx = Math.floor(w * (w < 440 ? 0.84 : 0.82));
      const goldCy = altarY - 2;

      // 4A. Radiant Golden Aura & Rotating Rays Behind Treasure
      const auraPulse = Math.sin(ft * 2.5) * 0.12 + 0.88;
      const goldAuraR = Math.floor((w < 440 ? 32 : 38) * auraPulse);

      const goldAura = ctx.createRadialGradient(
        goldCx,
        goldCy - 14,
        4,
        goldCx,
        goldCy - 14,
        goldAuraR
      );
      goldAura.addColorStop(0, 'rgba(255, 235, 120, 0.42)');
      goldAura.addColorStop(0.5, 'rgba(255, 185, 30, 0.22)');
      goldAura.addColorStop(1, 'rgba(255, 140, 0, 0)');
      ctx.fillStyle = goldAura;
      ctx.beginPath();
      ctx.arc(goldCx, goldCy - 14, goldAuraR, 0, Math.PI * 2);
      ctx.fill();

      // 4B. Soft Rotating Sunburst Light Rays behind gold
      ctx.save();
      ctx.translate(goldCx, goldCy - 14);
      ctx.rotate(ft * 0.4);
      ctx.fillStyle = 'rgba(255, 220, 100, 0.08)';
      for (let rIdx = 0; rIdx < 8; rIdx++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const a1 = (rIdx * Math.PI) / 4 - 0.14;
        const a2 = (rIdx * Math.PI) / 4 + 0.14;
        ctx.arc(0, 0, goldAuraR * 0.95, a1, a2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 4C. Layered Wealth Treasure: Ancient Gold Coins Base
      const coinR = w < 440 ? 7 : 8.5;
      // Statically arranged cluster of gold coins
      drawGoldCoin(goldCx - 18, goldCy - 6, coinR);
      drawGoldCoin(goldCx + 18, goldCy - 6, coinR);
      drawGoldCoin(goldCx - 9, goldCy - 4, coinR);
      drawGoldCoin(goldCx + 9, goldCy - 4, coinR);
      drawGoldCoin(goldCx, goldCy - 3, coinR + 0.5);

      // Red auspicious silk ribbon bow under ingots
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.ellipse(goldCx, goldCy - 1, 14, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4D. Tiered Gold Ingots (Yuanbao / ตำลึงทองคำ)
      // Lower Left Ingot
      drawGoldIngot(goldCx - 10, goldCy - 12, w < 440 ? 20 : 23, w < 440 ? 12 : 14, ft);
      // Lower Right Ingot
      drawGoldIngot(goldCx + 10, goldCy - 12, w < 440 ? 20 : 23, w < 440 ? 12 : 14, ft + 1.2);
      // Top Center Crown Ingot (Large lustrous king ingot)
      drawGoldIngot(goldCx, goldCy - 21, w < 440 ? 24 : 28, w < 440 ? 15 : 17, ft + 2.4);

      // 4E. Spawn Living Rising Gold Glitter Particles
      if (Math.random() < 0.45) {
        goldSparklesRef.current.push({
          x: goldCx + (Math.random() - 0.5) * 32,
          y: goldCy - 6 - Math.random() * 20,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.35 - Math.random() * 0.5,
          size: 1.2 + Math.random() * 1.8,
          alpha: 0.8 + Math.random() * 0.2,
          maxLife: 45 + Math.random() * 30,
          life: 0,
          color: Math.random() > 0.3 ? '#ffea00' : '#ffffff',
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }

      // 4F. Dynamic Shimmering 4-Point Star Sparkles (ประกายดาวแสงเพชรทองระยิบระยับ)
      const sparkleHotspots = [
        { x: goldCx - 14, y: goldCy - 26, phase: 0 },
        { x: goldCx + 13, y: goldCy - 24, phase: 1.8 },
        { x: goldCx, y: goldCy - 31, phase: 3.5 },
        { x: goldCx - 8, y: goldCy - 10, phase: 4.8 },
        { x: goldCx + 16, y: goldCy - 8, phase: 2.2 },
      ];

      sparkleHotspots.forEach((spot) => {
        const starPulse = Math.sin(ft * 3 + spot.phase);
        if (starPulse > 0.15) {
          const starRadius = (starPulse - 0.15) * (w < 440 ? 5.5 : 7);
          drawStarSparkle(spot.x, spot.y, starRadius, '#fff3b0', ft * 0.8 + spot.phase);
        }
      });

      // Gold treasure label
      ctx.font = '7px sans-serif';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('กองทรัพย์มงคล', goldCx, altarY + 6);

      // 4G. Update & Render Gold Glitter Particles (ละอองทองลอย)
      const sparkles = goldSparklesRef.current;
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.life++;
        sp.y += sp.vy;
        sp.x += sp.vx + Math.sin(sp.life * 0.08 + sp.twinklePhase) * 0.3;

        const progress = sp.life / sp.maxLife;
        if (progress >= 1 || sp.y < 0) {
          sparkles.splice(i, 1);
          continue;
        }

        const currentAlpha = Math.sin(progress * Math.PI) * sp.alpha;
        ctx.save();
        ctx.globalAlpha = currentAlpha;
        drawStarSparkle(
          sp.x,
          sp.y,
          sp.size * (1 + Math.sin(ft * 5 + sp.twinklePhase) * 0.3),
          sp.color,
          sp.life * 0.05
        );
        ctx.restore();
      }

      // =============================================================
      // 5. DRAW FLYING EMBER & ASH PARTICLES (สะเก็ดไฟจากยันต์)
      // =============================================================
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
    <div
      className={`talisman-burn-stage ${isBurning ? 'is-burning-active' : ''}`}
      ref={containerRef}
    >
      {/* Canvas Frame: Sacred Altar [ธูป(ซ้าย) | ยันต์(กลาง) | กองเงินทองเปล่งประกาย(ขวา)] */}
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
          border:
            burnLevel === 3 ? '1.5px solid #ffd700' : '1.5px solid rgba(212, 175, 55, 0.5)',
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
          aria-label={`แท่นบูชาประกอบด้วย ธูปนำโชค(ซ้าย), ยันต์ไฟเบิกโชค(กลาง), และกองเงินทองเปล่งประกาย(ขวา) เลขมงคล: ${
            burnLevel === 3 ? luckyNumber : 'ยังไม่เปิดเผย'
          }`}
        />
      </div>

      {/* Burn Progress Status: Positioned directly below the Talisman image */}
      <div className="burn-status-bar">
        <div className="burn-status-text">
          <span className="burn-status-left">
            <span className="burn-fire-icon">🔥</span>
            <span>
              เพลิงเผายันต์: <b className="burn-highlight">{burnLevel} / 3 ตา</b>
            </span>
          </span>
          <span className="burn-status-hint">
            {burnLevel === 0 && 'ชนะมินิเกมด้านบนเพื่อเริ่มจุดไฟ'}
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
    </div>
  );
};
