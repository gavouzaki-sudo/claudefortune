export interface ZodiacInfo {
  id: number;
  name: string;
  animal: string;
  color: string;
  element: string;
  current_year_name: string;
}

export interface UserSession {
  name: string;
  year: number;
  zodiac: number;
  info: ZodiacInfo;
}

export interface Aspect {
  name: string;
  text: string;
}

export interface StickResult {
  stick: number;
  title: string;
  level: number;
  level_name: string;
  verse: string;
  aspects: Aspect[];
}

export interface TarotCard {
  id: number;
  name: string;
  en: string;
  meaning: string;
  reversed: boolean;
}

export interface TarotResult {
  cards: TarotCard[];
}

export interface LuckyNumbersResult {
  two?: string[];
  three?: string[];
  run?: string[];
  note: string;
}

export interface CandleResult {
  unlocked: boolean;
  dedication: string;
  mantra: string[];
  lucky2: string;
  lucky3: string;
}

export interface OfferingResult {
  category: string;
  message: string;
  merit: number;
  lucky?: string;
  color?: string;
  care?: boolean;
}

export interface RemedyResult {
  zodiac_name: string;
  year_name: string;
  year: number;
  relation: number;
  relation_name: string;
  severity: number;
  summary: string;
  problem: string;
  practical: string;
  merit: string;
  color: string;
  direction: string;
  mantra: string[];
  yantra: string;
}

export interface ImageScanResult {
  element: string;
  reading: string;
  scores: {
    wealth: number;
    love: number;
    health: number;
    career: number;
  };
  fingerprint: string;
}

export interface SignatureResult {
  traits: string[];
  scores: {
    wealth: number;
    love: number;
    career: number;
    luck: number;
  };
  strokes: number;
}

export interface FestivalInfo {
  name: string;
  tagline: string;
}

export interface BlessingResult {
  title: string;
  text: string;
  lucky: string;
  angpao?: number;
}
