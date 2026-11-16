import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { ImageScanResult, SignatureResult } from '../types';
import { renderParchmentBackground, getPointerPosOnCanvas, processImageToPixels } from '../utils/canvasUtils';
import { ScoreBars } from './ScoreBars';
import { logger } from '../utils/logger';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedElementName } from '../data/ritualProphecies';

interface ScanFortuneProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
}

export const ScanFortune: React.FC<ScanFortuneProps> = ({ bridge, onToast }) => {
  const { t, lang, format } = useLanguage();

  // Image scan state
  const [imgMode, setImgMode] = useState<number>(0);
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [hasSelectedImage, setHasSelectedImage] = useState(false);
  const [imageScanResult, setImageScanResult] = useState<ImageScanResult | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Signature state
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sigResult, setSigResult] = useState<SignatureResult | null>(null);
  const ptsRef = useRef<[number, number, number][]>([]);
  const strokeRef = useRef<number>(-1);
  const drawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<[number, number]>([0, 0]);

  // Image upload & pixel downscaling using canvasUtils helper
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onToast(t.scanInvalidFileToast);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      onToast(t.scanFileTooLargeToast);
      return;
    }

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    try {
      const extractedPixels = await processImageToPixels(file, canvas);
      if (extractedPixels) {
        setPixels(extractedPixels);
        setHasSelectedImage(true);
      } else {
        onToast(t.scanReadFailedToast);
      }
    } catch (err) {
      logger.error('Error handling uploaded file:', err);
      onToast(t.scanReadFailedToast);
    }
  };

  const handleScanImage = () => {
    if (!pixels) return;
    try {
      const res = bridge.imageScan(pixels, imgMode);
      setImageScanResult(res);
    } catch (err) {
      logger.error('Error in bridge.imageScan:', err);
      onToast(t.commonErrorRetry);
    }
  };

  // Draw parchment canvas background using modularized canvasUtils
  const redrawParchment = useCallback((drawn: boolean) => {
    const cv = sigCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    renderParchmentBackground(ctx, cv.width, cv.height, drawn);
  }, []);

  // Signature Canvas setup
  useEffect(() => {
    redrawParchment(false);
  }, [redrawParchment]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = sigCanvasRef.current;
    if (!cv) return;
    try {
      cv.setPointerCapture(e.pointerId);
    } catch (err) {
      logger.debug('Pointer capture error:', err);
    }
    drawingRef.current = true;
    strokeRef.current += 1;
    const [x, y] = getPointerPosOnCanvas(cv, e.clientX, e.clientY);
    lastPosRef.current = [x, y];

    const ctx = cv.getContext('2d');
    if (ctx) {
      if (ptsRef.current.length === 0) {
        redrawParchment(true);
      }
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#1c0c05';
      ctx.fill();
    }

    ptsRef.current.push([(x * 1000) / cv.width, (y * 1000) / cv.height, strokeRef.current]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const cv = sigCanvasRef.current;
    if (!cv) return;
    const [x, y] = getPointerPosOnCanvas(cv, e.clientX, e.clientY);
    const [lx, ly] = lastPosRef.current;
    if (Math.hypot(x - lx, y - ly) < 2 || ptsRef.current.length > 6000) return;

    const ctx = cv.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#1c0c05';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    lastPosRef.current = [x, y];
    ptsRef.current.push([(x * 1000) / cv.width, (y * 1000) / cv.height, strokeRef.current]);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const handleClearSignature = () => {
    redrawParchment(false);
    ptsRef.current = [];
    strokeRef.current = -1;
    setSigResult(null);
  };

  const handleAnalyzeSignature = () => {
    if (ptsRef.current.length < 8) {
      onToast(t.scanSigTooShortToast);
      return;
    }
    try {
      const res = bridge.signature(ptsRef.current);
      setSigResult(res);
    } catch (err) {
      logger.error('Error in bridge.signature:', err);
      onToast(t.commonErrorRetry);
    }
  };

  return (
    <section id="tab-scan" className="ritual-frameless-stage tab" role="tabpanel">
      <div className="scan-grid">
        {/* Interactive Handwriting / Signature Pad */}
        <div className="card scan-card-primary">
          <div className="card-title-row">
            <h3>{t.scanSigTitle}</h3>
            <span className="card-tag-pill">{t.scanSigPill}</span>
          </div>
          <p className="card-sub-hint">{t.scanSigHint}</p>

          <div className="sig-canvas-box">
            <canvas
              ref={sigCanvasRef}
              id="sig"
              className="sig"
              width={640}
              height={260}
              aria-label={t.scanSigCanvasAria}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>

          <div className="row center-actions">
            <button
              id="btn-sig-clear"
              className="btn ghost btn-sig-action"
              type="button"
              onClick={handleClearSignature}
            >
              {t.scanSigClearBtn}
            </button>
            <button
              id="btn-sig"
              className="btn primary btn-sig-action"
              type="button"
              onClick={handleAnalyzeSignature}
            >
              {t.scanSigAnalyzeBtn}
            </button>
          </div>

          {sigResult && (
            <article id="sig-result" className="result" aria-live="polite">
              <h3>{t.scanSigResultTitle}</h3>
              {sigResult.traits.map((trait, idx) => (
                <p key={idx}>• {trait}</p>
              ))}
              {lang !== 'th' && (
                <p className="note" style={{ marginBottom: '0.5rem' }}>
                  {t.oracleThaiFallbackNote}
                </p>
              )}
              <ScoreBars
                scores={[
                  { key: 'wealth', label: t.scanBarWealth, score: sigResult.scores.wealth },
                  { key: 'love', label: t.scanBarLove, score: sigResult.scores.love },
                  { key: 'career', label: t.scanBarCareer, score: sigResult.scores.career },
                  { key: 'luck', label: t.scanBarLuck, score: sigResult.scores.luck },
                ]}
              />
              <p className="note">{format(t.scanSigStrokesNote, { strokes: sigResult.strokes })}</p>
            </article>
          )}
        </div>

        {/* Image / Photo Scan */}
        <div className="card scan-card-secondary">
          <div className="card-title-row">
            <h3>{t.scanImgTitle}</h3>
            <span className="card-tag-pill">{t.scanImgPill}</span>
          </div>
          <p className="card-sub-hint">{t.scanImgHint}</p>

          <div className="pills scan-mode-pills" role="radiogroup" aria-label={t.scanImgTypeAria}>
            <button
              type="button"
              role="radio"
              aria-checked={imgMode === 0}
              className={`pill ${imgMode === 0 ? 'active' : ''}`}
              onClick={() => setImgMode(0)}
            >
              {t.scanImgFace}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={imgMode === 1}
              className={`pill ${imgMode === 1 ? 'active' : ''}`}
              onClick={() => setImgMode(1)}
            >
              {t.scanImgPalm}
            </button>
          </div>
          <label className="drop" htmlFor="in-image">
            <input
              id="in-image"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
            <span id="drop-text">{hasSelectedImage ? t.scanDropSelected : t.scanDropPrompt}</span>
            <canvas
              ref={previewCanvasRef}
              id="img-preview"
              width={64}
              height={64}
              style={{ display: pixels ? 'block' : 'none' }}
            />
          </label>
          <button
            id="btn-scan"
            className="btn primary"
            type="button"
            disabled={!pixels}
            onClick={handleScanImage}
          >
            {t.scanBtn}
          </button>

          {imageScanResult && (
            <article id="scan-result" className="result" aria-live="polite">
              <h3>
                {format(t.scanResultElement, {
                  element: getLocalizedElementName(imageScanResult.element, lang),
                })}
              </h3>
              <p>{imageScanResult.reading}</p>
              {lang !== 'th' && (
                <p className="note" style={{ marginBottom: '0.5rem' }}>
                  {t.oracleThaiFallbackNote}
                </p>
              )}
              <ScoreBars
                scores={[
                  { key: 'wealth', label: t.scanBarWealth, score: imageScanResult.scores.wealth },
                  { key: 'love', label: t.scanBarLove, score: imageScanResult.scores.love },
                  { key: 'health', label: t.scanBarHealth, score: imageScanResult.scores.health },
                  { key: 'career', label: t.scanBarCareer, score: imageScanResult.scores.career },
                ]}
              />
              <p className="note">
                {format(t.scanFingerprintNote, { fingerprint: imageScanResult.fingerprint })}
              </p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};

