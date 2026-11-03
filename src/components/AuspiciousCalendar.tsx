import React, { useState, useMemo, useCallback } from 'react';
import {
  generateMonthAuspiciousDays,
  getKalaYogaForYear,
  getThaksaRelation,
  BIRTH_DAYS,
  WORK_CATEGORIES_INFO,
  THAI_RUK_DESCRIPTIONS,
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

export type ViewMode = 'table' | 'category' | 'calendar';

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
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [inspectedDay, setInspectedDay] = useState<AuspiciousDay | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInputValue, setSearchInputValue] = useState<string>('');

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

  // Smart Natural Language & Astrological Intent Parser
  const executeAstrologicalSearch = useCallback(
    (rawQuery: string) => {
      const q = rawQuery.trim();
      const lower = q.toLowerCase();
      const detectedChanges: string[] = [];

      // 1. Month detection: full Thai names, common abbreviations, and forms without dots
      const monthAliases = [
        ['มกราคม', 'ม.ค.', 'มค'],
        ['กุมภาพันธ์', 'ก.พ.', 'กพ'],
        ['มีนาคม', 'มี.ค.', 'มีค'],
        ['เมษายน', 'เม.ย.', 'เมย'],
        ['พฤษภาคม', 'พ.ค.', 'พค'],
        ['มิถุนายน', 'มิ.ย.', 'มิย'],
        ['กรกฎาคม', 'ก.ค.', 'กค'],
        ['สิงหาคม', 'ส.ค.', 'สค'],
        ['กันยายน', 'ก.ย.', 'กย'],
        ['ตุลาคม', 'ต.ค.', 'ตค'],
        ['พฤศจิกายน', 'พ.ย.', 'พย'],
        ['ธันวาคม', 'ธ.ค.', 'ธค'],
      ];
      const normalizeThai = (value: string) => value.toLowerCase().replace(/[.\s]/g, '');
      let monthTarget = selectedMonth;
      const normalizedQuery = normalizeThai(lower);
      monthAliases.forEach((aliases, idx) => {
        if (aliases.some((alias) => normalizedQuery.includes(normalizeThai(alias)))) {
          monthTarget = idx + 1;
          setSelectedMonth(monthTarget);
          detectedChanges.push(`เดือน ${THAI_MONTHS[idx]}`);
        }
      });

      // 2. Year detection (B.E. 2567-2575 or C.E. 2024-2032)
      let yearTarget = selectedYearBE;
      const matchYearBE = lower.match(/(?<!\d)25(?:6[7-9]|7[0-5])(?!\d)/);
      const matchYearCE = lower.match(/(?<!\d)(?:202[4-9]|203[0-2])(?!\d)/);
      if (matchYearBE) {
        yearTarget = parseInt(matchYearBE[0], 10);
        setSelectedYearBE(yearTarget);
        detectedChanges.push(`พ.ศ. ${yearTarget}`);
      } else if (matchYearCE) {
        yearTarget = parseInt(matchYearCE[0], 10) + 543;
        setSelectedYearBE(yearTarget);
        detectedChanges.push(`พ.ศ. ${yearTarget}`);
      }

      // 3. Category detection (handling multi-category requests and prompt-pasting)
      const catMatches: AuspiciousWorkCategory[] = [];
      if (lower.includes('แต่งงาน') || lower.includes('สมรส') || lower.includes('หมั้น') || lower.includes('wedding')) catMatches.push('wedding');
      if (lower.includes('ขึ้นบ้านใหม่') || lower.includes('ย้ายบ้าน') || lower.includes('ย้ายเข้า') || lower.includes('ปลูกบ้าน')) catMatches.push('house');
      if (lower.includes('ทำบุญ') || lower.includes('สังฆทาน') || lower.includes('ทำบุญบริษัท') || lower.includes('ทำบุญบ้าน')) catMatches.push('merit');
      if (lower.includes('ออกรถ') || lower.includes('เปิดร้าน') || lower.includes('เปิดกิจการ') || lower.includes('รถใหม่')) catMatches.push('vehicle_business');
      if (lower.includes('ศัลยกรรม') || lower.includes('เจรจา') || lower.includes('ค้าขาย') || lower.includes('ลงทุน') || lower.includes('สัญญา')) catMatches.push('others');

      if (catMatches.length >= 2 || lower.includes('ทุกประเภท') || lower.includes('ทั้งหมด') || lower.includes('แยกตามประเภทงาน')) {
        setSelectedCategory('all');
        detectedChanges.push('ทุกประเภทงาน (วิเคราะห์ครบ 5 หมวด)');
      } else if (catMatches.length === 1) {
        setSelectedCategory(catMatches[0]);
        detectedChanges.push(`หมวด${WORK_CATEGORIES_INFO[catMatches[0]].titleTh.split('/')[0].trim()}`);
      }

      // 4. Birthday detection — labels and Kalakini weekday come from the engine data.
      const selectBirthday = (id: BirthDayId) => {
        const option = BIRTH_DAYS.find((b) => b.id === id);
        setSelectedBirthDay(id);
        setAvoidKalakini(true);
        if (option) {
          detectedChanges.push(`คนเกิด${option.labelTh} (หลีกเลี่ยง${option.kalakiniDayNameTh})`);
        }
      };

      if (lower.includes('พุธกลางคืน') || lower.includes('ราหู')) {
        selectBirthday('wednesday_night');
      } else if (lower.includes('วันอาทิตย์') || lower.includes('เกิดอาทิตย์')) {
        selectBirthday('sunday');
      } else if (lower.includes('วันจันทร์') || lower.includes('เกิดจันทร์')) {
        selectBirthday('monday');
      } else if (lower.includes('วันอังคาร') || lower.includes('เกิดอังคาร')) {
        selectBirthday('tuesday');
      } else if (lower.includes('วันพุธ') || lower.includes('เกิดพุธ')) {
        selectBirthday('wednesday_day');
      } else if (lower.includes('วันพฤหัส') || lower.includes('เกิดพฤหัส')) {
        selectBirthday('thursday');
      } else if (lower.includes('วันศุกร์') || lower.includes('เกิดศุกร์')) {
        selectBirthday('friday');
      } else if (lower.includes('วันเสาร์') || lower.includes('เกิดเสาร์')) {
        selectBirthday('saturday');
      }

      // 5. View mode detection
      if (lower.includes('ตาราง') || lower.includes('table')) {
        setViewMode('table');
        detectedChanges.push('รูปแบบตาราง (Table)');
      } else if (lower.includes('ประเภทงาน') || lower.includes('category') || lower.includes('หมวด')) {
        setViewMode('category');
        detectedChanges.push('รูปแบบแยกตามหมวดงาน');
      } else if (lower.includes('ปฏิทินรายเดือน') || lower.includes('calendar') || lower.includes('grid')) {
        setViewMode('calendar');
        detectedChanges.push('รูปแบบปฏิทินรายเดือน');
      }

      // 6. Specific date detection: "วันที่ 4", "4 ก.พ.", "12 ส.ค. 2569", or "4/2/2569"
      const numericDate = lower.match(/(?:วันที่\s*)?(\d{1,2})\s*[\/-]\s*(\d{1,2})(?:\s*[\/-]\s*(25\d{2}|20\d{2}))?/);
      const namedDate = lower.match(/(?:วันที่\s*)?(\d{1,2})\s*(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?)(?:\s*(25\d{2}|20\d{2}))?/);
      const dayOnly = lower.match(/^(?:(?:วันที่|วันที)\s*)?(\d{1,2})$/);
      let requestedDay: number | null = null;
      let dateNotFoundMessage: string | null = null;
      if (numericDate && (Number(numericDate[2]) < 1 || Number(numericDate[2]) > 12)) {
        dateNotFoundMessage = `เดือน ${numericDate[2]} ไม่ถูกต้อง กรุณาระบุเดือน 1–12`;
      } else if (numericDate) {
        requestedDay = Number(numericDate[1]);
        monthTarget = Number(numericDate[2]);
        if (numericDate[3]) {
          yearTarget = Number(numericDate[3]);
          if (yearTarget < 2400) yearTarget += 543;
        }
      } else if (namedDate) {
        requestedDay = Number(namedDate[1]);
        const dateMonth = normalizeThai(namedDate[2]);
        const dateMonthIndex = monthAliases.findIndex((aliases) => aliases.some((alias) => normalizeThai(alias) === dateMonth));
        if (dateMonthIndex >= 0) {
          monthTarget = dateMonthIndex + 1;
        }
        if (namedDate[3]) {
          yearTarget = Number(namedDate[3]);
          if (yearTarget < 2400) yearTarget += 543;
        }
      } else if (dayOnly) {
        requestedDay = Number(dayOnly[1]);
      }

      if (requestedDay !== null) {
        if (requestedDay >= 1 && requestedDay <= 31) {
          const targetDays = generateMonthAuspiciousDays(yearTarget, monthTarget);
          const targetDay = targetDays.find((d) => d.dayOfMonth === requestedDay);
          setSelectedMonth(monthTarget);
          setSelectedYearBE(yearTarget);
          if (targetDay) {
            setInspectedDay(targetDay);
            detectedChanges.push(`วันที่ ${requestedDay} ${THAI_MONTHS[monthTarget - 1]}`);
          } else {
            setInspectedDay(null);
            dateNotFoundMessage = `ไม่พบวันที่ ${requestedDay} ในเดือน ${THAI_MONTHS[monthTarget - 1]} พ.ศ. ${yearTarget}`;
          }
        } else {
          dateNotFoundMessage = `วันที่ ${requestedDay} ไม่ถูกต้อง กรุณาระบุวันที่ 1–31`;
        }
      }

      // 7. General search intent vs specific astrological keyword
      const isGenericIntent =
        !q ||
        lower.includes('จงทำหน้าที่') ||
        lower.includes('ผู้เชี่ยวชาญ') ||
        lower.includes('ช่วยสร้าง') ||
        lower.includes('คำนวณ') ||
        lower.includes('ฤกษ์มงคล') ||
        lower.includes('ปฏิทิน') ||
        lower.includes('วันมงคล') ||
        lower.includes('ฤกษ์ดี') ||
        lower.includes('วันดี') ||
        lower.includes('ฤกษ์งามยามดี') ||
        lower.includes('หาฤกษ์') ||
        lower.includes('ขอฤกษ์') ||
        lower.includes('ตรวจฤกษ์') ||
        lower.includes('เช็คฤกษ์') ||
        dateNotFoundMessage !== null ||
        detectedChanges.length > 0;

      if (isGenericIntent) {
        // Clear text-based pruning so all matching days are mapped and displayed in the table/cards
        setSearchQuery('');
        if (dateNotFoundMessage) {
          onToast(dateNotFoundMessage);
        } else if (detectedChanges.length > 0) {
          onToast(`✨ คำนวณตามเงื่อนไข: ${detectedChanges.join(' · ')}`);
        } else {
          onToast(`✨ คำนวณวันมงคลเดือน ${THAI_MONTHS[monthTarget - 1]} พ.ศ. ${yearTarget}`);
        }
      } else {
        // Specific astrological filter keyword (e.g. "ธงชัย", "อธิบดี", "มหัทธโน", "ทิศเหนือ")
        setSearchQuery(q);
        onToast(`🔍 ค้นหา: "${q}"`);
      }

      // Smoothly scroll to the results table/list section
      setTimeout(() => {
        document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    },
    [onToast, selectedMonth, selectedYearBE, THAI_MONTHS]
  );

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

  // Summary statistics for the month
  const monthStats = useMemo(() => {
    const totalDays = allMonthDays.length;
    const masterDays = allMonthDays.filter((d) => d.isMasterAuspicious).length;
    const thongchaiDays = allMonthDays.filter((d) => d.kalaYoga === 'thongchai').length;
    const ubathaDays = allMonthDays.filter((d) => d.kalaYoga === 'ubatha');
    const lokawinasDays = allMonthDays.filter((d) => d.kalaYoga === 'lokawinas');

    return {
      totalDays,
      masterDays,
      thongchaiDays,
      ubathaDates: ubathaDays.map((d) => d.dayOfMonth),
      lokawinasDates: lokawinasDays.map((d) => d.dayOfMonth),
    };
  }, [allMonthDays]);

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

  // Handle Copy Full Monthly Astrological Consultation Report
  const handleCopyMonthReport = () => {
    const monthName = THAI_MONTHS[selectedMonth - 1];
    let report = `✨ ปฏิทินวันมงคลและฤกษ์งามยามดี ✨\n`;
    report += `ประจำเดือน ${monthName} พ.ศ. ${selectedYearBE}\n`;
    report += `คำนวณและวิเคราะห์โดย: ผู้เชี่ยวชาญด้านโหราศาสตร์ไทยและการคำนวณฤกษ์ยาม\n`;

    if (selectedBirthDay !== 'none') {
      const bInfo = BIRTH_DAYS.find((b) => b.id === selectedBirthDay);
      report += avoidKalakini
        ? `👤 เงื่อนไขดวงชะตา: สำหรับคนเกิด${bInfo?.labelTh} (ตัดวันกาลกิณี: ${bInfo?.kalakiniDayNameTh})\n`
        : `👤 ข้อมูลวันเกิด: คนเกิด${bInfo?.labelTh} (ไม่ได้เปิดตัวเลือกหลีกเลี่ยงวันกาลกิณี)\n`;
    }

    report += `\n⚠️ ประกาศวันกาลโยคที่ต้องระวังประจำเดือน ${monthName} ${selectedYearBE}:\n`;
    report += `• วันอุบาทว์: ${kalaYoga.ubathaNameTh} (วันที่ ${monthStats.ubathaDates.join(', ') || '-'}) - ควรงดเว้นการประกอบพิธีมงคล\n`;
    report += `• วันโลกาวินาศ: ${kalaYoga.lokawinasNameTh} (วันที่ ${monthStats.lokawinasDates.join(', ') || '-'}) - ห้ามประกอบพิธีมงคลเด็ดขาด\n`;
    report += `• วันธงชัย: ${kalaYoga.thongchaiNameTh} (มงคลเลิศล้ำ)\n`;
    report += `• วันอธิบดี: ${kalaYoga.athipadiNameTh} (เกียรติยศ อำนาจบารมี)\n\n`;

    report += `═════════════════════════════════════════\n`;
    report += `วิเคราะห์ฤกษ์มงคลแยกตาม ๕ ประเภทงาน:\n`;
    report += `═════════════════════════════════════════\n\n`;

    const reportDays = allMonthDays.filter((d) =>
      !(selectedBirthDay !== 'none' && avoidKalakini && thaksaByDate.get(d.date)?.isKalakini)
    );
    (Object.keys(WORK_CATEGORIES_INFO) as AuspiciousWorkCategory[]).forEach((catKey, idx) => {
      const cat = WORK_CATEGORIES_INFO[catKey];
      const days = reportDays.filter((d) => d.suitableCategories.includes(catKey));
      report += `${idx + 1}. ${cat.titleTh} (${cat.icon})\n`;
      report += `   ข้อพึงระวัง: ${cat.taboosTh}\n`;
      if (days.length === 0) {
        report += `   - ไม่พบวันมงคลที่ตรงกับเงื่อนไขในเดือนนี้\n\n`;
      } else {
        days.forEach((d) => {
          report += `   • ${d.dayNameTh}ที่ ${d.dayOfMonth} ${monthName} ${selectedYearBE} (${d.lunarDateTh})\n`;
          report += `     - ฤกษ์โหราศาสตร์: ${d.thaiRukNameTh} (${d.thaiRukHighlight})\n`;
          report += `     - ยามมงคลที่ดีที่สุด: ${d.bestHours.primaryTime} (${d.bestHours.ubakongYama})\n`;
          report += `     - ทิศมงคล: ${d.auspiciousDirection} | สีมงคล: ${d.luckyColors.join(', ')}\n`;
          if (d.ceremonyTips[catKey]) {
            report += `     - คำแนะนำ/เคล็ดพิธี: ${d.ceremonyTips[catKey]}\n`;
          }
        });
        report += `\n`;
      }
    });

    report += `— ออกรายงานโดย โหราจารย์ประจำ Lucky Shrine ศาลเจ้าแห่งโชคลาภ`;

    navigator.clipboard
      .writeText(report)
      .then(() => onToast('คัดลอกรายงานปฏิทินฤกษ์มงคลฉบับเต็มเรียบร้อยแล้ว 📋✨'))
      .catch(() => onToast('ไม่สามารถคัดลอกได้ โปรดลองอีกครั้ง'));
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

  return (
    <div className="auspicious-container">
      {/* Title & Introduction */}
      <div className="auspicious-header-box">
        <div className="auspicious-header-badge">
          <span className="badge-flair">โหราศาสตร์ไทย & การคำนวณฤกษ์ยาม</span>
          <span className="badge-be">พ.ศ. {selectedYearBE}</span>
        </div>
        <h2 className="auspicious-main-title">ปฏิทินวันมงคลและฤกษ์งามยามดี</h2>
        <p className="auspicious-main-desc">
          วิเคราะห์เจาะลึก 5 หมวดหมู่งานมงคล ตามหลักบูรณฤกษ์ทั้ง ๙, ดิถีอำมฤตโชค, ยามอุบากอง
          และมหาทักษาพยากรณ์ประจำวันเกิด เพื่อความสำเร็จ ไร้อุปสรรค และความเจริญรุ่งเรือง
        </p>
      </div>

      {/* Kala Yoga Warning Banner (กาลโยคประจำปี) */}
      <section className="kala-yoga-banner" aria-label="แจ้งเตือนกาลโยคประจำปี">
        <div className="kala-banner-header">
          <div className="kala-badge-item thongchai">
            <span className="kala-dot" />
            <span className="kala-label">วันธงชัย:</span>
            <span className="kala-day-val">{kalaYoga.thongchaiNameTh}</span>
          </div>
          <div className="kala-badge-item athipadi">
            <span className="kala-dot" />
            <span className="kala-label">วันอธิบดี:</span>
            <span className="kala-day-val">{kalaYoga.athipadiNameTh}</span>
          </div>
          <div className="kala-badge-item ubatha">
            <span className="kala-dot" />
            <span className="kala-label">วันอุบาทว์:</span>
            <span className="kala-day-val">{kalaYoga.ubathaNameTh}</span>
          </div>
          <div className="kala-badge-item lokawinas">
            <span className="kala-dot" />
            <span className="kala-label">วันโลกาวินาศ:</span>
            <span className="kala-day-val">{kalaYoga.lokawinasNameTh}</span>
          </div>
        </div>

        <div className="kala-alert-box">
          <div className="kala-alert-icon">⚠️</div>
          <div className="kala-alert-content">
            <h4 className="kala-alert-title">
              แจ้งเตือนวันกาลโยคที่ต้องระวังประจำเดือน {THAI_MONTHS[selectedMonth - 1]} พ.ศ. {selectedYearBE}
            </h4>
            <p className="kala-alert-text">
              ตามหลักกาลโยคโบราณ{' '}
              <strong className="text-bad">
                {kalaYoga.ubathaNameTh} (วันที่ {monthStats.ubathaDates.join(', ')}) เป็น &quot;วันอุบาทว์&quot;
              </strong>{' '}
              และ{' '}
              <strong className="text-bad">
                {kalaYoga.lokawinasNameTh} (วันที่ {monthStats.lokawinasDates.join(', ')}) เป็น &quot;วันโลกาวินาศ&quot;
              </strong>{' '}
              พึงหลีกเลี่ยงการจัดพิธีแต่งงาน ขึ้นบ้านใหม่ ออกรถ หรือเปิดกิจการในวันดังกล่าวเพื่อความปลอดภัยและความสบายใจ
            </p>
          </div>
        </div>
      </section>

      {/* Control Panel: Month / Year / Birthday / Filters */}
      <section className="auspicious-controls-panel">
        <div className="control-row-grid">
          {/* Month & Year Selectors */}
          <div className="control-group">
            <label htmlFor="month-select" className="control-label">
              <span>📅 เดือนและปี พ.ศ.</span>
            </label>
            <div className="control-inputs-inline">
              <div className="month-stepper-group">
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
                  className="input-select month-select"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  aria-label="เลือกเดือน"
                >
                  {THAI_MONTHS.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
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

              <select
                className="input-select year-select"
                value={selectedYearBE}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                aria-label="เลือกปี พ.ศ."
              >
                {Array.from({ length: Math.max(2575, selectedYearBE + 5) - Math.min(2567, selectedYearBE - 5) + 1 }, (_, i) => Math.min(2567, selectedYearBE - 5) + i).map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {y}
                  </option>
                ))}
              </select>

              {/* Quick Reset to Nov 2569 Button if not already selected */}
              {(selectedMonth !== 11 || selectedYearBE !== 2569) && (
                <button
                  type="button"
                  className="btn-quick-chip"
                  onClick={() => {
                    handleMonthChange(11);
                    handleYearChange(2569);
                    onToast('เปลี่ยนกลับมายัง พฤศจิกายน 2569 แล้ว');
                  }}
                  title="กลับสู่ พฤศจิกายน 2569"
                >
                  พ.ย. 2569
                </button>
              )}
            </div>
          </div>

          {/* Birthday Selector (มหาทักษาพยากรณ์) */}
          <div className="control-group">
            <label htmlFor="birthday-select" className="control-label">
              <span>👤 วันเกิดของเจ้าชะตา (สำหรับเทียบทักษา & หลีกเลี่ยงกาลกิณี)</span>
            </label>
            <div className="control-inputs-inline">
              <select
                id="birthday-select"
                className="input-select birthday-select"
                value={selectedBirthDay}
                onChange={(e) => {
                  const val = e.target.value as BirthDayId | 'none';
                  setSelectedBirthDay(val);
                  if (val !== 'none') setAvoidKalakini(true);
                }}
              >
                <option value="none">-- ทุกวันเกิด (ดูภาพรวมทุกวัน) --</option>
                {BIRTH_DAYS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.icon} {b.labelTh} (กาลกิณี: {b.kalakiniDayNameTh})
                  </option>
                ))}
              </select>
            </div>

            {selectedBirthDay !== 'none' ? (
              <label className="checkbox-toggle-wrap" style={{ marginTop: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={avoidKalakini}
                  onChange={(e) => setAvoidKalakini(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span className="toggle-label-text">
                  <strong>หลีกเลี่ยงวันกาลกิณี</strong> ของคนเกิด
                  {BIRTH_DAYS.find((b) => b.id === selectedBirthDay)?.labelTh} (ซ่อน
                  {BIRTH_DAYS.find((b) => b.id === selectedBirthDay)?.kalakiniDayNameTh} อัตโนมัติ)
                </span>
              </label>
            ) : (
              <span className="birthday-hint-text" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                💡 เลือกวันเกิดของคุณเพื่อเปิดระบบตัดวันกาลกิณีเฉพาะบุคคลอัตโนมัติ
              </span>
            )}
          </div>
        </div>

        {/* Astrological Smart Search & Calculation Command Bar */}
        <div className="astrological-search-card">
          <form
            className="search-form-row"
            onSubmit={(e) => {
              e.preventDefault();
              executeAstrologicalSearch(searchInputValue);
            }}
          >
            <div className="search-filter-wrap">
              <span className="search-icon" aria-hidden="true">
                🔮
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="พิมพ์คำขอหรือระบุฤกษ์ เช่น: ฤกษ์แต่งงาน พฤศจิกายน 2569 คนเกิดวันจันทร์, ออกรถใหม่, ขึ้นบ้านใหม่..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                aria-label="ช่องค้นหาและคำนวณฤกษ์มงคล"
              />
              {searchInputValue && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => {
                    setSearchInputValue('');
                    setSearchQuery('');
                    onToast('ล้างคำค้นหาแล้ว แสดงวันมงคลทั้งหมด');
                  }}
                  title="ล้างข้อความค้นหา"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn gold btn-search-execute"
              title="กดเพื่อคำนวณฤกษ์มงคลตามคำขอทันที"
            >
              <span>✨ คำนวณฤกษ์มงคล</span>
            </button>
          </form>

          {/* Quick-Click Prompt Suggestion Chips */}
          <div className="search-quick-chips">
            <span className="quick-chips-label">⚡ คำขอและฤกษ์ยอดนิยม:</span>
            <button
              type="button"
              className={`quick-chip ${selectedCategory === 'wedding' ? 'active-chip' : ''}`}
              onClick={() => {
                setSelectedCategory('wedding');
                setSelectedMonth(11);
                setSelectedYearBE(2569);
                setSearchInputValue('ฤกษ์แต่งงาน / จดทะเบียนสมรส');
                setSearchQuery('');
                onToast('💍 แสดงฤกษ์แต่งงาน / จดทะเบียนสมรส พฤศจิกายน 2569');
                setTimeout(() => {
                  document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              💍 ฤกษ์แต่งงาน / จดทะเบียนสมรส
            </button>
            <button
              type="button"
              className={`quick-chip ${selectedCategory === 'house' ? 'active-chip' : ''}`}
              onClick={() => {
                setSelectedCategory('house');
                setSelectedMonth(11);
                setSelectedYearBE(2569);
                setSearchInputValue('ฤกษ์ขึ้นบ้านใหม่ / ย้ายเข้าที่อยู่อาศัยใหม่');
                setSearchQuery('');
                onToast('🏡 แสดงฤกษ์ขึ้นบ้านใหม่ / ย้ายเข้าที่อยู่อาศัยใหม่ พฤศจิกายน 2569');
                setTimeout(() => {
                  document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              🏡 ฤกษ์ขึ้นบ้านใหม่
            </button>
            <button
              type="button"
              className={`quick-chip ${selectedCategory === 'vehicle_business' ? 'active-chip' : ''}`}
              onClick={() => {
                setSelectedCategory('vehicle_business');
                setSelectedMonth(11);
                setSelectedYearBE(2569);
                setSearchInputValue('ฤกษ์ออกรถใหม่ / ขึ้นบ้านใหม่ / เปิดกิจการร้านค้า');
                setSearchQuery('');
                onToast('🚗 แสดงฤกษ์ออกรถใหม่ / เปิดกิจการร้านค้า พฤศจิกายน 2569');
                setTimeout(() => {
                  document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              🚗 ฤกษ์ออกรถ / เปิดร้าน
            </button>
            <button
              type="button"
              className={`quick-chip ${selectedCategory === 'merit' ? 'active-chip' : ''}`}
              onClick={() => {
                setSelectedCategory('merit');
                setSelectedMonth(11);
                setSelectedYearBE(2569);
                setSearchInputValue('ฤกษ์ทำบุญประจำปี / ทำบุญบริษัท / ทำบุญบ้าน');
                setSearchQuery('');
                onToast('🙏 แสดงฤกษ์ทำบุญประจำปี / ทำบุญบริษัท / ทำบุญบ้าน พฤศจิกายน 2569');
                setTimeout(() => {
                  document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              🙏 ฤกษ์ทำบุญบ้าน/บริษัท
            </button>
            <button
              type="button"
              className={`quick-chip ${selectedCategory === 'others' ? 'active-chip' : ''}`}
              onClick={() => {
                setSelectedCategory('others');
                setSelectedMonth(11);
                setSelectedYearBE(2569);
                setSearchInputValue('ฤกษ์มงคลอื่นๆ (เจรจาค้าขาย, ทำศัลยกรรม)');
                setSearchQuery('');
                onToast('✨ แสดงฤกษ์มงคลอื่นๆ (เจรจาค้าขาย/ศัลยกรรม) พฤศจิกายน 2569');
                setTimeout(() => {
                  document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              ✨ ฤกษ์ศัลยกรรม/ค้าขาย
            </button>
            <button
              type="button"
              className="quick-chip gold-chip"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBirthDay('none');
                setAvoidKalakini(false);
                setSelectedMonth(11);
                setSelectedYearBE(2569);
                setSearchInputValue('วันธงชัย & วันอธิบดี');
                setSearchQuery('thongchai_athipadi');
                onToast('⭐ แสดงเฉพาะวันธงชัยและวันอธิบดี พฤศจิกายน 2569');
                setTimeout(() => {
                  document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
            >
              ⭐ วันธงชัย & วันอธิบดี
            </button>
            {(searchQuery || selectedCategory !== 'all' || selectedBirthDay !== 'none') && (
              <button
                type="button"
                className="quick-chip reset-chip"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBirthDay('none');
                  setAvoidKalakini(false);
                  setSearchInputValue('');
                  setSearchQuery('');
                  onToast('รีเซ็ตตัวกรองแล้ว แสดงวันมงคลทั้งหมดของเดือน');
                  setTimeout(() => {
                    document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                🔄 รีเซ็ตแสดงทุกวัน
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (5 หมวดหมู่งาน) */}
        <div className="category-pills-bar" role="tablist" aria-label="เลือกประเภทงานมงคล">
          <button
            type="button"
            className={`pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setTimeout(() => {
                document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          >
            <span>🌟 ทุกประเภทงาน</span>
          </button>
          {(Object.keys(WORK_CATEGORIES_INFO) as AuspiciousWorkCategory[]).map((catKey) => {
            const cat = WORK_CATEGORIES_INFO[catKey];
            const isActive = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                className={`pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(catKey);
                  setSearchQuery('');
                  setTimeout(() => {
                    document.getElementById('auspicious-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              >
                <span className="pill-icon">{cat.icon}</span>
                <span className="pill-title">{cat.titleTh}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Calculation Results Section Anchor & Banner */}
      <div id="auspicious-results-section" className="auspicious-results-anchor">
        <div className="calculation-results-summary-card">
          <div className="summary-card-left">
            <span className="summary-card-icon">✨</span>
            <div className="summary-card-text">
              <h3 className="summary-card-title">
                ผลการคำนวณฤกษ์มงคล:{' '}
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

      {/* View Mode Tabs: Table vs Category vs Calendar */}
      <div className="view-mode-tabs-bar">
        <div className="view-mode-group" role="tablist">
          <button
            type="button"
            className={`btn-view-mode ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="แสดงผลในรูปแบบ ตาราง (Table)"
          >
            <span>📊 ตาราง (Table)</span>
          </button>
          <button
            type="button"
            className={`btn-view-mode ${viewMode === 'category' ? 'active' : ''}`}
            onClick={() => setViewMode('category')}
            title="แสดงผลในรูปแบบ รายการแยกตามประเภทงาน (Category View)"
          >
            <span>📑 รายการแยกตามประเภทงาน (Category View)</span>
          </button>
          <button
            type="button"
            className={`btn-view-mode ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            title="แสดงผลในรูปแบบ ปฏิทินรายเดือน (Calendar Grid)"
          >
            <span>🗓️ ปฏิทินรายเดือน (Calendar Grid)</span>
          </button>
        </div>

        <div className="view-results-actions-row">
          <button
            type="button"
            className="btn-copy-report-top"
            onClick={handleCopyMonthReport}
            title="คัดลอกรายงานปฏิทินวันมงคลและฤกษ์งามยามดีประจำเดือนฉบับเต็ม"
          >
            <span>📋 คัดลอกรายงานสรุปฤกษ์มงคล</span>
          </button>
          <div className="view-results-count">
            พบวันมงคล <strong>{filteredDays.length}</strong> วัน (จากทั้งหมด {allMonthDays.length} วัน)
          </div>
        </div>
      </div>

      {/* Quick Date Selection Strip: keep as a secondary picker outside the full-month grid. */}
      {viewMode !== 'calendar' && (
      <div className="quick-date-strip-container" aria-label="แถบเลือกวันที่ในเดือน">
        <div className="quick-date-strip-header">
          <span className="strip-header-title">
            📅 เลือกวันที่ในเดือน {THAI_MONTHS[selectedMonth - 1]} ({allMonthDays.length} วัน):
          </span>
          <span className="strip-help-text">คลิกวันที่เพื่อดูคำพยากรณ์และยามมงคลทันที</span>
        </div>
        <div className="quick-date-strip-scroll">
          {allMonthDays.map((day) => {
            const isSelected = inspectedDay?.date === day.date;
            const isMatchFilter = filteredDays.some((d) => d.date === day.date);
            const isWarning = day.kalaYoga === 'ubatha' || day.kalaYoga === 'lokawinas';

            return (
              <button
                key={day.date}
                type="button"
                className={`date-strip-chip ${isSelected ? 'chip-selected' : ''} ${
                  day.isMasterAuspicious ? 'chip-master' : ''
                } ${isWarning ? 'chip-warning' : ''} ${!isMatchFilter ? 'chip-dimmed' : ''}`}
                onClick={() => {
                  setInspectedDay(day);
                  onToast(`✨ เลือกวันที่ ${day.dayOfMonth} ${THAI_MONTHS[selectedMonth - 1]} (${day.thaiRukNameTh})`);
                }}
                title={`${day.dayNameTh}ที่ ${day.dayOfMonth} - ${day.thaiRukNameTh} (${day.thaiRukHighlight})`}
              >
                <span className="chip-day-name">{day.dayNameTh.replace('วัน', '')}</span>
                <span className="chip-day-num">{day.dayOfMonth}</span>
                <span className="chip-tag-dot">
                  {day.kalaYoga === 'thongchai'
                    ? '⭐'
                    : isWarning
                    ? '⚠️'
                    : day.isMasterAuspicious
                    ? '✨'
                    : '•'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Main Content Area based on View Mode */}
      <div className="auspicious-views-viewport">
        {filteredDays.length === 0 && viewMode !== 'calendar' ? (
          <div className="auspicious-empty-state">
            <span className="empty-emblem">⛩️</span>
            <h3>ไม่พบวันมงคลที่ตรงกับเงื่อนไขที่เลือก</h3>
            <p>
              {selectedBirthDay !== 'none' && avoidKalakini
                ? `วันมงคลในเดือนนี้อาจตรงกับวันกาลกิณีของคนเกิด${BIRTH_DAYS.find((b) => b.id === selectedBirthDay)?.labelTh || ''} หรือหมวดหมู่งานที่จำกัด`
                : 'ลองเลือกหมวดหมู่งานเป็น "ทุกประเภทงาน" หรือเลือกดูเดือนอื่น'}
            </p>
            <div className="empty-state-actions" style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn gold"
                onClick={() => {
                  setSelectedCategory('all');
                  setAvoidKalakini(false);
                  setSearchQuery('');
                  setSearchInputValue('');
                  onToast('🌟 แสดงวันมงคลทั้งหมดของเดือนเรียบร้อยแล้ว');
                }}
              >
                🌟 แสดงทุกวันของเดือนนี้
              </button>
              {selectedBirthDay !== 'none' && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setAvoidKalakini(false);
                    setSearchQuery('');
                    onToast('🔄 ปลดตัวกรองวันกาลกิณีแล้ว');
                  }}
                >
                  🔄 ดูโดยไม่ตัดวันกาลกิณี
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* VIEW 1: TABLE VIEW (ตารางตามโจทย์) */}
            {viewMode === 'table' && (
              <div className="auspicious-table-wrapper">
                <table className="auspicious-table">
                  <thead>
                    <tr>
                      <th scope="col" className="col-date">วันที่ & จันทรคติ</th>
                      <th scope="col" className="col-ruk">ชื่อฤกษ์โหราศาสตร์</th>
                      <th scope="col" className="col-highlight">จุดเด่น & ความหมาย</th>
                      <th scope="col" className="col-time">ยามมงคลที่ดีที่สุด</th>
                      <th scope="col" className="col-cats">งานที่เหมาะสม</th>
                      {selectedBirthDay !== 'none' && (
                        <th scope="col" className="col-thaksa">ความเข้ากันได้กับวันเกิด</th>
                      )}
                      <th scope="col" className="col-actions">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDays.map((day) => {
                      const thaksa =
                        selectedBirthDay !== 'none'
                          ? thaksaByDate.get(day.date)
                          : null;

                      const isBadDay =
                        day.kalaYoga === 'ubatha' ||
                        day.kalaYoga === 'lokawinas' ||
                        thaksa?.isKalakini;

                      return (
                        <tr
                          key={day.date}
                          className={`table-row ${day.isMasterAuspicious ? 'row-master' : ''} ${
                            isBadDay ? 'row-warning' : ''
                          } ${inspectedDay?.date === day.date ? 'row-selected' : ''}`}
                          onClick={() => setInspectedDay(day)}
                          style={{ cursor: 'pointer' }}
                          title={`คลิกเพื่อดูรายละเอียดฤกษ์วันที่ ${day.dayOfMonth} ${THAI_MONTHS[selectedMonth - 1]}`}
                        >
                          {/* Date Column */}
                          <td className="col-date">
                            <div className="date-cell">
                              <span className="date-number">{day.dayOfMonth}</span>
                              <div className="date-meta">
                                <span className="date-dayname">{day.dayNameTh}</span>
                                <span className="date-lunar">{day.lunarDateTh}</span>
                                {day.kalaYoga === 'thongchai' && (
                                  <span className="badge-tag thongchai">⭐ วันธงชัย</span>
                                )}
                                {day.kalaYoga === 'athipadi' && (
                                  <span className="badge-tag athipadi">วันอธิบดี</span>
                                )}
                                {day.kalaYoga === 'ubatha' && (
                                  <span className="badge-tag ubatha">⚠️ วันอุบาทว์</span>
                                )}
                                {day.kalaYoga === 'lokawinas' && (
                                  <span className="badge-tag lokawinas">⛔ วันโลกาวินาศ</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Thai Ruk Column */}
                          <td className="col-ruk">
                            <div className="ruk-cell">
                              <span className="ruk-name">{day.thaiRukNameTh}</span>
                              <span className="ruk-alias">
                                ({THAI_RUK_DESCRIPTIONS[day.thaiRuk].alias})
                              </span>
                              <span className="dithi-badge">{day.dithiName}</span>
                            </div>
                          </td>

                          {/* Highlight Column */}
                          <td className="col-highlight">
                            <p className="highlight-text">{day.thaiRukHighlight}</p>
                            <span className="direction-info">🧭 ทิศมงคล: {day.auspiciousDirection}</span>
                          </td>

                          {/* Time / Yama Column */}
                          <td className="col-time">
                            <div className="time-cell">
                              <span className="time-primary">{day.bestHours.primaryTime}</span>
                              {day.bestHours.secondaryTime && (
                                <span className="time-secondary">
                                  และ {day.bestHours.secondaryTime}
                                </span>
                              )}
                              <span className="ubakong-text">
                                ⌛ {day.bestHours.ubakongYama}
                              </span>
                            </div>
                          </td>

                          {/* Suitable Categories */}
                          <td className="col-cats">
                            <div className="cats-cell">
                              {day.suitableCategories.length > 0 ? (
                                day.suitableCategories.map((c) => (
                                  <span key={c} className="cat-chip">
                                    {WORK_CATEGORIES_INFO[c].icon}{' '}
                                    {WORK_CATEGORIES_INFO[c].titleTh.split('/')[0]}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-italics">ควรงดเว้นพิธีมงคล</span>
                              )}
                            </div>
                          </td>

                          {/* Birthday Thaksa Column */}
                          {selectedBirthDay !== 'none' && thaksa && (
                            <td className="col-thaksa">
                              <div className="thaksa-cell">
                                <span className={`thaksa-badge style-${thaksa.badgeStyle}`}>
                                  {thaksa.badgeText}
                                </span>
                                <span className="thaksa-advice-text">{thaksa.advice}</span>
                              </div>
                            </td>
                          )}

                          {/* Actions Column */}
                          <td className="col-actions">
                            <div className="table-actions-inline">
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectedDay(day);
                                }}
                                title="ดูรายละเอียดแบบเต็ม"
                              >
                                🔍 รายละเอียด
                              </button>
                              <button
                                type="button"
                                className="btn-table-action-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyDayDetails(day);
                                }}
                                title="คัดลอกรายละเอียดฤกษ์"
                              >
                                📋
                              </button>
                              <button
                                type="button"
                                className="btn-table-action-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveToJournal(day);
                                }}
                                title="บันทึกลงสมุดบันทึกดวง"
                              >
                                📖
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW 2: CATEGORY VIEW (รายการแยกตาม 5 หมวดหมู่งาน) */}
            {viewMode === 'category' && (
              <div className="auspicious-category-view">
                {(Object.keys(WORK_CATEGORIES_INFO) as AuspiciousWorkCategory[])
                  .filter((catKey) => selectedCategory === 'all' || selectedCategory === catKey)
                  .map((catKey) => {
                    const catInfo = WORK_CATEGORIES_INFO[catKey];
                    const catDays = filteredDays.filter((d) =>
                      d.suitableCategories.includes(catKey)
                    );

                    return (
                      <div key={catKey} className="category-section-block">
                        <div className="category-section-header">
                          <div className="cat-header-title-row">
                            <span className="cat-header-icon">{catInfo.icon}</span>
                            <div>
                              <h3 className="cat-header-title">{catInfo.titleTh}</h3>
                              <p className="cat-header-desc">{catInfo.shortDesc}</p>
                            </div>
                          </div>
                          <div className="cat-header-taboos">
                            <strong>🚫 ข้อพึงระวัง:</strong> {catInfo.taboosTh}
                          </div>
                        </div>

                        {catDays.length === 0 ? (
                          <div className="category-empty-callout">
                            ไม่พบวันมงคลสำหรับหมวดนี้ที่ตรงกับเงื่อนไขหรือวันเกิดที่เลือก
                          </div>
                        ) : (
                          <div className="category-cards-grid">
                            {catDays.map((day) => {
                              const thaksa =
                                selectedBirthDay !== 'none'
                                  ? thaksaByDate.get(day.date)
                                  : null;

                              return (
                                <div
                                  key={day.date}
                                  className={`category-item-card ${
                                    day.isMasterAuspicious ? 'card-master' : ''
                                  } ${inspectedDay?.date === day.date ? 'card-selected' : ''}`}
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
                                  <div className="card-top-bar">
                                    <div className="card-date-badge">
                                      <span className="card-date-day">
                                        {day.dayNameTh}ที่ {day.dayOfMonth}
                                      </span>
                                      <span className="card-date-month">
                                        {THAI_MONTHS[selectedMonth - 1]}
                                      </span>
                                    </div>

                                    <div className="card-top-tags">
                                      {day.kalaYoga === 'thongchai' && (
                                        <span className="badge-tag thongchai">⭐ วันธงชัย</span>
                                      )}
                                      {day.kalaYoga === 'athipadi' && (
                                        <span className="badge-tag athipadi">วันอธิบดี</span>
                                      )}
                                      {thaksa && (
                                        <span
                                          className={`thaksa-badge style-${thaksa.badgeStyle}`}
                                        >
                                          {thaksa.badgeText}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="card-ruk-heading">
                                    <h4 className="card-ruk-name">
                                      {day.thaiRukNameTh} · {day.dithiName.split(' ')[0]}
                                    </h4>
                                    <p className="card-ruk-highlight">{day.thaiRukHighlight}</p>
                                  </div>

                                  <div className="card-details-box">
                                    <div className="detail-row">
                                      <span className="detail-label">⏰ ยามมงคล:</span>
                                      <span className="detail-value text-gold">
                                        {day.bestHours.primaryTime}
                                      </span>
                                    </div>
                                    <div className="detail-row">
                                      <span className="detail-label">⌛ ยามอุบากอง:</span>
                                      <span className="detail-value">{day.bestHours.ubakongYama}</span>
                                    </div>
                                    <div className="detail-row">
                                      <span className="detail-label">🧭 ทิศมงคล:</span>
                                      <span className="detail-value">{day.auspiciousDirection}</span>
                                    </div>
                                    <div className="detail-row">
                                      <span className="detail-label">🎨 สีมงคล:</span>
                                      <span className="detail-value">{day.luckyColors.join(', ')}</span>
                                    </div>
                                    {day.ceremonyTips[catKey] && (
                                      <div className="detail-tip-box">
                                        <strong>เคล็ดพิธี:</strong> {day.ceremonyTips[catKey]}
                                      </div>
                                    )}
                                  </div>

                                  <div className="card-actions-row">
                                    <button
                                      type="button"
                                      className="btn-card-action"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setInspectedDay(day);
                                      }}
                                    >
                                      รายละเอียด
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-card-action gold"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenLuckyCard(day);
                                      }}
                                    >
                                      🎴 การ์ดมงคล
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* VIEW 3: CALENDAR GRID (แสดงทุกวันของเดือนจาก Engine แม้มีตัวกรอง) */}
            {viewMode === 'calendar' && (
              <div className="auspicious-calendar-grid-view">
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
            )}
          </>
        )}
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
