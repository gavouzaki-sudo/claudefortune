import React, { useState } from 'react';
import type { Bridge } from '../bridge';
import type { TarotCard, BlessingResult } from '../types';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { saveJournalEntry } from '../utils/fortuneJournal';
import { buildTarotCardData, TAROT_GLYPHS } from '../utils/cardDataBuilder';
import type { CardData } from '../utils/luckyCardCanvas';
import { playWoodClatter } from '../utils/chantAudio';
import { logger } from '../utils/logger';
import { pad2 } from '../utils/formatters';

interface CoffinCardProps {
  bridge: Bridge;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

export const CoffinCard: React.FC<CoffinCardProps> = ({
  bridge,
  onToast,
  onOpenCard,
}) => {
  const [coffinOpen, setCoffinOpen] = useState(false);
  const [coffinCard, setCoffinCard] = useState<TarotCard | null>(null);
  const [blessing, setBlessing] = useState<BlessingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJournalSaved, setIsJournalSaved] = useState(false);

  const handleToggleCoffin = async () => {
    if (isLoading) return;

    if (coffinOpen) {
      // Close coffin
      playWoodClatter();
      setCoffinOpen(false);
      setCoffinCard(null);
      setBlessing(null);
      setIsJournalSaved(false);
      return;
    }

    // Open coffin
    playWoodClatter();
    setCoffinOpen(true);
    setIsLoading(true);
    setIsJournalSaved(false);

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    await new Promise((r) => setTimeout(r, reduceMotion ? 100 : 700));

    try {
      const tarot = bridge.drawTarot(1);
      const card = tarot.cards[0];
      setCoffinCard(card);

      const b = bridge.blessing(2);
      setBlessing(b);
      onToast('⚰️ เปิดฝาโลงสำเร็จ ปรากฏไพ่ลิขิตชะตาเกิดใหม่');
    } catch (err) {
      logger.error('Error in CoffinCard ritual:', err);
      onToast('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const buildAndSaveCoffinReading = (): CardData | null => {
    if (!coffinCard) return null;

    const { cardData, details } = buildTarotCardData(
      [coffinCard],
      1,
      TAROT_GLYPHS,
      { 1: ['ไพ่จากโลงศพ'] }
    );
    cardData.title = `ไพ่จากโลงศพ · ${coffinCard.name}`;

    if (!isJournalSaved) {
      saveJournalEntry({
        type: 'tarot',
        title: cardData.title,
        summary: `${coffinCard.name}${coffinCard.reversed ? ' (กลับหัว)' : ' (หัวตั้ง)'} · ${coffinCard.meaning}`,
        details,
      });
      setIsJournalSaved(true);
      onToast('📖 บันทึกลงในสมุดดวงชะตาเรียบร้อยแล้ว');
    }

    return cardData;
  };

  const handleSaveAndShare = () => {
    const cardData = buildAndSaveCoffinReading();
    if (cardData && onOpenCard) {
      onOpenCard(cardData);
    }
  };

  const handleSaveOnly = () => {
    if (!isJournalSaved) {
      buildAndSaveCoffinReading();
    }
  };

  return (
    <section id="tab-coffin" className="ritual-frameless-stage tab coffin-ritual-stage" role="tabpanel">
      <div className="coffin-ritual-header" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: 'var(--gold)', margin: '0 0 0.35rem' }}>
          ⚰️ พิธีกรรมไพ่จากโลงศพ
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, maxWidth: '480px', marginInline: 'auto' }}>
          พิธีกรรมโบราณสะเดาะเคราะห์ต่อดวงชะตา ปลดปล่อยเรื่องร้ายลงในโลง แล้วเปิดฝาโลงรับไพ่แห่งการเกิดใหม่
        </p>
      </div>

      <div className="fest-stage stage-coffin-active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Coffin 3D Model Box */}
        <div
          className={`coffin ${coffinOpen ? 'open' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={coffinOpen ? 'แตะเพื่อปิดฝาโลง' : 'แตะเพื่อเปิดฝาโลงเสี่ยงทาย'}
          onClick={handleToggleCoffin}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleCoffin();
            }
          }}
          style={{ margin: '1rem auto' }}
        >
          <div className="box" />
          <div className="lid" />
        </div>

        <p className="hint" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
          {isLoading
            ? '🕯️ กำลังเปิดฝาโลงและทำพิธีสะเดาะเคราะห์...'
            : coffinOpen
            ? 'แตะโลงศพอีกครั้งเพื่อปิดฝาโลง'
            : 'แตะที่โลงศพเพื่อเปิดฝาและรับคำทำนายชะตาเกิดใหม่'}
        </p>

        {/* Revealed Coffin Card */}
        {coffinCard && (
          <div className="coffin-card" style={{ width: '100%', maxWidth: '420px', marginTop: '1.2rem' }}>
            <div className="tslot revealed" style={{ width: '100%', margin: '0 auto' }}>
              <div className="pos" style={{ fontWeight: 600, color: 'var(--gold)' }}>
                ✨ ไพ่ลิขิตฟ้าจากโลงศพ ✨
              </div>

              <div className="tcard flipped" style={{ margin: '0.5rem auto' }}>
                <div className="tcard-in">
                  <div className="tface tback" />
                  <div className={`tface tfront ${coffinCard.reversed ? 'rev' : ''}`}>
                    <div className="num">{pad2(coffinCard.id)}</div>
                    <div className="glyph">{TAROT_GLYPHS[coffinCard.id] || '🎴'}</div>
                    <div>
                      <div className="nm">{coffinCard.name}</div>
                      <div className="en">{coffinCard.en}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="tmean"
                style={{
                  opacity: 1,
                  maxWidth: '380px',
                  margin: '0.75rem auto 0',
                  padding: '0.85rem 1rem',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '10px',
                  border: '1px solid var(--panel-line, rgba(212,175,55,0.25))',
                }}
              >
                <div style={{ marginBottom: '0.4rem' }}>
                  {coffinCard.reversed ? (
                    <span className="rv" style={{ color: 'var(--warn, #ffb36b)', fontWeight: 600 }}>
                      🔄 ไพ่กลับหัว (Reversed)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      ⚡ ไพ่หัวตั้ง (Upright)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.88rem', lineHeight: '1.5', color: '#e0d8cc' }}>
                  {coffinCard.meaning}
                </div>

                {blessing && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px dashed rgba(212,175,55,0.3)',
                      fontSize: '0.82rem',
                      color: 'var(--gold)',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                      🙏 {blessing.title || 'คำอวยพรสะเดาะเคราะห์เกิดใหม่'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.85)' }}>{blessing.text}</div>
                    {blessing.lucky && (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#fdd835' }}>
                        เลขมงคลต่อดวง: <strong>{blessing.lucky}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Save & Share, Save to Journal, Draw New */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.6rem',
                marginTop: '1.25rem',
              }}
            >
              <button
                type="button"
                className="btn gold"
                onClick={handleSaveAndShare}
                title="บันทึกภาพการ์ดมงคลและแชร์"
              >
                🎴 บันทึก&แชร์
              </button>

              <button
                type="button"
                className="btn primary"
                onClick={handleSaveOnly}
                disabled={isJournalSaved}
                title="บันทึกประวัติลงในสมุดดวงชะตา"
              >
                {isJournalSaved ? '✓ บันทึกในสมุดดวงแล้ว' : '📖 บันทึกลงสมุดดวง'}
              </button>

              <button
                type="button"
                className="btn"
                onClick={handleToggleCoffin}
                title="ปิดโลงและเริ่มเสี่ยงทายใหม่"
              >
                🔄 ปิดโลง & เสี่ยงทายใหม่
              </button>
            </div>

            {/* Spiritual TTS Player for reading Coffin Oracle */}
            <div style={{ marginTop: '1.5rem', width: '100%' }}>
              <SpiritualTTSPlayer
                textToRead={[
                  `พิธีกรรมไพ่จากโลงศพ ต่อดวงชะตาชีวิต`,
                  `ไพ่ที่ท่านเปิดได้คือ ${coffinCard.name} (${coffinCard.en})`,
                  coffinCard.reversed ? 'สถานะ: ไพ่กลับหัว' : 'สถานะ: ไพ่หัวตั้ง',
                  `คำทำนาย: ${coffinCard.meaning}`,
                  blessing?.text ? `คำอำนวยพรสะเดาะเคราะห์เกิดใหม่: ${blessing.text}` : '',
                  blessing?.lucky ? `เลขนำโชคต่อดวงชะตาคือ ${blessing.lucky}` : '',
                ]
                  .filter(Boolean)
                  .join('\n\n')}
                title="เสียงซินแสอ่านคำทำนายไพ่จากโลงศพ"
                subtitle="สดับรับฟังคำทำนายสะเดาะเคราะห์ต่อชะตาชีวิตเกิดใหม่"
                initialExpanded={false}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
