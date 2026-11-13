import React, { useState, useEffect, useRef } from 'react';
import { generateLuckyCardBlob, type CardData } from '../utils/luckyCardCanvas';
import { useLanguage } from '../context/LanguageContext';

interface LuckyCardModalProps {
  cardData: CardData | null;
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const LuckyCardModal: React.FC<LuckyCardModalProps> = ({
  cardData,
  isOpen,
  onClose,
  onToast,
}) => {
  const { t } = useLanguage();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const activeUrlRef = useRef<string | null>(null);
  const onToastRef = useRef(onToast);
  onToastRef.current = onToast;

  useEffect(() => {
    const revokeActiveUrl = () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
    };

    if (!isOpen || !cardData) {
      revokeActiveUrl();
      setImageUrl(null);
      setImageBlob(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    generateLuckyCardBlob(cardData)
      .then((blob) => {
        if (isCancelled) return;
        revokeActiveUrl();
        const url = URL.createObjectURL(blob);
        activeUrlRef.current = url;
        setImageBlob(blob);
        setImageUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!isCancelled) {
          setLoading(false);
          onToastRef.current('ไม่สามารถสร้างรูปการ์ดได้ โปรดลองอีกครั้ง');
        }
      });

    return () => {
      isCancelled = true;
      revokeActiveUrl();
    };
  }, [isOpen, cardData]);

  if (!isOpen || !cardData) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `lucky-card-${cardData.type}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast('บันทึกรูปภาพมงคลลงในอุปกรณ์แล้ว 🎴');
  };

  const handleShare = async () => {
    if (!imageBlob) return;
    const file = new File([imageBlob], `lucky-fortune-${Date.now()}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: t.cardTitle,
          text: `${cardData.title} — บันทึกดวงชะตาจากศาลเจ้าแห่งโชคลาภ`,
          files: [file],
        });
        onToast(t.cardShareSuccess);
      } catch (err: unknown) {
        // User cancelled or aborted
        if ((err as Error)?.name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      // Fallback to direct download
      handleDownload();
    }
  };

  const handleCopy = async () => {
    if (!imageBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': imageBlob }),
        ]);
        onToast(t.cardCopied);
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div
      className="lucky-card-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.cardTitle}
    >
      <div
        className="lucky-card-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lucky-card-header">
          <div className="lucky-card-title-group">
            <span className="lucky-card-icon">🎴</span>
            <div>
              <h3>{t.cardTitle}</h3>
              <p className="lucky-card-sub">{cardData.title}</p>
            </div>
          </div>
          <button
            type="button"
            className="lucky-card-close-btn"
            onClick={onClose}
            aria-label={t.cardClose}
          >
            ✕
          </button>
        </div>

        <div className="lucky-card-body">
          {loading ? (
            <div className="lucky-card-loader">
              <span className="card-spin-emblem">⛩️</span>
              <p>{t.cardGenerating}</p>
            </div>
          ) : (
            imageUrl && (
              <div className="lucky-card-preview-wrapper">
                <img
                  src={imageUrl}
                  alt="Lucky Fortune Card"
                  className="lucky-card-img"
                />
              </div>
            )
          )}
        </div>

        <div className="lucky-card-actions">
          <button
            type="button"
            className="btn gold lucky-card-action-btn"
            onClick={handleDownload}
            disabled={loading}
          >
            <span>{t.cardSavePng}</span>
          </button>

          <button
            type="button"
            className="btn primary lucky-card-action-btn"
            onClick={handleShare}
            disabled={loading}
          >
            <span>{t.cardShare}</span>
          </button>

          <button
            type="button"
            className="btn ghost lucky-card-action-btn"
            onClick={handleCopy}
            disabled={loading}
          >
            <span>{t.cardCopy}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
