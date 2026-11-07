// Spiritual Text-to-Speech Engine
// Dual-Engine Architecture:
// 1. Google Translate TTS (High-compatibility Thai online audio stream with tones and natural cadence) - Default for mobile & web
// 2. Native Web Speech API (SpeechSynthesis) with mobile audio unlocking and voice resolution
// 3. Sacred Melodic Ranat & Khim + Temple Chimes fallback if device is completely offline with no voice pack
// Supports authentic Thai personas: ซินแสอาวุโส, ธรรมบรรยายสำรวม, กังวานสมาธิมงคล

import { stopChant, playChant } from './chantAudio';
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
    // Google Translate TTS is enabled by default to ensure 100% reliable Thai speech on all mobile devices & PCs
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
  };

  private textLines: string[] = [];
  private listeners = new Set<(state: SpiritualSpeechState) => void>();
  private noticeHandlers = new Set<(msg: string) => void>();
  private speechTimeout: number | null = null;
  private keepAliveInterval: number | null = null;
  private fallbackTicker: number | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

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
   * Switch speech engine between 'google' (Google Translate TTS) and 'native' (Device Web Speech API)
   */
  setEngineType(engine: SpeechEngineType): void {
    this.state.engineType = engine;
    this.notify();
    if (this.state.isSpeaking && this.state.currentText && !this.state.isFallbackMelody) {
      const text = this.state.currentText;
      const curLine = this.state.currentLineIndex;
      this.stop();
      this.speak(text, { startLine: Math.max(0, curLine), withChime: false });
    }
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

  setGoogleTtsSpeed(speed: number): void {
    const clamped = clamp(speed, 0.75, 2.0);
    this.state.googleTtsSpeed = Number(clamped.toFixed(2));
    if (this.audioPlayer) {
      try {
        this.audioPlayer.playbackRate = this.state.googleTtsSpeed;
      } catch (err) {
        logger.warn('Failed to set audioPlayer.playbackRate:', err);
      }
    }
    this.notify();
  }

  setRateMultiplier(rate: number): void {
    this.state.rateMultiplier = clamp(rate, 0.7, 1.4);
    this.state.googleTtsSpeed = Number(clamp(1.2 * this.state.rateMultiplier, 0.75, 2.0).toFixed(2));
    if (this.audioPlayer) {
      try {
        this.audioPlayer.playbackRate = this.state.googleTtsSpeed;
      } catch {}
    }
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
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('---'));
  }

  /**
   * Main entry point to speak text.
   * Invoked synchronously inside user click/touch event to unlock mobile audio.
   */
  speak(rawText: string, options: { startLine?: number; withChime?: boolean } = {}): void {
    if (typeof window === 'undefined') return;

    // Reset previous playback and audio tracks
    this.stop();
    stopChant();
    ambientSoundEngine.setSoundscape('none');

    // 1. Play temple bell chime synchronously to unlock Web Audio context on mobile
    if (options.withChime !== false) {
      this.playTempleChime();
    }

    // 2. Select randomized persona
    const presetKeys: SpiritualVoicePresetId[] = ['sinsei', 'dharma', 'meditation'];
    const chosenPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    this.state.activePresetId = chosenPreset;

    this.textLines = this.prepareLines(rawText);
    this.state.currentText = rawText;
    this.state.totalLines = this.textLines.length;
    const startIdx = options.startLine ?? 0;
    this.state.currentLineIndex = startIdx;
    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.state.isFallbackMelody = false;
    this.notify();

    // 3. Engine routing:
    // If engine is 'google' (default for mobile & web), or if native synth is unavailable:
    if (this.state.engineType === 'google' || !this.getSynth()) {
      this.speakWithAudioTTS(startIdx);
      return;
    }

    // Otherwise use native device speech synthesis
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
    } else {
      this.speakWithAudioTTS(startIdx);
    }
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

      utter.rate = clamp(baseRate * this.state.rateMultiplier, 0.75, 1.25);
      utter.pitch = clamp(basePitch * this.state.pitchMultiplier, 0.8, 1.25);

      // Voice resolution: always specify 'th-TH' for standard Thai reading
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

        // If Web Speech API fails on mobile (e.g. missing Thai voice data on Android),
        // seamlessly fall back to high-compatibility Google Translate Audio TTS!
        this.speakWithAudioTTS(index);
      };

      synth.speak(utter);
    } catch (err) {
      logger.warn('Failed to speak via SpeechSynthesis, switching to Audio TTS:', err);
      this.speakWithAudioTTS(index);
    }
  }

  /**
   * Google Translate Audio TTS engine:
   * Uses HTML5 Audio with authentic Thai pronunciation and tones.
   * By reusing the same audio element instance across verse lines, mobile browsers
   * (iOS Safari & Android Chrome) allow continuous recitation without autoplay block!
   */
  private speakWithAudioTTS(index: number): void {
    if (!this.state.isSpeaking || index >= this.textLines.length) {
      this.stop();
      return;
    }

    this.state.currentLineIndex = index;
    this.state.isFallbackMelody = false;
    this.notify();

    const lineText = this.textLines[index];
    if (!lineText) {
      this.speakWithAudioTTS(index + 1);
      return;
    }

    // Google Translate TTS stream: clear Thai articulation with tones and correct vowel lengths
    const cleanText = lineText.replace(/[#*_~`]/g, '').trim().slice(0, 180);
    const query = encodeURIComponent(cleanText);
    // Use server proxy (/api/tts) first to eliminate Referer-based 404 block from Google Translate
    const ttsUrl = `/api/tts?ie=UTF-8&client=tw-ob&tl=th&q=${query}`;
    const directTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=th&q=${query}`;

    try {
      // Reuse existing Audio instance if available to maintain mobile user activation authorization
      if (!this.audioPlayer) {
        this.audioPlayer = new Audio();
      }

      const audio = this.audioPlayer;
      audio.pause();
      try {
        (audio as any).referrerPolicy = 'no-referrer';
      } catch {}
      audio.src = ttsUrl;

      const preset = SPIRITUAL_PRESETS[this.state.activePresetId] || SPIRITUAL_PRESETS.sinsei;
      const targetSpeed = this.state.googleTtsSpeed || 1.2;
      const applyPlaybackRate = (rate: number) => {
        try {
          audio.defaultPlaybackRate = rate;
          audio.playbackRate = rate;
        } catch (err) {
          logger.debug('playbackRate assignment constrained (e.g. Low Power Mode):', err);
          try {
            audio.defaultPlaybackRate = 1.0;
            audio.playbackRate = 1.0;
          } catch {}
        }
      };

      applyPlaybackRate(targetSpeed);

      // Keep playbackRate sticky across browser media load/metadata events
      audio.onloadedmetadata = () => {
        applyPlaybackRate(targetSpeed);
      };
      audio.onplay = () => {
        applyPlaybackRate(targetSpeed);
      };

      audio.onended = () => {
        if (!this.state.isSpeaking) return;
        const pauseDuration = preset.id === 'meditation' ? 450 : 250;
        this.speechTimeout = window.setTimeout(() => {
          this.speakWithAudioTTS(index + 1);
        }, pauseDuration);
      };

      audio.onerror = (e) => {
        logger.warn('Audio TTS stream error at line', index, e);
        // If the local proxy path had an issue, attempt direct endpoint once
        if (audio.src && audio.src.includes('/api/tts')) {
          audio.src = directTtsUrl;
          applyPlaybackRate(targetSpeed);
          audio.play().catch(() => {
            this.startMelodicFallback(
              index,
              '💡 กำลังเปิดเสียงระนาดเอกและระฆังมงคลบรรเลงคลอคำทำนาย'
            );
          });
          return;
        }

        // Only if both fail (e.g. completely offline), fall back to melodic chime
        this.startMelodicFallback(
          index,
          '💡 กำลังเปิดเสียงระนาดเอกและระฆังมงคลบรรเลงคลอคำทำนาย'
        );
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          logger.warn('Audio TTS play catch:', err);
          // If play failed, attempt playback at standard 1.0 rate in case rate > 1.0 was restricted by Low Power Mode
          try {
            audio.defaultPlaybackRate = 1.0;
            audio.playbackRate = 1.0;
            const retryPromise = audio.play();
            if (retryPromise !== undefined) {
              retryPromise.catch(() => {
                this.startMelodicFallback(index);
              });
            }
          } catch {
            this.startMelodicFallback(index);
          }
        });
      }
    } catch (err) {
      logger.error('Failed to play Audio TTS:', err);
      this.startMelodicFallback(index);
    }
  }

  /**
   * Offline Melodic Fallback mode:
   * Uses Web Audio 7TET Ranat & Khim sacred melody + temple bells
   */
  private startMelodicFallback(fromLine = 0, noticeMsg?: string): void {
    if (this.fallbackTicker) {
      window.clearInterval(this.fallbackTicker);
      this.fallbackTicker = null;
    }

    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
      } catch {}
      this.audioPlayer = null;
    }

    const synth = this.getSynth();
    if (synth) {
      try {
        synth.cancel();
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

    if (this.state.isFallbackMelody) {
      stopChant();
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

    if (this.state.isFallbackMelody) {
      playChant('thai');
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
