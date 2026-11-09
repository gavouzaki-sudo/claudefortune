import { useState, useEffect } from 'react';
import { MYSTICAL_THEMES } from '../data/themes';
import { detectSmartTheme } from '../utils/smartTheme';
import { safeStorage } from '../utils/storage';

export const FEST_INDEX_MAP: Readonly<Record<string, number>> = {
  shrine: 0,
  songkran: 1,
  halloween: 2,
  loy: 3,
  cny: 4,
  newyear: 5,
};

/**
 * Custom hook to manage active theme, dynamic CSS custom properties,
 * festival mapping, and theme persistence.
 */
export function useThemeManager(bridgeReady: boolean) {
  const [theme, setTheme] = useState<string>(() =>
    safeStorage.get<string>('session', 'shrine.theme', 'auto')
  );
  const [activeThemeId, setActiveThemeId] = useState<string>('shrine');
  const [festivalId, setFestivalId] = useState<number>(0);

  useEffect(() => {
    if (!bridgeReady) return;

    const targetThemeId = theme === 'auto' ? detectSmartTheme() : theme;
    const targetFestId = FEST_INDEX_MAP[targetThemeId] ?? 0;

    setActiveThemeId(targetThemeId);
    setFestivalId(targetFestId);

    // Apply data-theme attribute
    if (typeof document !== 'undefined') {
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
    }

    safeStorage.set('session', 'shrine.theme', theme);
  }, [theme, bridgeReady]);

  return {
    theme,
    setTheme,
    activeThemeId,
    festivalId,
  };
}
