import React, { useState, useMemo, useCallback } from 'react';
import {
  generateMonthAuspiciousDays,
  getKalaYogaForYear,
  getThaksaRelation,
  BIRTH_DAYS,
  WORK_CATEGORIES_INFO,
  type AuspiciousDay,
  type AuspiciousWorkCategory,
  type BirthDayId,
} from '../data/auspiciousCalendarData';
import { saveJournalEntry } from '../utils/fortuneJournal';
import type { CardData } from '../utils/luckyCardCanvas';

interface AuspiciousCalendarProps {
  initialBirthDay?: BirthDayId;
  onToast: (msg: string) => void;
  onOpenCard?: (card: CardData) => void;
}

export type ViewMode = 'calendar';

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

  // Month names in Thai
  const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  // Calculate Kala Yoga for current year
  const kalaYoga = useMemo(() => getKalaYogaForYear(selectedYearBE), [selectedYearBE]);

  // Generate all days in month
  const allMonthDays = useMemo(
    () => generateMonthAuspiciousDays(selectedYearBE, selectedMonth),
    [selectedYearBE, selectedMonth]
  );

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
  }, [onToast, selectedYearBE, THAI_MONTHS]);

  const handleYearChange = useCallback((newYearBE: number) => {
    setSelectedYearBE(newYearBE);
    setInspectedDay(null);
    onToast(`📅 เปลี่ยนเป็น พ.ศ. ${newYearBE}`);
  }, [onToast]);

  const handlePrevMonth = useCallback(() => {
    if (selectedMonth > 1) {
      handleMonthChange(selectedMonth - 1);
    } else {
      setSelectedYearBE((prev) => prev - 1);
      setSelectedMonth(12);
      setInspectedDay(null);
      onToast(`📅 เปลี่ยนเป็นเดือน ธันวาคม พ.ศ. ${selectedYearBE - 1}`);
    }
  }, [selectedMonth, handleMonthChange, selectedYearBE, onToast]);

  const handleNextMonth = useCallback(() => {
    if (selectedMonth < 12) {
      handleMonthChange(selectedMonth + 1);
    } else {
      setSelectedYearBE((prev) => prev + 1);
      setSelectedMonth(1);
      setInspectedDay(null);
      onToast(`📅 เปลี่ยนเป็นเดือน มกราคม พ.ศ. ${selectedYearBE + 1}`);
    }
  }, [selectedMonth, handleMonthChange, selectedYearBE, onToast]);



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
  }, [allMonthDays, thaksaByDate, selectedBirthDay, avoidKalakini, selectedCategory, searchQuery, THAI_MONTHS]);



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
    onToast('บันทึกฤกษ์มงคลลงใน "สมุดบันทึกดวง" เรียบร้อยแล้ว ✨');
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
    const cardData: CardData = {
      type: 'auspicious',
      title: `ฤกษ์มงคล ${day.thaiRukNameTh}`,
      subtitle: `${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[day.month - 1]} พ.ศ. ${day.yearBE}`,
      dateStr: day.date,
      details: {
        auspiciousInfo: {
          dateFormatted: `${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[day.month - 1]} ${day.yearBE}`,
          lunarDate: day.lunarDateTh,
          thaiRukName: day.thaiRukNameTh,
          thaiRukMeaning: day.thaiRukHighlight,
          kalaYoga: day.kalaYogaLabel,
          category: day.suitableCategories.map((c) => WORK_CATEGORIES_INFO[c].titleTh).join(', ') || 'งานมงคลทั่วไป',
          bestHours: day.bestHours.primaryTime,
          direction: day.auspiciousDirection,
          luckyColors: day.luckyColors.join(' / '),
          ceremonyTip: Object.values(day.ceremonyTips)[0] || 'จุดธูปบูชาพระพุทธและเทพยดาอำนวยพร',
        },
      },
    };
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
      {/* Unified Compact Astrological Search Card with Integrated Controls */}
      <div className="astrological-search-card">
        {/* Compact Dropdown Toolbar Row: เดือน -> ปี -> ฤกษ์ -> วันกาลกิณี */}
        <div className="auspicious-compact-toolbar-row">
          {/* 1. เดือน */}
          <div className="dropdown-compact-item month-compact-stepper" title="เลือกเดือน">
            <button
              type="button"
              className="btn-month-nav"
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              aria-label="เปลี่ยนเป็นเดือนก่อนหน้า"
            >
              ◀
            </button>
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
                  เดือน {m}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-month-nav"
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              aria-label="เปลี่ยนเป็นเดือนถัดไป"
            >
              ▶
            </button>
          </div>

          {/* 2. ปี */}
          <div className="dropdown-compact-item" title="เลือกปี พ.ศ.">
            <select
              id="year-select"
              className="dropdown-compact-select year-select"
              value={selectedYearBE}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              aria-label="เลือกปี พ.ศ."
              title="เลือกปี พ.ศ."
            >
              {Array.from({ length: Math.max(2575, selectedYearBE + 5) - Math.min(2567, selectedYearBE - 5) + 1 }, (_, i) => Math.min(2567, selectedYearBE - 5) + i).map((y) => (
                <option key={y} value={y}>
                  พ.ศ. {y}
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

          {/* Mini Kala Yoga Status Pills */}
          <div className="kala-status-compact-pills">
            <span className="kala-mini-pill thongchai" title={`วันธงชัย: ${kalaYoga.thongchaiNameTh}`}>
              ⭐ ธงชัย: <strong>{kalaYoga.thongchaiNameTh}</strong>
            </span>
            <span className="kala-mini-pill athipadi" title={`วันอธิบดี: ${kalaYoga.athipadiNameTh}`}>
              👑 อธิบดี: <strong>{kalaYoga.athipadiNameTh}</strong>
            </span>
            <span className="kala-mini-pill ubatha" title={`วันอุบาทว์: ${kalaYoga.ubathaNameTh}`}>
              ⚠️ อุบาทว์: <strong>{kalaYoga.ubathaNameTh}</strong>
            </span>
            <span className="kala-mini-pill lokawinas" title={`วันโลกาวินาศ: ${kalaYoga.lokawinasNameTh}`}>
              ⛔ โลกาวินาศ: <strong>{kalaYoga.lokawinasNameTh}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Calculation Results Section Anchor & Banner */}
      <div id="auspicious-results-section" className="auspicious-results-anchor">
        <div className="calculation-results-summary-card">
          <div className="summary-card-left">
            <span className="summary-card-icon">🗓️</span>
            <div className="summary-card-text">
              <h3 className="summary-card-title">
                ปฏิทินฤกษ์มงคล:{' '}
                <span className="text-gold">
                  {selectedCategory === 'all'
                    ? 'ทุกประเภทงาน (วิเคราะห์ครบ 5 หมวด)'
                    : WORK_CATEGORIES_INFO[selectedCategory]?.titleTh || 'ฤกษ์มงคล'}
                </span>
              </h3>
              <p className="summary-card-sub">
                ประจำเดือน <strong>{THAI_MONTHS[selectedMonth - 1]} พ.ศ. {selectedYearBE}</strong>
                {selectedBirthDay !== 'none' && (
                  <>
                    {' '}· สำหรับคนเกิด{' '}
                    <strong className="text-gold">
                      {BIRTH_DAYS.find((b) => b.id === selectedBirthDay)?.labelTh}
                    </strong>
                    {avoidKalakini && ' (หลีกเลี่ยงวันกาลกิณี)'}
                  </>
                )}
                {searchQuery && ` · กรองเจาะจง: "${searchQuery}"`}
              </p>
            </div>
          </div>
          <div className="summary-card-badge">
            พบวันมงคล <span className="highlight-count">{filteredDays.length}</span> วัน
          </div>
        </div>
      </div>

      {/* Main Content Area: Pure Calendar Grid */}
      <div className="auspicious-views-viewport">
        <div className="auspicious-calendar-grid-view auspicious-calendar-view calendar-view-container">
          {/* Weekday Header */}
          <div className="calendar-weekdays-row">
            {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(
              (w, idx) => (
                <div key={w} className={`weekday-col-header ${idx === 0 ? 'sun' : ''}`}>
                  {w}
                </div>
              )
            )}
          </div>

          {/* Calendar Days Grid */}
          <div className="calendar-cells-grid">
            {/* Empty offset days for start of month */}
            {Array.from({ length: allMonthDays[0]?.dayOfWeek || 0 }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-cell cell-empty" />
            ))}

            {/* Month days */}
            {allMonthDays.map((day) => {
              const isFilteredOut = !filteredDays.some((d) => d.date === day.date);
              const thaksa =
                selectedBirthDay !== 'none'
                  ? thaksaByDate.get(day.date)
                  : null;

              const isBadDay =
                day.kalaYoga === 'ubatha' ||
                day.kalaYoga === 'lokawinas' ||
                thaksa?.isKalakini;

              return (
                <div
                  key={day.date}
                  className={`calendar-cell ${
                    day.isMasterAuspicious ? 'cell-master' : ''
                  } ${isBadDay ? 'cell-warning' : ''} ${
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
                    <span className="cell-day-num">{day.dayOfMonth}</span>
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
                    <span className="cell-ruk-name">{day.thaiRukNameTh}</span>
                    <span className="cell-lunar">{day.lunarDateTh.split(' ')[0]}</span>
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
      </div>

      {/* Day Inspection Modal (ป๊อปอัปเจาะลึกรายละเอียดวันมงคล) */}
      {inspectedDay && (
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
        </div>
      )}
    </div>
  );
};
