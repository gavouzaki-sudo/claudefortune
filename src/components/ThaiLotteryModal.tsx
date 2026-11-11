import React, { useState, useEffect } from 'react';
import {
  getLatestLotteryResult,
  getLotteryResultByDate,
  checkTicketWin,
  type LotteryDisplayData,
  type CheckTicketResult,
} from '../utils/lotteryApi';
import { logger } from '../utils/logger';

interface ThaiLotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ThaiLotteryModal: React.FC<ThaiLotteryModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lotteryData, setLotteryData] = useState<LotteryDisplayData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ticket checker state
  const [checkInput, setCheckInput] = useState<string>('');
  const [checkResult, setCheckResult] = useState<CheckTicketResult | null>(null);

  // Date search mode
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string>('01');
  const [selectedMonth, setSelectedMonth] = useState<string>('11');
  const [selectedYear, setSelectedYear] = useState<string>('2569');

  // Load latest lottery draw on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);
    setCheckResult(null);

    getLatestLotteryResult()
      .then((data) => {
        if (!isMounted) return;
        setLotteryData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        logger.error('Error fetching latest lottery:', err);
        setErrorMsg('ไม่สามารถดึงข้อมูลจากสำนักงานสลากฯ ได้ชั่วคราว');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRefreshLatest = async () => {
    setLoading(true);
    setErrorMsg(null);
    setCheckResult(null);
    try {
      const data = await getLatestLotteryResult();
      setLotteryData(data);
      onToast('ดึงผลสลากกินแบ่งรัฐบาลงวดล่าสุดเรียบร้อย ✨');
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByDate = async (day: string, month: string, yearBeOrCe: string) => {
    setLoading(true);
    setErrorMsg(null);
    setCheckResult(null);
    try {
      const data = await getLotteryResultByDate(day, month, yearBeOrCe);
      setLotteryData(data);
      setShowDatePicker(false);
      onToast(`แสดงผลสลากงวดวันที่ ${data.formattedThaiDate} ✨`);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่พบข้อมูลงวดที่เลือก');
      onToast('ไม่พบข้อมูลสลากงวดที่ระบุ');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotteryData) return;
    const clean = checkInput.replace(/\D/g, '');
    if (clean.length !== 6) {
      onToast('กรุณากรอกเลขสลากให้ครบ 6 หลัก');
      return;
    }
    const result = checkTicketWin(clean, lotteryData);
    setCheckResult(result);
    if (result.isWon) {
      onToast(`🎉 ขอแสดงความยินดี! ถูกรางวัลรวม ${result.totalReward.toLocaleString('th-TH')} บาท`);
    } else {
      onToast('งวดนี้ยังไม่ถูกรางวัล ขอให้โชคดีในงวดหน้าครับ ✨');
    }
  };

  return (
    <div
      className="lottery-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="ผลสลากกินแบ่งรัฐบาล"
    >
      <div className="lottery-card-single-view" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar: Maroon Background (Classic Thai Broadcast Style) */}
        <div className="lottery-broadcast-header">
          <div className="lottery-header-title-box">
            <h2 className="lottery-broadcast-title">ผลสลากกินแบ่งรัฐบาล</h2>
          </div>
          <div className="lottery-header-ctrl-group">
            <button
              type="button"
              className="lottery-mini-ctrl-btn"
              onClick={() => setShowDatePicker((prev) => !prev)}
              title="เลือกงวดวันที่"
            >
              <span>📅 {showDatePicker ? 'ปิด' : 'งวด'}</span>
            </button>
            <button
              type="button"
              className="lottery-mini-ctrl-btn"
              onClick={handleRefreshLatest}
              disabled={loading}
              title="ดึงงวดล่าสุด"
            >
              <span>🔄</span>
            </button>
            <button
              type="button"
              className="lottery-close-square-btn"
              onClick={onClose}
              title="ปิดหน้าต่าง"
              aria-label="ปิด"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Date Sub-Banner: Deep Green Background */}
        <div className="lottery-date-banner">
          <p className="lottery-date-text">
            งวดประจำวันที่ {loading ? 'กำลังโหลด...' : lotteryData?.formattedThaiDate || '1 พฤศจิกายน 2569'}
          </p>
        </div>

        {/* Date Selector Popover (When activated) */}
        {showDatePicker && (
          <div className="lottery-compact-date-popover">
            <div className="compact-preset-row">
              <button
                type="button"
                className="btn-quick-date"
                onClick={() => handleSearchByDate('01', '11', '2569')}
              >
                1 พ.ย. 69
              </button>
              <button
                type="button"
                className="btn-quick-date"
                onClick={() => handleSearchByDate('01', '02', '2569')}
              >
                1 ก.พ. 69
              </button>
              <button
                type="button"
                className="btn-quick-date"
                onClick={() => handleSearchByDate('16', '10', '2569')}
              >
                16 ต.ค. 69
              </button>
              <button
                type="button"
                className="btn-quick-date"
                onClick={() => handleSearchByDate('01', '10', '2569')}
              >
                1 ต.ค. 69
              </button>
              <button
                type="button"
                className="btn-quick-date"
                onClick={() => handleSearchByDate('01', '03', '2567')}
              >
                1 มี.ค. 67
              </button>
            </div>
            <form
              className="compact-custom-date-row"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchByDate(selectedDay, selectedMonth, selectedYear);
              }}
            >
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="compact-date-select"
                aria-label="เลือกวันที่"
              >
                <option value="01">01</option>
                <option value="16">16</option>
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="compact-date-select"
                aria-label="เลือกเดือน"
              >
                <option value="01">ม.ค. (01)</option>
                <option value="02">ก.พ. (02)</option>
                <option value="03">มี.ค. (03)</option>
                <option value="04">เม.ย. (04)</option>
                <option value="05">พ.ค. (05)</option>
                <option value="06">มิ.ย. (06)</option>
                <option value="07">ก.ค. (07)</option>
                <option value="08">ส.ค. (08)</option>
                <option value="09">ก.ย. (09)</option>
                <option value="10">ต.ค. (10)</option>
                <option value="11">พ.ย. (11)</option>
                <option value="12">ธ.ค. (12)</option>
              </select>
              <div className="compact-year-field">
                <span className="compact-year-prefix">พ.ศ.</span>
                <input
                  type="number"
                  min="2540"
                  max="2590"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="compact-year-input"
                  placeholder="2569"
                  aria-label="ปี พ.ศ."
                />
              </div>
              <button type="submit" className="btn-compact-submit" disabled={loading}>
                ค้นหา
              </button>
            </form>
          </div>
        )}

        {/* Main Results Board: Deep Emerald Green (Optimized Single Screen Layout) */}
        <div className="lottery-board-wrapper">
          {loading ? (
            <div className="lottery-board-loading">
              <span className="spinner-icon">🌀</span>
              <p>กำลังเชื่อมต่อข้อมูลสลากฯ...</p>
            </div>
          ) : errorMsg ? (
            <div className="lottery-board-error">
              <span>⚠️ {errorMsg}</span>
            </div>
          ) : lotteryData ? (
            <div className="lottery-board-grid">
              {/* Left Column (รางวัลที่ 1 on top, เลขหน้า 3 ตัว & เลขท้าย 3 ตัว below) */}
              <div className="board-col-left">
                {/* รางวัลที่ 1 Card */}
                <div className="board-card card-first-prize">
                  <span className="board-card-title">รางวัลที่ 1</span>
                  <div className="board-digits-first" aria-label={`รางวัลที่ 1 คือ ${lotteryData.first}`}>
                    {lotteryData.first}
                  </div>
                </div>

                {/* Sub-Prizes Row: เลขหน้า 3 ตัว & เลขท้าย 3 ตัว side by side */}
                <div className="board-sub-row">
                  {/* เลขหน้า 3 ตัว */}
                  <div className="board-card card-sub-prize">
                    <span className="board-card-title">เลขหน้า 3 ตัว</span>
                    <div className="board-digits-3digit">
                      {lotteryData.last3f.join('  ')}
                    </div>
                  </div>

                  {/* เลขท้าย 3 ตัว */}
                  <div className="board-card card-sub-prize">
                    <span className="board-card-title">เลขท้าย 3 ตัว</span>
                    <div className="board-digits-3digit">
                      {lotteryData.last3b.join('  ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: เลขท้าย 2 ตัว (Tall Card with Giant Digits matching reference image) */}
              <div className="board-col-right">
                <div className="board-card card-last2-prize">
                  <span className="board-card-title">เลขท้าย 2 ตัว</span>
                  <div className="board-digits-last2" aria-label={`เลขท้าย 2 ตัว คือ ${lotteryData.last2}`}>
                    {lotteryData.last2}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Compact Single-Row Ticket Checker (Optimized for One-Screen Mobile View) */}
        <div className="lottery-compact-checker-section">
          <form className="compact-checker-form" onSubmit={handleCheckTicket}>
            <div className="compact-checker-input-group">
              <span className="checker-input-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value.replace(/\D/g, ''))}
                placeholder="กรอกเลขสลาก 6 หลัก..."
                className="compact-checker-input"
              />
              <button
                type="submit"
                className="compact-checker-btn"
                disabled={checkInput.length !== 6}
              >
                ตรวจสลาก
              </button>
            </div>
          </form>

          {/* Quick Result Feedback Banner */}
          {checkResult && (
            <div
              className={`compact-result-banner ${
                checkResult.isWon ? 'banner-won' : 'banner-not-won'
              }`}
            >
              <div className="banner-content">
                {checkResult.isWon ? (
                  <>
                    <span className="banner-icon">🎉</span>
                    <div className="banner-text">
                      <span className="banner-title">
                        ยินดีด้วย! ถูกรางวัลรวม <b>{checkResult.totalReward.toLocaleString('th-TH')}</b> บาท
                      </span>
                      <span className="banner-sub">
                        ({checkResult.wonPrizes.map((p) => `${p.prizeName} [${p.matchedNumber}]`).join(', ')})
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="banner-icon">🪷</span>
                    <div className="banner-text">
                      <span className="banner-title">
                        เลข {checkResult.ticketNumber} ไม่ถูกรางวัลในงวดนี้
                      </span>
                      <span className="banner-sub">
                        ขอเป็นกำลังใจให้ท่าน มีโชคใหญ่ในงวดหน้านะครับ
                      </span>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="banner-dismiss-btn"
                onClick={() => setCheckResult(null)}
                title="ปิดผลตรวจ"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
