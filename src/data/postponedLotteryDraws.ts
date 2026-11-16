// Postponed Thai Government Lottery Draw Dates (พ.ศ. 2559 – 2569 / ค.ศ. 2016 – 2027)
// Maps normal 1st / 16th schedule dates to actual postponed draw dates and reasons.

import { THAI_MONTHS } from './auspiciousCalendarData';

export interface PostponedDrawEntry {
  actualDate: string; // YYYY-MM-DD (C.E.)
  normalDate: string; // YYYY-MM-DD (C.E.)
  reason: string;
  /** Optional alternate date people may search (e.g. canceled Dec 30 draw moved to Jan 2) */
  aliases?: string[];
}

export const POSTPONED_LOTTERY_DRAWS: PostponedDrawEntry[] = [
  // พ.ศ. 2559 (2016)
  { actualDate: '2016-01-17', normalDate: '2016-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2016-05-02', normalDate: '2016-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2016-12-30', normalDate: '2017-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2560 (2017)
  { actualDate: '2017-01-17', normalDate: '2017-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2017-05-02', normalDate: '2017-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2017-12-30', normalDate: '2018-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2561 (2018)
  { actualDate: '2018-01-17', normalDate: '2018-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2018-03-02', normalDate: '2018-03-01', reason: 'ตรงกับวันมาฆบูชา' },
  { actualDate: '2018-05-02', normalDate: '2018-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2018-12-30', normalDate: '2019-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2562 (2019)
  { actualDate: '2019-01-17', normalDate: '2019-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2019-05-02', normalDate: '2019-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2019-07-15', normalDate: '2019-07-16', reason: 'ตรงกับวันอาสาฬหบูชา' },
  { actualDate: '2019-12-30', normalDate: '2020-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2563 (2020)
  { actualDate: '2020-01-17', normalDate: '2020-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2020-05-16', normalDate: '2020-04-01', reason: 'เลื่อนออกรางวัลเนื่องจากสถานการณ์โควิด-19' },
  { actualDate: '2020-12-30', normalDate: '2021-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2564 (2021)
  { actualDate: '2021-01-17', normalDate: '2021-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2021-05-02', normalDate: '2021-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2021-12-30', normalDate: '2022-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2565 (2022)
  { actualDate: '2022-01-17', normalDate: '2022-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2022-05-02', normalDate: '2022-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2022-12-30', normalDate: '2023-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2566 (2023)
  { actualDate: '2023-01-17', normalDate: '2023-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2023-05-02', normalDate: '2023-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2023-07-31', normalDate: '2023-08-01', reason: 'ตรงกับวันอาสาฬหบูชา' },
  { actualDate: '2023-12-30', normalDate: '2024-01-01', reason: 'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่' },

  // พ.ศ. 2567 – 2568 (2024 – 2025)
  { actualDate: '2024-01-17', normalDate: '2024-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2024-05-02', normalDate: '2024-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  {
    actualDate: '2025-01-02',
    normalDate: '2025-01-01',
    reason: 'ตรงกับวันขึ้นปีใหม่ (ยกเลิกออก 30 ธ.ค. 2567)',
    aliases: ['2024-12-30'],
  },
  { actualDate: '2025-01-17', normalDate: '2025-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2025-05-02', normalDate: '2025-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },

  // พ.ศ. 2569 – ต้นปี 2570 (2026 – early 2027)
  { actualDate: '2026-01-02', normalDate: '2026-01-01', reason: 'ตรงกับวันขึ้นปีใหม่' },
  { actualDate: '2026-01-17', normalDate: '2026-01-16', reason: 'ตรงกับวันครูแห่งชาติ' },
  { actualDate: '2026-05-02', normalDate: '2026-05-01', reason: 'ตรงกับวันแรงงานแห่งชาติ' },
  { actualDate: '2026-12-17', normalDate: '2026-12-16', reason: 'พระราชพิธีถวายพระเพลิงพระบรมศพฯ' },
  { actualDate: '2027-01-02', normalDate: '2027-01-01', reason: 'ตรงกับวันขึ้นปีใหม่' },
];

const FREQUENT_POSTPONED_DAYS = new Set(['02', '15', '17', '30', '31']);

export const LOTTERY_DRAW_DAY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = Array.from(
  { length: 31 },
  (_, idx) => {
    const val = String(idx + 1).padStart(2, '0');
    if (val === '01' || val === '16') {
      return { value: val, label: `${val} (ปกติ)` };
    }
    if (FREQUENT_POSTPONED_DAYS.has(val)) {
      return { value: val, label: `${val} (เลื่อน)` };
    }
    return { value: val, label: val };
  }
);

export function shiftIsoDate(isoDate: string, offsetDays: number): string {
  const [yStr, mStr, dStr] = isoDate.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const outY = dt.getUTCFullYear();
  const outM = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const outD = String(dt.getUTCDate()).padStart(2, '0');
  return `${outY}-${outM}-${outD}`;
}

export function resolvePostponedDraw(isoDate: string): PostponedDrawEntry | null {
  for (const entry of POSTPONED_LOTTERY_DRAWS) {
    if (
      entry.actualDate === isoDate ||
      entry.normalDate === isoDate ||
      entry.aliases?.includes(isoDate)
    ) {
      return entry;
    }
  }
  return null;
}

export function getActualDrawDateIso(isoDate: string): string {
  const entry = resolvePostponedDraw(isoDate);
  return entry ? entry.actualDate : isoDate;
}

export function formatShortThaiDate(isoDate: string): string {
  const [yStr, mStr, dStr] = isoDate.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  const monthName = THAI_MONTHS[m - 1] || '';
  return `${d} ${monthName} ${y + 543}`;
}

export function formatPostponedNote(entry: PostponedDrawEntry): string {
  return `เลื่อนจาก ${formatShortThaiDate(entry.normalDate)} — ${entry.reason}`;
}

import type { SupportedLang } from './translations';

export const SHORT_MONTHS_BY_LANG: Record<SupportedLang, readonly string[]> = {
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

const POSTPONED_REASON_LOCALIZED: Record<string, { en: string; zh: string }> = {
  'ตรงกับวันครูแห่งชาติ': { en: 'Rescheduled for National Teachers’ Day', zh: '因逢泰国教师节顺延' },
  'ตรงกับวันแรงงานแห่งชาติ': { en: 'Rescheduled for National Labor Day', zh: '因逢国际劳动节顺延' },
  'เลื่อนออกเร็วขึ้นรับเทศกาลปีใหม่': { en: 'Moved forward for New Year holiday', zh: '因新年假期提前开奖' },
  'ตรงกับวันมาฆบูชา': { en: 'Rescheduled for Makha Bucha Day', zh: '因逢万佛节顺延' },
  'ตรงกับวันอาสาฬหบูชา': { en: 'Rescheduled for Asahna Bucha Day', zh: '因逢三宝佛节顺延' },
  'เลื่อนออกรางวัลเนื่องจากสถานการณ์โควิด-19': { en: 'Postponed due to COVID-19 measures', zh: '因疫情管控顺延开奖' },
  'ตรงกับวันขึ้นปีใหม่ (ยกเลิกออก 30 ธ.ค. 2567)': { en: 'Rescheduled for New Year’s Day (Dec 30 draw moved)', zh: '因逢元旦假期顺延（原12月30日改期）' },
  'ตรงกับวันขึ้นปีใหม่': { en: 'Rescheduled for New Year’s Day', zh: '因逢元旦顺延' },
  'พระราชพิธีถวายพระเพลิงพระบรมศพฯ': { en: 'Rescheduled for Royal Cremation Ceremony', zh: '因皇家仪式顺延' },
};

export function getLocalizedShortMonths(lang: SupportedLang): readonly string[] {
  return SHORT_MONTHS_BY_LANG[lang] || SHORT_MONTHS_BY_LANG.th;
}

export function getLocalizedLotteryDrawDayOptions(
  lang: SupportedLang
): ReadonlyArray<{ value: string; label: string }> {
  if (lang === 'th') return LOTTERY_DRAW_DAY_OPTIONS;
  const stdTag = lang === 'en' ? 'Std' : '常规';
  const altTag = lang === 'en' ? 'Adj' : '顺延';
  return Array.from({ length: 31 }, (_, idx) => {
    const val = String(idx + 1).padStart(2, '0');
    if (val === '01' || val === '16') {
      return { value: val, label: `${val} (${stdTag})` };
    }
    if (FREQUENT_POSTPONED_DAYS.has(val)) {
      return { value: val, label: `${val} (${altTag})` };
    }
    return { value: val, label: val };
  });
}

export function formatLocalizedShortDate(isoDate: string, lang: SupportedLang): string {
  if (lang === 'th') return formatShortThaiDate(isoDate);
  const [yStr, mStr, dStr] = isoDate.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  const monthName = SHORT_MONTHS_BY_LANG[lang]?.[m - 1] || '';
  if (lang === 'zh') {
    return `${y}年${m}月${d}日`;
  }
  return `${d} ${monthName} ${y}`;
}

export function formatPostponedNoteByLang(
  entry: PostponedDrawEntry,
  lang: SupportedLang
): string {
  if (lang === 'th') return formatPostponedNote(entry);
  const localizedReason = POSTPONED_REASON_LOCALIZED[entry.reason]?.[lang] || entry.reason;
  const dateLabel = formatLocalizedShortDate(entry.normalDate, lang);
  if (lang === 'en') {
    return `Rescheduled from ${dateLabel} — ${localizedReason}`;
  }
  return `原定 ${dateLabel} 改期 — ${localizedReason}`;
}

