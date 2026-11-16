import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  generateMonthAuspiciousDays,
  getKalaYogaForYear,
  getThaksaRelation,
  WORK_CATEGORIES_INFO,
  THAI_MONTHS,
  getLocalizedMonths,
  getLocalizedWeekdays,
  getLocalizedFullDayName,
  getLocalizedBirthDays,
  getLocalizedWorkCategories,
  getLocalizedThaksaRelation,
  getLocalizedDayDetails,
  type AuspiciousDay,
  type AuspiciousWorkCategory,
  type BirthDayId,
} from '../data/auspiciousCalendarData';
import { useLanguage } from '../context/LanguageContext';
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
  const { lang, t, format } = useLanguage();
  const localizedMonths = useMemo(() => getLocalizedMonths(lang), [lang]);
  const localizedWeekdays = useMemo(() => getLocalizedWeekdays(lang), [lang]);
  const localizedBirthDays = useMemo(() => getLocalizedBirthDays(lang), [lang]);
  const localizedCategories = useMemo(() => getLocalizedWorkCategories(lang), [lang]);

  const [selectedYearBE, setSelectedYearBE] = useState<number>(() => new Date().getFullYear() + 543);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1); // 1-12
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

  const localizedThaksaByDate = useMemo(() => {
    if (selectedBirthDay === 'none') return new Map<string, ReturnType<typeof getThaksaRelation>>();
    return new Map(
      Array.from(thaksaByDate.entries()).map(([date, rel]) => [
        date,
        getLocalizedThaksaRelation(rel, selectedBirthDay, lang),
      ])
    );
  }, [thaksaByDate, selectedBirthDay, lang]);

  const formatYearLabel = useCallback(
    (yearBE: number) => format(t.calYearPrefix, { yearBE, yearCE: yearBE - 543 }),
    [format, t.calYearPrefix]
  );

  // Month & Year Handlers
  const handleMonthChange = useCallback((newMonth: number) => {
    setSelectedMonth(newMonth);
    setInspectedDay(null);
    onToast(
      format(t.calToastMonth, {
        month: localizedMonths[newMonth - 1] || THAI_MONTHS[newMonth - 1],
        yearLabel: formatYearLabel(selectedYearBE),
      })
    );
  }, [onToast, selectedYearBE, format, t.calToastMonth, localizedMonths, formatYearLabel]);

  const handleYearChange = useCallback((newYearBE: number) => {
    setSelectedYearBE(newYearBE);
    setInspectedDay(null);
    onToast(format(t.calToastYear, { yearLabel: formatYearLabel(newYearBE) }));
  }, [onToast, format, t.calToastYear, formatYearLabel]);

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

      // Searchable fields on the day object (multi-language)
      const locDay = lang === 'th' ? null : getLocalizedDayDetails(day, lang);
      const searchableBlob = [
        day.dayOfMonth.toString(),
        `วันที่ ${day.dayOfMonth}`,
        day.date,
        day.dayNameTh,
        locDay?.dayName || '',
        day.lunarDateTh,
        locDay?.lunarDate || '',
        THAI_MONTHS[day.month - 1],
        localizedMonths[day.month - 1] || '',
        day.yearBE.toString(),
        day.yearCE.toString(),
        day.thaiRukNameTh,
        locDay?.thaiRukName || '',
        day.thaiRukHighlight,
        locDay?.thaiRukHighlight || '',
        day.thaiRukMeaning,
        locDay?.thaiRukMeaning || '',
        day.dithiName,
        locDay?.dithiName || '',
        day.kalaYogaLabel,
        locDay?.kalaYogaLabel || '',
        day.bestHours.primaryTime,
        day.bestHours.secondaryTime || '',
        day.bestHours.ubakongYama,
        day.auspiciousDirection,
        locDay?.auspiciousDirection || '',
        day.luckyColors.join(' '),
        locDay?.luckyColors.join(' ') || '',
        day.suitableCategories.map((c) => `${WORK_CATEGORIES_INFO[c]?.titleTh || ''} ${localizedCategories[c]?.title || ''}`).join(' '),
        Object.values(day.ceremonyTips).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return searchableBlob.includes(rawQ);
    });
  }, [allMonthDays, thaksaByDate, selectedBirthDay, avoidKalakini, selectedCategory, searchQuery, lang, localizedMonths, localizedCategories]);

  const filteredDayDates = useMemo(() => new Set(filteredDays.map((d) => d.date)), [filteredDays]);



  // Handle Save to Journal
  const handleSaveToJournal = (day: AuspiciousDay) => {
    const details = getLocalizedDayDetails(day, lang);
    const monthLabel = localizedMonths[day.month - 1] || THAI_MONTHS[day.month - 1];
    const dateTitle =
      lang === 'th'
        ? `ฤกษ์มงคล ${day.dayNameTh}ที่ ${day.dayOfMonth} ${monthLabel} ${day.yearBE}`
        : `${t.topicAuspicious} · ${details.dayName}, ${monthLabel} ${day.dayOfMonth}, ${day.yearCE}`;
    saveJournalEntry({
      type: 'auspicious',
      title: dateTitle,
      summary: `${details.thaiRukName} (${details.thaiRukHighlight}) · ${details.bestHours.primaryTime}`,
      details: {
        date: day.date,
        lunarDate: details.lunarDate,
        thaiRuk: details.thaiRukName,
        dithi: details.dithiName,
        bestHours: details.bestHours.primaryTime,
        ubakong: details.bestHours.ubakongYama,
        kalaYoga: details.kalaYogaLabel,
        direction: details.auspiciousDirection,
        luckyColors: details.luckyColors.join(', '),
        tips: details.ceremonyTips,
      },
    });
    onToast(t.calToastJournalSaved);
  };

  // Handle Copy Day Details
  const handleCopyDayDetails = (day: AuspiciousDay) => {
    const details = getLocalizedDayDetails(day, lang);
    const thaksa = localizedThaksaByDate.get(day.date);
    const bInfo = localizedBirthDays.find((b) => b.id === selectedBirthDay);
    const thaksaNote =
      selectedBirthDay !== 'none' && thaksa
        ? `\n${format(t.calCopyThaksaLine, {
            birthDay: bInfo?.label || '',
            relation: thaksa.nameTh,
            advice: thaksa.advice,
          })}`
        : '';

    const monthLabel = localizedMonths[day.month - 1] || THAI_MONTHS[day.month - 1];
    const dateLabel =
      lang === 'th'
        ? `${day.dayNameTh}ที่ ${day.dayOfMonth} ${monthLabel} ${formatYearLabel(day.yearBE)}`
        : `${details.dayName}, ${day.dayOfMonth} ${monthLabel} ${formatYearLabel(day.yearBE)}`;

    const text = [
      t.calCopyHeader,
      format(t.calCopyDate, { date: dateLabel }),
      format(t.calCopyLunar, { lunar: details.lunarDate }),
      format(t.calCopyRuk, { ruk: details.thaiRukName, highlight: details.thaiRukHighlight }),
      format(t.calCopyDithi, { dithi: details.dithiName }),
      format(t.calCopyHours, {
        hours: details.bestHours.primaryTime,
        ubakong: details.bestHours.ubakongYama,
      }),
      format(t.calCopyDirection, { direction: details.auspiciousDirection }),
      `${format(t.calCopyColors, { lucky: details.luckyColors.join(', ') })}${format(t.calCopyAvoid, {
        unlucky: details.unluckyColors.join(', '),
      })}`,
      `${format(t.calCopySuitable, {
        categories: day.suitableCategories.map((c) => localizedCategories[c].title).join(', '),
      })}${thaksaNote}`,
      '',
      t.calCopyFooter,
    ].join('\n');

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      onToast(t.calToastCopyFailed);
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => onToast(t.calToastCopied))
      .catch(() => onToast(t.calToastCopyFailed));
  };

  const scrollTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) {
        clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };
  }, []);


  // Handle Generate Lucky Card
  const handleOpenLuckyCard = (day: AuspiciousDay) => {
    if (!onOpenCard) return;
    const monthName = localizedMonths[day.month - 1] || THAI_MONTHS[day.month - 1];
    const cardData = buildAuspiciousCardData(day, monthName, lang);
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
      onToast(t.calToastPresetWedding);
    } else if (val === 'house') {
      setSelectedCategory('house');
      setSearchQuery('');
      onToast(t.calToastPresetHouse);
    } else if (val === 'vehicle_business') {
      setSelectedCategory('vehicle_business');
      setSearchQuery('');
      onToast(t.calToastPresetVehicle);
    } else if (val === 'merit') {
      setSelectedCategory('merit');
      setSearchQuery('');
      onToast(t.calToastPresetMerit);
    } else if (val === 'others') {
      setSelectedCategory('others');
      setSearchQuery('');
      onToast(t.calToastPresetOthers);
    } else if (val === 'thongchai_athipadi') {
      setSelectedCategory('all');
      setSelectedBirthDay('none');
      setAvoidKalakini(false);
      setSearchQuery('thongchai_athipadi');
      onToast(t.calToastPresetThongchai);
    } else if (val === 'reset' || val === 'all') {
      setSelectedCategory('all');
      setSelectedBirthDay('none');
      setAvoidKalakini(false);
      setSearchQuery('');
      onToast(t.calToastPresetReset);
    }
    if (scrollTimerRef.current !== null) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = window.setTimeout(() => {
      scrollTimerRef.current = null;
      document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="auspicious-container">
      {/* Calendar Grid View: Dropping toolbar directly at top, flush against the grid with NO intervening cards or boxes */}
      <div id="auspicious-results-section" className="auspicious-calendar-grid-view auspicious-calendar-view calendar-view-container">
        {/* Compact Dropdown Toolbar Row: Month -> Year -> Preset -> Birthday */}
        <div className="auspicious-compact-toolbar-row">
          {/* 1. Month */}
          <div className="dropdown-compact-item" title={t.calSelectMonth}>
            <select
              id="month-select"
              className="dropdown-compact-select month-select"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              aria-label={t.calSelectMonth}
              title={t.calSelectMonth}
            >
              {localizedMonths.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Year */}
          <div className="dropdown-compact-item" title={t.calSelectYear}>
            <select
              id="year-select"
              className="dropdown-compact-select year-select"
              value={selectedYearBE}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              aria-label={t.calSelectYear}
              title={t.calSelectYear}
            >
              {(() => {
                const currentYearBE = new Date().getFullYear() + 543;
                const minYear = Math.min(2567, currentYearBE - 5, selectedYearBE - 5);
                const maxYear = Math.max(2575, currentYearBE + 5, selectedYearBE + 5);
                return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                  <option key={y} value={y}>
                    {lang === 'th' ? y : `${y - 543} (${y})`}
                  </option>
                ));
              })()}
            </select>
          </div>

          {/* 3. Preset */}
          <div className="dropdown-compact-item" title={t.calSelectPreset}>
            <select
              id="preset-select"
              className="dropdown-compact-select preset-select"
              value={currentPresetValue}
              onChange={(e) => handlePresetChange(e.target.value)}
              aria-label={t.calSelectPreset}
              title={t.calSelectPreset}
            >
              <option value="all">{t.calPresetAll}</option>
              <option value="wedding">{t.calPresetWedding}</option>
              <option value="house">{t.calPresetHouse}</option>
              <option value="vehicle_business">{t.calPresetVehicleBusiness}</option>
              <option value="merit">{t.calPresetMerit}</option>
              <option value="others">{t.calPresetOthers}</option>
              <option value="thongchai_athipadi">{t.calPresetThongchaiAthipadi}</option>
              <option value="reset">{t.calPresetReset}</option>
            </select>
          </div>

          {/* 4. Birth Day Kalakini */}
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
                  const bInfo = localizedBirthDays.find((b) => b.id === val);
                  if (bInfo) {
                    onToast(
                      format(t.calToastBirth, {
                        day: bInfo.label,
                        kalakini: bInfo.kalakiniDayName,
                      })
                    );
                  }
                } else {
                  onToast(t.calToastBirthAll);
                }
              }}
              aria-label={t.calBirthSelectAria}
            >
              <option value="none">{t.calBirthAllOpt}</option>
              {localizedBirthDays.map((b) => (
                <option key={b.id} value={b.id}>
                  {format(t.calBirthItemOpt, {
                    icon: b.icon,
                    day: b.label,
                    kalakini: b.kalakiniDayName,
                  })}
                </option>
              ))}
            </select>
            {selectedBirthDay !== 'none' && (
              <button
                type="button"
                className="btn-clear-compact-select"
                onClick={() => {
                  setSelectedBirthDay('none');
                  onToast(t.calToastBirthAll);
                }}
                title={t.calBirthResetTitle}
                aria-label={t.calBirthResetTitle}
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
                tag = t.calTagThongchai;
                tagClass = 'tag-col-thongchai';
              } else if (w.dayOfWeek === kalaYoga.athipadi) {
                tag = t.calTagAthipadi;
                tagClass = 'tag-col-athipadi';
              } else if (isUbathaCol) {
                tag = t.calTagUbatha;
                tagClass = 'tag-col-ubatha';
              } else if (isLokawinasCol) {
                tag = t.calTagLokawinas;
                tagClass = 'tag-col-lokawinas';
              }

              const fullWeekday = getLocalizedFullDayName(w.dayOfWeek, lang);
              const shortWeekday = localizedWeekdays[w.dayOfWeek] || w.short;

              return (
                <div
                  key={w.full}
                  className={`weekday-col-header col-${w.col} ${isUbathaCol ? 'col-ubatha' : ''} ${
                    isLokawinasCol ? 'col-lokawinas' : ''
                  }`}
                  style={{ borderTopColor: w.color }}
                  role="columnheader"
                >
                  <span className="weekday-name-full">{fullWeekday}</span>
                  <span className="weekday-name-short">{shortWeekday}</span>
                  {tag ? (
                    <span
                      className={`weekday-kalayoga-tag ${tagClass}`}
                      title={format(t.calColTooltip, {
                        yearLabel: formatYearLabel(selectedYearBE),
                        weekday: fullWeekday,
                        tag,
                      })}
                    >
                      {tag}
                    </span>
                  ) : (
                    <span className="weekday-kalayoga-tag tag-col-normal">{t.calTagNormal}</span>
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
              const isFilteredOut = !filteredDayDates.has(day.date);
              const thaksa =
                selectedBirthDay !== 'none'
                  ? localizedThaksaByDate.get(day.date)
                  : null;
              const dayDetails = getLocalizedDayDetails(day, lang);

              const isUbatha = day.kalaYoga === 'ubatha';
              const isLokawinas = day.kalaYoga === 'lokawinas';

              const isBadDay =
                isUbatha ||
                isLokawinas ||
                thaksa?.isKalakini;

              const shortDayName =
                lang === 'th'
                  ? day.dayNameTh.replace('วัน', '')
                  : localizedWeekdays[day.dayOfWeek] || '';

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
                      <span className="cell-tag tag-thongchai">{t.calTagShortThongchai}</span>
                    )}
                    {day.kalaYoga === 'athipadi' && (
                      <span className="cell-tag tag-athipadi">{t.calTagShortAthipadi}</span>
                    )}
                    {day.kalaYoga === 'ubatha' && (
                      <span className="cell-tag tag-ubatha">{t.calTagShortUbatha}</span>
                    )}
                    {day.kalaYoga === 'lokawinas' && (
                      <span className="cell-tag tag-lokawinas">{t.calTagShortLokawinas}</span>
                    )}
                  </div>

                  <div className="cell-middle">
                    <span className="cell-ruk-name" title={`${dayDetails.thaiRukName}: ${dayDetails.thaiRukHighlight}`}>
                      {dayDetails.thaiRukName}
                    </span>
                    <span className="cell-lunar" title={dayDetails.lunarDate}>
                      {dayDetails.lunarPhaseShort}
                    </span>
                    {day.buddhistHolyDay && (
                      <span className="cell-holy-badge" title={`${t.calHolyDayBadge}: ${dayDetails.lunarDate}`}>
                        {t.calHolyDayBadge}
                      </span>
                    )}
                  </div>

                  <div className="cell-bottom-icons">
                    {day.suitableCategories.map((c) => (
                      <span key={c} className="cell-cat-icon" title={localizedCategories[c].title}>
                        {localizedCategories[c].icon}
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

      {/* Day Inspection Modal - Portaled to document.body to prevent double-frame nesting */}
      {inspectedDay && typeof document !== 'undefined' && createPortal(
        (() => {
          const inspectedDetails = getLocalizedDayDetails(inspectedDay, lang);
          const inspectedThaksa = localizedThaksaByDate.get(inspectedDay.date);
          const inspectedMonth = localizedMonths[inspectedDay.month - 1] || THAI_MONTHS[inspectedDay.month - 1];
          const modalDateLabel =
            lang === 'th'
              ? `${inspectedDay.dayNameTh}ที่ ${inspectedDay.dayOfMonth} ${inspectedMonth} ${formatYearLabel(inspectedDay.yearBE)}`
              : `${inspectedDetails.dayName}, ${inspectedDay.dayOfMonth} ${inspectedMonth} ${formatYearLabel(inspectedDay.yearBE)}`;

          return (
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
                  aria-label={t.calModalCloseAria}
                >
                  ✕
                </button>

                {/* Modal Header */}
                <div className="modal-sheet-header">
                  <div className="modal-date-tag">{modalDateLabel}</div>
                  <h3 className="modal-title">{inspectedDetails.thaiRukName}</h3>
                  <p className="modal-subtitle">
                    {inspectedDetails.lunarDate} · {inspectedDetails.dithiName}
                  </p>
                </div>

                {/* Kala Yoga & Thaksa Alerts in Modal */}
                <div className="modal-badges-row">
                  {inspectedDay.kalaYoga === 'thongchai' && (
                    <div className="modal-alert-pill thongchai">{t.calModalThongchaiPill}</div>
                  )}
                  {inspectedDay.kalaYoga === 'athipadi' && (
                    <div className="modal-alert-pill athipadi">{t.calModalAthipadiPill}</div>
                  )}
                  {inspectedDay.kalaYoga === 'ubatha' && (
                    <div className="modal-alert-pill ubatha">{t.calModalUbathaPill}</div>
                  )}
                  {inspectedDay.kalaYoga === 'lokawinas' && (
                    <div className="modal-alert-pill lokawinas">{t.calModalLokawinasPill}</div>
                  )}

                  {selectedBirthDay !== 'none' && inspectedThaksa && (
                    <div className={`modal-alert-pill thaksa-${inspectedThaksa.badgeStyle}`}>
                      {inspectedThaksa.badgeText}
                    </div>
                  )}
                </div>

                {/* Body Information */}
                <div className="modal-body-content">
                  {/* Nakshatra & Astronomical Dithi Details */}
                  <div className="modal-info-card">
                    <h4 className="info-card-title">{t.calModalAstroTitle}</h4>
                    <div className="nakshatra-detail-row">
                      <div className="nakshatra-box">
                        <span className="nak-label">{t.calModalNakLabel}</span>
                        <strong className="nak-val text-gold">
                          {format(t.calModalNakVal, {
                            num: inspectedDay.nakshatraNumber,
                            name: inspectedDetails.nakshatraName,
                          })}
                        </strong>
                      </div>
                      <div className="nakshatra-box">
                        <span className="nak-label">{t.calModalDithiLabel}</span>
                        <strong className="nak-val">{inspectedDetails.lunarDate}</strong>
                      </div>
                    </div>
                    <div className="info-card-highlight">
                      {format(t.calModalAstroHighlight, { ruk: inspectedDetails.thaiRukName })}
                    </div>
                  </div>

                  {/* Meaning & Highlight */}
                  <div className="modal-info-card">
                    <h4 className="info-card-title">{t.calModalMeaningTitle}</h4>
                    <p className="info-card-desc">{inspectedDetails.thaiRukMeaning}</p>
                    <div className="info-card-highlight">
                      <strong>{t.calModalHighlightPrefix}</strong> {inspectedDetails.thaiRukHighlight}
                    </div>
                  </div>

                  {/* Timing & Ubakong Yama */}
                  <div className="modal-info-card">
                    <h4 className="info-card-title">{t.calModalHoursTitle}</h4>
                    <div className="hours-grid">
                      <div className="hour-stat-box">
                        <span className="hour-label">{t.calModalPrimaryHour}</span>
                        <span className="hour-val text-gold">{inspectedDetails.bestHours.primaryTime}</span>
                      </div>
                      {inspectedDetails.bestHours.secondaryTime && (
                        <div className="hour-stat-box">
                          <span className="hour-label">{t.calModalSecondaryHour}</span>
                          <span className="hour-val">{inspectedDetails.bestHours.secondaryTime}</span>
                        </div>
                      )}
                      <div className="hour-stat-box full-width">
                        <span className="hour-label">{t.calModalUbakongLabel}</span>
                        <span className="hour-val text-ok">{inspectedDetails.bestHours.ubakongYama}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direction & Colors */}
                  <div className="modal-info-card">
                    <h4 className="info-card-title">{t.calModalDirColorTitle}</h4>
                    <div className="directions-grid">
                      <div className="dir-item">
                        <span className="dir-label">{t.calModalDirectionLabel}</span>
                        <span className="dir-val">{inspectedDetails.auspiciousDirection}</span>
                      </div>
                      <div className="dir-item">
                        <span className="dir-label">{t.calModalLuckyColorLabel}</span>
                        <span className="dir-val text-gold">{inspectedDetails.luckyColors.join(', ')}</span>
                      </div>
                      <div className="dir-item">
                        <span className="dir-label">{t.calModalUnluckyColorLabel}</span>
                        <span className="dir-val text-bad">{inspectedDetails.unluckyColors.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Suitable categories & Tips */}
                  <div className="modal-info-card">
                    <h4 className="info-card-title">{t.calModalTipsTitle}</h4>
                    <div className="modal-tips-list">
                      {inspectedDay.suitableCategories.length > 0 ? (
                        inspectedDay.suitableCategories.map((catKey) => (
                          <div key={catKey} className="modal-tip-item">
                            <span className="tip-cat-title">
                              {localizedCategories[catKey].icon} {localizedCategories[catKey].title}
                            </span>
                            <p className="tip-cat-content">
                              {inspectedDetails.ceremonyTips[catKey] || localizedCategories[catKey].shortDesc}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-bad">{t.calModalTabooDayDesc}</p>
                      )}
                    </div>
                  </div>

                  {/* Prohibitions */}
                  {inspectedDetails.prohibitions.length > 0 && (
                    <div className="modal-prohibitions-box">
                      <strong>{t.calModalProhibitionTitle}</strong>
                      <ul>
                        {inspectedDetails.prohibitions.map((p, idx) => (
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
                    {t.calModalCopyBtn}
                  </button>
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => handleSaveToJournal(inspectedDay)}
                  >
                    {t.calModalSaveBtn}
                  </button>
                  <button
                    type="button"
                    className="btn red"
                    onClick={() => {
                      handleOpenLuckyCard(inspectedDay);
                      setInspectedDay(null);
                    }}
                  >
                    {t.calModalCardBtn}
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
};
