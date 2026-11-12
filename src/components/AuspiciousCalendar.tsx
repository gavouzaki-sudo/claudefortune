import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  generateMonthAuspiciousDays,
  getKalaYogaForYear,
  getThaksaRelation,
  BIRTH_DAYS,
  WORK_CATEGORIES_INFO,
  THAI_MONTHS,
  type AuspiciousDay,
  type AuspiciousWorkCategory,
  type BirthDayId,
} from '../data/auspiciousCalendarData';
import { saveJournalEntry } from '../utils/fortuneJournal';
import { buildAuspiciousCardData } from '../utils/cardDataBuilder';
import type { CardData } from '../utils/luckyCardCanvas';

// Re-export THAI_MONTHS from canonical source for external consumers and test suites
export { THAI_MONTHS };

interface AuspiciousCalendarProps {
  initialBirthDay?: BirthDayId;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

// All 7 weekdays definition with colors and Kala Yoga day mapping
export const ALL_WEEKDAYS = [
  { full: 'วันอาทิตย์', short: 'อา.', col: 'sun', dayOfWeek: 0, color: '#ef4444' },
  { full: 'วันจันทร์', short: 'จ.', col: 'mon', dayOfWeek: 1, color: '#eab308' },
  { full: 'วันอังคาร', short: 'อ.', col: 'tue', dayOfWeek: 2, color: '#ec4899' },
  { full: 'วันพุธ', short: 'พ.', col: 'wed', dayOfWeek: 3, color: '#10b981' },
  { full: 'วันพฤหัสบดี', short: 'พฤ.', col: 'thu', dayOfWeek: 4, color: '#f97316' },
  { full: 'วันศุกร์', short: 'ศ.', col: 'fri', dayOfWeek: 5, color: '#06b6d4' },
  { full: 'วันเสาร์', short: 'ส.', col: 'sat', dayOfWeek: 6, color: '#a855f7' },
] as const;

export const AuspiciousCalendar: React.FC<AuspiciousCalendarProps> = ({
  initialBirthDay,
  onToast,
  onOpenCard,
}) => {
  // Default to November 2569 (Nov 2026) as requested
  const [selectedYearBE, setSelectedYearBE] = useState<number>(2569);
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // 1-12
  const [selectedBirthDay, setSelectedBirthDay] = useState<BirthDayId | 'none'>(
    initialBirthDay || 'none'
  );
  const [avoidKalakini, setAvoidKalakini] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<AuspiciousWorkCategory | 'all'>('all');
  const [inspectedDay, setInspectedDay] = useState<AuspiciousDay | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mobile environment detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 640;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate Kala Yoga for current year
  const kalaYoga = useMemo(() => getKalaYogaForYear(selectedYearBE), [selectedYearBE]);

  // Generate all days in month
  const allMonthDays = useMemo(
    () => generateMonthAuspiciousDays(selectedYearBE, selectedMonth),
    [selectedYearBE, selectedMonth]
  );

  // If env is mobile: cut out วันอุบาทว์ and วันโลกาวินาศ columns completely
  const displayedWeekdays = useMemo(() => {
    if (isMobile) {
      return ALL_WEEKDAYS.filter(
        (w) => w.dayOfWeek !== kalaYoga.ubatha && w.dayOfWeek !== kalaYoga.lokawinas
      );
    }
    return ALL_WEEKDAYS;
  }, [isMobile, kalaYoga]);

  // If env is mobile: cut out วันอุบาทว์ and วันโลกาวินาศ days completely
  const displayedMonthDays = useMemo(() => {
    if (isMobile) {
      return allMonthDays.filter(
        (day) => day.kalaYoga !== 'ubatha' && day.kalaYoga !== 'lokawinas'
      );
    }
    return allMonthDays;
  }, [isMobile, allMonthDays]);

  // Start padding days for first week alignment
  const startPaddingDays = useMemo(() => {
    if (!allMonthDays[0]) return 0;
    if (!isMobile) {
      return allMonthDays[0].dayOfWeek;
    }
    // Mobile 5-column grid: align to the first visible day of the month
    const firstVisible = displayedMonthDays[0];
    if (!firstVisible) return 0;
    const colIdx = displayedWeekdays.findIndex((w) => w.dayOfWeek === firstVisible.dayOfWeek);
    return colIdx >= 0 ? colIdx : 0;
  }, [allMonthDays, displayedMonthDays, isMobile, displayedWeekdays]);

  // The engine is the single source of truth for birthday/Thaksa relations.
  // Calculate once per day and reuse in filters, reports, cards and the detail modal.
  const thaksaByDate = useMemo(() => {
    if (selectedBirthDay === 'none') return new Map<string, ReturnType<typeof getThaksaRelation>>();
    return new Map(
      allMonthDays.map((day) => [day.date, getThaksaRelation(selectedBirthDay, day.dayOfWeek)] as const)
    );
  }, [allMonthDays, selectedBirthDay]);

  // Month & Year Handlers
  const handleMonthChange = useCallback((newMonth: number) => {
    setSelectedMonth(newMonth);
    setInspectedDay(null);
    onToast(`📅 เปลี่ยนเป็นเดือน ${THAI_MONTHS[newMonth - 1]} พ.ศ. ${selectedYearBE}`);
  }, [onToast, selectedYearBE]);

  const handleYearChange = useCallback((newYearBE: number) => {
    setSelectedYearBE(newYearBE);
    setInspectedDay(null);
    onToast(`📅 เปลี่ยนเป็น พ.ศ. ${newYearBE}`);
  }, [onToast]);

  // Handle Escape key to dismiss day inspection modal
  useEffect(() => {
    if (!inspectedDay) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedDay(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedDay]);





  // Filter days based on user preferences and search query
  const filteredDays = useMemo(() => {
    const rawQ = searchQuery.trim().toLowerCase();

    // Check if the query is a meta prompt, command or generic intent
    const isMetaOrGeneric =
      !rawQ ||
      rawQ.includes('จงทำหน้าที่') ||
      rawQ.includes('ผู้เชี่ยวชาญ') ||
      rawQ.includes('ช่วยสร้าง') ||
      rawQ.includes('คำนวณ') ||
      rawQ.includes('ฤกษ์มงคล') ||
      rawQ.includes('ปฏิทิน') ||
      rawQ.includes('วันมงคล') ||
      rawQ.includes('ฤกษ์ดี') ||
      rawQ.includes('วันดี') ||
      rawQ.includes('หาฤกษ์') ||
      rawQ.includes('ขอฤกษ์');

    return allMonthDays.filter((day) => {
      // 1. Birth day Kalakini check
      if (selectedBirthDay !== 'none' && avoidKalakini) {
        const thaksa = thaksaByDate.get(day.date);
        if (thaksa?.isKalakini) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        if (!day.suitableCategories.includes(selectedCategory)) {
          return false;
        }
      }

      // 3. Search query filter
      if (isMetaOrGeneric) {
        return true;
      }

      // Specific astrological filters
      if (rawQ === 'thongchai_athipadi' || rawQ.includes('ธงชัย & วันอธิบดี') || (rawQ.includes('ธงชัย') && rawQ.includes('อธิบดี'))) {
        return day.kalaYoga === 'thongchai' || day.kalaYoga === 'athipadi';
      }
      if (rawQ === 'thongchai' || rawQ.includes('ธงชัย') || rawQ.includes('วันธงชัย')) {
        return day.kalaYoga === 'thongchai';
      }
      if (rawQ === 'athipadi' || rawQ.includes('อธิบดี') || rawQ.includes('วันอธิบดี')) {
        return day.kalaYoga === 'athipadi';
      }
      if (rawQ === 'ubatha' || rawQ.includes('อุบาทว์') || rawQ.includes('วันอุบาทว์')) {
        return day.kalaYoga === 'ubatha';
      }
      if (rawQ === 'lokawinas' || rawQ.includes('โลกาวินาศ') || rawQ.includes('วันโลกาวินาศ')) {
        return day.kalaYoga === 'lokawinas';
      }
      if (rawQ === 'mahatthano' || rawQ.includes('มหัทธโน')) {
        return day.thaiRuk === 'mahatthano';
      }
      if (rawQ === 'bhumipalo' || rawQ.includes('ภูมิปาโล')) {
        return day.thaiRuk === 'bhumipalo';
      }
      if (rawQ === 'thewi' || rawQ.includes('เทวี')) {
        return day.thaiRuk === 'thewi';
      }
      if (rawQ === 'raja' || rawQ.includes('ราชา')) {
        return day.thaiRuk === 'raja';
      }
      if (rawQ === 'samano' || rawQ.includes('สมโณ')) {
        return day.thaiRuk === 'samano';
      }
      if (rawQ === 'thesatri' || rawQ.includes('เทศาตรี')) {
        return day.thaiRuk === 'thesatri';
      }
      if (rawQ === 'daliddo' || rawQ.includes('ทลิทโท')) {
        return day.thaiRuk === 'daliddo';
      }
      if (rawQ === 'joro' || rawQ.includes('โจโร')) {
        return day.thaiRuk === 'joro';
      }
      if (rawQ === 'phetchakat' || rawQ.includes('เพชฌฆาต')) {
        return day.thaiRuk === 'phetchakat';
      }
      if (rawQ.includes('วันพระ') || rawQ === 'holy') {
        return day.buddhistHolyDay;
      }
      if (rawQ === 'ขึ้น' || rawQ === 'waxing') {
        return day.lunarPhase === 'waxing';
      }
      if (rawQ === 'แรม' || rawQ === 'waning') {
        return day.lunarPhase === 'waning';
      }

      // Specific date number matching: e.g. "วันที่ 4", "4"
      const dateNumMatch = rawQ.match(/^(?:วันที่\s*)?(\d{1,2})$/);
      if (dateNumMatch && Number(dateNumMatch[1]) === day.dayOfMonth) {
        return true;
      }

      // Searchable fields on the day object
      const searchableBlob = [
        day.dayOfMonth.toString(),
        `วันที่ ${day.dayOfMonth}`,
        day.date,
        day.dayNameTh,
        day.lunarDateTh,
        THAI_MONTHS[day.month - 1],
        day.yearBE.toString(),
        day.yearCE.toString(),
        day.thaiRukNameTh,
        day.thaiRukHighlight,
        day.thaiRukMeaning,
        day.dithiName,
        day.kalaYogaLabel,
        day.bestHours.primaryTime,
        day.bestHours.secondaryTime || '',
        day.bestHours.ubakongYama,
        day.auspiciousDirection,
        day.luckyColors.join(' '),
        day.suitableCategories.map((c) => WORK_CATEGORIES_INFO[c]?.titleTh || '').join(' '),
        Object.values(day.ceremonyTips).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return searchableBlob.includes(rawQ);
    });
  }, [allMonthDays, thaksaByDate, selectedBirthDay, avoidKalakini, selectedCategory, searchQuery]);



  // Handle Save to Journal
  const handleSaveToJournal = (day: AuspiciousDay) => {
    saveJournalEntry({
      type: 'auspicious',
      title: `ฤกษ์มงคล ${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[day.month - 1]} ${day.yearBE}`,
      summary: `${day.thaiRukNameTh} (${day.thaiRukHighlight}) · ยามมงคล: ${day.bestHours.primaryTime}`,
      details: {
        date: day.date,
        lunarDate: day.lunarDateTh,
        thaiRuk: day.thaiRukNameTh,
        dithi: day.dithiName,
        bestHours: day.bestHours.primaryTime,
        ubakong: day.bestHours.ubakongYama,
        kalaYoga: day.kalaYogaLabel,
        direction: day.auspiciousDirection,
        luckyColors: day.luckyColors.join(', '),
        tips: day.ceremonyTips,
      },
    });
    onToast('บันทึกฤกษ์มงคลลงใน "สมุดดวง" เรียบร้อยแล้ว ✨');
  };

  // Handle Copy Day Details
  const handleCopyDayDetails = (day: AuspiciousDay) => {
    const thaksa = thaksaByDate.get(day.date);
    const thaksaNote =
      selectedBirthDay !== 'none' && thaksa
        ? `\n👤 สำหรับคนเกิด${BIRTH_DAYS.find((b) => b.id === selectedBirthDay)?.labelTh}: ${thaksa.nameTh} (${thaksa.advice})`
        : '';

    const text = `✨ ฤกษ์งามยามดีมหามงคล ✨
📅 วันที่: ${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[day.month - 1]} พ.ศ. ${day.yearBE}
🌙 จันทรคติ: ${day.lunarDateTh}
📜 ฤกษ์โหราศาสตร์: ${day.thaiRukNameTh} (${day.thaiRukHighlight})
💫 ดิถี: ${day.dithiName}
⏰ ช่วงเวลายามมงคล: ${day.bestHours.primaryTime} (${day.bestHours.ubakongYama})
🧭 ทิศมงคลนำฤกษ์: ${day.auspiciousDirection}
🎨 สีมงคล: ${day.luckyColors.join(', ')} (เลี่ยง: ${day.unluckyColors.join(', ')})
🏷️ งานที่เหมาะสม: ${day.suitableCategories.map((c) => WORK_CATEGORIES_INFO[c].titleTh).join(', ')}${thaksaNote}

— คำนวณตามหลักโหราศาสตร์ไทย ศาลเจ้าแห่งโชคลาภ Lucky Shrine`;

    navigator.clipboard
      .writeText(text)
      .then(() => onToast('คัดลอกรายละเอียดฤกษ์มงคลแล้ว สามารถวางใน Line หรือข้อความได้เลย 📋'))
      .catch(() => onToast('คัดลอกไม่สำเร็จ โปรดคัดลอกข้อความด้วยตนเอง'));
  };


  // Handle Generate Lucky Card
  const handleOpenLuckyCard = (day: AuspiciousDay) => {
    if (!onOpenCard) return;
    const cardData = buildAuspiciousCardData(day, THAI_MONTHS[day.month - 1]);
    onOpenCard(cardData);
  };

  const currentPresetValue =
    searchQuery === 'thongchai_athipadi'
      ? 'thongchai_athipadi'
      : selectedCategory !== 'all'
      ? selectedCategory
      : 'all';

  const handlePresetChange = (val: string) => {
    if (val === 'wedding') {
      setSelectedCategory('wedding');
      setSearchQuery('');
      onToast('💍 แสดงฤกษ์แต่งงาน / จดทะเบียนสมรส');
    } else if (val === 'house') {
      setSelectedCategory('house');
      setSearchQuery('');
      onToast('🏡 แสดงฤกษ์ขึ้นบ้านใหม่ / ย้ายเข้าที่อยู่อาศัยใหม่');
    } else if (val === 'vehicle_business') {
      setSelectedCategory('vehicle_business');
      setSearchQuery('');
      onToast('🚗 แสดงฤกษ์ออกรถใหม่ / เปิดกิจการร้านค้า');
    } else if (val === 'merit') {
      setSelectedCategory('merit');
      setSearchQuery('');
      onToast('🙏 แสดงฤกษ์ทำบุญประจำปี / ทำบุญบริษัท / ทำบุญบ้าน');
    } else if (val === 'others') {
      setSelectedCategory('others');
      setSearchQuery('');
      onToast('✨ แสดงฤกษ์มงคลอื่นๆ (เจรจาค้าขาย/ศัลยกรรม)');
    } else if (val === 'thongchai_athipadi') {
      setSelectedCategory('all');
      setSelectedBirthDay('none');
      setAvoidKalakini(false);
      setSearchQuery('thongchai_athipadi');
      onToast('⭐ แสดงเฉพาะวันธงชัยและวันอธิบดี');
    } else if (val === 'reset' || val === 'all') {
      setSelectedCategory('all');
      setSelectedBirthDay('none');
      setAvoidKalakini(false);
      setSearchQuery('');
      onToast('รีเซ็ตแสดงวันมงคลทุกประเภท');
    }
    setTimeout(() => {
      document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="auspicious-container">
      {/* Calendar Grid View: Dropping toolbar directly at top, flush against the grid with NO intervening cards or boxes */}
      <div id="auspicious-results-section" className="auspicious-calendar-grid-view auspicious-calendar-view calendar-view-container">
        {/* Compact Dropdown Toolbar Row: เดือน -> ปี -> ฤกษ์ -> วันกาลกิณี + จำนวนวัน */}
        <div className="auspicious-compact-toolbar-row">
          {/* 1. เดือน */}
          <div className="dropdown-compact-item" title="เลือกเดือน">
            <select
              id="month-select"
              className="dropdown-compact-select month-select"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              aria-label="เลือกเดือน"
              title="เลือกเดือน"
            >
              {THAI_MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 2. ปี */}
          <div className="dropdown-compact-item" title="เลือกปี">
            <select
              id="year-select"
              className="dropdown-compact-select year-select"
              value={selectedYearBE}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              aria-label="เลือกปี"
              title="เลือกปี"
            >
              {Array.from({ length: Math.max(2575, selectedYearBE + 5) - Math.min(2567, selectedYearBE - 5) + 1 }, (_, i) => Math.min(2567, selectedYearBE - 5) + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 3. ฤกษ์ */}
          <div className="dropdown-compact-item" title="เลือกฤกษ์มงคลยอดนิยม">
            <select
              id="preset-select"
              className="dropdown-compact-select preset-select"
              value={currentPresetValue}
              onChange={(e) => handlePresetChange(e.target.value)}
              aria-label="เลือกฤกษ์มงคล"
              title="เลือกฤกษ์มงคล"
            >
              <option value="all">✨ ฤกษ์: ทั้งหมด</option>
              <option value="wedding">💍 ฤกษ์แต่งงาน</option>
              <option value="house">🏡 ฤกษ์ขึ้นบ้านใหม่</option>
              <option value="vehicle_business">🚗 ฤกษ์ออกรถ/เปิดร้าน</option>
              <option value="merit">🙏 ฤกษ์ทำบุญ</option>
              <option value="others">💎 ฤกษ์ศัลยกรรม/ค้าขาย</option>
              <option value="thongchai_athipadi">⭐ วันธงชัย & อธิบดี</option>
              <option value="reset">🔄 แสดงทุกวัน (รีเซ็ต)</option>
            </select>
          </div>

          {/* 4. วันกาลกิณี */}
          <div className="dropdown-compact-item">
            <select
              id="birthday-select"
              className="dropdown-compact-select birthday-select-compact"
              value={selectedBirthDay}
              onChange={(e) => {
                const val = e.target.value as BirthDayId | 'none';
                setSelectedBirthDay(val);
                if (val !== 'none') {
                  setAvoidKalakini(true);
                  const bInfo = BIRTH_DAYS.find((b) => b.id === val);
                  if (bInfo) {
                    onToast(`👤 เลือกคนเกิด${bInfo.labelTh}: หลีกเลี่ยงวัน${bInfo.kalakiniDayNameTh} (กาลกิณี)`);
                  }
                } else {
                  onToast('👤 แสดงทุกวันเกิด (ไม่ตัดวันกาลกิณี)');
                }
              }}
              aria-label="เลือกวันเกิดเทียบทักษาตัดวันกาลกิณี"
            >
              <option value="none">👤 เลี่ยงกาลกิณี: ทุกวันเกิด</option>
              {BIRTH_DAYS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} เกิด{b.labelTh} (เลี่ยง{b.kalakiniDayNameTh})
                </option>
              ))}
            </select>
            {selectedBirthDay !== 'none' && (
              <button
                type="button"
                className="btn-clear-compact-select"
                onClick={() => {
                  setSelectedBirthDay('none');
                  onToast('🔄 แสดงทุกวันเกิด (ไม่ตัดวันกาลกิณี)');
                }}
                title="รีเซ็ตเป็นแสดงทุกวันเกิด"
                aria-label="รีเซ็ตเป็นแสดงทุกวันเกิด"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Weekday Header with Prominent Labels and Kala Yoga Status */}
        <div className={`calendar-weekdays-row ${isMobile ? 'mobile-cut-taboos' : ''}`} role="row">
            {displayedWeekdays.map((w) => {
              let tag = '';
              let tagClass = '';
              const isUbathaCol = w.dayOfWeek === kalaYoga.ubatha;
              const isLokawinasCol = w.dayOfWeek === kalaYoga.lokawinas;

              if (w.dayOfWeek === kalaYoga.thongchai) {
                tag = '⭐ ธงชัย';
                tagClass = 'tag-col-thongchai';
              } else if (w.dayOfWeek === kalaYoga.athipadi) {
                tag = '👑 อธิบดี';
                tagClass = 'tag-col-athipadi';
              } else if (isUbathaCol) {
                tag = '⚠️ อุบาทว์';
                tagClass = 'tag-col-ubatha';
              } else if (isLokawinasCol) {
                tag = '⛔ โลกาวินาศ';
                tagClass = 'tag-col-lokawinas';
              }

              return (
                <div
                  key={w.full}
                  className={`weekday-col-header col-${w.col} ${isUbathaCol ? 'col-ubatha' : ''} ${
                    isLokawinasCol ? 'col-lokawinas' : ''
                  }`}
                  style={{ borderTopColor: w.color }}
                  role="columnheader"
                >
                  <span className="weekday-name-full">{w.full}</span>
                  <span className="weekday-name-short">{w.short}</span>
                  {tag ? (
                    <span className={`weekday-kalayoga-tag ${tagClass}`} title={`กาลโยคประจำปี ${selectedYearBE}: ${w.full}เป็น${tag}`}>
                      {tag}
                    </span>
                  ) : (
                    <span className="weekday-kalayoga-tag tag-col-normal">วันปกติ</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Days Grid */}
          <div className={`calendar-cells-grid ${isMobile ? 'mobile-cut-taboos' : ''}`}>
            {/* Empty offset days for start of month */}
            {Array.from({ length: startPaddingDays }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-cell cell-empty" aria-hidden="true">
                <span className="empty-cell-dash">—</span>
              </div>
            ))}

            {/* Month days */}
            {displayedMonthDays.map((day) => {
              const isFilteredOut = !filteredDays.some((d) => d.date === day.date);
              const thaksa =
                selectedBirthDay !== 'none'
                  ? thaksaByDate.get(day.date)
                  : null;

              const isUbatha = day.kalaYoga === 'ubatha';
              const isLokawinas = day.kalaYoga === 'lokawinas';

              const isBadDay =
                isUbatha ||
                isLokawinas ||
                thaksa?.isKalakini;

              const shortDayName = day.dayNameTh.replace('วัน', '');

              return (
                <div
                  key={day.date}
                  className={`calendar-cell ${
                    day.isMasterAuspicious ? 'cell-master' : ''
                  } ${isBadDay ? 'cell-warning' : ''} ${
                    isUbatha ? 'cell-ubatha' : ''
                  } ${
                    isLokawinas ? 'cell-lokawinas' : ''
                  } ${
                    isFilteredOut ? 'cell-dimmed' : ''
                  } ${inspectedDay?.date === day.date ? 'cell-selected' : ''}`}
                  onClick={() => setInspectedDay(day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setInspectedDay(day);
                    }
                  }}
                >
                  <div className="cell-top">
                    <div className="cell-date-group">
                      <span className="cell-day-num">{day.dayOfMonth}</span>
                      <span className="cell-weekday-label">{shortDayName}</span>
                    </div>
                    {day.kalaYoga === 'thongchai' && (
                      <span className="cell-tag tag-thongchai">ธงชัย</span>
                    )}
                    {day.kalaYoga === 'athipadi' && (
                      <span className="cell-tag tag-athipadi">อธิบดี</span>
                    )}
                    {day.kalaYoga === 'ubatha' && (
                      <span className="cell-tag tag-ubatha">อุบาทว์</span>
                    )}
                    {day.kalaYoga === 'lokawinas' && (
                      <span className="cell-tag tag-lokawinas">โลกาวินาศ</span>
                    )}
                  </div>

                  <div className="cell-middle">
                    <span className="cell-ruk-name" title={`${day.thaiRukNameTh}: ${day.thaiRukHighlight}`}>
                      {day.thaiRukNameTh}
                    </span>
                    <span className="cell-lunar" title={day.lunarDateTh}>
                      {day.lunarPhaseThShort}
                    </span>
                    {day.buddhistHolyDay && (
                      <span className="cell-holy-badge" title={`วันพระ: ${day.lunarDateTh}`}>
                        🪷 วันพระ
                      </span>
                    )}
                  </div>

                  <div className="cell-bottom-icons">
                    {day.suitableCategories.map((c) => (
                      <span key={c} className="cell-cat-icon" title={WORK_CATEGORIES_INFO[c].titleTh}>
                        {WORK_CATEGORIES_INFO[c].icon}
                      </span>
                    ))}
                  </div>

                  {thaksa && (
                    <div className={`cell-thaksa-dot dot-${thaksa.badgeStyle}`} title={thaksa.badgeText}>
                      {thaksa.nameTh}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      {/* Day Inspection Modal (ป๊อปอัปเจาะลึกรายละเอียดวันมงคล) - Portaled to document.body to prevent double-frame nesting */}
      {inspectedDay && typeof document !== 'undefined' && createPortal(
        <div
          className="auspicious-modal-overlay"
          onClick={() => setInspectedDay(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="auspicious-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setInspectedDay(null)}
              aria-label="ปิดหน้าต่าง"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="modal-sheet-header">
              <div className="modal-date-tag">
                {inspectedDay.dayNameTh}ที่ {inspectedDay.dayOfMonth}{' '}
                {THAI_MONTHS[inspectedDay.month - 1]} พ.ศ. {inspectedDay.yearBE}
              </div>
              <h3 className="modal-title">{inspectedDay.thaiRukNameTh}</h3>
              <p className="modal-subtitle">
                {inspectedDay.lunarDateTh} · {inspectedDay.dithiName}
              </p>
            </div>

            {/* Kala Yoga & Thaksa Alerts in Modal */}
            <div className="modal-badges-row">
              {inspectedDay.kalaYoga === 'thongchai' && (
                <div className="modal-alert-pill thongchai">⭐ วันธงชัยแห่งปี (มงคลเลิศล้ำ)</div>
              )}
              {inspectedDay.kalaYoga === 'athipadi' && (
                <div className="modal-alert-pill athipadi">👑 วันอธิบดีแห่งปี (เกียรติยศ อำนาจบารมี)</div>
              )}
              {inspectedDay.kalaYoga === 'ubatha' && (
                <div className="modal-alert-pill ubatha">⚠️ วันอุบาทว์แห่งปี (ควรงดเว้นการมงคล)</div>
              )}
              {inspectedDay.kalaYoga === 'lokawinas' && (
                <div className="modal-alert-pill lokawinas">⛔ วันโลกาวินาศแห่งปี (ห้ามประกอบพิธีเด็ดขาด)</div>
              )}

              {selectedBirthDay !== 'none' && (
                <div
                  className={`modal-alert-pill thaksa-${
                    thaksaByDate.get(inspectedDay.date)?.badgeStyle
                  }`}
                >
                  {thaksaByDate.get(inspectedDay.date)?.badgeText}
                </div>
              )}
            </div>

            {/* Body Information */}
            <div className="modal-body-content">
              {/* Nakshatra & Astronomical Dithi Details */}
              <div className="modal-info-card">
                <h4 className="info-card-title">✨ ข้อมูลดวงดาวและดิถีจันทรคติ</h4>
                <div className="nakshatra-detail-row">
                  <div className="nakshatra-box">
                    <span className="nak-label">กลุ่มดาวนักษัตรที่เสวย:</span>
                    <strong className="nak-val text-gold">นักษัตรที่ {inspectedDay.nakshatraNumber} ({inspectedDay.nakshatraNameTh})</strong>
                  </div>
                  <div className="nakshatra-box">
                    <span className="nak-label">ดิถีจันทรคติ:</span>
                    <strong className="nak-val">{inspectedDay.lunarDateTh}</strong>
                  </div>
                </div>
                <div className="info-card-highlight">
                  พระจันทร์โคจรผ่าน ๒๗ กลุ่มดาวนักษัตรตามลำดับธรรมชาติ ส่งผลให้เกิด <strong>{inspectedDay.thaiRukNameTh}</strong> ในวันนี้
                </div>
              </div>

              {/* Meaning & Highlight */}
              <div className="modal-info-card">
                <h4 className="info-card-title">📖 ความหมายและจุดเด่นของฤกษ์</h4>
                <p className="info-card-desc">{inspectedDay.thaiRukMeaning}</p>
                <div className="info-card-highlight">
                  <strong>ความโดดเด่น:</strong> {inspectedDay.thaiRukHighlight}
                </div>
              </div>

              {/* Timing & Ubakong Yama */}
              <div className="modal-info-card">
                <h4 className="info-card-title">⏰ ช่วงเวลายามมงคลและยามอุบากอง</h4>
                <div className="hours-grid">
                  <div className="hour-stat-box">
                    <span className="hour-label">ช่วงเวลาที่ดีที่สุด:</span>
                    <span className="hour-val text-gold">{inspectedDay.bestHours.primaryTime}</span>
                  </div>
                  {inspectedDay.bestHours.secondaryTime && (
                    <div className="hour-stat-box">
                      <span className="hour-label">ช่วงเวลาสำรอง:</span>
                      <span className="hour-val">{inspectedDay.bestHours.secondaryTime}</span>
                    </div>
                  )}
                  <div className="hour-stat-box full-width">
                    <span className="hour-label">ศาสตร์ยามอุบากอง:</span>
                    <span className="hour-val text-ok">{inspectedDay.bestHours.ubakongYama}</span>
                  </div>
                </div>
              </div>

              {/* Direction & Colors */}
              <div className="modal-info-card">
                <h4 className="info-card-title">🧭 ทิศและสีมงคลประจำวัน</h4>
                <div className="directions-grid">
                  <div className="dir-item">
                    <span className="dir-label">ทิศมงคลนำฤกษ์:</span>
                    <span className="dir-val">{inspectedDay.auspiciousDirection}</span>
                  </div>
                  <div className="dir-item">
                    <span className="dir-label">สีมงคลเสริมโชค:</span>
                    <span className="dir-val text-gold">{inspectedDay.luckyColors.join(', ')}</span>
                  </div>
                  <div className="dir-item">
                    <span className="dir-label">สีที่ควรหลีกเลี่ยง:</span>
                    <span className="dir-val text-bad">{inspectedDay.unluckyColors.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Suitable categories & Tips */}
              <div className="modal-info-card">
                <h4 className="info-card-title">🏷️ งานที่เหมาะสมและเคล็ดพิธี</h4>
                <div className="modal-tips-list">
                  {inspectedDay.suitableCategories.length > 0 ? (
                    inspectedDay.suitableCategories.map((catKey) => (
                      <div key={catKey} className="modal-tip-item">
                        <span className="tip-cat-title">
                          {WORK_CATEGORIES_INFO[catKey].icon} {WORK_CATEGORIES_INFO[catKey].titleTh}
                        </span>
                        <p className="tip-cat-content">
                          {inspectedDay.ceremonyTips[catKey] || WORK_CATEGORIES_INFO[catKey].shortDesc}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-bad">
                      วันนี้ตรงกับวันอุบาทว์หรือวันโลกาวินาศ ไม่เหมาะกับการจัดพิธีมงคลใดๆ
                    </p>
                  )}
                </div>
              </div>

              {/* Prohibitions */}
              {inspectedDay.prohibitions.length > 0 && (
                <div className="modal-prohibitions-box">
                  <strong>🚫 ข้อพึงระวังตามโบราณาจารย์:</strong>
                  <ul>
                    {inspectedDay.prohibitions.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="modal-sheet-footer">
              <button
                type="button"
                className="btn ghost"
                onClick={() => handleCopyDayDetails(inspectedDay)}
              >
                📋 คัดลอกรายละเอียด
              </button>
              <button
                type="button"
                className="btn gold"
                onClick={() => handleSaveToJournal(inspectedDay)}
              >
                📖 บันทึกลงสมุดดวง
              </button>
              <button
                type="button"
                className="btn red"
                onClick={() => {
                  handleOpenLuckyCard(inspectedDay);
                  setInspectedDay(null);
                }}
              >
                🎴 สร้างการ์ดมงคล
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
