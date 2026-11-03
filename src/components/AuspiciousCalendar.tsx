import React, { useState, useMemo } from 'react';
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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
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

  // Filter days based on user preferences
  const filteredDays = useMemo(() => {
    return allMonthDays.filter((day) => {
      // 1. Birth day Kalakini check
      if (selectedBirthDay !== 'none' && avoidKalakini) {
        const thaksa = getThaksaRelation(selectedBirthDay, day.dayOfWeek);
        if (thaksa.isKalakini) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        if (!day.suitableCategories.includes(selectedCategory)) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = day.thaiRukNameTh.toLowerCase().includes(q);
        const matchHighlight = day.thaiRukHighlight.toLowerCase().includes(q);
        const matchDithi = day.dithiName.toLowerCase().includes(q);
        const matchDate = day.dayOfMonth.toString() === q || day.date.includes(q);
        if (!matchName && !matchHighlight && !matchDithi && !matchDate) return false;
      }

      return true;
    });
  }, [allMonthDays, selectedBirthDay, avoidKalakini, selectedCategory, searchQuery]);

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
      title: `ฤกษ์มงคล ${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[selectedMonth - 1]} ${selectedYearBE}`,
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
    const thaksaNote =
      selectedBirthDay !== 'none'
        ? `\n👤 สำหรับคนเกิด${BIRTH_DAYS.find((b) => b.id === selectedBirthDay)?.labelTh}: ${getThaksaRelation(selectedBirthDay, day.dayOfWeek).nameTh} (${getThaksaRelation(selectedBirthDay, day.dayOfWeek).advice})`
        : '';

    const text = `✨ ฤกษ์งามยามดีมหามงคล ✨
📅 วันที่: ${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[selectedMonth - 1]} พ.ศ. ${selectedYearBE}
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
      subtitle: `${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[selectedMonth - 1]} พ.ศ. ${selectedYearBE}`,
      dateStr: day.date,
      details: {
        auspiciousInfo: {
          dateFormatted: `${day.dayNameTh}ที่ ${day.dayOfMonth} ${THAI_MONTHS[selectedMonth - 1]} ${selectedYearBE}`,
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
              <select
                id="month-select"
                className="input-select month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {THAI_MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                className="input-select year-select"
                value={selectedYearBE}
                onChange={(e) => setSelectedYearBE(Number(e.target.value))}
              >
                {[2567, 2568, 2569, 2570, 2571, 2572].map((y) => (
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
                    setSelectedMonth(11);
                    setSelectedYearBE(2569);
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
              <span>👤 วันเกิดของเจ้าชะตา (สำหรับเทียบทักษา)</span>
            </label>
            <div className="control-inputs-inline">
              <select
                id="birthday-select"
                className="input-select birthday-select"
                value={selectedBirthDay}
                onChange={(e) => setSelectedBirthDay(e.target.value as BirthDayId | 'none')}
              >
                <option value="none">-- ทุกวันเกิด (ดูภาพรวม) --</option>
                {BIRTH_DAYS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.icon} {b.labelTh} (กาลกิณี: {b.kalakiniDayNameTh})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Secondary Filter & Avoid Kalakini Toggle */}
        <div className="control-subrow-grid">
          {selectedBirthDay !== 'none' && (
            <label className="checkbox-toggle-wrap">
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
          )}

          {/* Search box */}
          <div className="search-filter-wrap">
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="ค้นหา เช่น มหัทธโนฤกษ์, วันที่ 4, ออกรถ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (5 หมวดหมู่งาน) */}
        <div className="category-pills-bar" role="tablist" aria-label="เลือกประเภทงานมงคล">
          <button
            type="button"
            className={`pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
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
                onClick={() => setSelectedCategory(catKey)}
              >
                <span className="pill-icon">{cat.icon}</span>
                <span className="pill-title">{cat.titleTh}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* View Mode Tabs: Table vs Category vs Calendar */}
      <div className="view-mode-tabs-bar">
        <div className="view-mode-group" role="tablist">
          <button
            type="button"
            className={`btn-view-mode ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <span>📊 ตารางเปรียบเทียบ (Table View)</span>
          </button>
          <button
            type="button"
            className={`btn-view-mode ${viewMode === 'category' ? 'active' : ''}`}
            onClick={() => setViewMode('category')}
          >
            <span>📑 รายการแยกตามประเภทงาน (Category View)</span>
          </button>
          <button
            type="button"
            className={`btn-view-mode ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <span>🗓️ ตารางปฏิทินรายเดือน (Calendar Grid)</span>
          </button>
        </div>

        <div className="view-results-count">
          พบวันมงคลที่ตรงเงื่อนไข <strong>{filteredDays.length}</strong> วัน (จากทั้งหมด{' '}
          {allMonthDays.length} วัน)
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      <div className="auspicious-views-viewport">
        {filteredDays.length === 0 ? (
          <div className="auspicious-empty-state">
            <span className="empty-emblem">⛩️</span>
            <h3>ไม่พบวันมงคลที่ตรงกับเงื่อนไขที่เลือก</h3>
            <p>
              ลองปลดตัวกรอง &quot;หลีกเลี่ยงวันกาลกิณี&quot; หรือเลือกหมวดหมู่งานเป็น &quot;ทุกประเภทงาน&quot;
            </p>
            <button
              type="button"
              className="btn gold"
              onClick={() => {
                setSelectedCategory('all');
                setAvoidKalakini(false);
                setSearchQuery('');
              }}
            >
              แสดงวันมงคลทั้งหมด
            </button>
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
                          ? getThaksaRelation(selectedBirthDay, day.dayOfWeek)
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
                          }`}
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
                                onClick={() => setInspectedDay(day)}
                                title="ดูรายละเอียดแบบเต็ม"
                              >
                                🔍 รายละเอียด
                              </button>
                              <button
                                type="button"
                                className="btn-table-action-icon"
                                onClick={() => handleCopyDayDetails(day)}
                                title="คัดลอกรายละเอียดฤกษ์"
                              >
                                📋
                              </button>
                              <button
                                type="button"
                                className="btn-table-action-icon"
                                onClick={() => handleSaveToJournal(day)}
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
                                  ? getThaksaRelation(selectedBirthDay, day.dayOfWeek)
                                  : null;

                              return (
                                <div
                                  key={day.date}
                                  className={`category-item-card ${
                                    day.isMasterAuspicious ? 'card-master' : ''
                                  }`}
                                  onClick={() => setInspectedDay(day)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') setInspectedDay(day);
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

            {/* VIEW 3: CALENDAR GRID (ตารางปฏิทินแบบกราฟิก 30 วัน) */}
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
                        ? getThaksaRelation(selectedBirthDay, day.dayOfWeek)
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
                        }`}
                        onClick={() => setInspectedDay(day)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setInspectedDay(day);
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
                {THAI_MONTHS[selectedMonth - 1]} พ.ศ. {selectedYearBE}
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
                    getThaksaRelation(selectedBirthDay, inspectedDay.dayOfWeek).badgeStyle
                  }`}
                >
                  {getThaksaRelation(selectedBirthDay, inspectedDay.dayOfWeek).badgeText}
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
