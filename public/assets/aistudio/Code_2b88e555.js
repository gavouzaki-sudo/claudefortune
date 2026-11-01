// ---------- Seeded RNG: ใส่ seed เดิม = ได้ทำนองเดิม ----------
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const THAI_7TET = [0, 1, 2, 3, 4, 5, 6].map(i => (i * 12) / 7); // 7 เสียงเท่าแบบไทย

// ---------- Preset ของแต่ละอารยธรรม ----------
const PRESETS = {
  china: { // กู่เจิง: กดสายให้เสียงเอื้อน + สั่นเสียง
    root: 67, scale: [0, 2, 5, 7, 9], bpm: 72, rhythm: [0.5, 0.5, 1, 1, 1.5],
    inst: { type: 'pluck', wave: 'triangle', bright: 4500, decay: 1.6,
            bend: 150, bendTime: 0.18, bendProb: 0.4, vibrato: 6, vibDepth: 25 },
    orn: { mordent: 0.15 }, reverb: 2.5, wet: 0.35,
  },
  thai: { // ระนาดเอก ตีคู่แปด + กรอ / ขิมเป็นเสียงเสริม
    root: 72, scale: THAI_7TET, bpm: 132, rhythm: [0.5, 0.5, 0.5, 1],
    inst: { type: 'mallet', partials: [[1, 1, 0.5], [3.93, 0.35, 0.12], [9.2, 0.1, 0.05]],
            click: 2500, octave: true },
    orn: { tremolo: 0.35 },
    layer: { prob: 0.25, ratio: 1, inst: { type: 'pluck', wave: 'triangle', bright: 6000, decay: 1.2 } },
    reverb: 1.2, wet: 0.2,
  },
  india: { // ซิตาร์ (เมียนด์) + ทานปุระ Sa-Pa
    root: 60, scale: [0, 1, 4, 5, 7, 8, 11], bpm: 66, rhythm: [0.5, 1, 1, 1.5, 2],
    inst: { type: 'pluck', wave: 'sawtooth', bright: 5000, q: 6, decay: 2.2,
            bend: 200, bendTime: 0.25, bendProb: 0.5, vibrato: 5, vibDepth: 15 },
    orn: { mordent: 0.2 }, drone: [-12, -5], reverb: 2, wet: 0.3,
  },
  western: { // ไปป์ออร์แกน + พิณเคลติก
    root: 60, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 60, rhythm: [1, 1, 1, 2],
    inst: { type: 'organ' },
    layer: { prob: 0.4, ratio: 2, inst: { type: 'pluck', wave: 'triangle', bright: 3000, decay: 2 } },
    drone: [-12, -5], reverb: 5, wet: 0.5,
  },
  native: { // ขลุ่ยไม้ซีดาร์ ลมหายใจชัด
    root: 57, scale: [0, 3, 5, 7, 10], bpm: 56, rhythm: [1, 1.5, 2, 3],
    inst: { type: 'flute', wave: 'sine', attack: 0.12, release: 0.4, breath: 0.06,
            bend: 80, bendTime: 0.15, vibrato: 5, vibDepth: 30 },
    reverb: 3.5, wet: 0.45,
  },
  islamic: { // อูด มาคอม Hijaz + รัวปิ๊ก
    root: 62, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 84, rhythm: [0.25, 0.5, 0.5, 1],
    inst: { type: 'pluck', wave: 'sawtooth', bright: 2200, q: 2, decay: 0.9,
            bend: 100, bendTime: 0.08, bendProb: 0.3 },
    orn: { mordent: 0.3, tremolo: 0.15 }, reverb: 1.8, wet: 0.3,
  },
  vietnam: { // ด่านเบ่า: เสียงใส โก่งคันโยกเอื้อนกว้าง
    root: 74, scale: [0, 2, 5, 7, 9], bpm: 60, rhythm: [1, 1.5, 2],
    inst: { type: 'pluck', wave: 'sine', bright: 8000, decay: 2.5,
            bend: 300, bendTime: 0.35, bendProb: 0.6, vibrato: 5.5, vibDepth: 40 },
    reverb: 2, wet: 0.3,
  },
  burmese: { // ซองเกาะ + ฆ้องวง (Kyi waing)
    root: 60, scale: [0, 2, 4, 7, 9], bpm: 100, rhythm: [0.5, 0.5, 1],
    inst: { type: 'pluck', wave: 'triangle', bright: 3500, decay: 1.3 },
    orn: { mordent: 0.2 },
    layer: { prob: 0.3, ratio: 1, inst: { type: 'mallet',
             partials: [[1, 1, 1.2], [2.0, 0.4, 0.6], [2.76, 0.3, 0.4]], click: 4000 } },
    reverb: 1.5, wet: 0.25,
  },
  egypt: { // ขลุ่ยนาย: ลมเยอะ ทุ้ม ก้องแบบวิหารหิน
    root: 62, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 58, rhythm: [0.5, 1, 1.5, 2],
    inst: { type: 'flute', wave: 'triangle', attack: 0.18, release: 0.5, breath: 0.12,
            bend: 120, bendTime: 0.2, vibrato: 5, vibDepth: 20 },
    orn: { mordent: 0.2 }, drone: [-12], reverb: 3.5, wet: 0.45,
  },
  aztec: { // โอคารินาดินเผา: เสียงกลมใส ลมน้อย
    root: 69, scale: [0, 3, 5, 8, 10], bpm: 76, rhythm: [0.5, 1, 1, 2],
    inst: { type: 'flute', wave: 'sine', attack: 0.04, release: 0.2, breath: 0.03,
            vibrato: 6, vibDepth: 10 },
    reverb: 3, wet: 0.4,
  },
};

class CulturalAudioEngine {
  constructor() { this.ctx = null; this.irCache = {}; this.current = null; }

  // ต้องเรียกจาก user gesture (คลิก/แตะ) ตามกฎ autoplay
  async init() {
    if (!this.ctx) {
      const c = (this.ctx = new (window.AudioContext || window.webkitAudioContext)());
      this.out = c.createGain();
      this.out.gain.value = 0.8;
      const limiter = c.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.ratio.value = 12;
      this.out.connect(limiter).connect(c.destination);
      this.noise = this.makeNoise(2); // สร้างครั้งเดียว ใช้ซ้ำทุกโน้ต
    }
    if (this.ctx.state !== 'running') await this.ctx.resume();
  }

  makeNoise(sec) {
    const c = this.ctx, b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  getIR(sec) { // Reverb แยกขนาดห้องตามสถานที่ (cache ไว้)
    if (this.irCache[sec]) return this.irCache[sec];
    const c = this.ctx, len = Math.floor(c.sampleRate * sec);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return (this.irCache[sec] = ir);
  }

  freq(root, semis) { return 440 * Math.pow(2, (root + semis - 69) / 12); }

  degree(p, d) { // ขั้นสเกล -> semitone (รองรับข้ามอ็อกเทฟและไมโครโทน)
    const n = p.scale.length;
    return p.scale[((d % n) + n) % n] + 12 * Math.floor(d / n);
  }

  // ---------- แต่งทำนอง: วลีถาม (จบที่ขั้น 5) + วลีตอบ (จบที่โทนิก) ----------
  melody(p) {
    const r = this.rand, n = p.scale.length, len = 8;
    const fifth = Math.max(0, p.scale.findIndex(s => Math.abs(s - 7) < 0.5));
    const a = [];
    let beat = 0, d = 0;
    while (beat < len) {
      const dur = Math.min(p.rhythm[Math.floor(r() * p.rhythm.length)], len - beat);
      const x = r();
      d += x < 0.35 ? 1 : x < 0.7 ? -1 : x < 0.82 ? 2 : x < 0.94 ? -2 : 0;
      d = Math.max(-2, Math.min(n + 3, d));
      a.push({ d, beat, dur });
      beat += dur;
    }
    a[a.length - 1].d = fifth;
    const b = a.map(x => ({ ...x, beat: x.beat + len,
      d: r() < 0.3 ? x.d + (r() < 0.5 ? 1 : -1) : x.d }));
    const last = b[b.length - 1];
    last.d = last.d > n / 2 ? n : 0;
    last.dur += 2; // ปล่อยโน้ตจบให้ค้าง
    return [...a, ...b];
  }

  async play(civ, { seed = Date.now() } = {}) {
    const p = PRESETS[civ];
    if (!p) throw new Error(`Unknown civilization: ${civ}`);
    await this.init();
    this.stop();
    this.rand = mulberry32(seed);

    const c = this.ctx, t0 = c.currentTime + 0.05, beat = 60 / p.bpm;
    const bus = c.createGain(), dry = c.createGain(), wet = c.createGain();
    const verb = c.createConvolver();
    verb.buffer = this.getIR(p.reverb);
    dry.gain.value = 1 - p.wet;
    wet.gain.value = p.wet;
    bus.connect(dry).connect(this.out);
    bus.connect(verb).connect(wet).connect(this.out);
    this.current = bus;

    const notes = this.melody(p);
    notes.forEach(n => {
      const f = this.freq(p.root, this.degree(p, n.d));
      const up = this.freq(p.root, this.degree(p, n.d + 1));
      this.note(p, f, up, t0 + n.beat * beat, n.dur * beat, bus);
    });
    const last = notes[notes.length - 1];
    const end = t0 + (last.beat + last.dur) * beat;
    if (p.drone) this.drone(p, t0, end + 0.5, bus);
    return end - t0; // ความยาวเพลง (วินาที)
  }

  stop() {
    if (!this.current) return;
    const g = this.current;
    g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    setTimeout(() => g.disconnect(), 400);
    this.current = null;
  }

  // ---------- ลูกเล่น: เสียงประดับ / รัว / เลเยอร์ ----------
  note(p, f, upper, t, dur, out) {
    const o = p.orn || {}, r = this.rand;
    const play = (inst, ...a) => this[inst.type](inst, ...a);
    if (o.mordent && dur > 0.3 && r() < o.mordent) {
      play(p.inst, upper, t, 0.07, out, true, 0.7); // โน้ตประดับจากขั้นบน
      t += 0.07; dur -= 0.07;
    }
    if (o.tremolo && dur > 0.4 && r() < o.tremolo) { // กรอระนาด / รัวปิ๊กอูด
      for (let x = 0; x < dur - 0.05; x += 0.07)
        play(p.inst, f, t + x, 0.07, out, true, 0.55 + 0.35 * r());
    } else {
      play(p.inst, f, t, dur, out, false, 1);
    }
    if (p.layer && r() < p.layer.prob)
      play(p.layer.inst, f * p.layer.ratio, t, dur, out, false, 0.5);
  }

  vibrato(param, t, rate, depthCents, end) { // แก้แล้ว: LFO -> Gain -> detune
    const c = this.ctx, lfo = c.createOscillator(), depth = c.createGain();
    lfo.frequency.value = rate;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(depthCents, t + 0.3); // ค่อยๆ สั่น
    lfo.connect(depth).connect(param);
    lfo.start(t);
    lfo.stop(end);
  }

  // ---------- เครื่องดีด: กู่เจิง ซิตาร์ อูด ด่านเบ่า ซองเกาะ ขิม พิณ ----------
  pluck(s, f, t, dur, out, grace = false, vel = 1) {
    const c = this.ctx, decay = grace ? Math.min(s.decay, 0.4) : s.decay, end = t + decay;
    const osc = c.createOscillator(), flt = c.createBiquadFilter(), g = c.createGain();
    osc.type = s.wave;
    osc.frequency.value = f;
    if (s.bend && !grace && this.rand() < (s.bendProb ?? 1)) {
      osc.detune.setValueAtTime(-s.bend, t);
      osc.detune.linearRampToValueAtTime(0, t + s.bendTime);
    }
    if (s.vibrato && !grace && dur > 0.4)
      this.vibrato(osc.detune, t + 0.2, s.vibrato, s.vibDepth, end);
    flt.type = 'lowpass';
    flt.Q.value = s.q || 1;
    flt.frequency.setValueAtTime(s.bright, t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(f * 1.5, 200), t + decay * 0.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.3 * vel, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(flt).connect(g).connect(out);
    osc.start(t);
    osc.stop(end + 0.05);
  }

  // ---------- เครื่องตี: ระนาด ฆ้อง (Inharmonic partials + เสียงหัวไม้) ----------
  mallet(s, f, t, dur, out, grace = false, vel = 1) {
    const c = this.ctx;
    const bases = s.octave ? [[f, 1], [f / 2, 0.6]] : [[f, 1]]; // ตีคู่แปด
    bases.forEach(([base, v]) => s.partials.forEach(([ratio, amp, dec]) => {
      if (base * ratio > c.sampleRate / 2) return;
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = base * ratio;
      g.gain.setValueAtTime(0.25 * amp * v * vel, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + dec + 0.05);
    }));
    const n = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
    n.buffer = this.noise;
    hp.type = 'highpass';
    hp.frequency.value = s.click;
    g.gain.setValueAtTime(0.2 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    n.connect(hp).connect(g).connect(out);
    n.start(t, Math.random());
    n.stop(t + 0.04);
  }

  // ---------- ขลุ่ย: นาย ขลุ่ยซีดาร์ โอคาริน่า ----------
  flute(s, f, t, dur, out, grace = false, vel = 1) {
    const c = this.ctx, A = grace ? 0.01 : s.attack;
    const hold = t + Math.max(A, dur), end = hold + s.release;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = s.wave;
    osc.frequency.value = f;
    if (s.bend && !grace) {
      osc.detune.setValueAtTime(-s.bend, t);
      osc.detune.linearRampToValueAtTime(0, t + s.bendTime);
    }
    if (s.vibrato && dur > 0.4)
      this.vibrato(osc.detune, t + Math.min(0.25, dur * 0.4), s.vibrato, s.vibDepth, end);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.28 * vel, t + A);
    g.gain.setValueAtTime(0.28 * vel, hold);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(end + 0.05);

    if (s.breath) { // เสียงลม: พุ่งตอนต้นโน้ต (chiff) แล้วเบาลง
      const n = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain();
      n.buffer = this.noise;
      n.loop = true;
      bp.type = 'bandpass';
      bp.frequency.value = Math.min(f * 2, 8000);
      bp.Q.value = 1.2;
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.linearRampToValueAtTime(s.breath * vel, t + A * 0.5);
      ng.gain.exponentialRampToValueAtTime(s.breath * 0.35 * vel, t + A * 1.5);
      ng.gain.exponentialRampToValueAtTime(0.0001, end);
      n.connect(bp).connect(ng).connect(out);
      n.start(t, Math.random());
      n.stop(end + 0.05);
    }
  }

  // ---------- ไปป์ออร์แกน: ซ้อน stop 16' 8' 4' 2⅔' 2' เสียงค้างเต็ม ----------
  organ(s, f, t, dur, out, grace = false, vel = 1) {
    const c = this.ctx, end = t + dur + 0.25, g = c.createGain();
    [[0.5, 0.5], [1, 1], [2, 0.5], [3, 0.25], [4, 0.25]].forEach(([h, a]) => {
      const o = c.createOscillator(), og = c.createGain();
      o.frequency.value = f * h;
      og.gain.value = a;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(end + 0.05);
    });
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.1 * vel, t + 0.06);
    g.gain.setValueAtTime(0.1 * vel, t + dur);
    g.gain.linearRampToValueAtTime(0.0001, end);
    g.connect(out);
  }

  // ---------- เสียงโดรนพื้นหลัง (ทานปุระ / pedal ออร์แกน) ----------
  drone(p, t, end, out) {
    const c = this.ctx;
    p.drone.forEach(semi => {
      const o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.value = this.freq(p.root, semi);
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.035, t + 1);
      g.gain.setValueAtTime(0.035, end - 1);
      g.gain.linearRampToValueAtTime(0.0001, end);
      o.connect(lp).connect(g).connect(out);
      o.start(t);
      o.stop(end + 0.05);
    });
  }
}