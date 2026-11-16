import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ALL_TEMPLES,
  GAME_EVENTS,
  TEMPLE_TILE_IDS,
  getLocalizedRegion,
  getLocalizedWishTopics,
  getLocalizedGameEvent,
  getLocalizedTemple,
  type TempleItem,
  type GameEvent,
} from '../data/sacredTemplesData';
import { useLanguage } from '../context/LanguageContext';
import { saveJournalEntry } from '../utils/fortuneJournal';
import { buildSacredJourneyCardData } from '../utils/cardDataBuilder';
import type { CardData } from '../utils/luckyCardCanvas';
import { useChantAudioState } from '../hooks/useChantAudioState';
import { getSharedAudioContextSync } from '../utils/audioContext';

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

function createFreshGame(initHistoryText: string): GameState {
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
    history: [initHistoryText],
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
  const { lang, t, format } = useLanguage();

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
    return createFreshGame(t.sjHistInit);
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

  const wishTopics = useMemo(() => getLocalizedWishTopics(lang), [lang]);
  const [selectedWishIdx, setSelectedWishIdx] = useState<number>(0);
  const selectedWish = wishTopics[selectedWishIdx] || wishTopics[0];
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

  // Unmount cleanup for timers
  useEffect(() => {
    isMountedRef.current = true;
    const timers = timersRef.current;
    return () => {
      isMountedRef.current = false;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
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
        const ctx = getSharedAudioContextSync();
        if (!ctx) return;

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
            history: [t.sjHistFinishBonus, ...prev.history].slice(0, 35),
          }));
          setActiveModal({ type: 'finish' });
          return 'finished';
        } else {
          target = 35;
          setState((prev) => ({ ...prev, position: 35, status: 'ready' }));
          onToast(t.sjToastNeedAll9);
          return 'ready';
        }
      }

      setState((prev) => ({ ...prev, status: 'ready' }));
      return 'ready';
    },
    [delay, findNearestUnvisitedTemple, getTempleAtTile, onLaunchFireworks, onToast, playSound, t.sjHistFinishBonus, t.sjToastNeedAll9]
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
        history: [t.sjHistSkip, ...prev.history].slice(0, 35),
      }));
      onToast(t.sjToastSkipDone);
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
      history: [format(t.sjHistDice, { dice: diceResult }), ...prev.history].slice(0, 35),
    }));

    await movePlayerSteps(diceResult, true);
  }, [delay, format, movePlayerSteps, onToast, playSound, t.sjHistDice, t.sjHistSkip, t.sjToastSkipDone]);

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
    const locTemple = getLocalizedTemple(temple, lang);

    setState((prev) => {
      const nextVisited = [...prev.visited, temple.id];
      const nextWishes = { ...prev.wishes, [temple.id]: selectedWish };
      const nextMerit = prev.merit + 20 + (isNineth ? 150 : 0);
      const nextHist = [
        isNineth ? t.sjHistFinishBonus : '',
        format(t.sjHistWorship, {
          name: locTemple.name,
          province: locTemple.province,
          wish: selectedWish,
        }),
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
    onToast(format(t.sjToastWorshipDone, { name: locTemple.name }));

    if (isNineth) {
      playSound('gong');
      onLaunchFireworks?.(12);
      setActiveModal({ type: 'finish' });
    }
  };

  // Handle Event Acknowledge
  const handleAcknowledgeEvent = async (event: GameEvent, tileId: number) => {
    setActiveModal(null);
    const locEv = getLocalizedGameEvent(tileId, lang) || event;

    if (locEv.merit) {
      setState((prev) => ({
        ...prev,
        merit: prev.merit + (locEv.merit || 0),
        history: [format(t.sjHistEventMerit, { name: locEv.name, merit: locEv.merit }), ...prev.history].slice(0, 35),
      }));
    }

    if (locEv.clearSkip) {
      setState((prev) => ({
        ...prev,
        skipTurns: 0,
        history: [format(t.sjHistEventClearSkip, { name: locEv.name }), ...prev.history].slice(0, 35),
      }));
    }

    if (locEv.item) {
      const itemKey = locEv.item;
      const maxCount = itemKey === 'bell' ? 2 : 3;
      setState((prev) => {
        const curCount = prev.inventory[itemKey];
        if (curCount < maxCount) {
          return {
            ...prev,
            inventory: { ...prev.inventory, [itemKey]: curCount + 1 },
            history: [format(t.sjHistEventItem, { name: locEv.name }), ...prev.history].slice(0, 35),
          };
        } else {
          return {
            ...prev,
            merit: prev.merit + 10,
            history: [format(t.sjHistEventItemFull, { name: locEv.name }), ...prev.history].slice(0, 35),
          };
        }
      });
      playSound('item');
    }

    if (locEv.skip) {
      setState((prev) => ({
        ...prev,
        skipTurns: prev.skipTurns + (locEv.skip || 0),
        history: [format(t.sjHistEventSkip, { name: locEv.name, skip: locEv.skip }), ...prev.history].slice(0, 35),
      }));
    }

    if (locEv.move) {
      const delta = locEv.move;
      if (delta < 0 && stateRef.current.inventory.yantra > 0) {
        setActiveModal({ type: 'yantra_choice', delta });
        return;
      }
      const deltaStr = `${delta > 0 ? '+' : ''}${delta}`;
      setState((prev) => ({
        ...prev,
        history: [format(t.sjHistEventMove, { delta: deltaStr }), ...prev.history].slice(0, 35),
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
        history: [t.sjHistYantraBlock, ...prev.history].slice(0, 35),
      }));
      onToast(t.sjToastYantraUsed);
    } else {
      const deltaStr = `${delta > 0 ? '+' : ''}${delta}`;
      setState((prev) => ({
        ...prev,
        history: [format(t.sjHistEventMove, { delta: deltaStr }), ...prev.history].slice(0, 35),
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
      onToast(t.sjToastYantraAuto);
      return;
    }

    if (key === 'bell') {
      if (cur.skipTurns > 0) {
        onToast(t.sjToastBellBlocked);
        return;
      }
      playSound('bell');
      setState((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, bell: prev.inventory.bell - 1 },
        turn: Math.max(0, prev.turn - 1),
        history: [t.sjHistBellExtra, ...prev.history].slice(0, 35),
      }));
      onToast(t.sjToastBellUsed);
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
        onToast(t.sjToastLotusUnused);
        return;
      }
      playSound('item');
      setState((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, lotus: prev.inventory.lotus - 1 },
        skipTurns: 0,
        history: [t.sjHistLotusClear, ...prev.history].slice(0, 35),
      }));
      onToast(t.sjToastLotusUsed);
    }
  };

  const handleStartNewGame = () => {
    setActiveModal({ type: 'confirm_new_game' });
  };

  const confirmStartNewGame = () => {
    const fresh = createFreshGame(t.sjHistInit);
    setState(fresh);
    setDisplayDice(5);
    setIsRolling(false);
    isRollingRef.current = false;
    setActiveModal(null);
    onToast(t.sjToastNewGame);
  };

  // Save to Fortune Journal
  const handleSaveToFortuneJournal = () => {
    saveJournalEntry({
      type: 'remedy',
      title: t.festStageAria,
      summary: `${format(t.sjToolbarBadge, { visited: state.visited.length, merit: state.merit })} · ${selectedWish}`,
      details: {
        temples: state.selected.map((temple) => {
          const loc = getLocalizedTemple(temple, lang);
          return `${loc.name} (${loc.province})`;
        }),
        merit: state.merit,
        turns: state.turn,
        wish: selectedWish,
      },
    });
    onToast(t.sjToastJournalSaved);
  };

  // Generate Lucky Card
  const handleOpenLuckyCard = () => {
    if (!onOpenCard) return;
    const cardData = buildSacredJourneyCardData(
      state.selected.map((temple) => {
        const loc = getLocalizedTemple(temple, lang);
        return { name: loc.name, province: loc.province };
      }),
      state.merit,
      selectedWish,
      lang
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
  const currentLocTemple = currentTempleOnTarget ? getLocalizedTemple(currentTempleOnTarget, lang) : null;

  // Filtered temples on right column
  const filteredTemples = useMemo(() => {
    if (regionFilter === 'all') return state.selected;
    return state.selected.filter((tItem) => tItem.region.includes(regionFilter));
  }, [state.selected, regionFilter]);

  return (
    <div
      id="sj9-game-frame"
      className="sacred-journey-frame"
    >
      {/* COMPACT TOOLBAR MENU ROW */}
      <div className="sacred-journey-toolbar-row" style={{ justifyContent: 'center' }}>
        <div
          className="kala-mini-pill thongchai sj-toolbar-badge"
          title={t.sjToolbarTitle}
        >
          {format(t.sjToolbarBadge, { visited: state.visited.length, merit: state.merit })}
        </div>
      </div>

      {/* MAIN GAME LAYOUT */}
      <div className="sj-game-layout">
        {/* LEFT COLUMN */}
        <div className="sj-main-col">
          {/* 9 TEMPLES LIST PANEL */}
          <div id="sj-temples-section" className="sj-panel sj-right-temple-panel sj-top-temples-panel" aria-label={t.sjTemplesAria}>
            <div className="sj-right-panel-header">
              <h3 className="sj-section-title">
                <span>{t.sjTemplesTitle}</span>
              </h3>
              <div className="sj-temple-header-badges" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="sj-temple-count-badge">
                  {format(t.sjVisitedCount, { visited: state.visited.length })}
                </span>
                {regionFilter !== 'all' && (
                  <button
                    type="button"
                    className="btn-clear-compact-select"
                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                    onClick={() => setRegionFilter('all')}
                    title={t.sjShowAllTitle}
                  >
                    {t.sjShowAllBtn}
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
                const locTemple = getLocalizedTemple(temple, lang);
                return (
                  <div
                    key={temple.id}
                    className={`sj-temple-chip ${isVisited ? 'done' : ''} ${
                      isMatchRegion ? 'highlight-region' : ''
                    }`}
                    onClick={() => setActiveModal({ type: 'temple_detail', temple })}
                    title={format(t.sjTempleChipTitle, { name: locTemple.name, province: locTemple.province })}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="sj-temple-chip-header">
                      <span>{isVisited ? '✅' : '🏯'} {format(t.sjTileWord, { tileId: temple.tileId })}</span>
                      <span className="sj-temple-region-tag">{locTemple.region}</span>
                    </div>
                    <b className="sj-temple-chip-name">{locTemple.name}</b>
                    <span className="sj-temple-chip-prov">{locTemple.province}</span>
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
                  {format(t.sjNoTemplesRegion, {
                    region: format(t.sjRegionPrefix, {
                      region: getLocalizedRegion(regionFilter as TempleItem['region'], lang),
                    }),
                  })}
                  <button
                    type="button"
                    className="btn gold"
                    style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '3px 10px' }}
                    onClick={() => setRegionFilter('all')}
                  >
                    {t.sjShowAllFullBtn}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 36-TILE BOARD (6x6) */}
          <div className="sj-board-wrap">
            <div className="sj-board" aria-label={t.sjBoardAria}>
              {boardTiles.map((tileId) => {
                const isCurrent = tileId === state.position;
                const temple = getTempleAtTile(tileId);
                const locEv = getLocalizedGameEvent(tileId, lang);
                const event = locEv || GAME_EVENTS[tileId];
                const isStart = tileId === 1;
                const isFinish = tileId === 36;
                const isVisited = temple && state.visited.includes(temple.id);

                let tileType = 'normal';
                let symbol = '🌿';
                let label = t.sjTileNormalLabel;

                if (isStart) {
                  tileType = 'start';
                  symbol = '🚩';
                  label = t.sjTileStartLabel;
                } else if (isFinish) {
                  tileType = 'finish';
                  symbol = '🏆';
                  label = t.sjTileFinishLabel;
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
                    title={format(t.sjTileTitle, { tileId, label })}
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
              <span>{t.sjLegendTemple}</span>
              <span aria-hidden="true">·</span>
              <span>{t.sjLegendBonus}</span>
              <span aria-hidden="true">·</span>
              <span>{t.sjLegendObstacle}</span>
              <span aria-hidden="true">·</span>
              <span>{t.sjLegendSpecial}</span>
              <span aria-hidden="true">·</span>
              <span>{t.sjLegendPlayer}</span>
            </div>
          </div>


          {/* CONTROLS & PRIMARY ACTION PANEL */}
          <div className="sj-panel sj-controls-panel">
            <div className="sj-controls-row">
              <div className="sj-status-text-wrap">
                <div className="sj-message">
                  {state.completed
                    ? t.sjStatusCompleted
                    : state.skipTurns > 0
                    ? format(t.sjStatusSkip, { count: state.skipTurns })
                    : state.status === 'temple'
                    ? format(t.sjStatusAtTemple, { name: currentLocTemple?.name || t.sjLegendTemple })
                    : format(t.sjStatusPosition, { position: state.position })}
                </div>
                <div className="sj-submessage">
                  {state.completed
                    ? t.sjSubCompleted
                    : state.status === 'temple'
                    ? t.sjSubAtTemple
                    : state.skipTurns > 0
                    ? t.sjSubSkip
                    : t.sjSubReady}
                </div>
              </div>

              <div className="sj-dicebox">
                <div className={`sj-dice ${isRolling ? 'rolling' : ''}`} aria-label={t.sjDiceAria}>
                  {DICE_FACES[displayDice] || '⚄'}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="sj-action-row">
              <button
                type="button"
                className="btn gold sj-btn sj-roll-btn"
                onClick={handlePrimaryAction}
                disabled={isRolling}
              >
                {isRolling
                  ? t.sjBtnRolling
                  : state.completed
                  ? t.sjBtnFinished
                  : state.status === 'temple'
                  ? format(t.sjBtnWorship, { name: currentLocTemple?.name || t.sjLegendTemple })
                  : state.status === 'event'
                  ? t.sjBtnEvent
                  : state.skipTurns > 0
                  ? format(t.sjBtnSkip, { count: state.skipTurns })
                  : format(t.sjBtnRoll, { turn: state.turn + 1 })}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INVENTORY & LOG */}
        <div className="sj-aside-col">

          {/* INVENTORY PANEL */}
          <div className="sj-panel sj-right-inventory-panel">
            <h3 className="sj-section-title">{t.sjInventoryTitle}</h3>
            <div className="sj-inventory-grid">
              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.yantra > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('yantra')}
                disabled={state.inventory.yantra === 0}
                title={t.sjItemYantraTitle}
              >
                <span className="sj-item-icon">🧿</span>
                <span className="sj-item-title">{t.sjItemYantra}</span>
                <span className="sj-item-count">× {state.inventory.yantra}</span>
              </button>

              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.bell > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('bell')}
                disabled={state.inventory.bell === 0 || state.completed || isRolling || state.status !== 'ready' || state.skipTurns > 0}
                title={t.sjItemBellTitle}
              >
                <span className="sj-item-icon">🔔</span>
                <span className="sj-item-title">{t.sjItemBell}</span>
                <span className="sj-item-count">× {state.inventory.bell}</span>
              </button>

              <button
                type="button"
                className={`sj-item-btn secondary ${state.inventory.lotus > 0 ? 'has-item' : ''}`}
                onClick={() => handleUseInventory('lotus')}
                disabled={state.inventory.lotus === 0 || state.skipTurns <= 0}
                title={t.sjItemLotusTitle}
              >
                <span className="sj-item-icon">🪷</span>
                <span className="sj-item-title">{t.sjItemLotus}</span>
                <span className="sj-item-count">× {state.inventory.lotus}</span>
              </button>
            </div>
            <div className="sj-item-desc">{t.sjInventoryDesc}</div>
          </div>

          {/* TRAVEL LOG PANEL */}
          <div className="sj-panel sj-right-log-panel">
            <h3 className="sj-section-title">{t.sjLogTitle}</h3>
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
              {t.sjScrollTopBtn}
            </button>
          </div>
        </div>
      </div>

      <div className="sj-footer-note">{t.sjFooterNote}</div>

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
                    aria-label={t.commonClose}
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
            case 'temple': {
              const locT = getLocalizedTemple(activeModal.temple, lang);
              return renderModalShell({
                ariaLabel: t.sjModalTempleAria,
                emblem: '🏯',
                emblemStyle: undefined,
                title: t.sjModalTempleTitle,
                headerExtra: (
                  <>
                    <p className="modal-subtitle sj-modal-temple-name" style={{ fontSize: '1.25rem', color: '#ffd700', fontWeight: 800 }}>
                      {locT.name}
                    </p>
                    <div className="sj-modal-sub" style={{ color: '#e5d5be', fontSize: '0.9rem' }}>
                      {format(t.sjModalTempleLoc, { province: locT.province, region: locT.region })}
                    </div>
                  </>
                ),
                children: (
                  <>
                    <div className="modal-info-card sj-modal-blessing-box">
                      <h4 className="info-card-title">{t.sjModalBlessingBox}</h4>
                      <p className="sj-modal-wish" style={{ margin: '0.4rem 0' }}>
                        <strong>{t.sjModalMottoLabel}</strong> {locT.wish}
                      </p>
                      <p className="sj-modal-blessing" style={{ margin: '0.4rem 0' }}>
                        <strong>{t.sjModalBlessingLabel}</strong> {locT.blessing}
                      </p>
                    </div>

                    <div className="modal-info-card" style={{ marginTop: '0.8rem' }}>
                      <label htmlFor="sj-wish-select-modal" className="sj-modal-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
                        {t.sjModalWishLabel}
                      </label>
                      <select
                        id="sj-wish-select-modal"
                        className="dropdown-compact-select sj-modal-select"
                        style={{ width: '100%', padding: '0.6rem', fontSize: '0.95rem' }}
                        value={selectedWishIdx}
                        onChange={(e) => setSelectedWishIdx(Number(e.target.value))}
                      >
                        {wishTopics.map((topic, idx) => (
                          <option key={idx} value={idx}>
                            {format(t.sjModalWishPrefix, { topic })}
                          </option>
                        ))}
                      </select>
                      <p className="sj-modal-disclaimer" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem' }}>
                        {t.sjModalWishNote}
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
                    {t.sjModalConfirmWorship}
                  </button>
                ),
              });
            }

            case 'event': {
              const locEv = getLocalizedGameEvent(activeModal.id, lang) || activeModal.event;
              return renderModalShell({
                ariaLabel: t.sjModalEventAria,
                emblem: locEv.icon,
                title: locEv.name,
                children: (
                  <div className="modal-info-card">
                    <p className="sj-modal-event-desc" style={{ fontSize: '1rem', lineHeight: 1.6 }}>{locEv.desc}</p>
                    <p className="sj-modal-disclaimer" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.6rem' }}>
                      {t.sjModalEventNote}
                    </p>
                  </div>
                ),
                footer: (
                  <button
                    type="button"
                    className="btn gold full-width"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                    onClick={() => handleAcknowledgeEvent(locEv, activeModal.id)}
                  >
                    {t.sjModalAck}
                  </button>
                ),
              });
            }

            case 'yantra_choice':
              return renderModalShell({
                ariaLabel: t.sjModalYantraAria,
                allowBackdropClose: false,
                emblem: '🧿',
                title: t.sjModalYantraTitle,
                footerStyle: { display: 'flex', gap: '10px', marginTop: '1rem' },
                children: (
                  <div className="modal-info-card">
                    <p className="sj-modal-event-desc" style={{ fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {format(t.sjModalYantraBody, { steps: Math.abs(activeModal.delta) })}
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
                      {t.sjModalUseYantra}
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ flex: 1, padding: '0.7rem' }}
                      onClick={() => handleUseYantraChoice(false, activeModal.delta)}
                    >
                      {t.sjModalAcceptMove}
                    </button>
                  </>
                ),
              });

            case 'finish':
              return renderModalShell({
                ariaLabel: t.sjModalFinishAria,
                modalClassName: 'sj-modal finish-modal',
                emblem: '🌟',
                title: t.sjModalFinishTitle,
                titleColor: '#ffd700',
                footerStyle: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' },
                headerExtra: (
                  <p style={{ fontSize: '1.05rem', margin: '0.4rem 0 0.8rem', color: '#fff' }}>
                    {t.sjModalFinishSub}
                  </p>
                ),
                children: (
                  <>
                    <div className="modal-info-card sj-finish-stats-box">
                      <div className="sj-finish-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                        <span>{t.sjModalFinishMerit}</span>
                        <strong className="sj-gold-text" style={{ color: '#ffd700', fontSize: '1.2rem' }}>
                          {format(t.sjModalFinishMeritVal, { merit: state.merit })}
                        </strong>
                      </div>
                      <div className="sj-finish-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                        <span>{t.sjModalFinishTurns}</span>
                        <strong>{format(t.sjModalFinishTurnsVal, { turns: state.turn })}</strong>
                      </div>
                      <div className="sj-finish-stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                        <span>{t.sjModalFinishWish}</span>
                        <strong style={{ color: '#f59e0b' }}>{selectedWish}</strong>
                      </div>
                    </div>

                    <p className="sj-modal-disclaimer" style={{ marginTop: '0.75rem', fontSize: '0.82rem', textAlign: 'center', color: '#cbaf8c' }}>
                      {t.sjModalFinishNote}
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
                      {t.sjModalSaveJournal}
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
                        {t.sjModalViewCard}
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
                      {t.sjModalPlayAgain}
                    </button>
                  </>
                ),
              });

            case 'help':
              return renderModalShell({
                ariaLabel: t.sjModalHelpAria,
                emblem: '📖',
                title: t.sjModalHelpTitle,
                children: (
                  <div className="modal-info-card">
                    <ol className="sj-help-list" style={{ paddingLeft: '1.2rem', lineHeight: 1.8, fontSize: '0.92rem' }}>
                      <li>{t.sjModalHelp1}</li>
                      <li>{t.sjModalHelp2}</li>
                      <li>{t.sjModalHelp3}</li>
                      <li>{t.sjModalHelp4}</li>
                      <li>{t.sjModalHelp5}</li>
                      <li>{t.sjModalHelp6}</li>
                    </ol>
                    <p className="sj-modal-disclaimer" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.6rem' }}>
                      {t.sjModalHelpNote}
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
                    {t.sjModalHelpOk}
                  </button>
                ),
              });

            case 'temple_detail': {
              const locT = getLocalizedTemple(activeModal.temple, lang);
              return renderModalShell({
                ariaLabel: format(t.sjModalDetailAria, { name: locT.name }),
                emblem: '🏯',
                title: locT.name,
                titleColor: '#ffd700',
                bodyStyle: { marginTop: '0.6rem' },
                headerExtra: (
                  <div className="sj-modal-sub" style={{ color: '#e5d5be', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {format(t.sjModalDetailSub, {
                      province: locT.province,
                      region: locT.region,
                      tileId: activeModal.temple.tileId || 1,
                    })}
                  </div>
                ),
                children: (
                  <>
                    <div style={{ textAlign: 'left', lineHeight: 1.6, fontSize: '0.95rem', padding: '0 4px' }}>
                      <p className="sj-modal-wish" style={{ margin: '0.4rem 0' }}>
                        <strong style={{ color: '#ffd700' }}>{t.sjModalMottoLabel}</strong> {locT.wish}
                      </p>
                      <p className="sj-modal-blessing" style={{ margin: '0.4rem 0', color: '#e5d5be' }}>
                        <strong style={{ color: '#ffd700' }}>{t.sjModalBlessingLabel}</strong> {locT.blessing}
                      </p>
                    </div>

                    <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 4px 0', borderTop: '1px solid rgba(213, 166, 75, 0.25)' }}>
                      <span style={{ color: '#c4ad8c' }}>{t.sjModalDetailStatusLabel}</span>
                      <strong style={{ color: state.visited.includes(activeModal.temple.id) ? '#ffd700' : '#f59e0b' }}>
                        {state.visited.includes(activeModal.temple.id) ? t.sjModalDetailDone : t.sjModalDetailPending}
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
                    {t.commonClose}
                  </button>
                ),
              });
            }

            case 'confirm_new_game':
              return renderModalShell({
                ariaLabel: t.sjModalConfirmNewAria,
                emblem: '🎲',
                emblemStyle: { fontSize: '2.4rem' },
                title: t.sjModalConfirmNewTitle,
                footerStyle: { display: 'flex', gap: '10px', marginTop: '1rem' },
                children: (
                  <div className="modal-info-card">
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{t.sjModalConfirmNewDesc}</p>
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
                      {t.commonCancel}
                    </button>
                    <button
                      type="button"
                      className="btn gold"
                      style={{ flex: 1, padding: '0.7rem' }}
                      onClick={confirmStartNewGame}
                    >
                      {t.sjModalConfirmNewBtn}
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
