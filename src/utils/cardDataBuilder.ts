/**
 * Card Data Builder Utility
 * Centralizes creation of CardData structures across all ritual features.
 */

import type { CardData } from './luckyCardCanvas';
import type { StickResult, TarotCard } from '../types';
import type { AuspiciousDay } from '../data/auspiciousCalendarData';
import { WORK_CATEGORIES_INFO } from '../data/auspiciousCalendarData';

export function buildStickCardData(result: StickResult): CardData {
  return {
    type: 'stick',
    title: `เซียมซีใบที่ ${result.stick} · ${result.title}`,
    details: {
      stickNumber: result.stick,
      fortuneTitle: result.title,
      aspects: {
        finance: result.aspects[0]?.text,
        love: result.aspects[1]?.text,
        health: result.aspects[2]?.text,
        career: result.aspects[3]?.text,
      },
      poem: result.verse,
    },
  };
}

export function buildTarotCardData(
  activeCards: TarotCard[],
  spread: number = activeCards.length,
  glyphs: Record<number, string> = {},
  spreadPositions: Record<number, string[]> = {}
): { cardData: CardData; details: NonNullable<CardData['details']> } {
  const tarotDetails = {
    tarotCards: activeCards.map((c, i) => ({
      name: c.name,
      nameEn: c.en,
      glyph: glyphs[c.id] || '🔮',
      reversed: c.reversed,
      position: spreadPositions[spread]?.[i] || `ใบที่ ${i + 1}`,
    })),
  };

  const cardData: CardData = {
    type: 'tarot',
    title: `ไพ่ยิปซี (${spread} ใบ)`,
    details: tarotDetails,
  };

  return { cardData, details: tarotDetails };
}

export function buildLuckyNumbersCardData(
  luckyNumber: string,
  category: 0 | 1
): { cardData: CardData; details: NonNullable<CardData['details']> } {
  const detailsObj = {
    luckyNumbers: {
      twoDigits: category === 0 ? [luckyNumber] : undefined,
      threeDigits: category === 1 ? [luckyNumber] : undefined,
    },
  };

  const cardData: CardData = {
    type: 'number',
    title: `เลขมงคลประจำตัว (${category === 0 ? 'เลข 2 หลัก' : 'เลข 3 หลัก'})`,
    details: detailsObj,
  };

  return { cardData, details: detailsObj };
}

export function buildAuspiciousCardData(
  day: AuspiciousDay,
  monthName: string
): CardData {
  return {
    type: 'auspicious',
    title: `ฤกษ์มงคล ${day.thaiRukNameTh}`,
    subtitle: `${day.dayNameTh}ที่ ${day.dayOfMonth} ${monthName} พ.ศ. ${day.yearBE}`,
    dateStr: day.date,
    details: {
      auspiciousInfo: {
        dateFormatted: `${day.dayNameTh}ที่ ${day.dayOfMonth} ${monthName} ${day.yearBE}`,
        lunarDate: day.lunarDateTh,
        thaiRukName: day.thaiRukNameTh,
        thaiRukMeaning: day.thaiRukHighlight,
        kalaYoga: day.kalaYogaLabel,
        category:
          day.suitableCategories.map((c) => WORK_CATEGORIES_INFO[c]?.titleTh || c).join(', ') ||
          'งานมงคลทั่วไป',
        bestHours: day.bestHours.primaryTime,
        direction: day.auspiciousDirection,
        luckyColors: day.luckyColors.join(' / '),
        ceremonyTip: Object.values(day.ceremonyTips)[0] || 'จุดธูปบูชาพระพุทธและเทพยดาอำนวยพร',
      },
    },
  };
}

export function buildSacredJourneyCardData(
  visitedTemples: Array<{ name: string; province: string }>,
  merit: number,
  wish: string
): CardData {
  return {
    type: 'remedy',
    title: 'มหามงคล 9 วัด · บารมีมงคลทั่วทิศ',
    subtitle: `สำเร็จการสักการะ 9 วัดมงคล · แต้มบุญสะสม ${merit} แต้ม`,
    details: {
      remedyInfo: {
        clashType: `คำอธิษฐานจิต: ${wish}`,
        yearName: 'เส้นทางแสวงบุญ 9 วัดทั่วไทย',
        advice: `สักการะครบ 9 วัด: ${visitedTemples.map((t) => t.name).slice(0, 4).join(', ')} ฯลฯ มั่งมีศรีสุข ร่มเย็นเป็นสุข`,
      },
    },
  };
}
