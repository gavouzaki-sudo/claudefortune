/**
 * Card Data Builder Utility
 * Centralizes creation of CardData structures across all ritual features.
 */

import type { CardData } from './luckyCardCanvas';
import type { StickResult, TarotCard } from '../types';
import type { AuspiciousDay } from '../data/auspiciousCalendarData';
import {
  getLocalizedDayDetails,
  getLocalizedWorkCategories,
} from '../data/auspiciousCalendarData';
import { getLocalizedTarotTitle } from '../data/ritualProphecies';
import type { SupportedLang } from '../data/locales/types';

export const TAROT_GLYPHS: string[] = [
  '🃏', '🪄', '🌙', '👑', '🏛️', '📿', '💞', '🛞', '🦁', '🏮', '☸️', '⚖️',
  '🙃', '🦋', '⚗️', '⛓️', '🗼', '⭐', '🌕', '☀️', '📯', '🌏',
];

export function buildStickCardData(
  result: StickResult,
  lang: SupportedLang = 'th'
): CardData {
  const title =
    lang === 'en'
      ? `Fortune Stick #${result.stick} · ${result.title}`
      : lang === 'zh'
      ? `第 ${result.stick} 号灵签 · ${result.title}`
      : `เซียมซีใบที่ ${result.stick} · ${result.title}`;

  return {
    type: 'stick',
    title,
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
  glyphs: Record<number, string> = TAROT_GLYPHS,
  spreadPositions: Record<number, string[]> = {},
  lang: SupportedLang = 'th'
): { cardData: CardData; details: NonNullable<CardData['details']> } {
  const defaultPosPrefix = lang === 'en' ? 'Card' : lang === 'zh' ? '第' : 'ใบที่';
  const defaultPosSuffix = lang === 'zh' ? '张' : '';
  const tarotDetails = {
    tarotCards: activeCards.map((c, i) => ({
      name: getLocalizedTarotTitle(c.id, c.name, c.en, lang),
      nameEn: c.en,
      glyph: glyphs[c.id] || '🔮',
      reversed: c.reversed,
      position: spreadPositions[spread]?.[i] || `${defaultPosPrefix} ${i + 1}${defaultPosSuffix}`,
    })),
  };

  const title =
    lang === 'en'
      ? `Tarot Spread (${spread} ${spread === 1 ? 'Card' : 'Cards'})`
      : lang === 'zh'
      ? `塔罗占卜（${spread} 张牌阵）`
      : `ไพ่ยิปซี (${spread} ใบ)`;

  const cardData: CardData = {
    type: 'tarot',
    title,
    details: tarotDetails,
  };

  return { cardData, details: tarotDetails };
}

export function buildLuckyNumbersCardData(
  luckyNumber: string,
  category: 0 | 1,
  lang: SupportedLang = 'th'
): { cardData: CardData; details: NonNullable<CardData['details']> } {
  const detailsObj = {
    luckyNumbers: {
      twoDigits: category === 0 ? [luckyNumber] : undefined,
      threeDigits: category === 1 ? [luckyNumber] : undefined,
    },
  };

  const title =
    lang === 'en'
      ? `Personal Lucky Number (${category === 0 ? '2 Digits' : '3 Digits'})`
      : lang === 'zh'
      ? `专属幸运灵数（${category === 0 ? '2 位数' : '3 位数'}）`
      : `เลขมงคลประจำตัว (${category === 0 ? 'เลข 2 หลัก' : 'เลข 3 หลัก'})`;

  const cardData: CardData = {
    type: 'number',
    title,
    details: detailsObj,
  };

  return { cardData, details: detailsObj };
}

export function buildAuspiciousCardData(
  day: AuspiciousDay,
  monthName: string,
  lang: SupportedLang = 'th'
): CardData {
  const detailsLoc = getLocalizedDayDetails(day, lang);
  const workCats = getLocalizedWorkCategories(lang);

  const title =
    lang === 'en'
      ? `Auspicious Day · ${detailsLoc.thaiRukName}`
      : lang === 'zh'
      ? `良辰吉日 · ${detailsLoc.thaiRukName}`
      : `ฤกษ์มงคล ${detailsLoc.thaiRukName}`;

  const subtitle =
    lang === 'en'
      ? `${detailsLoc.dayName}, ${monthName} ${day.dayOfMonth}, ${day.yearCE}`
      : lang === 'zh'
      ? `${day.yearCE}年 ${monthName}${day.dayOfMonth}日 ${detailsLoc.dayName}`
      : `${day.dayNameTh}ที่ ${day.dayOfMonth} ${monthName} พ.ศ. ${day.yearBE}`;

  const dateFormatted =
    lang === 'en'
      ? `${detailsLoc.dayName}, ${monthName} ${day.dayOfMonth}, ${day.yearCE}`
      : lang === 'zh'
      ? `${day.yearCE}年 ${monthName}${day.dayOfMonth}日 · ${detailsLoc.dayName}`
      : `${day.dayNameTh}ที่ ${day.dayOfMonth} ${monthName} ${day.yearBE}`;

  const defaultCategory =
    lang === 'en'
      ? 'General Auspicious Affairs'
      : lang === 'zh'
      ? '日常吉事'
      : 'งานมงคลทั่วไป';

  const defaultTip =
    lang === 'en'
      ? 'Light incense in mindfulness and dedicate merit for peace and success.'
      : lang === 'zh'
      ? '虔诚焚香祈愿，广积善缘，愿万事顺遂吉祥。'
      : 'จุดธูปบูชาพระพุทธและเทพยดาอำนวยพร';

  return {
    type: 'auspicious',
    title,
    subtitle,
    dateStr: day.date,
    details: {
      auspiciousInfo: {
        dateFormatted,
        lunarDate: detailsLoc.lunarDate,
        thaiRukName: detailsLoc.thaiRukName,
        thaiRukMeaning: detailsLoc.thaiRukHighlight,
        kalaYoga: detailsLoc.kalaYogaLabel,
        category:
          day.suitableCategories.map((c) => workCats[c]?.title || c).join(', ') ||
          defaultCategory,
        bestHours: detailsLoc.bestHours.primaryTime,
        direction: detailsLoc.auspiciousDirection,
        luckyColors: detailsLoc.luckyColors.join(' / '),
        ceremonyTip: Object.values(detailsLoc.ceremonyTips)[0] || defaultTip,
      },
    },
  };
}

export function buildSacredJourneyCardData(
  visitedTemples: Array<{ name: string; province: string }>,
  merit: number,
  wish: string,
  lang: SupportedLang = 'th'
): CardData {
  const templePreview = visitedTemples.map((t) => t.name).slice(0, 4).join(', ');
  if (lang === 'en') {
    return {
      type: 'remedy',
      title: '9 Sacred Temples · Pilgrimage Blessing',
      subtitle: `Completed 9 Sacred Temples · Merit Earned: ${merit} pts`,
      details: {
        remedyInfo: {
          clashType: `Heartfelt Wish: ${wish}`,
          yearName: 'Sacred 9-Temple Pilgrimage Across Thailand',
          advice: `Visited 9 Temples: ${templePreview} & more — may abundance, peace, and grace surround you.`,
        },
      },
    };
  }
  if (lang === 'zh') {
    return {
      type: 'remedy',
      title: '九寺朝圣 · 十方吉祥护佑',
      subtitle: `圆满朝拜 9 座名刹 · 累计福德 ${merit} 分`,
      details: {
        remedyInfo: {
          clashType: `虔诚祈愿：${wish}`,
          yearName: '泰国九寺祈福朝圣之旅',
          advice: `已参拜 9 座圣寺：${templePreview} 等，愿福慧增长、安康顺遂。`,
        },
      },
    };
  }
  return {
    type: 'remedy',
    title: 'มหามงคล 9 วัด · บารมีมงคลทั่วทิศ',
    subtitle: `สำเร็จการสักการะ 9 วัดมงคล · แต้มบุญสะสม ${merit} แต้ม`,
    details: {
      remedyInfo: {
        clashType: `คำอธิษฐานจิต: ${wish}`,
        yearName: 'เส้นทางแสวงบุญ 9 วัดทั่วไทย',
        advice: `สักการะครบ 9 วัด: ${templePreview} ฯลฯ มั่งมีศรีสุข ร่มเย็นเป็นสุข`,
      },
    },
  };
}

