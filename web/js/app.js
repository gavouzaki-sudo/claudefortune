// ศาลเจ้าแห่งโชคลาภ — UI layer.
// All fortune logic lives in the Wasm core (see wasm/core.c); this file only
// handles the interface, animation and device input.
import { Bridge } from "./bridge.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Tiny DOM builder. Text is always inserted as text nodes (never as HTML). */
function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return e;
}

function showResult(box, ...nodes) {
  box.hidden = true;
  box.replaceChildren(...nodes.flat().filter(Boolean));
  void box.offsetWidth; // restart CSS animation
  box.hidden = false;
  box.scrollIntoView?.({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3200);
}

/* ------------------------------------------------------------------ */
/* state                                                              */
/* ------------------------------------------------------------------ */
let W; // Wasm bridge
const FEST_THEME = ["shrine", "songkran", "halloween", "loy", "cny", "newyear"];
const state = { session: null, theme: "auto", festival: 0, tab: "stick", festRendered: false };

const store = {
  get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch { /* ignore */ } },
};

/* ------------------------------------------------------------------ */
/* boot                                                               */
/* ------------------------------------------------------------------ */
async function boot() {
  try {
    W = await Bridge.load("wasm/core.wasm");
  } catch (e) {
    console.error(e);
    const err = $("#gate-error");
    err.textContent = "ไม่สามารถโหลดแกนระบบ (WebAssembly) ได้ — โปรดใช้เบราว์เซอร์รุ่นใหม่และเปิดผ่านเว็บเซิร์ฟเวอร์ (ไม่ใช่ไฟล์ตรงๆ)";
    err.hidden = false;
    return;
  }
  W.setDate();

  // chong zodiac options mirror the gate select
  const sel = $("#chong-zodiac");
  $$("#in-zodiac option").forEach((o) => { if (+o.value >= 0) sel.append(el("option", { value: o.value, text: o.textContent })); });

  bindGate();
  bindTabs();
  bindStick();
  bindTarot();
  bindNumbers();
  bindRituals();
  bindScan();
  bindTheme();

  const saved = store.get("shrine.session");
  if (saved) {
    $("#in-name").value = saved.name || "";
    $("#in-year").value = saved.year || "";
    $("#in-zodiac").value = saved.zodiac ?? -1;
    startSession(saved.name, saved.year, saved.zodiac ?? -1, true);
  }
}

/* ------------------------------------------------------------------ */
/* gate / session                                                     */
/* ------------------------------------------------------------------ */
function bindGate() {
  $("#gate-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#in-name").value.trim();
    const year = parseInt($("#in-year").value, 10);
    const zodiac = parseInt($("#in-zodiac").value, 10);
    startSession(name, year, zodiac, false);
  });
  $("#btn-change").addEventListener("click", () => {
    store.del("shrine.session");
    state.session = null;
    $("#app").hidden = true;
    $("#gate").hidden = false;
  });
}

function startSession(name, year, zodiac, silent) {
  const err = $("#gate-error");
  err.hidden = true;
  const z = W.initSession(name, year, zodiac);
  if (z < 0) {
    if (!silent) {
      err.textContent = z === -2 ? "ปีเกิดไม่ถูกต้อง (ใส่ระหว่าง พ.ศ. 2443–2700 หรือ ค.ศ. 1900–2157)" : "ข้อมูลไม่ถูกต้อง ลองตรวจสอบอีกครั้ง";
      err.hidden = false;
    }
    return;
  }
  const info = W.zodiacInfo(z);
  state.session = { name, year, zodiac: z, info };
  store.set("shrine.session", { name, year, zodiac });
  $("#who").replaceChildren("สวัสดี ", el("b", { text: name }), ` · ปี${info.name} (${info.animal}) · สีมงคล${info.color}`);
  $("#chong-zodiac").value = String(z);
  $("#gate").hidden = true;
  $("#app").hidden = false;
  W.seed(); // fresh entropy at the start of every session
}

/* ------------------------------------------------------------------ */
/* tabs                                                               */
/* ------------------------------------------------------------------ */
function bindTabs() {
  $$("#tabs button").forEach((b) => b.addEventListener("click", () => selectTab(b.dataset.tab)));
}
function selectTab(name) {
  state.tab = name;
  $$("#tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
  $$(".tab").forEach((p) => (p.hidden = p.id !== "tab-" + name));
  if (name === "festival" && !state.festRendered) renderFestival();
}

/* ------------------------------------------------------------------ */
/* siamese sticks                                                     */
/* ------------------------------------------------------------------ */
const shake = { value: 0, raw: 0, busy: false, t: 0 };

function setMeter(v) { $("#shake-meter").style.width = Math.min(100, v) + "%"; }

function addShake(amount) {
  if (shake.busy || state.tab !== "stick") return;
  const cyl = $("#cylinder");
  if (shake.value === 0) $("#fallen").classList.remove("show");
  shake.value += amount;
  shake.raw += amount * 10;
  setMeter(shake.value);
  cyl.classList.add("shaking");
  clearTimeout(shake.t);
  shake.t = setTimeout(() => { if (!shake.busy) cyl.classList.remove("shaking"); }, 220);
  if (shake.value >= 100) finishShake();
}

async function finishShake() {
  shake.busy = true;
  $("#btn-shake").disabled = true;
  await sleep(450);
  $("#cylinder").classList.remove("shaking");
  let r;
  try { r = W.drawStick(shake.raw); } catch (e) { toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); resetShake(); return; }
  $("#fallen-num").textContent = r.stick;
  const f = $("#fallen");
  f.classList.remove("show");
  void f.offsetWidth;
  f.classList.add("show");
  await sleep(reduceMotion ? 0 : 700);
  showResult(
    $("#stick-result"),
    el("h3", { text: `ใบที่ ${r.stick} · ${r.title}` }),
    el("p", { class: "center" }, "ผลเซียมซี ", el("span", { class: `badge lv${r.level}`, text: r.level_name })),
    el("p", { class: "verse", text: r.verse }),
    el("div", { class: "aspects" }, r.aspects.map((a) => el("div", { class: "aspect" }, el("b", { text: a.name }), el("span", { text: a.text }))))
  );
  resetShake();
}
function resetShake() {
  shake.value = 0; shake.raw = 0; shake.busy = false;
  setMeter(0);
  $("#btn-shake").disabled = false;
}

function bindStick() {
  const cyl = $("#cylinder");
  $("#btn-shake").addEventListener("click", () => {
    if (shake.busy) return;
    const iv = setInterval(() => {
      if (shake.busy) return clearInterval(iv);
      addShake(3 + Math.random() * 1.5);
    }, 40);
  });

  // mouse / touch drag on the cylinder
  let last = null;
  cyl.addEventListener("pointerdown", (e) => { cyl.setPointerCapture(e.pointerId); last = [e.clientX, e.clientY]; });
  cyl.addEventListener("pointermove", (e) => {
    if (!last) return;
    const d = Math.hypot(e.clientX - last[0], e.clientY - last[1]);
    last = [e.clientX, e.clientY];
    addShake(d / 18);
  });
  const up = () => { last = null; };
  cyl.addEventListener("pointerup", up);
  cyl.addEventListener("pointercancel", up);

  // phone shake
  const motionBtn = $("#btn-motion");
  let prev = 0;
  const onMotion = (e) => {
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    const delta = Math.abs(mag - prev);
    prev = mag;
    if (delta > 5) addShake(delta * 0.5);
  };
  if (typeof DeviceMotionEvent !== "undefined") {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      motionBtn.hidden = false;
      motionBtn.addEventListener("click", async () => {
        try {
          const res = await DeviceMotionEvent.requestPermission();
          if (res === "granted") { addEventListener("devicemotion", onMotion); motionBtn.hidden = true; toast("เปิดเซ็นเซอร์แล้ว เขย่ามือถือได้เลย"); }
          else toast("ไม่ได้รับอนุญาตใช้เซ็นเซอร์");
        } catch { toast("ใช้เซ็นเซอร์ไม่ได้บนอุปกรณ์นี้"); }
      });
    } else {
      addEventListener("devicemotion", onMotion);
    }
  }
}

/* ------------------------------------------------------------------ */
/* tarot                                                              */
/* ------------------------------------------------------------------ */
const GLYPH = ["🃏", "🪄", "🌙", "👑", "🏛️", "📿", "💞", "🛞", "🦁", "🏮", "☸️", "⚖️", "🙃", "🦋", "⚗️", "⛓️", "🗼", "⭐", "🌕", "☀️", "📯", "🌏"];
const POS = {
  1: ["ไพ่ประจำวัน"],
  3: ["อดีต", "ปัจจุบัน", "อนาคต"],
  5: ["อดีต", "ปัจจุบัน", "อนาคต", "สิ่งที่ควรทำ", "ผลลัพธ์"],
};

function tarotSlot(card, label, i, flipNow = false) {
  const front = el("div", { class: "tface tfront" + (card.reversed ? " rev" : "") },
    el("div", { class: "num", text: String(card.id).padStart(2, "0") }),
    el("div", { class: "glyph", text: GLYPH[card.id] }),
    el("div", {}, el("div", { class: "nm", text: card.name }), el("div", { class: "en", text: card.en })));
  const inner = el("div", { class: "tcard-in" }, el("div", { class: "tface tback" }), front);
  const mean = el("div", { class: "tmean" }, card.reversed ? el("span", { class: "rv", text: "ไพ่กลับหัว" }) : null, card.meaning);
  const slot = el("div", { class: "tslot" }, el("div", { class: "pos", text: label }));
  const c = el("div", { class: "tcard", role: "button", tabindex: "0", "aria-label": `ไพ่ใบที่ ${i + 1} แตะเพื่อพลิก` }, inner);
  c.style.setProperty("--i", i);
  const flip = () => { c.classList.add("flipped"); slot.classList.add("revealed"); };
  c.addEventListener("click", flip);
  c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  slot.append(c, mean);
  slot.flip = flip;
  if (flipNow) setTimeout(flip, 500);
  return slot;
}

function bindTarot() {
  $("#btn-tarot").addEventListener("click", () => {
    const n = +$('input[name="spread"]:checked').value;
    let r;
    try { r = W.drawTarot(n); } catch { return toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); }
    const table = $("#tarot-table");
    const slots = r.cards.map((c, i) => tarotSlot(c, POS[n][i] || `ใบที่ ${i + 1}`, i));
    table.replaceChildren(...slots);
    const all = $("#btn-flip-all");
    all.hidden = false;
    all.onclick = () => slots.forEach((s, i) => setTimeout(s.flip, i * 250));
  });
}

/* ------------------------------------------------------------------ */
/* lucky numbers                                                      */
/* ------------------------------------------------------------------ */
function rollInto(container, str, delay = 0) {
  const reels = [...str].map(() => el("span", { class: "reel", text: "0" }));
  container.replaceChildren(...reels);
  reels.forEach((r, i) => {
    if (reduceMotion) { r.textContent = str[i]; return; }
    const iv = setInterval(() => (r.textContent = Math.floor(Math.random() * 10)), 60);
    setTimeout(() => { clearInterval(iv); r.textContent = str[i]; r.classList.add("settled"); }, 700 + i * 260 + delay);
  });
}

function bindNumbers() {
  $("#btn-number").addEventListener("click", () => {
    const cat = +$('input[name="numcat"]:checked').value;
    let r;
    try { r = W.luckyNumbers(cat); } catch { return toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); }
    const out = $("#number-out");
    const groups = [];
    if (r.two) groups.push(["เลขท้าย 2 ตัว", r.two]);
    if (r.three) groups.push(["เลขท้าย 3 ตัว", r.three]);
    if (r.run) groups.push(["เลขวิ่ง", [r.run.join("")]]);
    const nodes = [];
    let delay = 0;
    for (const [label, arr] of groups) {
      arr.forEach((s, i) => {
        const reels = el("div", { class: "reels" });
        nodes.push(el("div", { class: "nset" }, el("div", { class: "lbl", text: arr.length > 1 ? `${label} · ชุดที่ ${i + 1}` : label }), reels));
        rollInto(reels, s, delay);
        delay += 150;
      });
    }
    out.replaceChildren(...nodes);
    $("#number-note").textContent = r.note;
  });
}

/* ------------------------------------------------------------------ */
/* rituals                                                            */
/* ------------------------------------------------------------------ */
function bindRituals() {
  $$(".pill").forEach((p) => p.addEventListener("click", () => {
    $$(".pill").forEach((x) => x.classList.toggle("active", x === p));
    $$(".rit").forEach((r) => (r.hidden = r.id !== "rit-" + p.dataset.rit));
  }));
  bindCandle();
  bindLantern();
  bindChong();
}

function bindCandle() {
  const wrap = $("#candle-wrap");
  const flame = $("#flame");
  const glow = $("#candle-glow");
  const ring = $("#candle-ring");
  const hint = $("#candle-hint");
  const c = { down: false, start: 0, raf: 0, done: false };

  function paint(level) {
    flame.style.setProperty("--fs", (0.3 + (level / 100) * 0.95).toFixed(3));
    flame.style.opacity = level > 0 ? (0.35 + (level / 100) * 0.65).toFixed(3) : "0";
    glow.setAttribute("opacity", (level / 100).toFixed(3));
    ring.style.width = level + "%";
  }
  function loop() {
    if (!c.down) return;
    const held = performance.now() - c.start;
    const level = Math.min(100, held / 50);
    paint(level);
    if (held < 4000) {
      hint.textContent = `ค้างไว้อีก ${((4000 - held) / 1000).toFixed(1)} วินาที…`;
      c.raf = requestAnimationFrame(loop);
    } else if (!c.done) {
      c.done = true;
      unlock(held);
    }
  }
  function unlock(held) {
    let r;
    try { r = W.candle(held); } catch { return toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); }
    hint.textContent = "เทียนสว่างแล้ว ✨";
    showResult($("#candle-result"),
      el("h3", { text: "เทียนต่อดวงชะตาสว่างแล้ว" }),
      el("p", { class: "verse", text: r.dedication }),
      r.mantra.map((m) => el("div", { class: "mantra", text: m })),
      el("p", { class: "center" }, "เลขมงคลจากแสงเทียน: ",
        el("span", { class: "badge lv0", text: r.lucky2 }), el("span", { class: "badge lv1", text: r.lucky3 })),
      el("p", { class: "note", text: "เพื่อความบันเทิง ไม่ใช่การทำนายผลสลากจริง" }));
  }
  function press(e) {
    e?.preventDefault?.();
    if (c.down) return;
    c.down = true; c.done = false; c.start = performance.now();
    $("#candle-result").hidden = true;
    cancelAnimationFrame(c.raf);
    loop();
  }
  function release() {
    if (!c.down) return;
    c.down = false;
    cancelAnimationFrame(c.raf);
    if (!c.done) {
      paint(0);
      hint.textContent = "เทียนดับก่อนเวลา ลองกดค้างให้นานขึ้นอีกนิด";
    }
  }
  wrap.addEventListener("pointerdown", (e) => { wrap.setPointerCapture?.(e.pointerId); press(e); });
  ["pointerup", "pointercancel"].forEach((ev) => wrap.addEventListener(ev, release));
  wrap.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) press(e); });
  wrap.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") release(); });
  wrap.addEventListener("contextmenu", (e) => e.preventDefault());
}

function bindLantern() {
  $("#btn-lantern").addEventListener("click", async () => {
    const ta = $("#lantern-text");
    const text = ta.value.trim();
    if (!text) return toast("พิมพ์ความในใจก่อนปล่อยโคมนะ");
    const btn = $("#btn-lantern");
    btn.disabled = true;

    const sky = $("#sky");
    const lan = el("div", { class: "lantern" });
    lan.style.left = 20 + Math.random() * 60 + "%";
    lan.style.setProperty("--dx", Math.round(Math.random() * 80 - 40) + "px");
    sky.append(lan);
    setTimeout(() => lan.remove(), 6200);

    let r;
    try { r = W.offering(1, text); } catch { toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); btn.disabled = false; return; }
    ta.value = ""; // the wish leaves the device (and the page) with the lantern
    await sleep(reduceMotion ? 0 : 1800);

    const box = $("#lantern-result");
    box.classList.toggle("care", !!r.care);
    if (r.care) {
      showResult(box,
        el("h3", { text: "เรากำลังฟังอยู่" }),
        el("p", { text: r.message }),
        el("p", { class: "center" }, el("a", { class: "btn primary", href: "tel:1323", text: "โทร 1323 สายด่วนสุขภาพจิต" })));
    } else {
      showResult(box,
        el("h3", { text: "โคมลอยขึ้นฟ้าแล้ว" }),
        el("p", { class: "center" }, "เรื่องที่กังวล: ", el("span", { class: "badge lv1", text: r.category })),
        el("p", { text: r.message }),
        el("p", { class: "center" }, `คะแนนบุญวันนี้ ${r.merit} · เลขมงคล `, el("span", { class: "badge lv0", text: r.lucky }), ` · สีมงคล${r.color}`));
    }
    btn.disabled = false;
  });
}

function bindChong() {
  $("#btn-chong").addEventListener("click", async () => {
    const btn = $("#btn-chong");
    btn.disabled = true;
    const y = $("#yantra");
    y.classList.add("active");
    await sleep(reduceMotion ? 0 : 2300);
    let r;
    try { r = W.remedy(+$("#chong-zodiac").value, +$("#chong-problem").value); }
    catch { toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); y.classList.remove("active"); btn.disabled = false; return; }
    y.querySelector(".y-glyph").textContent = r.yantra.split(" ")[Math.floor(Math.random() * 5)];
    showResult($("#chong-result"),
      el("h3", { text: `นักษัตร${r.zodiac_name} × ปี${r.year_name} ${r.year}` }),
      el("p", { class: "center" }, el("span", { class: `badge lv${r.severity}`, text: r.relation_name })),
      el("div", { class: `sev s${r.severity}`, "aria-label": `ระดับ ${r.severity} จาก 3` }, [0, 1, 2].map((i) => el("i", { class: i < r.severity ? "on" : "" }))),
      el("p", { text: r.summary }),
      el("dl", { class: "kv" },
        el("dt", { text: `ด้าน${r.problem}` }), el("dd", { text: r.practical }),
        el("dt", { text: "เสริมมงคล" }), el("dd", { text: r.merit }),
        el("dt", { text: "สีมงคล" }), el("dd", { text: r.color }),
        el("dt", { text: "ทิศมงคล" }), el("dd", { text: r.direction })),
      r.mantra.map((m) => el("div", { class: "mantra", text: m })),
      el("p", { class: "note", text: "เป็นความเชื่อเชิงวัฒนธรรมเพื่อความบันเทิง — เรื่องสุขภาพ การเงิน หรือกฎหมาย ควรปรึกษาผู้เชี่ยวชาญ" }));
    y.classList.remove("active");
    btn.disabled = false;
  });
}

/* ------------------------------------------------------------------ */
/* scan (image + signature)                                           */
/* ------------------------------------------------------------------ */
function scoreBars(scores, labels) {
  const rows = Object.entries(labels).map(([k, label]) => {
    const fill = el("div", { class: "fill" });
    requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = scores[k] * 20 + "%")));
    return el("div", { class: "bar" }, el("span", { text: label }), el("div", { class: "track" }, fill), el("b", { text: String(scores[k]) }));
  });
  return el("div", { class: "bars" }, rows);
}

function bindScan() {
  let pixels = null;
  const input = $("#in-image");
  const prev = $("#img-preview");

  input.addEventListener("change", async () => {
    const f = input.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("กรุณาเลือกไฟล์รูปภาพ");
    if (f.size > 15 * 1024 * 1024) return toast("ไฟล์ใหญ่เกินไป (สูงสุด 15 MB)");
    try {
      let bmp;
      try { bmp = await createImageBitmap(f, { imageOrientation: "from-image" }); }
      catch { bmp = await createImageBitmap(f); }
      const ctx = prev.getContext("2d", { willReadFrequently: true });
      const s = Math.min(bmp.width, bmp.height);
      ctx.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 64, 64);
      bmp.close?.();
      pixels = ctx.getImageData(0, 0, 64, 64).data; // 64x64 RGBA, stays in the browser
      prev.hidden = false;
      $("#drop-text").textContent = "เลือกภาพแล้ว (ประมวลผลในเครื่องเท่านั้น)";
      $("#btn-scan").disabled = false;
    } catch {
      toast("อ่านรูปภาพไม่สำเร็จ ลองไฟล์อื่น");
    }
  });

  $("#btn-scan").addEventListener("click", () => {
    if (!pixels) return;
    const mode = +$('input[name="imgmode"]:checked').value;
    let r;
    try { r = W.imageScan(pixels, mode); } catch { return toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); }
    showResult($("#scan-result"),
      el("h3", { text: `ธาตุประจำภาพ: ${r.element}` }),
      el("p", { text: r.reading }),
      scoreBars(r.scores, { wealth: "โชคลาภ", love: "ความรัก", health: "สุขภาพ", career: "การงาน" }),
      el("p", { class: "note", text: `รหัสพลัง ${r.fingerprint} · เพื่อความบันเทิง ไม่ใช่การระบุตัวตนหรือการวินิจฉัย` }));
  });

  // ---- signature pad ----
  const cv = $("#sig");
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#fbf1da"; ctx.fillRect(0, 0, cv.width, cv.height);
  let pts = [], stroke = -1, drawing = false, lx = 0, ly = 0;
  const pos = (e) => {
    const r = cv.getBoundingClientRect();
    const k = cv.width / r.width;
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k];
  };
  cv.addEventListener("pointerdown", (e) => {
    cv.setPointerCapture(e.pointerId);
    drawing = true; stroke++;
    [lx, ly] = pos(e);
    pts.push([lx * 1000 / cv.width, ly * 1000 / cv.width, stroke]);
    ctx.beginPath(); ctx.arc(lx, ly, 1.6, 0, 7); ctx.fillStyle = "#2a1208"; ctx.fill();
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const [x, y] = pos(e);
    if (Math.hypot(x - lx, y - ly) < 2 || pts.length > 6000) return;
    ctx.strokeStyle = "#2a1208"; ctx.lineWidth = 3.4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
    lx = x; ly = y;
    pts.push([x * 1000 / cv.width, y * 1000 / cv.width, stroke]);
  });
  const end = () => { drawing = false; };
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);

  $("#btn-sig-clear").addEventListener("click", () => {
    ctx.fillStyle = "#fbf1da"; ctx.fillRect(0, 0, cv.width, cv.height);
    pts = []; stroke = -1;
    $("#sig-result").hidden = true;
  });
  $("#btn-sig").addEventListener("click", () => {
    if (pts.length < 8) return toast("เซ็นชื่อให้ยาวขึ้นอีกนิดนะ");
    let r;
    try { r = W.signature(pts); } catch { return toast("เซ็นชื่อให้ยาวขึ้นอีกนิดนะ"); }
    showResult($("#sig-result"),
      el("h3", { text: "ลายเซ็นของคุณบอกว่า…" }),
      r.traits.map((t) => el("p", { text: "• " + t })),
      scoreBars(r.scores, { wealth: "โชคลาภ", love: "ความรัก", career: "การงาน", luck: "โชคชะตา" }),
      el("p", { class: "note", text: `${r.strokes} เส้น · เพื่อความบันเทิง` }));
  });
}

/* ------------------------------------------------------------------ */
/* theme + ambient                                                    */
/* ------------------------------------------------------------------ */
const AMBIENT = {
  shrine: { g: ["🏮", "🏮", "✨"], fall: false },
  songkran: { g: ["💧", "💧", "🌼"], fall: true },
  halloween: { g: ["🦇", "🦇", "🎃", "👻"], fall: false },
  loy: { g: ["🪷", "🏮", "✨"], fall: false },
  cny: { g: ["🧧", "🏮", "🧨"], fall: true },
  newyear: { g: ["✨", "🎆", "⭐"], fall: true },
};

function buildAmbient(key) {
  const box = $("#ambient");
  box.replaceChildren();
  if (reduceMotion) return;
  const a = AMBIENT[key] || AMBIENT.shrine;
  for (let i = 0; i < 14; i++) {
    const d = 16 + Math.random() * 16;
    const f = el("span", { class: "floater" + (a.fall ? " fall" : ""), text: a.g[i % a.g.length] });
    f.style.setProperty("--x", Math.random() * 96 + "%");
    f.style.setProperty("--s", 16 + Math.random() * 22 + "px");
    f.style.setProperty("--d", d + "s");
    f.style.setProperty("--delay", -Math.random() * d + "s");
    f.style.setProperty("--sway", Math.round(Math.random() * 80 - 40) + "px");
    box.append(f);
  }
}

function bindTheme() {
  const sel = $("#theme");
  const saved = store.get("shrine.theme");
  if (saved) { state.theme = saved; sel.value = saved; }
  sel.addEventListener("change", () => { state.theme = sel.value; store.set("shrine.theme", sel.value); applyTheme(); });
  applyTheme();
}

function applyTheme() {
  const now = new Date();
  const id = state.theme === "auto" ? W.festival(now.getMonth() + 1, now.getDate()) : Math.max(0, FEST_THEME.indexOf(state.theme));
  state.festival = id;
  const key = FEST_THEME[id];
  document.body.dataset.theme = key;
  buildAmbient(key);
  const info = W.festivalInfo(id);
  $("#tab-festival-btn").textContent = id === 0 ? "ขอพร" : info.name;
  state.festRendered = false;
  if (state.tab === "festival") renderFestival();
}

/* ------------------------------------------------------------------ */
/* festival stages                                                    */
/* ------------------------------------------------------------------ */
function festBlessing(id, extra) {
  let r;
  try { r = W.blessing(id); } catch { toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); return null; }
  showResult($("#fest-result"),
    el("h3", { text: r.title }),
    el("p", { class: "verse", text: r.text }),
    el("p", { class: "center" }, "เลขมงคลเทศกาล ", el("span", { class: "badge lv0", text: r.lucky })),
    extra ? extra(r) : null);
  return r;
}

function renderFestival() {
  state.festRendered = true;
  const id = state.festival;
  const info = W.festivalInfo(id);
  $("#fest-title").textContent = id === 0 ? "ขอพรประจำวัน" : `เทศกาล${info.name}`;
  $("#fest-tag").textContent = info.tagline;
  $("#fest-result").hidden = true;
  const stage = $("#fest-stage");
  stage.replaceChildren();
  const make = [stageDaily, stageSongkran, stageHalloween, stageLoy, stageCny, stageNewYear][id];
  make(stage);
}

function stageDaily(stage) {
  stage.append(
    el("div", { class: "yantra active", style: "opacity:.9" }, svgYantra()),
    el("button", { class: "btn primary stage-btn", type: "button", text: "จุดธูปขอพร", onclick: () => festBlessing(0) }));
}
function svgYantra() {
  const d = document.createElement("div");
  d.innerHTML = $("#yantra").innerHTML; // static markup from our own page
  return d.firstElementChild;
}

function stageSongkran(stage) {
  const bowl = el("div", { class: "bowl", role: "button", tabindex: "0", "aria-label": "สาดน้ำทายโชค" },
    el("div", { class: "base" }), el("div", { class: "rim" }), el("div", { class: "water" }));
  const splash = () => {
    for (let i = 0; i < 16; i++) {
      const p = el("span", { class: "drop-p" });
      p.style.left = 90 + Math.random() * 40 + "px";
      p.style.top = "10px";
      p.style.setProperty("--dx", Math.round(Math.random() * 260 - 130) + "px");
      p.style.setProperty("--dy", Math.round(-40 - Math.random() * 140) + "px");
      bowl.append(p);
      setTimeout(() => p.remove(), 1200);
    }
    festBlessing(1);
  };
  bowl.addEventListener("click", splash);
  bowl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); splash(); } });
  stage.append(bowl, el("p", { class: "hint", text: "แตะขันน้ำเพื่อสาดน้ำทายโชค" }));
}

function stageHalloween(stage) {
  const coffin = el("div", { class: "coffin", role: "button", tabindex: "0", "aria-label": "เปิดโลงศพ" }, el("div", { class: "box" }), el("div", { class: "lid" }));
  const holder = el("div", { class: "coffin-card" });
  let open = false;
  const toggle = async () => {
    open = !open;
    coffin.classList.toggle("open", open);
    if (!open) { holder.replaceChildren(); $("#fest-result").hidden = true; return; }
    await sleep(reduceMotion ? 0 : 900);
    if (!open) return;
    let r;
    try { r = W.drawTarot(1); } catch { return toast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง"); }
    holder.replaceChildren(tarotSlot(r.cards[0], "ไพ่จากโลงศพ", 0, true));
    festBlessing(2);
  };
  coffin.addEventListener("click", toggle);
  coffin.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  stage.append(coffin, el("p", { class: "hint", text: "แตะโลงศพเพื่อเปิดฝา (แตะอีกครั้งเพื่อปิด)" }), holder);
}

const KRATHONG_SVG = `<svg viewBox="0 0 90 70" aria-hidden="true">
  <ellipse cx="45" cy="56" rx="38" ry="9" fill="#2e7d32"/>
  <g fill="#43a047"><path d="M10 52 Q45 22 80 52 Q45 44 10 52Z"/><path d="M18 48 Q45 28 72 48 Q45 42 18 48Z" fill="#66bb6a"/></g>
  <g fill="#ff80ab"><path d="M45 20 Q54 34 45 46 Q36 34 45 20Z"/><path d="M45 26 Q64 30 62 46 Q50 44 45 30Z" fill="#f06292"/><path d="M45 26 Q26 30 28 46 Q40 44 45 30Z" fill="#f06292"/></g>
  <rect x="43" y="10" width="4" height="22" fill="#fff1d3"/>
  <path d="M45 1 Q50 7 45 12 Q40 7 45 1Z" fill="#ffb347"/></svg>`;

function stageLoy(stage) {
  const pond = el("div", { class: "pond" }, el("div", { class: "moon" }));
  const btn = el("button", { class: "btn primary stage-btn", type: "button", text: "ลอยกระทง", onclick: async () => {
    btn.disabled = true;
    const k = el("div", { class: "krathong" });
    k.innerHTML = KRATHONG_SVG; // static markup
    pond.append(k);
    await sleep(reduceMotion ? 0 : 3200);
    festBlessing(3);
    setTimeout(() => { k.remove(); btn.disabled = false; }, 4200);
  } });
  stage.append(pond, btn);
}

function stageCny(stage) {
  const amount = el("div", { class: "amount" });
  const env = el("div", { class: "angpao", role: "button", tabindex: "0", "aria-label": "เปิดอั่งเปา" },
    el("div", { class: "env", text: "福" }), amount, el("div", { class: "flap" }));
  let opened = false;
  const open = () => {
    if (opened) { opened = false; env.classList.remove("open"); $("#fest-result").hidden = true; return; }
    const r = festBlessing(4, (b) => el("p", { class: "center" }, "ค่ามงคลในอั่งเปา ", el("span", { class: "badge lv0", text: String(b.angpao) }), " (สัญลักษณ์เท่านั้น ไม่ใช่เงินจริง)"));
    if (!r) return;
    amount.textContent = "มงคล " + r.angpao;
    opened = true;
    env.classList.add("open");
  };
  env.addEventListener("click", open);
  env.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  stage.append(env, el("p", { class: "hint", text: "แตะซองอั่งเปาเพื่อเปิด" }));
}

function stageNewYear(stage) {
  const now = new Date();
  const next = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  stage.append(
    el("div", { class: "countdown", text: `สวัสดีปีใหม่ ${next + 543} / ${next}` }),
    el("button", { class: "btn primary stage-btn", type: "button", text: "จุดพลุอธิษฐาน", onclick: () => { launchFireworks(7); festBlessing(5); } }));
}

/* ---- fireworks ---- */
let fwRunning = false;
function launchFireworks(bursts) {
  if (reduceMotion) return;
  const cv = $("#fireworks");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const ctx = cv.getContext("2d");
  if (!fwRunning) { // resizing resets the context, so only do it between shows
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  const cs = getComputedStyle(document.body);
  const colors = [cs.getPropertyValue("--gold"), cs.getPropertyValue("--red"), cs.getPropertyValue("--glow"), "#ffffff"].map((c) => c.trim() || "#ffd24a");
  const parts = [];
  const burst = () => {
    const cx = innerWidth * (0.15 + Math.random() * 0.7), cy = innerHeight * (0.15 + Math.random() * 0.4);
    const col = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2, v = 1.5 + Math.random() * 3.2;
      parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, col });
    }
  };
  for (let i = 0; i < bursts; i++) setTimeout(burst, i * 380);
  if (fwRunning) return;
  fwRunning = true;
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.035; p.vx *= 0.99; p.life -= 0.013;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (parts.length || t - t0 < bursts * 380 + 200) requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, innerWidth, innerHeight); fwRunning = false; }
  })(t0);
}

boot();
