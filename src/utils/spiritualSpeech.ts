// Spiritual Text-to-Speech Engine
// Utilizes Web Speech API (SpeechSynthesis) paired with Web Audio resonant temple bell chime
// Features persona presets: ซินแสอาวุโส, ธรรมบรรยายสำรวม, กังวานสมาธิมงคล

import { stopChant } from './chantAudio';
import { ambientSoundEngine } from './ambientSoundscapes';
import { logger } from './logger';
import { clamp } from './formatters';

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
  rateMultiplier: number;
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
      try {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth && this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      } catch (err) {
        logger.warn('Failed to initialize SpeechSynthesis:', err);
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    try {
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
    } catch (err) {
      logger.warn('Failed to load speech synthesis voices:', err);
    }
  }

  subscribe(cb: (state: SpiritualSpeechState) => void): () => void {
    this.listeners.add(cb);
    try {
      cb({ ...this.state });
    } catch (err) {
      logger.error('Error in speech subscribe callback:', err);
    }
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(): void {
    const copy = { ...this.state };
    this.listeners.forEach((cb) => {
      try {
        cb(copy);
      } catch (err) {
        logger.error('Error in speech listener notification:', err);
      }
    });
  }

  getState(): SpiritualSpeechState {
    return { ...this.state };
  }

  setPreset(presetId: SpiritualVoicePresetId): void {
    this.state.activePresetId = presetId;
    this.notify();
    if (this.state.isSpeaking && this.state.currentText) {
      const text = this.state.currentText;
      const curLine = this.state.currentLineIndex;
      this.stop();
      this.speak(text, { startLine: Math.max(0, curLine) });
    }
  }

  setRateMultiplier(rate: number): void {
    this.state.rateMultiplier = clamp(rate, 0.7, 1.4);
    this.notify();
  }

  setVoice(voiceName: string): void {
    this.state.selectedVoiceName = voiceName;
    this.notify();
  }

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
    } catch (err) {
      logger.debug('Temple chime audio context error (likely awaiting user gesture):', err);
    }
  }

  private prepareLines(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('---'));
  }

  async speak(rawText: string, options: { startLine?: number; withChime?: boolean } = {}): Promise<void> {
    if (!this.synth) {
      logger.warn('SpeechSynthesis is not supported in this environment');
      return;
    }

    this.stop();

    stopChant();
    ambientSoundEngine.setSoundscape('none');

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

    await new Promise((r) => setTimeout(r, options.withChime !== false ? 500 : 80));

    this.speakLine(this.state.currentLineIndex);
  }

  private speakLine(index: number): void {
    if (!this.synth || !this.state.isSpeaking) return;

    if (index >= this.textLines.length) {
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

    try {
      const utter = new SpeechSynthesisUtterance(lineText);

      const calcRate = clamp(preset.rate * this.state.rateMultiplier, 0.5, 1.2);
      const calcPitch = clamp(preset.pitch * this.state.pitchMultiplier, 0.5, 1.3);
      utter.rate = calcRate;
      utter.pitch = calcPitch;

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
        const pauseDuration = preset.id === 'meditation' ? 700 : 450;
        this.speechTimeout = window.setTimeout(() => {
          this.speakLine(index + 1);
        }, pauseDuration);
      };

      utter.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          logger.warn('SpeechSynthesis utterance error:', e.error);
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

      this.synth.speak(utter);
    } catch (err) {
      logger.error('Failed to speak utterance:', err);
      this.state.isSpeaking = false;
      this.notify();
    }
  }

  pause(): void {
    if (!this.synth || !this.state.isSpeaking) return;
    try {
      this.synth.pause();
      this.state.isPaused = true;
      this.notify();
    } catch (err) {
      logger.warn('Error pausing SpeechSynthesis:', err);
    }
  }

  resume(): void {
    if (!this.synth) return;
    try {
      if (this.state.isPaused) {
        this.synth.resume();
        this.state.isPaused = false;
        this.notify();
      } else if (this.state.currentText && !this.state.isSpeaking) {
        this.speak(this.state.currentText, { startLine: Math.max(0, this.state.currentLineIndex) });
      }
    } catch (err) {
      logger.warn('Error resuming SpeechSynthesis:', err);
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
      } catch (err) {
        logger.debug('Error canceling SpeechSynthesis:', err);
      }
    }
    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.currentLineIndex = -1;
    this.notify();
  }
}

export const spiritualSpeechEngine = new SpiritualSpeechEngine();
