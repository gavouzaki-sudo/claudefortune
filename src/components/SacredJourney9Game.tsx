import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ALL_TEMPLES,
  GAME_EVENTS,
  WISH_TOPICS,
  TEMPLE_TILE_IDS,
  type TempleItem,
  type GameEvent,
} from '../data/sacredTemplesData';

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
  const randomized = shuffleArray(ALL_TEMPLES).slice(0, 9);
  randomized.forEach((temple, idx) => {
    temple.tileId = TEMPLE_TILE_IDS[idx];
  });

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
}

export const SacredJourney9Game: React.FC<SacredJourney9GameProps> = ({
  onToast,
  onLaunchFireworks,
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
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return createFreshGame();
  });

  const [soundOn, setSoundOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('shrine.sj_sound') !== '0';
    } catch {
      return true;
    }
  });

  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<number>(state.lastDice || 5);

  const [activeModal, setActiveModal] = useState<
    | { type: 'temple'; temple: TempleItem }
    | { type: 'event'; event: GameEvent; id: number }
    | { type: 'yantra_choice'; delta: number }
    | { type: 'finish' }
    | { type: 'help' }
    | null
  >(null);

  const [selectedWish, setSelectedWish] = useState<string>(WISH_TOPICS[0]);
  const audioCtxRef = useRef<AudioContext | null>(null);

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
      if (!soundOn) return;
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
    [soundOn]
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem('shrine.sj_sound', next ? '1' : '0');
    } catch {
      // Ignore
    }
    onToast(next ? '🔊 เปิดเสียงมงคล' : '🔇 ปิดเสียง');
  };

  const getTempleAtTile = useCallback(
    (tileNum: number) => {
      return state.selected.find((t) => t.tileId === tileNum);
    },
    [state.selected]
  );

  // Check if there is an unvisited temple between from and to in direction dir
  const findNearestUnvisitedTemple = useCallback(
    (from: number, to: number, dir: number) => {
      if (dir > 0) {
        for (let n = from + 1; n <= to; n++) {
          const t = getTempleAtTile(n);
          if (t && !state.visited.includes(t.id)) {
            return n;
          }
        }
      } else {
        for (let n = from - 1; n >= to; n--) {
          const t = getTempleAtTile(n);
          if (t && !state.visited.includes(t.id)) {
            return n;
          }
        }
      }
      return null;
    },
    [getTempleAtTile, state.visited]
  );

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Move player step-by-step
  const movePlayerSteps = useCallback(
    async (steps: number, allowTrigger = true) => {
      const from = state.position;
      let target = Math.max(1, Math.min(36, from + steps));
      const dir = Math.sign(target - from);

      if (dir !== 0) {
        const checkpoint = findNearestUnvisitedTemple(from, target, dir);
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
        await delay(110);
      }

      // Check arrival on tile
      const templeOnTarget = getTempleAtTile(target);
      if (templeOnTarget && !state.visited.includes(templeOnTarget.id)) {
        playSound('bell');
        setState((prev) => ({ ...prev, status: 'temple' }));
        setActiveModal({ type: 'temple', temple: templeOnTarget });
        return;
      }

      // Check event on tile
      const eventOnTarget = GAME_EVENTS[target];
      if (allowTrigger && eventOnTarget && !state.triggered.includes(target)) {
        playSound('item');
        setState((prev) => ({
          ...prev,
          status: 'event',
          triggered: [...prev.triggered, target],
        }));
        setActiveModal({ type: 'event', event: eventOnTarget, id: target });
        return;
      }

      // Reached finish line tile 36
      if (target === 36) {
        if (state.visited.length === 9) {
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
          return;
        } else {
          target = 35;
          setState((prev) => ({ ...prev, position: 35, status: 'ready' }));
          onToast('ยังสักการะไม่ครบ 9 วัด กำลังเดินทางต่อ');
          return;
        }
      }

      setState((prev) => ({ ...prev, status: 'ready' }));
    },
    [
      findNearestUnvisitedTemple,
      getTempleAtTile,
      onLaunchFireworks,
      onToast,
      playSound,
      state.position,
      state.triggered,
      state.visited,
    ]
  );

  // Roll dice action
  const handleRollDice = async () => {
    if (isRolling || state.completed || state.status !== 'ready') return;

    if (state.skipTurns > 0) {
      setState((prev) => ({
        ...prev,
        skipTurns: prev.skipTurns - 1,
        turn: prev.turn + 1,
        history: ['⏸️ พักการเดินทาง 1 รอบ', ...prev.history].slice(0, 35),
      }));
      onToast('จบรอบพักแล้ว รอบถัดไปสามารถทอยลูกเต๋าได้ตามปกติ');
      return;
    }

    setIsRolling(true);
    const diceResult = secureRandomInt(6) + 1;

    for (let i = 0; i < 7; i++) {
      playSound('dice');
      const fake = secureRandomInt(6) + 1;
      setDisplayDice(fake);
      await delay(70);
    }

    setDisplayDice(diceResult);
    setIsRolling(false);

    setState((prev) => ({
      ...prev,
      turn: prev.turn + 1,
      lastDice: diceResult,
      history: [`🎲 ทอยได้ ${diceResult} แต้ม`, ...prev.history].slice(0, 35),
    }));

    await movePlayerSteps(diceResult, true);
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
      if (delta < 0 && state.inventory.yantra > 0) {
        setActiveModal({ type: 'yantra_choice', delta });
        return;
      }
      await movePlayerSteps(delta, false);
      setState((prev) => ({
        ...prev,
        status: 'ready',
        history: [`📍 เหตุการณ์: เคลื่อนที่ ${delta > 0 ? '+' : ''}${delta} ช่อง`, ...prev.history].slice(
          0,
          35
        ),
      }));
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
        history: ['🧿 ใช้ยันต์คุ้มภัย! ป้องกันการถอยหลังได้สำเร็จ', ...prev.history].slice(0, 35),
      }));
      onToast('🧿 ใช้ยันต์คุ้มภัย ป้องกันการถอยหลังสำเร็จ');
      setState((prev) => ({ ...prev, status: 'ready' }));
    } else {
      await movePlayerSteps(delta, false);
      setState((prev) => ({ ...prev, status: 'ready' }));
    }
  };

  const handleUseInventory = async (key: 'yantra' | 'bell' | 'lotus') => {
    if (state.inventory[key] <= 0 || isRolling || state.status !== 'ready' || state.completed) {
      return;
    }

    if (key === 'yantra') {
      onToast('🧿 ยันต์คุ้มภัยจะทำงานอัตโนมัติเมื่อเจอบททดสอบถอยหลัง');
      return;
    }

    if (key === 'bell') {
      playSound('bell');
      setState((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, bell: prev.inventory.bell - 1 },
        turn: Math.max(0, prev.turn - 1),
        history: ['🔔 สั่นระฆังมงคล! ได้รับสิทธิ์ทอยลูกเต๋าเพิ่มทันที', ...prev.history].slice(0, 35),
      }));
      onToast('🔔 สั่นระฆังมงคล ทอยลูกเต๋าเพิ่ม 1 ครั้ง!');
      setTimeout(() => {
        handleRollDice();
      }, 300);
      return;
    }

    if (key === 'lotus') {
      if (state.skipTurns <= 0) {
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
    if (
      !window.confirm(
        'ต้องการเริ่มการเดินทางรอบใหม่ และสุ่มวัดชุดใหม่ 9 แห่งจาก 100 วัดใช่หรือไม่?'
      )
    ) {
      return;
    }
    const fresh = createFreshGame();
    setState(fresh);
    setDisplayDice(5);
    setActiveModal(null);
    onToast('🌟 สุ่มวัดมงคลชุดใหม่ 9 แห่งเรียบร้อย');
  };

  const boardTiles = React.useMemo(() => {
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

  return (
    <div className="sacred-journey-app">
      {/* 1. TOP HEADER & BRAND */}
      <header className="sacred-journey-top">
        <div className="sacred-journey-brand">
          <div className="sacred-journey-seal" aria-hidden="true">
            ๙
          </div>
          <div>
            <h2 className="sacred-journey-title">มหามงคล 9 วัด</h2>
            <div className="sacred-journey-subtitle">
              <span>SACRED JOURNEY</span>
              <span aria-hidden="true">·</span>
              <span>เส้นทางแห่งศรัทธา</span>
            </div>
          </div>
        </div>

        <div className="sacred-journey-top-actions">
          <button
            type="button"
            className="sj-btn secondary sj-top-btn"
            onClick={toggleSound}
            aria-label="เปิดปิดเสียง"
            title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
          >
            {soundOn ? '🔊 เปิด' : '🔇 ปิด'}
          </button>
          <button
            type="button"
            className="sj-btn secondary sj-top-btn"
            onClick={() => setActiveModal({ type: 'help' })}
          >
            📖 วิธีเล่น
          </button>
        </div>
      </header>

      {/* 2. TOP BOX (กล่องบน): STATS & PROGRESS PANEL */}
      <section className="sj-panel sj-stats-panel" aria-label="สถิติการเดินทางมหามงคล">
        <div className="sj-stats-panel-header">
          <span className="sj-stats-panel-title">🏆 ข้อมูลการเดินทางมหามงคล 9 วัด</span>
          <span className="sj-stats-panel-status">
            {state.completed ? '🎉 ครบ 9 วัดแล้ว' : `กำลังสักการะวัดที่ ${state.visited.length + 1}`}
          </span>
        </div>
        <div className="sj-stats-grid">
          <div className="sj-stat-card">
            <span className="sj-stat-val">{state.visited.length}/9</span>
            <span className="sj-stat-label">สักการะแล้ว</span>
          </div>
          <div className="sj-stat-card">
            <span className="sj-stat-val">{state.merit}</span>
            <span className="sj-stat-label">แต้มบุญในเกม</span>
          </div>
          <div className="sj-stat-card">
            <span className="sj-stat-val">{state.turn}</span>
            <span className="sj-stat-label">รอบการเดินทาง</span>
          </div>
        </div>
        <div
          className="sj-progress-track"
          role="progressbar"
          aria-valuenow={state.visited.length}
          aria-valuemin={0}
          aria-valuemax={9}
        >
          <div
            className="sj-progress-fill"
            style={{ width: `${(state.visited.length / 9) * 100}%` }}
          />
        </div>
      </section>

      {/* 3. MAIN GAME LAYOUT (Left: Board + Controls; Right: 9 Temples + Inventory + Log) */}
      <div className="sj-game-layout">
        {/* LEFT COLUMN: 36-TILE BOARD & DICE CONTROLS */}
        <div className="sj-main-col">
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

          {/* CONTROLS & DICE PANEL (BUTTONS ARE CLEAR & PROMINENT) */}
          <section className="sj-panel sj-controls-panel">
            <div className="sj-controls-row">
              <div className="sj-status-text-wrap">
                <div className="sj-message">
                  {state.completed
                    ? '🎉 เดินทางครบ 9 วัดแล้ว!'
                    : state.skipTurns > 0
                    ? `⏸️ ต้องหยุดพักอีก ${state.skipTurns} รอบ`
                    : state.status === 'temple'
                    ? '🏯 ถึงจุดสักการะมงคล'
                    : `ตำแหน่งปัจจุบัน: ช่อง ${state.position}`}
                </div>
                <div className="sj-submessage">
                  {state.completed
                    ? 'ขออานิสงส์ผลบุญดลบันดาลให้ท่านพบเจอแต่ความสุขสิริมงคล'
                    : state.status === 'temple'
                    ? 'กดสักการะวัดเพื่อรับพรแล้วเดินทางต่อ'
                    : state.skipTurns > 0
                    ? 'กดปุ่มเพื่อจบรอบพัก หรือใช้ดอกบัวเพื่อออกเดินทางทันที'
                    : 'ทอยลูกเต๋าเพื่อเดินทางต่อ'}
                </div>
              </div>

              <div className="sj-dicebox">
                <div className={`sj-dice ${isRolling ? 'rolling' : ''}`} aria-label="ลูกเต๋า">
                  {DICE_FACES[displayDice] || '⚄'}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (ปุ่มทอยเต๋า & ปุ่มเริ่มใหม่) */}
            <div className="sj-action-row">
              <button
                type="button"
                className="sj-btn gold sj-roll-btn"
                onClick={handleRollDice}
                disabled={
                  isRolling ||
                  state.completed ||
                  state.status === 'temple' ||
                  state.status === 'event' ||
                  state.status === 'moving'
                }
              >
                {isRolling
                  ? '🎲 กำลังทอย...'
                  : state.skipTurns > 0
                  ? '⏸️ จบรอบพัก'
                  : '🎲 ทอยลูกเต๋าเพื่อเดินทาง'}
              </button>
              <button
                type="button"
                className="sj-btn secondary sj-reset-btn"
                onClick={handleStartNewGame}
                disabled={isRolling}
              >
                🔄 เริ่มเกมใหม่
              </button>
            </div>
          </section>
        </div>

        {/* 4. RIGHT COLUMN (กล่องขวา): 9 TEMPLES LIST, INVENTORY & JOURNEY LOG */}
        <aside className="sj-aside-col">
          {/* 9 TEMPLES LIST PANEL */}
          <section className="sj-panel sj-right-temple-panel">
            <div className="sj-right-panel-header">
              <h3 className="sj-section-title">
                <span>🌼 วัดทั้ง 9 แห่งในการเดินทางนี้</span>
              </h3>
              <span className="sj-temple-count-badge">{state.visited.length} / 9 สักการะแล้ว</span>
            </div>
            <div className="sj-temple-list">
              {state.selected.map((temple, idx) => {
                const isVisited = state.visited.includes(temple.id);
                return (
                  <div
                    key={temple.id}
                    className={`sj-temple-chip ${isVisited ? 'done' : ''}`}
                    title={`${temple.name} (จ.${temple.province})`}
                  >
                    <div className="sj-temple-chip-header">
                      <span>{isVisited ? '✅' : '🏯'} {idx + 1}</span>
                      <span className="sj-temple-tile-badge">ช่อง {temple.tileId}</span>
                    </div>
                    <b className="sj-temple-chip-name">{temple.name}</b>
                    <span className="sj-temple-chip-prov">จ.{temple.province}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* INVENTORY PANEL */}
          <section className="sj-panel sj-right-inventory-panel">
            <h3 className="sj-section-title">🎒 ของมงคลในย่าม</h3>
            <div className="sj-inventory-grid">
              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.yantra > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('yantra')}
                disabled={state.inventory.yantra === 0}
              >
                <span className="sj-item-icon">🧿</span>
                <span className="sj-item-title">ยันต์คุ้มภัย</span>
                <span className="sj-item-count">× {state.inventory.yantra}</span>
              </button>

              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.bell > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('bell')}
                disabled={state.inventory.bell === 0 || state.completed || isRolling}
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
              >
                <span className="sj-item-icon">🪷</span>
                <span className="sj-item-title">ดอกบัวมงคล</span>
                <span className="sj-item-count">× {state.inventory.lotus}</span>
              </button>
            </div>
            <div className="sj-item-desc">
              ยันต์คุ้มภัยป้องกันการถอยหลัง · ระฆังให้ทอยเพิ่ม · ดอกบัวล้างสถานะหยุดพัก
            </div>
          </section>

          {/* TRAVEL LOG PANEL */}
          <section className="sj-panel sj-right-log-panel">
            <h3 className="sj-section-title">📜 บันทึกการเดินทาง</h3>
            <div className="sj-log-box" role="log" aria-live="polite">
              {state.history.slice(0, 15).map((logItem, index) => (
                <div key={index} className="sj-log-entry">
                  • {logItem}
                </div>
              ))}
            </div>
          </section>

          {/* Quick Return Button on Mobile */}
          <div className="sj-quick-switch-row sj-mobile-only">
            <button
              type="button"
              className="sj-quick-switch-btn"
              onClick={() => setMobileTab('board')}
            >
              👈 กลับไปที่กระดาน & ทอยลูกเต๋า
            </button>
          </div>
        </aside>
      </div>

      <footer className="sj-footer-note">
        เกมเพื่อความบันเทิงและส่งเสริมการเรียนรู้สถานที่ทางวัฒนธรรม · คะแนนบุญเป็นคะแนนสมมติในเกม
      </footer>

      {/* POPUP MODALS */}
      {/* 1. Temple Worship Modal */}
      {activeModal?.type === 'temple' && (
        <div
          className="sj-overlay show"
          role="dialog"
          aria-modal="true"
          aria-label="สักการะวัด"
        >
          <div className="sj-modal">
            <div className="sj-modal-emblem" aria-hidden="true">
              🏯
            </div>
            <h2 className="sj-modal-title">ถึงจุดสักการะ</h2>
            <div className="sj-modal-temple-name">{activeModal.temple.name}</div>
            <div className="sj-modal-sub">
              จังหวัด{activeModal.temple.province} · ภาค{activeModal.temple.region}
            </div>

            <div className="sj-modal-blessing-box">
              <p className="sj-modal-wish">{activeModal.temple.wish}</p>
              <p className="sj-modal-blessing">{activeModal.temple.blessing}</p>
            </div>

            <label htmlFor="sj-wish-select" className="sj-modal-label">
              เลือกคำอธิษฐานในใจ
            </label>
            <select
              id="sj-wish-select"
              className="sj-modal-select"
              value={selectedWish}
              onChange={(e) => setSelectedWish(e.target.value)}
            >
              {WISH_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <p className="sj-modal-disclaimer">
              การเลือกคำอธิษฐานเป็นส่วนหนึ่งของเกม เพื่อความเจริญทางปัญญาและกำลังใจ
            </p>

            <div className="sj-modal-actions">
              <button
                type="button"
                className="sj-btn gold full-width"
                onClick={() => handleConfirmTempleBlessing(activeModal.temple)}
              >
                🙏 สักการะและรับพร (+20 แต้มบุญ)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Event Modal */}
      {activeModal?.type === 'event' && (
        <div
          className="sj-overlay show"
          role="dialog"
          aria-modal="true"
          aria-label="เหตุการณ์ระหว่างทาง"
        >
          <div className="sj-modal">
            <div className="sj-modal-emblem" aria-hidden="true">
              {activeModal.event.icon}
            </div>
            <h2 className="sj-modal-title">{activeModal.event.name}</h2>
            <p className="sj-modal-event-desc">{activeModal.event.desc}</p>
            <p className="sj-modal-disclaimer">
              ผลของเหตุการณ์บนช่องนี้จะทำงาน 1 ครั้งในแต่ละรอบการเดินทาง
            </p>

            <div className="sj-modal-actions">
              <button
                type="button"
                className="sj-btn gold full-width"
                onClick={() => handleAcknowledgeEvent(activeModal.event)}
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Yantra Protection Choice Modal */}
      {activeModal?.type === 'yantra_choice' && (
        <div
          className="sj-overlay show"
          role="dialog"
          aria-modal="true"
          aria-label="ใช้ยันต์คุ้มภัย"
        >
          <div className="sj-modal">
            <div className="sj-modal-emblem" aria-hidden="true">
              🧿
            </div>
            <h2 className="sj-modal-title">ใช้ยันต์คุ้มภัยหรือไม่?</h2>
            <p className="sj-modal-event-desc">
              อุปสรรคนี้ส่งผลให้ต้องถอยหลัง {Math.abs(activeModal.delta)} ช่อง
              <br />
              คุณมียันต์คุ้มภัย ต้องการใช้เพื่อป้องกันการถอยหลังหรือไม่?
            </p>

            <div className="sj-modal-actions">
              <button
                type="button"
                className="sj-btn gold"
                onClick={() => handleUseYantraChoice(true, activeModal.delta)}
              >
                🧿 ใช้ยันต์คุ้มภัย
              </button>
              <button
                type="button"
                className="sj-btn secondary"
                onClick={() => handleUseYantraChoice(false, activeModal.delta)}
              >
                ยอมรับผล (ถอยหลัง)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Grand Finish Modal */}
      {activeModal?.type === 'finish' && (
        <div
          className="sj-overlay show"
          role="dialog"
          aria-modal="true"
          aria-label="มหามงคล 9 วัด สำเร็จ"
        >
          <div className="sj-modal finish-modal">
            <div className="sj-modal-emblem" aria-hidden="true">
              🌟
            </div>
            <h2 className="sj-modal-title">มหามงคล 9 วัด</h2>
            <p style={{ fontSize: '1.05rem', margin: '0.4rem 0 0.8rem' }}>
              ยินดีด้วย! คุณเดินทางสักการะครบทั้ง 9 วัดมงคลสำเร็จแล้ว!
            </p>

            <div className="sj-finish-stats-box">
              <div className="sj-finish-stat-row">
                <span>คะแนนบุญสะสมในเกม:</span>
                <strong className="sj-gold-text">{state.merit} แต้ม</strong>
              </div>
              <div className="sj-finish-stat-row">
                <span>จำนวนรอบที่ใช้เดินทาง:</span>
                <strong>{state.turn} รอบ</strong>
              </div>
            </div>

            <p className="sj-modal-disclaimer" style={{ marginTop: '0.75rem' }}>
              ขอให้ทุกก้าวเดินในชีวิตจริงเต็มไปด้วยสติ ปัญญา ความเมตตา และความร่มเย็นเป็นสุข
            </p>

            <div className="sj-modal-actions">
              <button
                type="button"
                className="sj-btn gold full-width"
                onClick={() => {
                  setActiveModal(null);
                  handleStartNewGame();
                }}
              >
                🎲 เล่นชุดวัดใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Help Modal */}
      {activeModal?.type === 'help' && (
        <div
          className="sj-overlay show"
          role="dialog"
          aria-modal="true"
          aria-label="วิธีเล่นเกมมหามงคล 9 วัด"
        >
          <div className="sj-modal">
            <div className="sj-modal-emblem" aria-hidden="true">
              📖
            </div>
            <h2 className="sj-modal-title">วิธีเล่นมหามงคล 9 วัด</h2>
            <ol className="sj-help-list">
              <li>ระบบสุ่มวัด 9 แห่งจากฐานข้อมูล 100 วัดทั่วไทยในทุกการเริ่มเกมใหม่</li>
              <li>ทอยลูกเต๋า 1 ลูก เพื่อก้าวเดินบนกระดานทางบุญ 36 ช่อง</li>
              <li>ต้องหยุดสักการะวัดที่ยังไม่เคยไป ห้ามเดินข้าม เพื่อรับแต้มบุญ +20</li>
              <li>ช่องสีชมพูคือโบนัส สีเทาคืออุปสรรค สีเขียวคือเหตุการณ์พิเศษ</li>
              <li>เก็บของมงคล: ยันต์ป้องกันถอยหลัง, ระฆังทอยเพิ่ม, ดอกบัวล้างรอบพัก</li>
              <li>เมื่อสักการะครบ 9 วัด จะได้รับโบนัสปิดท้าย 150 แต้ม พร้อมฉลองสู่เส้นชัย!</li>
            </ol>
            <p className="sj-modal-disclaimer">
              เกมนี้เป็นเกมจำลองทางวัฒนธรรมเพื่อความบันเทิงและสิริมงคล
            </p>

            <div className="sj-modal-actions">
              <button
                type="button"
                className="sj-btn gold full-width"
                onClick={() => setActiveModal(null)}
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
