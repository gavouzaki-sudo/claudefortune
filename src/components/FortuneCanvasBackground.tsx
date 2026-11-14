import React, { useEffect, useRef } from 'react';
import { clamp } from '../utils/formatters';

type FortuneTopic = 'civilization' | 'stick' | 'tarot' | 'number' | 'ritual' | 'scan' | 'festival' | 'love' | 'cosmic' | 'meditation' | 'auspicious' | 'krathong' | 'coffin';

interface FortuneCanvasBackgroundProps {
  activeTopic: FortuneTopic;
  tarotVariant?: 0 | 1; // 0: witch, 1: wizard
  onToggleTarotVariant?: () => void;
}

export const FortuneCanvasBackground: React.FC<FortuneCanvasBackgroundProps> = ({
  activeTopic,
  tarotVariant = 0,
  onToggleTarotVariant,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let isDisposed = false;

    /* =========================================================================
       CANVAS ENGINE & HELPERS (Ported from interactive fortune backgrounds)
       ========================================================================= */
    const M = Math;
    const TAU = M.PI * 2;
    const rnd = M.random;
    const PAD = 70;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let DPR = 1;
    let LD = 1;

    function mulberry(a: number) {
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = M.imul(a ^ (a >>> 15), 1 | a);
        t = (t + M.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const mk = (w: number, h: number): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = M.ceil(w);
      c.height = M.ceil(h);
      return c;
    };

    function layer(w: number, h: number, fn: (g: CanvasRenderingContext2D) => void): HTMLCanvasElement {
      const c = mk((w + 2 * PAD) * LD, (h + 2 * PAD) * LD);
      const g = c.getContext('2d');
      if (g) {
        g.scale(LD, LD);
        g.translate(PAD, PAD);
        fn(g);
      }
      return c;
    }

    function putL(g: CanvasRenderingContext2D, L: HTMLCanvasElement | null, ox: number, oy: number) {
      if (!L) return;
      g.drawImage(L, -PAD + ox, -PAD + oy, L.width / LD, L.height / LD);
    }

    const dens = (w: number, h: number, n: number) =>
      M.max(8, M.round(n * clamp((w * h) / 2073600, 0.3, 1.1) * (reduce ? 0.5 : 1)));

    const GS: Record<string, HTMLCanvasElement> = {};
    function spr(k: string): HTMLCanvasElement {
      let c = GS[k];
      if (!c) {
        c = mk(64, 64);
        const g = c.getContext('2d');
        if (g) {
          const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
          r.addColorStop(0, 'rgba(' + k + ',1)');
          r.addColorStop(0.25, 'rgba(' + k + ',.45)');
          r.addColorStop(1, 'rgba(' + k + ',0)');
          g.fillStyle = r;
          g.fillRect(0, 0, 64, 64);
        }
        GS[k] = c;
      }
      return c;
    }

    function glow(g: CanvasRenderingContext2D, x: number, y: number, r: number, k: string, a: number) {
      g.globalAlpha = a < 0 ? 0 : a > 1 ? 1 : a;
      g.drawImage(spr(k), x - r, y - r, r * 2, r * 2);
    }



    function star(g: CanvasRenderingContext2D, r1: number, r2: number, n: number) {
      for (let i = 0; i < n * 2; i++) {
        const a = (i * M.PI) / n - M.PI / 2;
        const r = i & 1 ? r2 : r1;
        if (i === 0) g.moveTo(M.cos(a) * r, M.sin(a) * r);
        else g.lineTo(M.cos(a) * r, M.sin(a) * r);
      }
      g.closePath();
    }

    const ORD = [-3, 3, -2, 2, -1, 1, 0];
    function lotus(g: CanvasRenderingContext2D, x: number, y: number, sz: number) {
      for (const k of ORD) {
        g.save();
        g.translate(x, y);
        g.rotate(k * 0.4);
        g.beginPath();
        g.ellipse(0, -sz * 0.55, sz * 0.27, sz * 0.6, 0, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
      }
    }

    function heart(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
      g.beginPath();
      g.moveTo(x, y + s * 0.35);
      g.bezierCurveTo(x - s * 0.9, y - s * 0.2, x - s * 0.45, y - s * 0.85, x, y - s * 0.35);
      g.bezierCurveTo(x + s * 0.45, y - s * 0.85, x + s * 0.9, y - s * 0.2, x, y + s * 0.35);
      g.fill();
    }

    let RAY: HTMLCanvasElement | null = null;
    function raySpr(): HTMLCanvasElement {
      if (RAY) return RAY;
      RAY = mk(64, 256);
      const g = RAY.getContext('2d');
      if (g) {
        const L = g.createLinearGradient(0, 0, 0, 256);
        L.addColorStop(0, 'rgba(255,240,190,1)');
        L.addColorStop(1, 'rgba(255,230,160,0)');
        g.fillStyle = L;
        g.beginPath();
        g.moveTo(26, 0);
        g.lineTo(38, 0);
        g.lineTo(64, 256);
        g.lineTo(0, 256);
        g.fill();
        g.globalCompositeOperation = 'destination-in';
        const X = g.createLinearGradient(0, 0, 64, 0);
        X.addColorStop(0, 'rgba(0,0,0,0)');
        X.addColorStop(0.5, 'rgba(0,0,0,1)');
        X.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = X;
        g.fillRect(0, 0, 64, 256);
      }
      return RAY;
    }

    const EMB: string[] = [];
    for (let i = 0; i < 16; i++) {
      const f = i / 15;
      const A = [255, 70, 20];
      const B = [255, 160, 50];
      const C = [255, 225, 130];
      const D = [255, 248, 215];
      let a: number[], b: number[], k: number;
      if (f < 0.4) {
        a = A;
        b = B;
        k = f / 0.4;
      } else if (f < 0.75) {
        a = B;
        b = C;
        k = (f - 0.4) / 0.35;
      } else {
        a = C;
        b = D;
        k = (f - 0.75) / 0.25;
      }
      EMB.push(
        M.round(lerp(a[0], b[0], k)) +
          ',' +
          M.round(lerp(a[1], b[1], k)) +
          ',' +
          M.round(lerp(a[2], b[2], k))
      );
    }

    function tree(
      g: CanvasRenderingContext2D,
      x: number,
      y: number,
      len: number,
      ang: number,
      wd: number,
      d: number,
      r: () => number
    ) {
      if (d <= 0 || len < 4) return;
      const x2 = x + M.cos(ang) * len;
      const y2 = y + M.sin(ang) * len;
      g.lineWidth = wd;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x2, y2);
      g.stroke();
      const n = r() < 0.3 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        tree(g, x2, y2, len * (0.68 + r() * 0.12), ang + (r() - 0.5) * 1.3, wd * 0.7, d - 1, r);
      }
    }

    function gate(g: CanvasRenderingContext2D, x: number, y: number, wd: number, ht: number, s: number) {
      g.lineWidth = 2.5 * s;
      const st = 12 * s;
      for (let bx = x; bx <= x + wd; bx += st) {
        g.beginPath();
        g.moveTo(bx, y);
        g.lineTo(bx, y - ht);
        g.stroke();
        g.beginPath();
        g.moveTo(bx - 3 * s, y - ht);
        g.lineTo(bx, y - ht - 9 * s);
        g.lineTo(bx + 3 * s, y - ht);
        g.fill();
      }
      g.beginPath();
      g.moveTo(x, y - ht * 0.3);
      g.lineTo(x + wd, y - ht * 0.3);
      g.moveTo(x, y - ht * 0.75);
      g.lineTo(x + wd, y - ht * 0.75);
      g.stroke();
    }

    function cross(g: CanvasRenderingContext2D, x: number, y: number, sz: number) {
      g.fillRect(x - sz * 0.07, y - sz, sz * 0.14, sz);
      g.fillRect(x - sz * 0.28, y - sz * 0.8, sz * 0.56, sz * 0.13);
    }

    function angel(g: CanvasRenderingContext2D, x: number, y: number, sz: number) {
      g.fillRect(x - sz * 0.2, y - sz * 0.25, sz * 0.4, sz * 0.25);
      g.beginPath();
      g.moveTo(x - sz * 0.16, y - sz * 0.25);
      g.lineTo(x - sz * 0.08, y - sz * 0.9);
      g.lineTo(x + sz * 0.08, y - sz * 0.9);
      g.lineTo(x + sz * 0.16, y - sz * 0.25);
      g.fill();
      g.beginPath();
      g.arc(x, y - sz, sz * 0.1, 0, TAU);
      g.fill();
      for (const d of [-1, 1]) {
        g.beginPath();
        g.moveTo(x + d * sz * 0.05, y - sz * 0.85);
        g.quadraticCurveTo(x + d * sz * 0.6, y - sz, x + d * sz * 0.5, y - sz * 0.45);
        g.quadraticCurveTo(x + d * sz * 0.25, y - sz * 0.7, x + d * sz * 0.05, y - sz * 0.55);
        g.fill();
      }
    }

    function tomb(
      g: CanvasRenderingContext2D,
      x: number,
      y: number,
      wd: number,
      ht: number,
      tl: number,
      r: () => number,
      s: number,
      num: string
    ) {
      g.save();
      g.translate(x, y);
      g.rotate(tl);
      const L = g.createLinearGradient(-wd / 2, 0, wd / 2, 0);
      L.addColorStop(0, '#26383a');
      L.addColorStop(1, '#101c1d');
      g.fillStyle = L;
      g.strokeStyle = '#3a5250';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(-wd / 2, 0);
      g.lineTo(-wd / 2, -ht + wd / 2);
      g.arc(0, -ht + wd / 2, wd / 2, M.PI, 0);
      g.lineTo(wd / 2, 0);
      g.closePath();
      g.fill();
      g.stroke();

      g.strokeStyle = '#04090a';
      g.lineWidth = 1.3;
      g.beginPath();
      let cx = (r() - 0.5) * wd * 0.4;
      let cy = -ht * 0.95;
      g.moveTo(cx, cy);
      for (let i = 0; i < 5; i++) {
        cx += (r() - 0.5) * wd * 0.25;
        cy += ht * 0.14;
        g.lineTo(cx, cy);
      }
      g.stroke();

      g.fillStyle = 'rgba(80,130,60,.55)';
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.ellipse((r() - 0.5) * wd, -r() * ht * 0.25 - 2, wd * (0.08 + r() * 0.12), 5 * s, 0, 0, TAU);
        g.fill();
      }

      g.fillStyle = '#07100f';
      g.font = 'bold ' + ((wd * 0.36) | 0) + 'px Sarabun,Tahoma,serif';
      g.textAlign = 'center';
      g.fillText(num, 0, -ht * 0.5 + wd * 0.12);
      g.restore();
    }

    function roof(g: CanvasRenderingContext2D, cx: number, y: number, wd: number, ht: number) {
      g.beginPath();
      g.moveTo(cx - wd / 2 - 10, y - ht * 0.35);
      g.quadraticCurveTo(cx - wd / 2 + 4, y + 2, cx - wd * 0.3, y - ht * 0.1);
      g.lineTo(cx - wd * 0.12, y - ht);
      g.lineTo(cx + wd * 0.12, y - ht);
      g.lineTo(cx + wd * 0.3, y - ht * 0.1);
      g.quadraticCurveTo(cx + wd / 2 - 4, y + 2, cx + wd / 2 + 10, y - ht * 0.35);
      g.lineTo(cx + wd / 2 - 2, y + ht * 0.12);
      g.lineTo(cx - wd / 2 + 2, y + ht * 0.12);
      g.closePath();
      g.fill();
      g.stroke();
    }

    /* =========================================================================
       SCENE CLASSES
       ========================================================================= */
    interface PointerState {
      x: number;
      y: number;
      sx: number;
      sy: number;
      nx: number;
      ny: number;
      tx: number;
      ty: number;
      down: boolean;
      cl: boolean;
      act: boolean;
    }

    abstract class BaseScene {
      w = 0;
      h = 0;
      s = 1;
      t = 0;
      mx = 0;
      my = 0;
      p: PointerState = { x: 0, y: 0, sx: 0, sy: 0, nx: 0, ny: 0, tx: 0, ty: 0, down: false, cl: false, act: false };

      init(w: number, h: number) {
        this.t = 0;
        this.resize(w, h);
      }

      resize(w: number, h: number) {
        this.w = w;
        this.h = h;
        this.s = clamp(M.min(w, h * 1.5) / 900, 0.55, 1.5);
        this.build();
      }

      abstract build(): void;

      update(dt: number, p: PointerState) {
        this.t += dt;
        this.p = p;
        const k = reduce ? 0.35 : 1;
        this.mx = p.nx * k;
        this.my = p.ny * k;
      }

      abstract draw(g: CanvasRenderingContext2D): void;

      dispose() {
        const record = this as unknown as Record<string, unknown>;
        for (const key of Object.keys(record)) {
          const val = record[key];
          if (typeof HTMLCanvasElement !== 'undefined' && val instanceof HTMLCanvasElement) {
            val.width = 0;
            val.height = 0;
            record[key] = null;
          }
        }
      }
    }

    /* 1) Siamese Sticks: Chinese Temple (Temple) */
    class TempleScene extends BaseScene {
      ci = 0;
      win: { x: number; y: number }[] = [];
      wy = 0;
      tip: { x: number; y: number; k: number } | null = null;
      bg: HTMLCanvasElement | null = null;
      tp: HTMLCanvasElement | null = null;
      wt: HTMLCanvasElement | null = null;
      ln: { x: number; y: number; vy: number; ph: number; sz: number }[] = [];
      du: { x: number; y: number; vy: number; ph: number; z: number }[] = [];
      sm: { x: number; y: number; age: number; ph: number }[] = [];

      hall(g: CanvasRenderingContext2D, cx: number, by: number, k: number) {
        g.fillRect(cx - 100 * k, by - 12 * k, 200 * k, 12 * k);
        g.fillRect(cx - 85 * k, by - 62 * k, 170 * k, 50 * k);
        g.beginPath();
        g.moveTo(cx - 85 * k, by - 62 * k);
        g.lineTo(cx + 85 * k, by - 62 * k);
        g.stroke();
        roof(g, cx, by - 62 * k, 210 * k, 34 * k);
        roof(g, cx, by - 94 * k, 160 * k, 30 * k);
        roof(g, cx, by - 122 * k, 110 * k, 28 * k);
        g.beginPath();
        g.moveTo(cx - 4 * k, by - 150 * k);
        g.lineTo(cx, by - 180 * k);
        g.lineTo(cx + 4 * k, by - 150 * k);
        g.fill();
        for (let i = 0; i < 3; i++) this.win.push({ x: cx + (i - 1) * 45 * k, y: by - 36 * k });
      }

      stupa(g: CanvasRenderingContext2D, cx: number, by: number, k: number) {
        g.fillRect(cx - 60 * k, by - 14 * k, 120 * k, 14 * k);
        g.fillRect(cx - 48 * k, by - 30 * k, 96 * k, 16 * k);
        g.beginPath();
        g.moveTo(cx - 40 * k, by - 30 * k);
        g.bezierCurveTo(cx - 44 * k, by - 100 * k, cx - 14 * k, by - 130 * k, cx, by - 150 * k);
        g.bezierCurveTo(cx + 14 * k, by - 130 * k, cx + 44 * k, by - 100 * k, cx + 40 * k, by - 30 * k);
        g.closePath();
        g.fill();
        g.stroke();
        g.beginPath();
        g.moveTo(cx - 3 * k, by - 150 * k);
        g.lineTo(cx, by - 215 * k);
        g.lineTo(cx + 3 * k, by - 150 * k);
        g.fill();
        this.tip = { x: cx, y: by - 190 * k, k };
      }

      palm(g: CanvasRenderingContext2D, x: number, by: number, ht: number, d: number) {
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(x, by);
        g.quadraticCurveTo(x + d * 20, by - ht * 0.5, x + d * 10, by - ht);
        g.stroke();
        g.lineWidth = 2.5;
        for (let i = 0; i < 7; i++) {
          const a = -M.PI / 2 + (i - 3) * 0.5;
          g.beginPath();
          g.moveTo(x + d * 10, by - ht);
          g.quadraticCurveTo(
            x + d * 10 + M.cos(a) * ht * 0.3,
            by - ht + M.sin(a) * ht * 0.3 - 12,
            x + d * 10 + M.cos(a) * ht * 0.5,
            by - ht + M.sin(a) * ht * 0.5 + ht * 0.18
          );
          g.stroke();
        }
      }

      build() {
        const { w, h, s } = this;
        const r = mulberry(55);
        const wy = h * 0.8;
        this.win = [];
        this.wy = wy;

        this.bg = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, -PAD, 0, wy);
          L.addColorStop(0, '#0a0828');
          L.addColorStop(0.4, '#3a1a55');
          L.addColorStop(0.75, '#c4522f');
          L.addColorStop(1, '#f9b24c');
          g.fillStyle = L;
          g.fillRect(-PAD, -PAD, w + 2 * PAD, wy + PAD);
          g.fillStyle = '#fff';
          for (let i = 0; i < 60; i++) {
            g.globalAlpha = r() * 0.6;
            g.fillRect(r() * w, r() * wy * 0.5, 1.4, 1.4);
          }
          g.globalAlpha = 1;
          g.globalCompositeOperation = 'lighter';
          glow(g, w * 0.5, wy - h * 0.04, w * 0.55, '255,170,70', 0.55);
        });

        const k = w < 700 ? 0.8 : 1.1;
        this.tp = layer(w, h, (g) => {
          g.fillStyle = '#16091f';
          g.strokeStyle = 'rgba(255,190,100,.75)';
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(-PAD, wy);
          for (let x = -PAD; x <= w + PAD; x += 24) {
            g.lineTo(x, wy - 30 * s - M.sin(x * 0.006 + 1) * 24 * s);
          }
          g.lineTo(w + PAD, wy);
          g.fill();
          this.hall(g, w * 0.28, wy, k * s * 0.9);
          this.stupa(g, w * 0.76, wy, k * s * 0.9);
          g.strokeStyle = '#0d0614';
          this.palm(g, w * 0.06, wy, 150 * s, 1);
          this.palm(g, w * 0.95, wy, 170 * s, -1);
          this.palm(g, w * 0.5, wy, 110 * s, 1);
        });

        this.wt = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, wy, 0, h);
          L.addColorStop(0, '#8a3a3a');
          L.addColorStop(0.25, '#3a1a40');
          L.addColorStop(1, '#07040f');
          g.fillStyle = L;
          g.fillRect(-PAD, wy, w + 2 * PAD, h + PAD);
          g.save();
          g.beginPath();
          g.rect(-PAD, wy, w + 2 * PAD, h);
          g.clip();
          g.translate(0, 2 * wy);
          g.scale(1, -1);
          g.globalAlpha = 0.35;
          if (this.tp) g.drawImage(this.tp, -PAD, -PAD, this.tp.width / LD, this.tp.height / LD);
          g.restore();
        });

        this.ln = [];
        for (let i = 0, n = dens(w, h, 34); i < n; i++) {
          const l = { x: 0, y: 0, vy: 0, ph: 0, sz: 0 };
          this.lant(l, true);
          this.ln.push(l);
        }

        this.du = [];
        for (let i = 0, n = dens(w, h, 50); i < n; i++) {
          this.du.push({
            x: r() * w,
            y: r() * h,
            vy: -(5 + r() * 14) * s,
            ph: r() * TAU,
            z: 0.4 + r() * 0.6,
          });
        }

        this.sm = [];
        for (let i = 0; i < 14; i++) {
          this.sm.push({ x: w * 0.28, y: wy, age: rnd() * 5, ph: rnd() * TAU });
        }
      }

      lant(l: { x: number; y: number; vy: number; ph: number; sz: number }, init: boolean) {
        const { w, h, s } = this;
        l.x = rnd() * w;
        l.y = init ? rnd() * h : h + 40;
        l.vy = -(18 + rnd() * 22) * s;
        l.ph = rnd() * TAU;
        l.sz = (9 + rnd() * 10) * s;
      }

      update(dt: number, p: PointerState) {
        super.update(dt, p);
        const { w, h, s, t } = this;
        if (p.cl) {
          const l = this.ln[(this.ci = (this.ci + 1) % this.ln.length)];
          l.x = p.x;
          l.y = p.y;
          l.vy = -(30 + rnd() * 14) * s;
          l.sz = 20 * s;
        }
        for (const l of this.ln) {
          l.y += l.vy * dt;
          l.x += M.sin(t * 0.5 + l.ph) * 10 * dt;
          const dx = l.x - p.x;
          const dy = l.y - p.y;
          const d = M.hypot(dx, dy);
          if (p.act && d < 140 * s && d > 1) {
            l.x += (dx / d) * 80 * dt;
            l.y += (dy / d) * 30 * dt;
          }
          if (l.y < -40) this.lant(l, false);
        }
        for (const d of this.du) {
          d.y += d.vy * dt * d.z;
          d.x += M.sin(t * 0.6 + d.ph) * 6 * dt;
          if (d.y < -10) {
            d.y = h + 10;
            d.x = rnd() * w;
          }
        }
        for (const q of this.sm) {
          q.age += dt;
          if (q.age > 5) {
            q.age = 0;
            q.x = w * 0.28 + (rnd() - 0.5) * 20;
          }
        }
      }

      draw(g: CanvasRenderingContext2D) {
        const { w, h, s, t, mx, my, wy } = this;
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        putL(g, this.bg, mx * 4, my * 3);
        putL(g, this.tp, mx * 10, my * 5);
        putL(g, this.wt, mx * 10, my * 5);

        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 16; i++) {
          const y = wy + (h - wy) * ((i + 1) / 17);
          const x = w * (0.2 + (0.6 * ((i * 37) % 17)) / 17) + M.sin(t * 0.8 + i) * 30 * s + mx * 10;
          g.globalAlpha = 0.12 + 0.08 * M.sin(t * 2 + i);
          g.fillStyle = '#ffc070';
          g.fillRect(x, y, (40 + i * 6) * s, 1.5);
        }
        for (const q of this.win) glow(g, q.x + mx * 10, q.y + my * 5, 22 * s, '255,190,90', 0.5 + 0.2 * M.sin(t * 3 + q.x));
        if (this.tip) glow(g, this.tip.x + mx * 10, this.tip.y + my * 5, 50 * s, '255,210,120', 0.45 + 0.2 * M.sin(t * 1.5));
        for (const q of this.sm) {
          const f = q.age / 5;
          const sw = M.sin(q.age * 1.5 + q.ph) * 14 * s;
          glow(g, q.x + sw + mx * 10, q.y - f * h * 0.22, (10 + f * 40) * s, '200,190,210', 0.12 * M.sin(M.PI * f));
        }
        for (const d of this.du) glow(g, d.x + mx * 12 * d.z, d.y + my * 6 * d.z, (3 + d.z * 3) * s, '255,215,140', (0.3 + 0.3 * M.sin(t * 2 + d.ph)) * d.z);
        for (const l of this.ln) {
          const fl = 0.8 + 0.2 * M.sin(t * 9 + l.ph);
          const af = clamp(l.y / (h * 0.2), 0, 1);
          glow(g, l.x + mx * 14, l.y, l.sz * 2.8, '255,150,40', 0.5 * fl * af);
          glow(g, l.x + mx * 14, l.y, l.sz * 0.9, '255,235,170', 0.95 * fl * af);
        }
      }
    }

    /* 2) Tarot: Witch (v=0) & Wizard (v=1) */
    class TarotScene extends BaseScene {
      v: 0 | 1;
      cx = 0;
      cy = 0;
      bg: HTMLCanvasElement | null = null;
      cd: { x: number; y: number }[] = [];
      cards: { a: number; fl: number; ft: number; x: number; y: number; z: number; sc: number; rot: number }[] = [];
      mo: { x: number; y: number; vx: number; vy: number; ph: number; z: number }[] = [];
      bb: { on: boolean; x: number; y: number; vy: number; r: number; age: number; life: number }[] = [];

      constructor(v: 0 | 1) {
        super();
        this.v = v;
      }

      build() {
        const { w, h, s, v } = this;
        const r = mulberry(21 + v);
        this.cd = (v ? [[0.07, 0.52], [0.93, 0.52], [0.2, 0.86], [0.8, 0.86]] : [[0.12, 0.86], [0.3, 0.87], [0.55, 0.86]]).map((a) => ({
          x: a[0] * w,
          y: a[1] * h,
        }));
        this.cx = w * 0.84;
        this.cy = h * 0.8;

        this.bg = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, -PAD, 0, h + PAD);
          if (v) {
            L.addColorStop(0, '#050a22');
            L.addColorStop(0.5, '#0d1b48');
            L.addColorStop(1, '#04060f');
          } else {
            L.addColorStop(0, '#0f0818');
            L.addColorStop(0.5, '#2b1248');
            L.addColorStop(1, '#09040f');
          }
          g.fillStyle = L;
          g.fillRect(-PAD, -PAD, w + 2 * PAD, h + 2 * PAD);

          const wx = v ? w * 0.5 : w * 0.82;
          const ww = v ? w * 0.24 : w * 0.16;
          const wy = h * (v ? 0.06 : 0.1);
          const wh = h * (v ? 0.5 : 0.38);

          g.beginPath();
          g.moveTo(wx - ww / 2, wy + wh);
          g.lineTo(wx - ww / 2, wy + ww / 2);
          g.arc(wx, wy + ww / 2, ww / 2, M.PI, 0);
          g.lineTo(wx + ww / 2, wy + wh);
          g.closePath();

          const S = g.createLinearGradient(0, wy, 0, wy + wh);
          S.addColorStop(0, v ? '#1c3a8a' : '#3b1d6e');
          S.addColorStop(1, v ? '#0a1440' : '#150a30');
          g.fillStyle = S;
          g.fill();

          g.save();
          g.clip();
          g.fillStyle = '#fff';
          for (let i = 0; i < 40; i++) {
            g.globalAlpha = 0.3 + r() * 0.7;
            g.fillRect(wx - ww / 2 + r() * ww, wy + r() * wh, 1.5, 1.5);
          }
          g.globalCompositeOperation = 'lighter';
          if (!v) {
            glow(g, wx, wy + wh * 0.35, ww * 0.9, '255,240,200', 0.5);
            g.globalCompositeOperation = 'source-over';
            g.globalAlpha = 1;
            g.fillStyle = '#f5ecd0';
            g.beginPath();
            g.arc(wx, wy + wh * 0.35, ww * 0.2, 0, TAU);
            g.fill();
          } else {
            glow(g, wx, wy + wh * 0.3, ww * 0.7, '120,160,255', 0.5);
          }
          g.restore();

          g.globalAlpha = 1;
          g.lineWidth = 6 * s;
          g.strokeStyle = '#05030a';
          g.stroke();
          g.lineWidth = 4 * s;
          g.beginPath();
          g.moveTo(wx, wy);
          g.lineTo(wx, wy + wh);
          g.moveTo(wx - ww / 2, wy + wh * 0.5);
          g.lineTo(wx + ww / 2, wy + wh * 0.5);
          g.stroke();

          for (const c of this.cd) {
            g.fillStyle = '#d8cdb0';
            g.fillRect(c.x - 4 * s, c.y - 18 * s, 8 * s, 18 * s);
          }
        });

        this.cards = [];
        for (let i = 0; i < 6; i++) {
          this.cards.push({ a: (i * TAU) / 6, fl: 0, ft: 0, x: 0, y: 0, z: 0, sc: 1, rot: 0 });
        }

        this.mo = [];
        for (let i = 0, n = dens(w, h, 70); i < n; i++) {
          this.mo.push({
            x: r() * w,
            y: r() * h,
            vx: (r() - 0.5) * 8,
            vy: -(4 + r() * 12),
            ph: r() * TAU,
            z: 0.4 + r() * 0.6,
          });
        }

        this.bb = [];
        for (let i = 0; i < 20; i++) {
          this.bb.push({ on: false, x: 0, y: 0, vy: 0, r: 0, age: 0, life: 1 });
        }
      }

      update(dt: number, p: PointerState) {
        super.update(dt, p);
        const { w, h, s, t, v } = this;
        for (const c of this.cards) {
          const a = c.a + t * 0.1;
          const sn = M.sin(a);
          c.x = w / 2 + M.cos(a) * w * 0.38;
          c.y = h * 0.46 + sn * h * 0.17;
          c.z = (sn + 1) / 2;
          c.sc = (0.55 + 0.5 * c.z) * s;
          c.rot = M.cos(a) * 0.22 + ((p.x - c.x) / w) * 0.25;
          c.fl += (c.ft - c.fl) * M.min(1, dt * 6);
        }

        if (p.cl) {
          let b = null;
          let bd = 1e9;
          for (const c of this.cards) {
            const d = M.hypot(p.x - c.x, p.y - c.y);
            if (d < bd) {
              bd = d;
              b = c;
            }
          }
          if (!b || bd > 124 * b.sc) b = this.cards[(rnd() * 6) | 0];
          b.ft = b.ft ? 0 : 1;
        }

        for (const m of this.mo) {
          m.x += (m.vx + M.sin(t * 0.7 + m.ph) * 6) * dt * m.z;
          m.y += m.vy * dt * m.z;
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          if (dx * dx + dy * dy < 22500) {
            m.x += dx * dt * 0.3;
            m.y += dy * dt * 0.3;
          }
          if (m.y < -10) {
            m.y = h + 10;
            m.x = rnd() * w;
          }
          if (m.x < -10) m.x = w + 10;
          if (m.x > w + 10) m.x = -10;
        }

        if (rnd() < dt * 8) {
          for (const b of this.bb) {
            if (!b.on) {
              b.on = true;
              b.age = 0;
              b.life = 2 + rnd() * 2;
              b.r = (4 + rnd() * 8) * s;
              b.vy = -(40 + rnd() * 50) * s;
              b.x = v ? w / 2 + (rnd() - 0.5) * w * 0.3 : this.cx + (rnd() - 0.5) * 50 * s;
              b.y = v ? h * 0.9 : this.cy;
              break;
            }
          }
        }

        for (const b of this.bb) {
          if (b.on) {
            b.age += dt;
            b.y += b.vy * dt;
            b.x += M.sin(t * 3 + b.life * 7) * 10 * dt;
            if (b.age > b.life) b.on = false;
          }
        }
      }

      card(g: CanvasRenderingContext2D, c: { fl: number; sc: number; x: number; y: number; z: number; rot: number }) {
        const cw = 74;
        const ch = 124;
        const v = this.v;
        const k = M.cos(c.fl * M.PI);
        const face = c.fl > 0.5;
        const ox = this.mx * 14 * c.z;
        const oy = this.my * 8 * c.z;

        g.globalCompositeOperation = 'lighter';
        glow(g, c.x + ox, c.y + oy, ch * c.sc * 0.9, v ? '110,150,255' : '190,110,255', 0.16 + 0.2 * c.fl);

        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 0.55 + 0.45 * c.z;
        g.save();
        g.translate(c.x + ox, c.y + oy);
        g.rotate(c.rot);
        g.scale(M.abs(k) * c.sc + 0.001, c.sc);

        g.beginPath();
        const anyG = g as any;
        if (typeof anyG.roundRect === 'function') {
          anyG.roundRect(-cw / 2, -ch / 2, cw, ch, 7);
        } else {
          g.rect(-cw / 2, -ch / 2, cw, ch);
        }
        g.fillStyle = face ? '#f1e4c0' : v ? '#101c4d' : '#22103d';
        g.fill();
        g.lineWidth = 2.5;
        g.strokeStyle = '#d9b45c';
        g.stroke();

        g.lineWidth = 1;
        g.strokeRect(-cw / 2 + 6, -ch / 2 + 6, cw - 12, ch - 12);
        g.fillStyle = face ? '#3a1d5c' : '#d9b45c';

        if (face) {
          g.beginPath();
          g.arc(0, 0, 20, 0, TAU);
          g.fill();
          g.fillStyle = '#f1e4c0';
          g.beginPath();
          g.arc(9, -4, 17, 0, TAU);
          g.fill();
        } else {
          g.beginPath();
          star(g, 26, 10, 8);
          g.fill();
        }
        g.restore();
      }

      draw(g: CanvasRenderingContext2D) {
        const { w, h, s, t, v, mx, my } = this;
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        putL(g, this.bg, mx * 8, my * 5);

        g.globalCompositeOperation = 'lighter';
        glow(g, w * (v ? 0.5 : 0.82), h * 0.3, w * 0.4, v ? '80,120,255' : '160,90,255', 0.18);

        if (v) {
          g.save();
          g.translate(w / 2 + mx * 10, h * 0.88);
          g.scale(1, 0.2);
          g.rotate(t * 0.15);
          const R = w * 0.3;
          g.strokeStyle = '#8fb4ff';
          g.lineWidth = 2.5;
          g.globalAlpha = 0.55 + 0.2 * M.sin(t * 2);
          for (const q of [1, 0.82, 0.5]) {
            g.beginPath();
            g.arc(0, 0, R * q, 0, TAU);
            g.stroke();
          }
          g.beginPath();
          for (let i = 0; i < 16; i++) {
            const a = (i * TAU) / 16;
            g.moveTo(M.cos(a) * R * 0.84, M.sin(a) * R * 0.84);
            g.lineTo(M.cos(a) * R * 0.98, M.sin(a) * R * 0.98);
          }
          g.stroke();
          g.beginPath();
          star(g, R * 0.5, R * 0.22, 6);
          g.stroke();
          g.restore();
        } else {
          glow(g, this.cx + mx * 8, this.cy, 90 * s, '80,255,120', 0.35 + 0.15 * M.sin(t * 3));
        }

        const bk = v ? '150,190,255' : '120,255,140';
        for (const b of this.bb) {
          if (b.on) {
            glow(g, b.x + mx * 8, b.y, b.r * 2.2, bk, M.sin((M.PI * b.age) / b.life) * 0.8);
          }
        }

        for (let pass = 0; pass < 2; pass++) {
          for (const c of this.cards) {
            if (c.z >= 0.5 === !!pass) this.card(g, c);
          }
        }

        g.globalCompositeOperation = 'lighter';
        this.cd.forEach((c, i) => {
          const f = 1 + 0.15 * M.sin(t * 13 + i * 5) + 0.1 * M.sin(t * 23 + i);
          glow(g, c.x + mx * 8, c.y - 24 * s, 75 * s * f, '255,170,70', 0.5);
          g.globalAlpha = 1;
          g.fillStyle = '#ffd27a';
          g.beginPath();
          g.ellipse(c.x + mx * 8, c.y - 23 * s, 3.2 * s, 7 * s * f, 0, 0, TAU);
          g.fill();
        });

        const mk2 = v ? '140,190,255' : '210,160,255';
        for (const m of this.mo) {
          glow(
            g,
            m.x + mx * 10 * m.z,
            m.y + my * 6 * m.z,
            (3 + m.z * 4) * s,
            mk2,
            (0.35 + 0.35 * M.sin(t * 2 + m.ph)) * m.z
          );
        }
      }
    }

    /* 3) Lucky Numbers: Midnight Cemetery (Cemetery) */
    class CemeteryScene extends BaseScene {
      lit = 0;
      perch: { x: number; y: number }[] = [];
      tn: { x: number; y: number; num: string; gl: boolean; ph: number; f: string; sz: number }[] = [];
      cd: { x: number; y: number }[] = [];
      sky: HTMLCanvasElement | null = null;
      moon: HTMLCanvasElement | null = null;
      far: HTMLCanvasElement | null = null;
      mid: HTMLCanvasElement | null = null;
      fore: HTMLCanvasElement | null = null;
      ws: { bx: number; by: number; ph: number; sp: number }[] = [];

      build() {
        const { w, h, s } = this;
        const r = mulberry(33);
        const gy = h * 0.78;
        const TD = '๐๑๒๓๔๕๖๗๘๙';
        this.perch = [];
        this.tn = [];
        this.cd = [];

        this.sky = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, -PAD, 0, h + PAD);
          L.addColorStop(0, '#030a12');
          L.addColorStop(0.55, '#0b2227');
          L.addColorStop(1, '#0a1c1a');
          g.fillStyle = L;
          g.fillRect(-PAD, -PAD, w + 2 * PAD, h + 2 * PAD);
          g.fillStyle = '#cfe';
          for (let i = 0; i < 70; i++) {
            g.globalAlpha = r() * 0.5;
            g.fillRect(r() * w, r() * h * 0.5, 1.4, 1.4);
          }
        });

        this.moon = mk(128, 128);
        const mg = this.moon.getContext('2d');
        if (mg) {
          const L = mg.createRadialGradient(54, 54, 4, 64, 64, 60);
          L.addColorStop(0, '#fffff0');
          L.addColorStop(0.7, '#dfece0');
          L.addColorStop(1, '#a9c2ba');
          mg.fillStyle = L;
          mg.beginPath();
          mg.arc(64, 64, 60, 0, TAU);
          mg.fill();
        }

        this.far = layer(w, h, (g) => {
          g.fillStyle = g.strokeStyle = '#0a191c';
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(-PAD, h + PAD);
          for (let x = -PAD; x <= w + PAD; x += 24) {
            g.lineTo(x, gy - 18 * s + M.sin(x * 0.008) * 16 * s);
          }
          g.lineTo(w + PAD, h + PAD);
          g.fill();
          gate(g, -PAD, gy - 8 * s, w + 2 * PAD, 64 * s, s);
          for (const f of [0.07, 0.3, 0.66, 0.92]) {
            tree(g, f * w, gy - 14 * s, (58 + r() * 26) * s, -M.PI / 2 + (r() - 0.5) * 0.4, 7 * s, 7, r);
          }
        });

        this.mid = layer(w, h, (g) => {
          g.fillStyle = g.strokeStyle = '#061015';
          const y = gy + 10 * s;
          g.fillRect(-PAD, y, w + 2 * PAD, h + PAD);
          for (let x = w * 0.03; x < w; ) {
            const k = r();
            if (k < 0.35) {
              const wd = (70 + r() * 40) * s;
              const ht = (50 + r() * 20) * s;
              g.fillRect(x, y - ht, wd, ht);
              g.beginPath();
              g.moveTo(x - 6 * s, y - ht);
              g.lineTo(x + wd / 2, y - ht - 26 * s);
              g.lineTo(x + wd + 6 * s, y - ht);
              g.fill();
              this.perch.push({ x: x + wd / 2, y: y - ht - 26 * s });
              x += wd + (40 + r() * 70) * s;
            } else if (k < 0.65) {
              const sz = (70 + r() * 30) * s;
              angel(g, x, y, sz);
              this.perch.push({ x, y: y - sz * 1.1 });
              x += (60 + r() * 60) * s;
            } else {
              const z = (48 + r() * 30) * s;
              cross(g, x, y, z);
              this.perch.push({ x, y: y - z });
              x += (40 + r() * 60) * s;
            }
          }
        });

        this.fore = layer(w, h, (g) => {
          const y0 = h * 0.9;
          g.beginPath();
          g.moveTo(-PAD, h + PAD);
          for (let x = -PAD; x <= w + PAD; x += 20) {
            g.lineTo(x, y0 + M.sin(x * 0.02) * 8 * s);
          }
          g.lineTo(w + PAD, h + PAD);
          const L = g.createLinearGradient(0, y0, 0, h);
          L.addColorStop(0, '#0a1512');
          L.addColorStop(1, '#020404');
          g.fillStyle = L;
          g.fill();

          const n = M.max(3, M.round(w / (190 * s)));
          for (let i = 0; i < n; i++) {
            const x = ((i + 0.5) * w) / n + (r() - 0.5) * 50 * s;
            const ht = (95 + r() * 70) * s;
            const wd = (58 + r() * 28) * s;
            const y = h * (0.95 + r() * 0.07);
            const tl = (r() - 0.5) * 0.3;
            const num = TD[(r() * 10) | 0] + TD[(r() * 10) | 0] + (r() < 0.5 ? TD[(r() * 10) | 0] : '');
            tomb(g, x, y, wd, ht, tl, r, s, num);
            this.tn.push({
              x,
              y: y - ht * 0.5 + wd * 0.12,
              num,
              gl: r() < 0.6,
              ph: r() * TAU,
              f: 'bold ' + ((wd * 0.36) | 0) + 'px Sarabun,Tahoma,serif',
              sz: wd,
            });
            if (i % 2 === 0) {
              const cx = x + wd * 0.75;
              g.fillStyle = '#d8d2b8';
              g.fillRect(cx - 3 * s, y - 14 * s, 6 * s, 14 * s);
              this.cd.push({ x: cx, y: y - 14 * s });
            }
          }
        });

        this.ws = [];
        for (let i = 0; i < 7; i++) {
          this.ws.push({
            bx: rnd() * w,
            by: h * (0.5 + rnd() * 0.3),
            ph: rnd() * TAU,
            sp: 0.6 + rnd() * 0.8,
          });
        }
      }

      update(dt: number, p: PointerState) {
        super.update(dt, p);
        this.lit += ((p.act ? 1 : 0) - this.lit) * dt * 3;
      }

      draw(g: CanvasRenderingContext2D) {
        const { w, h, s, t, mx, my, p } = this;
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        putL(g, this.sky, mx * 2, my * 2);

        const fl = 0.85 + 0.1 * M.sin(t * 7) * M.sin(t * 2.3) + 0.05 * M.sin(t * 19);
        const mxp = w * 0.75 + mx * 4;
        const myp = h * 0.17 + my * 3;
        const R = 40 * s;

        g.globalCompositeOperation = 'lighter';
        glow(g, mxp, myp, R * 4.5, '170,220,200', 0.3 * fl);
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = fl;
        if (this.moon) g.drawImage(this.moon, mxp - R, myp - R, R * 2, R * 2);

        g.globalAlpha = 1;
        putL(g, this.far, mx * 5, my * 3);
        putL(g, this.mid, mx * 12, my * 6);
        putL(g, this.fore, mx * 26, my * 10);

        const fx = mx * 26;
        const fy = my * 10;
        g.globalCompositeOperation = 'lighter';

        // Candles
        this.cd.forEach((c, i) => {
          const f = 1 + 0.18 * M.sin(t * 13 + i * 5) + 0.1 * M.sin(t * 29 + i * 2);
          const x = c.x + fx;
          const y = c.y + fy;
          glow(g, x, y - 8 * s, 60 * s * f, '255,170,70', 0.5);
          g.globalAlpha = 1;
          g.fillStyle = '#ffd27a';
          g.beginPath();
          g.ellipse(x, y - 6 * s, 2.6 * s, 6 * s * f, 0, 0, TAU);
          g.fill();
        });

        // Wisps
        for (const q of this.ws) {
          for (let k = 0; k < 4; k++) {
            const tt = t - k * 0.18;
            const x = q.bx + M.sin(tt * 0.3 * q.sp + q.ph) * 90 * s + mx * 18;
            const y = q.by + M.cos(tt * 0.4 * q.sp + q.ph * 2) * 34 * s + my * 8;
            glow(
              g,
              x,
              y,
              (k ? 10 - k * 2 : 26) * s,
              k ? '120,255,200' : '150,255,210',
              k ? 0.25 / k : 0.55 + 0.25 * M.sin(t * 3 + q.ph)
            );
            if (!k) glow(g, x, y, 7 * s, '255,255,255', 0.8);
          }
        }

        // Glowing numbers on tombstones
        g.textAlign = 'center';
        g.fillStyle = '#b4ffd2';
        for (const n of this.tn) {
          if (n.gl) {
            const x = n.x + fx;
            const y = n.y + fy;
            const d = M.hypot(x - p.sx, y - p.sy);
            const k = clamp(
              0.3 + 0.2 * M.sin(t * 2 + n.ph) + clamp(1 - d / (170 * s * 1.1), 0, 1) * 0.8 * this.lit,
              0,
              1
            );
            glow(g, x, y - n.sz * 0.12, n.sz * 0.7, '120,255,180', k * 0.35);
            g.globalAlpha = k;
            g.font = n.f;
            g.fillText(n.num, x, y);
          }
        }

        if (this.lit > 0.01) {
          glow(g, p.sx, p.sy, 170 * s * 1.1, '190,255,200', 0.16 * this.lit);
          glow(g, p.sx, p.sy, 36 * s, '255,235,180', 0.28 * this.lit);
        }
      }
    }

    /* 4) Rituals: Hell to Heaven (Hell) */
    class HellScene extends BaseScene {
      bal = 0.5;
      sky: HTMLCanvasElement | null = null;
      heav: HTMLCanvasElement | null = null;
      mid: HTMLCanvasElement | null = null;
      hell: HTMLCanvasElement | null = null;
      em: { x: number; y: number; vy: number; life: number; age: number; ph: number; sz: number; hf: number }[] = [];

      build() {
        const { w, h, s } = this;
        const r = mulberry(44);
        const gy = h * 0.86;

        this.sky = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, -PAD, 0, h + PAD);
          L.addColorStop(0, '#fff1c4');
          L.addColorStop(0.18, '#f3d58a');
          L.addColorStop(0.42, '#8f7aa6');
          L.addColorStop(0.62, '#4a3560');
          L.addColorStop(0.8, '#2a0f26');
          L.addColorStop(1, '#120408');
          g.fillStyle = L;
          g.fillRect(-PAD, -PAD, w + 2 * PAD, h + 2 * PAD);
        });

        this.heav = layer(w, h, (g) => {
          const cx = w / 2;
          const gt = h * 0.1;
          const gb = h * 0.3;
          const gw = w * 0.2;
          const G = g.createLinearGradient(0, gt, 0, gb);
          G.addColorStop(0, '#fffdf0');
          G.addColorStop(1, '#f0d58a');
          g.fillStyle = G;
          g.strokeStyle = 'rgba(190,140,40,.9)';
          g.lineWidth = 3 * s;
          g.beginPath();
          g.moveTo(cx - gw / 2, gb);
          g.lineTo(cx - gw / 2, gt + gw / 2);
          g.arc(cx, gt + gw / 2, gw / 2, M.PI, 0);
          g.lineTo(cx + gw / 2, gb);
          g.closePath();
          g.fill();
          g.stroke();

          g.fillStyle = 'rgba(255,255,255,.7)';
          g.strokeStyle = 'rgba(215,170,80,.7)';
          g.lineWidth = 1.5;
          for (let i = 0; i < 9; i++) {
            lotus(g, ((i + 0.5) * w) / 9 + (r() - 0.5) * 40 * s, h * 0.33 + r() * h * 0.03, (22 + r() * 22) * s);
          }
        });

        this.mid = layer(w, h, (g) => {
          const yb = h * 0.7;
          const yt = h * 0.38;
          const wb = w * 0.36;
          const wt = w * 0.12;
          const n = 12;
          for (let i = 0; i < n; i++) {
            const f = i / n;
            const y = lerp(yt, yb, f);
            const wd = lerp(wt, wb, f);
            const sh = (yb - yt) / n;
            g.fillStyle = '#7d7194';
            g.fillRect(w / 2 - wd / 2, y - sh * 0.25, wd, sh * 0.3);
            g.fillStyle = '#4b4260';
            g.fillRect(w / 2 - wd / 2, y + sh * 0.05, wd, sh * 0.7);
          }
        });

        this.hell = layer(w, h, (g) => {
          g.fillStyle = '#14050a';
          g.fillRect(-PAD, gy + 4 * s, w + 2 * PAD, h);
          gate(g, w * 0.01, gy, w * 0.16, h * 0.12, s);
          gate(g, w * 0.83, gy, w * 0.16, h * 0.12, s);
        });

        this.em = [];
        for (let i = 0, n = dens(w, h, 100); i < n; i++) {
          this.em.push({
            x: rnd() * w,
            y: h * (0.05 + rnd() * 0.95),
            vy: (40 + rnd() * 70) * s,
            life: 12 + rnd() * 14,
            age: rnd() * 10,
            ph: rnd() * TAU,
            sz: (1.5 + rnd() * 3) * s,
            hf: 0,
          });
        }
      }

      update(dt: number, p: PointerState) {
        super.update(dt, p);
        const { w, h, s, t } = this;
        const tb = p.act ? 1 - p.y / h : 0.5;
        this.bal += (clamp(tb, 0, 1) - this.bal) * M.min(1, dt * 2.5);

        for (const e of this.em) {
          e.age += dt;
          e.hf = clamp((h * 1.02 - e.y) / (h * 0.92), 0, 1);
          e.y -= e.vy * (1 - 0.6 * e.hf) * dt;
          e.x += M.sin(t * 1.3 + e.ph) * 14 * s * dt * (0.4 + e.hf);
          if (e.age > e.life || e.y < h * 0.03) {
            e.x = rnd() * w;
            e.y = h * (0.95 + rnd() * 0.08);
            e.age = 0;
          }
        }
      }

      draw(g: CanvasRenderingContext2D) {
        const { w, h, t, mx, my, bal } = this;
        const bw = lerp(0.5, 1.3, bal);

        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        putL(g, this.sky, 0, 0);
        putL(g, this.heav, mx * 6, my * 3);

        // God rays from heaven
        g.globalCompositeOperation = 'lighter';
        const rs = raySpr();
        const ox = w / 2 + mx * 12;
        const oy = -h * 0.1;
        const len = h * 1.15;
        for (let i = 0; i < 9; i++) {
          const a = (i / 8 - 0.5) * 1.5 + M.sin(t * 0.25 + i * 1.7) * 0.07;
          const rw = w * 0.12 * (1 + 0.4 * M.sin(t * 0.4 + i));
          g.globalAlpha = (0.07 + 0.05 * M.sin(t * 0.7 + i * 2.1)) * bw * 1.4;
          g.save();
          g.translate(ox, oy);
          g.rotate(a);
          g.drawImage(rs, -rw / 2, 0, rw, len);
          g.restore();
        }

        glow(g, w / 2 + mx * 6, h * 0.2, w * 0.18, '255,240,190', 0.3 * bw + 0.08 * M.sin(t * 2));
        g.globalCompositeOperation = 'source-over';
        putL(g, this.mid, mx * 10, my * 5);
        putL(g, this.hell, mx * 16, my * 7);

        g.globalCompositeOperation = 'lighter';
        for (const e of this.em) {
          const a = clamp(e.age * 1.2, 0, 1) * clamp((e.life - e.age) * 0.8, 0, 1);
          glow(g, e.x + mx * 10, e.y, e.sz * (3.2 - 1.2 * e.hf), EMB[(e.hf * 15) | 0], a);
        }
      }
    }

    /* 5) Love Fortune: Moonlit Lotus Pond (Love) */
    class LoveScene extends BaseScene {
      wy = 0;
      mo = { x: 0, y: 0, r: 0 };
      bg: HTMLCanvasElement | null = null;
      wt: HTMLCanvasElement | null = null;
      ff: { x: number; y: number; ph: number; sp: number; vx: number }[] = [];
      pt: { x: number; y: number; vy: number; vx: number; rot: number; vr: number; ph: number; sz: number }[] = [];
      ht: { on: boolean; x: number; y: number; vx: number; vy: number; age: number; life: number; sz: number; ph: number }[] = [];
      rp: { on: boolean; x: number; y: number; r: number; a: number }[] = [];

      build() {
        const { w, h, s } = this;
        const r = mulberry(77);
        const wy = h * 0.72;
        const R = M.min(w, h) * 0.11;
        this.wy = wy;
        this.mo = { x: w * 0.5, y: h * 0.28, r: R };

        this.bg = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, -PAD, 0, wy);
          L.addColorStop(0, '#160730');
          L.addColorStop(0.5, '#4d1860');
          L.addColorStop(1, '#c9467a');
          g.fillStyle = L;
          g.fillRect(-PAD, -PAD, w + 2 * PAD, wy + PAD);
          g.fillStyle = '#fff';
          for (let i = 0; i < 50; i++) {
            g.globalAlpha = r() * 0.6;
            g.fillRect(r() * w, r() * wy * 0.5, 1.4, 1.4);
          }
          g.globalAlpha = 1;
          g.globalCompositeOperation = 'lighter';
          glow(g, w * 0.5, h * 0.28, R * 5, '255,150,200', 0.4);
          g.globalCompositeOperation = 'source-over';
          g.globalAlpha = 1;

          const D = g.createRadialGradient(w * 0.5 - R * 0.3, h * 0.28 - R * 0.3, R * 0.1, w * 0.5, h * 0.28, R);
          D.addColorStop(0, '#fff6fa');
          D.addColorStop(1, '#ffbcd6');
          g.fillStyle = D;
          g.beginPath();
          g.arc(w * 0.5, h * 0.28, R, 0, TAU);
          g.fill();
        });

        this.wt = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, wy, 0, h);
          L.addColorStop(0, '#b13a74');
          L.addColorStop(0.3, '#2a0d44');
          L.addColorStop(1, '#0b0418');
          g.fillStyle = L;
          g.fillRect(-PAD, wy, w + 2 * PAD, h + PAD);

          for (let i = 0; i < 9; i++) {
            const y = wy + (h - wy) * (0.15 + 0.8 * r());
            const k = (y - wy) / (h - wy);
            const sz = (14 + k * 36) * s;
            const x = r() * w;
            g.fillStyle = '#1a0a2c';
            g.beginPath();
            g.ellipse(x, y + sz * 0.15, sz * 1.5, sz * 0.4, 0, 0, TAU);
            g.fill();
            if (i < 7) {
              g.fillStyle = 'rgba(255,170,205,.95)';
              g.strokeStyle = '#fff0f5';
              g.lineWidth = 1;
              lotus(g, x, y, sz);
            }
          }
        });

        this.ff = [];
        for (let i = 0, n = dens(w, h, 40); i < n; i++) {
          this.ff.push({
            x: r() * w,
            y: h * (0.4 + r() * 0.4),
            ph: r() * TAU,
            sp: 0.8 + r() * 1.6,
            vx: (r() - 0.5) * 10,
          });
        }

        this.pt = [];
        for (let i = 0, n = dens(w, h, 34); i < n; i++) {
          const q = { x: 0, y: 0, vy: 0, vx: 0, rot: 0, vr: 0, ph: 0, sz: 0 };
          this.petal(q, true);
          this.pt.push(q);
        }

        this.ht = [];
        for (let i = 0, n = dens(w, h, 36); i < n; i++) {
          const q = { on: false, x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, sz: 1, ph: 0 };
          this.hrt(q, false);
          q.age = rnd() * q.life;
          this.ht.push(q);
        }

        this.rp = [];
        for (let i = 0; i < 5; i++) {
          this.rp.push({ on: false, x: 0, y: 0, r: 0, a: 0 });
        }
      }

      petal(q: { x: number; y: number; vy: number; vx: number; rot: number; vr: number; ph: number; sz: number }, init: boolean) {
        const { w, h, s } = this;
        q.x = rnd() * w;
        q.y = init ? rnd() * h : -20;
        q.vy = (18 + rnd() * 24) * s;
        q.vx = (rnd() - 0.5) * 12;
        q.rot = rnd() * TAU;
        q.vr = (rnd() - 0.5) * 2;
        q.ph = rnd() * TAU;
        q.sz = (5 + rnd() * 5) * s;
      }

      hrt(
        q: { on: boolean; x: number; y: number; vx: number; vy: number; age: number; life: number; sz: number; ph: number },
        burst: boolean,
        x = 0,
        y = 0
      ) {
        const { w, h, s } = this;
        q.on = true;
        q.age = 0;
        q.ph = rnd() * TAU;
        q.sz = (8 + rnd() * 14) * s;
        q.life = 6 + rnd() * 5;
        if (burst) {
          q.x = x;
          q.y = y;
          q.vx = (rnd() - 0.5) * 120 * s;
          q.vy = -(80 + rnd() * 100) * s;
          q.life = 3 + rnd() * 2;
        } else {
          q.x = rnd() * w;
          q.y = h + 30;
          q.vx = 0;
          q.vy = -(25 + rnd() * 30) * s;
        }
      }

      update(dt: number, p: PointerState) {
        super.update(dt, p);
        const { w, h, s, t } = this;
        if (p.cl) {
          for (const r of this.rp) {
            if (!r.on) {
              r.on = true;
              r.x = p.x;
              r.y = M.max(p.y, this.wy + 10);
              r.r = 0;
              r.a = 1;
              break;
            }
          }
          let n = 12;
          for (const q of this.ht) {
            if (n > 0 && q.age > q.life * 0.6) {
              this.hrt(q, true, p.x, p.y);
              n--;
            }
          }
        }

        for (const r of this.rp) {
          if (r.on) {
            r.r += dt * 180 * s;
            r.a -= dt * 0.6;
            if (r.a <= 0) r.on = false;
          }
        }

        for (const f of this.ff) {
          f.x += (f.vx + M.sin(t * 0.7 + f.ph) * 14) * dt;
          f.y += M.cos(t * 0.9 + f.ph) * 10 * dt;
          if (f.x < -10) f.x = w + 10;
          if (f.x > w + 10) f.x = -10;
          f.y = clamp(f.y, h * 0.25, h * 0.9);
        }

        for (const q of this.pt) {
          q.y += q.vy * dt;
          q.x += (q.vx + M.sin(t + q.ph) * 14) * dt;
          q.rot += q.vr * dt;
          if (q.y > h + 20) this.petal(q, false);
        }

        for (const q of this.ht) {
          if (q.on) {
            q.age += dt;
            q.y += q.vy * dt;
            q.x += q.vx * dt + M.sin(t * 1.2 + q.ph) * 12 * dt;
            q.vx *= 1 - dt * 0.8;
            if (q.age > q.life) this.hrt(q, false);
          }
        }
      }

      draw(g: CanvasRenderingContext2D) {
        const { s, t, mx, my, mo } = this;
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        putL(g, this.bg, mx * 5, my * 3);
        putL(g, this.wt, mx * 10, my * 5);

        g.globalCompositeOperation = 'lighter';
        glow(g, mo.x + mx * 5, mo.y + my * 3, mo.r * 3.5, '255,170,210', 0.2 + 0.06 * M.sin(t * 1.3));

        g.strokeStyle = '#ffd6e8';
        g.lineWidth = 1.5;
        for (const r of this.rp) {
          if (r.on) {
            g.globalAlpha = r.a * 0.7;
            g.beginPath();
            g.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, TAU);
            g.stroke();
          }
        }

        for (const f of this.ff) {
          const b = M.pow(M.max(0, M.sin(t * f.sp + f.ph)), 3);
          glow(g, f.x + mx * 12, f.y + my * 6, 14 * s, '255,240,150', b * 0.9);
        }

        g.fillStyle = '#ff9cc2';
        for (const q of this.ht) {
          if (q.on) {
            const a = M.sin((M.PI * q.age) / q.life);
            glow(g, q.x + mx * 14, q.y, q.sz * 2.2, '255,110,170', 0.35 * a);
            g.globalAlpha = 0.6 * a;
            heart(g, q.x + mx * 14, q.y, q.sz);
          }
        }

        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#ffb0cf';
        for (const q of this.pt) {
          g.globalAlpha = 0.85;
          g.save();
          g.translate(q.x + mx * 16, q.y);
          g.rotate(q.rot);
          g.scale(1, 0.35 + 0.65 * M.abs(M.sin(t * 2 + q.ph)));
          g.beginPath();
          g.ellipse(0, 0, q.sz, q.sz * 0.55, 0, 0, TAU);
          g.fill();
          g.restore();
        }
      }
    }

    /* 6) Holographic Scan (Scan) */
    class ScanScene extends BaseScene {
      sy1 = 0;
      y0 = 0;
      y1 = 0;
      bg: HTMLCanvasElement | null = null;

      build() {
        const { w, h } = this;
        const r = mulberry(66);
        this.y0 = h * 0.15;
        this.y1 = h * 0.85;

        this.bg = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, -PAD, 0, h + PAD);
          L.addColorStop(0, '#02041a');
          L.addColorStop(0.66, '#0a1d46');
          L.addColorStop(1, '#020512');
          g.fillStyle = L;
          g.fillRect(-PAD, -PAD, w + 2 * PAD, h + 2 * PAD);

          g.fillStyle = '#bfe0ff';
          for (let i = 0; i < 70; i++) {
            g.globalAlpha = r() * 0.6;
            g.fillRect(r() * w, r() * h * 0.66, 1.3, 1.3);
          }
        });
      }

      update(dt: number, p: PointerState) {
        super.update(dt, p);
        const { t } = this;
        const tr = (t * 0.3) % 1;
        this.sy1 = this.y0 + (this.y1 - this.y0) * (tr * tr * (3 - 2 * tr));
      }

      draw(g: CanvasRenderingContext2D) {
        const { w, h, t, mx, my } = this;
        const cx = w / 2 + mx * 8;
        const cy = h * 0.46 + my * 5;
        const Rh = M.min(w * 0.46, h * 0.38);

        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        putL(g, this.bg, mx * 4, my * 3);

        g.globalCompositeOperation = 'lighter';

        // Laser scan line
        g.globalAlpha = 0.85;
        g.fillStyle = '#59e6ff';
        g.fillRect(0, this.sy1 - 2, w, 4);
        glow(g, cx, this.sy1, Rh * 1.2, '80,220,255', 0.5);

        // Cyber rings
        g.save();
        g.translate(cx, cy);
        g.lineWidth = 1.5;
        g.strokeStyle = '#59e6ff';
        g.globalAlpha = 0.4;
        g.beginPath();
        g.arc(0, 0, Rh, 0, TAU);
        g.stroke();

        g.strokeStyle = '#ffd27a';
        g.globalAlpha = 0.32;
        g.beginPath();
        g.arc(0, 0, Rh * 0.74, 0, TAU);
        g.stroke();

        g.rotate(t * 0.2);
        for (let i = 0; i < 3; i++) {
          const a = -t * 0.5 + (i * TAU) / 3;
          g.beginPath();
          g.arc(0, 0, Rh * 0.88, a, a + 0.9);
          g.stroke();
        }
        g.restore();
      }
    }

    /* 7) Cosmic Zodiac / Celestial Orrery (Cosmic) */
    class CosmicScene extends BaseScene {
      bg: HTMLCanvasElement | null = null;
      st: { x: number; y: number; z: number; r: number; ph: number; sp: number; c: string }[] = [];

      build() {
        const { w, h } = this;
        const r = mulberry(11);
        this.bg = layer(w, h, (g) => {
          const L = g.createLinearGradient(0, -PAD, 0, h + PAD);
          L.addColorStop(0, '#04041a');
          L.addColorStop(0.55, '#150c36');
          L.addColorStop(1, '#34154a');
          g.fillStyle = L;
          g.fillRect(-PAD, -PAD, w + 2 * PAD, h + 2 * PAD);
          g.globalCompositeOperation = 'lighter';
          const nb = ['110,60,220', '60,100,230', '220,70,160', '90,50,170'];
          for (let i = 0; i < 10; i++) {
            glow(g, r() * w, r() * h, (0.18 + r() * 0.3) * M.max(w, h), nb[i & 3], 0.12 + r() * 0.12);
          }
        });

        this.st = [];
        for (let i = 0, n = dens(w, h, 260); i < n; i++) {
          const z = r() < 0.6 ? 0 : r() < 0.7 ? 1 : 2;
          this.st.push({
            x: r() * (w + 120) - 60,
            y: r() * (h + 120) - 60,
            z,
            r: 0.5 + z * 0.5 + r() * 0.4,
            ph: r() * TAU,
            sp: 1 + r() * 2.5,
            c: r() < 0.3 ? '#ffdcaa' : '#cfe0ff',
          });
        }
      }

      draw(g: CanvasRenderingContext2D) {
        const { w, h, s, t, mx, my } = this;
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
        putL(g, this.bg, mx * 6, my * 6);

        for (const q of this.st) {
          const x = q.x + mx * (4 + q.z * 10);
          const y = q.y + my * (3 + q.z * 7);
          const tw = 0.55 + 0.45 * M.sin(t * q.sp + q.ph);
          const r = q.r;
          g.globalAlpha = clamp(tw * 0.9, 0, 1);
          g.fillStyle = q.c;
          g.fillRect(x - r, y - r, r * 2, r * 2);
        }

        const cx = w / 2 + mx * 14;
        const cy = h * 0.46 + my * 8;
        const R = M.min(w * 0.46, h * 0.4);
        const rot = t * 0.04;

        g.globalCompositeOperation = 'lighter';
        glow(g, cx, cy, R * 1.5, '150,100,255', 0.22);
        g.strokeStyle = '#ffd69a';
        g.lineWidth = 1.2;
        g.globalAlpha = 0.45;
        for (const q of [1, 0.9, 0.64, 0.3]) {
          g.beginPath();
          g.arc(cx, cy, R * q, 0, TAU);
          g.stroke();
        }

        for (let i = 0; i < 12; i++) {
          const a = -rot * 1.5 + (i * TAU) / 12;
          const px = cx + M.cos(a) * R * 0.77;
          const py = cy + M.sin(a) * R * 0.77;
          glow(g, px, py, (16 + 5 * M.sin(t * 2 + i)) * s, '255,220,160', 0.85);
        }
      }
    }

    /* =========================================================================
       SCENE MANAGER & RUNTIME
       ========================================================================= */
    const createScene = (key: string): BaseScene => {
      switch (key) {
        case 'tarot0':
          return new TarotScene(0);
        case 'tarot1':
          return new TarotScene(1);
        case 'number':
        case 'coffin':
          return new CemeteryScene();
        case 'ritual':
          return new HellScene();
        case 'love':
          return new LoveScene();
        case 'scan':
          return new ScanScene();
        case 'cosmic':
        case 'meditation':
        case 'civilization':
          return new CosmicScene();
        case 'stick':
        case 'festival':
        case 'krathong':
        default:
          return new TempleScene();
      }
    };

    const curSceneKey = activeTopic === 'tarot' ? (tarotVariant === 1 ? 'tarot1' : 'tarot0') : activeTopic;
    const curScene: BaseScene = createScene(curSceneKey);
    let lastTime = 0;

    const P: PointerState = {
      x: 0,
      y: 0,
      sx: 0,
      sy: 0,
      nx: 0,
      ny: 0,
      tx: 0,
      ty: 0,
      down: false,
      cl: false,
      act: false,
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      DPR = M.min(window.devicePixelRatio || 1, 2);
      LD = M.min(DPR, 1.5);
      cv.width = M.round(w * DPR);
      cv.height = M.round(h * DPR);

      if (!P.act) {
        P.x = P.sx = w / 2;
        P.y = P.sy = h * 0.6;
      }

      curScene.resize(w, h);
    };

    handleResize();
    curScene.init(window.innerWidth, window.innerHeight);

    const onPointerMove = (e: PointerEvent) => {
      P.x = e.clientX;
      P.y = e.clientY;
      P.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      P.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      P.act = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      P.x = e.clientX;
      P.y = e.clientY;
      P.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      P.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      P.act = true;
      P.down = true;
      P.cl = true;
    };

    const onPointerUp = () => {
      P.down = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    const isOccludedBy3D = activeTopic === 'krathong';

    const drawStaticBackdrop = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#060914';
      ctx.fillRect(0, 0, w, h);
    };

    const handleResizeWithBackdrop = () => {
      handleResize();
      if (isOccludedBy3D) {
        drawStaticBackdrop();
      }
    };

    window.removeEventListener('resize', handleResize);
    window.addEventListener('resize', handleResizeWithBackdrop);

    if (isOccludedBy3D) {
      drawStaticBackdrop();
    }

    const render = (ts: number) => {
      if (isDisposed || isOccludedBy3D || document.hidden) {
        animId = 0;
        return;
      }
      animId = requestAnimationFrame(render);

      const dt = M.min((ts - lastTime) / 1000 || 0.016, 0.05);
      lastTime = ts;

      const k = M.min(1, dt * 3);
      const k2 = M.min(1, dt * 9);
      P.nx += (P.tx - P.nx) * k;
      P.ny += (P.ty - P.ny) * k;
      P.sx += (P.x - P.sx) * k2;
      P.sy += (P.y - P.sy) * k2;

      const sp = dt * (reduce ? 0.6 : 1);

      curScene.update(sp, P);
      P.cl = false;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      curScene.draw(ctx);
      ctx.restore();

      // Gentle dark vignette so foreground text remains ultra-legible
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.42;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, M.min(w, h) * 0.25, w / 2, h / 2, M.hypot(w, h) * 0.65);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(0,0,0,.85)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    };

    const handleVisibilityChange = () => {
      if (isOccludedBy3D) return;
      if (document.hidden) {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      } else if (!isDisposed && !animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!isOccludedBy3D && !document.hidden) {
      lastTime = performance.now();
      animId = requestAnimationFrame(render);
    }

    return () => {
      isDisposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animId) {
        cancelAnimationFrame(animId);
      }
      window.removeEventListener('resize', handleResizeWithBackdrop);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      curScene.dispose();
      for (const k of Object.keys(GS)) {
        GS[k].width = 0;
        GS[k].height = 0;
        delete GS[k];
      }
      if (RAY) {
        RAY.width = 0;
        RAY.height = 0;
        RAY = null;
      }
    };
  }, [activeTopic, tarotVariant]);

  return (
    <div className="fortune-canvas-background-container" aria-hidden="true">
      <canvas ref={canvasRef} className="fortune-scene-canvas" />

      {activeTopic === 'tarot' && onToggleTarotVariant && (
        <button
          type="button"
          className="tarot-variant-floating-toggle"
          onClick={onToggleTarotVariant}
          title="สลับบรรยากาศ แม่มด / พ่อมด"
          aria-label="สลับฉากหลังแม่มดหรือพ่อมด"
        >
          <span>🔮 {tarotVariant === 0 ? 'สลับเป็นหอดูดาวพ่อมด' : 'สลับเป็นห้องลับแม่มด'}</span>
        </button>
      )}
    </div>
  );
};
