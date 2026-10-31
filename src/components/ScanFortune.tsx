import React, { useState, useRef, useEffect } from 'react';
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

  // Signature Canvas setup
  useEffect(() => {
    const cv = sigCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fbf1da';
    ctx.fillRect(0, 0, cv.width, cv.height);
  }, []);

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
    ptsRef.current.push([(x * 1000) / cv.width, (y * 1000) / cv.width, strokeRef.current]);

    const ctx = cv.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, 7);
      ctx.fillStyle = '#2a1208';
      ctx.fill();
    }
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
      ctx.strokeStyle = '#2a1208';
      ctx.lineWidth = 3.4;
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
      ctx.fillStyle = '#fbf1da';
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
    ptsRef.current = [];
    strokeRef.current = -1;
    setSigResult(null);
  };

  const handleAnalyzeSignature = () => {
    if (ptsRef.current.length < 8) {
      onToast('เซ็นชื่อให้ยาวขึ้นอีกนิดนะ');
      return;
    }
    try {
      const res = bridge.signature(ptsRef.current);
      setSigResult(res);
    } catch {
      onToast('เซ็นชื่อให้ยาวขึ้นอีกนิดนะ');
    }
  };

  return (
    <section id="tab-scan" className="panel tab" role="tabpanel">
      <h2 className="title">สแกนดวงชะตา</h2>
      <p className="lead privacy">
        🔒 ภาพและลายเซ็นถูกประมวลผลในเบราว์เซอร์ของคุณเท่านั้น ไม่มีการอัปโหลดหรือจัดเก็บ และไม่ได้ระบุตัวตนบุคคล — ใช้เพื่อความบันเทิง
      </p>

      <div className="scan-grid">
        {/* Image Scan */}
        <div className="card">
          <h3>สแกนใบหน้า / ลายมือ</h3>
          <div className="chips small" role="radiogroup" aria-label="ประเภทภาพ">
            <label className="chip">
              <input
                type="radio"
                name="imgmode"
                value="0"
                checked={imgMode === 0}
                onChange={() => setImgMode(0)}
              />
              <span>ใบหน้า</span>
            </label>
            <label className="chip">
              <input
                type="radio"
                name="imgmode"
                value="1"
                checked={imgMode === 1}
                onChange={() => setImgMode(1)}
              />
              <span>ลายมือ</span>
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

        {/* Signature */}
        <div className="card">
          <h3>ลายเซ็นมงคล</h3>
          <canvas
            ref={sigCanvasRef}
            id="sig"
            className="sig"
            width={640}
            height={260}
            aria-label="พื้นที่เซ็นชื่อ"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          <div className="row">
            <button
              id="btn-sig-clear"
              className="btn ghost"
              type="button"
              onClick={handleClearSignature}
            >
              ล้าง
            </button>
            <button
              id="btn-sig"
              className="btn primary"
              type="button"
              onClick={handleAnalyzeSignature}
            >
              วิเคราะห์ลายเซ็น
            </button>
          </div>

          {sigResult && (
            <article id="sig-result" className="result" aria-live="polite">
              <h3>ลายเซ็นของคุณบอกว่า…</h3>
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
              <p className="note">{sigResult.strokes} เส้น · เพื่อความบันเทิง</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};
