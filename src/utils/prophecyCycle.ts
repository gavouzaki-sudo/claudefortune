// Weekly 5-set prophecy rotation (Monday–Sunday, Thailand UTC+7)
// & Half-month period-locked unified lucky numbers (1–15 vs 16–30/31)

import { safeStorage } from './storage';
import { pad2, pad3 } from './formatters';

export interface CalendarDateParts {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export interface UnifiedLuckyNumbers {
  periodKey: string;
  primary2: string;
  two: [string, string, string];
  primary3: string;
  three: [string, string, string];
  run: [string, string];
}

const DEVICE_SEED_KEY = 'shrine.deviceLuckySeed.v1';
const PERIOD_CACHE_KEY = 'shrine.periodLuckyCache.v1';

// Epoch Monday: 2026-01-05 (Monday) -> diffDays % 7 aligns strictly to Monday–Sunday
const EPOCH_MONDAY_UTC_MS = Date.UTC(2026, 0, 5);
const MS_PER_DAY = 86_400_000;

/**
 * Extracts local/Thailand calendar parts (year CE, month 1..12, day 1..31).
 * If a Date is explicitly provided, uses its local calendar components to stay consistent
 * with Bridge.setDate(date). Otherwise resolves current date in Asia/Bangkok (UTC+7).
 */
export function getCalendarDateParts(date?: Date): CalendarDateParts {
  if (date) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);

    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return { year, month, day };
    }
  } catch {
    // Fallback to local clock if Intl timeZone is unavailable
  }

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/**
 * Returns 0..4 rotating weekly every Monday (Monday–Sunday) and looping after 5 weeks.
 */
export function getWeeklyProphecySetIndex(input?: Date | CalendarDateParts): number {
  const { year, month, day } =
    input instanceof Date || input === undefined ? getCalendarDateParts(input) : input;

  const dayUtcMs = Date.UTC(year, month - 1, day);
  const diffDays = Math.floor((dayUtcMs - EPOCH_MONDAY_UTC_MS) / MS_PER_DAY);
  const weekIndex = Math.floor(diffDays / 7);
  return ((weekIndex % 5) + 5) % 5;
}

/**
 * Returns lottery draw period key based strictly on calendar days:
 * - Days 1..15  => YYYY-MM-P1
 * - Days 16..31 => YYYY-MM-P2
 */
export function getLotteryPeriodKey(input?: Date | CalendarDateParts): string {
  const { year, month, day } =
    input instanceof Date || input === undefined ? getCalendarDateParts(input) : input;
  const half = day <= 15 ? 'P1' : 'P2';
  return `${year}-${pad2(month)}-${half}`;
}

function periodKeyFromHalfIndex(halfIndex: number): string {
  const half = ((halfIndex % 2) + 2) % 2;
  const totalMonths = Math.floor((halfIndex - half) / 2);
  const monthZeroBased = ((totalMonths % 12) + 12) % 12;
  const year = Math.floor((totalMonths - monthZeroBased) / 12);
  return `${year}-${pad2(monthZeroBased + 1)}-${half === 0 ? 'P1' : 'P2'}`;
}

function getHalfIndex(parts: CalendarDateParts): number {
  return (parts.year * 12 + (parts.month - 1)) * 2 + (parts.day <= 15 ? 0 : 1);
}

function ensureDistinctPrimaryAndArray(
  tuple: UnifiedLuckyNumbers,
  prev: UnifiedLuckyNumbers | null
): UnifiedLuckyNumbers {
  if (!prev) return tuple;

  let n2a = parseInt(tuple.primary2, 10);
  let n2b = parseInt(tuple.two[1], 10);
  let n2c = parseInt(tuple.two[2], 10);

  if (pad2(n2a) === prev.primary2) {
    n2a = (n2a + 37) % 100;
    while (n2b === n2a) n2b = (n2b + 17) % 100;
    while (n2c === n2a || n2c === n2b) n2c = (n2c + 29) % 100;
  }

  let n3a = parseInt(tuple.primary3, 10);
  let n3b = parseInt(tuple.three[1], 10);
  let n3c = parseInt(tuple.three[2], 10);

  if (pad3(n3a) === prev.primary3) {
    n3a = (n3a + 263) % 1000;
    while (n3b === n3a) n3b = (n3b + 137) % 1000;
    while (n3c === n3a || n3c === n3b) n3c = (n3c + 271) % 1000;
  }

  const primary2 = pad2(n2a);
  const primary3 = pad3(n3a);

  return {
    ...tuple,
    primary2,
    two: [primary2, pad2(n2b), pad2(n2c)],
    primary3,
    three: [primary3, pad3(n3b), pad3(n3c)],
  };
}

export function getDeviceLuckySeed(): string {
  const existing = safeStorage.get<string>('local', DEVICE_SEED_KEY, '');
  if (existing && typeof existing === 'string' && existing.length >= 8) {
    return existing;
  }

  let generated = '';
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint32Array(4);
      crypto.getRandomValues(bytes);
      generated = Array.from(bytes, (b) => b.toString(16).padStart(8, '0')).join('');
    }
  } catch {
    // Fallback below
  }

  if (!generated) {
    generated =
      Math.random().toString(36).slice(2).padEnd(10, '0') +
      Date.now().toString(36);
  }

  safeStorage.set('local', DEVICE_SEED_KEY, generated);
  return generated;
}

function hashString32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Final avalanche mix
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function makePrng(seedStr: string): () => number {
  let state = hashString32(seedStr) || 0x12345678;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRawTuple(identitySeed: string, periodKey: string): UnifiedLuckyNumbers {
  const rng = makePrng(`${identitySeed}|${periodKey}|unified-lotto-v1`);

  const n2a = Math.floor(rng() * 100);
  let n2b = Math.floor(rng() * 100);
  if (n2b === n2a) n2b = (n2a + 17) % 100;
  let n2c = Math.floor(rng() * 100);
  while (n2c === n2a || n2c === n2b) n2c = (n2c + 29) % 100;

  const n3a = Math.floor(rng() * 1000);
  let n3b = Math.floor(rng() * 1000);
  if (n3b === n3a) n3b = (n3a + 137) % 1000;
  let n3c = Math.floor(rng() * 1000);
  while (n3c === n3a || n3c === n3b) n3c = (n3c + 271) % 1000;

  const r1 = Math.floor(rng() * 10);
  let r2 = Math.floor(rng() * 10);
  if (r2 === r1) r2 = (r1 + 3) % 10;

  const primary2 = pad2(n2a);
  const primary3 = pad3(n3a);

  return {
    periodKey,
    primary2,
    two: [primary2, pad2(n2b), pad2(n2c)],
    primary3,
    three: [primary3, pad3(n3b), pad3(n3c)],
    run: [String(r1), String(r2)],
  };
}

interface StoredPeriodCache {
  cacheKey: string;
  tuple: UnifiedLuckyNumbers;
}

/**
 * Generates deterministic, period-locked, user-and-device-specific unified lucky numbers.
 * - Identical across all rituals within the same calendar period (1–15 or 16–30/31)
 * - Specific to user's birthYear + zodiac (+ name) + deviceSeed
 * - Automatically changes when crossing into the next period (guaranteed different across adjacent periods)
 */
export function getPeriodUnifiedLuckyNumbers(params: {
  date?: CalendarDateParts;
  birthYear?: number;
  zodiac?: number;
  userName?: string;
  deviceSeed?: string;
  useCache?: boolean;
}): UnifiedLuckyNumbers {
  const parts = params.date ?? getCalendarDateParts();
  const periodKey = getLotteryPeriodKey(parts);

  const deviceSeed = params.deviceSeed ?? getDeviceLuckySeed();
  const birthYear = Number.isFinite(params.birthYear) ? Math.floor(params.birthYear!) : 2000;
  const zodiac = Number.isFinite(params.zodiac) ? Math.floor(params.zodiac!) : 4;
  const normalizedName = (params.userName || '').trim();

  const identitySeed = `${deviceSeed}|${birthYear}|${zodiac}|${normalizedName}`;
  const fullCacheKey = `${periodKey}|${identitySeed}`;

  if (params.useCache !== false) {
    const cached = safeStorage.get<StoredPeriodCache | null>('local', PERIOD_CACHE_KEY, null);
    if (cached && cached.cacheKey === fullCacheKey && cached.tuple?.primary2 && cached.tuple?.primary3) {
      return cached.tuple;
    }
  }

  const targetHalf = getHalfIndex(parts);
  let tuple: UnifiedLuckyNumbers | null = null;
  for (let h = targetHalf - 4; h <= targetHalf; h++) {
    const raw = buildRawTuple(identitySeed, periodKeyFromHalfIndex(h));
    tuple = ensureDistinctPrimaryAndArray(raw, tuple);
  }

  const finalTuple = tuple!;

  if (params.useCache !== false) {
    safeStorage.set<StoredPeriodCache>('local', PERIOD_CACHE_KEY, {
      cacheKey: fullCacheKey,
      tuple: finalTuple,
    });
  }

  return finalTuple;
}
