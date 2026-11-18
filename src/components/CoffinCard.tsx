import React, { useState, useRef, useEffect } from 'react';
import type { Bridge } from '../bridge';
import type { TarotCard, BlessingResult } from '../types';
import { SpiritualTTSPlayer } from './SpiritualTTSPlayer';
import { saveJournalEntry } from '../utils/fortuneJournal';
import { buildTarotCardData, TAROT_GLYPHS } from '../utils/cardDataBuilder';
import type { CardData } from '../utils/luckyCardCanvas';
import { playWoodClatter } from '../utils/chantAudio';
import { logger } from '../utils/logger';
import { pad2 } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedTarotTitle } from '../data/ritualProphecies';
import {
  getLocalizedTarotMeaning,
  getTarotTtsName,
} from '../data/locales/propheciesDivination';
import { getLocalizedFestivalBlessing } from '../data/locales/propheciesRituals';

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
  const { t, lang } = useLanguage();
  const [coffinOpen, setCoffinOpen] = useState(false);
  const [coffinCard, setCoffinCard] = useState<TarotCard | null>(null);
  const [blessing, setBlessing] = useState<BlessingResult | null>(null);
  const [coffinSetIdx, setCoffinSetIdx] = useState<number>(() => bridge.getWeeklySetIndex());
  const [isLoading, setIsLoading] = useState(false);
  const [isJournalSaved, setIsJournalSaved] = useState(false);
  const isMountedRef = useRef(true);
  const openTimerRef = useRef<number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (openTimerRef.current !== null) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    };
  }, []);

  const handleToggleCoffin = async () => {
    if (isLoading) return;

    if (coffinOpen) {
      if (openTimerRef.current !== null) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      playWoodClatter();
      setCoffinOpen(false);
      setCoffinCard(null);
      setBlessing(null);
      setIsJournalSaved(false);
      return;
    }

    playWoodClatter();
    setCoffinOpen(true);
    setIsLoading(true);
    setIsJournalSaved(false);

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    await new Promise<void>((resolve) => {
      if (openTimerRef.current !== null) clearTimeout(openTimerRef.current);
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        resolve();
      }, reduceMotion ? 100 : 700);
    });
    if (!isMountedRef.current) return;

    try {
      const tarot = bridge.drawTarot(1);
      const card = tarot.cards[0];
      setCoffinCard(card);
      setCoffinSetIdx(bridge.getWeeklySetIndex());

      const b = bridge.blessing(2);
      setBlessing(b);
      onToast(t.coffinToastOpened);
    } catch (err) {
      logger.error('Error in CoffinCard ritual:', err);
      onToast(t.commonErrorRetry);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const localizedMeaning = coffinCard
    ? getLocalizedTarotMeaning(coffinCard.id, coffinCard.reversed, coffinSetIdx, lang, coffinCard.meaning)
    : '';
  const localizedBlessing = blessing
    ? getLocalizedFestivalBlessing(2, coffinSetIdx, lang, {
        title: blessing.title,
        text: blessing.text,
      })
    : null;

  const buildAndSaveCoffinReading = (): CardData | null => {
    if (!coffinCard) return null;

    const localizedTitle = getLocalizedTarotTitle(
      coffinCard.id,
      coffinCard.name,
      coffinCard.en,
      lang
    );

    const { cardData, details } = buildTarotCardData(
      [{ ...coffinCard, meaning: localizedMeaning }],
      1,
      TAROT_GLYPHS,
      { 1: [t.coffinPosTitle.replace(/✨/g, '').trim()] },
      lang
    );
    cardData.title = `${t.coffinTitle} · ${localizedTitle}`;

    if (!isJournalSaved) {
      const orientText = coffinCard.reversed ? t.tarotReversed : t.tarotUpright;
      saveJournalEntry({
        type: 'tarot',
        title: cardData.title,
        summary: `${localizedTitle} (${orientText}) · ${localizedMeaning}`,
        details,
      });
      setIsJournalSaved(true);
      onToast(t.savedToJournal);
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

  const localizedCardName = coffinCard
    ? getLocalizedTarotTitle(coffinCard.id, coffinCard.name, coffinCard.en, lang)
    : '';
  const ttsCardName = coffinCard
    ? getTarotTtsName(coffinCard.id, coffinCard.name, coffinCard.en, lang)
    : '';

  return (
    <section id="tab-coffin" className="ritual-frameless-stage tab coffin-ritual-stage" role="tabpanel">
      <div className="coffin-ritual-header" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: 'var(--gold)', margin: '0 0 0.35rem' }}>
          {t.coffinTitle}
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, maxWidth: '480px', marginInline: 'auto' }}>
          {t.coffinLead}
        </p>
      </div>

      <div className="fest-stage stage-coffin-active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Coffin 3D Model Box */}
        <div
          className={`coffin ${coffinOpen ? 'open' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={coffinOpen ? t.coffinCloseAria : t.coffinOpenAria}
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
            ? t.coffinHintLoading
            : coffinOpen
            ? t.coffinHintOpen
            : t.coffinHintClosed}
        </p>

        {/* Revealed Coffin Card */}
        {coffinCard && (
          <div className="coffin-card" style={{ width: '100%', maxWidth: '420px', marginTop: '1.2rem' }}>
            <div className="tslot revealed" style={{ width: '100%', margin: '0 auto' }}>
              <div className="pos" style={{ fontWeight: 600, color: 'var(--gold)' }}>
                {t.coffinPosTitle}
              </div>

              <div className="tcard flipped" style={{ margin: '0.5rem auto' }}>
                <div className="tcard-in">
                  <div className="tface tback" />
                  <div className={`tface tfront ${coffinCard.reversed ? 'rev' : ''}`}>
                    <div className="num">{pad2(coffinCard.id)}</div>
                    <div className="glyph">{TAROT_GLYPHS[coffinCard.id] || '🎴'}</div>
                    <div>
                      <div className="nm">{localizedCardName}</div>
                      {lang !== 'en' && <div className="en">{coffinCard.en}</div>}
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
                      {t.coffinReversedBadge}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      {t.coffinUprightBadge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.88rem', lineHeight: '1.5', color: '#e0d8cc' }}>
                  {localizedMeaning}
                </div>

                {blessing && localizedBlessing && (
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
                      🙏 {localizedBlessing.title || t.coffinBlessingDefaultTitle}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.85)' }}>{localizedBlessing.text}</div>
                    {blessing.lucky && (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#fdd835' }}>
                        {t.coffinLuckyPrefix} <strong>{blessing.lucky}</strong>
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
                title={t.coffinSaveShareTitle}
              >
                {t.saveAndShareBtn}
              </button>

              <button
                type="button"
                className="btn primary"
                onClick={handleSaveOnly}
                disabled={isJournalSaved}
                title={t.coffinSaveJournalTitle}
              >
                {isJournalSaved ? t.journalSavedBtn : t.journalSaveBtn}
              </button>

              <button
                type="button"
                className="btn"
                onClick={handleToggleCoffin}
                title={t.coffinRedrawTitle}
              >
                {t.coffinRedrawBtn}
              </button>
            </div>

            {/* Spiritual TTS Player for reading Coffin Oracle */}
            <div style={{ marginTop: '1.5rem', width: '100%' }}>
              <SpiritualTTSPlayer
                textToRead={[
                  t.coffinTitle,
                  ttsCardName,
                  coffinCard.reversed ? t.tarotReversed : t.tarotUpright,
                  localizedMeaning,
                  localizedBlessing?.text || '',
                  blessing?.lucky ? `${t.coffinLuckyPrefix} ${blessing.lucky}` : '',
                ]
                  .filter(Boolean)
                  .join('\n\n')}
                title={t.coffinTtsTitle}
                subtitle={t.coffinTtsSubtitle}
                initialExpanded={false}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

