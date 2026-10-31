// Web Audio API Synthesizer for 10 Civilizations' Sacred Chants & Mystic Soundscapes
// Generates authentic procedural chant drones, sacred bells, gongs, and ritual resonance.

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
    chantTitle: 'บทสวดสรภัญญะมงคล & กริ่งระฆังวัดสยาม',
    origChantName: 'Siam Buddhist Sarapanya & Temple Bell Chime',
    mantraPreview: 'นะโม โอมมหาลาโภ พุทโธ ชัยยะ (กังวานระฆังทองเหลือง)',
    instrument: 'ระฆังทองเหลืองใบใหญ่ & เสียงสวดมนต์โทนต่ำ',
  },
  chinese: {
    id: 'chinese',
    civilization: 'จีน',
    chantTitle: 'มนตราเต๋าฟ้าดิน & ฆ้องทองมังกรสวรรค์',
    origChantName: 'Taoist Celestial Gong & Dragon Sutra',
    mantraPreview: 'อี้ชี่ฮั่วซานชิง ฟ้าดินไร้ขอบเขต (ระฆังสำริดก้อง)',
    instrument: 'ฆ้องหลัวโบราณ & ระฆังสำริดหยก',
  },
  vedic: {
    id: 'vedic',
    civilization: 'อินเดีย',
    chantTitle: 'มหาคายตรีมนตรา & เสียงโอม 108Hz ภพภูมิจักรวาล',
    origChantName: 'Vedic Gayatri Mantra & 108Hz Sacred Om Drone',
    mantraPreview: 'โอม ชานติ ชานติ ชานติ ภวะ (สั่นสะเทือนเซลล์)',
    instrument: 'เสียงทานปูระ & มนต์โอมโอเวอร์โทนธรรมชาติ',
  },
  western: {
    id: 'western',
    civilization: 'ยุโรป / สากล',
    chantTitle: 'บทสวดเกรกอเรียน & ออร์แกนท่อวิหารศักดิ์สิทธิ์',
    origChantName: 'Gregorian Cathedral Chant & Sacred Pipe Organ',
    mantraPreview: 'Benedictus qui venit in nomine Domini (ก้องกังวานโบสถ์หิน)',
    instrument: 'ออร์แกนมหาวิหาร & ประสานเสียงเกรกอเรียน',
  },
  native_american: {
    id: 'native_american',
    civilization: 'อินเดียแดง',
    chantTitle: 'บทสวดวิญญาณสายลม & จังหวะกลองชามานพญาอินทรี',
    origChantName: 'Shamanic Spirit Wind Chant & Sacred Cedar Drum',
    mantraPreview: 'เฮยา เฮยา โฮ... วิญญาณธรรมชาติคุ้มครอง (เสียงขลุ่ยไม้ซีดาร์)',
    instrument: 'กลองหนังวัวกระทิง & ขลุ่ยไม้ซีดาร์วิญญาณ',
  },
  islamic: {
    id: 'islamic',
    civilization: 'อิสลาม / อาหรับ',
    chantTitle: 'มนตราแห่งดวงดาวบุรุจ & คอร์ดดนตรีอาหรับโบราณ',
    origChantName: 'Celestial Buruj Maqam & Desert Oud Harmonic',
    mantraPreview: 'บิสมิลลาฮ์ แสงแห่งดวงดาวนำทาง (ก้องกังวานแห่งโอเอซิส)',
    instrument: 'เสียงฮัมลี้ลับ & พิณอุ๊ดแห่งทะเลทรายราตรี',
  },
  vietnamese: {
    id: 'vietnamese',
    civilization: 'เวียดนาม',
    chantTitle: 'เสียงฆ้องมงคลวัดเจดีย์เตริ่นกว็อก & พิณด่าวบ่าว',
    origChantName: 'Tran Quoc Pagoda Bronze Bell & Dan Bau Harmony',
    mantraPreview: 'นามโม กวนเท้เอิม บ่อต๊าต อวยพรอายุยืน (เสียงสายพิณสะบัดกังวาน)',
    instrument: 'ฆ้องหม่องสำริด & พิณดนตรีสายเดียวโบราณ',
  },
  burmese: {
    id: 'burmese',
    civilization: 'พม่า',
    chantTitle: 'ระฆังเจดีย์ชเวดากอง & มนต์มหาภูติ 8 ทิศ',
    origChantName: 'Shwedagon Kyi-zee Bell & 8 Mahabhuta Chants',
    mantraPreview: 'พุทธัง สรณัง คัจฉามิ (เสียงกริ่งชเวดากองหมุนสะท้อน)',
    instrument: 'ระฆังสามเหลี่ยมจีซี & สวดมนต์เจดีย์ทองคำ',
  },
  egyptian: {
    id: 'egyptian',
    civilization: 'อียิปต์โบราณ',
    chantTitle: 'มนต์สุริยเทพรา & เสียงซิสตรัมทองคำวิหารคาร์นัค',
    origChantName: 'Hymn to Sun God Ra & Karnak Golden Sistrum',
    mantraPreview: 'โอ้ รา ผู้สถิตเหนือเส้นขอบฟ้า (ท่วงทำนองไอยคุปต์กึกก้อง)',
    instrument: 'เครื่องเขย่าซิสตรัม & คลื่นความถี่ลึกลับแห่งพีระมิด',
  },
  aztec_mayan: {
    id: 'aztec_mayan',
    civilization: 'แอซเท็ก / มายา',
    chantTitle: 'เสียงขลุ่ยดินเผาสองห้อง & มนต์สุริยะพีระมิดชีเชนอิตซา',
    origChantName: 'Mayan Double-Chamber Ocarina & Chichen Itza Solar Chant',
    mantraPreview: 'ฮุนับคู จิตวิญญาณสุริยะและกาแล็กซี (เสียงนกศักดิ์สิทธิ์เกตซาล)',
    instrument: 'ขลุ่ยดินเผาโบราณ & กลองหินเตโปนัซตลี',
  },
};

// Global audio state
let audioCtx: AudioContext | null = null;
let currentNodes: { stop: () => void } | null = null;
let isMuted = false;
let activeChantId: string | null = null;
const listeners = new Set<(chantId: string | null) => void>();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

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
  if (currentNodes) {
    try {
      currentNodes.stop();
    } catch {
      // Ignore
    }
    currentNodes = null;
  }
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

/**
 * Play authentic synthesized sacred chant for a given civilization
 */
export function playChant(sysId: string): void {
  if (isMuted) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Stop any currently playing chant
  stopChant();

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  // Fade in smoothly over 0.25 seconds
  masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.25);
  masterGain.connect(ctx.destination);

  const cleanups: (() => void)[] = [];

  try {
    switch (sysId) {
      case 'thai': {
        // Thai Buddhist Monk Chant (Low Drone around F2 ~ 87.3Hz) + Resonant Brass Singing Bell (528Hz)
        const chantOsc = ctx.createOscillator();
        chantOsc.type = 'sawtooth';
        chantOsc.frequency.setValueAtTime(87.3, now); // F2

        // Formant filter for chanting "Ommmm-Auummm"
        const formant = ctx.createBiquadFilter();
        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(540, now);
        formant.Q.setValueAtTime(4.0, now);

        // Vocal vibrato LFO
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(3.2, now); // gentle chanting tremor
        lfoGain.gain.setValueAtTime(1.8, now);
        lfo.connect(chantOsc.frequency);

        const chantGain = ctx.createGain();
        chantGain.gain.setValueAtTime(0.35, now);

        chantOsc.connect(formant);
        formant.connect(chantGain);
        chantGain.connect(masterGain);

        chantOsc.start(now);
        lfo.start(now);

        // Temple Brass Bell Strike (528 Hz Love/Auspicious Solfeggio frequency + metallic shimmer)
        [528, 1056, 1584].forEach((freq, i) => {
          const bell = ctx.createOscillator();
          const bellGain = ctx.createGain();
          bell.type = 'sine';
          bell.frequency.setValueAtTime(freq, now);

          bellGain.gain.setValueAtTime(i === 0 ? 0.4 : 0.15, now);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          bell.connect(bellGain);
          bellGain.connect(masterGain);

          bell.start(now);
          bell.stop(now + 4.0);
        });

        cleanups.push(() => {
          chantGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          setTimeout(() => {
            try { chantOsc.stop(); lfo.stop(); } catch {}
          }, 350);
        });
        break;
      }

      case 'chinese': {
        // Deep Taoist Gong (128Hz with pitch descent) + High Jade Chime (pentatonic E6 / G6)
        const gong = ctx.createOscillator();
        const gongGain = ctx.createGain();
        gong.type = 'triangle';
        gong.frequency.setValueAtTime(138, now);
        gong.frequency.exponentialRampToValueAtTime(108, now + 1.2);

        gongGain.gain.setValueAtTime(0.55, now);
        gongGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

        gong.connect(gongGain);
        gongGain.connect(masterGain);
        gong.start(now);
        gong.stop(now + 4.6);

        // Taoist Celestial Chimes (Pentatonic arpeggio chime)
        const chimePitches = [659.25, 783.99, 987.77, 1318.51];
        chimePitches.forEach((pitch, idx) => {
          const chime = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          const delay = idx * 0.18;

          chime.type = 'sine';
          chime.frequency.setValueAtTime(pitch, now + delay);

          chimeGain.gain.setValueAtTime(0.0001, now);
          chimeGain.gain.setValueAtTime(0.25, now + delay);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.5);

          chime.connect(chimeGain);
          chimeGain.connect(masterGain);

          chime.start(now + delay);
          chime.stop(now + delay + 2.6);
        });

        cleanups.push(() => {
          try { gong.stop(); } catch {}
        });
        break;
      }

      case 'vedic': {
        // Sacred Gayatri Om 108Hz Fundamental + Tanpura Drone Harmonics (108Hz, 162Hz, 216Hz, 324Hz)
        const freqs = [108, 162, 216, 324];
        const oscs: OscillatorNode[] = [];

        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, now);

          // Tanpura breathing shimmer
          const oscLfo = ctx.createOscillator();
          const oscLfoGain = ctx.createGain();
          oscLfo.frequency.setValueAtTime(0.25 + idx * 0.1, now);
          oscLfoGain.gain.setValueAtTime(0.08, now);
          oscLfo.connect(oscGain.gain);

          oscGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.15, now);

          osc.connect(oscGain);
          oscGain.connect(masterGain);

          osc.start(now);
          oscLfo.start(now);
          oscs.push(osc);
          cleanups.push(() => {
            try { osc.stop(); oscLfo.stop(); } catch {}
          });
        });
        break;
      }

      case 'western': {
        // Cathedral Organ & Gregorian Sacred Triad (C3 = 130.81Hz, G3 = 196Hz, E4 = 329.63Hz)
        const chords = [130.81, 196.0, 329.63, 523.25];
        chords.forEach((c) => {
          const pipe = ctx.createOscillator();
          const pipeGain = ctx.createGain();
          pipe.type = 'sawtooth';
          pipe.frequency.setValueAtTime(c, now);

          // Cathedral acoustics lowpass
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(750, now);

          pipeGain.gain.setValueAtTime(0.12, now);

          pipe.connect(filter);
          filter.connect(pipeGain);
          pipeGain.connect(masterGain);

          pipe.start(now);
          cleanups.push(() => {
            try { pipe.stop(); } catch {}
          });
        });
        break;
      }

      case 'native_american': {
        // Shamanic Heartbeat Buffalo Drum (60Hz dual thump) + Cedar Spirit Flute (Pentatonic F#)
        const playDrumHit = (hitTime: number) => {
          const drum = ctx.createOscillator();
          const drumGain = ctx.createGain();
          drum.type = 'sine';
          drum.frequency.setValueAtTime(80, hitTime);
          drum.frequency.exponentialRampToValueAtTime(45, hitTime + 0.3);

          drumGain.gain.setValueAtTime(0.6, hitTime);
          drumGain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.5);

          drum.connect(drumGain);
          drumGain.connect(masterGain);

          drum.start(hitTime);
          drum.stop(hitTime + 0.55);
        };

        // Double heartbeat: Ba-bum, Ba-bum
        playDrumHit(now);
        playDrumHit(now + 0.22);
        playDrumHit(now + 1.2);
        playDrumHit(now + 1.42);

        // Cedar Spirit Flute
        const flute = ctx.createOscillator();
        const fluteGain = ctx.createGain();
        flute.type = 'sine';
        flute.frequency.setValueAtTime(370, now + 0.3); // F#4
        flute.frequency.linearRampToValueAtTime(440, now + 0.9); // A4 glide

        fluteGain.gain.setValueAtTime(0.0001, now);
        fluteGain.gain.setValueAtTime(0.25, now + 0.3);
        fluteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

        flute.connect(fluteGain);
        fluteGain.connect(masterGain);
        flute.start(now + 0.3);
        flute.stop(now + 3.3);

        cleanups.push(() => {
          try { flute.stop(); } catch {}
        });
        break;
      }

      case 'islamic': {
        // Maqam Bayati celestial drone (D2 = 73.4Hz, A2 = 110Hz, D3 = 146.8Hz) + Arabian Oud Glissando
        const maqamNotes = [73.4, 110.0, 146.8];
        maqamNotes.forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          g.gain.setValueAtTime(0.2, now);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now);
          cleanups.push(() => {
            try { osc.stop(); } catch {}
          });
        });

        // Oud pluck slide
        const oud = ctx.createOscillator();
        const oudGain = ctx.createGain();
        oud.type = 'sawtooth';
        oud.frequency.setValueAtTime(293.66, now + 0.1); // D4
        oud.frequency.linearRampToValueAtTime(329.63, now + 0.4); // E4
        oud.frequency.linearRampToValueAtTime(349.23, now + 0.8); // F4

        const oudFilter = ctx.createBiquadFilter();
        oudFilter.type = 'bandpass';
        oudFilter.frequency.setValueAtTime(800, now);
        oudFilter.Q.setValueAtTime(2.5, now);

        oudGain.gain.setValueAtTime(0.001, now);
        oudGain.gain.setValueAtTime(0.35, now + 0.1);
        oudGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        oud.connect(oudFilter);
        oudFilter.connect(oudGain);
        oudGain.connect(masterGain);
        oud.start(now + 0.1);
        oud.stop(now + 3.1);
        break;
      }

      case 'vietnamese': {
        // Tran Quoc Bronze Bell + Microtonal Dan Bau Bend (392Hz G4 to 440Hz A4)
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(349.23, now); // F4
        bellGain.gain.setValueAtTime(0.45, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
        bell.connect(bellGain);
        bellGain.connect(masterGain);
        bell.start(now);
        bell.stop(now + 3.6);

        // Dan Bau bend
        const danBau = ctx.createOscillator();
        const danBauGain = ctx.createGain();
        danBau.type = 'sine';
        danBau.frequency.setValueAtTime(392, now + 0.2);
        danBau.frequency.exponentialRampToValueAtTime(523.25, now + 0.9);
        danBau.frequency.linearRampToValueAtTime(440, now + 1.6);

        danBauGain.gain.setValueAtTime(0.001, now);
        danBauGain.gain.setValueAtTime(0.3, now + 0.2);
        danBauGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

        danBau.connect(danBauGain);
        danBauGain.connect(masterGain);
        danBau.start(now + 0.2);
        danBau.stop(now + 3.3);
        break;
      }

      case 'burmese': {
        // Triangular Burmese Kyi-zee Bell (Flutters and spins at 392Hz) + Golden Pagoda Drone
        const kyiZee = ctx.createOscillator();
        const kyiZeeGain = ctx.createGain();
        kyiZee.type = 'sine';
        kyiZee.frequency.setValueAtTime(392.0, now);

        // Flutter modulation simulating spinning metal triangle
        const flutterLfo = ctx.createOscillator();
        flutterLfo.frequency.setValueAtTime(7.5, now);
        const flutterGain = ctx.createGain();
        flutterGain.gain.setValueAtTime(14.0, now);
        flutterLfo.connect(kyiZee.frequency);

        kyiZeeGain.gain.setValueAtTime(0.4, now);
        kyiZeeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        kyiZee.connect(kyiZeeGain);
        kyiZeeGain.connect(masterGain);

        kyiZee.start(now);
        flutterLfo.start(now);
        kyiZee.stop(now + 4.3);
        flutterLfo.stop(now + 4.3);
        break;
      }

      case 'egyptian': {
        // Phrygian Drone (E2 = 82.4Hz + B2 = 123.4Hz + F3 = 174.6Hz) + Golden Sistrum Rattle
        [82.4, 123.4, 174.6].forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);

          const filt = ctx.createBiquadFilter();
          filt.type = 'lowpass';
          filt.frequency.setValueAtTime(420, now);

          g.gain.setValueAtTime(0.18, now);
          osc.connect(filt);
          filt.connect(g);
          g.connect(masterGain);
          osc.start(now);
          cleanups.push(() => {
            try { osc.stop(); } catch {}
          });
        });

        // Golden Sistrum Chime shimmer (metallic cluster)
        [2093, 2793, 3135].forEach((sf, sidx) => {
          const sOsc = ctx.createOscillator();
          const sGain = ctx.createGain();
          sOsc.type = 'sine';
          sOsc.frequency.setValueAtTime(sf, now + sidx * 0.08);

          sGain.gain.setValueAtTime(0.15, now + sidx * 0.08);
          sGain.gain.exponentialRampToValueAtTime(0.0001, now + sidx * 0.08 + 1.4);

          sOsc.connect(sGain);
          sGain.connect(masterGain);
          sOsc.start(now + sidx * 0.08);
          sOsc.stop(now + sidx * 0.08 + 1.5);
        });
        break;
      }

      case 'aztec_mayan': {
        // Mayan Double-Chamber Ocarina with Acoustic Beating (432Hz + 438Hz = 6Hz Theta trance beat)
        const ocarina1 = ctx.createOscillator();
        const ocarina2 = ctx.createOscillator();
        const ocarinaGain = ctx.createGain();

        ocarina1.type = 'sine';
        ocarina2.type = 'sine';
        ocarina1.frequency.setValueAtTime(432.0, now); // Sacred 432Hz
        ocarina2.frequency.setValueAtTime(438.0, now); // Binaural 6Hz beat

        ocarinaGain.gain.setValueAtTime(0.001, now);
        ocarinaGain.gain.setValueAtTime(0.28, now + 0.15);
        ocarinaGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

        ocarina1.connect(ocarinaGain);
        ocarina2.connect(ocarinaGain);
        ocarinaGain.connect(masterGain);

        ocarina1.start(now);
        ocarina2.start(now);
        ocarina1.stop(now + 3.7);
        ocarina2.stop(now + 3.7);

        // Low stone temple drum
        const stoneDrum = ctx.createOscillator();
        const stoneGain = ctx.createGain();
        stoneDrum.type = 'triangle';
        stoneDrum.frequency.setValueAtTime(95, now);
        stoneDrum.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        stoneGain.gain.setValueAtTime(0.5, now);
        stoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        stoneDrum.connect(stoneGain);
        stoneGain.connect(masterGain);
        stoneDrum.start(now);
        stoneDrum.stop(now + 0.65);
        break;
      }

      default: {
        // Generic auspicious temple bell
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(440, now);
        bellGain.gain.setValueAtTime(0.3, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        bell.connect(bellGain);
        bellGain.connect(masterGain);
        bell.start(now);
        bell.stop(now + 2.6);
        break;
      }
    }

    currentNodes = {
      stop: () => {
        try {
          masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
          setTimeout(() => {
            cleanups.forEach((c) => {
              try { c(); } catch {}
            });
            masterGain.disconnect();
          }, 280);
        } catch {
          // Ignore
        }
      },
    };

    notifyListeners(sysId);
  } catch (err) {
    console.warn('Audio synthesis error:', err);
  }
}
