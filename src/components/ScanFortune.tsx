import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bridge } from '../bridge';
import type { ImageScanResult, SignatureResult } from '../types';

interface ScanFortuneProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
}

export const ScanFortune: React.FC<ScanFortuneProps> = ({ bridge, onToast }) => {
  // Image scan state
  const [imgMode, setImgMode] = useState<number>(0);
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [dropText, setDropText] = useState('แตะเพื่อเลือกหรือถ่ายภาพ');
  const [imageScanResult, setImageScanResult] = useState<ImageScanResult | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Signature state
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sigResult, setSigResult] = useState<SignatureResult | null>(null);
  const ptsRef = useRef<[number, number, number][]>([]);
  const strokeRef = useRef<number>(-1);
  const drawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<[number, number]>([0, 0]);

  // Image upload & pixel downscaling to 64x64 on canvas
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onToast('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      onToast('ไฟล์ใหญ่เกินไป (สูงสุด 15 MB)');
      return;
    }

    try {
      let bmp: ImageBitmap;
      try {
        bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch {
        bmp = await createImageBitmap(file);
      }

      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const s = Math.min(bmp.width, bmp.height);
      ctx.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 64, 64);
      bmp.close?.();

      const imgData = ctx.getImageData(0, 0, 64, 64);
      setPixels(imgData.data);
      setDropText('เลือกภาพแล้ว (ประมวลผลในเครื่องเท่านั้น)');
    } catch {
      onToast('อ่านรูปภาพไม่สำเร็จ ลองไฟล์อื่น');
    }
  };

  const handleScanImage = () => {
    if (!pixels) return;
    try {
      const res = bridge.imageScan(pixels, imgMode);
      setImageScanResult(res);
    } catch {
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    }
  };

  // Draw parchment canvas background with guidance line and placeholder
  const renderParchment = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, drawn: boolean) => {
    // Parchment paper fill
    ctx.fillStyle = '#fff9eb';
    ctx.fillRect(0, 0, width, height);

    // Decorative inner gold border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Dotted guideline for writing / signature
    ctx.strokeStyle = 'rgba(180, 140, 70, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(28, height * 0.65);
    ctx.lineTo(width - 28, height * 0.65);
    ctx.stroke();
    ctx.setLineDash([]);

    // Placeholder text if user hasn't written anything yet
    if (!drawn) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(110, 75, 30, 0.65)';
      ctx.font = 'bold 20px "Noto Sans Thai", sans-serif';
      ctx.fillText('✍️ จรดนิ้วหรือลากเมาส์ เขียนลายมือ / เซ็นชื่อที่นี่', width / 2, height * 0.42);

      ctx.font = '14px "Noto Sans Thai", sans-serif';
      ctx.fillStyle = 'rgba(130, 90, 45, 0.55)';
      ctx.fillText('เส้นบรรทัดนำสายตาสำหรับจรดปลายปากกา', width / 2, height * 0.74);
    }
  }, []);

  // Signature Canvas setup
  useEffect(() => {
    const cv = sigCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    renderParchment(ctx, cv.width, cv.height, false);
  }, [renderParchment]);

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const cv = sigCanvasRef.current!;
    const r = cv.getBoundingClientRect();
    const k = cv.width / r.width;
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = sigCanvasRef.current;
    if (!cv) return;
    cv.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokeRef.current += 1;
    const [x, y] = getCanvasPos(e);
    lastPosRef.current = [x, y];

    const ctx = cv.getContext('2d');
    if (ctx) {
      if (ptsRef.current.length === 0) {
        renderParchment(ctx, cv.width, cv.height, true);
      }
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#1c0c05';
      ctx.fill();
    }

    ptsRef.current.push([(x * 1000) / cv.width, (y * 1000) / cv.width, strokeRef.current]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const cv = sigCanvasRef.current;
    if (!cv) return;
    const [x, y] = getCanvasPos(e);
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
    ptsRef.current.push([(x * 1000) / cv.width, (y * 1000) / cv.width, strokeRef.current]);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const handleClearSignature = () => {
    const cv = sigCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (ctx) {
      renderParchment(ctx, cv.width, cv.height, false);
    }
    ptsRef.current = [];
    strokeRef.current = -1;
    setSigResult(null);
  };

  const handleAnalyzeSignature = () => {
    if (ptsRef.current.length < 8) {
      onToast('กรุณาเขียนลายมือหรือเซ็นชื่อให้ยาวขึ้นอีกนิดนะ');
      return;
    }
    try {
      const res = bridge.signature(ptsRef.current);
      setSigResult(res);
    } catch {
      onToast('เกิดข้อผิดพลาด ลองเขียนใหม่อีกครั้ง');
    }
  };

  return (
    <section id="tab-scan" className="ritual-frameless-stage tab" role="tabpanel">
      <h2 className="title">สแกนดวงชะตา</h2>
      <p className="lead privacy">
        🔒 ภาพและลายเซ็นถูกประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไม่มีการอัปโหลดหรือจัดเก็บ และไม่ได้ระบุตัวตนบุคคล — ใช้เพื่อความบันเทิง
      </p>

      <div className="scan-grid">
        {/* Interactive Handwriting / Signature Pad */}
        <div className="card scan-card-primary">
          <div className="card-title-row">
            <h3>✍️ กระดานเขียนลายมือ & ลายเซ็นสด</h3>
            <span className="card-tag-pill">เขียนสดบนหน้าจอ</span>
          </div>
          <p className="card-sub-hint">
            จรดปลายนิ้ว ปากกาสไตลัส หรือลากเมาส์เพื่อเขียนลายมือหรือลายเซ็นของคุณ
          </p>

          <div className="sig-canvas-box">
            <canvas
              ref={sigCanvasRef}
              id="sig"
              className="sig"
              width={640}
              height={260}
              aria-label="พื้นที่เขียนลายมือและเซ็นชื่อ"
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
              🔄 ล้างกระดานเขียนใหม่
            </button>
            <button
              id="btn-sig"
              className="btn primary btn-sig-action"
              type="button"
              onClick={handleAnalyzeSignature}
            >
              🔮 วิเคราะห์ลายมือ & ลายเซ็น
            </button>
          </div>

          {sigResult && (
            <article id="sig-result" className="result" aria-live="polite">
              <h3>ลายเซ็นและลายมือของคุณบอกว่า…</h3>
              {sigResult.traits.map((t, idx) => (
                <p key={idx}>• {t}</p>
              ))}
              <div className="bars">
                {[
                  { key: 'wealth' as const, label: 'โชคลาภ' },
                  { key: 'love' as const, label: 'ความรัก' },
                  { key: 'career' as const, label: 'การงาน' },
                  { key: 'luck' as const, label: 'โชคชะตา' },
                ].map(({ key, label }) => {
                  const score = sigResult.scores[key];
                  return (
                    <div key={key} className="bar">
                      <span>{label}</span>
                      <div className="track">
                        <div className="fill" style={{ width: `${score * 20}%` }} />
                      </div>
                      <b>{score}</b>
                    </div>
                  );
                })}
              </div>
              <p className="note">{sigResult.strokes} เส้นตวัด · วิเคราะห์เชิงโหงวเฮ้งเพื่อความบันเทิง</p>
            </article>
          )}
        </div>

        {/* Image / Photo Scan */}
        <div className="card scan-card-secondary">
          <div className="card-title-row">
            <h3>📷 ถ่ายภาพ / สแกน (ใบหน้า หรือ ภาพถ่ายฝ่ามือ)</h3>
            <span className="card-tag-pill">อัปโหลดไฟล์รูปภาพ</span>
          </div>
          <p className="card-sub-hint">
            เลือกภาพถ่ายใบหน้าหรือภาพถ่ายฝ่ามือ เพื่อให้ระบบคำนวณวิเคราะห์ธาตุและโหงวเฮ้ง
          </p>

          <div className="chips small" role="radiogroup" aria-label="ประเภทภาพ">
            <label className="chip">
              <input
                type="radio"
                name="imgmode"
                value="0"
                checked={imgMode === 0}
                onChange={() => setImgMode(0)}
              />
              <span>สแกนใบหน้า</span>
            </label>
            <label className="chip">
              <input
                type="radio"
                name="imgmode"
                value="1"
                checked={imgMode === 1}
                onChange={() => setImgMode(1)}
              />
              <span>สแกนภาพฝ่ามือ</span>
            </label>
          </div>
          <label className="drop" htmlFor="in-image">
            <input
              id="in-image"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
            <span id="drop-text">{dropText}</span>
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
            สแกนดวง
          </button>

          {imageScanResult && (
            <article id="scan-result" className="result" aria-live="polite">
              <h3>ธาตุประจำภาพ: {imageScanResult.element}</h3>
              <p>{imageScanResult.reading}</p>
              <div className="bars">
                {[
                  { key: 'wealth' as const, label: 'โชคลาภ' },
                  { key: 'love' as const, label: 'ความรัก' },
                  { key: 'health' as const, label: 'สุขภาพ' },
                  { key: 'career' as const, label: 'การงาน' },
                ].map(({ key, label }) => {
                  const score = imageScanResult.scores[key];
                  return (
                    <div key={key} className="bar">
                      <span>{label}</span>
                      <div className="track">
                        <div className="fill" style={{ width: `${score * 20}%` }} />
                      </div>
                      <b>{score}</b>
                    </div>
                  );
                })}
              </div>
              <p className="note">
                รหัสพลัง {imageScanResult.fingerprint} · เพื่อความบันเทิง ไม่ใช่การระบุตัวตนหรือการวินิจฉัย
              </p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};
