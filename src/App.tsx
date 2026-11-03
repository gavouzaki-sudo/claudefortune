import React, { useState, useEffect, useRef } from 'react';
import { Bridge } from './bridge';
import type { UserSession } from './types';
import { MYSTICAL_THEMES } from './data/themes';
import { detectSmartTheme } from './utils/smartTheme';
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
import { ambientSoundEngine } from './utils/ambientSoundscapes';
import type { DivinationTopic } from './types';

const FEST_INDEX_MAP: Record<string, number> = {
  shrine: 0,
  songkran: 1,
  halloween: 2,
  loy: 3,
  cny: 4,
  newyear: 5,
};

export const App: React.FC = () => {
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [theme, setTheme] = useState<string>('auto');
  const [activeThemeId, setActiveThemeId] = useState<string>('shrine');
  const [festivalId, setFestivalId] = useState<number>(0);
  const [tab, setTab] = useState<DivinationTopic>('stick');
  const [tarotVariant, setTarotVariant] = useState<0 | 1>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const fireworksRef = useRef<FireworksHandle>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  // Initialize bridge and restore saved session
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const b = await Bridge.load();
        if (!isMounted) return;
        b.setDate();
        setBridge(b);

        // Restore theme
        let savedTheme = 'auto';
        try {
          const t = sessionStorage.getItem('shrine.theme');
          if (t) savedTheme = JSON.parse(t);
        } catch {
          // Ignore
        }
        setTheme(savedTheme);

        // Restore session
        try {
          const s = sessionStorage.getItem('shrine.session');
          if (s) {
            const parsed = JSON.parse(s);
            if (parsed.year && (parsed.symbolName || parsed.name)) {
              const symName = parsed.symbolName || parsed.name;
              const z = b.initSession(symName, parsed.year, parsed.zodiac ?? -1);
              if (z >= 0) {
                const info = b.zodiacInfo(z);
                setSession({
                  systemId: parsed.systemId || 'thai',
                  systemName: parsed.systemName || 'ไทย (12 นักษัตร)',
                  symbolName: symName,
                  symbolIcon: parsed.symbolIcon || '✨',
                  element: parsed.element || info.element || 'มงคล',
                  aura: parsed.aura || info.color || 'ทองคำ',
                  attribute: parsed.attribute || 'โชคลาภบารมี',
                  year: parsed.year,
                  zodiac: z,
                  info,
                });
              }
            }
          }
        } catch {
          // Ignore
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setLoadError(
            'ไม่สามารถโหลดแกนระบบ (WebAssembly) ได้ — โปรดใช้เบราว์เซอร์รุ่นใหม่และเปิดผ่านเว็บเซิร์ฟเวอร์ (ไม่ใช่ไฟล์ตรงๆ)'
          );
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update theme, festival ID, and CSS variables
  useEffect(() => {
    if (!bridge) return;
    const now = new Date();

    let targetThemeId: string;
    let targetFestId = 0;

    if (theme === 'auto') {
      targetThemeId = detectSmartTheme();
      targetFestId = FEST_INDEX_MAP[targetThemeId] ?? 0;
    } else {
      targetThemeId = theme;
      targetFestId = FEST_INDEX_MAP[theme] ?? 0;
    }

    setActiveThemeId(targetThemeId);
    setFestivalId(targetFestId);

    // Apply data-theme attribute and custom CSS properties
    document.body.dataset.theme = targetThemeId;

    const matchedTheme = MYSTICAL_THEMES.find((t) => t.id === targetThemeId);
    if (matchedTheme) {
      const root = document.documentElement;
      root.style.setProperty('--bg', matchedTheme.bgColors.bg);
      root.style.setProperty('--bg2', matchedTheme.bgColors.bg2);
      root.style.setProperty('--panel', matchedTheme.bgColors.panel);
      root.style.setProperty('--panel-line', matchedTheme.bgColors.panelLine);
      root.style.setProperty('--gold', matchedTheme.bgColors.gold);
      root.style.setProperty('--gold2', matchedTheme.bgColors.gold2);
      root.style.setProperty('--red', matchedTheme.bgColors.red);
      root.style.setProperty('--glow', matchedTheme.bgColors.glow);
    }

    try {
      sessionStorage.setItem('shrine.theme', JSON.stringify(theme));
    } catch {
      // Ignore
    }
  }, [theme, bridge]);

  const handleSessionChange = () => {
    try {
      sessionStorage.removeItem('shrine.session');
    } catch {
      // Ignore
    }
    setSession(null);
  };

  const festInfo = bridge?.festivalInfo(festivalId);
  const activeThemeObj = MYSTICAL_THEMES.find((t) => t.id === activeThemeId);

  return (
    <>
      <Ambient themeKey={activeThemeId} />
      <Header
        onGoHome={session ? handleSessionChange : undefined}
        hasActiveSession={!!session}
      />

      <main>
        {loadError && (
          <section className="panel gate">
            <p className="error">{loadError}</p>
          </section>
        )}

        {!loadError && bridge && !session && (
          <Gate
            bridge={bridge}
            onSessionStart={(s) => {
              setSession(s);
              setTab('stick');
            }}
          />
        )}

        {!loadError && bridge && session && (
          <div id="app">
            {/* Background Canvas Scene directly visible behind all rituals */}
            <FortuneCanvasBackground
              activeTopic={tab}
              tarotVariant={tarotVariant}
              onToggleTarotVariant={() => setTarotVariant((v) => (v === 0 ? 1 : 0))}
            />

            {/* Horizontal Scroll Menu (Positioned at almost the very top) */}
            <HorizontalRitualMenu
              activeTopic={tab}
              onSelectTopic={(selected) => {
                if (selected !== 'meditation') {
                  ambientSoundEngine.setSoundscape('none');
                }
                setTab(selected);
              }}
              festivalName={festInfo?.name}
            />

            {/* Frameless Ritual Stage (Positioned directly under menu with a slight gap) */}
            <div className="ritual-active-wrapper">
              {tab === 'stick' && (
                <SiameseSticks bridge={bridge} onToast={showToast} />
              )}

              {tab === 'tarot' && (
                <Tarot bridge={bridge} onToast={showToast} />
              )}

              {tab === 'number' && (
                <LuckyNumbers bridge={bridge} onToast={showToast} />
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

              {tab === 'festival' && (
                <FestivalStage
                  bridge={bridge}
                  festivalId={festivalId}
                  onToast={showToast}
                  onLaunchFireworks={(b) => fireworksRef.current?.launch(b)}
                />
              )}
            </div>

            {/* Who Am I Bar (Positioned below the active ritual) */}
            <div className="whoami mystical-whoami bottom-whoami">
              <div className="whoami-symbol-badge">
                <span className="badge-icon">{session.symbolIcon}</span>
                <span className="badge-text">{session.symbolName}</span>
              </div>
              <span id="who">
                ระบบ: <b>{session.systemName}</b> (ปี {session.year}) · ธาตุ: <span className="highlight-pill">{session.element}</span> · ออร่า: <span className="highlight-pill">{session.aura}</span>
              </span>
            </div>

            {/* Bottom Return to Gate button */}
            <div className="bottom-home-return-row">
              <button
                type="button"
                className="btn ghost btn-return-home"
                onClick={handleSessionChange}
                title="กลับสู่หน้าหลัก"
              >
                <span>🏠 กลับหน้าหลัก</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <Toast message={toastMsg} />
      <Fireworks ref={fireworksRef} />
    </>
  );
};
