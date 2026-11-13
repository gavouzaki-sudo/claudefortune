// Spiritual Text-to-Speech Engine
// Dual-Engine Architecture:
// 1. Google Translate TTS (High-compatibility Thai online audio stream with tones and natural cadence) - Default for mobile & web
// 2. Native Web Speech API (SpeechSynthesis) with mobile audio unlocking and voice resolution
// Supports authentic Thai personas: ซินแสอาวุโส, ธรรมบรรยายสำรวม, กังวานสมาธิมงคล

import { stopChant } from './chantAudio';
import { ambientSoundEngine } from './ambientSoundscapes';
import { logger } from './logger';
import { clamp } from './formatters';

export type SpiritualVoicePresetId = 'sinsei' | 'dharma' | 'meditation';
export type SpeechEngineType = 'google' | 'native';

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
  engineType: SpeechEngineType;
  activePresetId: SpiritualVoicePresetId;
  rateMultiplier: number;
  pitchMultiplier: number;
  googleTtsSpeed: number;
  currentLineIndex: number;
  totalLines: number;
  currentText: string;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceName: string | null;
  hasThaiVoice: boolean;
  isFallbackMelody: boolean;
  isUnsupported: boolean;
  unsupportedMessage?: string;
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

const isThaiVoice = (v: SpeechSynthesisVoice): boolean => {
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
    name.includes('premwadee') ||
    name.includes('siri')
  );
};

class SpiritualSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private audioPlayer: HTMLAudioElement | null = null;

  private state: SpiritualSpeechState = {
    isSpeaking: false,
    isPaused: false,
    // Google Translate TTS is default for natural Thai tones and seamless cadence
    engineType: 'google',
    activePresetId: 'sinsei',
    rateMultiplier: 1.0,
    pitchMultiplier: 1.0,
    googleTtsSpeed: 1.2, // Default: +20% speed boost for natural, articulate speech
    currentLineIndex: -1,
    totalLines: 0,
    currentText: '',
    availableVoices: [],
    selectedVoiceName: null,
    hasThaiVoice: false,
    isFallbackMelody: false,
    isUnsupported: false,
    unsupportedMessage: undefined,
  };

  private textLines: string[] = [];
  private listeners = new Set<(state: SpiritualSpeechState) => void>();
  private noticeHandlers = new Set<(msg: string) => void>();
  private speechTimeout: number | null = null;
  private keepAliveInterval: number | null = null;
  private fallbackTicker: number | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private fallbackInProgress = false;

  constructor() {
    this.initSynth();
  }

  /**
   * Lazily and resiliently retrieves the SpeechSynthesis instance from window or parent frame.
   * On mobile devices or inside iframes, window.speechSynthesis may not be ready at bundle parse time.
   */
  private getSynth(): SpeechSynthesis | null {
    if (this.synth) return this.synth;
    if (typeof window === 'undefined') return null;

    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        this.synth = window.speechSynthesis;
        this.initVoiceListeners();
        this.loadVoices();
        return this.synth;
      }
    } catch (err) {
      logger.warn('Failed to access window.speechSynthesis:', err);
    }
    return null;
  }

  private initSynth(): void {
    const s = this.getSynth();
    if (s) {
      this.loadVoices();
    }
  }

  private initVoiceListeners(): void {
    if (!this.synth) return;
    try {
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
      if (typeof this.synth.addEventListener === 'function') {
        this.synth.addEventListener('voiceschanged', () => this.loadVoices());
      }
    } catch {}
  }

  loadVoices(): void {
    const synth = this.getSynth();
    if (!synth) return;

    try {
      const voices = synth.getVoices();
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

  /**
   * Check if the device or browser has any speech output capability (Web Speech API or HTML5 Audio).
   */
  isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const hasSynth = 'speechSynthesis' in window && !!window.speechSynthesis;
    const hasAudio = typeof Audio !== 'undefined';
    return hasSynth || hasAudio;
  }

  /**
   * Called when the device or browser does not support speech synthesis at all.
   * Cancels playback, records unsupported state, and emits the user-facing message "ไม่รองรับเสียงพูด".
   */
  handleUnsupportedSpeech(msg: string = 'ไม่รองรับเสียงพูด'): void {
    this.stop();
    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.isFallbackMelody = false;
    this.state.isUnsupported = true;
    this.state.unsupportedMessage = msg;
    this.notify();
    this.emitNotice(msg);
  }

  /**
   * Switch speech engine between 'google' (Google Translate TTS) and 'native' (Device Web Speech API)
   */
  setEngineType(engine: SpeechEngineType): void {
    this.state.engineType = engine;
    this.notify();
    if (this.state.isSpeaking && this.state.currentText && !this.state.isFallbackMelody) {
      const text = this.state.currentText;
      const curLine = this.state.currentLineIndex;
      this.stop();
      this.speak(text, { startLine: Math.max(0, curLine), withChime: false, preservePreset: true });
    }
  }

  setPreset(presetId: SpiritualVoicePresetId): void {
    this.state.activePresetId = presetId;
    this.notify();
    if (this.state.isSpeaking && this.state.currentText && !this.state.isFallbackMelody) {
      const text = this.state.currentText;
      const curLine = this.state.currentLineIndex;
      this.stop();
      this.speak(text, { startLine: Math.max(0, curLine), withChime: false, preservePreset: true });
    }
  }

  setGoogleTtsSpeed(speed: number): void {
    const clamped = clamp(speed, 0.75, 2.0);
    this.state.googleTtsSpeed = Number(clamped.toFixed(2));
    this.state.rateMultiplier = Number(clamp(speed / 1.0, 0.75, 1.5).toFixed(2));
    this.notify();
    if (this.state.isSpeaking && this.state.currentText) {
      const text = this.state.currentText;
      const curLine = this.state.currentLineIndex;
      this.stop();
      this.speak(text, { startLine: Math.max(0, curLine), withChime: false, preservePreset: true });
    }
  }

  setRateMultiplier(rate: number): void {
    this.state.rateMultiplier = clamp(rate, 0.7, 1.4);
    this.state.googleTtsSpeed = Number(clamp(1.2 * this.state.rateMultiplier, 0.75, 2.0).toFixed(2));
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
      logger.debug('Temple chime audio context error:', err);
    }
  }

  private prepareLines(text: string): string[] {
    const rawLines = text
      .split('\n')
      .map((line) => line.replace(/[#*_~`]/g, '').trim())
      .filter((line) => line.length > 0 && !line.startsWith('---'));

    const chunks: string[] = [];
    const MAX_LEN = 180;
    for (const line of rawLines) {
      let rest = line;
      while (rest.length > MAX_LEN) {
        let cut = rest.lastIndexOf(' ', MAX_LEN);
        if (cut < 60) {
          cut = MAX_LEN;
        }
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      if (rest.length > 0) {
        chunks.push(rest);
      }
    }
    return chunks;
  }

  /**
   * Main entry point to speak text.
   * Invoked synchronously inside user click/touch event to unlock mobile audio.
   */
  speak(
    rawText: string,
    options: { startLine?: number; withChime?: boolean; preservePreset?: boolean } = {}
  ): void {
    if (typeof window === 'undefined') return;

    // Reset previous playback and audio tracks
    this.stop();
    stopChant();
    ambientSoundEngine.setSoundscape('none');

    // Reset unsupported state and fallback guard for new recitation
    this.fallbackInProgress = false;
    this.state.isUnsupported = false;
    this.state.unsupportedMessage = undefined;

    // 1. Play temple bell chime synchronously to unlock Web Audio context on mobile
    if (options.withChime !== false) {
      this.playTempleChime();
    }

    // 2. Select randomized persona only when starting fresh (preserve when user switches preset/speed/engine)
    if (!options.preservePreset) {
      const presetKeys: SpiritualVoicePresetId[] = ['sinsei', 'dharma', 'meditation'];
      this.state.activePresetId = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    }

    this.textLines = this.prepareLines(rawText);
    this.state.currentText = rawText;
    this.state.totalLines = this.textLines.length;
    const startIdx = Math.min(options.startLine ?? 0, Math.max(0, this.textLines.length - 1));
    this.state.currentLineIndex = startIdx;
    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.state.isFallbackMelody = false;
    this.notify();

    // 3. Engine routing: Google Translate TTS vs Native SpeechSynthesis
    if (this.state.engineType === 'google') {
      this.speakWithAudioTTS(startIdx);
      return;
    }

    const synth = this.getSynth();
    if (synth) {
      try {
        if (synth.paused) {
          synth.resume();
        }
      } catch {}

      this.loadVoices();
      this.speakLine(startIdx);
      this.startKeepAlive();
      return;
    }

    // If native synth is unavailable on device, fallback to Google Translate TTS
    if (typeof Audio !== 'undefined') {
      this.state.engineType = 'google';
      this.speakWithAudioTTS(startIdx);
      return;
    }

    // Neither engine is supported
    this.handleUnsupportedSpeech('ไม่รองรับเสียงพูด');
  }

  private speakLine(index: number): void {
    const synth = this.getSynth();
    if (!synth || !this.state.isSpeaking) return;

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
      if (synth.paused) {
        synth.resume();
      }

      const utter = new SpeechSynthesisUtterance(lineText);

      // Stable speech rate and pitch bounds for mobile engines
      const baseRate = isMobile ? Math.max(0.85, preset.rate) : preset.rate;
      const basePitch = isMobile ? Math.max(0.9, preset.pitch) : preset.pitch;

      const speedFactor = (this.state.googleTtsSpeed || 1.2) / 1.0;
      utter.rate = clamp(baseRate * speedFactor, 0.7, 1.5);
      utter.pitch = clamp(basePitch * this.state.pitchMultiplier, 0.8, 1.25);

      // Voice resolution: always specify 'th-TH' for standard Thai reading
      let voiceToUse: SpeechSynthesisVoice | undefined;
      if (this.state.selectedVoiceName) {
        voiceToUse = this.state.availableVoices.find((v) => v.name === this.state.selectedVoiceName);
      }
      if (!voiceToUse) {
        voiceToUse = this.state.availableVoices.find(isThaiVoice);
      }
      if (!voiceToUse && synth) {
        const curVoices = synth.getVoices() || [];
        voiceToUse = curVoices.find(isThaiVoice);
        if (voiceToUse) {
          this.state.availableVoices = curVoices;
          this.state.hasThaiVoice = true;
          this.state.selectedVoiceName = voiceToUse.name;
        }
      }

      if (voiceToUse) {
        utter.voice = voiceToUse;
        utter.lang = voiceToUse.lang || 'th-TH';
      } else {
        utter.lang = 'th-TH';
      }

      // Memory retention to prevent mobile garbage collection
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
        this.fallbackInProgress = false;

        if (!this.state.isSpeaking) return;
        const pauseDuration = preset.id === 'meditation' ? 550 : 350;
        this.speechTimeout = window.setTimeout(() => {
          this.speakLine(index + 1);
        }, pauseDuration);
      };

      utter.onerror = (e) => {
        if (endedOrErrored) return;
        endedOrErrored = true;
        cleanupUtterance();

        const errType = (e as any)?.error || '';
        if (errType === 'canceled' || errType === 'interrupted') {
          // Benign cancellation (e.g. user paused or stopped)
          return;
        }

        logger.warn('SpeechSynthesis utterance error:', errType, 'at line', index);
        // Fallback to Google Translate audio TTS once if not already falling back
        if (!this.fallbackInProgress && typeof Audio !== 'undefined') {
          this.fallbackInProgress = true;
          this.state.engineType = 'google';
          this.speakWithAudioTTS(index);
        } else {
          this.handleUnsupportedSpeech('ไม่รองรับเสียงพูด');
        }
      };

      synth.speak(utter);
    } catch (err) {
      logger.warn('Failed to speak via SpeechSynthesis:', err);
      if (!this.fallbackInProgress && typeof Audio !== 'undefined') {
        this.fallbackInProgress = true;
        this.state.engineType = 'google';
        this.speakWithAudioTTS(index);
      } else {
        this.handleUnsupportedSpeech('ไม่รองรับเสียงพูด');
      }
    }
  }

  /**
   * Google Translate Audio TTS engine:
   * Uses HTML5 Audio with authentic Thai pronunciation and natural tones.
   * Directly connects to Google Translate TTS stream with referrerPolicy='no-referrer',
   * and falls back to proxy route or native speech synthesis without recursive loops.
   */
  private speakWithAudioTTS(index: number, tryProxy: boolean = false): void {
    if (!this.state.isSpeaking || index >= this.textLines.length) {
      this.stop();
      return;
    }

    this.state.currentLineIndex = index;
    this.state.isFallbackMelody = false;
    this.notify();

    const lineText = this.textLines[index];
    const cleanText = (lineText || '').replace(/[#*_~`]/g, '').trim().slice(0, 180);
    if (!cleanText) {
      this.speakWithAudioTTS(index + 1);
      return;
    }

    // Google Translate TTS stream: clear Thai articulation with tones and correct vowel lengths
    const query = encodeURIComponent(cleanText);
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=th&q=${query}`;
    const proxyUrl = `/api/tts?ie=UTF-8&client=tw-ob&tl=th&q=${query}`;
    const ttsUrl = tryProxy ? proxyUrl : directUrl;

    try {
      if (!this.audioPlayer) {
        this.audioPlayer = new Audio();
      }

      const audio = this.audioPlayer;
      try {
        (audio as any).referrerPolicy = 'no-referrer';
        audio.setAttribute('referrerpolicy', 'no-referrer');
      } catch {}

      let hasHandledFailure = false;

      // Disarm previous listeners to prevent ghost onended / onerror triggers
      audio.onended = null;
      audio.onerror = null;
      audio.onloadedmetadata = null;
      audio.onplay = null;
      audio.pause();

      const preset = SPIRITUAL_PRESETS[this.state.activePresetId] || SPIRITUAL_PRESETS.sinsei;
      const targetSpeed = this.state.googleTtsSpeed || 1.2;
      const applyPlaybackRate = (rate: number) => {
        try {
          audio.defaultPlaybackRate = rate;
          audio.playbackRate = rate;
        } catch {
          try {
            audio.defaultPlaybackRate = 1.0;
            audio.playbackRate = 1.0;
          } catch {}
        }
      };

      const handleStreamFailure = (reason?: unknown) => {
        if (hasHandledFailure) return;
        hasHandledFailure = true;
        audio.onended = null;
        audio.onerror = null;

        // If direct URL failed and proxy hasn't been tried, attempt local proxy once
        if (!tryProxy) {
          logger.debug('Direct Google Translate stream unavailable, attempting local proxy fallback:', reason);
          this.speakWithAudioTTS(index, true);
          return;
        }

        logger.info('External audio TTS stream unavailable, attempting device speech fallback:', reason);

        // Fallback to Native SpeechSynthesis if not already falling back
        if (!this.fallbackInProgress) {
          this.fallbackInProgress = true;
          const synth = this.getSynth();
          if (synth) {
            this.state.engineType = 'native';
            this.loadVoices();
            this.speakLine(index);
            this.startKeepAlive();
            return;
          }
        }

        // If neither engine is available, report unsupported
        this.handleUnsupportedSpeech('ไม่รองรับเสียงพูด');
      };

      audio.onerror = (e) => {
        handleStreamFailure(e);
      };

      audio.onended = () => {
        if (hasHandledFailure || !this.state.isSpeaking) return;
        this.fallbackInProgress = false;
        const pauseDuration = preset.id === 'meditation' ? 450 : 250;
        this.speechTimeout = window.setTimeout(() => {
          this.speakWithAudioTTS(index + 1);
        }, pauseDuration);
      };

      audio.onloadedmetadata = () => {
        applyPlaybackRate(targetSpeed);
      };
      audio.onplay = () => {
        applyPlaybackRate(targetSpeed);
      };

      audio.src = ttsUrl;
      applyPlaybackRate(targetSpeed);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          handleStreamFailure(err);
        });
      }
    } catch (err) {
      if (!tryProxy) {
        this.speakWithAudioTTS(index, true);
        return;
      }
      if (!this.fallbackInProgress) {
        this.fallbackInProgress = true;
        const synth = this.getSynth();
        if (synth) {
          this.state.engineType = 'native';
          this.speakLine(index);
          return;
        }
      }
      this.handleUnsupportedSpeech('ไม่รองรับเสียงพูด');
    }
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveInterval = window.setInterval(() => {
      const synth = this.getSynth();
      if (
        !synth ||
        !this.state.isSpeaking ||
        this.state.isPaused ||
        this.state.isFallbackMelody ||
        this.audioPlayer
      ) {
        return;
      }
      try {
        if (synth.speaking) {
          synth.pause();
          synth.resume();
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

    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
      } catch {}
      this.state.isPaused = true;
      this.notify();
      return;
    }

    const synth = this.getSynth();
    if (!synth) return;
    try {
      synth.pause();
      this.state.isPaused = true;
      this.notify();
    } catch (err) {
      logger.warn('Error pausing SpeechSynthesis:', err);
    }
  }

  resume(): void {
    if (this.audioPlayer) {
      try {
        this.audioPlayer.play().catch(() => {});
      } catch {}
      this.state.isPaused = false;
      this.notify();
      return;
    }

    const synth = this.getSynth();
    if (!synth || this.state.engineType === 'google') {
      if (this.state.currentText) {
        this.speakWithAudioTTS(Math.max(0, this.state.currentLineIndex));
      }
      return;
    }

    try {
      if (this.state.isPaused) {
        synth.resume();
        this.state.isPaused = false;
        this.notify();
      } else if (this.state.currentText && !this.state.isSpeaking) {
        this.speak(this.state.currentText, {
          startLine: Math.max(0, this.state.currentLineIndex),
          withChime: false,
          preservePreset: true,
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

    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
        this.audioPlayer.removeAttribute('src');
        this.audioPlayer.load();
      } catch {}
      this.audioPlayer = null;
    }

    const synth = this.getSynth();
    if (synth) {
      try {
        synth.cancel();
      } catch (err) {
        logger.debug('Error canceling SpeechSynthesis:', err);
      }
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
