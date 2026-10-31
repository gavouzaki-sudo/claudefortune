// Thin bridge between JavaScript and the Wasm core (wasm/core.c).
// Works in browsers (fetch) and in Node (Bridge.fromBytes) for tests.

const enc = new TextEncoder();
const dec = new TextDecoder("utf-8");

export class Bridge {
  constructor(instance) {
    this.x = instance.exports;
    this.mem = this.x.memory;
  }

  static async load(url = "wasm/core.wasm") {
    const res = await fetch(url);
    if (!res.ok) throw new Error("โหลด core.wasm ไม่สำเร็จ: " + res.status);
    const bytes = await res.arrayBuffer();
    return Bridge.fromBytes(bytes);
  }

  static async fromBytes(bytes) {
    const { instance } = await WebAssembly.instantiate(bytes, {});
    const b = new Bridge(instance);
    b.seed();
    return b;
  }

  /** Mix fresh browser entropy into the Wasm RNG. */
  seed() {
    const a = new Uint32Array(4);
    if (globalThis.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (let i = 0; i < 4; i++) a[i] = (Math.random() * 4294967296) >>> 0;
    this.x.seed_entropy(a[0], a[1], a[2], a[3]);
    const t = Date.now();
    this.x.seed_entropy((t / 4294967296) >>> 0, t >>> 0, (performance.now() * 1000) >>> 0, 0);
  }

  setDate(d = new Date()) {
    this.x.set_date(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  _bytes(u8) {
    this.x.wasm_reset();
    const p = this.x.wasm_alloc(Math.max(u8.length, 1));
    if (!p) throw new Error("หน่วยความจำ Wasm ไม่พอ");
    new Uint8Array(this.mem.buffer, p, u8.length).set(u8);
    return p;
  }

  _json(n) {
    if (n < 0) {
      const err = new Error("wasm error " + n);
      err.code = n;
      throw err;
    }
    const s = dec.decode(new Uint8Array(this.mem.buffer, this.x.out_ptr(), n));
    return JSON.parse(s);
  }

  version() { return this.x.wasm_version(); }

  initSession(name, birthYear, zodiac = -1) {
    const u8 = enc.encode((name || "").slice(0, 100));
    const p = this._bytes(u8);
    return this.x.init_session(p, u8.length, birthYear | 0, zodiac | 0);
  }

  zodiacInfo(z = -1) { return this._json(this.x.get_zodiac_info(z)); }
  drawStick(power) { return this._json(this.x.draw_siamese_sticks(Math.round(power))); }
  drawTarot(count) { return this._json(this.x.draw_tarot_cards(count)); }
  luckyNumbers(category) { return this._json(this.x.generate_lucky_numbers(category)); }
  remedy(zodiac, problem) { return this._json(this.x.calculate_bad_luck_remedy(zodiac, problem)); }
  candle(holdMs) { return this._json(this.x.candle_unlock(Math.round(holdMs))); }
  festival(month, day) { return this.x.get_festival(month, day); }
  festivalInfo(id) { return this._json(this.x.festival_info(id)); }
  blessing(id) { return this._json(this.x.draw_festival_blessing(id)); }

  offering(type, text) {
    const u8 = enc.encode((text || "").slice(0, 1000));
    const p = this._bytes(u8);
    return this._json(this.x.process_digital_offering(type, p, u8.length));
  }

  /** rgba: Uint8ClampedArray | Uint8Array of RGBA pixels (keep it small, e.g. 64x64). */
  imageScan(rgba, mode = 0) {
    const p = this._bytes(new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength));
    return this._json(this.x.process_image_scan(p, rgba.byteLength, mode));
  }

  /** points: array of [x, y, strokeId] with coordinates normalised to ~0..1000 */
  signature(points) {
    const n = points.length;
    const flat = new Int32Array(n * 3);
    for (let i = 0; i < n; i++) {
      flat[i * 3] = points[i][0] | 0;
      flat[i * 3 + 1] = points[i][1] | 0;
      flat[i * 3 + 2] = points[i][2] | 0;
    }
    const p = this._bytes(new Uint8Array(flat.buffer));
    return this._json(this.x.process_signature(p, n));
  }
}
