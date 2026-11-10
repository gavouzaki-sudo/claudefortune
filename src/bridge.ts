// Thin bridge between TypeScript and the divination core.
// Supports both WebAssembly (wasm/core.c) and an embedded 100% pure TypeScript engine
// to ensure zero preview or runtime failures across all browser sandboxes and CSP environments.

import { CORE_WASM_BASE64 } from "./wasm/coreWasmBytes";
import { logger } from "./utils/logger";
import { pad2, pad3, clamp } from "./utils/formatters";
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
  { name: "ชวด", animal: "หนู", color: "ดำสนิท", dir: "ทิศเหนือ" },
  { name: "ฉลู", animal: "วัว", color: "เหลืองทอง", dir: "ทิศตะวันออกเฉียงเหนือ" },
  { name: "ขาล", animal: "เสือ", color: "เขียวสด", dir: "ทิศตะวันออกเฉียงเหนือ" },
  { name: "เถาะ", animal: "กระต่าย", color: "ฟ้าคราม", dir: "ทิศตะวันออก" },
  { name: "มะโรง", animal: "มังกร/งูใหญ่", color: "ทองคำ", dir: "ทิศตะวันออกเฉียงใต้" },
  { name: "มะเส็ง", animal: "งูเล็ก", color: "ส้มแสด", dir: "ทิศตะวันออกเฉียงใต้" },
  { name: "มะเมีย", animal: "ม้า", color: "แดงสด", dir: "ทิศใต้" },
  { name: "มะแม", animal: "แพะ", color: "เหลือง", dir: "ทิศตะวันตกเฉียงใต้" },
  { name: "วอก", animal: "ลิง", color: "ขาว", dir: "ทิศตะวันตก" },
  { name: "ระกา", animal: "ไก่", color: "ขาวทอง", dir: "ทิศตะวันตก" },
  { name: "จอ", animal: "สุนัข", color: "ส้มอ่อน", dir: "ทิศตะวันตกเฉียงเหนือ" },
  { name: "กุน", animal: "หมู", color: "ฟ้าน้ำทะเล", dir: "ทิศเหนือ" },
];

const STICKS = [
  { level: 0, title: "มังกรทะยานฟ้า", verse: "ลมหนุนส่งใจที่มั่น ฟ้ารอรับความตั้งใจ" },
  { level: 1, title: "ตะวันพ้นหมอก", verse: "เมฆบังผ่านไปแล้ว แสงสว่างรออยู่เบื้องหน้า" },
  { level: 2, title: "สะพานข้ามสายน้ำ", verse: "ก้าวทีละก้าวอย่างระวัง ฝั่งโน้นอยู่ไม่ไกล" },
  { level: 1, title: "ต้นไม้ผลิดอก", verse: "ปลูกไว้ด้วยใจอดทน วันนี้เริ่มเห็นผลงาม" },
  { level: 2, title: "เรือฝ่าคลื่นลม", verse: "คลื่นใหญ่ย่อมผ่านพ้น หากมือจับหางเสือมั่น" },
  { level: 2, title: "เทียนไหวในลมเบา", verse: "ไฟเล็กให้แสงนำทาง อย่าให้ใจหวั่นไหว" },
  { level: 0, title: "หงส์ฟ้ากางปีก", verse: "ความดีสะสมมานาน กำลังออกผลสู่โลก" },
  { level: 2, title: "ภูเขาหมอกคลุม", verse: "ทางข้างหน้ายังไม่ชัด รอให้หมอกจางก่อนก้าว" },
  { level: 1, title: "นกน้อยรังใหม่", verse: "เริ่มจากสิ่งเล็ก ค่อยๆ สร้างค่อยๆ มั่นคง" },
  { level: 2, title: "กระต่ายใต้จันทร์", verse: "อย่าหลงแสงเงาลวง ถามใจตนเองให้ชัด" },
  { level: 3, title: "ฝนแล้งรอเมฆ", verse: "ความขาดแคลนเพียงชั่วคราว ประหยัดไว้รอวันฝน" },
  { level: 0, title: "ดอกบัวพ้นโคลน", verse: "ผ่านความยากมาแล้ว งามสง่าเหนือน้ำนิ่ง" },
  { level: 1, title: "ทองคำในธารทราย", verse: "ของมีค่ารออยู่ใกล้ตัว ขยันค้นหาจะพบ" },
  { level: 1, title: "ระฆังยามเช้า", verse: "เสียงใสปลุกความหวัง วันใหม่เหมาะแก่การเริ่ม" },
  { level: 0, title: "ม้าเร็วบนทางโล่ง", verse: "จังหวะดีให้รีบคว้า แต่อย่าลืมมองทาง" },
  { level: 3, title: "ฟ้าครึ้มก่อนฝน", verse: "เตรียมร่มไว้ล่วงหน้า พายุผ่านแล้วฟ้าสดใส" },
  { level: 3, title: "ประตูปิดสนิท", verse: "อย่าฝืนผลักให้เหนื่อย รอเวลาเปิดเองดีกว่า" },
  { level: 1, title: "เกลียวคลื่นสู่ฝั่ง", verse: "ความพยายามไม่สูญเปล่า ทุกคลื่นพาใกล้ฝั่ง" },
  { level: 0, title: "ปลาคาร์ปข้ามประตูมังกร", verse: "อดทนทวนกระแส ผลสุดท้ายคือความสำเร็จ" },
  { level: 1, title: "ลานวัดยามเย็น", verse: "ใจสงบเป็นทรัพย์ ความสุขอยู่ที่ความพอดี" },
  { level: 3, title: "กิ่งหักกลางลม", verse: "สิ่งไม่จำเป็นหลุดไป เพื่อให้ต้นแข็งแรงขึ้น" },
  { level: 3, title: "เมฆดำเหนือทุ่งนา", verse: "งานหนักยังไม่จบ ระวังพลาดเพราะรีบร้อน" },
  { level: 2, title: "สะพานไม้เก่า", verse: "ก่อนเดินต้องตรวจให้แน่ แล้วจึงข้ามอย่างช้าๆ" },
  { level: 1, title: "ลมใต้ปีกนก", verse: "มีผู้ช่วยหนุนเสริม รับน้ำใจและตอบแทนเขา" },
  { level: 0, title: "ดาวเหนือนำทาง", verse: "เป้าหมายชัดเจน ย่อมไม่หลงทิศแม้ฟ้ามืด" },
  { level: 1, title: "แสงทองยามรุ่ง", verse: "วันใหม่มาพร้อมโอกาส ลุกขึ้นรับด้วยใจเบิกบาน" },
  { level: 2, title: "เงาในกระจกน้ำ", verse: "ตรึกตรองก่อนตัดสินใจ สิ่งที่เห็นอาจไม่ใช่ทั้งหมด" },
  { level: 2, title: "ทางแยกในป่า", verse: "เลือกทางด้วยข้อมูลและใจที่สงบ ไม่ต้องรีบ" },
];

const LEVEL_NAMES = ["ดีเยี่ยม", "ดี", "ปานกลาง", "ควรระวัง"];
const ASPECT_NAMES = ["การเงิน", "ความรัก", "สุขภาพ", "การงาน"];

const STICK_TEXT: string[][][] = [
  [
    ["โชคลาภเปิดทาง รายได้เข้าจากหลายทาง ควรเก็บออมส่วนหนึ่งไว้ด้วย", "การลงทุนที่ศึกษามาดีให้ผลงาม แต่อย่าลืมกระจายความเสี่ยง", "มีผู้ใหญ่หรือเพื่อนอุปถัมภ์ด้านเงิน ตอบแทนด้วยน้ำใจจะยิ่งเจริญ"],
    ["คนโสดมีโอกาสพบคนถูกใจ คนมีคู่ความสัมพันธ์หวานชื่น", "ความรักมั่นคง ถึงเวลาพูดคุยเรื่องอนาคตร่วมกัน", "คนเก่าหรือเพื่อนเก่ากลับมาทักทาย ใช้ความจริงใจนำทาง"],
    ["สุขภาพแข็งแรง พลังงานดี เหมาะกับการเริ่มออกกำลังกายสม่ำเสมอ", "ร่างกายฟื้นตัวไว ใจสบาย นอนหลับพักผ่อนได้ดี", "สุขภาพโดยรวมดีมาก ยังควรตรวจร่างกายประจำปีตามปกติ"],
    ["งานก้าวหน้า มีโอกาสได้รับความไว้วางใจให้ดูแลเรื่องสำคัญ", "ไอเดียใหม่ได้รับการยอมรับ กล้านำเสนอได้เลย", "ความอุตสาหะที่ผ่านมาเริ่มออกผล ผู้บริหารมองเห็นผลงาน"],
  ],
  [
    ["การเงินราบรื่น มีรายรับสม่ำเสมอ ใช้จ่ายอย่างมีแผนจะเหลือเก็บ", "มีโอกาสรายได้เสริมเล็กๆ น้อยๆ อย่ารีบร้อนตัดสินใจ", "เงินที่ค้างอยู่มีแนวโน้มได้คืน ติดตามด้วยท่าทีสุภาพ"],
    ["ความสัมพันธ์ดี ใส่ใจกันในเรื่องเล็กๆ จะยิ่งแน่นแฟ้น", "มีโอกาสทำความรู้จักคนใหม่ผ่านกิจกรรมหรือเพื่อนแนะนำ", "ความเข้าใจกันเพิ่มขึ้น ถ้าเปิดใจรับฟังก่อนพูด"],
    ["สุขภาพดีโดยรวม รักษาเวลานอนและดื่มน้ำให้พอ", "มีอาการเล็กน้อยหายได้เองหากพักผ่อนเพียงพอ", "การเดินและยืดเส้นช่วยให้สดชื่นขึ้นมาก"],
    ["งานดำเนินไปตามแผน มีผู้ช่วยเหลือเมื่อต้องการ", "ได้โอกาสเรียนรู้สิ่งใหม่ที่เป็นประโยชน์ต่อสายงาน", "ผลงานค่อยๆ สะสม ความสม่ำเสมอคือกุญแจ"],
  ],
  [
    ["รายรับรายจ่ายพอดีตัว ยังไม่ควรลงทุนเสี่ยงสูงหรือกู้เพิ่ม", "ทบทวนค่าใช้จ่ายประจำ ตัดสิ่งไม่จำเป็นจะช่วยได้มาก", "เงินมาช้าแต่มา อดทนและรอจังหวะที่เหมาะ"],
    ["ความรักอยู่ในช่วงนิ่งๆ ให้เวลากับกันและกันมากขึ้น", "อย่าเพิ่งด่วนสรุปความรู้สึก รอให้ใจชัดเจนก่อน", "คนโสดควรโฟกัสที่ตัวเองก่อน จังหวะดีจะมาเอง"],
    ["ระวังความเหนื่อยสะสมและการนอนไม่พอ", "ควรปรับเรื่องอาหารและการขยับร่างกายให้สม่ำเสมอ", "อย่าละเลยอาการเล็กน้อย ถ้าเป็นต่อเนื่องควรพบแพทย์"],
    ["งานมีอุปสรรคเล็กน้อย แก้ได้ด้วยการสื่อสารให้ชัดเจน", "ช่วงนี้เหมาะกับการวางแผนมากกว่าการเปลี่ยนแปลงใหญ่", "อย่ารับงานเกินกำลัง จัดลำดับความสำคัญให้ดี"],
  ],
  [
    ["ระวังรายจ่ายฉุกเฉินและการค้ำประกันหรือให้ยืมเงิน", "งดการเสี่ยงโชคและการลงทุนที่ไม่เข้าใจ ตรวจสัญญาให้รอบคอบ", "ควรมีเงินสำรองและระวังกลโกงออนไลน์"],
    ["ระวังคำพูดที่ทำร้ายกัน ใช้เวลาให้ใจเย็นลงก่อนคุยเรื่องใหญ่", "ความเข้าใจผิดอาจเกิดขึ้น ตรวจสอบข้อเท็จจริงก่อนตัดสินใจ", "อย่าเพิ่งตัดสินใจเรื่องใหญ่ในอารมณ์ รอให้ใจสงบ"],
    ["ควรพักผ่อนให้มากและตรวจสุขภาพ อย่าฝืนร่างกาย", "ระวังอุบัติเหตุจากการเดินทางและความเหนื่อยล้า", "ดูแลสุขภาพใจควบคู่กับกาย พูดคุยกับคนที่ไว้ใจได้"],
    ["ระวังความผิดพลาดจากความเร่งรีบ ตรวจงานซ้ำก่อนส่ง", "อาจมีแรงเสียดทานในที่ทำงาน ตั้งสติและบันทึกข้อตกลงเป็นลายลักษณ์อักษร", "เลี่ยงการตัดสินใจเปลี่ยนงานทันที ประเมินให้รอบด้านก่อน"],
  ],
];

const TAROT_CARDS = [
  { th: "ผู้เริ่มต้น", en: "The Fool", up: "เริ่มต้นสิ่งใหม่ กล้าลองอย่างมีสติ", rev: "ประมาทหรือขาดการวางแผน ชะลอแล้วทบทวน" },
  { th: "จอมเวท", en: "The Magician", up: "มีทรัพยากรครบ ลงมือได้เลย", rev: "ขาดโฟกัสหรือใช้ความสามารถไม่ตรงทาง" },
  { th: "สตรีนักบวช", en: "The High Priestess", up: "ฟังสัญชาตญาณ ความลับกำลังเผยทีละน้อย", rev: "ข้อมูลยังไม่ครบ อย่าเพิ่งสรุป" },
  { th: "จักรพรรดินี", en: "The Empress", up: "ความอุดมสมบูรณ์ ความเมตตา และการเติบโต", rev: "พึ่งพาผู้อื่นมากไปหรือลืมดูแลตัวเอง" },
  { th: "จักรพรรดิ", en: "The Emperor", up: "ระเบียบ ความมั่นคง ภาวะผู้นำ", rev: "ดื้อรั้นหรือเข้มงวดเกินไป ลองผ่อนปรน" },
  { th: "ผู้สอนธรรม", en: "The Hierophant", up: "คำแนะนำจากผู้ใหญ่ ประเพณี และแบบแผนที่ดี", rev: "ฝืนกรอบหรือไม่ฟังใคร ลองเปิดรับมุมมองอื่น" },
  { th: "คู่รัก", en: "The Lovers", up: "ความรักและการเลือกที่ตรงกับหัวใจ", rev: "ลังเลหรือความไม่ลงรอย ต้องพูดคุยให้ชัด" },
  { th: "รถศึก", en: "The Chariot", up: "ชัยชนะจากความมุ่งมั่นและวินัย", rev: "หลงทิศหรือควบคุมอารมณ์ไม่อยู่" },
  { th: "พลัง", en: "Strength", up: "ความกล้าหาญอย่างอ่อนโยน ใจเย็นชนะทุกสิ่ง", rev: "สงสัยในตัวเอง ต้องการกำลังใจ" },
  { th: "ฤๅษี", en: "The Hermit", up: "เวลาทบทวนตัวเอง ความสงบนำปัญญา", rev: "โดดเดี่ยวเกินไป ลองติดต่อคนที่ไว้ใจ" },
  { th: "กงล้อโชคชะตา", en: "Wheel of Fortune", up: "จังหวะชีวิตกำลังเปลี่ยนไปในทางที่ดี", rev: "ติดขัดชั่วคราว วงล้อจะหมุนต่อไป" },
  { th: "ความยุติธรรม", en: "Justice", up: "ความจริงและความสมดุล การตัดสินใจที่เป็นธรรม", rev: "ความไม่เป็นธรรมหรือการเลี่ยงความรับผิดชอบ" },
  { th: "ผู้ถูกแขวน", en: "The Hanged Man", up: "หยุดและมองมุมใหม่ ยอมปล่อยเพื่อได้มากกว่า", rev: "ยื้อโดยไม่เกิดประโยชน์ ถึงเวลาตัดสินใจ" },
  { th: "การเปลี่ยนผ่าน", en: "Death", up: "จบสิ่งเก่าเพื่อเริ่มสิ่งใหม่ ไม่ได้หมายถึงความตายจริง", rev: "ต่อต้านการเปลี่ยนแปลง ปล่อยวางจะเบาขึ้น" },
  { th: "ความพอดี", en: "Temperance", up: "สมดุล อดทน ผสมผสานอย่างลงตัว", rev: "มากหรือน้อยเกินพอดี กลับมาหาทางสายกลาง" },
  { th: "พันธนาการ", en: "The Devil", up: "ระวังความยึดติดและนิสัยที่ผูกมัดตัวเอง", rev: "เริ่มหลุดจากพันธนาการ ได้อิสระคืนมา" },
  { th: "หอคอย", en: "The Tower", up: "การเปลี่ยนแปลงฉับพลันที่ทำลายของเก่าที่ไม่มั่นคง", rev: "ฝืนเลี่ยงการเปลี่ยนแปลง ผลกระทบยังค้างอยู่" },
  { th: "ดวงดาว", en: "The Star", up: "ความหวังและการเยียวยา แสงสว่างปลายทาง", rev: "ความหวังริบหรี่ ต้องเติมศรัทธาให้ตัวเอง" },
  { th: "ดวงจันทร์", en: "The Moon", up: "ความไม่แน่นอนและความกลัวที่เงาหลอก", rev: "ความจริงเริ่มกระจ่าง ความกลัวจางลง" },
  { th: "ดวงอาทิตย์", en: "The Sun", up: "ความสุข ความสำเร็จ และพลังบวก", rev: "ความสุขมาช้ากว่าที่คิด แต่ยังอยู่ใกล้" },
  { th: "การตื่นรู้", en: "Judgement", up: "ถึงเวลาตื่นรู้และตัดสินใจครั้งสำคัญ", rev: "ลังเลหรือวิพากษ์ตัวเองหนักเกินไป" },
  { th: "โลก", en: "The World", up: "สำเร็จครบวงจร ได้รับสิ่งที่ตั้งใจ", rev: "ใกล้เสร็จแล้วแต่ยังขาดอีกขั้นหนึ่ง" },
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

const BLESSINGS: [string, string][][] = [
  [
    ["พรประจำวัน", "ขอให้วันนี้ใจเบา ทำสิ่งเล็กๆ ให้ดีที่สุด แล้วโชคจะตามมาเอง"],
    ["ธูปหนึ่งดอก", "ความตั้งใจที่ซื่อตรงคือเครื่องบูชาที่ดีที่สุด"],
    ["ใจสงบเป็นทรัพย์", "ขอให้พบความสงบกลางความวุ่นวายและเห็นทางออกชัดเจน"],
  ],
  [
    ["น้ำใสใจสบาย", "น้ำที่รดวันนี้ชะล้างเรื่องหนักใจปีเก่า ปีใหม่ขอให้เย็นกายสบายใจ การเงินไหลคล่องเหมือนสายน้ำ"],
    ["สาดน้ำเรียกโชค", "ปีใหม่ไทยนี้มีเกณฑ์พบผู้ใหญ่ใจดีช่วยเหลือ ขอให้เดินทางปลอดภัยและพบแต่คนน้ำใจงาม"],
    ["รดน้ำขอพร", "ขอให้ผู้ใหญ่อวยพร ครอบครัวพร้อมหน้า สุขภาพแข็งแรง และเริ่มสิ่งใหม่ได้ราบรื่น"],
  ],
  [
    ["คำสาปกลายเป็นพร", "ความกลัวที่ซ่อนอยู่กำลังสลายตามแสงจันทร์ ผู้ที่กล้าเผชิญสิ่งที่หลบหนีจะได้ของขวัญกลับมา"],
    ["หีบสมบัติแวมไพร์", "ของมีค่ารออยู่ในที่ที่ไม่มีใครกล้ามอง ลองกลับไปสะสางเรื่องค้างคา ผลที่ได้อาจเกินคาด"],
    ["เงาแห่งเที่ยงคืน", "เงาของคุณแค่ตามหาความจริง ฟังเสียงเล็กๆ ในใจ แล้วตัดสินใจอย่างมีสติ"],
  ],
  [
    ["กระทงนำพร", "ขอให้ความขุ่นเคืองลอยไปกับสายน้ำ และรับแสงสว่างของความหวังใหม่"],
    ["ขอขมาแม่คงคา", "ขอบคุณสายน้ำที่หล่อเลี้ยงชีวิต ขอให้โชคลาภไหลมาเทมา และมีความสุขสงบ"],
    ["ธารน้ำนำโชค", "ความตั้งใจที่ตั้งไว้จะเป็นจริงทีละก้าว ขอให้พบเรื่องดีที่รออยู่ปลายทาง"],
  ],
  [
    ["อั่งเปามงคล", "ซินเจียยู่อี่ ซินนี้ฮวดไช้ ขอให้การงานก้าวหน้าและสุขภาพแข็งแรง"],
    ["มังกรทองนำโชค", "ปีใหม่ของใจเริ่มวันนี้ ลงมือทำสิ่งที่ตั้งใจ ผลจะค่อยๆ งอกงาม"],
    ["ทรัพย์เข้าบ้าน", "ขอให้ค้าขายคล่อง เงินทองไหลมา และมีเวลาอยู่กับคนที่รัก"],
  ],
  [
    ["ตั้งใจใหม่", "ปีใหม่เป็นโอกาสวางเป้าหมายเล็กๆ ที่ทำได้จริง เริ่มจากหนึ่งเรื่องก่อน"],
    ["พรปีใหม่", "ขอให้ปีหน้าสุขภาพดี ใจสงบ และได้ทำสิ่งที่รัก"],
    ["นับถอยหลังสู่โชค", "สิ่งดีๆ รอคนที่ลงมือ ขอให้ทุกก้าวของปีใหม่มั่นคง"],
  ],
];

const ANGPAO_VALS = [8, 18, 28, 66, 88, 168, 888];

class JsCoreEngine implements ICoreEngine {
  private curY = 2026;
  private curD = 31;
  private by = 2000;
  private z = 4;
  private valid = false;

  private yearBranch(y: number): number {
    return (((y - 4) % 12) + 12) % 12;
  }

  seedEntropy(_a: number, _b: number, _c: number, _d: number): void {
    // Pure JS engine relies on Math.random and crypto
  }

  setDate(y: number, _m: number, d: number): void {
    if (y >= 1900 && y <= 2200) this.curY = y;
    if (d >= 1 && d <= 31) this.curD = d;
  }

  version(): number {
    return 1;
  }

  initSession(_name: string, birthYear: number, zodiac: number = -1): number {
    let by = birthYear;
    if (by > 2400) by -= 543;
    if (by < 1900 || by > 2200) return -2;
    if (zodiac < -1 || zodiac > 11) return -3;
    this.by = by;
    this.z = zodiac >= 0 ? zodiac : this.yearBranch(by);
    this.valid = true;
    return this.z;
  }

  getZodiacInfo(z: number = -1): ZodiacInfo {
    const idx = z >= 0 ? z : this.valid ? this.z : 0;
    const item = ZOD_LIST[idx % 12];
    const curYearIdx = this.yearBranch(this.curY);
    return {
      id: idx % 12,
      name: item.name,
      animal: item.animal,
      color: item.color,
      element: "มงคล",
      current_year_name: ZOD_LIST[curYearIdx].name,
    };
  }

  drawSiameseSticks(power: number): StickResult {
    const n = Math.floor(Math.abs(Math.sin(power + Date.now())) * 28) % 28;
    const s = STICKS[n];
    const aspects = ASPECT_NAMES.map((name, a) => ({
      name,
      text: STICK_TEXT[s.level][a][(n * 5 + a * 2) % 3],
    }));

    return {
      stick: n + 1,
      level: s.level,
      level_name: LEVEL_NAMES[s.level],
      title: s.title,
      verse: s.verse,
      aspects,
    };
  }

  drawTarotCards(count: number): TarotResult {
    const c = clamp(count, 1, 10);
    const deck = Array.from({ length: 22 }, (_, i) => i);
    for (let i = 21; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = deck[i];
      deck[i] = deck[j];
      deck[j] = t;
    }
    const cards = deck.slice(0, c).map((id) => {
      const item = TAROT_CARDS[id];
      const reversed = Math.random() < 0.33;
      return {
        id,
        name: item.th,
        en: item.en,
        meaning: reversed ? item.rev : item.up,
        reversed,
      };
    });
    return { cards };
  }

  generateLuckyNumbers(category: number): LuckyNumbersResult {
    const rnd2 = () => pad2(Math.floor(Math.random() * 100));
    const rnd3 = () => pad3(Math.floor(Math.random() * 1000));

    const result: LuckyNumbersResult = {
      note: "เลขนี้ใช้เพื่อความบันเทิงเท่านั้น ไม่ได้ทำนายผลสลากจริง และการเสี่ยงโชคมีความเสี่ยงเสมอ",
    };

    if (category === 0 || category === 2) {
      const base = ((this.by % 10) * 10 + (this.z % 10)) % 100;
      result.two = [pad2(base), rnd2(), rnd2()];
    }
    if (category === 1 || category === 2) {
      const base = (this.by % 10) * 100 + (this.curD % 10) * 10 + (this.z % 10);
      result.three = [pad3(base), rnd3(), rnd3()];
    }
    if (category === 2) {
      const r1 = Math.floor(Math.random() * 10);
      let r2 = Math.floor(Math.random() * 10);
      if (r2 === r1) r2 = (r2 + 3) % 10;
      result.run = [String(r1), String(r2)];
    }

    return result;
  }

  calculateBadLuckRemedy(zodiac: number, problem: number): RemedyResult {
    const z = zodiac >= 0 ? zodiac : this.valid ? this.z : 0;
    const p = clamp(problem, 0, 3);
    const curYearIdx = this.yearBranch(this.curY);

    const BREAK_PAIR = [9, 4, 11, 6, 1, 8, 3, 10, 5, 0, 7, 2];
    let rel = 0;
    if (z === curYearIdx) rel = 1;
    else if ((z + 6) % 12 === curYearIdx) rel = 2;
    else if ((z + curYearIdx) % 12 === 7) rel = 3;
    else if (BREAK_PAIR[z] === curYearIdx) rel = 4;

    const REL_NAMES = ["ไม่ชง (ดวงปกติ)", "ปีตรงนักษัตร", "ปีชง (ปะทะ)", "ปีไห่ (เบียดเบียน)", "ปีพัง (ทำลาย)"];
    const REL_SEV = [0, 1, 3, 2, 1];
    const REL_TEXT = [
      "ปีนี้ดวงไม่ตรงกับปีชงโดยตรง ใช้ชีวิตตามปกติ เสริมดวงด้วยการทำบุญและรักษาน้ำใจต่อผู้อื่น",
      "ปีตรงนักษัตรเชื่อกันว่าพลังชีวิตแปรผัน ควรทำใจให้นิ่ง ใส่ของสีมงคล และทำบุญไหว้พระ",
      "ปีชงตรงเชื่อกันว่าดวงปะทะแรง ควรเพิ่มความรอบคอบทุกด้าน ประหยัดอดออม และระวังการเดินทาง",
      "ปีไห่เชื่อกันว่ามีเรื่องกวนใจจากคนใกล้ตัว ควรสื่อสารตรงไปตรงมาและหลีกเลี่ยงข้อพิพาท",
      "ปีพังเชื่อกันว่าแผนที่วางไว้อาจสะดุด ควรเผื่อแผนสำรองและไม่ฝืนเปลี่ยนแปลงใหญ่",
    ];
    const PRACTICAL = [
      "ทำบัญชีรายรับรายจ่าย ตั้งเงินสำรองฉุกเฉิน 3-6 เดือน และหลีกเลี่ยงการกู้หรือค้ำประกันให้ใคร",
      "ตั้งเวลาคุยกันแบบไม่มีโทรศัพท์ ฟังก่อนตอบ และขอโทษตรงๆ เมื่อเป็นฝ่ายผิด",
      "ตรวจสุขภาพประจำปี นอนให้พอ ออกกำลังกายเบาๆ และพบแพทย์เมื่อมีอาการผิดปกติ",
      "จดงานค้างและจัดลำดับความสำคัญ สื่อสารกับหัวหน้าให้ชัดเจน และพัฒนาทักษะเพิ่มเติม",
    ];
    const MERIT = [
      "ทำบุญบริจาคช่วยผู้ขาดแคลน และไหว้พระขอพรด้วยดอกไม้ ธูป เทียน",
      "ไหว้ขอพรด้วยดอกไม้สีชมพูหรือสีแดง ตั้งจิตให้มีเมตตาต่อคนรอบข้าง",
      "ถวายสังฆทานหรือบริจาคช่วยโรงพยาบาล และสวดแผ่เมตตา",
      "ไหว้พระหรือศาลเจ้าประจำถิ่น ขอพรให้การงานราบรื่น และตั้งใจช่วยเหลือเพื่อนร่วมงาน",
    ];

    return {
      zodiac_name: ZOD_LIST[z].name,
      year_name: ZOD_LIST[curYearIdx].name,
      year: this.curY,
      relation: rel,
      relation_name: REL_NAMES[rel],
      severity: REL_SEV[rel],
      problem: ASPECT_NAMES[p],
      summary: REL_TEXT[rel],
      practical: PRACTICAL[p],
      merit: MERIT[p],
      color: ZOD_LIST[z].color,
      direction: ZOD_LIST[z].dir,
      yantra: "นะ โม พุท ธา ยะ",
      mantra: [
        "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (3 จบ)",
        "สัพเพ สัตตา สุขิตา โหนตุ",
      ],
    };
  }

  candleUnlock(holdMs: number): CandleResult {
    const h = clamp(holdMs, 0, 60000);
    const unlocked = h >= 4000;
    const DEDICATIONS = [
      "ขอให้ใจสงบ สว่างดั่งแสงเทียน",
      "ขอให้ทุกข์เบาบาง สุขเข้ามาแทนที่",
      "ขอให้ปัญญานำทาง พ้นเคราะห์ภัยทั้งปวง",
    ];

    return {
      unlocked,
      dedication: DEDICATIONS[Math.floor(Math.random() * DEDICATIONS.length)],
      mantra: [
        "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (3 จบ)",
        "สัพเพ สัตตา สุขิตา โหนตุ",
      ],
      lucky2: pad2(Math.floor(Math.random() * 100)),
      lucky3: pad3(Math.floor(Math.random() * 1000)),
    };
  }

  getFestival(month: number, day: number): number {
    if (month === 4) return 1;
    if (month === 10) return 2;
    if (month === 11) return 3;
    if ((month === 1 && day >= 15) || month === 2) return 4;
    if ((month === 12 && day >= 20) || (month === 1 && day < 15)) return 5;
    return 0;
  }

  festivalInfo(id: number): FestivalInfo {
    const idx = clamp(id, 0, 5);
    return {
      name: FESTIVAL_NAMES[idx],
      tagline: FESTIVAL_TAGS[idx],
    };
  }

  drawFestivalBlessing(id: number): BlessingResult {
    const idx = clamp(id, 0, 5);
    const k = Math.floor(Math.random() * 3);
    const item = BLESSINGS[idx][k];
    const lucky = pad2(Math.floor(Math.random() * 100));
    const res: BlessingResult = {
      title: item[0],
      text: item[1],
      lucky,
    };
    if (idx === 4) {
      res.angpao = ANGPAO_VALS[Math.floor(Math.random() * ANGPAO_VALS.length)];
    }
    return res;
  }

  processDigitalOffering(type: number, text: string): OfferingResult {
    if (type < 0 || type > 5) {
      throw new Error("Invalid offering type: must be between 0 and 5");
    }
    const CARE_WORDS = ["ฆ่าตัวตาย", "อยากตาย", "ทำร้ายตัวเอง", "ไม่อยากมีชีวิต", "จบชีวิต"];
    const t = (text || "").slice(0, 4000);
    for (const w of CARE_WORDS) {
      if (t.includes(w)) {
        return {
          category: "ความปลอดภัย",
          message:
            "ขอบคุณที่ไว้ใจเล่าออกมา ความเจ็บปวดนี้เป็นเรื่องจริง และคุณไม่ต้องแบกมันอยู่คนเดียว " +
            "ถ้าคุณกำลังคิดทำร้ายตัวเอง โปรดโทรสายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง) หรือบอกคนที่ไว้ใจให้มาอยู่ด้วยตอนนี้ " +
            "หากอยู่ในอันตรายเฉียบพลันโทร 1669",
          merit: 100,
          care: true,
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

    const GUIDES = [
      "ความกังวลเรื่องเงินเป็นเรื่องจริง ลองแบ่งปัญหาเป็นก้อนเล็กๆ แล้วจัดการทีละก้อน และขอคำปรึกษาจากคนที่ไว้ใจหรือหน่วยงานให้คำปรึกษาได้",
      "หัวใจที่เหนื่อยต้องการเวลา ให้ตัวเองพักก่อนตัดสินใจ และเล่าความรู้สึกให้คนที่ไว้ใจฟัง",
      "ร่างกายกำลังบอกให้พัก ลองนอนให้พอ และพบแพทย์ถ้ามีอาการต่อเนื่อง",
      "งานที่หนักหน่วงผ่านไปได้ด้วยการทำทีละเรื่อง และอย่าลืมเติมพลังใจให้ตัวเอง",
      "ความตั้งใจที่ดีคือจุดเริ่มต้นของสิ่งมงคล ขอให้ก้าวต่อไปด้วยใจเบาและมั่นคง",
    ];

    const CATS = ["การเงิน", "ความรัก", "สุขภาพ", "การงาน", "ทั่วไป"];

    return {
      category: CATS[best],
      message: GUIDES[best],
      merit: Math.min(100, Math.max(10, Math.floor(t.length / 5) * 10 || 10)),
    };
  }

  processImageScan(rgba: Uint8ClampedArray | Uint8Array, mode: number): ImageScanResult {
    if (!rgba || rgba.length < 16 || rgba.length > 1024 * 1024 || (mode !== 0 && mode !== 1)) {
      throw new Error("Invalid image scan input");
    }
    let sum = 0;
    const len = rgba.length;
    for (let i = 0; i < len; i += 16) {
      sum += rgba[i];
    }
    const val = sum % 100;
    const ELEMENTS = ["ทองคำ", "น้ำ", "ไม้", "ไฟ", "ดิน"];
    const el = ELEMENTS[val % 5];
    const fp = pad2(val);

    const scores = {
      wealth: ((val * 7) % 5) + 1,
      love: ((val * 3) % 5) + 1,
      health: ((val * 11) % 5) + 1,
      career: ((val * 13) % 5) + 1,
    };

    const isFace = mode === 0;
    const reading = isFace
      ? `โหงวเฮ้งสีหน้าโดดเด่น ธาตุประจำภาพคือ ${el} พลังสายตาและความสดใสมีเกณฑ์เกื้อหนุนให้พบโชคใหญ่`
      : `เส้นลายฝ่ามือและเนินหัตถ์เด่น ธาตุประจำภาพคือ ${el} บ่งบอกถึงจังหวะชีวิตที่กำลังพลิกฟื้นสู่ความมั่นคง`;

    return {
      element: el,
      fingerprint: fp,
      scores,
      reading,
    };
  }

  processSignature(points: [number, number, number][]): SignatureResult {
    if (!points || points.length < 8 || points.length > 20000) {
      throw new Error("Invalid signature points: length must be between 8 and 20000");
    }
    const n = points.length;
    let strokes = 0;
    let maxStroke = -1;
    for (let i = 0; i < n; i++) {
      if (points[i][2] > maxStroke) {
        maxStroke = points[i][2];
        strokes++;
      }
    }

    const val = (n * 17 + strokes * 31) % 100;
    const traits = [
      strokes > 3 ? "เส้นตวัดสม่ำเสมอ มั่นใจในความคิด" : "เส้นตวัดกระชับ ตัดสินใจไว",
      n > 100 ? "ใส่ใจรายละเอียด มีความละเมียดละไม" : "คล่องตัว ไม่ยึดติดกับรูปแบบเดิมๆ",
      "มีออร่าความเป็นผู้นำ มักเป็นที่พึ่งให้คนรอบข้าง",
    ];

    const scores = {
      wealth: ((val * 7) % 5) + 1,
      love: ((val * 3) % 5) + 1,
      career: ((val * 11) % 5) + 1,
      luck: ((val * 13) % 5) + 1,
    };

    return {
      strokes,
      traits,
      scores,
    };
  }
}

// -----------------------------------------------------------------------------
// Bridge Class Definition
// -----------------------------------------------------------------------------
export class Bridge {
  private engine: ICoreEngine;

  private constructor(engine: ICoreEngine) {
    this.engine = engine;
  }

  static async load(): Promise<Bridge> {
    try {
      const binaryString = atob(CORE_WASM_BASE64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const { instance } = await WebAssembly.instantiate(bytes.buffer, {});
      logger.info("Loaded WebAssembly Divination Core successfully");
      return new Bridge(new WasmCoreEngine(instance));
    } catch (err) {
      logger.warn("WebAssembly load failed or disabled, falling back to Pure TS Core Engine:", err);
      return new Bridge(new JsCoreEngine());
    }
  }

  static async fromBytes(bytes: Uint8Array): Promise<Bridge> {
    try {
      const result: unknown = await WebAssembly.instantiate(bytes.buffer, {});
      const instance = (result && typeof result === 'object' && 'instance' in result)
        ? (result as { instance: WebAssembly.Instance }).instance
        : (result as WebAssembly.Instance);
      return new Bridge(new WasmCoreEngine(instance));
    } catch {
      return new Bridge(new JsCoreEngine());
    }
  }

  version(): number {
    return this.engine.version();
  }

  setDate(date: Date = new Date()): void {
    try {
      this.engine.setDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    } catch (err) {
      logger.warn("Failed to set engine date:", err);
    }
  }

  initSession(name: string, birthYear: number, zodiac: number = -1): number {
    return this.engine.initSession(name, birthYear, zodiac);
  }

  zodiacInfo(zodiac: number = -1): ZodiacInfo {
    return this.engine.getZodiacInfo(zodiac);
  }

  drawStick(power: number): StickResult {
    return this.engine.drawSiameseSticks(power);
  }

  drawTarot(count: number): TarotResult {
    return this.engine.drawTarotCards(count);
  }

  luckyNumbers(category: number): LuckyNumbersResult {
    return this.engine.generateLuckyNumbers(category);
  }

  badLuckRemedy(zodiac: number, problem: number): RemedyResult {
    return this.engine.calculateBadLuckRemedy(zodiac, problem);
  }

  candleUnlock(holdMs: number): CandleResult {
    return this.engine.candleUnlock(holdMs);
  }

  getFestival(month: number, day: number): number {
    return this.engine.getFestival(month, day);
  }

  festivalInfo(id: number): FestivalInfo {
    return this.engine.festivalInfo(id);
  }

  drawBlessing(id: number): BlessingResult {
    return this.engine.drawFestivalBlessing(id);
  }

  digitalOffering(type: number, text: string): OfferingResult {
    return this.engine.processDigitalOffering(type, text);
  }

  imageScan(rgba: Uint8ClampedArray | Uint8Array, mode: number): ImageScanResult {
    return this.engine.processImageScan(rgba, mode);
  }

  signature(points: [number, number, number][]): SignatureResult {
    return this.engine.processSignature(points);
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
