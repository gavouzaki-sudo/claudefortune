/**
 * Canvas Utilities
 * Reusable functions for drawing parchment paper backgrounds, coordinates calculation,
 * and image downscaling for the Scan & Signature Pad components.
 */

import { logger } from './logger';

interface RenderParchmentOptions {
  paperColor?: string;
  borderColor?: string;
  guideColor?: string;
  placeholderTitle?: string;
  placeholderSubtitle?: string;
}

/**
 * Draws an authentic oriental parchment paper background onto a canvas context.
 */
export function renderParchmentBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  drawn: boolean,
  options: RenderParchmentOptions = {}
): void {
  const {
    paperColor = '#fff9eb',
    borderColor = '#d4af37',
    guideColor = 'rgba(180, 140, 70, 0.45)',
    placeholderTitle = '✍️ จรดนิ้วหรือลากเมาส์ เขียนลายมือ / เซ็นชื่อที่นี่',
    placeholderSubtitle = 'เส้นบรรทัดนำสายตาสำหรับจรดปลายปากกา',
  } = options;

  // Paper fill
  ctx.fillStyle = paperColor;
  ctx.fillRect(0, 0, width, height);

  // Decorative inner gold border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // Dotted guideline
  ctx.strokeStyle = guideColor;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(28, height * 0.65);
  ctx.lineTo(width - 28, height * 0.65);
  ctx.stroke();
  ctx.setLineDash([]);

  // Placeholder hint when canvas is empty
  if (!drawn) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(110, 75, 30, 0.65)';
    ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
    ctx.fillText(placeholderTitle, width / 2, height * 0.42);

    ctx.font = '14px "Noto Sans Thai", sans-serif';
    ctx.fillStyle = 'rgba(130, 90, 45, 0.55)';
    ctx.fillText(placeholderSubtitle, width / 2, height * 0.74);
  }
}

/**
 * Calculates pointer position relative to canvas dimensions.
 */
export function getPointerPosOnCanvas(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): [number, number] {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  return [(clientX - rect.left) * scale, (clientY - rect.top) * scale];
}

/**
 * Downscales an uploaded Image file into 64x64 pixel array for analysis.
 */
export async function processImageToPixels(
  file: File,
  previewCanvas: HTMLCanvasElement
): Promise<Uint8ClampedArray | null> {
  let bmp: ImageBitmap | null = null;
  try {
    try {
      bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      bmp = await createImageBitmap(file);
    }

    const ctx = previewCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const s = Math.min(bmp.width, bmp.height);
    ctx.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 64, 64);
    bmp.close?.();

    const imgData = ctx.getImageData(0, 0, 64, 64);
    return imgData.data;
  } catch (err) {
    logger.error('Failed to process image to pixels:', err);
    if (bmp) bmp.close?.();
    return null;
  }
}

/**
 * Cross-browser rounded rectangle path helper.
 * Uses native ctx.roundRect when supported and falls back to quadratic curves on older browsers.
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | number[]
): void {
  ctx.beginPath();

  const nativeRoundRect = (
    ctx as CanvasRenderingContext2D & {
      roundRect?: (
        rx: number,
        ry: number,
        rw: number,
        rh: number,
        r: number | number[]
      ) => void;
    }
  ).roundRect;

  if (typeof nativeRoundRect === 'function') {
    nativeRoundRect.call(ctx, x, y, w, h, radii);
    return;
  }

  const maxR = Math.max(0, Math.min(Math.abs(w) / 2, Math.abs(h) / 2));
  const clampR = (val: number): number => Math.max(0, Math.min(val, maxR));

  let tl = 0;
  let tr = 0;
  let br = 0;
  let bl = 0;

  if (typeof radii === 'number') {
    tl = tr = br = bl = clampR(radii);
  } else if (Array.isArray(radii)) {
    if (radii.length === 1) {
      tl = tr = br = bl = clampR(radii[0] ?? 0);
    } else if (radii.length === 2) {
      tl = br = clampR(radii[0] ?? 0);
      tr = bl = clampR(radii[1] ?? 0);
    } else if (radii.length === 3) {
      tl = clampR(radii[0] ?? 0);
      tr = bl = clampR(radii[1] ?? 0);
      br = clampR(radii[2] ?? 0);
    } else if (radii.length >= 4) {
      tl = clampR(radii[0] ?? 0);
      tr = clampR(radii[1] ?? 0);
      br = clampR(radii[2] ?? 0);
      bl = clampR(radii[3] ?? 0);
    }
  }

  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr > 0) ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  else ctx.lineTo(x + w, y);

  ctx.lineTo(x + w, y + h - br);
  if (br > 0) ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  else ctx.lineTo(x + w, y + h);

  ctx.lineTo(x + bl, y + h);
  if (bl > 0) ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  else ctx.lineTo(x, y + h);

  ctx.lineTo(x, y + tl);
  if (tl > 0) ctx.quadraticCurveTo(x, y, x + tl, y);
  else ctx.lineTo(x, y);

  ctx.closePath();
}

