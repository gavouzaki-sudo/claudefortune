// Thin bridge between TypeScript and the Wasm core (wasm/core.c).
import { CORE_WASM_BASE64 } from "./wasm/coreWasmBytes";
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

export class Bridge {
  private x: WasmExports;
  private mem: WebAssembly.Memory;

  constructor(instance: WebAssembly.Instance) {
    this.x = instance.exports as unknown as WasmExports;
    this.mem = this.x.memory;
  }

  static async load(url = "/wasm/core.wasm"): Promise<Bridge> {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        return Bridge.fromBytes(new Uint8Array(bytes));
      }
    } catch {
      // Fallback to embedded base64 if fetch fails
    }

    // Fallback: decode base64
    const binStr = atob(CORE_WASM_BASE64);
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return Bridge.fromBytes(bytes);
  }

  static async fromBytes(bytes: Uint8Array): Promise<Bridge> {
    const { instance } = await WebAssembly.instantiate(bytes, {});
    const b = new Bridge(instance);
    b.seed();
    return b;
  }

  /** Mix fresh browser entropy into the Wasm RNG. */
  seed(): void {
    const a = new Uint32Array(4);
    if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
      crypto.getRandomValues(a);
    } else {
      for (let i = 0; i < 4; i++) a[i] = (Math.random() * 4294967296) >>> 0;
    }
    this.x.seed_entropy(a[0], a[1], a[2], a[3]);
    const t = Date.now();
    this.x.seed_entropy((t / 4294967296) >>> 0, t >>> 0, ((performance.now() * 1000) >>> 0), 0);
  }

  setDate(d: Date = new Date()): void {
    this.x.set_date(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  private _bytes(u8: Uint8Array): number {
    this.x.wasm_reset();
    const p = this.x.wasm_alloc(Math.max(u8.length, 1));
    if (!p) throw new Error("หน่วยความจำ Wasm ไม่พอ");
    new Uint8Array(this.mem.buffer, p, u8.length).set(u8);
    return p;
  }

  private _json<T>(n: number): T {
    if (n < 0) {
      const err = new Error("wasm error " + n) as Error & { code: number };
      err.code = n;
      throw err;
    }
    const s = dec.decode(new Uint8Array(this.mem.buffer, this.x.out_ptr(), n));
    return JSON.parse(s) as T;
  }

  version(): number {
    return this.x.wasm_version();
  }

  initSession(name: string, birthYear: number, zodiac = -1): number {
    const u8 = enc.encode((name || "").slice(0, 100));
    const p = this._bytes(u8);
    return this.x.init_session(p, u8.length, birthYear | 0, zodiac | 0);
  }

  zodiacInfo(z = -1): ZodiacInfo {
    return this._json<ZodiacInfo>(this.x.get_zodiac_info(z));
  }

  drawStick(power: number): StickResult {
    return this._json<StickResult>(this.x.draw_siamese_sticks(Math.round(power)));
  }

  drawTarot(count: number): TarotResult {
    return this._json<TarotResult>(this.x.draw_tarot_cards(count));
  }

  luckyNumbers(category: number): LuckyNumbersResult {
    return this._json<LuckyNumbersResult>(this.x.generate_lucky_numbers(category));
  }

  remedy(zodiac: number, problem: number): RemedyResult {
    return this._json<RemedyResult>(this.x.calculate_bad_luck_remedy(zodiac, problem));
  }

  candle(holdMs: number): CandleResult {
    return this._json<CandleResult>(this.x.candle_unlock(Math.round(holdMs)));
  }

  festival(month: number, day: number): number {
    return this.x.get_festival(month, day);
  }

  festivalInfo(id: number): FestivalInfo {
    return this._json<FestivalInfo>(this.x.festival_info(id));
  }

  blessing(id: number): BlessingResult {
    return this._json<BlessingResult>(this.x.draw_festival_blessing(id));
  }

  offering(type: number, text: string): OfferingResult {
    const u8 = enc.encode((text || "").slice(0, 1000));
    const p = this._bytes(u8);
    return this._json<OfferingResult>(this.x.process_digital_offering(type, p, u8.length));
  }

  imageScan(rgba: Uint8ClampedArray | Uint8Array, mode = 0): ImageScanResult {
    const p = this._bytes(new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength));
    return this._json<ImageScanResult>(this.x.process_image_scan(p, rgba.byteLength, mode));
  }

  signature(points: [number, number, number][]): SignatureResult {
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
