import React, { useState, useEffect, useRef } from 'react';
import { Bridge } from './bridge';
import type { UserSession } from './types';
import { MYSTICAL_THEMES } from './data/themes';
import { Header } from './components/Header';
import { Ambient } from './components/Ambient';
import { Gate } from './components/Gate';
import { SiameseSticks } from './components/SiameseSticks';
import { Tarot } from './components/Tarot';
import { LuckyNumbers } from './components/LuckyNumbers';
import { Rituals } from './components/Rituals';
import { ScanFortune } from './components/ScanFortune';
import { FestivalStage } from './components/FestivalStage';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Fireworks, type FireworksHandle } from './components/Fireworks';

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
  const [tab, setTab] = useState<'stick' | 'tarot' | 'number' | 'ritual' | 'scan' | 'festival'>('stick');
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
      const autoId = bridge.festival(now.getMonth() + 1, now.getDate());
      targetFestId = autoId;
      const festKeys = ['shrine', 'songkran', 'halloween', 'loy', 'cny', 'newyear'];
      targetThemeId = festKeys[autoId] || 'shrine';
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

  const handleRandomTheme = () => {
    const available = MYSTICAL_THEMES.filter((t) => t.id !== activeThemeId);
    const chosen = available[Math.floor(Math.random() * available.length)];
    if (chosen) {
      setTheme(chosen.id);
      showToast(`🎲 สลับมิติสู่ธีม: ${chosen.icon} ${chosen.name}`);
    }
  };

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
        theme={theme}
        onThemeChange={setTheme}
        onRandomTheme={handleRandomTheme}
      />

      <main>
        {loadError && (
          <section className="panel gate">
            <p className="error">{loadError}</p>
          </section>
        )}

        {!loadError && bridge && !session && (
          <Gate bridge={bridge} onSessionStart={setSession} />
        )}

        {!loadError && bridge && session && (
          <div id="app">
            {/* Who Am I Bar */}
            <div className="whoami mystical-whoami">
              <div className="whoami-symbol-badge">
                <span className="badge-icon">{session.symbolIcon}</span>
                <span className="badge-text">{session.symbolName}</span>
              </div>
              <span id="who">
                ระบบ: <b>{session.systemName}</b> (ปี {session.year}) · ธาตุ: <span className="highlight-pill">{session.element}</span> · ออร่า: <span className="highlight-pill">{session.aura}</span>
              </span>
              <button
                id="btn-change"
                className="link mystical-change-btn"
                type="button"
                onClick={handleSessionChange}
              >
                เปลี่ยนระบบ/สัญลักษณ์
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav id="tabs" className="tabs" role="tablist" aria-label="เมนูพิธี">
              <button
                role="tab"
                data-tab="stick"
                aria-selected={tab === 'stick'}
                onClick={() => setTab('stick')}
              >
                เสี่ยงเซียมซี
              </button>
              <button
                role="tab"
                data-tab="tarot"
                aria-selected={tab === 'tarot'}
                onClick={() => setTab('tarot')}
              >
                ไพ่ยิปซี
              </button>
              <button
                role="tab"
                data-tab="number"
                aria-selected={tab === 'number'}
                onClick={() => setTab('number')}
              >
                เลขมงคล
              </button>
              <button
                role="tab"
                data-tab="ritual"
                aria-selected={tab === 'ritual'}
                onClick={() => setTab('ritual')}
              >
                สะเดาะเคราะห์
              </button>
              <button
                role="tab"
                data-tab="scan"
                aria-selected={tab === 'scan'}
                onClick={() => setTab('scan')}
              >
                สแกนดวง
              </button>
              <button
                role="tab"
                data-tab="festival"
                id="tab-festival-btn"
                aria-selected={tab === 'festival'}
                onClick={() => setTab('festival')}
              >
                {activeThemeObj?.category === 'festival'
                  ? (festivalId === 0 ? 'ขอพร' : festInfo?.name || 'เทศกาล')
                  : activeThemeObj?.name || 'มิติศักดิ์สิทธิ์'}
              </button>
            </nav>

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

            {tab === 'scan' && (
              <ScanFortune bridge={bridge} onToast={showToast} />
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
        )}
      </main>

      <Footer />
      <Toast message={toastMsg} />
      <Fireworks ref={fireworksRef} />
    </>
  );
};
