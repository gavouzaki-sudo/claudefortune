import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ALL_TEMPLES,
  GAME_EVENTS,
  WISH_TOPICS,
  TEMPLE_TILE_IDS,
  type TempleItem,
  type GameEvent,
} from '../data/sacredTemplesData';
import { saveJournalEntry } from '../utils/fortuneJournal';
import { buildSacredJourneyCardData } from '../utils/cardDataBuilder';
import type { CardData } from '../utils/luckyCardCanvas';
import { useChantAudioState } from '../hooks/useChantAudioState';

interface GameState {
  version: number;
  selected: TempleItem[];
  position: number;
  turn: number;
  merit: number;
  visited: number[];
  triggered: number[];
  inventory: { yantra: number; bell: number; lotus: number };
  skipTurns: number;
  status: 'ready' | 'moving' | 'temple' | 'event' | 'finished';
  history: string[];
  wishes: Record<number, string>;
  lastDice: number;
  completed: boolean;
}

const SAVE_KEY = 'sacredJourney9.single.v1';
const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function secureRandomInt(max: number): number {
  const arr = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createFreshGame(): GameState {
  const randomized = shuffleArray(ALL_TEMPLES)
    .slice(0, 9)
    .map((temple, idx) => ({
      ...temple,
      tileId: TEMPLE_TILE_IDS[idx],
    }));

  return {
    version: 1,
    selected: randomized,
    position: 1,
    turn: 0,
    merit: 0,
    visited: [],
    triggered: [],
    inventory: { yantra: 0, bell: 0, lotus: 0 },
    skipTurns: 0,
    status: 'ready',
    history: ['เริ่มต้นการเดินทาง สุ่มวัดมงคล 9 แห่งจากฐานข้อมูล 100 วัดทั่วไทย'],
    wishes: {},
    lastDice: 0,
    completed: false,
  };
}

interface SacredJourney9GameProps {
  onToast: (msg: string) => void;
  onLaunchFireworks?: (bursts?: number) => void;
  onOpenCard?: (card: CardData) => void;
}

export const SacredJourney9Game: React.FC<SacredJourney9GameProps> = ({
  onToast,
  onLaunchFireworks,
  onOpenCard,
}) => {
  const [state, setState] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          parsed.version === 1 &&
          Array.isArray(parsed.selected) &&
          parsed.selected.length === 9 &&
          typeof parsed.position === 'number'
        ) {
          if (parsed.status === 'moving') {
            parsed.status = 'ready';
          }
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return createFreshGame();
  });

  const { isMuted } = useChantAudioState();
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<number>(state.lastDice || 5);

  const [activeModal, setActiveModal] = useState<
    | { type: 'temple'; temple: TempleItem }
    | { type: 'event'; event: GameEvent; id: number }
    | { type: 'yantra_choice'; delta: number }
    | { type: 'finish' }
    | { type: 'help' }
    | { type: 'temple_detail'; temple: TempleItem }
    | { type: 'confirm_new_game' }
    | null
  >(null);

  const [selectedWish, setSelectedWish] = useState<string>(WISH_TOPICS[0]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<Set<number>>(new Set());
  const isMountedRef = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;
  const isRollingRef = useRef(isRolling);
  isRollingRef.current = isRolling;
  const hasRecoveredOnMountRef = useRef(false);

  const getTempleAtTile = useCallback(
    (tileNum: number, selectedList: TempleItem[] = stateRef.current.selected) => {
      return selectedList.find((t) => t.tileId === tileNum);
    },
    []
  );

  // Unmount cleanup for timers and AudioContext
  useEffect(() => {
    isMountedRef.current = true;
    const timers = timersRef.current;
    return () => {
      isMountedRef.current = false;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Safely restore pending modal once on initial mount if restored from localStorage
  useEffect(() => {
    if (hasRecoveredOnMountRef.current) return;
    hasRecoveredOnMountRef.current = true;
    if (activeModal === null) {
      if (state.status === 'temple') {
        const t = getTempleAtTile(state.position);
        if (t && !state.visited.includes(t.id)) {
          setActiveModal({ type: 'temple', temple: t });
        } else {
          setState((prev) => ({ ...prev, status: 'ready' }));
        }
      } else if (state.status === 'event') {
        const ev = GAME_EVENTS[state.position];
        if (ev && !state.triggered.includes(state.position)) {
          setActiveModal({ type: 'event', event: ev, id: state.position });
        } else {
          setState((prev) => ({ ...prev, status: 'ready' }));
        }
      } else if (state.status === 'moving') {
        setState((prev) => ({ ...prev, status: 'ready' }));
      }
    }
  }, [activeModal, getTempleAtTile, state.position, state.status, state.triggered, state.visited]);

  // Handle Escape key to dismiss modal
  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // Storage full
    }
  }, [state]);

  // Audio synthesizer
  const playSound = useCallback(
    (type: 'dice' | 'step' | 'bell' | 'gong' | 'item') => {
      if (isMuted) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;

        if (type === 'dice') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(240 + Math.random() * 80, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'step') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320 + Math.random() * 40, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.06);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.07);
        } else if (type === 'bell') {
          const baseFreqs = [528, 792, 1056];
          baseFreqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.99, now + 1.2);

            const initialGain = 0.22 / (idx + 1);
            gain.gain.setValueAtTime(initialGain, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.25);
          });
        } else if (type === 'gong') {
          const gong = ctx.createOscillator();
          const gain = ctx.createGain();
          gong.type = 'triangle';
          gong.frequency.setValueAtTime(140, now);
          gong.frequency.exponentialRampToValueAtTime(55, now + 2.4);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
          gong.connect(gain);
          gain.connect(ctx.destination);
          gong.start(now);
          gong.stop(now + 2.5);
        } else if (type === 'item') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
        }
      } catch {
        // Audio error ignored
      }
    },
    [isMuted]
  );

  // Check if there is an unvisited temple between from and to in direction dir
  const findNearestUnvisitedTemple = useCallback(
    (from: number, to: number, dir: number, visited: number[], selectedList: TempleItem[]) => {
      if (dir > 0) {
        for (let n = from + 1; n <= to; n++) {
          const t = getTempleAtTile(n, selectedList);
          if (t && !visited.includes(t.id)) {
            return n;
          }
        }
      } else {
        for (let n = from - 1; n >= to; n--) {
          const t = getTempleAtTile(n, selectedList);
          if (t && !visited.includes(t.id)) {
            return n;
          }
        }
      }
      return null;
    },
    [getTempleAtTile]
  );

  const delay = useCallback((ms: number) => {
    return new Promise<boolean>((resolve) => {
      const id = window.setTimeout(() => {
        timersRef.current.delete(id);
        resolve(isMountedRef.current);
      }, ms);
      timersRef.current.add(id);
    });
  }, []);

  // Move player step-by-step
  const movePlayerSteps = useCallback(
    async (steps: number, allowTrigger = true): Promise<'temple' | 'event' | 'finished' | 'ready' | 'aborted'> => {
      const cur = stateRef.current;
      const from = cur.position;
      let target = Math.max(1, Math.min(36, from + steps));
      const dir = Math.sign(target - from);

      if (dir !== 0) {
        const checkpoint = findNearestUnvisitedTemple(from, target, dir, cur.visited, cur.selected);
        if (checkpoint !== null) {
          target = checkpoint;
        }
      }

      setState((prev) => ({ ...prev, status: 'moving' }));

      // Step by step animation
      let currentPos = from;
      for (let n = from + dir; n !== target + dir && dir !== 0; n += dir) {
        currentPos = n;
        setState((prev) => ({ ...prev, position: currentPos }));
        playSound('step');
        const alive = await delay(110);
        if (!alive) return 'aborted';
      }

      const latest = stateRef.current;

      // Check arrival on tile
      const templeOnTarget = getTempleAtTile(target, latest.selected);
      if (templeOnTarget && !latest.visited.includes(templeOnTarget.id)) {
        playSound('bell');
        setState((prev) => ({ ...prev, status: 'temple' }));
        setActiveModal({ type: 'temple', temple: templeOnTarget });
        return 'temple';
      }

      // Check event on tile
      const eventOnTarget = GAME_EVENTS[target];
      if (allowTrigger && eventOnTarget && !latest.triggered.includes(target)) {
        playSound('item');
        setState((prev) => ({
          ...prev,
          status: 'event',
          triggered: prev.triggered.includes(target) ? prev.triggered : [...prev.triggered, target],
        }));
        setActiveModal({ type: 'event', event: eventOnTarget, id: target });
        return 'event';
      }

      // Reached finish line tile 36
      if (target === 36) {
        if (latest.visited.length === 9) {
          playSound('gong');
          onLaunchFireworks?.(12);
          setState((prev) => ({
            ...prev,
            position: 36,
            completed: true,
            status: 'finished',
            merit: prev.merit + 150,
            history: ['🌟 เดินทางครบ 9 วัด รับโบนัสปิดท้าย 150 แต้ม', ...prev.history].slice(
              0,
              35
            ),
          }));
          setActiveModal({ type: 'finish' });
          return 'finished';
        } else {
          target = 35;
          setState((prev) => ({ ...prev, position: 35, status: 'ready' }));
          onToast('ยังสักการะไม่ครบ 9 วัด กำลังเดินทางต่อ');
          return 'ready';
        }
      }

      setState((prev) => ({ ...prev, status: 'ready' }));
      return 'ready';
    },
    [delay, findNearestUnvisitedTemple, getTempleAtTile, onLaunchFireworks, onToast, playSound]
  );

  // Roll dice action
  const handleRollDice = useCallback(async () => {
    const cur = stateRef.current;
    if (isRollingRef.current || cur.completed || cur.status !== 'ready') return;

    if (cur.skipTurns > 0) {
      setState((prev) => ({
        ...prev,
        skipTurns: Math.max(0, prev.skipTurns - 1),
        turn: prev.turn + 1,
        history: ['⏸️ พักการเดินทาง 1 รอบ', ...prev.history].slice(0, 35),
      }));
      onToast('จบรอบพักแล้ว รอบถัดไปสามารถทอยลูกเต๋าได้ตามปกติ');
      return;
    }

    setIsRolling(true);
    isRollingRef.current = true;
    const diceResult = secureRandomInt(6) + 1;

    for (let i = 0; i < 7; i++) {
      playSound('dice');
      const fake = secureRandomInt(6) + 1;
      setDisplayDice(fake);
      const alive = await delay(70);
      if (!alive) return;
    }

    setDisplayDice(diceResult);
    setIsRolling(false);
    isRollingRef.current = false;

    setState((prev) => ({
      ...prev,
      turn: prev.turn + 1,
      lastDice: diceResult,
      history: [`🎲 ทอยได้ ${diceResult} แต้ม`, ...prev.history].slice(0, 35),
    }));

    await movePlayerSteps(diceResult, true);
  }, [delay, movePlayerSteps, onToast, playSound]);

  const rollDiceRef = useRef(handleRollDice);
  rollDiceRef.current = handleRollDice;

  // Smart Primary Action (Handles Ready, Temple, Event, or Finished without getting stuck)
  const handlePrimaryAction = () => {
    if (isRolling) return;

    if (state.completed) {
      setActiveModal({ type: 'finish' });
      return;
    }

    if (state.status === 'temple') {
      const currentTemple = getTempleAtTile(state.position);
      if (currentTemple && !state.visited.includes(currentTemple.id)) {
        setActiveModal({ type: 'temple', temple: currentTemple });
      } else {
        setState((prev) => ({ ...prev, status: 'ready' }));
      }
      return;
    }

    if (state.status === 'event') {
      const ev = GAME_EVENTS[state.position];
      if (ev) {
        setActiveModal({ type: 'event', event: ev, id: state.position });
      } else {
        setState((prev) => ({ ...prev, status: 'ready' }));
      }
      return;
    }

    const currentTemple = getTempleAtTile(state.position);
    if (currentTemple && !state.visited.includes(currentTemple.id)) {
      setActiveModal({ type: 'temple', temple: currentTemple });
      return;
    }

    if (state.status === 'ready' || state.skipTurns > 0) {
      handleRollDice();
    }
  };

  // Complete Temple Blessing
  const handleConfirmTempleBlessing = (temple: TempleItem) => {
    playSound('bell');
    const isNineth = state.visited.length + 1 === 9;

    setState((prev) => {
      const nextVisited = [...prev.visited, temple.id];
      const nextWishes = { ...prev.wishes, [temple.id]: selectedWish };
      const nextMerit = prev.merit + 20 + (isNineth ? 150 : 0);
      const nextHist = [
        isNineth ? '🌟 เดินทางครบ 9 วัด รับโบนัสปิดท้าย 150 แต้ม' : '',
        `🏯 สักการะ ${temple.name} (จ.${temple.province}) · ขอพรเรื่อง ${selectedWish}`,
        ...prev.history,
      ]
        .filter(Boolean)
        .slice(0, 35);

      return {
        ...prev,
        visited: nextVisited,
        wishes: nextWishes,
        merit: nextMerit,
        position: isNineth ? 36 : prev.position,
        completed: isNineth,
        status: isNineth ? 'finished' : 'ready',
        history: nextHist,
      };
    });

    setActiveModal(null);
    onToast(`✨ สักการะ ${temple.name} สำเร็จ +20 แต้มบุญ`);

    if (isNineth) {
      playSound('gong');
      onLaunchFireworks?.(12);
      setActiveModal({ type: 'finish' });
    }
  };

  // Handle Event Acknowledge
  const handleAcknowledgeEvent = async (event: GameEvent) => {
    setActiveModal(null);

    if (event.merit) {
      setState((prev) => ({
        ...prev,
        merit: prev.merit + (event.merit || 0),
        history: [`✨ ${event.name}: ได้รับ ${event.merit} แต้มบุญ`, ...prev.history].slice(0, 35),
      }));
    }

    if (event.clearSkip) {
      setState((prev) => ({
        ...prev,
        skipTurns: 0,
        history: [`🏡 ${event.name}: ล้างสถานะหยุดพักทั้งหมด`, ...prev.history].slice(0, 35),
      }));
    }

    if (event.item) {
      const itemKey = event.item;
      const maxCount = itemKey === 'bell' ? 2 : 3;
      setState((prev) => {
        const curCount = prev.inventory[itemKey];
        if (curCount < maxCount) {
          return {
            ...prev,
            inventory: { ...prev.inventory, [itemKey]: curCount + 1 },
            history: [`🎒 ได้รับของมงคล: ${event.name}`, ...prev.history].slice(0, 35),
          };
        } else {
          return {
            ...prev,
            merit: prev.merit + 10,
            history: [
              `🎒 ${event.name} (มีของชิ้นนี้เต็มแล้ว) ได้รับ +10 แต้มแทน`,
              ...prev.history,
            ].slice(0, 35),
          };
        }
      });
      playSound('item');
    }

    if (event.skip) {
      setState((prev) => ({
        ...prev,
        skipTurns: prev.skipTurns + (event.skip || 0),
        history: [`⏸️ ${event.name}: ต้องหยุดพัก ${event.skip} รอบ`, ...prev.history].slice(0, 35),
      }));
    }

    if (event.move) {
      const delta = event.move;
      if (delta < 0 && stateRef.current.inventory.yantra > 0) {
        setActiveModal({ type: 'yantra_choice', delta });
        return;
      }
      setState((prev) => ({
        ...prev,
        history: [`📍 เหตุการณ์: เคลื่อนที่ ${delta > 0 ? '+' : ''}${delta} ช่อง`, ...prev.history].slice(
          0,
          35
        ),
      }));
      await movePlayerSteps(delta, false);
    } else {
      setState((prev) => ({ ...prev, status: 'ready' }));
    }
  };

  const handleUseYantraChoice = async (useYantra: boolean, delta: number) => {
    setActiveModal(null);
    if (useYantra) {
      playSound('item');
      setState((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, yantra: Math.max(0, prev.inventory.yantra - 1) },
        status: 'ready',
        history: ['🧿 ใช้ยันต์คุ้มภัย! ป้องกันการถอยหลังได้สำเร็จ', ...prev.history].slice(0, 35),
      }));
      onToast('🧿 ใช้ยันต์คุ้มภัย ป้องกันการถอยหลังสำเร็จ');
    } else {
      setState((prev) => ({
        ...prev,
        history: [`📍 เหตุการณ์: เคลื่อนที่ ${delta > 0 ? '+' : ''}${delta} ช่อง`, ...prev.history].slice(
          0,
          35
        ),
      }));
      await movePlayerSteps(delta, false);
    }
  };

  const handleUseInventory = async (key: 'yantra' | 'bell' | 'lotus') => {
    const cur = stateRef.current;
    if (cur.inventory[key] <= 0 || isRollingRef.current || cur.status !== 'ready' || cur.completed) {
      return;
    }

    if (key === 'yantra') {
      onToast('🧿 ยันต์คุ้มภัยจะทำงานอัตโนมัติเมื่อเจอบททดสอบถอยหลัง');
      return;
    }

    if (key === 'bell') {
      if (cur.skipTurns > 0) {
        onToast('⏸️ มีสถานะหยุดพักอยู่ กรุณาจบรอบพักหรือใช้ดอกบัวก่อนสั่นระฆัง');
        return;
      }
      playSound('bell');
      setState((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, bell: prev.inventory.bell - 1 },
        turn: Math.max(0, prev.turn - 1),
        history: ['🔔 สั่นระฆังมงคล! ได้รับสิทธิ์ทอยลูกเต๋าเพิ่มทันที', ...prev.history].slice(0, 35),
      }));
      onToast('🔔 สั่นระฆังมงคล ทอยลูกเต๋าเพิ่ม 1 ครั้ง!');
      const id = window.setTimeout(() => {
        timersRef.current.delete(id);
        if (isMountedRef.current) {
          rollDiceRef.current();
        }
      }, 300);
      timersRef.current.add(id);
      return;
    }

    if (key === 'lotus') {
      if (cur.skipTurns <= 0) {
        onToast('🪷 ปัจจุบันไม่มีสถานะหยุดพัก ไม่จำเป็นต้องใช้ดอกบัว');
        return;
      }
      playSound('item');
      setState((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, lotus: prev.inventory.lotus - 1 },
        skipTurns: 0,
        history: ['🪷 น้อมถวายดอกบัวมงคล! ยกเลิกการหยุดพักทั้งหมด', ...prev.history].slice(0, 35),
      }));
      onToast('🪷 ใช้ดอกบัวมงคล ยกเลิกการหยุดพักสำเร็จ!');
    }
  };

  const handleStartNewGame = () => {
    setActiveModal({ type: 'confirm_new_game' });
  };

  const confirmStartNewGame = () => {
    const fresh = createFreshGame();
    setState(fresh);
    setDisplayDice(5);
    setIsRolling(false);
    isRollingRef.current = false;
    setActiveModal(null);
    onToast('🌟 สุ่มวัดมงคลชุดใหม่ 9 แห่งเรียบร้อย');
  };

  // Save to Fortune Journal
  const handleSaveToFortuneJournal = () => {
    saveJournalEntry({
      type: 'remedy',
      title: 'มหามงคล 9 วัด (ไหว้พระขอพร)',
      summary: `เดินทางสักการะครบ 9 วัดมงคลทั่วไทย ได้รับแต้มบุญ ${state.merit} แต้ม อธิษฐานเรื่อง: ${selectedWish}`,
      details: {
        temples: state.selected.map((t) => `${t.name} (${t.province})`),
        merit: state.merit,
        turns: state.turn,
        wish: selectedWish,
      },
    });
    onToast('📖 บันทึกผลบุญลงใน "สมุดดวง" เรียบร้อยแล้ว ✨');
  };

  // Generate Lucky Card
  const handleOpenLuckyCard = () => {
    if (!onOpenCard) return;
    const cardData = buildSacredJourneyCardData(
      state.selected.map((t) => ({ name: t.name, province: t.province })),
      state.merit,
      selectedWish
    );
    onOpenCard(cardData);
  };

  const boardTiles = useMemo(() => {
    const tiles: number[] = [];
    for (let r = 0; r < 6; r++) {
      const row = Array.from({ length: 6 }, (_, i) => r * 6 + i + 1);
      if (r % 2 === 1) {
        row.reverse();
      }
      tiles.push(...row);
    }
    return tiles;
  }, []);

  const currentTempleOnTarget = getTempleAtTile(state.position);

  // Filtered temples on right column
  const filteredTemples = useMemo(() => {
    if (regionFilter === 'all') return state.selected;
    return state.selected.filter((t) => t.region.includes(regionFilter));
  }, [state.selected, regionFilter]);

  return (
    <div
      id="sj9-game-frame"
      className="sacred-journey-frame"
    >
      {/* COMPACT TOOLBAR MENU ROW */}
      <div className="sacred-journey-toolbar-row" style={{ justifyContent: 'center' }}>
        {/* สรุปความคืบหน้า (Auspicious Pill Tag) */}
        <div
          className="kala-mini-pill thongchai sj-toolbar-badge"
          title="ความคืบหน้าการสักการะมหามงคล"
        >
          ⭐ สักการะ {state.visited.length}/9 วัด · {state.merit} แต้มบุญ
        </div>
      </div>

      {/* MAIN GAME LAYOUT (Left: 9 Temples Box & 36-Tile Board & Dice; Right: Inventory & Log) */}
      <div className="sj-game-layout">
        {/* LEFT COLUMN: 9 TEMPLES LIST & 36-TILE BOARD & ACTION BUTTONS */}
        <div className="sj-main-col">
          {/* 9 TEMPLES LIST PANEL (FLUSH TO TOP OF BOARD COLUMN, MATCHING 6X6 BOARD WIDTH) */}
          <div id="sj-temples-section" className="sj-panel sj-right-temple-panel sj-top-temples-panel" aria-label="วัดทั้ง 9 แห่งในการเดินทางนี้">
            <div className="sj-right-panel-header">
              <h3 className="sj-section-title">
                <span>🌼 วัดทั้ง 9 แห่งในการเดินทางนี้</span>
              </h3>
              <div className="sj-temple-header-badges" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="sj-temple-count-badge">
                  {state.visited.length} / 9 สักการะแล้ว
                </span>
                {regionFilter !== 'all' && (
                  <button
                    type="button"
                    className="btn-clear-compact-select"
                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                    onClick={() => setRegionFilter('all')}
                    title="แสดงวัดทุกภาค"
                  >
                    แสดงครบ 9 วัด ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Progress Bar */}
            <div
              className="sj-progress-track"
              role="progressbar"
              aria-valuenow={state.visited.length}
              aria-valuemin={0}
              aria-valuemax={9}
              style={{ marginBottom: '10px' }}
            >
              <div
                className="sj-progress-fill"
                style={{ width: `${(state.visited.length / 9) * 100}%` }}
              />
            </div>

            <div className="sj-temple-list">
              {filteredTemples.map((temple) => {
                const isVisited = state.visited.includes(temple.id);
                const isMatchRegion = regionFilter === 'all' || temple.region.includes(regionFilter);
                return (
                  <div
                    key={temple.id}
                    className={`sj-temple-chip ${isVisited ? 'done' : ''} ${
                      isMatchRegion ? 'highlight-region' : ''
                    }`}
                    onClick={() => setActiveModal({ type: 'temple_detail', temple })}
                    title={`แตะเพื่อดูข้อมูล ${temple.name} (จ.${temple.province})`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="sj-temple-chip-header">
                      <span>{isVisited ? '✅' : '🏯'} ช่อง {temple.tileId}</span>
                      <span className="sj-temple-region-tag">ภาค{temple.region}</span>
                    </div>
                    <b className="sj-temple-chip-name">{temple.name}</b>
                    <span className="sj-temple-chip-prov">จ.{temple.province}</span>
                  </div>
                );
              })}
              {filteredTemples.length === 0 && (
                <div
                  className="sj-temple-empty-notice"
                  style={{
                    gridColumn: '1 / -1',
                    padding: '12px',
                    textAlign: 'center',
                    color: '#ffd875',
                    background: 'rgba(213, 166, 75, 0.1)',
                    borderRadius: '8px',
                    border: '1px dashed #d5a64b',
                  }}
                >
                  ไม่มีวัดในภาค{regionFilter} ใน 9 วัดรอบนี้
                  <button
                    type="button"
                    className="btn gold"
                    style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '3px 10px' }}
                    onClick={() => setRegionFilter('all')}
                  >
                    แสดงวัดครบทั้ง 9 วัด
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 36-TILE BOARD (6x6) */}
          <div className="sj-board-wrap">
            <div className="sj-board" aria-label="กระดานเกม 36 ช่อง">
              {boardTiles.map((tileId) => {
                const isCurrent = tileId === state.position;
                const temple = getTempleAtTile(tileId);
                const event = GAME_EVENTS[tileId];
                const isStart = tileId === 1;
                const isFinish = tileId === 36;
                const isVisited = temple && state.visited.includes(temple.id);

                let tileType = 'normal';
                let symbol = '🌿';
                let label = 'ทางบุญ';

                if (isStart) {
                  tileType = 'start';
                  symbol = '🚩';
                  label = 'เริ่ม';
                } else if (isFinish) {
                  tileType = 'finish';
                  symbol = '🏆';
                  label = 'เส้นชัย';
                } else if (temple) {
                  tileType = 'temple';
                  symbol = isVisited ? '✅' : '🏯';
                  label = temple.name;
                } else if (event) {
                  tileType = event.type;
                  symbol = event.icon;
                  label = event.name;
                }

                return (
                  <div
                    key={tileId}
                    className={`sj-tile ${tileType} ${isCurrent ? 'current' : ''} ${
                      isVisited ? 'visited' : ''
                    }`}
                    title={`ช่องที่ ${tileId}: ${label}`}
                    onClick={() => {
                      if (temple) {
                        setActiveModal({ type: 'temple_detail', temple });
                      }
                    }}
                  >
                    <span className="sj-tile-num">{tileId}</span>
                    <span className="sj-tile-symbol">{symbol}</span>
                    <span className="sj-tile-label">{label}</span>
                    {isCurrent && <span className="sj-tile-token">🧑</span>}
                  </div>
                );
              })}
            </div>

            {/* Board Legend */}
            <div className="sj-legend">
              <span>🏯 วัด</span>
              <span aria-hidden="true">·</span>
              <span>🌸 โบนัส</span>
              <span aria-hidden="true">·</span>
              <span>⚠️ อุปสรรค</span>
              <span aria-hidden="true">·</span>
              <span>✨ พิเศษ</span>
              <span aria-hidden="true">·</span>
              <span>🧑 ผู้เดินทาง</span>
            </div>
          </div>


          {/* CONTROLS & PRIMARY ACTION PANEL (HIGH CONTRAST & CLEARLY VISIBLE) */}
          <div className="sj-panel sj-controls-panel">
            <div className="sj-controls-row">
              <div className="sj-status-text-wrap">
                <div className="sj-message">
                  {state.completed
                    ? '🎉 เดินทางครบ 9 วัดสำเร็จแล้ว!'
                    : state.skipTurns > 0
                    ? `⏸️ ต้องหยุดพักอีก ${state.skipTurns} รอบ`
                    : state.status === 'temple'
                    ? `🏯 ถึงจุดสักการะ ${currentTempleOnTarget?.name || 'วัดมงคล'}`
                    : `ตำแหน่งปัจจุบัน: ช่อง ${state.position}`}
                </div>
                <div className="sj-submessage">
                  {state.completed
                    ? 'ขออานิสงส์ผลบุญดลบันดาลให้ท่านพบเจอแต่ความสุขสิริมงคล'
                    : state.status === 'temple'
                    ? 'กดปุ่มด้านล่างเพื่อสักการะวัดและรับพร'
                    : state.skipTurns > 0
                    ? 'กดปุ่มเพื่อจบรอบพัก หรือใช้ดอกบัวในย่ามเพื่อเดินทางต่อทันที'
                    : 'ทอยลูกเต๋าเพื่อก้าวสู่จุดหมายถัดไป'}
                </div>
              </div>

              <div className="sj-dicebox">
                <div className={`sj-dice ${isRolling ? 'rolling' : ''}`} aria-label="ลูกเต๋า">
                  {DICE_FACES[displayDice] || '⚄'}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (HIGH-CONTRAST GOLD GRADIENT - NEVER STUCK) */}
            <div className="sj-action-row">
              <button
                type="button"
                className="btn gold sj-btn sj-roll-btn"
                onClick={handlePrimaryAction}
                disabled={isRolling}
              >
                {isRolling
                  ? '🎲 กำลังทอยลูกเต๋า...'
                  : state.completed
                  ? '🎉 สำเร็จครบ 9 วัด (เปิดดูสรุป & การ์ด)'
                  : state.status === 'temple'
                  ? `🙏 สักการะ ${currentTempleOnTarget?.name || 'วัดมงคล'} (+20 แต้มบุญ)`
                  : state.status === 'event'
                  ? '✨ ตรวจดูเหตุการณ์มงคล'
                  : state.skipTurns > 0
                  ? `⏸️ จบรอบพัก (เหลืออีก ${state.skipTurns} รอบ)`
                  : `🎲 ทอยลูกเต๋าเพื่อเดินทาง (ก้าวที่ ${state.turn + 1})`}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INVENTORY & LOG */}
        <div className="sj-aside-col">

          {/* INVENTORY PANEL */}
          <div className="sj-panel sj-right-inventory-panel">
            <h3 className="sj-section-title">🎒 ของมงคลในย่าม</h3>
            <div className="sj-inventory-grid">
              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.yantra > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('yantra')}
                disabled={state.inventory.yantra === 0}
                title="ยันต์คุ้มภัย: ป้องกันการถอยหลังอัตโนมัติ"
              >
                <span className="sj-item-icon">🧿</span>
                <span className="sj-item-title">ยันต์คุ้มภัย</span>
                <span className="sj-item-count">× {state.inventory.yantra}</span>
              </button>

              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.bell > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('bell')}
                disabled={state.inventory.bell === 0 || state.completed || isRolling || state.status !== 'ready' || state.skipTurns > 0}
                title="ระฆังมงคล: กดเพื่อทอยลูกเต๋าเพิ่มทันที 1 ครั้ง"
              >
                <span className="sj-item-icon">🔔</span>
                <span className="sj-item-title">ระฆังมงคล</span>
                <span className="sj-item-count">× {state.inventory.bell}</span>
              </button>

              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.lotus > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('lotus')}
                disabled={state.inventory.lotus === 0 || state.skipTurns <= 0}
                title="ดอกบัวมงคล: ถวายเพื่อยกเลิกการหยุดพักทั้งหมด"
              >
                <span className="sj-item-icon">🪷</span>
                <span className="sj-item-title">ดอกบัวมงคล</span>
                <span className="sj-item-count">× {state.inventory.lotus}</span>
              </button>
            </div>
            <div className="sj-item-desc">
              ยันต์คุ้มภัยป้องกันการถอยหลัง · ระฆังให้ทอยเพิ่ม · ดอกบัวล้างสถานะหยุดพัก
            </div>
          </div>

          {/* TRAVEL LOG PANEL */}
          <div className="sj-panel sj-right-log-panel">
            <h3 className="sj-section-title">📜 บันทึกการเดินทาง</h3>
            <div className="sj-log-box" role="log" aria-live="polite">
              {state.history.slice(0, 15).map((logItem, index) => (
                <div key={index} className="sj-log-entry">
                  • {logItem}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Scroll To Top Button */}
          <div className="sj-quick-switch-row">
            <button
              type="button"
              className="sj-quick-switch-btn"
              onClick={() => {
                document.getElementById('sj9-game-frame')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              ⬆️ เลื่อนขึ้นด้านบนกระดาน & ทอยลูกเต๋า
            </button>
          </div>
        </div>
      </div>

      <div className="sj-footer-note">
        เกมเพื่อความบันเทิงและส่งเสริมการเรียนรู้สถานที่ทางวัฒนธรรมไทย · คะแนนบุญเป็นคะแนนสมมติในเกม
      </div>

      {/* 
        Comment before update:
        Fix: Render all modals via createPortal to document.body.
        Previously, modals were rendered inside the game frame (#sj9-game-frame).
        When clicking buttons in "วัดทั้ง 9 แห่งในการเดินทางนี้", the modal was trapped inside
        the outer framed box, causing two nested/stacked window frames to appear (outer game frame + inner modal frame).
        By portaling to document.body, the overlay covers the entire viewport with a full-screen backdrop,
        ensuring that only a single, clean framed window appears on screen.
      */}
      {activeModal && typeof document !== 'undefined' && createPortal(
        (() => {
          const closeModal = () => setActiveModal(null);

          const renderModalShell = ({
            ariaLabel,
            allowBackdropClose = true,
            modalClassName = 'sj-modal',
            emblem,
            emblemStyle = { fontSize: '2.5rem' },
            title,
            titleColor,
            headerExtra,
            bodyStyle,
            footerStyle = { marginTop: '1rem' },
            children,
            footer,
          }: {
            ariaLabel: string;
            allowBackdropClose?: boolean;
            modalClassName?: string;
            emblem: React.ReactNode;
            emblemStyle?: React.CSSProperties;
            title: React.ReactNode;
            titleColor?: string;
            headerExtra?: React.ReactNode;
            bodyStyle?: React.CSSProperties;
            footerStyle?: React.CSSProperties;
            children: React.ReactNode;
            footer: React.ReactNode;
          }) => (
            <div
              className="sj-overlay show"
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              onClick={allowBackdropClose ? closeModal : undefined}
            >
              <div className={modalClassName} onClick={(e) => e.stopPropagation()}>
                {allowBackdropClose && (
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={closeModal}
                    aria-label="ปิดหน้าต่าง"
                  >
                    ✕
                  </button>
                )}

                <div className="modal-sheet-header">
                  <div className="sj-modal-emblem" aria-hidden="true" style={emblemStyle}>
                    {emblem}
                  </div>
                  <h3 className="modal-title sj-modal-title" style={titleColor ? { color: titleColor } : undefined}>
                    {title}
                  </h3>
                  {headerExtra}
                </div>

                <div className="modal-body-content" style={bodyStyle}>
                  {children}
                </div>

                <div className="modal-sheet-footer sj-modal-actions" style={footerStyle}>
                  {footer}
                </div>
              </div>
            </div>
          );

          switch (activeModal.type) {
            case 'temple':
              return renderModalShell({
                ariaLabel: 'สักการะวัด',
                emblem: '🏯',
                emblemStyle: undefined,
                title: 'ถึงจุดสักการะมหามงคล',
                headerExtra: (
                  <>
                    <p className="modal-subtitle sj-modal-temple-name" style={{ fontSize: '1.25rem', color: '#ffd700', fontWeight: 800 }}>
                      {activeModal.temple.name}
                    </p>
                    <div className="sj-modal-sub" style={{ color: '#e5d5be', fontSize: '0.9rem' }}>
                      จังหวัด{activeModal.temple.province} · ภาค{activeModal.temple.region}
                    </div>
                  </>
                ),
                children: (
                  <>
                    <div className="modal-info-card sj-modal-blessing-box">
                      <h4 className="info-card-title">✨ คติมงคลและคำอำนวยพร</h4>
                      <p className="sj-modal-wish" style={{ margin: '0.4rem 0' }}><strong>คติมงคล:</strong> {activeModal.temple.wish}</p>
                      <p className="sj-modal-blessing" style={{ margin: '0.4rem 0' }}><strong>คำอำนวยพร:</strong> {activeModal.temple.blessing}</p>
                    </div>

                    <div className="modal-info-card" style={{ marginTop: '0.8rem' }}>
                      <label htmlFor="sj-wish-select-modal" className="sj-modal-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
                        เลือกคำอธิษฐานจิตในใจ
                      </label>
                      <select
                        id="sj-wish-select-modal"
                        className="dropdown-compact-select sj-modal-select"
                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.95rem' }}
                        value={selectedWish}
                        onChange={(e) => setSelectedWish(e.target.value)}
                      >
                        {WISH_TOPICS.map((topic) => (
                          <option key={topic} value={topic}>
                            🙏 ขอพร: {topic}
                          </option>
                        ))}
                      </select>
                      <p className="sj-modal-disclaimer" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem' }}>
                        การเลือกคำอธิษฐานเป็นส่วนหนึ่งของเกม เพื่อความเจริญทางปัญญาและกำลังใจ
                      </p>
                    </div>
                  </>
                ),
                footer: (
                  <button
                    type="button"
                    className="btn gold full-width"
                    style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', fontWeight: 700 }}
                    onClick={() => handleConfirmTempleBlessing(activeModal.temple)}
                  >
                    🙏 สักการะและรับพร (+20 แต้มบุญ)
                  </button>
                ),
              });

            case 'event':
              return renderModalShell({
                ariaLabel: 'เหตุการณ์ระหว่างทาง',
                emblem: activeModal.event.icon,
                title: activeModal.event.name,
                children: (
                  <div className="modal-info-card">
                    <p className="sj-modal-event-desc" style={{ fontSize: '1rem', lineHeight: 1.6 }}>{activeModal.event.desc}</p>
                    <p className="sj-modal-disclaimer" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.6rem' }}>
                      ผลของเหตุการณ์บนช่องนี้จะทำงาน 1 ครั้งในแต่ละรอบการเดินทาง
                    </p>
                  </div>
                ),
                footer: (
                  <button
                    type="button"
                    className="btn gold full-width"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                    onClick={() => handleAcknowledgeEvent(activeModal.event)}
                  >
                    รับทราบ
                  </button>
                ),
              });

            case 'yantra_choice':
              return renderModalShell({
                ariaLabel: 'ใช้ยันต์คุ้มภัย',
                allowBackdropClose: false,
                emblem: '🧿',
                title: 'ใช้ยันต์คุ้มภัยหรือไม่?',
                footerStyle: { display: 'flex', gap: '10px', marginTop: '1rem' },
                children: (
                  <div className="modal-info-card">
                    <p className="sj-modal-event-desc" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                      อุปสรรคนี้ส่งผลให้ต้องถอยหลัง {Math.abs(activeModal.delta)} ช่อง
                      <br />
                      คุณมียันต์คุ้มภัย ต้องการใช้เพื่อป้องกันการถอยหลังหรือไม่?
                    </p>
                  </div>
                ),
                footer: (
                  <>
                    <button
                      type="button"
                      className="btn gold"
                      style={{ flex: 1, padding: '0.7rem' }}
                      onClick={() => handleUseYantraChoice(true, activeModal.delta)}
                    >
                      🧿 ใช้ยันต์คุ้มภัย
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ flex: 1, padding: '0.7rem' }}
                      onClick={() => handleUseYantraChoice(false, activeModal.delta)}
                    >
                      ยอมรับผล (ถอยหลัง)
                    </button>
                  </>
                ),
              });

            case 'finish':
              return renderModalShell({
                ariaLabel: 'มหามงคล 9 วัด สำเร็จ',
                modalClassName: 'sj-modal finish-modal',
                emblem: '🌟',
                title: 'มหามงคล 9 วัด สำเร็จบริบูรณ์',
                titleColor: '#ffd700',
                footerStyle: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' },
                headerExtra: (
                  <p style={{ fontSize: '1.05rem', margin: '0.4rem 0 0.8rem', color: '#fff' }}>
                    ยินดีด้วย! คุณเดินทางสักการะครบทั้ง 9 วัดมงคลสำเร็จแล้ว!
                  </p>
                ),
                children: (
                  <>
                    <div className="modal-info-card sj-finish-stats-box">
                      <div className="sj-finish-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                        <span>คะแนนบุญสะสมในเกม:</span>
                        <strong className="sj-gold-text" style={{ color: '#ffd700', fontSize: '1.2rem' }}>{state.merit} แต้ม</strong>
                      </div>
                      <div className="sj-finish-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                        <span>จำนวนรอบที่ใช้เดินทาง:</span>
                        <strong>{state.turn} รอบ</strong>
                      </div>
                      <div className="sj-finish-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                        <span>คำอธิษฐานจิต:</span>
                        <strong style={{ color: '#f59e0b' }}>{selectedWish}</strong>
                      </div>
                    </div>

                    <p className="sj-modal-disclaimer" style={{ marginTop: '0.75rem', fontSize: '0.82rem', textAlign: 'center', color: '#cbaf8c' }}>
                      ขอให้ทุกก้าวเดินในชีวิตจริงเต็มไปด้วยสติ ปัญญา ความเมตตา และความร่มเย็นเป็นสุข
                    </p>
                  </>
                ),
                footer: (
                  <>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ flex: '1 1 45%', padding: '0.7rem' }}
                      onClick={handleSaveToFortuneJournal}
                    >
                      📖 บันทึกลงสมุดดวง
                    </button>
                    {onOpenCard && (
                      <button
                        type="button"
                        className="btn gold"
                        style={{ flex: '1 1 45%', padding: '0.7rem' }}
                        onClick={() => {
                          handleOpenLuckyCard();
                          closeModal();
                        }}
                      >
                        🎴 การ์ดมงคล 9 วัด
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn secondary full-width"
                      style={{ width: '100%', marginTop: '0.3rem', padding: '0.7rem' }}
                      onClick={() => {
                        closeModal();
                        handleStartNewGame();
                      }}
                    >
                      🎲 เล่นชุดวัดใหม่
                    </button>
                  </>
                ),
              });

            case 'help':
              return renderModalShell({
                ariaLabel: 'วิธีเล่นเกมมหามงคล 9 วัด',
                emblem: '📖',
                title: 'วิธีเล่นมหามงคล 9 วัด',
                children: (
                  <div className="modal-info-card">
                    <ol className="sj-help-list" style={{ paddingLeft: '1.2rem', lineHeight: 1.8, fontSize: '0.92rem' }}>
                      <li>ระบบสุ่มวัด 9 แห่งจากฐานข้อมูล 100 วัดทั่วไทยในทุกการเริ่มเกมใหม่</li>
                      <li>ทอยลูกเต๋า 1 ลูก เพื่อก้าวเดินบนกระดานทางบุญ 36 ช่อง</li>
                      <li>ต้องหยุดสักการะวัดที่ยังไม่เคยไป ห้ามเดินข้าม เพื่อรับแต้มบุญ +20</li>
                      <li>ช่องสีชมพูคือโบนัส สีเทาคืออุปสรรค สีเขียวคือเหตุการณ์พิเศษ</li>
                      <li>เก็บของมงคล: ยันต์ป้องกันถอยหลัง, ระฆังทอยเพิ่ม, ดอกบัวล้างรอบพัก</li>
                      <li>เมื่อสักการะครบ 9 วัด จะได้รับโบนัสปิดท้าย 150 แต้ม พร้อมฉลองสู่เส้นชัย!</li>
                    </ol>
                    <p className="sj-modal-disclaimer" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.6rem' }}>
                      เกมนี้เป็นเกมจำลองทางวัฒนธรรมเพื่อความบันเทิงและสิริมงคล
                    </p>
                  </div>
                ),
                footer: (
                  <button
                    type="button"
                    className="btn gold full-width"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                    onClick={closeModal}
                  >
                    เข้าใจแล้ว
                  </button>
                ),
              });

            case 'temple_detail':
              return renderModalShell({
                ariaLabel: `ข้อมูล ${activeModal.temple.name}`,
                emblem: '🏯',
                title: activeModal.temple.name,
                titleColor: '#ffd700',
                bodyStyle: { marginTop: '0.6rem' },
                headerExtra: (
                  <div className="sj-modal-sub" style={{ color: '#e5d5be', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    จังหวัด{activeModal.temple.province} · ภาค{activeModal.temple.region} · ช่องที่ {activeModal.temple.tileId}
                  </div>
                ),
                children: (
                  <>
                    <div style={{ textAlign: 'left', lineHeight: 1.6, fontSize: '0.95rem', padding: '0 4px' }}>
                      <p className="sj-modal-wish" style={{ margin: '0.4rem 0' }}>
                        <strong style={{ color: '#ffd700' }}>คติมงคล:</strong> {activeModal.temple.wish}
                      </p>
                      <p className="sj-modal-blessing" style={{ margin: '0.4rem 0', color: '#e5d5be' }}>
                        <strong style={{ color: '#ffd700' }}>คำอำนวยพร:</strong> {activeModal.temple.blessing}
                      </p>
                    </div>

                    <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 4px 0', borderTop: '1px solid rgba(213, 166, 75, 0.25)' }}>
                      <span style={{ color: '#c4ad8c' }}>สถานะการสักการะ:</span>
                      <strong style={{ color: state.visited.includes(activeModal.temple.id) ? '#ffd700' : '#f59e0b' }}>
                        {state.visited.includes(activeModal.temple.id) ? '✅ สักการะแล้ว' : '⏳ รอการเดินทางไปถึง'}
                      </strong>
                    </div>
                  </>
                ),
                footer: (
                  <button
                    type="button"
                    className="btn gold full-width"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                    onClick={closeModal}
                  >
                    ปิดหน้าต่าง
                  </button>
                ),
              });

            case 'confirm_new_game':
              return renderModalShell({
                ariaLabel: 'ยืนยันเริ่มเกมใหม่',
                emblem: '🎲',
                emblemStyle: { fontSize: '2.4rem' },
                title: 'เริ่มการเดินทางรอบใหม่',
                footerStyle: { display: 'flex', gap: '10px', marginTop: '1rem' },
                children: (
                  <div className="modal-info-card">
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                      ต้องการเริ่มการเดินทางรอบใหม่ และสุ่มวัดชุดใหม่ 9 แห่งจาก 100 วัดใช่หรือไม่?
                    </p>
                  </div>
                ),
                footer: (
                  <>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ flex: 1, padding: '0.7rem' }}
                      onClick={closeModal}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      className="btn gold"
                      style={{ flex: 1, padding: '0.7rem' }}
                      onClick={confirmStartNewGame}
                    >
                      สุ่มวัดชุดใหม่
                    </button>
                  </>
                ),
              });
          }
        })(),
        document.body
      )}
    </div>
  );
};
