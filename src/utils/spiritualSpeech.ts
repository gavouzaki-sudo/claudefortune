// Spiritual Text-to-Speech Engine
// Utilizes Web Speech API (SpeechSynthesis) paired with Web Audio resonant temple bell chime
// Features persona presets: ซินแสอาวุโส, ธรรมบรรยายสำรวม, กังวานสมาธิมงคล

export type SpiritualVoicePresetId = 'sinsei' | 'dharma' | 'meditation';

export interface SpiritualVoicePreset {
  id: SpiritualVoicePresetId;
  title: string;
  subtitle: string;
  icon: string;
  pitch: number;
  rate: number;
  description: string;
  introPhrase?: string;
}

export const SPIRITUAL_PRESETS: Record<SpiritualVoicePresetId, SpiritualVoicePreset> = {
  sinsei: {
    id: 'sinsei',
    title: 'ซินแสอาวุโส',
    subtitle: 'Wise Elder Sinsei',
    icon: '👴🏻',
    pitch: 0.82,
    rate: 0.76,
    description: 'เสียงทุ้มนุ่มลึก สุขุม ช้าเนิบนาบ เสมือนมีซินแสผู้เฒ่าผู้เปี่ยมบารมีนั่งอ่านกลอนทำนายให้ฟัง',
  },
  dharma: {
    id: 'dharma',
    title: 'ธรรมบรรยายสำรวม',
    subtitle: 'Serene Monastic Calm',
    icon: '📿',
    pitch: 0.95,
    rate: 0.82,
    description: 'ท่วงทำนองสงบ มีสติ มั่นคง นุ่มนวล เสมือนฟังธรรมเทศนาเตือนสติและให้กำลังใจ',
  },
  meditation: {
    id: 'meditation',
    title: 'กังวานสมาธิมงคล',
    subtitle: 'Deep Meditative Chanting',
    icon: '🧘',
    pitch: 0.74,
    rate: 0.68,
    description: 'เนิบช้ากังวานเป็นพิเศษ เว้นวรรคเป็นจังหวะเพื่อการเจริญสติและซึมซับพลังมงคลเข้าสู่จิตใจ',
  },
};

export interface SpiritualSpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  activePresetId: SpiritualVoicePresetId;
  rateMultiplier: number; // 0.8 to 1.3 relative factor
  pitchMultiplier: number;
  currentLineIndex: number;
  totalLines: number;
  currentText: string;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceName: string | null;
  hasThaiVoice: boolean;
}

class SpiritualSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  private state: SpiritualSpeechState = {
    isSpeaking: false,
    isPaused: false,
    activePresetId: 'sinsei',
    rateMultiplier: 1.0,
    pitchMultiplier: 1.0,
    currentLineIndex: -1,
    totalLines: 0,
    currentText: '',
    availableVoices: [],
    selectedVoiceName: null,
    hasThaiVoice: false,
  };

  private textLines: string[] = [];
  private listeners = new Set<(state: SpiritualSpeechState) => void>();
  private speechTimeout: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    this.state.availableVoices = voices;
    const thaiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('th') ||
        v.name.toLowerCase().includes('thai') ||
        v.name.toLowerCase().includes('kanya') ||
        v.name.toLowerCase().includes('niwat') ||
        v.name.toLowerCase().includes('premwadee')
    );

    this.state.hasThaiVoice = !!thaiVoice;
    if (!this.state.selectedVoiceName && thaiVoice) {
      this.state.selectedVoiceName = thaiVoice.name;
    }
    this.notify();
  }

  subscribe(cb: (state: SpiritualSpeechState) => void): () => void {
    this.listeners.add(cb);
    cb({ ...this.state });
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(): void {
    const copy = { ...this.state };
    this.listeners.forEach((cb) => {
      try {
        cb(copy);
      } catch {}
    });
  }

  getState(): SpiritualSpeechState {
    return { ...this.state };
  }

  setPreset(presetId: SpiritualVoicePresetId): void {
    this.state.activePresetId = presetId;
    this.notify();
    // If currently speaking, restart with new preset
    if (this.state.isSpeaking && this.state.currentText) {
      const text = this.state.currentText;
      const curLine = this.state.currentLineIndex;
      this.stop();
      this.speak(text, { startLine: Math.max(0, curLine) });
    }
  }

  setRateMultiplier(rate: number): void {
    this.state.rateMultiplier = Math.max(0.7, Math.min(1.4, rate));
    this.notify();
  }

  setVoice(voiceName: string): void {
    this.state.selectedVoiceName = voiceName;
    this.notify();
  }

  // Play an authentic soothing temple singing bowl / bronze bell chime before recitation
  playTempleChime(): void {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      const ctx = this.audioCtx;
      if (ctx.state !== 'running') ctx.resume();

      const t0 = ctx.currentTime;
      // Resonant harmonic chime at 528Hz (Solfeggio frequency of clarity and peace)
      const frequencies = [528, 1056, 1584];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, t0);
      masterGain.gain.linearRampToValueAtTime(0.24, t0 + 0.008);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);
      masterGain.connect(ctx.destination);

      frequencies.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        g.gain.value = 1 / (idx + 1);
        osc.connect(g).connect(masterGain);
        osc.start(t0);
        osc.stop(t0 + 2.9);
      });
    } catch {
      // Audio context may be restricted before user touch
    }
  }

  // Clean and prepare poetic text for spiritual chanting
  private prepareLines(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('---'));
  }

  async speak(rawText: string, options: { startLine?: number; withChime?: boolean } = {}): Promise<void> {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser environment');
      return;
    }

    this.stop();

    // Prevent audio clash: dynamically stop background music & soundscapes when speech begins
    try {
      const { stopChant } = await import('./chantAudio');
      stopChant();
    } catch {}
    try {
      const { ambientSoundEngine } = await import('./ambientSoundscapes');
      ambientSoundEngine.setSoundscape('none');
    } catch {}

    // Randomize spiritual preset automatically without needing manual selection
    const presetKeys: SpiritualVoicePresetId[] = ['sinsei', 'dharma', 'meditation'];
    const chosenPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    this.state.activePresetId = chosenPreset;

    if (options.withChime !== false) {
      this.playTempleChime();
    }

    this.textLines = this.prepareLines(rawText);
    this.state.currentText = rawText;
    this.state.totalLines = this.textLines.length;
    this.state.currentLineIndex = options.startLine ?? 0;
    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.notify();

    // Small delay after chime for temple ambience
    await new Promise((r) => setTimeout(r, options.withChime !== false ? 500 : 80));

    this.speakLine(this.state.currentLineIndex);
  }

  private speakLine(index: number): void {
    if (!this.synth || !this.state.isSpeaking) return;

    if (index >= this.textLines.length) {
      // Finished all lines
      this.state.isSpeaking = false;
      this.state.isPaused = false;
      this.state.currentLineIndex = -1;
      this.notify();
      return;
    }

    this.state.currentLineIndex = index;
    this.notify();

    const lineText = this.textLines[index];
    const preset = SPIRITUAL_PRESETS[this.state.activePresetId] || SPIRITUAL_PRESETS.sinsei;

    // Build utterance
    const utter = new SpeechSynthesisUtterance(lineText);
    this.currentUtterance = utter;

    // Apply voice settings
    const calcRate = Math.max(0.5, Math.min(1.2, preset.rate * this.state.rateMultiplier));
    const calcPitch = Math.max(0.5, Math.min(1.3, preset.pitch * this.state.pitchMultiplier));
    utter.rate = calcRate;
    utter.pitch = calcPitch;

    // Choose voice
    let voiceToUse: SpeechSynthesisVoice | undefined;
    if (this.state.selectedVoiceName) {
      voiceToUse = this.state.availableVoices.find((v) => v.name === this.state.selectedVoiceName);
    }
    if (!voiceToUse) {
      voiceToUse = this.state.availableVoices.find(
        (v) =>
          v.lang.toLowerCase().includes('th') ||
          v.name.toLowerCase().includes('thai') ||
          v.name.toLowerCase().includes('kanya') ||
          v.name.toLowerCase().includes('niwat')
      );
    }
    if (voiceToUse) {
      utter.voice = voiceToUse;
      utter.lang = voiceToUse.lang || 'th-TH';
    } else {
      utter.lang = 'th-TH';
    }

    utter.onend = () => {
      if (!this.state.isSpeaking) return;
      // Authentic rhythmic pause between lines (ราว 400ms - 650ms for calm dharma tempo)
      const pauseDuration = preset.id === 'meditation' ? 700 : 450;
      this.speechTimeout = window.setTimeout(() => {
        this.speakLine(index + 1);
      }, pauseDuration);
    };

    utter.onerror = (e) => {
      // Don't report canceled errors
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e.error);
      }
      if (this.state.isSpeaking && index + 1 < this.textLines.length) {
        this.speechTimeout = window.setTimeout(() => {
          this.speakLine(index + 1);
        }, 300);
      } else {
        this.state.isSpeaking = false;
        this.state.isPaused = false;
        this.state.currentLineIndex = -1;
        this.notify();
      }
    };

    try {
      this.synth.speak(utter);
    } catch (err) {
      console.warn('Failed to speak utterance:', err);
      this.state.isSpeaking = false;
      this.notify();
    }
  }

  pause(): void {
    if (!this.synth || !this.state.isSpeaking) return;
    this.synth.pause();
    this.state.isPaused = true;
    this.notify();
  }

  resume(): void {
    if (!this.synth) return;
    if (this.state.isPaused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.notify();
    } else if (this.state.currentText && !this.state.isSpeaking) {
      this.speak(this.state.currentText, { startLine: Math.max(0, this.state.currentLineIndex) });
    }
  }

  stop(): void {
    if (this.speechTimeout) {
      window.clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.currentUtterance = null;
    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.currentLineIndex = -1;
    this.notify();
  }
}

// Global Spiritual Speech Singleton
export const spiritualSpeechEngine = new SpiritualSpeechEngine();
