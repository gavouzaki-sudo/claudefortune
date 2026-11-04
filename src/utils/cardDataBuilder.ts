/**
 * Card Data Builder Utility
 * Centralizes creation of CardData structures across all ritual features.
 */

import type { CardData } from './luckyCardCanvas';
import type { StickResult, TarotResult, LuckyNumbersResult, ZodiacInfo } from '../types';

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

export function buildTarotCardData(result: TarotResult): CardData {
  const c = result.cards[0];
  return {
    type: 'tarot',
    title: `ไพ่ยิปซี: ${c.name} (${c.en})`,
    details: {
      tarotCards: [
        {
          name: c.name,
          nameEn: c.en,
          reversed: c.reversed,
        },
      ],
    },
  };
}

export function buildLuckyNumbersCardData(
  result: LuckyNumbersResult,
  _zodiacInfo?: ZodiacInfo
): CardData {
  return {
    type: 'number',
    title: `เลขมงคลประจำดวงชะตา`,
    details: {
      luckyNumbers: {
        twoDigits: result.two || [],
        threeDigits: result.three || [],
      },
    },
  };
}

export function buildAuspiciousCardData(
  eventTitle: string,
  eventDate: string,
  goodFor: string,
  tip: string
): CardData {
  return {
    type: 'auspicious',
    title: `ฤกษ์มงคล: ${eventTitle}`,
    details: {
      auspiciousInfo: {
        dateFormatted: eventDate,
        category: goodFor,
        ceremonyTip: tip,
      },
    },
  };
}
