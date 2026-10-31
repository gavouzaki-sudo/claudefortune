// Smoke tests for the Wasm core. Run: node tests/core.test.mjs  (after ./build.sh)
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { Bridge } from "../web/js/bridge.js";

const bytes = await readFile(new URL("../web/wasm/core.wasm", import.meta.url));
const w = await Bridge.fromBytes(bytes);
let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log("ok  -", name); };

w.setDate(new Date(2026, 9, 31));

t("version", () => assert.equal(w.version(), 1));

t("init_session: zodiac from year (CE and BE)", () => {
  assert.equal(w.initSession("สมชาย", 2000), 4);   // 2000 = มะโรง
  assert.equal(w.initSession("สมชาย", 2543), 4);   // พ.ศ. 2543
  assert.equal(w.initSession("A", 2026), 6);       // 2026 = มะเมีย
  assert.equal(w.initSession("A", 1990, 3), 3);    // manual override
  assert.ok(w.initSession("A", 1500) < 0);          // invalid year
  assert.ok(w.initSession("A", 1990, 12) < 0);      // invalid zodiac
});

w.initSession("ทดสอบ", 1995);

t("zodiac info", () => {
  const z = w.zodiacInfo();
  assert.equal(z.name, "กุน");          // 1995 = กุน
  assert.equal(z.current_year_name, "มะเมีย");
});

t("siamese sticks: 1..28 and all four aspects, covers many sticks", () => {
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    const r = w.drawStick(i * 37);
    assert.ok(r.stick >= 1 && r.stick <= 28);
    assert.equal(r.aspects.length, 4);
    assert.ok(r.level >= 0 && r.level <= 3);
    seen.add(r.stick);
  }
  assert.ok(seen.size >= 26, "distribution too narrow: " + seen.size);
});

t("tarot: no duplicates, counts respected", () => {
  for (const n of [1, 3, 5, 10]) {
    const r = w.drawTarot(n);
    assert.equal(r.cards.length, n);
    assert.equal(new Set(r.cards.map((c) => c.id)).size, n);
  }
  assert.equal(w.drawTarot(99).cards.length, 10);
  let rev = 0;
  for (let i = 0; i < 300; i++) rev += w.drawTarot(1).cards[0].reversed ? 1 : 0;
  assert.ok(rev > 60 && rev < 140, "reversed ratio off: " + rev);
});

t("lucky numbers: formats", () => {
  const a = w.luckyNumbers(0);
  assert.equal(a.two.length, 3);
  a.two.forEach((s) => assert.match(s, /^\d{2}$/));
  const b = w.luckyNumbers(1);
  b.three.forEach((s) => assert.match(s, /^\d{3}$/));
  const c = w.luckyNumbers(2);
  assert.ok(c.two && c.three && c.run.length === 2 && c.run[0] !== c.run[1]);
  assert.ok(c.note.length > 10);
});

t("remedy: 2026 (horse) clash with rat, harm with ox, break with rabbit", () => {
  assert.equal(w.remedy(0, 0).relation, 2);  // ชวด = ชง
  assert.equal(w.remedy(1, 0).relation, 3);  // ฉลู = ไห่
  assert.equal(w.remedy(3, 0).relation, 4);  // เถาะ = พัง
  assert.equal(w.remedy(6, 0).relation, 1);  // มะเมีย = ตรง
  assert.equal(w.remedy(2, 0).relation, 0);  // ขาล = ปกติ
  for (let p = 0; p < 4; p++) assert.ok(w.remedy(-1, p).mantra.length === 2);
});

t("offering: keyword category + crisis safety", () => {
  assert.equal(w.offering(1, "กังวลเรื่องหนี้และเงิน").category, "การเงิน");
  assert.equal(w.offering(1, "คิดถึงแฟน").category, "ความรัก");
  assert.equal(w.offering(1, "ปวดหัวนอนไม่หลับ").category, "สุขภาพ");
  assert.equal(w.offering(1, "งานเยอะมาก").category, "การงาน");
  assert.equal(w.offering(1, "ขอให้ทุกอย่างดี").category, "ทั่วไป");
  const care = w.offering(1, "ฉันอยากตาย");
  assert.equal(care.care, true);
  assert.match(care.message, /1323/);
  assert.equal(care.lucky, undefined);
});

t("candle: needs 4s", () => {
  assert.equal(w.candle(1000).unlocked, false);
  const u = w.candle(4500);
  assert.equal(u.unlocked, true);
  assert.match(u.lucky2, /^\d{2}$/);
});

t("image scan: deterministic for same pixels, differs for others", () => {
  const a = new Uint8Array(64 * 64 * 4).map((_, i) => (i * 7) & 255);
  const b = new Uint8Array(64 * 64 * 4).map((_, i) => (i * 13 + 5) & 255);
  const r1 = w.imageScan(a, 0), r2 = w.imageScan(a, 0), r3 = w.imageScan(b, 1);
  assert.equal(r1.fingerprint, r2.fingerprint);
  assert.notEqual(r1.fingerprint, r3.fingerprint);
  assert.equal(r1.scores.wealth >= 1 && r1.scores.wealth <= 5, true);
});

t("signature", () => {
  const pts = [];
  for (let i = 0; i < 60; i++) pts.push([100 + i * 10, 600 - i * 5 + (i % 2) * 20, i < 30 ? 0 : 1]);
  const r = w.signature(pts);
  assert.equal(r.strokes, 2);
  assert.equal(r.traits.length, 3);
  for (const k of ["wealth", "love", "career", "luck"]) assert.ok(r.scores[k] >= 1 && r.scores[k] <= 5);
  assert.throws(() => w.signature([[1, 1, 0]]));
});

t("festivals by date", () => {
  assert.equal(w.festival(4, 13), 1);
  assert.equal(w.festival(10, 31), 2);
  assert.equal(w.festival(11, 5), 3);
  assert.equal(w.festival(2, 1), 4);
  assert.equal(w.festival(12, 31), 5);
  assert.equal(w.festival(1, 2), 5);
  assert.equal(w.festival(7, 1), 0);
  for (let id = 0; id <= 5; id++) {
    assert.ok(w.festivalInfo(id).name);
    assert.ok(w.blessing(id).text);
  }
  assert.ok([8, 18, 28, 66, 88, 168, 888].includes(w.blessing(4).angpao));
});

console.log(`\n${passed} test groups passed`);
