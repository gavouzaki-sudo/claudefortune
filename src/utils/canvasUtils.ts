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
