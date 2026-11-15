// Thin bridge between TypeScript and the divination core.
// Supports both WebAssembly (wasm/core.c) and an embedded 100% pure TypeScript engine
// to ensure zero preview or runtime failures across all browser sandboxes and CSP environments.

import { logger } from "./utils/logger";
import { pad2, pad3, clamp } from "./utils/formatters";
import {
  getCalendarDateParts,
  getWeeklyProphecySetIndex,
  getPeriodUnifiedLuckyNumbers,
  type CalendarDateParts,
  type UnifiedLuckyNumbers,
} from "./utils/prophecyCycle";
import {
  STICK_VERSE_SETS,
  STICK_ASPECT_SETS,
  TAROT_MEANING_SETS,
  CANDLE_PROPHECY_SETS,
  OFFERING_GUIDE_SETS,
  REMEDY_SUMMARY_SETS,
  REMEDY_PRACTICAL_SETS,
  REMEDY_MERIT_SETS,
  REMEDY_MANTRA_SETS,
  FESTIVAL_BLESSING_SETS,
  IMAGE_SCAN_READINGS,
  SIGNATURE_TRAIT_SETS,
} from "./data/ritualProphecies";
import type {
  ZodiacInfo,
  StickResult,
  TarotResult,
  LuckyNumbersResult,
  CandleResult,
  OfferingResult,
  RemedyResult,
  ImageScanResult,
  SignatureResult,
  FestivalInfo,
  BlessingResult,
} from "./types";

const enc = new TextEncoder();
const dec = new TextDecoder("utf-8");

interface WasmExports {
  memory: WebAssembly.Memory;
  seed_entropy: (a: number, b: number, c: number, d: number) => void;
  set_date: (y: number, m: number, d: number) => void;
  wasm_reset: () => void;
  wasm_alloc: (n: number) => number;
  out_ptr: () => number;
  wasm_version: () => number;
  init_session: (namePtr: number, len: number, birthYear: number, zodiac: number) => number;
  get_zodiac_info: (z: number) => number;
  draw_siamese_sticks: (power: number) => number;
  draw_tarot_cards: (count: number) => number;
  generate_lucky_numbers: (category: number) => number;
  calculate_bad_luck_remedy: (zodiac: number, problem: number) => number;
  candle_unlock: (holdMs: number) => number;
  get_festival: (month: number, day: number) => number;
  festival_info: (id: number) => number;
  draw_festival_blessing: (id: number) => number;
  process_digital_offering: (type: number, textPtr: number, len: number) => number;
  process_image_scan: (ptr: number, len: number, mode: number) => number;
  process_signature: (ptr: number, n: number) => number;
}

export interface ICoreEngine {
  seedEntropy(a: number, b: number, c: number, d: number): void;
  setDate(y: number, m: number, d: number): void;
  version(): number;
  initSession(name: string, birthYear: number, zodiac?: number): number;
  getZodiacInfo(z?: number): ZodiacInfo;
  drawSiameseSticks(power: number): StickResult;
  drawTarotCards(count: number): TarotResult;
  generateLuckyNumbers(category: number): LuckyNumbersResult;
  calculateBadLuckRemedy(zodiac: number, problem: number): RemedyResult;
  candleUnlock(holdMs: number): CandleResult;
  getFestival(month: number, day: number): number;
  festivalInfo(id: number): FestivalInfo;
  drawFestivalBlessing(id: number): BlessingResult;
  processDigitalOffering(type: number, text: string): OfferingResult;
  processImageScan(rgba: Uint8ClampedArray | Uint8Array, mode: number): ImageScanResult;
  processSignature(points: [number, number, number][]): SignatureResult;
}

// -----------------------------------------------------------------------------
// Wasm-backed core engine
// -----------------------------------------------------------------------------
class WasmCoreEngine implements ICoreEngine {
  private x: WasmExports;
  private mem: WebAssembly.Memory;

  constructor(instance: WebAssembly.Instance) {
    this.x = instance.exports as unknown as WasmExports;
    this.mem = this.x.memory;
  }

  private get _buffer(): ArrayBuffer {
    return (this.x.memory || this.mem).buffer;
  }

  private _bytes(u8: Uint8Array): number {
    this.x.wasm_reset();
    const p = this.x.wasm_alloc(Math.max(u8.length, 1));
    if (!p) throw new Error("หน่วยความจำ Wasm ไม่พอ");
    new Uint8Array(this._buffer, p, u8.length).set(u8);
    return p;
  }

  private _json<T>(n: number): T {
    if (n < 0) {
      const err = new Error("wasm error " + n) as Error & { code: number };
      err.code = n;
      throw err;
    }
    const s = dec.decode(new Uint8Array(this._buffer, this.x.out_ptr(), n));
    return JSON.parse(s) as T;
  }

  seedEntropy(a: number, b: number, c: number, d: number): void {
    this.x.seed_entropy(a, b, c, d);
  }

  setDate(y: number, m: number, d: number): void {
    this.x.set_date(y, m, d);
  }

  version(): number {
    return this.x.wasm_version();
  }

  initSession(name: string, birthYear: number, zodiac: number = -1): number {
    const u8 = enc.encode((name || "").slice(0, 100));
    const p = this._bytes(u8);
    return this.x.init_session(p, u8.length, birthYear | 0, zodiac | 0);
  }

  getZodiacInfo(z: number = -1): ZodiacInfo {
    return this._json<ZodiacInfo>(this.x.get_zodiac_info(z));
  }

  drawSiameseSticks(power: number): StickResult {
    return this._json<StickResult>(this.x.draw_siamese_sticks(Math.round(power)));
  }

  drawTarotCards(count: number): TarotResult {
    return this._json<TarotResult>(this.x.draw_tarot_cards(count));
  }

  generateLuckyNumbers(category: number): LuckyNumbersResult {
    return this._json<LuckyNumbersResult>(this.x.generate_lucky_numbers(category));
  }

  calculateBadLuckRemedy(zodiac: number, problem: number): RemedyResult {
    return this._json<RemedyResult>(this.x.calculate_bad_luck_remedy(zodiac, problem));
  }

  candleUnlock(holdMs: number): CandleResult {
    return this._json<CandleResult>(this.x.candle_unlock(Math.round(holdMs)));
  }

  getFestival(month: number, day: number): number {
    return this.x.get_festival(month, day);
  }

  festivalInfo(id: number): FestivalInfo {
    return this._json<FestivalInfo>(this.x.festival_info(id));
  }

  drawFestivalBlessing(id: number): BlessingResult {
    return this._json<BlessingResult>(this.x.draw_festival_blessing(id));
  }

  processDigitalOffering(type: number, text: string): OfferingResult {
    const u8 = enc.encode((text || "").slice(0, 1000));
    const p = this._bytes(u8);
    return this._json<OfferingResult>(this.x.process_digital_offering(type, p, u8.length));
  }

  processImageScan(rgba: Uint8ClampedArray | Uint8Array, mode: number): ImageScanResult {
    const p = this._bytes(new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength));
    return this._json<ImageScanResult>(this.x.process_image_scan(p, rgba.byteLength, mode));
  }

  processSignature(points: [number, number, number][]): SignatureResult {
    const n = points.length;
    const flat = new Int32Array(n * 3);
    for (let i = 0; i < n; i++) {
      flat[i * 3] = points[i][0] | 0;
      flat[i * 3 + 1] = points[i][1] | 0;
      flat[i * 3 + 2] = points[i][2] | 0;
    }
    const p = this._bytes(new Uint8Array(flat.buffer));
    return this._json<SignatureResult>(this.x.process_signature(p, n));
  }
}

// -----------------------------------------------------------------------------
// Pure TypeScript fallback core engine
// -----------------------------------------------------------------------------
const ZOD_LIST = [
  { name: "ชวด", animal: "หนู", color: "น้ำเงิน", dir: "ทิศเหนือ" },
  { name: "ฉลู", animal: "วัว", color: "เหลืองทอง", dir: "ทิศตะวันออกเฉียงเหนือ" },
  { name: "ขาล", animal: "เสือ", color: "เขียว", dir: "ทิศตะวันออก" },
  { name: "เถาะ", animal: "กระต่าย", color: "ชมพู", dir: "ทิศตะวันออก" },
  { name: "มะโรง", animal: "งูใหญ่", color: "ทอง", dir: "ทิศตะวันออกเฉียงใต้" },
  { name: "มะเส็ง", animal: "งูเล็ก", color: "แดง", dir: "ทิศใต้" },
  { name: "มะเมีย", animal: "ม้า", color: "แดงสด", dir: "ทิศใต้" },
  { name: "มะแม", animal: "แพะ", color: "เหลือง", dir: "ทิศตะวันตกเฉียงใต้" },
  { name: "วอก", animal: "ลิง", color: "ขาว", dir: "ทิศตะวันตก" },
  { name: "ระกา", animal: "ไก่", color: "ขาวทอง", dir: "ทิศตะวันตก" },
  { name: "จอ", animal: "สุนัข", color: "ส้มอ่อน", dir: "ทิศตะวันตกเฉียงเหนือ" },
  { name: "กุน", animal: "หมู", color: "ฟ้าน้ำทะเล", dir: "ทิศเหนือ" },
];

const STICKS: readonly { level: number; title: string }[] = [
  { level: 0, title: "มังกรทะยานฟ้า" },
  { level: 1, title: "ตะวันพ้นหมอก" },
  { level: 2, title: "สะพานข้ามสายน้ำ" },
  { level: 1, title: "ต้นไม้ผลิดอก" },
  { level: 2, title: "เรือฝ่าคลื่นลม" },
  { level: 2, title: "เทียนไหวในลมเบา" },
  { level: 0, title: "หงส์ฟ้ากางปีก" },
  { level: 2, title: "ภูเขาหมอกคลุม" },
  { level: 1, title: "นกน้อยรังใหม่" },
  { level: 2, title: "กระต่ายใต้จันทร์" },
  { level: 3, title: "ฝนแล้งรอเมฆ" },
  { level: 0, title: "ดอกบัวพ้นโคลน" },
  { level: 1, title: "ทองคำในธารทราย" },
  { level: 1, title: "ระฆังยามเช้า" },
  { level: 0, title: "ม้าเร็วบนทางโล่ง" },
  { level: 3, title: "ฟ้าครึ้มก่อนฝน" },
  { level: 3, title: "ประตูปิดสนิท" },
  { level: 1, title: "เกลียวคลื่นสู่ฝั่ง" },
  { level: 0, title: "ปลาคาร์ปข้ามประตูมังกร" },
  { level: 1, title: "ลานวัดยามเย็น" },
  { level: 3, title: "กิ่งหักกลางลม" },
  { level: 3, title: "เมฆดำเหนือทุ่งนา" },
  { level: 2, title: "สะพานไม้เก่า" },
  { level: 1, title: "ลมใต้ปีกนก" },
  { level: 0, title: "ดาวเหนือนำทาง" },
  { level: 1, title: "แสงทองยามรุ่ง" },
  { level: 2, title: "เงาในกระจกน้ำ" },
  { level: 2, title: "ทางแยกในป่า" },
];

const LEVEL_NAMES = ["ดีเยี่ยม", "ดี", "ปานกลาง", "ควรระวัง"];
const ASPECT_NAMES = ["การเงิน", "ความรัก", "สุขภาพ", "การงาน"];

const TAROT_CARDS: readonly { th: string; en: string }[] = [
  { th: "ผู้เริ่มต้น", en: "The Fool" },
  { th: "จอมเวท", en: "The Magician" },
  { th: "สตรีนักบวช", en: "The High Priestess" },
  { th: "จักรพรรดินี", en: "The Empress" },
  { th: "จักรพรรดิ", en: "The Emperor" },
  { th: "ผู้สอนธรรม", en: "The Hierophant" },
  { th: "คู่รัก", en: "The Lovers" },
  { th: "รถศึก", en: "The Chariot" },
  { th: "พลัง", en: "Strength" },
  { th: "ฤๅษี", en: "The Hermit" },
  { th: "กงล้อโชคชะตา", en: "Wheel of Fortune" },
  { th: "ความยุติธรรม", en: "Justice" },
  { th: "ผู้ถูกแขวน", en: "The Hanged Man" },
  { th: "การเปลี่ยนผ่าน", en: "Death" },
  { th: "ความพอดี", en: "Temperance" },
  { th: "พันธนาการ", en: "The Devil" },
  { th: "หอคอย", en: "The Tower" },
  { th: "ดวงดาว", en: "The Star" },
  { th: "ดวงจันทร์", en: "The Moon" },
  { th: "ดวงอาทิตย์", en: "The Sun" },
  { th: "การตื่นรู้", en: "Judgement" },
  { th: "โลก", en: "The World" },
];

const FESTIVAL_NAMES = ["วันธรรมดา", "สงกรานต์", "ฮาโลวีน", "ลอยกระทง", "ตรุษจีน", "ปีใหม่"];
const FESTIVAL_TAGS = [
  "ศาลเจ้าแห่งโชคลาภ เปิดให้ขอพรทุกวัน",
  "สาดน้ำทายโชค เปิดคำทำนายปีใหม่ไทย",
  "เปิดโลงศพ สุ่มไพ่ดาร์กแฟนตาซี",
  "ลอยกระทงดิจิทัล ลุ้นเลขเด็ด",
  "อั่งเปาดิจิทัลพารวย",
  "นับถอยหลังสู่ปีแห่งโชค",
];

const ANGPAO_VALS = [8, 18, 28, 66, 88, 168, 888];

const FNV_OFF = 1469598103934665603n;
const FNV_PRIME = 1099511628211n;
const MASK64 = 0xFFFFFFFFFFFFFFFFn;

function fnvBytes(bytes: Uint8Array, h: bigint): bigint {
  let out = h & MASK64;
  for (let i = 0; i < bytes.length; i++) {
    out ^= BigInt(bytes[i]);
    out = (out * FNV_PRIME) & MASK64;
  }
  return out;
}

function fnvInt32(val: number, h: bigint): bigint {
  const v = val | 0;
  let out = h & MASK64;
  for (let shift = 0; shift < 32; shift += 8) {
    out ^= BigInt((v >>> shift) & 0xFF);
    out = (out * FNV_PRIME) & MASK64;
  }
  return out;
}

class JsCoreEngine implements ICoreEngine {
  private curY = new Date().getFullYear();
  private curM = new Date().getMonth() + 1;
  private curD = new Date().getDate();
  private by = 2000;
  private z = 4;
  private valid = false;
  private sessionHash = FNV_OFF;

  private yearBranch(y: number): number {
    return (((y - 4) % 12) + 12) % 12;
  }

  seedEntropy(_a: number, _b: number, _c: number, _d: number): void {
    // Pure JS engine relies on Math.random and crypto
  }

  setDate(y: number, m: number, d: number): void {
    if (y >= 1900 && y <= 2200) this.curY = y;
    if (m >= 1 && m <= 12) this.curM = m;
    if (d >= 1 && d <= 31) this.curD = d;
  }

  version(): number {
    return 1;
  }

  initSession(name: string, birthYear: number, zodiac: number = -1): number {
    const u8 = enc.encode((name || "").slice(0, 100));
    if (u8.length > 400) return -1;
    let by = birthYear | 0;
    if (by > 2400) by -= 543;
    if (by < 1900 || by > 2200) return -2;
    const zIn = zodiac | 0;
    if (zIn < -1 || zIn > 11) return -3;
    let h = fnvBytes(u8, FNV_OFF);
    h = fnvInt32(by, h);
    this.sessionHash = h;
    this.by = by;
    this.z = zIn >= 0 ? zIn : this.yearBranch(by);
    this.valid = true;
    return this.z;
  }

  getZodiacInfo(z: number = -1): ZodiacInfo {
    let idx = z | 0;
    if (idx < 0) idx = this.valid ? this.z : -1;
    if (idx < 0 || idx > 11) {
      throw Object.assign(new Error("Invalid zodiac index: must be between 0 and 11"), { code: -3 });
    }
    const item = ZOD_LIST[idx];
    const curYearIdx = this.yearBranch(this.curY);
    return {
      id: idx,
      index: idx,
      name: item.name,
      animal: item.animal,
      color: item.color,
      direction: item.dir,
      element: "มงคล",
      current_year_name: ZOD_LIST[curYearIdx].name,
      current_year_index: curYearIdx,
      year: this.curY,
    };
  }

  drawSiameseSticks(power: number): StickResult {
    const p = clamp(Math.round(Number.isFinite(power) ? power : 0), 0, 100000);
    const n = (Math.floor(Math.abs(Math.sin(p + Date.now())) * 28) + Math.floor(Math.random() * 28)) % 28;
    const s = STICKS[n];
    const aspects = ASPECT_NAMES.map((name, a) => ({
      name,
      text: STICK_ASPECT_SETS[s.level][a][0],
    }));

    return {
      stick: n + 1,
      level: s.level,
      level_name: LEVEL_NAMES[s.level],
      title: s.title,
      verse: STICK_VERSE_SETS[n][0],
      aspects,
    };
  }

  drawTarotCards(count: number): TarotResult {
    const c = clamp(count | 0, 1, 10);
    const deck = Array.from({ length: 22 }, (_, i) => i);
    for (let i = 21; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = deck[i];
      deck[i] = deck[j];
      deck[j] = t;
    }
    const cards = deck.slice(0, c).map((id) => {
      const item = TAROT_CARDS[id];
      const meaningSet = TAROT_MEANING_SETS[id][0];
      const reversed = Math.random() < 0.33;
      return {
        id,
        name: item.th,
        en: item.en,
        meaning: reversed ? meaningSet.rev : meaningSet.up,
        reversed,
      };
    });
    return { cards };
  }

  generateLuckyNumbers(category: number): LuckyNumbersResult {
    const cat = category | 0;
    if (cat < 0 || cat > 2) {
      throw Object.assign(new Error("Invalid lucky number category: must be 0, 1, or 2"), { code: -1 });
    }
    let seed = fnvInt32(this.curY * 10000 + this.curM * 100 + this.curD, this.valid ? this.sessionHash : FNV_OFF);
    seed = fnvInt32(this.valid ? this.z : 0, seed);
    const nextSeed = () => {
      seed = (seed + 0x9E3779B97F4A7C15n) & MASK64;
      let z = seed;
      z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
      z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
      return z ^ (z >> 31n);
    };
    const rnd2 = () => pad2(Number(nextSeed() % 100n));
    const rnd3 = () => pad3(Number(nextSeed() % 1000n));

    const result: LuckyNumbersResult = {
      note: "เลขนี้ใช้เพื่อความบันเทิงเท่านั้น ไม่ได้ทำนายผลสลากจริง และการเสี่ยงโชคมีความเสี่ยงเสมอ",
    };

    const by = this.valid ? this.by : 2000;
    const zVal = this.valid ? this.z : 0;

    if (cat === 0 || cat === 2) {
      const base = ((by % 10) * 10 + (zVal % 10)) % 100;
      result.two = [pad2(base), rnd2(), rnd2()];
    }
    if (cat === 1 || cat === 2) {
      const base = (by % 10) * 100 + (this.curD % 10) * 10 + (zVal % 10);
      result.three = [pad3(base), rnd3(), rnd3()];
    }
    if (cat === 2) {
      const r1 = Number(nextSeed() % 10n);
      let r2 = Number(nextSeed() % 10n);
      if (r2 === r1) r2 = (r2 + 3) % 10;
      result.run = [String(r1), String(r2)];
    }

    return result;
  }

  calculateBadLuckRemedy(zodiac: number, problem: number): RemedyResult {
    const p = problem | 0;
    if (p < 0 || p > 3) {
      throw Object.assign(new Error("Invalid problem type: must be between 0 and 3"), { code: -1 });
    }
    let z = zodiac | 0;
    if (z < 0) z = this.valid ? this.z : -1;
    if (z < 0 || z > 11) {
      throw Object.assign(new Error("Invalid zodiac index: must be between 0 and 11"), { code: -3 });
    }
    const curYearIdx = this.yearBranch(this.curY);

    const BREAK_PAIR = [9, 4, 11, 6, 1, 8, 3, 10, 5, 0, 7, 2];
    let rel = 0;
    if (z === curYearIdx) rel = 1;
    else if ((z + 6) % 12 === curYearIdx) rel = 2;
    else if ((z + curYearIdx) % 12 === 7) rel = 3;
    else if (BREAK_PAIR[z] === curYearIdx) rel = 4;

    const REL_NAMES = ["ไม่ชง (ดวงปกติ)", "ปีตรงนักษัตร", "ปีชง (ปะทะ)", "ปีไห่ (เบียดเบียน)", "ปีพัง (ทำลาย)"];
    const REL_SEV = [0, 1, 3, 2, 1];

    return {
      zodiac: z,
      zodiac_name: ZOD_LIST[z].name,
      year_name: ZOD_LIST[curYearIdx].name,
      year: this.curY,
      relation: rel,
      relation_name: REL_NAMES[rel],
      severity: REL_SEV[rel],
      problem: ASPECT_NAMES[p],
      summary: REMEDY_SUMMARY_SETS[rel][0],
      practical: REMEDY_PRACTICAL_SETS[p][0],
      merit: REMEDY_MERIT_SETS[p][0],
      color: ZOD_LIST[z].color,
      direction: ZOD_LIST[z].dir,
      yantra: "นะ โม พุท ธา ยะ",
      mantra: [...REMEDY_MANTRA_SETS[0]],
    };
  }

  candleUnlock(holdMs: number): CandleResult {
    const h = clamp(Math.round(Number.isFinite(holdMs) ? holdMs : 0), 0, 60000);
    const level = Math.min(100, Math.floor(h / 50));
    const unlocked = h >= 4000;

    if (!unlocked) {
      return {
        level,
        unlocked: false,
        remaining_ms: 4000 - Math.floor(h),
        dedication: "",
        mantra: [],
        lucky2: "",
        lucky3: "",
      };
    }

    return {
      level,
      unlocked: true,
      dedication: CANDLE_PROPHECY_SETS[0].dedication,
      mantra: [...CANDLE_PROPHECY_SETS[0].mantra],
      lucky2: pad2(Math.floor(Math.random() * 100)),
      lucky3: pad3(Math.floor(Math.random() * 1000)),
    };
  }

  getFestival(month: number, day: number): number {
    const m = month | 0;
    const d = day | 0;
    if (m === 4) return 1;
    if (m === 10) return 2;
    if (m === 11) return 3;
    if ((m === 1 && d >= 15) || m === 2) return 4;
    if ((m === 12 && d >= 20) || (m === 1 && d < 15)) return 5;
    return 0;
  }

  festivalInfo(id: number): FestivalInfo {
    const idx = id | 0;
    if (idx < 0 || idx > 5) {
      throw Object.assign(new Error("Invalid festival id: must be between 0 and 5"), { code: -1 });
    }
    return {
      name: FESTIVAL_NAMES[idx],
      tagline: FESTIVAL_TAGS[idx],
    };
  }

  drawFestivalBlessing(id: number): BlessingResult {
    const idx = id | 0;
    if (idx < 0 || idx > 5) {
      throw Object.assign(new Error("Invalid festival id: must be between 0 and 5"), { code: -1 });
    }
    const item = FESTIVAL_BLESSING_SETS[idx][0];
    const lucky = pad2(Math.floor(Math.random() * 100));
    const res: BlessingResult = {
      title: item.title,
      text: item.text,
      lucky,
    };
    if (idx === 4) {
      res.angpao = ANGPAO_VALS[Math.floor(Math.random() * ANGPAO_VALS.length)];
    }
    return res;
  }

  processDigitalOffering(type: number, text: string): OfferingResult {
    const tIdx = type | 0;
    if (tIdx < 0 || tIdx > 5) {
      throw Object.assign(new Error("Invalid offering type: must be between 0 and 5"), { code: -1 });
    }
    const OFFER_NAMES = ["จุดเทียน", "ลอยโคม", "ถวายธูปดอกไม้", "สาดน้ำสงกรานต์", "ลอยกระทง", "อั่งเปา"];
    const offering = OFFER_NAMES[tIdx];
    const CARE_WORDS = ["ฆ่าตัวตาย", "อยากตาย", "ทำร้ายตัวเอง", "ไม่อยากมีชีวิต", "จบชีวิต"];
    const t = (text || "").slice(0, 1000);
    for (const w of CARE_WORDS) {
      if (t.includes(w)) {
        return {
          offering,
          care: true,
          message:
            "ขอบคุณที่ไว้ใจเล่าออกมา ความเจ็บปวดนี้เป็นเรื่องจริง และคุณไม่ต้องแบกมันอยู่คนเดียว " +
            "ถ้าคุณกำลังคิดทำร้ายตัวเอง โปรดโทรสายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง) หรือบอกคนที่ไว้ใจให้มาอยู่ด้วยตอนนี้ " +
            "หากอยู่ในอันตรายเฉียบพลันโทร 1669",
        };
      }
    }

    const KW = [
      ["เงิน", "หนี้", "ลงทุน", "จน", "รวย", "ค่าใช้จ่าย", "การเงิน"],
      ["รัก", "แฟน", "คู่", "เลิก", "หัวใจ", "คิดถึง", "อกหัก"],
      ["ป่วย", "สุขภาพ", "โรค", "เจ็บ", "ปวด", "เหนื่อย", "นอนไม่หลับ"],
      ["งาน", "เจ้านาย", "เรียน", "สอบ", "ลูกค้า", "เพื่อนร่วมงาน", "ลาออก"],
    ];

    let best = 4;
    let bestc = 0;
    for (let g = 0; g < 4; g++) {
      let c = 0;
      for (const k of KW[g]) {
        if (t.includes(k)) c++;
      }
      if (c > bestc) {
        bestc = c;
        best = g;
      }
    }

    const CATS = ["การเงิน", "ความรัก", "สุขภาพ", "การงาน", "ทั่วไป"];
    const zodIndex = this.valid ? this.z : Math.floor(Math.random() * ZOD_LIST.length);

    return {
      offering,
      care: false,
      category: CATS[best],
      message: OFFERING_GUIDE_SETS[best][0],
      merit: Math.min(99, Math.max(10, Math.floor(t.length / 5) * 10 || 10)),
      lucky: pad2(Math.floor(Math.random() * 100)),
      color: ZOD_LIST[zodIndex].color,
    };
  }

  processImageScan(rgba: Uint8ClampedArray | Uint8Array, mode: number): ImageScanResult {
    const m = mode | 0;
    if (!rgba || rgba.length < 16 || rgba.length > 1024 * 1024 || (m !== 0 && m !== 1)) {
      throw Object.assign(new Error("Invalid image scan input"), { code: -1 });
    }
    const len = rgba.length;
    const n = Math.floor(len / 4);
    let sr = 0;
    let sg = 0;
    let sb = 0;
    let edge = 0;
    let prev = -1;
    for (let i = 0; i < n; i++) {
      const r = rgba[i * 4];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      sr += r;
      sg += g;
      sb += b;
      const lum = Math.floor((r * 30 + g * 59 + b * 11) / 100);
      if (prev >= 0) edge += Math.abs(lum - prev);
      prev = lum;
    }
    const mr = Math.floor(sr / n);
    const mg = Math.floor(sg / n);
    const mb = Math.floor(sb / n);
    const me = Math.floor(edge / n);

    const pxBytes = rgba instanceof Uint8Array ? rgba : new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength);
    let h = fnvBytes(pxBytes, FNV_OFF);
    if (this.valid) h ^= this.sessionHash;
    h = (h * FNV_PRIME) & MASK64;

    const ELEMENTS = ["ไฟ", "ดิน", "โลหะ", "น้ำ", "ไม้"];
    const readingElemIdx = [3, 4, 0, 1, 2]; // Map Wasm ELEM index -> IMAGE_SCAN_READINGS element index

    const el = (mr * 3 + mg * 5 + mb * 7 + me * 11 + Number(h & 0xFFn)) % 5;
    const score5 = (k: number) => 1 + Number(((h >> BigInt(8 * k)) & 0xFFn) % 5n);
    const fp = Number((h >> 16n) & 0xFFFFFFFFn).toString(16).toUpperCase().padStart(8, "0");

    return {
      element: ELEMENTS[el],
      fingerprint: fp,
      scores: {
        wealth: score5(0),
        love: score5(1),
        health: score5(2),
        career: score5(3),
      },
      reading: IMAGE_SCAN_READINGS[m][readingElemIdx[el]][0],
    };
  }

  processSignature(points: [number, number, number][]): SignatureResult {
    if (!points || points.length < 8 || points.length > 20000) {
      throw Object.assign(new Error("Invalid signature points: length must be between 8 and 20000"), { code: -1 });
    }
    const n = points.length;
    let minx = 1 << 30;
    let maxx = -(1 << 30);
    let miny = 1 << 30;
    let maxy = -(1 << 30);
    let strokes = 0;
    let lastS = -1;
    let px = 0;
    let py = 0;
    let pdx = 0;
    let pdy = 0;
    let rev = 0;
    let segs = 0;
    let h = this.valid ? this.sessionHash : FNV_OFF;

    for (let i = 0; i < n; i++) {
      const x = points[i][0] | 0;
      const y = points[i][1] | 0;
      const s = points[i][2] | 0;
      if (x < minx) minx = x;
      if (x > maxx) maxx = x;
      if (y < miny) miny = y;
      if (y > maxy) maxy = y;
      if (s !== lastS) {
        strokes++;
        lastS = s;
      } else {
        const dx = x - px;
        const dy = y - py;
        if (dx || dy) {
          if (segs > 0 && dx * pdx + dy * pdy < 0) rev++;
          pdx = dx;
          pdy = dy;
          segs++;
        }
      }
      px = x;
      py = y;
      h = fnvInt32(x, h);
      h = fnvInt32(y, h);
    }

    const w = maxx - minx;
    const ht = maxy - miny;
    const big = w > ht ? w : ht;
    const size = big > 600 ? 2 : big < 250 ? 0 : 1;
    const net = (points[0][1] | 0) - (points[n - 1][1] | 0);
    const rise = ht > 20 && net * 4 > ht ? 2 : ht > 20 && -net * 4 > ht ? 0 : 1;
    const jag = segs > 0 ? Math.floor((rev * 100) / segs) : 0;
    const jc = jag > 35 ? 2 : jag < 15 ? 0 : 1;

    const bit0 = Number((h >> 3n) & 1n);
    const bit1 = Number((h >> 11n) & 1n);
    const bit2 = Number((h >> 19n) & 1n);
    const bit3 = Number((h >> 27n) & 1n);
    const wealth = Math.min(5, 2 + (rise === 2 ? 1 : 0) + (size === 2 ? 1 : 0) + bit0);
    const love = Math.min(5, 2 + (jc === 0 ? 1 : 0) + (strokes <= 2 ? 1 : 0) + bit1);
    const career = Math.min(5, 2 + (rise === 2 ? 1 : 0) + (jc === 1 ? 1 : 0) + (strokes >= 3 ? 1 : 0) + bit2);
    const luck = Math.min(5, 2 + bit3 + (size === 1 ? 1 : 0) + (jc < 2 ? 1 : 0));

    return {
      strokes,
      traits: [
        SIGNATURE_TRAIT_SETS.size[size][0],
        SIGNATURE_TRAIT_SETS.rise[rise][0],
        SIGNATURE_TRAIT_SETS.jagged[jc][0],
      ],
      scores: { wealth, love, career, luck },
    };
  }
}

// -----------------------------------------------------------------------------
// Bridge Class Definition
// -----------------------------------------------------------------------------
export class Bridge {
  private engine: ICoreEngine;
  private curDateParts: CalendarDateParts = getCalendarDateParts();
  private birthYear = 2000;
  private zodiac = 4;
  private userName = "";

  private constructor(engine: ICoreEngine) {
    this.engine = engine;
  }

  static async load(): Promise<Bridge> {
    try {
      if (typeof fetch !== "function") {
        throw new Error("fetch is unavailable in this environment");
      }
      const metaEnv = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env;
      const base = metaEnv?.BASE_URL || "./";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const wasmUrl = `${normalizedBase}wasm/core.wasm`;

      const response = await fetch(wasmUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${wasmUrl}`);
      }

      let instance: WebAssembly.Instance;
      const contentType = response.headers.get("content-type") || "";
      if (
        typeof WebAssembly.instantiateStreaming === "function" &&
        contentType.includes("application/wasm")
      ) {
        const result = await WebAssembly.instantiateStreaming(response, {});
        instance = result.instance;
      } else {
        const bytes = await response.arrayBuffer();
        const result = await WebAssembly.instantiate(bytes, {});
        instance = result.instance;
      }

      logger.info("Loaded WebAssembly Divination Core successfully");
      return new Bridge(new WasmCoreEngine(instance));
    } catch (err) {
      logger.warn("WebAssembly load failed or disabled, falling back to Pure TS Core Engine:", err);
      return new Bridge(new JsCoreEngine());
    }
  }

  static async fromBytes(bytes: Uint8Array): Promise<Bridge> {
    try {
      const wasmBytes =
        bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
          ? bytes
          : bytes.slice();
      const result: unknown = await WebAssembly.instantiate(wasmBytes as BufferSource, {});
      const instance = (result && typeof result === 'object' && 'instance' in result)
        ? (result as { instance: WebAssembly.Instance }).instance
        : (result as WebAssembly.Instance);
      return new Bridge(new WasmCoreEngine(instance));
    } catch {
      return new Bridge(new JsCoreEngine());
    }
  }

  getWeeklySetIndex(): number {
    return getWeeklyProphecySetIndex(this.curDateParts);
  }

  getPeriodLucky(): UnifiedLuckyNumbers {
    return getPeriodUnifiedLuckyNumbers({
      date: this.curDateParts,
      birthYear: this.birthYear,
      zodiac: this.zodiac,
      userName: this.userName,
    });
  }

  version(): number {
    return this.engine.version();
  }

  setDate(date: Date = new Date()): void {
    this.curDateParts = getCalendarDateParts(date);
    try {
      this.engine.setDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    } catch (err) {
      logger.warn("Failed to set engine date:", err);
    }
  }

  initSession(name: string, birthYear: number, zodiac: number = -1): number {
    const res = this.engine.initSession(name, birthYear, zodiac);
    if (res >= 0) {
      let by = birthYear | 0;
      if (by > 2400) by -= 543;
      this.birthYear = by;
      this.zodiac = res;
      this.userName = (name || "").trim();
    }
    return res;
  }

  zodiacInfo(zodiac: number = -1): ZodiacInfo {
    return this.engine.getZodiacInfo(zodiac);
  }

  drawStick(power: number): StickResult {
    const res = this.engine.drawSiameseSticks(power);
    const setIdx = this.getWeeklySetIndex();
    const stickIdx = clamp(res.stick - 1, 0, STICK_VERSE_SETS.length - 1);
    const levelIdx = clamp(res.level, 0, STICK_ASPECT_SETS.length - 1);
    return {
      ...res,
      verse: STICK_VERSE_SETS[stickIdx]?.[setIdx] ?? res.verse,
      aspects: res.aspects.map((aspect, idx) => ({
        name: aspect.name,
        text: STICK_ASPECT_SETS[levelIdx]?.[idx]?.[setIdx] ?? aspect.text,
      })),
    };
  }

  drawTarot(count: number): TarotResult {
    const res = this.engine.drawTarotCards(count);
    const setIdx = this.getWeeklySetIndex();
    return {
      cards: res.cards.map((card) => {
        const meaningSet = TAROT_MEANING_SETS[card.id]?.[setIdx];
        if (!meaningSet) return card;
        return {
          ...card,
          meaning: card.reversed ? meaningSet.rev : meaningSet.up,
        };
      }),
    };
  }

  luckyNumbers(category: number): LuckyNumbersResult {
    const cat = category | 0;
    const res = this.engine.generateLuckyNumbers(cat);
    const unified = this.getPeriodLucky();
    const out: LuckyNumbersResult = {
      note: res.note,
    };
    if (cat === 0 || cat === 2) {
      out.two = [...unified.two];
    }
    if (cat === 1 || cat === 2) {
      out.three = [...unified.three];
    }
    if (cat === 2) {
      out.run = [...unified.run];
    }
    return out;
  }

  badLuckRemedy(zodiac: number, problem: number): RemedyResult {
    const res = this.engine.calculateBadLuckRemedy(zodiac, problem);
    const setIdx = this.getWeeklySetIndex();
    const safeRel = clamp(res.relation, 0, REMEDY_SUMMARY_SETS.length - 1);
    const safeProb = clamp(problem | 0, 0, REMEDY_PRACTICAL_SETS.length - 1);
    return {
      ...res,
      summary: REMEDY_SUMMARY_SETS[safeRel]?.[setIdx] ?? res.summary,
      practical: REMEDY_PRACTICAL_SETS[safeProb]?.[setIdx] ?? res.practical,
      merit: REMEDY_MERIT_SETS[safeProb]?.[setIdx] ?? res.merit,
      mantra: [...(REMEDY_MANTRA_SETS[setIdx] ?? res.mantra)],
    };
  }

  candleUnlock(holdMs: number): CandleResult {
    const res = this.engine.candleUnlock(holdMs);
    if (!res.unlocked) {
      return res;
    }
    const setIdx = this.getWeeklySetIndex();
    const unified = this.getPeriodLucky();
    const candleSet = CANDLE_PROPHECY_SETS[setIdx];
    return {
      ...res,
      dedication: candleSet?.dedication ?? res.dedication,
      mantra: candleSet ? [...candleSet.mantra] : res.mantra,
      lucky2: unified.primary2,
      lucky3: unified.primary3,
    };
  }

  getFestival(month: number, day: number): number {
    return this.engine.getFestival(month, day);
  }

  festivalInfo(id: number): FestivalInfo {
    return this.engine.festivalInfo(id);
  }

  drawBlessing(id: number): BlessingResult {
    const res = this.engine.drawFestivalBlessing(id);
    const setIdx = this.getWeeklySetIndex();
    const unified = this.getPeriodLucky();
    const safeId = clamp(id | 0, 0, FESTIVAL_BLESSING_SETS.length - 1);
    const bSet = FESTIVAL_BLESSING_SETS[safeId]?.[setIdx];
    return {
      ...res,
      title: bSet?.title ?? res.title,
      text: bSet?.text ?? res.text,
      lucky: unified.primary2,
    };
  }

  digitalOffering(type: number, text: string): OfferingResult {
    const res = this.engine.processDigitalOffering(type, text);
    if (res.care) {
      return res;
    }
    const OFFER_CATS = ["การเงิน", "ความรัก", "สุขภาพ", "การงาน", "ทั่วไป"];
    const catIdx = Math.max(0, OFFER_CATS.indexOf(res.category ?? "ทั่วไป"));
    const setIdx = this.getWeeklySetIndex();
    const unified = this.getPeriodLucky();
    return {
      ...res,
      message: OFFERING_GUIDE_SETS[catIdx]?.[setIdx] ?? res.message,
      lucky: unified.primary2,
    };
  }

  imageScan(rgba: Uint8ClampedArray | Uint8Array, mode: number): ImageScanResult {
    const res = this.engine.processImageScan(rgba, mode);
    const ELEMENTS = ["โลหะ", "น้ำ", "ไม้", "ไฟ", "ดิน"];
    const elemIdx = Math.max(0, ELEMENTS.indexOf(res.element));
    const setIdx = this.getWeeklySetIndex();
    return {
      ...res,
      reading: IMAGE_SCAN_READINGS[mode | 0]?.[elemIdx]?.[setIdx] ?? res.reading,
    };
  }

  signature(points: [number, number, number][]): SignatureResult {
    const res = this.engine.processSignature(points);
    const n = points.length;
    let minx = 1 << 30;
    let maxx = -(1 << 30);
    let miny = 1 << 30;
    let maxy = -(1 << 30);
    let lastS = -1;
    let px = 0;
    let py = 0;
    let pdx = 0;
    let pdy = 0;
    let rev = 0;
    let segs = 0;

    for (let i = 0; i < n; i++) {
      const x = points[i][0] | 0;
      const y = points[i][1] | 0;
      const s = points[i][2] | 0;
      if (x < minx) minx = x;
      if (x > maxx) maxx = x;
      if (y < miny) miny = y;
      if (y > maxy) maxy = y;
      if (s !== lastS) {
        lastS = s;
      } else {
        const dx = x - px;
        const dy = y - py;
        if (dx || dy) {
          if (segs > 0 && dx * pdx + dy * pdy < 0) rev++;
          pdx = dx;
          pdy = dy;
          segs++;
        }
      }
      px = x;
      py = y;
    }

    const w = maxx - minx;
    const ht = maxy - miny;
    const big = w > ht ? w : ht;
    const size = big > 600 ? 2 : big < 250 ? 0 : 1;
    const net = (points[0][1] | 0) - (points[n - 1][1] | 0);
    const rise = ht > 20 && net * 4 > ht ? 2 : ht > 20 && -net * 4 > ht ? 0 : 1;
    const jag = segs > 0 ? Math.floor((rev * 100) / segs) : 0;
    const jc = jag > 35 ? 2 : jag < 15 ? 0 : 1;

    const setIdx = this.getWeeklySetIndex();
    return {
      ...res,
      traits: [
        SIGNATURE_TRAIT_SETS.size[size][setIdx],
        SIGNATURE_TRAIT_SETS.rise[rise][setIdx],
        SIGNATURE_TRAIT_SETS.jagged[jc][setIdx],
      ],
    };
  }

  // Alias methods for component compatibility
  blessing(id: number): BlessingResult {
    return this.drawBlessing(id);
  }

  festival(month: number, day: number): number {
    return this.getFestival(month, day);
  }

  seed(a = Math.random() * 1000000, b = Date.now(), c = Math.random() * 1000000, d = Math.random() * 1000000): void {
    this.engine.seedEntropy(a | 0, b | 0, c | 0, d | 0);
  }

  candle(holdMs: number): CandleResult {
    return this.candleUnlock(holdMs);
  }

  offering(type: number, text: string): OfferingResult {
    return this.digitalOffering(type, text);
  }

  remedy(zodiac: number, problem: number): RemedyResult {
    return this.badLuckRemedy(zodiac, problem);
  }
}
