import React, { useState, useEffect, useRef } from 'react';
import {
  getLatestLotteryResult,
  getLotteryResultByDate,
  checkTicketWin,
  formatLotteryDateByLang,
  getLocalizedPrizeName,
  getLocalizedDrawPostponedNote,
  type LotteryDisplayData,
  type CheckTicketResult,
} from '../utils/lotteryApi';
import {
  getActualDrawDateIso,
  getLocalizedShortMonths,
  getLocalizedLotteryDrawDayOptions,
  formatLocalizedShortDate,
} from '../data/postponedLotteryDraws';
import type { SupportedLang } from '../data/translations';
import { useLanguage } from '../context/LanguageContext';
import { logger } from '../utils/logger';

interface DrawPreset {
  day: string;
  month: string;
  yearBe: string;
  label: string;
}

function getRecentDrawPresets(lang: SupportedLang, now: Date = new Date()): DrawPreset[] {
  const presets: DrawPreset[] = [];
  const shortMonths = getLocalizedShortMonths(lang);
  let yearCe = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate() >= 16 ? 16 : 1;

  for (let i = 0; i < 4; i++) {
    const nominalIso = `${yearCe}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const actualIso = getActualDrawDateIso(nominalIso);
    const [actY, actM, actD] = actualIso.split('-').map((v) => parseInt(v, 10));
    const actYearBe = actY + 543;
    const label =
      lang === 'th'
        ? `${actD} ${shortMonths[actM - 1]} ${String(actYearBe).slice(-2)}`
        : lang === 'zh'
        ? `${actY}/${actM}/${actD}`
        : `${actD} ${shortMonths[actM - 1]} ${String(actY).slice(-2)}`;

    presets.push({
      day: String(actD).padStart(2, '0'),
      month: String(actM).padStart(2, '0'),
      yearBe: String(actYearBe),
      label,
    });
    if (day === 16) {
      day = 1;
    } else {
      day = 16;
      month -= 1;
      if (month < 1) {
        month = 12;
        yearCe -= 1;
      }
    }
  }
  return presets;
}

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
  const { lang, t, format } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [lotteryData, setLotteryData] = useState<LotteryDisplayData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ticket checker state
  const [checkInput, setCheckInput] = useState<string>('');
  const [checkResult, setCheckResult] = useState<CheckTicketResult | null>(null);

  // Date search mode
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string>(() => (new Date().getDate() >= 16 ? '16' : '01'));
  const [selectedMonth, setSelectedMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState<string>(() => String(new Date().getFullYear() + 543));
  const currentYearBE = new Date().getFullYear() + 543;
  const recentPresets = getRecentDrawPresets(lang);
  const shortMonths = getLocalizedShortMonths(lang);
  const dayOptions = getLocalizedLotteryDrawDayOptions(lang);
  const numLocale = lang === 'th' ? 'th-TH' : lang === 'zh' ? 'zh-CN' : 'en-US';
  const errFetchRef = useRef(t.lottoErrorFetch);
  errFetchRef.current = t.lottoErrorFetch;

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
        setErrorMsg(errFetchRef.current);
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
      onToast(t.lottoToastRefreshed);
    } catch {
      setErrorMsg(t.lottoErrorRefresh);
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
      const dateStr = formatLotteryDateByLang(data.rawDate, lang) || data.formattedThaiDate;
      onToast(format(t.lottoToastDateFound, { date: dateStr }));
    } catch (err: any) {
      setErrorMsg(lang === 'th' ? err?.message || t.lottoErrorNotFound : t.lottoErrorNotFound);
      onToast(t.lottoToastDateMissing);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotteryData) return;
    const clean = checkInput.replace(/\D/g, '');
    if (clean.length !== 6) {
      onToast(t.lottoToastNeed6Digits);
      return;
    }
    const result = checkTicketWin(clean, lotteryData);
    setCheckResult(result);
    if (result.isWon) {
      onToast(format(t.lottoToastWon, { amount: result.totalReward.toLocaleString(numLocale) }));
    } else {
      onToast(t.lottoToastNotWon);
    }
  };

  const bannerDateText = loading
    ? t.lottoLoadingShort
    : lotteryData
    ? formatLotteryDateByLang(lotteryData.rawDate, lang) || lotteryData.formattedThaiDate
    : t.lottoPendingInfo;
  const displayPostponedNote = lotteryData ? getLocalizedDrawPostponedNote(lotteryData, lang) : undefined;

  return (
    <div
      className="lottery-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.lottoTitle}
    >
      <div className="lottery-card-single-view" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar: Maroon Background (Classic Thai Broadcast Style) */}
        <div className="lottery-broadcast-header">
          <div className="lottery-header-title-box">
            <h2 className="lottery-broadcast-title">{t.lottoTitle}</h2>
          </div>
          <div className="lottery-header-ctrl-group">
            <button
              type="button"
              className="lottery-mini-ctrl-btn"
              onClick={() => setShowDatePicker((prev) => !prev)}
              title={t.lottoToggleDateTitle}
            >
              <span>📅 {showDatePicker ? t.lottoDateBtnClose : t.lottoDateBtnOpen}</span>
            </button>
            <button
              type="button"
              className="lottery-mini-ctrl-btn"
              onClick={handleRefreshLatest}
              disabled={loading}
              title={t.lottoRefreshTitle}
            >
              <span>🔄</span>
            </button>
            <button
              type="button"
              className="lottery-close-square-btn"
              onClick={onClose}
              title={t.commonClose}
              aria-label={t.cardClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Date Sub-Banner: Deep Green Background */}
        <div className="lottery-date-banner">
          <p className="lottery-date-text">
            {format(t.lottoDrawBannerPrefix, { date: bannerDateText })}
          </p>
          {!loading && displayPostponedNote && (
            <p className="lottery-postponed-note">📅 {displayPostponedNote}</p>
          )}
        </div>

        {/* Date Selector Popover (When activated) */}
        {showDatePicker && (
          <div className="lottery-compact-date-popover">
            <div className="compact-preset-row">
              {recentPresets.map((preset) => (
                <button
                  key={`${preset.yearBe}-${preset.month}-${preset.day}`}
                  type="button"
                  className="btn-quick-date"
                  onClick={() => handleSearchByDate(preset.day, preset.month, preset.yearBe)}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className="btn-quick-date"
                onClick={() => handleSearchByDate('01', '03', '2567')}
                title={t.lottoQuickOfflineRefTitle}
              >
                {lang === 'th' ? '1 มี.ค. 67' : formatLocalizedShortDate('2024-03-01', lang)}
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
                aria-label={t.lottoDaySelectAria}
              >
                {dayOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="compact-date-select"
                aria-label={t.lottoMonthSelectAria}
              >
                {shortMonths.map((mLabel, idx) => {
                  const val = String(idx + 1).padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {mLabel} ({val})
                    </option>
                  );
                })}
              </select>
              <div className="compact-year-field">
                <span className="compact-year-prefix">{t.lottoYearPrefix}</span>
                <input
                  type="number"
                  min="2540"
                  max={String(Math.max(2590, currentYearBE + 5))}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="compact-year-input"
                  placeholder={String(currentYearBE)}
                  aria-label={t.lottoYearAria}
                />
              </div>
              <button type="submit" className="btn-compact-submit" disabled={loading}>
                {t.lottoSearchBtn}
              </button>
            </form>
          </div>
        )}

        {/* Main Results Board: Deep Emerald Green (Optimized Single Screen Layout) */}
        <div className="lottery-board-wrapper">
          {loading ? (
            <div className="lottery-board-loading">
              <span className="spinner-icon">🌀</span>
              <p>{t.lottoConnecting}</p>
            </div>
          ) : errorMsg ? (
            <div className="lottery-board-error">
              <span>⚠️ {errorMsg}</span>
            </div>
          ) : lotteryData ? (
            <div className="lottery-board-grid">
              {/* Left Column */}
              <div className="board-col-left">
                {/* 1st Prize Card */}
                <div className="board-card card-first-prize">
                  <span className="board-card-title">{t.lottoFirstPrize}</span>
                  <div className="board-digits-first" aria-label={`${t.lottoFirstPrize}: ${lotteryData.first}`}>
                    {lotteryData.first}
                  </div>
                </div>

                {/* Sub-Prizes Row: Front 3 & Back 3 side by side */}
                <div className="board-sub-row">
                  <div className="board-card card-sub-prize">
                    <span className="board-card-title">{t.lottoLast3Front}</span>
                    <div className="board-digits-3digit">
                      {lotteryData.last3f.join('  ')}
                    </div>
                  </div>

                  <div className="board-card card-sub-prize">
                    <span className="board-card-title">{t.lottoLast3Back}</span>
                    <div className="board-digits-3digit">
                      {lotteryData.last3b.join('  ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Last 2 Digits */}
              <div className="board-col-right">
                <div className="board-card card-last2-prize">
                  <span className="board-card-title">{t.lottoLast2}</span>
                  <div className="board-digits-last2" aria-label={`${t.lottoLast2}: ${lotteryData.last2}`}>
                    {lotteryData.last2}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Compact Single-Row Ticket Checker */}
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
                placeholder={t.lottoInputPlaceholder}
                className="compact-checker-input"
              />
              <button
                type="submit"
                className="compact-checker-btn"
                disabled={checkInput.length !== 6}
              >
                {t.lottoCheckBtn}
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
                        {format(t.lottoWonTitle, {
                          amount: checkResult.totalReward.toLocaleString(numLocale),
                        })}
                      </span>
                      <span className="banner-sub">
                        {format(t.lottoWonPrizesList, {
                          list: checkResult.wonPrizes
                            .map((p) => `${getLocalizedPrizeName(p.prizeName, lang)} [${p.matchedNumber}]`)
                            .join(', '),
                        })}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="banner-icon">🪷</span>
                    <div className="banner-text">
                      <span className="banner-title">
                        {format(t.lottoNotWonTitle, { ticket: checkResult.ticketNumber })}
                      </span>
                      <span className="banner-sub">{t.lottoNotWonSub}</span>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="banner-dismiss-btn"
                onClick={() => setCheckResult(null)}
                title={t.lottoCloseCheckAria}
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
