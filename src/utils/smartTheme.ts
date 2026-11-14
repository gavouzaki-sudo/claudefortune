// Smart Contextual Theme Engine
// Intelligently matches themes based on calendar date, festivals, and user geography/timezone without annoying permission popups.

import { MYSTICAL_THEMES } from '../data/themes';

export interface ThemeInfo {
  id: string;
  name: string;
  category: 'festival' | 'region';
  description: string;
  palette: string[]; // [primary, accent, background]
}

export const ALL_THEMES: ThemeInfo[] = MYSTICAL_THEMES.map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  description: t.description,
  palette: [t.bgColors.red, t.bgColors.gold, t.bgColors.bg],
}));

export function detectSmartTheme(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // 1. Calendar Festival Check (Precise dates for world celebrations)
  // Christmas & Noel season: Dec 15 to Dec 27
  if (month === 12 && day >= 15 && day <= 27) {
    return 'xmas';
  }
  // New Year Eve & Early January: Dec 28 to Jan 5
  if ((month === 12 && day >= 28) || (month === 1 && day <= 5)) {
    return 'newyear';
  }
  // Frost / Winter Solstice & Cold Season: Jan 6 to Jan 19
  if (month === 1 && day >= 6 && day <= 19) {
    return 'frost';
  }
  // Valentine season: Feb 10 to Feb 18
  if (month === 2 && day >= 10 && day <= 18) {
    return 'valentine';
  }
  // Lunar New Year / Chinese New Year season: Jan 20 to Feb 20 (when not Valentine)
  if ((month === 1 && day >= 20) || (month === 2 && day <= 20)) {
    return 'cny';
  }
  // Songkran Thai Water Festival: Apr 10 to Apr 18
  if (month === 4 && day >= 10 && day <= 18) {
    return 'songkran';
  }
  // Mid-Autumn Moon Festival: Sep 15 to Oct 5
  if ((month === 9 && day >= 15) || (month === 10 && day <= 5)) {
    return 'midautumn';
  }
  // Halloween / Samhain season: Oct 25 to Nov 2
  if ((month === 10 && day >= 25) || (month === 11 && day <= 2)) {
    return 'halloween';
  }
  // Loy Krathong season: Nov 5 to Nov 25
  if (month === 11 && day >= 5 && day <= 25) {
    return 'loy';
  }

  // 2. User Geographic & Cultural Context (via Timezone & Locale without permission prompts)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (typeof navigator !== 'undefined' ? navigator.language : '') || '';

    if (tz.includes('Bangkok') || lang.startsWith('th')) {
      return 'thai';
    }
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || lang.startsWith('hi')) {
      return 'vedic';
    }
    if (tz.includes('Cairo') || tz.includes('Egypt')) {
      return 'egyptian';
    }
    if (
      tz.includes('Dubai') ||
      tz.includes('Riyadh') ||
      tz.includes('Baghdad') ||
      tz.includes('Tehran') ||
      tz.includes('Istanbul') ||
      lang.startsWith('ar')
    ) {
      return 'islamic';
    }
    if (
      tz.includes('Mexico') ||
      tz.includes('Cancun') ||
      tz.includes('Bogota') ||
      tz.includes('Lima') ||
      tz.includes('Guatemala')
    ) {
      return 'aztec_mayan';
    }
    if (
      tz.includes('Denver') ||
      tz.includes('Phoenix') ||
      tz.includes('Anchorage') ||
      tz.includes('Edmonton')
    ) {
      return 'native_american';
    }
    if (tz.includes('Europe') || tz.includes('London') || tz.includes('Paris') || tz.includes('Rome')) {
      return 'western';
    }
    if (tz.includes('Shanghai') || tz.includes('Taipei') || tz.includes('Hong_Kong') || lang.startsWith('zh')) {
      return 'cny';
    }
  } catch {
    // Ignore detection error
  }

  // 3. Auspicious shrine theme default
  return 'shrine';
}
