// Web Audio Cultural Audio Engine for 10 Civilizations
// Generates authentic procedural melodic sequences, instrument modeling, and physical impulse response reverb.

export interface ChantMetadata {
  id: string;
  civilization: string;
  chantTitle: string;
  origChantName: string;
  mantraPreview: string;
  instrument: string;
}

export const CHANT_INFO: Record<string, ChantMetadata> = {
  thai: {
    id: 'thai',
    civilization: 'ไทย',
    chantTitle: 'ระนาดเอก 7 เสียงเท่า (7TET) & ขิมสยามมงคล',
    origChantName: 'Classical Thai Ranat Ek & Khim 7TET Melody',
    mantraPreview: 'ระนาดเอกตีคู่แปด กรอสายขิมอวยพรชัยมงคล',
    instrument: 'ระนาดเอกไม้ไผ่ & ขิมสายทองเหลือง',
  },
  chinese: {
    id: 'chinese',
    civilization: 'จีน',
    chantTitle: 'กู่เจิงสายสวรรค์ & ขลุ่ยตี่จื่อมังกรฟ้า',
    origChantName: 'Taoist Celestial Guzheng & Dizi Pentatonic Melody',
    mantraPreview: 'เอื้อนสายกู่เจิงโบราณ ห้าเสียงเพนทาโทนิกส์',
    instrument: 'พิณกู่เจิงโบราณ & ขลุ่ยตี่จื่อ',
  },
  vedic: {
    id: 'vedic',
    civilization: 'อินเดีย',
    chantTitle: 'ราคะไภรวะ (Raga Bhairav) สิตาร์ & โดรนทานปุระ',
    origChantName: 'Vedic Raga Bhairav Sitar & Tanpura Drone',
    mantraPreview: 'เสียงเมียนด์สิตาร์ก้องกังวาน มนต์โอมจักรวาล',
    instrument: 'พิณสิตาร์ & ทานปุระ Sa-Pa',
  },
  western: {
    id: 'western',
    civilization: 'ยุโรป / สากล',
    chantTitle: 'ไปป์ออร์แกนวิหาร & พิณเคลติกฮาร์ปศักดิ์สิทธิ์',
    origChantName: 'Cathedral Pipe Organ & Celtic Harp Melody',
    mantraPreview: 'คอร์ดไปป์ออร์แกนมหาวิหารหินและพิณเคลติก',
    instrument: 'ไปป์ออร์แกนวิหารหิน & พิณเคลติก',
  },
  native_american: {
    id: 'native_american',
    civilization: 'อินเดียแดง',
    chantTitle: 'ขลุ่ยไม้ซีดาร์วิญญาณสายลม & กลองชามาน',
    origChantName: 'Native Cedar Flute Melody & Shamanic Spirit Drum',
    mantraPreview: 'เสียงลมหายใจขลุ่ยไม้ซีดาร์ วิญญาณธรรมชาติ',
    instrument: 'ขลุ่ยไม้ซีดาร์วิญญาณ & กลองหนังวัวกระทิง',
  },
  islamic: {
    id: 'islamic',
    civilization: 'อิสลาม / อาหรับ',
    chantTitle: 'พิณอูด มาคามฮิญาซ (Maqam Hijaz) & รัวปิ๊กทะเลทราย',
    origChantName: 'Arabic Maqam Hijaz Oud & Tremolo Melody',
    mantraPreview: 'มาคามฮิญาซลี้ลับ แสงดาวโอเอซิสราตรี',
    instrument: 'พิณอูดโบราณ & รัวปิ๊กทะเลทราย',
  },
  vietnamese: {
    id: 'vietnamese',
    civilization: 'เวียดนาม',
    chantTitle: 'พิณด่านเบ่า (Dan Bau) สายเดียว & โก่งคันโยกเอื้อนกว้าง',
    origChantName: 'Vietnamese Dan Bau Microtonal Lever Melody',
    mantraPreview: 'เสียงใสโก่งคันโยกเอื้อนกว้างแห่งสายน้ำ',
    instrument: 'พิณด่านเบ่าสายเดียวโบราณ',
  },
  burmese: {
    id: 'burmese',
    civilization: 'พม่า',
    chantTitle: 'พิณซองเกาะ (Saung Gauk) & ฆ้องวงเจดีย์ชเวดากอง',
    origChantName: 'Burmese Royal Saung Gauk & Kyi Waing Gong',
    mantraPreview: 'สายพิณพระราชวังพม่า กริ่งระฆังทองเจดีย์',
    instrument: 'พิณซองเกาะ & ฆ้องวง (Kyi waing)',
  },
  egyptian: {
    id: 'egyptian',
    civilization: 'อียิปต์โบราณ',
    chantTitle: 'ขลุ่ยนาย (Nay) ไอยคุปต์ ลมทุ้มก้องวิหารหิน & ซิสตรัม',
    origChantName: 'Ancient Egyptian Nay Flute & Sistrum Shimmer',
    mantraPreview: 'ท่วงทำนองทุ้มก้องวิหารหิน สรรเสริญสุริยเทพรา',
    instrument: 'ขลุ่ยนายไอยคุปต์ & กระดิ่งซิสตรัม',
  },
  aztec_mayan: {
    id: 'aztec_mayan',
    civilization: 'แอซเท็ก / มายา',
    chantTitle: 'โอคารินาดินเผา (Clay Ocarina) สุริยะพีระมิดมายา',
    origChantName: 'Mesoamerican Mayan Clay Ocarina Solar Melody',
    mantraPreview: 'เสียงกลมใสแห่งขลุ่ยดินเผาโบราณชีเชนอิตซา',
    instrument: 'โอคารินาดินเผาสองห้อง & กลองเตโปนัซตลี',
  },
};

// Map civilization system IDs to presets
const CIV_TO_PRESET: Record<string, string> = {
  chinese: 'china',
  thai: 'thai',
  vedic: 'india',
  western: 'western',
  native_american: 'native',
  islamic: 'islamic',
  vietnamese: 'vietnam',
  burmese: 'burmese',
  egyptian: 'egypt',
  aztec_mayan: 'aztec',
};

// Seeded RNG: mulberry32
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const THAI_7TET = [0, 1, 2, 3, 4, 5, 6].map((i) => (i * 12) / 7);

interface InstrumentConfig {
  type: 'pluck' | 'mallet' | 'flute' | 'organ';
  wave?: OscillatorType;
  bright?: number;
  decay?: number;
  bend?: number;
  bendTime?: number;
  bendProb?: number;
  vibrato?: number;
  vibDepth?: number;
  q?: number;
  partials?: [number, number, number][];
  click?: number;
  octave?: boolean;
  attack?: number;
  release?: number;
  breath?: number;
}

interface Preset {
  root: number;
  scale: number[];
  bpm: number;
  rhythm: number[];
  inst: InstrumentConfig;
  orn?: { mordent?: number; tremolo?: number };
  layer?: { prob: number; ratio: number; inst: InstrumentConfig };
  drone?: number[];
  reverb: number;
  wet: number;
}

const PRESETS: Record<string, Preset> = {
  china: {
    root: 67,
    scale: [0, 2, 5, 7, 9],
    bpm: 72,
    rhythm: [0.5, 0.5, 1, 1, 1.5],
    inst: {
      type: 'pluck',
      wave: 'triangle',
      bright: 4500,
      decay: 1.6,
      bend: 150,
      bendTime: 0.18,
      bendProb: 0.4,
      vibrato: 6,
      vibDepth: 25,
    },
    orn: { mordent: 0.15 },
    reverb: 2.5,
    wet: 0.35,
  },
  thai: {
    root: 72,
    scale: THAI_7TET,
    bpm: 132,
    rhythm: [0.5, 0.5, 0.5, 1],
    inst: {
      type: 'mallet',
      partials: [
        [1, 1, 0.5],
        [3.93, 0.35, 0.12],
        [9.2, 0.1, 0.05],
      ],
      click: 2500,
      octave: true,
    },
    orn: { tremolo: 0.35 },
    layer: {
      prob: 0.25,
      ratio: 1,
      inst: { type: 'pluck', wave: 'triangle', bright: 6000, decay: 1.2 },
    },
    reverb: 1.2,
    wet: 0.2,
  },
  india: {
    root: 60,
    scale: [0, 1, 4, 5, 7, 8, 11],
    bpm: 66,
    rhythm: [0.5, 1, 1, 1.5, 2],
    inst: {
      type: 'pluck',
      wave: 'sawtooth',
      bright: 5000,
      q: 6,
      decay: 2.2,
      bend: 200,
      bendTime: 0.25,
      bendProb: 0.5,
      vibrato: 5,
      vibDepth: 15,
    },
    orn: { mordent: 0.2 },
    drone: [-12, -5],
    reverb: 2,
    wet: 0.3,
  },
  western: {
    root: 60,
    scale: [0, 2, 4, 5, 7, 9, 11],
    bpm: 60,
    rhythm: [1, 1, 1, 2],
    inst: { type: 'organ' },
    layer: {
      prob: 0.4,
      ratio: 2,
      inst: { type: 'pluck', wave: 'triangle', bright: 3000, decay: 2 },
    },
    drone: [-12, -5],
    reverb: 5,
    wet: 0.5,
  },
  native: {
    root: 57,
    scale: [0, 3, 5, 7, 10],
    bpm: 56,
    rhythm: [1, 1.5, 2, 3],
    inst: {
      type: 'flute',
      wave: 'sine',
      attack: 0.12,
      release: 0.4,
      breath: 0.06,
      bend: 80,
      bendTime: 0.15,
      vibrato: 5,
      vibDepth: 30,
    },
    reverb: 3.5,
    wet: 0.45,
  },
  islamic: {
    root: 62,
    scale: [0, 1, 4, 5, 7, 8, 10],
    bpm: 84,
    rhythm: [0.25, 0.5, 0.5, 1],
    inst: {
      type: 'pluck',
      wave: 'sawtooth',
      bright: 2200,
      q: 2,
      decay: 0.9,
      bend: 100,
      bendTime: 0.08,
      bendProb: 0.3,
    },
    orn: { mordent: 0.3, tremolo: 0.15 },
    reverb: 1.8,
    wet: 0.3,
  },
  vietnam: {
    root: 74,
    scale: [0, 2, 5, 7, 9],
    bpm: 60,
    rhythm: [1, 1.5, 2],
    inst: {
      type: 'pluck',
      wave: 'sine',
      bright: 8000,
      decay: 2.5,
      bend: 300,
      bendTime: 0.35,
      bendProb: 0.6,
      vibrato: 5.5,
      vibDepth: 40,
    },
    reverb: 2,
    wet: 0.3,
  },
  burmese: {
    root: 60,
    scale: [0, 2, 4, 7, 9],
    bpm: 100,
    rhythm: [0.5, 0.5, 1],
    inst: { type: 'pluck', wave: 'triangle', bright: 3500, decay: 1.3 },
    orn: { mordent: 0.2 },
    layer: {
      prob: 0.3,
      ratio: 1,
      inst: {
        type: 'mallet',
        partials: [
          [1, 1, 1.2],
          [2.0, 0.4, 0.6],
          [2.76, 0.3, 0.4],
        ],
        click: 4000,
      },
    },
    reverb: 1.5,
    wet: 0.25,
  },
  egypt: {
    root: 62,
    scale: [0, 1, 4, 5, 7, 8, 10],
    bpm: 58,
    rhythm: [0.5, 1, 1.5, 2],
    inst: {
      type: 'flute',
      wave: 'triangle',
      attack: 0.18,
      release: 0.5,
      breath: 0.12,
      bend: 120,
      bendTime: 0.2,
      vibrato: 5,
      vibDepth: 20,
    },
    orn: { mordent: 0.2 },
    drone: [-12],
    reverb: 3.5,
    wet: 0.45,
  },
  aztec: {
    root: 69,
    scale: [0, 3, 5, 8, 10],
    bpm: 76,
    rhythm: [0.5, 1, 1, 2],
    inst: {
      type: 'flute',
      wave: 'sine',
      attack: 0.04,
      release: 0.2,
      breath: 0.03,
      vibrato: 6,
      vibDepth: 10,
    },
    reverb: 3,
    wet: 0.4,
  },
};

class CulturalAudioEngine {
  ctx: AudioContext | null = null;
  out: GainNode | null = null;
  noise: AudioBuffer | null = null;
  irCache: Record<number, AudioBuffer> = {};
  current: GainNode | null = null;
  rand: () => number = Math.random;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const c = (this.ctx = new AudioCtx());
      this.out = c.createGain();
      this.out.gain.value = 0.8;
      const limiter = c.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.ratio.value = 12;
      this.out.connect(limiter).connect(c.destination);
      this.noise = this.makeNoise(2);
    }
    if (this.ctx && this.ctx.state !== 'running') {
      try {
        await this.ctx.resume();
      } catch {}
    }
  }

  makeNoise(sec: number): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const c = this.ctx;
    const b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  getIR(sec: number): AudioBuffer {
    if (this.irCache[sec]) return this.irCache[sec];
    if (!this.ctx) throw new Error('No audio context');
    const c = this.ctx;
    const len = Math.floor(c.sampleRate * sec);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
    }
    return (this.irCache[sec] = ir);
  }

  freq(root: number, semis: number): number {
    return 440 * Math.pow(2, (root + semis - 69) / 12);
  }

  degree(p: Preset, d: number): number {
    const n = p.scale.length;
    return p.scale[((d % n) + n) % n] + 12 * Math.floor(d / n);
  }

  melody(p: Preset): { d: number; beat: number; dur: number }[] {
    const r = this.rand;
    const n = p.scale.length;
    const len = 8;
    const fifth = Math.max(
      0,
      p.scale.findIndex((s) => Math.abs(s - 7) < 0.5)
    );
    const a: { d: number; beat: number; dur: number }[] = [];
    let beat = 0;
    let d = 0;
    while (beat < len) {
      const dur = Math.min(p.rhythm[Math.floor(r() * p.rhythm.length)], len - beat);
      const x = r();
      d += x < 0.35 ? 1 : x < 0.7 ? -1 : x < 0.82 ? 2 : x < 0.94 ? -2 : 0;
      d = Math.max(-2, Math.min(n + 3, d));
      a.push({ d, beat, dur });
      beat += dur;
    }
    a[a.length - 1].d = fifth;
    const b = a.map((item) => ({
      ...item,
      beat: item.beat + len,
      d: r() < 0.3 ? item.d + (r() < 0.5 ? 1 : -1) : item.d,
    }));
    const last = b[b.length - 1];
    last.d = last.d > n / 2 ? n : 0;
    last.dur += 2;
    return [...a, ...b];
  }

  async play(civ: string, { seed = Date.now() }: { seed?: number } = {}): Promise<number> {
    const p = PRESETS[civ];
    if (!p) throw new Error(`Unknown civilization: ${civ}`);
    await this.init();
    if (!this.ctx || !this.out) return 0;
    this.stop();
    this.rand = mulberry32(seed);

    const c = this.ctx;
    const t0 = c.currentTime + 0.05;
    const beat = 60 / p.bpm;
    const bus = c.createGain();
    const dry = c.createGain();
    const wet = c.createGain();
    const verb = c.createConvolver();
    verb.buffer = this.getIR(p.reverb);
    dry.gain.value = 1 - p.wet;
    wet.gain.value = p.wet;
    bus.connect(dry).connect(this.out);
    bus.connect(verb).connect(wet).connect(this.out);
    this.current = bus;

    const notes = this.melody(p);
    notes.forEach((n) => {
      const f = this.freq(p.root, this.degree(p, n.d));
      const up = this.freq(p.root, this.degree(p, n.d + 1));
      this.note(p, f, up, t0 + n.beat * beat, n.dur * beat, bus);
    });
    const last = notes[notes.length - 1];
    const end = t0 + (last.beat + last.dur) * beat;
    if (p.drone) this.drone(p, t0, end + 0.5, bus);
    return end - t0;
  }

  stop(): void {
    if (!this.current || !this.ctx) return;
    const g = this.current;
    g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    setTimeout(() => {
      try {
        g.disconnect();
      } catch {}
    }, 400);
    this.current = null;
  }

  note(p: Preset, f: number, upper: number, t: number, dur: number, out: AudioNode): void {
    const o = p.orn || {};
    const r = this.rand;
    const play = (inst: InstrumentConfig, ...a: [number, number, number, AudioNode, boolean, number]) => {
      if (inst.type === 'pluck') this.pluck(inst, ...a);
      else if (inst.type === 'mallet') this.mallet(inst, ...a);
      else if (inst.type === 'flute') this.flute(inst, ...a);
      else if (inst.type === 'organ') this.organ(inst, ...a);
    };

    if (o.mordent && dur > 0.3 && r() < o.mordent) {
      play(p.inst, upper, t, 0.07, out, true, 0.7);
      t += 0.07;
      dur -= 0.07;
    }
    if (o.tremolo && dur > 0.4 && r() < o.tremolo) {
      for (let x = 0; x < dur - 0.05; x += 0.07) {
        play(p.inst, f, t + x, 0.07, out, true, 0.55 + 0.35 * r());
      }
    } else {
      play(p.inst, f, t, dur, out, false, 1);
    }
    if (p.layer && r() < p.layer.prob) {
      play(p.layer.inst, f * p.layer.ratio, t, dur, out, false, 0.5);
    }
  }

  vibrato(param: AudioParam, t: number, rate: number, depthCents: number, end: number): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = rate;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(depthCents, t + 0.3);
    lfo.connect(depth).connect(param);
    lfo.start(t);
    lfo.stop(end);
  }

  pluck(
    s: InstrumentConfig,
    f: number,
    t: number,
    dur: number,
    out: AudioNode,
    grace = false,
    vel = 1
  ): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const decay = grace ? Math.min(s.decay || 1, 0.4) : s.decay || 1.5;
    const end = t + decay;
    const osc = c.createOscillator();
    const flt = c.createBiquadFilter();
    const g = c.createGain();
    osc.type = s.wave || 'triangle';
    osc.frequency.value = f;
    if (s.bend && !grace && this.rand() < (s.bendProb ?? 1)) {
      osc.detune.setValueAtTime(-s.bend, t);
      osc.detune.linearRampToValueAtTime(0, t + (s.bendTime || 0.15));
    }
    if (s.vibrato && !grace && dur > 0.4) {
      this.vibrato(osc.detune, t + 0.2, s.vibrato, s.vibDepth || 20, end);
    }
    flt.type = 'lowpass';
    flt.Q.value = s.q || 1;
    flt.frequency.setValueAtTime(s.bright || 4000, t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(f * 1.5, 200), t + decay * 0.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.3 * vel, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(flt).connect(g).connect(out);
    osc.start(t);
    osc.stop(end + 0.05);
  }

  mallet(
    s: InstrumentConfig,
    f: number,
    t: number,
    _dur: number,
    out: AudioNode,
    _grace = false,
    vel = 1
  ): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const bases = s.octave ? [[f, 1], [f / 2, 0.6]] : [[f, 1]];
    bases.forEach(([base, v]) =>
      (s.partials || []).forEach(([ratio, amp, dec]) => {
        if (base * ratio > c.sampleRate / 2) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.frequency.value = base * ratio;
        g.gain.setValueAtTime(0.25 * amp * v * vel, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + dec + 0.05);
      })
    );
    if (this.noise) {
      const n = c.createBufferSource();
      const hp = c.createBiquadFilter();
      const g = c.createGain();
      n.buffer = this.noise;
      hp.type = 'highpass';
      hp.frequency.value = s.click || 2500;
      g.gain.setValueAtTime(0.2 * vel, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      n.connect(hp).connect(g).connect(out);
      n.start(t, Math.random());
      n.stop(t + 0.04);
    }
  }

  flute(
    s: InstrumentConfig,
    f: number,
    t: number,
    dur: number,
    out: AudioNode,
    grace = false,
    vel = 1
  ): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const A = grace ? 0.01 : s.attack || 0.1;
    const hold = t + Math.max(A, dur);
    const end = hold + (s.release || 0.3);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = s.wave || 'sine';
    osc.frequency.value = f;
    if (s.bend && !grace) {
      osc.detune.setValueAtTime(-s.bend, t);
      osc.detune.linearRampToValueAtTime(0, t + (s.bendTime || 0.15));
    }
    if (s.vibrato && dur > 0.4) {
      this.vibrato(osc.detune, t + Math.min(0.25, dur * 0.4), s.vibrato, s.vibDepth || 20, end);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.28 * vel, t + A);
    g.gain.setValueAtTime(0.28 * vel, hold);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(end + 0.05);

    if (s.breath && this.noise) {
      const n = c.createBufferSource();
      const bp = c.createBiquadFilter();
      const ng = c.createGain();
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

  organ(
    _s: InstrumentConfig,
    f: number,
    t: number,
    dur: number,
    out: AudioNode,
    _grace = false,
    vel = 1
  ): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const end = t + dur + 0.25;
    const g = c.createGain();
    [
      [0.5, 0.5],
      [1, 1],
      [2, 0.5],
      [3, 0.25],
      [4, 0.25],
    ].forEach(([h, a]) => {
      const o = c.createOscillator();
      const og = c.createGain();
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

  drone(p: Preset, t: number, end: number, out: AudioNode): void {
    if (!this.ctx || !p.drone) return;
    const c = this.ctx;
    p.drone.forEach((semi) => {
      const o = c.createOscillator();
      const lp = c.createBiquadFilter();
      const g = c.createGain();
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

// Global engine singleton
const engine = new CulturalAudioEngine();
let isMuted = false;
let activeChantId: string | null = null;
const listeners = new Set<(chantId: string | null) => void>();

export function subscribeChantState(cb: (chantId: string | null) => void): () => void {
  listeners.add(cb);
  cb(activeChantId);
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners(id: string | null) {
  activeChantId = id;
  listeners.forEach((cb) => cb(id));
}

export function stopChant(): void {
  engine.stop();
  notifyListeners(null);
}

export function toggleMuteChant(): boolean {
  isMuted = !isMuted;
  if (isMuted) {
    stopChant();
  }
  return isMuted;
}

export function isChantMuted(): boolean {
  return isMuted;
}

export function getActiveChantId(): string | null {
  return activeChantId;
}

export function playChant(sysId: string): void {
  if (isMuted) return;
  const presetKey = CIV_TO_PRESET[sysId] || 'thai';
  engine
    .play(presetKey)
    .then(() => {
      notifyListeners(sysId);
    })
    .catch((err) => {
      console.warn('CulturalAudioEngine error:', err);
    });
}
