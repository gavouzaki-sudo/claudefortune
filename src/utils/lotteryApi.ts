// Thai Government Lottery (สลากกินแบ่งรัฐบาล) Service
// Fetches official lottery results from GLO API with proxy & fallback support

import { logger } from './logger';
import { safeStorage } from './storage';
import { THAI_MONTHS } from '../data/auspiciousCalendarData';

const DEFAULT_CF_WORKER_URL = 'https://mlre-glo-proxy.gavouzaki.workers.dev';
const DEFAULT_CF_PROJECT_ID = 'MLRE';
const DEFAULT_CF_ACCESS_TOKEN = 'lotto';

const LOTTERY_LATEST_CACHE_KEY = 'lucky_shrine_lottery_latest_v1';
const LOTTERY_DRAWS_CACHE_KEY = 'lucky_shrine_lottery_draws_v1';

interface LotteryEndpointConfig {
  url: string;
  headers?: Record<string, string>;
}

function getWorkerConfig(): { baseUrl: string; projectId: string; accessToken: string } | null {
  const env = (typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string | undefined> }).env : undefined) || {};
  const rawUrl = (env.VITE_GLO_PROXY_URL || '').trim() || DEFAULT_CF_WORKER_URL;
  if (!rawUrl) return null;
  const withProtocol = /^https?:\/\//i.test(rawUrl)
    ? rawUrl
    : rawUrl.startsWith('/')
      ? rawUrl
      : `https://${rawUrl}`;
  return {
    baseUrl: withProtocol.replace(/\/+$/, ''),
    projectId: (env.VITE_GLO_PROXY_PROJECT_ID || '').trim() || DEFAULT_CF_PROJECT_ID,
    accessToken: (env.VITE_GLO_PROXY_TOKEN || '').trim() || DEFAULT_CF_ACCESS_TOKEN,
  };
}

function getWorkerHeaders(projectId: string, accessToken: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (projectId) headers['X-MLRE-Project'] = projectId;
  if (accessToken) headers['X-MLRE-Token'] = accessToken;
  return headers;
}

export interface LotteryDisplayData {
  first: string; // 6 digits e.g. "423224"
  firstPrice: string; // e.g. "6,000,000"
  last3f: string[]; // 2 items e.g. ["300", "950"]
  last3fPrice: string; // e.g. "4,000"
  last3b: string[]; // 2 items e.g. ["393", "804"]
  last3bPrice: string; // e.g. "4,000"
  last2: string; // 2 digits e.g. "85"
  last2Price: string; // e.g. "2,000"
  rawDate: string; // "2026-11-01"
  formattedThaiDate: string; // "1 พฤศจิกายน 2569"
  period?: number[];
  pdfUrl?: string;
  isFallback?: boolean;
}

export interface CheckTicketResult {
  ticketNumber: string;
  isWon: boolean;
  totalReward: number;
  wonPrizes: {
    prizeName: string;
    matchedNumber: string;
    reward: number;
  }[];
}

export function formatThaiDate(yearCe: number, month1Indexed: number, day: number): string {
  const monthName = THAI_MONTHS[month1Indexed - 1] || '';
  const yearBe = yearCe + 543;
  return `${day} ${monthName} ${yearBe}`;
}

function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateString(dateStr: string): { day: number; month: number; yearCe: number } {
  // Format: "YYYY-MM-DD"
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const yearCe = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!Number.isNaN(yearCe) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return { yearCe, month, day };
    }
  }
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth() + 1, yearCe: now.getFullYear() };
}

// Fallback data in case of offline or network interruption
export const KNOWN_BACKUP_DRAWS: Record<string, LotteryDisplayData> = {
  '2026-11-01': {
    first: '423224',
    firstPrice: '6,000,000',
    last3f: ['300', '950'],
    last3fPrice: '4,000',
    last3b: ['393', '804'],
    last3bPrice: '4,000',
    last2: '85',
    last2Price: '2,000',
    rawDate: '2026-11-01',
    formattedThaiDate: '1 พฤศจิกายน 2569',
    period: [41, 42],
    isFallback: true,
  },
  '2026-02-01': {
    first: '174629',
    firstPrice: '6,000,000',
    last3f: ['917', '195'],
    last3fPrice: '4,000',
    last3b: ['408', '041'],
    last3bPrice: '4,000',
    last2: '48',
    last2Price: '2,000',
    rawDate: '2026-02-01',
    formattedThaiDate: '1 กุมภาพันธ์ 2569',
    isFallback: true,
  },
  '2024-03-01': {
    first: '253603',
    firstPrice: '6,000,000',
    last3f: ['900', '975'],
    last3fPrice: '4,000',
    last3b: ['382', '703'],
    last3bPrice: '4,000',
    last2: '79',
    last2Price: '2,000',
    rawDate: '2024-03-01',
    formattedThaiDate: '1 มีนาคม 2567',
    isFallback: true,
  },
};

const BACKUP_LATEST_DRAW: LotteryDisplayData = KNOWN_BACKUP_DRAWS['2026-11-01'];

function cacheLotteryDraw(draw: LotteryDisplayData, isLatest = false): void {
  if (typeof window === 'undefined' || draw.isFallback) return;
  if (isLatest) {
    safeStorage.set('local', LOTTERY_LATEST_CACHE_KEY, draw);
  }
  if (draw.rawDate) {
    const cachedMap = safeStorage.get<Record<string, LotteryDisplayData>>('local', LOTTERY_DRAWS_CACHE_KEY, {});
    const updatedMap: Record<string, LotteryDisplayData> = {
      ...cachedMap,
      [draw.rawDate]: draw,
    };
    const keys = Object.keys(updatedMap).sort();
    while (keys.length > 20) {
      const oldest = keys.shift();
      if (oldest) delete updatedMap[oldest];
    }
    safeStorage.set('local', LOTTERY_DRAWS_CACHE_KEY, updatedMap);
  }
}

function getCachedLatestDraw(): LotteryDisplayData | null {
  if (typeof window === 'undefined') return null;
  const cached = safeStorage.get<LotteryDisplayData | null>('local', LOTTERY_LATEST_CACHE_KEY, null);
  return cached ? { ...cached, isFallback: true } : null;
}

function getCachedDrawByDate(lookupKey: string): LotteryDisplayData | null {
  if (typeof window === 'undefined') return null;
  const cachedMap = safeStorage.get<Record<string, LotteryDisplayData>>('local', LOTTERY_DRAWS_CACHE_KEY, {});
  const cached = cachedMap[lookupKey];
  return cached ? { ...cached, isFallback: true } : null;
}

function formatPrice(priceStr?: string, defaultPrice = ''): string {
  if (!priceStr) return defaultPrice;
  const num = parseFloat(priceStr);
  if (isNaN(num)) return defaultPrice;
  return num.toLocaleString('th-TH');
}

function normalizeApiResponse(rawResponse: any): LotteryDisplayData {
  const respData = rawResponse?.response?.data || rawResponse?.response?.result?.data || rawResponse?.data;
  const dateStr = rawResponse?.response?.date || rawResponse?.response?.result?.date || rawResponse?.date || getTodayIsoDate();
  const period = rawResponse?.response?.period || rawResponse?.response?.result?.period;
  const pdfUrl = rawResponse?.response?.pdf_url || rawResponse?.response?.result?.pdf_url;

  const { day, month, yearCe } = parseDateString(dateStr);
  const formattedThaiDate = formatThaiDate(yearCe, month, day);

  const first = respData?.first?.number?.[0]?.value || '423224';
  const firstPrice = formatPrice(respData?.first?.price, '6,000,000');

  const last3fNumbers: string[] = (respData?.last3f?.number || [])
    .map((item: any) => String(item.value || '').trim())
    .filter(Boolean);
  const last3fPrice = formatPrice(respData?.last3f?.price, '4,000');

  const last3bNumbers: string[] = (respData?.last3b?.number || [])
    .map((item: any) => String(item.value || '').trim())
    .filter(Boolean);
  const last3bPrice = formatPrice(respData?.last3b?.price, '4,000');

  const last2 = respData?.last2?.number?.[0]?.value || '85';
  const last2Price = formatPrice(respData?.last2?.price, '2,000');

  return {
    first,
    firstPrice,
    last3f: last3fNumbers.length > 0 ? last3fNumbers : ['300', '950'],
    last3fPrice,
    last3b: last3bNumbers.length > 0 ? last3bNumbers : ['393', '804'],
    last3bPrice,
    last2,
    last2Price,
    rawDate: dateStr,
    formattedThaiDate,
    period,
    pdfUrl,
    isFallback: false,
  };
}

interface FetchEndpointsOutcome {
  data: LotteryDisplayData | null;
  diagnostic?: string;
  emptyDraw?: boolean;
}

async function fetchLotteryEndpoints(
  endpoints: LotteryEndpointConfig[],
  body: Record<string, unknown>,
  isValidPayload: (json: any) => boolean,
  errorLabel: string
): Promise<FetchEndpointsOutcome> {
  let lastDiagnostic: string | undefined;
  let sawEmptyDraw = false;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.headers,
        },
        body: JSON.stringify(body),
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      // Guard against static hosting / SPA fallback returning index.html
      if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
        continue;
      }

      const text = await res.text();
      if (text.trim().startsWith('<')) {
        continue;
      }

      if (!res.ok) {
        try {
          const errJson = JSON.parse(text);
          if (errJson?.error) {
            const originInfo =
              res.status === 403 && typeof window !== 'undefined'
                ? ` — Origin ปัจจุบันคือ ${window.location.origin}`
                : '';
            lastDiagnostic = `Proxy HTTP ${res.status}: ${errJson.error}${originInfo}`;
            logger.warn(`${errorLabel} (${endpoint.url}): ${lastDiagnostic}`);
          }
        } catch {
          lastDiagnostic = `HTTP ${res.status}`;
        }
        continue;
      }

      try {
        const parsed = JSON.parse(text);
        // Unwrap Cloudflare Worker proxy envelope { ok: true, data: <GLO response> }
        const json =
          parsed && typeof parsed === 'object' && parsed.ok === true && parsed.data && !parsed.response
            ? parsed.data
            : parsed;
        if (json?.status && isValidPayload(json)) {
          return { data: normalizeApiResponse(json) };
        }
        if (json?.status === true && !isValidPayload(json)) {
          sawEmptyDraw = true;
          break;
        }
        if (parsed && typeof parsed === 'object' && parsed.error) {
          lastDiagnostic = String(parsed.error);
        }
      } catch {
        continue;
      }
    } catch (err: any) {
      const originInfo = typeof window !== 'undefined' ? ` (Origin: ${window.location.origin})` : '';
      if (endpoint.url.startsWith('http')) {
        lastDiagnostic = `เชื่อมต่อ Proxy ไม่ได้${originInfo}`;
      }
      logger.debug(`${errorLabel} from ${endpoint.url}:`, err);
    }
  }
  return { data: null, diagnostic: lastDiagnostic, emptyDraw: sawEmptyDraw };
}

/**
 * Fetch latest lottery result from GLO API (Vite proxy -> Cloudflare Worker -> cached/backup fallback)
 * POST /api/glo/lottery/getLatestLottery or POST <worker>/api/glo/latest
 */
export async function getLatestLotteryResult(): Promise<LotteryDisplayData> {
  const isBrowser = typeof window !== 'undefined';
  const worker = getWorkerConfig();
  const endpoints: LotteryEndpointConfig[] = [];

  if (isBrowser) {
    endpoints.push({ url: '/api/glo/lottery/getLatestLottery' });
    if (worker) {
      endpoints.push({
        url: `${worker.baseUrl}/api/glo/latest`,
        headers: getWorkerHeaders(worker.projectId, worker.accessToken),
      });
    }
  } else {
    if (worker) {
      endpoints.push({
        url: `${worker.baseUrl}/api/glo/latest`,
        headers: getWorkerHeaders(worker.projectId, worker.accessToken),
      });
    }
    endpoints.push({ url: 'https://www.glo.or.th/api/lottery/getLatestLottery' });
  }

  const outcome = await fetchLotteryEndpoints(
    endpoints,
    {},
    (json) => Boolean(json.response),
    'Could not fetch lottery'
  );
  if (outcome.data) {
    cacheLotteryDraw(outcome.data, true);
    return outcome.data;
  }

  const cachedLatest = getCachedLatestDraw();
  if (cachedLatest) {
    logger.info('Using cached latest lottery draw data from localStorage');
    return cachedLatest;
  }

  logger.info('Using backup latest lottery draw data');
  return { ...BACKUP_LATEST_DRAW };
}

/**
 * Check lottery result by date from GLO API (Vite proxy -> Cloudflare Worker -> cached/backup fallback)
 * POST /api/glo/checking/getLotteryResult or POST <worker>/api/glo/history
 * Payload: {"date":"01","month":"03","year":"2024"}
 */
export async function getLotteryResultByDate(
  date: string,
  month: string,
  yearInput: string | number
): Promise<LotteryDisplayData> {
  const defaultYearBE = new Date().getFullYear() + 543;
  const parsedYear = typeof yearInput === 'number' ? yearInput : parseInt(String(yearInput).trim(), 10) || defaultYearBE;
  // If user entered Buddhist Era (B.E. >= 2400 e.g. 2569, 2567), convert to C.E. (e.g. 2026, 2024)
  const yearCe = parsedYear >= 2400 ? parsedYear - 543 : parsedYear;
  const yearBe = parsedYear >= 2400 ? parsedYear : parsedYear + 543;

  const payload = {
    date: date.padStart(2, '0'),
    month: month.padStart(2, '0'),
    year: String(yearCe),
  };

  const isBrowser = typeof window !== 'undefined';
  const worker = getWorkerConfig();
  const endpoints: LotteryEndpointConfig[] = [];

  if (isBrowser) {
    endpoints.push({ url: '/api/glo/checking/getLotteryResult' });
    if (worker) {
      endpoints.push({
        url: `${worker.baseUrl}/api/glo/history`,
        headers: getWorkerHeaders(worker.projectId, worker.accessToken),
      });
    }
  } else {
    if (worker) {
      endpoints.push({
        url: `${worker.baseUrl}/api/glo/history`,
        headers: getWorkerHeaders(worker.projectId, worker.accessToken),
      });
    }
    endpoints.push({ url: 'https://www.glo.or.th/api/checking/getLotteryResult' });
  }

  const outcome = await fetchLotteryEndpoints(
    endpoints,
    payload,
    (json) => Boolean(json.response?.result),
    'Could not fetch draw by date'
  );
  if (outcome.data) {
    cacheLotteryDraw(outcome.data, false);
    return outcome.data;
  }

  const lookupKey = `${yearCe}-${payload.month}-${payload.date}`;
  const cachedDraw = getCachedDrawByDate(lookupKey);
  if (cachedDraw) {
    return cachedDraw;
  }
  if (KNOWN_BACKUP_DRAWS[lookupKey]) {
    return { ...KNOWN_BACKUP_DRAWS[lookupKey] };
  }

  if (outcome.emptyDraw) {
    throw new Error(
      `ยังไม่มีข้อมูลผลการออกรางวัลของงวดวันที่ ${payload.date}/${payload.month}/${yearBe} (อาจยังไม่ถึงกำหนดวันออกสลาก หรือไม่มีการออกรางวัลในวันที่เลือก)`
    );
  }

  const detail = outcome.diagnostic
    ? ` [${outcome.diagnostic}]`
    : ' (โปรดตรวจสอบการเชื่อมต่อเครือข่าย หรือเซิร์ฟเวอร์กองสลากฯ)';
  throw new Error(`ไม่พบข้อมูลผลการออกรางวัลของงวดวันที่ ${payload.date}/${payload.month}/${yearBe}${detail}`);
}

/**
 * Check whether a 6-digit ticket won any of the 4 requested prizes:
 * 1. รางวัลที่ 1 (Full 6 digits)
 * 2. รางวัลเลขหน้า 3 ตัว (First 3 digits match last3f)
 * 3. รางวัลเลขท้าย 3 ตัว (Last 3 digits match last3b)
 * 4. รางวัลเลขท้าย 2 ตัว (Last 2 digits match last2)
 */
export function checkTicketWin(ticketInput: string, draw: LotteryDisplayData): CheckTicketResult {
  const cleanNum = ticketInput.trim().replace(/\D/g, '');
  const wonPrizes: CheckTicketResult['wonPrizes'] = [];

  if (cleanNum.length !== 6) {
    return {
      ticketNumber: cleanNum,
      isWon: false,
      totalReward: 0,
      wonPrizes: [],
    };
  }

  // 1. Check รางวัลที่ 1
  if (cleanNum === draw.first) {
    wonPrizes.push({
      prizeName: 'รางวัลที่ 1',
      matchedNumber: cleanNum,
      reward: 6000000,
    });
  }

  // 2. Check รางวัลเลขหน้า 3 ตัว
  const first3 = cleanNum.slice(0, 3);
  if (draw.last3f.includes(first3)) {
    wonPrizes.push({
      prizeName: 'รางวัลเลขหน้า 3 ตัว',
      matchedNumber: first3,
      reward: 4000,
    });
  }

  // 3. Check รางวัลเลขท้าย 3 ตัว
  const last3 = cleanNum.slice(3, 6);
  if (draw.last3b.includes(last3)) {
    wonPrizes.push({
      prizeName: 'รางวัลเลขท้าย 3 ตัว',
      matchedNumber: last3,
      reward: 4000,
    });
  }

  // 4. Check รางวัลเลขท้าย 2 ตัว
  const last2 = cleanNum.slice(4, 6);
  if (draw.last2 === last2) {
    wonPrizes.push({
      prizeName: 'รางวัลเลขท้าย 2 ตัว',
      matchedNumber: last2,
      reward: 2000,
    });
  }

  const totalReward = wonPrizes.reduce((sum, p) => sum + p.reward, 0);

  return {
    ticketNumber: cleanNum,
    isWon: wonPrizes.length > 0,
    totalReward,
    wonPrizes,
  };
}
