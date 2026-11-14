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
