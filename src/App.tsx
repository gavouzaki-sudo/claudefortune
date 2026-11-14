import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Bridge } from './bridge';
import type { UserSession, DivinationTopic } from './types';
import { useToast } from './hooks/useToast';
import { useThemeManager } from './hooks/useThemeManager';
import { useFortuneJournal } from './hooks/useFortuneJournal';
import { logger } from './utils/logger';
import { ZODIAC_SYSTEMS } from './data/zodiacSystems';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Ambient } from './components/Ambient';
import { Gate } from './components/Gate';
import { HorizontalRitualMenu } from './components/HorizontalRitualMenu';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Fireworks, type FireworksHandle } from './components/Fireworks';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ambientSoundEngine } from './utils/ambientSoundscapes';
import { spiritualSpeechEngine } from './utils/spiritualSpeech';
import { stopChant } from './utils/chantAudio';
import type { CardData } from './utils/luckyCardCanvas';

const FortuneCanvasBackground = lazy(() =>
  import('./components/FortuneCanvasBackground').then((m) => ({ default: m.FortuneCanvasBackground }))
);
const SiameseSticks = lazy(() =>
  import('./components/SiameseSticks').then((m) => ({ default: m.SiameseSticks }))
);
const Tarot = lazy(() => import('./components/Tarot').then((m) => ({ default: m.Tarot })));
const LuckyNumbers = lazy(() =>
  import('./components/LuckyNumbers').then((m) => ({ default: m.LuckyNumbers }))
);
const Rituals = lazy(() => import('./components/Rituals').then((m) => ({ default: m.Rituals })));
const ScanFortune = lazy(() =>
  import('./components/ScanFortune').then((m) => ({ default: m.ScanFortune }))
);
const LoveFortune = lazy(() =>
  import('./components/LoveFortune').then((m) => ({ default: m.LoveFortune }))
);
const FestivalStage = lazy(() =>
  import('./components/FestivalStage').then((m) => ({ default: m.FestivalStage }))
);
const LoyKrathong3D = lazy(() =>
  import('./components/LoyKrathong3D').then((m) => ({ default: m.LoyKrathong3D }))
);
const CoffinCard = lazy(() =>
  import('./components/CoffinCard').then((m) => ({ default: m.CoffinCard }))
);
const MeditationChamber = lazy(() =>
  import('./components/MeditationChamber').then((m) => ({ default: m.MeditationChamber }))
);
const AuspiciousCalendar = lazy(() =>
  import('./components/AuspiciousCalendar').then((m) => ({ default: m.AuspiciousCalendar }))
);
const LuckyCardModal = lazy(() =>
  import('./components/LuckyCardModal').then((m) => ({ default: m.LuckyCardModal }))
);
const FortuneJournalModal = lazy(() =>
  import('./components/FortuneJournalModal').then((m) => ({ default: m.FortuneJournalModal }))
);
const ThaiLotteryModal = lazy(() =>
  import('./components/ThaiLotteryModal').then((m) => ({ default: m.ThaiLotteryModal }))
);

export const App: React.FC = () => {
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [tab, setTab] = useState<DivinationTopic>(() => {
    try {
      const saved = sessionStorage.getItem('shrine.activeTab');
      if (
        saved &&
        [
          'festival',
          'auspicious',
          'stick',
          'tarot',
          'number',
          'ritual',
          'love',
          'scan',
          'meditation',
          'krathong',
          'coffin',
        ].includes(saved)
      ) {
        return saved as DivinationTopic;
      }
    } catch {
      // Ignore
    }
    return 'festival';
  });
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
        b.seed();
        setBridge(b);

        // Gate (Civilization) is the initial home page
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
    setSession(null);
    try {
      sessionStorage.removeItem('shrine.activeTab');
    } catch {
      // Ignore
    }
  }, []);

  const createDefaultGuestSession = useCallback((): UserSession | null => {
    if (!bridge) return null;
    const nowCe = new Date().getFullYear();
    const curBe = nowCe + 543;
    const thaiSys = ZODIAC_SYSTEMS.find((s) => s.id === 'thai');
    const defaultZ = thaiSys ? thaiSys.calculateFromYear(nowCe) : (((nowCe - 4) % 12) + 12) % 12;
    const zodItem = thaiSys?.items[defaultZ];
    const z = bridge.initSession(zodItem?.origName || 'มะเมีย', curBe, defaultZ);
    const resolvedZ = z >= 0 ? z : defaultZ;
    const info = bridge.zodiacInfo(resolvedZ);
    return {
      systemId: 'thai',
      systemName: thaiSys?.name || 'ไทย (12 นักษัตร)',
      symbolName: zodItem?.name || 'มะเมีย (ม้าแก้ว)',
      symbolIcon: zodItem?.symbol || '🐎',
      element: zodItem?.element || 'ไฟ / ทองคำ',
      aura: zodItem?.aura || 'ทองคำเรืองรอง',
      attribute: zodItem?.attribute || 'โชคลาภบารมี',
      year: curBe,
      zodiac: resolvedZ,
      info,
    };
  }, [bridge]);

  const openGuestTab = useCallback(
    (targetTab: 'festival' | 'auspicious') => {
      spiritualSpeechEngine.stop();
      stopChant();
      if (!session) {
        const guestSession = createDefaultGuestSession();
        if (guestSession) setSession(guestSession);
      }
      setTab(targetTab);
      try {
        sessionStorage.setItem('shrine.activeTab', targetTab);
      } catch {
        // Ignore
      }
    },
    [createDefaultGuestSession, session]
  );

  const handleOpenFestival = useCallback(() => openGuestTab('festival'), [openGuestTab]);
  const handleOpenAuspicious = useCallback(() => openGuestTab('auspicious'), [openGuestTab]);

  return (
    <LanguageProvider>
      <ErrorBoundary fallbackMessage="เกิดข้อผิดพลาดในการโหลดองค์ประกอบศาลเจ้า">
        <Ambient themeKey={activeThemeId} />
        <Header
          onGoHome={handleSessionChange}
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
                    b.seed();
                    setBridge(b);
                  } catch (e) {
                    logger.error('Retry bridge load failed:', e);
                    setLoadError(
                      'ไม่สามารถโหลดแกนระบบ (WebAssembly) ได้ — โปรดใช้เบราว์เซอร์รุ่นใหม่และเปิดผ่านเว็บเซิร์ฟเวอร์'
                    );
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
              <ErrorBoundary fallbackMessage="เกิดข้อผิดพลาดบริเวณหน้าอารยธรรม">
                <Gate
                  bridge={bridge}
                  onSessionStart={(s) => {
                    setSession(s);
                    setTab('stick');
                    try {
                      sessionStorage.setItem('shrine.activeTab', 'stick');
                    } catch {
                      // Ignore
                    }
                  }}
                />
              </ErrorBoundary>
              <div className="gate-bottom-journal-row">
                <button
                  type="button"
                  className="btn gold btn-bottom-journal btn-gate-festival"
                  onClick={handleOpenFestival}
                  title="ไหว้พระขอพร มหามงคล 9 วัด ทั่วไทย"
                >
                  <span>ไหว้พระ</span>
                </button>

                <button
                  type="button"
                  className="btn gold btn-bottom-journal btn-gate-calendar"
                  onClick={handleOpenAuspicious}
                  title="ปฏิทินวันมงคลและฤกษ์งามยามดี"
                >
                  <span>ดูฤกษ์</span>
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
                  <span>ดวง</span>
                  {journalCount > 0 && <span className="header-journal-badge">{journalCount}</span>}
                </button>
              </div>
              <Footer />
            </>
          )}

          {!loadError && bridge && session && (
            <div id="app">
              <Suspense fallback={null}>
                <FortuneCanvasBackground
                  activeTopic={tab}
                  tarotVariant={tarotVariant}
                  onToggleTarotVariant={() => setTarotVariant((v) => (v === 0 ? 1 : 0))}
                />
              </Suspense>

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
                  try {
                    sessionStorage.setItem('shrine.activeTab', selected);
                  } catch {
                    // Ignore
                  }
                  setTab(selected);
                }}
              />

              <div className="ritual-active-wrapper">
                <ErrorBoundary fallbackMessage="เกิดข้อผิดพลาดชั่วคราวในพิธีกรรมส่วนนี้">
                  <Suspense
                    fallback={
                      <section className="panel shrine-loading-panel">
                        <div className="shrine-gate-loader">
                          <span className="shrine-loader-emblem" aria-hidden="true">🏮</span>
                          <p className="shrine-loader-sub">กำลังจัดเตรียมพิธีกรรม...</p>
                        </div>
                      </section>
                    }
                  >
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

                    {tab === 'krathong' && (
                      <section id="tab-krathong" className="ritual-frameless-stage tab krathong-ritual-stage" role="tabpanel">
                        <LoyKrathong3D
                          bridge={bridge}
                          onToast={showToast}
                          onLaunchFireworks={(b) => fireworksRef.current?.launch(b)}
                        />
                      </section>
                    )}

                    {tab === 'coffin' && (
                      <CoffinCard
                        bridge={bridge}
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
                        onOpenCard={handleOpenCard}
                      />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </div>

              <Footer />
            </div>
          )}
        </main>

        <Toast message={toastMsg} />
        <Fireworks ref={fireworksRef} />

        <Suspense fallback={null}>
          {isCardModalOpen && (
            <LuckyCardModal
              isOpen={isCardModalOpen}
              cardData={activeCardData}
              onClose={() => setIsCardModalOpen(false)}
              onToast={showToast}
            />
          )}

          {isJournalOpen && (
            <FortuneJournalModal
              isOpen={isJournalOpen}
              onClose={() => setIsJournalOpen(false)}
              onOpenCard={handleOpenCard}
              onToast={showToast}
            />
          )}

          {isLotteryOpen && (
            <ThaiLotteryModal
              isOpen={isLotteryOpen}
              onClose={() => setIsLotteryOpen(false)}
              onToast={showToast}
            />
          )}
        </Suspense>

        <OfflineIndicator />
      </ErrorBoundary>
    </LanguageProvider>
  );
};
