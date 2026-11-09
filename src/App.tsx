import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bridge } from './bridge';
import type { UserSession, DivinationTopic } from './types';
import { useToast } from './hooks/useToast';
import { useThemeManager } from './hooks/useThemeManager';
import { useFortuneJournal } from './hooks/useFortuneJournal';
import { safeStorage } from './utils/storage';
import { logger } from './utils/logger';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Ambient } from './components/Ambient';
import { Gate } from './components/Gate';
import { SiameseSticks } from './components/SiameseSticks';
import { Tarot } from './components/Tarot';
import { LuckyNumbers } from './components/LuckyNumbers';
import { Rituals } from './components/Rituals';
import { ScanFortune } from './components/ScanFortune';
import { LoveFortune } from './components/LoveFortune';
import { FestivalStage } from './components/FestivalStage';
import { FortuneCanvasBackground } from './components/FortuneCanvasBackground';
import { HorizontalRitualMenu } from './components/HorizontalRitualMenu';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Fireworks, type FireworksHandle } from './components/Fireworks';
import { MeditationChamber } from './components/MeditationChamber';
import { AuspiciousCalendar } from './components/AuspiciousCalendar';
import { LuckyCardModal } from './components/LuckyCardModal';
import { FortuneJournalModal } from './components/FortuneJournalModal';
import { ThaiLotteryModal } from './components/ThaiLotteryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ambientSoundEngine } from './utils/ambientSoundscapes';
import { spiritualSpeechEngine } from './utils/spiritualSpeech';
import { stopChant } from './utils/chantAudio';
import type { CardData } from './utils/luckyCardCanvas';

export const App: React.FC = () => {
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [tab, setTab] = useState<DivinationTopic>('stick');
  const [tarotVariant, setTarotVariant] = useState<0 | 1>(0);
  const fireworksRef = useRef<FireworksHandle>(null);

  // Custom Hooks
  const { toastMsg, showToast } = useToast();
  const { activeThemeId, festivalId } = useThemeManager(!!bridge);
  const { count: journalCount } = useFortuneJournal(true);

  // Modals
  const [activeCardData, setActiveCardData] = useState<CardData | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isLotteryOpen, setIsLotteryOpen] = useState(false);

  // Subscribe to spiritual speech engine notices (e.g. mobile audio guidance or fallback alerts)
  useEffect(() => {
    const unsub = spiritualSpeechEngine.onNotice((msg) => {
      showToast(msg);
    });
    return () => unsub();
  }, [showToast]);

  const handleOpenCard = useCallback((data: CardData) => {
    const enrichedData: CardData = {
      ...data,
      systemName: data.systemName || session?.systemName,
      symbolName: data.symbolName || session?.symbolName,
      symbolIcon: data.symbolIcon || session?.symbolIcon,
      element: data.element || session?.element,
      aura: data.aura || session?.aura,
    };
    setActiveCardData(enrichedData);
    setIsCardModalOpen(true);
  }, [session]);

  // Initialize bridge and restore saved session
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const b = await Bridge.load();
        if (!isMounted) return;
        b.setDate();
        setBridge(b);

        // Restore saved session safely
        const savedSessionRaw = safeStorage.get<Record<string, unknown> | null>('session', 'shrine.session', null);
        if (savedSessionRaw && savedSessionRaw.year && (savedSessionRaw.symbolName || savedSessionRaw.name)) {
          const symName = String(savedSessionRaw.symbolName || savedSessionRaw.name);
          const yearNum = Number(savedSessionRaw.year);
          const zodNum = Number(savedSessionRaw.zodiac ?? -1);
          const z = b.initSession(symName, yearNum, zodNum);
          if (z >= 0) {
            const info = b.zodiacInfo(z);
            setSession({
              systemId: String(savedSessionRaw.systemId || 'thai'),
              systemName: String(savedSessionRaw.systemName || 'ไทย (12 นักษัตร)'),
              symbolName: symName,
              symbolIcon: String(savedSessionRaw.symbolIcon || '✨'),
              element: String(savedSessionRaw.element || info.element || 'มงคล'),
              aura: String(savedSessionRaw.aura || info.color || 'ทองคำ'),
              attribute: String(savedSessionRaw.attribute || 'โชคลาภบารมี'),
              year: yearNum,
              zodiac: z,
              info,
            });
          }
        }
      } catch (err) {
        logger.error('Failed during initial bridge/session loading:', err);
        if (isMounted) {
          setLoadError(
            'ไม่สามารถโหลดแกนระบบ (WebAssembly) ได้ — โปรดใช้เบราว์เซอร์รุ่นใหม่และเปิดผ่านเว็บเซิร์ฟเวอร์'
          );
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSessionChange = useCallback(() => {
    spiritualSpeechEngine.stop();
    stopChant();
    ambientSoundEngine.setSoundscape('none');
    safeStorage.remove('session', 'shrine.session');
    setSession(null);
  }, []);

  const festInfo = bridge?.festivalInfo(festivalId);

  const handleOpenAuspicious = useCallback(() => {
    spiritualSpeechEngine.stop();
    stopChant();
    if (!session && bridge) {
      const symName = 'มะเมีย (ม้าแก้ว)';
      const z = bridge.initSession('มะเมีย', 2569, 6);
      const info = bridge.zodiacInfo(z >= 0 ? z : 6);
      setSession({
        systemId: 'thai',
        systemName: 'ไทย (12 นักษัตร)',
        symbolName: symName,
        symbolIcon: '🐎',
        element: 'ไฟ / ทองคำ',
        aura: 'ทองคำเรืองรอง',
        attribute: 'โชคลาภบารมี',
        year: 2569,
        zodiac: 6,
        info,
      });
    }
    setTab('auspicious');
  }, [bridge, session]);

  return (
    <LanguageProvider>
      <ErrorBoundary fallbackMessage="เกิดข้อผิดพลาดในการโหลดองค์ประกอบศาลเจ้า">
        <Ambient themeKey={activeThemeId} />
        <Header
          onGoHome={session ? handleSessionChange : undefined}
          hasActiveSession={!!session}
        />

        <main>
          {loadError && (
            <section className="panel gate shrine-loading-panel">
              <span className="shrine-loader-emblem" aria-hidden="true">⛩️</span>
              <p className="error" style={{ marginTop: '1rem', color: 'var(--warn, #ffb36b)' }}>{loadError}</p>
              <button
                type="button"
                className="btn gold"
                style={{ marginTop: '1.25rem' }}
                onClick={async () => {
                  setLoadError(null);
                  try {
                    const b = await Bridge.load();
                    b.setDate();
                    setBridge(b);
                  } catch (e) {
                    logger.error('Retry bridge load failed:', e);
                  }
                }}
              >
                เข้าสู่ศาลเจ้าอีกครั้ง
              </button>
            </section>
          )}

          {!loadError && !bridge && (
            <section className="panel gate shrine-loading-panel">
              <div className="shrine-gate-loader">
                <span className="shrine-loader-emblem" aria-hidden="true">⛩️</span>
                <h2 className="shrine-loader-title">กำลังเปิดประตูสู่ศาลเจ้าแห่งโชคลาภ</h2>
                <p className="shrine-loader-sub">กำลังเชื่อมต่อแกนญาณและคำนวณตำแหน่งดวงดาว...</p>
                <div className="shrine-loader-track">
                  <div className="shrine-loader-bar" />
                </div>
              </div>
            </section>
          )}

          {!loadError && bridge && !session && (
            <>
              <ErrorBoundary fallbackMessage="เกิดข้อผิดพลาดบริเวณหน้าซุ้มประตูศาลเจ้า">
                <Gate
                  bridge={bridge}
                  onSessionStart={(s) => {
                    setSession(s);
                    setTab('stick');
                  }}
                />
              </ErrorBoundary>
              <div className="gate-bottom-journal-row">
                <button
                  type="button"
                  className="btn gold btn-bottom-journal btn-gate-calendar"
                  onClick={handleOpenAuspicious}
                  title="ปฏิทินวันมงคลและฤกษ์งามยามดี"
                >
                  <span>ฤกษ์มงคล</span>
                </button>

                <button
                  type="button"
                  className="btn gold btn-bottom-journal btn-gate-lottery"
                  onClick={() => setIsLotteryOpen(true)}
                  title="ผลสลากกินแบ่งรัฐบาล & ตรวจหวย"
                >
                  <span>หวย</span>
                </button>

                <button
                  type="button"
                  className="btn gold btn-bottom-journal"
                  onClick={() => setIsJournalOpen(true)}
                  title="สมุดดวงชะตา"
                >
                  <span>สมุดดวง</span>
                  {journalCount > 0 && <span className="header-journal-badge">{journalCount}</span>}
                </button>
              </div>
            </>
          )}

          {!loadError && bridge && session && (
            <div id="app">
              <FortuneCanvasBackground
                activeTopic={tab}
                tarotVariant={tarotVariant}
                onToggleTarotVariant={() => setTarotVariant((v) => (v === 0 ? 1 : 0))}
              />

              <HorizontalRitualMenu
                activeTopic={tab}
                onSelectTopic={(selected) => {
                  if (selected !== tab) {
                    spiritualSpeechEngine.stop();
                    stopChant();
                  }
                  if (selected !== 'meditation') {
                    ambientSoundEngine.setSoundscape('none');
                  }
                  setTab(selected);
                }}
                festivalName={festInfo?.name}
              />

              <div className="ritual-active-wrapper">
                <ErrorBoundary fallbackMessage="เกิดข้อผิดพลาดชั่วคราวในพิธีกรรมส่วนนี้">
                  {tab === 'stick' && (
                    <SiameseSticks
                      bridge={bridge}
                      onToast={showToast}
                      onOpenCard={handleOpenCard}
                    />
                  )}

                  {tab === 'tarot' && (
                    <Tarot
                      bridge={bridge}
                      onToast={showToast}
                      onOpenCard={handleOpenCard}
                    />
                  )}

                  {tab === 'number' && (
                    <LuckyNumbers
                      bridge={bridge}
                      onToast={showToast}
                      onOpenCard={handleOpenCard}
                    />
                  )}

                  {tab === 'ritual' && (
                    <Rituals
                      bridge={bridge}
                      userZodiac={session.zodiac}
                      onToast={showToast}
                    />
                  )}

                  {tab === 'love' && (
                    <LoveFortune session={session} onToast={showToast} />
                  )}

                  {tab === 'scan' && (
                    <ScanFortune bridge={bridge} onToast={showToast} />
                  )}

                  {tab === 'meditation' && (
                    <MeditationChamber
                      systemId={session.systemId}
                      systemName={session.systemName}
                      onToast={showToast}
                    />
                  )}

                  {tab === 'auspicious' && (
                    <AuspiciousCalendar
                      onToast={showToast}
                      onOpenCard={handleOpenCard}
                    />
                  )}

                  {tab === 'festival' && (
                    <FestivalStage
                      bridge={bridge}
                      festivalId={festivalId}
                      onToast={showToast}
                      onLaunchFireworks={(b) => fireworksRef.current?.launch(b)}
                    />
                  )}
                </ErrorBoundary>
              </div>

            </div>
          )}
        </main>

        <Footer />
        <Toast message={toastMsg} />
        <Fireworks ref={fireworksRef} />

        <LuckyCardModal
          isOpen={isCardModalOpen}
          cardData={activeCardData}
          onClose={() => setIsCardModalOpen(false)}
          onToast={showToast}
        />

        <FortuneJournalModal
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          onOpenCard={handleOpenCard}
          onToast={showToast}
        />

        <ThaiLotteryModal
          isOpen={isLotteryOpen}
          onClose={() => setIsLotteryOpen(false)}
          onToast={showToast}
        />

        <OfflineIndicator />
      </ErrorBoundary>
    </LanguageProvider>
  );
};
