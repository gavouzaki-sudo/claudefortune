import React, { useState, useEffect, useRef } from 'react';
import { Bridge } from './bridge';
import type { UserSession } from './types';
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

const FEST_THEME = ["shrine", "songkran", "halloween", "loy", "cny", "newyear"];

export const App: React.FC = () => {
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [theme, setTheme] = useState<string>('auto');
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
            if (parsed.name && parsed.year) {
              const z = b.initSession(parsed.name, parsed.year, parsed.zodiac ?? -1);
              if (z >= 0) {
                const info = b.zodiacInfo(z);
                setSession({
                  name: parsed.name,
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

  // Update theme and festival ID
  useEffect(() => {
    if (!bridge) return;
    const now = new Date();
    const id =
      theme === 'auto'
        ? bridge.festival(now.getMonth() + 1, now.getDate())
        : Math.max(0, FEST_THEME.indexOf(theme));

    setFestivalId(id);
    const key = FEST_THEME[id] || 'shrine';
    document.body.dataset.theme = key;

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

  const currentThemeKey = FEST_THEME[festivalId] || 'shrine';
  const festInfo = bridge?.festivalInfo(festivalId);

  return (
    <>
      <Ambient themeKey={currentThemeKey} />
      <Header theme={theme} onThemeChange={setTheme} />

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
            <div className="whoami">
              <span id="who">
                สวัสดี <b>{session.name}</b> · ปี{session.info.name} ({session.info.animal}) · สีมงคล{session.info.color}
              </span>
              <button
                id="btn-change"
                className="link"
                type="button"
                onClick={handleSessionChange}
              >
                เปลี่ยนข้อมูล
              </button>
            </div>

            <nav id="tabs" className="tabs" role="tablist" aria-label="เมนูพิธี">
              <button
                role="tab"
                data-tab="stick"
                aria-selected={tab === 'stick'}
                onClick={() => setTab('stick')}
              >
                เซียมซี
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
                {festivalId === 0 ? 'ขอพร' : festInfo?.name || 'เทศกาล'}
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
