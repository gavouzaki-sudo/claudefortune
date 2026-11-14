// Ambient Soundscape Web Audio Synthesis Engine
// Generates authentic procedural background soundscapes:
// 1. Bamboo Wind Chimes (กระดิ่งลมไม้ไผ่)
// 2. Gentle Temple Rain (เสียงฝนพรำเบาๆ)
// 3. Tibetan Singing Bowl & Om Chant Drone (เสียงสวดมนต์ทิเบต & ทิเบตันซิงกิ้งโบว์ล)
// 4. Ancient Temple Bell & Sacred Gong (เสียงระฆังวัด & ฆ้องมงคล)

import { getSharedAudioContext } from './audioContext';

export type SoundscapeType = 'none' | 'bamboo_chime' | 'temple_rain' | 'tibetan_bowl' | 'temple_bell';

interface SoundscapeInfo {
  id: SoundscapeType;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

export const SOUNDSCAPES: SoundscapeInfo[] = [
  {
    id: 'none',
    title: 'ปิดเสียงบรรยากาศ',
    subtitle: 'ไม่มีเสียงพื้นหลัง',
    icon: '🔇',
    description: 'ปิดเสียงประกอบฉากหลังทั้งหมด',
  },
  {
    id: 'bamboo_chime',
    title: 'กระดิ่งลมไม้ไผ่',
    subtitle: 'Bamboo Wind Chimes',
    icon: '🎋',
    description: 'เสียงเคาะกระดิ่งไม้ไผ่กังวานกระทบลมเบาๆ ให้ความรู้สึกร่มเย็น สงบใจในสวนเซน',
  },
  {
    id: 'temple_rain',
    title: 'ฝนพรำชายคาวัด',
    subtitle: 'Gentle Temple Rain',
    icon: '🌧️',
    description: 'เสียงเม็ดฝนตกกระทบกระเบื้องดินเผาและใบไม้ นุ่มนวล สบาย ผ่อนคลายอารมณ์',
  },
  {
    id: 'tibetan_bowl',
    title: 'สวดมนต์ทิเบต & Singing Bowl',
    subtitle: 'Tibetan Bowl & Om Drone',
    icon: '🧘',
    description: 'เสียงสวดโอมและชามร้องกังวานคลื่นสมอง 432Hz/108Hz ปรับพลังจักระเข้าสู่สมาธิลึก',
  },
  {
    id: 'temple_bell',
    title: 'ระฆังมงคลวัดโบราณ',
    subtitle: 'Sacred Temple Bells',
    icon: '🔔',
    description: 'เสียงก้องกังวานของระฆังทองสำริดวัดบนยอดเขา ขจัดพลังลบ นำพาความสิริมงคล',
  },
];

class AmbientSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentType: SoundscapeType = 'none';
  private currentVolume = 0.65;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private loopTimer: number | null = null;
  private chimeTimers: Set<number> = new Set();
  private requestSeq = 0;
  private rainNoiseNode: AudioNode | null = null;

  private async getContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    const c = await getSharedAudioContext();
    if (!c) return null;

    if (this.ctx !== c || !this.masterGain) {
      this.ctx = c;
      this.masterGain = c.createGain();
      this.masterGain.gain.value = this.currentVolume;

      // Compressor limiter for ultra smooth sound
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -8;
      comp.knee.value = 18;
      comp.ratio.value = 8;
      comp.attack.value = 0.05;
      comp.release.value = 0.25;

      this.masterGain.connect(comp).connect(c.destination);
    }

    return this.ctx;
  }

  getSoundscape(): SoundscapeType {
    return this.currentType;
  }

  getVolume(): number {
    return this.currentVolume;
  }

  setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
    notifySoundscapeListeners();
  }

  async setSoundscape(type: SoundscapeType): Promise<void> {
    if (this.currentType === type && type !== 'none') return;
    const reqId = ++this.requestSeq;
    this.stopCurrent();
    this.currentType = type;

    if (type === 'none') {
      notifySoundscapeListeners();
      return;
    }

    const ctx = await this.getContext();
    if (reqId !== this.requestSeq || this.currentType !== type) {
      return;
    }
    if (!ctx || !this.masterGain) {
      notifySoundscapeListeners();
      return;
    }

    switch (type) {
      case 'bamboo_chime':
        this.startBambooChimes(ctx);
        break;
      case 'temple_rain':
        this.startTempleRain(ctx);
        break;
      case 'tibetan_bowl':
        this.startTibetanSingingBowl(ctx);
        break;
      case 'temple_bell':
        this.startTempleBell(ctx);
        break;
    }

    notifySoundscapeListeners();
  }

  private stopCurrent(): void {
    if (this.loopTimer) {
      window.clearInterval(this.loopTimer);
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    this.chimeTimers.forEach((id) => window.clearTimeout(id));
    this.chimeTimers.clear();

    if (this.rainNoiseNode) {
      try {
        (this.rainNoiseNode as AudioBufferSourceNode).stop();
      } catch {}
      this.rainNoiseNode = null;
    }

    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  // 1. Bamboo Wind Chimes Generator
  private startBambooChimes(ctx: AudioContext): void {
    // Bamboo pipes natural resonant frequencies (Hz)
    const bambooPitches = [420, 510, 630, 780, 940, 1150, 1380];

    const strikeChime = (freq: number, delayMs = 0, force = 0.5) => {
      const id = window.setTimeout(() => {
        this.chimeTimers.delete(id);
        if (this.currentType !== 'bamboo_chime' || !this.masterGain) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const flt = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Bamboo timbre has a hollow woody triangle/sine harmonic profile
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        // Subtle downward pitch bend on wood strike
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.15);

        flt.type = 'bandpass';
        flt.frequency.value = freq;
        flt.Q.value = 16; // sharp resonance of hollow cylinder

        const dur = 0.8 + Math.random() * 0.6;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.28 * force, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(flt).connect(gain).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + dur + 0.05);

        // Secondary wooden click rattle
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(220 + Math.random() * 180, now);
        clickGain.gain.setValueAtTime(0.08 * force, now);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
        clickOsc.connect(clickGain).connect(this.masterGain);
        clickOsc.start(now);
        clickOsc.stop(now + 0.05);
      }, delayMs);
      this.chimeTimers.add(id);
    };

    const triggerBreezeCluster = () => {
      if (this.currentType !== 'bamboo_chime') return;
      // 2 to 4 rapid bamboo strikes simulating a breeze gust
      const strikeCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < strikeCount; i++) {
        const pitch = bambooPitches[Math.floor(Math.random() * bambooPitches.length)];
        const delay = i * (80 + Math.random() * 120);
        const strength = 0.35 + Math.random() * 0.65;
        strikeChime(pitch, delay, strength);
      }
    };

    // First strike immediately
    triggerBreezeCluster();

    // Recurring breeze schedule
    const scheduleNext = () => {
      if (this.currentType !== 'bamboo_chime') return;
      const nextTime = 1200 + Math.random() * 2600;
      this.loopTimer = window.setTimeout(() => {
        triggerBreezeCluster();
        scheduleNext();
      }, nextTime);
    };
    scheduleNext();
  }

  // 2. Gentle Temple Rain Generator
  private startTempleRain(ctx: AudioContext): void {
    if (!this.masterGain) return;

    // Pink / filtered noise buffer for steady soothing rainfall
    const bufSize = ctx.sampleRate * 4;
    const noiseBuf = ctx.createBuffer(2, bufSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = noiseBuf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.1600000;
        b2 = 0.57000 * b2 + white * 0.5600000;
        data[i] = (b0 + b1 + b2) * 0.14;
      }
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuf;
    rainSource.loop = true;

    // Dual filtering: lowpass + gentle bandpass for soft water sound
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 120;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.38;

    rainSource.connect(lp).connect(hp).connect(rainGain).connect(this.masterGain);
    rainSource.start();
    this.rainNoiseNode = rainSource;

    // Procedural randomized raindrop drops on temple roof / puddles
    const dropTimer = window.setInterval(() => {
      if (this.currentType !== 'temple_rain' || !this.masterGain) return;
      if (Math.random() < 0.65) {
        const dropNow = ctx.currentTime;
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();

        const baseF = 1200 + Math.random() * 1400;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(baseF, dropNow);
        dropOsc.frequency.exponentialRampToValueAtTime(baseF * 0.5, dropNow + 0.04);

        dropGain.gain.setValueAtTime(0.0001, dropNow);
        dropGain.gain.linearRampToValueAtTime(0.045 + Math.random() * 0.05, dropNow + 0.003);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, dropNow + 0.05);

        dropOsc.connect(dropGain).connect(this.masterGain);
        dropOsc.start(dropNow);
        dropOsc.stop(dropNow + 0.06);
      }
    }, 180);

    this.activeNodes.push({
      stop: () => {
        window.clearInterval(dropTimer);
        try {
          rainSource.stop();
        } catch {}
      },
    });
  }

  // 3. Tibetan Singing Bowl & Om Chant Drone Generator
  private startTibetanSingingBowl(ctx: AudioContext): void {
    if (!this.masterGain) return;

    // Sacred meditation base frequencies:
    // 108Hz (Sacred Hindu/Buddhist Om) & 112Hz (Theta wave 4Hz binaural entrainment pulse)
    const baseFreq = 108;
    const binauralFreq = 112;

    const bus = ctx.createGain();
    bus.gain.value = 0.26;
    bus.connect(this.masterGain);

    // Deep drone oscs
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = baseFreq;
    osc2.type = 'triangle';
    osc2.frequency.value = binauralFreq;

    // Vocal throat chanting formant filter ("Ohm" vowel resonance)
    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.value = 430;
    formant1.Q.value = 4;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.22;

    osc1.connect(formant1);
    osc2.connect(formant1);
    formant1.connect(droneGain).connect(bus);

    const now = ctx.currentTime;
    osc1.start(now);
    osc2.start(now);

    // Tibetan Singing Bowl Harmonic Rim Strikes
    const strikeBowl = () => {
      if (this.currentType !== 'tibetan_bowl' || !this.masterGain) return;
      const t = ctx.currentTime;
      // Authentic Singing Bowl partials (Fundamental + non-integer metal modes)
      const bowlPartials = [
        { freq: 216, gain: 0.35, decay: 8.5 },
        { freq: 585, gain: 0.25, decay: 6.0 },
        { freq: 1140, gain: 0.14, decay: 4.2 },
        { freq: 1820, gain: 0.07, decay: 2.8 },
      ];

      bowlPartials.forEach((part) => {
        const pOsc = ctx.createOscillator();
        const pGain = ctx.createGain();
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(part.freq, t);

        // Subtle shimmering vibrato as bowl sings
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 3.2; // 3.2 Hz shimmer
        lfoGain.gain.value = 4.5;
        lfo.connect(lfoGain).connect(pOsc.frequency);
        lfo.start(t);
        lfo.stop(t + part.decay);

        pGain.gain.setValueAtTime(0.0001, t);
        pGain.gain.linearRampToValueAtTime(part.gain, t + 0.08);
        pGain.gain.exponentialRampToValueAtTime(0.0001, t + part.decay);

        pOsc.connect(pGain).connect(bus);
        pOsc.start(t);
        pOsc.stop(t + part.decay + 0.1);
      });
    };

    // Strike once at start
    strikeBowl();

    // Re-strike softly every 9 seconds
    const bowlInterval = window.setInterval(() => {
      strikeBowl();
    }, 9500);

    this.activeNodes.push({
      stop: () => {
        window.clearInterval(bowlInterval);
        try {
          osc1.stop();
          osc2.stop();
        } catch {}
      },
    });
  }

  // 4. Sacred Ancient Temple Bell Generator
  private startTempleBell(ctx: AudioContext): void {
    if (!this.masterGain) return;

    const strikeTempleBell = () => {
      if (this.currentType !== 'temple_bell' || !this.masterGain) return;
      const t = ctx.currentTime;
      const fundamental = 136.1; // Earth year frequency (Om bell)
      // Bell bronze physical partials
      const modes = [
        { mult: 1.0, amp: 0.45, decay: 9.0 },
        { mult: 2.02, amp: 0.32, decay: 7.2 },
        { mult: 2.98, amp: 0.22, decay: 5.5 },
        { mult: 4.15, amp: 0.15, decay: 4.0 },
        { mult: 5.62, amp: 0.08, decay: 2.5 },
      ];

      modes.forEach((mode) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * mode.mult, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(mode.amp * 0.45, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + mode.decay);

        osc.connect(gain).connect(this.masterGain!);
        osc.start(t);
        osc.stop(t + mode.decay + 0.1);
      });
    };

    // First strike immediately
    strikeTempleBell();

    // Bell strikes solemnly every 10 seconds
    const bellInterval = window.setInterval(() => {
      strikeTempleBell();
    }, 10500);

    this.activeNodes.push({
      stop: () => {
        window.clearInterval(bellInterval);
      },
    });
  }
}

// Global Ambient Engine Singleton
export const ambientSoundEngine = new AmbientSoundscapeEngine();

const soundscapeListeners = new Set<() => void>();

export function subscribeSoundscapeState(cb: () => void): () => void {
  soundscapeListeners.add(cb);
  return () => {
    soundscapeListeners.delete(cb);
  };
}

function notifySoundscapeListeners(): void {
  soundscapeListeners.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
}
