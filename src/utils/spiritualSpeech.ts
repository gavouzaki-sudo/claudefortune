// Spiritual Text-to-Speech Engine
// Utilizes Web Speech API (SpeechSynthesis) paired with Web Audio resonant temple bell chime
// Fully hardened for mobile devices (iOS Safari, Android Chrome, Samsung Internet, WebViews)
// Features persona presets: ซินแสอาวุโส, ธรรมบรรยายสำรวม, กังวานสมาธิมงคล
// Includes automatic Sacred Melodic Audio Fallback (Web Audio Ranat & Khim + Temple Chimes) if mobile device lacks Thai voice pack

import { stopChant, playChant } from './chantAudio';
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
  isFallbackMelody: boolean;
}

// Global declaration to prevent Garbage Collection of SpeechSynthesisUtterance on mobile browsers
declare global {
  interface Window {
    __sacredSpeechUtterances?: Set<SpeechSynthesisUtterance>;
    __sacredActiveUtterance?: SpeechSynthesisUtterance | null;
  }
}

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android|Mobile|Silk|Kindle|BlackBerry/i.test(navigator.userAgent || '');
};

export const isThaiVoice = (v: SpeechSynthesisVoice): boolean => {
  const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (v.name || '').toLowerCase();
  return (
    lang.startsWith('th') ||
    lang === 'th' ||
    lang.includes('th-th') ||
    name.includes('thai') ||
    name.includes('ภาษาไทย') ||
    name.includes('kanya') ||
    name.includes('narisa') ||
    name.includes('niwat') ||
    name.includes('premwadee')
  );
};

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
    isFallbackMelody: false,
  };

  private textLines: string[] = [];
  private listeners = new Set<(state: SpiritualSpeechState) => void>();
  private noticeHandlers = new Set<(msg: string) => void>();
  private speechTimeout: number | null = null;
  private keepAliveInterval: number | null = null;
  private fallbackTicker: number | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth) {
          if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
          }
          // Some mobile browsers need explicit event listener
          if (typeof window.speechSynthesis.addEventListener === 'function') {
            window.speechSynthesis.addEventListener('voiceschanged', () => this.loadVoices());
          }
        }
      } catch (err) {
        logger.warn('Failed to initialize SpeechSynthesis:', err);
      }
    }
  }

  loadVoices(): void {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      this.state.availableVoices = voices;
      const thaiVoice = voices.find(isThaiVoice);

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

  onNotice(cb: (msg: string) => void): () => void {
    this.noticeHandlers.add(cb);
    return () => {
      this.noticeHandlers.delete(cb);
    };
  }

  private emitNotice(msg: string): void {
    this.noticeHandlers.forEach((h) => {
      try {
        h(msg);
      } catch (err) {
        logger.warn('Error in notice handler:', err);
      }
    });
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
    if (this.state.isSpeaking && this.state.currentText && !this.state.isFallbackMelody) {
      const text = this.state.currentText;
      const curLine = this.state.currentLineIndex;
      this.stop();
      this.speak(text, { startLine: Math.max(0, curLine), withChime: false });
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
      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {});
      }

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

  /**
   * Main entry point to speak text.
   * CRITICAL FOR MOBILE: Must be called SYNCHRONOUSLY within a user interaction event!
   * No `await setTimeout` before calling SpeechSynthesis!
   */
  speak(rawText: string, options: { startLine?: number; withChime?: boolean } = {}): void {
    if (typeof window === 'undefined') return;

    // Reset previous timeouts and audio channels
    this.stop();
    stopChant();
    ambientSoundEngine.setSoundscape('none');

    // 1. Play temple bell synchronously during user gesture to also unlock Web Audio context
    if (options.withChime !== false) {
      this.playTempleChime();
    }

    // 2. Refresh voice list on mobile (since mobile loads voices lazily after touch/click)
    this.loadVoices();

    const presetKeys: SpiritualVoicePresetId[] = ['sinsei', 'dharma', 'meditation'];
    const chosenPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    this.state.activePresetId = chosenPreset;

    this.textLines = this.prepareLines(rawText);
    this.state.currentText = rawText;
    this.state.totalLines = this.textLines.length;
    this.state.currentLineIndex = options.startLine ?? 0;
    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.state.isFallbackMelody = false;
    this.notify();

    // 3. If browser does not have SpeechSynthesis at all, jump directly to Melodic Fallback
    if (!this.synth) {
      this.startMelodicFallback(
        this.state.currentLineIndex,
        '💡 อุปกรณ์ไม่รองรับระบบเสียงพูดสังเคราะห์ — ระบบเปิดเสียงระนาดและระฆังมงคลคลอแทน'
      );
      return;
    }

    // 4. iOS Safari / WebKit wake-up: resume if in paused state
    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
    } catch {}

    // 5. CRITICAL: Invoke speakLine SYNCHRONOUSLY within the gesture!
    // No async setTimeout here so the mobile browser's user activation token remains valid!
    this.speakLine(this.state.currentLineIndex);

    // 6. Start keep-alive loop to prevent mobile Chrome 15s freeze bug
    this.startKeepAlive();
  }

  private speakLine(index: number): void {
    if (!this.synth || !this.state.isSpeaking) return;

    if (index >= this.textLines.length) {
      this.stop();
      return;
    }

    this.state.currentLineIndex = index;
    this.notify();

    const lineText = this.textLines[index];
    const preset = SPIRITUAL_PRESETS[this.state.activePresetId] || SPIRITUAL_PRESETS.sinsei;
    const isMobile = isMobileDevice();

    try {
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utter = new SpeechSynthesisUtterance(lineText);

      // On mobile devices, ensure rates and pitches remain within the engine's stable operating range
      // Some mobile Android / Samsung TTS crash or go mute if rate < 0.8 or pitch < 0.85
      const baseRate = isMobile ? Math.max(0.82, preset.rate) : preset.rate;
      const basePitch = isMobile ? Math.max(0.88, preset.pitch) : preset.pitch;

      const calcRate = clamp(baseRate * this.state.rateMultiplier, isMobile ? 0.82 : 0.55, 1.25);
      const calcPitch = clamp(basePitch * this.state.pitchMultiplier, isMobile ? 0.85 : 0.55, 1.3);
      utter.rate = calcRate;
      utter.pitch = calcPitch;

      // Voice resolution
      let voiceToUse: SpeechSynthesisVoice | undefined;
      if (this.state.selectedVoiceName) {
        voiceToUse = this.state.availableVoices.find((v) => v.name === this.state.selectedVoiceName);
      }
      if (!voiceToUse) {
        voiceToUse = this.state.availableVoices.find(isThaiVoice);
      }

      if (voiceToUse) {
        utter.voice = voiceToUse;
        utter.lang = voiceToUse.lang || 'th-TH';
      } else {
        utter.lang = 'th-TH';
      }

      // Strong GC retention for mobile WebKit & V8
      this.activeUtterance = utter;
      if (typeof window !== 'undefined') {
        window.__sacredActiveUtterance = utter;
        window.__sacredSpeechUtterances = window.__sacredSpeechUtterances || new Set();
        window.__sacredSpeechUtterances.add(utter);
      }

      let endedOrErrored = false;

      const cleanupUtterance = () => {
        if (this.activeUtterance === utter) {
          this.activeUtterance = null;
        }
        if (typeof window !== 'undefined') {
          if (window.__sacredActiveUtterance === utter) {
            window.__sacredActiveUtterance = null;
          }
          window.__sacredSpeechUtterances?.delete(utter);
        }
      };

      utter.onend = () => {
        if (endedOrErrored) return;
        endedOrErrored = true;
        cleanupUtterance();

        if (!this.state.isSpeaking) return;
        const pauseDuration = preset.id === 'meditation' ? 650 : 380;
        this.speechTimeout = window.setTimeout(() => {
          this.speakLine(index + 1);
        }, pauseDuration);
      };

      utter.onerror = (e) => {
        if (endedOrErrored) return;
        endedOrErrored = true;
        cleanupUtterance();

        const errType = (e as any)?.error || '';
        if (errType !== 'canceled' && errType !== 'interrupted') {
          logger.warn('SpeechSynthesis utterance error:', errType, 'at line', index);
        }

        // Check if device fails due to missing language pack or mobile restriction
        const isVoiceMissing =
          errType === 'language-unavailable' ||
          errType === 'voice-unavailable' ||
          errType === 'not-allowed' ||
          errType === 'network';

        if (isVoiceMissing || (index === 0 && !this.state.hasThaiVoice && isMobile)) {
          this.startMelodicFallback(
            index,
            '💡 มือถือยังไม่มีเสียงอ่านภาษาไทยในระบบ (เปิดได้ที่ การตั้งค่า > เสียงอ่าน) — ระบบเปิดเสียงระนาดและระฆังมงคลคลอแทน'
          );
          return;
        }

        if (this.state.isSpeaking && index + 1 < this.textLines.length) {
          this.speechTimeout = window.setTimeout(() => {
            this.speakLine(index + 1);
          }, 250);
        } else {
          this.stop();
        }
      };

      this.synth.speak(utter);
    } catch (err) {
      logger.error('Failed to speak utterance:', err);
      this.startMelodicFallback(
        index,
        '💡 เกิดข้อผิดพลาดในการเล่นเสียง — ระบบสลับเป็นเสียงดนตรีมงคลคลอแทน'
      );
    }
  }

  /**
   * Fallback mode for mobile phones with no Thai TTS installed
   * Uses Web Audio 7TET Ranat & Khim sacred chant melody + temple bells
   * Synchronously advances verse lines so user gets sound and visual recitation!
   */
  private startMelodicFallback(fromLine = 0, noticeMsg?: string): void {
    if (this.fallbackTicker) {
      window.clearInterval(this.fallbackTicker);
      this.fallbackTicker = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }

    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.state.isFallbackMelody = true;
    this.state.currentLineIndex = fromLine;
    this.notify();

    if (noticeMsg) {
      this.emitNotice(noticeMsg);
    }

    // Play sacred melodic chant (Ranat & Khim 7TET melody) + temple bell
    try {
      playChant('thai');
      this.playTempleChime();
    } catch (err) {
      logger.warn('Error starting fallback chant:', err);
    }

    // Paced line progression every ~3.5 seconds so visual reading continues
    let cur = fromLine;
    this.fallbackTicker = window.setInterval(() => {
      if (!this.state.isSpeaking || this.state.isPaused) return;
      cur += 1;
      if (cur >= this.textLines.length) {
        this.stop();
      } else {
        this.state.currentLineIndex = cur;
        this.notify();
      }
    }, 3600);
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    // Chrome on Android bug: speech synthesis pauses after 15s of continuous reading.
    // Calling pause & resume every 10s prevents Chrome from timing out.
    this.keepAliveInterval = window.setInterval(() => {
      if (
        !this.synth ||
        !this.state.isSpeaking ||
        this.state.isPaused ||
        this.state.isFallbackMelody
      ) {
        return;
      }
      try {
        if (this.synth.speaking) {
          this.synth.pause();
          this.synth.resume();
        }
      } catch {}
    }, 10000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      window.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  pause(): void {
    if (!this.state.isSpeaking) return;

    if (this.state.isFallbackMelody) {
      stopChant();
      this.state.isPaused = true;
      this.notify();
      return;
    }

    if (!this.synth) return;
    try {
      this.synth.pause();
      this.state.isPaused = true;
      this.notify();
    } catch (err) {
      logger.warn('Error pausing SpeechSynthesis:', err);
    }
  }

  resume(): void {
    if (this.state.isFallbackMelody) {
      playChant('thai');
      this.state.isPaused = false;
      this.notify();
      return;
    }

    if (!this.synth) return;
    try {
      if (this.state.isPaused) {
        this.synth.resume();
        this.state.isPaused = false;
        this.notify();
      } else if (this.state.currentText && !this.state.isSpeaking) {
        this.speak(this.state.currentText, {
          startLine: Math.max(0, this.state.currentLineIndex),
          withChime: false,
        });
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
    if (this.fallbackTicker) {
      window.clearInterval(this.fallbackTicker);
      this.fallbackTicker = null;
    }
    this.stopKeepAlive();

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (err) {
        logger.debug('Error canceling SpeechSynthesis:', err);
      }
    }

    if (this.state.isFallbackMelody) {
      stopChant();
    }

    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      window.__sacredActiveUtterance = null;
      window.__sacredSpeechUtterances?.clear();
    }

    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.isFallbackMelody = false;
    this.state.currentLineIndex = -1;
    this.notify();
  }
}

export const spiritualSpeechEngine = new SpiritualSpeechEngine();
